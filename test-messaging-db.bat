@echo off
echo.
echo ========================================
echo Testing Admin Messaging Database Setup
echo ========================================
echo.

cd /d "%~dp0"

if not exist "node_modules" (
    echo ERROR: node_modules not found!
    echo Please run: npm install
    echo.
    pause
    exit /b 1
)

node scripts/test-admin-messages-db.js

echo.
pause
