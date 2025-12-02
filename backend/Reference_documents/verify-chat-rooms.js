const sequelize = require('../auth-service/config');
require('./models'); // Initialize all models

async function verifyChatRooms() {
  try {
    console.log('🔍 Checking chat rooms in database...\n');
    
    const rooms = await sequelize.models.chatSupport.findAll({
      order: [['id', 'ASC']],
      raw: true
    });
    
    if (rooms.length === 0) {
      console.log('❌ No chat rooms found in database');
      return;
    }
    
    console.log(`✅ Found ${rooms.length} chat room(s):\n`);
    
    rooms.forEach((room, index) => {
      console.log(`📌 Room #${index + 1}:`);
      console.log(`   ID: ${room.id}`);
      console.log(`   Title: ${room.title}`);
      console.log(`   Description: ${room.description}`);
      console.log(`   Active: ${room.isActive}`);
      console.log(`   Admin ID: ${room.adminId}`);
      console.log();
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

verifyChatRooms();
