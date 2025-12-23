# 🚀 Learnflow Deployment - Quick Reference

## In 5 Minutes

### 1. **Create Database (Render)**
   - Sign up at [render.com](https://render.com)
   - Create PostgreSQL database → Copy URL

### 2. **Push Code (GitHub)**
   ```bash
   git push origin main
   ```

### 3. **Deploy Backend (Vercel)**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repo
   - Root: `./` | Build: `npm run build`
   - Add env vars:
     ```
     DATABASE_URL=postgresql://...
     JWT_SECRET=your-secret-key
     NODE_ENV=production
     FRONTEND_URL=https://your-frontend.vercel.app
     ```
   - Deploy → Copy URL

### 4. **Deploy Frontend (Vercel)**
   - [vercel.com/new](https://vercel.com/new) → Same repo
   - Root: `frontend/learnflow` | Build: `npm run build`
   - Add env var:
     ```
     VITE_API_URL=https://your-backend.vercel.app/api
     ```
   - Deploy → Copy URL

### 5. **Test**
   ```bash
   # Test backend
   curl https://your-backend.vercel.app/api/auth/health
   
   # Test from browser console
   fetch('https://your-backend.vercel.app/api/auth/health')
     .then(r => r.json())
     .then(console.log)
   ```

---

## 🗂️ File Structure Created

```
learnflow/
├── api/                          # Vercel Serverless Functions
│   ├── auth/index.js            # Auth service
│   ├── events/index.js          # Events service
│   ├── messaging/index.js       # Messaging service
│   └── notifications/index.js   # Notifications service
│
├── frontend/learnflow/
│   ├── src/utils/api.js        # API client
│   ├── vercel.json             # Frontend config
│   └── .env.example
│
├── prisma/
│   └── schema.prisma           # Database schema (optional)
│
├── vercel.json                 # Backend routing
├── .env.example                # Environment template
├── DEPLOYMENT_GUIDE.md         # Full guide (YOU ARE HERE)
├── DEPLOYMENT_CHECKLIST.md     # Step-by-step checklist
├── test-db-connection.js       # Test DB connection
├── dev-server.js               # Local development
├── setup.sh / setup.bat        # Quick setup
└── package.json
```

---

## 🌍 Deployed URLs

| Component | URL Pattern |
|-----------|-----------|
| Frontend | `https://your-frontend.vercel.app` |
| Auth API | `https://your-backend.vercel.app/api/auth` |
| Events API | `https://your-backend.vercel.app/api/events` |
| Messaging API | `https://your-backend.vercel.app/api/messaging` |
| Notifications API | `https://your-backend.vercel.app/api/notifications` |
| Database | `postgresql://user:pass@host.render.com/learnflow_db` |

---

## 🔧 Environment Variables

### Backend (.env.local)
```env
DATABASE_URL=postgresql://user:pass@host.render.com:5432/learnflow_db
JWT_SECRET=your-32-character-secret-key-minimum
NODE_ENV=production
FRONTEND_URL=https://your-frontend.vercel.app
```

### Frontend (.env.local)
```env
VITE_API_URL=https://your-backend.vercel.app/api
VITE_ENVIRONMENT=production
```

---

## ✅ Verification Commands

```bash
# Test Auth Service
curl https://your-backend.vercel.app/api/auth/health

# Test Events Service
curl https://your-backend.vercel.app/api/events/health

# Test Messaging Service
curl https://your-backend.vercel.app/api/messaging/health

# Test Notifications Service
curl https://your-backend.vercel.app/api/notifications/health
```

All should return:
```json
{
  "status": "ok",
  "service": "service-name",
  "timestamp": "2024-..."
}
```

---

## 🐛 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| `DATABASE_URL not found` | Add to Vercel → Run `vercel --prod` |
| CORS Error | Verify `FRONTEND_URL` in backend env |
| `502 Bad Gateway` | Check Vercel logs for DB errors |
| Can't reach API | Verify `VITE_API_URL` is correct |
| Module not found | Run `npm install` in root & frontend |

---

## 📚 Full Documentation

See `DEPLOYMENT_GUIDE.md` for complete step-by-step instructions.
See `DEPLOYMENT_CHECKLIST.md` for verification steps.

---

## 🎯 Architecture

```
User Browser
    ↓
[Vercel Frontend - React SPA]
    ↓
[Vercel Serverless Functions - API]
    ├→ /api/auth/*
    ├→ /api/events/*
    ├→ /api/messaging/*
    └→ /api/notifications/*
    ↓
[Render PostgreSQL Database]
```

---

## 📞 Quick Help

**Need to redeploy?**
```bash
git push origin main
# Vercel auto-redeploys

# Or manual:
vercel --prod
```

**Test connection locally?**
```bash
node test-db-connection.js
```

**Run dev server locally?**
```bash
node dev-server.js
```

**View logs?**
- Vercel: Dashboard → Deployments → Select deploy → Logs
- Render: Dashboard → Your Database → Activity

---

**Ready to deploy?** Follow the "In 5 Minutes" section above! 🚀
