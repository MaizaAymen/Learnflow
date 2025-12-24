/**
 * 🚀 Learnflow Data Migration Script
 * 
 * This script migrates data from your local database to production
 * 
 * Usage:
 *   node migrate-data-to-production.js
 */

const { PrismaClient } = require('@prisma/client');
const readline = require('readline');

// Color codes for console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

const log = {
  info: (msg) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}\n`)
};

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  log.header('🚀 LEARNFLOW DATA MIGRATION TO PRODUCTION');
  
  console.log('This script will:');
  console.log('  1. Connect to your LOCAL database');
  console.log('  2. Export all data');
  console.log('  3. Connect to your PRODUCTION database');
  console.log('  4. Import all data\n');
  
  log.warning('⚠️  IMPORTANT: Make sure you have backup of your production database!');
  
  const confirm = await question('\nDo you want to proceed? (yes/no): ');
  
  if (confirm.toLowerCase() !== 'yes') {
    log.info('Migration cancelled.');
    rl.close();
    process.exit(0);
  }

  // Get database URLs
  console.log('\n');
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

  log.header('📤 STEP 1: Exporting data from LOCAL database...');
  
  const localPrisma = new PrismaClient({
    datasources: {
      db: {
        url: localDbUrl
      }
    }
  });

  let exportedData = {};

  try {
    // Export Users
    log.info('Exporting users...');
    exportedData.users = await localPrisma.user.findMany({
      include: {
        ownedEvents: true,
        registrations: true,
        conversations: true,
        messages: true,
        notifications: true,
        sentMessages: true,
        receivedMessages: true
      }
    });
    log.success(`Exported ${exportedData.users.length} users`);

    // Export Events
    log.info('Exporting events...');
    exportedData.events = await localPrisma.event.findMany({
      include: {
        registrations: true
      }
    });
    log.success(`Exported ${exportedData.events.length} events`);

    // Export Event Registrations
    log.info('Exporting event registrations...');
    exportedData.eventRegistrations = await localPrisma.eventRegistration.findMany();
    log.success(`Exported ${exportedData.eventRegistrations.length} event registrations`);

    // Export Conversations
    log.info('Exporting conversations...');
    exportedData.conversations = await localPrisma.conversation.findMany({
      include: {
        messages: true
      }
    });
    log.success(`Exported ${exportedData.conversations.length} conversations`);

    // Export Messages
    log.info('Exporting messages...');
    exportedData.messages = await localPrisma.message.findMany();
    log.success(`Exported ${exportedData.messages.length} messages`);

    // Export Direct Messages
    log.info('Exporting direct messages...');
    exportedData.directMessages = await localPrisma.directMessage.findMany();
    log.success(`Exported ${exportedData.directMessages.length} direct messages`);

    // Export Notifications
    log.info('Exporting notifications...');
    exportedData.notifications = await localPrisma.notification.findMany();
    log.success(`Exported ${exportedData.notifications.length} notifications`);

    await localPrisma.$disconnect();
    
    log.success('✅ Local data export completed!\n');

  } catch (error) {
    log.error(`Failed to export data: ${error.message}`);
    await localPrisma.$disconnect();
    process.exit(1);
  }

  log.header('📥 STEP 2: Importing data to PRODUCTION database...');
  
  const productionPrisma = new PrismaClient({
    datasources: {
      db: {
        url: productionDbUrl
      }
    }
  });

  try {
    // Import Users (without relations to avoid conflicts)
    log.info('Importing users...');
    for (const user of exportedData.users) {
      const { ownedEvents, registrations, conversations, messages, notifications, sentMessages, receivedMessages, ...userData } = user;
      
      await productionPrisma.user.upsert({
        where: { id: userData.id },
        update: userData,
        create: userData
      });
    }
    log.success(`Imported ${exportedData.users.length} users`);

    // Import Events
    log.info('Importing events...');
    for (const event of exportedData.events) {
      const { registrations, ...eventData } = event;
      
      await productionPrisma.event.upsert({
        where: { id: eventData.id },
        update: eventData,
        create: eventData
      });
    }
    log.success(`Imported ${exportedData.events.length} events`);

    // Import Event Registrations
    log.info('Importing event registrations...');
    for (const registration of exportedData.eventRegistrations) {
      await productionPrisma.eventRegistration.upsert({
        where: { id: registration.id },
        update: registration,
        create: registration
      });
    }
    log.success(`Imported ${exportedData.eventRegistrations.length} event registrations`);

    // Import Conversations
    log.info('Importing conversations...');
    for (const conversation of exportedData.conversations) {
      const { messages, ...conversationData } = conversation;
      
      await productionPrisma.conversation.upsert({
        where: { id: conversationData.id },
        update: conversationData,
        create: conversationData
      });
    }
    log.success(`Imported ${exportedData.conversations.length} conversations`);

    // Import Messages
    log.info('Importing messages...');
    for (const message of exportedData.messages) {
      await productionPrisma.message.upsert({
        where: { id: message.id },
        update: message,
        create: message
      });
    }
    log.success(`Imported ${exportedData.messages.length} messages`);

    // Import Direct Messages
    log.info('Importing direct messages...');
    for (const directMessage of exportedData.directMessages) {
      await productionPrisma.directMessage.upsert({
        where: { id: directMessage.id },
        update: directMessage,
        create: directMessage
      });
    }
    log.success(`Imported ${exportedData.directMessages.length} direct messages`);

    // Import Notifications
    log.info('Importing notifications...');
    for (const notification of exportedData.notifications) {
      await productionPrisma.notification.upsert({
        where: { id: notification.id },
        update: notification,
        create: notification
      });
    }
    log.success(`Imported ${exportedData.notifications.length} notifications`);

    await productionPrisma.$disconnect();
    
    log.header('🎉 MIGRATION COMPLETED SUCCESSFULLY!');
    console.log('\nSummary:');
    console.log(`  👥 Users: ${exportedData.users.length}`);
    console.log(`  📅 Events: ${exportedData.events.length}`);
    console.log(`  ✅ Registrations: ${exportedData.eventRegistrations.length}`);
    console.log(`  💬 Conversations: ${exportedData.conversations.length}`);
    console.log(`  📨 Messages: ${exportedData.messages.length}`);
    console.log(`  📬 Direct Messages: ${exportedData.directMessages.length}`);
    console.log(`  🔔 Notifications: ${exportedData.notifications.length}`);
    console.log('\n✅ All data has been migrated to production!\n');

  } catch (error) {
    log.error(`Failed to import data: ${error.message}`);
    console.error(error);
    await productionPrisma.$disconnect();
    process.exit(1);
  }
}

main()
  .catch((error) => {
    log.error(`Fatal error: ${error.message}`);
    console.error(error);
    process.exit(1);
  });
