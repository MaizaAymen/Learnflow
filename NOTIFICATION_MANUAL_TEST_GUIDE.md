# ✅ Manual Testing - Step-by-Step Guide

## Prerequisites
All three services must be running:
1. **Notification Service** - Port 3005
2. **Auth Service** - Port 4000
3. **Events Service** - Port 3001

## Critical Fix Applied

I've added a missing webhook endpoint to the Notification Service:
- **Old:** NotificationClient was sending to `/api/webhooks/event` but route didn't exist
- **New:** Added `/api/webhooks/event` route to handle direct notifications

**File Modified:** `backend/Service de Notifications/routes/webhooks.js`

---

## Manual Setup - Do This First

### 1. Stop All Node Services
```powershell
# Kill all Node processes
Get-Process node | Stop-Process -Force
Start-Sleep 3
```

### 2. Restart Services in Order

#### Terminal 1: Notification Service
```powershell
cd "c:\Users\aymen\Desktop\learflow (1)\Learnflow\backend\Service de Notifications"
npm start

# Watch for this message:
# ✅ Notifications Service Started Successfully
# 📍 Server running on port: 3005
```

#### Terminal 2: Auth Service
```powershell
cd "c:\Users\aymen\Desktop\learflow (1)\Learnflow\backend\auth-service"
npm start

# Watch for this message:
# ✅ Auth Service running on port 4000
```

#### Terminal 3: Events Service
```powershell
cd "c:\Users\aymen\Desktop\learflow (1)\Learnflow\backend\Gestion des Événements"
npm start

# Watch for this message:
# Server running on port 3001
```

#### Terminal 4: Frontend
```powershell
cd "c:\Users\aymen\Desktop\learflow (1)\Learnflow\frontend\learnflow"
npm run dev

# Watch for this message:
# ➜  Local:   http://localhost:5173
```

---

## Test 1: Direct Webhook Test

### Send Test Notification to Webhook
```powershell
# In a new terminal, send test notification
$body = @{
  recipient_id = 21
  type = "password_changed"
  title = "🔐 Test Password Change"
  content = "This is a test notification"
  priority = "high"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3005/api/webhooks/event" `
  -Method Post `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body

Write-Host "Response:"
$response | ConvertTo-Json -Depth 5
```

### Expected Output
```
status  notification
------  --------
created {id, recipient_id, type, title, content, ...}
```

### Check Notification Service Logs (Terminal 1)
Look for:
```
📨 Received direct notification webhook: {
  type: password_changed,
  recipient_id: 21,
  recipients_count: null
}
✅ Notification created for user 21
Executing (default): INSERT INTO "referentiels"."notifications"...
```

### Verify in Frontend
1. Open http://localhost:5173
2. Login as user ID 21
3. Click bell icon 🔔
4. Should see "🔐 Test Password Change" notification

If this works → **Webhook endpoint is working! ✅**

---

## Test 2: Password Change Notification

### Trigger Password Change
```powershell
# Change password for user 21
$body = @{
  nom = "Ahmed"
  prenom = "Ali"
  email = "ahmed@example.com"
  password = "NewPassword123"
  role = "etudiant"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:4000/auth/updateuser/21" `
  -Method Put `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body

Write-Host $response
```

### Check Auth Service Logs (Terminal 2)
Look for:
```
PUT /updateuser/21
✅ Notification sent to user 21
```

### Check Notification Service Logs (Terminal 1)
Look for:
```
📨 Received direct notification webhook: {type: password_changed, recipient_id: 21}
✅ Notification created for user 21
```

### Verify in Frontend
1. Refresh page or wait 30 seconds for auto-refresh
2. New notification should appear: "🔐 Password Changed"

---

## Test 3: Event Creation Notification

### Create an Event
```powershell
$body = @{
  title = "Advanced React Workshop"
  type = "workshop"
  visibility = "public"
  description = "Learn React patterns"
  start_date = "2024-12-20T10:00:00"
  end_date = "2024-12-20T12:00:00"
  departement_id = 1
  created_by = 1
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3001/events" `
  -Method Post `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body

$eventId = $response.id
Write-Host "Event created with ID: $eventId"
```

### Check Events Service Logs (Terminal 3)
Look for:
```
✅ Notification sent to user 2
✅ Notification sent to user 3
✅ Notification sent to user 4
... (for all students in department)
```

### Check Notification Service Logs (Terminal 1)
Look for multiple:
```
📨 Received direct notification webhook: {type: event_created, recipient_id: 2}
✅ Notification created for user 2
...
```

### Verify in Frontend (as Student)
1. Login as a student from department 1
2. Check bell icon 🔔
3. Should see "📅 New Event Created" notification

---

## Test 4: Event Registration Notification

### Join Event
```powershell
# Note: Replace 1 with the event ID from Test 3
$body = @{
  student_id = 21
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3001/events/1/join" `
  -Method Post `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body

Write-Host $response
```

### Check Events Service Logs (Terminal 3)
Look for:
```
✅ Notification sent to user 21 (student)
✅ Notification sent to user 1 (creator)
```

### Check Notification Service Logs (Terminal 1)
Look for:
```
📨 Received direct notification webhook: {recipient_id: 21, type: event_registered}
✅ Notification created for user 21
📨 Received direct notification webhook: {recipient_id: 1, type: event_registered}
✅ Notification created for user 1
```

### Verify in Frontend
**As Student (ID 21):**
1. Check bell icon 🔔
2. Should see: "✅ Successfully Registered"

**As Event Creator (ID 1):**
1. Check bell icon 🔔
2. Should see: "👤 New Registration - Student 21 has registered..."

---

## Troubleshooting

### Issue: Webhook Returns 400 Bad Request
**Problem:** Missing required fields
**Solution:** 
```powershell
# Must include recipient_id or recipient_ids
# Must include type, title, content
$body = @{
  recipient_id = 21             # ← REQUIRED
  type = "password_changed"     # ← REQUIRED
  title = "Test"                 # ← REQUIRED
  content = "Test content"       # ← REQUIRED
  priority = "high"             # Optional, defaults to 'medium'
} | ConvertTo-Json
```

### Issue: Webhook Returns 500 Error
**Problem:** Database error or service error
**Check:**
1. Notification Service logs for error message
2. Verify PostgreSQL is running
3. Check if referentiels schema exists: `SELECT schema_name FROM information_schema.schemata WHERE schema_name='referentiels';`

### Issue: Notifications Not Appearing in Frontend
**Check:**
1. Open DevTools (F12) → Console
2. Look for: `📥 Fetching notifications for user 21`
3. If not seeing that, check:
   - Is auto-refresh running? (should see every 30 seconds)
   - Check localStorage: `JSON.parse(localStorage.getItem('user'))`
   - Verify user_id is being sent to API

### Issue: Notifications Created in DB but Not in Frontend
**Check:**
1. Run query directly: `Invoke-RestMethod -Uri "http://localhost:3005/api/notifications?user_id=21" -Method Get`
2. If notifications returned but not in UI:
   - Hard refresh browser: Ctrl+Shift+R
   - Clear localStorage: DevTools → Application → Clear all
   - Check for JavaScript errors in DevTools console

### Issue: Services Not Starting
**Check:**
1. Is port already in use?
   ```powershell
   netstat -ano | findstr :3005  # For Notification Service
   netstat -ano | findstr :4000  # For Auth Service
   netstat -ano | findstr :3001  # For Events Service
   ```
2. Kill existing process:
   ```powershell
   Stop-Process -Id XXXX -Force  # Replace XXXX with PID
   ```
3. Check for errors:
   ```powershell
   npm start 2>&1 | Select-Object -First 50  # Show first 50 lines
   ```

---

## Success Indicators

✅ **All tests passing when:**

1. Webhook endpoint returns created notification
2. Auth Service logs show notification being sent on password change
3. Events Service logs show notifications being sent on event creation/registration
4. Notification Service logs show webhooks being received
5. Frontend displays notifications in bell after each action
6. Auto-refresh happens every 30 seconds (check DevTools console)
7. Notifications persist after page refresh
8. User can mark as read, delete, and manage preferences

---

## Quick Command Summary

```powershell
# Stop all services
Get-Process node | Stop-Process -Force; Start-Sleep 2

# Start Notification Service
cd "c:\Users\aymen\Desktop\learflow (1)\Learnflow\backend\Service de Notifications"; npm start

# Start Auth Service
cd "c:\Users\aymen\Desktop\learflow (1)\Learnflow\backend\auth-service"; npm start

# Start Events Service
cd "c:\Users\aymen\Desktop\learflow (1)\Learnflow\backend\Gestion des Événements"; npm start

# Start Frontend
cd "c:\Users\aymen\Desktop\learflow (1)\Learnflow\frontend\learnflow"; npm run dev

# Test webhook
$body = @{recipient_id = 21; type = "password_changed"; title = "Test"; content = "Test"} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3005/api/webhooks/event" -Method Post -Headers @{"Content-Type"="application/json"} -Body $body

# Check notifications
Invoke-RestMethod -Uri "http://localhost:3005/api/notifications?user_id=21" -Method Get
```

---

**Run these tests and report back which ones fail. This will help identify exactly where the issue is!** 🎯

