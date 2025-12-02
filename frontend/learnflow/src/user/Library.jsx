/**
 * Library Component - Users can browse, download, and rate books
 * Path: frontend/learnflow/src/user/Library.jsx
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Row,
  Col,
  Input,
  Select,
  Button,
  Table,
  Modal,
  Form,
  Rate,
  Spin,
  Empty,
  Space,
  Tag,
  Drawer,
  List,
  Avatar,
  Divider,
  message,
  Tabs,
  Badge
} from 'antd';
import {
  DownloadOutlined,
  StarOutlined,
  StarFilled,
  SearchOutlined
} from '@ant-design/icons';

const API_BASE = 'http://localhost:3000/api';

const Library = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [feedbackModal, setFeedbackModal] = useState(false);
  const [feedbackForm] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [downloadingId, setDownloadingId] = useState(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  useEffect(() => {
    fetchBooks();
    fetchCategories();
  }, []);

  const fetchBooks = useCallback(async (search = '', category = null) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      let url = `${API_BASE}/library/books`;
      const params = new URLSearchParams();
      
      if (search) params.append('search', search);
      if (category) params.append('category', category);
      
      if (params.toString()) url += `?${params.toString()}`;

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setBooks(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching books:', error);
      message.error('Failed to load books');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/library/categories`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setCategories([
          { id: 'all', name: 'All Categories' },
          ...data.data
        ]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSearch = (value) => {
    setSearchText(value);
    fetchBooks(value, selectedCategory);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category === 'all' ? null : category);
    fetchBooks(searchText, category === 'all' ? null : category);
  };

  const viewBookDetails = async (bookId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/library/books/${bookId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedBook(data.data);
        setDrawerVisible(true);
      }
    } catch (error) {
      console.error('Error fetching book details:', error);
      message.error('Failed to load book details');
    }
  };

  const handleDownload = async (bookId) => {
    try {
      setDownloadingId(bookId);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE}/library/download/${bookId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const blob = await response.blob();
        const book = books.find(b => b.id === bookId);
        const filename = book ? `${book.title}.pdf` : 'document.pdf';
        
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        message.success('Book downloaded successfully');
      } else {
        message.error('Failed to download book');
      }
    } catch (error) {
      console.error('Error downloading book:', error);
      message.error('Download failed');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleFeedbackSubmit = async (values) => {
    try {
      setFeedbackLoading(true);
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_BASE}/library/feedback/${selectedBook.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          rating: values.rating,
          comment: values.comment
        })
      });

      if (response.ok) {
        message.success('Feedback submitted successfully');
        setFeedbackModal(false);
        feedbackForm.resetFields();
        // Refresh book details
        viewBookDetails(selectedBook.id);
      } else {
        message.error('Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      message.error('Failed to submit feedback');
    } finally {
      setFeedbackLoading(false);
    }
  };

  const tableColumns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      width: '25%',
      render: (text) => <strong>{text}</strong>
    },
    {
      title: 'Author',
      dataIndex: 'author',
      key: 'author',
      width: '20%',
      render: (text) => text || '-'
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: '15%',
      render: (text) => <Tag color="blue">{text}</Tag>
    },
    {
      title: 'Rating',
      dataIndex: 'average_rating',
      key: 'rating',
      width: '12%',
      render: (rating) => (
        <Space size="small">
          {rating ? (
            <>
              <Rate disabled value={Math.round(rating)} style={{ fontSize: '12px' }} />
              <span>{rating.toFixed(1)}</span>
            </>
          ) : (
            <span style={{ color: '#ccc' }}>Not rated</span>
          )}
        </Space>
      )
    },
    {
      title: 'Downloads',
      dataIndex: 'download_count',
      key: 'downloads',
      width: '10%',
      render: (count) => <Badge count={count} showZero style={{ backgroundColor: '#52c41a' }} />
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '18%',
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<DownloadOutlined />}
            loading={downloadingId === record.id}
            onClick={() => handleDownload(record.id)}
          >
            Download
          </Button>
          <Button
            size="small"
            onClick={() => viewBookDetails(record.id)}
          >
            Details
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title={
          <span>📚 Digital Library</span>
        }
        extra={
          <Space>
            <Input.Search
              placeholder="Search books..."
              style={{ width: '250px' }}
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
            />
            <Select
              style={{ width: '200px' }}
              placeholder="Filter by category"
              onChange={handleCategoryChange}
              options={categories.map(cat => ({
                label: cat.name,
                value: cat.id === 'all' ? 'all' : cat.name
              }))}
              defaultValue="all"
            />
          </Space>
        }
      >
        <Spin spinning={loading} tip="Loading books...">
          {books.length === 0 ? (
            <Empty description="No books found" />
          ) : (
            <Table
              columns={tableColumns}
              dataSource={books}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                total: books.length
              }}
              scroll={{ x: 1200 }}
            />
          )}
        </Spin>
      </Card>

      {/* Book Details Drawer */}
      <Drawer
        title="Book Details"
        onClose={() => {
          setDrawerVisible(false);
          setSelectedBook(null);
        }}
        open={drawerVisible}
        width={500}
      >
        {selectedBook && (
          <Spin spinning={false}>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <h2>{selectedBook.title}</h2>
                <p style={{ color: '#666' }}>
                  <strong>Author:</strong> {selectedBook.author || 'Unknown'}
                </p>
                <p>
                  <Tag color="blue">{selectedBook.category}</Tag>
                </p>
              </div>

              <Divider />

              <div>
                <h4>Description</h4>
                <p>{selectedBook.description || 'No description provided'}</p>
              </div>

              <div>
                <h4>Book Information</h4>
                <Space direction="vertical" size="small">
                  <p><strong>ISBN:</strong> {selectedBook.isbn || '-'}</p>
                  <p><strong>File Size:</strong> {((selectedBook.file_size || 0) / 1024 / 1024).toFixed(2)} MB</p>
                  <p><strong>Uploaded by:</strong> {selectedBook.uploader_name || 'Admin'}</p>
                  <p><strong>Downloads:</strong> {selectedBook.download_count || 0}</p>
                </Space>
              </div>

              <Divider />

              <div>
                <Space style={{ width: '100%' }}>
                  <Rate disabled value={Math.round(selectedBook.average_rating || 0)} />
                  <span>{selectedBook.average_rating ? selectedBook.average_rating.toFixed(1) : 'Not rated'}</span>
                  <span style={{ color: '#999' }}>({selectedBook.feedback_count || 0} reviews)</span>
                </Space>
              </div>

              <Button
                type="primary"
                block
                size="large"
                icon={<DownloadOutlined />}
                loading={downloadingId === selectedBook.id}
                onClick={() => handleDownload(selectedBook.id)}
              >
                Download Book
              </Button>

              <Button
                block
                size="large"
                icon={<StarOutlined />}
                onClick={() => setFeedbackModal(true)}
              >
                Leave Feedback
              </Button>

              {selectedBook.feedback && selectedBook.feedback.length > 0 && (
                <>
                  <Divider />
                  <h4>User Reviews ({selectedBook.feedback.length})</h4>
                  <List
                    dataSource={selectedBook.feedback}
                    renderItem={(feedback) => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<Avatar>{feedback.user_name?.charAt(0) || 'U'}</Avatar>}
                          title={
                            <Space>
                              <span>{feedback.user_name} {feedback.user_first_name}</span>
                              <Rate disabled value={feedback.rating} style={{ fontSize: '12px' }} />
                            </Space>
                          }
                          description={feedback.comment}
                        />
                      </List.Item>
                    )}
                  />
                </>
              )}
            </Space>
          </Spin>
        )}
      </Drawer>

      {/* Feedback Modal */}
      <Modal
        title="Leave Your Feedback"
        open={feedbackModal}
        onCancel={() => setFeedbackModal(false)}
        footer={null}
      >
        <Form
          form={feedbackForm}
          layout="vertical"
          onFinish={handleFeedbackSubmit}
        >
          <Form.Item
            name="rating"
            label="Rating"
            rules={[{ required: true, message: 'Please rate this book' }]}
          >
            <Rate
              tooltips={['Terrible', 'Bad', 'Normal', 'Good', 'Excellent']}
              style={{ fontSize: '24px' }}
            />
          </Form.Item>

          <Form.Item
            name="comment"
            label="Comment"
          >
            <Input.TextArea
              rows={4}
              placeholder="Share your thoughts about this book..."
            />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setFeedbackModal(false)}>
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={feedbackLoading}
              >
                Submit Feedback
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Library;
