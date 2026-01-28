'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  FileText, 
  CheckCircle, 
  Clock, 
  XCircle,
  Eye,
  Search
} from 'lucide-react';
import { getEvaluations } from '../../lib/storage';

export default function AdminDashboard() {
  const [submissions, setSubmissions] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');

  // Load data after mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const loadedSubmissions = getEvaluations();
    setSubmissions(loadedSubmissions);
  }, []);

  // Status badge renderer with switch statement
  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending':
        return (
          <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold border bg-yellow-100 text-yellow-800 border-yellow-200">
            <Clock className="w-3 h-3" />
            <span>Pending</span>
          </span>
        );
      case 'under_review':
        return (
          <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold border bg-blue-100 text-blue-800 border-blue-200">
            <Clock className="w-3 h-3" />
            <span>Under Review</span>
          </span>
        );
      case 'accepted':
        return (
          <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold border bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="w-3 h-3" />
            <span>Accepted</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold border bg-red-100 text-red-800 border-red-200">
            <XCircle className="w-3 h-3" />
            <span>Rejected</span>
          </span>
        );
      case 'sanggah':
        return (
          <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold border bg-orange-100 text-orange-800 border-orange-200">
            <Clock className="w-3 h-3" />
            <span>Sanggah</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold border bg-gray-100 text-gray-800 border-gray-200">
            <Clock className="w-3 h-3" />
            <span>{status}</span>
          </span>
        );
    }
  };
  // Filter submissions based on search keyword (nama PPK atau ID)
  const filteredSubmissions = mounted ? submissions.filter(submission => {
    if (!searchKeyword.trim()) return true;
    const keyword = searchKeyword.toLowerCase();
    const ppkName = submission.ppkData?.nama_ppk?.toLowerCase() || '';
    const submissionId = submission.id?.toLowerCase() || '';
    return ppkName.includes(keyword) || submissionId.includes(keyword);
  }) : [];
  const stats = [
    {
      title: 'Total Pengajuan',
      value: mounted ? filteredSubmissions.length : 0,
      icon: FileText,
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      title: 'Menunggu Review',
      value: mounted ? filteredSubmissions.filter(s => s.status === 'pending' || s.status === 'under_review').length : 0,
      icon: Clock,
      color: 'bg-yellow-500',
      change: '+5%'
    },
    {
      title: 'Disetujui',
      value: mounted ? filteredSubmissions.filter(s => s.status === 'accepted').length : 0,
      icon: CheckCircle,
      color: 'bg-green-500',
      change: '+8%'
    },
    {
      title: 'Ditolak',
      value: mounted ? filteredSubmissions.filter(s => s.status === 'rejected').length : 0,
      icon: XCircle,
      color: 'bg-red-500',
      change: '-3%'
    },
  ];

  // Loading state
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

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
                <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
                <p className="text-sm text-gray-500">Kelola dan review pengajuan TKDN</p>
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
                  <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className={`text-sm font-semibold ${
                    stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </span>
                </div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">{stat.title}</h3>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
            );
          })}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Daftar Pengajuan</h2>
                <p className="text-sm text-gray-500 mt-1">Kelola semua pengajuan evaluasi TKDN</p>
              </div>
            </div>
            
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Cari berdasarkan nama PPK atau ID pengajuan..."
                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            {filteredSubmissions.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                {searchKeyword.trim() ? (
                  <>
                    <p className="text-gray-500 text-lg font-semibold">Tidak ada hasil ditemukan</p>
                    <p className="text-gray-400 text-sm mt-2">Coba kata kunci pencarian lain</p>
                  </>
                ) : (
                  <>
                    <p className="text-gray-500 text-lg font-semibold">Belum ada pengajuan</p>
                    <p className="text-gray-400 text-sm mt-2">Pengajuan dari user akan muncul di sini</p>
                  </>
                )}
              </div>
            ) : (
              <>
                {searchKeyword.trim() && (
                  <div className="px-6 py-2 bg-blue-50 border-b border-blue-100">
                    <p className="text-sm text-blue-700">
                      Menampilkan {filteredSubmissions.length} hasil dari {submissions.length} total pengajuan
                    </p>
                  </div>
                )}
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      PPK / Items
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Unit Kerja
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Kategori
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Compliant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Dok. Justifikasi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSubmissions.map((submission) => (
                    <tr key={submission.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">{submission.id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{submission.ppkData?.nama_ppk || 'N/A'}</div>
                        <div className="text-xs text-gray-500">Items: {submission.items?.length || 0}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{submission.ppkData?.unit_kerja || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-700">{submission.items?.[0]?.category || 'Umum'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-blue-600">
                          {submission.items?.filter(i => i.isCompliant).length || 0}/{submission.items?.length || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(submission.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {submission.justificationDocument ? (
                          submission.justificationDocument.status === 'pending_review' ? (
                            <span className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-300">
                              <Clock className="w-3 h-3" />
                              <span>Perlu Direview</span>
                            </span>
                          ) : submission.justificationDocument.status === 'approved' ? (
                            <span className="inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
                              <CheckCircle className="w-3 h-3" />
                              <span>Disetujui</span>
                            </span>
                          ) : submission.justificationDocument.status === 'rejected' ? (
                            <span className="inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
                              <XCircle className="w-3 h-3" />
                              <span>Ditolak</span>
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400 italic">Tidak ada</span>
                          )
                        ) : submission.status === 'accepted' && submission.presentationDate ? (
                          <span className="inline-flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">
                            <Clock className="w-3 h-3" />
                            <span>Menunggu Upload User</span>
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Belum diperlukan</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500">
                          {new Date(submission.timestamp).toLocaleDateString('id-ID')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {submission.status === 'pending' || submission.status === 'under_review' ? (
                          <Link
                            href={`/admin/review/${submission.id}`}
                            className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-700 font-semibold text-sm"
                          >
                            <Eye className="w-4 h-4" />
                            <span>Review</span>
                          </Link>
                        ) : (
                          <Link
                            href={`/admin/review/${submission.id}`}
                            className="inline-flex items-center space-x-1 text-gray-600 hover:text-gray-700 font-semibold text-sm"
                          >
                            <Eye className="w-4 h-4" />
                            <span>Lihat Detail</span>
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </>
            )}
          </div>

          {/* Pagination */}
          {filteredSubmissions.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Menampilkan <span className="font-semibold">1-{filteredSubmissions.length}</span> dari <span className="font-semibold">{submissions.length}</span> pengajuan
              </div>
              <div className="flex space-x-2">
                <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                  Previous
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}