# 🧪 Panduan Testing Backend TKDN Evaluator

## Setup

### 1. Pastikan Backend Running

```bash
cd backend
node server.js
```

Server berjalan di: `http://localhost:8000`

### 2. Pastikan Database Sudah Di-migrate

```bash
psql -U jonathanalvarado -d bmkg_p3dn -f migrations/001_create_tables.sql
psql -U jonathanalvarado -d bmkg_p3dn -f migrations/002_create_users_table.sql
```

---

## Testing Methods

### Method 1: Menggunakan Script Test (Recommended)

```bash
cd backend
bash test-api.sh
```

Script ini akan otomatis test semua endpoint:

- ✅ Health check
- ✅ Register user
- ✅ Login
- ✅ Get profile (protected)
- ✅ Create evaluation
- ✅ Get all evaluations
- ✅ Get evaluation by ID

---

### Method 2: Manual Testing dengan cURL

#### 1️⃣ Health Check

```bash
curl http://localhost:8000/api/health
```

#### 2️⃣ Register User Baru

```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "testuser@bmkg.go.id",
    "password": "password123",
    "full_name": "Test User BMKG",
    "nip": "199001012020121001",
    "phone": "08123456789",
    "unit_kerja": "Stasiun Meteorologi Jakarta",
    "jabatan": "Staf Ahli",
    "ppk_name": "PPK Test"
  }'
```

**Validasi:**

- ✅ Email harus `@bmkg.go.id`
- ✅ Password minimal 6 karakter
- ✅ Username & email unique

#### 3️⃣ Login

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@bmkg.go.id",
    "password": "password123"
  }'
```

**Response:** JWT Token (simpan untuk request selanjutnya)

#### 4️⃣ Get Profile (Protected - Butuh Token)

```bash
TOKEN="<your_jwt_token_here>"

curl -X GET http://localhost:8000/api/auth/profile \
  -H "Authorization: Bearer $TOKEN"
```

#### 5️⃣ Create Evaluation

```bash
curl -X POST http://localhost:8000/api/evaluations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "ppkData": {
      "nama_ppk": "Budi Santoso",
      "nip": "199001012020121003",
      "no_hp": "081234567890",
      "email": "budi@bmkg.go.id",
      "unit_kerja": "Stasiun Meteorologi Jakarta",
      "jabatan": "Kepala Stasiun"
    },
    "documents": [],
    "items": [
      {
        "itemName": "Laptop Dell Latitude",
        "quantity": 5,
        "unit": "Unit",
        "brand": "Dell",
        "model": "Latitude 5420",
        "specifications": "Intel Core i5, 8GB RAM, 256GB SSD",
        "category": "Elektronik",
        "finalPrice": 10000000,
        "foreignPrice": 8000000,
        "bmp": 20,
        "tkdn": 25.5,
        "status": "Lulus",
        "regulation": "Permen BUMN No. 15/2012"
      }
    ]
  }'
```

**Response:** `{ "success": true, "data": { "id": "TKDN-2026-001" } }`

#### 6️⃣ Get All Evaluations (User: Own Only)

```bash
curl -X GET http://localhost:8000/api/evaluations \
  -H "Authorization: Bearer $TOKEN"
```

#### 7️⃣ Get Evaluation by ID

```bash
curl -X GET http://localhost:8000/api/evaluations/TKDN-2026-001 \
  -H "Authorization: Bearer $TOKEN"
```

---

### Method 3: Testing dengan Postman

1. Import collection atau buat request manual
2. Set base URL: `http://localhost:8000/api`
3. Untuk protected routes, tambahkan header:
   - **Key:** `Authorization`
   - **Value:** `Bearer <your_token>`

---

## Verifikasi Database

### Check Users

```bash
psql -U jonathanalvarado -d bmkg_p3dn -c "SELECT id, username, email, role FROM users;"
```

### Check Evaluations

```bash
psql -U jonathanalvarado -d bmkg_p3dn -c "SELECT id, status, ppk_nama, submitted_at FROM evaluations;"
```

### Check Evaluation Items

```bash
psql -U jonathanalvarado -d bmkg_p3dn -c "SELECT evaluation_id, item_name, brand, tkdn, status FROM evaluation_items;"
```

---

## Test Results ✅

**Semua endpoint sudah berhasil di-test:**

✅ **Health Check** - Server running  
✅ **Register** - User created (ID: 2)  
✅ **Login** - Token generated  
✅ **Get Profile** - Protected route works  
✅ **Create Evaluation** - TKDN-2026-001, TKDN-2026-002 created  
✅ **Get Evaluations** - List retrieved  
✅ **Get by ID** - Detail dengan items retrieved

---

## Default Admin Account

**Username:** `admin@bmkg.go.id`  
**Password:** `admin123`  
**Role:** `admin`

_(Password hash di migration: `002_create_users_table.sql`)_

---

## Testing dari Next.js Frontend

Setelah backend berjalan, frontend Next.js di `http://localhost:3000` sudah bisa:

1. Register user baru
2. Login dan dapat token
3. Submit evaluation
4. View history evaluations

Pastikan `lib/api.js` sudah mengarah ke `http://localhost:8000/api` ✅

---

## Troubleshooting

### Error: "Failed to fetch"

- ✅ Pastikan backend running di port 8000
- ✅ Check: `curl http://localhost:8000/api/health`

### Error: "relation does not exist"

- ✅ Run migrations: `psql -U jonathanalvarado -d bmkg_p3dn -f migrations/*.sql`

### Error: "Token tidak valid"

- ✅ Token expired (7 hari), login ulang
- ✅ Pastikan format: `Authorization: Bearer <token>`

---

## API Documentation

Full endpoint list tersedia di: [README.md](../README.md)
