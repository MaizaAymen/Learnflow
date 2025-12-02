/**
 * BookUpload Component - Admin can upload books to library
 * Path: frontend/learnflow/src/admin/BookUpload.jsx
 */

import React, { useState, useCallback } from 'react';
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Upload,
  message,
  Spin,
  Tag,
  Alert,
  Row,
  Col,
  Space
} from 'antd';
import { InboxOutlined, CheckCircleOutlined } from '@ant-design/icons';

const API_BASE = 'http://localhost:3000/api';

const BookUpload = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [categories, setCategories] = useState([]);
  const [uploadedBook, setUploadedBook] = useState(null);
  const [fileList, setFileList] = useState([]);

  React.useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/library/categories`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setCategories(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleUpload = useCallback(async (values) => {
    try {
      setLoading(true);
      setUploadProgress(0);

      if (fileList.length === 0) {
        message.error('Please select a file to upload');
        return;
      }

      const formData = new FormData();
      formData.append('file', fileList[0].originFileObj);
      formData.append('title', values.title);
      formData.append('author', values.author);
      formData.append('description', values.description);
      formData.append('isbn', values.isbn);
      formData.append('category', values.category || 'General');

      const token = localStorage.getItem('token');
      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setUploadProgress(percentComplete);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 201) {
          const response = JSON.parse(xhr.responseText);
          setUploadedBook(response.data);
          message.success('Book uploaded successfully!');
          form.resetFields();
          setFileList([]);
          setUploadProgress(0);
        } else {
          message.error('Failed to upload book');
        }
        setLoading(false);
      });

      xhr.addEventListener('error', () => {
        message.error('Upload failed');
        setLoading(false);
      });

      xhr.open('POST', `${API_BASE}/library/books`);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(formData);
    } catch (error) {
      console.error('Error uploading book:', error);
      message.error('Failed to upload book');
      setLoading(false);
    }
  }, [fileList, form]);

  const uploadProps = {
    name: 'file',
    multiple: false,
    maxCount: 1,
    fileList,
    onChange: (info) => {
      setFileList(info.fileList);
    },
    beforeUpload: (file) => {
      const allowedTypes = ['application/pdf', 'application/epub+zip', 'text/plain'];
      const isValidType = allowedTypes.includes(file.type);

      if (!isValidType) {
        message.error('Only PDF, EPUB, and TXT files are allowed');
        return false;
      }

      const isSmallEnough = file.size / 1024 / 1024 < 100;
      if (!isSmallEnough) {
        message.error('File must be less than 100MB');
        return false;
      }

      return false; // Don't auto upload, handle manually
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title="Upload New Book"
        extra={<Tag color="blue">Admin Only</Tag>}
        style={{ maxWidth: '800px', margin: '0 auto' }}
      >
        {uploadedBook && (
          <Alert
            message="Book uploaded successfully!"
            type="success"
            icon={<CheckCircleOutlined />}
            style={{ marginBottom: '24px' }}
            closable
            onClose={() => setUploadedBook(null)}
            description={
              <Space direction="vertical" size={0}>
                <span><strong>Title:</strong> {uploadedBook.title}</span>
                <span><strong>Author:</strong> {uploadedBook.author}</span>
                <span><strong>File:</strong> {uploadedBook.file_name}</span>
                <span><strong>Size:</strong> {(uploadedBook.file_size / 1024 / 1024).toFixed(2)} MB</span>
              </Space>
            }
          />
        )}

        <Spin spinning={loading} tip={uploadProgress > 0 ? `Uploading... ${Math.round(uploadProgress)}%` : 'Processing...'}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleUpload}
            disabled={loading}
          >
            <Form.Item
              name="title"
              label="Book Title"
              rules={[{ required: true, message: 'Title is required' }]}
            >
              <Input
                placeholder="Enter book title"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="author"
              label="Author"
            >
              <Input
                placeholder="Enter author name"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="isbn"
              label="ISBN (Optional)"
            >
              <Input
                placeholder="Enter ISBN"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="category"
              label="Category"
              initialValue="General"
            >
              <Select
                placeholder="Select category"
                size="large"
                options={[
                  { label: 'General', value: 'General' },
                  { label: 'Mathematics', value: 'Mathematics' },
                  { label: 'Physics', value: 'Physics' },
                  { label: 'Chemistry', value: 'Chemistry' },
                  { label: 'Biology', value: 'Biology' },
                  { label: 'Computer Science', value: 'Computer Science' },
                  { label: 'Literature', value: 'Literature' },
                  { label: 'History', value: 'History' },
                  { label: 'Geography', value: 'Geography' },
                  ...categories.map(cat => ({ label: cat.name, value: cat.name }))
                ]}
              />
            </Form.Item>

            <Form.Item
              name="description"
              label="Description"
            >
              <Input.TextArea
                rows={4}
                placeholder="Enter book description"
              />
            </Form.Item>

            <Form.Item
              label="Book File"
              rules={[{ required: true, message: 'Please upload a file' }]}
            >
              <Upload.Dragger {...uploadProps}>
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">Click or drag file to this area to upload</p>
                <p className="ant-upload-hint">
                  Supported formats: PDF, EPUB, TXT (Max 100MB)
                </p>
                {fileList.length > 0 && (
                  <p style={{ marginTop: '12px', color: '#52c41a' }}>
                    Selected: {fileList[0].name} ({(fileList[0].size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </Upload.Dragger>
            </Form.Item>

            <Form.Item>
              <Row gutter={16}>
                <Col span={12}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    size="large"
                    loading={loading}
                    disabled={fileList.length === 0}
                  >
                    Upload Book
                  </Button>
                </Col>
                <Col span={12}>
                  <Button
                    onClick={() => {
                      form.resetFields();
                      setFileList([]);
                      setUploadProgress(0);
                    }}
                    block
                    size="large"
                  >
                    Clear
                  </Button>
                </Col>
              </Row>
            </Form.Item>
          </Form>
        </Spin>
      </Card>
    </div>
  );
};

export default BookUpload;
