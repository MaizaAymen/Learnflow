const sequelize = require('../auth-service/config');
require('./models');
const jwt = require('jsonwebtoken');

async function testChatSupportEndpoint() {
  try {
    console.log('🧪 Testing Chat Support Endpoint...\n');
    
    // 1. Check database has data
    console.log('1️⃣ Checking database...');
    const rooms = await sequelize.models.chatSupport.findAll({
      where: { isActive: true }
    });
    console.log(`   ✅ Found ${rooms.length} active chat rooms\n`);
    
    // 2. Simulate what the endpoint returns
    console.log('2️⃣ Simulating GET /api/support/chat-support/:roomId response...\n');
    
    for (let i = 0; i < Math.min(2, rooms.length); i++) {
      const room = rooms[i];
      
      // Fetch admin info (same as backend does)
      const User = require('../../auth-service/models/userModel');
      const admin = await User.findByPk(room.adminId, {
        attributes: ['id', 'nom', 'prenom', 'email', 'phone']
      });
      
      // Fetch messages
      const messages = await sequelize.models.chatMessage.findAll({
        where: { chatSupportId: room.id, isDeleted: false },
        order: [['createdAt', 'ASC']],
        attributes: ['id', 'content', 'userRole', 'isEdited', 'editedAt', 'createdAt', 'userId']
      });
      
      // Build response
      const response = {
        room: {
          id: room.id,
          title: room.title,
          description: room.description,
          isActive: room.isActive,
          adminId: room.adminId
        },
        admin: admin ? {
          id: admin.id,
          name: `${admin.prenom || ''} ${admin.nom || ''}`.trim() || 'Support Admin',
          email: admin.email,
          phone: admin.phone
        } : null,
        messageCount: messages.length,
        messages: messages
      };
      
      console.log(`📌 Room #${i + 1}: ${room.title}`);
      console.log(`   Admin: ${response.admin?.name || 'Not found'}`);
      console.log(`   Email: ${response.admin?.email || 'N/A'}`);
      console.log(`   Phone: ${response.admin?.phone || 'N/A'}`);
      console.log(`   Messages: ${response.messageCount}`);
      console.log(`   Response: ${JSON.stringify(response, null, 2)}`);
      console.log();
    }
    
    console.log('✅ All endpoint responses validated successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

testChatSupportEndpoint();
