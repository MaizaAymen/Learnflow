const sequelize = require('../auth-service/config');
require('./models');

async function testPostMessage() {
  try {
    console.log('🧪 Testing POST /chat-support/:roomId/messages...\n');
    
    // Get a test user
    const User = require('../auth-service/models/userModel');
    const testUser = await User.findOne({ 
      where: { role: 'etudiant' },
      attributes: ['id', 'nom', 'prenom', 'email', 'role']
    });
    
    if (!testUser) {
      console.log('❌ No test user found');
      return;
    }
    
    console.log(`✅ Found test user: ${testUser.nom} (${testUser.role})\n`);
    
    // Test creating a message
    const ChatMessage = sequelize.models.chatMessage;
    
    console.log('📝 Creating test message with:');
    console.log(`   - Content: "Test message"`);
    console.log(`   - UserId: ${testUser.id}`);
    console.log(`   - UserRole: ${testUser.role}`);
    console.log(`   - ChatSupportId: 1\n`);
    
    try {
      const message = await ChatMessage.create({
        content: 'Test message',
        userId: testUser.id,
        userRole: testUser.role,
        chatSupportId: 1,
        isDeleted: false
      });
      
      console.log('✅ Message created successfully!');
      console.log(`📋 Message ID: ${message.id}`);
      console.log(`📋 User Role: ${message.userRole}`);
      console.log(`📋 Content: ${message.content}`);
      console.log(`📋 Chat Support ID: ${message.chatSupportId}\n`);
      
      console.log('✨ The POST endpoint should now work!');
      
    } catch (createError) {
      console.error('❌ Error creating message:', createError.message);
      console.log('\nFull error:');
      console.log(createError);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

testPostMessage();
