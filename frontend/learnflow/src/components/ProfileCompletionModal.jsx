import React, { useState } from 'react';
import { Modal, Form, Upload, Button, Result, Spin, message } from 'antd';
import { UploadOutlined, PictureOutlined } from '@ant-design/icons';

const ProfileCompletionModal = ({ userId, userName, onComplete }) => {
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [form] = Form.useForm();

  const handleUpload = async () => {
    try {
      if (fileList.length === 0) {
        message.error('Please select a photo');
        return;
      }

      setLoading(true);

      const formData = new FormData();
      formData.append('photo', fileList[0].originFileObj);
      formData.append('userId', userId);

      const response = await fetch(`${import.meta.env.VITE_AUTH_URL?.replace('/auth', '') || 'http://localhost:3000'}/api/auth/upload-profile-photo`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        setCompleted(true);
        message.success('Profile completed successfully!');
        
        // Update localStorage with profile completion status
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        user.profile_completed = true;
        user.image = data.user.image;
        localStorage.setItem('user', JSON.stringify(user));

        // Call parent callback after 2 seconds to show success message
        setTimeout(() => {
          onComplete();
        }, 2000);
      } else {
        message.error(data.error || 'Failed to upload profile photo');
      }
    } catch (error) {
      console.error('Error uploading profile:', error);
      message.error('Error uploading profile photo');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = ({ fileList: newFileList }) => {
    // Only keep the last selected file
    setFileList(newFileList.slice(-1));
  };

  if (completed) {
    return (
      <Modal
        title="Profile Completion"
        open={true}
        closable={false}
        footer={null}
        centered
        width={500}
      >
        <Result
          status="success"
          title="Profile Completed!"
          subTitle={`Welcome ${userName}! Your profile has been set up. You can now access all features of Learnflow.`}
        />
      </Modal>
    );
  }

  return (
    <Modal
      title="Complete Your Profile"
      open={true}
      closable={false}
      footer={[
        <Button key="submit" type="primary" loading={loading} onClick={handleUpload} size="large">
          Upload & Complete Profile
        </Button>
      ]}
      centered
      width={500}
      maskClosable={false}
    >
      <Spin spinning={loading}>
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <PictureOutlined style={{ fontSize: '48px', color: '#667eea', marginBottom: '20px', display: 'block' }} />
          <p style={{ color: '#666', marginBottom: '24px' }}>
            Welcome <strong>{userName}</strong>! To get started, please upload a profile photo.
          </p>

          <Form form={form} layout="vertical">
            <Form.Item
              label="Profile Photo"
              name="photo"
              rules={[{ required: true, message: 'Please upload a profile photo' }]}
            >
              <Upload
                listType="picture"
                fileList={fileList}
                onChange={handleFileChange}
                beforeUpload={(file) => {
                  // Validate file type
                  const isImage = file.type.startsWith('image/');
                  if (!isImage) {
                    message.error('You can only upload image files');
                    return false;
                  }
                  // Validate file size (max 5MB)
                  const isSmall = file.size / 1024 / 1024 < 5;
                  if (!isSmall) {
                    message.error('Image must be smaller than 5MB');
                    return false;
                  }
                  return false; // Prevent auto-upload
                }}
                maxCount={1}
                accept="image/*"
              >
                <Button icon={<UploadOutlined />} size="large" block>
                  Click to Upload Profile Photo
                </Button>
              </Upload>
            </Form.Item>
          </Form>

          {fileList.length > 0 && (
            <div style={{ marginTop: '20px', color: '#28a745' }}>
              ✅ Photo selected: {fileList[0].name}
            </div>
          )}

          <p style={{ color: '#999', fontSize: '12px', marginTop: '20px' }}>
            Accepted formats: JPG, PNG, GIF (Max 5MB)
          </p>
        </div>
      </Spin>
    </Modal>
  );
};

export default ProfileCompletionModal;
