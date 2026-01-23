'use client';

import { useState } from 'react';
import {
  Eye,
  CheckCircle,
  XCircle,
  FileText,
  Filter,
  UserCog,
} from 'lucide-react';
import { getEvaluations, updateEvaluationStatus } from '../../lib/storage';
import StatusBadge from '../../components/statusbadge';

export default function AdminPage() {
  const [submissions, setSubmissions] = useState(() => {
    if (typeof window !== 'undefined') {
      return getEvaluations();
    }
    return [];
  });
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Review Form State
  const [reviewAction, setReviewAction] = useState(''); // accept or reject
  const [presentationDate, setPresentationDate] = useState('');
  const [presentationTime, setPresentationTime] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');

  // Compute filtered submissions directly instead of storing in state
  const filteredSubmissions =
    filterStatus === 'all'
      ? submissions
      : submissions.filter((s) => s.status === filterStatus);

  const openReviewModal = (submission) => {
    setSelectedSubmission(submission);
    setShowReviewModal(true);
    setReviewAction('');
    setPresentationDate('');
    setPresentationTime('');
    setRejectionReason('');
    setReviewNotes('');
  };

  const closeReviewModal = () => {
    setShowReviewModal(false);
    setSelectedSubmission(null);
  };

  const handleReview = () => {
    if (!reviewAction) {
      alert('Pilih tindakan: Accept atau Reject');
      return;
    }

    if (reviewAction === 'accept' && !presentationDate) {
      alert('Pilih tanggal presentasi untuk Accept');
      return;
    }

    if (reviewAction === 'reject' && !rejectionReason) {
      alert('Alasan penolakan wajib diisi');
      return;
    }

    const dateTime =
      presentationDate && presentationTime
        ? new Date(`${presentationDate}T${presentationTime}`).toISOString()
        : null;

    const updated = updateEvaluationStatus(
      selectedSubmission.id,
      reviewAction === 'accept' ? 'accepted' : 'rejected',
      {
        presentationDate: dateTime,
        rejectionReason,
        reviewNotes,
      }
    );

    if (updated) {
      alert(
        `Submission ${reviewAction === 'accept' ? 'diterima' : 'ditolak'} berhasil!`
      );
      setSubmissions(getEvaluations());
      closeReviewModal();
    }
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

  const getStatusSummary = () => {
    return {
      total: submissions.length,
      pending: submissions.filter((s) => s.status === 'pending').length,
      review: submissions.filter((s) => s.status === 'under_review').length,
      accepted: submissions.filter((s) => s.status === 'accepted').length,
      rejected: submissions.filter((s) => s.status === 'rejected').length,
      sanggah: submissions.filter((s) => s.status === 'sanggah').length,
    };
  };

  const summary = getStatusSummary();

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <UserCog className="w-10 h-10 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">Admin Panel</h1>
          </div>
          <p className="text-gray-600">
            Kelola dan review pengajuan verifikasi P3DN
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {summary.total}
            </div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
            <div className="text-3xl font-bold text-yellow-700 mb-1">
              {summary.pending}
            </div>
            <div className="text-sm text-yellow-600">Pending</div>
          </div>
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
            <div className="text-3xl font-bold text-blue-700 mb-1">
              {summary.review}
            </div>
            <div className="text-sm text-blue-600">Review</div>
          </div>
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
            <div className="text-3xl font-bold text-green-700 mb-1">
              {summary.accepted}
            </div>
            <div className="text-sm text-green-600">Accepted</div>
          </div>
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
            <div className="text-3xl font-bold text-red-700 mb-1">
              {summary.rejected}
            </div>
            <div className="text-sm text-red-600">Rejected</div>
          </div>
          <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6">
            <div className="text-3xl font-bold text-orange-700 mb-1">
              {summary.sanggah}
            </div>
            <div className="text-sm text-orange-600">Sanggah</div>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="flex items-center space-x-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Semua Status</option>
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="sanggah">Masa Sanggah</option>
            </select>
            <span className="text-sm text-gray-600">
              {filteredSubmissions.length} pengajuan
            </span>
          </div>
        </div>

        {/* Submissions List */}
        {filteredSubmissions.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Tidak Ada Pengajuan
            </h3>
            <p className="text-gray-600">
              {filterStatus === 'all'
                ? 'Belum ada pengajuan yang masuk'
                : `Tidak ada pengajuan dengan status "${filterStatus}"`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSubmissions.map((submission) => (
              <div
                key={submission.id}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">
                        {submission.ppkData?.nama_ppk || 'No Name'}
                      </h3>
                      <StatusBadge status={submission.status} small />
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>📧 {submission.ppkData?.email}</p>
                      <p>🏢 {submission.ppkData?.unit_kerja}</p>
                      <p>📦 {submission.items?.length || 0} item diajukan</p>
                    </div>
                  </div>
                  <button
                    onClick={() => openReviewModal(submission)}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Review</span>
                  </button>
                </div>

                <div className="flex items-center space-x-4 text-xs text-gray-500 pt-4 border-t">
                  <span>Diajukan: {formatDate(submission.submittedAt)}</span>
                  {submission.reviewedAt && (
                    <span>• Direview: {formatDate(submission.reviewedAt)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Review Modal */}
        {showReviewModal && selectedSubmission && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="bg-linear-to-r from-blue-600 to-indigo-700 px-8 py-6 sticky top-0 z-10">
                <h2 className="text-2xl font-bold text-white">
                  Review Pengajuan
                </h2>
                <p className="text-blue-100">ID: {selectedSubmission.id}</p>
              </div>

              <div className="p-8 space-y-6">
                {/* PPK Data */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-bold text-lg mb-4">Data PPK</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Nama:</span>{' '}
                      <span className="font-semibold">
                        {selectedSubmission.ppkData?.nama_ppk}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">NIP:</span>{' '}
                      <span className="font-semibold">
                        {selectedSubmission.ppkData?.nip}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Email:</span>{' '}
                      <span className="font-semibold">
                        {selectedSubmission.ppkData?.email}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">HP:</span>{' '}
                      <span className="font-semibold">
                        {selectedSubmission.ppkData?.no_hp}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Unit Kerja:</span>{' '}
                      <span className="font-semibold">
                        {selectedSubmission.ppkData?.unit_kerja}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Jabatan:</span>{' '}
                      <span className="font-semibold">
                        {selectedSubmission.ppkData?.jabatan}
                      </span>
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
                        className="flex items-center justify-between py-2 border-b"
                      >
                        <span className="text-sm">
                          {doc.type.replace(/_/g, ' ')}
                        </span>
                        <span className="text-xs text-green-600 flex items-center">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {doc.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Items Summary */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-bold text-lg mb-4">Ringkasan Item</h3>
                  <div className="space-y-3">
                    {selectedSubmission.items?.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-white rounded-lg"
                      >
                        <div>
                          <p className="font-semibold text-sm">
                            {item.item_name}
                          </p>
                          <p className="text-xs text-gray-600">
                            {item.quantity} {item.unit}
                          </p>
                        </div>
                        {item.isCompliant ? (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Compliant
                          </span>
                        ) : (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full flex items-center">
                            <XCircle className="w-3 h-3 mr-1" />
                            Non-Compliant
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Review Actions */}
                <div className="border-t pt-6">
                  <h3 className="font-bold text-lg mb-4">Tindakan Review</h3>

                  <div className="flex gap-4 mb-6">
                    <button
                      onClick={() => setReviewAction('accept')}
                      className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                        reviewAction === 'accept'
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      ✓ Accept
                    </button>
                    <button
                      onClick={() => setReviewAction('reject')}
                      className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                        reviewAction === 'reject'
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      ✗ Reject
                    </button>
                  </div>

                  {/* Accept Form */}
                  {reviewAction === 'accept' && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-6 space-y-4">
                      <h4 className="font-semibold text-green-900">
                        Jadwal Presentasi
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Tanggal <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="date"
                            value={presentationDate}
                            onChange={(e) =>
                              setPresentationDate(e.target.value)
                            }
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Waktu <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="time"
                            value={presentationTime}
                            onChange={(e) =>
                              setPresentationTime(e.target.value)
                            }
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Catatan (Opsional)
                        </label>
                        <textarea
                          value={reviewNotes}
                          onChange={(e) => setReviewNotes(e.target.value)}
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg"
                          rows="3"
                          placeholder="Catatan untuk user..."
                        />
                      </div>
                    </div>
                  )}

                  {/* Reject Form */}
                  {reviewAction === 'reject' && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6 space-y-4">
                      <h4 className="font-semibold text-red-900">
                        Alasan Penolakan
                      </h4>
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg"
                        rows="4"
                        placeholder="Jelaskan alasan penolakan secara detail..."
                      />
                      <p className="text-xs text-red-700">
                        ⚠️ User akan memiliki 5 hari kerja untuk mengajukan
                        sanggahan setelah penolakan.
                      </p>
                    </div>
                  )}
                </div>

                {/* Buttons */}
                <div className="flex gap-4 pt-6 border-t">
                  <button
                    onClick={closeReviewModal}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleReview}
                    disabled={!reviewAction}
                    className="flex-1 bg-linear-to-r from-blue-600 to-indigo-700 text-white py-3 rounded-xl font-semibold hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Submit Review
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
