import {
  LayoutDashboard,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react';
import { getEvaluationsServer } from '../../lib/api-server';
import AdminSubmissionsTable from '../../components/AdminSubmissionsTable';

export default async function AdminDashboard() {
  // ✅ Server-side data fetching - data sudah ada sebelum page render
  const submissions = await getEvaluationsServer();

  // Calculate stats from server data
  const stats = [
    {
      title: 'Total Pengajuan',
      value: submissions.length,
      icon: FileText,
      color: 'bg-blue-500',
      change: '+12%',
    },
    {
      title: 'Menunggu Review',
      value: submissions.filter(
        (s) => s.status === 'pending' || s.status === 'under_review'
      ).length,
      icon: Clock,
      color: 'bg-yellow-500',
      change: '+5%',
    },
    {
      title: 'Disetujui',
      value: submissions.filter((s) => s.status === 'accepted').length,
      icon: CheckCircle,
      color: 'bg-green-500',
      change: '+8%',
    },
    {
      title: 'Ditolak',
      value: submissions.filter((s) => s.status === 'rejected').length,
      icon: XCircle,
      color: 'bg-red-500',
      change: '-3%',
    },
  ];

  return (
    <div className="min-h-screen pt-16 bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-linear-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center">
                <LayoutDashboard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Dashboard Admin
                </h1>
                <p className="text-sm text-gray-500">
                  Kelola dan review pengajuan TKDN
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      stat.change.startsWith('+')
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {stat.change}
                  </span>
                </div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">
                  {stat.title}
                </h3>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
            );
          })}
        </div>

        {/* Table - Client Component for interactivity */}
        <AdminSubmissionsTable initialSubmissions={submissions} />
      </div>
    </div>
  );
}
