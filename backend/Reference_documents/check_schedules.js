const sequelize = require('../auth-service/config');

async function checkSchedules() {
  try {
    const schedules = await sequelize.query(
      'SELECT id, enseignant_id, classe_id, matiere_id, day_of_week FROM "referentiels"."schedule" LIMIT 10',
      { raw: true }
    );
    console.log('Schedules found:');
    console.log(JSON.stringify(schedules[0], null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    process.exit(0);
  }
}

checkSchedules();
