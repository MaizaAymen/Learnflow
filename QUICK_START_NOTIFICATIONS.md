# 🚀 Quick Start - Get Notifications Working Now

## TL;DR - What to Do

### 1. Kill All Node Processes
```powershell
Get-Process node | Stop-Process -Force
Start-Sleep 2
```

### 2. Start All Services (in separate terminals)

**Terminal 1 - Notification Service:**
```powershell
cd "c:\Users\aymen\Desktop\learflow (1)\Learnflow\backend\Service de Notifications"
npm start
# Wait for: 🔔 Notifications Service Started Successfully
```

**Terminal 2 - Auth Service:**
```powershell
cd "c:\Users\aymen\Desktop\learflow (1)\Learnflow\backend\auth-service"
npm start
# Wait for: Auth Service running on port 4000
```

**Terminal 3 - Events Service:**
```powershell
cd "c:\Users\aymen\Desktop\learflow (1)\Learnflow\backend\Gestion des Événements"
npm start
# Wait for: Server running on port 3001
```

**Terminal 4 - Frontend:**
```powershell
cd "c:\Users\aymen\Desktop\learflow (1)\Learnflow\frontend\learnflow"
npm run dev
# Wait for: ➜ Local: http://localhost:5173
```

### 3. Test in Browser

1. Open http://localhost:5173
2. Login
3. Open DevTools (F12) → Console
4. Look for: `📥 Fetching notifications for user 21`
5. Change password or create/join event
6. Check bell icon 🔔 for new notification

---

## What Was Fixed

### ❌ Before
- User ID not being sent to backend → Wrong user's notifications fetched
- Webhook endpoint for direct notifications didn't exist → Notifications failing silently

### ✅ After
- User ID now extracted from localStorage and sent with every API call
- New webhook endpoint `/api/webhooks/event` handles direct notifications from Auth & Events services
- Notifications now sent when: password changes, events created, students register

---

## Expected Notifications

| Trigger | Type | Message |
|---------|------|---------|
| Password change | password_changed | 🔐 Password Changed |
| Event created | event_created | 📅 New Event Created |
| Joined event | event_registered | ✅ Successfully Registered |
| Creator sees registration | event_registered | 👤 New Registration |
| Left event | event_unregistration | 🚪 Left Event |
| Creator sees unregistration | event_unregistration | 👤 Unregistered |

---

## Verify It Works

### Quick Test
```powershell
# Test webhook directly
$body = @{recipient_id=21; type="test"; title="Test"; content="Test"} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3005/api/webhooks/event" -Method Post `
  -Headers @{"Content-Type"="application/json"} -Body $body

# Check if created
Invoke-RestMethod -Uri "http://localhost:3005/api/notifications?user_id=21" -Method Get
```

Expected: Should show created notification

---

## Backend Logs to Watch

### ✅ Good Signs
- Auth Service: `✅ Notification sent to user 21`
- Events Service: `✅ Notification sent to user 2`
- Notification Service: `✅ Notification created for user 21`

### ❌ Bad Signs
- `❌ Error sending notification`
- `⚠️ Could not send`
- `404 Not Found`

---

## Common Issues

| Issue | Fix |
|-------|-----|
| Port already in use | `Get-Process node \| Stop-Process -Force` |
| No notifications in bell | Hard refresh: `Ctrl+Shift+R` |
| Empty notification list | Check user_id: `JSON.parse(localStorage.getItem('user'))` in DevTools |
| Notifications not appearing | Restart all services, then clear localStorage |
| Backend errors | Check if PostgreSQL is running |

---

## File Changes Summary

- ✅ `frontend/learnflow/src/services/NotificationAPI.js` - Added user_id to all calls
- ✅ `backend/Service de Notifications/routes/webhooks.js` - Added `/event` endpoint
- ✅ `backend/auth-service/routes/authRoutes.js` - Already sending password notifications
- ✅ `backend/Gestion des Événements/controllers/eventsController.js` - Already sending event notifications

---

**All fixes applied. Just restart the services and test!** 🎉

