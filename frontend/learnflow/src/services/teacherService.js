const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const teacherService = {
  /**
   * Get teacher's classes
   */
  getTeacherClasses: async (teacherId) => {
    try {
      const response = await fetch(`${API_BASE}/teacher/${teacherId}/classes`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw error;
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching teacher classes:', error);
      throw error;
    }
  },

  /**
   * Get teacher's subjects
   */
  getTeacherSubjects: async (teacherId) => {
    try {
      const response = await fetch(`${API_BASE}/teacher/${teacherId}/subjects`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw error;
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching teacher subjects:', error);
      throw error;
    }
  },

  /**
   * Get teacher's students (grouped by class)
   */
  getTeacherStudents: async (teacherId) => {
    try {
      const response = await fetch(`${API_BASE}/teacher/${teacherId}/students`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw error;
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching teacher students:', error);
      throw error;
    }
  },

  /**
   * Get teacher's schedules (courses)
   */
  getTeacherSchedules: async () => {
    try {
      const response = await fetch(`${API_BASE}/teacher/schedules`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw error;
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching teacher schedules:', error);
      throw error;
    }
  },

  /**
   * Get teacher's absences data
   */
  getTeacherAbsences: async (teacherId) => {
    try {
      const response = await fetch(`${API_BASE}/teacher/${teacherId}/absences`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw error;
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching teacher absences:', error);
      throw error;
    }
  },

  /**
   * Get student absence alerts
   */
  getAbsenceAlerts: async (teacherId) => {
    try {
      const response = await fetch(`${API_BASE}/teacher/${teacherId}/absence-alerts`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw error;
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching absence alerts:', error);
      throw error;
    }
  },

  /**
   * Take attendance for a session
   */
  takeAttendance: async (scheduleId, attendanceData) => {
    try {
      const response = await fetch(`${API_BASE}/teacher/attendance/${scheduleId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(attendanceData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw error;
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error taking attendance:', error);
      throw error;
    }
  },

  /**
   * Enter grades for students
   */
  enterGrades: async (classId, gradeData) => {
    try {
      const response = await fetch(`${API_BASE}/teacher/grades/${classId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(gradeData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw error;
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error entering grades:', error);
      throw error;
    }
  },
};

export default teacherService;
