/**
 * Absence Justification API Service
 * Handles all API calls for absence justification workflow
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const JUSTIFICATION_API = `${API_BASE_URL}/absences/justifications`;

class AbsenceJustificationAPI {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  /**
   * Get authorization headers with JWT token
   */
  getHeaders(includeContent = true) {
    const headers = {
      Authorization: `Bearer ${this.token}`,
    };
    if (includeContent) {
      headers['Content-Type'] = 'application/json';
    }
    return headers;
  }

  /**
   * STUDENT ENDPOINTS
   */

  /**
   * Submit a new absence justification
   * @param {Object} justificationData - { title, explanation, justification_type, document }
   * @returns {Promise<Object>} Created justification with ID
   */
  async submitJustification(absenceId, justificationData) {
    try {
      const formData = new FormData();
      formData.append('student_absence_id', absenceId);
      formData.append('title', justificationData.title);
      formData.append('explanation', justificationData.explanation);
      formData.append('justification_type', justificationData.justification_type);
      if (justificationData.document) {
        formData.append('document', justificationData.document);
      }

      const response = await fetch(JUSTIFICATION_API, {
        method: 'POST',
        headers: { Authorization: `Bearer ${this.token}` },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit justification');
      }

      return await response.json();
    } catch (error) {
      console.error('Error submitting justification:', error);
      throw error;
    }
  }

  /**
   * Get student's justifications
   * @param {String} status - Optional filter by status
   * @param {Number} page - Page number for pagination
   * @returns {Promise<Array>} List of student's justifications
   */
  async getMyJustifications(status = null, page = 1) {
    try {
      let url = `${JUSTIFICATION_API}/my-justifications?page=${page}`;
      if (status) {
        url += `&status=${status}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch justifications');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching justifications:', error);
      throw error;
    }
  }

  /**
   * Get single justification details
   * @param {String} justificationId - Justification ID
   * @returns {Promise<Object>} Justification details
   */
  async getJustificationDetail(justificationId) {
    try {
      const response = await fetch(`${JUSTIFICATION_API}/my-justifications/${justificationId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error('Justification not found');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching justification detail:', error);
      throw error;
    }
  }

  /**
   * Update justification (pending or revision_needed status only)
   * @param {String} justificationId - Justification ID
   * @param {Object} updateData - { title, explanation, justification_type, document }
   * @returns {Promise<Object>} Updated justification
   */
  async updateJustification(justificationId, updateData) {
    try {
      const formData = new FormData();
      formData.append('title', updateData.title);
      formData.append('explanation', updateData.explanation);
      formData.append('justification_type', updateData.justification_type);
      if (updateData.document) {
        formData.append('document', updateData.document);
      }

      const response = await fetch(`${JUSTIFICATION_API}/my-justifications/${justificationId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${this.token}` },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update justification');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating justification:', error);
      throw error;
    }
  }

  /**
   * Delete justification (pending or revision_needed status only)
   * @param {String} justificationId - Justification ID
   * @returns {Promise<Object>} Delete confirmation
   */
  async deleteJustification(justificationId) {
    try {
      const response = await fetch(`${JUSTIFICATION_API}/my-justifications/${justificationId}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to delete justification');
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting justification:', error);
      throw error;
    }
  }

  /**
   * Download justification document
   * @param {String} justificationId - Justification ID
   * @returns {Promise<Blob>} Document file
   */
  async downloadDocument(justificationId) {
    try {
      const response = await fetch(`${JUSTIFICATION_API}/${justificationId}/document`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${this.token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to download document');
      }

      return await response.blob();
    } catch (error) {
      console.error('Error downloading document:', error);
      throw error;
    }
  }

  /**
   * ADMIN ENDPOINTS
   */

  /**
   * Get pending justifications (admin only)
   * @returns {Promise<Array>} List of pending justifications
   */
  async getPendingJustifications() {
    try {
      const response = await fetch(`${JUSTIFICATION_API}/admin/pending`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch pending justifications');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching pending justifications:', error);
      throw error;
    }
  }

  /**
   * Get all justifications with filters (admin only)
   * @param {Object} filters - { status, student_id, page, limit }
   * @returns {Promise<Object>} Paginated justifications
   */
  async getAllJustifications(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.student_id) params.append('student_id', filters.student_id);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);

      const url = `${JUSTIFICATION_API}/admin/all${params.toString() ? '?' + params.toString() : ''}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch justifications');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching all justifications:', error);
      throw error;
    }
  }

  /**
   * Approve justification (admin only)
   * @param {String} justificationId - Justification ID
   * @returns {Promise<Object>} Updated justification
   */
  async approveJustification(justificationId) {
    try {
      const response = await fetch(`${JUSTIFICATION_API}/${justificationId}/approve`, {
        method: 'POST',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to approve');
      }

      return await response.json();
    } catch (error) {
      console.error('Error approving justification:', error);
      throw error;
    }
  }

  /**
   * Reject justification (admin only)
   * @param {String} justificationId - Justification ID
   * @param {String} reason - Reason for rejection
   * @returns {Promise<Object>} Updated justification
   */
  async rejectJustification(justificationId, reason) {
    try {
      const response = await fetch(`${JUSTIFICATION_API}/${justificationId}/reject`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ notes: reason }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to reject');
      }

      return await response.json();
    } catch (error) {
      console.error('Error rejecting justification:', error);
      throw error;
    }
  }

  /**
   * Request revision (admin only)
   * @param {String} justificationId - Justification ID
   * @param {String} message - Message for revision request
   * @returns {Promise<Object>} Updated justification
   */
  async requestRevision(justificationId, message) {
    try {
      const response = await fetch(`${JUSTIFICATION_API}/${justificationId}/request-revision`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to request revision');
      }

      return await response.json();
    } catch (error) {
      console.error('Error requesting revision:', error);
      throw error;
    }
  }

  /**
   * Get justification statistics (admin only)
   * @returns {Promise<Object>} Statistics with fallback data
   */
  async getStatistics() {
    const fallbackData = {
      byStatus: {
        pending: 0,
        approved: 0,
        rejected: 0,
        revision_needed: 0
      },
      byType: {
        medical: 0,
        family_issue: 0,
        administrative: 0,
        personal: 0,
        other: 0
      },
      total: 0,
      success: true,
      isFallback: true
    };

    try {
      // Refresh token from localStorage (in case it was updated)
      this.token = localStorage.getItem('token');
      
      if (!this.token) {
        console.warn('⚠️ No authentication token found, using fallback statistics');
        return fallbackData;
      }

      console.log('📊 Fetching statistics with token:', this.token.substring(0, 20) + '...');

      const response = await fetch(`${JUSTIFICATION_API}/admin/statistics`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (response.status === 401) {
        console.error('❌ Authentication failed (401). Token may be expired.');
        // Token might be expired, try to refresh or return fallback
        return fallbackData;
      }

      if (response.status === 403) {
        console.error('❌ Insufficient permissions (403). Admin access required.');
        throw new Error('You do not have permission to view statistics');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ API Error:', response.status, errorData);
        // Return fallback data on error instead of throwing
        return {
          ...fallbackData,
          error: errorData.error || 'Failed to fetch statistics'
        };
      }

      const data = await response.json();
      console.log('✅ Statistics fetched successfully:', data);
      return {
        ...fallbackData,
        ...data,
        isFallback: false
      };
    } catch (error) {
      console.error('❌ Error fetching statistics:', error.message);
      console.warn('⚠️ Using fallback statistics data');
      return {
        ...fallbackData,
        error: error.message
      };
    }
  }

  /**
   * CHEF ENDPOINT
   */

  /**
   * Override justification decision (chef only)
   * @param {String} justificationId - Justification ID
   * @param {Object} overrideData - { decision, notes }
   * @returns {Promise<Object>} Updated justification
   */
  async overrideDecision(justificationId, overrideData) {
    try {
      const response = await fetch(`${JUSTIFICATION_API}/${justificationId}/override`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(overrideData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to override');
      }

      return await response.json();
    } catch (error) {
      console.error('Error overriding decision:', error);
      throw error;
    }
  }

  /**
   * UTILITY METHODS
   */

  /**
   * Get status badge color
   */
  static getStatusColor(status) {
    const colors = {
      pending: '#ffc069',
      approved: '#52c41a',
      rejected: '#f5222d',
      revision_needed: '#faad14',
      deleted: '#8c8c8c',
    };
    return colors[status] || '#1890ff';
  }

  /**
   * Get status label in French
   */
  getStatusLabel(status) {
    const labels = {
      pending: 'En attente',
      approved: 'Approuvée',
      rejected: 'Rejetée',
      revision_needed: 'Révision nécessaire',
      deleted: 'Supprimée',
    };
    return labels[status] || status;
  }

  /**
   * Get justification type label
   */
  getTypeLabel(type) {
    const labels = {
      medical: 'Médicale',
      family_issue: 'Problème familial',
      administrative: 'Administrative',
      personal: 'Personnelle',
      other: 'Autre',
    };
    return labels[type] || type;
  }

  /**
   * Validate file
   */
  static validateFile(file) {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      throw new Error('Type de fichier non autorisé. Acceptés: PDF, JPG, PNG');
    }

    if (file.size > maxSize) {
      throw new Error('Le fichier est trop volumineux. Maximum: 10MB');
    }

    return true;
  }
}

export default new AbsenceJustificationAPI();
