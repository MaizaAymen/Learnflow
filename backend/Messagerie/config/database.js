const { Sequelize } = require('sequelize');
require('dotenv').config();

// Connect to the same PostgreSQL database as other services (shared auth_service database)
const sequelize = new Sequelize(
  process.env.DB_NAME || 'auth_service',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'aymen',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    define: {
      schema: 'referentiels'  // 👈 All Messagerie tables go in referentiels schema
    },
    logging: process.env.DB_LOGGING === 'true' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Test connection
sequelize.authenticate().then(() => {
  console.log('✅ Connected to auth_service database (referentiels schema)');
}).catch((err) => {
  console.error('❌ Database connection error:', err.message);
});

module.exports = sequelize;
