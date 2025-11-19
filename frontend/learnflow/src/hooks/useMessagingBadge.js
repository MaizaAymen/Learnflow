import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const useMessagingBadge = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Initialize socket
    const newSocket = io(process.env.REACT_APP_MESSAGING_URL || 'http://localhost:3001', {
      auth: { token },
      reconnection: true
    });

    newSocket.on('new_message', () => {
      fetchUnreadCount();
    });

    setSocket(newSocket);

    // Fetch initial unread count
    fetchUnreadCount();

    return () => {
      newSocket.close();
    };
  }, []);

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

  return { unreadCount, socket };
};

export default useMessagingBadge;
