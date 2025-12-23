# Learnflow System Architecture

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
│                    (User's Browser/Device)                      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND LAYER (Vercel)                   │
│                                                                 │
│  ┌──────────────────────────────────────────────────────┐      │
│  │  React SPA (Single Page Application)                │      │
│  │  ├── React Components                               │      │
│  │  ├── React Router (Client-side routing)             │      │
│  │  ├── State Management                               │      │
│  │  └── UI Components (Ant Design)                     │      │
│  └────────┬─────────────────────────────────────────────┘      │
│           │                                                     │
│           ├── /api/auth/*                 (HTTP REST)          │
│           ├── /api/events/*               (HTTP REST)          │
│           ├── /api/messaging/*            (HTTP REST)          │
│           └── /api/notifications/*        (HTTP REST)          │
│                                                                 │
│  Domain: https://your-frontend.vercel.app                      │
│  Build Output: React app in dist/ folder                       │
│  CDN: Automatic via Vercel                                     │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    HTTPS (TLS/SSL)
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   API GATEWAY LAYER (Vercel)                   │
│                                                                 │
│  vercel.json Routes all /api/* requests to serverless functions│
│                                                                 │
│  Request Flow:                                                  │
│  /api/auth/* ────────→ api/auth/index.js                      │
│  /api/events/* ──────→ api/events/index.js                    │
│  /api/messaging/* ───→ api/messaging/index.js                 │
│  /api/notifications/* ─→ api/notifications/index.js           │
│                                                                 │
│  Domain: https://your-backend.vercel.app                       │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    HTTPS (TLS/SSL)
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              MICROSERVICES LAYER (Vercel Serverless)           │
│                                                                 │
│  ┌────────────────┐  ┌────────────────┐  ┌───────────────────┐│
│  │  Auth Service  │  │ Events Service │  │Messaging Service  ││
│  │                │  │                │  │                   ││
│  │ • Login        │  │ • CRUD Events  │  │ • Get Messages    ││
│  │ • Register     │  │ • Register     │  │ • Send Messages   ││
│  │ • JWT Tokens   │  │ • List Events  │  │ • Conversations   ││
│  │ • Validation   │  │ • Attendance   │  │ • Real-time       ││
│  └────────────────┘  └────────────────┘  └───────────────────┘│
│                                                                 │
│  ┌────────────────────┐                                        │
│  │Notifications Service│                                       │
│  │                    │                                        │
│  │ • Send Email       │                                        │
│  │ • Send In-App      │                                        │
│  │ • Email Validation │                                        │
│  └────────────────────┘                                        │
│                                                                 │
│  Each service:                                                  │
│  • Express.js server                                           │
│  • Independent deployment                                      │
│  • Shared PostgreSQL DB                                        │
│  • CORS enabled                                                │
│  • JWT authentication                                          │
│  • Error handling                                              │
│  • Health check endpoints                                      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    HTTPS (TLS/SSL)
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATA LAYER (Render PostgreSQL)              │
│                                                                 │
│  ┌──────────────────────────────────────────────────────┐      │
│  │  PostgreSQL Database                                │      │
│  │  ├── Users (authentication)                          │      │
│  │  ├── Events (event management)                       │      │
│  │  ├── EventRegistrations (registrations)              │      │
│  │  ├── Conversations (messaging)                       │      │
│  │  ├── Messages (message threads)                      │      │
│  │  ├── DirectMessages (peer-to-peer)                   │      │
│  │  ├── Notifications (user notifications)              │      │
│  │  ├── Announcements (system announcements)            │      │
│  │  └── CalendarEvents (calendar management)            │      │
│  └──────────────────────────────────────────────────────┘      │
│                                                                 │
│  Domain: postgresql://user:pass@host.render.com:5432/db       │
│  SSL: Required (enabled by default)                            │
│  Backups: Automatic daily backups                              │
│  Availability: 99.95% SLA                                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📦 Component Breakdown

### Frontend (React on Vercel)

```javascript
// Key Components
frontend/learnflow/
├── src/
│   ├── pages/           # Page components
│   ├── components/      # Reusable UI components
│   ├── utils/
│   │   └── api.js      # API client utilities
│   ├── hooks/          # Custom React hooks
│   ├── context/        # React context for state
│   └── assets/         # Images, fonts, etc
├── dist/               # Built React app (Vercel serves this)
├── vite.config.js      # Vite build configuration
└── vercel.json         # Vercel deployment config
```

**API Client Usage:**
```javascript
import { authApi, eventsApi } from '@/utils/api';

// Login
const user = await authApi.login({ email, password });
localStorage.setItem('token', user.token);

// Get events
const events = await eventsApi.getAll();

// Register for event
await eventsApi.register(eventId);
```

### Backend API Services (Vercel Serverless)

Each microservice is an Express.js app deployed as a serverless function:

```javascript
api/
├── auth/index.js           # Handles /api/auth/*
│   ├── Authentication routes
│   ├── JWT validation
│   ├── User registration
│   └── Password management
│
├── events/index.js         # Handles /api/events/*
│   ├── Event CRUD
│   ├── Registration management
│   ├── Attendance tracking
│   └── Event listing
│
├── messaging/index.js      # Handles /api/messaging/*
│   ├── Conversation management
│   ├── Message sending
│   ├── Real-time updates (via polling)
│   └── Read status tracking
│
└── notifications/index.js  # Handles /api/notifications/*
    ├── Email sending
    ├── In-app notifications
    ├── Notification history
    └── User preferences
```

**Each service has:**
- Express.js router
- Database connection (Sequelize/ORM)
- Middleware (CORS, auth, error handling)
- Health check endpoint
- Error logging

### Database Schema

```sql
-- Core Tables
users                  -- Authentication & profiles
events                 -- Event management
event_registrations    -- Registration records
conversations          -- Message conversations
messages               -- Message threads
direct_messages        -- Peer-to-peer messages
notifications          -- User notifications
announcements          -- System announcements
calendar_events        -- Calendar management

-- Relationships
user → event           (one-to-many creator)
user → event_registration (many-to-many via junction)
user → messages        (one-to-many)
user → notifications   (one-to-many)
event → registrations  (one-to-many)
```

---

## 🔄 Request/Response Flow

### Example: User Login Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      1. User Action                             │
│  User enters email/password and clicks "Login"                  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│            2. Frontend API Call                                 │
│  authApi.login({ email, password })                           │
│  → POST /api/auth/login                                        │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│         3. Backend Auth Service                                │
│  Express.js handler processes request:                         │
│  • Validates email/password format                             │
│  • Queries PostgreSQL for user                                 │
│  • Compares password with bcrypt                               │
│  • Generates JWT token                                         │
│  • Returns { token, user }                                     │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│         4. Frontend Receives Response                           │
│  localStorage.setItem('token', token)                          │
│  Redirect to /dashboard                                        │
└─────────────────────────────────────────────────────────────────┘
```

### Example: Get Events Flow

```
┌──────────────────────────────────────────┐
│  1. User navigates to Events page        │
└────────────────────┬─────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────┐
│  2. Frontend calls:                      │
│  eventsApi.getAll()                      │
│  → GET /api/events                       │
│  → Headers: { Authorization: Bearer ... }│
└────────────────────┬─────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────┐
│  3. Backend Events Service               │
│  • Validates JWT token                   │
│  • Queries events from PostgreSQL        │
│  • Returns [ {...}, {...}, ... ]         │
└────────────────────┬─────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────┐
│  4. Frontend renders list of events      │
└──────────────────────────────────────────┘
```

---

## 🔐 Security Measures

1. **HTTPS/TLS Everywhere**
   - All traffic encrypted in transit
   - Vercel provides free SSL/TLS

2. **JWT Authentication**
   - Tokens stored in localStorage
   - Verified on every API request
   - Tokens have expiration time

3. **CORS Configuration**
   - Only your frontend can access backend
   - Methods: GET, POST, PUT, DELETE, PATCH
   - Headers whitelist: Content-Type, Authorization

4. **Password Security**
   - Hashed with bcrypt (10 rounds)
   - Never stored in plaintext
   - Verified during login

5. **Environment Variables**
   - Secrets not in code
   - Set in Vercel dashboard
   - Not visible in logs

6. **Database Connection**
   - SSL/TLS required
   - Connection pooling
   - SQL injection prevention via ORM

---

## 📊 Deployment Architecture

```
GitHub Repository
    │
    ├── Push to main branch
    │
    └───→ Vercel Webhook triggered
            │
            ├─→ Build Frontend
            │   ├── npm install
            │   ├── npm run build
            │   └── Upload to CDN
            │
            └─→ Build Backend
                ├── npm install
                ├── Create function bundles
                └── Deploy serverless functions
```

---

## 🚀 Deployment Pipeline

```
Development
    ↓
Feature Branch
    ↓
GitHub PR (Review)
    ↓
Merge to main
    ↓
Vercel Auto-Deploy
    ├→ Run build
    ├→ Run tests (if configured)
    ├→ Deploy to production
    └→ Generate live URL

Rollback (if needed)
    ↓
Select previous deployment in Vercel
    ↓
Click "Promote to Production"
```

---

## 📈 Scalability Considerations

### Current Architecture Supports:
- **Users**: Up to 5,000 concurrent users (free tier)
- **Requests**: Vercel scales automatically
- **Database**: Render free tier ~ 10GB storage
- **Requests/Second**: Unlimited (within fair use)

### To Scale Further:
1. **Upgrade Render Database**: Premium tiers with more storage
2. **Upgrade Vercel**: Pro plan for priority support
3. **Add Caching**: Redis for session management
4. **Database Optimization**: Indexes, query optimization
5. **Horizontal Scaling**: Additional microservices
6. **Load Balancing**: Automatic via Vercel

---

## 🔄 Development Workflow

```
Local Development
    ├── git clone repo
    ├── npm install
    ├── npm install (frontend/)
    ├── node dev-server.js (test locally)
    └── node test-db-connection.js (verify DB)
        ↓
Development Testing
    ├── Postman/Insomnia for API testing
    ├── React DevTools for frontend
    └── Browser console for debugging
        ↓
Push to GitHub
    ├── git push origin feature-branch
    ├── Create PR
    └── Code review
        ↓
Merge to main
    │
    └─→ Automatic Vercel Deployment
        ├── Staging (preview URL)
        └── Production
```

---

## 🎯 Key Features Enabled by This Architecture

✅ **Microservices**: Each service independently deployable
✅ **Serverless**: No server management needed
✅ **Scalability**: Automatic scaling on Vercel
✅ **Real-time**: Socket.io support via polling
✅ **Security**: JWT + HTTPS + CORS
✅ **Monitoring**: Vercel & Render dashboards
✅ **CI/CD**: Automatic deployment on push
✅ **Cost-Effective**: Free tiers available
✅ **No Docker**: Simpler deployment
✅ **PostgreSQL**: Industry-standard database

---

**Architecture Last Updated**: December 2024
**Status**: Production Ready
