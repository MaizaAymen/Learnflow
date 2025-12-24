// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';

export const API_ENDPOINTS = {
  GRADES: `${API_BASE_URL}/api/grades`,
  DOCUMENTS: `${API_BASE_URL}/api/documents`,
  REQUESTS: `${API_BASE_URL}/api/requests`,
  PROJECTS: `${API_BASE_URL}/api/projects`,
  ANNOUNCEMENTS: `${API_BASE_URL}/api/announcements`,
  COMMENTS: `${API_BASE_URL}/api/comments`,
  AUDIT: `${API_BASE_URL}/api/audit`,
  EXAMS: `${API_BASE_URL}/api/exams`,
  INTERNSHIPS: `${API_BASE_URL}/api/internships`,
};

export const getAuthHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json',
});
