# 🚀 Panduan Start/Stop Server TKDN Evaluator

## 📋 Cara Menjalankan Server

### Opsi 1: Menggunakan Script (MUDAH - DIREKOMENDASIKAN)

```bash
# Jalankan di folder tkdn-evaluator
./start-servers.sh
```

Script ini akan:

- ✅ Cek apakah port 8000 dan 3000 sudah dipakai
- ✅ Start backend di port 8000
- ✅ Start frontend di port 3000
- ✅ Verifikasi kedua server berjalan
- ✅ Tampilkan URL dan kredensial login

### Opsi 2: Manual (Step by Step)

**1. Start Backend:**

```bash
cd backend
node server.js &
```

**2. Start Frontend:**

```bash
# Kembali ke root folder
cd ..
npm run dev &
```

## 🛑 Cara Menghentikan Server

### Opsi 1: Menggunakan Script (MUDAH - DIREKOMENDASIKAN)

```bash
# Jalankan di folder tkdn-evaluator
./stop-servers.sh
```

Script ini akan:

- 🛑 Stop semua backend server
- 🛑 Stop semua frontend server
- ✅ Verifikasi server sudah berhenti

### Opsi 2: Manual (Step by Step)

**Stop Backend:**

```bash
pkill -f "node.*server.js"
```

**Stop Frontend:**

```bash
pkill -f "next dev"
```

**Stop Semuanya Sekaligus:**

```bash
pkill -9 -f "node.*server.js" && pkill -9 -f "next dev"
```

## 🔍 Cara Cek Status Server

```bash
# Cek apakah server berjalan
lsof -i :3000 -i :8000 | grep LISTEN

# Atau lebih detail
ps aux | grep -E "server.js|next dev" | grep -v grep
```

## 📝 Lokasi Log File

- **Backend Log:** `/tmp/tkdn-backend.log`
- **Frontend Log:** `/tmp/tkdn-frontend.log`

**Lihat Log:**

```bash
# Backend
tail -f /tmp/tkdn-backend.log

# Frontend
tail -f /tmp/tkdn-frontend.log
```

## 🔐 Kredensial Login

**Admin:**

- Email: `admin@bmkg.go.id`
- Password: `admin123`

**User:**

- Email: `jonathan@bmkg.go.id`
- Password: `jonathan123`

## 🌐 URL Akses

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **Health Check:** http://localhost:8000/api/health

## ⚙️ Troubleshooting

### Server Tidak Start

1. **Port sudah dipakai:**

   ```bash
   ./stop-servers.sh
   ./start-servers.sh
   ```

2. **Cek error di log:**
   ```bash
   tail -50 /tmp/tkdn-backend.log
   tail -50 /tmp/tkdn-frontend.log
   ```

### Server Tidak Stop

**Metode 1: Stop script yang sudah diperbaiki**

```bash
./stop-servers.sh
```

**Metode 2: Force kill dengan -9**

```bash
pkill -9 -f "node.*server.js"
pkill -9 -f "next dev"
```

**Metode 3: Kill by port (paling ampuh)**

```bash
# Stop frontend di port 3000
lsof -ti :3000 | xargs kill -9

# Stop backend di port 8000
lsof -ti :8000 | xargs kill -9
```

**Metode 4: Stop semuanya sekaligus**

```bash
lsof -ti :3000 :8000 | xargs kill -9
```

### Frontend Tidak Stop (Masalah Umum)

Jika frontend masih berjalan setelah `./stop-servers.sh`:

```bash
# Cek PID frontend
lsof -i :3000 | grep LISTEN

# Kill langsung by port
lsof -ti :3000 | xargs kill -9

# Atau kill by process name
pkill -9 -f "next dev"
pkill -9 node
```

## 📌 Tips

1. **Selalu gunakan script** untuk kemudahan
2. **Cek status** sebelum start server baru
3. **Stop dulu** sebelum start lagi untuk menghindari port conflict
4. **Lihat log** jika ada masalah

## 🔄 Restart Server

```bash
./stop-servers.sh && sleep 2 && ./start-servers.sh
```
