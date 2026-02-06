#!/bin/bash

echo "🚀 Starting TKDN Evaluator"
echo "=========================="

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Check if backend is already running
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Backend already running on port 8000"
else
    echo "Starting backend on port 8000..."
    cd "$SCRIPT_DIR/backend"
    node server.js > /tmp/tkdn-backend.log 2>&1 &
    BACKEND_PID=$!
    echo "✅ Backend started (PID: $BACKEND_PID)"
    sleep 2
fi

# Check if frontend is already running
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Frontend already running on port 3000"
else
    echo "Starting frontend on port 3000..."
    cd "$SCRIPT_DIR"
    npm run dev > /tmp/tkdn-frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo "✅ Frontend started (PID: $FRONTEND_PID)"
    sleep 3
fi

echo ""
echo "=========================="
echo "✅ All services started!"
echo ""
echo "📝 Access the application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:8000"
echo ""
echo "🔐 Test login credentials:"
echo "   Email:    jonathan@bmkg.go.id"
echo "   Password: jonathan123"
echo ""
echo "📋 Logs:"
echo "   Backend:  tail -f /tmp/tkdn-backend.log"
echo "   Frontend: tail -f /tmp/tkdn-frontend.log"
echo ""
echo "🛑 To stop servers:"
echo "   pkill -f 'node server.js'"
echo "   pkill -f 'next dev'"
echo ""
