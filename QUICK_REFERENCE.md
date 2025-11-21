# 🚀 Quick Reference - Project Registration API

## ✅ Status: READY TO USE

---

## 1️⃣ Basic POST Request

```bash
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "My Project",
    "courseId": 4,
    "projectType": "project",
    "topic": "Learning System"
  }'
```

---

## 2️⃣ Postman Quick Setup

### Step 1: Import Collection
- File → Import → Select `Postman_Collection.json`

### Step 2: Set Variables
- Create Environment "Learnflow"
- `jwt_token` = Your JWT token from `/api/auth/login`

### Step 3: Run Test
- Collection → Projects API → ✅ TEST 1: Create Project

---

## 3️⃣ Request Format

### URL
```
POST http://localhost:3000/api/projects
```

### Headers
```
Content-Type: application/json
Authorization: Bearer {JWT_TOKEN}
```

### Body (JSON)
```json
{
  "title": "Project Title",
  "description": "Optional description",
  "courseId": 4,                    // ⭐ INTEGER, not UUID
  "projectType": "project",         // or pfe, capstone, research
  "topic": "Project Topic",
  "objectives": [                   // Optional
    "Objective 1",
    "Objective 2"
  ],
  "supervisorId": null              // Optional
}
```

---

## 4️⃣ Expected Responses

### ✅ Success (201 Created)
```json
{
  "message": "Project registered successfully",
  "project": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "My Project",
    "courseId": 4,
    "projectType": "project",
    "topic": "Learning System",
    "status": "draft",
    "createdAt": "2024-01-20T12:00:00Z"
  }
}
```

### ❌ Missing Fields (400 Bad Request)
```json
{
  "error": "Missing required fields: projectType, topic, or courseId"
}
```

### ❌ No Auth (401 Unauthorized)
```json
{
  "error": "Unauthorized"
}
```

---

## 5️⃣ Important Rules

| Rule | Example |
|------|---------|
| **courseId type** | `4` (INTEGER) ✅ NOT `"4"` or UUID ❌ |
| **Required fields** | `courseId`, `projectType`, `topic` |
| **JWT token** | Must be valid and not expired |
| **Valid types** | `project`, `pfe`, `capstone`, `research` |
| **Response status** | `201` = Success, `400` = Bad request, `401` = Auth failed, `500` = Server error |

---

## 6️⃣ Get Projects

### Get All Projects for Course
```
GET http://localhost:3000/api/projects/course/4
Authorization: Bearer {JWT_TOKEN}
```

### Get My Projects
```
GET http://localhost:3000/api/projects/my-projects
Authorization: Bearer {JWT_TOKEN}
```

---

## 7️⃣ What Was Fixed

| Before ❌ | After ✅ |
|-----------|---------|
| courseId was UUID type | courseId is now INTEGER |
| Error: "invalid input syntax for type uuid: « 4 »" | Projects create successfully with integer courseId |
| 500 Internal Server Error | 201 Created with project data |

---

## 8️⃣ Files Provided

📄 **POSTMAN_TEST_GUIDE.md** - Complete testing guide  
📄 **Postman_Collection.json** - Ready-to-import test suite  
📄 **FIX_SUMMARY.md** - Detailed fix explanation  
📄 **QUICK_REFERENCE.md** - This file  

---

## 9️⃣ Service Status

**Service:** Reference_documents  
**URL:** `http://localhost:3000`  
**Status:** ✅ Running  
**Port:** 3000  
**Database:** PostgreSQL (auth schema)

---

## 🔟 Test Now!

### Option A: Postman (Easiest)
1. Import `Postman_Collection.json`
2. Run login test first
3. Run create project test
4. See ✅ 201 Created response

### Option B: Frontend
1. Open Learnflow app
2. Login as student
3. Go to Projects section
4. Click "Register Project"
5. Fill form and submit
6. Should work without UUID errors!

### Option C: Command Line
```powershell
# Get token first
$response = Invoke-RestMethod -Uri "http://localhost:4000/api/auth/login" -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body '{"email":"student@example.com","password":"password123"}'
$token = $response.token

# Create project
Invoke-RestMethod -Uri "http://localhost:3000/api/projects" -Method POST `
  -Headers @{"Authorization"="Bearer $token"; "Content-Type"="application/json"} `
  -Body '{"title":"Test","courseId":4,"projectType":"project","topic":"Test"}'
```

---

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| `401 Unauthorized` | Check JWT token is valid and not expired |
| `400 Bad Request` | Verify all required fields present and courseId is INTEGER |
| `500 Server Error` | Check server logs in terminal |
| `404 Not Found` | Verify endpoint URL and port (3000) |
| Connection refused | Start service: `node .\server.js` in Reference_documents folder |

---

**Last Updated:** 2024-01-20  
**All Systems:** ✅ OPERATIONAL
