# 📋 HANDOVER NOTES - TKDN Evaluator untuk Tim IT BMKG

## 📦 Informasi Project

**Nama Project**: TKDN Evaluator  
**Developer**: Jonathan Alvarado  
**Periode Magang**: [Sesuaikan dengan periode magang kamu]  
**Status**: ✅ Ready for Deployment  
**Repository**: [Link repository Git kamu]

---

## 🛠️ Teknologi Stack

### Frontend

- **Framework**: Next.js 15.1.3 (App Router)
- **UI Library**: React 19
- **Styling**: TailwindCSS
- **Icons**: Lucide React
- **Port Default**: 3000

### Backend

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Port Default**: 8000

### Database

- **Database**: PostgreSQL 14+
- **Database Name**: `bmkg_p3dn`
- **Migration Files**: `backend/migrations/001_create_tables.sql` dan `002_create_users_table.sql`

### Authentication

- **Method**: JWT (JSON Web Token)
- **Password Hashing**: bcrypt (10 rounds)

---

## 📚 Dokumentasi Lengkap

Project ini dilengkapi dengan dokumentasi komprehensif:

1. **[README.md](README.md)** - Overview project dan quick start
2. **[SERVER-GUIDE.md](SERVER-GUIDE.md)** - Panduan menjalankan server development
3. **[DEPLOYMENT-GUIDE.md](DEPLOYMENT-GUIDE.md)** - Panduan lengkap deployment ke production
4. **[ADMIN-MANUAL.md](ADMIN-MANUAL.md)** - Manual administrasi sistem

**Wajib baca**: `DEPLOYMENT-GUIDE.md` untuk deployment ke server BMKG.

---

## 🔐 Credentials Default (WAJIB GANTI!)

### User Login

**Admin:**

- Email: `admin@bmkg.go.id`
- Password: `admin123`

**User:**

- Email: `jonathan@bmkg.go.id`
- Password: `jonathan123`

⚠️ **PENTING**: Ganti semua password ini setelah deployment!

### Database

- Database name: `bmkg_p3dn`
- User: [sesuaikan dengan server BMKG]
- Password: [buat password baru yang aman]

---

## ⚠️ CRITICAL: Yang WAJIB Dilakukan Tim IT BMKG

### 1. Setup Environment Variables

Buat file `.env.local` (frontend) dan `backend/.env` dengan config production:

**Frontend (.env.local):**

```env
NEXT_PUBLIC_APP_NAME="TKDN Evaluator - BMKG"
NEXT_PUBLIC_API_URL=https://api.bmkg.go.id/tkdn/api
```

**Backend (backend/.env):**

```env
# Database Configuration (SESUAIKAN!)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bmkg_p3dn
DB_USER=postgres_user_bmkg
DB_PASSWORD=PASSWORD_AMAN_BMKG

# JWT Secret (WAJIB GANTI - GENERATE RANDOM STRING!)
JWT_SECRET=RANDOM_STRING_MINIMAL_32_KARAKTER_YANG_SANGAT_RAHASIA

# Server Configuration
PORT=8000
NODE_ENV=production

# CORS Configuration
FRONTEND_URL=https://tkdn.bmkg.go.id
```

**Generate JWT_SECRET yang aman:**

```bash
# Option 1: Menggunakan OpenSSL
openssl rand -base64 48

# Option 2: Menggunakan Node.js
node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"
```

### 2. Setup Database

```bash
# 1. Buat database
psql -U postgres
CREATE DATABASE bmkg_p3dn;
CREATE USER bmkg_admin WITH PASSWORD 'password_aman';
GRANT ALL PRIVILEGES ON DATABASE bmkg_p3dn TO bmkg_admin;
\q

# 2. Jalankan migrations (URUT!)
psql -U bmkg_admin -d bmkg_p3dn -f backend/migrations/001_create_tables.sql
psql -U bmkg_admin -d bmkg_p3dn -f backend/migrations/002_create_users_table.sql

# 3. Verify
psql -U bmkg_admin -d bmkg_p3dn -c "\dt"
```

### 3. Ganti Password Admin

```bash
# Generate password hash baru
node -e "
import bcrypt from 'bcrypt';
const hash = await bcrypt.hash('PASSWORD_BARU_ADMIN', 10);
console.log(hash);
"

# Update di database
psql -U bmkg_admin -d bmkg_p3dn
UPDATE users SET password = '$2b$10$hash_yang_baru_generated' WHERE email = 'admin@bmkg.go.id';
```

### 4. Install Dependencies

```bash
# Root directory (frontend)
npm install --production

# Backend
cd backend
npm install --production
```

### 5. Build Frontend

```bash
npm run build
```

### 6. Setup PM2 (Process Manager)

Gunakan PM2 untuk production. Lihat detail lengkap di `DEPLOYMENT-GUIDE.md`.

### 7. Setup Nginx Reverse Proxy

Config Nginx untuk routing domain. Lihat detail lengkap di `DEPLOYMENT-GUIDE.md`.

### 8. Setup SSL Certificate

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Generate SSL
sudo certbot --nginx -d tkdn.bmkg.go.id -d api.bmkg.go.id
```

### 9. Configure Firewall

```bash
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

### 10. Setup Backup Otomatis

Lihat detail lengkap di `ADMIN-MANUAL.md` bagian "Backup & Restore Database".

---

## 📁 Struktur Database

### Tables:

1. **users** - User accounts (admin & user)
2. **evaluations** - Evaluasi TKDN submissions
3. **evaluation_items** - Detail items dari setiap evaluasi
4. **evaluation_documents** - PDF documents (stored as BYTEA)

⚠️ **PENTING**: Dokumen PDF disimpan di **database** (bukan file system), jadi pastikan database backup termasuk binary data.

---

## 🚀 Cara Install di Server BMKG

### Quick Steps:

1. **Clone repository:**

   ```bash
   cd /var/www
   git clone [repository-url] tkdn-evaluator
   cd tkdn-evaluator
   ```

2. **Setup environment:**

   ```bash
   cp .env.example .env.local
   cp backend/.env.example backend/.env
   # Edit .env files sesuai config server BMKG
   ```

3. **Setup database:**

   ```bash
   # Jalankan migrations
   psql -U postgres -d bmkg_p3dn -f backend/migrations/001_create_tables.sql
   psql -U postgres -d bmkg_p3dn -f backend/migrations/002_create_users_table.sql
   ```

4. **Install & build:**

   ```bash
   npm install --production
   cd backend && npm install --production && cd ..
   npm run build
   ```

5. **Start dengan PM2:**

   ```bash
   # Lihat DEPLOYMENT-GUIDE.md untuk ecosystem.config.js
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

6. **Setup Nginx:**

   ```bash
   # Copy nginx config dari DEPLOYMENT-GUIDE.md
   sudo nano /etc/nginx/sites-available/tkdn
   sudo ln -s /etc/nginx/sites-available/tkdn /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

7. **Setup SSL:**
   ```bash
   sudo certbot --nginx -d tkdn.bmkg.go.id
   ```

**Detail lengkap ada di `DEPLOYMENT-GUIDE.md`**

---

## 🔒 Security Checklist

- [ ] JWT_SECRET sudah diganti dengan random string
- [ ] Password admin sudah diganti dari default
- [ ] Password database sudah aman
- [ ] HTTPS/SSL sudah aktif
- [ ] Firewall sudah dikonfigurasi (hanya port 22, 80, 443)
- [ ] Database backup sudah terjadwal otomatis
- [ ] CORS dikonfigurasi hanya untuk domain BMKG
- [ ] File .env tidak ter-expose publicly
- [ ] Nginx security headers sudah dikonfigurasi

---

## 🔧 Maintenance

### Daily:

- Monitor logs: `pm2 logs`
- Check server status: `pm2 status`

### Weekly:

- Review user access
- Check disk space
- Review application logs

### Monthly:

- Database backup verification
- Security updates: `npm audit`
- SSL certificate renewal check
- User cleanup (inactive users)

**Detail lengkap di `ADMIN-MANUAL.md`**

---

## 📊 Fitur Aplikasi

### User (Role: user)

- ✅ Mengajukan evaluasi TKDN
- ✅ Upload dokumen PDF (max 5MB)
- ✅ Lihat status pengajuan (pending/approved/rejected)
- ✅ History evaluasi
- ✅ Dashboard dengan statistik

### Admin (Role: admin)

- ✅ Review semua pengajuan
- ✅ Approve atau Reject evaluasi
- ✅ Preview dokumen PDF
- ✅ Tambahkan catatan review
- ✅ Dashboard dengan overview semua evaluasi
- ✅ Search & filter evaluasi

### System

- ✅ Auto-calculate TKDN berdasarkan formula
- ✅ Timeline tracking status
- ✅ Secure authentication (JWT + bcrypt)
- ✅ Document preview modal
- ✅ Responsive design

---

## 🐛 Troubleshooting

### Problem: Server tidak bisa diakses

**Solusi**: Check PM2 status, Nginx config, firewall

### Problem: Database connection error

**Solusi**: Verify credentials di backend/.env, check PostgreSQL running

### Problem: File upload gagal

**Solusi**: Check file size limit (max 5MB), verify base64 encoding

**Troubleshooting lengkap di `ADMIN-MANUAL.md`**

---

## 📞 Contact & Support

### Developer (untuk klarifikasi teknis):

- **Nama**: Jonathan Alvarado
- **Email**: [email-kamu]@bmkg.go.id
- **Phone**: [nomor-kamu]
- **Available**: [jam availability kamu]

### Dokumentasi:

- Technical: Lihat `DEPLOYMENT-GUIDE.md`
- Operations: Lihat `ADMIN-MANUAL.md`
- Development: Lihat `SERVER-GUIDE.md`

---

## 📝 Next Steps untuk Tim IT

1. ✅ **Review code & dokumentasi**
2. ✅ **Setup server production** (lihat DEPLOYMENT-GUIDE.md)
3. ✅ **Generate JWT_SECRET baru**
4. ✅ **Setup database dan jalankan migrations**
5. ✅ **Ganti semua password default**
6. ✅ **Configure Nginx + SSL**
7. ✅ **Setup firewall**
8. ✅ **Setup backup schedule**
9. ✅ **Testing UAT**
10. ✅ **Go Live**

---

## ✅ Project Status

- ✅ Development selesai
- ✅ Testing selesai
- ✅ Code cleanup selesai
- ✅ Dokumentasi lengkap
- ✅ Ready for deployment

---

**Terakhir diupdate**: 6 Februari 2026  
**Versi**: 1.0.0  
**Status**: Ready for Production 🚀
