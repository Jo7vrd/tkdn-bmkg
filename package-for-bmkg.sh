#!/bin/bash

# Script untuk packaging project TKDN Evaluator sebelum kirim ke BMKG
# Usage: ./package-for-bmkg.sh

echo "📦 Packaging TKDN Evaluator untuk BMKG..."

# 1. Bersihkan file-file temporary
echo "🧹 Membersihkan file temporary..."
rm -rf node_modules .next backend/node_modules
rm -f .env .env.local backend/.env
rm -rf .DS_Store

# 2. Buat folder package
PACKAGE_NAME="tkdn-evaluator-$(date +%Y%m%d)"
PACKAGE_DIR="/tmp/$PACKAGE_NAME"

echo "📁 Membuat package di $PACKAGE_DIR..."
mkdir -p "$PACKAGE_DIR"

# 3. Copy files yang diperlukan
echo "📋 Copying files..."
rsync -av \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='.env' \
  --exclude='.env.local' \
  --exclude='.DS_Store' \
  --exclude='*.log' \
  --exclude='/tmp' \
  . "$PACKAGE_DIR/"

# 4. Buat archive
echo "🗜️  Membuat archive..."
cd /tmp
tar -czf "$PACKAGE_NAME.tar.gz" "$PACKAGE_NAME"

# 5. Cleanup
rm -rf "$PACKAGE_DIR"

echo ""
echo "✅ SELESAI!"
echo ""
echo "📦 Package tersimpan di: /tmp/$PACKAGE_NAME.tar.gz"
echo "📏 Ukuran: $(du -h /tmp/$PACKAGE_NAME.tar.gz | cut -f1)"
echo ""
echo "📤 Langkah selanjutnya:"
echo "1. Copy file ke USB/upload ke server BMKG"
echo "2. Ekstrak: tar -xzf $PACKAGE_NAME.tar.gz"
echo "3. Ikuti panduan di DEPLOYMENT-GUIDE.md"
echo ""
echo "⚠️  PENTING:"
echo "- Setup .env di server BMKG (gunakan .env.example sebagai template)"
echo "- Ganti JWT_SECRET dengan random string yang aman"
echo "- Ganti password database dan admin user"
echo ""
