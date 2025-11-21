# 🎯 FORGOT PASSWORD - SYSTEM ARCHITECTURE

## Complete Data Flow

```
USER BROWSER (Port 5173)
│
├─ Login Page
│  ├─ Email/Password fields
│  ├─ "Sign In" button
│  └─ "🔐 Forgot Password?" link ← NEW!
│
├─ [User clicks "Forgot Password?"]
│  └─ Navigate to: /forgot-password
│
├─ Forgot Password Form
│  │
│  ├─ [Step 1: Email Entry]
│  │  ├─ Input: user@example.com
│  │  ├─ POST http://localhost:4000/api/auth/forgot-password
│  │  │  │
│  │  │  └─ AUTH SERVICE (Port 4000)
│  │  │     ├─ Generate 6-digit OTP
│  │  │     ├─ Store in Map with 10-min expiry
│  │  │     ├─ Send Email
│  │  │     └─ Return: {"message": "...", "email": "us***om"}
│  │  │
│  │  └─ Display: "OTP sent to your email"
│  │
│  ├─ [Step 2: OTP Entry]
│  │  ├─ Email check: ✅ Received in inbox
│  │  ├─ Input: 123456 (from email)
│  │  ├─ POST http://localhost:4000/api/auth/verify-otp
│  │  │  │
│  │  │  └─ AUTH SERVICE (Port 4000)
│  │  │     ├─ Validate OTP format
│  │  │     ├─ Check expiry (10 min)
│  │  │     ├─ Check attempts (max 5)
│  │  │     ├─ Mark as verified
│  │  │     └─ Return: {"verified": true}
│  │  │
│  │  └─ Display: "OTP verified successfully!"
│  │
│  └─ [Step 3: Password Reset]
│     ├─ Input: NewPassword123
│     ├─ Validate: 8+ chars, uppercase, lowercase, number
│     ├─ POST http://localhost:4000/api/auth/reset-password
│     │  │
│     │  └─ AUTH SERVICE (Port 4000)
│     │     ├─ Check OTP verified status
│     │     ├─ Hash password (bcrypt)
│     │     ├─ Update database
│     │     ├─ Send confirmation email
│     │     ├─ Clear OTP
│     │     └─ Return: {"message": "Password reset successfully"}
│     │
│     └─ Display: "Success! Redirecting to login..."
│
└─ Back to Login
   ├─ Login with: user@example.com + NewPassword123
   └─ ✅ Access granted

═══════════════════════════════════════════════════════════════

AUTHENTICATION SERVICE (Port 4000)
│
├─ OTP Storage (In-Memory Map)
│  └─ Format: {email: {otp, expiryTime, attempts, verified}}
│
├─ Endpoints
│  ├─ POST /api/auth/forgot-password
│  │  └─ Generate OTP, store, send email
│  ├─ POST /api/auth/verify-otp
│  │  └─ Validate OTP, check expiry & attempts
│  ├─ POST /api/auth/reset-password
│  │  └─ Update password, send confirmation
│  └─ POST /api/auth/resend-otp
│     └─ Generate new OTP, resend email
│
├─ Background Tasks
│  └─ Auto-cleanup (every 60 seconds)
│     └─ Remove expired OTPs from Map
│
├─ Database
│  ├─ Utilisateur table
│  │  ├─ email (unique)
│  │  ├─ password (hashed)
│  │  └─ [other fields]
│  └─ Update: password field
│
├─ Email Service
│  ├─ OTP Email Template
│  │  ├─ Subject: "Your LearnFlow Password Reset OTP"
│  │  └─ Body: Professional HTML with 6-digit code
│  ├─ Resend Email Template
│  │  └─ Subject: "Your New Password Reset OTP"
│  └─ Confirmation Email Template
│     └─ Subject: "Your Password Has Been Changed"
│
└─ Security Measures
   ├─ OTP Expiry: 10 minutes
   ├─ Max Attempts: 5
   ├─ Password Hashing: bcrypt (salt: 10)
   ├─ Email Masking: us***om
   └─ Error Masking: No user info leaked

═══════════════════════════════════════════════════════════════

FRONTEND COMPONENT (React)
│
├─ ForgotPassword.jsx (452 lines)
│  ├─ State Management
│  │  ├─ currentStep (0-3)
│  │  ├─ email
│  │  ├─ otp
│  │  ├─ otpSent
│  │  ├─ otpVerified
│  │  ├─ resendTimer
│  │  └─ loading
│  │
│  ├─ Functions
│  │  ├─ handleRequestOTP()
│  │  ├─ handleVerifyOTP()
│  │  ├─ handleResetPassword()
│  │  ├─ handleResendOTP()
│  │  └─ startResendTimer()
│  │
│  ├─ Form Validation
│  │  ├─ Email: required, valid format
│  │  ├─ OTP: 6 digits
│  │  ├─ Password: 8+ chars, uppercase, lowercase, number
│  │  └─ Confirm: matches password
│  │
│  ├─ UI Components (Ant Design)
│  │  ├─ Layout
│  │  ├─ Card
│  │  ├─ Steps
│  │  ├─ Form
│  │  ├─ Input
│  │  ├─ Button
│  │  ├─ Result
│  │  └─ Spin (loading)
│  │
│  └─ Styling
│     ├─ Gradient backgrounds
│     ├─ Shadow effects
│     ├─ Responsive layout
│     └─ Brand colors
│
└─ App.jsx Integration
   └─ Route: /forgot-password

═══════════════════════════════════════════════════════════════

NETWORK CALLS DIAGRAM

Frontend (5173)
      │
      ├─→ POST /api/auth/forgot-password (port 4000)
      │   Request: {"email": "..."}
      │   Response: {"message": "...", "email": "..."}
      │   ← (2-3 seconds for email)
      │
      ├─→ POST /api/auth/verify-otp (port 4000)
      │   Request: {"email": "...", "otp": "..."}
      │   Response: {"message": "...", "verified": true}
      │   ← (100-200ms)
      │
      ├─→ POST /api/auth/reset-password (port 4000)
      │   Request: {"email": "...", "otp": "...", "newPassword": "..."}
      │   Response: {"message": "..."}
      │   ← (100-500ms with hashing)
      │
      └─→ POST /api/auth/resend-otp (port 4000)
          Request: {"email": "..."}
          Response: {"message": "..."}
          ← (2-3 seconds for email)

═══════════════════════════════════════════════════════════════

SECURITY FLOW

User Input
    ↓
[Frontend Validation]
- Email format check
- OTP format check (6 digits)
- Password strength check
    ↓
[HTTPS/HTTP to Auth Service]
    ↓
[Backend Validation]
- Email exists check
- OTP expiry check
- OTP attempt limit check
- Password requirements check
    ↓
[Hashing & Encryption]
- bcrypt password hashing
- OTP storage in Map
- Email masking
    ↓
[Database Update]
- Update password
- Clear OTP
    ↓
[Cleanup]
- Auto-delete expired OTPs
- No logs of sensitive data

═══════════════════════════════════════════════════════════════

OTP LIFECYCLE

Generate
  ├─ 6 random digits
  ├─ Store in Map
  ├─ Set expiry: now + 10 minutes
  ├─ Set attempts: 0
  └─ Set verified: false

Usage
  ├─ User receives email
  ├─ User enters OTP
  ├─ Verify attempt: +1
  ├─ If valid: set verified = true, delete OTP
  ├─ If invalid: try again (max 5)
  ├─ If 5 attempts: delete OTP
  └─ If expired: delete OTP

Cleanup
  ├─ Every 60 seconds
  ├─ Check all OTPs
  ├─ If expired: delete
  ├─ If verified: already deleted
  └─ Prevents memory leaks

═══════════════════════════════════════════════════════════════

RESPONSE EXAMPLES

[1] Forgot Password Request
Request:
  POST /api/auth/forgot-password
  {"email": "user@example.com"}

Response (200):
  {
    "message": "OTP sent to your email",
    "email": "us***om"
  }

[2] OTP Verification
Request:
  POST /api/auth/verify-otp
  {"email": "user@example.com", "otp": "123456"}

Response (200):
  {
    "message": "OTP verified successfully",
    "verified": true
  }

Response (400):
  {
    "message": "Invalid or expired OTP"
  }

[3] Password Reset
Request:
  POST /api/auth/reset-password
  {
    "email": "user@example.com",
    "otp": "123456",
    "newPassword": "NewPass123"
  }

Response (200):
  {
    "message": "Password reset successfully"
  }

Response (400):
  {
    "message": "Password must contain uppercase, lowercase, and numbers"
  }

[4] Resend OTP
Request:
  POST /api/auth/resend-otp
  {"email": "user@example.com"}

Response (200):
  {
    "message": "OTP resent successfully"
  }

═══════════════════════════════════════════════════════════════

ERROR HANDLING

Email Not Found
  └─ Return 200 (don't reveal existence)

Invalid OTP
  ├─ Show: "Invalid OTP, try again"
  ├─ Increment attempts
  ├─ If 5 attempts: show "Too many attempts, request new OTP"

Expired OTP
  ├─ Show: "OTP expired, click Resend"
  ├─ Delete OTP
  └─ Allow resend

Invalid Password
  ├─ Show requirements
  └─ Allow retry

Server Error
  ├─ Log error
  ├─ Show: "Something went wrong"
  └─ Allow retry

═══════════════════════════════════════════════════════════════

FILES & LOCATIONS

FRONTEND
✅ /frontend/learnflow/src/auth/ForgotPassword.jsx (452 lines)
✅ /frontend/learnflow/src/auth/auth.jsx (login page)
✅ /frontend/learnflow/src/App.jsx (routing)

BACKEND
✅ /backend/auth-service/routes/authRoutes.js (4 endpoints)
✅ /backend/auth-service/config/mail.js (email config)
✅ /backend/auth-service/models/userModel.js (database)

DOCUMENTATION
✅ FORGOT_PASSWORD_SETUP_COMPLETE.md
✅ FORGOT_PASSWORD_FIX_GUIDE.md
✅ QUICK_START_FORGOT_PASSWORD.md
✅ VERIFICATION_REPORT.md
✅ AUTH_SERVICE_FORGOT_PASSWORD_API.md
✅ AUTH_SERVICE_INTEGRATION_GUIDE.md
✅ AUTH_SERVICE_FORGOT_PASSWORD_COMPLETE.md

═══════════════════════════════════════════════════════════════

PORTS SUMMARY

Frontend:           5173  (Vite)
Auth Service:       4000  (Express) ← FORGOT PASSWORD
Reference:          3000  (Not used for forgot password)
Messaging:          3001  (Not used for forgot password)
Notifications:      3002  (Not used for forgot password)

═══════════════════════════════════════════════════════════════

STATUS: ✅ COMPLETE & OPERATIONAL

All components working correctly and ready for production!
```

---

**Architecture Version:** 1.0  
**Last Updated:** November 20, 2025  
**Status:** ✅ Production Ready
