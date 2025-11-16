const { Schedule } = require('../models');

(async () => {
  try {
    const allSchedules = await Schedule.findAll({
      attributes: ['id', 'classe_id', 'statut'],
      raw: true
    });
    
    console.log('\nSchedules by Class and Status:');
    const grouped = {};
    allSchedules.forEach(s => {
      const key = `Class ${s.classe_id}`;
      if (!grouped[key]) grouped[key] = {};
      if (!grouped[key][s.statut]) grouped[key][s.statut] = 0;
      grouped[key][s.statut]++;
    });
    
    Object.entries(grouped).forEach(([classKey, statuses]) => {
      console.log(`\n${classKey}:`);
      Object.entries(statuses).forEach(([status, count]) => {
        console.log(`  ${status}: ${count}`);
      });
      const total = Object.values(statuses).reduce((a, b) => a + b, 0);
      console.log(`  TOTAL: ${total}`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
