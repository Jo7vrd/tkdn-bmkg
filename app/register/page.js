'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, UserPlus, Building, Phone, Mail, IdCard, Briefcase } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

// PINDAHKAN InputField KE LUAR - INI YANG PENTING!
const InputField = ({ icon: Icon, label, name, type = 'text', placeholder, required = true, value, onChange, error }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full pl-11 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
          error ? 'border-red-500' : 'border-gray-200'
        }`}
        placeholder={placeholder}
      />
    </div>
    {error && (
      <p className="mt-1 text-sm text-red-600">{error}</p>
    )}
  </div>
)

export default function RegisterPage() {
  const { register } = useAuth()
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    nip: '',
    phone: '',
    unit_kerja: '',
    jabatan: '',
    ppk_name: ''
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.username) newErrors.username = 'Username wajib diisi'
    if (!formData.email) newErrors.email = 'Email wajib diisi'
    else if (!formData.email.endsWith('@bmkg.go.id')) {
      newErrors.email = 'Email harus menggunakan domain @bmkg.go.id'
    }
    if (!formData.password) newErrors.password = 'Password wajib diisi'
    else if (formData.password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter'
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Password tidak sama'
    }
    if (!formData.full_name) newErrors.full_name = 'Nama lengkap wajib diisi'
    if (!formData.nip) newErrors.nip = 'NIP wajib diisi'
    if (!formData.phone) newErrors.phone = 'No. HP wajib diisi'
    if (!formData.unit_kerja) newErrors.unit_kerja = 'Unit Kerja wajib diisi'
    if (!formData.jabatan) newErrors.jabatan = 'Jabatan wajib diisi'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validate()) return

    setIsLoading(true)

    try {
      const result = await register(formData)
      
      if (result.success) {
        alert('Registrasi berhasil! Silakan login.')
        window.location.href = '/login'
      } else {
        alert('Registrasi gagal: ' + result.error)
      }
    } catch (error) {
      alert('Registrasi gagal: ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/login"
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Login</span>
        </Link>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-linear-to-r from-blue-600 to-indigo-700 px-8 py-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <UserPlus className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Registrasi Akun</h1>
                <p className="text-blue-100">Sistem Verifikasi P3DN BMKG</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8">
            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-blue-900">
                <strong>Catatan:</strong> Registrasi hanya untuk pegawai BMKG. 
                Email harus menggunakan domain <strong>@bmkg.go.id</strong>
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Account Info */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <IdCard className="w-5 h-5 mr-2 text-blue-600" />
                  Informasi Akun
                </h3>
              </div>

              <InputField
                icon={UserPlus}
                label="Username"
                name="username"
                placeholder="username"
                value={formData.username}
                onChange={handleChange}
                error={errors.username}
              />

              <InputField
                icon={Mail}
                label="Email BMKG"
                name="email"
                type="email"
                placeholder="nama@bmkg.go.id"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
              />

              <InputField
                icon={IdCard}
                label="Password"
                name="password"
                type="password"
                placeholder="Minimal 6 karakter"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
              />

              <InputField
                icon={IdCard}
                label="Konfirmasi Password"
                name="confirmPassword"
                type="password"
                placeholder="Ketik ulang password"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
              />

              {/* Personal Info */}
              <div className="md:col-span-2 mt-4">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <Briefcase className="w-5 h-5 mr-2 text-blue-600" />
                  Informasi Pegawai
                </h3>
              </div>

              <InputField
                icon={UserPlus}
                label="Nama Lengkap"
                name="full_name"
                placeholder="Nama lengkap sesuai NIP"
                value={formData.full_name}
                onChange={handleChange}
                error={errors.full_name}
              />

              <InputField
                icon={IdCard}
                label="NIP"
                name="nip"
                placeholder="18 digit NIP"
                value={formData.nip}
                onChange={handleChange}
                error={errors.nip}
              />

              <InputField
                icon={Phone}
                label="No. HP"
                name="phone"
                type="tel"
                placeholder="08xxxxxxxxxx"
                value={formData.phone}
                onChange={handleChange}
                error={errors.phone}
              />

              <InputField
                icon={Building}
                label="Unit Kerja"
                name="unit_kerja"
                placeholder="Contoh: Stasiun Meteorologi Kemayoran"
                value={formData.unit_kerja}
                onChange={handleChange}
                error={errors.unit_kerja}
              />

              <InputField
                icon={Briefcase}
                label="Jabatan"
                name="jabatan"
                placeholder="Contoh: Kepala Seksi Data"
                value={formData.jabatan}
                onChange={handleChange}
                error={errors.jabatan}
              />

              <InputField
                icon={UserPlus}
                label="Nama PPK"
                name="ppk_name"
                placeholder="Nama Pejabat Pembuat Komitmen"
                required={false}
                value={formData.ppk_name}
                onChange={handleChange}
                error={errors.ppk_name}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-8 bg-linear-to-r from-blue-600 to-indigo-700 text-white py-4 rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Mendaftar...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  <span>Daftar Sekarang</span>
                </>
              )}
            </button>

            {/* Login Link */}
            <p className="text-center text-sm text-gray-600 mt-6">
              Sudah punya akun?{' '}
              <Link href="/login" className="text-blue-600 font-semibold hover:text-blue-700">
                Login di sini
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}