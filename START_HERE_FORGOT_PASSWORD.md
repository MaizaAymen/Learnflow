# 🎯 FORGOT PASSWORD - START HERE

## ⚡ 30-Second Quick Start

### 1️⃣ Start Auth Service
```powershell
cd backend\auth-service
npm start
```
✅ Wait for: `Auth service running on port 4000`

### 2️⃣ Refresh Frontend
```
Browser: Hard refresh with Ctrl + Shift + R
```

### 3️⃣ Access Forgot Password
```
http://localhost:5173/forgot-password
OR
Click "🔐 Forgot Password?" on login page
```

---

## 🔄 Complete Flow (2 minutes)

```
1. Enter email → Click "Send OTP"
2. Check email for 6-digit code
3. Enter OTP → Click "Verify"
4. Enter new password → Click "Reset"
5. Success! Login with new password
```

---

## ✅ What Was Fixed

| Issue | Fix |
|-------|-----|
| **404 on forgot-password** | Changed port 3000 → 4000 |
| **Route not found** | Changed /ForgotPassword → /forgot-password |
| **No link to forgot password** | Added link on login page |
| **API errors** | Updated all 4 endpoints |

---

## 📋 Files Changed

```
✅ frontend/learnflow/src/auth/ForgotPassword.jsx
   └─ Updated: 4 API endpoints (port 4000)

✅ frontend/learnflow/src/App.jsx
   └─ Updated: Route path (/forgot-password)

✅ frontend/learnflow/src/auth/auth.jsx
   └─ Added: Forgot password link
```

---

## 🔐 How It Works

```
Frontend (5173)
   ↓
   [Send OTP Request]
   ↓
Auth Service (4000)
   ├─ Generate 6-digit OTP
   ├─ Send email
   └─ Return success
   ↓
User Gets Email
   ↓
   [Submit OTP]
   ↓
Auth Service (4000)
   ├─ Verify OTP
   ├─ Check expiry
   └─ Mark verified
   ↓
   [Reset Password]
   ↓
Auth Service (4000)
   ├─ Hash password
   ├─ Update database
   └─ Send confirmation
   ↓
✅ Success!
```

---

## 🧪 Quick Test

### Test 1: From Login Page
1. Go to login page
2. Look for "🔐 Forgot Password?" link
3. Click it
4. ✅ Should see forgot password form

### Test 2: Request OTP
1. Enter a valid user email
2. Click "Send OTP"
3. ✅ Should see "OTP sent to your email"
4. ✅ Check your email for 6-digit code

### Test 3: Complete Flow
1. Enter OTP from email
2. Click "Verify"
3. Enter new password (must have: uppercase, lowercase, number, 8+ chars)
4. Click "Reset"
5. ✅ Should see success message
6. Login with new email + password
7. ✅ Should work!

---

## ❌ Troubleshooting

| Problem | Solution |
|---------|----------|
| **Link not showing** | Hard refresh (Ctrl+Shift+R) |
| **404 error** | Check auth-service is running on port 4000 |
| **No email** | Check spam, restart service |
| **OTP expired** | Click "Resend OTP" |
| **Can't reset password** | Password needs: UPPERCASE, lowercase, number, 8+ chars |

---

## 📞 Get Help

### Service Status
```
Auth Service:  http://localhost:4000  (should be running)
Frontend:      http://localhost:5173  (should be running)
```

### Check Logs
```
Auth Service terminal: Watch for errors
Browser console:       Press F12, check console tab
```

### Reset if Needed
```
Stop both services (Ctrl+C in terminals)
Hard refresh browser (Ctrl+Shift+R)
Restart services
Try again
```

---

## ✨ Features

```
✅ OTP via email
✅ 10-minute expiry
✅ Max 5 attempts
✅ Password requirements enforced
✅ Secure bcrypt hashing
✅ Auto-cleanup
✅ Email templates
✅ Responsive design
✅ Error handling
✅ Mobile friendly
```

---

## 🎯 That's It!

Your forgot password feature is ready to use.

### Quick Commands
```powershell
# Start auth service
cd backend\auth-service && npm start

# Start frontend (new terminal)
cd frontend\learnflow && npm run dev

# Visit
http://localhost:5173/forgot-password
```

---

## 📚 Need More Details?

See these files:
- `FORGOT_PASSWORD_SETUP_COMPLETE.md` - Full setup guide
- `FORGOT_PASSWORD_FIX_GUIDE.md` - Detailed fixes
- `QUICK_START_FORGOT_PASSWORD.md` - Quick reference
- `VERIFICATION_REPORT.md` - Complete verification
- `SYSTEM_ARCHITECTURE_FORGOT_PASSWORD.md` - System diagram

---

**Status:** ✅ READY  
**Version:** 1.0  
**Updated:** November 20, 2025

🚀 **Start now and enjoy password recovery!**
