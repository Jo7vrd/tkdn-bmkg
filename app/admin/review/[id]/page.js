'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  FileText,
  AlertCircle,
  Calendar,
  User,
  Mail,
  Phone,
  Building,
  Briefcase,
  Eye,
  Download,
  FileDown,
  Clock,
} from 'lucide-react';
import Link from 'next/link';
import {
  getEvaluationById,
  updateEvaluationStatus,
} from '../../../../lib/api';
import PDFModal from '../../../../components/PDFModal';
import { useToast } from '../../../../hooks/useToast';

export default function ReviewSubmission({ params }) {
  const router = useRouter();
  const { showToast, ToastContainer } = useToast();
  const [submission, setSubmission] = useState(null);
  const [reviewData, setReviewData] = useState({
    status: '',
    notes: '',
    presentationDate: '',
  });
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pdfPreview, setPdfPreview] = useState({
    isOpen: false,
    url: '',
    title: '',
  });
  const [justificationReview, setJustificationReview] = useState({
    status: '',
    reason: '',
  });
  const [showJustificationModal, setShowJustificationModal] = useState(false);

  // Fetch data
  useEffect(() => {
    const loadSubmission = async () => {
      try {
        const resolvedParams = await params;
        const data = await getEvaluationById(resolvedParams.id);

        if (data) {
          setSubmission(data);

          if (data.status !== 'pending' && data.status !== 'under_review') {
            setReviewData({
              status: data.status,
              notes: data.review_notes || '',
              presentationDate: data.presentation_date || '',
            });
          }
        }
      } catch (error) {
        console.error('Error loading submission:', error);
        alert('Gagal memuat data: ' + error.message);
      }
    };

    loadSubmission();
  }, [params]);

  const isReviewed =
    submission?.status === 'accepted' || submission?.status === 'rejected';

  // Document label mapping
  const documentLabels = {
    surat_permohonan: 'Surat Permohonan (TTD Eselon II)',
    daftar_barang: 'Daftar Barang yang Akan Dibeli',
    surat_kebutuhan: 'Surat Pernyataan Kebutuhan Operasional',
    surat_tidak_terdaftar:
      'Surat Pernyataan Barang Tidak Terdaftar di Kemenperin',
    lampiran_spesifikasi: 'Lampiran Spesifikasi dan Bukti',
    dokumen_pendukung: 'Dokumen Pendukung Lainnya (Opsional)',
  };

  const handleSubmitReview = async () => {
    setIsSubmitting(true);

    try {
      const resolvedParams = await params;
      await updateEvaluationStatus(resolvedParams.id, {
        status: reviewData.status,
        reviewNotes: reviewData.notes,
        presentationDate: reviewData.presentationDate,
        rejectionReason:
          reviewData.status === 'rejected' ? reviewData.notes : null,
      });

      alert('Review berhasil disimpan!');
      router.push('/admin');
    } catch (error) {
      alert('Gagal menyimpan review: ' + error.message);
    } finally {
      setIsSubmitting(false);
      setShowConfirmation(false);
    }
  };

  const handlePreviewDocument = async (doc) => {
    try {
      const token = document.cookie
        .split('; ')
        .find((row) => row.startsWith('token='))
        ?.split('=')[1];

      if (!token) {
        alert('Sesi Anda telah berakhir. Silakan login kembali.');
        router.push('/login');
        return;
      }

      // Get evaluation ID
      const resolvedParams = await params;
      const evaluationId = resolvedParams.id;

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      const documentUrl = `${apiUrl}/evaluations/${evaluationId}/documents/${doc.id}`;
      console.log('📄 Fetching document:', documentUrl);

      // Fetch document from API
      const response = await fetch(documentUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('📥 Response status:', response.status, response.statusText);

      if (!response.ok) {
        throw new Error('Gagal mengambil dokumen');
      }

      // Get file as blob
      const blob = await response.blob();
      console.log('✅ Blob received:', blob.size, 'bytes, type:', blob.type);
      
      const blobUrl = URL.createObjectURL(blob);

      setPdfPreview({
        isOpen: true,
        url: blobUrl,
        title: doc.file_name || doc.name || 'Dokumen',
      });
    } catch (error) {
      console.error('Error previewing document:', error);
      showToast('Gagal menampilkan dokumen: ' + error.message, 'error');
    }
  };

  const handlePreviewJustification = async () => {
    try {
      if (!submission?.justificationDocument) {
        showToast('Dokumen justifikasi tidak ditemukan', 'warning');
        return;
      }

      const token = document.cookie
        .split('; ')
        .find((row) => row.startsWith('token='))
        ?.split('=')[1];

      if (!token) {
        alert('Sesi Anda telah berakhir. Silakan login kembali.');
        router.push('/login');
        return;
      }

      const resolvedParams = await params;
      const evaluationId = resolvedParams.id;

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      const url = `${apiUrl}/evaluations/${evaluationId}/documents/${submission.justificationDocument.id}`;
      console.log('📄 Fetching justification document:', url);

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('📥 Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        throw new Error(`Gagal mengambil dokumen: ${response.status} ${response.statusText}`);
      }

      const blob = await response.blob();
      console.log('✅ Blob received:', blob.size, 'bytes, type:', blob.type);
      
      const url2 = URL.createObjectURL(blob);

      setPdfPreview({
        isOpen: true,
        url: url2,
        title: submission.justificationDocument.fileName || 'Dokumen Justifikasi',
      });
    } catch (error) {
      console.error('❌ Error previewing justification document:', error);
      showToast('Gagal menampilkan dokumen: ' + error.message, 'error');
    }
  };

  const handleJustificationReviewSubmit = async () => {
    try {
      if (!justificationReview.status) {
        showToast('Silakan pilih status review (Approve atau Reject)', 'warning');
        return;
      }
      if (justificationReview.status === 'reject' && !justificationReview.reason.trim()) {
        showToast('Alasan penolakan harus diisi', 'warning');
        return;
      }

      setIsSubmitting(true);

      const token = document.cookie
        .split('; ')
        .find((row) => row.startsWith('token='))
        ?.split('=')[1];

      if (!token) {
        alert('Sesi Anda telah berakhir. Silakan login kembali.');
        router.push('/login');
        return;
      }

      const resolvedParams = await params;
      const evaluationId = resolvedParams.id;
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      const url = `${apiUrl}/evaluations/${evaluationId}/justification/review`;

      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: justificationReview.status === 'approve' ? 'approved' : 'rejected',
          reason: justificationReview.reason,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Gagal menyimpan review');
      }

      showToast(
        data.message || `Dokumen justifikasi berhasil ${justificationReview.status === 'approve' ? 'disetujui' : 'ditolak'}`,
        'success'
      );
      
      // Refresh submission data
      const updated = await getEvaluationById(evaluationId);
      setSubmission(updated);
      
      // Close modal and reset form
      setShowJustificationModal(false);
      setJustificationReview({ status: '', reason: '' });
    } catch (error) {
      console.error('❌ Error submitting justification review:', error);
      showToast('Gagal menyimpan review: ' + error.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadDocument = async (doc) => {
    try {
      const token = document.cookie
        .split('; ')
        .find((row) => row.startsWith('token='))
        ?.split('=')[1];

      if (!token) {
        showToast('Sesi Anda telah berakhir. Silakan login kembali.', 'warning');
        setTimeout(() => router.push('/login'), 2000);
        return;
      }

      const resolvedParams = await params;
      const evaluationId = resolvedParams.id;

      // Fetch and download
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/evaluations/${evaluationId}/documents/${doc.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Gagal mengunduh dokumen');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.file_name || doc.name || 'dokumen.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading document:', error);
      showToast('Gagal mengunduh dokumen: ' + error.message, 'error');
    }
  };

  const openConfirmation = () => {
    if (!reviewData.status) {
      showToast('Silakan pilih status review (Approve/Reject)', 'warning');
      return;
    }
    if (!reviewData.notes) {
      showToast('Catatan review wajib diisi', 'warning');
      return;
    }
    setShowConfirmation(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  const handleJustificationReview = async (action) => {
    if (action === 'reject' && !justificationReview.reason) {
      showToast('Alasan penolakan harus diisi', 'warning');
      return;
    }

    try {
      const resolvedParams = await params;
      const evaluations = getEvaluations();
      const index = evaluations.findIndex((e) => e.id === resolvedParams.id);

      if (index !== -1 && evaluations[index].justificationDocument) {
        evaluations[index].justificationDocument.status =
          action === 'approve' ? 'approved' : 'rejected';
        evaluations[index].justificationDocument.reviewedAt =
          new Date().toISOString();
        evaluations[index].justificationDocument.reviewedBy = 'Admin';

        if (action === 'reject') {
          evaluations[index].justificationDocument.rejectionReason =
            justificationReview.reason;
        }

        localStorage.setItem('tkdn_evaluations', JSON.stringify(evaluations));

        // Update local state immediately
        setSubmission(evaluations[index]);
        setShowJustificationModal(false);
        setJustificationReview({ status: '', reason: '' });

        showToast(
          `Dokumen justifikasi ${action === 'approve' ? 'disetujui' : 'ditolak'}!`,
          'success'
        );
      }
    } catch (error) {
      showToast('Gagal menyimpan review: ' + error.message, 'error');
    }
  };

  if (!submission) {
    return (
      <>
        <ToastContainer />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <ToastContainer />
      <div className="min-h-screen bg-gray-50 pt-16">
        {/* Confirmation Modal */}
        {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Konfirmasi Review
                </h3>
                <p className="text-sm text-gray-500">
                  Pastikan data sudah benar
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Status:</span>
                <span
                  className={`font-semibold ${
                    reviewData.status === 'accepted'
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {reviewData.status === 'accepted' ? 'Disetujui' : 'Ditolak'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">PPK:</span>
                <span className="font-semibold text-gray-900">
                  {submission.ppkData?.nama_ppk || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Items:</span>
                <span className="font-semibold text-blue-600">
                  {submission.items?.length || 0} items
                </span>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              Review ini tidak dapat diubah setelah disimpan. Apakah Anda yakin?
            </p>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowConfirmation(false)}
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleSubmitReview}
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 bg-linear-to-r from-blue-600 to-indigo-700 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Menyimpan...
                  </>
                ) : (
                  'Ya, Simpan'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <Link
            href="/admin"
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Dashboard</span>
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Review Pengajuan
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                ID: {submission.id} • Diajukan{' '}
                {submission.submitted_at ? formatDate(submission.submitted_at) : 'N/A'}
              </p>
            </div>

            {isReviewed && (
              <div className="flex items-center space-x-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-semibold text-blue-900">
                  Sudah Direview
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* PPK Data */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-600" />
                Data PPK
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <User className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Nama PPK</p>
                    <p className="font-semibold text-gray-900">
                      {submission.ppkData?.nama_ppk || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">NIP</p>
                    <p className="font-semibold text-gray-900">
                      {submission.ppkData?.nip || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="font-semibold text-gray-900">
                      {submission.ppkData?.email || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">No. HP</p>
                    <p className="font-semibold text-gray-900">
                      {submission.ppkData?.no_hp || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Building className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Unit Kerja</p>
                    <p className="font-semibold text-gray-900">
                      {submission.ppkData?.unit_kerja || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Briefcase className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Jabatan</p>
                    <p className="font-semibold text-gray-900">
                      {submission.ppkData?.jabatan || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Documents */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-blue-600" />
                Dokumen yang Diupload
              </h2>

              <div className="space-y-3">
                {submission.documents && submission.documents.length > 0 ? (
                  submission.documents.map((doc, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between py-3 px-4 bg-linear-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200 hover:border-blue-400 transition-all group"
                    >
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900">
                            {doc.type ? (documentLabels[doc.type] || doc.type.replace(/_/g, ' ')) : doc.document_type ? (documentLabels[doc.document_type] || doc.document_type.replace(/_/g, ' ')) : 'Dokumen'}
                          </p>
                          <p className="text-xs text-gray-600">{doc.name || doc.file_name || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handlePreviewDocument(doc)}
                          className="p-2 bg-white hover:bg-blue-100 rounded-lg border border-blue-300 transition-all group-hover:scale-110"
                          title="Preview Dokumen"
                        >
                          <Eye className="w-4 h-4 text-blue-600" />
                        </button>
                        <button
                          onClick={() => handleDownloadDocument(doc)}
                          className="p-2 bg-white hover:bg-green-100 rounded-lg border border-green-300 transition-all group-hover:scale-110"
                          title="Download Dokumen"
                        >
                          <Download className="w-4 h-4 text-green-600" />
                        </button>
                        <CheckCircle className="w-5 h-5 text-green-600 ml-2" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">Tidak ada dokumen</p>
                  </div>
                )}
              </div>
            </div>

            {/* Justification Document Section */}
            {submission.status === 'accepted' &&
              submission.presentationDate && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <FileDown className="w-5 h-5 mr-2 text-yellow-600" />
                    Dokumen Justifikasi Barang Import
                  </h2>

                  {submission.justificationDocument ? (
                    <div className="space-y-3">
                      <div className="bg-linear-to-r from-yellow-50 to-amber-50 border-2 border-yellow-200 rounded-xl p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-3 flex-1">
                            <div className="w-10 h-10 bg-yellow-600 rounded-lg flex items-center justify-center">
                              <FileText className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">
                                {submission.justificationDocument.fileName || 'Dokumen Justifikasi'}
                              </p>
                              <p className="text-xs text-gray-600">
                                Diupload:{' '}
                                {submission.justificationDocument.uploadedAt 
                                  ? formatDate(submission.justificationDocument.uploadedAt)
                                  : 'Baru saja'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            {submission.justificationDocument.status === 'pending' && (
                              <span className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-semibold">
                                Menunggu Review
                              </span>
                            )}
                            {submission.justificationDocument.status === 'approved' && (
                              <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold flex items-center">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Disetujui
                              </span>
                            )}
                            {submission.justificationDocument.status === 'rejected' && (
                              <span className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full font-semibold flex items-center">
                                <XCircle className="w-3 h-3 mr-1" />
                                Ditolak
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Preview Button */}
                        <div className="mt-3 pt-3 border-t border-yellow-200">
                          <button
                            onClick={handlePreviewJustification}
                            className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-all"
                          >
                            <Eye className="w-4 h-4" />
                            <span>Preview Dokumen</span>
                          </button>
                        </div>

                        {submission.justificationDocument.status === 'pending' && (
                          <div className="mt-4 pt-4 border-t border-yellow-200">
                            <p className="text-sm font-semibold text-gray-900 mb-3">
                              Review Dokumen Justifikasi:
                            </p>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  setJustificationReview({
                                    status: 'approve',
                                    reason: '',
                                  });
                                  setShowJustificationModal(true);
                                }}
                                className="flex-1 flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-all"
                              >
                                <CheckCircle className="w-4 h-4" />
                                <span>Setujui</span>
                              </button>
                              <button
                                onClick={() => {
                                  setJustificationReview({
                                    status: 'reject',
                                    reason: '',
                                  });
                                  setShowJustificationModal(true);
                                }}
                                className="flex-1 flex items-center justify-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-all"
                              >
                                <XCircle className="w-4 h-4" />
                                <span>Tolak</span>
                              </button>
                            </div>
                          </div>
                        )}

                        {submission.justificationDocument.status === 'rejected' && (
                          <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3">
                            <p className="text-xs font-semibold text-red-900 mb-1">
                              Alasan Penolakan:
                            </p>
                            <p className="text-xs text-red-800">
                              {submission.justificationDocument.rejectionReason || 'Tidak ada keterangan'}
                            </p>
                            <div className="mt-3 pt-3 border-t border-red-200">
                              <div className="flex items-center space-x-2 bg-orange-50 border border-orange-300 rounded-lg px-3 py-2">
                                <Clock className="w-4 h-4 text-orange-600 animate-pulse" />
                                <p className="text-xs font-semibold text-orange-800">
                                  Menunggu revisi dokumen dari user
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {submission.justificationDocument.status === 'approved' && submission.justificationDocument.reviewedBy && (
                          <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
                            <p className="text-xs font-semibold text-green-900 mb-1">
                              Disetujui oleh: {submission.justificationDocument.reviewedBy}
                            </p>
                            {submission.justificationDocument.reviewedAt && (
                              <p className="text-xs text-green-700">
                                Tanggal: {formatDate(submission.justificationDocument.reviewedAt)}
                              </p>
                            )}
                          </div>
                        )}

                        {submission.justificationDocument.status ===
                          'approved' && (
                          <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
                            <p className="text-xs text-green-800">
                              <CheckCircle className="w-3 h-3 inline mr-1" />
                              Dokumen telah disetujui pada{' '}
                              {formatDate(
                                submission.justificationDocument.reviewedAt
                              )}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <FileDown className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">
                        Belum ada dokumen justifikasi yang diupload
                      </p>
                    </div>
                  )}
                </div>
              )}

            {/* Items List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Daftar Items Pengajuan
              </h2>

              <div className="space-y-4">
                {submission.items && submission.items.length > 0 ? (
                  submission.items.map((item, index) => (
                    <div
                      key={index}
                      className="border-2 border-gray-200 rounded-xl p-4"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 text-lg">
                            {item.item_name}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {item.quantity} {item.unit} • {item.brand}{' '}
                            {item.model}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Kategori: {item.category}
                          </p>
                        </div>
                        <div>
                          {((parseFloat(item.tkdn || item.tkdnValue || 0) + parseFloat(item.bmp || item.bmpValue || 0)) >= 40) ? (
                            <span className="inline-flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                              <CheckCircle className="w-3 h-3" />
                              <span>Memenuhi (≥40%)</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 px-3 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
                              <XCircle className="w-3 h-3" />
                              <span>Tidak Memenuhi (&lt;40%)</span>
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3 mb-3">
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <div className="text-xs text-blue-700 mb-1">TKDN</div>
                          <div className="text-xl font-bold text-blue-600">
                            {parseFloat(item.tkdnValue || item.tkdn || 0).toFixed(2)}%
                          </div>
                        </div>
                        <div className="bg-purple-50 p-3 rounded-lg">
                          <div className="text-xs text-purple-700 mb-1">
                            BMP
                          </div>
                          <div className="text-xl font-bold text-purple-600">
                            {parseFloat(item.bmpValue || item.bmp || 0).toFixed(2)}%
                          </div>
                        </div>
                        <div className="bg-indigo-50 p-3 rounded-lg">
                          <div className="text-xs text-indigo-700 mb-1">
                            Total
                          </div>
                          <div className="text-xl font-bold text-indigo-600">
                            {parseFloat(item.totalValue || ((parseFloat(item.tkdnValue || item.tkdn || 0)) + (parseFloat(item.bmpValue || item.bmp || 0)))).toFixed(2)}%
                          </div>
                        </div>
                      </div>

                      <div className="text-xs text-gray-600 space-y-1">
                        <div className="flex justify-between py-1 border-t">
                          <span>Harga Barang Jadi:</span>
                          <span className="font-semibold">
                            Rp{' '}
                            {(parseFloat(item.final_price || item.finalPrice) || 0).toLocaleString(
                              'id-ID'
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span>Komponen Luar Negeri:</span>
                          <span className="font-semibold text-red-600">
                            Rp{' '}
                            {(parseFloat(item.foreign_price || item.foreignPrice) || 0).toLocaleString(
                              'id-ID'
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span>Komponen Dalam Negeri:</span>
                          <span className="font-semibold text-green-600">
                            Rp {(item.localPrice || ((parseFloat(item.final_price || item.finalPrice) || 0) - (parseFloat(item.foreign_price || item.foreignPrice) || 0))).toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>

                      {item.specifications && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-xs text-gray-500 mb-1">
                            Spesifikasi:
                          </p>
                          <p className="text-sm text-gray-700">
                            {item.specifications}
                          </p>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    Tidak ada items
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Review Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                {isReviewed ? 'Detail Review' : 'Form Review'}
              </h2>

              {isReviewed && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    <p className="text-sm font-semibold text-blue-900">
                      Sudah Direview
                    </p>
                  </div>
                  <p className="text-xs text-blue-800">
                    Pengajuan ini telah direview pada{' '}
                    {formatDate(submission.reviewedAt || submission.timestamp)}
                  </p>
                </div>
              )}

              <div className="space-y-4">
                {/* Status */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <div className="flex space-x-3">
                    <button
                      onClick={() =>
                        !isReviewed &&
                        setReviewData({ ...reviewData, status: 'accepted' })
                      }
                      disabled={isReviewed}
                      className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg border-2 transition-all ${
                        reviewData.status === 'accepted'
                          ? 'bg-green-50 border-green-500 text-green-700'
                          : 'border-gray-300 text-gray-700 hover:border-green-300'
                      } ${isReviewed ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-semibold">Accept</span>
                    </button>
                    <button
                      onClick={() =>
                        !isReviewed &&
                        setReviewData({ ...reviewData, status: 'rejected' })
                      }
                      disabled={isReviewed}
                      className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg border-2 transition-all ${
                        reviewData.status === 'rejected'
                          ? 'bg-red-50 border-red-500 text-red-700'
                          : 'border-gray-300 text-gray-700 hover:border-red-300'
                      } ${isReviewed ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      <XCircle className="w-5 h-5" />
                      <span className="font-semibold">Reject</span>
                    </button>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Catatan Review <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={reviewData.notes}
                    onChange={(e) =>
                      !isReviewed &&
                      setReviewData({ ...reviewData, notes: e.target.value })
                    }
                    disabled={isReviewed}
                    rows="4"
                    className={`w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none ${
                      isReviewed ? 'bg-gray-50 cursor-not-allowed' : ''
                    }`}
                    placeholder="Jelaskan alasan approve/reject..."
                  />
                </div>

                {/* Presentation Date */}
                {reviewData.status === 'accepted' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Tanggal Presentasi
                    </label>
                    <input
                      type="datetime-local"
                      value={reviewData.presentationDate}
                      onChange={(e) =>
                        !isReviewed &&
                        setReviewData({
                          ...reviewData,
                          presentationDate: e.target.value,
                        })
                      }
                      disabled={isReviewed}
                      className={`w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        isReviewed ? 'bg-gray-50 cursor-not-allowed' : ''
                      }`}
                    />
                  </div>
                )}

                {/* Submit Button */}
                {!isReviewed && (
                  <button
                    onClick={openConfirmation}
                    className="w-full bg-linear-to-r from-blue-600 to-indigo-700 text-white py-4 rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-[1.02] transition-all flex items-center justify-center space-x-2"
                  >
                    <FileText className="w-5 h-5" />
                    <span>Submit Review</span>
                  </button>
                )}

                {isReviewed && (
                  <div className="bg-gray-100 text-gray-600 py-4 rounded-xl font-semibold text-center">
                    Review telah disimpan
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PDF Preview Modal */}
      <PDFModal
        isOpen={pdfPreview.isOpen}
        onClose={() =>
          setPdfPreview({ isOpen: false, url: '', title: '', fileType: '' })
        }
        pdfUrl={pdfPreview.url}
        title={pdfPreview.title}
        fileType={pdfPreview.fileType}
      />

      {/* Justification Review Modal */}
      {showJustificationModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowJustificationModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`px-6 py-4 rounded-t-2xl ${
                justificationReview.status === 'approve'
                  ? 'bg-linear-to-r from-green-500 to-emerald-600'
                  : 'bg-linear-to-r from-red-500 to-rose-600'
              }`}
            >
              <h2 className="text-xl font-bold text-white flex items-center">
                {justificationReview.status === 'approve' ? (
                  <>
                    <CheckCircle className="w-6 h-6 mr-2" />
                    Setujui Dokumen Justifikasi
                  </>
                ) : (
                  <>
                    <XCircle className="w-6 h-6 mr-2" />
                    Tolak Dokumen Justifikasi
                  </>
                )}
              </h2>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-gray-700">
                {justificationReview.status === 'approve'
                  ? 'Apakah Anda yakin ingin menyetujui dokumen justifikasi ini?'
                  : 'Silakan berikan alasan penolakan dokumen justifikasi:'}
              </p>

              {justificationReview.status === 'reject' && (
                <textarea
                  value={justificationReview.reason}
                  onChange={(e) =>
                    setJustificationReview({
                      ...justificationReview,
                      reason: e.target.value,
                    })
                  }
                  rows="4"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none"
                  placeholder="Jelaskan alasan penolakan dokumen..."
                />
              )}

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowJustificationModal(false)}
                  disabled={isSubmitting}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Batal
                </button>
                <button
                  onClick={handleJustificationReviewSubmit}
                  disabled={isSubmitting}
                  className={`flex-1 py-3 rounded-xl font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    justificationReview.status === 'approve'
                      ? 'bg-linear-to-r from-green-600 to-emerald-700 hover:shadow-lg'
                      : 'bg-linear-to-r from-red-600 to-rose-700 hover:shadow-lg'
                  }`}
                >
                  {isSubmitting ? 'Memproses...' : (justificationReview.status === 'approve'
                    ? 'Setujui'
                    : 'Tolak')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
}
