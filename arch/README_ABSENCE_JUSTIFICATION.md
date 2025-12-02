# 📖 Absence Justification System - Documentation Index

## 📍 Start Here

If you're new to this system, read these in order:

1. **[QUICK_START_ABSENCE_JUSTIFICATION.md](./QUICK_START_ABSENCE_JUSTIFICATION.md)** ← START HERE
   - Overview of what was built (5 min read)
   - Quick API summary
   - Role-based access
   - Main endpoints

2. **[IMPLEMENTATION_STATUS_ABSENCE_JUSTIFICATION.md](./IMPLEMENTATION_STATUS_ABSENCE_JUSTIFICATION.md)**
   - What was delivered
   - Files created
   - Features implemented
   - Next steps

3. **[ABSENCE_JUSTIFICATION_COMPLETE.md](./ABSENCE_JUSTIFICATION_COMPLETE.md)**
   - Complete documentation (deep dive)
   - Full API reference
   - Database schema details
   - Workflow diagrams

---

## 📚 Documentation Files

### Quick Reference (5-15 minutes)
| File | Purpose | Audience |
|------|---------|----------|
| **QUICK_START_ABSENCE_JUSTIFICATION.md** | Fast overview of features & endpoints | Everyone |
| **IMPLEMENTATION_STATUS_ABSENCE_JUSTIFICATION.md** | What was delivered & next steps | Project managers |

### Complete Reference (1-2 hours)
| File | Purpose | Audience |
|------|---------|----------|
| **ABSENCE_JUSTIFICATION_COMPLETE.md** | Full API, database, workflows | Developers |
| **AbsenceJustificationConfig.js** | System configuration & constants | DevOps/Config |
| **01_create_absence_justification_tables.js** | Database migration guide | DevOps/DBA |

---

## 🔧 Code Files

### Models (Database Layer)
```
backend/Reference_documents/models/
├── AbsenceJustification.js       - Justification requests
├── StudentElimination.js         - Elimination tracking  
└── StudentAbsence.js             - Updated with justification fields
```

### Routes (API Layer)
```
backend/Reference_documents/routes/
└── AbsenceJustifications.js       - 15 API endpoints
```

### Services (Business Logic)
```
backend/Reference_documents/services/
├── NotificationService.js         - Notification messaging
└── EliminationService.js          - Elimination logic
```

### Configuration
```
backend/Reference_documents/config/
├── AbsenceJustificationConfig.js  - System settings
└── migrations/
    └── 01_create_absence_justification_tables.js - Migration guide
```

---

## 🎯 By Role

### I'm a Developer
1. Read: QUICK_START_ABSENCE_JUSTIFICATION.md
2. Review: Code files (Models → Routes → Services)
3. Reference: ABSENCE_JUSTIFICATION_COMPLETE.md
4. Use: AbsenceJustificationConfig.js for settings

### I'm Building the Frontend
1. Read: QUICK_START_ABSENCE_JUSTIFICATION.md
2. Check: API Endpoints section in QUICK_START
3. Study: Request/response formats in ABSENCE_JUSTIFICATION_COMPLETE.md
4. Reference: Example cURL commands at bottom of QUICK_START

### I'm Managing the Project
1. Read: IMPLEMENTATION_STATUS_ABSENCE_JUSTIFICATION.md
2. Check: What was delivered section
3. Review: Next steps section
4. Plan: Integration phases

### I'm Managing DevOps
1. Read: Migration guide (01_create_absence_justification_tables.js)
2. Review: Configuration (AbsenceJustificationConfig.js)
3. Plan: Deployment steps
4. Monitor: Performance optimization section in migration guide

---

## 📋 API Reference Quick Links

### Student Endpoints (6)
- Submit justification: `POST /api/absences/justifications/`
- View my justifications: `GET /api/absences/justifications/my-justifications`
- Update justification: `PUT /api/absences/justifications/my-justifications/:id`
- Delete justification: `DELETE /api/absences/justifications/my-justifications/:id`
- Download document: `GET /api/absences/justifications/:id/document`

### Admin Endpoints (6)
- Get pending: `GET /api/absences/justifications/admin/pending`
- Get all (paginated): `GET /api/absences/justifications/admin/all`
- Approve: `POST /api/absences/justifications/:id/approve`
- Reject: `POST /api/absences/justifications/:id/reject`
- Request revision: `POST /api/absences/justifications/:id/request-revision`
- Statistics: `GET /api/absences/justifications/admin/statistics`

### Chef Endpoint (1)
- Override decision: `POST /api/absences/justifications/:id/override`

→ Full details in ABSENCE_JUSTIFICATION_COMPLETE.md

---

## 🗂️ Feature Breakdown

### Core Features
- ✅ Student submits justification with document
- ✅ Admin reviews and approves/rejects
- ✅ Admin can request more information
- ✅ Chef can override decisions
- ✅ Automatic elimination tracking
- ✅ Appeal system for eliminations
- ✅ Comprehensive notifications
- ✅ Complete audit trail

### Database Features
- ✅ Indexed tables for performance
- ✅ Foreign key relationships
- ✅ Enum types for status
- ✅ Timestamp tracking
- ✅ Unique constraints
- ✅ Soft delete support

### API Features
- ✅ Input validation
- ✅ File upload handling
- ✅ Pagination support
- ✅ Role-based access control
- ✅ Audit logging
- ✅ Error handling
- ✅ Status filtering

### Security Features
- ✅ JWT authentication
- ✅ Role-based authorization
- ✅ File type validation
- ✅ File size limits
- ✅ Ownership verification
- ✅ SQL injection prevention
- ✅ Comprehensive audit trail

---

## 📊 Justification Status Diagram

```
┌─ pending
│  ├─ [Approve] → approved
│  ├─ [Reject] → rejected
│  └─ [Request More Info] → revision_needed
│
├─ revision_needed
│  └─ [Re-upload] → pending (back to admin)
│
├─ approved ✅
│  └─ Absence does NOT count toward elimination
│
└─ rejected ❌
   └─ Absence STILL counts toward elimination
```

---

## 🚀 Deployment Checklist

- [ ] Read migration guide
- [ ] Create database tables (auto-sync via Sequelize)
- [ ] Create `/uploads/justifications/` directory
- [ ] Configure file permissions (write access)
- [ ] Update server.js imports (already done)
- [ ] Test API endpoints
- [ ] Build frontend forms
- [ ] Configure email/SMS (optional)
- [ ] Set up cron jobs for maintenance
- [ ] Run performance optimization queries
- [ ] Monitor logs for errors

---

## 🔗 Related Files in Project

The system integrates with:
- `server.js` - Main Express server (routes registered)
- `models/index.js` - Model registry (relationships defined)
- `config/` - Configuration files
- `services/` - Business logic services
- `routes/` - API routes
- `uploads/justifications/` - Document storage

---

## 🆘 Troubleshooting

### "Module not found" errors
→ Check that all files are in correct directories
→ See file paths under "Code Files" section above

### API returns 404
→ Check server.js has the route mounted
→ Verify API path: `/api/absences/justifications`

### File upload fails
→ Check /uploads/justifications/ directory exists
→ Verify write permissions
→ Check file size < 10MB
→ Check file type (PDF, JPG, PNG only)

### Database errors
→ Run migration queries
→ Check foreign key references
→ Verify table creation: See "Verification queries" in migration guide

---

## 📞 Quick Reference

### Important Constants
- Absence limit: 3 non-justified absences
- Max file size: 10MB
- Allowed formats: PDF, JPG, PNG
- Default pagination: 20 items per page

### API Response Codes
- 200: Success (GET, POST successful)
- 201: Created (POST created new record)
- 400: Bad Request (validation error)
- 401: Unauthorized (no token)
- 403: Forbidden (no permission)
- 404: Not Found
- 500: Server Error

### Status Values
- pending: Waiting for review
- approved: ✅ Justified
- rejected: ❌ Not justified
- revision_needed: More info needed

---

## 📈 Statistics You Can Get

Admin can view:
- Total justifications by status
- Justifications by type
- Approval/rejection rates
- Average review time
- Student elimination trends
- Appeal success rates

See: `/api/absences/justifications/admin/statistics`

---

## 🎓 Learning Path

For someone implementing this system:

1. **Day 1**: Read QUICK_START (understand what's built)
2. **Day 2**: Review code structure (models, routes, services)
3. **Day 3**: Study COMPLETE documentation (deep understanding)
4. **Day 4**: Build frontend forms
5. **Day 5**: Test integration
6. **Day 6**: Setup notifications
7. **Day 7**: Deploy and monitor

---

## 📝 Notes

- All timestamps in UTC
- All IDs are UUIDs for justifications
- Student IDs are integers (from auth service)
- File uploads stored with unique names: `{timestamp}-{random}-{original}`
- All actions logged with user ID and timestamp

---

## ✅ Verification Checklist

After deployment:
- [ ] Tables created in database
- [ ] Models registered in index.js
- [ ] Routes mounted in server.js
- [ ] /uploads/justifications/ directory exists
- [ ] Can upload files without errors
- [ ] API endpoints return correct responses
- [ ] Authentication working
- [ ] Role-based access working
- [ ] Audit logs being created
- [ ] Notifications framework active

---

## 🎉 You're Ready!

This system is production-ready. Start with **QUICK_START_ABSENCE_JUSTIFICATION.md** and refer back to other docs as needed.

**Happy coding! 🚀**
