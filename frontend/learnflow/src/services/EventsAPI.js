/**
 * Events API Service
 * Handles all API calls to the events microservice
 */
export class EventsAPI {
  constructor(baseURL = import.meta.env.VITE_EVENTS_URL || 'http://localhost:3000/api/events') {
    this.baseURL = baseURL;
  }

  async createEvent(data) {
    const response = await fetch(`${this.baseURL}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create event');
    return response.json();
  }

  async createEventWithFile(formData) {
    const response = await fetch(`${this.baseURL}`, {
      method: 'POST',
      body: formData
    });
    if (!response.ok) throw new Error('Failed to create event');
    return response.json();
  }

  async getEvents(filters = {}) {
    const params = new URLSearchParams();
    if (filters.type) params.append('type', filters.type);
    if (filters.departement_id) params.append('departement_id', filters.departement_id);
    if (filters.visibility) params.append('visibility', filters.visibility);
    
    const response = await fetch(`${this.baseURL}?${params}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) throw new Error('Failed to fetch events');
    return response.json();
  }

  async getEvent(id) {
    const response = await fetch(`${this.baseURL}/${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) throw new Error('Failed to fetch event');
    return response.json();
  }

  async updateEvent(id, data) {
    const response = await fetch(`${this.baseURL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update event');
    return response.json();
  }

  async updateEventWithFile(id, formData) {
    try {
      const response = await fetch(`${this.baseURL}/${id}`, {
        method: 'PUT',
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Update event error response:', errorData);
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to update event`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Update event API error:', error);
      throw error;
    }
  }

  async deleteEvent(id) {
    const response = await fetch(`${this.baseURL}/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to delete event');
    }
    return response.json();
  }

  // Registration endpoints
  async joinEvent(eventId, studentId) {
    const response = await fetch(`${this.baseURL}/${eventId}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id: studentId })
    });
    if (!response.ok) throw new Error('Failed to join event');
    return response.json();
  }

  async leaveEvent(eventId, studentId) {
    const response = await fetch(`${this.baseURL}/${eventId}/leave`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id: studentId })
    });
    if (!response.ok) throw new Error('Failed to leave event');
    return response.json();
  }

  async getStudentEvents(studentId) {
    const response = await fetch(`${this.baseURL}/student/${studentId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) throw new Error('Failed to fetch student events');
    return response.json();
  }

  async checkRegistration(eventId, studentId) {
    const params = new URLSearchParams({ eventId, studentId });
    const response = await fetch(`${this.baseURL}/check-registration?${params}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) throw new Error('Failed to check registration');
    return response.json();
  }

  async getEventParticipants(eventId) {
    const response = await fetch(`${this.baseURL}/${eventId}/participants`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) throw new Error('Failed to fetch participants');
    return response.json();
  }
}

export default EventsAPI;

