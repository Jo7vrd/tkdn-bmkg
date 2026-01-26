'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  History,
  CheckCircle,
  XCircle,
  Trash2,
  Download,
  Search,
  Calendar,
  User,
  FileText,
  Package,
  Mail,
  Phone,
  Building,
  Briefcase,
  Hash,
} from 'lucide-react';

export default function HistoryPage() {
  const [evaluations, setEvaluations] = useState([]);
  const [filteredEvaluations, setFilteredEvaluations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);

  const loadEvaluations = useCallback(() => {
    try {
      const data = localStorage.getItem('tkdn_evaluations');
      const parsed = data ? JSON.parse(data) : [];
      setEvaluations(parsed);
    } catch (error) {
      console.error('Error loading evaluations:', error);
      setEvaluations([]);
    }
  }, []);

  const filterEvaluations = useCallback(() => {
    let filtered = [...evaluations];

    if (searchTerm) {
      filtered = filtered.filter((e) => {
        const searchLower = searchTerm.toLowerCase();
        // Search in PPK name
        if (e.ppkData?.nama_ppk?.toLowerCase().includes(searchLower))
          return true;
        // Search in items
        if (
          e.items?.some(
            (item) =>
              item.item_name?.toLowerCase().includes(searchLower) ||
              item.brand?.toLowerCase().includes(searchLower)
          )
        )
          return true;
        return false;
      });
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter((e) => {
        const hasCompliantItem = e.items?.some((item) => item.isCompliant);
        const allCompliant = e.items?.every((item) => item.isCompliant);
        return filterStatus === 'compliant' ? allCompliant : !hasCompliantItem;
      });
    }

    setFilteredEvaluations(filtered);
  }, [evaluations, searchTerm, filterStatus]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadEvaluations();
  }, [loadEvaluations]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    filterEvaluations();
  }, [filterEvaluations]);

  const handleDelete = (id) => {
    if (confirm('Apakah Anda yakin ingin menghapus evaluasi ini?')) {
      try {
        const filtered = evaluations.filter((e) => e.id !== id);
        localStorage.setItem('tkdn_evaluations', JSON.stringify(filtered));
        loadEvaluations();
        if (selectedEvaluation?.id === id) {
          setSelectedEvaluation(null);
        }
      } catch (error) {
        console.error('Error deleting evaluation:', error);
      }
    }
  };

  const handleClearAll = () => {
    if (
      confirm(
        'Apakah Anda yakin ingin menghapus SEMUA riwayat evaluasi? Tindakan ini tidak dapat dibatalkan.'
      )
    ) {
      try {
        localStorage.removeItem('tkdn_evaluations');
        loadEvaluations();
        setSelectedEvaluation(null);
      } catch (error) {
        console.error('Error clearing evaluations:', error);
      }
    }
  };

  const handleExport = () => {
    if (evaluations.length === 0) {
      alert('Tidak ada data untuk diexport');
      return;
    }

    // Create CSV content
    const headers = [
      'ID',
      'Tanggal',
      'PPK',
      'Unit Kerja',
      'Item',
      'Jumlah',
      'Kategori',
      'TKDN (%)',
      'BMP (%)',
      'Total (%)',
      'Status',
    ];

    const rows = [];
    evaluations.forEach((e) => {
      e.items?.forEach((item) => {
        rows.push([
          e.id,
          new Date(e.timestamp).toLocaleString('id-ID'),
          e.ppkData?.nama_ppk || '-',
          e.ppkData?.unit_kerja || '-',
          item.item_name,
          `${item.quantity} ${item.unit}`,
          item.regulation?.name || '-',
          item.tkdnValue,
          item.bmpValue,
          item.totalValue,
          item.isCompliant ? 'Memenuhi' : 'Tidak Memenuhi',
        ]);
      });
    });

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `tkdn_history_${Date.now()}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getOverallStatus = (items) => {
    if (!items || items.length === 0) return { label: 'N/A', color: 'gray' };
    const allCompliant = items.every((item) => item.isCompliant);
    const someCompliant = items.some((item) => item.isCompliant);

    if (allCompliant) return { label: 'Semua Memenuhi', color: 'green' };
    if (someCompliant) return { label: 'Sebagian Memenuhi', color: 'yellow' };
    return { label: 'Tidak Memenuhi', color: 'red' };
  };

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </Link>

          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2 flex items-center">
                  <History className="w-10 h-10 mr-3" />
                  Riwayat Pengajuan P3DN
                </h1>
                <p className="text-blue-100">
                  Semua pengajuan verifikasi yang pernah disubmit
                </p>
              </div>
              <div className="text-right">
                <div className="text-5xl font-bold">{evaluations.length}</div>
                <div className="text-blue-200 text-sm">Total Pengajuan</div>
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Cari PPK, item, atau brand..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Semua Status</option>
                <option value="compliant">Semua Memenuhi</option>
                <option value="non-compliant">Ada Yang Tidak Memenuhi</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleExport}
                disabled={evaluations.length === 0}
                className="flex-1 flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Export to CSV"
              >
                <Download className="w-5 h-5" />
                <span className="hidden sm:inline">Export</span>
              </button>
              <button
                onClick={handleClearAll}
                disabled={evaluations.length === 0}
                className="flex-1 flex items-center justify-center space-x-2 bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Clear All"
              >
                <Trash2 className="w-5 h-5" />
                <span className="hidden sm:inline">Hapus</span>
              </button>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Menampilkan {filteredEvaluations.length} dari {evaluations.length}{' '}
            pengajuan
          </div>
        </div>

        {/* Content */}
        {filteredEvaluations.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {evaluations.length === 0
                ? 'Belum Ada Riwayat Pengajuan'
                : 'Tidak Ada Hasil'}
            </h3>
            <p className="text-gray-600 mb-6">
              {evaluations.length === 0
                ? 'Mulai pengajuan verifikasi P3DN untuk melihat riwayat di sini'
                : 'Coba ubah filter atau kata kunci pencarian'}
            </p>
            {evaluations.length === 0 && (
              <Link
                href="/evaluate"
                className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <span>Buat Pengajuan Baru</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* List */}
            <div className="lg:col-span-2 space-y-4">
              {filteredEvaluations.map((evaluation) => {
                const status = getOverallStatus(evaluation.items);
                return (
                  <div
                    key={evaluation.id}
                    className={`bg-white rounded-xl shadow-lg p-6 cursor-pointer transition-all hover:shadow-xl ${
                      selectedEvaluation?.id === evaluation.id
                        ? 'ring-2 ring-blue-500'
                        : ''
                    }`}
                    onClick={() => setSelectedEvaluation(evaluation)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <h3 className="text-lg font-bold text-gray-900">
                            {evaluation.ppkData?.nama_ppk || 'N/A'}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-600 flex items-center">
                          <Building className="w-3 h-3 mr-1" />
                          {evaluation.ppkData?.unit_kerja || 'N/A'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {evaluation.items?.length || 0} item barang
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div
                          className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-semibold ${
                            status.color === 'green'
                              ? 'bg-green-100 text-green-700'
                              : status.color === 'yellow'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {status.color === 'green' ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <XCircle className="w-4 h-4" />
                          )}
                          <span>{status.label}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(evaluation.timestamp)}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(evaluation.id);
                        }}
                        className="text-red-600 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Detail Panel */}
            <div className="lg:col-span-1">
              <div
                className={`bg-white rounded-xl shadow-lg p-6 sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto transition-all duration-300 ${
                  selectedEvaluation
                    ? 'opacity-100 scale-100'
                    : 'opacity-0 scale-95'
                }`}
              >
                {selectedEvaluation ? (
                  <div className="space-y-6 animate-fade-in">
                    <h3 className="font-bold text-lg text-gray-900 border-b pb-3">
                      Detail Pengajuan
                    </h3>

                    {/* PPK Info */}
                    <div
                      className="animate-slide-in"
                      style={{ animationDelay: '0.1s' }}
                    >
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <User className="w-4 h-4 mr-2 text-blue-600" />
                        Data PPK
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start">
                          <span className="text-gray-600 w-24 shrink-0">
                            Nama:
                          </span>
                          <span className="font-semibold text-gray-900">
                            {selectedEvaluation.ppkData?.nama_ppk || '-'}
                          </span>
                        </div>
                        <div className="flex items-start">
                          <Hash className="w-3 h-3 mr-1 text-gray-400 mt-0.5" />
                          <span className="text-gray-600 w-20 shrink-0">
                            NIP:
                          </span>
                          <span className="font-semibold text-gray-900">
                            {selectedEvaluation.ppkData?.nip || '-'}
                          </span>
                        </div>
                        <div className="flex items-start">
                          <Mail className="w-3 h-3 mr-1 text-gray-400 mt-0.5" />
                          <span className="text-gray-600 w-20 shrink-0">
                            Email:
                          </span>
                          <span className="text-xs text-gray-900 break-all">
                            {selectedEvaluation.ppkData?.email || '-'}
                          </span>
                        </div>
                        <div className="flex items-start">
                          <Phone className="w-3 h-3 mr-1 text-gray-400 mt-0.5" />
                          <span className="text-gray-600 w-20 shrink-0">
                            No. HP:
                          </span>
                          <span className="text-gray-900">
                            {selectedEvaluation.ppkData?.no_hp || '-'}
                          </span>
                        </div>
                        <div className="flex items-start">
                          <Building className="w-3 h-3 mr-1 text-gray-400 mt-0.5" />
                          <span className="text-gray-600 w-20 shrink-0">
                            Unit:
                          </span>
                          <span className="text-gray-900">
                            {selectedEvaluation.ppkData?.unit_kerja || '-'}
                          </span>
                        </div>
                        <div className="flex items-start">
                          <Briefcase className="w-3 h-3 mr-1 text-gray-400 mt-0.5" />
                          <span className="text-gray-600 w-20 shrink-0">
                            Jabatan:
                          </span>
                          <span className="text-gray-900">
                            {selectedEvaluation.ppkData?.jabatan || '-'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Documents */}
                    {selectedEvaluation.documents &&
                      selectedEvaluation.documents.length > 0 && (
                        <div className="border-t pt-4">
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                            <FileText className="w-4 h-4 mr-2 text-blue-600" />
                            Dokumen ({selectedEvaluation.documents.length})
                          </h4>
                          <div className="space-y-2">
                            {selectedEvaluation.documents.map((doc, idx) => (
                              <div
                                key={idx}
                                className="flex items-center text-xs bg-gray-50 p-2 rounded"
                              >
                                <CheckCircle className="w-3 h-3 text-green-600 mr-2 shrink-0" />
                                <span className="text-gray-700 truncate">
                                  {doc.name}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* Items */}
                    <div className="border-t pt-4">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <Package className="w-4 h-4 mr-2 text-blue-600" />
                        Daftar Item ({selectedEvaluation.items?.length || 0})
                      </h4>
                      <div className="space-y-3">
                        {selectedEvaluation.items?.map((item, idx) => (
                          <div
                            key={idx}
                            className="border-2 border-gray-200 rounded-lg p-3"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <h5 className="font-semibold text-gray-900 text-sm">
                                  {item.item_name}
                                </h5>
                                <p className="text-xs text-gray-600">
                                  {item.quantity} {item.unit} •{' '}
                                  {item.brand || '-'} {item.model || ''}
                                </p>
                              </div>
                              {item.isCompliant ? (
                                <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                              )}
                            </div>
                            <div className="grid grid-cols-3 gap-2 mt-2">
                              <div className="bg-blue-50 p-2 rounded text-center">
                                <div className="text-xs text-blue-700">
                                  TKDN
                                </div>
                                <div className="text-sm font-bold text-blue-600">
                                  {item.tkdnValue}%
                                </div>
                              </div>
                              <div className="bg-purple-50 p-2 rounded text-center">
                                <div className="text-xs text-purple-700">
                                  BMP
                                </div>
                                <div className="text-sm font-bold text-purple-600">
                                  {item.bmpValue}%
                                </div>
                              </div>
                              <div className="bg-indigo-50 p-2 rounded text-center">
                                <div className="text-xs text-indigo-700">
                                  Total
                                </div>
                                <div className="text-sm font-bold text-indigo-600">
                                  {item.totalValue}%
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Date */}
                    <div className="border-t pt-4">
                      <div className="text-sm text-gray-600 mb-1">
                        Tanggal Pengajuan
                      </div>
                      <div className="font-semibold text-gray-900 text-sm">
                        {formatDate(selectedEvaluation.timestamp)}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(selectedEvaluation.id)}
                      className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Hapus Pengajuan</span>
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <History className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">
                      Pilih pengajuan untuk melihat detail
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
