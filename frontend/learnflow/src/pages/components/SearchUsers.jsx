import React, { useState, useEffect } from 'react';
import { Input, List, Avatar, Button, Empty, Spin, Space, Tag } from 'antd';
import { SearchOutlined, CloseOutlined, LoadingOutlined } from '@ant-design/icons';
import './SearchUsers.scss';

const SearchUsers = ({ onSelectUser, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(() => {
      searchUsers();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const searchUsers = async () => {
    if (searchQuery.length < 2) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3001/api/messaging/search-users?query=${encodeURIComponent(searchQuery)}&limit=10`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectUser = (userId) => {
    onSelectUser(userId);
  };

  return (
    <div className="search-users">
      <div className="search-header">
        <Input
          placeholder="Search users..."
          prefix={<SearchOutlined />}
          suffix={<CloseOutlined onClick={onClose} style={{ cursor: 'pointer' }} />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          autoFocus
          size="large"
        />
      </div>

      <div className="search-results">
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '32px 16px' }}>
            <Spin indicator={<LoadingOutlined spin />} />
            <p style={{ marginTop: '16px', color: '#8c8c8c' }}>Searching...</p>
          </div>
        ) : searchQuery.length < 2 ? (
          <Empty description="Type at least 2 characters to search" style={{ marginTop: '32px' }} />
        ) : searchResults.length === 0 ? (
          <Empty description="No users found" style={{ marginTop: '32px' }} />
        ) : (
          <List
            dataSource={searchResults}
            renderItem={(user) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar>{user.nom[0]}{user.prenom[0]}</Avatar>}
                  title={`${user.nom} ${user.prenom}`}
                  description={
                    <Space direction="vertical" size={0}>
                      <span>{user.email}</span>
                      <Tag color="blue" style={{ marginTop: '4px' }}>{user.role}</Tag>
                    </Space>
                  }
                />
                <Button 
                  type="primary" 
                  onClick={() => handleSelectUser(user.id)}
                >
                  Message
                </Button>
              </List.Item>
            )}
          />
        )}
      </div>
    </div>
  );
};

export default SearchUsers;
