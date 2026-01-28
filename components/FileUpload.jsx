'use client';

import { useState } from 'react';
import { Upload, X, CheckCircle, Loader2 } from 'lucide-react';

export default function FileUpload({
  label,
  description,
  required = false,
  accept = '.pdf',
  onChange,
  name,
}) {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

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

  const handleFileSelect = async (selectedFile) => {
    // Validate file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      alert('File terlalu besar! Maksimal 5MB');
      return;
    }

    // Validate file type
    const allowedTypes = ['application/pdf'];

    if (!allowedTypes.includes(selectedFile.type)) {
      alert('Hanya file PDF yang diperbolehkan');
      return;
    }

    setIsUploading(true);

    try {
      // Convert to base64
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(selectedFile);
      });

      const fileData = {
        name: selectedFile.name,
        type: selectedFile.type,
        size: selectedFile.size,
        base64: base64,
        uploadedAt: new Date().toISOString(),
      };

      setFile(fileData);

      if (onChange) {
        onChange(name, fileData);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Gagal mengupload file');
    } finally {
      setIsUploading(false);
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
          className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
            isUploading
              ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
              : isDragging
                ? 'border-blue-500 bg-blue-50 cursor-pointer'
                : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50 cursor-pointer'
          }`}
          onClick={() =>
            !isUploading && document.getElementById(`file-${name}`).click()
          }
        >
          {isUploading ? (
            <>
              <Loader2 className="w-10 h-10 text-blue-600 mx-auto mb-3 animate-spin" />
              <p className="text-sm text-gray-600 mb-1 font-semibold">
                Mengupload file...
              </p>
              <p className="text-xs text-gray-500">Mohon tunggu</p>
            </>
          ) : (
            <>
              <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600 mb-1">
                <span className="text-blue-600 font-semibold">
                  Klik untuk upload
                </span>{' '}
                atau drag & drop
              </p>
              <p className="text-xs text-gray-500">PDF (Max. 5MB)</p>
            </>
          )}
          <input
            id={`file-${name}`}
            type="file"
            accept={accept}
            onChange={handleFileInput}
            className="hidden"
            disabled={isUploading}
          />
        </div>
      ) : (
        <div className="border-2 border-green-200 bg-green-50 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {file.name}
              </p>
              <p className="text-xs text-gray-500">
                {(file.size / 1024).toFixed(2)} KB •{' '}
                {file.type.includes('pdf') ? 'PDF' : 'DOC'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={removeFile}
            className="text-red-600 hover:text-red-700 transition-colors p-1 ml-2"
            title="Hapus file"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
