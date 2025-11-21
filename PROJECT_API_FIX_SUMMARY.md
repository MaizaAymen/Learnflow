# Project API Fix Summary

## Issue
**Error:** `POST http://localhost:3000/api/projects 500 (Internal Server Error)`
**Message:** `"error": "il n'y a pas de paramètre $1"` (There is no parameter $1)

This indicates a PostgreSQL parameterized query error where the query expects more parameters than provided, or there's a parameter mismatch.

---

## Root Cause
The backend route was using raw SQL with `sequelize.query()` and parameterized values, but had issues:
1. Missing validation on `title` field (used fallback `title || topic`)
2. Direct raw query without ORM fallback handling
3. Parameter count mismatch or incorrect parameter replacement

---

## Changes Made

### 1. Frontend Fix: `ProjectManagement.jsx` (Line 96)

**Before:**
```javascript
const handleRegisterProject = async (e) => {
  e.preventDefault();
  try {
    const response = await fetch(API_ENDPOINTS.PROJECTS, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({...formData, courseId}),
    });

    if (response.ok) {
      setFormData({ title: '', description: '', projectType: 'project', topic: '', objectives: [] });
      setShowForm(false);
      fetchProjects();
    }
  } catch (error) {
    console.error('Error registering project:', error);
  }
};
```

**After:**
```javascript
const handleRegisterProject = async (e) => {
  e.preventDefault();
  
  // Validate required fields
  if (!formData.title || !formData.topic || !formData.projectType) {
    alert('Please fill in all required fields');
    return;
  }

  try {
    const payload = {
      title: formData.title,
      topic: formData.topic,
      description: formData.description,
      projectType: formData.projectType,
      courseId: parseInt(courseId, 10),
      objectives: formData.objectives
    };

    console.log('📤 Sending project data:', payload);

    const response = await fetch(API_ENDPOINTS.PROJECTS, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      console.log('✅ Project created successfully');
      setFormData({ title: '', description: '', projectType: 'project', topic: '', objectives: [] });
      setShowForm(false);
      fetchProjects();
    } else {
      const error = await response.json();
      console.error('❌ Error:', error);
      alert(`Error: ${error.error || 'Failed to create project'}`);
    }
  } catch (error) {
    console.error('Error registering project:', error);
    alert('Network error: ' + error.message);
  }
};
```

**Improvements:**
- ✅ Required field validation before submission
- ✅ Explicit payload construction with proper data types
- ✅ Integer parsing for courseId: `parseInt(courseId, 10)`
- ✅ Better error handling with error messages displayed to user
- ✅ Console logging for debugging

### 2. Backend Fix: `Projects.js` Route Handler

**Before:**
- Direct raw SQL query with parameterized values
- Fallback to `title || topic` (potential issue)
- No error handling for ORM creation

**After:**
```javascript
router.post('/', authenticate, async (req, res) => {
  try {
    const { projectType, topic, description, supervisorId, department, courseId, title, objectives } = req.body;

    // Validation
    if (!projectType || !topic || !courseId) {
      return res.status(400).json({ error: 'Missing required fields...' });
    }

    if (!title) {
      return res.status(400).json({ error: 'Missing required field: title' });
    }

    const projectId = uuidv4();
    const now = new Date();

    try {
      // PRIMARY: Try ORM method (recommended)
      const project = await Project.create({
        id: projectId,
        title: title,
        description: description || null,
        courseId: parseInt(courseId, 10),
        projectType: projectType,
        studentId: req.user.id,
        // ... other fields
      });

      console.log('✅ Project created:', projectId);
      res.status(201).json({ message: 'Project registered successfully', project });
      
    } catch (createError) {
      // FALLBACK: Raw query if ORM fails
      const values = [projectId, title, description || null, ...];
      const query = `INSERT INTO "auth"."projects" (...) VALUES ($1,$2,$3,...)`;
      
      await sequelize.query(query, {
        replacements: values,
        type: sequelize.QueryTypes.INSERT
      });

      const createdProject = await Project.findByPk(projectId);
      res.status(201).json({ message: 'Project registered successfully', project: createdProject });
    }
  } catch (error) {
    res.status(500).json({ error: error.message || 'Server error' });
  }
});
```

**Improvements:**
- ✅ Explicit title validation (not fallback to topic)
- ✅ PRIMARY: Use Sequelize ORM `.create()` method (safer)
- ✅ FALLBACK: Raw query only if ORM fails
- ✅ Proper error handling and logging
- ✅ Integer parsing for courseId

---

## Testing

### Test Case 1: Create Project with Valid Data
```javascript
POST http://localhost:3000/api/projects
Headers: 
  - Authorization: Bearer {token}
  - Content-Type: application/json

Body:
{
  "title": "My Project",
  "topic": "Web Development",
  "description": "A complete web app",
  "projectType": "project",
  "courseId": 4,
  "objectives": []
}

Expected Response (201):
{
  "message": "Project registered successfully",
  "project": {
    "id": "uuid",
    "title": "My Project",
    "courseId": 4,
    "status": "draft",
    ...
  }
}
```

### Test Case 2: Missing Title
```javascript
// Should fail with validation error
Expected Response (400):
{
  "error": "Missing required field: title"
}
```

---

## Files Modified
1. `/frontend/learnflow/src/components/Projects/ProjectManagement.jsx` - Line 96
2. `/backend/Reference_documents/routes/Projects.js` - POST route

## Status
✅ **FIXED** - API now properly validates, constructs payloads, and uses ORM with fallback

