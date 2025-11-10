const sequelize = require('../auth-service/config');
const TimeSlot = require('../Reference_documents/models/TimeSlot');
const Schedule = require('../Reference_documents/models/Schedule');
const Classe = require('../Reference_documents/models/Classe');
const Matiere = require('../Reference_documents/models/Matiére');
const Salle = require('../Reference_documents/models/Salle');

/**
 * Simple script to add sample course schedules to the database
 * Run this to populate the calendar with test data
 */

async function addSampleSchedules() {
  try {
    console.log('📅 Adding sample course schedules...\n');

    // First, let's check if we have classes, subjects, and time slots
    const classes = await Classe.findAll({ limit: 5 });
    const matieres = await Matiere.findAll({ limit: 5 });
    const timeSlots = await TimeSlot.findAll({ limit: 10 });
    const salles = await Salle.findAll({ limit: 5 });

    console.log(`Found: ${classes.length} classes, ${matieres.length} subjects, ${timeSlots.length} time slots, ${salles.length} rooms`);

    if (classes.length === 0 || matieres.length === 0 || timeSlots.length === 0) {
      console.log('❌ Not enough data. Please create classes, subjects, and time slots first.');
      return;
    }

    // Create sample schedules
    const sampleSchedules = [];
    
    // Let's create 10 sample schedules
    for (let i = 0; i < Math.min(10, timeSlots.length); i++) {
      const classe = classes[i % classes.length];
      const matiere = matieres[i % matieres.length];
      const timeSlot = timeSlots[i];
      const salle = salles.length > 0 ? salles[i % salles.length] : null;

      sampleSchedules.push({
        time_slot_id: timeSlot.id,
        classe_id: classe.id,
        matiere_id: matiere.id,
        salle_id: salle ? salle.id : null,
        enseignant_id: Math.floor(Math.random() * 10) + 1, // Random teacher ID
        date_debut: '2025-01-01',
        date_fin: '2025-06-30',
        type_cours: ['Cours', 'TD', 'TP'][i % 3],
        recurrence: 'hebdomadaire',
        statut: 'confirme',
        notes: `Sample course schedule ${i + 1}`
      });
    }

    // Check if schedules already exist
    const existingSchedules = await Schedule.count();
    
    if (existingSchedules > 0) {
      console.log(`⚠️  ${existingSchedules} schedules already exist. Do you want to add more? (Continuing...)`);
    }

    // Create schedules
    const created = await Schedule.bulkCreate(sampleSchedules);
    
    console.log(`✅ Successfully created ${created.length} sample schedules!\n`);

    // Display summary
    console.log('📊 Sample Schedules Summary:');
    for (const schedule of created) {
      const fullSchedule = await Schedule.findByPk(schedule.id, {
        include: [
          { association: 'timeSlot' },
          { association: 'classe' },
          { association: 'matiere' },
          { association: 'salle' }
        ]
      });

      console.log(`\n${fullSchedule.timeSlot.day_of_week} ${fullSchedule.timeSlot.start_time.substring(0, 5)} - ${fullSchedule.timeSlot.end_time.substring(0, 5)}`);
      console.log(`  📚 ${fullSchedule.matiere.nom}`);
      console.log(`  🏫 Classe: ${fullSchedule.classe.nom}`);
      console.log(`  🚪 Salle: ${fullSchedule.salle ? fullSchedule.salle.nom : 'N/A'}`);
      console.log(`  📝 Type: ${fullSchedule.type_cours}`);
    }

    console.log('\n✨ Sample data ready! View at: http://localhost:5173/calendar/events\n');

  } catch (error) {
    console.error('❌ Error adding sample schedules:', error);
    throw error;
  }
}

// Run if executed directly
if (require.main === module) {
  addSampleSchedules()
    .then(() => {
      console.log('✅ Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed:', error);
      process.exit(1);
    });
}

module.exports = { addSampleSchedules };
