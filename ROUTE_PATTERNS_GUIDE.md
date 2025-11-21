# Route Patterns Guide - Learnflow Backend

## Overview
This guide explains the different patterns used in the Learnflow backend routes and when each pattern is appropriate.

---

## Pattern 1: Module-Based Routes (With Dependency Injection)

**Files Using This Pattern**:
- `Announcements.js`
- `Audit.js`
- `Comments.js`
- `Documents.js`
- `Exams.js`
- `Grades.js`
- `Internships.js`
- `Projects.js`
- `StudentRequests.js`

### Structure
```javascript
// ✅ Route file
module.exports = (db, authenticate, logAudit) => {
  const router = express.Router();
  
  // Get models from the passed object
  const { SomeModel, AnotherModel } = db.models || {};
  
  if (!SomeModel) {
    console.error('❌ SomeModel not found');
  }
  
  // Define routes here
  router.get('/', authenticate, async (req, res) => {
    // ...
  });
  
  return router;
};
```

### Server Setup
```javascript
// ✅ In server.js
const db = { models };
app.use("/api/route-path", RouteModule(db, authenticate, logAudit));
```

### When to Use
✅ Use this pattern when:
- Route needs dependency injection
- Route needs access to multiple models
- Route needs audit logging
- Route needs authentication middleware
- Multiple models need to be accessed from a single route

### Benefits
- **Loose Coupling**: Routes don't directly require models
- **Testability**: Easy to mock dependencies
- **Reusability**: Can pass different implementations
- **Middleware Integration**: Can bind authentication and logging

### Model Access Rules
```javascript
// ✅ CORRECT - Simple fallback
const { Model } = db.models || {};

// ❌ WRONG - Complex fallback chains
const { Model } = db.models || db.sequelize?.models || {};

// ❌ WRONG - Direct require (breaks pattern)
const Model = require('../models/Model');
```

---

## Pattern 2: Direct Model Imports

**Files Using This Pattern**:
- `Calendar.js`
- `Course.js`
- `Reference.js`
- `Students.js`
- `StudentsUpdated.js`
- `Students_backup.js`

### Structure
```javascript
// ✅ Route file with direct imports
const express = require('express');
const router = express.Router();
const Model = require('../models/Model');
const AnotherModel = require('../models/AnotherModel');

// Define routes directly
router.get('/', async (req, res) => {
  // ...
});

module.exports = router;
```

### Server Setup
```javascript
// ✅ In server.js
const RouteModule = require('./routes/RouteName');
app.use("/api/route-path", RouteModule);
```

### When to Use
✅ Use this pattern when:
- Route is large and complex
- Route file itself handles models directly
- Route doesn't need dependency injection
- Route doesn't need centralized middleware

### Considerations
- **Tight Coupling**: Routes directly depend on specific models
- **Harder to Test**: Can't easily mock dependencies
- **Model Organization**: Models must be properly initialized before routes
- **No Middleware Integration**: Each route handles its own concerns

---

## Pattern 3: App-Provided Models

**Files Using This Pattern**:
- `DirectorApproval.js`

### Structure
```javascript
// ✅ Route file accessing models from app
const express = require('express');
const router = express.Router();

router.get('/endpoint', async (req, res) => {
  const models = req.app.get('models');
  const { SomeModel } = models;
  
  // ...
});

module.exports = router;
```

### Server Setup
```javascript
// ✅ In server.js
app.set('models', models);
const RouteModule = require('./routes/RouteName');
app.use("/api/route-path", RouteModule);
```

### When to Use
✅ Use this pattern when:
- Route is already integrated into existing codebase
- Models are accessed inside route handlers
- Need access to app-level resources

### Considerations
- **Runtime Access**: Models retrieved at request time
- **Less Explicit**: Dependencies not clear from route definition
- **App Coupling**: Routes tightly coupled to app structure

---

## Pattern 4: JWT-Based Token Routes

**Files Using This Pattern**:
- `TeacherCalendar.js`

### Structure
```javascript
// ✅ Route with JWT token parsing
const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

const secretKey = 'your-secret-key';

const getTeacherIdFromRequest = (req) => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const decoded = jwt.verify(token, secretKey);
      return decoded.id;
    } catch (error) {
      return null;
    }
  }
  return null;
};

router.get('/endpoint', async (req, res) => {
  const teacherId = getTeacherIdFromRequest(req);
  // ...
});

module.exports = router;
```

### When to Use
✅ Use this pattern when:
- Route has custom authentication logic
- Need to extract specific claims from JWT
- Authentication varies from standard middleware

---

## Migration Guide: Updating Old Pattern to New Pattern

### Before (Complex Pattern)
```javascript
const { Model } = db.models || db.sequelize?.models || {};
```

### After (Simplified Pattern)
```javascript
const { Model } = db.models || {};
```

### Why?
1. **Simpler**: No complex fallback chains
2. **More Reliable**: Clear expectation of object structure
3. **Easier to Debug**: Fewer places for issues to hide
4. **Better Error Messages**: If model isn't found, error is clear

---

## Best Practices

### ✅ DO:
- Use `db.models || {}` for safe destructuring
- Check if required models exist before using them
- Log clear error messages when models are missing
- Keep routes focused on single concerns
- Pass dependencies explicitly

### ❌ DON'T:
- Use complex fallback chains like `db.models || db.sequelize?.models || {}`
- Access models directly without checking for null/undefined
- Mix patterns within the same route file
- Assume models are available without initialization
- Create circular dependencies between routes and models

---

## Troubleshooting

### "Model not found" Error
```javascript
if (!Model) {
  console.error('❌ Model model not found');
  return res.status(500).json({ error: 'Service unavailable' });
}
```

### Models Undefined
- Check that models are imported in `/models/index.js`
- Verify models are exported from `/models/index.js`
- Ensure associations are created before routes are mounted
- Check server.js passes `{ models }` correctly

### Dependency Injection Not Working
- Verify module.exports returns a function
- Check function receives three parameters: (db, authenticate, logAudit)
- Ensure server.js calls the function with correct parameters

---

## Code Organization Example

```
backend/Reference_documents/
├── models/
│   ├── index.js           # Main model file with all associations
│   ├── Model1.js
│   ├── Model2.js
│   └── ...
├── routes/
│   ├── Announcements.js   # Pattern 1: Dependency Injection
│   ├── Calendar.js        # Pattern 2: Direct Imports
│   ├── DirectorApproval.js # Pattern 3: App-Provided Models
│   └── ...
├── config/
│   └── database.js
└── server.js              # Main entry point
```

---

## Next Steps

1. **Maintain Pattern Consistency**: When adding new routes, use Pattern 1 (Module-Based with Dependency Injection)
2. **Gradual Migration**: Consider migrating Pattern 2 routes to Pattern 1 when convenient
3. **Documentation**: Keep this guide updated as patterns evolve
4. **Testing**: Create tests for each pattern type
