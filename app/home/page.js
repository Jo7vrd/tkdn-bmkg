'use client';

import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle,
  Calculator,
  FileText,
  TrendingUp,
  Stethoscope,
  Tractor,
  Cpu,
  Zap,
} from 'lucide-react';

export default function Home() {
  const features = [
    {
      icon: Calculator,
      title: 'Kalkulasi Akurat',
      description:
        'Perhitungan TKDN menggunakan rumus resmi sesuai peraturan pemerintah',
    },
    {
      icon: FileText,
      title: 'Database Lengkap',
      description: 'Regulasi TKDN untuk berbagai kategori industri prioritas',
    },
    {
      icon: CheckCircle,
      title: 'Evaluasi Instan',
      description: 'Hasil evaluasi kepatuhan TKDN dalam hitungan detik',
    },
    {
      icon: TrendingUp,
      title: 'Rekomendasi',
      description: 'Saran perbaikan jika produk belum memenuhi syarat',
    },
  ];

  const categories = [
    {
      name: 'Alat Kesehatan',
      minTKDN: '60%',
      color: 'bg-blue-500',
      icon: Stethoscope,
    },
    {
      name: 'Alat Pertanian',
      minTKDN: '43%',
      color: 'bg-green-500',
      icon: Tractor,
    },
    { name: 'Elektronik', minTKDN: '25%', color: 'bg-purple-500', icon: Cpu },
    { name: 'Minyak & Gas', minTKDN: '24%', color: 'bg-orange-500', icon: Zap },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 text-white overflow-hidden animate-gradient-wave flowing-gradient-bg">
        <div className="gradient-layer-3" />
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-size-[20px_20px] z-10" />
        <div className="container mx-auto px-4 py-20 md:py-32 relative z-20">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">
                Sesuai PP No. 29 Tahun 2018
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Evaluasi TKDN Produk Anda
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-purple-200">
                Dengan Mudah & Akurat
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Sistem evaluasi Tingkat Komponen Dalam Negeri untuk memastikan
              produk Anda memenuhi persyaratan pengadaan barang/jasa pemerintah
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/evaluate"
                className="group inline-flex items-center justify-center space-x-2 bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all"
              >
                <Calculator className="w-5 h-5" />
                <span>Mulai Evaluasi</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/info"
                className="inline-flex items-center justify-center space-x-2 bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/20 hover:shadow-2xl hover:scale-105 transition-all"
              >
                <FileText className="w-5 h-5" />
                <span>Pelajari TKDN</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-125 h-125 bg-blue-400/50 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-20 right-10 w-150 h-150 bg-purple-400/50 rounded-full blur-[120px] animate-pulse-slower" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-112.5 h-112.5 bg-pink-400/45 rounded-full blur-[100px] animate-float-blob" />
        <div
          className="absolute top-10 right-20 w-100 h-100 bg-indigo-400/50 rounded-full blur-[110px] animate-pulse-slow"
          style={{ animationDelay: '2s' }}
        />
        <div
          className="absolute bottom-10 left-20 w-9580px] bg-cyan-400/45 rounded-full blur-[100px] animate-pulse-slower"
          style={{ animationDelay: '1s' }}
        />
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Fitur Unggulan
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Semua yang Anda butuhkan untuk evaluasi TKDN yang akurat dan
              terpercaya
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Kategori Industri
            </h2>
            <p className="text-xl text-gray-600">
              Nilai TKDN minimum untuk berbagai sektor prioritas
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {categories.map((category, index) => {
              const Icon = category.icon;
              return (
                <div
                  key={index}
                  className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div
                      className={`w-12 h-12 ${category.color} rounded-xl flex items-center justify-center opacity-80`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {category.name}
                  </h3>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-3xl font-bold text-blue-600">
                      {category.minTKDN}
                    </span>
                    <span className="text-sm text-gray-500">minimum</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 text-white overflow-hidden animate-gradient-wave flowing-gradient-bg">
        <div className="gradient-layer-3" />
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-size-[20px_20px] z-10" />
        <div className="container mx-auto px-4 py-20 relative z-20 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Siap Mengevaluasi Produk Anda?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Pastikan produk Anda memenuhi persyaratan TKDN untuk pengadaan
            pemerintah
          </p>
          <Link
            href="/evaluate"
            className="inline-flex items-center space-x-2 bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all"
          >
            <Calculator className="w-5 h-5" />
            <span>Evaluasi Sekarang</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
