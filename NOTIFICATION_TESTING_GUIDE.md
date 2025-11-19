# 🧪 Quick Test Guide - Notification Integration

## Prerequisites
- All services running (Backend Auth, Events, Notifications, Frontend)
- Postman or PowerShell for API testing
- Browser DevTools (F12) for monitoring

---

## Test 1: Password Change Notification ✅

### Setup
- User ID: 1
- New password: `TestPassword123`

### Step 1: Send Password Change Request
```powershell
$body = @{
  nom = "Ahmed"
  prenom = "Ali"
  email = "ahmed@example.com"
  password = "TestPassword123"
  role = "etudiant"
  phone = "0123456789"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:4000/auth/updateuser/1" `
  -Method Put `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body

# Should return: {"message": "Utilisateur mis à jour avec succès"}
```

### Step 2: Check Notification Backend Log
```
Look for in Auth Service terminal:
✅ Notification sent to user 1
```

### Step 3: Check Frontend
1. Open http://localhost:5173
2. Click notification bell (🔔)
3. Should see: "🔐 Password Changed" notification
4. Badge should show count increased by 1

---

## Test 2: Event Creation Notification ✅

### Setup
- Department ID: 1
- Creator ID: 1

### Step 1: Create New Event
```powershell
$event = @{
  title = "Advanced React Workshop"
  type = "workshop"
  visibility = "public"
  description = "Learn advanced React patterns and best practices"
  start_date = "2024-12-20T10:00:00"
  end_date = "2024-12-20T12:00:00"
  is_all_day = $false
  departement_id = 1
  created_by = 1
  metadata = @{
    location = "Room 101"
    capacity = 30
  }
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/events" `
  -Method Post `
  -Headers @{"Content-Type"="application/json"} `
  -Body $event

# Note the returned event ID (e.g., "1")
```

### Step 2: Check Backend Log
```
Look for in Events Service terminal:
✅ Notification sent to user ...
(repeated for all students in department)
```

### Step 3: Switch to Student Account
1. In browser, logout current user
2. Login as a student from department 1
3. Check notification bell
4. Should see: "📅 New Event Created" notification

---

## Test 3: Event Registration Notification ✅

### Setup
- Use event ID from Test 2
- Student ID: 5

### Step 1: Student Joins Event
```powershell
$join = @{
  student_id = 5
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/events/1/join" `
  -Method Post `
  -Headers @{"Content-Type"="application/json"} `
  -Body $join

# Should return registration object
```

### Step 2: Check Backend Log
```
Look for:
✅ Notification sent to user 5
✅ Notification sent to user 1 (creator)
```

### Step 3: Check Student Notification (User 5)
1. Open browser as Student 5
2. Click notification bell
3. Should see: "✅ Successfully Registered"
4. Message: "You have been registered for the event..."

### Step 4: Check Creator Notification (User 1)
1. Open browser as User 1
2. Click notification bell  
3. Should see: "👤 New Registration"
4. Message: "Student ... has registered for... Total registrations: 1"

---

## Test 4: Event Unregistration Notification ✅

### Setup
- Use same event and student from Test 3

### Step 1: Student Leaves Event
```powershell
$leave = @{
  student_id = 5
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/events/1/leave" `
  -Method Post `
  -Headers @{"Content-Type"="application/json"} `
  -Body $leave

# Should return: {"success": true}
```

### Step 2: Check Backend Log
```
Look for:
✅ Notification sent to user 5
✅ Notification sent to user 1 (creator)
```

### Step 3: Check Student Notification (User 5)
1. Refresh browser
2. Click notification bell
3. Should see: "🚪 Left Event"
4. Message: "You have unregistered from..."

### Step 4: Check Creator Notification (User 1)
1. Click notification bell
2. Should see: "👤 Unregistered"
3. Message: "... has unregistered from... Remaining registrations: 0"

---

## Test 5: Auto-Refresh Verification ✅

### Step 1: Open Frontend DevTools
1. Open http://localhost:5173
2. Press F12 (DevTools)
3. Go to Console tab

### Step 2: Monitor Auto-Refresh
1. Watch console for every 30 seconds:
```
📥 Fetching notifications for user 1
✅ Notification updated
```

2. Or look for:
```
[30s] → [60s] → [90s] auto-refresh happening
```

### Step 3: Create Notification & Watch
1. Run Test 1 (Password change)
2. Within 30 seconds, auto-refresh fires
3. New notification appears in bell without page refresh

---

## Test 6: Notification Bell UI ✅

### Step 1: Check Bell Display
1. Open http://localhost:5173
2. Top-right corner should show bell icon 🔔
3. Badge shows unread count

### Step 2: Check Unread Count
```powershell
# Get current unread count
Invoke-RestMethod -Uri "http://localhost:3005/api/notifications/unread/count?user_id=1" `
  -Method Get `
  -Headers @{"Content-Type"="application/json"}

# Should return: {"unread_count": X}
```

### Step 3: Click Bell
1. Click notification bell
2. Dropdown shows recent notifications
3. Each notification has:
   - Icon/emoji
   - Title
   - Message
   - Delete button (X)
   - Unread indicator (dot)

### Step 4: Mark as Read
1. Click notification (or Mark all read button)
2. Badge count should decrease
3. Dot indicator should disappear

---

## Test 7: Preferences Management ✅

### Step 1: Open Preferences
1. Click bell icon
2. Click "Preferences" tab (or navigate to /notifications)
3. Should see 9 toggle switches:
   - event_created
   - event_registered
   - absence_registered
   - elimination_risk
   - schedule_changed
   - message_received
   - document_published
   - announcement_published
   - account_created

### Step 2: Toggle Notification Type
1. Click toggle for "event_created"
2. Should see update message
3. Should persist after page refresh

### Step 3: Set Quiet Hours
1. Scroll to "Quiet Hours" section
2. Set start time: 22:00
3. Set end time: 08:00
4. Should save and persist

---

## Test 8: API Endpoints ✅

### Get All Notifications
```powershell
Invoke-RestMethod -Uri "http://localhost:3005/api/notifications?user_id=1&page=1&limit=10" `
  -Method Get `
  -Headers @{"Content-Type"="application/json"}
```

### Get Unread Count
```powershell
Invoke-RestMethod -Uri "http://localhost:3005/api/notifications/unread/count?user_id=1" `
  -Method Get
```

### Mark as Read
```powershell
Invoke-RestMethod -Uri "http://localhost:3005/api/notifications/1/read?user_id=1" `
  -Method Put
```

### Mark All as Read
```powershell
Invoke-RestMethod -Uri "http://localhost:3005/api/notifications/mark-all-read?user_id=1" `
  -Method Put
```

### Delete Notification
```powershell
Invoke-RestMethod -Uri "http://localhost:3005/api/notifications/1?user_id=1" `
  -Method Delete
```

### Batch Delete
```powershell
$batch = @{
  notificationIds = @(1, 2, 3)
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3005/api/notifications/batch?user_id=1" `
  -Method Delete `
  -Headers @{"Content-Type"="application/json"} `
  -Body $batch
```

---

## Troubleshooting

### Notifications Not Appearing
1. ✅ Check backend logs for "✅ Notification sent"
2. ✅ Verify Notification Service is running (port 3005)
3. ✅ Clear browser cache (Ctrl+Shift+R)
4. ✅ Check user_id is correct

### Auto-refresh Not Working
1. ✅ Open DevTools (F12)
2. ✅ Look for "Fetching notifications" every 30s
3. ✅ Check Network tab for requests to /api/notifications
4. ✅ Verify no 401 errors

### Bell Not Updating
1. ✅ Manually refresh: F5
2. ✅ Hard refresh: Ctrl+Shift+R
3. ✅ Clear local storage: DevTools → Application → Clear all
4. ✅ Restart frontend: npm run dev

### Password Notification Not Sent
1. ✅ Verify Auth Service imported NotificationClient
2. ✅ Check for "Could not send notification" warning
3. ✅ Verify user_id in request is correct
4. ✅ Restart Auth Service

---

## Success Criteria

✅ All 4 test scenarios complete successfully
✅ Notifications appear in bell without page refresh
✅ Auto-refresh working (logs every 30s)
✅ Unread count accurate
✅ Preferences persist
✅ No errors in DevTools console
✅ All API endpoints return 200 OK

---

## Quick Command Summary

```powershell
# Test password change
Invoke-RestMethod -Uri "http://localhost:4000/auth/updateuser/1" -Method Put `
  -Headers @{"Content-Type"="application/json"} `
  -Body '{"nom":"Ahmed","prenom":"Ali","email":"a@a.com","password":"Test123","role":"etudiant"}'

# Create event
Invoke-RestMethod -Uri "http://localhost:3001/events" -Method Post `
  -Headers @{"Content-Type"="application/json"} `
  -Body '{"title":"Workshop","type":"workshop","visibility":"public","start_date":"2024-12-20T10:00:00","end_date":"2024-12-20T12:00:00","departement_id":1,"created_by":1}'

# Join event
Invoke-RestMethod -Uri "http://localhost:3001/events/1/join" -Method Post `
  -Headers @{"Content-Type"="application/json"} `
  -Body '{"student_id":5}'

# Leave event
Invoke-RestMethod -Uri "http://localhost:3001/events/1/leave" -Method Post `
  -Headers @{"Content-Type"="application/json"} `
  -Body '{"student_id":5}'

# Get notifications
Invoke-RestMethod -Uri "http://localhost:3005/api/notifications?user_id=1"

# Get unread count
Invoke-RestMethod -Uri "http://localhost:3005/api/notifications/unread/count?user_id=1"
```

---

**Expected Result:** All tests pass ✅ - Notifications working perfectly! 🎉
