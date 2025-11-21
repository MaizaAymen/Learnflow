# 🚀 Quick Start - Professional System Testing

## Starting the Services

### 1. Start Reference_documents Service
```bash
cd backend/Reference_documents
npm install  # First time only
npm start
# or: node server.js
```
**Port**: 3000

### 2. Verify Service is Running
```bash
curl http://localhost:3000/api/reference
```

---

## Testing API Endpoints

### Get JWT Token (from Auth Service)
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d {
    "email": "student@example.com",
    "password": "password"
  }

# Response includes: { token: "eyJhbGc..." }
```

Use token in all requests as: `Authorization: Bearer YOUR_TOKEN`

---

## Example Requests

### 1. Add Grade (Teacher)
```bash
curl -X POST http://localhost:3000/api/grades \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d {
    "studentId": "student-uuid",
    "subjectId": "subject-uuid",
    "gradeType": "exam",
    "marks": 18,
    "maxMarks": 20,
    "weight": 1,
    "feedback": "Excellent work!"
  }
```

### 2. Create Exam
```bash
curl -X POST http://localhost:3000/api/exams \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d {
    "title": "Math Midterm",
    "subjectId": "subject-uuid",
    "courseId": "course-uuid",
    "examType": "midterm",
    "date": "2025-12-15T09:00:00Z",
    "endDate": "2025-12-15T11:00:00Z",
    "location": "Building A",
    "room": "101",
    "totalMarks": 20,
    "duration": 120
  }
```

### 3. Upload Document
```bash
curl -X POST http://localhost:3000/api/documents \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/document.pdf" \
  -F "title=Math Notes" \
  -F "description=Chapter 5 notes" \
  -F "courseId=course-uuid" \
  -F "type=pdf" \
  -F "visibleTo=all"
```

### 4. Submit Student Request
```bash
curl -X POST http://localhost:3000/api/requests \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d {
    "type": "absence_justification",
    "title": "Doctor Appointment",
    "description": "Medical appointment on 2025-12-10",
    "priority": "medium"
  }
```

### 5. Create Announcement
```bash
curl -X POST http://localhost:3000/api/announcements \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d {
    "title": "Final Exam Schedule",
    "content": "Exams will be held from Dec 15-22",
    "type": "announcement",
    "priority": "urgent",
    "visibility": "all",
    "tags": ["exam", "important"]
  }
```

### 6. View Audit Logs (Admin Only)
```bash
curl -X GET http://localhost:3000/api/audit \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

---

## Common Errors & Solutions

### Error: "Unauthorized - no token"
**Cause**: Missing or invalid JWT token
**Solution**: Include `Authorization: Bearer YOUR_TOKEN` header

### Error: "Only teachers can add grades"
**Cause**: User role doesn't have permission
**Solution**: Use teacher or admin account

### Error: "Model not found"
**Cause**: Models not properly exported from index.js
**Solution**: Verify `Reference_documents/models/index.js` imports all 10 new models

### Error: "ENOENT: no such file or directory"
**Cause**: File upload directory missing
**Solution**: Server auto-creates it; ensure write permissions on `backend/Reference_documents/uploads/`

---

## Response Format

### Success Response (201 Created)
```json
{
  "message": "Grade added successfully",
  "grade": {
    "id": "uuid",
    "studentId": "uuid",
    "marks": 18,
    "createdAt": "2025-12-10T10:30:00Z",
    ...
  }
}
```

### Error Response
```json
{
  "error": "Only teachers can add grades"
}
```

---

## Status Workflows

### Student Request
`pending` → `in_review` → `approved/rejected` → `completed`

### Project
`draft` → `submitted` → `approved` → `in_progress` → `evaluation` → `completed`

### Internship
`pending` → `approved` → `in_progress` → `completed`

---

## Database Connection

Verify PostgreSQL is accessible:
```bash
# Check connection from Reference_documents service
psql -h localhost -U postgres -d learnflow -c "SELECT version();"
```

---

## Troubleshooting

### Service Won't Start
1. Check port 3000 not in use: `netstat -ano | findstr :3000`
2. Verify PostgreSQL running: `psql --version`
3. Check connection string in `auth-service/config/index.js`

### Routes Not Found
1. Verify routes mounted in `server.js`
2. Check route files exist in `Reference_documents/routes/`
3. Ensure models initialized before routes load

### Files Not Uploading
1. Verify `backend/Reference_documents/uploads/` exists and writable
2. Check file size under limit (50MB documents, 100MB projects)
3. Verify MIME type is allowed

---

## Environment Variables (Optional)

Create `.env` in `Reference_documents/`:
```
JWT_SECRET=your-secret-key
DATABASE_URL=postgres://user:pass@localhost:5432/learnflow
NODE_ENV=development
PORT=3000
```

---

## Next Steps

1. ✅ Services running
2. ✅ Database synced
3. ✅ API endpoints responding
4. ⏳ Connect frontend (update API base URL to http://localhost:3000)
5. ⏳ Integrate JWT token in frontend auth flow
6. ⏳ Test complete user workflows

---

**Documentation**: See `PROFESSIONAL_SYSTEM_MIGRATION_COMPLETE.md` for full details
