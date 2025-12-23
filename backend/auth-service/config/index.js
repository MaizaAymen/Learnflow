const { Sequelize } = require('sequelize');
require('dotenv').config();

// Use DATABASE_URL from environment variable (for production) or fallback to local
const databaseUrl = process.env.DATABASE_URL;

let sequelize;

if (databaseUrl) {
  // Production: Use DATABASE_URL from Render
  sequelize = new Sequelize(databaseUrl, {
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    define: {
      schema: 'auth'
    }
  });
} else {
  // Local development
  sequelize = new Sequelize(
    'auth_service',
    'postgres',
    'aymen',
    {
      host: 'localhost',
      dialect: 'postgres',
      port: 5432,
      define: {
        schema: 'auth'
      }
    }
  );
}

sequelize.authenticate().then(() => {
  console.log('✅ Connected to database');
}).catch((err) => {
  console.log('❌ Database connection error: ' + err);
});

module.exports = sequelize;