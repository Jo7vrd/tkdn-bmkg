#!/bin/bash
# Script untuk menghentikan semua server TKDN Evaluator

echo "🛑 Menghentikan server..."

# Stop backend server (coba beberapa cara)
pkill -9 -f "node.*server.js" 2>/dev/null
pkill -9 -f "backend/server.js" 2>/dev/null

# Stop frontend server (coba beberapa cara)
pkill -9 -f "next dev" 2>/dev/null
pkill -9 -f "next-server" 2>/dev/null

# Kill by port jika masih ada
if lsof -i :8000 >/dev/null 2>&1; then
  lsof -ti :8000 | xargs kill -9 2>/dev/null
fi

if lsof -i :3000 >/dev/null 2>&1; then
  lsof -ti :3000 | xargs kill -9 2>/dev/null
fi

sleep 2

# Verifikasi server sudah berhenti
BACKEND_RUNNING=$(lsof -i :8000 2>/dev/null | grep LISTEN | wc -l)
FRONTEND_RUNNING=$(lsof -i :3000 2>/dev/null | grep LISTEN | wc -l)

if [ "$BACKEND_RUNNING" -eq 0 ] && [ "$FRONTEND_RUNNING" -eq 0 ]; then
  echo "✅ Semua server berhasil dihentikan"
  echo ""
  echo "📝 Untuk start lagi:"
  echo "   ./start-servers.sh"
else
  echo "⚠️  Ada server yang masih berjalan:"
  [ "$BACKEND_RUNNING" -gt 0 ] && echo "   - Backend masih di port 8000"
  [ "$FRONTEND_RUNNING" -gt 0 ] && echo "   - Frontend masih di port 3000"
  echo ""
  echo "💡 Coba manual: sudo lsof -ti :3000 :8000 | xargs kill -9"
fi
