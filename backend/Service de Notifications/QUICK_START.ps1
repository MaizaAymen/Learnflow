# 🚀 Quick Start Commands After Auth Fixes

## Prerequisites
- Node.js and npm installed
- PostgreSQL running with auth_service database
- All dependencies installed

## One-Command Restart (Quick)

### Option A: If services are already installed
```powershell
# Terminal 1: Notifications Service (Port 3005)
cd "backend\Service de Notifications"
npm start

# Terminal 2: Frontend (Port 5173)  
cd "frontend\learnflow"
npm run dev

# Terminal 3: Auth Service (Port 4000) - if needed
cd "backend\auth-service"
npm start
```

### Option B: Clean restart with dependencies
```powershell
# Terminal 1: Notifications Service
cd "backend\Service de Notifications"
rm node_modules -Force -Recurse
npm install
npm start

# Terminal 2: Frontend
cd "frontend\learnflow"
rm node_modules -Force -Recurse
npm install
npm run dev
```

## Verify Services Are Running

```powershell
# Check Health
$services = @(
    @{name="Auth Service"; url="http://localhost:4000/health"}
    @{name="Notifications Service"; url="http://localhost:3005/health"}
    @{name="Frontend"; url="http://localhost:5173"}
)

foreach ($service in $services) {
    Write-Host "Checking $($service.name)..." -ForegroundColor Cyan
    try {
        $response = Invoke-RestMethod -Uri $service.url -TimeoutSec 2
        Write-Host "✅ $($service.name) is running" -ForegroundColor Green
    } catch {
        Write-Host "❌ $($service.name) is NOT running" -ForegroundColor Red
    }
}
```

## Test Notification API Endpoints

```powershell
# Test GET /notifications
Write-Host "Testing GET /api/notifications..." -ForegroundColor Yellow
Invoke-RestMethod -Uri "http://localhost:3005/api/notifications?user_id=1" `
  -Headers @{"Content-Type"="application/json"} | ConvertTo-Json | Write-Host

# Test GET /unread/count
Write-Host "Testing GET /api/notifications/unread/count..." -ForegroundColor Yellow
Invoke-RestMethod -Uri "http://localhost:3005/api/notifications/unread/count?user_id=1" `
  -Headers @{"Content-Type"="application/json"} | ConvertTo-Json | Write-Host

# Test GET /preferences
Write-Host "Testing GET /api/preferences..." -ForegroundColor Yellow
Invoke-RestMethod -Uri "http://localhost:3005/api/preferences?user_id=1" `
  -Headers @{"Content-Type"="application/json"} | ConvertTo-Json | Write-Host

# Test POST /admin/test-notification (create test notification)
Write-Host "Creating test notification..." -ForegroundColor Yellow
$body = @{
    recipient_id = 1
    type = "event_created"
    title = "Test Notification"
    content = "This is a test to verify the service is working"
    priority = "medium"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3005/api/admin/test-notification" `
  -Method Post `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body | ConvertTo-Json | Write-Host
```

## Test Frontend Integration

```powershell
# 1. Open browser to frontend
Start-Process "http://localhost:5173"

# 2. In browser:
#    - Open DevTools (F12)
#    - Go to Console tab
#    - Check for any 401 errors (should be NONE)
#    - Look for logs starting with "📥" or "📊" or "📋"

# 3. Test features:
#    - Click notification bell in header
#    - Should show notification dropdown
#    - Count badge should show unread count
#    - Can mark notifications as read
#    - Can delete notifications
```

## Common Startup Issues & Solutions

### Issue: "Cannot find module 'express'"
```powershell
# Solution: Install dependencies
npm install
```

### Issue: "Port 3005 already in use"
```powershell
# Kill process using port 3005
$port = 3005
$process = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
if ($process) {
    Stop-Process -Id $process.OwningProcess -Force
    Write-Host "Killed process on port $port"
}
# Then restart npm start
```

### Issue: "Database connection failed"
```powershell
# Check PostgreSQL is running
# Connection string should be in backend/auth-service/config/database.js
# Verify auth_service database exists

# Test database connection
psql -U postgres -d auth_service -c "SELECT 1"
```

### Issue: "Still getting 401 errors in console"
```powershell
# 1. Stop all services (Ctrl+C in each terminal)
# 2. Verify middleware is in server.js
cat "backend\Service de Notifications\server.js" | Select-String "authenticateToken"
# Should show: const authenticateToken = require('./middleware/auth');
# And: app.use(authenticateToken);

# 3. Verify auth.js exists
Test-Path "backend\Service de Notifications\middleware\auth.js"
# Should return: True

# 4. Restart services:
npm start
```

### Issue: "Frontend still shows old errors after restart"
```powershell
# Hard refresh frontend cache
# Option 1: In browser DevTools - Clear Application → Clear all
# Option 2: Hard refresh - Ctrl+Shift+R
# Option 3: Delete node_modules and reinstall:
rm "frontend\learnflow\node_modules" -Force -Recurse
cd "frontend\learnflow"
npm install
npm run dev
```

## Environment Variables Check

### Backend Service
Verify `.env` file in `backend/Service de Notifications/`:
```
PORT=3005
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

### Auth Service (if needed)
Verify `.env` file in `backend/auth-service/`:
```
PORT=4000
DATABASE_URL=postgresql://user:password@localhost:5432/auth_service
NODE_ENV=development
```

## Performance Monitoring

```powershell
# Monitor process memory and CPU
$services = @("node")

Get-Process $services -ErrorAction SilentlyContinue | 
  ForEach-Object {
    Write-Host "$($_.Name) - PID: $($_.Id) - Memory: $([math]::Round($_.WorkingSet/1MB)) MB - CPU: $($_.CPU)s" -ForegroundColor Cyan
  }
```

## Logs & Debugging

### Capture Backend Logs
```powershell
# In backend terminal, you should see logs like:
# 📥 Fetching notifications for user 1
# 📊 Counting unread for user 1
# ✅ All Notifications models synced with DB

# If not seeing these, check:
# 1. npm start was executed (not npm run dev)
# 2. Service is actually running
# 3. Frontend is making requests to port 3005
```

### Enable Verbose Logging (Optional)
```powershell
# Add to server.js if needed:
# process.env.DEBUG = 'notifications:*'
# Then restart
```

## Reset & Clean Installation

If everything is broken:

```powershell
# 1. Stop all services (Ctrl+C)

# 2. Clean installations
rm "backend\Service de Notifications\node_modules" -Force -Recurse
rm "frontend\learnflow\node_modules" -Force -Recurse

# 3. Reinstall
cd "backend\Service de Notifications"
npm install

cd "..\..\..\frontend\learnflow"
npm install

# 4. Restart
# Terminal 1: Backend
cd "backend\Service de Notifications"
npm start

# Terminal 2: Frontend
cd "frontend\learnflow"
npm run dev
```

## Next Steps After Starting

1. ✅ Verify services started with no errors
2. ✅ Check frontend loads at http://localhost:5173
3. ✅ Check notification bell in header works
4. ✅ Open DevTools console - should see NO 401 errors
5. ✅ Test creating a notification via admin endpoint
6. ✅ Verify notification appears in UI

## Files Location Reference

```
learnflow/
├── backend/
│   ├── Service de Notifications/
│   │   ├── server.js ✓ (middleware added)
│   │   ├── middleware/auth.js ✓ (NEW)
│   │   ├── routes/notifications.js ✓ (updated)
│   │   ├── routes/preferences.js ✓ (updated)
│   │   └── package.json
│   └── auth-service/ (if needed)
└── frontend/
    └── learnflow/
        ├── src/
        │   ├── services/NotificationAPI.js ✓ (fixed)
        │   ├── hooks/useNotifications.jsx
        │   └── components/NotificationBell.jsx
        └── package.json
```

---

**Status:** Ready to start  
**Expected Duration:** 1-2 minutes to start all services  
**Next:** Run full test suite: `.\TEST_ENDPOINTS.ps1`  
