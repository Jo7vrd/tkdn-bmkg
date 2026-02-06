// lib/api-server.js - Server-side API utilities untuk Next.js Server Components
import { cookies } from 'next/headers';

// For server-side, prefer API_BASE_URL (127.0.0.1) over NEXT_PUBLIC_API_URL (localhost)
// This avoids DNS resolution issues in some environments
const API_BASE_URL = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

/**
 * Server-side API call helper
 * Menggunakan cookies dari server untuk authentication
 */
async function apiCallServer(endpoint, options = {}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      cache: options.cache || 'no-store', // Default: always fetch fresh data
    });

    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('❌ [api-server.js] Non-JSON response from:', url);
      throw new Error('Server mengembalikan response yang tidak valid');
    }

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ [api-server.js] API Error:', data.message);
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('❌ [api-server.js] Fetch failed:', url, error.message);
    
    // If backend is not reachable, provide helpful error
    if (error.cause?.code === 'ECONNREFUSED') {
      throw new Error('Backend server tidak dapat diakses. Pastikan server berjalan di ' + API_BASE_URL);
    }
    
    throw error;
  }
}

/**
 * Transform backend data to frontend format
 */
function transformEvaluation(evaluation) {
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
      item_name: item.item_name,
      final_price: finalPrice,
      foreign_price: foreignPrice,
      itemName: item.item_name,
      finalPrice: finalPrice,
      foreignPrice: foreignPrice,
      localPrice: localPrice,
      tkdnValue: tkdn,
      bmpValue: bmp,
      totalValue: total,
      tkdn: tkdn,
      bmp: bmp,
      isCompliant: total >= 40,
    };
  });
  
  const itemCount = parseInt(evaluation.item_count) || 0;
  const finalItems = items.length > 0 ? items : Array(itemCount).fill({});
  
  // Transform documents
  const documents = (evaluation.documents || []).map(doc => ({
    ...doc,
    type: doc.document_type || doc.type,
    name: doc.file_name || doc.name,
  }));
  
  // Find justification document
  const justificationDoc = documents.find(doc => doc.document_type === 'justification' || doc.type === 'justification');
  
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
    justificationDocument: justificationDoc ? {
      id: justificationDoc.id,
      fileName: justificationDoc.file_name || justificationDoc.name,
      fileSize: justificationDoc.file_size,
      uploadedAt: justificationDoc.uploaded_at,
      status: justificationDoc.justification_status || 'pending',
      reviewedAt: justificationDoc.justification_reviewed_at,
      reviewedBy: justificationDoc.justification_reviewed_by,
      rejectionReason: justificationDoc.justification_rejection_reason,
    } : null,
    rejectionReason: evaluation.rejection_reason,
    reviewNotes: evaluation.review_notes,
    presentationDate: evaluation.presentation_date,
    ...evaluation,
  };
}

/**
 * Get all evaluations (SERVER-SIDE)
 */
export async function getEvaluationsServer() {
  try {
    const response = await apiCallServer('/evaluations');
    return response.data.map(transformEvaluation);
  } catch (error) {
    console.error('Error fetching evaluations:', error);
    return [];
  }
}

/**
 * Get evaluation by ID (SERVER-SIDE)
 */
export async function getEvaluationByIdServer(id) {
  try {
    const response = await apiCallServer(`/evaluations/${id}`);
    return transformEvaluation(response.data);
  } catch (error) {
    console.error('Error fetching evaluation:', error);
    return null;
  }
}

/**
 * Get document URL with token (for server-side rendering)
 */
export async function getDocumentUrlServer(evaluationId, documentId) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  
  if (!token) {
    return null;
  }
  
  return {
    url: `${API_BASE_URL}/evaluations/${evaluationId}/documents/${documentId}`,
    token,
  };
}
