@echo off
echo ========================================
echo   Quick Production Deploy
echo ========================================
echo.

echo Cleaning build cache...
if exist .next rmdir /s /q .next
echo.

echo Building production bundle...
call npm run build
echo.

if %errorlevel% equ 0 (
    echo ========================================
    echo   ✓ Build Successful!
    echo ========================================
    echo.
    echo Next steps:
    echo 1. Stop your current server if running
    echo 2. Run: npm run start
    echo 3. Tell users to hard refresh: Ctrl+Shift+R
    echo.
) else (
    echo ========================================
    echo   ✗ Build Failed!
    echo ========================================
    echo Check the errors above
    echo.
)

pause
