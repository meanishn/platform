@echo off
REM Integration Test Script for Windows
REM This script tests the client-server integration

echo 🚀 Testing Client-Server Integration...

REM Check if server is running
echo 📡 Checking if server is running...
curl -s http://localhost:3000/api/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Server is running on http://localhost:3000
) else (
    echo ❌ Server is not running. Please start the server first:
    echo    cd server ^&^& npm run dev
    exit /b 1
)

REM Check if client can be built
echo 🔨 Testing client build...
cd client
npm run build >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Client builds successfully
) else (
    echo ❌ Client build failed
    exit /b 1
)

echo.
echo 🎉 Integration test completed successfully!
echo.
echo Next steps:
echo 1. Start the server: cd server ^&^& npm run dev
echo 2. Start the client: cd client ^&^& npm run dev
echo 3. Test authentication with demo credentials:
echo    - Admin: admin@example.com / password
echo    - Provider: provider@example.com / password
echo    - Customer: customer@example.com / password
echo.
echo 📚 See CLIENT_SERVER_INTEGRATION.md for more details
