'use client';

import { X, Download, ExternalLink, FileText } from 'lucide-react';
import { useEffect } from 'react';

export default function PDFModal({ isOpen, onClose, pdfUrl, title, fileType }) {
  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Determine if it's a Word document
  const isWordDoc =
    fileType &&
    (fileType.includes('word') ||
      fileType.includes('msword') ||
      fileType.includes('document'));
  const isPDF = fileType && fileType.includes('pdf');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-linear-to-br from-blue-50/30 via-indigo-50/30 to-purple-50/30 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-linear-to-r from-blue-600 to-indigo-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <ExternalLink className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{title}</h3>
              <p className="text-sm text-blue-100">
                {isWordDoc ? 'Dokumen Word' : isPDF ? 'Dokumen PDF' : 'Dokumen'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <a
              href={pdfUrl}
              download
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title="Download"
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

        {/* Document Viewer */}
        <div className="flex-1 overflow-hidden bg-gray-100">
          {isWordDoc ? (
            <div className="w-full h-full flex flex-col items-center justify-center p-8">
              <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Preview Dokumen Word
                </h3>
                <p className="text-gray-600 mb-6">
                  Browser tidak dapat menampilkan preview langsung untuk file
                  Word. Silakan download file untuk melihat isinya.
                </p>
                <div className="space-y-3">
                  <a
                    href={pdfUrl}
                    download={title}
                    className="inline-flex items-center space-x-2 bg-linear-to-r from-blue-600 to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                  >
                    <Download className="w-5 h-5" />
                    <span>Download Dokumen</span>
                  </a>
                  <p className="text-sm text-gray-500">File: {title}</p>
                </div>
              </div>
            </div>
          ) : (
            <iframe
              src={pdfUrl}
              className="w-full h-full border-0"
              title={title}
            />
          )}
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
            download={title}
            className="text-blue-600 hover:text-blue-700 font-semibold flex items-center space-x-1"
          >
            <span>Download File</span>
            <Download className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
