import React, { useState, useEffect } from 'react';
import './DocumentRepository.css';
import { API_ENDPOINTS, getAuthHeaders } from '../../config/api';

const DocumentRepository = ({ courseId: propCourseId }) => {
  const [documents, setDocuments] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [courseId, setCourseId] = useState(propCourseId || null);

  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    type: 'pdf',
    visibleTo: 'class_only',
    tags: [],
  });

  const [file, setFile] = useState(null);

  useEffect(() => {
    const initializeCourseId = async () => {
      if (propCourseId) {
        setCourseId(propCourseId);
      } else {
        // Try to get courseId from multiple sources
        try {
          const response = await fetch(`${import.meta.env.VITE_AUTH_URL?.replace('/auth', '') || 'http://localhost:3000'}/api/auth/profile`, {
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
      fetchDocuments();
    }
  }, [courseId]);

  const fetchDocuments = async () => {
    if (!courseId) {
      console.log('No courseId available');
      return;
    }
    try {
      const response = await fetch(`${API_ENDPOINTS.DOCUMENTS}?courseId=${courseId}`, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        console.error('❌ Error fetching documents:', response.status, response.statusText);
        setDocuments([]);
        return;
      }
      
      const data = await response.json();
      // Ensure data is an array
      setDocuments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      setDocuments([]);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', uploadData.title);
    formData.append('description', uploadData.description);
    formData.append('courseId', courseId);
    formData.append('type', uploadData.type);
    formData.append('visibleTo', uploadData.visibleTo);
    formData.append('tags', JSON.stringify(uploadData.tags));

    try {
      const response = await fetch(API_ENDPOINTS.DOCUMENTS, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: formData,
      });

      if (response.ok) {
        setShowUploadModal(false);
        setFile(null);
        setUploadData({ title: '', description: '', type: 'pdf', visibleTo: 'class_only', tags: [] });
        fetchDocuments();
      }
    } catch (error) {
      console.error('Error uploading document:', error);
    }
  };

  const downloadDocument = async (docId) => {
    window.location.href = `${API_ENDPOINTS.DOCUMENTS}/${docId}/download?token=${localStorage.getItem('token')}`;
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesType = filterType === 'all' || doc.type === filterType;
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const getDocumentIcon = (type) => {
    const icons = {
      pdf: '📄',
      slides: '🎞️',
      homework: '📝',
      project: '📦',
      exam_paper: '📋',
      solution: '✅',
      reference: '📚',
    };
    return icons[type] || '📎';
  };

  return (
    <div className="document-repository">
      <div className="repo-header">
        <h2>📚 Course Documents Repository</h2>
        <button onClick={() => setShowUploadModal(true)} className="btn-upload">
          ➕ Upload Document
        </button>
      </div>

      <div className="repo-controls">
        <input
          type="text"
          placeholder="Search documents..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="filter-select">
          <option value="all">All Types</option>
          <option value="pdf">PDF Courses</option>
          <option value="slides">Slides</option>
          <option value="homework">Homework</option>
          <option value="project">Projects</option>
          <option value="exam_paper">Exam Papers</option>
        </select>
      </div>

      {showUploadModal && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Upload Document</h3>
            <form onSubmit={handleFileUpload} className="upload-form">
              <input
                type="text"
                placeholder="Document Title"
                value={uploadData.title}
                onChange={(e) => setUploadData({...uploadData, title: e.target.value})}
                required
              />
              <textarea
                placeholder="Description (optional)"
                value={uploadData.description}
                onChange={(e) => setUploadData({...uploadData, description: e.target.value})}
              />
              <select value={uploadData.type} onChange={(e) => setUploadData({...uploadData, type: e.target.value})}>
                <option value="pdf">PDF Course</option>
                <option value="slides">Slides</option>
                <option value="homework">Homework</option>
                <option value="project">Project</option>
              </select>
              <select value={uploadData.visibleTo} onChange={(e) => setUploadData({...uploadData, visibleTo: e.target.value})}>
                <option value="class_only">Class Only</option>
                <option value="students">All Students</option>
                <option value="teachers">Teachers Only</option>
                <option value="all">Public</option>
              </select>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                required
                accept=".pdf,.ppt,.pptx,.doc,.docx"
              />
              <div className="modal-buttons">
                <button type="submit" className="btn-success">Upload</button>
                <button type="button" onClick={() => setShowUploadModal(false)} className="btn-cancel">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="documents-grid">
        {filteredDocuments.length === 0 ? (
          <div className="no-documents">
            <p>📭 No documents found</p>
          </div>
        ) : (
          filteredDocuments.map((doc) => (
            <div key={doc.id} className="document-card">
              <div className="doc-icon">{getDocumentIcon(doc.type)}</div>
              <div className="doc-content">
                <h4>{doc.title}</h4>
                <p className="doc-type">{doc.type.replace('_', ' ')}</p>
                <p className="doc-description">{doc.description}</p>
                <div className="doc-meta">
                  <span className="date">{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                  <span className="downloads">⬇️ {doc.downloadCount}</span>
                </div>
              </div>
              <button onClick={() => downloadDocument(doc.id)} className="btn-download">Download</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DocumentRepository;
