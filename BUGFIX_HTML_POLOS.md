# Perbaikan Masalah HTML Polos

## Masalah yang Diperbaiki

Website sering menjadi HTML polos (tanpa styling/JavaScript) setelah beberapa waktu running dengan `npm run dev`.

## Penyebab Masalah

1. **Hydration Mismatch** - `localStorage` diakses langsung tanpa cek `typeof window`, menyebabkan perbedaan antara server-side dan client-side rendering
2. **CSS Syntax Error** - Class `bg-linear-to-*` bukan class Tailwind yang valid, seharusnya `bg-gradient-to-*`
3. **Z-index Invalid** - `z-9999` bukan class Tailwind yang valid
4. **Middleware Matcher** - Tidak meng-exclude static files dengan baik
5. **Race Condition** - setState dalam useEffect tanpa proper guards

## Perubahan yang Dilakukan

### 1. AuthContext.jsx

- ✅ Tambahkan check `typeof window !== 'undefined'` sebelum akses localStorage
- ✅ Tambahkan `SameSite=Lax` pada cookie settings
- ✅ Perbaiki error handling

### 2. Semua File (.js, .jsx)

- ✅ Ganti semua `bg-linear-to-*` menjadi `bg-gradient-to-*`
- ✅ Ganti `z-9999` menjadi `z-50`

### 3. next.config.ts

- ✅ Tambahkan `optimizePackageImports` untuk lucide-react
- ✅ Tambahkan `onDemandEntries` configuration

### 4. middleware.js

- ✅ Perbaiki matcher untuk exclude static files lebih baik
- ✅ Update comment ke Next.js 16

### 5. layout.js

- ✅ Tambahkan `suppressHydrationWarning` pada html dan body
- ✅ Tambahkan ErrorBoundary component

### 6. page.js (root)

- ✅ Gunakan `useRef` instead of `useState` untuk tracking redirect
- ✅ Hindari cascading setState dalam useEffect

### 7. ErrorBoundary.jsx (Baru)

- ✅ Tambahkan error boundary untuk catch React errors
- ✅ Tampilkan UI yang user-friendly ketika error

## Cara Testing

1. Hapus cache Next.js:

```bash
rm -rf .next
```

2. Jalankan development server:

```bash
npm run dev
```

3. Test scenario:
   - Login sebagai user/admin
   - Biarkan website terbuka selama 5-10 menit
   - Navigate antar pages
   - Refresh halaman beberapa kali
   - Website seharusnya tetap normal (tidak menjadi HTML polos)

## Prevention Tips

1. **Selalu check window availability** sebelum akses browser APIs:

   ```javascript
   if (typeof window !== 'undefined') {
     localStorage.getItem(...)
   }
   ```

2. **Gunakan Tailwind classes yang valid**:
   - ✅ `bg-gradient-to-r`
   - ❌ `bg-linear-to-r`

3. **Gunakan suppressHydrationWarning** dengan bijak pada element yang memang bisa berbeda antara server dan client

4. **Avoid setState in useEffect** - gunakan `useRef` untuk tracking yang tidak perlu trigger re-render

## Jika Masalah Masih Terjadi

1. Check browser console untuk error
2. Check terminal untuk Next.js errors/warnings
3. Pastikan tidak ada Tailwind class yang invalid
4. Clear browser cache dan localStorage
5. Restart development server

## Contact

Jika masih ada masalah, silakan check:

- Browser DevTools Console (F12)
- Next.js terminal output
- File .next/trace untuk detailed logs
