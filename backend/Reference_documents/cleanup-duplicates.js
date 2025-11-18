// This script deletes duplicate student absence records
require('dotenv').config({ path: '.env' });
const sequelize = require('./config');
const models = require('./models');

async function cleanupDuplicates() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Connected');

    const { StudentAbsence } = models;

    // Get all records grouped by schedule_id and student_id
    const allRecords = await StudentAbsence.findAll({
      attributes: ['id', 'schedule_id', 'student_id'],
      order: [['marked_at', 'ASC'], ['id', 'ASC']],
      raw: true
    });

    console.log(`Total records: ${allRecords.length}`);

    // Group by schedule_id + student_id
    const grouped = {};
    const duplicates = [];

    for (const record of allRecords) {
      const key = `${record.schedule_id}_${record.student_id}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(record);
    }

    // Find duplicates
    for (const key in grouped) {
      if (grouped[key].length > 1) {
        console.log(`⚠️ Duplicate found for ${key}: ${grouped[key].length} records`);
        // Keep the first, mark others for deletion
        for (let i = 1; i < grouped[key].length; i++) {
          duplicates.push(grouped[key][i].id);
        }
      }
    }

    if (duplicates.length > 0) {
      console.log(`\n🗑️ Deleting ${duplicates.length} duplicate records...`);
      const result = await StudentAbsence.destroy({
        where: {
          id: duplicates
        }
      });
      console.log(`✅ Deleted ${result} records`);
    } else {
      console.log('✅ No duplicates found');
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

cleanupDuplicates();
