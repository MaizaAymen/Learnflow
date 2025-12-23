# Learnflow: Complete Deployment Guide
## Frontend (React) + Backend (Node.js Microservices) + Database (PostgreSQL)

---

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Step 1: Database Setup (Render PostgreSQL)](#step-1-database-setup-render-postgresql)
4. [Step 2: Backend Deployment (Vercel Serverless)](#step-2-backend-deployment-vercel-serverless)
5. [Step 3: Frontend Deployment (Vercel)](#step-3-frontend-deployment-vercel)
6. [Step 4: Configuration & Testing](#step-4-configuration--testing)
7. [Troubleshooting](#troubleshooting)
8. [Project Structure](#project-structure)

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     LEARNFLOW ARCHITECTURE                  │
└─────────────────────────────────────────────────────────────┘

User Browser
    ↓
    │
    ├──→ [Vercel Frontend] (React SPA)
    │    https://your-frontend.vercel.app
    │
    └──→ [Vercel Serverless Functions] (Backend APIs)
         ├─→ /api/auth/... (Authentication)
         ├─→ /api/events/... (Event Management)
         ├─→ /api/messaging/... (Internal Messages)
         └─→ /api/notifications/... (Notifications)
              ↓
         [Render PostgreSQL Database]
         postgresql://user:pass@host/learnflow_db
```

**Key Points:**
- ✅ No Docker required
- ✅ No Next.js
- ✅ PostgreSQL hosted externally (Render)
- ✅ All APIs respond to HTTP (no WebSocket on Vercel free tier)
- ✅ CORS enabled for frontend → backend communication

---

## 📦 Prerequisites

You need accounts on these platforms:

1. **GitHub** - For code repository (required for Vercel)
2. **Vercel** - For frontend & backend deployment (free tier)
3. **Render** - For PostgreSQL database (free tier available)

Sign up (if needed):
- [Vercel](https://vercel.com/signup)
- [Render](https://dashboard.render.com/)

---

## 🗄️ Step 1: Database Setup (Render PostgreSQL)

### 1.1 Create PostgreSQL Database on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"PostgreSQL"**
3. Fill in the form:
   - **Name**: `learnflow-db`
   - **Database**: `learnflow_db`
   - **User**: `learnflow_user` (or your choice)
   - **Region**: Choose closest to your location
   - **Plan**: "Free" (sufficient for development)

4. Click **"Create Database"**
5. Wait 2-3 minutes for creation to complete

### 1.2 Get Your DATABASE_URL

1. Once created, click on your database
2. Copy the **External Database URL** (looks like this):

```
postgresql://learnflow_user:PASSWORD@host.render.com:5432/learnflow_db
```

3. **Save this URL securely** - you'll need it for backend deployment

### 1.3 (Optional) Initialize Database Schema

If you want to use Prisma ORM:

```bash
# Install Prisma CLI globally
npm install -g prisma

# Generate Prisma client
prisma generate

# Run migrations (if you have migration files)
prisma migrate deploy
```

Or import your existing SQL schema:
1. Download DBeaver or pgAdmin
2. Connect using the DATABASE_URL from step 1.2
3. Import your `.sql` files from `backend/Reference_documents/`

---

## 🚀 Step 2: Backend Deployment (Vercel Serverless)

### 2.1 Prepare Your Repository

The backend is structured as Vercel Serverless Functions in the `/api` folder:

```
learnflow/
├── api/
│   ├── auth/
│   │   └── index.js          # Auth service handler
│   ├── events/
│   │   └── index.js          # Events service handler
│   ├── messaging/
│   │   └── index.js          # Messaging service handler
│   └── notifications/
│       └── index.js          # Notifications service handler
├── vercel.json               # Backend routing & config
├── package.json              # Root dependencies (IMPORTANT!)
└── ...
```

### 2.2 Update Root package.json

Add these dependencies to your **root** `package.json`:

```json
{
  "name": "learnflow",
  "version": "1.0.0",
  "type": "module",
  "dependencies": {
    "express": "^5.1.0",
    "cors": "^2.8.5",
    "dotenv": "^17.2.2",
    "sequelize": "^6.37.7",
    "pg": "^8.16.3",
    "pg-hstore": "^2.3.4",
    "jsonwebtoken": "^9.0.2",
    "bcrypt": "^5.1.1",
    "cookie-parser": "^1.4.7",
    "multer": "^2.0.2",
    "socket.io": "^4.7.2"
  },
  "scripts": {
    "dev": "node api/auth/index.js",
    "build": "echo 'Build complete'",
    "test": "echo 'Tests run here'"
  }
}
```

### 2.3 Update Environment Variables

1. In each API file (`api/*/index.js`), ensure they use:
   ```javascript
   import dotenv from 'dotenv';
   dotenv.config({ path: '.env.local' });
   ```

2. The files in `api/auth/index.js`, `api/events/index.js`, etc. already have this.

### 2.4 Deploy to Vercel

#### Option A: Deploy from GitHub (Recommended)

1. **Push your code to GitHub**:
   ```bash
   git push origin main
   ```

2. **Go to Vercel Dashboard** → [Import Project](https://vercel.com/new)

3. **Select Your GitHub Repository** (learnflow)

4. **Configure Project**:
   - Framework: Other
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: (leave empty)

5. **Environment Variables** → Click "Add":
   ```
   DATABASE_URL = postgresql://...       (from Step 1.2)
   JWT_SECRET = your-secret-key-here-min-32-chars
   NODE_ENV = production
   FRONTEND_URL = https://your-frontend.vercel.app
   ```

6. **Click "Deploy"**
7. Wait 2-3 minutes...
8. Get your Vercel URL (e.g., `https://learnflow.vercel.app`)

#### Option B: Deploy with Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod

# Follow prompts to set environment variables
```

### 2.5 Test Backend APIs

Once deployed, test each endpoint:

```bash
# Test Auth Service
curl https://your-project.vercel.app/api/auth/health

# Test Events Service
curl https://your-project.vercel.app/api/events/health

# Test Messaging Service
curl https://your-project.vercel.app/api/messaging/health

# Test Notifications Service
curl https://your-project.vercel.app/api/notifications/health
```

All should return:
```json
{
  "status": "ok",
  "service": "auth-service",
  "timestamp": "2024-..."
}
```

---

## ⚛️ Step 3: Frontend Deployment (Vercel)

### 3.1 Prepare Frontend

1. **Navigate to frontend directory**:
   ```bash
   cd frontend/learnflow
   ```

2. **Check Vite Configuration** (`vite.config.js`):
   ```javascript
   export default {
     plugins: [react()],
     server: {
       port: 5173,
     },
     build: {
       outDir: 'dist'
     }
   }
   ```

3. **Update `.env.local`** (in `frontend/learnflow/`):
   ```env
   VITE_API_URL=https://your-backend-project.vercel.app/api
   VITE_ENVIRONMENT=production
   ```

### 3.2 Deploy Frontend to Vercel

#### Option A: Deploy from GitHub

1. **Go to Vercel Dashboard** → [Import Project](https://vercel.com/new)

2. **Select GitHub Repository** → `Learnflow`

3. **Configure Project**:
   - Framework: Vite
   - Root Directory: `frontend/learnflow`
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. **Environment Variables**:
   ```
   VITE_API_URL = https://your-backend-project.vercel.app/api
   VITE_ENVIRONMENT = production
   ```

5. **Click "Deploy"**
6. Get your frontend URL (e.g., `https://learnflow-frontend.vercel.app`)

#### Option B: Deploy with CLI

```bash
cd frontend/learnflow
vercel --prod
```

### 3.3 Update Frontend Code

In your React components, use the API client:

```javascript
import { authApi, eventsApi, messagingApi } from '@/utils/api';

// Login
async function handleLogin(email, password) {
  try {
    const user = await authApi.login({ email, password });
    localStorage.setItem('token', user.token);
    // redirect to dashboard
  } catch (error) {
    console.error('Login failed:', error);
  }
}

// Get events
async function loadEvents() {
  try {
    const events = await eventsApi.getAll();
    setEvents(events);
  } catch (error) {
    console.error('Failed to load events:', error);
  }
}
```

---

## ⚙️ Step 4: Configuration & Testing

### 4.1 Update Backend CORS

In `vercel.json`, the CORS headers are already configured:

```json
"headers": [
  {
    "source": "/api/(.*)",
    "headers": [
      { "key": "Access-Control-Allow-Origin", "value": "*" },
      ...
    ]
  }
]
```

### 4.2 Environment Variable Summary

| Variable | Where | Value |
|----------|-------|-------|
| `DATABASE_URL` | Backend (Vercel) | `postgresql://...` from Render |
| `JWT_SECRET` | Backend (Vercel) | Generate random 32+ char string |
| `NODE_ENV` | Backend (Vercel) | `production` |
| `FRONTEND_URL` | Backend (Vercel) | Your Vercel frontend URL |
| `VITE_API_URL` | Frontend (Vercel) | Your Vercel backend `/api` URL |
| `VITE_ENVIRONMENT` | Frontend (Vercel) | `production` |

### 4.3 Verify Deployment

1. **Check Frontend**:
   - Open https://your-frontend.vercel.app
   - Should load your React app

2. **Check Backend Health**:
   - Open https://your-backend.vercel.app/api/auth/health
   - Should return JSON response

3. **Check Database Connection**:
   - Backend should connect to PostgreSQL on Render
   - Check logs in Vercel dashboard

4. **Test API Call from Frontend**:
   - Open browser DevTools (F12)
   - Go to Console
   - Run:
     ```javascript
     fetch('https://your-backend.vercel.app/api/auth/health').then(r => r.json()).then(console.log)
     ```
   - Should return the health check response

### 4.4 Monitor Logs

**Vercel Logs**:
1. Go to Vercel Dashboard → Your Project
2. Click "Deployments" tab
3. Click latest deployment → "Logs"
4. View real-time logs

**Render Database Logs**:
1. Go to Render Dashboard → Your Database
2. Click "Activity" to see connection attempts

---

## 🔧 Troubleshooting

### Problem: `DATABASE_URL is required`
**Solution**: Add `DATABASE_URL` to Vercel environment variables

```bash
vercel env add DATABASE_URL
# paste: postgresql://user:pass@host/db
```

### Problem: CORS Error (`Access-Control-Allow-Origin`)
**Solution**: Ensure `vercel.json` has CORS headers configured (already done)

### Problem: 502 Bad Gateway
**Solution**: Check backend logs in Vercel dashboard. Likely a database connection error.

```bash
# Test connection locally:
npm install -g psql
psql "postgresql://user:pass@host/db"
```

### Problem: Frontend can't reach backend
**Solution**: Verify `VITE_API_URL` is correctly set and matches your Vercel backend domain

```javascript
// In browser console:
console.log(import.meta.env.VITE_API_URL)
```

### Problem: `Node version mismatch`
**Solution**: Specify Node version in Vercel:

1. Create `engines` in root `package.json`:
   ```json
   "engines": {
     "node": "18.x"
   }
   ```

2. Or set in Vercel Dashboard → Project Settings → Node.js Version → 18.x

---

## 📁 Project Structure

After deployment, your project should have:

```
learnflow/
├── api/                              # Vercel serverless functions
│   ├── auth/index.js                # /api/auth/* routes
│   ├── events/index.js              # /api/events/* routes
│   ├── messaging/index.js           # /api/messaging/* routes
│   └── notifications/index.js       # /api/notifications/* routes
│
├── frontend/learnflow/              # React frontend
│   ├── src/
│   │   ├── utils/api.js            # API client utilities
│   │   └── ...
│   ├── vercel.json                 # Frontend deployment config
│   ├── package.json
│   └── vite.config.js
│
├── backend/                         # Original backend services (reference)
│   ├── auth-service/
│   ├── Gestion des Événements/
│   ├── Messagerie/
│   └── Service de Notifications/
│
├── prisma/                          # Database schema (optional)
│   └── schema.prisma
│
├── vercel.json                      # Root Vercel config (backend)
├── package.json                     # Root dependencies
├── .env.example                     # Environment variables template
└── README.md
```

---

## 🚦 Quick Reference URLs

Once deployed:

| Service | URL |
|---------|-----|
| Frontend | https://your-frontend.vercel.app |
| Auth API | https://your-backend.vercel.app/api/auth |
| Events API | https://your-backend.vercel.app/api/events |
| Messaging API | https://your-backend.vercel.app/api/messaging |
| Notifications API | https://your-backend.vercel.app/api/notifications |
| Database | postgresql://user:pass@host.render.com/learnflow_db |

---

## 📧 Need Help?

- Vercel Docs: https://vercel.com/docs
- Render Docs: https://render.com/docs
- Express.js: https://expressjs.com
- Sequelize ORM: https://sequelize.org

---

**Last Updated**: December 2024
**Status**: Ready for Production
