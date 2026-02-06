'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Calendar,
  Plus,
  Clock,
  Eye,
  CheckCircle,
  XCircle,
  FileDown,
  Upload,
} from 'lucide-react';
import { getEvaluations } from '../../lib/api';
import StatusBadge from '../../components/statusbadge';
import PDFModal from '../../components/PDFModal';

export default function DashboardPage() {
  const [submissions, setSubmissions] = useState([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadingSubmissionId, setUploadingSubmissionId] = useState(null);
  const [justificationFile, setJustificationFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [pdfPreview, setPdfPreview] = useState({
    isOpen: false,
    url: '',
    title: '',
  });

  // Handle hydration - load data after component mounts
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getEvaluations();
        console.log('📊 Dashboard loaded evaluations:', data);
        setSubmissions(data);
      } catch (error) {
        console.error('Error loading evaluations:', error);
        alert('Gagal memuat data: ' + error.message);
        setSubmissions([]);
      }
    };
    loadData();
  }, []);

  const openDetailModal = (submission) => {
    setSelectedSubmission(submission);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedSubmission(null);
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

  const handleDownloadTemplate = () => {
    const link = document.createElement('a');
    link.href = '/documents/template-justifikasi-import.doc';
    link.download = 'Template_Surat_Justifikasi_Import.doc';
    link.click();
  };

  const handlePreviewDocument = async (evaluationId, documentId, doc) => {
    try {
      const token = document.cookie
        .split('; ')
        .find((row) => row.startsWith('token='))
        ?.split('=')[1];

      if (!token) {
        alert('Sesi Anda telah berakhir. Silakan login kembali.');
        window.location.href = '/login';
        return;
      }

      // Fetch document from API
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/evaluations/${evaluationId}/documents/${documentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Gagal mengambil dokumen');
      }

      // Get file as blob
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      setPdfPreview({
        isOpen: true,
        url: url,
        title: doc.file_name || doc.name || 'Dokumen',
        fileType: doc.file_type || doc.type || 'application/pdf',
      });
    } catch (error) {
      console.error('Error previewing document:', error);
      alert('Gagal menampilkan dokumen: ' + error.message);
    }
  };

  const openUploadModal = (submissionId) => {
    setUploadingSubmissionId(submissionId);
    setShowUploadModal(true);
  };

  const closeUploadModal = () => {
    setShowUploadModal(false);
    setUploadingSubmissionId(null);
    setJustificationFile(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Ukuran file terlalu besar. Maksimal 5MB');
        return;
      }
      setJustificationFile(file);
    }
  };

  const handleUploadSubmit = () => {
    if (!justificationFile) {
      alert('Silakan pilih file terlebih dahulu');
      return;
    }

    setIsUploading(true);

    // Convert file to base64 for preview (simulating backend storage)
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Data = e.target.result;

      const evaluations = getEvaluations();
      const index = evaluations.findIndex(
        (ev) => ev.id === uploadingSubmissionId
      );

      if (index !== -1) {
        evaluations[index].justificationDocument = {
          name: justificationFile.name,
          size: justificationFile.size,
          type: justificationFile.type,
          uploadedAt: new Date().toISOString(),
          status: 'pending_review', // pending_review, approved, rejected
          data: base64Data, // Store base64 for preview
        };

        localStorage.setItem('tkdn_evaluations', JSON.stringify(evaluations));

        alert('Dokumen justifikasi berhasil diupload!');
        setIsUploading(false);
        closeUploadModal();
        // Refresh submissions without full page reload
        setSubmissions(getEvaluations());
      }
    };

    reader.onerror = () => {
      alert('Gagal membaca file');
      setIsUploading(false);
    };

    reader.readAsDataURL(justificationFile);
  };

  const getStatusSummary = () => {
    return {
      total: submissions.length,
      pending: submissions.filter((s) => s.status === 'pending').length,
      review: submissions.filter((s) => s.status === 'under_review').length,
      accepted: submissions.filter((s) => s.status === 'accepted').length,
      rejected: submissions.filter((s) => s.status === 'rejected').length,
    };
  };

  // Show loading state
  const summary = getStatusSummary();

  return (
    <div className="min-h-screen pt-20 bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Kelola pengajuan verifikasi P3DN Anda</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {summary.total}
            </div>
            <div className="text-sm text-gray-600">Total Pengajuan</div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <div className="text-3xl font-bold text-yellow-700 mb-1">
              {summary.pending}
            </div>
            <div className="text-sm text-yellow-600">Menunggu</div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="text-3xl font-bold text-blue-700 mb-1">
              {summary.review}
            </div>
            <div className="text-sm text-blue-600">Direview</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <div className="text-3xl font-bold text-green-700 mb-1">
              {summary.accepted}
            </div>
            <div className="text-sm text-green-600">Diterima</div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="text-3xl font-bold text-red-700 mb-1">
              {summary.rejected}
            </div>
            <div className="text-sm text-red-600">Ditolak</div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mb-6">
          <Link
            href="/evaluate"
            className="inline-flex items-center space-x-2 bg-linear-to-r from-blue-600 to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-xl hover:from-blue-700 hover:to-indigo-800 transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>Buat Pengajuan Baru</span>
          </Link>
        </div>

        {/* Submissions List */}
        {submissions.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Belum Ada Pengajuan
            </h3>
            <p className="text-gray-600 mb-6">
              Mulai buat pengajuan verifikasi P3DN pertama Anda
            </p>
            <Link
              href="/evaluate"
              className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all"
            >
              <Plus className="w-5 h-5" />
              <span>Buat Pengajuan</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map((submission) => {
              return (
                <div
                  key={submission.id}
                  className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">
                          {submission.ppkData?.nama_ppk || 'Pengajuan TKDN'}
                        </h3>
                        <StatusBadge status={submission.status} small />
                      </div>
                      <p className="text-sm text-gray-600">
                        {submission.ppkData?.unit_kerja} •{' '}
                        {submission.items?.length || 0} item
                      </p>
                    </div>
                    <button
                      onClick={() => openDetailModal(submission)}
                      className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center space-x-1"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Lihat Detail</span>
                    </button>
                  </div>

                  {/* Rejection Reason */}
                  {submission.status === 'rejected' &&
                    submission.rejectionReason && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                        <p className="font-semibold text-red-900 text-sm mb-1">
                          Alasan Penolakan:
                        </p>
                        <p className="text-sm text-red-800">
                          {submission.rejectionReason}
                        </p>
                      </div>
                    )}

                  {/* Presentation Schedule */}
                  {submission.status === 'accepted' &&
                    submission.presentationDate && (
                      <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                        <div className="flex items-center mb-3">
                          <Calendar className="w-5 h-5 text-green-600 mr-3" />
                          <div>
                            <p className="font-semibold text-green-900 text-sm mb-1">
                              Jadwal Presentasi:
                            </p>
                            <p className="text-sm text-green-800">
                              {formatDate(submission.presentationDate)}
                            </p>
                          </div>
                        </div>

                        {/* Justification Document Section */}
                        <div className="mt-4 pt-4 border-t border-green-200">
                          <p className="font-semibold text-green-900 text-sm mb-3">
                            Dokumen Justifikasi Barang Import:
                          </p>

                          {!submission.justificationDocument ? (
                            <div className="space-y-2">
                              <button
                                onClick={handleDownloadTemplate}
                                className="w-full flex items-center justify-center space-x-2 bg-linear-to-r from-yellow-500 to-amber-600 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all text-sm"
                              >
                                <FileDown className="w-4 h-4" />
                                <span>Download Template Surat</span>
                              </button>
                              <button
                                onClick={() => openUploadModal(submission.id)}
                                className="w-full flex items-center justify-center space-x-2 bg-linear-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all text-sm"
                              >
                                <Upload className="w-4 h-4" />
                                <span>Upload Dokumen Justifikasi</span>
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-green-300">
                                <div className="flex items-center space-x-2">
                                  <FileText className="w-4 h-4 text-green-600" />
                                  <div>
                                    <p className="text-sm font-semibold text-gray-900">
                                      {submission.justificationDocument.name}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                      Upload:{' '}
                                      {formatDate(
                                        submission.justificationDocument
                                          .uploadedAt
                                      )}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() =>
                                      handlePreviewDocument(
                                        submission.justificationDocument
                                      )
                                    }
                                    className="px-3 py-1 bg-blue-500 text-white rounded-lg text-xs font-semibold hover:bg-blue-600 transition-all flex items-center space-x-1"
                                  >
                                    <Eye className="w-3 h-3" />
                                    <span>Preview</span>
                                  </button>
                                  {submission.justificationDocument.status ===
                                    'pending_review' && (
                                    <span className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-semibold">
                                      Menunggu Review
                                    </span>
                                  )}
                                  {submission.justificationDocument.status ===
                                    'approved' && (
                                    <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold flex items-center">
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                      Disetujui
                                    </span>
                                  )}
                                  {submission.justificationDocument.status ===
                                    'rejected' && (
                                    <span className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full font-semibold flex items-center">
                                      <XCircle className="w-3 h-3 mr-1" />
                                      Ditolak
                                    </span>
                                  )}
                                </div>
                              </div>

                              {submission.justificationDocument.status ===
                                'rejected' && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                  <p className="text-xs font-semibold text-red-900 mb-1">
                                    Alasan Penolakan:
                                  </p>
                                  <p className="text-xs text-red-800">
                                    {submission.justificationDocument
                                      .rejectionReason ||
                                      'Tidak ada keterangan'}
                                  </p>
                                  <button
                                    onClick={() =>
                                      openUploadModal(submission.id)
                                    }
                                    className="mt-2 w-full flex items-center justify-center space-x-2 bg-blue-500 text-white px-3 py-2 rounded-lg font-semibold hover:bg-blue-600 transition-all text-xs"
                                  >
                                    <Upload className="w-3 h-3" />
                                    <span>Upload Ulang Dokumen</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                  {/* Timeline */}
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>
                        Diajukan: {formatDate(submission.timestamp || submission.submitted_at)}
                      </span>
                    </div>
                    {submission.reviewedAt && (
                      <div className="flex items-center space-x-1">
                        <Eye className="w-3 h-3" />
                        <span>
                          Direview: {formatDate(submission.reviewedAt)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Detail Modal */}
        {showDetailModal && selectedSubmission && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={closeDetailModal}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div
                className={`px-8 py-6 sticky top-0 z-10 ${
                  selectedSubmission.status === 'accepted'
                    ? 'bg-linear-to-rrom-green-500 to-emerald-600'
                    : selectedSubmission.status === 'rejected'
                      ? 'bg-linear-to-r from-red-500 to-rose-600'
                      : 'bg-linear-to-r from-blue-600 to-indigo-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">
                      Detail Pengajuan
                    </h2>
                    <p className="text-white/90">ID: {selectedSubmission.id}</p>
                  </div>
                  <button
                    onClick={closeDetailModal}
                    className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="p-8 space-y-6">
                {/* Status */}
                <div className="flex items-center justify-between">
                  <StatusBadge status={selectedSubmission.status} />
                  <span className="text-sm text-gray-600">
                    Diajukan: {formatDate(selectedSubmission.timestamp || selectedSubmission.submitted_at)}
                  </span>
                </div>

                {/* PPK Data */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-bold text-lg mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-blue-600" />
                    Data PPK
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Nama PPK:</span>
                      <p className="font-semibold">
                        {selectedSubmission.ppkData?.nama_ppk}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">NIP:</span>
                      <p className="font-semibold">
                        {selectedSubmission.ppkData?.nip}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Email:</span>
                      <p className="font-semibold">
                        {selectedSubmission.ppkData?.email}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">No. HP:</span>
                      <p className="font-semibold">
                        {selectedSubmission.ppkData?.no_hp}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Unit Kerja:</span>
                      <p className="font-semibold">
                        {selectedSubmission.ppkData?.unit_kerja}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Jabatan:</span>
                      <p className="font-semibold">
                        {selectedSubmission.ppkData?.jabatan}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Documents */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-bold text-lg mb-4">
                    Dokumen yang Diupload
                  </h3>
                  <div className="space-y-2">
                    {selectedSubmission.documents?.map((doc, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-white rounded-lg border"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-semibold capitalize">
                            {(doc.document_type || doc.type || '').replace(/_/g, ' ')}
                          </p>
                          <p className="text-xs text-gray-500">
                            {doc.file_name || doc.name}
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            handlePreviewDocument(selectedSubmission.id, doc.id, doc)
                          }
                          className="ml-3 p-2 bg-white hover:bg-blue-100 rounded-lg border border-blue-300 transition-all"
                          title="Preview Dokumen"
                        >
                          <Eye className="w-4 h-4 text-blue-600" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Items */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-bold text-lg mb-4">
                    Daftar Item yang Diajukan
                  </h3>
                  <div className="space-y-3">
                    {selectedSubmission.items?.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-white rounded-lg p-4 border-2 border-gray-200"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-bold text-gray-900">
                              {item.item_name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {item.quantity} {item.unit} • {item.brand}{' '}
                              {item.model}
                            </p>
                          </div>
                          <span className={`text-xs px-3 py-1 rounded-full flex items-center ${
                            item.isCompliant ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            TKDN: {parseFloat(item.tkdnValue || item.tkdn || 0).toFixed(2)}%
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-3 mb-3">
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <div className="text-xs text-blue-700">TKDN</div>
                            <div className="text-lg font-bold text-blue-600">
                              {parseFloat(item.tkdnValue || item.tkdn || 0).toFixed(2)}%
                            </div>
                          </div>
                          <div className="bg-purple-50 p-3 rounded-lg">
                            <div className="text-xs text-purple-700">BMP</div>
                            <div className="text-lg font-bold text-purple-600">
                              {parseFloat(item.bmpValue || item.bmp || 0).toFixed(2)}%
                            </div>
                          </div>
                          <div className="bg-indigo-50 p-3 rounded-lg">
                            <div className="text-xs text-indigo-700">Total</div>
                            <div className="text-lg font-bold text-indigo-600">
                              {parseFloat(item.totalValue || ((parseFloat(item.tkdnValue || item.tkdn || 0)) + (parseFloat(item.bmpValue || item.bmp || 0)))).toFixed(2)}%
                            </div>
                          </div>
                        </div>

                        <div className="text-xs text-gray-600">
                          <div className="flex justify-between py-1">
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
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rejection Reason */}
                {selectedSubmission.rejectionReason && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
                    <h3 className="font-bold text-lg mb-2 text-red-900">
                      Alasan Penolakan
                    </h3>
                    <p className="text-sm text-red-800">
                      {selectedSubmission.rejectionReason}
                    </p>
                  </div>
                )}

                {/* Presentation Schedule */}
                {selectedSubmission.presentationDate && (
                  <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                    <h3 className="font-bold text-lg mb-2 text-green-900 flex items-center">
                      <Calendar className="w-5 h-5 mr-2" />
                      Jadwal Presentasi
                    </h3>
                    <p className="text-lg font-semibold text-green-800">
                      {formatDate(selectedSubmission.presentationDate)}
                    </p>
                    {selectedSubmission.reviewNotes && (
                      <p className="text-sm text-green-700 mt-2">
                        Catatan: {selectedSubmission.reviewNotes}
                      </p>
                    )}
                  </div>
                )}

                {/* Timeline */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-bold text-lg mb-4">Timeline</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full" />
                      <span className="text-gray-600">Diajukan:</span>
                      <span className="font-semibold">
                        {formatDate(selectedSubmission.timestamp || selectedSubmission.submitted_at)}
                      </span>
                    </div>
                    {selectedSubmission.reviewed_at && (
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-purple-600 rounded-full" />
                        <span className="text-gray-600">Direview:</span>
                        <span className="font-semibold">
                          {formatDate(selectedSubmission.reviewed_at)}
                        </span>
                      </div>
                    )}
                    {selectedSubmission.accepted_at && (
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-600 rounded-full" />
                        <span className="text-gray-600">Diterima:</span>
                        <span className="font-semibold">
                          {formatDate(selectedSubmission.accepted_at)}
                        </span>
                      </div>
                    )}
                    {selectedSubmission.rejected_at && (
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-red-600 rounded-full" />
                        <span className="text-gray-600">Ditolak:</span>
                        <span className="font-semibold">
                          {formatDate(selectedSubmission.rejected_at)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Close Button */}
                <button
                  onClick={closeDetailModal}
                  className="w-full bg-gray-600 text-white py-3 rounded-xl font-semibold hover:bg-gray-700 transition-all"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Upload Modal */}
        {showUploadModal && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={closeUploadModal}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-linear-to-r from-yellow-500 to-amber-600 px-6 py-4 rounded-t-2xl">
                <h2 className="text-xl font-bold text-white">
                  Upload Dokumen Justifikasi
                </h2>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <p className="text-sm text-gray-700 mb-4">
                    Silakan upload dokumen surat permohonan justifikasi barang
                    import yang sudah diisi.
                  </p>

                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-500 transition-colors">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <label className="cursor-pointer">
                      <span className="text-blue-600 hover:text-blue-700 font-semibold">
                        Pilih file
                      </span>
                      <input
                        type="file"
                        onChange={handleFileChange}
                        accept=".doc,.docx,.pdf"
                        className="hidden"
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-2">
                      Format: .doc, .docx, atau .pdf (Max 5MB)
                    </p>
                  </div>

                  {justificationFile && (
                    <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-900 font-semibold">
                        {justificationFile.name}
                      </span>
                      <button
                        onClick={() => setJustificationFile(null)}
                        className="ml-auto text-red-600 hover:text-red-700 text-sm"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={closeUploadModal}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                    disabled={isUploading}
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleUploadSubmit}
                    disabled={!justificationFile || isUploading}
                    className="flex-1 bg-linear-to-r from-blue-600 to-indigo-700 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUploading ? 'Mengupload...' : 'Upload'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
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
    </div>
  );
}
