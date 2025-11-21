import React, { useState, useEffect } from 'react';
import './ProjectManagement.css';
import { API_ENDPOINTS, getAuthHeaders } from '../../config/api';

const ProjectManagement = ({ courseId: propCourseId }) => {
  const [projects, setProjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [courseId, setCourseId] = useState(propCourseId || null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectType: 'project',
    topic: '',
    objectives: [],
  });

  useEffect(() => {
    const initializeCourseId = async () => {
      if (propCourseId) {
        setCourseId(propCourseId);
      } else {
        // Try to get courseId from multiple sources
        try {
          const response = await fetch('http://localhost:4000/api/auth/profile', {
            headers: getAuthHeaders(),
            credentials: 'include'
          });
          if (response.ok) {
            const data = await response.json();
            setCourseId(data.user?.courseId || data.user?.id);
          } else {
            // If 401 or other error, fallback to localStorage
            const userId = localStorage.getItem('userId');
            const token = localStorage.getItem('token');
            if (userId) {
              setCourseId(userId);
            } else if (token) {
              // Try to decode token to get user ID
              try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setCourseId(payload.id || payload.userId);
              } catch (e) {
                console.warn('Could not decode token');
              }
            }
          }
        } catch (error) {
          console.error('Error fetching user info:', error);
          // Use userId from localStorage as fallback
          const userId = localStorage.getItem('userId');
          if (userId) setCourseId(userId);
        }
      }
    };
    initializeCourseId();
  }, [propCourseId]);

  useEffect(() => {
    if (courseId) {
      fetchProjects();
    }
  }, [courseId]);

  const fetchProjects = async () => {
    if (!courseId) {
      console.log('No courseId available');
      return;
    }
    try {
      const response = await fetch(`${API_ENDPOINTS.PROJECTS}/course/${courseId}`, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        console.error('❌ API Error:', response.status, response.statusText);
        if (response.status === 401) {
          console.error('❌ Unauthorized - Token missing or invalid');
          setProjects([]);
          return;
        }
      }
      
      const data = await response.json();
      setProjects(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]);
    }
  };

  const handleRegisterProject = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.title || !formData.topic || !formData.projectType) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const payload = {
        title: formData.title,
        topic: formData.topic,
        description: formData.description,
        projectType: formData.projectType,
        courseId: parseInt(courseId, 10),
        objectives: formData.objectives
      };

      console.log('📤 Sending project data:', payload);

      const response = await fetch(API_ENDPOINTS.PROJECTS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        console.log('✅ Project created successfully');
        setFormData({ title: '', description: '', projectType: 'project', topic: '', objectives: [] });
        setShowForm(false);
        fetchProjects();
      } else {
        const error = await response.json();
        console.error('❌ Error:', error);
        alert(`Error: ${error.error || 'Failed to create project'}`);
      }
    } catch (error) {
      console.error('Error registering project:', error);
      alert('Network error: ' + error.message);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: '#6c757d',
      submitted: '#17a2b8',
      approved: '#28a745',
      in_progress: '#007bff',
      evaluation: '#ffc107',
      completed: '#6c757d',
      rejected: '#dc3545',
    };
    return colors[status] || '#999';
  };

  const getTypeIcon = (type) => {
    const icons = {
      project: '📦',
      pfe: '🎓',
      capstone: '🏆',
      research: '🔬',
    };
    return icons[type] || '📁';
  };

  return (
    <div className="project-management">
      <div className="projects-header">
        <h2>🎓 Project & PFE Management</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Cancel' : '📝 Register Project'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleRegisterProject} className="project-form">
          <input
            type="text"
            placeholder="Project Title"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            required
          />

          <select value={formData.projectType} onChange={(e) => setFormData({...formData, projectType: e.target.value})}>
            <option value="project">Project</option>
            <option value="pfe">PFE (Final Project)</option>
            <option value="capstone">Capstone</option>
            <option value="research">Research</option>
          </select>

          <textarea
            placeholder="Project Topic"
            value={formData.topic}
            onChange={(e) => setFormData({...formData, topic: e.target.value})}
            required
          />

          <textarea
            placeholder="Project Description"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          />

          <button type="submit" className="btn-success">Register Project</button>
        </form>
      )}

      <div className="projects-grid">
        {projects.length === 0 ? (
          <div className="no-projects">
            <p>📭 No projects yet</p>
          </div>
        ) : (
          projects.map((project) => (
            <div
              key={project.id}
              className="project-card"
              onClick={() => setSelectedProject(project)}
            >
              <div className="project-icon">{getTypeIcon(project.projectType)}</div>
              <h4>{project.title}</h4>
              <p className="project-topic">{project.topic.substring(0, 80)}...</p>
              <div className="project-meta">
                <span
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(project.status), color: 'white' }}
                >
                  {project.status}
                </span>
                <span className="type-badge">{project.projectType}</span>
              </div>
              {project.evaluationScore && (
                <div className="score-badge">Score: {project.evaluationScore}/20</div>
              )}
            </div>
          ))
        )}
      </div>

      {selectedProject && (
        <div className="modal-overlay" onClick={() => setSelectedProject(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{selectedProject.title}</h3>
            <div className="modal-details">
              <p><strong>Type:</strong> {selectedProject.projectType}</p>
              <p><strong>Status:</strong> {selectedProject.status}</p>
              <p><strong>Topic:</strong> {selectedProject.topic}</p>
              <p><strong>Description:</strong> {selectedProject.description}</p>
              {selectedProject.supervisorId && (
                <p><strong>Supervisor Assigned:</strong> Yes</p>
              )}
              {selectedProject.presentationDate && (
                <p><strong>Presentation:</strong> {new Date(selectedProject.presentationDate).toLocaleDateString()}</p>
              )}
              {selectedProject.evaluationScore && (
                <>
                  <p><strong>Evaluation Score:</strong> {selectedProject.evaluationScore}/20</p>
                  <p><strong>Feedback:</strong> {selectedProject.evaluationFeedback}</p>
                </>
              )}
            </div>
            <button onClick={() => setSelectedProject(null)} className="btn-close">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectManagement;
