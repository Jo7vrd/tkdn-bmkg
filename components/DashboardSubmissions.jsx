'use client';

import { useState } from 'react';
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
import StatusBadge from './statusbadge';
import PDFModal from './PDFModal';
import { useToast } from '../hooks/useToast';

export default function DashboardSubmissions({ initialSubmissions }) {
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const { showToast, ToastContainer } = useToast();
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showConfirmUpload, setShowConfirmUpload] = useState(false);
  const [uploadingSubmissionId, setUploadingSubmissionId] = useState(null);
  const [justificationFile, setJustificationFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [pdfPreview, setPdfPreview] = useState({
    isOpen: false,
    url: '',
    title: '',
  });

  const refreshSubmissions = async () => {
    try {
      // Reload the page to get fresh data
      window.location.reload();
    } catch (error) {
      console.error('Error refreshing submissions:', error);
    }
  };

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

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      const url = `${apiUrl}/evaluations/${evaluationId}/documents/${documentId}`;
      console.log('📄 Fetching document:', url);

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
      
      const blobUrl = URL.createObjectURL(blob);

      setPdfPreview({
        isOpen: true,
        url: blobUrl,
        title: doc.file_name || doc.name || 'Dokumen',
        fileType: doc.file_type || doc.type || 'application/pdf',
      });
    } catch (error) {
      console.error('❌ Error previewing document:', error);
      showToast('Gagal menampilkan dokumen: ' + error.message, 'error');
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
      if (file.size > 5 * 1024 * 1024) {
        showToast('Ukuran file terlalu besar. Maksimal 5MB', 'error');
        return;
      }
      setJustificationFile(file);
      setShowConfirmUpload(true);
    }
  };

  const handleUploadSubmit = async () => {
    if (!justificationFile) {
      showToast('Silakan pilih file terlebih dahulu', 'warning');
      return;
    }

    setShowConfirmUpload(false);
    setIsUploading(true);

    try {
      // Get token from cookie
      const token = document.cookie
        .split('; ')
        .find((row) => row.startsWith('token='))
        ?.split('=')[1];

      if (!token) {
        alert('Sesi Anda telah berakhir. Silakan login kembali.');
        window.location.href = '/login';
        return;
      }

      // Convert file to base64
      const reader = new FileReader();
      reader.readAsDataURL(justificationFile);
      
      reader.onload = async () => {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
          const url = `${apiUrl}/evaluations/${uploadingSubmissionId}/justification`;
          
          console.log('📤 Uploading to:', url);
          console.log('📦 File:', justificationFile.name, justificationFile.size, 'bytes');
          
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              fileName: justificationFile.name,
              fileSize: justificationFile.size,
              fileType: justificationFile.type || 'application/pdf',
              fileData: reader.result,
            }),
          });

          console.log('📥 Response status:', response.status, response.statusText);
          console.log('📥 Response content-type:', response.headers.get('content-type'));

          // Check if response is JSON
          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('❌ Non-JSON response:', text.substring(0, 200));
            throw new Error('Server mengembalikan response yang tidak valid. Cek console untuk detail.');
          }

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || 'Gagal mengunggah dokumen');
          }

          console.log('✅ Upload success:', data);
          showToast('Dokumen justifikasi berhasil diunggah!', 'success');
          closeUploadModal();
          
          // Refresh page to show updated data
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } catch (error) {
          console.error('❌ Error uploading document:', error);
          showToast('Gagal mengunggah dokumen: ' + error.message, 'error');
          setIsUploading(false);
        }
      };

      reader.onerror = () => {
        showToast('Gagal membaca file', 'error');
        setIsUploading(false);
      };
    } catch (error) {
      console.error('❌ Error uploading document:', error);
      showToast('Gagal mengunggah dokumen: ' + error.message, 'error');
      setIsUploading(false);
    }
  };

  return (
    <>
      <ToastContainer />
      {/* Submissions List - Card Based Layout */}
      {submissions.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-200">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Belum Ada Pengajuan</h3>
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
            // Calculate items that meet TKDN requirement (TKDN + BMP >= 40%)
            const compliantItems = submission.items?.filter((item) => {
              const tkdn = parseFloat(item.tkdn || item.tkdnValue || 0);
              const bmp = parseFloat(item.bmp || item.bmpValue || 0);
              return (tkdn + bmp) >= 40;
            }).length || 0;
            const totalItems = submission.items?.length || 0;
            
            return (
              <div
                key={submission.id}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all border border-gray-200"
              >
                {/* Submission Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="bg-linear-to-br from-blue-600 to-indigo-700 w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold">
                      {submission.id.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">
                        {submission.ppkData?.nama_ppk}
                      </div>
                      <div className="text-sm text-gray-600">ID: {submission.id}</div>
                    </div>
                  </div>
                  <StatusBadge status={submission.status} />
                </div>

                {/* Items Summary */}
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-semibold text-gray-700">
                        {totalItems} Items
                      </span>
                    </div>
                    <div className="text-sm">
                      <span
                        className={`font-bold ${
                          compliantItems === totalItems ? 'text-green-600' : 'text-amber-600'
                        }`}
                      >
                        {compliantItems}/{totalItems}
                      </span>
                      <span className="text-gray-600 ml-1">Memenuhi Syarat</span>
                    </div>
                  </div>
                </div>

                {/* Rejection Reason */}
                {submission.status === 'rejected' && submission.rejectionReason && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                    <p className="font-semibold text-red-900 text-sm mb-1">
                      Alasan Penolakan:
                    </p>
                    <p className="text-sm text-red-800">{submission.rejectionReason}</p>
                  </div>
                )}

                {/* Presentation Schedule */}
                {submission.status === 'accepted' && submission.presentationDate && (
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
                    {!submission.justificationDocument && (
                      <div className="mt-4 pt-4 border-t border-green-200">
                        <p className="font-semibold text-green-900 text-sm mb-3">
                          Dokumen Justifikasi Barang Import:
                        </p>
                        <div className="space-y-2">
                          <button
                            onClick={handleDownloadTemplate}
                            className="w-full flex items-center justify-center space-x-2 bg-yellow-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-yellow-600 transition-all text-sm"
                          >
                            <FileDown className="w-4 h-4" />
                            <span>Download Template Surat</span>
                          </button>
                          <button
                            onClick={() => openUploadModal(submission.id)}
                            className="w-full flex items-center justify-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600 transition-all text-sm"
                          >
                            <Upload className="w-4 h-4" />
                            <span>Upload Dokumen Justifikasi</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Show uploaded justification document */}
                    {submission.justificationDocument && (
                      <div className="mt-4 pt-4 border-t border-green-200">
                        <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-green-300">
                          <div className="flex items-center space-x-2">
                            <FileText className="w-4 h-4 text-green-600" />
                            <div>
                              <p className="text-sm font-semibold text-gray-900">
                                {submission.justificationDocument.fileName || submission.justificationDocument.name || 'Dokumen Justifikasi'}
                              </p>
                              <p className="text-xs text-gray-600">
                                Upload: {formatDate(submission.justificationDocument.uploadedAt)}
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

                        {/* Show rejection reason if rejected */}
                        {submission.justificationDocument.status === 'rejected' && (
                          <div className="mt-3 bg-red-50 border-2 border-red-300 rounded-lg p-4">
                            <div className="flex items-start space-x-2 mb-3">
                              <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                              <div className="flex-1">
                                <p className="text-sm font-bold text-red-900 mb-1">
                                  Dokumen Ditolak - Perlu Revisi
                                </p>
                                <p className="text-xs font-semibold text-red-800 mb-1">
                                  Catatan dari Admin:
                                </p>
                                <p className="text-sm text-red-800 bg-white rounded px-3 py-2 border border-red-200">
                                  {submission.justificationDocument.rejectionReason || 'Tidak ada catatan'}
                                </p>
                                {submission.justificationDocument.reviewedBy && (
                                  <p className="text-xs text-red-700 mt-2">
                                    Direview oleh: {submission.justificationDocument.reviewedBy}
                                    {submission.justificationDocument.reviewedAt && (
                                      <> · {formatDate(submission.justificationDocument.reviewedAt)}</>
                                    )}
                                  </p>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => openUploadModal(submission.id)}
                              className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-all text-sm shadow-md"
                            >
                              <Upload className="w-4 h-4" />
                              <span>Upload Dokumen Revisi</span>
                            </button>
                          </div>
                        )}
                        
                        {/* Show approval info if approved */}
                        {submission.justificationDocument.status === 'approved' && submission.justificationDocument.reviewedBy && (
                          <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
                            <p className="text-xs text-green-800">
                              Disetujui oleh: <span className="font-semibold">{submission.justificationDocument.reviewedBy}</span>
                              {submission.justificationDocument.reviewedAt && (
                                <> · {formatDate(submission.justificationDocument.reviewedAt)}</>
                              )}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Actions & Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(submission.timestamp || submission.submitted_at)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => openDetailModal(submission)}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-linear-to-r from-blue-600 to-indigo-700 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Lihat Detail</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedSubmission && (
        <div className="fixed inset-0 backdrop-blur-md bg-linear-to-br from-blue-50/30 via-indigo-50/30 to-purple-50/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="bg-linear-to-r from-blue-600 to-indigo-700 px-8 py-6 sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">Detail Pengajuan</h2>
                  <p className="text-white/90">ID: {selectedSubmission.id}</p>
                </div>
                <button
                  onClick={closeDetailModal}
                  className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors text-2xl"
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
                    <p className="font-semibold">{selectedSubmission.ppkData?.nama_ppk}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">NIP:</span>
                    <p className="font-semibold">{selectedSubmission.ppkData?.nip}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <p className="font-semibold">{selectedSubmission.ppkData?.email}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">No. HP:</span>
                    <p className="font-semibold">{selectedSubmission.ppkData?.no_hp}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Unit Kerja:</span>
                    <p className="font-semibold">{selectedSubmission.ppkData?.unit_kerja}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Jabatan:</span>
                    <p className="font-semibold">{selectedSubmission.ppkData?.jabatan}</p>
                  </div>
                </div>
              </div>

              {/* Documents */}
              {selectedSubmission.documents && selectedSubmission.documents.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-bold text-lg mb-4">Dokumen yang Diupload</h3>
                  <div className="space-y-2">
                    {selectedSubmission.documents.map((doc, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-white rounded-lg border"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-semibold capitalize">
                            {(doc.document_type || doc.type || '').replace(/_/g, ' ')}
                          </p>
                          <p className="text-xs text-gray-500">{doc.file_name || doc.name}</p>
                        </div>
                        <button
                          onClick={() => handlePreviewDocument(selectedSubmission.id, doc.id, doc)}
                          className="ml-3 p-2 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-300 transition-all"
                          title="Preview Dokumen"
                        >
                          <Eye className="w-4 h-4 text-blue-600" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Items */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-bold text-lg mb-4">Daftar Item yang Diajukan</h3>
                <div className="space-y-3">
                  {selectedSubmission.items?.map((item, idx) => (
                    <div key={idx} className="bg-white rounded-lg p-4 border-2 border-gray-200">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-bold text-gray-900">{item.item_name}</h4>
                          <p className="text-sm text-gray-600">
                            {item.quantity} {item.unit} • {item.brand} {item.model}
                          </p>
                        </div>
                        <span
                          className={`text-xs px-3 py-1 rounded-full flex items-center ${
                            (parseFloat(item.tkdn || item.tkdnValue || 0) + parseFloat(item.bmp || item.bmpValue || 0)) >= 40
                              ? 'bg-green-100 text-green-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {(parseFloat(item.tkdn || item.tkdnValue || 0) + parseFloat(item.bmp || item.bmpValue || 0)) >= 40 ? '✓ Memenuhi (≥40%)' : '⚠ Tidak Memenuhi (<40%)'}
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
                            {parseFloat(
                              item.totalValue ||
                                parseFloat(item.tkdnValue || item.tkdn || 0) +
                                  parseFloat(item.bmpValue || item.bmp || 0)
                            ).toFixed(2)}
                            %
                          </div>
                        </div>
                      </div>

                      <div className="text-xs text-gray-600">
                        <div className="flex justify-between py-1">
                          <span>Harga Barang Jadi:</span>
                          <span className="font-semibold">
                            Rp{' '}
                            {(
                              parseFloat(item.final_price || item.finalPrice) || 0
                            ).toLocaleString('id-ID')}
                          </span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span>Komponen Luar Negeri:</span>
                          <span className="font-semibold text-red-600">
                            Rp{' '}
                            {(
                              parseFloat(item.foreign_price || item.foreignPrice) || 0
                            ).toLocaleString('id-ID')}
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
                  <h3 className="font-bold text-lg mb-2 text-red-900">Alasan Penolakan</h3>
                  <p className="text-sm text-red-800">{selectedSubmission.rejectionReason}</p>
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

              {/* Justification Document Status in Modal */}
              {selectedSubmission.justificationDocument && (
                <div className="bg-linear-to-r from-yellow-50 to-amber-50 border-2 border-yellow-200 rounded-xl p-6">
                  <h3 className="font-bold text-lg mb-4 text-gray-900 flex items-center">
                    <FileDown className="w-5 h-5 mr-2 text-yellow-600" />
                    Status Dokumen Justifikasi
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="bg-white rounded-lg p-4 border border-yellow-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700">Nama File:</span>
                        <span className="text-sm text-gray-900">{selectedSubmission.justificationDocument.fileName || selectedSubmission.justificationDocument.name}</span>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700">Status:</span>
                        {selectedSubmission.justificationDocument.status === 'pending' && (
                          <span className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-semibold">
                            Menunggu Review
                          </span>
                        )}
                        {selectedSubmission.justificationDocument.status === 'approved' && (
                          <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold flex items-center">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Disetujui
                          </span>
                        )}
                        {selectedSubmission.justificationDocument.status === 'rejected' && (
                          <span className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full font-semibold flex items-center">
                            <XCircle className="w-3 h-3 mr-1" />
                            Ditolak
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-700">Tanggal Upload:</span>
                        <span className="text-sm text-gray-900">{formatDate(selectedSubmission.justificationDocument.uploadedAt)}</span>
                      </div>
                    </div>

                    {/* Rejection Details */}
                    {selectedSubmission.justificationDocument.status === 'rejected' && (
                      <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
                        <p className="text-sm font-bold text-red-900 mb-2 flex items-center">
                          <XCircle className="w-4 h-4 mr-2" />
                          Catatan Revisi dari Admin:
                        </p>
                        <p className="text-sm text-red-800 bg-white rounded px-3 py-2 border border-red-200 mb-3">
                          {selectedSubmission.justificationDocument.rejectionReason || 'Tidak ada catatan'}
                        </p>
                        {selectedSubmission.justificationDocument.reviewedBy && (
                          <p className="text-xs text-red-700">
                            Direview oleh: {selectedSubmission.justificationDocument.reviewedBy}
                            {selectedSubmission.justificationDocument.reviewedAt && (
                              <> · {formatDate(selectedSubmission.justificationDocument.reviewedAt)}</>
                            )}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Approval Details */}
                    {selectedSubmission.justificationDocument.status === 'approved' && selectedSubmission.justificationDocument.reviewedBy && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-sm text-green-800">
                          <CheckCircle className="w-4 h-4 inline mr-2" />
                          Disetujui oleh: <span className="font-semibold">{selectedSubmission.justificationDocument.reviewedBy}</span>
                          {selectedSubmission.justificationDocument.reviewedAt && (
                            <> · {formatDate(selectedSubmission.justificationDocument.reviewedAt)}</>
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

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
        <div className="fixed inset-0 backdrop-blur-md bg-linear-to-br from-blue-50/30 via-indigo-50/30 to-purple-50/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl">
            {/* Modal Header */}
            <div className="bg-linear-to-r from-blue-600 to-indigo-700 px-6 py-5 rounded-t-2xl">
              <div className="flex items-center space-x-3">
                <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                  <Upload className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Upload Dokumen Justifikasi</h2>
                  <p className="text-sm text-white/80 mt-1">
                    Unggah surat justifikasi barang import
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <FileText className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                  <div className="text-sm text-blue-900">
                    <p className="font-semibold mb-1">Format yang diterima:</p>
                    <ul className="list-disc list-inside space-y-1 text-blue-800">
                      <li>PDF (.pdf)</li>
                      <li>Word (.doc, .docx)</li>
                      <li>Maksimal ukuran: 5 MB</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* File Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Pilih Dokumen <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-600
                      file:mr-4 file:py-3 file:px-4
                      file:rounded-lg file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100
                      file:cursor-pointer cursor-pointer
                      border-2 border-gray-300 rounded-lg
                      focus:border-blue-500 focus:outline-none"
                  />
                </div>
                {justificationFile && (
                  <div className="mt-3 flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="font-medium">{justificationFile.name}</span>
                    <span className="text-gray-500">
                      ({(justificationFile.size / 1024).toFixed(2)} KB)
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-2">
                <button
                  onClick={handleUploadSubmit}
                  disabled={isUploading || !justificationFile}
                  className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-linear-to-r from-blue-600 to-indigo-700 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <>
                      <Clock className="w-5 h-5 animate-spin" />
                      <span>Mengunggah...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      <span>Upload Dokumen</span>
                    </>
                  )}
                </button>
                <button
                  onClick={closeUploadModal}
                  disabled={isUploading}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all disabled:opacity-50"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PDF Preview Modal */}
      {pdfPreview.isOpen && (
        <PDFModal
          isOpen={pdfPreview.isOpen}
          onClose={() => setPdfPreview({ isOpen: false, url: '', title: '' })}
          pdfUrl={pdfPreview.url}
          title={pdfPreview.title}
        />
      )}

      {/* Confirmation Modal after file selected */}
      {showConfirmUpload && justificationFile && (
        <div className="fixed inset-0 backdrop-blur-md bg-linear-to-br from-blue-50/30 via-indigo-50/30 to-purple-50/30 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full overflow-hidden">
            {/* Header */}
            <div className="bg-linear-to-r from-emerald-600 to-teal-700 px-4 py-3">
              <div className="flex items-center space-x-2">
                <div className="bg-white/20 p-1.5 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Konfirmasi Upload</h3>
                  <p className="text-xs text-white/80">Periksa file Anda</p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-4 space-y-3">
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <FileText className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-emerald-900 mb-1">Detail Dokumen:</p>
                    <div className="space-y-0.5 text-xs text-emerald-800">
                      <p className="truncate"><span className="font-medium">Nama:</span> {justificationFile.name}</p>
                      <p><span className="font-medium">Ukuran:</span> {(justificationFile.size / 1024).toFixed(2)} KB</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={handleUploadSubmit}
                  disabled={isUploading}
                  className="flex-1 flex items-center justify-center space-x-1.5 px-4 py-2.5 bg-linear-to-r from-emerald-600 to-teal-700 text-white rounded-lg text-sm font-semibold hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <>
                      <Clock className="w-4 h-4 animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Upload</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowConfirmUpload(false);
                    setJustificationFile(null);
                  }}
                  disabled={isUploading}
                  className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-all disabled:opacity-50"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
