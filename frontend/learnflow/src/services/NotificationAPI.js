/**
 * Notification Service API
 * Handles all API calls to the notifications microservice
 */

const NOTIFICATIONS_BASE_URL = 'http://localhost:3005/api';

// Helper to get current user ID from localStorage
function getUserId() {
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.id || 1;
    }
  } catch (e) {
    console.warn('Could not parse user from localStorage');
  }
  return 1; // Default fallback
}

// Helper to get authentication token from localStorage
function getAuthToken() {
  try {
    return localStorage.getItem('token') || localStorage.getItem('authToken') || null;
  } catch (e) {
    console.warn('Could not get auth token from localStorage');
  }
  return null;
}

// Helper to build headers with auth token
function getHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export class NotificationAPI {
  /**
   * Get all notifications for current user
   */
  static async getNotifications(page = 1, limit = 20, unreadOnly = false) {
    try {
      const userId = getUserId();
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', limit);
      params.append('user_id', userId);
      if (unreadOnly) params.append('unread_only', 'true');

      console.log(`📥 Fetching notifications for user ${userId}`);

      const response = await fetch(`${NOTIFICATIONS_BASE_URL}/notifications?${params}`, {
        method: 'GET',
        headers: getHeaders(),
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to fetch notifications');
      return response.json();
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
      throw error;
    }
  }

  /**
   * Get unread notification count
   */
  static async getUnreadCount() {
    try {
      const userId = getUserId();
      const params = new URLSearchParams();
      params.append('user_id', userId);

      const response = await fetch(`${NOTIFICATIONS_BASE_URL}/notifications/unread/count?${params}`, {
        method: 'GET',
        headers: getHeaders(),
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to fetch unread count');
      return response.json();
    } catch (error) {
      console.error('❌ Error fetching unread count:', error);
      throw error;
    }
  }

  /**
   * Get specific notification
   */
  static async getNotification(id) {
    try {
      const userId = getUserId();
      const params = new URLSearchParams();
      params.append('user_id', userId);

      const response = await fetch(`${NOTIFICATIONS_BASE_URL}/notifications/${id}?${params}`, {
        method: 'GET',
        headers: getHeaders(),
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to fetch notification');
      return response.json();
    } catch (error) {
      console.error('❌ Error fetching notification:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(id) {
    try {
      const userId = getUserId();
      const params = new URLSearchParams();
      params.append('user_id', userId);

      const response = await fetch(`${NOTIFICATIONS_BASE_URL}/notifications/${id}/read?${params}`, {
        method: 'PUT',
        headers: getHeaders(),
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to mark notification as read');
      return response.json();
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read
   */
  static async markAllAsRead() {
    try {
      const userId = getUserId();
      const params = new URLSearchParams();
      params.append('user_id', userId);

      const response = await fetch(`${NOTIFICATIONS_BASE_URL}/notifications/mark-all-read?${params}`, {
        method: 'PUT',
        headers: getHeaders(),
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to mark all notifications as read');
      return response.json();
    } catch (error) {
      console.error('❌ Error marking all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Delete notification
   */
  static async deleteNotification(id) {
    try {
      const userId = getUserId();
      const params = new URLSearchParams();
      params.append('user_id', userId);

      const response = await fetch(`${NOTIFICATIONS_BASE_URL}/notifications/${id}?${params}`, {
        method: 'DELETE',
        headers: getHeaders(),
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to delete notification');
      return response.json();
    } catch (error) {
      console.error('❌ Error deleting notification:', error);
      throw error;
    }
  }

  /**
   * Delete multiple notifications
   */
  static async deleteMultiple(ids) {
    try {
      const userId = getUserId();
      const params = new URLSearchParams();
      params.append('user_id', userId);

      const response = await fetch(`${NOTIFICATIONS_BASE_URL}/notifications/batch?${params}`, {
        method: 'DELETE',
        headers: getHeaders(),
        credentials: 'include',
        body: JSON.stringify({ notificationIds: ids })
      });

      if (!response.ok) throw new Error('Failed to delete notifications');
      return response.json();
    } catch (error) {
      console.error('❌ Error deleting notifications:', error);
      throw error;
    }
  }

  /**
   * Get notification preferences
   */
  static async getPreferences() {
    try {
      const userId = getUserId();
      const params = new URLSearchParams();
      params.append('user_id', userId);

      const response = await fetch(`${NOTIFICATIONS_BASE_URL}/preferences?${params}`, {
        method: 'GET',
        headers: getHeaders(),
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to fetch preferences');
      return response.json();
    } catch (error) {
      console.error('❌ Error fetching preferences:', error);
      throw error;
    }
  }

  /**
   * Update notification preferences
   */
  static async updatePreferences(preferences) {
    try {
      const userId = getUserId();
      const params = new URLSearchParams();
      params.append('user_id', userId);

      const response = await fetch(`${NOTIFICATIONS_BASE_URL}/preferences?${params}`, {
        method: 'PUT',
        headers: getHeaders(),
        credentials: 'include',
        body: JSON.stringify(preferences)
      });

      if (!response.ok) throw new Error('Failed to update preferences');
      return response.json();
    } catch (error) {
      console.error('❌ Error updating preferences:', error);
      throw error;
    }
  }

  /**
   * Toggle specific notification type
   */
  static async toggleNotificationType(type, enabled) {
    try {
      const userId = getUserId();
      const params = new URLSearchParams();
      params.append('user_id', userId);

      const response = await fetch(`${NOTIFICATIONS_BASE_URL}/preferences/notification-type/${type}?${params}`, {
        method: 'PUT',
        headers: getHeaders(),
        credentials: 'include',
        body: JSON.stringify({ enabled })
      });

      if (!response.ok) throw new Error('Failed to toggle notification type');
      return response.json();
    } catch (error) {
      console.error('❌ Error toggling notification type:', error);
      throw error;
    }
  }

  /**
   * Set quiet hours
   */
  static async setQuietHours(startTime, endTime) {
    try {
      const userId = getUserId();
      const params = new URLSearchParams();
      params.append('user_id', userId);

      const response = await fetch(`${NOTIFICATIONS_BASE_URL}/preferences/quiet-hours?${params}`, {
        method: 'PUT',
        headers: getHeaders(),
        credentials: 'include',
        body: JSON.stringify({
          start_time: startTime,
          end_time: endTime
        })
      });

      if (!response.ok) throw new Error('Failed to set quiet hours');
      return response.json();
    } catch (error) {
      console.error('❌ Error setting quiet hours:', error);
      throw error;
    }
  }
}

export default NotificationAPI;
