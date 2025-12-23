/**
 * API Client Configuration
 * Handles all backend API calls with proper error handling and auth
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Service endpoints
export const API_ENDPOINTS = {
  AUTH: `${API_URL}/auth`,
  EVENTS: `${API_URL}/events`,
  MESSAGING: `${API_URL}/messaging`,
  NOTIFICATIONS: `${API_URL}/notifications`,
};

/**
 * Fetch wrapper with automatic error handling and token injection
 */
export async function apiCall(endpoint, options = {}) {
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  // Add JWT token if available
  const token = localStorage.getItem('token');
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(endpoint, config);

    // Handle 401 Unauthorized
    if (response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    // Parse response
    const data = response.status === 204 ? null : await response.json();

    // Handle error responses
    if (!response.ok) {
      throw new Error(data?.error || `HTTP Error: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API Call Error:', error);
    throw error;
  }
}

/**
 * GET request
 */
export function apiGet(endpoint) {
  return apiCall(endpoint, {
    method: 'GET',
  });
}

/**
 * POST request
 */
export function apiPost(endpoint, data) {
  return apiCall(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * PUT request
 */
export function apiPut(endpoint, data) {
  return apiCall(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * PATCH request
 */
export function apiPatch(endpoint, data) {
  return apiCall(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

/**
 * DELETE request
 */
export function apiDelete(endpoint) {
  return apiCall(endpoint, {
    method: 'DELETE',
  });
}

// ========================================
// AUTH SERVICE ENDPOINTS
// ========================================

export const authApi = {
  login: (credentials) => apiPost(`${API_ENDPOINTS.AUTH}/login`, credentials),
  register: (userData) => apiPost(`${API_ENDPOINTS.AUTH}/register`, userData),
  logout: () => apiPost(`${API_ENDPOINTS.AUTH}/logout`, {}),
  refresh: () => apiPost(`${API_ENDPOINTS.AUTH}/refresh`, {}),
  getCurrentUser: () => apiGet(`${API_ENDPOINTS.AUTH}/me`),
};

// ========================================
// EVENTS SERVICE ENDPOINTS
// ========================================

export const eventsApi = {
  getAll: () => apiGet(`${API_ENDPOINTS.EVENTS}`),
  getById: (id) => apiGet(`${API_ENDPOINTS.EVENTS}/${id}`),
  create: (data) => apiPost(`${API_ENDPOINTS.EVENTS}`, data),
  update: (id, data) => apiPut(`${API_ENDPOINTS.EVENTS}/${id}`, data),
  delete: (id) => apiDelete(`${API_ENDPOINTS.EVENTS}/${id}`),
  register: (eventId) => apiPost(`${API_ENDPOINTS.EVENTS}/${eventId}/register`, {}),
  unregister: (eventId) => apiDelete(`${API_ENDPOINTS.EVENTS}/${eventId}/register`),
};

// ========================================
// MESSAGING SERVICE ENDPOINTS
// ========================================

export const messagingApi = {
  getConversations: () => apiGet(`${API_ENDPOINTS.MESSAGING}/conversations`),
  getMessages: (conversationId) => apiGet(`${API_ENDPOINTS.MESSAGING}/conversations/${conversationId}/messages`),
  sendMessage: (conversationId, data) => apiPost(`${API_ENDPOINTS.MESSAGING}/conversations/${conversationId}/messages`, data),
  createConversation: (data) => apiPost(`${API_ENDPOINTS.MESSAGING}/conversations`, data),
  markAsRead: (conversationId) => apiPatch(`${API_ENDPOINTS.MESSAGING}/conversations/${conversationId}/read`, {}),
};

// ========================================
// NOTIFICATIONS SERVICE ENDPOINTS
// ========================================

export const notificationsApi = {
  getAll: () => apiGet(`${API_ENDPOINTS.NOTIFICATIONS}`),
  getUnread: () => apiGet(`${API_ENDPOINTS.NOTIFICATIONS}/unread`),
  markAsRead: (id) => apiPatch(`${API_ENDPOINTS.NOTIFICATIONS}/${id}/read`, {}),
  markAllAsRead: () => apiPatch(`${API_ENDPOINTS.NOTIFICATIONS}/read-all`, {}),
  delete: (id) => apiDelete(`${API_ENDPOINTS.NOTIFICATIONS}/${id}`),
};

export default {
  apiCall,
  apiGet,
  apiPost,
  apiPut,
  apiPatch,
  apiDelete,
  authApi,
  eventsApi,
  messagingApi,
  notificationsApi,
};
