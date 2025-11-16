const sequelize = require('../../auth-service/config');
const Schedule = require('../models/Schedule');

(async () => {
  try {
    const schedules = await Schedule.findAll({
      attributes: ['id', 'day_of_week', 'start_time', 'end_time', 'classe_id'],
      raw: true,
      order: [['day_of_week', 'ASC'], ['start_time', 'ASC']]
    });
    console.log('\n=== All Schedules in Database ===\n');
    schedules.forEach(s => {
      console.log(`ID: ${s.id} | Day: ${s.day_of_week.padEnd(10)} | Time: ${s.start_time}-${s.end_time} | Class: ${s.classe_id}`);
    });
    console.log(`\nTotal: ${schedules.length} schedules\n`);
    process.exit(0);
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
})();
