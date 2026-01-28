// Helper functions for localStorage with workflow support
const STORAGE_KEY = 'tkdn_evaluations';
const USER_ROLE_KEY = 'tkdn_user_role'; // user or admin

// Set current user role (for simulation)
export const setUserRole = (role) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_ROLE_KEY, role);
};

// Get current user role
export const getUserRole = () => {
  if (typeof window === 'undefined') return 'user';
  return localStorage.getItem(USER_ROLE_KEY) || 'user';
};

// Save evaluation with workflow status
export const saveEvaluation = (evaluationData) => {
  try {
    if (typeof window === 'undefined') return null;

    console.log('💾 Saving evaluation:', evaluationData);

    const existing = getEvaluations();

    // Generate sequential ID based on existing submissions
    const year = new Date().getFullYear();
    const nextNumber = existing.length + 1;
    const sequentialId = `TKDN-${year}-${String(nextNumber).padStart(3, '0')}`;

    const newEvaluation = {
      id: sequentialId,
      timestamp: new Date().toISOString(),
      status: 'pending', // pending, under_review, accepted, rejected

      // Workflow dates
      submittedAt: new Date().toISOString(),
      reviewedAt: null,
      acceptedAt: null,
      rejectedAt: null,
      presentationDate: null,

      // Review data
      reviewedBy: null,
      reviewNotes: null,
      rejectionReason: null,

      ...evaluationData,
    };

    existing.unshift(newEvaluation);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    console.log('✅ Saved successfully! Total:', existing.length);

    return newEvaluation;
  } catch (error) {
    console.error('❌ Error saving evaluation:', error);
    return null;
  }
};

// Get all evaluations
export const getEvaluations = () => {
  try {
    // Check if running in browser
    if (typeof window === 'undefined') {
      return [];
    }
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting evaluations:', error);
    return [];
  }
};

// Get evaluation by ID
export const getEvaluationById = (id) => {
  const evaluations = getEvaluations();
  return evaluations.find((e) => e.id === id);
};

// Update evaluation status (Admin action)
export const updateEvaluationStatus = (id, status, data = {}) => {
  try {
    if (typeof window === 'undefined') return false;

    const evaluations = getEvaluations();
    const index = evaluations.findIndex((e) => e.id === id);

    if (index === -1) return false;

    const now = new Date().toISOString();
    const evaluation = evaluations[index];

    evaluation.status = status;
    evaluation.reviewedAt = now;
    evaluation.reviewedBy = 'Admin'; // In real app, use actual admin name

    // Handle different statuses
    if (status === 'accepted') {
      evaluation.acceptedAt = now;
      evaluation.presentationDate = data.presentationDate || null;
      evaluation.reviewNotes = data.reviewNotes || null;
    } else if (status === 'rejected') {
      evaluation.rejectedAt = now;
      evaluation.rejectionReason = data.rejectionReason || null;
    } else if (status === 'under_review') {
      evaluation.reviewNotes = data.reviewNotes || null;
    }

    evaluations[index] = evaluation;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(evaluations));

    return evaluation;
  } catch (error) {
    console.error('Error updating status:', error);
    return false;
  }
};

// Delete evaluation
export const deleteEvaluation = (id) => {
  try {
    if (typeof window === 'undefined') return false;
    const evaluations = getEvaluations();
    const filtered = evaluations.filter((e) => e.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error deleting evaluation:', error);
    return false;
  }
};

// Clear all evaluations
export const clearAllEvaluations = () => {
  try {
    if (typeof window === 'undefined') return false;
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing evaluations:', error);
    return false;
  }
};

// Get evaluations by status
export const getEvaluationsByStatus = (status) => {
  const evaluations = getEvaluations();
  return evaluations.filter((e) => e.status === status);
};

// Get pending evaluations count (for admin badge)
export const getPendingCount = () => {
  const evaluations = getEvaluations();
  return evaluations.filter(
    (e) => e.status === 'pending' || e.status === 'under_review'
  ).length;
};

// Export to CSV (existing function - keep as is)
export const exportToCSV = () => {
  const evaluations = getEvaluations();

  if (evaluations.length === 0) {
    return null;
  }

  const headers = [
    'ID',
    'Tanggal',
    'Status',
    'Nama PPK',
    'Unit Kerja',
    'Total Items',
    'Items Compliant',
  ];

  const rows = evaluations.map((e) => [
    e.id,
    new Date(e.timestamp).toLocaleString('id-ID'),
    e.status,
    e.ppkData?.nama_ppk || '-',
    e.ppkData?.unit_kerja || '-',
    e.items?.length || 0,
    e.items?.filter((i) => i.isCompliant).length || 0,
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n');

  return csvContent;
};

export const downloadCSV = () => {
  const csvContent = exportToCSV();

  if (!csvContent) {
    alert('Tidak ada data untuk diexport');
    return;
  }

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `tkdn_submissions_${Date.now()}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
