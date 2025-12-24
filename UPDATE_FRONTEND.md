# 🎯 Update Frontend on Vercel

Your backend is live! Now update your frontend to use it:

## Option 1: Set Environment Variable in Vercel (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your **learnflow-blond** project
3. Go to **Settings** → **Environment Variables**
4. Add this variable:

**Key:**
```
VITE_API_URL
```

**Value:**
```
https://learnflow-backend-17x8.onrender.com/api
```

5. Click **Save**
6. Go to **Deployments** tab
7. Click **"Redeploy"** on the latest deployment
8. Check **"Use existing Build Cache"** ✅
9. Click **"Redeploy"**

Your frontend will be updated in 1-2 minutes! ✅

---

## Option 2: Local .env.production File

If you prefer, create a `.env.production` file in `frontend/learnflow/`:

```env
VITE_API_URL=https://learnflow-backend-17x8.onrender.com/api
VITE_AUTH_URL=https://learnflow-backend-17x8.onrender.com/api/auth
VITE_MESSAGING_URL=https://learnflow-backend-17x8.onrender.com/api/messaging
VITE_EVENTS_URL=https://learnflow-backend-17x8.onrender.com/api/events
VITE_NOTIFICATIONS_URL=https://learnflow-backend-17x8.onrender.com/api/notifications
VITE_ENVIRONMENT=production
```

Then commit and push:
```bash
git add frontend/learnflow/.env.production
git commit -m "Add production environment config"
git push origin main
```

Vercel will auto-deploy with the new config.

---

## ✅ Test Your Full Stack

After redeploying frontend, test:

1. **Visit your frontend:**
   ```
   https://learnflow-blond.vercel.app
   ```

2. **Login/Register** - Should work with Render backend

3. **Check console** - No CORS errors

4. **Test features** - Events, messaging, notifications

---

## 🎉 Your Full Stack is Live!

- **Frontend:** https://learnflow-blond.vercel.app
- **Backend:** https://learnflow-backend-17x8.onrender.com
- **Database:** PostgreSQL on Render (Oregon)

All services working together! 🚀
