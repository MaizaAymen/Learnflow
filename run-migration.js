/**
 * Automated Data Migration Script
 */

const { PrismaClient } = require('@prisma/client');

// Database URLs
const LOCAL_DB = "postgresql://postgres:aymen@localhost:5432/auth_service";
const PRODUCTION_DB = "postgresql://learnflow_db_user:2Bj20qXV9Gb4UenBJUSEGWO99t1neyr2@dpg-d55ckmeuk2gs73brvs10-a.oregon-postgres.render.com/learnflow_db";

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

async function main() {
  log.header('🚀 LEARNFLOW DATA MIGRATION');
  
  console.log('Migrating from:');
  console.log(`  📍 LOCAL:      auth_service@localhost`);
  console.log('To:');
  console.log(`  🌍 PRODUCTION: learnflow_db@Render\n`);

  log.header('📤 STEP 1: Exporting data from LOCAL database...');
  
  const localPrisma = new PrismaClient({
    datasources: { db: { url: LOCAL_DB } }
  });

  let exportedData = {};

  try {
    // Export Users
    log.info('Exporting users...');
    exportedData.users = await localPrisma.user.findMany();
    log.success(`Exported ${exportedData.users.length} users`);

    // Export Events
    log.info('Exporting events...');
    exportedData.events = await localPrisma.event.findMany();
    log.success(`Exported ${exportedData.events.length} events`);

    // Export Event Registrations
    log.info('Exporting event registrations...');
    exportedData.eventRegistrations = await localPrisma.eventRegistration.findMany();
    log.success(`Exported ${exportedData.eventRegistrations.length} event registrations`);

    // Export Conversations
    log.info('Exporting conversations...');
    exportedData.conversations = await localPrisma.conversation.findMany();
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
    console.error(error);
    await localPrisma.$disconnect();
    process.exit(1);
  }

  log.header('📥 STEP 2: Importing data to PRODUCTION database...');
  
  const productionPrisma = new PrismaClient({
    datasources: { db: { url: PRODUCTION_DB } }
  });

  try {
    // Import Users
    log.info('Importing users...');
    for (const user of exportedData.users) {
      await productionPrisma.user.upsert({
        where: { id: user.id },
        update: user,
        create: user
      });
    }
    log.success(`Imported ${exportedData.users.length} users`);

    // Import Events
    log.info('Importing events...');
    for (const event of exportedData.events) {
      await productionPrisma.event.upsert({
        where: { id: event.id },
        update: event,
        create: event
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
      await productionPrisma.conversation.upsert({
        where: { id: conversation.id },
        update: conversation,
        create: conversation
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
