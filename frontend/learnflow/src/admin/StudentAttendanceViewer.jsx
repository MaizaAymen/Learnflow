import React, { useState, useEffect } from 'react';
import {
  Modal,
  Table,
  Tag,
  Button,
  Space,
  Spin,
  Empty,
  message,
  Row,
  Col,
  Card,
  Statistic,
  Tooltip,
  Popconfirm,
  Form,
  Input,
  Select
} from 'antd';
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  DownloadOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import './StudentAttendanceViewer.css';

const StudentAttendanceViewer = ({
  visible,
  onCancel,
  schedule,
  loading: parentLoading,
  onRefresh
}) => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editForm] = Form.useForm();

  // Fetch attendance records when modal opens
  useEffect(() => {
    if (visible && schedule?.id) {
      fetchAttendanceRecords();
    }
  }, [visible, schedule?.id]);

  const fetchAttendanceRecords = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('Not authenticated');
        setLoading(false);
        return;
      }

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      const response = await fetch(
        `http://localhost:4000/api/teacher/schedule/${schedule.id}/absences`,
        { headers, credentials: 'include' }
      );

      if (response.ok) {
        const data = await response.json();
        setAttendanceRecords(data || []);
      } else {
        message.error('Failed to load attendance records');
      }
    } catch (error) {
      console.error('Error fetching attendance records:', error);
      message.error('Failed to load attendance records');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (record) => {
    setEditingRecord(record);
    editForm.setFieldsValue({
      absence_type: record.absence_type,
      motif: record.motif || ''
    });
    setEditModalVisible(true);
  };

  const handleEditSubmit = async (values) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('Not authenticated');
        return;
      }

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      const response = await fetch(
        `http://localhost:4000/api/teacher/student-absence/${editingRecord.id}`,
        {
          method: 'PUT',
          headers,
          credentials: 'include',
          body: JSON.stringify({
            absence_type: values.absence_type,
            motif: values.motif || null
          })
        }
      );

      if (response.ok) {
        message.success('Attendance record updated');
        setEditModalVisible(false);
        fetchAttendanceRecords();
        onRefresh?.();
      } else {
        message.error('Failed to update record');
      }
    } catch (error) {
      console.error('Error updating record:', error);
      message.error('Failed to update record');
    }
  };

  const handleDelete = async (recordId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('Not authenticated');
        return;
      }

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      const response = await fetch(
        `http://localhost:4000/api/teacher/student-absence/${recordId}`,
        {
          method: 'DELETE',
          headers,
          credentials: 'include'
        }
      );

      if (response.ok) {
        message.success('Attendance record deleted');
        fetchAttendanceRecords();
        onRefresh?.();
      } else {
        message.error('Failed to delete record');
      }
    } catch (error) {
      console.error('Error deleting record:', error);
      message.error('Failed to delete record');
    }
  };

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

  const getAbsenceTypeLabel = (type) => {
    const labels = {
      present: '✓ Present',
      absent: '✗ Absent',
      excused: '⚠ Excused',
      late: '🕒 Late',
      left_early: '⏱ Left Early'
    };
    return labels[type] || type;
  };

  // Calculate statistics
  const stats = {
    total: attendanceRecords.length,
    present: attendanceRecords.filter(r => r.absence_type === 'present').length,
    absent: attendanceRecords.filter(r => r.absence_type === 'absent').length,
    excused: attendanceRecords.filter(r => r.absence_type === 'excused').length,
    late: attendanceRecords.filter(r => r.absence_type === 'late').length,
    left_early: attendanceRecords.filter(r => r.absence_type === 'left_early').length
  };

  const columns = [
    {
      title: 'Student',
      dataIndex: ['student', 'nom'],
      key: 'student',
      width: 200,
      render: (text, record) => (
        <>
          {record.student?.nom} {record.student?.prenom}
        </>
      )
    },
    {
      title: 'Email',
      dataIndex: ['student', 'email'],
      key: 'email',
      width: 200
    },
    {
      title: 'Status',
      dataIndex: 'absence_type',
      key: 'absence_type',
      width: 120,
      render: (type) => (
        <Tag color={getAbsenceTypeColor(type)}>
          {getAbsenceTypeLabel(type)}
        </Tag>
      )
    },
    {
      title: 'Reason',
      dataIndex: 'motif',
      key: 'motif',
      width: 250,
      render: (text) =>
        text ? (
          <Tooltip title={text}>
            <span>{text.substring(0, 40)}...</span>
          </Tooltip>
        ) : (
          <span style={{ color: '#999' }}>—</span>
        )
    },
    {
      title: 'Marked At',
      dataIndex: 'marked_at',
      key: 'marked_at',
      width: 150,
      render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm')
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Edit">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEditClick(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Delete Record"
              description="Are you sure you want to delete this attendance record?"
              onConfirm={() => handleDelete(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      )
    }
  ];

  const exportToCSV = () => {
    const headers = ['Student', 'Email', 'Status', 'Reason', 'Marked At'];
    const rows = attendanceRecords.map(r => [
      `${r.student?.nom} ${r.student?.prenom}`,
      r.student?.email,
      getAbsenceTypeLabel(r.absence_type),
      r.motif || '',
      dayjs(r.marked_at).format('DD/MM/YYYY HH:mm')
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-${schedule?.id}-${dayjs().format('YYYY-MM-DD')}.csv`;
    a.click();
  };

  return (
    <>
      <Modal
        title={
          <div>
            <EyeOutlined /> Attendance Records - {schedule?.matiere?.name}
          </div>
        }
        open={visible}
        onCancel={onCancel}
        width={1200}
        footer={[
          <Button key="close" onClick={onCancel}>
            Close
          </Button>,
          <Button
            key="refresh"
            icon={<ReloadOutlined />}
            onClick={fetchAttendanceRecords}
            loading={loading}
          >
            Refresh
          </Button>,
          <Button
            key="export"
            type="primary"
            icon={<DownloadOutlined />}
            onClick={exportToCSV}
            disabled={attendanceRecords.length === 0}
          >
            Export CSV
          </Button>
        ]}
      >
        <Spin spinning={loading || parentLoading}>
          {attendanceRecords.length === 0 ? (
            <Empty description="No attendance records" />
          ) : (
            <>
              {/* Statistics */}
              <Row gutter={16} className="mb-3">
                <Col span={4}>
                  <Card size="small">
                    <Statistic
                      title="Total"
                      value={stats.total}
                      prefix={<span style={{ fontSize: '16px' }}>👥</span>}
                    />
                  </Card>
                </Col>
                <Col span={4}>
                  <Card size="small">
                    <Statistic
                      title="Present"
                      value={stats.present}
                      valueStyle={{ color: '#52c41a' }}
                      prefix={<CheckCircleOutlined />}
                    />
                  </Card>
                </Col>
                <Col span={4}>
                  <Card size="small">
                    <Statistic
                      title="Absent"
                      value={stats.absent}
                      valueStyle={{ color: '#ff4d4f' }}
                      prefix={<CloseCircleOutlined />}
                    />
                  </Card>
                </Col>
                <Col span={4}>
                  <Card size="small">
                    <Statistic
                      title="Excused"
                      value={stats.excused}
                      valueStyle={{ color: '#faad14' }}
                      prefix={<ExclamationCircleOutlined />}
                    />
                  </Card>
                </Col>
                <Col span={4}>
                  <Card size="small">
                    <Statistic
                      title="Late"
                      value={stats.late}
                      valueStyle={{ color: '#1890ff' }}
                      prefix={<ClockCircleOutlined />}
                    />
                  </Card>
                </Col>
                <Col span={4}>
                  <Card size="small">
                    <Statistic
                      title="Left Early"
                      value={stats.left_early}
                      valueStyle={{ color: '#722ed1' }}
                    />
                  </Card>
                </Col>
              </Row>

              {/* Table */}
              <Table
                columns={columns}
                dataSource={attendanceRecords}
                rowKey="id"
                pagination={{
                  pageSize: 10,
                  showTotal: (total) => `${total} records`
                }}
                size="small"
                bordered
              />
            </>
          )}
        </Spin>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Edit Attendance Record"
        open={editModalVisible}
        onOk={() => editForm.submit()}
        onCancel={() => setEditModalVisible(false)}
      >
        <Form form={editForm} layout="vertical" onFinish={handleEditSubmit}>
          <Form.Item label="Student">
            <span>{editingRecord?.student?.nom} {editingRecord?.student?.prenom}</span>
          </Form.Item>
          <Form.Item
            label="Status"
            name="absence_type"
            rules={[{ required: true, message: 'Please select status' }]}
          >
            <Select
              options={[
                { label: '✓ Present', value: 'present' },
                { label: '✗ Absent', value: 'absent' },
                { label: '⚠ Excused', value: 'excused' },
                { label: '🕒 Late', value: 'late' },
                { label: '⏱ Left Early', value: 'left_early' }
              ]}
            />
          </Form.Item>
          <Form.Item label="Reason" name="motif">
            <Input.TextArea
              placeholder="Optional reason"
              rows={3}
              maxLength={500}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default StudentAttendanceViewer;
