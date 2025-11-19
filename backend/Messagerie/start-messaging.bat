@echo off
REM Script de démarrage du service Messagerie

cd /d "%~dp0"

echo.
echo ╔══════════════════════════════════════════════════════════╗
echo ║     Démarrage du Service Messagerie Interne              ║
echo ║     Learnflow Platform - Internal Messaging Service      ║
echo ╚══════════════════════════════════════════════════════════╝
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installation des dépendances...
    call npm install
    echo.
)

REM Check if .env exists
if not exist ".env" (
    echo ⚠️  Fichier .env non trouvé!
    echo 📝 Créez un fichier .env avec vos configurations
    echo.
    pause
    exit /b 1
)

echo ✅ Démarrage du service sur le port 3001...
echo 🌐 URL: http://localhost:3001
echo 📡 WebSocket: ws://localhost:3001
echo.
echo ⏸️  Appuyez sur Ctrl+C pour arrêter
echo.

call npm start

pause
