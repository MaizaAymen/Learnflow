/**
 * Notification Client Service
 * Used by other microservices to trigger notifications
 * Sends webhooks to the Notification Service
 */

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3005/api';

class NotificationClient {
  /**
   * Send a notification via webhook
   * @param {Object} payload - Notification payload
   * @param {number} payload.recipient_id - User ID to receive notification
   * @param {string} payload.type - Notification type (event_created, event_registered, etc.)
   * @param {string} payload.title - Notification title
   * @param {string} payload.content - Notification content/message
   * @param {Object} payload.metadata - Additional data
   * @param {string} payload.priority - Priority level (low, medium, high, critical)
   * @returns {Promise<Object>} Response from notification service
   */
  static async send(payload) {
    try {
      const response = await fetch(`${NOTIFICATION_SERVICE_URL}/webhooks/event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        timeout: 5000
      });

      if (!response.ok) {
        console.warn(`⚠️ Notification service warning: ${response.status}`);
        return null;
      }

      const data = await response.json();
      console.log(`✅ Notification sent to user ${payload.recipient_id}`);
      return data;
    } catch (error) {
      console.error('❌ Error sending notification:', error.message);
      // Don't throw - notifications should never block main operations
      return null;
    }
  }

  /**
   * Notify when user changes password
   */
  static async notifyPasswordChanged(user_id, username) {
    return this.send({
      recipient_id: user_id,
      type: 'account_created',  // Account security event
      title: '🔐 Password Changed',
      content: `Your password was successfully changed. If you did not make this change, please contact support immediately.`,
      metadata: {
        username,
        event: 'password_changed',
        timestamp: new Date().toISOString()
      },
      priority: 'high'
    });
  }

  /**
   * Notify when event is created by teacher/admin
   */
  static async notifyEventCreated(event_id, event_title, created_by_id, department_id, recipient_ids = []) {
    const notifications = recipient_ids.map(recipient_id =>
      this.send({
        recipient_id,
        type: 'event_created',
        title: '📅 New Event Created',
        content: `A new event "${event_title}" has been created. Check it out!`,
        metadata: {
          event_id,
          event_title,
          created_by: created_by_id,
          department_id,
          timestamp: new Date().toISOString()
        },
        priority: 'medium'
      })
    );

    return Promise.all(notifications);
  }

  /**
   * Notify when student registers for event
   */
  static async notifyEventRegistration(student_id, event_id, event_title) {
    return this.send({
      recipient_id: student_id,
      type: 'event_registered',
      title: '✅ Successfully Registered',
      content: `You have been registered for the event "${event_title}". See you there!`,
      metadata: {
        event_id,
        event_title,
        timestamp: new Date().toISOString()
      },
      priority: 'medium'
    });
  }

  /**
   * Notify event creator when someone registers
   */
  static async notifyNewRegistration(creator_id, event_id, event_title, student_name, student_count) {
    return this.send({
      recipient_id: creator_id,
      type: 'event_registered',
      title: '👤 New Registration',
      content: `${student_name} has registered for "${event_title}". Total registrations: ${student_count}`,
      metadata: {
        event_id,
        event_title,
        student_name,
        total_registrations: student_count,
        timestamp: new Date().toISOString()
      },
      priority: 'medium'
    });
  }

  /**
   * Notify when student leaves event
   */
  static async notifyEventUnregistration(student_id, event_id, event_title) {
    return this.send({
      recipient_id: student_id,
      type: 'event_registered',
      title: '🚪 Left Event',
      content: `You have unregistered from "${event_title}".`,
      metadata: {
        event_id,
        event_title,
        action: 'unregistered',
        timestamp: new Date().toISOString()
      },
      priority: 'low'
    });
  }

  /**
   * Notify event creator when someone leaves
   */
  static async notifyUnregistration(creator_id, event_id, event_title, student_name, remaining_count) {
    return this.send({
      recipient_id: creator_id,
      type: 'event_registered',
      title: '👤 Unregistered',
      content: `${student_name} has unregistered from "${event_title}". Remaining registrations: ${remaining_count}`,
      metadata: {
        event_id,
        event_title,
        student_name,
        remaining_registrations: remaining_count,
        timestamp: new Date().toISOString()
      },
      priority: 'low'
    });
  }

  /**
   * Notify absence recorded
   */
  static async notifyAbsenceRecorded(student_id, subject, date) {
    return this.send({
      recipient_id: student_id,
      type: 'absence_registered',
      title: '⚠️ Absence Recorded',
      content: `An absence has been recorded for ${subject} on ${date}.`,
      metadata: {
        subject,
        date,
        timestamp: new Date().toISOString()
      },
      priority: 'high'
    });
  }

  /**
   * Notify message received
   */
  static async notifyMessageReceived(recipient_id, sender_name, preview) {
    return this.send({
      recipient_id,
      type: 'message_received',
      title: '💬 New Message',
      content: `New message from ${sender_name}: ${preview}`,
      metadata: {
        sender_name,
        preview,
        timestamp: new Date().toISOString()
      },
      priority: 'medium'
    });
  }

  /**
   * Notify document published
   */
  static async notifyDocumentPublished(recipient_id, document_title, category) {
    return this.send({
      recipient_id,
      type: 'document_published',
      title: '📄 New Document',
      content: `A new document "${document_title}" has been published in ${category}.`,
      metadata: {
        document_title,
        category,
        timestamp: new Date().toISOString()
      },
      priority: 'medium'
    });
  }

  /**
   * Notify announcement
   */
  static async notifyAnnouncement(recipient_id, announcement_title, content) {
    return this.send({
      recipient_id,
      type: 'announcement_published',
      title: '📢 Announcement',
      content: announcement_title,
      metadata: {
        full_content: content,
        timestamp: new Date().toISOString()
      },
      priority: 'high'
    });
  }

  /**
   * Notify elimination risk (academic alert)
   */
  static async notifyEliminationRisk(student_id, reason, action_required) {
    return this.send({
      recipient_id: student_id,
      type: 'elimination_risk',
      title: '🚨 Academic Alert',
      content: reason,
      metadata: {
        reason,
        action_required,
        timestamp: new Date().toISOString()
      },
      priority: 'critical'
    });
  }

  /**
   * Notify schedule change
   */
  static async notifyScheduleChanged(student_id, class_name, details) {
    return this.send({
      recipient_id: student_id,
      type: 'schedule_changed',
      title: '🔄 Schedule Changed',
      content: `Schedule for ${class_name} has been updated: ${details}`,
      metadata: {
        class_name,
        details,
        timestamp: new Date().toISOString()
      },
      priority: 'medium'
    });
  }
}

module.exports = NotificationClient;
