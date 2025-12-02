/**
 * Course Feedback Component
 * Modal to submit feedback for courses shown in schedule
 * Path: frontend/learnflow/src/components/CourseFeedback.jsx
 */

import React, { useState } from 'react';
import {
  Modal,
  Form,
  Rate,
  Input,
  Button,
  Space,
  message,
  Spin,
  Divider,
  List,
  Avatar,
  Tag,
  Empty,
  Row,
  Col,
  Statistic
} from 'antd';
import { StarOutlined } from '@ant-design/icons';

const API_BASE = 'http://localhost:3000/api';

const CourseFeedback = ({ courseId, courseName, visible, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [courseData, setCourseData] = useState(null);

  React.useEffect(() => {
    if (visible && courseId) {
      fetchCourseDetails();
    }
  }, [visible, courseId]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/feedback/course/${courseId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setCourseData(data.data);
      }
    } catch (error) {
      console.error('Error fetching course details:', error);
      message.error('Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_BASE}/feedback/course/${courseId}`, {
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
        message.success('Feedback submitted successfully!');
        form.resetFields();
        onSuccess?.();
        // Refresh data
        fetchCourseDetails();
      } else {
        message.error('Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      message.error('Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={`📚 Course Feedback: ${courseName}`}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={700}
    >
      <Spin spinning={loading} tip="Loading course details...">
        {courseData && (
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            {/* Course Stats */}
            <div style={{ backgroundColor: '#fafafa', padding: '16px', borderRadius: '4px' }}>
              <Row gutter={16}>
                <Col span={8}>
                  <Statistic
                    title="Average Rating"
                    value={courseData.average_rating || 0}
                    precision={1}
                    suffix={<StarOutlined />}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Total Reviews"
                    value={courseData.feedback_count || 0}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Unique Reviewers"
                    value={courseData.unique_reviewers || 0}
                  />
                </Col>
              </Row>
            </div>

            <Divider>Share Your Feedback</Divider>

            {/* Feedback Form */}
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
            >
              <Form.Item
                name="rating"
                label="Course Rating"
                rules={[{ required: true, message: 'Please rate this course' }]}
              >
                <Rate
                  tooltips={['Terrible', 'Poor', 'Average', 'Good', 'Excellent']}
                  style={{ fontSize: '24px' }}
                />
              </Form.Item>

              <Form.Item
                name="comment"
                label="Your Feedback (Optional)"
              >
                <Input.TextArea
                  rows={4}
                  placeholder="Share your thoughts about this course, teaching methods, content quality, etc."
                />
              </Form.Item>

              <Form.Item>
                <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                  <Button onClick={onCancel}>
                    Cancel
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={submitting}
                  >
                    Submit Feedback
                  </Button>
                </Space>
              </Form.Item>
            </Form>

            {/* Reviews Section */}
            <Divider>Student Reviews</Divider>

            {courseData.feedback && courseData.feedback.length > 0 ? (
              <List
                itemLayout="horizontal"
                dataSource={courseData.feedback}
                renderItem={(feedback) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar>{feedback.nom?.charAt(0) || 'S'}</Avatar>}
                      title={
                        <Space>
                          <strong>{feedback.nom} {feedback.prenom}</strong>
                          <Rate disabled value={feedback.rating} style={{ fontSize: '12px' }} />
                          <span style={{ color: '#999', fontSize: '12px' }}>
                            {new Date(feedback.created_at).toLocaleDateString()}
                          </span>
                        </Space>
                      }
                      description={feedback.comment || '(No comment provided)'}
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="No reviews yet. Be the first to review!" />
            )}
          </Space>
        )}
      </Spin>
    </Modal>
  );
};

export default CourseFeedback;
