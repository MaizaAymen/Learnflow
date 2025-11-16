const sequelize = require('../../auth-service/config');
const Schedule = require('../models/Schedule');

(async () => {
  try {
    const schedules = await Schedule.findAll({
      raw: true,
      order: [['classe_id', 'ASC']]
    });
    console.log('\n=== Schedule Dates Debug ===\n');
    schedules.forEach(s => {
      console.log(`ID: ${s.id}`);
      console.log(`  Classe: ${s.classe_id}`);
      console.log(`  Day: ${s.day_of_week}`);
      console.log(`  Time: ${s.start_time}-${s.end_time}`);
      console.log(`  date_debut: ${s.date_debut}`);
      console.log(`  date_fin: ${s.date_fin}`);
      console.log(`  statut: ${s.statut}`);
      console.log('');
    });
    console.log(`Total: ${schedules.length} schedules`);
    process.exit(0);
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
})();
