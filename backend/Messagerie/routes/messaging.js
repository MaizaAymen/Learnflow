const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const sequelize = require('../models').sequelize;
const { authenticateToken } = require('../middleware/auth');
const {
  Message,
  Conversation,
  ConversationParticipant,
  UserOnlineStatus
} = require('../models');

/**
 * @route   POST /api/messaging/conversations
 * @desc    Create a new conversation (direct or group)
 * @access  Private
 */
router.post('/conversations', authenticateToken, async (req, res) => {
  try {
    const { type = 'direct', participant_ids, group_name } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!participant_ids || !Array.isArray(participant_ids)) {
      return res.status(400).json({ error: 'participant_ids must be an array' });
    }

    // For direct conversations, ensure only 1 other participant
    if (type === 'direct' && participant_ids.length !== 1) {
      return res.status(400).json({ error: 'Direct conversation must have exactly 1 other participant' });
    }

    // Check if direct conversation already exists
    if (type === 'direct') {
      const otherUserId = participant_ids[0];
      const existingConv = await sequelize.query(`
        SELECT c.id FROM referentiels.conversations c
        INNER JOIN referentiels.conversation_participants cp1 ON c.id = cp1.conversation_id
        INNER JOIN referentiels.conversation_participants cp2 ON c.id = cp2.conversation_id
        WHERE c.type = 'direct'
        AND cp1.user_id = ? AND cp2.user_id = ?
        AND cp1.left_at IS NULL AND cp2.left_at IS NULL
      `, {
        replacements: [userId, otherUserId],
        type: sequelize.QueryTypes.SELECT
      });

      if (existingConv.length > 0) {
        return res.status(200).json({ 
          id: existingConv[0].id,
          message: 'Conversation already exists'
        });
      }
    }

    // Create conversation
    const conversation = await Conversation.create({
      type,
      group_name: type === 'group' ? group_name : null,
      created_by: userId
    });

    // Add all participants including creator
    const allParticipantIds = [userId, ...participant_ids];
    await Promise.all(
      allParticipantIds.map(id =>
        ConversationParticipant.create({
          conversation_id: conversation.id,
          user_id: id
        })
      )
    );

    res.status(201).json({
      id: conversation.id,
      type,
      group_name,
      created_at: conversation.created_at
    });
  } catch (error) {
    console.error('❌ Error creating conversation:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ error: 'Failed to create conversation', details: error.message });
  }
});

/**
 * @route   GET /api/messaging/conversations
 * @desc    Get all conversations for current user with pagination
 * @access  Private
 */
router.get('/conversations', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const conversations = await sequelize.query(`
      SELECT 
        c.id,
        c.type,
        c.group_name,
        c.last_message_at,
        c.created_at,
        (SELECT content FROM referentiels.messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
        (SELECT COUNT(*) FROM referentiels.messages WHERE conversation_id = c.id AND is_read = false AND sender_id != ?) as unread_count,
        -- Get the other participant's ID for direct conversations
        (SELECT cp2.user_id FROM referentiels.conversation_participants cp2 WHERE cp2.conversation_id = c.id AND cp2.user_id != ? AND cp2.left_at IS NULL LIMIT 1) as other_user_id
      FROM referentiels.conversations c
      INNER JOIN referentiels.conversation_participants cp ON c.id = cp.conversation_id
      WHERE cp.user_id = ? AND cp.left_at IS NULL
      ORDER BY c.last_message_at DESC
      LIMIT ? OFFSET ?
    `, {
      replacements: [userId, userId, userId, limit, offset],
      type: sequelize.QueryTypes.SELECT
    });

    const total = await ConversationParticipant.count({
      where: {
        user_id: userId,
        left_at: null
      }
    });

    res.json({
      conversations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

/**
 * @route   GET /api/messaging/conversations/:conversationId/messages
 * @desc    Get messages for a conversation with pagination
 * @access  Private
 */
router.get('/conversations/:conversationId/messages', authenticateToken, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;
    const { page = 1, limit = 30 } = req.query;
    const offset = (page - 1) * limit;

    // Verify user is participant
    const participant = await ConversationParticipant.findOne({
      where: {
        conversation_id: conversationId,
        user_id: userId,
        left_at: null
      }
    });

    if (!participant) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const messages = await Message.findAndCountAll({
      where: { conversation_id: conversationId },
      order: [['created_at', 'DESC']],
      limit,
      offset
    });

    // Mark messages as read
    await Message.update(
      { is_read: true, read_at: new Date() },
      {
        where: {
          conversation_id: conversationId,
          sender_id: { [Op.ne]: userId },
          is_read: false
        }
      }
    );

    res.json({
      messages: messages.rows.reverse(),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: messages.count,
        pages: Math.ceil(messages.count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

/**
 * @route   POST /api/messaging/messages
 * @desc    Send a message
 * @access  Private
 */
router.post('/messages', authenticateToken, async (req, res) => {
  try {
    const { conversation_id, content } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!conversation_id || !content || content.trim().length === 0) {
      return res.status(400).json({ error: 'conversation_id and content are required' });
    }

    // Verify user is participant
    const participant = await ConversationParticipant.findOne({
      where: {
        conversation_id,
        user_id: userId,
        left_at: null
      }
    });

    if (!participant) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Create message
    const message = await Message.create({
      conversation_id,
      sender_id: userId,
      content: content.trim()
    });

    // Update conversation last_message_at
    await Conversation.update(
      { last_message_at: new Date() },
      { where: { id: conversation_id } }
    );

    res.status(201).json({
      id: message.id,
      conversation_id,
      sender_id: userId,
      content: message.content,
      is_read: false,
      created_at: message.created_at
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

/**
 * @route   GET /api/messaging/search-users
 * @desc    Search for users to start conversation (from auth schema)
 * @access  Private
 */
router.get('/search-users', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { query, limit = 10 } = req.query;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({ error: 'Query must be at least 2 characters' });
    }

    // Query from auth schema users table
    const users = await sequelize.query(`
      SELECT id, nom, prenom, email, role
      FROM auth.utilisateur
      WHERE id != ?
      AND (nom ILIKE ? OR prenom ILIKE ? OR email ILIKE ?)
      LIMIT ?
    `, {
      replacements: [userId, `%${query}%`, `%${query}%`, `%${query}%`, limit],
      type: sequelize.QueryTypes.SELECT
    });

    res.json(users);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
});

/**
 * @route   GET /api/messaging/unread-count
 * @desc    Get total unread messages count
 * @access  Private
 */
router.get('/unread-count', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await sequelize.query(`
      SELECT COUNT(*) as count FROM referentiels.messages m
      WHERE m.is_read = false
      AND m.sender_id != ?
      AND m.conversation_id IN (
        SELECT cp.conversation_id FROM referentiels.conversation_participants cp
        WHERE cp.user_id = ? AND cp.left_at IS NULL
      )
    `, {
      replacements: [userId, userId],
      type: sequelize.QueryTypes.SELECT
    });

    const unreadCount = parseInt(result[0].count) || 0;
    res.json({ unread_count: unreadCount });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
});

/**
 * @route   GET /api/messaging/online-status/:userId
 * @desc    Get user online status
 * @access  Private
 */
router.get('/online-status/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    const status = await UserOnlineStatus.findOne({
      where: { user_id: userId }
    });

    if (!status) {
      return res.json({ is_online: false, last_seen: null });
    }

    res.json({
      is_online: status.is_online,
      last_seen: status.last_seen
    });
  } catch (error) {
    console.error('Error fetching online status:', error);
    res.status(500).json({ error: 'Failed to fetch online status' });
  }
});

/**
 * @route   DELETE /api/messaging/conversations/:conversationId
 * @desc    Delete/leave a conversation
 * @access  Private
 */
router.delete('/conversations/:conversationId', authenticateToken, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    // Mark participant as left
    await ConversationParticipant.update(
      { left_at: new Date() },
      {
        where: {
          conversation_id: conversationId,
          user_id: userId
        }
      }
    );

    res.json({ message: 'Conversation deleted' });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
});

/**
 * @route   POST /api/messaging/conversations/:conversationId/leave
 * @desc    Leave a group conversation
 * @access  Private
 */
router.post('/conversations/:conversationId/leave', authenticateToken, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    // Check if this is a group conversation
    const conversation = await Conversation.findByPk(conversationId);
    if (!conversation || conversation.type !== 'group') {
      return res.status(400).json({ error: 'Can only leave group conversations' });
    }

    // Mark participant as left
    const updated = await ConversationParticipant.update(
      { left_at: new Date() },
      {
        where: {
          conversation_id: conversationId,
          user_id: userId
        }
      }
    );

    if (updated[0] === 0) {
      return res.status(404).json({ error: 'Participant not found in conversation' });
    }

    console.log(`✅ User ${userId} left conversation ${conversationId}`);
    res.json({ message: 'Left group successfully' });
  } catch (error) {
    console.error('Error leaving conversation:', error);
    res.status(500).json({ error: 'Failed to leave conversation', details: error.message });
  }
});

/**
 * @route   GET /api/messaging/user/:userId
 * @desc    Get user info by ID
 * @access  Private
 */
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Query the auth database for user info
    const user = await sequelize.query(`
      SELECT id, nom, prenom, email, image 
      FROM auth.utilisateur 
      WHERE id = ?
    `, {
      replacements: [userId],
      type: sequelize.QueryTypes.SELECT
    });

    if (!user || user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user[0]);
  } catch (error) {
    console.error('Error fetching user info:', error);
    res.status(500).json({ error: 'Failed to fetch user info' });
  }
});

/**
 * @route   GET /api/messaging/auth/classes/:classId/students
 * @desc    Proxy endpoint to fetch students for a class from auth service
 * @access  Private
 */
router.get('/auth/classes/:classId/students', authenticateToken, async (req, res) => {
  try {
    const { classId } = req.params;
    const token = req.headers.authorization;

    // Forward request to auth service
    const authServiceUrl = `http://localhost:4000/api/auth/classes/${classId}/students`;
    console.log(`🔄 Forwarding request to auth service: ${authServiceUrl}`);

    const response = await fetch(authServiceUrl, {
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error(`❌ Auth service error: ${response.status}`);
      return res.status(response.status).json({ error: 'Failed to fetch students from auth service' });
    }

    const students = await response.json();
    console.log(`✅ Fetched ${students.length} students for class ${classId}`);
    res.json(students);
  } catch (error) {
    console.error('Error fetching class students:', error);
    res.status(500).json({ error: 'Failed to fetch class students', details: error.message });
  }
});

module.exports = router;
