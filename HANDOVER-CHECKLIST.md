# ✅ Checklist Sebelum Handover ke Tim IT BMKG

## 📋 Pre-Handover Checklist

### 1. ✅ Cleanup Files (WAJIB DILAKUKAN!)

- [ ] **Hapus file .env dengan credentials:**

  ```bash
  cd /Users/jonathanalvarado/Documents/tkdn-evaluator
  rm -f .env.local backend/.env
  ```

- [ ] **Hapus file log:**

  ```bash
  rm -f backend/server.log
  find . -name "*.log" -type f -delete
  ```

- [ ] **Verifikasi .gitignore:**
  ```bash
  cat .gitignore | grep -E "\.env|\.log"
  ```

### 2. ✅ Security Check

- [ ] **Cek tidak ada credentials hardcoded:**

  ```bash
  # Cari password/token hardcoded di code
  grep -r "password.*=.*['\"]" --include="*.js" --include="*.jsx" app/ backend/src/ components/ lib/
  ```

- [ ] **File migration memiliki comment password (ini OK, karena untuk dokumentasi):**
  - ✅ `002_create_users_table.sql` - Ada comment password untuk dokumentasi

- [ ] **Environment templates sudah ada:**
  - ✅ `.env.example` - Frontend template
  - ✅ `backend/.env.example` - Backend template

### 3. ✅ Dokumentasi Lengkap

- [x] **README.md** - Overview & quick start
- [x] **SERVER-GUIDE.md** - Development server guide
- [x] **DEPLOYMENT-GUIDE.md** - Production deployment
- [x] **ADMIN-MANUAL.md** - Admin operations manual
- [x] **.env.example** - Environment template

### 4. 🔄 Git Commit (Opsional tapi Recommended)

- [ ] **Commit semua perubahan:**

  ```bash
  cd /Users/jonathanalvarado/Documents/tkdn-evaluator

  # Add new files
  git add ADMIN-MANUAL.md
  git add DEPLOYMENT-GUIDE.md
  git add package-for-bmkg.sh
  git add README.md
  git add .env.example
  git add backend/.env.example

  # Commit
  git commit -m "docs: Add complete documentation for BMKG handover

  - Add ADMIN-MANUAL.md for admin operations
  - Add DEPLOYMENT-GUIDE.md for production deployment
  - Update README.md with complete project info
  - Add environment templates (.env.example)
  - Add package-for-bmkg.sh script
  - Code cleanup and optimization complete"

  # Push to repository
  git push origin main
  ```

### 5. 📦 Package Project

- [ ] **Jalankan package script:**

  ```bash
  cd /Users/jonathanalvarado/Documents/tkdn-evaluator
  ./package-for-bmkg.sh
  ```

  Akan menghasilkan file: `/tmp/tkdn-evaluator-YYYYMMDD.tar.gz`

### 6. ✅ Final Testing (Sebelum Package)

- [ ] **Test backend:**

  ```bash
  cd backend
  node server.js &
  sleep 2
  curl http://localhost:8000/api/health
  # Harus return: {"status":"ok"}
  ```

- [ ] **Test frontend:**

  ```bash
  npm run dev &
  sleep 5
  curl http://localhost:3000
  # Harus return HTML
  ```

- [ ] **Stop servers:**

  ```bash
  ./stop-servers.sh
  ```

- [ ] **Test login:**
  - Buka http://localhost:3000
  - Login dengan: admin@bmkg.go.id / admin123
  - Pastikan bisa masuk ke dashboard

### 7. 📝 Persiapan Handover Document

- [ ] **Buat handover notes:**

```markdown
# Handover Notes - TKDN Evaluator

## Project Info

- **Nama**: TKDN Evaluator
- **Developer**: Jonathan Alvarado
- **Periode Magang**: [Tanggal Mulai] - [Tanggal Selesai]
- **Status**: Ready for deployment

## Teknologi

- Frontend: Next.js 15.1.3, React 19, TailwindCSS
- Backend: Node.js + Express
- Database: PostgreSQL
- Authentication: JWT + bcrypt

## Dokumentasi

1. README.md - Project overview
2. DEPLOYMENT-GUIDE.md - Deployment ke production
3. ADMIN-MANUAL.md - Manual administrasi
4. SERVER-GUIDE.md - Development guide

## Credentials Default (WAJIB GANTI!)

- Admin: admin@bmkg.go.id / admin123
- User: jonathan@bmkg.go.id / jonathan123
- Database: bmkg_p3dn (username sesuai server)

## Next Steps untuk Tim IT BMKG

1. Review code & dokumentasi
2. Setup server production (lihat DEPLOYMENT-GUIDE.md)
3. Ganti semua credentials default
4. Setup SSL certificate
5. Configure firewall & backup
6. Testing UAT
7. Go live

## Kontak

- Email: [email kamu]
- Phone: [nomor kamu]
```

---

## 🚀 Quick Action Commands

### Bersihkan & Package (All-in-One):

```bash
#!/bin/bash
cd /Users/jonathanalvarado/Documents/tkdn-evaluator

echo "🧹 Cleaning up..."
# Hapus credentials
rm -f .env.local backend/.env

# Hapus logs
rm -f backend/server.log
find . -name "*.log" -type f -delete

# Stop running servers
./stop-servers.sh 2>/dev/null

echo "📦 Packaging..."
./package-for-bmkg.sh

echo ""
echo "✅ SELESAI!"
echo ""
echo "📦 File package: /tmp/tkdn-evaluator-$(date +%Y%m%d).tar.gz"
echo ""
echo "📋 Checklist:"
echo "  ✅ Credentials dihapus"
echo "  ✅ Logs dibersihkan"
echo "  ✅ Servers stopped"
echo "  ✅ Project di-package"
echo ""
echo "🔄 Optional - Commit to Git:"
echo "  git add -A"
echo "  git commit -m 'Ready for BMKG handover'"
echo "  git push origin main"
echo ""
```

Save script di atas sebagai `prepare-handover.sh`:

```bash
# Save script
cat > prepare-handover.sh << 'EOF'
[paste script di atas]
EOF

# Make executable
chmod +x prepare-handover.sh

# Run
./prepare-handover.sh
```

---

## 📤 Cara Transfer ke BMKG

### Opsi 1: USB/External Drive

```bash
# Copy file package ke USB
cp /tmp/tkdn-evaluator-*.tar.gz /Volumes/USB_NAME/
```

### Opsi 2: Git Repository

```bash
# Push ke GitHub/GitLab
git add -A
git commit -m "Ready for BMKG deployment"
git push origin main

# Share repository URL ke tim BMKG
```

### Opsi 3: Cloud Storage

```bash
# Upload ke Google Drive / OneDrive
# Atau gunakan WeTransfer, Dropbox, dll
```

---

## ⚠️ PENTING SEBELUM HANDOVER!

### WAJIB DILAKUKAN:

1. ✅ **Hapus .env.local dan backend/.env** (berisi DB credentials lokal)
2. ✅ **Hapus file \*.log** (berisi data development)
3. ✅ **Stop semua running servers** (`./stop-servers.sh`)
4. ✅ **Test package script** (`./package-for-bmkg.sh`)

### WAJIB DISAMPAIKAN KE TIM IT BMKG:

1. ⚠️ **Ganti JWT_SECRET** di production (generate random string 32+ char)
2. ⚠️ **Ganti password admin default** (admin@bmkg.go.id)
3. ⚠️ **Setup backup database** (lihat ADMIN-MANUAL.md)
4. ⚠️ **Enable HTTPS** di production (SSL certificate)
5. ⚠️ **Configure firewall** (only allow port 80, 443, 22)

### INFORMASI PENTING:

- Database name: `bmkg_p3dn`
- Backend port: `8000`
- Frontend port: `3000`
- Migrations: `backend/migrations/*.sql` (run in order)
- Documents disimpan di database (BYTEA column), bukan file system

---

## 📞 Contact Info

Jika tim IT BMKG membutuhkan klarifikasi:

- **Developer**: Jonathan Alvarado
- **Email**: [email kamu]
- **Phone**: [nomor kamu]
- **Available**: [jam availability kamu]

---

## ✅ Final Checklist

Centang semua sebelum handover:

- [ ] File .env sudah dihapus
- [ ] File .log sudah dihapus
- [ ] Servers sudah di-stop
- [ ] Git sudah di-commit & push (opsional)
- [ ] Project sudah di-package (`tkdn-evaluator-YYYYMMDD.tar.gz`)
- [ ] Dokumentasi lengkap (4 file .md)
- [ ] Handover notes sudah disiapkan
- [ ] Contact info sudah diberikan ke tim IT
- [ ] Testing final sudah dilakukan
- [ ] Package file sudah di-transfer ke BMKG

---

**Jika semua sudah ✅, project SIAP diserahkan ke Tim IT BMKG!** 🎉
