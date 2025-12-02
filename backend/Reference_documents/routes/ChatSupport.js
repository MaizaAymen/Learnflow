const express = require('express');
const router = express.Router();
const { ChatSupport, ChatMessage } = require('../models');

// ===== CHAT SUPPORT MANAGEMENT (ADMIN ONLY) =====

// Create a new chat support room (admin only)
router.post('/chat-support', async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Only admins can create chat rooms.' });
    }

    const { title, description } = req.body;
    const adminId = req.user.id;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const chatRoom = await ChatSupport.create({
      title,
      description: description || '',
      adminId,
      isActive: true
    });

    res.status(201).json({ 
      message: 'Chat room created successfully',
      chatRoom 
    });
  } catch (error) {
    console.error('❌ Error creating chat room:', error);
    res.status(500).json({ error: 'Error creating chat room', details: error.message });
  }
});

// Get all active chat support rooms
router.get('/chat-support', async (req, res) => {
  try {
    const chatRooms = await ChatSupport.findAll({
      where: { isActive: true },
      order: [['createdAt', 'DESC']]
    });

    res.json({ 
      total: chatRooms.length,
      chatRooms 
    });
  } catch (error) {
    console.error('❌ Error fetching chat rooms:', error);
    res.status(500).json({ error: 'Error fetching chat rooms', details: error.message });
  }
});

// Get specific chat support room with all messages
router.get('/chat-support/:chatSupportId', async (req, res) => {
  try {
    const chatSupportId = req.params.chatSupportId;

    const chatRoom = await ChatSupport.findByPk(chatSupportId);
    if (!chatRoom) {
      return res.status(404).json({ error: 'Chat room not found' });
    }

    // Get all non-deleted messages
    const messages = await ChatMessage.findAll({
      where: { 
        chatSupportId,
        isDeleted: false 
      },
      order: [['createdAt', 'ASC']]
    });

    res.json({ 
      chatRoom,
      messageCount: messages.length,
      messages 
    });
  } catch (error) {
    console.error('❌ Error fetching chat room:', error);
    res.status(500).json({ error: 'Error fetching chat room', details: error.message });
  }
});

// ===== MESSAGE OPERATIONS =====

// Post a new message to chat (students and admins can post)
router.post('/chat-support/:chatSupportId/messages', async (req, res) => {
  try {
    const { content } = req.body;
    const chatSupportId = req.params.chatSupportId;
    const userId = req.user.id;
    const userRole = req.user.role || 'student';

    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'Message content is required' });
    }

    // Verify chat room exists
    const chatRoom = await ChatSupport.findByPk(chatSupportId);
    if (!chatRoom) {
      return res.status(404).json({ error: 'Chat room not found' });
    }

    // Create message - visible to everyone in the chat
    const message = await ChatMessage.create({
      chatSupportId,
      userId,
      userRole: userRole === 'admin' ? 'admin' : 'student',
      content: content.trim(),
      isEdited: false,
      isDeleted: false
    });

    res.status(201).json({ 
      message: 'Message posted successfully',
      data: message 
    });
  } catch (error) {
    console.error('❌ Error posting message:', error);
    res.status(500).json({ error: 'Error posting message', details: error.message });
  }
});

// Get all messages in a chat room (visible to everyone)
router.get('/chat-support/:chatSupportId/messages', async (req, res) => {
  try {
    const chatSupportId = req.params.chatSupportId;

    // Verify chat room exists
    const chatRoom = await ChatSupport.findByPk(chatSupportId);
    if (!chatRoom) {
      return res.status(404).json({ error: 'Chat room not found' });
    }

    const messages = await ChatMessage.findAll({
      where: { 
        chatSupportId,
        isDeleted: false 
      },
      order: [['createdAt', 'ASC']]
    });

    res.json({ 
      total: messages.length,
      messages 
    });
  } catch (error) {
    console.error('❌ Error fetching messages:', error);
    res.status(500).json({ error: 'Error fetching messages', details: error.message });
  }
});

// ===== ADMIN MODERATION =====

// Edit a message (admin only)
router.patch('/chat-support/:chatSupportId/messages/:messageId/edit', async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Only admins can edit messages.' });
    }

    const { messageId, chatSupportId } = req.params;
    const { content } = req.body;
    const adminId = req.user.id;

    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'New content is required' });
    }

    const message = await ChatMessage.findByPk(messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (message.chatSupportId !== parseInt(chatSupportId)) {
      return res.status(400).json({ error: 'Message does not belong to this chat room' });
    }

    // Store original content for transparency
    const originalContent = message.content;

    // Update message
    await message.update({
      content: content.trim(),
      originalContent,
      isEdited: true,
      editedBy: adminId,
      editedAt: new Date()
    });

    res.json({ 
      message: 'Message edited successfully by admin',
      data: message 
    });
  } catch (error) {
    console.error('❌ Error editing message:', error);
    res.status(500).json({ error: 'Error editing message', details: error.message });
  }
});

// Delete a message (admin only - soft delete)
router.delete('/chat-support/:chatSupportId/messages/:messageId', async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Only admins can delete messages.' });
    }

    const { messageId, chatSupportId } = req.params;
    const { reason } = req.body;
    const adminId = req.user.id;

    const message = await ChatMessage.findByPk(messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (message.chatSupportId !== parseInt(chatSupportId)) {
      return res.status(400).json({ error: 'Message does not belong to this chat room' });
    }

    // Soft delete with audit trail
    await message.update({
      isDeleted: true,
      deletedBy: adminId,
      deletedAt: new Date(),
      deletionReason: reason || 'Removed by admin'
    });

    res.json({ 
      message: 'Message deleted successfully',
      data: message 
    });
  } catch (error) {
    console.error('❌ Error deleting message:', error);
    res.status(500).json({ error: 'Error deleting message', details: error.message });
  }
});

// Restore a deleted message (admin only)
router.patch('/chat-support/:chatSupportId/messages/:messageId/restore', async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Only admins can restore messages.' });
    }

    const { messageId, chatSupportId } = req.params;

    const message = await ChatMessage.findByPk(messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (message.chatSupportId !== parseInt(chatSupportId)) {
      return res.status(400).json({ error: 'Message does not belong to this chat room' });
    }

    // Restore message
    await message.update({
      isDeleted: false,
      deletedBy: null,
      deletedAt: null,
      deletionReason: null
    });

    res.json({ 
      message: 'Message restored successfully',
      data: message 
    });
  } catch (error) {
    console.error('❌ Error restoring message:', error);
    res.status(500).json({ error: 'Error restoring message', details: error.message });
  }
});

// Update chat room status (admin only)
router.patch('/chat-support/:chatSupportId/status', async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Only admins can update chat status.' });
    }

    const { chatSupportId } = req.params;
    const { isActive } = req.body;

    const chatRoom = await ChatSupport.findByPk(chatSupportId);
    if (!chatRoom) {
      return res.status(404).json({ error: 'Chat room not found' });
    }

    await chatRoom.update({ isActive });

    res.json({ 
      message: `Chat room ${isActive ? 'opened' : 'closed'} successfully`,
      chatRoom 
    });
  } catch (error) {
    console.error('❌ Error updating chat status:', error);
    res.status(500).json({ error: 'Error updating chat status', details: error.message });
  }
});

module.exports = router;
