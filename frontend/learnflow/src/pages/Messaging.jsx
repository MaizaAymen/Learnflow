import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Layout, Button, Badge, Spin, Empty, Space, Tooltip } from 'antd';
import { MessageOutlined, TeamOutlined, LoadingOutlined } from '@ant-design/icons';
import './Messaging.scss';
import ConversationList from './components/ConversationList';
import ChatBox from './components/ChatBox';
import SearchUsers from './components/SearchUsers';
import GroupChatByClass from './components/GroupChatByClass';

const Messaging = () => {
  const [socket, setSocket] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [showSearchUsers, setShowSearchUsers] = useState(false);
  const [showGroupChat, setShowGroupChat] = useState(false);
  const socketRef = useRef(null);

  // Initialize socket connection
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found');
      return;
    }

    const messagingUrl = import.meta.env.VITE_MESSAGING_URL || 'http://localhost:3001';
    
    const newSocket = io(messagingUrl, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    newSocket.on('connect', () => {
      console.log('✅ Connected to messaging service');
    });

    newSocket.on('user_online', (data) => {
      setOnlineUsers(prev => new Set([...prev, data.user_id]));
    });

    newSocket.on('user_offline', (data) => {
      setOnlineUsers(prev => {
        const updated = new Set(prev);
        updated.delete(data.user_id);
        return updated;
      });
    });

    newSocket.on('new_message', (message) => {
      // Update the message in the selected conversation
      if (selectedConversation?.id === message.conversation_id) {
        // Message will be handled by ChatBox component
      }
      // Refresh conversations list to update last message
      fetchConversations();
      // Increment unread count
      setUnreadCount(prev => prev + 1);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Disconnected from messaging service');
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [selectedConversation]);

  // Fetch conversations on mount
  useEffect(() => {
    fetchConversations();
    fetchUnreadCount();

    // Set up auto-refresh of conversations every 5 seconds
    const interval = setInterval(() => {
      fetchConversations();
      fetchUnreadCount();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/messaging/conversations', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setConversations(data.conversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/messaging/unread-count', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setUnreadCount(data.unread_count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    // Join the conversation room
    socket?.emit('join_conversation', { conversation_id: conversation.id });
  };

  const handleCreateConversation = async (userId) => {
    try {
      const response = await fetch('http://localhost:3001/api/messaging/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          type: 'direct',
          participant_ids: [userId]
        })
      });
      const data = await response.json();
      
      // Fetch updated conversations
      await fetchConversations();
      
      // Select the new conversation
      setSelectedConversation({ id: data.id });
      setShowSearchUsers(false);
      
      // Join the conversation room
      socket?.emit('join_conversation', { conversation_id: data.id });
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  return (
    <Layout className="messaging-container">
      {!socket ? (
        <div className="messaging-loading">
          <Spin indicator={<LoadingOutlined spin />} size="large" />
          <p style={{ marginTop: '16px', color: '#8c8c8c' }}>Connecting to messaging service...</p>
          <p style={{ fontSize: '12px', color: '#bfbfbf' }}>Make sure the backend is running on port 3001</p>
        </div>
      ) : (
        <Layout hasSider>
          <Layout.Sider width={320} className="messaging-sider">
            <div className="messaging-header">
              <div className="header-title">
                <MessageOutlined className="header-icon" />
                <span>Messages</span>
                {unreadCount > 0 && (
                  <Badge count={unreadCount} style={{ backgroundColor: '#ff4d4f' }} />
                )}
              </div>
              <Space size="small">
                <Tooltip title="Start direct message">
                  <Button 
                    type="text"
                    icon={<MessageOutlined />}
                    onClick={() => setShowSearchUsers(!showSearchUsers)}
                    className="action-btn"
                  />
                </Tooltip>
                <Tooltip title="Create group chat">
                  <Button 
                    type="text"
                    icon={<TeamOutlined />}
                    onClick={() => setShowGroupChat(true)}
                    className="action-btn"
                  />
                </Tooltip>
              </Space>
            </div>

            {showSearchUsers ? (
              <SearchUsers 
                onSelectUser={handleCreateConversation}
                onClose={() => setShowSearchUsers(false)}
              />
            ) : showGroupChat ? (
              <GroupChatByClass 
                onCreateGroup={async (group) => {
                  await new Promise(resolve => setTimeout(resolve, 500));
                  await fetchConversations();
                  setSelectedConversation(group);
                  setShowGroupChat(false);
                }}
                onClose={() => setShowGroupChat(false)}
              />
            ) : (
              <ConversationList 
                conversations={conversations}
                selectedConversation={selectedConversation}
                onSelectConversation={handleSelectConversation}
                onlineUsers={onlineUsers}
                onRefresh={fetchConversations}
              />
            )}
          </Layout.Sider>

          <Layout.Content className="messaging-main">
            {selectedConversation ? (
              <ChatBox 
                conversation={selectedConversation}
                socket={socket}
                onlineUsers={onlineUsers}
                onRefresh={fetchConversations}
              />
            ) : (
              <div className="messaging-empty">
                <Empty description="Select a conversation to start messaging" />
              </div>
            )}
          </Layout.Content>
        </Layout>
      )}
    </Layout>
  );
};

export default Messaging;
