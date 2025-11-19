import React, { useState } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import './NotificationBell.css';

/**
 * NotificationBell Component
 * Displays unread count and opens notification panel
 */
export const NotificationBell = () => {
  const { unreadCount, notifications, markAsRead, deleteNotification, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const handleNotificationClick = (notif) => {
    if (!notif.is_read) {
      markAsRead(notif.id);
    }

    // Navigate if action_url exists
    if (notif.action_url) {
      window.location.href = notif.action_url;
    }
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    deleteNotification(id);
  };

  return (
    <div className="notification-bell">
      {/* Bell Icon with Badge */}
      <button
        className="bell-icon"
        onClick={() => setIsOpen(!isOpen)}
        title={`${unreadCount} unread notifications`}
      >
        <span className="bell-svg">🔔</span>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {/* Notification Dropdown Panel */}
      {isOpen && (
        <div className="notification-panel">
          {/* Header */}
          <div className="notification-header">
            <h3>Notifications</h3>
            <button
              className="close-btn"
              onClick={() => setIsOpen(false)}
              title="Close"
            >
              ✕
            </button>
          </div>

          {/* Action Buttons */}
          {notifications.length > 0 && (
            <div className="notification-actions">
              {unreadCount > 0 && (
                <button
                  className="mark-all-btn"
                  onClick={markAllAsRead}
                  title="Mark all as read"
                >
                  ✓ Mark all read
                </button>
              )}
            </div>
          )}

          {/* Notifications List */}
          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="no-notifications">
                <span>📭 No notifications</span>
              </div>
            ) : (
              notifications.map(notif => (
                <div
                  key={notif.id}
                  className={`notification-item ${notif.is_read ? 'read' : 'unread'} priority-${notif.priority}`}
                  onClick={() => handleNotificationClick(notif)}
                >
                  {/* Unread Indicator */}
                  {!notif.is_read && <div className="unread-dot"></div>}

                  {/* Content */}
                  <div className="notification-content">
                    <div className="notification-title">{notif.title}</div>
                    <div className="notification-message">{notif.content}</div>
                    <div className="notification-meta">
                      {new Date(notif.created_at).toLocaleString()}
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    className="delete-btn"
                    onClick={(e) => handleDelete(e, notif.id)}
                    title="Delete"
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="notification-footer">
              <a href="/notifications" className="view-all-link">
                View all notifications →
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
