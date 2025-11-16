const { Sequelize } = require('sequelize');
const sequelize = require('../../auth-service/config');

/**
 * Migration script to add day_of_week, start_time, end_time columns to schedule table
 * and make time_slot_id nullable
 */

async function addTimeFieldsToSchedule() {
  try {
    console.log('Starting migration: Adding time fields to schedule table...');

    // Add day_of_week column
    await sequelize.query(`
      ALTER TABLE referentiels.schedule 
      ADD COLUMN IF NOT EXISTS day_of_week VARCHAR(20);
    `);
    console.log('✓ Added day_of_week column');

    // Add start_time column
    await sequelize.query(`
      ALTER TABLE referentiels.schedule 
      ADD COLUMN IF NOT EXISTS start_time TIME;
    `);
    console.log('✓ Added start_time column');

    // Add end_time column
    await sequelize.query(`
      ALTER TABLE referentiels.schedule 
      ADD COLUMN IF NOT EXISTS end_time TIME;
    `);
    console.log('✓ Added end_time column');

    // Make time_slot_id nullable
    await sequelize.query(`
      ALTER TABLE referentiels.schedule 
      ALTER COLUMN time_slot_id DROP NOT NULL;
    `);
    console.log('✓ Made time_slot_id nullable');

    // Migrate existing data from time_slot to new columns
    await sequelize.query(`
      UPDATE referentiels.schedule s
      SET 
        day_of_week = ts.day_of_week,
        start_time = ts.start_time,
        end_time = ts.end_time
      FROM referentiels.time_slot ts
      WHERE s.time_slot_id = ts.id
        AND s.day_of_week IS NULL;
    `);
    console.log('✓ Migrated existing schedule data');

    console.log('\n✅ Migration completed successfully!');
    console.log('The schedule table now has direct time fields.');
    console.log('You can now create schedules without depending on time_slot records.');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Full error:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run migration
addTimeFieldsToSchedule()
  .then(() => {
    console.log('\nMigration script finished.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nMigration script failed:', error);
    process.exit(1);
  });
