/**
 * All-in-one setup script for calendar events
 * This will initialize everything needed
 */

const { initializeCalendarDatabase, seedDefaultTimeSlots } = require('./initCalendar');
const { addSampleSchedules } = require('./addSampleSchedules');

async function setupComplete() {
  console.log('🚀 Starting complete calendar setup...\n');

  try {
    // Step 1: Initialize database tables
    console.log('Step 1: Initializing database tables...');
    await initializeCalendarDatabase();
    console.log('✅ Database initialized\n');

    // Step 2: Add sample schedules
    console.log('Step 2: Adding sample schedules...');
    await addSampleSchedules();
    console.log('✅ Sample schedules added\n');

    console.log('🎉 Setup complete!\n');
    console.log('📍 View your calendar at: http://localhost:5173/calendar/events\n');
    console.log('💡 Make sure:');
    console.log('   - Backend server is running (node backend/Reference_documents/server.js)');
    console.log('   - Frontend is running (npm run dev in frontend/learnflow)');
    console.log('');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    console.log('\n📝 Troubleshooting:');
    console.log('   1. Check database connection');
    console.log('   2. Ensure backend server is running');
    console.log('   3. Make sure tables dont have conflicting data');
    console.log('');
  }
}

// Run setup
if (require.main === module) {
  setupComplete()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { setupComplete };
