# Student Event Registration - Testing & Quick Reference Guide

## Quick Start

### Prerequisites
- ✅ Auth Service running on port 4000
- ✅ Events Service running on port 3004  
- ✅ Frontend Dev Server running on port 5174
- ✅ PostgreSQL database with `auth_service` connected

### Services Status Check

**Windows PowerShell:**
```powershell
Get-NetTCPConnection -State Listen | Where-Object {$_.LocalPort -in 3004,4000,5174}
```

**Expected Output:**
```
LocalAddress LocalPort RemoteAddress RemotePort State
::1          5174      ::            0          Listen
::           4000      ::            0          Listen
::           3004      ::            0          Listen
```

---

## Frontend URLs

| Page | URL | Purpose | Role |
|------|-----|---------|------|
| Events List | `http://localhost:5174/events` | Browse & join events | Student |
| My Events | `http://localhost:5174/student/events` | View registrations | Student |
| Admin Panel | `http://localhost:5174/admin/events` | Manage events | Admin |

---

## Test Scenarios

### Test 1: Browse Events & Join

**Steps:**
1. Open `http://localhost:5174` and login as student
2. Click menu: "Événements" → "Consulter Événements"
3. Should see list of public events
4. Click "Participer" on any event
5. Button should change to "Se désinscrire" (red)
6. Check browser console for no errors

**Expected Results:**
- ✅ Events load and display correctly
- ✅ "Participer" button is clickable
- ✅ Button changes color after click
- ✅ Success message appears
- ✅ No console errors

**Troubleshooting:**
```
Error: "Veuillez vous connecter"
→ Make sure you're logged in (check /auth)

Error: "Erreur lors du chargement des événements"
→ Check Events service is running (port 3004)
→ Check EventsAPI baseURL: http://localhost:3004

Button doesn't change
→ Check currentUser is being fetched (auth service)
→ Check network tab for join request success
```

---

### Test 2: View My Events

**Steps:**
1. From previous test, student has registered for events
2. Click menu: "Événements" → "Mes Événements"
3. Should see "Événements à venir" section with registered events
4. Scroll down to see "Événements passés" section (if any)

**Expected Results:**
- ✅ Dashboard loads with two sections
- ✅ Registered events appear in correct section
- ✅ Each event shows title, type, date
- ✅ "Se désinscrire" button is present
- ✅ Empty state shows if no events

**Sample Dashboard Output:**
```
Événements à venir (2)
├─ Conference on AI
│  └─ Jan 15, 2024 10:00 AM
│  └─ [Se désinscrire]
└─ Séminaire Django
   └─ Jan 20, 2024 2:00 PM
   └─ [Se désinscrire]

Événements passés (1)
├─ Réunion Pédagogique
   └─ Dec 20, 2023 3:00 PM
   └─ [Se désinscrire]
```

---

### Test 3: Leave Event

**Steps:**
1. On Dashboard or Events page, click "Se désinscrire"
2. Confirmation modal appears: "Êtes-vous sûr?"
3. Click "Oui" (OK)
4. Button changes back to "Participer" (EventsViewer) or disappears (Dashboard)
5. Success message appears

**Expected Results:**
- ✅ Modal confirmation shows before leaving
- ✅ API call succeeds
- ✅ UI updates immediately
- ✅ Success message shows "Vous avez été désinscrit"
- ✅ Event no longer shows as registered

**Troubleshooting:**
```
Modal doesn't appear
→ Check handleLeaveEvent is defined

API call fails
→ Check Events service is running
→ Check database connection in service

UI doesn't update
→ Check registrationStatus state is being set
```

---

### Test 4: Join Same Event Twice (Duplicate Prevention)

**Steps:**
1. Join an event (see Test 1)
2. Refresh page (F5)
3. Try to join the same event again
4. System should prevent duplicate or show error

**Expected Results:**
- ✅ Database constraint prevents duplicate
- ✅ Backend returns error or ignores duplicate
- ✅ Button stays as "Se désinscrire"
- ✅ No duplicate in database

**Database Check:**
```sql
SELECT COUNT(*) FROM referentiels."EventRegistrations"
WHERE event_id = 'EVENT_ID' AND student_id = 'STUDENT_ID';
-- Should return 1 or 0, never 2+
```

---

### Test 5: Admin Creates Event

**Steps:**
1. Login as admin
2. Click menu: "Événements" → "Gérer Événements"
3. Click "Créer Événement" button
4. Fill form:
   - Title: "Test Event"
   - Type: "Conference"
   - Visibility: "Public"
   - Start Date: Tomorrow at 10:00 AM
   - Description: "Test description"
5. Click "Créer"

**Expected Results:**
- ✅ Form validates required fields
- ✅ Event created successfully
- ✅ Redirect to events list
- ✅ New event appears in events list

**Verify Event Appears:**
1. Logout as admin, login as student
2. Go to "Consulter Événements"
3. New event should appear in list
4. Should be able to join it

---

### Test 6: Event Visibility Filtering

**Steps:**
1. Admin creates events with different visibility:
   - "Public": Visible to all
   - "Department": Visible to students in same dept
   - "Private": Visible only to creator
2. Login as student from different department
3. Go to "Consulter Événements"
4. Should only see "Public" events

**Expected Results:**
- ✅ Private/Department events are hidden
- ✅ Only appropriate events display
- ✅ Filtering works without page refresh

---

## API Testing (Direct Calls)

### Prerequisites
```bash
# Set variables for easier testing
$EVENT_ID = "550e8400-e29b-41d4-a716-446655440000"
$STUDENT_ID = "123e4567-e89b-12d3-a456-426614174000"
$BASE_URL = "http://localhost:3004/api/events"
```

### Test: Get All Events
```powershell
$response = Invoke-RestMethod -Uri "$BASE_URL" -Method Get
$response | ConvertTo-Json | Out-Host
```

**Expected:** Array of event objects

### Test: Join Event
```powershell
$body = @{
    student_id = $STUDENT_ID
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "$BASE_URL/$EVENT_ID/join" `
    -Method Post `
    -Headers @{"Content-Type"="application/json"} `
    -Body $body

$response | ConvertTo-Json
```

**Expected:** 
```json
{
  "success": true,
  "registration": {
    "id": "...",
    "event_id": "...",
    "student_id": "...",
    "status": "registered",
    "registered_at": "2024-01-15T10:30:00Z"
  }
}
```

### Test: Check Registration
```powershell
$response = Invoke-RestMethod `
    -Uri "$BASE_URL/check-registration?eventId=$EVENT_ID&studentId=$STUDENT_ID" `
    -Method Get

$response
```

**Expected:**
```json
{
  "registered": true
}
```

### Test: Get Student Events
```powershell
$response = Invoke-RestMethod `
    -Uri "$BASE_URL/student/$STUDENT_ID" `
    -Method Get

$response | ConvertTo-Json -Depth 3
```

**Expected:** Array of events with registration details

### Test: Leave Event
```powershell
$body = @{
    student_id = $STUDENT_ID
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "$BASE_URL/$EVENT_ID/leave" `
    -Method Post `
    -Headers @{"Content-Type"="application/json"} `
    -Body $body

$response
```

**Expected:**
```json
{
  "success": true
}
```

---

## Database Inspection

### Check EventRegistration Table Schema

```sql
\d referentiels."EventRegistrations"

-- Output should show:
--  Column     |            Type             
-- -----------+------------------------------
--  id         | uuid
--  event_id   | uuid
--  student_id | uuid
--  status     | character varying
--  registered_at | timestamp with time zone
--  createdAt  | timestamp with time zone
--  updatedAt  | timestamp with time zone
--
-- Indexes:
--     "EventRegistrations_pkey" PRIMARY KEY, btree (id)
--     "EventRegistrations_event_id_student_id_key" UNIQUE, btree (event_id, student_id)
```

### View All Registrations
```sql
SELECT * FROM referentiels."EventRegistrations"
ORDER BY "createdAt" DESC
LIMIT 10;
```

### View Registrations for Specific Event
```sql
SELECT 
    er.id,
    er.student_id,
    er.status,
    er.registered_at,
    e.title,
    e.start_date
FROM referentiels."EventRegistrations" er
JOIN referentiels."Events" e ON er.event_id = e.id
WHERE er.event_id = '<EVENT_ID>'
ORDER BY er.registered_at DESC;
```

### View Registrations for Specific Student
```sql
SELECT 
    er.id,
    er.event_id,
    er.status,
    er.registered_at,
    e.title,
    e.start_date
FROM referentiels."EventRegistrations" er
JOIN referentiels."Events" e ON er.event_id = e.id
WHERE er.student_id = '<STUDENT_ID>'
ORDER BY e.start_date DESC;
```

### Count Registrations
```sql
SELECT 
    event_id,
    COUNT(*) as registration_count,
    SUM(CASE WHEN status = 'registered' THEN 1 ELSE 0 END) as active_registrations
FROM referentiels."EventRegistrations"
GROUP BY event_id
ORDER BY registration_count DESC;
```

### Check for Duplicate Registrations (Should be 0)
```sql
SELECT 
    event_id, 
    student_id, 
    COUNT(*) as count
FROM referentiels."EventRegistrations"
GROUP BY event_id, student_id
HAVING COUNT(*) > 1;
```

---

## Browser Console Debugging

### Check Current User
```javascript
// In console on /events page
console.log(localStorage.getItem('token'))  // Check if logged in
fetch('http://localhost:4000/api/auth/profile', {
    credentials: 'include'
}).then(r => r.json()).then(console.log)
```

### Check Event Registration Status
```javascript
// In EventsViewer component
console.log('Current User:', currentUser)
console.log('Registration Status:', registrationStatus)
console.log('Events:', events)
```

### Monitor Network Requests
1. Open DevTools (F12)
2. Go to Network tab
3. Filter by Fetch/XHR
4. Click "Participer" button
5. Watch for requests to:
   - `http://localhost:3004/api/events/{id}/join`
   - Response should be 201 Created with registration data

### Common Errors in Console

```
Error: "Erreur lors du chargement des événements"
→ Check backend service running
→ Check CORS settings
→ Check network tab for actual error

Error: "Failed to join event"
→ Check Events service is responding
→ Check request body format
→ Check student_id is valid UUID

TypeError: Cannot read property 'id' of null
→ User not logged in properly
→ Check auth service response
→ Check user data structure
```

---

## Performance Testing

### Load Test: Create Multiple Events
```javascript
// Run in browser console on /admin/events
const events = [];
for(let i = 0; i < 100; i++) {
    events.push({
        title: `Event ${i}`,
        type: 'conference',
        visibility: 'public',
        start_date: new Date(Date.now() + i * 86400000).toISOString()
    });
}

// Create them one by one
events.forEach(async (evt, i) => {
    setTimeout(async () => {
        await fetch('http://localhost:3004/api/events', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(evt)
        });
        console.log(`Created event ${i}`);
    }, i * 100);
});
```

### Measure Response Times
```javascript
const start = performance.now();
fetch('http://localhost:3004/api/events')
    .then(r => r.json())
    .then(d => {
        console.log(`Response time: ${performance.now() - start}ms`);
        console.log(`Events count: ${d.length}`);
    });
```

---

## Troubleshooting Guide

### Issue: Events page shows "Aucun événement disponible"

**Causes & Solutions:**
```
1. No events created yet
   → Admin: Create test events via /admin/events
   
2. All events are private
   → Admin: Change visibility to "public"
   
3. Events service not running
   → Check: Get-NetTCPConnection -State Listen | Where LocalPort -eq 3004
   → Start: cd backend/Gestion\ des\ Événements; npm start
   
4. Database not synced
   → Check: SELECT * FROM referentiels."Events" LIMIT 1;
   → If error: Restart Events service
   
5. CORS blocked
   → Check: Browser console for CORS errors
   → Verify: EventsAPI baseURL is correct
```

### Issue: "Participer" button doesn't work

**Causes & Solutions:**
```
1. Not logged in
   → Check: Browser shows /auth page redirect
   → Solution: Login with student account
   
2. CurrentUser not fetched
   → Check: currentUser state is null
   → Debug: Check /api/auth/profile response
   
3. Events service API error
   → Check: Network tab shows 500 error
   → Debug: Check Events service logs
   → Check: Database connection works
   
4. CORS issue
   → Check: Browser console shows CORS error
   → Debug: Verify CORS config in Events service
   
5. Duplicate registration
   → Check: Database has existing registration
   → Debug: Run: SELECT * FROM referentiels."EventRegistrations" WHERE event_id='...'
```

### Issue: Button doesn't change after joining

**Causes & Solutions:**
```
1. Registration status not updating
   → Check: checkAllRegistrations() is called
   → Debug: Verify registration query response
   
2. State not set correctly
   → Check: setRegistrationStatus is called with correct eventId
   → Debug: Console.log the registration response
   
3. Component not re-rendering
   → Check: useEffect dependencies are correct
   → Debug: Check React DevTools for state changes
   
4. Multiple component instances
   → Check: Only one EventsViewer mounted
   → Debug: Look for duplicate Route definitions
```

### Issue: Leave event doesn't work

**Causes & Solutions:**
```
1. Modal doesn't appear
   → Check: Modal.confirm is imported from antd
   → Debug: Verify handleLeaveEvent is in scope
   
2. API call fails silently
   → Check: Network tab for 500 error
   → Debug: Look at Events service logs
   → Check: EventRegistration exists in DB
   
3. UI doesn't update after leaving
   → Check: Event removed from registration status state
   → Debug: Check console for errors in handleLeaveEvent
   
4. Event still shows in dashboard
   → Check: Dashboard re-fetches student events
   → Debug: Force refresh (F5) to verify it's gone
```

---

## Performance Metrics

### Expected Response Times

| Endpoint | Expected (ms) | Notes |
|----------|---------------|-------|
| GET /api/events | 50-200 | Depends on event count |
| GET /api/events/{id} | 20-50 | Single event |
| POST /api/events/{id}/join | 100-300 | Includes validation |
| GET /api/events/student/:id | 50-150 | Depends on registration count |
| GET /api/events/check-registration | 20-50 | Simple query |

### Database Query Times

```sql
-- Check indexes exist
SELECT * FROM information_schema.statistics 
WHERE table_name = 'EventRegistrations';

-- These queries should be fast (< 10ms):
SELECT * FROM referentiels."EventRegistrations" 
WHERE event_id = 'UUID';  -- Has index

SELECT * FROM referentiels."EventRegistrations" 
WHERE student_id = 'UUID';  -- No index (TODO: add)

SELECT * FROM referentiels."EventRegistrations" 
WHERE event_id = 'UUID' AND student_id = 'UUID';  -- Has unique index
```

---

## Checklist for Full System Test

- [ ] **Day 1: Setup**
  - [ ] All services running (ports 3004, 4000, 5174)
  - [ ] Database connected and synced
  - [ ] Admin can create events
  - [ ] Events appear in public list

- [ ] **Day 2: Student Registration**
  - [ ] Student can view events
  - [ ] Student can join event
  - [ ] Join button changes color
  - [ ] Event appears in "Mes Événements"
  - [ ] Duplicate join prevented
  - [ ] Database has registration entry

- [ ] **Day 3: Leave & Dashboard**
  - [ ] Student can view "Mes Événements"
  - [ ] Student can leave event
  - [ ] Leave requires confirmation
  - [ ] Event removed from registration
  - [ ] Button changes back to "Participer"

- [ ] **Day 4: Edge Cases**
  - [ ] Join without login shows warning
  - [ ] Private/Department events hidden from other students
  - [ ] Admin can see all events
  - [ ] Past events appear in correct section
  - [ ] Multiple registrations work correctly
  - [ ] Cascade delete works if event deleted

- [ ] **Day 5: Performance & Security**
  - [ ] No N+1 query issues
  - [ ] Response times acceptable
  - [ ] No sensitive data in logs
  - [ ] CORS properly configured
  - [ ] Invalid UUIDs handled gracefully

---

**Testing Guide Version**: 1.0  
**Last Updated**: 2024  
**Status**: Ready for Testing
