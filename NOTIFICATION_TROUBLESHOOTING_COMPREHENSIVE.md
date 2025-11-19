# 🔧 Notifications Not Working - Comprehensive Troubleshooting

## Issue Summary
- Notifications fetching works (user sees empty bell) ✅
- Notifications NOT being created when actions occur ❌
  - Password change ❌
  - Event creation ❌
  - Event registration ❌

## Root Cause Analysis

### Possible Issues:
1. **Auth Service Not Calling NotificationClient** - The updateuser endpoint might not be triggering notification
2. **Events Service Not Calling NotificationClient** - createEvent/joinEvent might not be triggering notification
3. **NotificationClient.send() Failing** - The HTTP call to webhook might be failing silently
4. **Webhook Endpoint Issue** - The `/api/webhooks/event` endpoint might not be processing correctly
5. **Notification Service Not Running** - Service might have crashed or not started
6. **Database Issue** - Notifications table might have issues

## Step-by-Step Debugging

### Step 1: Verify Notification Service is Running
```powershell
# Test health endpoint
Invoke-RestMethod -Uri "http://localhost:3005/health" -Method Get

# Expected response:
# {
#   "status": "Notifications service is running",
#   "timestamp": "2024-11-19T12:34:56.789Z"
# }
```

### Step 2: Test Webhook Endpoint Directly
```powershell
$body = @{
  recipient_id = 21
  type = "password_changed"
  title = "🔐 Password Changed"
  content = "Your password was changed"
  priority = "high"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3005/api/webhooks/event" `
  -Method Post `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body

Write-Host $response
```

Expected response:
```
status  notification
------  ------------
created @{id=123; recipient_id=21; type=password_changed;...}
```

### Step 3: Verify Notification Was Created
```powershell
$notifs = Invoke-RestMethod -Uri "http://localhost:3005/api/notifications?user_id=21" -Method Get

Write-Host "Total notifications: $($notifs.total)"
Write-Host $notifs.notifications
```

### Step 4: Check Auth Service Logs
1. Look for these log messages in Auth Service:
   - `✅ Notification sent to user X` - Notification was created
   - `⚠️ Could not send password change notification:` - Notification failed
   - `📢 Send notification if password was changed` - Flow reached

2. If NOT seeing these, password endpoint was called but notification code wasn't triggered

### Step 5: Check Events Service Logs
1. Look for these log messages in Events Service:
   - `✅ Notification sent to user X` - Notification was created
   - `⚠️ Could not send event creation notifications:` - Notification failed
   - `⚠️ Could not send event creation notifications:` - Flow reached

2. If NOT seeing these, event endpoints were called but notification code wasn't triggered

### Step 6: Test Backend Endpoints Directly

#### Test Password Change:
```powershell
$body = @{
  nom = "Test"
  prenom = "User"
  email = "test@test.com"
  password = "NewPassword123"
  role = "etudiant"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:4000/auth/updateuser/21" `
  -Method Put `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body

Write-Host $response
```

Check Auth Service logs for notification attempt

#### Test Event Creation:
```powershell
$body = @{
  title = "Test Event"
  type = "workshop"
  visibility = "public"
  start_date = "2024-12-20T10:00:00"
  end_date = "2024-12-20T12:00:00"
  departement_id = 1
  created_by = 1
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3001/events" `
  -Method Post `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body

Write-Host $response
```

Check Events Service logs for notification attempt

#### Test Event Registration:
```powershell
$body = @{
  student_id = 21
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3001/events/1/join" `
  -Method Post `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body

Write-Host $response
```

Check Events Service logs for notification attempt

## Common Issues & Solutions

### Issue: Notification Service Shows "EADDRINUSE: address already in use :::3005"
**Solution:**
```powershell
# Find process using port 3005
netstat -ano | findstr :3005

# Kill the process (replace XXXX with PID)
Stop-Process -Id XXXX -Force

# Restart the service
cd "c:\Users\aymen\Desktop\learflow (1)\Learnflow\backend\Service de Notifications"
npm start
```

### Issue: Auth Service Not Importing NotificationClient
**Check:**
1. Open `backend/auth-service/routes/authRoutes.js`
2. Look for line 15: `const NotificationClient = require("../../Service de Notifications/services/NotificationClient");`
3. If missing, add it

### Issue: Events Service Not Importing NotificationClient
**Check:**
1. Open `backend/Gestion des Événements/controllers/eventsController.js`
2. Look for line 4: `const NotificationClient = require('../../Service de Notifications/services/NotificationClient');`
3. If missing, add it

### Issue: Webhook Endpoint Not Found (404)
**Check:**
1. Notification Service server.js should register webhooks at `/api/webhooks`
2. The webhook route should handle `/event` POST requests
3. Restart Notification Service if you made changes

## Verification Checklist

- [ ] Notification Service running and healthy (http://localhost:3005/health returns 200)
- [ ] Can send test notification to webhook endpoint
- [ ] Test notification appears in notifications list
- [ ] Auth Service has NotificationClient import
- [ ] Events Service has NotificationClient import
- [ ] Calling password change endpoint triggers notification in logs
- [ ] Calling event creation triggers notification in logs
- [ ] Calling event registration triggers notification in logs
- [ ] Frontend fetches and displays notifications

## Service Dependencies

```
Frontend (port 5173)
    ↓
Auth Service (port 4000) ← NotificationClient → Notification Service (port 3005)
    ↓
Events Service (port 3001) ← NotificationClient → Notification Service (port 3005)
    ↓
Database (PostgreSQL) ← Notifications tables (referentiels schema)
```

All services must be running for full notification flow to work.

