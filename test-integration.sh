#!/bin/bash

# Integration Test Script
# This script tests the client-server integration

echo "🚀 Testing Client-Server Integration..."

# Check if server is running
echo "📡 Checking if server is running..."
if curl -s http://localhost:3000/api/health > /dev/null; then
    echo "✅ Server is running on http://localhost:3000"
else
    echo "❌ Server is not running. Please start the server first:"
    echo "   cd server && npm run dev"
    exit 1
fi

# Check if client can be built
echo "🔨 Testing client build..."
cd client
if npm run build > /dev/null 2>&1; then
    echo "✅ Client builds successfully"
else
    echo "❌ Client build failed"
    exit 1
fi

echo ""
echo "🎉 Integration test completed successfully!"
echo ""
echo "Next steps:"
echo "1. Start the server: cd server && npm run dev"
echo "2. Start the client: cd client && npm run dev"
echo "3. Test authentication with demo credentials:"
echo "   - Admin: admin@example.com / password"
echo "   - Provider: provider@example.com / password"
echo "   - Customer: customer@example.com / password"
echo ""
echo "📚 See CLIENT_SERVER_INTEGRATION.md for more details"
