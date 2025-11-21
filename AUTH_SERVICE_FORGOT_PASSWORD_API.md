# Forgot Password API Endpoints - Auth Service

## Overview
Complete OTP-based password reset flow integrated into the auth-service at `backend/auth-service/routes/authRoutes.js`

---

## API Endpoints

### 1. POST `/api/auth/forgot-password`
**Request OTP for password reset**

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "OTP sent successfully to your email",
  "email": "us***om"
}
```

**Status Codes:**
- `200` - OTP sent successfully
- `400` - Email is required
- `500` - Server error

---

### 2. POST `/api/auth/verify-otp`
**Verify the 6-digit OTP**

**Request:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response:**
```json
{
  "message": "OTP verified successfully",
  "verified": true
}
```

**Status Codes:**
- `200` - OTP verified
- `400` - Invalid OTP, OTP expired, or too many attempts
- `500` - Server error

---

### 3. POST `/api/auth/reset-password`
**Reset password with verified OTP**

**Request:**
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "newPassword": "NewPassword123"
}
```

**Response:**
```json
{
  "message": "Password reset successfully. You can now login with your new password."
}
```

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

**Status Codes:**
- `200` - Password reset successfully
- `400` - Missing fields, invalid password format
- `404` - User not found
- `500` - Server error

---

### 4. POST `/api/auth/resend-otp`
**Resend OTP if user didn't receive it**

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "OTP resent successfully"
}
```

**Status Codes:**
- `200` - OTP resent
- `400` - Email is required
- `500` - Server error

---

## Integration Example

### JavaScript/Fetch

```javascript
// Step 1: Request OTP
const requestOTP = async (email) => {
  const response = await fetch('http://localhost:3001/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  return response.json();
};

// Step 2: Verify OTP
const verifyOTP = async (email, otp) => {
  const response = await fetch('http://localhost:3001/api/auth/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp })
  });
  return response.json();
};

// Step 3: Reset Password
const resetPassword = async (email, otp, newPassword) => {
  const response = await fetch('http://localhost:3001/api/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp, newPassword })
  });
  return response.json();
};
```

---

## Features

✅ **OTP Generation** - 6-digit secure code
✅ **Email Delivery** - HTML email templates
✅ **10-Minute Expiry** - Time-limited OTP
✅ **Attempt Limiting** - Max 5 verification attempts
✅ **Email Masking** - Security in responses
✅ **Password Hashing** - bcrypt encryption
✅ **Auto-Cleanup** - Expired OTPs removed every minute
✅ **Confirmation Emails** - Password change notifications

---

## Security Features

- OTP expires after 10 minutes
- Maximum 5 verification attempts
- Password strength validation enforced
- Email masking in API responses
- Auto-cleanup of expired OTPs
- Secure bcrypt hashing
- User existence validation
- Verified OTP required before password reset

---

## Environment Requirements

The service uses the existing email configuration from `backend/auth-service/config/mail.js`

Make sure your email service is configured:
- Gmail, SendGrid, Outlook, or custom SMTP

---

## Error Handling

| Error | Response | Cause |
|-------|----------|-------|
| Email is required | 400 | Missing email parameter |
| OTP not found | 400 | No OTP requested or expired |
| OTP expired | 400 | OTP older than 10 minutes |
| Invalid OTP | 400 | Wrong OTP entered |
| Too many attempts | 400 | More than 5 verification attempts |
| OTP not verified | 400 | Password reset without OTP verification |
| User not found | 404 | Email doesn't exist in database |
| Password too short | 400 | Password less than 8 characters |
| Invalid password format | 400 | Missing uppercase, lowercase, or numbers |

---

## Testing with cURL

```bash
# Request OTP
curl -X POST http://localhost:3001/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'

# Verify OTP
curl -X POST http://localhost:3001/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "otp": "123456"}'

# Reset Password
curl -X POST http://localhost:3001/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "otp": "123456", "newPassword": "NewPass123"}'

# Resend OTP
curl -X POST http://localhost:3001/api/auth/resend-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

---

## Implementation Location

**File:** `backend/auth-service/routes/authRoutes.js`

**Lines:** Added at the end of the file (before module.exports)

**Functions Added:**
- `POST /forgot-password` - Lines added
- `POST /verify-otp` - Lines added
- `POST /reset-password` - Lines added
- `POST /resend-otp` - Lines added
- Auto-cleanup interval - Runs every minute

---

## Database

Uses existing `utilisateur` model with:
- `email` field for identification
- `mdp_hash` field for password storage

No database schema changes required.

---

## Notes

- OTP storage uses in-memory Map (suitable for single-server)
- For production with multiple servers, migrate to Redis
- Email templates are styled and user-friendly
- All endpoints return proper HTTP status codes
- Comprehensive error messages for debugging

---

**Created:** November 20, 2025  
**Version:** 1.0  
**Status:** Production Ready ✅
