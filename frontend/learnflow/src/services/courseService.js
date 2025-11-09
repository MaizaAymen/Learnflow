const API_URL = 'http://localhost:3000/api/courses';

export const courseService = {
  // Get all courses
  getAllCourses: async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw await response.json();
      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  // Get courses by matiere ID
  getCoursesByMatiere: async (matiereId) => {
    try {
      const response = await fetch(`${API_URL}/matiere/${matiereId}`);
      if (!response.ok) throw await response.json();
      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  // Get courses by teacher ID
  getCoursesByTeacher: async (userId) => {
    try {
      const response = await fetch(`${API_URL}/teacher/${userId}`);
      if (!response.ok) throw await response.json();
      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  // Get a single course by ID
  getCourseById: async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`);
      if (!response.ok) throw await response.json();
      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  // Create a new course
  createCourse: async (courseData) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(courseData),
      });
      if (!response.ok) throw await response.json();
      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  // Update a course
  updateCourse: async (id, courseData) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(courseData),
      });
      if (!response.ok) throw await response.json();
      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  // Delete a course
  deleteCourse: async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw await response.json();
      return await response.json();
    } catch (error) {
      throw error;
    }
  }
};

export default courseService;
