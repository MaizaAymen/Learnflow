const sequelize = require('../auth-service/config');
require('./models');  // Load all models

async function seedChatRooms() {
  try {
    const ChatSupport = sequelize.models.chatSupport;

    // Clear existing data
    await ChatSupport.destroy({ where: {} });
    console.log('✅ Cleared existing chat rooms');

    // Create test chat rooms
    const rooms = await ChatSupport.bulkCreate([
      {
        title: 'General Support',
        description: 'Ask any questions about the platform',
        isActive: true,
        adminId: 1
      },
      {
        title: 'Technical Help',
        description: 'Get help with technical issues and bugs',
        isActive: true,
        adminId: 2
      },
      {
        title: 'Academic Guidance',
        description: 'Discuss academic matters and coursework',
        isActive: true,
        adminId: 3
      }
    ]);

    console.log('✅ Successfully created ' + rooms.length + ' chat rooms:');
    rooms.forEach(room => {
      console.log(`   - ${room.id}: ${room.title}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

seedChatRooms();
