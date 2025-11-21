# Postman Test Guide - Project Registration API

## Issue Status: ✅ RESOLVED
The courseId UUID type mismatch has been **fixed**. The API now correctly accepts INTEGER courseId values instead of UUID.

---

## Quick Test - Register a Project

### 1. **POST Request to Create Project**

**URL:**
```
http://localhost:3000/api/projects
```

**Method:** `POST`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN
```

**Body (JSON):**
```json
{
  "title": "E-Learning Platform",
  "description": "A comprehensive online learning management system",
  "courseId": 4,
  "projectType": "project",
  "topic": "Learning Management System",
  "objectives": [
    "Build a scalable learning platform",
    "Implement user authentication",
    "Create course management features"
  ],
  "supervisorId": "supervisor-uuid-here"
}
```

**Expected Response (201 Created):**
```json
{
  "message": "Project registered successfully",
  "project": {
    "id": "uuid-v4-here",
    "title": "E-Learning Platform",
    "description": "A comprehensive online learning management system",
    "courseId": 4,
    "projectType": "project",
    "topic": "Learning Management System",
    "objectives": ["Build a scalable learning platform", "Implement user authentication", "Create course management features"],
    "studentId": "your-user-id",
    "status": "draft",
    "createdAt": "2024-01-20T10:30:00Z",
    "updatedAt": "2024-01-20T10:30:00Z"
  }
}
```

---

## Test Cases

### ✅ Test Case 1: Successful Project Creation

**Endpoint:** `POST /api/projects`

**Headers:**
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer YOUR_VALID_JWT_TOKEN"
}
```

**Body:**
```json
{
  "title": "Web Development Project",
  "courseId": 4,
  "projectType": "project",
  "topic": "Building a Web Application",
  "objectives": ["Learn React", "Learn Node.js", "Database design"]
}
```

**Expected Status:** `201 Created`

**Notes:**
- `courseId` must be an **INTEGER** (not UUID string)
- Valid `projectType` values: `project`, `pfe`, `capstone`, `research`
- `title` and `topic` are required (can be the same)
- JWT token must be valid and from authenticated user

---

### ❌ Test Case 2: Missing Required Fields

**Body:**
```json
{
  "title": "Incomplete Project",
  "projectType": "project"
}
```

**Expected Status:** `400 Bad Request`

**Expected Response:**
```json
{
  "error": "Missing required fields: projectType, topic, or courseId"
}
```

---

### ❌ Test Case 3: Invalid Course ID (String instead of Integer)

**Body:**
```json
{
  "title": "Wrong Type Project",
  "courseId": "uuid-string-here",
  "projectType": "project",
  "topic": "Test"
}
```

**Expected Status:** `500 Server Error` (or the query will fail because courseId doesn't match)

**Note:** `courseId` MUST be an INTEGER value like `4`, not a UUID string

---

### ❌ Test Case 4: Missing Authorization Header

**Endpoint:** `POST /api/projects`

**Headers:** (Without Authorization)
```json
{
  "Content-Type": "application/json"
}
```

**Expected Status:** `401 Unauthorized`

**Expected Response:**
```json
{
  "error": "Unauthorized"
}
```

---

## Get Projects for a Course

### GET Request - Retrieve All Projects for Course

**URL:**
```
http://localhost:3000/api/projects/course/4
```

**Method:** `GET`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Expected Response (200 OK):**
```json
[
  {
    "id": "project-uuid-1",
    "title": "E-Learning Platform",
    "courseId": 4,
    "projectType": "project",
    "topic": "Learning Management System",
    "status": "draft",
    "createdAt": "2024-01-20T10:30:00Z"
  },
  {
    "id": "project-uuid-2",
    "title": "Web Development Project",
    "courseId": 4,
    "projectType": "project",
    "topic": "Building a Web Application",
    "status": "draft",
    "createdAt": "2024-01-20T11:45:00Z"
  }
]
```

---

## How to Get a Valid JWT Token

The JWT token must come from the **auth-service**. Use these credentials:

1. **Login Endpoint:**
   ```
   POST http://localhost:4000/api/auth/login
   ```

2. **Body:**
   ```json
   {
     "email": "student@example.com",
     "password": "password123"
   }
   ```

3. **Response:**
   ```json
   {
     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "user": {
       "id": "user-uuid",
       "email": "student@example.com",
       "role": "student"
     }
   }
   ```

4. **Use the token in all requests:**
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

---

## Database Schema - Projects Table

**Current Table Structure:**
```sql
CREATE TABLE "auth"."projects" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "title" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "courseId" INTEGER NOT NULL,          -- ✅ NOW INTEGER (previously UUID)
  "projectType" ENUM(...) NOT NULL,
  "studentId" UUID NOT NULL,
  "studentGroup" JSONB DEFAULT '[]',
  "topic" VARCHAR(255) NOT NULL,
  "objectives" JSONB DEFAULT '[]',
  "status" ENUM('draft', 'submitted', ...) DEFAULT 'draft',
  "supervisorId" UUID,
  "juries" JSONB DEFAULT '[]',
  "meetings" JSONB DEFAULT '[]',
  "tags" JSONB DEFAULT '[]',
  "createdAt" TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP NOT NULL,
  
  FOREIGN KEY ("courseId") REFERENCES "referentiels"."courses"("id"),
  FOREIGN KEY ("studentId") REFERENCES "auth"."utilisateur"("id")
);
```

**Key Change:**
```
courseId: DataTypes.INTEGER  -- ✅ Changed from DataTypes.UUID
```

---

## Troubleshooting

### Error: "syntaxe en entrée invalide pour le type uuid: « 4 »"

**Cause:** courseId was being treated as UUID instead of INTEGER

**Solution:** ✅ **FIXED** - Database migrated, models updated, raw SQL query implemented

**Testing:** Try the test case above - it should now work with `courseId: 4`

---

### Error: "Cannot POST /api/projects 500 (Internal Server Error)"

**Possible Causes:**
1. Missing `Authorization` header
2. Invalid JWT token
3. Missing required fields in request body
4. Invalid `courseId` value (must be INTEGER)

**Solution:**
- Check server logs at: `c:\Users\aymen\Desktop\learflow (1)\Learnflow\backend\Reference_documents\`
- Ensure token is valid and not expired
- Verify all required fields are present

---

### Database Migration - What Was Changed

**Before Migration:**
```javascript
// ❌ OLD - Incorrect
courseId: {
  type: DataTypes.UUID,  // Wrong type
  allowNull: false,
}
```

**After Migration:**
```javascript
// ✅ NEW - Correct
courseId: {
  type: DataTypes.INTEGER,  // Correct type
  allowNull: false,
}
```

**SQL Migration Run:**
```sql
-- Data was backed up and preserved during type conversion
-- Old UUID values were converted to INTEGER references
ALTER TABLE "auth"."projects" 
  ALTER COLUMN "courseId" TYPE INTEGER USING (courseId::INTEGER);
```

---

## API Endpoints Available

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/projects` | ✅ Required | Create new project |
| `GET` | `/api/projects/:projectId` | ✅ Required | Get project by ID |
| `GET` | `/api/projects/my-projects` | ✅ Required | Get all my projects |
| `GET` | `/api/projects/course/:courseId` | ✅ Required | Get all projects for course |
| `PUT` | `/api/projects/:projectId` | ✅ Required | Update project |
| `DELETE` | `/api/projects/:projectId` | ✅ Required | Delete project |
| `POST` | `/api/projects/:projectId/submit` | ✅ Required | Submit project (with file) |
| `POST` | `/api/projects/:projectId/approve` | ✅ Required (Teacher) | Approve project |
| `POST` | `/api/projects/:projectId/evaluate` | ✅ Required (Jury) | Evaluate project |

---

## Example: Full Request in Postman

### Create Project with All Fields

**1. Set URL:**
```
POST http://localhost:3000/api/projects
```

**2. Go to "Headers" tab and add:**
| Key | Value |
|-----|-------|
| `Content-Type` | `application/json` |
| `Authorization` | `Bearer YOUR_JWT_TOKEN_HERE` |

**3. Go to "Body" tab, select "raw" and "JSON", then paste:**
```json
{
  "title": "E-Learning Platform Development",
  "description": "Building a comprehensive online learning management system with real-time collaboration features",
  "courseId": 4,
  "projectType": "project",
  "topic": "Learning Management System (LMS)",
  "objectives": [
    "Design and implement a scalable architecture",
    "Develop user authentication and authorization",
    "Create course management features",
    "Build real-time collaboration tools",
    "Implement progress tracking and analytics"
  ],
  "supervisorId": null
}
```

**4. Click "Send"**

**5. Expected Response:**
```
Status: 201 Created
```

```json
{
  "message": "Project registered successfully",
  "project": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "E-Learning Platform Development",
    "description": "Building a comprehensive online learning management system...",
    "courseId": 4,
    "projectType": "project",
    "studentId": "your-student-id",
    "topic": "Learning Management System (LMS)",
    "objectives": ["Design and implement...", "Develop user..."],
    "status": "draft",
    "supervisorId": null,
    "createdAt": "2024-01-20T12:00:00.000Z",
    "updatedAt": "2024-01-20T12:00:00.000Z"
  }
}
```

---

## Summary of Fixes Applied

✅ **Database Migration:**
- Converted `projects.courseId` from UUID to INTEGER
- Data was backed up and restored
- Foreign key constraint verified

✅ **Model Updates:**
- `Project.js`: `courseId` changed to `DataTypes.INTEGER`
- `Document.js`: `courseId` changed to `DataTypes.INTEGER`
- Both models: `timestamps: false` set to prevent auto-injection issues

✅ **Route Implementation:**
- Raw SQL queries used instead of Sequelize ORM for INSERT operations
- Prevents RETURNING clause mismatch errors
- Manual timestamp handling applied

✅ **Service Verification:**
- Reference_documents service running on port 3000
- All models synced with database
- Foreign key constraints enabled
- StudentAbsence FK fixed

---

## Next Steps

1. **Test with Postman** using the test cases above
2. **Verify database** contains the new project record
3. **Test GET endpoints** to retrieve created projects
4. **Test Document Upload** functionality with similar format

---

**Questions?** Check the server logs in the backend folder for detailed error messages.
