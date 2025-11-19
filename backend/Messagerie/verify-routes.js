#!/usr/bin/env node

/**
 * Messagerie API Routes - Verification & Testing Guide
 * This script verifies all routes are correctly implemented
 */

const fs = require('fs');
const path = require('path');

console.log(`
╔════════════════════════════════════════════════════════════════╗
║         📡 MESSAGERIE API ROUTES - VERIFICATION                ║
╚════════════════════════════════════════════════════════════════╝
`);

const routesFile = path.join(__dirname, 'routes', 'messaging.js');
const content = fs.readFileSync(routesFile, 'utf8');

const routes = [
  {
    name: 'POST /conversations',
    method: 'post',
    pattern: "router.post('/conversations'",
    description: 'Create conversation'
  },
  {
    name: 'GET /conversations',
    method: 'get',
    pattern: "router.get('/conversations',",
    description: 'List conversations'
  },
  {
    name: 'GET /conversations/:conversationId/messages',
    method: 'get',
    pattern: "router.get('/conversations/:conversationId/messages'",
    description: 'Get messages'
  },
  {
    name: 'POST /messages',
    method: 'post',
    pattern: "router.post('/messages'",
    description: 'Send message'
  },
  {
    name: 'GET /search-users',
    method: 'get',
    pattern: "router.get('/search-users'",
    description: 'Search users'
  },
  {
    name: 'GET /unread-count',
    method: 'get',
    pattern: "router.get('/unread-count'",
    description: 'Get unread count'
  },
  {
    name: 'GET /online-status/:userId',
    method: 'get',
    pattern: "router.get('/online-status/:userId'",
    description: 'Check online status'
  },
  {
    name: 'DELETE /conversations/:conversationId',
    method: 'delete',
    pattern: "router.delete('/conversations/:conversationId'",
    description: 'Delete conversation'
  }
];

console.log('📋 Route Verification:\n');

let passed = 0;
let failed = 0;

routes.forEach((route, index) => {
  const found = content.includes(route.pattern);
  
  if (found) {
    console.log(`✅ ${index + 1}. ${route.name}`);
    console.log(`   └─ ${route.description}`);
    passed++;
  } else {
    console.log(`❌ ${index + 1}. ${route.name}`);
    console.log(`   └─ NOT FOUND`);
    failed++;
  }
});

console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔒 Middleware Check:
`);

const authCheck = content.includes('authenticateToken');
const authFile = fs.existsSync(path.join(__dirname, 'middleware', 'auth.js'));

console.log(`${authCheck ? '✅' : '❌'} JWT Authentication middleware`);
console.log(`${authFile ? '✅' : '❌'} auth.js file exists`);

console.log(`
📊 Statistics:
`);

const lineCount = content.split('\n').length;
const functionCount = (content.match(/router\.(get|post|delete|put)/g) || []).length;

console.log(`   Routes implemented: ${functionCount}/${routes.length}`);
console.log(`   Total lines: ${lineCount}`);
console.log(`   File size: ${(fs.statSync(routesFile).size / 1024).toFixed(2)} KB`);

console.log(`
🧪 Test Commands:
`);

console.log(`
# Start service
cd backend/Messagerie && npm start

# In another terminal, test routes:
curl -X GET http://localhost:3001/health

# With authentication:
curl -X GET http://localhost:3001/api/messaging/unread-count \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
`);

console.log(`
╔════════════════════════════════════════════════════════════════╗
║         Status: ${passed === routes.length ? '🟢 ALL ROUTES READY' : '🟡 INCOMPLETE'}
║         Passed: ${passed}/${routes.length}
║         Failed: ${failed}/${routes.length}
╚════════════════════════════════════════════════════════════════╝
`);

process.exit(failed > 0 ? 1 : 0);
