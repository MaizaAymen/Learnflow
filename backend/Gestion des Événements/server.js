const express = require('express');
const cors = require('cors');
const http = require('http');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET','POST','PUT','DELETE','PATCH'],
  credentials: true
}));

// Serve static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// DB
const sequelize = require('../auth-service/config');
const models = require('./models');
const { Event } = models;

// Routes
const eventsRoutes = require('./routes/events');
app.use('/api/events', eventsRoutes);

app.get('/health', (req,res)=> res.json({ status: 'Events service running' }));

async function initializeServer(){
  try{
    await sequelize.query('CREATE SCHEMA IF NOT EXISTS referentiels;');
    console.log('✅ referentiels schema verified/created');

    // Temporarily disable FK checks while syncing
    await sequelize.query('SET session_replication_role = replica;');

    await sequelize.sync({ alter: true, force: false });
    console.log('✅ Events models synced');

    await sequelize.query('SET session_replication_role = DEFAULT;');

    const PORT = process.env.PORT || 3004;
    server.listen(PORT, ()=>{
      console.log(`Events service listening on port ${PORT}`);
    });
  }catch(err){
    console.error('Failed to start Events service', err.message);
    try{ await sequelize.query('SET session_replication_role = DEFAULT;'); }catch(e){}
    process.exit(1);
  }
}

initializeServer();

module.exports = { app, server };
