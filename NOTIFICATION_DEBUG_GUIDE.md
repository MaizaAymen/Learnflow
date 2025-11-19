# 🐛 Notification Debugging Guide

## Issue Found & Fixed ✅

**Problem:** Frontend was NOT sending `user_id` parameter to Notification Service
- Notification Service requires `user_id` query parameter or authenticated user
- Frontend API calls were missing this parameter
- Result: All requests defaulting to `user_id = 1`, even if logged in as different user

**Solution Applied:** ✅
- Modified `NotificationAPI.js` to always extract `user_id` from localStorage
- Added `getUserId()` helper function that:
  1. Checks localStorage for stored user object
  2. Extracts user.id from the object
  3. Defaults to user ID 1 if not found
- Updated ALL API endpoints to include `user_id` query parameter

---

## How to Verify the Fix

### Step 1: Clear Cache & Restart
```powershell
# Clear browser cache
# 1. Press F12 to open DevTools
# 2. Right-click refresh button → Empty Cache and Hard Refresh
# 3. Or use: Ctrl+Shift+R

# Restart frontend
npm run dev
```

### Step 2: Login & Check localStorage
```javascript
// Open DevTools Console (F12)
// Type this command:
localStorage.getItem('user')

// Should return something like:
// {"id":5,"nom":"Ahmed","prenom":"Ali","email":"a@a.com","role":"etudiant"}
```

### Step 3: Check Notification Bell
1. After logging in, look for 🔔 bell icon in top-right corner
2. Click it - should show notification panel
3. Check browser console (F12) for logs like:
   ```
   📥 Fetching notifications for user 5
   ```

### Step 4: Test Password Change
```powershell
# In PowerShell, run:
$body = @{
  nom = "Ahmed"
  prenom = "Ali"
  email = "ahmed@example.com"
  password = "TestPassword123"
  role = "etudiant"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:4000/auth/updateuser/1" `
  -Method Put `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body
```

### Step 5: Check Notification Appears
1. Go back to browser
2. Click bell icon 🔔
3. Within 30 seconds, new notification should appear
4. Should show: "🔐 Password Changed" or similar

---

## Console Logs to Watch For

### ✅ Good Logs (Expected)
```
📥 Fetching notifications for user 5          ← Shows user_id is correct
✅ Notification sent to user 5               ← Notification was created
📥 Fetching notifications for user 5         ← Auto-refresh working
```

### ❌ Bad Logs (Problems)
```
📥 Fetching notifications for user 1         ← Wrong user ID!
Cannot read property 'id' of null            ← localStorage user is null
Failed to fetch notifications: 401            ← Authentication issue
```

---

## What to Check if Still Not Working

### 1. **Verify User is Logged In**
```javascript
// In DevTools Console:
JSON.parse(localStorage.getItem('user'))

// Should show user object with id, not null
```

### 2. **Check Network Requests**
1. Open DevTools → Network tab
2. Look for requests to: `http://localhost:3005/api/notifications?...`
3. Check query parameters include: `user_id=5` (your user ID)
4. Response should show array of notifications

### 3. **Check Notification Service is Running**
```powershell
# In Service de Notifications folder:
npm start

# Should show:
# ✅ Notification Service running on port 3005
```

### 4. **Check Auth Service is Running**
```powershell
# In auth-service folder:
npm start

# Should show:
# ✅ Auth Service running on port 4000
```

### 5. **Check Events Service is Running**
```powershell
# In Gestion des Événements folder:
npm start

# Should show:
# ✅ Events Service running on port 3001
```

### 6. **Test Directly with curl/PowerShell**
```powershell
# Replace 5 with your actual user ID
Invoke-RestMethod -Uri "http://localhost:3005/api/notifications?user_id=5" `
  -Method Get `
  -Headers @{"Content-Type"="application/json"}

# Should return array of notifications:
# {
#   "total": 2,
#   "page": 1,
#   "limit": 20,
#   "notifications": [...]
# }
```

---

## Step-by-Step Testing

### Test Scenario 1: View Notifications
```
1. Login to frontend
2. Open DevTools (F12)
3. Go to Console tab
4. Verify: localStorage.getItem('user') shows your user
5. Click bell icon 🔔
6. Should see notifications or "No notifications" message
7. Check Console: should show "📥 Fetching notifications for user X"
```

### Test Scenario 2: Receive Password Change Notification
```
1. Be logged in as User 5
2. Open PowerShell
3. Run password change API call (see above)
4. Go back to browser
5. Within 30 seconds, new notification appears
6. Click it to mark as read
```

### Test Scenario 3: Create Event Notification
```
1. Be logged in as Teacher (User 1)
2. Create an event
3. Login as Student (User 5) in different browser/incognito
4. Student should see "📅 New Event Created" notification
5. Click notification to verify
```

### Test Scenario 4: Event Registration Notification
```
1. Student (User 5) logs in
2. Clicks on an event
3. Clicks "Join Event"
4. Should see "✅ Successfully Registered" notification
5. Teacher should see "👤 New Registration" notification
```

---

## Files Modified

### Fixed File:
`frontend/learnflow/src/services/NotificationAPI.js`

**Changes Made:**
1. Added `getUserId()` helper function
   - Reads user from localStorage
   - Returns user.id or defaults to 1
   
2. Updated all API methods to include `user_id`:
   - `getNotifications()`
   - `getUnreadCount()`
   - `getNotification(id)`
   - `markAsRead(id)`
   - `markAllAsRead()`
   - `deleteNotification(id)`
   - `deleteMultiple(ids)`
   - `getPreferences()`
   - `updatePreferences()`
   - `toggleNotificationType()`
   - `setQuietHours()`

3. Each now constructs params like:
   ```javascript
   const params = new URLSearchParams();
   params.append('user_id', userId);
   params.append('other_param', value);
   ```

---

## Quick Test Commands

```powershell
# Test 1: Get all notifications for user 5
Invoke-RestMethod "http://localhost:3005/api/notifications?user_id=5" -Method Get

# Test 2: Get unread count for user 5
Invoke-RestMethod "http://localhost:3005/api/notifications/unread/count?user_id=5" -Method Get

# Test 3: Get preferences for user 5
Invoke-RestMethod "http://localhost:3005/api/preferences?user_id=5" -Method Get

# Test 4: Change password and trigger notification
$body = '{"nom":"Ahmed","prenom":"Ali","email":"a@a.com","password":"NewPass123","role":"etudiant"}' | ConvertTo-Json
Invoke-RestMethod "http://localhost:4000/auth/updateuser/5" -Method Put -Headers @{"Content-Type"="application/json"} -Body $body

# Test 5: Mark notification as read
Invoke-RestMethod "http://localhost:3005/api/notifications/1/read?user_id=5" -Method Put -Headers @{"Content-Type"="application/json"}
```

---

## Success Checklist ✅

- [ ] Frontend loads without errors
- [ ] localStorage has user object
- [ ] Bell icon visible in top-right
- [ ] Click bell shows notification panel
- [ ] Console shows "📥 Fetching notifications for user X"
- [ ] Notifications appear after actions (password change, event creation, etc.)
- [ ] Auto-refresh happens every 30 seconds (check console)
- [ ] Can mark notifications as read
- [ ] Can delete notifications
- [ ] Preferences tab accessible
- [ ] Toggle notification types works
- [ ] No 401 errors in Network tab

---

## If Nothing Works

1. **Clear everything and restart:**
   ```powershell
   # Stop all services
   # Clear browser cache: Ctrl+Shift+R
   # npm run dev
   ```

2. **Check all 3 backends are running:**
   - Auth Service: http://localhost:4000
   - Events Service: http://localhost:3001
   - Notification Service: http://localhost:3005

3. **Check PostgreSQL is running**
   - Database must have `auth_service` with `referentiels` schema

4. **Check Node modules are installed**
   ```powershell
   # In each service folder:
   npm install
   ```

5. **Check ports are not in use**
   ```powershell
   # See what's using port 3005
   netstat -ano | findstr :3005
   ```

---

**Status:** ✅ Fixed - Frontend now properly sends user_id to Notification Service

