@echo off
REM Start Notifications Service
echo.
echo ╔══════════════════════════════════════════════════════════╗
echo ║    🔔 Starting Notifications Service                     ║
echo ║    Port: 3005                                            ║
echo ║    Database: auth_service (referentiels schema)          ║
echo ╚══════════════════════════════════════════════════════════╝
echo.

cd /d "%~dp0"
node server.js

pause
