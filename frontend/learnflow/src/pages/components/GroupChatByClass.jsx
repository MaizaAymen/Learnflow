import React, { useState, useEffect } from 'react';
import { Modal, Select, Button, Spin, Alert, Space, Divider } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import './GroupChatByClass.scss';

const GroupChatByClass = ({ onCreateGroup, onClose }) => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/reference/classes', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setClasses(data.data || data || []);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!selectedClass) {
      alert('Please select a class');
      return;
    }

    try {
      setLoading(true);
      
      // First, fetch all students in this class from messaging service (which proxies to auth)
      console.log('📋 Fetching students for class:', selectedClass.id);
      const studentsResponse = await fetch(`http://localhost:3001/api/messaging/auth/classes/${selectedClass.id}/students`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      let studentIds = [];
      if (studentsResponse.ok) {
        const students = await studentsResponse.json();
        studentIds = students.map(s => s.id);
        console.log('✅ Found students:', studentIds);
      } else {
        console.warn('⚠️ Could not fetch students:', studentsResponse.status);
      }

      if (studentIds.length === 0) {
        alert('No students found in this class');
        setLoading(false);
        return;
      }

      // Create the group conversation with all students as participants
      console.log('🚀 Creating group conversation with participants:', studentIds);
      const response = await fetch('http://localhost:3001/api/messaging/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          type: 'group',
          group_name: `${selectedClass.nom} - Group Chat`,
          participant_ids: studentIds
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Group chat created successfully:', data);
        alert('Group chat created successfully!');
        onCreateGroup?.(data);
        onClose?.();
      } else {
        const errorData = await response.json();
        console.error('❌ Failed to create group:', errorData);
        alert(`Failed to create group chat: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Error creating group:', error);
      alert('Failed to create group chat: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Create Group Chat by Class"
      open={true}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button 
          key="create" 
          type="primary" 
          onClick={handleCreateGroup}
          disabled={!selectedClass || loading}
          loading={loading}
        >
          Create Group Chat
        </Button>,
      ]}
      centered
    >
      {loading && classes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px' }}>
          <Spin indicator={<LoadingOutlined spin />} />
          <p style={{ marginTop: '16px', color: '#8c8c8c' }}>Loading classes...</p>
        </div>
      ) : classes.length === 0 ? (
        <Alert message="No classes available" type="warning" showIcon />
      ) : (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Select a Class
            </label>
            <Select
              placeholder="Choose a class"
              value={selectedClass?.id || undefined}
              onChange={(value) => {
                const classItem = classes.find(c => c.id === value);
                setSelectedClass(classItem);
              }}
              options={classes.map(classe => ({
                label: classe.nom,
                value: classe.id
              }))}
              style={{ width: '100%' }}
            />
          </div>

          {selectedClass && (
            <>
              <Divider />
              <Alert
                message={`📚 ${selectedClass.nom}`}
                description="👥 All students in this class will be added to the group"
                type="info"
                showIcon
              />
            </>
          )}
        </Space>
      )}
    </Modal>
  );
};

export default GroupChatByClass;
