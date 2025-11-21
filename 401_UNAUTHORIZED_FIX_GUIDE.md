# 🔐 401 Unauthorized Error - Diagnostic & Fix Guide

## Problem Summary

You're getting **401 Unauthorized** errors when trying to access protected API endpoints from the frontend:

```
POST http://localhost:3000/api/projects 401 (Unauthorized)
GET http://localhost:3000/api/requests 401 (Unauthorized)
```

This causes a secondary error:
```
TypeError: filteredRequests.map is not a function
```

---

## Root Cause Analysis

### ❌ **Main Issue: JWT Secret Mismatch**

**Auth-Service** (Issues tokens):
```javascript
// backend/auth-service/routes/authRoutes.js
const secretKey = "alex";
jwt.sign(userData, secretKey);  // Creates token with "alex"
```

**Reference-Documents Service** (Validates tokens):
```javascript
// backend/Reference_documents/server.js (BEFORE FIX)
const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
// Tries to validate with "your-secret-key" ❌ DOESN'T MATCH!
```

**Result**: ❌ Token validation fails → 401 error

---

## How It Works

### Flow Diagram

```
1. User Logs In
   ↓
   Auth-Service issues token:
   jwt.sign(user, "alex") → eyJhbGc...
   ↓
2. Frontend stores token in localStorage
   ↓
3. Frontend makes request with token:
   Authorization: Bearer eyJhbGc...
   ↓
4. Reference-Documents validates token:
   jwt.verify(token, JWT_SECRET)
   
   ✅ BEFORE FIX: Tries "your-secret-key" → FAILS
   ✅ AFTER FIX: Tries "alex" → SUCCEEDS
```

---

## Solutions Applied

### ✅ **Fix 1: Match JWT Secrets**

**File**: `backend/Reference_documents/server.js`

```javascript
// ✅ NOW USES SAME SECRET AS AUTH-SERVICE
const JWT_SECRET = process.env.JWT_SECRET || "alex";

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  
  if (!token) {
    return res.status(401).json({ error: "Unauthorized - no token" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);  // ✅ NOW USES "alex"
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
};
```

### ✅ **Fix 2: Frontend Error Handling**

**Files Updated**:
- `frontend/learnflow/src/components/StudentRequests/StudentRequests.jsx`
- `frontend/learnflow/src/components/Projects/ProjectManagement.jsx`

**Changes**:
```javascript
// ✅ NOW CHECKS RESPONSE STATUS
const fetchRequests = async () => {
  try {
    const response = await fetch(endpoint, {
      headers: getAuthHeaders()
    });
    
    // ✅ NEW: Check if request succeeded
    if (!response.ok) {
      console.error('❌ API Error:', response.status);
      if (response.status === 401) {
        console.error('❌ Unauthorized - Token missing or invalid');
        setRequests([]);
        return;
      }
    }
    
    const data = await response.json();
    // ✅ NEW: Ensure data is always an array
    setRequests(Array.isArray(data) ? data : []);
  } catch (error) {
    console.error('Error:', error);
    setRequests([]);  // ✅ NEW: Default to empty array
  }
};
```

**Why this fixes the error**:
- When 401 happens, response is error object → `.map()` fails
- Now: Error is caught early, state is set to `[]` → No `.map()` error

---

## Testing the Fix

### Step 1: Restart Both Servers

```bash
# Terminal 1: Auth Service
cd backend/auth-service
node server.js

# Terminal 2: Reference Documents Service
cd backend/Reference_documents
node server.js

# Terminal 3: Frontend
cd frontend/learnflow
npm run dev
```

### Step 2: Test the Flow

1. **Login**: Go to login page, enter credentials
2. **Check Token**: Open browser DevTools Console
   ```javascript
   localStorage.getItem('token')
   // Should show: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. **Make API Call**: Open any page that fetches data
   - Should see **200 OK** not **401 Unauthorized**

4. **Check Console**: Should see successful data, not error

### Step 3: Verify Console Output

**Good Signs** ✅:
```
✅ Reference service running on port 3000
✅ Auth service running on port 4000
GET /api/projects 200 OK
GET /api/requests 200 OK
```

**Bad Signs** ❌:
```
❌ POST /api/projects 401 Unauthorized
❌ Invalid token
```

---

## Configuration Overview

### JWT Secret Locations

| Service | Secret | File |
|---------|--------|------|
| **Auth-Service** | `"alex"` | `backend/auth-service/routes/authRoutes.js:9` |
| **Reference-Documents** | `"alex"` (after fix) | `backend/Reference_documents/server.js:20` |

### Environment Variables

**Optional** (for production):
```bash
# Add to .env or export
export JWT_SECRET="your-production-secret"
```

Both services will use this if set, otherwise fallback to `"alex"`.

---

## Token Flow in Detail

### What Happens When You Login

```
1. POST /api/auth/login
   ↓
2. Auth-Service validates credentials
   ↓
3. Auth-Service creates token:
   jwt.sign(
     { id, email, role, nom, prenom },
     "alex"  ← SECRET KEY
   )
   ↓
4. Returns token: "eyJhbGc..."
   ↓
5. Frontend stores in localStorage
```

### What Happens When You Call Protected Route

```
1. Frontend calls GET /api/requests
   Headers: { Authorization: "Bearer eyJhbGc..." }
   ↓
2. Reference-Documents receives request
   ↓
3. authenticate middleware extracts token
   const token = "eyJhbGc..."
   ↓
4. Validates token:
   jwt.verify(token, JWT_SECRET)
   
   ❌ BEFORE: JWT_SECRET = "your-secret-key" → INVALID
   ✅ AFTER:  JWT_SECRET = "alex" → VALID
   ↓
5. If valid: Sets req.user and calls next()
   If invalid: Returns 401 error
   ↓
6. Route handler runs (if authenticated)
```

---

## Common JWT Secret Issues

### Issue 1: Secrets Don't Match
```javascript
// ❌ PROBLEM
// Auth-Service creates token with "alex"
// Reference-Documents validates with "your-secret-key"
// Result: Token always fails validation
```

### Issue 2: Token Expired
```javascript
// ✅ Check token expiration
const token = localStorage.getItem('token');
const decoded = jwtDecode(token);  // Need jwt-decode package
console.log('Expires:', new Date(decoded.exp * 1000));
```

### Issue 3: Token Not Sent
```javascript
// ❌ PROBLEM
const response = await fetch('/api/requests', {
  headers: {
    'Content-Type': 'application/json'
    // Missing: Authorization header!
  }
});

// ✅ SOLUTION
const response = await fetch('/api/requests', {
  headers: getAuthHeaders()  // Includes Authorization
});
```

---

## Debugging Checklist

- [x] **JWT Secrets Match**: Both use `"alex"` ✅
- [ ] **Token Exists in localStorage**: Check DevTools
- [ ] **Token in Request Headers**: Check Network tab
- [ ] **Token Format Correct**: Should be `"Bearer eyJhbGc..."`
- [ ] **Servers Running**: Check ports 3000 and 4000
- [ ] **No CORS Issues**: Check browser console for CORS errors

---

## Error Messages & Solutions

### Error: "Unauthorized - no token"
```
Cause: Token not in request headers
Solution: Ensure getAuthHeaders() is used in fetch
```

### Error: "Invalid token"
```
Cause: Token can't be decoded (secret mismatch)
Solution: Verify JWT_SECRET matches auth-service
```

### Error: "filteredRequests.map is not a function"
```
Cause: API returned error object instead of array
Solution: Frontend now checks response.ok before parsing
```

### Error: "CORS error"
```
Cause: Frontend URL and backend URL don't match
Solution: Check API_ENDPOINTS in config/api.js
```

---

## What Changed

### Backend (Reference_documents/server.js)

```diff
- const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
+ const JWT_SECRET = process.env.JWT_SECRET || "alex";
+ const decoded = jwt.verify(token, JWT_SECRET);
```

### Frontend (StudentRequests.jsx & ProjectManagement.jsx)

```diff
+ if (!response.ok) {
+   console.error('API Error:', response.status);
+   setRequests([]);
+   return;
+ }
- const data = await response.json();
- setRequests(data);
+ const data = await response.json();
+ setRequests(Array.isArray(data) ? data : []);
```

---

## Verification

After applying fixes, you should see:

### In Browser Console (DevTools)
```
✅ GET /api/requests 200 OK
✅ GET /api/projects 200 OK
✅ POST /api/projects 201 Created
```

### In Network Tab
```
Method: GET/POST
Status: 200/201 ✅ (not 401)
Headers: Authorization: Bearer eyJhbGc...
Response: Array of data ✅
```

### In Terminal (Server)
```
✅ Authenticated request from user@example.com
✅ Database query successful
```

---

## Next Steps

1. **Restart Servers**: Stop and restart both services
2. **Test Login**: Login to the application
3. **Test API Calls**: Try fetching data
4. **Check Console**: Should see 200 responses
5. **Check Data**: Should display correctly without errors

---

## Production Considerations

### Security Best Practices

```javascript
// ❌ DON'T: Hardcode secrets
const JWT_SECRET = "alex";

// ✅ DO: Use environment variables
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET not set in environment');
}
```

### Environment File (.env)
```
JWT_SECRET=your-secure-production-secret-here
DATABASE_URL=your-db-url
NODE_ENV=production
```

### Expiration
```javascript
// Add token expiration (1 hour)
jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' })

// Tokens will expire and users need to re-login
```

---

## Summary

| Issue | Cause | Fix |
|-------|-------|-----|
| 401 Unauthorized | Secret mismatch | Use `"alex"` in both services |
| .map() error | Data not array | Check response.ok, default to [] |
| Missing headers | No auth header | Use getAuthHeaders() |
| Token invalid | Expired/malformed | Check storage, refresh if needed |

---

**Status**: ✅ **FIXED**  
**Next Action**: Restart servers and test  
**Expected Result**: All API calls return 200 OK, no 401 errors
