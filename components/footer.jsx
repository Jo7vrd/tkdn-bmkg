'use client';

import { useState } from 'react';
import { FileText, Mail, MapPin } from 'lucide-react';
import PDFModal from './PDFModal';

export default function Footer() {
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

  return (
    <>
      <footer className="bg-gray-900 text-gray-300 mt-auto">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* About */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white">TKDN Evaluator</h3>
                  <p className="text-xs text-gray-400">Sistem Evaluasi TKDN</p>
                </div>
              </div>
              <p className="text-sm text-gray-400">
                Aplikasi untuk mengevaluasi Tingkat Komponen Dalam Negeri sesuai
                dengan peraturan pemerintah Indonesia.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-white mb-4">Dasar Hukum</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <button
                    onClick={() =>
                      openPDF(
                        '/documents/pp-29-2018.pdf',
                        'PP No. 29 Tahun 2018'
                      )
                    }
                    className="hover:text-blue-400 transition-colors text-left"
                  >
                    PP No. 29 Tahun 2018
                  </button>
                </li>
                <li>
                  <button
                    onClick={() =>
                      openPDF(
                        '/documents/permenperin-35-2025.pdf',
                        'Permenperin No. 35 Tahun 2025'
                      )
                    }
                    className="hover:text-blue-400 transition-colors text-left"
                  >
                    Permenperin No. 35 Tahun 2025
                  </button>
                </li>
                <li>
                  <button
                    onClick={() =>
                      openPDF(
                        '/documents/perpres-16-2018.pdf',
                        'Perpres No. 16 Tahun 2018'
                      )
                    }
                    className="hover:text-blue-400 transition-colors text-left"
                  >
                    Perpres No. 16 Tahun 2018
                  </button>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold text-white mb-4">Kontak</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start space-x-2">
                  <Mail className="w-4 h-4 mt-1 shrink-0" />
                  <span>info@tkdnevaluator.id</span>
                </li>
                <li className="flex items-start space-x-2">
                  <MapPin className="w-4 h-4 mt-1 shrink-0" />
                  <span>Jakarta, Indonesia</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm">
            <p>&copy; 2026 TKDN Evaluator. All rights reserved.</p>
            <p className="text-gray-500 mt-1">
              Dikembangkan sesuai dengan peraturan pemerintah Indonesia
            </p>
          </div>
        </div>
      </footer>

      {/* PDF Modal */}
      <PDFModal
        isOpen={pdfModal.isOpen}
        onClose={closePDF}
        pdfUrl={pdfModal.url}
        title={pdfModal.title}
      />
    </>
  );
}
