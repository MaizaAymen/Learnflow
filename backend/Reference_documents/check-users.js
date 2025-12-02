const sequelize = require('../auth-service/config');
require('./models'); // Initialize all models

async function checkUsers() {
  try {
    console.log('🔍 Checking for users in database...\n');
    
    const users = await sequelize.models.utilisateur.findAll({
      order: [['id', 'ASC']],
      raw: true,
      limit: 10
    });
    
    if (users.length === 0) {
      console.log('❌ No users found in database');
      return;
    }
    
    console.log(`✅ Found ${users.length} users:\n`);
    
    users.forEach((user) => {
      console.log(`👤 User ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Name: ${user.prenom} ${user.nom}`);
      console.log(`   Role: ${user.role}`);
      console.log();
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkUsers();
