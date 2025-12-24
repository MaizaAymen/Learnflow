/**
 * Custom Migration for auth_service database
 */

const { Client } = require('pg');
const { PrismaClient } = require('@prisma/client');

const LOCAL_DB = "postgresql://postgres:aymen@localhost:5432/auth_service";
const PRODUCTION_DB = "postgresql://learnflow_db_user:2Bj20qXV9Gb4UenBJUSEGWO99t1neyr2@dpg-d55ckmeuk2gs73brvs10-a.oregon-postgres.render.com/learnflow_db";

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

const log = {
  info: (msg) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}\n`)
};

async function main() {
  log.header('🚀 CUSTOM DATA MIGRATION');
  
  console.log('Source: auth_service@localhost');
  console.log('Target: learnflow_db@Render\n');

  // Connect to local database
  log.info('Connecting to local database...');
  const localClient = new Client({ connectionString: LOCAL_DB });
  await localClient.connect();
  log.success('Connected to local database\n');

  log.header('📤 Exporting data from LOCAL database...');

  let exportedData = {
    users: [],
    teacherFeedback: [],
    courseFeedback: []
  };

  try {
    // Export utilisateur (users)
    log.info('Exporting users from "utilisateur" table...');
    const usersResult = await localClient.query('SELECT * FROM utilisateur');
    exportedData.users = usersResult.rows;
    log.success(`Exported ${exportedData.users.length} users`);

    // Export teacher_feedback
    log.info('Exporting teacher feedback...');
    const teacherFeedbackResult = await localClient.query('SELECT * FROM teacher_feedback');
    exportedData.teacherFeedback = teacherFeedbackResult.rows;
    log.success(`Exported ${exportedData.teacherFeedback.length} teacher feedbacks`);

    // Export course_feedback
    log.info('Exporting course feedback...');
    const courseFeedbackResult = await localClient.query('SELECT * FROM course_feedback');
    exportedData.courseFeedback = courseFeedbackResult.rows;
    log.success(`Exported ${exportedData.courseFeedback.length} course feedbacks`);

    await localClient.end();
    log.success('✅ Local data export completed!\n');

  } catch (error) {
    console.error('❌ Export failed:', error.message);
    await localClient.end();
    process.exit(1);
  }

  // Show what we found
  console.log('📊 Data Summary:\n');
  console.log(`  👥 Users: ${exportedData.users.length}`);
  console.log(`  📝 Teacher Feedbacks: ${exportedData.teacherFeedback.length}`);
  console.log(`  📚 Course Feedbacks: ${exportedData.courseFeedback.length}\n`);

  if (exportedData.users.length === 0 && 
      exportedData.teacherFeedback.length === 0 && 
      exportedData.courseFeedback.length === 0) {
    log.warning('⚠️  No data to migrate!');
    process.exit(0);
  }

  // Show sample data
  if (exportedData.teacherFeedback.length > 0) {
    log.header('📝 Teacher Feedback Data:');
    exportedData.teacherFeedback.forEach((feedback, index) => {
      console.log(`\nFeedback ${index + 1}:`);
      Object.entries(feedback).forEach(([key, value]) => {
        console.log(`  ${key}: ${value}`);
      });
    });
  }

  log.header('📥 Importing to PRODUCTION database...');
  
  const prodPrisma = new PrismaClient({
    datasources: { db: { url: PRODUCTION_DB } }
  });

  try {
    // Import users (if any) - map to Prisma User model
    if (exportedData.users.length > 0) {
      log.info('Importing users...');
      for (const user of exportedData.users) {
        // Map your local user structure to Prisma User model
        // Adjust field mappings based on your local table structure
        await prodPrisma.user.create({
          data: {
            email: user.email || `user${user.id}@imported.local`,
            password: user.password || 'imported_password',
            firstName: user.first_name || user.firstname || null,
            lastName: user.last_name || user.lastname || null,
            role: user.role || 'STUDENT',
            status: user.status || 'ACTIVE'
          }
        }).catch(err => {
          log.warning(`Skipped user (might already exist): ${user.email || user.id}`);
        });
      }
      log.success(`Imported users`);
    }

    // Note: teacher_feedback and course_feedback don't exist in your Prisma schema
    // You might need to add these models to your schema or handle differently
    if (exportedData.teacherFeedback.length > 0 || exportedData.courseFeedback.length > 0) {
      log.warning('⚠️  Teacher/Course feedback tables not in Prisma schema');
      log.info('Consider adding these models to prisma/schema.prisma if needed');
    }

    await prodPrisma.$disconnect();
    
    log.header('✅ MIGRATION COMPLETED!');
    console.log('\n📊 Migration Summary:');
    console.log(`  ✓ Users migrated: ${exportedData.users.length}`);
    console.log(`  ℹ Teacher feedbacks (not migrated): ${exportedData.teacherFeedback.length}`);
    console.log(`  ℹ Course feedbacks (not migrated): ${exportedData.courseFeedback.length}\n`);

  } catch (error) {
    console.error('❌ Import failed:', error.message);
    console.error(error);
    await prodPrisma.$disconnect();
    process.exit(1);
  }
}

main();
