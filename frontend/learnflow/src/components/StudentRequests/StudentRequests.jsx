import React, { useState, useEffect } from 'react';
import './StudentRequests.css';
import { API_ENDPOINTS, getAuthHeaders } from '../../config/api';

const StudentRequests = ({ userId, isStudent }) => {
  const [requests, setRequests] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);

  const [formData, setFormData] = useState({
    type: 'absence_justification',
    title: '',
    description: '',
    priority: 'medium',
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const endpoint = isStudent ? `${API_ENDPOINTS.REQUESTS}/my-requests` : API_ENDPOINTS.REQUESTS;
      const response = await fetch(endpoint, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        console.error('❌ API Error:', response.status, response.statusText);
        if (response.status === 401) {
          console.error('❌ Unauthorized - Token missing or invalid');
          setRequests([]);
          return;
        }
      }
      
      const data = await response.json();
      setRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setRequests([]);
    }
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFormData({ type: 'absence_justification', title: '', description: '', priority: 'medium' });
        setShowForm(false);
        fetchRequests();
      }
    } catch (error) {
      console.error('Error submitting request:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ffc107',
      in_review: '#17a2b8',
      approved: '#28a745',
      rejected: '#dc3545',
      completed: '#6c757d',
    };
    return colors[status] || '#999';
  };

  const getTypeIcon = (type) => {
    const icons = {
      absence_justification: '📄',
      certificate_request: '🎓',
      transcript_request: '📋',
      complaint: '⚠️',
      administrative: '📮',
      other: '❓',
    };
    return icons[type] || '📎';
  };

  const filteredRequests = filterStatus === 'all'
    ? requests
    : requests.filter(r => r.status === filterStatus);

  return (
    <div className="student-requests">
      <div className="requests-header">
        <h2>📋 Student Requests & Tickets</h2>
        {isStudent && (
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            {showForm ? 'Cancel' : '✉️ Submit Request'}
          </button>
        )}
      </div>

      {showForm && isStudent && (
        <form onSubmit={handleSubmitRequest} className="request-form">
          <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
            <option value="absence_justification">Absence Justification</option>
            <option value="certificate_request">Certificate Request</option>
            <option value="transcript_request">Transcript Request</option>
            <option value="complaint">Complaint</option>
            <option value="administrative">Administrative Request</option>
            <option value="other">Other</option>
          </select>

          <input
            type="text"
            placeholder="Request Title"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            required
          />

          <textarea
            placeholder="Describe your request..."
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            required
          />

          <select value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value})}>
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
            <option value="urgent">Urgent</option>
          </select>

          <button type="submit" className="btn-success">Submit Request</button>
        </form>
      )}

      <div className="filter-controls">
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="filter-select">
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="in_review">In Review</option>
          <option value="completed">Completed</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="requests-list">
        {filteredRequests.length === 0 ? (
          <div className="no-requests">
            <p>📭 No requests found</p>
          </div>
        ) : (
          filteredRequests.map((request) => (
            <div key={request.id} className="request-card" onClick={() => setSelectedRequest(request)}>
              <div className="request-icon">{getTypeIcon(request.type)}</div>
              <div className="request-info">
                <h4>{request.title}</h4>
                <p className="request-type">{request.type.replace(/_/g, ' ')}</p>
                <p className="request-description">{request.description.substring(0, 100)}...</p>
                <div className="request-footer">
                  <span
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(request.status), color: 'white' }}
                  >
                    {request.status.replace(/_/g, ' ')}
                  </span>
                  <span className="priority-badge">{request.priority}</span>
                  <span className="date">{new Date(request.submittedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedRequest && (
        <div className="modal-overlay" onClick={() => setSelectedRequest(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{selectedRequest.title}</h3>
            <div className="modal-details">
              <p><strong>Type:</strong> {selectedRequest.type.replace(/_/g, ' ')}</p>
              <p><strong>Priority:</strong> {selectedRequest.priority}</p>
              <p><strong>Status:</strong> {selectedRequest.status}</p>
              <p><strong>Submitted:</strong> {new Date(selectedRequest.submittedAt).toLocaleDateString()}</p>
              <p><strong>Description:</strong></p>
              <p>{selectedRequest.description}</p>
              {selectedRequest.response && (
                <>
                  <p><strong>Response:</strong></p>
                  <p>{selectedRequest.response}</p>
                </>
              )}
            </div>
            <button onClick={() => setSelectedRequest(null)} className="btn-close">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentRequests;
