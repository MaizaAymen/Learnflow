/**
 * Script to fix schedules day_of_week values from English to French
 */

const sequelize = require('../../auth-service/config');
const Schedule = require('../models/Schedule');

async function fixDayOfWeek() {
  try {
    console.log('🔧 Fixing day_of_week values...\n');
    
    // Mapping from English to French day names
    const dayMap = {
      'Monday': 'Lundi',
      'Tuesday': 'Mardi',
      'Wednesday': 'Mercredi',
      'Thursday': 'Jeudi',
      'Friday': 'Vendredi',
      'Saturday': 'Samedi',
      'Sunday': 'Dimanche'
    };
    
    // Get all schedules
    const schedules = await Schedule.findAll();
    console.log(`Found ${schedules.length} schedules\n`);
    
    let updated = 0;
    
    for (const schedule of schedules) {
      const currentDay = schedule.day_of_week;
      const frenchDay = dayMap[currentDay];
      
      if (frenchDay && currentDay !== frenchDay) {
        schedule.day_of_week = frenchDay;
        await schedule.save();
        console.log(`✅ Schedule ${schedule.id}: ${currentDay} → ${frenchDay}`);
        updated++;
      }
    }
    
    console.log(`\n✅ Fixed ${updated} schedules\n`);
    
    // Show sample of fixed schedules
    console.log('📋 Sample of fixed schedules:');
    const fixed = await Schedule.findAll({ limit: 5 });
    fixed.forEach(s => {
      console.log(`  ID ${s.id}: ${s.day_of_week} | ${s.start_time}-${s.end_time} | ${s.date_debut} to ${s.date_fin}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

fixDayOfWeek();


