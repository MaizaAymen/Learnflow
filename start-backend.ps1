# Start both backend servers
Write-Host "Starting Learnflow Backend Services..." -ForegroundColor Green

# Start Reference Service (Calendar API) on port 3000
Write-Host "`nStarting Reference Service (port 3000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'backend\Reference_documents'; node server.js"

# Wait a bit
Start-Sleep -Seconds 2

# Start Auth Service on port 5000
Write-Host "Starting Auth Service (port 5000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'backend\auth-service'; node server.js"

Write-Host "`n✅ Backend services started!" -ForegroundColor Green
Write-Host "Reference API: http://localhost:3000" -ForegroundColor Yellow
Write-Host "Auth API: http://localhost:5000" -ForegroundColor Yellow
Write-Host "`nPress any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
