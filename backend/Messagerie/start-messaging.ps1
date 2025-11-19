#!/usr/bin/env pwsh

Write-Host "`n╔══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     Démarrage du Service Messagerie Interne              ║" -ForegroundColor Cyan
Write-Host "║     Learnflow Platform - Internal Messaging Service      ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

$MessagingDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Push-Location $MessagingDir

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installation des dépendances..." -ForegroundColor Yellow
    npm install
    Write-Host "`n"
}

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  Fichier .env non trouvé!" -ForegroundColor Red
    Write-Host "📝 Créez un fichier .env avec vos configurations`n" -ForegroundColor Yellow
    Read-Host "Appuyez sur Entrée pour continuer"
    exit 1
}

Write-Host "✅ Démarrage du service sur le port 3001..." -ForegroundColor Green
Write-Host "🌐 URL: http://localhost:3001" -ForegroundColor Green
Write-Host "📡 WebSocket: ws://localhost:3001" -ForegroundColor Green
Write-Host "`n⏸️  Appuyez sur Ctrl+C pour arrêter`n" -ForegroundColor Yellow

npm start

Pop-Location
