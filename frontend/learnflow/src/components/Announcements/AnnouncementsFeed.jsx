import React, { useState, useEffect } from 'react';
import './AnnouncementsFeed.css';
import { API_ENDPOINTS, getAuthHeaders } from '../../config/api';

const AnnouncementsFeed = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [pdfModalVisible, setPdfModalVisible] = useState(false);
  const [selectedPdfUrl, setSelectedPdfUrl] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'announcement',
    priority: 'medium',
    tags: [],
    pdfFile: null,
  });

  useEffect(() => {
    fetchAnnouncements();
    checkIsAdmin();
  }, []);

  const checkIsAdmin = async () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setIsAdmin(user.role === 'admin' || user.role === 'department_head' || user.role === 'teacher');
    setUserId(user.id);
  };

  const fetchAnnouncements = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('⚠️ No authentication token found');
        return;
      }

      const response = await fetch(API_ENDPOINTS.ANNOUNCEMENTS, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setAnnouncements(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('❌ Error fetching announcements:', error);
      setAnnouncements([]);
    }
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim()) {
      alert('❌ Please enter an announcement title');
      return;
    }
    if (!formData.content.trim()) {
      alert('❌ Please enter announcement content');
      return;
    }
    if (!formData.type) {
      alert('❌ Please select an announcement type');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('❌ Authentication required. Please log in.');
        return;
      }

      const url = editingId 
        ? `${API_ENDPOINTS.ANNOUNCEMENTS}/${editingId}`
        : API_ENDPOINTS.ANNOUNCEMENTS;
      
      const method = editingId ? 'PUT' : 'POST';

      // Use FormData for file upload if PDF is selected
      let body;
      let headers = { 'Authorization': `Bearer ${token}` };
      
      if (formData.pdfFile && !editingId) {
        // For POST with file, use FormData
        body = new FormData();
        body.append('title', formData.title.trim());
        body.append('content', formData.content.trim());
        body.append('type', formData.type);
        body.append('priority', formData.priority || 'medium');
        body.append('visibility', 'all');
        body.append('tags', JSON.stringify(formData.tags || []));
        body.append('pdfFile', formData.pdfFile);
      } else {
        // For PUT or no file, use JSON
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify({
          title: formData.title.trim(),
          content: formData.content.trim(),
          type: formData.type,
          priority: formData.priority || 'medium',
          visibility: 'all',
          tags: formData.tags || [],
        });
      }

      const response = await fetch(url, {
        method,
        headers,
        body,
      });

      const responseData = await response.json();

      if (response.ok && responseData.success) {
        alert(`✅ Announcement ${editingId ? 'updated' : 'published'} successfully!`);
        setFormData({ title: '', content: '', type: 'announcement', priority: 'medium', tags: [], pdfFile: null });
        setShowForm(false);
        setEditingId(null);
        await fetchAnnouncements();
      } else {
        const errorMsg = responseData.error || `Failed to ${editingId ? 'update' : 'create'} announcement`;
        const details = responseData.message || (Array.isArray(responseData.details) ? responseData.details.join(', ') : responseData.details);
        console.error('❌ API Error:', errorMsg);
        console.error('Details:', details);
        alert(`❌ ${errorMsg}${details ? '\n\nDetails: ' + details : ''}`);
      }
    } catch (error) {
      console.error('❌ Error:', error);
      alert(`❌ Network error: ${error.message}`);
    }
  };

  const handleEditAnnouncement = (ann) => {
    setFormData({
      title: ann.title,
      content: ann.content,
      type: ann.type,
      priority: ann.priority,
      tags: ann.tags || [],
    });
    setEditingId(ann.id);
    setShowForm(true);
  };

  const handleDeleteAnnouncement = async (announcementId) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('❌ Authentication required');
        return;
      }

      const response = await fetch(`${API_ENDPOINTS.ANNOUNCEMENTS}/${announcementId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        alert('✅ Announcement deleted successfully!');
        await fetchAnnouncements();
      } else {
        alert(`❌ ${data.error || 'Failed to delete announcement'}`);
      }
    } catch (error) {
      console.error('❌ Error deleting announcement:', error);
      alert(`❌ Network error: ${error.message}`);
    }
  };

  const handleDownloadPDF = async (announcementId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('❌ Authentication required');
        return;
      }

      const response = await fetch(`${API_ENDPOINTS.ANNOUNCEMENTS}/${announcementId}/pdf`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `announcement-${announcementId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('❌ Error downloading PDF:', error);
      alert(`❌ Failed to download PDF: ${error.message}`);
    }
  };

  const handleViewPdf = (filePath) => {
    setSelectedPdfUrl(`http://localhost:3000${filePath}`);
    setPdfModalVisible(true);
  };

  const getTypeIcon = (type) => {
    const icons = {
      announcement: '📢',
      event: '📅',
      urgent: '🚨',
      maintenance: '🔧',
      deadline: '⏰',
    };
    return icons[type] || '📌';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: '#17a2b8',
      medium: '#ffc107',
      high: '#fd7e14',
      urgent: '#dc3545',
    };
    return colors[priority] || '#6c757d';
  };

  const filteredAnnouncements = announcements.filter(ann => {
    const typeMatch = filterType === 'all' || ann.type === filterType;
    const priorityMatch = filterPriority === 'all' || ann.priority === filterPriority;
    return typeMatch && priorityMatch;
  });

  return (
    <div className="announcements-feed">
      <div className="feed-header">
        <h2>📣 Public Announcements Feed</h2>
        {isAdmin && (
          <button onClick={() => {
            setEditingId(null);
            setFormData({ title: '', content: '', type: 'announcement', priority: 'medium', tags: [] });
            setShowForm(!showForm);
          }} className="btn-primary">
            {showForm ? 'Cancel' : '✍️ New Announcement'}
          </button>
        )}
      </div>

      {showForm && isAdmin && (
        <form onSubmit={handleCreateAnnouncement} className="announcement-form">
          <input
            type="text"
            placeholder="Announcement Title"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            required
          />

          <textarea
            placeholder="Announcement Content..."
            value={formData.content}
            onChange={(e) => setFormData({...formData, content: e.target.value})}
            required
          />

          <div style={{ marginTop: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
              📎 Attach PDF File (Optional)
            </label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setFormData({...formData, pdfFile: e.target.files[0] || null})}
              style={{ 
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                cursor: 'pointer',
                width: '100%'
              }}
            />
            {formData.pdfFile && (
              <p style={{ margin: '5px 0 0 0', color: '#28a745', fontSize: '12px' }}>
                ✅ Selected: {formData.pdfFile.name}
              </p>
            )}
          </div>

          <div className="form-row">
            <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
              <option value="announcement">Announcement</option>
              <option value="event">Event</option>
              <option value="urgent">Urgent</option>
              <option value="maintenance">Maintenance</option>
              <option value="deadline">Deadline</option>
            </select>

            <select value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value})}>
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <button type="submit" className="btn-success">Publish</button>
        </form>
      )}

      <div className="feed-filters">
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="filter-select">
          <option value="all">All Types</option>
          <option value="announcement">Announcements</option>
          <option value="event">Events</option>
          <option value="urgent">Urgent</option>
        </select>

        <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="filter-select">
          <option value="all">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent Only</option>
        </select>
      </div>

      <div className="announcements-list">
        {filteredAnnouncements.length === 0 ? (
          <div className="no-announcements">
            <p>📭 No announcements yet</p>
          </div>
        ) : (
          filteredAnnouncements.map((ann) => (
            <div key={ann.id} className="announcement-item">
              {ann.isPinned && <span className="pinned-badge">📌 Pinned</span>}
              <div className="announcement-icon">{getTypeIcon(ann.type)}</div>
              <div className="announcement-content">
                <div className="ann-header">
                  <h3>{ann.title}</h3>
                  <span className="priority-badge" style={{ backgroundColor: getPriorityColor(ann.priority) }}>
                    {ann.priority}
                  </span>
                </div>
                <p className="ann-text">{ann.content}</p>
                {ann.attachments && ann.attachments.length > 0 && (
                  <div style={{ marginTop: '10px', padding: '12px', backgroundColor: '#f0f5ff', borderRadius: '4px', border: '1px solid #91d5ff' }}>
                    <p style={{ margin: '0 0 10px 0', fontSize: '13px', fontWeight: 'bold', color: '#0050b3', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      📄 Pièces jointes:
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {ann.attachments.map((file, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '8px',
                            backgroundColor: '#ffffff',
                            border: '1px solid #b3d9ff',
                            borderRadius: '4px'
                          }}
                        >
                          <span style={{ fontSize: '16px', color: '#ff4d4f' }}>📑</span>
                          <span style={{ fontSize: '13px', color: '#333', flex: 1, wordBreak: 'break-word' }}>
                            {file.filename}
                          </span>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              onClick={() => handleViewPdf(file.path)}
                              style={{
                                padding: '5px 10px',
                                backgroundColor: '#1890ff',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '3px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: '500',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => e.target.style.backgroundColor = '#0050b3'}
                              onMouseLeave={(e) => e.target.style.backgroundColor = '#1890ff'}
                              title="Preview PDF"
                            >
                              👁️ Aperçu
                            </button>
                            <a
                              href={`http://localhost:3000${file.path}`}
                              download={file.filename}
                              style={{
                                padding: '5px 10px',
                                backgroundColor: '#52c41a',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '3px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: '500',
                                textDecoration: 'none',
                                display: 'inline-block',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => e.target.style.backgroundColor = '#525252ff'}
                              onMouseLeave={(e) => e.target.style.backgroundColor = '#6a6a6aff'}
                              title="Download PDF"
                            >
                              ⬇️ Télécharger
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="ann-footer">
                  <span className="ann-author">{ann.authorName}</span>
                  <span className="ann-date">{new Date(ann.publishedAt).toLocaleDateString()}</span>
                  <span className="ann-views">👁️ {ann.viewCount}</span>
                </div>
                <div className="ann-actions">
                  <button onClick={() => handleDownloadPDF(ann.id)} className="action-btn pdf-btn" title="Download as PDF">
                    📄 PDF
                  </button>
                  {(isAdmin || String(userId) === String(ann.authorId)) && (
                    <>
                      <button onClick={() => handleEditAnnouncement(ann)} className="action-btn edit-btn" title="Edit announcement">
                        ✏️ Edit
                      </button>
                      <button onClick={() => handleDeleteAnnouncement(ann.id)} className="action-btn delete-btn" title="Delete announcement">
                        🗑️ Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* PDF Modal */}
      {pdfModalVisible && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '8px',
            padding: '0',
            width: '90%',
            height: '90%',
            maxWidth: '900px',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '16px',
              borderBottom: '1px solid #f0f0f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Aperçu du PDF</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <a
                  href={selectedPdfUrl}
                  download="document.pdf"
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#414141ff',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  ⬇️ Télécharger
                </a>
                <button
                  onClick={() => setPdfModalVisible(false)}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#f5f5f5',
                    color: '#333',
                    border: '1px solid #d9d9d9',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Fermer
                </button>
              </div>
            </div>
            
            {/* PDF Viewer */}
            <div style={{ flex: 1, overflow: 'auto' }}>
              {selectedPdfUrl && (
                <iframe
                  src={`${selectedPdfUrl}#toolbar=0`}
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none'
                  }}
                  title="PDF Viewer"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnouncementsFeed;
