# Auth Service - Forgot Password Integration Guide

## 🎯 What Was Added

The forgot password feature with OTP validation has been successfully integrated into `backend/auth-service/routes/authRoutes.js`

---

## ✨ New Features

### 4 New Endpoints:
1. `POST /api/auth/forgot-password` - Request OTP
2. `POST /api/auth/verify-otp` - Verify OTP
3. `POST /api/auth/reset-password` - Reset password
4. `POST /api/auth/resend-otp` - Resend OTP

### Security Features:
- ✅ 6-digit OTP generation
- ✅ 10-minute expiry
- ✅ Max 5 verification attempts
- ✅ bcrypt password hashing
- ✅ Email masking
- ✅ Auto-cleanup of expired OTPs
- ✅ HTML email templates
- ✅ Password strength validation

---

## 📡 API Overview

All endpoints use PORT **3001** (auth-service)

Base URL: `http://localhost:3001/api/auth`

```
POST /forgot-password      → Request OTP
POST /verify-otp          → Verify OTP
POST /reset-password      → Reset password
POST /resend-otp          → Resend OTP
```

---

## 🔄 Complete Flow

```
User enters email
        ↓
POST /forgot-password
        ↓
User receives OTP email
        ↓
User enters OTP
        ↓
POST /verify-otp (OTP verified → true)
        ↓
User enters new password
        ↓
POST /reset-password
        ↓
✅ Password changed successfully
        ↓
User gets confirmation email
        ↓
User can login with new password
```

---

## 🚀 Quick Start

### 1. No Installation Needed
The endpoints are already added to `authRoutes.js`

### 2. Verify Email Service
The routes use existing email configuration from `backend/auth-service/config/mail.js`

Check your email service is configured:
```javascript
// backend/auth-service/config/mail.js
// Must have email transporter setup
```

### 3. Test the Endpoints
Use the provided cURL examples:

```bash
# Request OTP
curl -X POST http://localhost:3001/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

### 4. Connect Frontend
Update your ForgotPassword component to use `http://localhost:3001` instead of `http://localhost:3000`

---

## 📝 Request/Response Examples

### Request OTP
```
POST http://localhost:3001/api/auth/forgot-password

{
  "email": "user@example.com"
}

Response:
{
  "message": "OTP sent successfully to your email",
  "email": "us***om"
}
```

### Verify OTP
```
POST http://localhost:3001/api/auth/verify-otp

{
  "email": "user@example.com",
  "otp": "123456"
}

Response:
{
  "message": "OTP verified successfully",
  "verified": true
}
```

### Reset Password
```
POST http://localhost:3001/api/auth/reset-password

{
  "email": "user@example.com",
  "otp": "123456",
  "newPassword": "NewPassword123"
}

Response:
{
  "message": "Password reset successfully. You can now login with your new password."
}
```

### Resend OTP
```
POST http://localhost:3001/api/auth/resend-otp

{
  "email": "user@example.com"
}

Response:
{
  "message": "OTP resent successfully"
}
```

---

## 🔐 Password Requirements

- ✅ Minimum 8 characters
- ✅ At least one uppercase letter (A-Z)
- ✅ At least one lowercase letter (a-z)
- ✅ At least one number (0-9)

Example of valid password: `MyNewPass123`

---

## 🛠️ Technical Details

### OTP Storage
- Uses in-memory Map (suitable for single server)
- For production with multiple servers: migrate to Redis

### Email Templates
- Professional HTML templates
- OTP email with 10-minute countdown
- Password change confirmation email
- Styled and branded

### Auto-Cleanup
- Runs every minute
- Removes expired OTPs automatically
- Prevents memory leaks

---

## 🧪 Testing the Integration

### Using Postman
1. Create new POST request
2. Set URL: `http://localhost:3001/api/auth/forgot-password`
3. Set Body to JSON:
   ```json
   { "email": "test@example.com" }
   ```
4. Send and verify response

### Using JavaScript
```javascript
const response = await fetch('http://localhost:3001/api/auth/forgot-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'user@example.com' })
});
const data = await response.json();
console.log(data);
```

---

## 🔗 Connecting Frontend to Backend

Update your ForgotPassword component:

```javascript
// Change API base URL from 3000 to 3001
const BASE_URL = 'http://localhost:3001/api/auth';

// Request OTP
const response = await fetch(`${BASE_URL}/forgot-password`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email })
});

// Verify OTP
const verifyResponse = await fetch(`${BASE_URL}/verify-otp`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, otp })
});

// Reset Password
const resetResponse = await fetch(`${BASE_URL}/reset-password`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, otp, newPassword })
});
```

---

## 📊 Service Architecture

```
Frontend (ForgotPassword Component)
         ↓
    Port 3001 (Auth Service)
    authRoutes.js
    ├── forgot-password endpoint
    ├── verify-otp endpoint
    ├── reset-password endpoint
    └── resend-otp endpoint
         ↓
    Database (utilisateur table)
    + Email Service (sendEmail)
    + OTP Storage (in-memory Map)
```

---

## ✅ Checklist

- ✅ Endpoints added to auth-service
- ✅ OTP generation implemented
- ✅ Email templates created
- ✅ Password hashing enabled
- ✅ Auto-cleanup scheduled
- ✅ Error handling added
- ✅ Security features implemented
- ✅ Documentation complete

---

## 🐛 Troubleshooting

### OTP not received?
- Check email service configuration
- Check spam folder
- Verify email address in request

### Invalid OTP error?
- Make sure OTP hasn't expired (10 minutes)
- Check you entered correct OTP
- Count is limited to 5 attempts

### Password reset fails?
- Verify OTP was verified first
- Check password meets requirements
- Try resending OTP

### Connection refused?
- Make sure auth-service is running on port 3001
- Check firewall settings
- Verify `.env` port configuration

---

## 📚 Full Documentation

For complete API documentation, see: `AUTH_SERVICE_FORGOT_PASSWORD_API.md`

For frontend implementation, see: `ForgotPassword.jsx`

---

## 🎉 You're All Set!

The forgot password feature is now integrated into your auth-service.

Test it by:
1. Making a POST request to `/api/auth/forgot-password`
2. Check for OTP in email
3. Verify OTP with `/api/auth/verify-otp`
4. Reset password with `/api/auth/reset-password`

---

**Integration Date:** November 20, 2025  
**Service:** Auth Service (Backend)  
**Status:** ✅ Ready to Use
