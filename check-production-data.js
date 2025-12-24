/**
 * 🔍 Check Production Database Data
 * 
 * This script shows what data is currently in your production database
 */

const { PrismaClient } = require('@prisma/client');

// Your production database URL
const DATABASE_URL = "postgresql://learnflow_db_user:2Bj20qXV9Gb4UenBJUSEGWO99t1neyr2@dpg-d55ckmeuk2gs73brvs10-a.oregon-postgres.render.com/learnflow_db";

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

async function main() {
  console.log(`\n${colors.bright}${colors.cyan}🔍 CHECKING PRODUCTION DATABASE${colors.reset}\n`);
  console.log(`${colors.cyan}Database: ${colors.reset}learnflow_db (Render)`);
  console.log(`${colors.cyan}Host: ${colors.reset}dpg-d55ckmeuk2gs73brvs10-a.oregon-postgres.render.com\n`);

  const prisma = new PrismaClient({
    datasources: {
      db: { url: DATABASE_URL }
    }
  });

  try {
    console.log(`${colors.yellow}⏳ Connecting to database...${colors.reset}\n`);

    // Get all data counts
    const [
      userCount,
      eventCount,
      registrationCount,
      conversationCount,
      messageCount,
      directMessageCount,
      notificationCount
    ] = await Promise.all([
      prisma.user.count(),
      prisma.event.count(),
      prisma.eventRegistration.count(),
      prisma.conversation.count(),
      prisma.message.count(),
      prisma.directMessage.count(),
      prisma.notification.count()
    ]);

    const totalRecords = userCount + eventCount + registrationCount + conversationCount + 
                        messageCount + directMessageCount + notificationCount;

    console.log(`${colors.bright}📊 DATABASE CONTENTS:${colors.reset}\n`);
    console.log(`  👥 Users:                ${colors.green}${userCount}${colors.reset}`);
    console.log(`  📅 Events:               ${colors.green}${eventCount}${colors.reset}`);
    console.log(`  ✅ Event Registrations:  ${colors.green}${registrationCount}${colors.reset}`);
    console.log(`  💬 Conversations:        ${colors.green}${conversationCount}${colors.reset}`);
    console.log(`  📨 Messages:             ${colors.green}${messageCount}${colors.reset}`);
    console.log(`  📬 Direct Messages:      ${colors.green}${directMessageCount}${colors.reset}`);
    console.log(`  🔔 Notifications:        ${colors.green}${notificationCount}${colors.reset}`);
    console.log(`  ${colors.bright}───────────────────────────────${colors.reset}`);
    console.log(`  ${colors.bright}📦 Total Records:       ${colors.magenta}${totalRecords}${colors.reset}\n`);

    if (totalRecords === 0) {
      console.log(`${colors.yellow}⚠️  Your production database is currently empty!${colors.reset}`);
      console.log(`${colors.cyan}ℹ  This is normal if you haven't added data yet.${colors.reset}\n`);
    } else {
      console.log(`${colors.green}✅ Your production database contains data!${colors.reset}\n`);
      
      // Get sample users
      const users = await prisma.user.findMany({
        take: 5,
        select: {
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          createdAt: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      if (users.length > 0) {
        console.log(`${colors.bright}👥 Recent Users:${colors.reset}\n`);
        users.forEach((user, index) => {
          const name = user.firstName && user.lastName 
            ? `${user.firstName} ${user.lastName}` 
            : 'No name set';
          console.log(`  ${index + 1}. ${user.email}`);
          console.log(`     Name: ${name}`);
          console.log(`     Role: ${user.role}`);
          console.log(`     Created: ${user.createdAt.toLocaleString()}\n`);
        });
      }

      // Get sample events
      const events = await prisma.event.findMany({
        take: 5,
        select: {
          title: true,
          description: true,
          startDate: true,
          endDate: true,
          createdAt: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      if (events.length > 0) {
        console.log(`${colors.bright}📅 Recent Events:${colors.reset}\n`);
        events.forEach((event, index) => {
          console.log(`  ${index + 1}. ${event.title}`);
          if (event.description) {
            console.log(`     ${event.description.substring(0, 60)}${event.description.length > 60 ? '...' : ''}`);
          }
          console.log(`     Start: ${new Date(event.startDate).toLocaleString()}`);
          console.log(`     End: ${new Date(event.endDate).toLocaleString()}\n`);
        });
      }
    }

    await prisma.$disconnect();
    
    console.log(`${colors.green}✅ Database check completed!${colors.reset}\n`);

  } catch (error) {
    console.error(`${colors.yellow}❌ Error: ${error.message}${colors.reset}`);
    console.error('\nPossible issues:');
    console.error('  - Network connection problem');
    console.error('  - Database credentials incorrect');
    console.error('  - Schema not initialized\n');
    await prisma.$disconnect();
    process.exit(1);
  }
}

main();
