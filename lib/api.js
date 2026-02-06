// lib/api.js - API service untuk komunikasi dengan backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Get auth token dari localStorage
const getAuthToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

// Helper untuk API calls
const apiCall = async (endpoint, options = {}) => {
  const token = getAuthToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Check if response is JSON
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text();
    console.error('Non-JSON response:', text);
    throw new Error('Server mengembalikan response yang tidak valid. Pastikan backend berjalan di port 8000.');
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }

  return data;
};

/**
 * Save evaluation ke server
 */
export const saveEvaluation = async (evaluationData) => {
  console.log('💾 Saving evaluation to server:', evaluationData);

  const response = await apiCall('/evaluations', {
    method: 'POST',
    body: JSON.stringify(evaluationData),
  });

  console.log('✅ Saved successfully:', response.data);
  return response.data;
};

/**
 * Transform backend data to frontend format
 */
const transformEvaluation = (evaluation) => {
  // Transform items to match frontend expectations
  const items = (evaluation.items || []).map(item => {
    const tkdn = parseFloat(item.tkdn) || 0;
    const bmp = parseFloat(item.bmp) || 0;
    const finalPrice = parseFloat(item.final_price) || 0;
    const foreignPrice = parseFloat(item.foreign_price) || 0;
    const localPrice = finalPrice - foreignPrice;
    const total = tkdn + bmp;
    
    return {
      ...item,
      // Keep original fields
      item_name: item.item_name,
      final_price: finalPrice,
      foreign_price: foreignPrice,
      // Frontend naming (for backward compatibility)
      itemName: item.item_name,
      finalPrice: finalPrice,
      foreignPrice: foreignPrice,
      localPrice: localPrice,
      tkdnValue: tkdn,
      bmpValue: bmp,
      totalValue: total,
      // Additional fields
      tkdn: tkdn,
      bmp: bmp,
      isCompliant: total >= 40, // Default threshold
    };
  });
  
  // If no items data, create empty array with count for display
  const itemCount = parseInt(evaluation.item_count) || 0;
  const finalItems = items.length > 0 ? items : Array(itemCount).fill({});
  
  // Transform documents to add 'type' and 'name' for backward compatibility
  const documents = (evaluation.documents || []).map(doc => ({
    ...doc,
    type: doc.document_type || doc.type,
    name: doc.file_name || doc.name,
  }));
  
  return {
    id: evaluation.id,
    status: evaluation.status,
    timestamp: evaluation.submitted_at || evaluation.created_at,
    submitted_at: evaluation.submitted_at,
    created_at: evaluation.created_at,
    ppkData: {
      nama_ppk: evaluation.ppk_nama,
      nip: evaluation.ppk_nip,
      no_hp: evaluation.ppk_no_hp,
      email: evaluation.ppk_email,
      unit_kerja: evaluation.ppk_unit_kerja,
      jabatan: evaluation.ppk_jabatan,
    },
    items: finalItems,
    documents: documents,
    rejectionReason: evaluation.rejection_reason,
    reviewNotes: evaluation.review_notes,
    presentationDate: evaluation.presentation_date,
    // Keep original flat structure for backward compatibility
    ...evaluation,
  };
};

/**
 * Get all evaluations
 */
export const getEvaluations = async () => {
  const response = await apiCall('/evaluations');
  return response.data.map(transformEvaluation);
};

/**
 * Get evaluation by ID
 */
export const getEvaluationById = async (id) => {
  const response = await apiCall(`/evaluations/${id}`);
  return transformEvaluation(response.data);
};

/**
 * Update evaluation status (admin only)
 */
export const updateEvaluationStatus = async (id, statusData) => {
  const response = await apiCall(`/evaluations/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify(statusData),
  });
  return response.data;
};
