import React, { useState, useEffect } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import './NotificationsCenter.css';

/**
 * Notifications Center Page
 * Full page view of all notifications with preferences management
 */
export const NotificationsCenter = () => {
  const {
    notifications,
    unreadCount,
    preferences,
    loading,
    fetchNotifications,
    fetchPreferences,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteMultiple,
    toggleNotificationType,
    setQuietHours
  } = useNotifications();

  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState('notifications'); // 'notifications' or 'preferences'
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [showPrefs, setShowPrefs] = useState(false);

  useEffect(() => {
    fetchNotifications(page, false);
  }, [page, fetchNotifications]);

  // Toggle notification selection
  const toggleSelection = (id) => {
    setSelectedNotifications(prev =>
      prev.includes(id) ? prev.filter(n => n !== id) : [...prev, id]
    );
  };

  // Select/Deselect all
  const toggleSelectAll = () => {
    if (selectedNotifications.length === notifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(notifications.map(n => n.id));
    }
  };

  // Delete selected
  const handleDeleteSelected = () => {
    if (selectedNotifications.length > 0) {
      deleteMultiple(selectedNotifications);
      setSelectedNotifications([]);
    }
  };

  // Handle quiet hours change
  const handleQuietHoursChange = (startTime, endTime) => {
    setQuietHours(startTime, endTime);
  };

  const getNotificationIcon = (type) => {
    const icons = {
      'event_created': '📅',
      'event_registered': '🎓',
      'absence_registered': '📝',
      'elimination_risk': '⚠️',
      'schedule_changed': '📅',
      'message_received': '📥',
      'document_published': '📄',
      'announcement_published': '📢',
      'account_created': '🔐',
      'custom': '📌'
    };
    return icons[type] || '📌';
  };

  return (
    <div className="notifications-center">
      {/* Header */}
      <div className="nc-header">
        <h1>🔔 Notifications</h1>
        <div className="header-stats">
          <span className="stat">
            Total: <strong>{notifications.length}</strong>
          </span>
          <span className="stat">
            Unread: <strong className="unread-stat">{unreadCount}</strong>
          </span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          📬 Notifications ({notifications.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'preferences' ? 'active' : ''}`}
          onClick={() => setActiveTab('preferences')}
        >
          ⚙️ Preferences
        </button>
      </div>

      {/* Content */}
      <div className="nc-content">
        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="notifications-tab">
            {/* Toolbar */}
            <div className="notifications-toolbar">
              <div className="toolbar-left">
                <input
                  type="checkbox"
                  id="select-all"
                  checked={
                    notifications.length > 0 &&
                    selectedNotifications.length === notifications.length
                  }
                  onChange={toggleSelectAll}
                  title="Select all"
                />
                <label htmlFor="select-all">
                  ({selectedNotifications.length}/{notifications.length})
                </label>
              </div>

              <div className="toolbar-right">
                {unreadCount > 0 && (
                  <button
                    className="action-btn mark-all-read-btn"
                    onClick={markAllAsRead}
                  >
                    ✓ Mark all read
                  </button>
                )}
                {selectedNotifications.length > 0 && (
                  <button
                    className="action-btn delete-selected-btn"
                    onClick={handleDeleteSelected}
                  >
                    🗑️ Delete ({selectedNotifications.length})
                  </button>
                )}
              </div>
            </div>

            {/* Notifications List */}
            <div className="notifications-list">
              {loading ? (
                <div className="loading">Loading notifications...</div>
              ) : notifications.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-icon">📭</span>
                  <p>No notifications</p>
                </div>
              ) : (
                notifications.map(notif => (
                  <div
                    key={notif.id}
                    className={`notification-card ${
                      notif.is_read ? 'read' : 'unread'
                    } priority-${notif.priority}`}
                  >
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      className="notif-checkbox"
                      checked={selectedNotifications.includes(notif.id)}
                      onChange={() => toggleSelection(notif.id)}
                    />

                    {/* Icon */}
                    <div className="notif-icon">
                      {getNotificationIcon(notif.type)}
                    </div>

                    {/* Content */}
                    <div
                      className="notif-card-content"
                      onClick={() => markAsRead(notif.id)}
                    >
                      <div className="notif-header">
                        <h4 className="notif-title">{notif.title}</h4>
                        <span className="notif-type-badge">{notif.type}</span>
                      </div>
                      <p className="notif-message">{notif.content}</p>
                      <div className="notif-footer">
                        <span className="notif-priority">
                          Priority: <strong>{notif.priority}</strong>
                        </span>
                        <span className="notif-time">
                          {new Date(notif.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="notif-actions">
                      {!notif.is_read && (
                        <button
                          className="action-icon"
                          onClick={() => markAsRead(notif.id)}
                          title="Mark as read"
                        >
                          ✓
                        </button>
                      )}
                      <button
                        className="action-icon delete"
                        onClick={() => deleteNotification(notif.id)}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            <div className="pagination">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                ← Previous
              </button>
              <span>Page {page}</span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={notifications.length === 0}
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <div className="preferences-tab">
            {preferences && (
              <div className="preferences-content">
                {/* Notification Type Toggles */}
                <div className="preference-section">
                  <h3>📬 Notification Types</h3>
                  <div className="toggle-list">
                    {[
                      { key: 'event_created', label: '📅 Event Created' },
                      { key: 'event_registered', label: '🎓 Event Registration' },
                      { key: 'absence_registered', label: '📝 Absence Registered' },
                      { key: 'elimination_risk', label: '⚠️ Elimination Risk' },
                      { key: 'schedule_changed', label: '📅 Schedule Changed' },
                      { key: 'message_received', label: '📥 Message Received' },
                      { key: 'document_published', label: '📄 Document Published' },
                      { key: 'announcement_published', label: '📢 Announcement Published' },
                      { key: 'account_created', label: '🔐 Account Created' }
                    ].map(({ key, label }) => (
                      <div key={key} className="toggle-item">
                        <label>{label}</label>
                        <input
                          type="checkbox"
                          checked={preferences[key] || false}
                          onChange={(e) =>
                            toggleNotificationType(key, e.target.checked)
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quiet Hours */}
                <div className="preference-section">
                  <h3>🌙 Quiet Hours</h3>
                  <div className="quiet-hours-inputs">
                    <div className="time-input-group">
                      <label>Start Time</label>
                      <input
                        type="time"
                        defaultValue={preferences.quiet_hours_start || '22:00'}
                        onChange={(e) =>
                          handleQuietHoursChange(
                            e.target.value,
                            preferences.quiet_hours_end || '08:00'
                          )
                        }
                      />
                    </div>
                    <div className="time-input-group">
                      <label>End Time</label>
                      <input
                        type="time"
                        defaultValue={preferences.quiet_hours_end || '08:00'}
                        onChange={(e) =>
                          handleQuietHoursChange(
                            preferences.quiet_hours_start || '22:00',
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                  <p className="help-text">
                    No notifications will be sent during quiet hours
                  </p>
                </div>

                {/* Email Notifications */}
                <div className="preference-section">
                  <h3>📧 Email Notifications</h3>
                  <div className="toggle-item">
                    <label>Enable email notifications</label>
                    <input type="checkbox" defaultChecked={preferences.email_enabled} />
                  </div>
                </div>

                {/* SMS Notifications */}
                <div className="preference-section">
                  <h3>📱 SMS Notifications</h3>
                  <div className="toggle-item">
                    <label>Enable SMS notifications</label>
                    <input type="checkbox" defaultChecked={preferences.sms_enabled} />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsCenter;
