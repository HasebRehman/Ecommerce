@echo off
echo ========================================
echo   Production Deployment Script
echo ========================================
echo.

echo [1/4] Cleaning previous build...
if exist .next rmdir /s /q .next
if exist out rmdir /s /q out
echo ✓ Clean complete
echo.

echo [2/4] Installing dependencies...
call npm install
echo ✓ Dependencies installed
echo.

echo [3/4] Building production bundle...
call npm run build
if %errorlevel% neq 0 (
    echo ✗ Build failed!
    exit /b %errorlevel%
)
echo ✓ Build complete
echo.

echo [4/4] Starting production server...
echo ✓ Ready to start with: npm run start
echo.
echo ========================================
echo   Deployment Complete!
echo ========================================
echo.
echo To start the server, run: npm run start
echo.
pause
