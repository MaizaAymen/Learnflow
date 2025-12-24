const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Dynamic CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://learnflow-blond.vercel.app',
  'https://learnflow-6cc88ydmf-maizaaymena-gmailcoms-projects.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list or is a Vercel preview deployment
    if (allowedOrigins.includes(origin) || origin.includes('vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/auth-uploads', express.static(path.join(__dirname, 'auth-service', 'uploads')));
app.use('/events-uploads', express.static(path.join(__dirname, 'Gestion des Événements', 'uploads')));

// Health check
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'Learnflow Unified Backend',
    services: ['auth', 'events', 'messaging', 'notifications'],
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'Unified backend running',
    timestamp: new Date().toISOString()
  });
});

// Load all services
let servicesLoaded = {
  auth: false,
  events: false,
  messaging: false,
  notifications: false
};

let serviceErrors = {};

// 1. Auth Service
try {
  const authRoutes = require('./auth-service/routes/authRoutes');
  const departmentHeadRoutes = require('./auth-service/routes/departmentHeadRoutes');
  
  app.use('/api/auth', authRoutes);
  app.use('/api/department-heads', departmentHeadRoutes);
  servicesLoaded.auth = true;
  console.log('✅ Auth service loaded');
} catch (error) {
  console.error('❌ Auth service failed:', error.message);
  serviceErrors.auth = error.message;
}

// 2. Events Service
try {
  const eventsRoutes = require('./Gestion des Événements/routes/events');
  
  app.use('/api/events', eventsRoutes);
  servicesLoaded.events = true;
  console.log('✅ Events service loaded');
} catch (error) {
  console.error('❌ Events service failed:', error.message);
  serviceErrors.events = error.message;
}

// 3. Messaging Service
try {
  const messagingRoutes = require('./Messagerie/routes/messaging');
  
  app.use('/api/messaging', messagingRoutes);
  servicesLoaded.messaging = true;
  console.log('✅ Messaging service loaded');
} catch (error) {
  console.error('❌ Messaging service failed:', error.message);
  serviceErrors.messaging = error.message;
}

// 4. Notifications Service
try {
  const notificationRoutes = require('./Service de Notifications/routes/notifications');
  
  app.use('/api/notifications', notificationRoutes);
  servicesLoaded.notifications = true;
  console.log('✅ Notifications service loaded');
} catch (error) {
  console.error('❌ Notifications service failed:', error.message);
  serviceErrors.notifications = error.message;
}

// Service status endpoint
app.get('/api/status', (req, res) => {
  res.json({ 
    services: servicesLoaded,
    errors: serviceErrors,
    allLoaded: Object.values(servicesLoaded).every(v => v),
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: err.message,
    path: req.path,
    method: req.method
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found', 
    path: req.path,
    availableServices: Object.keys(servicesLoaded).filter(s => servicesLoaded[s])
  });
});

// Start server (only if not imported as module)
if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Unified Backend Server running on port ${PORT}`);
    console.log('📊 Services loaded:', servicesLoaded);
    if (Object.keys(serviceErrors).length > 0) {
      console.log('⚠️  Service errors:', serviceErrors);
    }
  });
}

module.exports = app;
