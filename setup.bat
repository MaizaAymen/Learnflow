@echo off
REM Quick setup script for Learnflow deployment (Windows)

setlocal enabledelayedexpansion
set "ERRORLEVEL=0"

echo.
echo ================================================
echo    LEARNFLOW DEPLOYMENT QUICK SETUP
echo ================================================
echo.

REM Check prerequisites
echo [1/5] Checking prerequisites...
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Node.js is required. Please install it first.
    exit /b 1
)
where npm >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo npm is required. Please install it first.
    exit /b 1
)
echo [OK] Node.js and npm found
echo.

REM Install root dependencies
echo [2/5] Installing root dependencies...
call npm install
if %ERRORLEVEL% neq 0 (
    echo Failed to install root dependencies
    exit /b 1
)
echo [OK] Root dependencies installed
echo.

REM Install frontend dependencies
echo [3/5] Installing frontend dependencies...
cd frontend\learnflow
call npm install
if %ERRORLEVEL% neq 0 (
    echo Failed to install frontend dependencies
    cd ..\..
    exit /b 1
)
cd ..\..
echo [OK] Frontend dependencies installed
echo.

REM Create environment files
echo [4/5] Setting up environment variables...

if not exist ".env.local" (
    echo Creating .env.local from .env.example...
    copy .env.example .env.local
    echo [WARNING] Please update .env.local with your actual credentials
) else (
    echo [OK] .env.local already exists
)

if not exist "frontend\learnflow\.env.local" (
    echo Creating frontend\.env.local from .env.example...
    copy frontend\learnflow\.env.example frontend\learnflow\.env.local
    echo [WARNING] Please update frontend\.env.local with your API URL
) else (
    echo [OK] frontend\.env.local already exists
)

echo.

REM Verify Vercel files
echo [5/5] Verifying Vercel configuration...
if exist "vercel.json" (
    echo [OK] vercel.json found
) else (
    echo [WARNING] vercel.json not found
)

if exist "frontend\learnflow\vercel.json" (
    echo [OK] frontend\learnflow\vercel.json found
) else (
    echo [WARNING] frontend\learnflow\vercel.json not found
)

echo.
echo ================================================
echo Setup Complete!
echo ================================================
echo.
echo Next steps:
echo 1. Update .env.local with your database URL
echo 2. Update frontend\.env.local with your API URL
echo 3. Run 'vercel login' to authenticate
echo 4. Run 'vercel --prod' to deploy
echo.
echo For detailed instructions, see DEPLOYMENT_GUIDE.md
echo.
