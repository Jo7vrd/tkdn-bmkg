'use client';

import { useState, useEffect } from 'react';
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  ArrowLeft,
  FileText,
  ArrowRight,
  User,
  Plus,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { saveEvaluation } from '../../lib/storage';
import FileUpload from '../../components/FileUpload';

export default function EvaluatePage() {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // Step 1: Data PPK
  const [ppkData, setPpkData] = useState({
    nama_ppk: '',
    nip: '',
    no_hp: '',
    email: '',
    unit_kerja: '',
    jabatan: '',
  });

  // Step 2: Upload Dokumen
  const [documents, setDocuments] = useState({
    surat_permohonan: null,
    daftar_barang: null,
    surat_kebutuhan: null,
    surat_tidak_terdaftar: null,
    lampiran_spesifikasi: null,
    dokumen_pendukung: null,
  });

  // Step 3: Daftar Barang & Spesifikasi
  const [items, setItems] = useState([
    {
      id: 1,
      item_name: '',
      quantity: '',
      unit: '',
      brand: '',
      model: '',
      specifications: '',
      category: '',
      final_price: '',
      foreign_price: '',
      bmp: '',
    },
  ]);

  // State for custom dropdowns
  const [openDropdown, setOpenDropdown] = useState({ index: null, field: null });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdown.index !== null && openDropdown.field !== null) {
        const target = event.target;
        // Check if click is outside dropdown
        if (!target.closest('[data-dropdown]')) {
          setOpenDropdown({ index: null, field: null });
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdown]);

  // Step 4: Hasil Evaluasi
  const [evaluationResults, setEvaluationResults] = useState([]);
  const [isCalculating, setIsCalculating] = useState(false);

  const regulations = {
    'alat-kesehatan': {
      name: 'Alat Kesehatan',
      minTKDN: 60,
      minBMP: 40,
      minTotal: 40,
      regulation: 'Sektor Prioritas Pemerintah',
      description: 'Industri alat-alat kesehatan dengan nilai prioritas >60%',
    },
    'alat-pertanian': {
      name: 'Alat/Mesin Pertanian',
      minTKDN: 43,
      minBMP: 40,
      minTotal: 40,
      regulation: 'Sektor Prioritas Pemerintah',
      description:
        'Industri alat-alat atau mesin pertanian dengan nilai prioritas >43%',
    },
    elektronik: {
      name: 'Elektronik & Telematika',
      minTKDN: 25,
      minBMP: 40,
      minTotal: 40,
      regulation: 'Permenperin tentang Produk Elektronika dan Telematika',
      description:
        'Produk elektronik dan telematika termasuk telepon seluler, komputer genggam',
    },
    umum: {
      name: 'Produk Umum',
      minTKDN: 25,
      minBMP: 40,
      minTotal: 40,
      regulation: 'PP No. 29 Tahun 2018',
      description: 'Produk umum untuk pengadaan barang/jasa pemerintah',
    },
  };

  // Handle PPK Data Change
  const handlePpkChange = (e) => {
    const { name, value } = e.target;
    setPpkData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle Document Upload
  const handleDocumentChange = (name, file) => {
    setDocuments((prev) => ({ ...prev, [name]: file }));
  };

  // Handle Item Change
  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  // Add New Item
  const addItem = () => {
    setItems([
      ...items,
      {
        id: items.length + 1,
        item_name: '',
        quantity: '',
        unit: '',
        brand: '',
        model: '',
        specifications: '',
        category: '',
        final_price: '',
        foreign_price: '',
        bmp: '',
      },
    ]);
  };

  // Remove Item
  const removeItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  // Validate Step
  const validateStep = () => {
    if (currentStep === 1) {
      const required = ['nama_ppk', 'nip', 'email', 'unit_kerja', 'jabatan'];
      for (let field of required) {
        if (!ppkData[field]) {
          alert(`${field.replace('_', ' ')} wajib diisi!`);
          return false;
        }
      }
      if (!ppkData.email.endsWith('@bmkg.go.id')) {
        alert('Email harus menggunakan domain @bmkg.go.id');
        return false;
      }
    }

    if (currentStep === 2) {
      const required = [
        'surat_permohonan',
        'daftar_barang',
        'surat_kebutuhan',
        'surat_tidak_terdaftar',
        'lampiran_spesifikasi',
      ];
      for (let doc of required) {
        if (!documents[doc]) {
          alert(`Dokumen ${doc.replace(/_/g, ' ')} wajib diupload!`);
          return false;
        }
      }
    }

    if (currentStep === 3) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (
          !item.item_name ||
          !item.quantity ||
          !item.category ||
          !item.final_price ||
          !item.foreign_price
        ) {
          alert(`Item ${i + 1}: Semua field wajib diisi kecuali BMP!`);
          return false;
        }
      }
    }

    return true;
  };

  // Next Step
  const nextStep = () => {
    if (validateStep()) {
      if (currentStep === 3) {
        calculateAllItems();
      } else {
        setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
      }
    }
  };

  // Previous Step
  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Calculate TKDN for All Items
  const calculateAllItems = async () => {
    setIsCalculating(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const results = items.map((item) => {
      const finalPrice = parseFloat(item.final_price);
      const foreignPrice = parseFloat(item.foreign_price);
      const bmp = parseFloat(item.bmp) || 0;

      const tkdnValue = ((finalPrice - foreignPrice) / finalPrice) * 100;
      const totalValue = tkdnValue + bmp;

      const regulation = regulations[item.category];
      const meetsTKDN = tkdnValue >= regulation.minTKDN;
      const meetsTotal = totalValue >= regulation.minTotal;
      const isCompliant = meetsTKDN && meetsTotal;

      return {
        ...item,
        tkdnValue: tkdnValue.toFixed(2),
        bmpValue: bmp.toFixed(2),
        totalValue: totalValue.toFixed(2),
        regulation,
        meetsTKDN,
        meetsTotal,
        isCompliant,
        localPrice: finalPrice - foreignPrice,
      };
    });

    setEvaluationResults(results);

    // Save to history with PPK data
    saveEvaluation({
      ppkData,
      documents: Object.keys(documents)
        .filter((key) => documents[key])
        .map((key) => ({
          type: key,
          name: documents[key]?.name,
          base64: documents[key]?.base64, // Include base64 data for preview
          size: documents[key]?.size,
          uploadedAt: documents[key]?.uploadedAt,
        })),
      items: results,
      submissionDate: new Date().toISOString(),
    });

    setIsCalculating(false);
    setCurrentStep(4);
  };

  // Reset Form
  const resetForm = () => {
    setCurrentStep(1);
    setPpkData({
      nama_ppk: '',
      nip: '',
      no_hp: '',
      email: '',
      unit_kerja: '',
      jabatan: '',
    });
    setDocuments({
      surat_permohonan: null,
      daftar_barang: null,
      surat_kebutuhan: null,
      surat_tidak_terdaftar: null,
      lampiran_spesifikasi: null,
      dokumen_pendukung: null,
    });
    setItems([
      {
        id: 1,
        item_name: '',
        quantity: '',
        unit: '',
        brand: '',
        model: '',
        specifications: '',
        category: '',
        final_price: '',
        foreign_price: '',
        bmp: '',
      },
    ]);
    setEvaluationResults([]);
  };

  // Step 1: Data PPK
  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 mr-3 shrink-0" />
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-1">
              Data Pejabat Pembuat Komitmen (PPK)
            </p>
            <p>
              Isi data PPK yang bertanggung jawab atas pengadaan barang ini.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Nama PPK <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="nama_ppk"
            value={ppkData.nama_ppk}
            onChange={handlePpkChange}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Nama lengkap PPK"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            NIP <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="nip"
            value={ppkData.nip}
            onChange={handlePpkChange}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="18 digit NIP"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            No. HP <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            name="no_hp"
            value={ppkData.no_hp}
            onChange={handlePpkChange}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="08xxxxxxxxxx"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Email BMKG <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={ppkData.email}
            onChange={handlePpkChange}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="nama@bmkg.go.id"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Unit Kerja <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="unit_kerja"
            value={ppkData.unit_kerja}
            onChange={handlePpkChange}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Contoh: Stamet Kemayoran"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Jabatan <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="jabatan"
            value={ppkData.jabatan}
            onChange={handlePpkChange}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Contoh: Kepala Seksi"
          />
        </div>
      </div>
    </div>
  );

  // Step 2: Upload Dokumen
  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 shrink-0" />
          <div className="text-sm text-yellow-900">
            <p className="font-semibold mb-1">Dokumen Pendukung</p>
            <p>
              Upload semua dokumen yang diperlukan. File harus dalam format PDF (Max 5MB per file).
            </p>
          </div>
        </div>
      </div>

      <FileUpload
        name="surat_permohonan"
        label="1. Surat Permohonan (TTD Eselon II)"
        description="Surat permohonan verifikasi P3DN yang ditandatangani oleh Pejabat Eselon II"
        required={true}
        onChange={handleDocumentChange}
      />

      <FileUpload
        name="daftar_barang"
        label="2. Daftar Barang yang Akan Dibeli"
        description="Daftar lengkap barang/jasa yang akan diadakan"
        required={true}
        onChange={handleDocumentChange}
      />

      <FileUpload
        name="surat_kebutuhan"
        label="3. Surat Pernyataan Kebutuhan Operasional"
        description="Pernyataan bahwa barang diperlukan untuk kebutuhan operasional"
        required={true}
        onChange={handleDocumentChange}
      />

      <FileUpload
        name="surat_tidak_terdaftar"
        label="4. Surat Pernyataan Barang Tidak Terdaftar di Kemenperin"
        description="Pernyataan bahwa barang tidak terdaftar dalam daftar Kemenperin"
        required={true}
        onChange={handleDocumentChange}
      />

      <FileUpload
        name="lampiran_spesifikasi"
        label="5. Lampiran Spesifikasi dan Bukti"
        description="Lampiran spesifikasi teknis dan bukti pendukung untuk setiap item"
        required={true}
        onChange={handleDocumentChange}
      />

      <FileUpload
        name="dokumen_pendukung"
        label="6. Dokumen Pendukung Lainnya (Opsional)"
        description="Dokumen tambahan yang mendukung pengajuan (jika ada)"
        required={false}
        onChange={handleDocumentChange}
      />
    </div>
  );

  // Step 3: Spesifikasi Item
  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <div className="flex items-start">
          <Info className="w-5 h-5 text-green-600 mt-0.5 mr-3 shrink-0" />
          <div className="text-sm text-green-900">
            <p className="font-semibold mb-1">Daftar Barang & Spesifikasi</p>
            <p>
              Isi detail setiap barang yang akan dievaluasi TKDN nya. Klik
              &quot;+ Tambah Item&quot; untuk menambah barang.
            </p>
          </div>
        </div>
      </div>

      {items.map((item, index) => (
        <div
          key={item.id}
          className="border-2 border-gray-200 rounded-xl p-6 relative"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">
              Item #{index + 1}
            </h3>
            {items.length > 1 && (
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="text-red-600 hover:text-red-700 transition-colors p-2"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nama Barang <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={item.item_name}
                onChange={(e) =>
                  handleItemChange(index, 'item_name', e.target.value)
                }
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                placeholder="Contoh: Laptop HP EliteBook"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Jumlah <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={item.quantity}
                onChange={(e) =>
                  handleItemChange(index, 'quantity', e.target.value)
                }
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                placeholder="10"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Satuan <span className="text-red-500">*</span>
              </label>
              <div className="relative" data-dropdown>
                <button
                  type="button"
                  onClick={() => setOpenDropdown(
                    openDropdown.index === index && openDropdown.field === 'unit'
                      ? { index: null, field: null }
                      : { index, field: 'unit' }
                  )}
                  className="w-full px-4 py-3 pr-10 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white cursor-pointer transition-all hover:border-gray-300 text-left text-gray-900"
                >
                  {item.unit ? (
                    item.unit.charAt(0).toUpperCase() + item.unit.slice(1)
                  ) : (
                    <span className="text-gray-400">Pilih Satuan</span>
                  )}
                  <svg
                    className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 transition-transform ${
                      openDropdown.index === index && openDropdown.field === 'unit' ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openDropdown.index === index && openDropdown.field === 'unit' && (
                  <div className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl overflow-hidden">
                    {['unit', 'set', 'pcs', 'buah', 'paket'].map((option) => (
                      <div
                        key={option}
                        onClick={() => {
                          handleItemChange(index, 'unit', option);
                          setOpenDropdown({ index: null, field: null });
                        }}
                        className="px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors text-gray-900 border-b border-gray-100 last:border-b-0"
                      >
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Merk
              </label>
              <input
                type="text"
                value={item.brand}
                onChange={(e) =>
                  handleItemChange(index, 'brand', e.target.value)
                }
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                placeholder="HP, Dell, Lenovo, dll"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Model/Tipe
              </label>
              <input
                type="text"
                value={item.model}
                onChange={(e) =>
                  handleItemChange(index, 'model', e.target.value)
                }
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                placeholder="EliteBook 840 G8"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Spesifikasi Detail
              </label>
              <textarea
                value={item.specifications}
                onChange={(e) =>
                  handleItemChange(index, 'specifications', e.target.value)
                }
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-300"
                rows="3"
                placeholder="Contoh: Intel Core i7, RAM 16GB, SSD 512GB, dll"
              />
            </div>

            <div className="md:col-span-2 border-t pt-4 mt-2">
              <h4 className="font-semibold text-gray-900 mb-4">
                Evaluasi TKDN
              </h4>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Kategori Industri <span className="text-red-500">*</span>
              </label>
              <div className="relative" data-dropdown>
                <button
                  type="button"
                  onClick={() => setOpenDropdown(
                    openDropdown.index === index && openDropdown.field === 'category'
                      ? { index: null, field: null }
                      : { index, field: 'category' }
                  )}
                  className="w-full px-4 py-3 pr-10 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white cursor-pointer transition-all hover:border-gray-300 text-left text-gray-900"
                >
                  {item.category ? (
                    regulations[item.category].name + ' (Min TKDN ' + regulations[item.category].minTKDN + '%)'
                  ) : (
                    <span className="text-gray-400">Pilih Kategori</span>
                  )}
                  <svg
                    className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 transition-transform ${
                      openDropdown.index === index && openDropdown.field === 'category' ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openDropdown.index === index && openDropdown.field === 'category' && (
                  <div className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl overflow-hidden max-h-60 overflow-y-auto">
                    {Object.entries(regulations).map(([key, val]) => (
                      <div
                        key={key}
                        onClick={() => {
                          handleItemChange(index, 'category', key);
                          setOpenDropdown({ index: null, field: null });
                        }}
                        className="px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium text-gray-900">{val.name}</div>
                        <div className="text-sm text-gray-500 mt-0.5">Min TKDN {val.minTKDN}%</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Harga Barang Jadi (Rp) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={item.final_price}
                onChange={(e) =>
                  handleItemChange(index, 'final_price', e.target.value)
                }
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                placeholder="15000000"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Harga Komponen Luar Negeri (Rp){' '}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={item.foreign_price}
                onChange={(e) =>
                  handleItemChange(index, 'foreign_price', e.target.value)
                }
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                placeholder="5000000"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                BMP (%)
              </label>
              <input
                type="number"
                value={item.bmp}
                onChange={(e) => handleItemChange(index, 'bmp', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                placeholder="40"
                min="0"
                max="100"
              />
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addItem}
        className="w-full border-2 border-dashed border-blue-300 bg-blue-50 text-blue-600 py-4 rounded-xl font-semibold hover:bg-blue-100 transition-all flex items-center justify-center space-x-2"
      >
        <Plus className="w-5 h-5" />
        <span>Tambah Item Baru</span>
      </button>
    </div>
  );

  // Step 4: Hasil Evaluasi
  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="bg-linear-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
        <div className="flex items-center">
          <CheckCircle className="w-10 h-10 mr-4" />
          <div>
            <h2 className="text-2xl font-bold">Evaluasi Selesai!</h2>
            <p className="text-green-100">
              Data telah tersimpan dan siap untuk diajukan
            </p>
          </div>
        </div>
      </div>

      {/* Summary PPK */}
      <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
        <h3 className="font-bold text-lg mb-4 flex items-center">
          <User className="w-5 h-5 mr-2 text-blue-600" />
          Data PPK
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Nama:</span>{' '}
            <span className="font-semibold">{ppkData.nama_ppk}</span>
          </div>
          <div>
            <span className="text-gray-600">NIP:</span>{' '}
            <span className="font-semibold">{ppkData.nip}</span>
          </div>
          <div>
            <span className="text-gray-600">Email:</span>{' '}
            <span className="font-semibold">{ppkData.email}</span>
          </div>
          <div>
            <span className="text-gray-600">Unit Kerja:</span>{' '}
            <span className="font-semibold">{ppkData.unit_kerja}</span>
          </div>
        </div>
      </div>

      {/* Document Summary */}
      <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
        <h3 className="font-bold text-lg mb-4 flex items-center">
          <FileText className="w-5 h-5 mr-2 text-blue-600" />
          Dokumen yang Diupload
        </h3>
        <div className="space-y-2 text-sm">
          {Object.entries(documents)
            .filter(([, file]) => file)
            .map(([key, file]) => (
              <div
                key={key}
                className="flex items-center justify-between py-2 border-b"
              >
                <span className="text-gray-700">{key.replace(/_/g, ' ')}</span>
                <span className="text-green-600 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  {file.name}
                </span>
              </div>
            ))}
        </div>
      </div>

      {/* Results */}
      {evaluationResults.map((result, index) => (
        <div
          key={index}
          className="bg-white border-2 border-gray-200 rounded-xl p-6"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                {result.item_name}
              </h3>
              <p className="text-sm text-gray-600">
                {result.quantity} {result.unit} - {result.brand} {result.model}
              </p>
            </div>
            {result.isCompliant ? (
              <div className="flex items-center space-x-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                <CheckCircle className="w-4 h-4" />
                <span>Memenuhi</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-semibold">
                <XCircle className="w-4 h-4" />
                <span>Tidak Memenuhi</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-blue-700 mb-1">TKDN</div>
              <div className="text-2xl font-bold text-blue-600">
                {result.tkdnValue}%
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-sm text-purple-700 mb-1">BMP</div>
              <div className="text-2xl font-bold text-purple-600">
                {result.bmpValue}%
              </div>
            </div>
            <div className="bg-indigo-50 p-4 rounded-lg">
              <div className="text-sm text-indigo-700 mb-1">Total</div>
              <div className="text-2xl font-bold text-indigo-600">
                {result.totalValue}%
              </div>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            <div className="flex justify-between py-2 border-t">
              <span>Harga Barang Jadi:</span>
              <span className="font-semibold">
                Rp {parseFloat(result.final_price).toLocaleString('id-ID')}
              </span>
            </div>
            <div className="flex justify-between py-2 border-t">
              <span>Komponen Luar Negeri:</span>
              <span className="font-semibold text-red-600">
                Rp {parseFloat(result.foreign_price).toLocaleString('id-ID')}
              </span>
            </div>
            <div className="flex justify-between py-2 border-t">
              <span>Komponen Dalam Negeri:</span>
              <span className="font-semibold text-green-600">
                Rp {result.localPrice.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </div>
      ))}

      <div className="flex gap-4">
        <button
          onClick={resetForm}
          className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all"
        >
          Buat Pengajuan Baru
        </button>
        <Link
          href="/history"
          className="flex-1 bg-gray-600 text-white py-4 rounded-xl font-bold hover:bg-gray-700 transition-all text-center flex items-center justify-center"
        >
          Lihat Riwayat
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pt-20 bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Beranda</span>
        </Link>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-linear-to-r from-blue-600 to-indigo-700 px-8 py-6">
            <h1 className="text-3xl font-bold text-white mb-2">
              Pengajuan Verifikasi P3DN
            </h1>
            <p className="text-blue-100">
              Sistem Evaluasi Produk Prioritas Dalam Negeri
            </p>
          </div>

          {/* Progress Steps */}
          <div className="px-8 py-6 bg-gray-50 border-b">
            <div className="flex items-center justify-between">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full font-bold transition-all ${
                      currentStep >= step
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {step}
                  </div>
                  <div
                    className={`ml-3 ${currentStep === step ? 'block' : 'hidden sm:block'}`}
                  >
                    <div className="font-semibold text-sm">
                      {step === 1 && 'Data PPK'}
                      {step === 2 && 'Upload Dokumen'}
                      {step === 3 && 'Spesifikasi Item'}
                      {step === 4 && 'Hasil Evaluasi'}
                    </div>
                  </div>
                  {step < 4 && (
                    <div
                      className={`hidden sm:block w-16 h-1 mx-4 ${
                        currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
          </div>

          {/* Navigation Buttons */}
          {currentStep < 4 && (
            <div className="px-8 pb-8 flex gap-4">
              {currentStep > 1 && (
                <button
                  onClick={prevStep}
                  className="flex-1 border-2 border-gray-300 text-gray-700 py-4 rounded-xl font-bold hover:bg-gray-50 transition-all"
                >
                  Kembali
                </button>
              )}
              <button
                onClick={nextStep}
                disabled={isCalculating}
                className="flex-1 bg-linear-to-r from-blue-600 to-indigo-700 text-white py-4 rounded-xl font-bold hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {isCalculating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Menghitung...</span>
                  </>
                ) : (
                  <>
                    <span>{currentStep === 3 ? 'Hitung TKDN' : 'Lanjut'}</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
