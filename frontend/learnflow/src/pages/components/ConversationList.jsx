import React, { useState, useEffect } from 'react';
import { List, Badge, Tag, Tooltip, Popover, Button, Space, Empty, Avatar } from 'antd';
import { DeleteOutlined, LogoutOutlined, UserOutlined, TeamOutlined } from '@ant-design/icons';
import './ConversationList.scss';

const ConversationList = ({ conversations, selectedConversation, onSelectConversation, onlineUsers, onRefresh }) => {
  const [conversationNames, setConversationNames] = useState({});
  const [conversationAvatars, setConversationAvatars] = useState({});

  // Fetch user info for direct conversations
  useEffect(() => {
    const fetchUserInfo = async () => {
      const names = {};
      const avatars = {};
      
      for (const conversation of conversations) {
        if (conversation.type === 'direct' && conversation.other_user_id && !names[conversation.id]) {
          try {
            const response = await fetch(
              `http://localhost:3001/api/messaging/user/${conversation.other_user_id}`,
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem('token')}`
                }
              }
            );
            if (response.ok) {
              const user = await response.json();
              names[conversation.id] = `${user.prenom} ${user.nom}`;
              // Create avatar data with DiceBear URL
              avatars[conversation.id] = {
                name: `${user.prenom} ${user.nom}`,
                firstName: user.prenom,
                lastName: user.nom,
                avatarUrl: `https://api.dicebear.com/7.x/miniavs/svg?seed=${conversation.other_user_id}`
              };
            }
          } catch (error) {
            console.error('Error fetching user info:', error);
          }
        } else if (conversation.group_name && !avatars[conversation.id]) {
          // For group chats, create group avatar data with DiceBear URL
          avatars[conversation.id] = {
            name: conversation.group_name,
            isGroup: true,
            avatarUrl: `https://api.dicebear.com/7.x/miniavs/svg?seed=${conversation.id}`
          };
        }
      }
      
      setConversationNames(names);
      setConversationAvatars(avatars);
    };

    if (conversations.length > 0) {
      fetchUserInfo();
    }
  }, [conversations]);

  const renderAvatar = (conversation) => {
    const avatarData = conversationAvatars[conversation.id];
    
    if (!avatarData) {
      return (
        <Avatar 
          size="large"
          src="https://api.dicebear.com/7.x/miniavs/svg?seed=default"
          style={{ 
            border: '2px solid #fff',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}
        />
      );
    }

    return (
      <Avatar 
        size="large"
        src={avatarData.avatarUrl}
        style={{ 
          border: '2px solid #fff',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
        }}
      />
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else if (date.getFullYear() === today.getFullYear()) {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  const truncateMessage = (message, maxLength = 50) => {
    if (!message) return 'No messages yet';
    return message.length > maxLength ? `${message.substring(0, maxLength)}...` : message;
  };

  const handleDeleteConversation = async (conversationId) => {
    if (window.confirm('Delete this conversation?')) {
      try {
        const response = await fetch(`http://localhost:3001/api/messaging/conversations/${conversationId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          console.log('✅ Conversation deleted successfully');
          onRefresh?.();
        } else {
          alert('Failed to delete conversation');
        }
      } catch (error) {
        console.error('Error deleting conversation:', error);
        alert('Error deleting conversation');
      }
    }
  };

  const handleLeaveGroup = async (conversationId) => {
    if (window.confirm('Leave this group chat?')) {
      try {
        const response = await fetch(`http://localhost:3001/api/messaging/conversations/${conversationId}/leave`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          console.log('✅ Left group successfully');
          onRefresh?.();
        } else {
          alert('Failed to leave group');
        }
      } catch (error) {
        console.error('Error leaving group:', error);
        alert('Error leaving group');
      }
    }
  };

  return (
    <div className="conversation-list">
      {conversations.length === 0 ? (
        <Empty description="No conversations yet" style={{ marginTop: '48px' }} />
      ) : (
        <List
          dataSource={conversations}
          renderItem={(conversation) => (
            <Popover
              content={
                <Space direction="vertical" size="small">
                  {conversation.group_name ? (
                    <>
                      <Button 
                        type="primary" 
                        danger 
                        icon={<LogoutOutlined />}
                        size="small"
                        onClick={() => handleLeaveGroup(conversation.id)}
                      >
                        Leave Group
                      </Button>
                      <Button 
                        danger 
                        icon={<DeleteOutlined />}
                        size="small"
                        onClick={() => handleDeleteConversation(conversation.id)}
                      >
                        Delete
                      </Button>
                    </>
                  ) : (
                    <Button 
                      danger 
                      icon={<DeleteOutlined />}
                      size="small"
                      onClick={() => handleDeleteConversation(conversation.id)}
                    >
                      Delete
                    </Button>
                  )}
                </Space>
              }
              trigger="contextMenu"
            >
              <List.Item
                className={`conversation-item ${selectedConversation?.id === conversation.id ? 'active' : ''}`}
                onClick={() => onSelectConversation(conversation)}
              >
                <List.Item.Meta
                  avatar={
                    <Badge 
                      count={conversation.unread_count > 0 ? conversation.unread_count : 0}
                      style={{ backgroundColor: '#ff4d4f' }}
                      offset={[-5, 5]}
                    >
                      {renderAvatar(conversation)}
                    </Badge>
                  }
                  title={
                    <div className="conversation-header">
                      <span className="conversation-name">
                        {conversation.group_name || conversationNames[conversation.id] || 'Loading...'}
                      </span>
                      {onlineUsers.has(conversation.other_user_id) && !conversation.group_name && (
                        <Tag color="green" style={{ marginLeft: '8px', fontSize: '12px' }}>Online</Tag>
                      )}
                    </div>
                  }
                  description={
                    <p className={`last-message ${conversation.unread_count > 0 ? 'unread' : ''}`}>
                      {truncateMessage(conversation.last_message)}
                    </p>
                  }
                />
                <div className="conversation-time">
                  {formatDate(conversation.last_message_at)}
                </div>
              </List.Item>
            </Popover>
          )}
        />
      )}
    </div>
  );
};

export default ConversationList;