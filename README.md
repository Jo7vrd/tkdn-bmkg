# 🏛️ TKDN Evaluator - BMKG

Aplikasi evaluasi **Tingkat Komponen Dalam Negeri (TKDN)** untuk Badan Meteorologi, Klimatologi, dan Geofisika (BMKG).

Sistem ini membantu mengelola pengajuan, evaluasi, dan monitoring dokumen TKDN sesuai dengan regulasi Perpres 16/2018 dan PP 29/2018.

## ✨ Fitur

- 🔐 **Autentikasi**: Login dengan role User dan Admin
- 📝 **Pengajuan TKDN**: Form lengkap dengan upload dokumen PDF
- 📊 **Dashboard**: Overview evaluasi untuk User dan Admin
- 🔍 **Review System**: Admin dapat mereview dan approve/reject pengajuan
- 📜 **History**: Tracking status evaluasi dengan timeline
- 📄 **Document Management**: Preview dan download dokumen PDF
- 🎯 **Auto Calculation**: Perhitungan TKDN otomatis berdasarkan formula

## 🛠️ Teknologi

### Frontend

- **Next.js 15.1.3** (App Router)
- **React 19** with Hooks
- **TailwindCSS** untuk styling
- **Lucide React** untuk icons

### Backend

- **Node.js + Express**
- **PostgreSQL** database
- **JWT** authentication
- **bcrypt** password hashing

## 📋 Prerequisites

- Node.js 18+ (LTS)
- PostgreSQL 14+
- npm atau yarn

## 🚀 Cara Menjalankan (Development)

### 1. Clone Repository

```bash
git clone <repository-url>
cd tkdn-evaluator
```

### 2. Setup Environment Variables

**Frontend (.env.local):**

```bash
cp .env.example .env.local
```

**Backend (backend/.env):**

```bash
cp backend/.env.example backend/.env
# Edit backend/.env dan sesuaikan dengan config database Anda
```

### 3. Setup Database

```bash
# Login ke PostgreSQL
psql -U postgres

# Buat database
CREATE DATABASE bmkg_p3dn;

# Jalankan migrations
psql -U postgres -d bmkg_p3dn -f backend/migrations/001_create_tables.sql
psql -U postgres -d bmkg_p3dn -f backend/migrations/002_create_users_table.sql
```

### 4. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 5. Jalankan Development Server

**Gunakan script otomatis (REKOMENDASI):**

```bash
./start-servers.sh
```

**Atau manual:**

```bash
# Terminal 1 - Backend
cd backend
node server.js

# Terminal 2 - Frontend
npm run dev
```

**Akses aplikasi:**

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000

### 6. Login

**Admin:**

- Email: `admin@bmkg.go.id`
- Password: `admin123`

**User:**

- Email: `jonathan@bmkg.go.id`
- Password: `jonathan123`

## 📁 Struktur Project

```
tkdn-evaluator/
├── app/                    # Next.js pages (App Router)
│   ├── admin/             # Admin pages
│   ├── dashboard/         # User dashboard
│   ├── evaluate/          # Form evaluasi
│   ├── history/           # History page
│   ├── login/             # Login page
│   └── api/               # API routes (optional)
├── backend/
│   ├── server.js          # Express server
│   ├── migrations/        # Database migrations
│   └── src/
│       ├── config/        # Database config
│       ├── controllers/   # Business logic
│       ├── middleware/    # Auth middleware
│       ├── routes/        # API routes
│       └── utils/         # Utilities
├── components/            # React components
├── lib/                   # Frontend utilities
├── public/               # Static files
│   └── documents/        # Template documents
├── .env.example          # Environment template
├── SERVER-GUIDE.md       # Panduan server management
├── DEPLOYMENT-GUIDE.md   # Panduan deployment
└── package.json
```

## 📚 Dokumentasi

- **[SERVER-GUIDE.md](SERVER-GUIDE.md)** - Cara menjalankan dan stop server
- **[DEPLOYMENT-GUIDE.md](DEPLOYMENT-GUIDE.md)** - Panduan deployment ke production

## 🔐 Security

- Password di-hash menggunakan bcrypt (10 rounds)
- JWT untuk authentication
- SQL injection protected (parameterized queries)
- XSS protection (React default)
- CORS enabled dengan whitelist

## 📦 Deployment ke BMKG

Untuk deploy ke server BMKG, baca panduan lengkap di [DEPLOYMENT-GUIDE.md](DEPLOYMENT-GUIDE.md).

**Quick steps:**

```bash
# 1. Package project
./package-for-bmkg.sh

# 2. Transfer file ke server BMKG
# 3. Setup environment dan database
# 4. Deploy dengan PM2 + Nginx
```

## 🤝 Contributing

Project ini dibuat untuk magang di BMKG. Untuk kontribusi atau pertanyaan:

- Developer: Jonathan Alvarado
- Email: jonathan@bmkg.go.id

## 📄 License

Open Source - digunakan untuk keperluan BMKG

## 🙏 Credits

- **BMKG** - Badan Meteorologi, Klimatologi, dan Geofisika
- Regulasi: Perpres 16/2018, PP 29/2018, Permenperin 35/2025

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
