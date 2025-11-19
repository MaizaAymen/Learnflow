const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  'auth_service', // Database
  'postgres',     // User
  'aymen',        // Password
  {
    host: 'localhost',
    dialect: 'postgres',
    port: 5432,
    // NO DEFAULT SCHEMA - Let each model specify its own schema
    // This allows models in different schemas to coexist
    logging: false
  }
);

sequelize.authenticate().then(() => {
  console.log('✅ Notification Service connected to auth_service database');
}).catch((err) => {
  console.error('❌ Database connection error:', err.message);
});

module.exports = sequelize;
