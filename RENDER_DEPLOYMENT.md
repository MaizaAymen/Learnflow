# Render Deployment Guide for Learnflow

## 🎯 Overview

Your Learnflow backend is now unified and ready to deploy on Render as a single web service. All 4 backend services (Auth, Events, Messaging, Notifications) run together on one server.

## 📦 What Was Created

1. **`backend/server.js`** - Unified backend server that loads all services
2. **`render.yaml`** - Render blueprint configuration
3. **`package.json`** - Updated with correct start command

## 🚀 Deployment Steps

### Step 1: Push to GitHub

```bash
git add .
git commit -m "Add unified backend for Render deployment"
git push origin main
```

### Step 2: Deploy on Render

1. Go to [https://render.com](https://render.com)
2. Sign up or log in with GitHub
3. Click **"New +"** → **"Web Service"**
4. Connect your **Learnflow** repository
5. Render will auto-detect the `render.yaml` file

### Step 3: Configure Environment Variables

Add these environment variables in Render dashboard:

| Variable | Value | Example |
|----------|-------|---------|
| `DATABASE_URL` | Your PostgreSQL connection string | `postgresql://user:pass@host:5432/dbname` |
| `JWT_SECRET` | Your secret key (random string) | `your-super-secret-key-here` |
| `NODE_ENV` | production | `production` |

### Step 4: Deploy

Click **"Create Web Service"** and Render will:
- Install dependencies
- Start your unified backend
- Give you a public URL

## 🌐 Your Backend URL

After deployment, your backend will be available at:
```
https://learnflow-backend.onrender.com
```

## 📍 API Endpoints

All your services are available at these routes:

### Auth Service
- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/profile`
- etc.

### Events Service
- `GET /api/events`
- `POST /api/events`
- `PUT /api/events/:id`
- etc.

### Messaging Service
- `GET /api/messaging/conversations`
- `POST /api/messaging/send`
- etc.

### Notifications Service
- `GET /api/notifications`
- `POST /api/notifications`
- etc.

## 🔍 Health Checks

Test your deployment:

```bash
# Main health check
curl https://learnflow-backend.onrender.com/health

# Service status
curl https://learnflow-backend.onrender.com/api/status

# Root endpoint
curl https://learnflow-backend.onrender.com/
```

## 🛠️ Local Testing

Before deploying, test locally:

```bash
# Install dependencies
npm install

# Start unified backend
npm start

# Or with auto-reload during development
npm run dev
```

Visit: `http://localhost:3000`

## 🔧 Troubleshooting

### Services Not Loading?

Check the service status:
```
GET /api/status
```

This shows which services loaded successfully and any errors.

### Database Connection Issues?

- Verify `DATABASE_URL` is correct in Render environment variables
- Ensure your PostgreSQL database allows connections from Render's IP addresses
- Check Render logs for connection errors

### CORS Issues?

The server is configured to allow all origins (`origin: '*'`). If you need to restrict it:

Edit `backend/server.js`:
```javascript
app.use(cors({
  origin: 'https://your-frontend-domain.com',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true
}));
```

## 📊 Monitoring

In Render dashboard you can:
- View real-time logs
- Monitor CPU/memory usage
- Set up alerts
- Configure custom domains

## 🆓 Free Tier Limits

Render free tier includes:
- 750 hours/month
- Spins down after 15 min inactivity
- First request after spin-down takes ~30 seconds

## 🎉 Next Steps

1. Deploy backend to Render
2. Update frontend API URLs to point to `https://learnflow-backend.onrender.com`
3. Deploy frontend to Vercel/Netlify/Render
4. Test end-to-end

## 📝 Frontend Configuration

Update your frontend API base URL:

```javascript
// In your frontend config
const API_BASE_URL = 'https://learnflow-backend.onrender.com/api';

// Example usage
const response = await fetch(`${API_BASE_URL}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
```

## 🔐 Security Checklist

Before going to production:
- [ ] Set strong `JWT_SECRET`
- [ ] Configure CORS with specific origins
- [ ] Enable HTTPS (Render does this automatically)
- [ ] Use environment variables for all secrets
- [ ] Set up database backups
- [ ] Configure rate limiting (optional)

## 📞 Support

If you encounter issues:
1. Check Render logs
2. Visit `/api/status` endpoint
3. Verify environment variables
4. Test database connection

---

**Your unified backend is ready to deploy! 🚀**
