import React, { useState, useEffect, useRef } from 'react';
import './ChatSupport.css';

const ChatSupport = () => {
  const [chatRooms, setChatRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingContent, setEditingContent] = useState('');
  const messagesEndRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');

  const API_URL = 'http://localhost:3000/api/support/chat-support';

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch chat rooms
  useEffect(() => {
    fetchChatRooms();
    const interval = setInterval(fetchChatRooms, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  // Fetch messages when room changes
  useEffect(() => {
    if (selectedRoom) {
      setAdmin(null);
      fetchMessages();
      const interval = setInterval(fetchMessages, 3000); // Refresh every 3 seconds
      return () => clearInterval(interval);
    }
  }, [selectedRoom]);

  const fetchChatRooms = async () => {
    try {
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
      });
      
      if (response.status === 404) {
        throw new Error('Chat support endpoint not found. Backend may not be running.');
      }
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to fetch rooms: ${response.status} ${errorData}`);
      }
      
      const data = await response.json();
      // Backend returns array directly, not wrapped in .data
      setChatRooms(Array.isArray(data) ? data : (data.data || []));
      setError(null);
    } catch (err) {
      setError(`Could not load chat rooms: ${err.message}`);
      console.error('Error fetching rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!selectedRoom) return;
    try {
      const response = await fetch(`${API_URL}/${selectedRoom.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
      });
      if (!response.ok) throw new Error(`Failed to fetch messages: ${response.status}`);
      const data = await response.json();
      // Backend returns { room, admin, messages } structure
      setAdmin(data.admin);
      setMessages((data.messages || []).filter(msg => !msg.isDeleted));
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  const handlePostMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedRoom) return;

    try {
      const response = await fetch(`${API_URL}/${selectedRoom.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newMessage })
      });

      if (!response.ok) throw new Error('Failed to post message');
      
      setNewMessage('');
      await fetchMessages();
    } catch (err) {
      setError('Failed to post message');
      console.error('Error posting message:', err);
    }
  };

  const handleEditMessage = async (messageId) => {
    if (!editingContent.trim()) return;

    try {
      const response = await fetch(
        `http://localhost:3000/api/support/chat-support/messages/${messageId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ content: editingContent })
        }
      );

      if (!response.ok) throw new Error('Failed to edit message');

      setEditingMessageId(null);
      setEditingContent('');
      await fetchMessages();
    } catch (err) {
      setError('Failed to edit message');
      console.error('Error editing message:', err);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;

    try {
      const response = await fetch(
        `${API_URL}/${selectedRoom.id}/messages/${messageId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ reason: 'Deleted by admin' })
        }
      );

      if (!response.ok) throw new Error('Failed to delete message');

      await fetchMessages();
    } catch (err) {
      setError('Failed to delete message');
      console.error('Error deleting message:', err);
    }
  };

  const handleRestoreMessage = async (messageId) => {
    try {
      const response = await fetch(
        `${API_URL}/${selectedRoom.id}/messages/${messageId}/restore`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        }
      );

      if (!response.ok) throw new Error('Failed to restore message');

      await fetchMessages();
    } catch (err) {
      setError('Failed to restore message');
      console.error('Error restoring message:', err);
    }
  };

  const isAdmin = user.role === 'admin' || user.type === 'admin';

  if (loading) {
    return (
      <div className="chat-support-container">
        <div className="loading">Loading chat rooms...</div>
      </div>
    );
  }

  return (
    <div className="chat-support-container">
      <div className="chat-support-wrapper">
        {/* Chat Rooms List */}
        <div className="chat-rooms-sidebar">
          <h2>Chat Rooms</h2>
          {error && <div className="error-banner">{error}</div>}
          
          <div className="rooms-list">
            {chatRooms.length === 0 ? (
              <div className="no-rooms">No chat rooms available</div>
            ) : (
              chatRooms.map((room) => (
                <div
                  key={room.id}
                  className={`room-item ${selectedRoom?.id === room.id ? 'active' : ''}`}
                  onClick={() => setSelectedRoom(room)}
                >
                  <div className="room-title">{room.title}</div>
                  <div className="room-description">{room.description}</div>
                  {!room.isActive && <div className="room-closed">Closed</div>}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Message Area */}
        <div className="chat-area">
          {selectedRoom ? (
            <>
              <div className="chat-header">
                <div className="header-title-section">
                  <h2>{selectedRoom.title}</h2>
                  <p>{selectedRoom.description}</p>
                </div>

                {/* Admin Contact Card */}
                {admin && (
                  <div className="admin-contact-card">
                    <div className="admin-card-header">
                      <span className="admin-label">Support Admin</span>
                    </div>
                    <div className="admin-details">
                      <div className="admin-name">
                        <strong>👤 {admin.name}</strong>
                      </div>
                      {admin.email && (
                        <div className="admin-email">
                          <span className="icon">✉️</span>
                          <a href={`mailto:${admin.email}`}>{admin.email}</a>
                        </div>
                      )}
                      {admin.phone && (
                        <div className="admin-phone">
                          <span className="icon">📱</span>
                          <a href={`tel:${admin.phone}`}>{admin.phone}</a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="messages-container">
                {messages.length === 0 ? (
                  <div className="no-messages">
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`message ${msg.isDeleted ? 'deleted' : ''} ${
                        msg.userId === user.id ? 'own' : ''
                      }`}
                    >
                      <div className="message-header">
                        <span className="message-author">
                          {msg.userId === user.id ? 'You' : `User ${msg.userId}`}
                        </span>
                        <span className="message-role">
                          [{msg.userRole}]
                        </span>
                        <span className="message-time">
                          {new Date(msg.createdAt).toLocaleString()}
                        </span>
                      </div>

                      {editingMessageId === msg.id ? (
                        <div className="message-edit-form">
                          <textarea
                            value={editingContent}
                            onChange={(e) => setEditingContent(e.target.value)}
                          />
                          <div className="edit-buttons">
                            <button
                              onClick={() => handleEditMessage(msg.id)}
                              className="btn-save"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingMessageId(null)}
                              className="btn-cancel"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="message-content">
                            {msg.isDeleted ? (
                              <em>
                                Message deleted
                                {msg.deletionReason && ` - ${msg.deletionReason}`}
                              </em>
                            ) : (
                              <>
                                {msg.content}
                                {msg.isEdited && (
                                  <span className="edited-flag"> [edited]</span>
                                )}
                              </>
                            )}
                          </div>

                          {!msg.isDeleted && isAdmin && (
                            <div className="message-actions">
                              <button
                                onClick={() => {
                                  setEditingMessageId(msg.id);
                                  setEditingContent(msg.content);
                                }}
                                className="btn-edit"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteMessage(msg.id)}
                                className="btn-delete"
                              >
                                Delete
                              </button>
                            </div>
                          )}

                          {msg.isDeleted && isAdmin && (
                            <div className="message-actions">
                              <button
                                onClick={() => handleRestoreMessage(msg.id)}
                                className="btn-restore"
                              >
                                Restore
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {selectedRoom.isActive && (
                <form onSubmit={handlePostMessage} className="message-input-form">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message here... (visible to everyone)"
                    className="message-input"
                  />
                  <button type="submit" className="btn-send">
                    Send
                  </button>
                </form>
              )}

              {!selectedRoom.isActive && (
                <div className="room-closed-notice">
                  This chat room is closed and not accepting new messages.
                </div>
              )}
            </>
          ) : (
            <div className="no-room-selected">
              <p>Select a chat room to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatSupport;
