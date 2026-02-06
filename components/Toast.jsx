'use client';

import { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ message, type = 'info', onClose, duration = 4000 }) {
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'error':
        return <XCircle className="w-6 h-6 text-red-600" />;
      case 'warning':
        return <AlertCircle className="w-6 h-6 text-yellow-600" />;
      default:
        return <Info className="w-6 h-6 text-blue-600" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 shadow-green-200';
      case 'error':
        return 'bg-gradient-to-r from-red-50 to-rose-50 border-red-300 shadow-red-200';
      case 'warning':
        return 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-300 shadow-yellow-200';
      default:
        return 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300 shadow-blue-200';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-900';
      case 'error':
        return 'text-red-900';
      case 'warning':
        return 'text-yellow-900';
      default:
        return 'text-blue-900';
    }
  };

  return (
    <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-9999 animate-slide-down">
      <div
        className={`${getStyles()} border-2 rounded-xl shadow-2xl px-6 py-4 min-w-100 max-w-150`}
      >
        <div className="flex items-center space-x-4">
          <div className="shrink-0">{getIcon()}</div>
          <p className={`flex-1 font-semibold ${getTextColor()} text-sm leading-relaxed`}>
            {message}
          </p>
          <button
            onClick={onClose}
            className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
