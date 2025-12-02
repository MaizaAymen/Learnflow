const sequelize = require('../auth-service/config');

(async () => {
  try {
    const depts = await sequelize.query('SELECT id, name, code, chef_departement_id FROM referentiels.departement LIMIT 10', { type: sequelize.QueryTypes.SELECT });
    console.log('Departments found:');
    depts.forEach(d => {
      console.log(`  ID: ${d.id}, Name: ${d.name}, Code: ${d.code}, Chef ID: ${d.chef_departement_id}`);
    });
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await sequelize.close();
  }
})();
