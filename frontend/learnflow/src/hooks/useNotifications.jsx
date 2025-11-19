import { createContext, useContext, useEffect, useReducer, useCallback, useState } from 'react';
import { NotificationAPI } from '../services/NotificationAPI';

// Create context
const NotificationContext = createContext();

// Action types
const ACTIONS = {
  SET_NOTIFICATIONS: 'SET_NOTIFICATIONS',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  MARK_AS_READ: 'MARK_AS_READ',
  MARK_ALL_AS_READ: 'MARK_ALL_AS_READ',
  SET_UNREAD_COUNT: 'SET_UNREAD_COUNT',
  SET_PREFERENCES: 'SET_PREFERENCES',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR'
};

// Initial state
const initialState = {
  notifications: [],
  unreadCount: 0,
  preferences: null,
  loading: false,
  error: null,
  page: 1,
  total: 0
};

// Reducer
const notificationReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_NOTIFICATIONS:
      return {
        ...state,
        notifications: action.payload.notifications,
        total: action.payload.total,
        page: action.payload.page
      };

    case ACTIONS.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
        unreadCount: state.unreadCount + 1
      };

    case ACTIONS.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      };

    case ACTIONS.MARK_AS_READ:
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === action.payload ? { ...n, is_read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      };

    case ACTIONS.MARK_ALL_AS_READ:
      return {
        ...state,
        notifications: state.notifications.map(n => ({ ...n, is_read: true })),
        unreadCount: 0
      };

    case ACTIONS.SET_UNREAD_COUNT:
      return {
        ...state,
        unreadCount: action.payload
      };

    case ACTIONS.SET_PREFERENCES:
      return {
        ...state,
        preferences: action.payload
      };

    case ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };

    case ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload
      };

    default:
      return state;
  }
};

/**
 * NotificationProvider Component
 */
export const NotificationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch notifications
  const fetchNotifications = useCallback(async (page = 1, unreadOnly = false) => {
    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true });
      const data = await NotificationAPI.getNotifications(page, 10, unreadOnly);
      dispatch({
        type: ACTIONS.SET_NOTIFICATIONS,
        payload: {
          notifications: data.notifications,
          total: data.total,
          page: data.page
        }
      });
      dispatch({ type: ACTIONS.SET_ERROR, payload: null });
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    }
  }, []);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const data = await NotificationAPI.getUnreadCount();
      dispatch({ type: ACTIONS.SET_UNREAD_COUNT, payload: data.unread_count });
    } catch (error) {
      console.error('❌ Error fetching unread count:', error);
    }
  }, []);

  // Fetch preferences
  const fetchPreferences = useCallback(async () => {
    try {
      const data = await NotificationAPI.getPreferences();
      dispatch({ type: ACTIONS.SET_PREFERENCES, payload: data });
    } catch (error) {
      console.error('❌ Error fetching preferences:', error);
    }
  }, []);

  // Mark as read
  const markAsRead = useCallback(async (id) => {
    try {
      await NotificationAPI.markAsRead(id);
      dispatch({ type: ACTIONS.MARK_AS_READ, payload: id });
    } catch (error) {
      console.error('❌ Error marking as read:', error);
    }
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      await NotificationAPI.markAllAsRead();
      dispatch({ type: ACTIONS.MARK_ALL_AS_READ });
    } catch (error) {
      console.error('❌ Error marking all as read:', error);
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (id) => {
    try {
      await NotificationAPI.deleteNotification(id);
      dispatch({ type: ACTIONS.REMOVE_NOTIFICATION, payload: id });
    } catch (error) {
      console.error('❌ Error deleting notification:', error);
    }
  }, []);

  // Delete multiple notifications
  const deleteMultiple = useCallback(async (ids) => {
    try {
      await NotificationAPI.deleteMultiple(ids);
      ids.forEach(id => {
        dispatch({ type: ACTIONS.REMOVE_NOTIFICATION, payload: id });
      });
    } catch (error) {
      console.error('❌ Error deleting notifications:', error);
    }
  }, []);

  // Toggle notification type
  const toggleNotificationType = useCallback(async (type, enabled) => {
    try {
      const result = await NotificationAPI.toggleNotificationType(type, enabled);
      dispatch({ type: ACTIONS.SET_PREFERENCES, payload: result.preferences });
    } catch (error) {
      console.error('❌ Error toggling notification type:', error);
    }
  }, []);

  // Set quiet hours
  const setQuietHours = useCallback(async (startTime, endTime) => {
    try {
      const result = await NotificationAPI.setQuietHours(startTime, endTime);
      dispatch({ type: ACTIONS.SET_PREFERENCES, payload: result.preferences });
    } catch (error) {
      console.error('❌ Error setting quiet hours:', error);
    }
  }, []);

  // Auto-fetch on mount and periodically refresh
  useEffect(() => {
    fetchNotifications(1, false);
    fetchUnreadCount();
    fetchPreferences();

    // Set up auto-refresh interval (every 30 seconds)
    if (autoRefresh) {
      const interval = setInterval(() => {
        console.log('🔄 Auto-refreshing notifications...');
        fetchNotifications(1, false);
        fetchUnreadCount();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, fetchNotifications, fetchUnreadCount, fetchPreferences]);

  const value = {
    // State
    notifications: state.notifications,
    unreadCount: state.unreadCount,
    preferences: state.preferences,
    loading: state.loading,
    error: state.error,
    page: state.page,
    total: state.total,

    // Actions
    fetchNotifications,
    fetchUnreadCount,
    fetchPreferences,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteMultiple,
    toggleNotificationType,
    setQuietHours,
    setAutoRefresh
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

/**
 * Hook to use notification context
 */
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export default NotificationContext;
