# 📋 Panduan Deployment TKDN Evaluator ke Server BMKG

## 🎯 Checklist Sebelum Kirim

### 1. Persiapan Repository

- [ ] Pastikan semua file `.env` sudah di `.gitignore`
- [ ] Buat file `.env.example` untuk dokumentasi
- [ ] Hapus credentials hardcoded di code
- [ ] Bersihkan `node_modules/` dari git
- [ ] Update README.md dengan info deployment
- [ ] Buat dokumentasi lengkap

### 2. Security Check

- [ ] Ganti JWT_SECRET dengan random string 32+ karakter
- [ ] Hapus default password admin dari migration
- [ ] Enable rate limiting di production
- [ ] Review CORS settings
- [ ] Pastikan tidak ada console.log() yang sensitive
- [ ] Enable HTTPS di production

### 3. Database

- [ ] Export schema dan migration files
- [ ] Buat script untuk initial setup
- [ ] Dokumentasikan struktur database
- [ ] Backup database existing (jika ada)

## 🚀 Langkah Deployment di Server BMKG

### A. Persiapan Server

#### 1. **Requirements Server:**

```bash
# Install Node.js 18+ (LTS)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL 14+
sudo apt-get install postgresql postgresql-contrib

# Install PM2 untuk process management
sudo npm install -g pm2

# Install Nginx untuk reverse proxy
sudo apt-get install nginx
```

#### 2. **Setup Database:**

```bash
# Login sebagai postgres user
sudo -u postgres psql

# Buat database dan user
CREATE DATABASE bmkg_p3dn;
CREATE USER bmkg_admin WITH PASSWORD 'password_yang_aman';
GRANT ALL PRIVILEGES ON DATABASE bmkg_p3dn TO bmkg_admin;
\q
```

#### 3. **Run Migrations:**

```bash
# Masuk ke database
psql -U bmkg_admin -d bmkg_p3dn

# Run migration files
\i backend/migrations/001_create_tables.sql
\i backend/migrations/002_create_users_table.sql

# Verify tables
\dt
\q
```

### B. Deploy Aplikasi

#### 1. **Clone Repository:**

```bash
# Di server BMKG
cd /var/www/
git clone https://github.com/yourusername/tkdn-evaluator.git
cd tkdn-evaluator
```

#### 2. **Setup Environment Variables:**

**Frontend (.env.local):**

```bash
cat > .env.local << EOF
NEXT_PUBLIC_APP_NAME="TKDN Evaluator - BMKG"
NEXT_PUBLIC_API_URL=https://api.bmkg.go.id/tkdn/api
EOF
```

**Backend (backend/.env):**

```bash
cat > backend/.env << EOF
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bmkg_p3dn
DB_USER=bmkg_admin
DB_PASSWORD=password_yang_aman

JWT_SECRET=$(openssl rand -base64 48)

PORT=8000
NODE_ENV=production

FRONTEND_URL=https://tkdn.bmkg.go.id
EOF
```

#### 3. **Install Dependencies:**

```bash
# Install frontend dependencies
npm install --production

# Install backend dependencies
cd backend
npm install --production
cd ..
```

#### 4. **Build Frontend:**

```bash
npm run build
```

#### 5. **Setup PM2 (Process Manager):**

```bash
# Buat PM2 ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'tkdn-backend',
      script: './backend/server.js',
      cwd: '/var/www/tkdn-evaluator',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 8000
      },
      error_file: '/var/log/tkdn-backend-error.log',
      out_file: '/var/log/tkdn-backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    },
    {
      name: 'tkdn-frontend',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/tkdn-evaluator',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: '/var/log/tkdn-frontend-error.log',
      out_file: '/var/log/tkdn-frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ]
};
EOF

# Start dengan PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup
```

#### 6. **Setup Nginx Reverse Proxy:**

```bash
# Buat Nginx config
sudo nano /etc/nginx/sites-available/tkdn

# Paste config berikut:
```

```nginx
# Frontend - tkdn.bmkg.go.id
server {
    listen 80;
    server_name tkdn.bmkg.go.id;

    # Redirect ke HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name tkdn.bmkg.go.id;

    # SSL Certificate (install Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/tkdn.bmkg.go.id/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tkdn.bmkg.go.id/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Backend API - api.bmkg.go.id/tkdn
server {
    listen 80;
    server_name api.bmkg.go.id;

    location /tkdn {
        rewrite ^/tkdn/(.*) /$1 break;
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # CORS headers (jika diperlukan)
        add_header 'Access-Control-Allow-Origin' 'https://tkdn.bmkg.go.id' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type' always;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/tkdn /etc/nginx/sites-enabled/

# Test Nginx config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

#### 7. **Setup SSL dengan Let's Encrypt:**

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Generate SSL certificate
sudo certbot --nginx -d tkdn.bmkg.go.id -d api.bmkg.go.id

# Auto-renewal
sudo certbot renew --dry-run
```

### C. Create Admin User

```bash
# SSH ke server dan jalankan psql
psql -U bmkg_admin -d bmkg_p3dn

# Insert admin user (password harus di-hash dulu)
INSERT INTO users (id, email, password, full_name, organization, role, is_active)
VALUES (
  'USR-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-001',
  'admin@bmkg.go.id',
  '$2b$10$hashedPasswordHere',  -- Hash password dengan bcrypt
  'Administrator BMKG',
  'BMKG',
  'admin',
  true
);
```

**Atau buat script untuk hash password:**

```javascript
// hash-password.js
import bcrypt from 'bcrypt';

const password = 'password_baru_admin';
const hash = await bcrypt.hash(password, 10);
console.log('Hashed password:', hash);
```

```bash
node hash-password.js
```

## 🔧 Maintenance & Monitoring

### Monitoring Logs

```bash
# PM2 logs
pm2 logs tkdn-backend
pm2 logs tkdn-frontend

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Application logs
tail -f /var/log/tkdn-backend-error.log
tail -f /var/log/tkdn-frontend-out.log
```

### Restart Services

```bash
# Restart backend
pm2 restart tkdn-backend

# Restart frontend
pm2 restart tkdn-frontend

# Restart all
pm2 restart all

# Restart Nginx
sudo systemctl restart nginx
```

### Update Application

```bash
cd /var/www/tkdn-evaluator

# Pull latest code
git pull origin main

# Install dependencies
npm install
cd backend && npm install && cd ..

# Rebuild frontend
npm run build

# Restart services
pm2 restart all
```

### Database Backup

```bash
# Manual backup
pg_dump -U bmkg_admin bmkg_p3dn > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
psql -U bmkg_admin bmkg_p3dn < backup_20260206_120000.sql

# Setup automatic daily backup (crontab)
0 2 * * * pg_dump -U bmkg_admin bmkg_p3dn > /backups/bmkg_p3dn_$(date +\%Y\%m\%d).sql
```

## 📦 File Yang Perlu Dikirim ke BMKG

### 1. Source Code

```bash
# Buat archive tanpa node_modules dan .env
tar -czf tkdn-evaluator.tar.gz \
  --exclude=node_modules \
  --exclude=.next \
  --exclude=.env \
  --exclude=.env.local \
  --exclude=.git \
  tkdn-evaluator/
```

### 2. Database Files

- `backend/migrations/001_create_tables.sql`
- `backend/migrations/002_create_users_table.sql`

### 3. Documentation

- `README.md` - Overview dan cara install
- `SERVER-GUIDE.md` - Panduan development
- `DEPLOYMENT-GUIDE.md` - Panduan deployment (file ini)
- `.env.example` - Template environment variables

### 4. Configuration Files

- `ecosystem.config.js` - PM2 configuration
- `nginx.conf` (example) - Nginx configuration
- `package.json` - Dependencies list

## 🔐 Security Checklist Production

- [ ] **WAJIB ganti JWT_SECRET** dengan random string
- [ ] **WAJIB ganti password database** dari default
- [ ] **WAJIB ganti password admin user**
- [ ] Enable firewall (UFW):
  ```bash
  sudo ufw allow 22    # SSH
  sudo ufw allow 80    # HTTP
  sudo ufw allow 443   # HTTPS
  sudo ufw enable
  ```
- [ ] Rate limiting di backend (express-rate-limit)
- [ ] Input validation & sanitization
- [ ] SQL injection protection (sudah pakai parameterized queries ✅)
- [ ] XSS protection (React sudah handle ✅)
- [ ] HTTPS only di production
- [ ] Regular security updates
- [ ] Database backup schedule
- [ ] Monitor logs untuk suspicious activity

## 📞 Support & Contact

Untuk bantuan teknis deployment:

- Developer: Jonathan Alvarado
- Email: jonathan@bmkg.go.id
- Repository: [Link ke repository]

## 📝 Notes

- Default port: Backend=8000, Frontend=3000
- Database: PostgreSQL 14+
- Node.js: v18+ LTS
- PM2 untuk process management
- Nginx untuk reverse proxy
- Let's Encrypt untuk SSL
