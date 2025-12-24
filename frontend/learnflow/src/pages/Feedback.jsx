/**
 * Feedback Page Component
 * Path: frontend/learnflow/src/pages/Feedback.jsx
 * Route: /feedback
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Tabs,
  Select,
  Button,
  Table,
  Modal,
  Form,
  Rate,
  Input,
  Space,
  message,
  Spin,
  Empty,
  Row,
  Col,
  Statistic,
  Avatar,
  List,
  Divider,
  Tag
} from 'antd';
import {
  StarOutlined,
  UserOutlined,
  BookOutlined,
  MessageOutlined
} from '@ant-design/icons';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const Feedback = () => {
  const [activeTab, setActiveTab] = useState('1');
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [courseDetails, setCourseDetails] = useState(null);
  const [teacherDetails, setTeacherDetails] = useState(null);
  const [feedbackModal, setFeedbackModal] = useState({
    visible: false,
    type: null, // 'course' or 'teacher'
    id: null,
    name: ''
  });
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);

  useEffect(() => {
    fetchClasses();
    // Fetch feedback courses and teachers immediately
    fetchSchedulesAndExtract();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      // Fetch schedules for the selected class
      fetchSchedules();
    }
  }, [selectedClass]);

  const fetchClasses = async () => {
    try {
      const response = await fetch(`${API_BASE}/reference/classes`);
      if (response.ok) {
        const data = await response.json();
        setClasses(Array.isArray(data) ? data : []);
        if (Array.isArray(data) && data.length > 0) {
          setSelectedClass(data[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchSchedulesAndExtract = async () => {
    try {
      setLoading(true);
      
      // Fetch all available courses and teachers with feedback stats
      const [coursesRes, teachersRes] = await Promise.all([
        fetch(`${API_BASE}/feedback/courses`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch(`${API_BASE}/feedback/teachers`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      if (coursesRes.ok) {
        const coursesData = await coursesRes.json();
        console.log('Courses fetched:', coursesData);
        setCourses(Array.isArray(coursesData) ? coursesData : []);
      } else {
        console.log('Courses response not ok:', coursesRes.status);
        setCourses([]);
      }

      if (teachersRes.ok) {
        const teachersData = await teachersRes.json();
        console.log('Teachers fetched:', teachersData);
        setTeachers(Array.isArray(teachersData) ? teachersData : []);
      } else {
        console.log('Teachers response not ok:', teachersRes.status);
        setTeachers([]);
      }
    } catch (error) {
      console.error('Error fetching courses and teachers:', error);
      message.error('Failed to load feedback data');
    } finally {
      setLoading(false);
    }
  };

  const fetchSchedules = async () => {
    try {
      if (!selectedClass) return;
      // Fetch schedules for reference
      const schedulesRes = await fetch(`${API_BASE}/calendar/schedules?classe_id=${selectedClass}`);
      if (schedulesRes.ok) {
        const schedulesData = await schedulesRes.json();
        setSchedules(Array.isArray(schedulesData) ? schedulesData : []);
      }
    } catch (error) {
      console.error('Error fetching schedules:', error);
    }
  };

  const viewCourseDetails = async (courseId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/feedback/course/${courseId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setCourseDetails(data.data);
        setSelectedCourse(courseId);
      } else if (response.status === 404) {
        // Course not found, set default data
        const courseFromList = courses.find(c => c.id === courseId);
        setCourseDetails({
          id: courseId,
          course_name: courseFromList?.course_name || 'Unknown Course',
          average_rating: 0,
          feedback_count: 0,
          feedback: []
        });
        setSelectedCourse(courseId);
      } else {
        message.error('Failed to load course details');
      }
    } catch (error) {
      console.error('Error fetching course details:', error);
      const courseFromList = courses.find(c => c.id === courseId);
      setCourseDetails({
        id: courseId,
        course_name: courseFromList?.course_name || 'Unknown Course',
        average_rating: 0,
        feedback_count: 0,
        feedback: []
      });
      setSelectedCourse(courseId);
    }
  };

  const viewTeacherDetails = async (teacherId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/feedback/teacher/${teacherId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setTeacherDetails(data.data);
        setSelectedTeacher(teacherId);
      } else if (response.status === 404) {
        // Teacher not found, set default data
        const teacherFromList = teachers.find(t => t.id === teacherId);
        setTeacherDetails({
          id: teacherId,
          nom: teacherFromList?.nom || 'Unknown',
          prenom: teacherFromList?.prenom || 'Teacher',
          average_rating: 0,
          feedback_count: 0,
          feedback: []
        });
        setSelectedTeacher(teacherId);
      } else {
        message.error('Failed to load teacher details');
      }
    } catch (error) {
      console.error('Error fetching teacher details:', error);
      const teacherFromList = teachers.find(t => t.id === teacherId);
      setTeacherDetails({
        id: teacherId,
        nom: teacherFromList?.nom || 'Unknown',
        prenom: teacherFromList?.prenom || 'Teacher',
        average_rating: 0,
        feedback_count: 0,
        feedback: []
      });
      setSelectedTeacher(teacherId);
    }
  };

  const openFeedbackModal = (type, id, name) => {
    setFeedbackModal({ visible: true, type, id, name });
    form.resetFields();
  };

  const handleFeedbackSubmit = async (values) => {
    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      const endpoint = feedbackModal.type === 'course' 
        ? `${API_BASE}/feedback/course/${feedbackModal.id}`
        : `${API_BASE}/feedback/teacher/${feedbackModal.id}`;

      const response = await fetch(endpoint, {
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
        setFeedbackModal({ visible: false, type: null, id: null, name: '' });
        form.resetFields();
        
        // Refresh details
        if (feedbackModal.type === 'course') {
          viewCourseDetails(feedbackModal.id);
        } else {
          viewTeacherDetails(feedbackModal.id);
        }
      } else if (response.status === 404) {
        // Entity not found - likely a data mismatch issue
        const errorData = await response.json().catch(() => ({}));
        message.error(`${feedbackModal.type === 'course' ? 'Course' : 'Teacher'} not found. Please refresh and try again.`);
        setFeedbackModal({ visible: false, type: null, id: null, name: '' });
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Feedback submission error:', errorData);
        message.error(errorData.error || 'Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      message.error('Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const courseColumns = [
    {
      title: 'Course Name',
      dataIndex: 'course_name',
      key: 'course_name',
      render: (text) => <strong>{text}</strong>
    },
    {
      title: 'Average Rating',
      dataIndex: 'average_rating',
      key: 'average_rating',
      render: (rating) => (
        <Space size="small">
          {rating && typeof rating === 'number' && rating > 0 ? (
            <>
              <Rate disabled value={Math.round(rating)} style={{ fontSize: '12px' }} />
              <span>{Number(rating).toFixed(1)}</span>
            </>
          ) : (
            <span style={{ color: '#ccc' }}>Not rated</span>
          )}
        </Space>
      )
    },
    {
      title: 'Reviews',
      dataIndex: 'feedback_count',
      key: 'feedback_count',
      render: (count) => <Tag color="blue">{count} reviews</Tag>
    },
    {
      title: 'Reviewers',
      dataIndex: 'unique_reviewers',
      key: 'unique_reviewers'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button
            size="small"
            onClick={() => viewCourseDetails(record.id)}
          >
            View Details
          </Button>
          <Button
            type="primary"
            size="small"
            icon={<MessageOutlined />}
            onClick={() => openFeedbackModal('course', record.id, record.course_name)}
          >
            Feedback
          </Button>
        </Space>
      )
    }
  ];

  const teacherColumns = [
    {
      title: 'Teacher Name',
      dataIndex: ['nom'],
      key: 'name',
      render: (nom, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <strong>{nom} {record.prenom}</strong>
        </Space>
      )
    },
    {
      title: 'Average Rating',
      dataIndex: 'average_rating',
      key: 'average_rating',
      render: (rating) => (
        <Space size="small">
          {rating && typeof rating === 'number' && rating > 0 ? (
            <>
              <Rate disabled value={Math.round(rating)} style={{ fontSize: '12px' }} />
              <span>{Number(rating).toFixed(1)}</span>
            </>
          ) : (
            <span style={{ color: '#ccc' }}>Not rated</span>
          )}
        </Space>
      )
    },
    {
      title: 'Reviews',
      dataIndex: 'feedback_count',
      key: 'feedback_count',
      render: (count) => <Tag color="blue">{count} reviews</Tag>
    },
    {
      title: 'Reviewers',
      dataIndex: 'unique_reviewers',
      key: 'unique_reviewers'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button
            size="small"
            onClick={() => viewTeacherDetails(record.id)}
          >
            View Details
          </Button>
          <Button
            type="primary"
            size="small"
            icon={<MessageOutlined />}
            onClick={() => openFeedbackModal('teacher', record.id, `${record.nom} ${record.prenom}`)}
          >
            Feedback
          </Button>
        </Space>
      )
    }
  ];

  const renderDetailsPanel = () => {
    if (activeTab === '1' && courseDetails) {
      return (
        <Card style={{ marginTop: '20px' }}>
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <div>
              <h2 style={{ marginBottom: '8px' }}>📚 {courseDetails.course_name}</h2>
              <Row gutter={16}>
                <Col span={8}>
                  <Statistic
                    title="Average Rating"
                    value={courseDetails.average_rating || 0}
                    precision={1}
                    suffix={<StarOutlined />}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Total Reviews"
                    value={courseDetails.feedback_count || 0}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Unique Reviewers"
                    value={courseDetails.unique_reviewers || 0}
                  />
                </Col>
              </Row>
            </div>

            <Button
              type="primary"
              size="large"
              onClick={() => openFeedbackModal('course', courseDetails.id, courseDetails.course_name)}
            >
              Leave Feedback
            </Button>

            {courseDetails.feedback && courseDetails.feedback.length > 0 && (
              <>
                <Divider>Reviews ({courseDetails.feedback.length})</Divider>
                <List
                  dataSource={courseDetails.feedback}
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
              </>
            )}
          </Space>
        </Card>
      );
    }

    if (activeTab === '2' && teacherDetails) {
      return (
        <Card style={{ marginTop: '20px' }}>
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <div>
              <Row gutter={16} style={{ marginBottom: '16px' }}>
                <Col span={4}>
                  <Avatar size={80} icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
                </Col>
                <Col span={20}>
                  <h2 style={{ marginBottom: '8px' }}>👨‍🏫 {teacherDetails.nom} {teacherDetails.prenom}</h2>
                  <Tag color="blue">Instructor</Tag>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={8}>
                  <Statistic
                    title="Average Rating"
                    value={teacherDetails.average_rating || 0}
                    precision={1}
                    suffix={<StarOutlined />}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Total Reviews"
                    value={teacherDetails.feedback_count || 0}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Unique Reviewers"
                    value={teacherDetails.unique_reviewers || 0}
                  />
                </Col>
              </Row>
            </div>

            <Button
              type="primary"
              size="large"
              onClick={() => openFeedbackModal('teacher', teacherDetails.id, `${teacherDetails.nom} ${teacherDetails.prenom}`)}
            >
              Leave Feedback
            </Button>

            {teacherDetails.feedback && teacherDetails.feedback.length > 0 && (
              <>
                <Divider>Reviews ({teacherDetails.feedback.length})</Divider>
                <List
                  dataSource={teacherDetails.feedback}
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
              </>
            )}
          </Space>
        </Card>
      );
    }

    return null;
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <Card title="💬 Course & Teacher Feedback System">
        {/* Class Selection */}
        <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span>Select Class:</span>
          <Select 
            style={{ width: 300 }}
            value={selectedClass}
            onChange={(value) => setSelectedClass(value)}
          >
            {classes.map(cls => (
              <Select.Option key={cls.id} value={cls.id}>
                {cls.nom} ({cls.niveau?.nom || 'N/A'})
              </Select.Option>
            ))}
          </Select>
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: '1',
              label: '📖 Course Feedback',
              children: (
                <Spin spinning={loading}>
                  <Table
                    columns={courseColumns}
                    dataSource={courses}
                    rowKey="id"
                    pagination={{
                      pageSize: 10,
                      showSizeChanger: true,
                      showQuickJumper: true
                    }}
                    locale={{
                      emptyText: <Empty description="No courses found in selected class" />
                    }}
                  />
                </Spin>
              )
            },
            {
              key: '2',
              label: '👨‍🏫 Teacher Feedback',
              children: (
                <Spin spinning={loading}>
                  <Table
                    columns={teacherColumns}
                    dataSource={teachers}
                    rowKey="id"
                    pagination={{
                      pageSize: 10,
                      showSizeChanger: true,
                      showQuickJumper: true
                    }}
                    locale={{
                      emptyText: <Empty description="No teachers found in selected class" />
                    }}
                  />
                </Spin>
              )
            }
          ]}
        />

        {renderDetailsPanel()}
      </Card>

      {/* Feedback Modal */}
      <Modal
        title={`Leave Feedback: ${feedbackModal.name}`}
        open={feedbackModal.visible}
        onCancel={() => setFeedbackModal({ visible: false, type: null, id: null, name: '' })}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFeedbackSubmit}
        >
          <Form.Item
            name="rating"
            label="Rating"
            rules={[{ required: true, message: 'Please rate this item' }]}
          >
            <Rate
              tooltips={['Terrible', 'Poor', 'Average', 'Good', 'Excellent']}
              style={{ fontSize: '24px' }}
            />
          </Form.Item>

          <Form.Item
            name="comment"
            label="Comments (Optional)"
          >
            <Input.TextArea
              rows={4}
              placeholder="Share your feedback..."
            />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setFeedbackModal({ visible: false, type: null, id: null, name: '' })}>
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
      </Modal>
    </div>
  );
};

export default Feedback;
