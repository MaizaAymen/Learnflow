const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const { UserOnlineStatus, Conversation, ConversationParticipant, Message } = require('../models');

class MessagingService {
  constructor(server) {
    this.io = socketIo(server, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    this.userSockets = new Map(); // Map userId -> socketId
    this.setupMiddleware();
    this.setupEventHandlers();
  }

  setupMiddleware() {
    this.io.use((socket, next) => {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        socket.userId = decoded.id;
        next();
      } catch (error) {
        next(new Error('Invalid token'));
      }
    });
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`✅ User ${socket.userId} connected: ${socket.id}`);
      this.userSockets.set(socket.userId, socket.id);

      // Update user online status in DB
      this.updateUserStatus(socket.userId, true, socket.id);

      // Notify all users that this user is online
      this.io.emit('user_online', { user_id: socket.userId, status: 'online' });

      /**
       * Listen for new messages
       */
      socket.on('send_message', async (data) => {
        try {
          const { conversation_id, content } = data;

          // Create message in DB
          const message = await Message.create({
            conversation_id,
            sender_id: socket.userId,
            content
          });

          // Update conversation timestamp
          await Conversation.update(
            { last_message_at: new Date() },
            { where: { id: conversation_id } }
          );

          // Emit to all users in the conversation room (including sender)
          this.io.to(`conv_${conversation_id}`).emit('new_message', {
            id: message.id,
            conversation_id,
            sender_id: socket.userId,
            content: message.content,
            is_read: false,
            created_at: message.created_at
          });

          console.log(`📨 Message sent in conversation ${conversation_id} by user ${socket.userId}`);
        } catch (error) {
          console.error('Error sending message:', error);
          socket.emit('error', { message: 'Failed to send message' });
        }
      });

      /**
       * Listen for typing indicator
       */
      socket.on('typing', (data) => {
        const { conversation_id } = data;
        socket.to(`conv_${conversation_id}`).emit('user_typing', {
          user_id: socket.userId,
          conversation_id
        });
      });

      /**
       * Listen for stop typing
       */
      socket.on('stop_typing', (data) => {
        const { conversation_id } = data;
        socket.to(`conv_${conversation_id}`).emit('user_stop_typing', {
          user_id: socket.userId,
          conversation_id
        });
      });

      /**
       * Join conversation room
       */
      socket.on('join_conversation', (data) => {
        const { conversation_id } = data;
        socket.join(`conv_${conversation_id}`);
        console.log(`👤 User ${socket.userId} joined conversation ${conversation_id}`);
      });

      /**
       * Leave conversation room
       */
      socket.on('leave_conversation', (data) => {
        const { conversation_id } = data;
        socket.leave(`conv_${conversation_id}`);
        console.log(`🚪 User ${socket.userId} left conversation ${conversation_id}`);
      });

      /**
       * Handle disconnection
       */
      socket.on('disconnect', () => {
        console.log(`❌ User ${socket.userId} disconnected: ${socket.id}`);
        this.userSockets.delete(socket.userId);

        // Update user online status in DB
        this.updateUserStatus(socket.userId, false);

        // Notify all users that this user is offline
        this.io.emit('user_offline', { user_id: socket.userId, status: 'offline' });
      });
    });
  }

  /**
   * Update user online status in database
   */
  async updateUserStatus(userId, isOnline, socketId = null) {
    try {
      const { randomUUID } = require('crypto');
      const [status, created] = await UserOnlineStatus.findOrCreate({
        where: { user_id: userId },
        defaults: {
          id: randomUUID(),
          user_id: userId,
          is_online: isOnline,
          socket_id: socketId,
          last_seen: new Date()
        }
      });

      if (!created) {
        await status.update({
          is_online: isOnline,
          socket_id: socketId,
          last_seen: new Date()
        });
      }
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  }

  /**
   * Notify user about new message (even if offline)
   */
  notifyUser(userId, conversationId, message) {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.io.to(socketId).emit('notification', {
        type: 'new_message',
        conversation_id: conversationId,
        message: message.content,
        sender_id: message.sender_id
      });
    }
  }

  /**
   * Get list of online users
   */
  getOnlineUsers() {
    return Array.from(this.userSockets.keys());
  }
}

module.exports = MessagingService;
