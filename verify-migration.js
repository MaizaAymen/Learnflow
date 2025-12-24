/**
 * 🔍 Data Verification Script
 * 
 * This script compares data counts between local and production
 * to ensure migration was successful
 * 
 * Usage:
 *   node verify-migration.js
 */

const { PrismaClient } = require('@prisma/client');
const readline = require('readline');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

const log = {
  info: (msg) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}\n`)
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function getDataCounts(prisma, label) {
  log.header(`📊 Counting records in ${label} database...`);
  
  const counts = {
    users: await prisma.user.count(),
    events: await prisma.event.count(),
    eventRegistrations: await prisma.eventRegistration.count(),
    conversations: await prisma.conversation.count(),
    messages: await prisma.message.count(),
    directMessages: await prisma.directMessage.count(),
    notifications: await prisma.notification.count()
  };

  console.log(`  👥 Users: ${counts.users}`);
  console.log(`  📅 Events: ${counts.events}`);
  console.log(`  ✅ Event Registrations: ${counts.eventRegistrations}`);
  console.log(`  💬 Conversations: ${counts.conversations}`);
  console.log(`  📨 Messages: ${counts.messages}`);
  console.log(`  📬 Direct Messages: ${counts.directMessages}`);
  console.log(`  🔔 Notifications: ${counts.notifications}`);

  return counts;
}

function compareCounts(localCounts, prodCounts) {
  log.header('🔍 COMPARISON RESULTS');
  
  const tables = [
    { name: 'Users', icon: '👥', key: 'users' },
    { name: 'Events', icon: '📅', key: 'events' },
    { name: 'Event Registrations', icon: '✅', key: 'eventRegistrations' },
    { name: 'Conversations', icon: '💬', key: 'conversations' },
    { name: 'Messages', icon: '📨', key: 'messages' },
    { name: 'Direct Messages', icon: '📬', key: 'directMessages' },
    { name: 'Notifications', icon: '🔔', key: 'notifications' }
  ];

  let allMatch = true;
  let totalLocal = 0;
  let totalProd = 0;

  console.log(`\n${'Table'.padEnd(25)} | ${'Local'.padEnd(10)} | ${'Production'.padEnd(12)} | Status`);
  console.log('-'.repeat(70));

  tables.forEach(table => {
    const local = localCounts[table.key];
    const prod = prodCounts[table.key];
    const match = local === prod;
    
    totalLocal += local;
    totalProd += prod;

    if (!match) allMatch = false;

    const status = match 
      ? `${colors.green}✓ Match${colors.reset}`
      : `${colors.red}✗ Mismatch${colors.reset}`;

    const localStr = String(local).padEnd(10);
    const prodStr = String(prod).padEnd(12);
    const tableStr = `${table.icon} ${table.name}`.padEnd(25);

    console.log(`${tableStr} | ${localStr} | ${prodStr} | ${status}`);
  });

  console.log('-'.repeat(70));
  console.log(`${'TOTAL'.padEnd(25)} | ${String(totalLocal).padEnd(10)} | ${String(totalProd).padEnd(12)} |`);

  console.log('\n');

  if (allMatch && totalLocal > 0) {
    log.success(`🎉 SUCCESS! All data counts match perfectly!`);
    log.success(`Total records migrated: ${totalLocal}`);
    return true;
  } else if (totalLocal === 0) {
    log.warning('⚠️  Local database appears to be empty');
    return false;
  } else {
    log.error('❌ Data counts do not match. Some data may not have been migrated.');
    log.info('Please review the migration logs and try again if needed.');
    return false;
  }
}

async function main() {
  log.header('🔍 LEARNFLOW DATA VERIFICATION');
  
  console.log('This script will compare data counts between:');
  console.log('  1. Your LOCAL database');
  console.log('  2. Your PRODUCTION database\n');

  log.info('Please provide your database connection strings:');
  
  const localDbUrl = await question('\n📍 LOCAL Database URL: ');
  if (!localDbUrl || localDbUrl.trim() === '') {
    log.error('Local database URL is required!');
    rl.close();
    process.exit(1);
  }

  const productionDbUrl = await question('\n🌍 PRODUCTION Database URL: ');
  if (!productionDbUrl || productionDbUrl.trim() === '') {
    log.error('Production database URL is required!');
    rl.close();
    process.exit(1);
  }

  rl.close();

  let localCounts, prodCounts;

  // Connect to local database
  log.info('\nConnecting to LOCAL database...');
  const localPrisma = new PrismaClient({
    datasources: {
      db: { url: localDbUrl }
    }
  });

  try {
    localCounts = await getDataCounts(localPrisma, 'LOCAL');
    await localPrisma.$disconnect();
  } catch (error) {
    log.error(`Failed to connect to local database: ${error.message}`);
    await localPrisma.$disconnect();
    process.exit(1);
  }

  // Connect to production database
  log.info('\nConnecting to PRODUCTION database...');
  const prodPrisma = new PrismaClient({
    datasources: {
      db: { url: productionDbUrl }
    }
  });

  try {
    prodCounts = await getDataCounts(prodPrisma, 'PRODUCTION');
    await prodPrisma.$disconnect();
  } catch (error) {
    log.error(`Failed to connect to production database: ${error.message}`);
    await prodPrisma.$disconnect();
    process.exit(1);
  }

  // Compare results
  const success = compareCounts(localCounts, prodCounts);

  if (success) {
    log.header('✅ VERIFICATION COMPLETE - MIGRATION SUCCESSFUL!');
  } else {
    log.header('⚠️  VERIFICATION COMPLETE - REVIEW REQUIRED');
  }

  process.exit(success ? 0 : 1);
}

main()
  .catch((error) => {
    log.error(`Fatal error: ${error.message}`);
    console.error(error);
    process.exit(1);
  });
