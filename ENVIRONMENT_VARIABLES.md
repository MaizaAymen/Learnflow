# 🔐 Environment Variables for Render

## Required Variables (Add these in Render)

When you create your web service on Render, add these environment variables in the "Environment" section:

### 1️⃣ DATABASE_URL (Required)
**Your PostgreSQL connection string**

**Format:**
```
postgresql://username:password@host:port/database_name
```

**Example with Render PostgreSQL:**
```
postgresql://learnflow_user:xJ9kL2mN4pQ8rT6vY@dpg-abc123xyz.frankfurt-postgres.render.com:5432/learnflow_db
```

**How to get it:**
- If you create a PostgreSQL database on Render, copy the **"Internal Database URL"**
- It looks like: `postgresql://learnflow_db_user:xxxxx@dpg-xxxxx.frankfurt-postgres.render.com/learnflow_db`

---

### 2️⃣ JWT_SECRET (Required)
**Secret key for JWT token encryption**

**Value:** A random string (at least 32 characters)

**Example:**
```
aB3dE5fG7hI9jK1lM3nO5pQ7rS9tU1vW3xY5zA7bC9dE1fG3hI5jK7
```

**How to generate:** Run this in PowerShell:
```powershell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 50 | % {[char]$_})
```

---

### 3️⃣ NODE_ENV (Required)
**Environment mode**

**Value:**
```
production
```

---

### 4️⃣ PORT (Auto-set by Render)
**Port number** - Render sets this automatically, but you can add it:

**Value:**
```
3000
```

---

## Optional Variables (Recommended)

### 5️⃣ FRONTEND_URL (Optional)
**Your frontend URL for CORS**

**Value:**
```
https://your-frontend-name.vercel.app
```

**Note:** If not set, the backend allows all origins (`*`). Set this after deploying your frontend for security.

---

## 📋 Quick Copy-Paste Template

Copy this and fill in your actual values:

```env
DATABASE_URL=postgresql://username:password@host:port/database
JWT_SECRET=your-random-50-character-secret-key-here
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://your-frontend.vercel.app
```

---

## 🎯 Step-by-Step: Adding Variables in Render

### Step 1: In Render Dashboard
After connecting your repository, scroll to **"Environment Variables"** section

### Step 2: Add Each Variable
Click **"Add Environment Variable"** and enter:

| Key | Value | Example |
|-----|-------|---------|
| `DATABASE_URL` | Your PostgreSQL URL | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | Random 50-character string | `aB3dE5fG7hI9jK1lM3nO5pQ7rS9tU1vW...` |
| `NODE_ENV` | `production` | `production` |
| `FRONTEND_URL` | Your frontend URL | `https://learnflow.vercel.app` |

### Step 3: Save
Click **"Save Changes"** or proceed to deploy

---

## 🗄️ Option A: Use Render PostgreSQL (Recommended)

If you don't have a database yet:

1. In Render dashboard, click **"New +"**
2. Select **"PostgreSQL"**
3. Configure:
   - **Name:** `learnflow-db`
   - **Database:** `learnflow_db`
   - **User:** `learnflow_user`
   - **Region:** Frankfurt (same as backend)
   - **Plan:** Free
4. Click **"Create Database"**
5. Wait 1-2 minutes for creation
6. Copy the **"Internal Database URL"** (starts with `postgresql://`)
7. Use this as your `DATABASE_URL` value

**Internal URL vs External:**
- ✅ Use **"Internal Database URL"** (faster, free data transfer)
- ❌ Don't use "External Database URL" (slower, uses bandwidth)

---

## 🗄️ Option B: Use Existing PostgreSQL

If you have PostgreSQL elsewhere (Supabase, AWS RDS, etc.):

```
postgresql://username:password@your-host.com:5432/your_database
```

Make sure:
- ✅ Database accepts external connections
- ✅ Firewall allows Render IPs
- ✅ SSL is enabled (recommended)

---

## 🔍 Verify Your Setup

After adding variables, your Render dashboard should show:

```
✅ DATABASE_URL: postgresql://learnflow_user:***@dpg-xyz.render.com/...
✅ JWT_SECRET: ****************************** (hidden)
✅ NODE_ENV: production
✅ FRONTEND_URL: https://your-frontend.vercel.app
```

---

## 🧪 Test Connection Locally (Optional)

Before deploying, test with your production database locally:

1. Create `.env` file in root:
```env
DATABASE_URL=postgresql://your-production-db-url
JWT_SECRET=your-production-secret
NODE_ENV=development
```

2. Run:
```bash
npm start
```

3. Test:
```bash
curl http://localhost:3000/health
```

If it works locally with production DB, it will work on Render!

---

## ⚠️ Security Notes

1. **Never commit `.env` files** - They're in `.gitignore`
2. **Use strong JWT_SECRET** - At least 32 random characters
3. **Rotate secrets periodically** - Change JWT_SECRET every few months
4. **Restrict CORS** - Set specific `FRONTEND_URL` instead of `*`
5. **Use SSL/TLS** - Render provides this automatically

---

## 🆘 Troubleshooting

### Error: "Cannot connect to database"
- ✅ Check `DATABASE_URL` is correct
- ✅ Ensure database is running
- ✅ Verify database allows external connections
- ✅ Check SSL settings in connection string

### Error: "JWT malformed"
- ✅ Ensure `JWT_SECRET` is set and matches across services
- ✅ Secret must be same for all services

### Error: "CORS blocked"
- ✅ Set `FRONTEND_URL` to your actual frontend domain
- ✅ Or use `*` for development (not recommended for production)

---

## 📝 Final Checklist

Before deploying:

- [ ] `DATABASE_URL` - PostgreSQL connection string ready
- [ ] `JWT_SECRET` - Random 50-character string generated
- [ ] `NODE_ENV` - Set to `production`
- [ ] `FRONTEND_URL` - Your frontend domain (optional)
- [ ] All values are correct with no typos
- [ ] No trailing spaces in values

**You're ready to deploy! 🚀**
