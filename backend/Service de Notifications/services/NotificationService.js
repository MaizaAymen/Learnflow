const { EventEmitter } = require('events');
const { Notification, NotificationPreference, NotificationLog } = require('../models');
const { randomUUID } = require('crypto');

/**
 * NotificationService - Core notification management service
 * Handles creation, delivery, and tracking of all notifications
 */
class NotificationService extends EventEmitter {
  constructor() {
    super();
    this.setupEventListeners();
  }

  /**
   * Setup listeners for events from other services
   */
  setupEventListeners() {
    // These will be triggered by event-based system or polling
    this.on('event_created', (data) => this.handleEventCreated(data));
    this.on('event_registered', (data) => this.handleEventRegistered(data));
    this.on('absence_registered', (data) => this.handleAbsenceRegistered(data));
    this.on('elimination_risk', (data) => this.handleEliminationRisk(data));
    this.on('schedule_changed', (data) => this.handleScheduleChanged(data));
    this.on('message_received', (data) => this.handleMessageReceived(data));
    this.on('document_published', (data) => this.handleDocumentPublished(data));
    this.on('announcement_published', (data) => this.handleAnnouncementPublished(data));
    this.on('account_created', (data) => this.handleAccountCreated(data));
  }

  /**
   * Create and send a notification
   * @param {Object} notificationData - {recipient_id, type, title, content, metadata, priority, action_url}
   * @returns {Promise<Object>} Created notification
   */
  async createNotification(notificationData) {
    try {
      // Check user preferences
      const preferences = await NotificationPreference.findOne({
        where: { user_id: notificationData.recipient_id }
      });

      // If preferences disabled, skip
      if (preferences && !preferences[notificationData.type]) {
        console.log(`⏭️  Notification skipped: User has disabled ${notificationData.type}`);
        return null;
      }

      // Create notification
      const notification = await Notification.create({
        recipient_id: notificationData.recipient_id,
        type: notificationData.type,
        title: notificationData.title,
        content: notificationData.content,
        metadata: notificationData.metadata || {},
        priority: notificationData.priority || 'medium',
        action_url: notificationData.action_url
      });

      // Log notification
      await NotificationLog.create({
        notification_id: notification.id,
        event_type: notificationData.type,
        trigger_source: notificationData.trigger_source || 'manual',
        source_id: notificationData.source_id,
        delivery_status: 'delivered',
        delivery_method: 'in_app'
      });

      console.log(`✅ Notification created: ${notification.id} for user ${notification.recipient_id}`);

      return notification;
    } catch (error) {
      console.error('❌ Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Create notifications for multiple recipients
   */
  async createBulkNotifications(recipientIds, notificationData) {
    try {
      const notifications = [];
      for (const recipientId of recipientIds) {
        const notification = await this.createNotification({
          ...notificationData,
          recipient_id: recipientId
        });
        if (notification) notifications.push(notification);
      }
      console.log(`✅ Created ${notifications.length} notifications for ${recipientIds.length} recipients`);
      return notifications;
    } catch (error) {
      console.error('❌ Error creating bulk notifications:', error);
      throw error;
    }
  }

  /**
   * EVENT HANDLERS - These are called when events occur
   */

  /**
   * Handle new event creation
   * Notify all registered students in the class
   */
  async handleEventCreated(data) {
    try {
      const { event_id, title, class_id, student_ids, event_creator_id } = data;
      
      // Notify relevant students
      if (student_ids && student_ids.length > 0) {
        await this.createBulkNotifications(student_ids, {
          type: 'event_created',
          title: '📅 Nouvel Événement',
          content: `Un nouvel événement "${title}" a été créé pour votre classe.`,
          metadata: { event_id, class_id },
          priority: 'high',
          action_url: `/events/${event_id}`,
          trigger_source: 'events_service',
          source_id: event_id
        });
      }
    } catch (error) {
      console.error('❌ Error handling event_created:', error);
    }
  }

  /**
   * Handle event registration
   * Notify event creator when student registers
   */
  async handleEventRegistered(data) {
    try {
      const { event_id, student_id, event_creator_id, event_title } = data;

      // Notify event creator
      await this.createNotification({
        recipient_id: event_creator_id,
        type: 'event_registered',
        title: '🎓 Nouvelle Inscription',
        content: `Un étudiant s'est inscrit à votre événement "${event_title}".`,
        metadata: { event_id, student_id },
        priority: 'medium',
        action_url: `/events/${event_id}`,
        trigger_source: 'events_service',
        source_id: event_id
      });
    } catch (error) {
      console.error('❌ Error handling event_registered:', error);
    }
  }

  /**
   * Handle absence registration
   * Notify student when absence is registered
   */
  async handleAbsenceRegistered(data) {
    try {
      const { absence_id, student_id, course_name, date } = data;

      await this.createNotification({
        recipient_id: student_id,
        type: 'absence_registered',
        title: '📝 Absence Enregistrée',
        content: `Votre absence au cours "${course_name}" le ${date} a été enregistrée.`,
        metadata: { absence_id, course_name, date },
        priority: 'high',
        action_url: `/absences/${absence_id}`,
        trigger_source: 'reference_service',
        source_id: absence_id
      });
    } catch (error) {
      console.error('❌ Error handling absence_registered:', error);
    }
  }

  /**
   * Handle elimination risk alert
   * Notify student and department when at risk
   */
  async handleEliminationRisk(data) {
    try {
      const { student_id, risk_level, absence_count, reason, department_head_id } = data;

      // Notify student
      await this.createNotification({
        recipient_id: student_id,
        type: 'elimination_risk',
        title: '⚠️ Risque d\'Élimination',
        content: `Attention! Vous êtes à risque d'élimination (${absence_count} absences). Consultez rapidement la direction.`,
        metadata: { student_id, risk_level, absence_count, reason },
        priority: 'critical',
        action_url: `/alerts/elimination-risk`,
        trigger_source: 'reference_service',
        source_id: student_id
      });

      // Notify department head
      if (department_head_id) {
        await this.createNotification({
          recipient_id: department_head_id,
          type: 'elimination_risk',
          title: '⚠️ Étudiant à Risque',
          content: `L'étudiant ID ${student_id} est à risque d'élimination (${absence_count} absences).`,
          metadata: { student_id, risk_level, absence_count },
          priority: 'critical',
          action_url: `/students/${student_id}`,
          trigger_source: 'reference_service',
          source_id: student_id
        });
      }
    } catch (error) {
      console.error('❌ Error handling elimination_risk:', error);
    }
  }

  /**
   * Handle schedule changes
   * Notify affected class/students
   */
  async handleScheduleChanged(data) {
    try {
      const { schedule_id, class_id, student_ids, old_time, new_time, course_name } = data;

      await this.createBulkNotifications(student_ids, {
        type: 'schedule_changed',
        title: '📅 Changement d\'Emploi du Temps',
        content: `Le cours "${course_name}" a changé d'horaire: ${old_time} → ${new_time}`,
        metadata: { schedule_id, class_id, old_time, new_time },
        priority: 'high',
        action_url: `/schedule`,
        trigger_source: 'reference_service',
        source_id: schedule_id
      });
    } catch (error) {
      console.error('❌ Error handling schedule_changed:', error);
    }
  }

  /**
   * Handle message received
   * Notify recipient of new message
   */
  async handleMessageReceived(data) {
    try {
      const { message_id, recipient_id, sender_name, message_preview } = data;

      await this.createNotification({
        recipient_id,
        type: 'message_received',
        title: '📥 Nouveau Message',
        content: `${sender_name}: ${message_preview}`,
        metadata: { message_id, sender_name },
        priority: 'medium',
        action_url: `/messages`,
        trigger_source: 'messaging_service',
        source_id: message_id
      });
    } catch (error) {
      console.error('❌ Error handling message_received:', error);
    }
  }

  /**
   * Handle document publication
   * Notify department/class
   */
  async handleDocumentPublished(data) {
    try {
      const { document_id, document_title, department_id, user_ids, document_type } = data;

      await this.createBulkNotifications(user_ids, {
        type: 'document_published',
        title: '📄 Nouveau Document',
        content: `Un nouveau ${document_type} a été publié: "${document_title}"`,
        metadata: { document_id, document_type, department_id },
        priority: 'medium',
        action_url: `/documents/${document_id}`,
        trigger_source: 'documents_service',
        source_id: document_id
      });
    } catch (error) {
      console.error('❌ Error handling document_published:', error);
    }
  }

  /**
   * Handle announcement publication
   * Notify relevant users
   */
  async handleAnnouncementPublished(data) {
    try {
      const { announcement_id, title, scope, user_ids } = data;

      await this.createBulkNotifications(user_ids, {
        type: 'announcement_published',
        title: '📢 Nouvelle Annonce',
        content: title,
        metadata: { announcement_id, scope },
        priority: 'high',
        action_url: `/announcements/${announcement_id}`,
        trigger_source: 'announcements_service',
        source_id: announcement_id
      });
    } catch (error) {
      console.error('❌ Error handling announcement_published:', error);
    }
  }

  /**
   * Handle account creation
   * Send temporary password notification
   */
  async handleAccountCreated(data) {
    try {
      const { user_id, temp_password, email, user_name } = data;

      await this.createNotification({
        recipient_id: user_id,
        type: 'account_created',
        title: '🔐 Compte Créé',
        content: `Bienvenue! Votre compte a été créé. Mot de passe temporaire a été envoyé à ${email}.`,
        metadata: { email, user_name },
        priority: 'critical',
        action_url: `/login`,
        trigger_source: 'auth_service',
        source_id: user_id
      });
    } catch (error) {
      console.error('❌ Error handling account_created:', error);
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId) {
    try {
      const notification = await Notification.update(
        { is_read: true, read_at: new Date() },
        { where: { id: notificationId } }
      );
      return notification;
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId) {
    try {
      const result = await Notification.update(
        { is_read: true, read_at: new Date() },
        { where: { recipient_id: userId, is_read: false } }
      );
      return result;
    } catch (error) {
      console.error('❌ Error marking all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Get unread notification count for user
   */
  async getUnreadCount(userId) {
    try {
      const count = await Notification.count({
        where: { recipient_id: userId, is_read: false }
      });
      return count;
    } catch (error) {
      console.error('❌ Error getting unread count:', error);
      throw error;
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId) {
    try {
      await Notification.destroy({ where: { id: notificationId } });
      console.log(`✅ Notification deleted: ${notificationId}`);
    } catch (error) {
      console.error('❌ Error deleting notification:', error);
      throw error;
    }
  }
}

module.exports = NotificationService;
