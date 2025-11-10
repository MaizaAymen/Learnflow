import { useState, useEffect } from 'react';

/**
 * Calendar API Service
 * Handles all API calls to the calendar system
 */
export class CalendarAPI {
  constructor(baseURL = 'http://localhost:3000/api/calendar') {
    this.baseURL = baseURL;
  }

  // ==================== TIME SLOTS ====================
  
  async getTimeSlots(filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${this.baseURL}/timeslots?${params}`);
    return response.json();
  }

  async createTimeSlot(data) {
    const response = await fetch(`${this.baseURL}/timeslots`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }

  async bulkCreateTimeSlots(timeSlots) {
    const response = await fetch(`${this.baseURL}/timeslots/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ timeSlots })
    });
    return response.json();
  }

  async updateTimeSlot(id, data) {
    const response = await fetch(`${this.baseURL}/timeslots/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }

  async deleteTimeSlot(id) {
    const response = await fetch(`${this.baseURL}/timeslots/${id}`, {
      method: 'DELETE'
    });
    return response.json();
  }

  // ==================== SCHEDULES ====================
  
  async getSchedules(filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${this.baseURL}/schedules?${params}`);
    return response.json();
  }

  async getClassWeeklySchedule(classeId, date = null) {
    const dateParam = date ? `?date=${date}` : '';
    const response = await fetch(`${this.baseURL}/schedules/classe/${classeId}/week${dateParam}`);
    return response.json();
  }

  async getTeacherSchedule(enseignantId, filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${this.baseURL}/schedules/teacher/${enseignantId}?${params}`);
    return response.json();
  }

  async checkAvailability(date, filters = {}) {
    const params = new URLSearchParams({ date, ...filters });
    const response = await fetch(`${this.baseURL}/schedules/availability/timeslots?${params}`);
    return response.json();
  }

  async createSchedule(data) {
    const response = await fetch(`${this.baseURL}/schedules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }

  async updateSchedule(id, data) {
    const response = await fetch(`${this.baseURL}/schedules/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }

  async dragDropSchedule(id, data) {
    const response = await fetch(`${this.baseURL}/schedules/${id}/drag-drop`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }

  async cancelSchedule(id) {
    const response = await fetch(`${this.baseURL}/schedules/${id}/cancel`, {
      method: 'PATCH'
    });
    return response.json();
  }

  async deleteSchedule(id) {
    const response = await fetch(`${this.baseURL}/schedules/${id}`, {
      method: 'DELETE'
    });
    return response.json();
  }

  // ==================== BOOKINGS ====================
  
  async getBookings(filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${this.baseURL}/bookings?${params}`);
    return response.json();
  }

  async createBooking(data) {
    const response = await fetch(`${this.baseURL}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }

  async markAttendance(bookingId, presence) {
    const response = await fetch(`${this.baseURL}/bookings/${bookingId}/attendance`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ presence })
    });
    return response.json();
  }

  async getAttendanceReport(scheduleId) {
    const response = await fetch(`${this.baseURL}/bookings/schedule/${scheduleId}/attendance`);
    return response.json();
  }

  async cancelBooking(bookingId) {
    const response = await fetch(`${this.baseURL}/bookings/${bookingId}`, {
      method: 'DELETE'
    });
    return response.json();
  }
}

// ==================== REACT HOOKS ====================

/**
 * Hook to fetch and manage class weekly schedule
 */
export function useClassSchedule(classeId) {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const api = new CalendarAPI();

  useEffect(() => {
    if (!classeId) return;

    const fetchSchedule = async () => {
      try {
        setLoading(true);
        const data = await api.getClassWeeklySchedule(classeId);
        setSchedule(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [classeId]);

  return { schedule, loading, error, refresh: () => fetchSchedule() };
}

/**
 * Hook to fetch teacher's schedule
 */
export function useTeacherSchedule(enseignantId) {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const api = new CalendarAPI();

  useEffect(() => {
    if (!enseignantId) return;

    const fetchSchedule = async () => {
      try {
        setLoading(true);
        const data = await api.getTeacherSchedule(enseignantId);
        setSchedule(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [enseignantId]);

  return { schedule, loading, error };
}

/**
 * Hook to manage student bookings
 */
export function useStudentBookings(userId) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const api = new CalendarAPI();

  useEffect(() => {
    if (!userId) return;

    const fetchBookings = async () => {
      try {
        setLoading(true);
        const data = await api.getBookings({ user_id: userId, user_type: 'student' });
        setBookings(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [userId]);

  const bookClass = async (scheduleId) => {
    try {
      const result = await api.createBooking({
        schedule_id: scheduleId,
        user_id: userId,
        user_type: 'student'
      });
      setBookings([...bookings, result]);
      return result;
    } catch (err) {
      throw new Error(`Failed to book class: ${err.message}`);
    }
  };

  const cancelBooking = async (bookingId) => {
    try {
      await api.cancelBooking(bookingId);
      setBookings(bookings.filter(b => b.id !== bookingId));
    } catch (err) {
      throw new Error(`Failed to cancel booking: ${err.message}`);
    }
  };

  return { bookings, loading, error, bookClass, cancelBooking };
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Format time string for display
 */
export function formatTime(timeString) {
  if (!timeString) return '';
  return timeString.substring(0, 5); // Returns HH:MM
}

/**
 * Get day name in French
 */
export function getDayName(dayIndex) {
  const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  return days[dayIndex];
}

/**
 * Group schedules by day of week
 */
export function groupSchedulesByDay(schedules) {
  const dayOrder = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  const grouped = {};

  dayOrder.forEach(day => {
    grouped[day] = schedules
      .filter(s => s.timeSlot.day_of_week === day)
      .sort((a, b) => a.timeSlot.start_time.localeCompare(b.timeSlot.start_time));
  });

  return grouped;
}

/**
 * Get status badge color
 */
export function getStatusColor(status) {
  const colors = {
    planifie: 'gray',
    confirme: 'green',
    annule: 'red',
    termine: 'blue',
    pending: 'yellow',
    confirmed: 'green',
    cancelled: 'red',
    completed: 'blue'
  };
  return colors[status] || 'gray';
}

/**
 * Get type course badge color
 */
export function getCourseTypeColor(type) {
  const colors = {
    Cours: 'blue',
    TD: 'purple',
    TP: 'orange',
    Examen: 'red',
    Soutien: 'green'
  };
  return colors[type] || 'gray';
}

/**
 * Check if a date is today
 */
export function isToday(dateString) {
  const today = new Date();
  const date = new Date(dateString);
  return date.toDateString() === today.toDateString();
}

/**
 * Format date for display
 */
export function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

export default CalendarAPI;
