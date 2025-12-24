# 🚀 Vercel Deployment - Environment Variables Setup

Your deployed frontend at: https://learnflow-blond.vercel.app/auth
Needs these environment variables:

## ⚙️ Steps to Fix:

### 1. Go to Vercel Dashboard
https://vercel.com/dashboard

### 2. Select your project: "learnflow"

### 3. Go to Settings → Environment Variables

### 4. Add/Update these variables:

```env
VITE_API_URL=https://learnflow-backend-17x8.onrender.com/api

VITE_AUTH_URL=https://learnflow-backend-17x8.onrender.com/api/auth

VITE_MESSAGING_URL=https://learnflow-backend-17x8.onrender.com/api/messaging

VITE_EVENTS_URL=https://learnflow-backend-17x8.onrender.com/api/events

VITE_NOTIFICATIONS_URL=https://learnflow-backend-17x8.onrender.com/api/notifications

VITE_WEBSOCKET_URL=https://learnflow-backend-17x8.onrender.com

VITE_ENVIRONMENT=production
```

### 5. Select Environment: **Production** ✅

### 6. Click "Save"

### 7. Redeploy:
- Go to "Deployments" tab
- Click the three dots (...) on the latest deployment
- Click "Redeploy"
- ✅ Check "Use existing Build Cache" is OFF

---

## 🎯 Alternative: Deploy from Terminal

```bash
cd frontend/learnflow
vercel --prod
```

When prompted, confirm the environment variables are set.

---

## ✅ After Redeployment:

Visit: https://learnflow-blond.vercel.app/auth

Your frontend will now connect to:
```
https://learnflow-backend-17x8.onrender.com/api
```

And you can login with your migrated users! 🎉

---

## 📝 Your Migrated Users:

You have 25 users including:
- maizaaymena@gmail.com (ADMIN)
- marwa.trabelsi@example.com (DEPARTMENT_HEAD)
- And 23 other users

All with your real data from the local database! 🚀
