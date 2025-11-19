# Student Event Registration - Quick Reference Card

## 🚀 Quick Start

```bash
# Check services running
Get-NetTCPConnection -State Listen | Where {$_.LocalPort -in 3004,4000,5174}

# All should show "Listen" status
# ✅ Port 5174: Frontend
# ✅ Port 4000: Auth Service  
# ✅ Port 3004: Events Service
```

---

## 📍 URLs

| Page | URL | User Type |
|------|-----|-----------|
| Browse Events | `localhost:5174/events` | Student |
| My Events | `localhost:5174/student/events` | Student |
| Admin Panel | `localhost:5174/admin/events` | Admin |
| Auth | `localhost:5174/auth` | All |

---

## 🔧 Core Components

### Backend (Node.js + Sequelize)

**Models**:
```
Event ←→ EventRegistration
1        *
```

**Endpoints**:
```
POST   /api/events/:id/join
POST   /api/events/:id/leave
GET    /api/events/student/:id
GET    /api/events/check-registration?eventId=X&studentId=Y
```

**Database**:
```sql
-- EventRegistrations table
event_id (FK) | student_id | status | registered_at
--------------------------------------------------
UUID          | UUID       | 'registered' | Timestamp
```

### Frontend (React + Ant Design)

**Components**:
```
EventsViewer
  ├─ Browse public events
  ├─ Join/Leave buttons
  └─ Registration status

EventsStudentDashboard
  ├─ Upcoming events
  ├─ Past events
  └─ Unsubscribe buttons
```

**API Methods**:
```javascript
eventsAPI.joinEvent(eventId, studentId)
eventsAPI.leaveEvent(eventId, studentId)
eventsAPI.getStudentEvents(studentId)
eventsAPI.checkRegistration(eventId, studentId)
```

---

## 📋 Workflows

### Join Event
```
1. Student logs in
2. Navigate: Événements → Consulter Événements
3. Click "Participer" button
4. Backend creates EventRegistration
5. Button changes to "Se désinscrire"
6. Event appears in "Mes Événements"
```

### View My Events
```
1. Navigate: Événements → Mes Événements
2. Dashboard loads
3. Shows: Upcoming events | Past events
4. Can unsubscribe from each
```

### Leave Event
```
1. Click "Se désinscrire"
2. Confirm modal appears
3. Click "Oui" to confirm
4. Registration marked as 'cancelled'
5. Event removed from list
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| No events visible | Create via /admin/events |
| "Participer" button doesn't work | Check user is logged in |
| Button doesn't change color | Check Events service running |
| Dashboard empty | Join an event first |
| Leave doesn't work | Check database connection |

### Debug Commands

```powershell
# Check port in use
Get-NetTCPConnection -State Listen | Where LocalPort -eq 3004

# Kill process on port 3004
Stop-Process -ID (Get-NetTCPConnection -LocalPort 3004).OwningProcess -Force

# Restart Events service
cd backend\Gestion\ des\ Événements
npm start
```

---

## 📊 Database Queries

```sql
-- Check table exists
SELECT * FROM information_schema.tables 
WHERE table_name = 'EventRegistrations';

-- View all registrations
SELECT * FROM referentiels."EventRegistrations" LIMIT 20;

-- Check student registrations
SELECT * FROM referentiels."EventRegistrations"
WHERE student_id = 'STUDENT_UUID';

-- Check event registrations
SELECT COUNT(*) FROM referentiels."EventRegistrations"
WHERE event_id = 'EVENT_UUID' AND status = 'registered';

-- Cleanup old data
DELETE FROM referentiels."EventRegistrations"
WHERE status = 'cancelled' AND "createdAt" < NOW() - INTERVAL '30 days';
```

---

## 🧪 API Testing

### Join Event (cURL)
```bash
curl -X POST http://localhost:3004/api/events/EVENT_UUID/join \
  -H "Content-Type: application/json" \
  -d '{"student_id":"STUDENT_UUID"}'
```

### Check Registration
```bash
curl "http://localhost:3004/api/events/check-registration?eventId=EVENT_UUID&studentId=STUDENT_UUID"
```

### Get Student Events
```bash
curl http://localhost:3004/api/events/student/STUDENT_UUID
```

### PowerShell

```powershell
# Join event
$body = @{student_id='UUID'} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3004/api/events/UUID/join" `
  -Method Post -Headers @{'Content-Type'='application/json'} -Body $body

# Check registration
Invoke-RestMethod "http://localhost:3004/api/events/check-registration?eventId=UUID&studentId=UUID"
```

---

## 📁 Key Files

| Path | Purpose |
|------|---------|
| `models/EventRegistration.js` | Tracks registrations |
| `controllers/eventsController.js` | 4 new handlers |
| `routes/events.js` | 4 new endpoints |
| `pages/EventsViewer.jsx` | Join/Leave UI |
| `pages/EventsStudentDashboard.jsx` | My Events view |
| `services/EventsAPI.js` | 4 new methods |

---

## ✅ Checklist

- [ ] Events service running (port 3004)
- [ ] Auth service running (port 4000)
- [ ] Frontend running (port 5174)
- [ ] Can create events as admin
- [ ] Can see events as student
- [ ] Can join event
- [ ] Button changes color
- [ ] Event in "Mes Événements"
- [ ] Can leave event
- [ ] Leave confirmation works

---

## 📞 Error Codes

| Code | Meaning | Fix |
|------|---------|-----|
| 404 | Event not found | Verify event ID exists |
| 409 | Duplicate registration | Already registered |
| 500 | Server error | Check service logs |
| CORS Error | Cross-origin blocked | Check CORS config |
| TypeError | Missing field | Check request body format |

---

## 🔒 Security Notes

✅ **Implemented**:
- Unique constraint prevents duplicates
- Foreign key enforces referential integrity
- Cascade delete cleans up registrations
- Users only see appropriate events
- Students only edit their own registrations

⚠️ **TODO** (Production):
- Add authentication middleware
- Validate student_id ownership
- Rate limiting on join/leave
- Audit logging
- Input validation

---

## 📈 Performance Tips

```javascript
// Good: Batch check registrations
const statuses = await Promise.all(
  events.map(e => checkRegistration(e.id, userId))
);

// Avoid: Loop with delays
events.forEach(async e => {
  await checkRegistration(e.id, userId);  // Slow!
});

// Cache registration status
const cache = new Map();  // eventId → boolean
```

---

## 🎯 Common Tasks

### Add Event
```
Admin → /admin/events → Fill form → Create
```

### Join Event
```
Student → /events → Find event → Participer
```

### View My Events
```
Student → /student/events → See all registrations
```

### Leave Event
```
Student → /student/events → Se désinscrire → Confirm
```

### Check Student Registrations
```sql
SELECT COUNT(*) FROM referentiels."EventRegistrations"
WHERE student_id = 'UUID' AND status = 'registered'
```

---

## 🚨 Emergency Procedures

### Service Won't Start
```powershell
# Kill existing process
Get-Process node | Stop-Process -Force

# Clear node_modules cache
npm cache clean --force

# Reinstall
npm install

# Start again
npm start
```

### Database Corruption
```sql
-- Verify table integrity
REINDEX TABLE referentiels."EventRegistrations";

-- Check constraints
SELECT constraint_name FROM information_schema.table_constraints
WHERE table_name='EventRegistrations';
```

### Clear All Registrations
```sql
DELETE FROM referentiels."EventRegistrations";
-- Use with caution!
```

---

## 📚 Documentation

- `STUDENT_EVENTS_REGISTRATION_IMPLEMENTATION.md` - Full implementation details
- `EVENT_REGISTRATION_ARCHITECTURE_DIAGRAM.md` - System architecture
- `TESTING_GUIDE_EVENTS_REGISTRATION.md` - Complete testing guide
- `FILES_MODIFIED_AND_CREATED.md` - All file changes

---

## 🎓 Learning Resources

**Key Concepts**:
1. One-to-Many relationships (Sequelize)
2. Unique constraints (database level)
3. Cascade deletes
4. State management (React)
5. REST API design

**Technologies**:
- Node.js / Express
- Sequelize ORM
- PostgreSQL
- React Hooks
- Ant Design

---

## 📞 Support

**Common Issues & Solutions**:

```
❌ Button doesn't work
→ Check browser console for errors
→ Check Events service running
→ Verify user is logged in

❌ No events visible
→ Create events via admin panel
→ Check event visibility = 'public'
→ Refresh browser cache

❌ Database errors
→ Check postgres is running
→ Verify connection string
→ Check schema 'referentiels' exists

❌ CORS errors
→ Check EventsAPI baseURL matches server
→ Verify CORS config in Events service
→ Clear browser cache and cookies
```

---

## 🎉 Summary

**What's Implemented**:
- ✅ Student registration system
- ✅ Join/Leave functionality
- ✅ Personal event dashboard
- ✅ Real-time UI updates
- ✅ Database persistence
- ✅ Admin event creation

**What's NOT Implemented** (Future):
- ⬜ Email notifications
- ⬜ Event capacity limits
- ⬜ Attendance tracking
- ⬜ Waitlist management
- ⬜ Analytics dashboard

---

**Status**: 🟢 **READY FOR TESTING**

**Next Steps**:
1. Test all workflows manually
2. Check performance metrics
3. Deploy to staging
4. Get stakeholder approval
5. Deploy to production

---

*Quick Reference Card v1.0 | 2024*
