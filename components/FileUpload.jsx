'use client';

import { useState } from 'react';
import { Upload, X, CheckCircle } from 'lucide-react';

export default function FileUpload({
  label,
  description,
  required = false,
  accept = '.pdf,.doc,.docx',
  onChange,
  name,
}) {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleFileSelect = (selectedFile) => {
    // Validate file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      alert('File terlalu besar! Maksimal 5MB');
      return;
    }

    setFile(selectedFile);
    if (onChange) {
      onChange(name, selectedFile);
    }
  };

  const handleFileInput = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const removeFile = () => {
    setFile(null);
    if (onChange) {
      onChange(name, null);
    }
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {description && (
        <p className="text-xs text-gray-500 mb-2">{description}</p>
      )}

      {!file ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          }`}
          onClick={() => document.getElementById(`file-${name}`).click()}
        >
          <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
          <p className="text-sm text-gray-600 mb-1">
            <span className="text-blue-600 font-semibold">
              Klik untuk upload
            </span>{' '}
            atau drag & drop
          </p>
          <p className="text-xs text-gray-500">PDF, DOC, DOCX (Max. 5MB)</p>
          <input
            id={`file-${name}`}
            type="file"
            accept={accept}
            onChange={handleFileInput}
            className="hidden"
          />
        </div>
      ) : (
        <div className="border-2 border-green-200 bg-green-50 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {file.name}
              </p>
              <p className="text-xs text-gray-500">
                {(file.size / 1024).toFixed(2)} KB
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={removeFile}
            className="text-red-600 hover:text-red-700 transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
