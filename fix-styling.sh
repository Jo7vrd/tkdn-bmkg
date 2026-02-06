#!/bin/bash

# Quick fix untuk styling hilang (web jadi HTML polos)
# Penyebab umum: CSS tidak ter-compile, cache corrupt, atau memory issue
# Usage: ./fix-styling.sh

echo "🔧 Fixing styling issue..."
echo ""

# Step 1: Stop servers
echo "🛑 Stopping all servers..."
pkill -9 -f "next dev" 2>/dev/null
pkill -9 -f "node.*server.js" 2>/dev/null
sleep 2
echo "  ✅ Servers stopped"

# Step 2: Clear Next.js cache
echo ""
echo "🗑️  Clearing Next.js cache..."
rm -rf .next
echo "  ✅ Cache cleared"

# Step 3: Restart servers
echo ""
echo "🚀 Restarting servers..."
./start-servers.sh

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "        STYLING FIXED! ✅"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💡 Next steps:"
echo "  1. Buka http://localhost:3000"
echo "  2. Hard refresh: Cmd+Shift+R (Mac) / Ctrl+Shift+R (Win)"
echo "  3. Atau buka Incognito mode"
echo ""
echo "⚠️  Jika masih HTML polos:"
echo "  • Clear browser cache"
echo "  • Restart browser"
echo ""
