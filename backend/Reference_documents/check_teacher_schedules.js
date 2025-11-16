const sequelize = require('../auth-service/config');

(async () => {
  try {
    console.log('🔍 Checking schedules for teacher ID 4...\n');
    
    const result = await sequelize.query(
      `SELECT id, enseignant_id, classe_id, matiere_id, date_debut, date_fin 
       FROM referentiels.schedule 
       WHERE enseignant_id = 4 
       ORDER BY id 
       LIMIT 15`
    );
    
    console.log(`📊 Found ${result[0].length} schedules for teacher 4:\n`);
    result[0].forEach(s => {
      console.log(`  ✅ Schedule ID: ${s.id}`);
      console.log(`     - Teacher: ${s.enseignant_id}`);
      console.log(`     - Classe: ${s.classe_id}`);
      console.log(`     - Matiere: ${s.matiere_id}`);
      console.log(`     - Start: ${s.date_debut}`);
      console.log(`     - End: ${s.date_fin}\n`);
    });
    
    // Also check if schedule ID 1 exists at all
    console.log('\n🔍 Checking if schedule ID 1 exists...');
    const sched1 = await sequelize.query(
      `SELECT id, enseignant_id FROM referentiels.schedule WHERE id = 1`
    );
    
    if (sched1[0].length > 0) {
      console.log(`  ✅ Schedule 1 exists with teacher: ${sched1[0][0].enseignant_id}`);
    } else {
      console.log(`  ❌ Schedule ID 1 does NOT exist in database`);
    }
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
  process.exit(0);
})();
