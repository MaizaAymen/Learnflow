const { Schedule } = require('../models');

(async () => {
  try {
    const schedules = await Schedule.findAll({
      attributes: ['id', 'day_of_week', 'date_debut', 'date_fin', 'recurrence', 'statut', 'classe_id'],
      raw: true
    });
    
    console.log('Total schedules:', schedules.length);
    
    const grouped = {};
    schedules.forEach(s => {
      if (!grouped[s.statut]) grouped[s.statut] = 0;
      grouped[s.statut]++;
    });
    
    console.log('\nStatus breakdown:', grouped);
    console.log('\nAll schedules:');
    schedules.forEach(s => {
      console.log(`ID ${s.id}: ${s.day_of_week} | Status: ${s.statut} | Recurrence: ${s.recurrence} | ${s.date_debut} to ${s.date_fin} | Class: ${s.classe_id}`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
