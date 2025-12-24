const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace('/api', '') + '/api/department-head';

const getAuthHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json'
});

export const departmentHeadService = {
  /**
   * Get the department for the authenticated head
   */
  getDepartment: async () => {
    try {
      const response = await fetch(`${API_URL}/department`, {
        method: 'GET',
        credentials: 'include',
        headers: getAuthHeaders()
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching department:', error);
      throw error;
    }
  },

  /**
   * Get all students in the department with filters
   */
  getStudents: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      
      if (filters.groupe) params.append('groupe', filters.groupe);
      if (filters.specialite) params.append('specialite', filters.specialite);
      if (filters.statut) params.append('statut', filters.statut);
      if (filters.search) params.append('search', filters.search);

      const response = await fetch(`${API_URL}/students?${params.toString()}`, {
        method: 'GET',
        credentials: 'include',
        headers: getAuthHeaders()
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching students:', error);
      throw error;
    }
  },

  /**
   * Get detailed info for a specific student
   */
  getStudentDetails: async (studentId) => {
    try {
      const response = await fetch(`${API_URL}/student/${studentId}`, {
        method: 'GET',
        credentials: 'include',
        headers: getAuthHeaders()
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching student details:', error);
      throw error;
    }
  },

  /**
   * Get department statistics
   */
  getStatistics: async () => {
    try {
      const response = await fetch(`${API_URL}/statistics`, {
        method: 'GET',
        credentials: 'include',
        headers: getAuthHeaders()
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching statistics:', error);
      throw error;
    }
  },

  /**
   * Export students data to CSV
   */
  exportCSV: async () => {
    try {
      const response = await fetch(`${API_URL}/export-csv`, {
        method: 'GET',
        credentials: 'include',
        headers: getAuthHeaders()
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `department_students_${new Date().toISOString()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      throw error;
    }
  }
};

export default departmentHeadService;
