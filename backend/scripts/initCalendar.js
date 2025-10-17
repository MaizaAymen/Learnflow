const sequelize = require('../auth-service/config');
const TimeSlot = require('../Reference_documents/models/TimeSlot');
const Schedule = require('../Reference_documents/models/Schedule');
const Booking = require('../Reference_documents/models/Booking');

/**
 * Script to initialize the calendar system database tables
 * Run this script to create the necessary tables for the calendar system
 */

async function initializeCalendarDatabase() {
  try {
    console.log('🔄 Starting calendar system database initialization...\n');

    // Sync TimeSlot table
    console.log('📅 Creating TimeSlot table...');
    await TimeSlot.sync({ alter: true });
    console.log('✅ TimeSlot table created successfully\n');

    // Sync Schedule table
    console.log('📋 Creating Schedule table...');
    await Schedule.sync({ alter: true });
    console.log('✅ Schedule table created successfully\n');

    // Sync Booking table
    console.log('📝 Creating Booking table...');
    await Booking.sync({ alter: true });
    console.log('✅ Booking table created successfully\n');

    console.log('✨ Calendar system database initialized successfully!\n');

    // Insert default time slots
    await seedDefaultTimeSlots();

  } catch (error) {
    console.error('❌ Error initializing calendar database:', error);
    throw error;
  }
}

/**
 * Seeds the database with default time slots for a typical school week
 */
async function seedDefaultTimeSlots() {
  try {
    console.log('🌱 Seeding default time slots...\n');

    const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const timeSlots = [
      { start: '08:00:00', end: '10:00:00', desc: 'Séance 1 - Matinée' },
      { start: '10:15:00', end: '12:15:00', desc: 'Séance 2 - Matinée' },
      { start: '14:00:00', end: '16:00:00', desc: 'Séance 3 - Après-midi' },
      { start: '16:15:00', end: '18:15:00', desc: 'Séance 4 - Après-midi' }
    ];

    const slotsToCreate = [];
    
    for (const day of days) {
      for (const slot of timeSlots) {
        slotsToCreate.push({
          day_of_week: day,
          start_time: slot.start,
          end_time: slot.end,
          description: slot.desc,
          is_active: true
        });
      }
    }

    // Check if time slots already exist
    const existingCount = await TimeSlot.count();
    
    if (existingCount === 0) {
      await TimeSlot.bulkCreate(slotsToCreate);
      console.log(`✅ Created ${slotsToCreate.length} default time slots\n`);
      console.log('📊 Time slots breakdown:');
      console.log(`   - Days: ${days.length} (${days.join(', ')})`);
      console.log(`   - Slots per day: ${timeSlots.length}`);
      console.log(`   - Total slots: ${slotsToCreate.length}\n`);
    } else {
      console.log(`ℹ️  Time slots already exist (${existingCount} found). Skipping seed.\n`);
    }

  } catch (error) {
    console.error('❌ Error seeding default time slots:', error);
    throw error;
  }
}

/**
 * Displays the created time slots in a formatted table
 */
async function displayTimeSlots() {
  try {
    console.log('📅 Current Time Slots:\n');
    
    const slots = await TimeSlot.findAll({
      order: [
        ['day_of_week', 'ASC'],
        ['start_time', 'ASC']
      ]
    });

    const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
    
    for (const day of days) {
      const daySlots = slots.filter(s => s.day_of_week === day);
      if (daySlots.length > 0) {
        console.log(`\n${day}:`);
        daySlots.forEach(slot => {
          console.log(`  ${slot.start_time.substring(0, 5)} - ${slot.end_time.substring(0, 5)} | ${slot.description || 'N/A'} | Active: ${slot.is_active ? '✓' : '✗'}`);
        });
      }
    }
    
    console.log('\n');
  } catch (error) {
    console.error('❌ Error displaying time slots:', error);
  }
}

// Run the initialization if this file is executed directly
if (require.main === module) {
  initializeCalendarDatabase()
    .then(() => displayTimeSlots())
    .then(() => {
      console.log(' Calendar system is ready to use!');
      console.log(' Check CALENDAR_SYSTEM_DOCUMENTATION.md for API usage\n');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed to initialize calendar system:', error);
      process.exit(1);
    });
}

module.exports = {
  initializeCalendarDatabase,
  seedDefaultTimeSlots,
  displayTimeSlots
};
