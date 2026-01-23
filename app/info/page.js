'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  FileText,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Scale,
} from 'lucide-react';
import PDFModal from '../../components/PDFModal';

export default function InfoPage() {
  const [pdfModal, setPdfModal] = useState({
    isOpen: false,
    url: '',
    title: '',
  });

  const openPDF = (url, title) => {
    setPdfModal({ isOpen: true, url, title });
  };

  const closePDF = () => {
    setPdfModal({ isOpen: false, url: '', title: '' });
  };
  const regulations = [
    {
      title: 'PP No. 29 Tahun 2018',
      description: 'Peraturan Pemerintah tentang Pemberdayaan Industri',
      icon: Scale,
      pdfUrl: '/documents/pp-29-2018.pdf',
    },
    {
      title: 'Permenperin No. 35 Tahun 2025',
      description: 'Ketentuan dan Tata Cara Sertifikasi TKDN dan BMP',
      icon: FileText,
      pdfUrl: '/documents/permenperin-35-2025.pdf',
    },
    {
      title: 'Perpres No. 16 Tahun 2018',
      description: 'Pengadaan Barang/Jasa Pemerintah',
      icon: BookOpen,
      pdfUrl: '/documents/perpres-16-2018.pdf',
    },
  ];

  const categories = [
    { name: 'Alat Kesehatan', minTKDN: 60, color: 'bg-blue-500' },
    { name: 'Alat/Mesin Pertanian', minTKDN: 43, color: 'bg-green-500' },
    { name: 'Listrik Nasional', minTKDN: 40, color: 'bg-yellow-500' },
    { name: 'Elektronik & Telematika', minTKDN: 25, color: 'bg-purple-500' },
    { name: 'Peralatan Minyak dan Gas', minTKDN: 24, color: 'bg-orange-500' },
    { name: 'Produk Farmasi', minTKDN: 25, color: 'bg-pink-500' },
    { name: 'Modul Surya', minTKDN: 25, color: 'bg-indigo-500' },
    { name: 'Produk Umum', minTKDN: 25, color: 'bg-gray-500' },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Beranda</span>
        </Link>

        {/* Header */}
        <div className="relative overflow-hidden bg-linear-to-br from-blue-600 via-indigo-700 to-purple-800 animate-gradient-slow rounded-2xl p-8 md:p-12 text-white mb-8 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Tentang TKDN</h1>
          <p className="text-xl text-blue-100 max-w-3xl">
            Tingkat Komponen Dalam Negeri (TKDN) adalah besaran kandungan lokal
            dalam barang, jasa, atau gabungan keduanya yang digunakan untuk
            mendorong penggunaan produk dalam negeri.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* What is TKDN */}
            <div className="bg-white rounded-2xl shadow-xl p-8 animate-fade-in">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <FileText className="w-6 h-6 mr-3 text-blue-600" />
                Apa itu TKDN?
              </h2>

              <div className="prose max-w-none text-gray-700 space-y-4">
                <p>
                  TKDN (Tingkat Komponen Dalam Negeri) adalah persentase
                  kandungan produksi dalam negeri yang terdapat pada suatu
                  produk. TKDN digunakan sebagai salah satu kriteria dalam
                  pengadaan barang/jasa pemerintah untuk mendorong penggunaan
                  produk dalam negeri.
                </p>

                <p>
                  Berdasarkan <strong>PP No. 29 Tahun 2018</strong>, produk
                  dengan TKDN yang memenuhi syarat akan mendapatkan prioritas
                  dalam pengadaan barang/jasa pemerintah.
                </p>
              </div>
            </div>

            {/* Formula */}
            <div className="bg-white rounded-2xl shadow-xl p-8 animate-fade-in">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Rumus Perhitungan TKDN
              </h2>

              <div className="bg-linear-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
                <div className="text-center mb-4">
                  <p className="text-2xl font-mono font-bold text-gray-800 mb-2">
                    TKDN = (HBJ - HKL) / HBJ × 100%
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-white rounded-lg p-4">
                    <p className="font-bold text-blue-600 mb-1">HBJ</p>
                    <p className="text-gray-700">Harga Barang Jadi</p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <p className="font-bold text-blue-600 mb-1">HKL</p>
                    <p className="text-gray-700">Harga Komponen Luar Negeri</p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <p className="font-bold text-blue-600 mb-1">TKDN</p>
                    <p className="text-gray-700">
                      Tingkat Komponen Dalam Negeri (%)
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 text-gray-700">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="font-semibold text-yellow-900 mb-2">
                    Catatan Penting:
                  </p>
                  <ul className="list-disc ml-5 space-y-1 text-sm text-yellow-800">
                    <li>
                      Harga Barang Jadi adalah biaya produksi, tidak termasuk
                      keuntungan dan pajak
                    </li>
                    <li>
                      Komponen Luar Negeri mencakup semua material/komponen
                      impor
                    </li>
                    <li>
                      TKDN minimum bervariasi per kategori industri (25% - 60%)
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* BMP Info */}
            <div className="bg-white rounded-2xl shadow-xl p-8 animate-fade-in">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Bobot Manfaat Perusahaan (BMP)
              </h2>

              <div className="space-y-4 text-gray-700">
                <p>
                  BMP adalah nilai tambahan yang diberikan kepada perusahaan
                  yang melakukan:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <CheckCircle className="w-5 h-5 text-green-600 mb-2" />
                    <p className="font-semibold text-green-900 mb-1">
                      Investasi di Indonesia
                    </p>
                    <p className="text-sm text-green-700">
                      Membangun fasilitas produksi dan R&D di Indonesia
                    </p>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <CheckCircle className="w-5 h-5 text-green-600 mb-2" />
                    <p className="font-semibold text-green-900 mb-1">
                      Kemitraan UMKM
                    </p>
                    <p className="text-sm text-green-700">
                      Memberdayakan UMKM lokal sebagai supplier
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                  <p className="font-semibold text-blue-900 mb-2">
                    Persyaratan:
                  </p>
                  <p className="text-sm text-blue-700">
                    BMP minimum: <strong>40%</strong> | Total (TKDN + BMP)
                    minimum: <strong>40%</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Requirements */}
            <div className="bg-white rounded-2xl shadow-xl p-8 animate-fade-in">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Persyaratan Minimum
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-linear-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-xl p-6 text-center">
                  <div className="text-5xl font-bold text-blue-600 mb-2">
                    25%
                  </div>
                  <p className="text-sm font-semibold text-blue-900">
                    TKDN Minimum
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    (bervariasi per kategori)
                  </p>
                </div>

                <div className="bg-linear-to-br from-purple-50 to-purple-100 border-2 border-purple-300 rounded-xl p-6 text-center">
                  <div className="text-5xl font-bold text-purple-600 mb-2">
                    40%
                  </div>
                  <p className="text-sm font-semibold text-purple-900">
                    BMP Minimum
                  </p>
                  <p className="text-xs text-purple-700 mt-1">
                    (untuk semua kategori)
                  </p>
                </div>
              </div>

              <div className="mt-6 bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <AlertCircle className="w-5 h-5 text-indigo-600 mb-2" />
                <p className="text-sm text-indigo-900">
                  <strong>Syarat Kepatuhan:</strong> Total TKDN + BMP harus ≥
                  40% untuk memenuhi syarat pengadaan barang/jasa pemerintah.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-8">
            {/* Regulations */}
            <div className="bg-white rounded-2xl shadow-xl p-6 animate-fade-in">
              <h3 className="font-bold text-lg text-gray-900 mb-4">
                Dasar Hukum
              </h3>

              <div className="space-y-4">
                {regulations.map((reg, idx) => {
                  const Icon = reg.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => openPDF(reg.pdfUrl, reg.title)}
                      className="w-full flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-blue-50 hover:border-blue-200 border border-transparent transition-all group cursor-pointer"
                    >
                      <div className="shrink-0 w-10 h-10 bg-blue-100 group-hover:bg-blue-200 rounded-lg flex items-center justify-center transition-colors">
                        <Icon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="text-left flex-1">
                        <p className="font-semibold text-sm text-gray-900 group-hover:text-blue-600 transition-colors">
                          {reg.title}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {reg.description}
                        </p>
                      </div>
                      <FileText className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors shrink-0 mt-1" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Categories */}
            <div className="bg-white rounded-2xl shadow-xl p-6 animate-fade-in">
              <h3 className="font-bold text-lg text-gray-900 mb-4">
                Kategori Industri
              </h3>

              <div className="space-y-3">
                {categories.map((cat, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 ${cat.color} rounded-full`} />
                      <span className="text-sm text-gray-700">{cat.name}</span>
                    </div>
                    <span className="text-sm font-bold text-blue-600">
                      ≥{cat.minTKDN}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="relative overflow-hidden bg-linear-to-br from-blue-600 via-indigo-700 to-purple-800 animate-gradient-slow rounded-2xl p-6 text-white animate-fade-in">
              <h3 className="font-bold text-lg mb-2">Siap Evaluasi?</h3>
              <p className="text-sm text-blue-100 mb-4">
                Gunakan kalkulator kami untuk mengevaluasi TKDN produk Anda
              </p>
              <Link
                href="/evaluate"
                className="block w-full bg-white text-blue-600 py-3 rounded-xl font-semibold text-center hover:shadow-xl transition-all"
              >
                Mulai Evaluasi
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* PDF Modal */}
      <PDFModal
        isOpen={pdfModal.isOpen}
        onClose={closePDF}
        pdfUrl={pdfModal.url}
        title={pdfModal.title}
      />
    </div>
  );
}
