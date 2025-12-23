# Learnflow Deployment Checklist

Complete this checklist to ensure your application is properly configured and ready for production.

## 📋 Pre-Deployment Checklist

### 1. ✅ Prerequisites

- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] Git installed (`git --version`)
- [ ] GitHub account created
- [ ] Vercel account created (free tier)
- [ ] Render account created (free tier)

### 2. ✅ Database Setup (Render PostgreSQL)

- [ ] PostgreSQL database created on Render
- [ ] Database URL copied: `postgresql://...`
- [ ] Database is accessible from internet (should be by default)
- [ ] User and password set correctly
- [ ] Database name is `learnflow_db`

**Database URL Format Check:**
```
postgresql://username:password@hostname.render.com:5432/learnflow_db
```

### 3. ✅ Backend Configuration

**Root `package.json`:**
- [ ] Updated with all necessary dependencies:
  - `express`
  - `cors`
  - `dotenv`
  - `sequelize`
  - `pg`
  - `jsonwebtoken`
  - `bcrypt`
  - `socket.io` (optional)

**`vercel.json` (Backend):**
- [ ] File exists at root level
- [ ] Contains API rewrites for all services
- [ ] CORS headers configured
- [ ] Functions config includes all 4 services

**API Handlers:**
- [ ] `/api/auth/index.js` created
- [ ] `/api/events/index.js` created
- [ ] `/api/messaging/index.js` created
- [ ] `/api/notifications/index.js` created
- [ ] All files have DATABASE connection logic
- [ ] All files have health check endpoints

**Environment Variables (.env.local):**
- [ ] `DATABASE_URL` set correctly
- [ ] `JWT_SECRET` generated (min 32 characters)
- [ ] `NODE_ENV` set to `production`
- [ ] `FRONTEND_URL` set to your Vercel frontend domain

### 4. ✅ Frontend Configuration

**`package.json` (frontend/learnflow/):**
- [ ] Build script: `"build": "vite build"`
- [ ] Dev script: `"dev": "vite"`
- [ ] React and Vite dependencies present

**`vite.config.js`:**
- [ ] React plugin enabled
- [ ] Build output directory is `dist`
- [ ] Port set to 5173

**`vercel.json` (Frontend):**
- [ ] File exists at `frontend/learnflow/vercel.json`
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`
- [ ] SPA rewrite to `/index.html` configured

**API Client (`src/utils/api.js`):**
- [ ] File exists
- [ ] Uses `VITE_API_URL` environment variable
- [ ] All service endpoints defined (auth, events, messaging, notifications)
- [ ] Error handling includes 401 logout
- [ ] Token management implemented

**Environment Variables (.env.local):**
- [ ] `VITE_API_URL` points to your Vercel backend
- [ ] Format: `https://your-backend.vercel.app/api`
- [ ] `VITE_ENVIRONMENT` set to `production`

### 5. ✅ Code Repository

- [ ] Repository created on GitHub
- [ ] All code committed and pushed
- [ ] No sensitive data in commits (check `.env.local` is in `.gitignore`)
- [ ] Branch is `main`
- [ ] No uncommitted changes

### 6. ✅ Vercel Setup

#### Backend Deployment:

- [ ] Logged into Vercel
- [ ] New project imported from GitHub
- [ ] Framework selected: "Other"
- [ ] Root directory: `./` (root of repo)
- [ ] Build command: `npm run build`
- [ ] Environment variables set in Vercel:
  - [ ] `DATABASE_URL`
  - [ ] `JWT_SECRET`
  - [ ] `NODE_ENV`
  - [ ] `FRONTEND_URL`
- [ ] Backend deployed successfully
- [ ] Backend URL copied: `https://your-project.vercel.app`

#### Frontend Deployment:

- [ ] New project imported from GitHub (same repo)
- [ ] Framework selected: "Vite"
- [ ] Root directory: `frontend/learnflow`
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`
- [ ] Environment variables set in Vercel:
  - [ ] `VITE_API_URL` = backend URL + `/api`
  - [ ] `VITE_ENVIRONMENT` = `production`
- [ ] Frontend deployed successfully
- [ ] Frontend URL copied: `https://your-frontend.vercel.app`

### 7. ✅ Integration Testing

#### Backend Health Checks:
- [ ] Auth service health: `https://backend.vercel.app/api/auth/health` → `{ status: "ok" }`
- [ ] Events service health: `https://backend.vercel.app/api/events/health` → `{ status: "ok" }`
- [ ] Messaging service health: `https://backend.vercel.app/api/messaging/health` → `{ status: "ok" }`
- [ ] Notifications service health: `https://backend.vercel.app/api/notifications/health` → `{ status: "ok" }`

#### Database Connection:
- [ ] Backend logs show "DB Connection Successful"
- [ ] Test query returns expected results
- [ ] No connection timeout errors

#### CORS Testing:
- [ ] Open Frontend in browser
- [ ] Open DevTools Console (F12)
- [ ] Run: `fetch('https://backend.vercel.app/api/auth/health').then(r => r.json()).then(console.log)`
- [ ] No CORS errors
- [ ] Returns valid JSON

#### API Integration:
- [ ] Try login endpoint from frontend
- [ ] Token saved to localStorage
- [ ] Subsequent requests include token
- [ ] No 401 Unauthorized errors

### 8. ✅ Performance & Security

- [ ] SSL/TLS working (all URLs start with `https://`)
- [ ] JWT secret is strong (min 32 characters)
- [ ] Database password is strong
- [ ] No credentials committed to GitHub
- [ ] CORS allows only your frontend domain (recommended)
- [ ] Vercel environment variables are not visible in logs

### 9. ✅ Monitoring & Logging

- [ ] Vercel Deployments tab accessible
- [ ] Can view real-time function logs
- [ ] Render database activity dashboard accessible
- [ ] Error logs being captured
- [ ] Performance metrics visible

### 10. ✅ Documentation

- [ ] `DEPLOYMENT_GUIDE.md` updated with your URLs
- [ ] `.env.example` files created
- [ ] Team has access to database credentials (secured)
- [ ] API documentation created or updated
- [ ] Troubleshooting guide reviewed

---

## 🚀 Deployment Steps Summary

### If not already deployed:

```bash
# 1. Prepare code
git add .
git commit -m "Add Vercel deployment configuration"
git push origin main

# 2. Go to https://vercel.com/new

# 3. Import project (select your Learnflow GitHub repo)

# 4. Deploy backend:
#    - Root directory: ./
#    - Build: npm run build
#    - Add environment variables
#    - Deploy

# 5. Deploy frontend:
#    - Root directory: frontend/learnflow
#    - Build: npm run build
#    - Output: dist
#    - Add environment variables
#    - Deploy

# 6. Test all endpoints (see section 7)
```

---

## ⚠️ Post-Deployment Troubleshooting

### Issue: `DATABASE_URL not found`
**Solution:**
```bash
vercel env add DATABASE_URL
# Paste your Render database URL
vercel --prod  # Redeploy
```

### Issue: `502 Bad Gateway`
**Solution:**
- Check Vercel logs for database connection errors
- Verify DATABASE_URL is correct
- Ensure Render database is running (check Render dashboard)

### Issue: CORS errors in browser console
**Solution:**
- Verify FRONTEND_URL is set in backend environment
- Check `vercel.json` has CORS headers
- Clear browser cache and try again

### Issue: Frontend can't reach backend
**Solution:**
- Check `VITE_API_URL` in frontend `.env.local`
- Verify it matches your backend domain
- In browser console: `console.log(import.meta.env.VITE_API_URL)`

### Issue: `Module not found` errors
**Solution:**
- Ensure all `package.json` dependencies are installed
- Check Node.js version matches (18+)
- Run `npm install` in root and frontend directories

---

## ✅ Final Verification

When all checks are complete:

- [ ] Frontend is live at `https://your-frontend.vercel.app`
- [ ] Backend is live at `https://your-backend.vercel.app`
- [ ] Database is accessible at `postgresql://...@render.com`
- [ ] Frontend can communicate with backend
- [ ] All 4 microservices respond to health checks
- [ ] No errors in Vercel or Render logs
- [ ] Team has documentation and credentials

---

## 📞 Support

If you encounter issues:

1. **Check Vercel Logs**: Deployments → Select deploy → Logs
2. **Check Render Logs**: Database → Activity
3. **Review DEPLOYMENT_GUIDE.md**: See troubleshooting section
4. **Test locally**: Run `node dev-server.js` to debug

---

**Last Updated**: December 2024
**Status**: Production Ready
