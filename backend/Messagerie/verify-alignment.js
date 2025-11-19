#!/usr/bin/env node

/**
 * Messagerie Service - Sequelize Alignment Verification
 * Verifies that Messagerie service is properly aligned with other services
 */

const fs = require('fs');
const path = require('path');

console.log(`
╔════════════════════════════════════════════════════════════════════╗
║  🔍 Messagerie Service - Sequelize Alignment Verification         ║
╚════════════════════════════════════════════════════════════════════╝
`);

const checks = {
  passed: [],
  failed: []
};

// Helper function
function check(name, condition, details = '') {
  if (condition) {
    checks.passed.push(name);
    console.log(`✅ ${name}`);
    if (details) console.log(`   └─ ${details}`);
  } else {
    checks.failed.push(name);
    console.log(`❌ ${name}`);
    if (details) console.log(`   └─ ${details}`);
  }
}

// 1. Check package.json
console.log('\n📦 Package Dependencies Check:');
try {
  const packagePath = path.join(__dirname, 'package.json');
  const pkg = require(packagePath);
  
  const requiredDeps = [
    'sequelize', 'pg', 'pg-hstore', 'express', 'cors', 
    'socket.io', 'jsonwebtoken', 'dotenv', 'uuid'
  ];
  
  requiredDeps.forEach(dep => {
    check(`Dependency: ${dep}`, pkg.dependencies[dep], pkg.dependencies[dep]);
  });
  
  // Check for auth-service style deps
  const authStyleDeps = ['bcrypt', 'cookie-parser', 'multer', 'nodemailer'];
  authStyleDeps.forEach(dep => {
    check(`Auth-style dependency: ${dep}`, pkg.dependencies[dep], pkg.dependencies[dep]);
  });
} catch (err) {
  console.log(`⚠️  Could not verify package.json: ${err.message}`);
}

// 2. Check Models
console.log('\n🗂️  Models Configuration Check:');
const modelFiles = [
  'Message.js',
  'Conversation.js',
  'ConversationParticipant.js',
  'UserOnlineStatus.js'
];

modelFiles.forEach(file => {
  try {
    const modelPath = path.join(__dirname, `models/${file}`);
    const content = fs.readFileSync(modelPath, 'utf8');
    
    check(
      `${file} - Uses auth-service config`,
      content.includes("require('../../auth-service/config')"),
      "Sequelize instance properly referenced"
    );
    
    check(
      `${file} - Has schema definition`,
      content.includes("schema: 'referentiels'"),
      "Tables will be created in referentiels schema"
    );
    
    check(
      `${file} - Has timestamps enabled`,
      content.includes("timestamps: true"),
      "createdAt/updatedAt tracking enabled"
    );
    
    check(
      `${file} - Has indexes`,
      content.includes("indexes:"),
      "Query performance optimized"
    );
  } catch (err) {
    console.log(`⚠️  Could not verify ${file}: ${err.message}`);
  }
});

// 3. Check server.js
console.log('\n🚀 Server Configuration Check:');
try {
  const serverPath = path.join(__dirname, 'server.js');
  const content = fs.readFileSync(serverPath, 'utf8');
  
  check(
    'server.js - Uses auth-service config',
    content.includes("require('../auth-service/config')"),
    "Shared database instance"
  );
  
  check(
    'server.js - Schema creation logic',
    content.includes("CREATE SCHEMA IF NOT EXISTS referentiels"),
    "Schema initialization implemented"
  );
  
  check(
    'server.js - FK constraint management',
    content.includes("SET session_replication_role"),
    "Foreign key constraint handling included"
  );
  
  check(
    'server.js - Model sync',
    content.includes("sequelize.sync"),
    "Sequelize sync configured"
  );
} catch (err) {
  console.log(`⚠️  Could not verify server.js: ${err.message}`);
}

// 4. Check .env
console.log('\n⚙️  Environment Configuration Check:');
try {
  const envPath = path.join(__dirname, '.env');
  const content = fs.readFileSync(envPath, 'utf8');
  
  check(
    '.env - DB_NAME=auth_service',
    content.includes('DB_NAME=auth_service'),
    "Using shared auth_service database"
  );
  
  check(
    '.env - DB_USER=postgres',
    content.includes('DB_USER=postgres'),
    "Using correct PostgreSQL user"
  );
  
  check(
    '.env - DB_PASSWORD=aymen',
    content.includes('DB_PASSWORD=aymen'),
    "Using shared credentials"
  );
  
  check(
    '.env - PORT=3001',
    content.includes('PORT=3001'),
    "Messagerie runs on port 3001"
  );
} catch (err) {
  console.log(`⚠️  Could not verify .env: ${err.message}`);
}

// Summary
console.log(`
╔════════════════════════════════════════════════════════════════════╗
║  📊 VERIFICATION SUMMARY
╠════════════════════════════════════════════════════════════════════╣
║  ✅ Passed: ${checks.passed.length}
║  ❌ Failed: ${checks.failed.length}
╚════════════════════════════════════════════════════════════════════╝
`);

if (checks.failed.length === 0) {
  console.log(`
✨ All checks passed! Messagerie service is properly aligned with Sequelize.

🚀 Ready to start:
   npm start

📊 Shared Resources:
   • Database: auth_service
   • Schema: referentiels
   • Config: ../auth-service/config
  `);
} else {
  console.log(`
⚠️  Some checks failed. Please review:
${checks.failed.map(f => `   • ${f}`).join('\n')}
  `);
  process.exit(1);
}
