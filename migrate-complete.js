/**
 * Complete Migration: auth_service → production
 * Migrates data from auth, referentiels, and public schemas
 */

const { Client } = require('pg');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

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
  log.header('🚀 COMPLETE DATA MIGRATION');
  
  console.log('Source: auth_service (all schemas)');
  console.log('Target: learnflow_db@Render\n');

  const localClient = new Client({ connectionString: LOCAL_DB });
  await localClient.connect();
  log.success('Connected to local database\n');

  log.header('📤 EXPORTING DATA');

  let stats = {
    users: 0,
    events: 0,
    registrations: 0,
    conversations: 0,
    messages: 0,
    notifications: 0,
    announcements: 0
  };

  // Export users from auth.utilisateur
  log.info('Exporting users from auth schema...');
  const authUsersResult = await localClient.query('SELECT * FROM auth.utilisateur');
  const authUsers = authUsersResult.rows;
  log.success(`Found ${authUsers.length} users in auth schema`);

  // Export events from referentiels.evenement
  log.info('Exporting events...');
  const eventsResult = await localClient.query('SELECT * FROM referentiels.evenement');
  const events = eventsResult.rows;
  log.success(`Found ${events.length} events`);

  // Export event registrations
  log.info('Exporting event registrations...');
  const registrationsResult = await localClient.query('SELECT * FROM referentiels.event_registration');
  const registrations = registrationsResult.rows;
  log.success(`Found ${registrations.length} event registrations`);

  // Export conversations
  log.info('Exporting conversations...');
  const conversationsResult = await localClient.query('SELECT * FROM referentiels.conversations');
  const conversations = conversationsResult.rows;
  log.success(`Found ${conversations.length} conversations`);

  // Export messages
  log.info('Exporting messages...');
  const messagesResult = await localClient.query('SELECT * FROM referentiels.messages');
  const messages = messagesResult.rows;
  log.success(`Found ${messages.length} messages`);

  // Export notifications
  log.info('Exporting notifications...');
  const notificationsResult = await localClient.query('SELECT * FROM referentiels.notifications');
  const notifications = notificationsResult.rows;
  log.success(`Found ${notifications.length} notifications`);

  // Export announcements
  log.info('Exporting announcements...');
  const announcementsResult = await localClient.query('SELECT * FROM auth.announcements');
  const announcements = announcementsResult.rows;
  log.success(`Found ${announcements.length} announcements`);

  await localClient.end();
  log.success('✅ Export completed!\n');

  log.header('📥 IMPORTING TO PRODUCTION');

  const prodPrisma = new PrismaClient({
    datasources: { db: { url: PRODUCTION_DB } }
  });

  try {
    // Import Users
    log.info('Importing users...');
    for (const user of authUsers) {
      try {
        // Map role
        let role = 'STUDENT';
        if (user.role === 'admin') role = 'ADMIN';
        else if (user.role === 'enseignant' || user.role === 'teacher') role = 'TEACHER';
        else if (user.is_department_head) role = 'DEPARTMENT_HEAD';

        await prodPrisma.user.create({
          data: {
            id: `user_${user.id}`,
            email: user.email || `user${user.id}@imported.local`,
            password: user.mdp_hash || await bcrypt.hash('changeme123', 10),
            firstName: user.prenom || null,
            lastName: user.nom || null,
            avatar: user.image || null,
            role: role,
            status: user.statut === 'inactif' ? 'INACTIVE' : 'ACTIVE',
            createdAt: user.createdat || new Date(),
            updatedAt: user.updatedat || new Date()
          }
        });
        stats.users++;
      } catch (err) {
        if (!err.message.includes('Unique constraint')) {
          log.warning(`Skipped user ${user.id}: ${err.message}`);
        }
      }
    }
    log.success(`Imported ${stats.users} users`);

    // Import Events
    log.info('Importing events...');
    for (const event of events) {
      try {
        // Find creator (use first admin user or create generic)
        const creator = authUsers.find(u => u.role === 'admin') || authUsers[0];
        const creatorId = creator ? `user_${creator.id}` : 'system';

        await prodPrisma.event.create({
          data: {
            id: `event_${event.id}`,
            title: event.title,
            description: event.description || '',
            startDate: new Date(event.start_date || event.date_debut || Date.now()),
            endDate: new Date(event.end_date || event.date_fin || Date.now() + 3600000),
            location: event.location || event.lieu || null,
            capacity: event.capacity || event.max_participants || null,
            attendees: event.attendees || 0,
            creatorId: creatorId,
            createdAt: event.created_at || new Date(),
            updatedAt: event.updated_at || new Date()
          }
        });
        stats.events++;
      } catch (err) {
        log.warning(`Skipped event ${event.id}: ${err.message}`);
      }
    }
    log.success(`Imported ${stats.events} events`);

    // Import Event Registrations
    log.info('Importing event registrations...');
    for (const reg of registrations) {
      try {
        const userId = `user_${reg.student_id}`;
        const eventId = `event_${reg.event_id}`;

        // Check if user and event exist
        const userExists = await prodPrisma.user.findUnique({ where: { id: userId } });
        const eventExists = await prodPrisma.event.findUnique({ where: { id: eventId } });

        if (userExists && eventExists) {
          await prodPrisma.eventRegistration.create({
            data: {
              id: `reg_${reg.id}`,
              userId: userId,
              eventId: eventId,
              status: reg.status?.toUpperCase() || 'REGISTERED',
              createdAt: reg.registered_at || reg.createdat || new Date(),
              updatedAt: reg.updatedat || new Date()
            }
          });
          stats.registrations++;
        }
      } catch (err) {
        // Skip if already exists
      }
    }
    log.success(`Imported ${stats.registrations} event registrations`);

    // Import Conversations
    log.info('Importing conversations...');
    for (const conv of conversations) {
      try {
        await prodPrisma.conversation.create({
          data: {
            id: conv.id,
            title: conv.group_name || 'Conversation',
            createdAt: conv.created_at || new Date(),
            updatedAt: conv.updated_at || new Date()
          }
        });
        stats.conversations++;
      } catch (err) {
        // Skip if already exists
      }
    }
    log.success(`Imported ${stats.conversations} conversations`);

    // Import Messages
    log.info('Importing messages...');
    for (const msg of messages) {
      try {
        const userId = `user_${msg.sender_id}`;
        const userExists = await prodPrisma.user.findUnique({ where: { id: userId } });
        const convExists = await prodPrisma.conversation.findUnique({ where: { id: msg.conversation_id } });

        if (userExists && convExists) {
          await prodPrisma.message.create({
            data: {
              id: msg.id,
              content: msg.content,
              conversationId: msg.conversation_id,
              userId: userId,
              isRead: msg.is_read || false,
              createdAt: msg.created_at || new Date(),
              updatedAt: msg.updated_at || new Date()
            }
          });
          stats.messages++;
        }
      } catch (err) {
        // Skip if already exists
      }
    }
    log.success(`Imported ${stats.messages} messages`);

    // Import Notifications
    log.info('Importing notifications...');
    for (const notif of notifications) {
      try {
        const userId = `user_${notif.recipient_id}`;
        const userExists = await prodPrisma.user.findUnique({ where: { id: userId } });

        if (userExists) {
          // Map notification type
          let type = 'SYSTEM';
          if (notif.type?.includes('event')) type = 'EVENT_REGISTRATION';
          else if (notif.type?.includes('message')) type = 'MESSAGE';
          else if (notif.type?.includes('announcement')) type = 'ANNOUNCEMENT';

          await prodPrisma.notification.create({
            data: {
              id: notif.id,
              userId: userId,
              title: notif.title,
              message: notif.content,
              type: type,
              isRead: notif.is_read || false,
              createdAt: notif.created_at || new Date(),
              updatedAt: notif.updated_at || new Date()
            }
          });
          stats.notifications++;
        }
      } catch (err) {
        // Skip if already exists
      }
    }
    log.success(`Imported ${stats.notifications} notifications`);

    // Import Announcements
    log.info('Importing announcements...');
    for (const announcement of announcements) {
      try {
        await prodPrisma.announcement.create({
          data: {
            id: announcement.id,
            title: announcement.title,
            content: announcement.content,
            author: announcement.author || 'System',
            createdAt: announcement.created_at || new Date(),
            updatedAt: announcement.updated_at || new Date()
          }
        });
        stats.announcements++;
      } catch (err) {
        // Skip if already exists
      }
    }
    log.success(`Imported ${stats.announcements} announcements`);

    await prodPrisma.$disconnect();

    log.header('🎉 MIGRATION COMPLETED!');
    console.log('\n📊 Migration Summary:\n');
    console.log(`  👥 Users:                ${stats.users}`);
    console.log(`  📅 Events:               ${stats.events}`);
    console.log(`  ✅ Event Registrations:  ${stats.registrations}`);
    console.log(`  💬 Conversations:        ${stats.conversations}`);
    console.log(`  📨 Messages:             ${stats.messages}`);
    console.log(`  🔔 Notifications:        ${stats.notifications}`);
    console.log(`  📢 Announcements:        ${stats.announcements}`);
    console.log(`  ${'─'.repeat(40)}`);
    const total = Object.values(stats).reduce((a, b) => a + b, 0);
    console.log(`  📦 Total:                ${total}\n`);

  } catch (error) {
    log.error(`Migration failed: ${error.message}`);
    console.error(error);
    await prodPrisma.$disconnect();
    process.exit(1);
  }
}

main();
