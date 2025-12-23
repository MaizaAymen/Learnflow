/**
 * Database Connection Test Script
 * Tests connection to Render PostgreSQL and logs status
 * 
 * Usage: node test-db-connection.js
 */

import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set in .env.local');
  process.exit(1);
}

console.log('🔍 Testing database connection...');
console.log(`📍 Database: ${DATABASE_URL.split('@')[1]?.split('/')[0] || 'Unknown'}`);

const sequelize = new Sequelize(DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

sequelize.authenticate()
  .then(() => {
    console.log('✅ Database connection successful!');
    console.log('✨ Your PostgreSQL database is ready.');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Database connection failed!');
    console.error('Error:', err.message);
    
    if (err.message.includes('password')) {
      console.error('💡 Hint: Check your database password in DATABASE_URL');
    } else if (err.message.includes('host')) {
      console.error('💡 Hint: Check your database host in DATABASE_URL');
    } else if (err.message.includes('database')) {
      console.error('💡 Hint: Check your database name in DATABASE_URL');
    }
    
    process.exit(1);
  });
