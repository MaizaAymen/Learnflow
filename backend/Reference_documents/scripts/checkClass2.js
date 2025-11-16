const { Schedule } = require('../models');

(async () => {
  try {
    const schedules = await Schedule.findAll({
      where: { classe_id: 2 },
      attributes: ['id', 'day_of_week', 'date_debut', 'date_fin', 'recurrence', 'statut'],
      raw: true,
      order: [['id', 'ASC']]
    });
    
    console.log('Class 2 Schedules:');
    schedules.forEach(s => {
      console.log(`ID ${s.id}: ${s.day_of_week.padEnd(10)} | ${s.statut.padEnd(10)} | Start: ${s.date_debut} | End: ${s.date_fin || 'null'} | Recur: ${s.recurrence}`);
    });
    
    console.log('\n\nToday: ' + new Date().toISOString().split('T')[0]);
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
