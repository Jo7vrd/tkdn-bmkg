'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle, XCircle, FileText, AlertCircle, Calendar, User, Mail, Phone, Building, Briefcase } from 'lucide-react';
import Link from 'next/link';
import { getEvaluationById, updateEvaluationStatus } from '../../../../lib/storage';

export default function ReviewSubmission({ params }) {
  const router = useRouter();
  const [submission, setSubmission] = useState(null);
  const [reviewData, setReviewData] = useState({
    status: '',
    notes: '',
    presentationDate: ''
  });
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch data
  useEffect(() => {
    const loadSubmission = async () => {
      const resolvedParams = await params;
      const data = getEvaluationById(resolvedParams.id);
      
      if (data) {
        setSubmission(data);
        
        if (data.status !== 'pending' && data.status !== 'under_review') {
          setReviewData({
            status: data.status,
            notes: data.reviewNotes || '',
            presentationDate: data.presentationDate || ''
          });
        }
      }
    };

    loadSubmission();
  }, [params]);

  const isReviewed = submission?.status === 'accepted' || submission?.status === 'rejected';

  const handleSubmitReview = async () => {
    setIsSubmitting(true);

    try {
      const resolvedParams = await params;
      const updated = updateEvaluationStatus(
        resolvedParams.id, 
        reviewData.status, 
        {
          reviewNotes: reviewData.notes,
          presentationDate: reviewData.presentationDate,
          rejectionReason: reviewData.status === 'rejected' ? reviewData.notes : null
        }
      );

      if (updated) {
        alert('Review berhasil disimpan!');
        router.push('/admin');
      } else {
        throw new Error('Gagal menyimpan review');
      }
    } catch (error) {
      alert('Gagal menyimpan review: ' + error.message);
    } finally {
      setIsSubmitting(false);
      setShowConfirmation(false);
    }
  };

  const openConfirmation = () => {
    if (!reviewData.status) {
      alert('Silakan pilih status review (Approve/Reject)');
      return;
    }
    if (!reviewData.notes) {
      alert('Catatan review wajib diisi');
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

  if (!submission) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
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
                <h3 className="text-lg font-bold text-gray-900">Konfirmasi Review</h3>
                <p className="text-sm text-gray-500">Pastikan data sudah benar</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Status:</span>
                <span className={`font-semibold ${
                  reviewData.status === 'accepted' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {reviewData.status === 'accepted' ? 'Disetujui' : 'Ditolak'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">PPK:</span>
                <span className="font-semibold text-gray-900">{submission.ppkData?.nama_ppk || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Items:</span>
                <span className="font-semibold text-blue-600">{submission.items?.length || 0} items</span>
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
              <h1 className="text-2xl font-bold text-gray-900">Review Pengajuan</h1>
              <p className="text-sm text-gray-500 mt-1">
                ID: {submission.id} • Diajukan {formatDate(submission.submittedAt)}
              </p>
            </div>

            {isReviewed && (
              <div className="flex items-center space-x-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-semibold text-blue-900">Sudah Direview</span>
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
                    <p className="font-semibold text-gray-900">{submission.ppkData?.nama_ppk || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">NIP</p>
                    <p className="font-semibold text-gray-900">{submission.ppkData?.nip || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="font-semibold text-gray-900">{submission.ppkData?.email || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">No. HP</p>
                    <p className="font-semibold text-gray-900">{submission.ppkData?.no_hp || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Building className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Unit Kerja</p>
                    <p className="font-semibold text-gray-900">{submission.ppkData?.unit_kerja || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Briefcase className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Jabatan</p>
                    <p className="font-semibold text-gray-900">{submission.ppkData?.jabatan || 'N/A'}</p>
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
              
              <div className="space-y-2">
                {submission.documents && submission.documents.length > 0 ? (
                  submission.documents.map((doc, idx) => (
                    <div key={idx} className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 capitalize">
                            {doc.type.replace(/_/g, ' ')}
                          </p>
                          <p className="text-xs text-gray-500">{doc.name}</p>
                        </div>
                      </div>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">Tidak ada dokumen</p>
                )}
              </div>
            </div>

            {/* Items List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Daftar Items Pengajuan</h2>
              
              <div className="space-y-4">
                {submission.items && submission.items.length > 0 ? (
                  submission.items.map((item, index) => (
                    <div key={index} className="border-2 border-gray-200 rounded-xl p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 text-lg">{item.item_name}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {item.quantity} {item.unit} • {item.brand} {item.model}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Kategori: {item.category}
                          </p>
                        </div>
                        <div>
                          {item.isCompliant ? (
                            <span className="inline-flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                              <CheckCircle className="w-3 h-3" />
                              <span>Compliant</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                              <XCircle className="w-3 h-3" />
                              <span>Not Compliant</span>
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3 mb-3">
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <div className="text-xs text-blue-700 mb-1">TKDN</div>
                          <div className="text-xl font-bold text-blue-600">{item.tkdnValue}%</div>
                        </div>
                        <div className="bg-purple-50 p-3 rounded-lg">
                          <div className="text-xs text-purple-700 mb-1">BMP</div>
                          <div className="text-xl font-bold text-purple-600">{item.bmpValue}%</div>
                        </div>
                        <div className="bg-indigo-50 p-3 rounded-lg">
                          <div className="text-xs text-indigo-700 mb-1">Total</div>
                          <div className="text-xl font-bold text-indigo-600">{item.totalValue}%</div>
                        </div>
                      </div>

                      <div className="text-xs text-gray-600 space-y-1">
                        <div className="flex justify-between py-1 border-t">
                          <span>Harga Barang Jadi:</span>
                          <span className="font-semibold">Rp {parseFloat(item.final_price).toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span>Komponen Luar Negeri:</span>
                          <span className="font-semibold text-red-600">Rp {parseFloat(item.foreign_price).toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span>Komponen Dalam Negeri:</span>
                          <span className="font-semibold text-green-600">Rp {item.localPrice.toLocaleString('id-ID')}</span>
                        </div>
                      </div>

                      {item.specifications && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-xs text-gray-500 mb-1">Spesifikasi:</p>
                          <p className="text-sm text-gray-700">{item.specifications}</p>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">Tidak ada items</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Review Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-20">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                {isReviewed ? 'Detail Review' : 'Form Review'}
              </h2>

              {isReviewed && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    <p className="text-sm font-semibold text-blue-900">Sudah Direview</p>
                  </div>
                  <p className="text-xs text-blue-800">
                    Pengajuan ini telah direview pada {formatDate(submission.reviewedAt || submission.timestamp)}
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
                      onClick={() => !isReviewed && setReviewData({...reviewData, status: 'accepted'})}
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
                      onClick={() => !isReviewed && setReviewData({...reviewData, status: 'rejected'})}
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
                    onChange={(e) => !isReviewed && setReviewData({...reviewData, notes: e.target.value})}
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
                      onChange={(e) => !isReviewed && setReviewData({...reviewData, presentationDate: e.target.value})}
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
    </div>
  );
}