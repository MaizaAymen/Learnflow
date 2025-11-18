import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Table,
  Button,
  Space,
  Checkbox,
  Tag,
  Alert,
  Spin,
  message,
  Empty,
  Row,
  Col,
  Card,
  Divider
} from 'antd';
import {
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  SaveOutlined,
  ClearOutlined
} from '@ant-design/icons';
import './StudentAbsenceModal.css';

const StudentAbsenceModal = ({
  visible,
  onCancel,
  onSubmit,
  schedule,
  loading: parentLoading
}) => {
  const [form] = Form.useForm();
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState(new Map());
  const [loading, setLoading] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [globalAbsenceType, setGlobalAbsenceType] = useState('absent');
  const [globalMotif, setGlobalMotif] = useState('');

  // Fetch students for the class when modal opens
  useEffect(() => {
    if (visible && schedule?.classe_id) {
      fetchClassStudents();
    }
  }, [visible, schedule?.classe_id]);

  const fetchClassStudents = async () => {
    setLoadingStudents(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('Not authenticated');
        setLoadingStudents(false);
        return;
      }

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      const response = await fetch(
        `http://localhost:4000/api/auth/classes/${schedule.classe_id}/students`,
        { headers, credentials: 'include' }
      );

      if (response.ok) {
        const data = await response.json();
        setStudents(data || []);
        // Initialize attendance map with all students as present
        const initialMap = new Map();
        data.forEach(student => {
          initialMap.set(student.id, { type: 'present', motif: '' });
        });
        setSelectedStudents(initialMap);
      } else {
        message.error('Failed to load students');
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      message.error('Failed to load students');
    } finally {
      setLoadingStudents(false);
    }
  };

  // Handle individual student absence type change
  const handleStudentAbsenceChange = (studentId, type) => {
    const updated = new Map(selectedStudents);
    updated.set(studentId, {
      type,
      motif: updated.get(studentId)?.motif || ''
    });
    setSelectedStudents(updated);
  };

  // Handle individual student motif change
  const handleStudentMotifChange = (studentId, motif) => {
    const updated = new Map(selectedStudents);
    updated.set(studentId, {
      type: updated.get(studentId)?.type || 'absent',
      motif
    });
    setSelectedStudents(updated);
  };

  // Apply global absence type to all students
  const applyGlobalAbsenceType = () => {
    const updated = new Map(selectedStudents);
    updated.forEach((value, key) => {
      updated.set(key, {
        ...value,
        type: globalAbsenceType
      });
    });
    setSelectedStudents(updated);
    message.success(`Applied "${globalAbsenceType}" to all students`);
  };

  // Apply global motif to all students
  const applyGlobalMotif = () => {
    if (!globalMotif.trim()) {
      message.warning('Please enter a motif');
      return;
    }

    const updated = new Map(selectedStudents);
    updated.forEach((value, key) => {
      updated.set(key, {
        ...value,
        motif: globalMotif
      });
    });
    setSelectedStudents(updated);
    message.success('Applied motif to all students');
  };

  // Reset all to present
  const resetAllToPresent = () => {
    const updated = new Map(selectedStudents);
    updated.forEach((value, key) => {
      updated.set(key, {
        type: 'present',
        motif: ''
      });
    });
    setSelectedStudents(updated);
    setGlobalMotif('');
    message.info('All students reset to present');
  };

  // Handle submit
  const handleSubmit = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('Not authenticated');
        return;
      }

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      // Prepare absence records for all students
      const absenceRecords = Array.from(selectedStudents.entries()).map(
        ([studentId, data]) => ({
          student_id: studentId,
          schedule_id: schedule.id,
          absence_type: data.type,
          motif: data.motif || null
        })
      );

      const response = await fetch(
        'http://localhost:4000/api/auth/teacher/mark-student-absences',
        {
          method: 'POST',
          headers,
          credentials: 'include',
          body: JSON.stringify({
            schedule_id: schedule.id,
            absences: absenceRecords
          })
        }
      );

      if (response.ok) {
        message.success('Student absences marked successfully');
        setSelectedStudents(new Map());
        setGlobalMotif('');
        setGlobalAbsenceType('absent');
        onSubmit?.();
        onCancel?.();
      } else {
        const error = await response.json();
        message.error(error.message || 'Failed to mark absences');
      }
    } catch (error) {
      console.error('Error marking absences:', error);
      message.error('Failed to mark absences');
    } finally {
      setLoading(false);
    }
  };

  // Get color for absence type
  const getAbsenceTypeColor = (type) => {
    const colors = {
      present: 'green',
      absent: 'red',
      excused: 'orange',
      late: 'blue',
      left_early: 'purple'
    };
    return colors[type] || 'default';
  };

  // Get icon for absence type
  const getAbsenceTypeIcon = (type) => {
    const icons = {
      present: <CheckCircleOutlined />,
      absent: <CloseCircleOutlined />,
      excused: <ExclamationCircleOutlined />,
      late: <ClockCircleOutlined />,
      left_early: <ClockCircleOutlined />
    };
    return icons[type];
  };

  // Table columns
  const columns = [
    {
      title: 'Student',
      dataIndex: 'nom',
      render: (text, record) => (
        <Space>
          <UserOutlined />
          <span>{record.nom} {record.prenom}</span>
        </Space>
      )
    },
    {
      title: 'Status',
      dataIndex: 'id',
      width: 200,
      render: (studentId) => {
        const data = selectedStudents.get(studentId);
        return (
          <Select
            value={data?.type || 'present'}
            onChange={(value) => handleStudentAbsenceChange(studentId, value)}
            options={[
              { label: '✓ Present', value: 'present' },
              { label: '✗ Absent', value: 'absent' },
              { label: '⚠ Excused', value: 'excused' },
              { label: '🕒 Late', value: 'late' },
              { label: '⏱ Left Early', value: 'left_early' }
            ]}
            style={{ width: '100%' }}
          />
        );
      }
    },
    {
      title: 'Reason',
      dataIndex: 'id',
      width: 300,
      render: (studentId) => {
        const data = selectedStudents.get(studentId);
        return (
          <Input.TextArea
            placeholder="Optional reason"
            value={data?.motif || ''}
            onChange={(e) => handleStudentMotifChange(studentId, e.target.value)}
            rows={1}
            maxLength={200}
          />
        );
      }
    }
  ];

  const absentCount = Array.from(selectedStudents.values()).filter(
    s => s.type === 'absent'
  ).length;
  const excusedCount = Array.from(selectedStudents.values()).filter(
    s => s.type === 'excused'
  ).length;
  const presentCount = Array.from(selectedStudents.values()).filter(
    s => s.type === 'present'
  ).length;

  return (
    <Modal
      title={
        <div>
          <UserOutlined /> Mark Student Absences - {schedule?.matiere?.name}
        </div>
      }
      open={visible}
      onCancel={onCancel}
      width={1000}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleSubmit}
          loading={loading || parentLoading}
          icon={<SaveOutlined />}
        >
          Save Attendance
        </Button>
      ]}
    >
      <Spin spinning={loadingStudents || loading}>
        {students.length === 0 ? (
          <Empty description="No students in this class" />
        ) : (
          <>
            {/* Session Info */}
            <Card
              size="small"
              className="mb-3"
              style={{ backgroundColor: '#f5f5f5' }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <p>
                    <strong>Class:</strong> {schedule?.classe?.nom}
                  </p>
                  <p>
                    <strong>Subject:</strong> {schedule?.matiere?.name}
                  </p>
                </Col>
                <Col span={12}>
                  <p>
                    <strong>Time:</strong> {schedule?.start_time} - {schedule?.end_time}
                  </p>
                  <p>
                    <strong>Room:</strong> {schedule?.salle?.nom}
                  </p>
                </Col>
              </Row>
            </Card>

            {/* Statistics */}
            <Row gutter={16} className="mb-3">
              <Col span={6}>
                <Card size="small">
                  <div className="stat">
                    <CheckCircleOutlined style={{ color: 'green', fontSize: '18px' }} />
                    <div style={{ marginTop: '8px' }}>
                      <strong>{presentCount}</strong>
                      <p style={{ fontSize: '12px', color: '#999' }}>Present</p>
                    </div>
                  </div>
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small">
                  <div className="stat">
                    <CloseCircleOutlined style={{ color: 'red', fontSize: '18px' }} />
                    <div style={{ marginTop: '8px' }}>
                      <strong>{absentCount}</strong>
                      <p style={{ fontSize: '12px', color: '#999' }}>Absent</p>
                    </div>
                  </div>
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small">
                  <div className="stat">
                    <ExclamationCircleOutlined style={{ color: 'orange', fontSize: '18px' }} />
                    <div style={{ marginTop: '8px' }}>
                      <strong>{excusedCount}</strong>
                      <p style={{ fontSize: '12px', color: '#999' }}>Excused</p>
                    </div>
                  </div>
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small">
                  <div className="stat">
                    <div>
                      <strong>{students.length}</strong>
                      <p style={{ fontSize: '12px', color: '#999' }}>Total</p>
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>

            <Divider>Bulk Actions</Divider>

            {/* Global controls */}
            <Card size="small" className="mb-3">
              <Row gutter={16} align="middle">
                <Col span={8}>
                  <label style={{ display: 'block', marginBottom: '8px' }}>
                    <strong>Set All To:</strong>
                  </label>
                  <Select
                    value={globalAbsenceType}
                    onChange={setGlobalAbsenceType}
                    options={[
                      { label: '✓ Present', value: 'present' },
                      { label: '✗ Absent', value: 'absent' },
                      { label: '⚠ Excused', value: 'excused' },
                      { label: '🕒 Late', value: 'late' },
                      { label: '⏱ Left Early', value: 'left_early' }
                    ]}
                  />
                </Col>
                <Col span={4}>
                  <Button block onClick={applyGlobalAbsenceType}>
                    Apply
                  </Button>
                </Col>
                <Col span={12}>
                  <label style={{ display: 'block', marginBottom: '8px' }}>
                    <strong>Global Reason:</strong>
                  </label>
                  <Input.TextArea
                    placeholder="Enter reason to apply to all..."
                    value={globalMotif}
                    onChange={(e) => setGlobalMotif(e.target.value)}
                    rows={1}
                    maxLength={200}
                  />
                </Col>
                <Col span={4}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Button
                      block
                      onClick={applyGlobalMotif}
                      disabled={!globalMotif.trim()}
                    >
                      Apply Reason
                    </Button>
                    <Button
                      block
                      danger
                      icon={<ClearOutlined />}
                      onClick={resetAllToPresent}
                    >
                      Reset All
                    </Button>
                  </Space>
                </Col>
              </Row>
            </Card>

            <Divider>Student Attendance</Divider>

            {/* Students table */}
            <Table
              columns={columns}
              dataSource={students}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showTotal: (total) => `${total} students`
              }}
              size="small"
              bordered
              style={{ marginTop: '16px' }}
            />
          </>
        )}
      </Spin>
    </Modal>
  );
};

export default StudentAbsenceModal;
