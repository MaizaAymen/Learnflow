import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Input, Empty, Spin, Tag, Space, Divider } from 'antd';
import { SendOutlined, LoadingOutlined } from '@ant-design/icons';
import './ChatBox.scss';

const ChatBox = ({ conversation, socket, onlineUsers, onRefresh }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [otherUser, setOtherUser] = useState(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Fetch messages
  useEffect(() => {
    if (!conversation?.id) return;
    
    fetchMessages();
  }, [conversation?.id]);

  // Fetch other user info
  useEffect(() => {
    if (!conversation?.other_user_id) return;

    const fetchOtherUser = async () => {
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
          setOtherUser(user);
        }
      } catch (error) {
        console.error('Error fetching other user:', error);
      }
    };

    fetchOtherUser();
  }, [conversation?.other_user_id]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Listen for new messages from socket
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message) => {
      console.log('📨 Socket new_message event received:', message, 'for conversation:', conversation?.id);
      if (message.conversation_id === conversation?.id) {
        console.log('✅ Message is for current conversation, adding to messages');
        setMessages(prev => [...prev, message]);
        onRefresh?.();
      } else {
        console.log('❌ Message is for different conversation');
      }
    };

    socket.on('new_message', handleNewMessage);
    return () => socket.off('new_message', handleNewMessage);
  }, [socket, conversation?.id, onRefresh]);

  const fetchMessages = async () => {
    if (!conversation?.id || isLoadingMessages) return;

    setIsLoadingMessages(true);
    try {
      const response = await fetch(
        `http://localhost:3001/api/messaging/conversations/${conversation.id}/messages?page=${page}&limit=30`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      const data = await response.json();
      
      if (page === 1) {
        setMessages(data.messages);
      } else {
        setMessages(prev => [...data.messages, ...prev]);
      }
      
      setHasMore(data.pagination.page < data.pagination.pages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim() || !conversation?.id) return;

    const content = newMessage.trim();
    setNewMessage('');

    // Emit via socket for real-time (this will be saved to DB by backend)
    socket?.emit('send_message', {
      conversation_id: conversation.id,
      content
    });

    console.log('📤 Message sent via socket:', content);
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);

    // Emit typing event
    if (!isTyping) {
      socket?.emit('typing', { conversation_id: conversation?.id });
      setIsTyping(true);
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing after 3 seconds
    typingTimeoutRef.current = setTimeout(() => {
      socket?.emit('stop_typing', { conversation_id: conversation?.id });
      setIsTyping(false);
    }, 3000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScroll = async () => {
    const container = messagesContainerRef.current;
    if (container.scrollTop === 0 && hasMore && !isLoadingMessages) {
      setPage(prev => prev + 1);
      // Fetch more messages
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const currentUserId = (() => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      return user?.id;
    } catch (e) {
      console.error('Error parsing user from localStorage:', e);
      return null;
    }
  })();

  return (
    <Card className="chat-box" bordered={false}>
      {/* Chat Header */}
      <div className="chat-header">
        <div className="chat-header-left">
          <h2 className="chat-title">
            {conversation?.group_name || (otherUser ? `${otherUser.prenom} ${otherUser.nom}` : 'Conversation')}
          </h2>
          {conversation?.group_name ? (
            <Tag color="blue">Group Chat</Tag>
          ) : (
            <Tag color={onlineUsers.has(conversation?.other_user_id) ? 'green' : 'default'}>
              {onlineUsers.has(conversation?.other_user_id) ? 'Online' : 'Offline'}
            </Tag>
          )}
        </div>
      </div>
      <Divider style={{ margin: '12px 0' }} />

      {/* Messages Container */}
      <div className="messages-container" ref={messagesContainerRef} onScroll={handleScroll}>
        {isLoadingMessages && page > 1 && (
          <div className="loading" style={{ textAlign: 'center', padding: '16px' }}>
            <Spin size="small" />
          </div>
        )}
        
        {messages.length === 0 ? (
          <Empty description="No messages yet" style={{ marginTop: '48px' }} />
        ) : (
          <>
            {messages.map((message, index) => {
              const isOwn = Number(message.sender_id) === Number(currentUserId);
              const showDateSeparator = index === 0 || formatDate(messages[index - 1]?.created_at) !== formatDate(message.created_at);

              return (
                <div key={message.id}>
                  {showDateSeparator && (
                    <div className="date-separator">
                      {formatDate(message.created_at)}
                    </div>
                  )}
                  <div className={`message-row ${isOwn ? 'own' : 'other'}`}>
                    <div className="message-bubble">
                      <p className="message-content">{message.content}</p>
                      <Space size="small" className="message-footer">
                        <span className="time">{formatTime(message.created_at)}</span>
                        {isOwn && (
                          <span className="read-status">
                            {message.is_read ? '✓✓' : '✓'}
                          </span>
                        )}
                      </Space>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <Divider style={{ margin: '12px 0' }} />
      <form className="message-input-form" onSubmit={sendMessage}>
        <Space.Compact style={{ width: '100%' }}>
          <Input
            type="text"
            value={newMessage}
            onChange={handleTyping}
            placeholder="Type a message..."
            className="message-input"
            autoFocus
            disabled={!conversation?.id}
          />
          <Button 
            type="primary" 
            htmlType="submit" 
            disabled={!newMessage.trim()} 
            icon={<SendOutlined />}
          >
            Send
          </Button>
        </Space.Compact>
      </form>
    </Card>
  );
};

export default ChatBox;