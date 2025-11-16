# Teacher Calendar System - Quick Start Guide

## 🚀 Getting Started

### Prerequisites
- Backend services running (Reference: port 3000, Auth: port 4000)
- Frontend dev server running (port 5173)
- Database connected and synced

### Start the Application

```bash
# Terminal 1: Start Frontend
cd "C:\Users\aymen\Desktop\learflow (1)\Learnflow\frontend\learnflow"
npm run dev

# Terminal 2: Start Reference Service (includes teacher/director APIs)
cd "C:\Users\aymen\Desktop\learflow (1)\Learnflow\backend\Reference_documents"
node server.js

# Terminal 3: Start Auth Service
cd "C:\Users\aymen\Desktop\learflow (1)\Learnflow\backend\auth-service"
node server.js
```

---

## 📍 Access Points

### Teacher Calendar Interface
```
http://localhost:5173/calendar/teacher
```

Features:
- View all your teaching sessions
- Filter sessions by subject
- Declare absences with date range and reason
- Request makeup sessions with proposed time
- Track status of submitted requests

### Director Approval Panel
```
http://localhost:5173/calendar/director-approval
```

Features:
- Review pending absence requests
- Review pending rattrapage requests
- Approve/reject requests with notes
- Automatic new schedule creation on rattrapage approval

---

## 🧪 Testing Scenarios

### Scenario 1: Teacher Declares Absence

**Steps:**
1. Navigate to `http://localhost:5173/calendar/teacher`
2. Click on any session in the "Sessions" tab
3. Click "Declare Absence" button
4. Fill in:
   - Reason: "Medical appointment"
   - Date Range: Today to Tomorrow
5. Click "OK"

**Expected:**
- Absence appears in "Absences" tab with "pending" status
- Statistics badge updates

### Scenario 2: Teacher Requests Rattrapage

**Steps:**
1. Navigate to `http://localhost:5173/calendar/teacher`
2. Click on a session
3. Click "Request Rattrapage" button
4. Fill in:
   - Proposed Date: 3 days from now
   - Start Time: 10:00
   - End Time: 12:00
   - Reason: "Sick leave"
5. Click "OK"

**Expected:**
- Rattrapage request appears in "Rattrapages" tab with "pending" status
- Statistics badge updates

### Scenario 3: Director Approves Absence

**Steps:**
1. Navigate to `http://localhost:5173/calendar/director-approval`
2. Go to "Absences" tab
3. Find the pending absence from scenario 1
4. Click "Approve" button
5. Select "Approve" from dropdown
6. Add note: "Medical documentation verified"
7. Click "OK"

**Expected:**
- Absence status changes to "approved"
- Note is saved
- Absence disappears from pending list

### Scenario 4: Director Approves Rattrapage

**Steps:**
1. Navigate to `http://localhost:5173/calendar/director-approval`
2. Go to "Rattrapages" tab
3. Find the pending rattrapage from scenario 2
4. Click "Approve" button
5. Select "Approve" from dropdown
6. Add note: "Schedule created successfully"
7. Click "OK"

**Expected:**
- Rattrapage status changes to "approved"
- New schedule created in database
- Rattrapage disappears from pending list
- Teacher should see new session in their calendar

### Scenario 5: Director Rejects Request

**Steps:**
1. Create another absence or rattrapage request
2. In director panel, click "Reject"
3. Select "Reject" from dropdown
4. Add reason: "Insufficient documentation"
5. Click "OK"

**Expected:**
- Request status changes to "rejected"
- Reason saved in notes

---

## 🔍 Debugging Tips

### Check Teacher Calendar Data
```bash
curl "http://localhost:3000/api/teacher/schedules"
```

### Check Pending Absences
```bash
curl "http://localhost:3000/api/director/absences/pending"
```

### Check Pending Rattrapages
```bash
curl "http://localhost:3000/api/director/rattrapages/pending"
```

### Verify Database Models
```javascript
// In browser console while on calendar page
// Check if models are loaded
fetch('http://localhost:3000/api/teacher/subjects')
  .then(r => r.json())
  .then(console.log)
```

---

## 🎯 Key Features to Verify

### ✅ Teacher Features
- [ ] Can view all personal sessions
- [ ] Can filter sessions by subject
- [ ] Can declare absence with date range
- [ ] Can request rattrapage with time
- [ ] Can see status of all requests
- [ ] Cannot see other teachers' calendars
- [ ] Cannot approve own requests

### ✅ Director Features
- [ ] Can see all pending absences
- [ ] Can see all pending rattrapages
- [ ] Can approve absence with notes
- [ ] Can reject absence with reason
- [ ] Can approve rattrapage with new schedule creation
- [ ] Can reject rattrapage with reason
- [ ] Cannot see rejected requests after decision

### ✅ System Features
- [ ] Conflict detection prevents overlapping sessions
- [ ] New schedules created automatically on approval
- [ ] Dates/times handled in UTC correctly
- [ ] No orphaned requests in database
- [ ] Proper cascading on deletes

---

## 📊 Database Schema

### Absence Table
```sql
CREATE TABLE IF NOT EXISTS referentiels.absence (
  id UUID PRIMARY KEY,
  schedule_id UUID NOT NULL REFERENCES referentiels.schedule(id),
  enseignant_id INTEGER NOT NULL REFERENCES auth.utilisateur(id),
  motif VARCHAR(500),
  date_debut DATE,
  date_fin DATE,
  statut ENUM('pending', 'approved', 'rejected'),
  validated_by INTEGER REFERENCES auth.utilisateur(id),
  validation_date DATE,
  notes TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Rattrapage Table
```sql
CREATE TABLE IF NOT EXISTS referentiels.rattrapage (
  id UUID PRIMARY KEY,
  original_schedule_id UUID NOT NULL REFERENCES referentiels.schedule(id),
  enseignant_id INTEGER NOT NULL REFERENCES auth.utilisateur(id),
  requested_date DATE,
  requested_start_time TIME,
  requested_end_time TIME,
  motif VARCHAR(500),
  statut ENUM('pending', 'approved', 'rejected', 'completed'),
  validated_by INTEGER REFERENCES auth.utilisateur(id),
  validation_date DATE,
  new_schedule_id UUID REFERENCES referentiels.schedule(id),
  notes TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

---

## 🐛 Troubleshooting

### Issue: API returns 401 Unauthorized
**Solution:** Ensure you're authenticated. Log in first, then navigate to calendar routes.

### Issue: No sessions appear in calendar
**Solution:** 
- Check if teacher has sessions in database
- Verify `enseignant_id` matches authenticated user
- Check browser console for fetch errors

### Issue: "Failed to load calendar data"
**Solution:**
- Verify reference service is running on port 3000
- Check CORS settings in server.js
- Clear browser cache and refresh

### Issue: Cannot see Director panel
**Solution:**
- Ensure your account has "director" or "admin" role
- Contact system admin to upgrade role
- Check authentication token is valid

### Issue: New schedule not created on approval
**Solution:**
- Check error logs in server console
- Verify room/class availability for proposed time
- Check for schedule conflicts

---

## 📝 Default Test Data

### Test Teacher
- Email: `teacher@learnflow.local`
- Name: Jean Durand
- Role: Enseignant
- Subjects: Database Design, Web Development

### Test Director
- Email: `director@learnflow.local`
- Name: Marie Martin
- Role: Director/Chef de département

### Test Class
- ID: ti15
- Name: TI15
- Level: L2
- Students: 30

### Test Subject
- Code: DB101
- Name: Database Design
- Level: L2

---

## 🔄 API Request Examples

### Declare Absence
```javascript
fetch('http://localhost:3000/api/teacher/absences', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    schedule_id: '550e8400-e29b-41d4-a716-446655440000',
    motif: 'Medical appointment',
    date_debut: '2025-11-17T09:00:00Z',
    date_fin: '2025-11-17T11:00:00Z'
  })
})
.then(r => r.json())
.then(console.log)
```

### Request Rattrapage
```javascript
fetch('http://localhost:3000/api/teacher/rattrapages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    original_schedule_id: '550e8400-e29b-41d4-a716-446655440000',
    requested_date: '2025-11-18T10:00:00Z',
    requested_start_time: '10:00:00',
    requested_end_time: '12:00:00',
    motif: 'Sick leave'
  })
})
.then(r => r.json())
.then(console.log)
```

### Approve Request
```javascript
fetch('http://localhost:3000/api/director/absences/550e8400-e29b-41d4-a716-446655440000/approved', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    notes: 'Approved - Medical documentation verified'
  })
})
.then(r => r.json())
.then(console.log)
```

---

## 📞 Support

For issues or questions:
1. Check browser console for JavaScript errors
2. Check server console for backend errors
3. Verify all services are running
4. Review API documentation in `TEACHER_CALENDAR_API.md`
5. Check database for orphaned records

---

## ✨ Next Steps

After verifying the system works:
1. Configure email notifications for approvals
2. Add audit logging for compliance
3. Implement calendar sync with external calendars
4. Add teacher availability preferences
5. Implement automatic rattrapage scheduling
