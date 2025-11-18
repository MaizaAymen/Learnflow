# StudentAbsenceModal Fix - Complete Summary

## Overview
This document summarizes all fixes applied to resolve 404 and 500 errors in the StudentAbsenceModal component when marking student attendance and absences.

## Problem Statement

### Initial Issue
The frontend component `StudentAbsenceModal.jsx` was encountering errors when trying to:
1. **Line 69**: Fetch students from a class → `GET /api/classes/2/students` returned **404**
2. **Line 184**: Mark student absences → `POST /api/teacher/mark-student-absences` returned **404**

### Root Cause
The frontend was making requests to `http://localhost:4000/api/...` but the endpoints didn't exist on the auth-service. The actual endpoints were on the Reference_documents service running on port 3000, and there was also a port configuration mismatch.

### Secondary Issue
After adding the endpoints to the auth-service, attempting to directly access Reference_documents models in the auth-service context caused **500 errors** due to model initialization issues (models not loaded in auth-service context).

### Tertiary Issue
Backend services were shutting down after database synchronization completed, preventing any API calls from being processed.

## Solutions Implemented

### 1. Frontend Configuration Fix
**File**: `frontend/learnflow/src/admin/StudentAbsenceModal.jsx`

#### Change 1: Fixed GET endpoint (Line 69)
```javascript
// BEFORE: http://localhost:4000/api/classes/2/students (incorrect)
// AFTER: http://localhost:4000/api/auth/classes/{classId}/students

const response = await fetch(
  `http://localhost:4000/api/auth/classes/${schedule.classe_id}/students`,
  { headers, credentials: 'include' }
);
```

#### Change 2: Fixed POST endpoint (Line 184)
```javascript
// BEFORE: http://localhost:4000/api/teacher/mark-student-absences (incorrect)
// AFTER: http://localhost:4000/api/auth/teacher/mark-student-absences

const response = await fetch(
  'http://localhost:4000/api/auth/teacher/mark-student-absences',
  {
    method: 'POST',
    headers,
    credentials: 'include',
    body: JSON.stringify({
      schedule_id: schedule.id,
      absences: absenceRecords
    })
  }
);
```

### 2. Backend Service Routing - Auth Service
**File**: `backend/auth-service/routes/authRoutes.js`

#### Added GET Endpoint: Fetch Class Students
```javascript
/**
 * GET /api/auth/classes/:classId/students
 * Get all students in a specific class
 * Used by StudentAbsenceModal to fetch class students
 */
router.get('/classes/:classId/students', async (req, res) => {
  try {
    const { classId } = req.params;

    if (!classId) {
      return res.status(400).json({ error: 'Class ID is required' });
    }

    // Verify the class exists
    const classe = await Classe.findByPk(classId);
    if (!classe) {
      return res.status(404).json({ error: 'Class not found' });
    }

    // Get all students (Users with role='etudiant') assigned to this class
    const students = await utilisateur.findAll({
      where: {
        classe_id: classId,
        role: 'etudiant'
      },
      attributes: ['id', 'nom', 'prenom', 'email', 'numero_etudiant'],
      order: [['nom', 'ASC'], ['prenom', 'ASC']]
    });

    console.log(`✅ Found ${students.length} students in class ${classId}`);
    res.json(students || []);
  } catch (error) {
    console.error('Error fetching class students:', error);
    res.status(500).json({ error: 'Failed to fetch students', details: error.message });
  }
});
```

**Why this approach?**
- Auth-service has direct access to the User model (stored in auth schema)
- Students are stored as User records with role='etudiant'
- This endpoint queries the auth schema, not the referentiels schema

#### Added POST Endpoint: Proxy to Reference Service
```javascript
/**
 * POST /api/auth/teacher/mark-student-absences
 * Mark attendance/absence for multiple students in a lesson
 * Proxies the request to the Reference_documents service on port 3000
 */
router.post('/teacher/mark-student-absences', async (req, res) => {
  try {
    const token = req.headers.authorization;
    const { schedule_id, absences } = req.body;

    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Forward the request to the Reference_documents service
    const referenceServiceUrl = 'http://localhost:3000/api/teacher/mark-student-absences';
    
    const response = await fetch(referenceServiceUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token  // Forward the JWT token
      },
      body: JSON.stringify({
        schedule_id,
        absences
      })
    });

    if (!response.ok) {
      const error = await response.json();
      return res.status(response.status).json(error);
    }

    const data = await response.json();
    res.status(response.status).json(data);

  } catch (error) {
    console.error('Error in POST /teacher/mark-student-absences:', error.message);
    res.status(500).json({ error: error.message });
  }
});
```

**Why this approach?**
- Reference_documents service owns the StudentAbsence model
- Auth-service acts as a proxy to maintain single entry point for frontend
- JWT token is forwarded to allow Reference service to identify the teacher
- Service-to-service communication keeps authentication centralized

### 3. Backend Service Stability Fixes

#### Auth Service Improvements
**File**: `backend/auth-service/server.js`

```javascript
// Error handling middleware to catch unhandled route errors
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// Create server reference instead of inline listen
const server = app.listen(4000, () => {
  console.log('✅ Auth service running on port 4000');
});

// Graceful shutdown handler
process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  server.close(async () => {
    await sequelize.close();
    process.exit(0);
  });
});

// Handle database sync errors
sequelize.sync({ alter: true })
  .then(() => {
    console.log('✅ Models synced with DB');
  })
  .catch((error) => {
    console.error('❌ Database sync error:', error);
    process.exit(1);
  });
```

#### Reference Service Improvements
**File**: `backend/Reference_documents/server.js`

```javascript
// Graceful shutdown handler
process.on('SIGTERM', () => {
  console.log('Shutting down gracefully...');
  server.close(async () => {
    await sequelize.close();
    process.exit(0);
  });
});

// Create server reference
const server = app.listen(3000, () => {
  console.log('✅ Reference service running on port 3000');
});
```

**Why these changes?**
- Services were exiting after database sync because no event listeners kept the process alive
- Error middleware catches unhandled errors in routes
- SIGTERM handlers ensure graceful shutdown (used by Docker, process managers)
- Server reference allows proper cleanup on shutdown

## Architecture Diagram

```
┌──────────────────────────────────┐
│      Frontend (React)            │
│  StudentAbsenceModal.jsx         │
└─────────────┬────────────────────┘
              │
              │ HTTP Requests
              │ Port 4000
              ▼
┌──────────────────────────────────┐
│   Auth Service (Node.js)         │
│   Port: 4000                     │
│                                  │
│  Routes:                         │
│  ├─ GET /api/auth/classes/:id/   │  ◄──── Queries User model
│  │   students                    │        (auth schema)
│  └─ POST /api/auth/teacher/      │
│      mark-student-absences       │  ◄──── Proxies to port 3000
│          │                       │        + forwards JWT token
│          └──────────┬────────────┘
│                     │
│                     │ HTTP Proxy (inter-service)
│                     │ Port 3000 + Authorization header
│                     │
│                     ▼
│       ┌──────────────────────────────────┐
│       │ Reference Service (Node.js)      │
│       │ Port: 3000                       │
│       │                                  │
│       │ Endpoint:                        │
│       │ POST /api/teacher/               │
│       │    mark-student-absences         │  ◄──── Writes StudentAbsence records
│       │                                  │
│       └─────────────┬────────────────────┘
│                     │
│                     │ SQL queries
│                     │
│                     ▼
│            ┌─────────────────┐
│            │  PostgreSQL     │
│            │  Schemas:       │
│            │  • auth         │
│            │  • referentiels │
│            └─────────────────┘
```

## Service Communication Flow

### GET Request: Fetch Class Students
```
1. Frontend sends: GET http://localhost:4000/api/auth/classes/2/students
                   Headers: { Authorization: "Bearer <token>" }

2. Auth Service processes:
   ├─ Verify class exists (Classe model)
   ├─ Query students with:
   │  WHERE classe_id = 2 AND role = 'etudiant'
   └─ Return: [{ id, nom, prenom, email }, ...]

3. Response sent to Frontend
```

### POST Request: Mark Student Absences
```
1. Frontend sends: POST http://localhost:4000/api/auth/teacher/mark-student-absences
                   Body: {
                     schedule_id: 1,
                     absences: [
                       { student_id: 1, absence_type: "absent", motif: "..." },
                       { student_id: 2, absence_type: "present", motif: null }
                     ]
                   }
                   Headers: { Authorization: "Bearer <token>" }

2. Auth Service processes:
   ├─ Verify token exists
   ├─ Create fetch request to Reference service:
   │  POST http://localhost:3000/api/teacher/mark-student-absences
   │  (WITH Authorization header forwarded)
   └─ Return response from Reference service

3. Reference Service processes:
   ├─ Extract teacher_id from JWT token
   ├─ For each absence record:
   │  ├─ Verify student exists
   │  ├─ Verify schedule exists
   │  └─ Create/update StudentAbsence record
   └─ Return: { message: "...", created: 2, updated: 0 }

4. Response chain returns through Auth Service to Frontend
```

## Testing Instructions

### Prerequisites
- Both backend services running on ports 3000 and 4000
- Frontend development server running (requires Node.js 20.19+ or 22.12+)
- PostgreSQL database with seeds/test data

### Manual API Testing (No Frontend Required)

#### Test 1: Fetch Class Students
```powershell
$headers = @{
    "Authorization" = "Bearer <valid-jwt-token>"
    "Content-Type" = "application/json"
}

Invoke-WebRequest `
  -Uri "http://localhost:4000/api/auth/classes/2/students" `
  -Headers $headers `
  -Method GET
```

**Expected Response:**
```json
[
  { "id": 1, "nom": "Doe", "prenom": "John", "email": "john@example.com", "numero_etudiant": "STU001" },
  { "id": 2, "nom": "Smith", "prenom": "Jane", "email": "jane@example.com", "numero_etudiant": "STU002" }
]
```

#### Test 2: Mark Student Absences
```powershell
$headers = @{
    "Authorization" = "Bearer <valid-jwt-token>"
    "Content-Type" = "application/json"
}

$body = @{
    "schedule_id" = 1
    "absences" = @(
        @{ "student_id" = 1; "absence_type" = "absent"; "motif" = "Medical appointment" },
        @{ "student_id" = 2; "absence_type" = "present"; "motif" = $null }
    )
} | ConvertTo-Json

Invoke-WebRequest `
  -Uri "http://localhost:4000/api/auth/teacher/mark-student-absences" `
  -Headers $headers `
  -Method POST `
  -Body $body
```

**Expected Response:**
```json
{
  "message": "Absences marked successfully",
  "created": 1,
  "updated": 1
}
```

### UI Testing (Requires Frontend)

1. **Upgrade Node.js** to version 20.19+ or 22.12+
   ```powershell
   nvm install 22.0.0
   nvm use 22.0.0
   ```

2. **Start Frontend**
   ```powershell
   cd frontend/learnflow
   npm run dev
   ```

3. **Navigate to Teacher Calendar**
   - Open http://localhost:5173
   - Login as teacher
   - Select a class schedule

4. **Test StudentAbsenceModal**
   - Click "Mark Attendance" button
   - Verify students load in the modal
   - Select absence types for students
   - Add motif (reason) for absences
   - Click "Submit"
   - Verify success message and absence records saved

## Files Modified

| File | Changes | Purpose |
|------|---------|---------|
| `frontend/learnflow/src/admin/StudentAbsenceModal.jsx` | Updated endpoint URLs to use auth-service on port 4000 | Fix frontend routing to correct backend service |
| `backend/auth-service/routes/authRoutes.js` | Added 2 new endpoints for student absence management | Provide API entry points for frontend |
| `backend/auth-service/server.js` | Added error handling middleware and graceful shutdown | Prevent service crashes and unexpected exits |
| `backend/Reference_documents/server.js` | Added graceful shutdown handler | Ensure proper cleanup on process termination |

## Key Technical Decisions

### 1. Why Proxy Instead of Direct Access?
**Decision**: Auth-service proxies requests to Reference-service instead of directly accessing StudentAbsence models

**Rationale**:
- StudentAbsence model is owned by Reference-service
- Models are not shared between services; each service has its own Sequelize instance
- Service-to-service communication maintains architectural boundaries
- Easier to debug and monitor inter-service traffic
- Can add additional business logic/validation in auth-service layer

### 2. Why Auth-service Handles GET Students?
**Decision**: Auth-service handles `/api/auth/classes/:classId/students` instead of Reference-service

**Rationale**:
- Students are stored in auth schema as User records with role='etudiant'
- Auth-service has direct access to User model
- Reference-service Student model is for academic reference data
- Reduces cross-schema queries and keeps data ownership clear

### 3. Why JWT Token Forwarding?
**Decision**: Auth-service forwards the JWT token to Reference-service in Authorization header

**Rationale**:
- Reference-service needs to identify which teacher is marking absences
- Teacher ID is extracted from JWT token in Reference-service
- Maintains authentication chain across services
- No credentials stored in inter-service communication

## Error Handling

### Common Errors and Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `404 Not Found` on GET students | Auth-service endpoint not found | Ensure authRoutes.js has updated code |
| `404 Not Found` on POST absences | Auth-service endpoint not found | Ensure authRoutes.js has updated code |
| `{"error":"Not authenticated"}` | Missing Authorization header | Ensure frontend includes Bearer token |
| `500 Internal Server Error` | Reference-service not responding | Verify Reference-service running on port 3000 |
| `500 Internal Server Error` | Database connection error | Check PostgreSQL is running and models synced |
| Services shutting down after sync | Missing SIGTERM handlers | Apply server.js updates to both services |

## Verification Checklist

- [x] Both backend services start without errors
- [x] Both services print "✅ Models synced with DB"
- [x] Both services stay running (don't exit after initialization)
- [x] Auth-service responds on port 4000
- [x] Reference-service responds on port 3000
- [x] GET /api/auth/classes/:id/students returns student list
- [x] POST /api/auth/teacher/mark-student-absences proxies correctly
- [ ] Frontend starts (requires Node.js 20.19+)
- [ ] StudentAbsenceModal loads students successfully
- [ ] StudentAbsenceModal submits absences successfully

## Next Steps

1. **Upgrade Node.js** if needed for frontend development
2. **Start all three servers** (auth-service, reference-service, frontend)
3. **Test StudentAbsenceModal** through the UI
4. **Monitor logs** for any errors or warnings
5. **Load test data** if needed for realistic testing

## Support

For additional issues or questions:
1. Check error logs in each service terminal
2. Verify database connection: `SELECT 1` in PostgreSQL
3. Verify network connectivity: `netstat -an | findstr 3000 4000`
4. Check environment variables in `.env` files
5. Review JWT token validity and expiration
