import Link from 'next/link';
import {
  Plus,
} from 'lucide-react';
import { getEvaluationsServer } from '../../lib/api-server';
import DashboardSubmissions from '../../components/DashboardSubmissions';

export default async function DashboardPage() {
  // ✅ Server-side data fetching - data ready before render
  const submissions = await getEvaluationsServer();

  const getStatusSummary = () => {
    return {
      total: submissions.length,
      pending: submissions.filter((s) => s.status === 'pending').length,
      review: submissions.filter((s) => s.status === 'under_review').length,
      accepted: submissions.filter((s) => s.status === 'accepted').length,
      rejected: submissions.filter((s) => s.status === 'rejected').length,
    };
  };

  const summary = getStatusSummary();

  return (
    <div className="min-h-screen pt-20 bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Kelola pengajuan verifikasi P3DN Anda</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8 animate-fade-in">
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
        <div className="mb-6 animate-fade-in">
          <Link
            href="/evaluate"
            className="inline-flex items-center space-x-2 bg-linear-to-r from-blue-600 to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-xl hover:from-blue-700 hover:to-indigo-800 transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>Buat Pengajuan Baru</span>
          </Link>
        </div>

        {/* Submissions Table - Client Component for interactivity */}
        <DashboardSubmissions initialSubmissions={submissions} />
      </div>
    </div>
  );
}
