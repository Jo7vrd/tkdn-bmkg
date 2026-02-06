# 📖 Manual Book - TKDN Evaluator BMKG

## Daftar Isi

1. [Pengenalan Sistem](#pengenalan-sistem)
2. [Cara Login](#cara-login)
3. [Mengelola User & Admin](#mengelola-user--admin)
4. [Mengelola Evaluasi](#mengelola-evaluasi)
5. [Backup & Restore Database](#backup--restore-database)
6. [Maintenance Rutin](#maintenance-rutin)
7. [Troubleshooting](#troubleshooting)
8. [FAQ](#faq)

---

## 📌 Pengenalan Sistem

TKDN Evaluator adalah aplikasi web untuk mengelola pengajuan dan evaluasi **Tingkat Komponen Dalam Negeri (TKDN)** di BMKG.

### Fitur Utama:

- ✅ Pengajuan evaluasi TKDN oleh user
- ✅ Review dan approval oleh admin
- ✅ Upload dan preview dokumen PDF
- ✅ Perhitungan TKDN otomatis
- ✅ History dan tracking status
- ✅ Dashboard monitoring

### Role Pengguna:

1. **Admin** - Mereview, approve/reject pengajuan, mengelola semua evaluasi
2. **User** - Mengajukan evaluasi TKDN, melihat status pengajuan

---

## 🔐 Cara Login

### Akses Aplikasi:

- **URL**: https://tkdn.bmkg.go.id (atau sesuai domain BMKG)
- **Browser**: Chrome, Firefox, Safari, Edge (versi terbaru)

### Login sebagai Admin:

1. Buka aplikasi di browser
2. Klik tombol **"Login"**
3. Masukkan email dan password admin
4. Klik **"Masuk"**

### Default Credentials (WAJIB GANTI SETELAH DEPLOYMENT!):

- **Email**: admin@bmkg.go.id
- **Password**: admin123

⚠️ **PENTING**: Segera ganti password default setelah login pertama kali!

---

## 👥 Mengelola User & Admin

### A. Menambahkan Admin Baru

#### Metode 1: Melalui Database (Paling Aman)

**1. Generate Password Hash:**

```bash
# Buat file generate-password.js
cat > generate-password.js << 'EOF'
import bcrypt from 'bcrypt';

const password = process.argv[2] || 'defaultPassword123';
const hash = await bcrypt.hash(password, 10);
console.log('\n📌 Password:', password);
console.log('🔐 Hash:', hash);
console.log('\nCopy hash di atas untuk digunakan di SQL query\n');
EOF

# Jalankan script
node generate-password.js "password_baru_admin"
```

**2. Insert ke Database:**

```sql
-- Login ke database
psql -U postgres -d bmkg_p3dn

-- Generate ID admin baru
-- Format: USR-YYYYMMDD-XXX
-- Contoh: USR-20260206-002

-- Insert admin baru
INSERT INTO users (
  id,
  email,
  password,
  full_name,
  organization,
  role,
  is_active
) VALUES (
  'USR-20260206-002',                                    -- ID unik
  'admin2@bmkg.go.id',                                   -- Email admin
  '$2b$10$hashedPasswordDariScriptDiAtas',              -- Password hash
  'Admin Kedua BMKG',                                    -- Nama lengkap
  'BMKG',                                                -- Organisasi
  'admin',                                               -- Role: 'admin' atau 'user'
  true                                                   -- Status aktif
);

-- Verifikasi
SELECT id, email, full_name, role, is_active FROM users WHERE role = 'admin';
```

**3. Test Login:**

- Buka aplikasi
- Login dengan email dan password yang baru dibuat
- Pastikan dapat mengakses halaman admin

#### Metode 2: Melalui API (Jika Fitur Register Dibuka)

Jika endpoint register dibuka untuk admin:

```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin2@bmkg.go.id",
    "password": "PasswordYangAman123!",
    "fullName": "Admin Kedua BMKG",
    "organization": "BMKG",
    "role": "admin"
  }'
```

⚠️ **CATATAN**: Endpoint register harus di-protect atau disabled di production!

### B. Menambahkan User Biasa

Sama seperti menambahkan admin, tapi ubah `role` menjadi `'user'`:

```sql
INSERT INTO users (
  id,
  email,
  password,
  full_name,
  organization,
  role,
  is_active
) VALUES (
  'USR-20260206-003',
  'user@perusahaan.com',
  '$2b$10$hashedPasswordHere',
  'Nama User',
  'PT Perusahaan ABC',
  'user',                    -- Role user
  true
);
```

### C. Menonaktifkan User/Admin

```sql
-- Nonaktifkan user (soft delete)
UPDATE users
SET is_active = false
WHERE email = 'user@perusahaan.com';

-- Aktifkan kembali
UPDATE users
SET is_active = true
WHERE email = 'user@perusahaan.com';
```

### D. Mengganti Password User

```sql
-- 1. Generate hash password baru dengan script generate-password.js
-- 2. Update di database

UPDATE users
SET password = '$2b$10$newHashedPasswordHere'
WHERE email = 'user@perusahaan.com';
```

### E. Melihat Daftar User/Admin

```sql
-- Lihat semua admin
SELECT id, email, full_name, organization, is_active, created_at
FROM users
WHERE role = 'admin'
ORDER BY created_at DESC;

-- Lihat semua user
SELECT id, email, full_name, organization, is_active, created_at
FROM users
WHERE role = 'user'
ORDER BY created_at DESC;

-- Lihat semua (admin + user)
SELECT id, email, full_name, organization, role, is_active, created_at
FROM users
ORDER BY created_at DESC;
```

---

## 📋 Mengelola Evaluasi

### A. Melihat Semua Evaluasi (Admin)

1. Login sebagai admin
2. Akan langsung masuk ke halaman **Admin Dashboard**
3. Tampilan:
   - 📊 Statistik: Total, Pending, Approved, Rejected
   - 🔍 Search: Cari by ID atau nama PPK
   - 📜 Tabel: Daftar semua evaluasi

### B. Mereview Evaluasi

1. Di Admin Dashboard, klik **"Review"** pada evaluasi yang ingin direview
2. Akan muncul halaman review dengan:
   - Informasi PPK (nama, organisasi, kontak)
   - Dokumen yang diupload (klik icon mata untuk preview)
   - Daftar item barang dengan perhitungan TKDN
   - Total TKDN keseluruhan
3. Pilih tindakan:
   - ✅ **Terima** - Jika evaluasi memenuhi syarat
   - ❌ **Tolak** - Jika evaluasi tidak memenuhi syarat
4. Masukkan **catatan** (wajib, minimal 10 karakter)
5. Klik **"Kirim Keputusan"**

### C. Mencari Evaluasi Tertentu

**Di Admin Dashboard:**

```
🔍 Search box → Ketik ID evaluasi atau nama PPK → Enter
```

**Di Database (untuk query kompleks):**

```sql
-- Cari by ID
SELECT * FROM evaluations WHERE id = 'TKDN-2026-001';

-- Cari by nama PPK
SELECT * FROM evaluations WHERE ppk_name ILIKE '%nama%';

-- Cari by status
SELECT * FROM evaluations WHERE status = 'pending';

-- Cari by tanggal
SELECT * FROM evaluations
WHERE submitted_at >= '2026-01-01'
  AND submitted_at < '2026-02-01';
```

### D. Mengubah Status Evaluasi (Manual)

Jika perlu mengubah status secara manual:

```sql
-- Update status
UPDATE evaluations
SET
  status = 'approved',                    -- atau 'rejected', 'pending'
  reviewed_at = CURRENT_TIMESTAMP,
  reviewed_by = 'USR-20260206-001',       -- ID admin
  admin_notes = 'Catatan admin'
WHERE id = 'TKDN-2026-001';
```

### E. Melihat Detail Item Evaluasi

```sql
-- Lihat items dari evaluasi tertentu
SELECT
  item_name,
  quantity,
  final_price,
  foreign_price,
  tkdn_value,
  bmp_value
FROM evaluation_items
WHERE evaluation_id = 'TKDN-2026-001'
ORDER BY item_name;

-- Lihat total TKDN
SELECT
  id,
  ppk_name,
  total_tkdn,
  status
FROM evaluations
WHERE id = 'TKDN-2026-001';
```

### F. Menghapus Evaluasi

⚠️ **HATI-HATI**: Penghapusan bersifat permanen!

```sql
-- Delete evaluasi (akan otomatis delete items dan documents karena CASCADE)
DELETE FROM evaluations WHERE id = 'TKDN-2026-001';

-- Atau soft delete (recommended) - ubah status
UPDATE evaluations
SET status = 'deleted'
WHERE id = 'TKDN-2026-001';
```

### G. Export Data Evaluasi

**Export ke CSV:**

```sql
-- Di terminal
psql -U postgres -d bmkg_p3dn -c "
  COPY (
    SELECT
      id,
      ppk_name,
      ppk_organization,
      total_tkdn,
      status,
      submitted_at,
      reviewed_at
    FROM evaluations
    ORDER BY submitted_at DESC
  ) TO '/tmp/evaluations_export.csv' WITH CSV HEADER;
"

# File akan tersimpan di /tmp/evaluations_export.csv
```

**Export ke JSON (via API):**

```bash
# Export semua evaluasi
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:8000/api/evaluations > evaluations.json
```

---

## 💾 Backup & Restore Database

### A. Backup Database Manual

**Full Backup:**

```bash
# Backup seluruh database
pg_dump -U postgres bmkg_p3dn > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup dengan compression
pg_dump -U postgres bmkg_p3dn | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz
```

**Backup Specific Tables:**

```bash
# Backup hanya table evaluations
pg_dump -U postgres -t evaluations bmkg_p3dn > backup_evaluations.sql

# Backup multiple tables
pg_dump -U postgres -t evaluations -t users bmkg_p3dn > backup_selected.sql
```

### B. Restore Database

**Restore dari Backup:**

```bash
# Restore full backup
psql -U postgres bmkg_p3dn < backup_20260206_120000.sql

# Restore dari compressed backup
gunzip -c backup_20260206_120000.sql.gz | psql -U postgres bmkg_p3dn
```

**Restore dengan Drop & Recreate:**

```bash
# Drop database lama dan buat baru
psql -U postgres << EOF
DROP DATABASE IF EXISTS bmkg_p3dn;
CREATE DATABASE bmkg_p3dn;
EOF

# Restore
psql -U postgres bmkg_p3dn < backup_20260206_120000.sql
```

### C. Automated Backup (Cron Job)

**Setup daily backup:**

```bash
# Edit crontab
crontab -e

# Tambahkan baris berikut untuk backup setiap hari jam 2 pagi
0 2 * * * /usr/bin/pg_dump -U postgres bmkg_p3dn | gzip > /backups/bmkg_p3dn_$(date +\%Y\%m\%d).sql.gz

# Hapus backup lama (lebih dari 30 hari)
0 3 * * * find /backups -name "bmkg_p3dn_*.sql.gz" -mtime +30 -delete
```

**Buat backup script:**

```bash
cat > /usr/local/bin/backup-tkdn.sh << 'EOF'
#!/bin/bash

BACKUP_DIR="/backups/tkdn"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/bmkg_p3dn_$DATE.sql.gz"

# Buat directory jika belum ada
mkdir -p $BACKUP_DIR

# Backup database
pg_dump -U postgres bmkg_p3dn | gzip > $BACKUP_FILE

# Verify backup
if [ -f "$BACKUP_FILE" ]; then
  SIZE=$(du -h $BACKUP_FILE | cut -f1)
  echo "✅ Backup success: $BACKUP_FILE ($SIZE)"

  # Hapus backup lama (lebih dari 30 hari)
  find $BACKUP_DIR -name "bmkg_p3dn_*.sql.gz" -mtime +30 -delete
else
  echo "❌ Backup failed!"
  exit 1
fi
EOF

# Make executable
chmod +x /usr/local/bin/backup-tkdn.sh

# Test
/usr/local/bin/backup-tkdn.sh
```

### D. Backup Dokumen PDF

Dokumen PDF tersimpan di database (kolom `file_data` di tabel `evaluation_documents`).

**Export semua dokumen:**

```sql
-- Export metadata dokumen
COPY (
  SELECT
    id,
    evaluation_id,
    document_type,
    file_name,
    file_size,
    uploaded_at
  FROM evaluation_documents
) TO '/tmp/documents_metadata.csv' WITH CSV HEADER;
```

**Export binary files (advanced):**

```bash
# Script untuk export semua PDF
cat > export-documents.sh << 'EOF'
#!/bin/bash

psql -U postgres -d bmkg_p3dn -t -c "
  SELECT id, file_name, encode(file_data, 'base64')
  FROM evaluation_documents
" | while IFS='|' read -r id filename base64data; do
  # Clean whitespace
  id=$(echo $id | xargs)
  filename=$(echo $filename | xargs)

  # Decode and save
  echo "$base64data" | base64 -d > "/tmp/documents/${id}_${filename}"
  echo "Exported: ${id}_${filename}"
done
EOF

chmod +x export-documents.sh
mkdir -p /tmp/documents
./export-documents.sh
```

---

## 🔧 Maintenance Rutin

### A. Cek Status Server

**Cek aplikasi running:**

```bash
# Cek dengan PM2
pm2 status

# Cek port
lsof -i :3000  # Frontend
lsof -i :8000  # Backend

# Cek process
ps aux | grep "next dev"
ps aux | grep "node.*server.js"
```

**Cek database connection:**

```bash
# Test koneksi
psql -U postgres -d bmkg_p3dn -c "SELECT COUNT(*) FROM evaluations;"

# Cek active connections
psql -U postgres -d bmkg_p3dn -c "
  SELECT count(*) as active_connections
  FROM pg_stat_activity
  WHERE datname = 'bmkg_p3dn';
"
```

### B. Monitor Logs

**Application logs:**

```bash
# PM2 logs
pm2 logs tkdn-backend --lines 100
pm2 logs tkdn-frontend --lines 100

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# System logs
journalctl -u postgresql -f
```

**Check for errors:**

```bash
# Backend errors
grep -i "error" /var/log/tkdn-backend-error.log | tail -20

# Database errors
grep -i "error" /var/log/postgresql/postgresql-*.log | tail -20
```

### C. Pembersihan Database

**Hapus data lama (opsional):**

```sql
-- Hapus evaluasi yang ditolak lebih dari 1 tahun lalu
DELETE FROM evaluations
WHERE status = 'rejected'
  AND reviewed_at < NOW() - INTERVAL '1 year';

-- Vacuum database untuk optimize
VACUUM ANALYZE;
```

**Cek ukuran database:**

```sql
-- Ukuran database
SELECT pg_size_pretty(pg_database_size('bmkg_p3dn'));

-- Ukuran per table
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### D. Update Aplikasi

**Update dari Git:**

```bash
cd /var/www/tkdn-evaluator

# Backup dulu
./backup-tkdn.sh

# Pull latest code
git pull origin main

# Install dependencies
npm install
cd backend && npm install && cd ..

# Rebuild frontend
npm run build

# Restart services
pm2 restart all

# Verify
sleep 5
curl http://localhost:8000/api/health
curl http://localhost:3000
```

### E. Security Audit

**Monthly security checklist:**

```bash
# Update packages
npm audit
npm audit fix

# Check SSL certificate expiry
openssl x509 -in /etc/letsencrypt/live/tkdn.bmkg.go.id/cert.pem -noout -dates

# Review user access
psql -U postgres -d bmkg_p3dn -c "
  SELECT email, role, is_active, last_login
  FROM users
  ORDER BY last_login DESC NULLS LAST;
"

# Check failed login attempts (if logged)
grep "401" /var/log/nginx/access.log | tail -50
```

---

## 🔍 Troubleshooting

### Problem 1: User Tidak Bisa Login

**Gejala:** Error "Invalid email or password"

**Solusi:**

1. **Cek user exist:**

   ```sql
   SELECT id, email, is_active FROM users WHERE email = 'user@email.com';
   ```

2. **Cek is_active:**

   ```sql
   UPDATE users SET is_active = true WHERE email = 'user@email.com';
   ```

3. **Reset password:**

   ```bash
   # Generate hash baru
   node generate-password.js "NewPassword123"

   # Update
   psql -U postgres -d bmkg_p3dn -c "
     UPDATE users
     SET password = '\$2b\$10\$newHashHere'
     WHERE email = 'user@email.com';
   "
   ```

### Problem 2: Server Tidak Bisa Diakses

**Gejala:** Cannot reach server / Connection refused

**Solusi:**

1. **Cek server running:**

   ```bash
   pm2 status
   lsof -i :3000 :8000
   ```

2. **Restart server:**

   ```bash
   pm2 restart all
   ```

3. **Cek logs untuk error:**

   ```bash
   pm2 logs tkdn-backend --err
   pm2 logs tkdn-frontend --err
   ```

4. **Cek Nginx:**
   ```bash
   sudo nginx -t
   sudo systemctl status nginx
   sudo systemctl restart nginx
   ```

### Problem 3: Database Connection Error

**Gejala:** "Error connecting to database"

**Solusi:**

1. **Cek PostgreSQL running:**

   ```bash
   sudo systemctl status postgresql
   sudo systemctl start postgresql
   ```

2. **Cek credentials di .env:**

   ```bash
   cat backend/.env | grep DB_
   ```

3. **Test koneksi manual:**

   ```bash
   psql -U postgres -d bmkg_p3dn -c "SELECT 1;"
   ```

4. **Cek max connections:**
   ```sql
   SHOW max_connections;
   SELECT count(*) FROM pg_stat_activity;
   ```

### Problem 4: File Upload Gagal

**Gejala:** "Gagal mengupload file" atau "File terlalu besar"

**Solusi:**

1. **Cek size limit:**
   - Frontend: 5MB (di FileUpload.jsx)
   - Backend: 10MB (di server.js)

2. **Increase limit (jika perlu):**

   ```javascript
   // backend/server.js
   app.use(express.json({ limit: '20mb' }));
   ```

3. **Cek database storage:**
   ```sql
   SELECT pg_size_pretty(pg_database_size('bmkg_p3dn'));
   ```

### Problem 5: PDF Preview Tidak Muncul

**Gejala:** PDF tidak bisa di-preview

**Solusi:**

1. **Cek dokumen exist:**

   ```sql
   SELECT id, file_name, file_size
   FROM evaluation_documents
   WHERE evaluation_id = 'TKDN-2026-001';
   ```

2. **Verify file_data not null:**

   ```sql
   SELECT
     id,
     file_name,
     CASE WHEN file_data IS NULL THEN 'NULL' ELSE 'OK' END as file_status
   FROM evaluation_documents;
   ```

3. **Cek browser console** untuk error JavaScript

### Problem 6: TKDN Calculation Salah

**Gejala:** Nilai TKDN tidak sesuai

**Solusi:**

1. **Verifikasi formula:**

   ```
   TKDN Item = ((Harga Jadi - Komponen Asing) / Harga Jadi) × 100
   TKDN Total = Average dari semua TKDN Item
   ```

2. **Cek data item:**

   ```sql
   SELECT
     item_name,
     final_price,
     foreign_price,
     tkdn_value,
     ((final_price - foreign_price) / NULLIF(final_price, 0) * 100) as calculated_tkdn
   FROM evaluation_items
   WHERE evaluation_id = 'TKDN-2026-001';
   ```

3. **Recalculate (jika perlu):**
   ```sql
   UPDATE evaluation_items
   SET tkdn_value = ((final_price - foreign_price) / NULLIF(final_price, 0) * 100)
   WHERE evaluation_id = 'TKDN-2026-001';
   ```

---

## ❓ FAQ (Frequently Asked Questions)

### 1. Bagaimana cara mengganti email admin?

```sql
UPDATE users
SET email = 'admin_baru@bmkg.go.id'
WHERE email = 'admin_lama@bmkg.go.id';
```

### 2. Bagaimana cara melihat evaluasi yang paling banyak?

```sql
SELECT
  DATE_TRUNC('month', submitted_at) as bulan,
  COUNT(*) as total_evaluasi,
  COUNT(*) FILTER (WHERE status = 'approved') as approved,
  COUNT(*) FILTER (WHERE status = 'rejected') as rejected,
  COUNT(*) FILTER (WHERE status = 'pending') as pending
FROM evaluations
GROUP BY DATE_TRUNC('month', submitted_at)
ORDER BY bulan DESC;
```

### 3. Berapa lama JWT token berlaku?

Default: **24 jam**

Ubah di `backend/src/utils/jwt.js`:

```javascript
expiresIn: '24h'; // Ganti sesuai kebutuhan
```

### 4. Bagaimana cara export semua data untuk audit?

```bash
# Export full database
pg_dump -U postgres bmkg_p3dn > audit_backup_$(date +%Y%m%d).sql

# Export ke Excel/CSV
psql -U postgres -d bmkg_p3dn -c "
  COPY (
    SELECT * FROM evaluations ORDER BY submitted_at DESC
  ) TO '/tmp/evaluations_audit.csv' WITH CSV HEADER;
"
```

### 5. Apakah data user ter-enkripsi?

- ✅ **Password**: Ya, di-hash dengan bcrypt (10 rounds)
- ✅ **JWT Token**: Ya, signed dengan secret key
- ⚠️ **Email & Data Lain**: Tidak (stored as plaintext)
- ⚠️ **PDF Files**: Tidak encrypted (stored as BYTEA)

Untuk production dengan data sensitif, pertimbangkan:

- Encrypt database columns (pgcrypto)
- Enable SSL/TLS untuk database connection
- HTTPS untuk semua traffic

### 6. Berapa kapasitas maksimal database?

PostgreSQL default tidak ada hard limit, tapi pertimbangkan:

- **Disk space**: Monitor dengan `df -h`
- **Max connections**: Default 100 (cek `max_connections`)
- **File size**: PDF max 5MB per file

### 7. Bagaimana cara migrasi ke server baru?

```bash
# Di server lama
pg_dump -U postgres bmkg_p3dn | gzip > bmkg_p3dn_migration.sql.gz
tar -czf tkdn-app.tar.gz /var/www/tkdn-evaluator

# Transfer ke server baru
scp bmkg_p3dn_migration.sql.gz user@new-server:/tmp/
scp tkdn-app.tar.gz user@new-server:/tmp/

# Di server baru
gunzip -c /tmp/bmkg_p3dn_migration.sql.gz | psql -U postgres bmkg_p3dn
tar -xzf /tmp/tkdn-app.tar.gz -C /var/www/

# Setup environment dan restart services
```

### 8. Bagaimana cara enable logging untuk audit trail?

Tambah logging middleware di backend:

```javascript
// backend/src/middleware/auditLogger.js
export const auditLogger = (req, res, next) => {
  const log = {
    timestamp: new Date(),
    user: req.user?.email,
    method: req.method,
    path: req.path,
    ip: req.ip,
  };
  console.log('[AUDIT]', JSON.stringify(log));
  next();
};

// Gunakan di routes
app.use('/api', authMiddleware, auditLogger, routes);
```

### 9. Apakah ada rate limiting?

Saat ini **belum ada**. Untuk production, tambahkan:

```javascript
// backend/server.js
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use('/api', limiter);
```

### 10. Bagaimana cara monitoring performance?

**Database queries:**

```sql
-- Slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Table statistics
SELECT * FROM pg_stat_user_tables WHERE schemaname = 'public';
```

**Application metrics:**

```bash
# PM2 monitoring
pm2 monit

# System resources
htop
iostat
```

---

## 📞 Kontak & Support

### Developer:

- **Nama**: Jonathan Alvarado
- **Email**: jonathan@bmkg.go.id
- **Role**: Intern / Mahasiswa Magang

### BMKG IT Support:

- **Email**: it-support@bmkg.go.id
- **Telp**: (021) xxx-xxxx

### Emergency Contacts:

- **Database Issues**: DBA Team
- **Server Issues**: Infrastructure Team
- **Application Bugs**: Developer

---

## 📝 Changelog

### Version 1.0.0 (February 2026)

- ✅ Initial release
- ✅ Basic authentication & authorization
- ✅ Evaluation submission & review
- ✅ Document upload & preview
- ✅ Dashboard & history
- ✅ Auto TKDN calculation

### Future Enhancements:

- [ ] Email notifications
- [ ] Export to Excel
- [ ] Audit trail logging
- [ ] Rate limiting
- [ ] Multi-language support
- [ ] Mobile responsive improvements

---

**Terakhir diupdate**: 6 Februari 2026  
**Versi**: 1.0.0
