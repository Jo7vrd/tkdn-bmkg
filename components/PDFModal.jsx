'use client';

import { X, Download, ExternalLink } from 'lucide-react';

export default function PDFModal({ isOpen, onClose, pdfUrl, title }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-linear-to-r from-blue-600 to-indigo-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <ExternalLink className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{title}</h3>
              <p className="text-sm text-blue-100">Dokumen Peraturan</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <a
              href={pdfUrl}
              download
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title="Download PDF"
            >
              <Download className="w-5 h-5 text-white" />
            </a>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title="Close"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 overflow-hidden bg-gray-100">
          <iframe
            src={pdfUrl}
            className="w-full h-full border-0"
            title={title}
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t bg-gray-50 flex items-center justify-between text-sm">
          <span className="text-gray-600">
            Tekan{' '}
            <kbd className="px-2 py-1 bg-white border rounded text-xs">ESC</kbd>{' '}
            untuk menutup
          </span>
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 font-semibold flex items-center space-x-1"
          >
            <span>Buka di Tab Baru</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}

// Hook untuk close dengan ESC key
if (typeof window !== 'undefined') {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      // Close modal logic handled by parent component
    }
  });
}
