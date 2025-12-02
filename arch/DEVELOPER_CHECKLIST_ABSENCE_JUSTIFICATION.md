# ✅ Absence Justification System - Developer Checklist

## Pre-Implementation Checklist

### Understanding the System
- [ ] Read EXECUTIVE_SUMMARY_ABSENCE_JUSTIFICATION.md (10 min overview)
- [ ] Read QUICK_START_ABSENCE_JUSTIFICATION.md (20 min practical guide)
- [ ] Review file structure below
- [ ] Understand API endpoints (15 endpoints total)
- [ ] Review database models (3 models, relationships)

### Environment Setup
- [ ] Node.js installed and running
- [ ] MySQL database running
- [ ] Upload directory created: `/uploads/justifications/`
- [ ] Write permissions set on upload directory
- [ ] JWT secret configured
- [ ] Sequelize sync enabled

### Verification
- [ ] Can access `/api/absences/justifications` endpoint
- [ ] JWT authentication working
- [ ] Database connection active
- [ ] Models synced successfully
- [ ] Routes mounted in server.js

---

## Implementation Checklist

### Database Layer ✅ (Complete)

#### Models Created
- [x] `models/AbsenceJustification.js`
  - [x] All 23 fields defined
  - [x] Proper data types
  - [x] Indexes created
  - [x] Comments added

- [x] `models/StudentElimination.js`
  - [x] All 20 fields defined
  - [x] Unique constraint on student_id + matiere_id
  - [x] Appeal tracking fields
  - [x] Indexes created

- [x] `models/StudentAbsence.js` (Updated)
  - [x] Added justification_status field
  - [x] Added has_active_justification field
  - [x] Added matiere_id field
  - [x] Added classe_id field

#### Relationships
- [x] AbsenceJustification → StudentAbsence (1:1)
- [x] AbsenceJustification → Student (N:1)
- [x] AbsenceJustification → Schedule (N:1)
- [x] AbsenceJustification → Matière (N:1)
- [x] StudentElimination → Student (N:1)
- [x] StudentElimination → Matière (N:1)
- [x] All registered in `models/index.js`

---

### API Layer ✅ (Complete)

#### Student Endpoints (6)
- [x] `POST /` - Submit justification
  - [x] File upload handling (multer)
  - [x] Input validation
  - [x] Ownership check
  - [x] File storage
  - [x] Notification trigger

- [x] `GET /my-justifications` - List my justifications
  - [x] Status filtering
  - [x] Ownership enforcement
  - [x] Sorting

- [x] `GET /my-justifications/:id` - View single
  - [x] Ownership verification
  - [x] 404 error handling

- [x] `PUT /my-justifications/:id` - Update justification
  - [x] Status validation (pending/revision_needed only)
  - [x] Document replacement
  - [x] Ownership check

- [x] `DELETE /my-justifications/:id` - Delete justification
  - [x] Status validation
  - [x] File cleanup
  - [x] Ownership check

- [x] `GET /:id/document` - Download file
  - [x] MIME type handling
  - [x] File stream
  - [x] Authorization check

#### Admin Endpoints (6)
- [x] `GET /admin/pending` - Get pending justifications
  - [x] Role check
  - [x] Includes student info
  - [x] Ordering

- [x] `GET /admin/all` - Get all (paginated)
  - [x] Pagination logic
  - [x] Filtering by status/student
  - [x] Role check

- [x] `POST /:id/approve` - Approve
  - [x] Status validation
  - [x] Role check
  - [x] StudentAbsence update
  - [x] Audit logging
  - [x] Notification

- [x] `POST /:id/reject` - Reject
  - [x] Status validation
  - [x] Notes required
  - [x] Audit logging
  - [x] Notification

- [x] `POST /:id/request-revision` - Request more info
  - [x] Message required
  - [x] Status update to revision_needed
  - [x] Notification

- [x] `GET /admin/statistics` - Stats
  - [x] Group by status
  - [x] Group by type
  - [x] Total count

#### Chef Endpoint (1)
- [x] `POST /:id/override` - Override decision
  - [x] Role check (chef_departement only)
  - [x] Override logic
  - [x] Audit logging

---

### Services Layer ✅ (Complete)

#### NotificationService.js
- [x] notifyAdminNewJustification()
- [x] notifyStudentSubmitted()
- [x] notifyStudentApproved()
- [x] notifyStudentRejected()
- [x] notifyStudentRevisionNeeded()
- [x] notifyStudentDecisionOverridden()
- [x] notifyTeacherStudentEliminated()
- [x] notifyAdminDailyStats()
- [x] All with proper message formatting

#### EliminationService.js
- [x] checkEliminationStatus()
- [x] eliminateStudent()
- [x] getStudentEliminations()
- [x] canStudentJustify()
- [x] appealElimination()
- [x] processAppeal()
- [x] All with audit logging

---

### Configuration Layer ✅ (Complete)

- [x] `AbsenceJustificationConfig.js` created
  - [x] File upload settings
  - [x] Status enums
  - [x] Justification types
  - [x] Elimination settings
  - [x] Notification templates
  - [x] Role permissions
  - [x] Pagination defaults
  - [x] Error messages
  - [x] API response codes
  - [x] Audit action types

---

### Integration ✅ (Complete)

- [x] Models exported in `models/index.js`
- [x] Routes imported in `server.js`
- [x] Routes mounted at `/api/absences/justifications`
- [x] Database sync includes all models
- [x] Audit logging configured
- [x] Authentication middleware ready

---

### Documentation ✅ (Complete)

- [x] EXECUTIVE_SUMMARY_ABSENCE_JUSTIFICATION.md
- [x] QUICK_START_ABSENCE_JUSTIFICATION.md
- [x] ABSENCE_JUSTIFICATION_COMPLETE.md (2000+ lines)
- [x] IMPLEMENTATION_STATUS_ABSENCE_JUSTIFICATION.md
- [x] README_ABSENCE_JUSTIFICATION.md (index & navigation)
- [x] This file (DEVELOPER_CHECKLIST.md)
- [x] Migration guide (01_create_absence_justification_tables.js)
- [x] Code comments on all major functions

---

## Testing Checklist

### Manual API Testing

#### Authentication
- [ ] Test with no token → 401 Unauthorized
- [ ] Test with invalid token → 401 Invalid token
- [ ] Test with valid token → Success

#### File Upload
- [ ] Upload PDF → Success
- [ ] Upload JPG → Success
- [ ] Upload PNG → Success
- [ ] Upload TXT → 400 Invalid file type
- [ ] Upload 15MB file → 400 File too large
- [ ] Upload without document → Success (optional field)

#### Student Endpoints
- [ ] Student can submit justification
- [ ] Student can view own justifications
- [ ] Student cannot view other students' justifications
- [ ] Student can update pending justification
- [ ] Student cannot update approved justification
- [ ] Student can delete pending justification
- [ ] Student can download own document
- [ ] Student cannot download others' documents

#### Admin Endpoints
- [ ] Admin can view pending justifications
- [ ] Admin can view all justifications
- [ ] Admin can approve justification
- [ ] Admin cannot approve non-pending justification
- [ ] Admin can reject with notes
- [ ] Admin can request revision
- [ ] Admin can view statistics
- [ ] Non-admin cannot access admin endpoints

#### Chef Endpoint
- [ ] Chef can override decision
- [ ] Non-chef cannot override
- [ ] Override is logged
- [ ] Override updates status correctly

#### Error Cases
- [ ] Missing required fields → 400 Bad Request
- [ ] Student absence not found → 404 Not Found
- [ ] Justification not found → 404 Not Found
- [ ] Permission denied → 403 Forbidden
- [ ] File write error → 500 Server Error

### Data Validation Testing
- [ ] Title minimum length (3 chars)
- [ ] Title maximum length (255 chars)
- [ ] Explanation minimum length (10 chars)
- [ ] Invalid justification type → 400
- [ ] Empty explanation → 400
- [ ] Valid status values only

### Database Testing
- [ ] Tables created successfully
- [ ] Relationships established
- [ ] Indexes created
- [ ] Foreign key constraints working
- [ ] Unique constraints enforced
- [ ] Data persists after save
- [ ] Records can be updated
- [ ] Records can be deleted
- [ ] Cascade rules work

### Audit Logging
- [ ] Create action logged
- [ ] Update action logged
- [ ] Delete action logged
- [ ] Approve action logged
- [ ] Reject action logged
- [ ] Override action logged
- [ ] All logs include user ID
- [ ] All logs include timestamp

### Authorization Testing
- [ ] Student cannot approve
- [ ] Student cannot reject
- [ ] Teacher cannot approve
- [ ] Admin can approve/reject
- [ ] Chef can override
- [ ] Role validation on all endpoints

---

## Performance Testing Checklist

- [ ] Load test with 1000+ justifications
- [ ] Test pagination with large datasets
- [ ] Check index usage in queries
- [ ] Monitor query execution time
- [ ] Test file upload speed (10MB)
- [ ] Check memory usage during operations
- [ ] Test concurrent submissions
- [ ] Verify no N+1 query problems

---

## Security Testing Checklist

- [ ] SQL injection attempts → 400/rejected
- [ ] XSS in text fields → Sanitized/escaped
- [ ] File upload exploit attempts → Rejected
- [ ] Unauthorized access attempts → 403 Forbidden
- [ ] Token manipulation → 401 Invalid token
- [ ] Rate limiting on file uploads
- [ ] CSRF protection (if applicable)
- [ ] Sensitive data not exposed in errors

---

## Frontend Integration Checklist

### UI Components Needed
- [ ] Absence list view
- [ ] Justification button
- [ ] Justification form modal
- [ ] File upload input
- [ ] Document preview
- [ ] Status badge/indicator
- [ ] Admin review interface
- [ ] Approve/reject buttons
- [ ] Statistics dashboard
- [ ] Appeal form

### Frontend Code
- [ ] API client functions
- [ ] Form validation
- [ ] Error handling
- [ ] Toast notifications
- [ ] Modal management
- [ ] File handling
- [ ] State management
- [ ] Loading states

### Integration Points
- [ ] `/api/absences/justifications` - Submit
- [ ] `/api/absences/justifications/my-justifications` - List
- [ ] `/api/absences/justifications/admin/pending` - Admin
- [ ] `/api/absences/justifications/:id/approve` - Approve
- [ ] Download document endpoint
- [ ] Statistics endpoint

---

## Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Code review completed
- [ ] Documentation reviewed
- [ ] Security audit passed
- [ ] Performance acceptable
- [ ] Error logging configured
- [ ] Monitoring setup
- [ ] Backup procedure ready

### Deployment
- [ ] Database migration run
- [ ] Tables created
- [ ] Indexes created
- [ ] Seeds loaded (if needed)
- [ ] Environment variables set
- [ ] Upload directory created
- [ ] File permissions set
- [ ] Server restarted
- [ ] Tests run against production data

### Post-Deployment
- [ ] Monitor error logs
- [ ] Check database size
- [ ] Verify all endpoints
- [ ] Check file uploads work
- [ ] Monitor performance
- [ ] Test notifications
- [ ] User acceptance test
- [ ] Create monitoring alerts

---

## Maintenance Checklist (Monthly)

- [ ] Archive old justifications
- [ ] Analyze query performance
- [ ] Optimize indexes if needed
- [ ] Check disk usage
- [ ] Review error logs
- [ ] Update documentation
- [ ] Test disaster recovery
- [ ] Update dependencies

---

## Files Location Reference

```
Models:
- /backend/Reference_documents/models/AbsenceJustification.js
- /backend/Reference_documents/models/StudentElimination.js
- /backend/Reference_documents/models/StudentAbsence.js
- /backend/Reference_documents/models/index.js

Routes:
- /backend/Reference_documents/routes/AbsenceJustifications.js

Services:
- /backend/Reference_documents/services/NotificationService.js
- /backend/Reference_documents/services/EliminationService.js

Config:
- /backend/Reference_documents/config/AbsenceJustificationConfig.js
- /backend/Reference_documents/config/migrations/01_create_absence_justification_tables.js

Server Integration:
- /backend/Reference_documents/server.js (line ~100 import, line ~143 mount)

Documentation:
- /arch/EXECUTIVE_SUMMARY_ABSENCE_JUSTIFICATION.md
- /arch/QUICK_START_ABSENCE_JUSTIFICATION.md
- /arch/ABSENCE_JUSTIFICATION_COMPLETE.md
- /arch/IMPLEMENTATION_STATUS_ABSENCE_JUSTIFICATION.md
- /arch/README_ABSENCE_JUSTIFICATION.md
- /arch/FINAL_DELIVERY_ABSENCE_JUSTIFICATION.md
- /arch/DEVELOPER_CHECKLIST.md (this file)

Uploads:
- /uploads/justifications/ (must be created)
```

---

## Quick Reference

### API Base URL
```
/api/absences/justifications
```

### Authentication
```
Headers: {
  Authorization: "Bearer {jwt_token}"
}
```

### Status Values
```
pending, approved, rejected, revision_needed, deleted
```

### Justification Types
```
medical, family_issue, administrative, personal, other
```

### Common Error Codes
```
200 - OK
201 - Created
400 - Bad Request
401 - Unauthorized
403 - Forbidden
404 - Not Found
500 - Server Error
```

---

## Support & Help

### If Models Aren't Recognized
- Check `models/index.js` has the exports
- Check `server.js` uses `const models = require("./models")`
- Check Sequelize sync includes all models

### If Routes Return 404
- Check `server.js` has the import statement
- Check `app.use("/api/absences/justifications", ...)` exists
- Check the path matches exactly

### If File Upload Fails
- Check `/uploads/justifications/` directory exists
- Check write permissions on directory
- Check file size < 10MB
- Check MIME type is PDF/JPG/PNG

### If Database Errors Occur
- Check MySQL running
- Check schema `referentiels` exists
- Check `auth` schema with `utilisateur` table exists
- Check Sequelize config correct

### If Authorization Fails
- Check JWT token is valid
- Check Authorization header format: "Bearer {token}"
- Check user role has required permissions
- Check ownership verification passes

---

## Success Criteria

✅ System is complete when:
- [ ] All endpoints respond correctly
- [ ] All tests pass
- [ ] File uploads work
- [ ] Database queries performant
- [ ] Audit logging active
- [ ] Security checks pass
- [ ] Documentation up-to-date
- [ ] Frontend integrated
- [ ] Notifications configured
- [ ] Deployed to production

---

## 🎉 Ready to Code!

Everything is set up for you to start integrating with your frontend.

**Next Step**: Read QUICK_START_ABSENCE_JUSTIFICATION.md and start building the UI!

Good luck! 🚀
