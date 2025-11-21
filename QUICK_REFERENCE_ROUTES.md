# 🚀 Quick Reference - Route Models Access Pattern

## For Developers: How to Add a New Route

### Step 1: Create Your Route File
**File**: `backend/Reference_documents/routes/YourRoute.js`

```javascript
const express = require('express');
const { uuidv4 } = require('../utils/uuidGenerator');

module.exports = (db, authenticate, logAudit) => {
  const router = express.Router();
  
  // Get models from the passed object
  const { YourModel, RelatedModel } = db.models || {};
  
  if (!YourModel) {
    console.error('❌ YourModel model not found');
  }

  // ✅ Create item
  router.post('/', authenticate, async (req, res) => {
    try {
      const { field1, field2 } = req.body;
      
      // Validate models exist
      if (!YourModel) {
        return res.status(500).json({ error: 'Service unavailable' });
      }
      
      const item = await YourModel.create({
        id: uuidv4(),
        field1,
        field2,
        userId: req.user.id
      });
      
      // Log audit
      await logAudit({
        userId: req.user.id,
        userName: req.user.name,
        action: 'CREATE',
        entityType: 'YourModel',
        entityId: item.id,
        description: 'Created item',
        status: 'success'
      });
      
      res.json(item);
    } catch (error) {
      console.error('Error creating item:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ✅ Get all items
  router.get('/', authenticate, async (req, res) => {
    try {
      if (!YourModel) {
        return res.status(500).json({ error: 'Service unavailable' });
      }
      
      const items = await YourModel.findAll();
      res.json(items);
    } catch (error) {
      console.error('Error fetching items:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ✅ Get item by ID
  router.get('/:id', authenticate, async (req, res) => {
    try {
      if (!YourModel) {
        return res.status(500).json({ error: 'Service unavailable' });
      }
      
      const item = await YourModel.findByPk(req.params.id);
      if (!item) {
        return res.status(404).json({ error: 'Item not found' });
      }
      res.json(item);
    } catch (error) {
      console.error('Error fetching item:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ✅ Update item
  router.put('/:id', authenticate, async (req, res) => {
    try {
      if (!YourModel) {
        return res.status(500).json({ error: 'Service unavailable' });
      }
      
      const item = await YourModel.findByPk(req.params.id);
      if (!item) {
        return res.status(404).json({ error: 'Item not found' });
      }
      
      const oldValues = { ...item.dataValues };
      await item.update(req.body);
      
      await logAudit({
        userId: req.user.id,
        userName: req.user.name,
        action: 'UPDATE',
        entityType: 'YourModel',
        entityId: item.id,
        description: 'Updated item',
        oldValues,
        newValues: item.dataValues,
        status: 'success'
      });
      
      res.json(item);
    } catch (error) {
      console.error('Error updating item:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ✅ Delete item
  router.delete('/:id', authenticate, async (req, res) => {
    try {
      if (!YourModel) {
        return res.status(500).json({ error: 'Service unavailable' });
      }
      
      const item = await YourModel.findByPk(req.params.id);
      if (!item) {
        return res.status(404).json({ error: 'Item not found' });
      }
      
      const itemData = { ...item.dataValues };
      await item.destroy();
      
      await logAudit({
        userId: req.user.id,
        userName: req.user.name,
        action: 'DELETE',
        entityType: 'YourModel',
        entityId: req.params.id,
        description: 'Deleted item',
        oldValues: itemData,
        status: 'success'
      });
      
      res.json({ message: 'Item deleted successfully' });
    } catch (error) {
      console.error('Error deleting item:', error);
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};
```

### Step 2: Register Route in Server
**File**: `backend/Reference_documents/server.js`

Add to the imports section:
```javascript
const YourRoutes = require("./routes/YourRoute");
```

Add to the mount section (after other professional feature routes):
```javascript
const db = { models };
app.use("/api/yourpath", YourRoutes(db, authenticate, logAudit));
```

### Step 3: Ensure Model is Exported
**File**: `backend/Reference_documents/models/index.js`

Make sure your model is required and exported:
```javascript
const YourModel = require('./YourModel');

module.exports = {
  // ... other models
  YourModel,
  // ... other models
};
```

---

## Common Patterns

### ✅ DO - Simple Model Access
```javascript
const { Model } = db.models || {};

if (!Model) {
  console.error('❌ Model not found');
  return res.status(500).json({ error: 'Service unavailable' });
}
```

### ❌ DON'T - Complex Fallbacks
```javascript
const { Model } = db.models || db.sequelize?.models || {};
```

### ✅ DO - Check Before Use
```javascript
if (!Model) {
  return res.status(500).json({ error: 'Service unavailable' });
}

const items = await Model.findAll();
```

### ❌ DON'T - Assume Exists
```javascript
const items = await Model.findAll(); // Could fail if Model is undefined
```

### ✅ DO - Multiple Models
```javascript
const { Model1, Model2, Model3 } = db.models || {};

if (!Model1 || !Model2 || !Model3) {
  console.error('❌ Required models not found');
  return res.status(500).json({ error: 'Service unavailable' });
}
```

---

## Available Middleware

### `authenticate`
Validates JWT token and extracts user info

**Usage**:
```javascript
router.post('/', authenticate, async (req, res) => {
  const userId = req.user.id;
  const userRole = req.user.role;
  // ...
});
```

### `logAudit`
Logs actions for compliance and debugging

**Usage**:
```javascript
await logAudit({
  userId: req.user.id,
  userName: req.user.name,
  action: 'CREATE', // CREATE, READ, UPDATE, DELETE
  entityType: 'ModelName',
  entityId: item.id,
  description: 'What was done',
  oldValues: null, // For updates
  newValues: null, // For updates
  status: 'success' // or 'error'
});
```

---

## Error Handling Template

```javascript
try {
  // Your code here
  
  // Always check if model exists before using
  if (!YourModel) {
    return res.status(500).json({ error: 'Service unavailable' });
  }
  
  const result = await YourModel.operation();
  res.json(result);
  
} catch (error) {
  console.error('Error in operation:', error);
  
  // Handle specific error types
  if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message });
  }
  
  if (error.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({ error: 'Duplicate entry' });
  }
  
  // Generic error response
  res.status(500).json({ error: 'Internal server error' });
}
```

---

## Validation Template

```javascript
// Validate input
const { field1, field2 } = req.body;

if (!field1 || !field2) {
  return res.status(400).json({ 
    error: 'Missing required fields',
    required: ['field1', 'field2']
  });
}

// Validate types
if (typeof field1 !== 'string') {
  return res.status(400).json({ 
    error: 'Invalid field type',
    field: 'field1',
    expected: 'string'
  });
}

// Validate length
if (field1.length < 3 || field1.length > 100) {
  return res.status(400).json({ 
    error: 'Field length out of range',
    field: 'field1',
    min: 3,
    max: 100
  });
}
```

---

## Testing Your Route

### Using cURL
```bash
# GET
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/yourpath

# POST
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"field1":"value1","field2":"value2"}' \
  http://localhost:3000/api/yourpath

# PUT
curl -X PUT \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"field1":"updated"}' \
  http://localhost:3000/api/yourpath/id

# DELETE
curl -X DELETE \
  -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/yourpath/id
```

### Using Postman
1. Set Authorization header: `Bearer {token}`
2. Set Content-Type: `application/json`
3. Test each endpoint with sample data

---

## Troubleshooting

### "Model not found" Error
✅ **Solution**: Check `/models/index.js` exports your model

### Models Undefined
✅ **Solution**: Verify server.js passes `const db = { models };`

### Authentication Failing
✅ **Solution**: Make sure token is in Authorization header as `Bearer {token}`

### Database Errors
✅ **Solution**: Check model relationships in `/models/associations`

---

## Quick Checklist for New Route

- [ ] Route file created in `routes/`
- [ ] Route exports a function: `module.exports = (db, authenticate, logAudit) => {}`
- [ ] Models destructured safely: `const { Model } = db.models || {};`
- [ ] Models checked before use: `if (!Model) return error`
- [ ] Route registered in server.js
- [ ] Error handling implemented
- [ ] Audit logging added for important actions
- [ ] Middleware applied: `authenticate`
- [ ] Response formats consistent with other routes
- [ ] Tested with cURL or Postman

---

## Related Documentation

- 📖 `ROUTE_PATTERNS_GUIDE.md` - Full pattern documentation
- 📖 `ROUTES_MODELS_FIX_SUMMARY.md` - What was fixed
- 📖 `VERIFICATION_REPORT_ROUTES.md` - Technical verification
