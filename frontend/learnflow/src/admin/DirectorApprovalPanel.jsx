import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Tag,
  Space,
  message,
  Tabs,
  Badge,
  Empty,
  Spin,
  Row,
  Col
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const DirectorApprovalPanel = () => {
  const [pendingAbsences, setPendingAbsences] = useState([]);
  const [pendingRattrapages, setPendingRattrapages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemType, setItemType] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    setLoading(true);
    try {
      const [absencesRes, rattrapagesRes] = await Promise.all([
        fetch('http://localhost:3000/api/director/absences/pending'),
        fetch('http://localhost:3000/api/director/rattrapages/pending')
      ]);

      if (absencesRes.ok) {
        const data = await absencesRes.json();
        setPendingAbsences(data);
      }

      if (rattrapagesRes.ok) {
        const data = await rattrapagesRes.json();
        setPendingRattrapages(data);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      message.error('Failed to load pending requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (item, type) => {
    setSelectedItem(item);
    setItemType(type);
    form.setFieldsValue({ action: 'approved' });
    setModalVisible(true);
  };

  const handleReject = (item, type) => {
    setSelectedItem(item);
    setItemType(type);
    form.setFieldsValue({ action: 'rejected' });
    setModalVisible(true);
  };

  const handleSubmitDecision = async (values) => {
    try {
      const endpoint = itemType === 'absence'
        ? `http://localhost:3000/api/director/absences/${selectedItem.id}/${values.action}`
        : `http://localhost:3000/api/director/rattrapages/${selectedItem.id}/${values.action}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: values.notes })
      });

      if (response.ok) {
        message.success(`Request ${values.action} successfully`);
        setModalVisible(false);
        form.resetFields();
        fetchPendingRequests();
      }
    } catch (error) {
      console.error('Error updating request:', error);
      message.error('Failed to update request');
    }
  };

  const absenceColumns = [
    {
      title: 'Teacher',
      dataIndex: ['enseignant', 'nom'],
      key: 'teacher',
      render: (text, record) => `${record.enseignant.nom} ${record.enseignant.prenom}`
    },
    {
      title: 'Subject',
      dataIndex: ['schedule', 'matiere', 'name'],
      key: 'subject'
    },
    {
      title: 'Period',
      key: 'period',
      render: (_, record) => (
        `${dayjs(record.date_debut).format('DD/MM/YYYY')} - ${dayjs(record.date_fin).format('DD/MM/YYYY')}`
      )
    },
    {
      title: 'Reason',
      dataIndex: 'motif',
      key: 'motif',
      ellipsis: true
    },
    {
      title: 'Status',
      dataIndex: 'statut',
      key: 'statut',
      render: (statut) => <Tag color={statut === 'pending' ? 'orange' : statut === 'approved' ? 'green' : 'red'}>{statut}</Tag>
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<CheckCircleOutlined />}
            onClick={() => handleApprove(record, 'absence')}
          >
            Approve
          </Button>
          <Button
            danger
            size="small"
            icon={<CloseCircleOutlined />}
            onClick={() => handleReject(record, 'absence')}
          >
            Reject
          </Button>
        </Space>
      )
    }
  ];

  const rattrapageColumns = [
    {
      title: 'Teacher',
      dataIndex: ['enseignant', 'nom'],
      key: 'teacher',
      render: (text, record) => `${record.enseignant.nom} ${record.enseignant.prenom}`
    },
    {
      title: 'Subject',
      dataIndex: ['schedule', 'matiere', 'name'],
      key: 'subject'
    },
    {
      title: 'Original Date',
      dataIndex: ['schedule', 'date_debut'],
      key: 'original',
      render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm')
    },
    {
      title: 'Requested Date',
      dataIndex: 'requested_date',
      key: 'requested',
      render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm')
    },
    {
      title: 'Reason',
      dataIndex: 'motif',
      key: 'motif',
      ellipsis: true
    },
    {
      title: 'Status',
      dataIndex: 'statut',
      key: 'statut',
      render: (statut) => <Tag color={statut === 'pending' ? 'orange' : statut === 'approved' ? 'green' : 'red'}>{statut}</Tag>
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<CheckCircleOutlined />}
            onClick={() => handleApprove(record, 'rattrapage')}
          >
            Approve
          </Button>
          <Button
            danger
            size="small"
            icon={<CloseCircleOutlined />}
            onClick={() => handleReject(record, 'rattrapage')}
          >
            Reject
          </Button>
        </Space>
      )
    }
  ];

  // Define tabs items using the modern format
  const tabItems = [
    {
      key: 'absences',
      label: `Absences (${pendingAbsences.length})`,
      children: pendingAbsences.length === 0 ? (
        <Empty description="No pending absences" />
      ) : (
        <Table
          dataSource={pendingAbsences}
          columns={absenceColumns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      )
    },
    {
      key: 'rattrapages',
      label: `Rattrapages (${pendingRattrapages.length})`,
      children: pendingRattrapages.length === 0 ? (
        <Empty description="No pending rattrapages" />
      ) : (
        <Table
          dataSource={pendingRattrapages}
          columns={rattrapageColumns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12}>
          <Card>
            <Badge count={pendingAbsences.length} style={{ backgroundColor: '#faad14' }}>
              <h3>Pending Absences</h3>
            </Badge>
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card>
            <Badge count={pendingRattrapages.length} style={{ backgroundColor: '#faad14' }}>
              <h3>Pending Rattrapages</h3>
            </Badge>
          </Card>
        </Col>
      </Row>

      <Spin spinning={loading}>
        <Tabs items={tabItems} />
      </Spin>

      {/* Decision Modal */}
      <Modal
        title={`${itemType === 'absence' ? 'Approve/Reject Absence' : 'Approve/Reject Rattrapage'}`}
        open={modalVisible}
        onOk={() => form.submit()}
        onCancel={() => setModalVisible(false)}
      >
        {selectedItem && (
          <Form form={form} layout="vertical" onFinish={handleSubmitDecision}>
            <Form.Item label="Teacher">
              <Input disabled value={`${selectedItem.enseignant?.nom} ${selectedItem.enseignant?.prenom}`} />
            </Form.Item>

            {itemType === 'absence' && (
              <>
                <Form.Item label="Absence Period">
                  <Input
                    disabled
                    value={`${dayjs(selectedItem.date_debut).format('DD/MM/YYYY')} - ${dayjs(selectedItem.date_fin).format('DD/MM/YYYY')}`}
                  />
                </Form.Item>
                <Form.Item label="Reason">
                  <Input.TextArea disabled rows={2} value={selectedItem.motif} />
                </Form.Item>
              </>
            )}

            {itemType === 'rattrapage' && (
              <>
                <Form.Item label="Original Date">
                  <Input
                    disabled
                    value={dayjs(selectedItem.schedule?.date_debut).format('DD/MM/YYYY HH:mm')}
                  />
                </Form.Item>
                <Form.Item label="Requested Date">
                  <Input
                    disabled
                    value={dayjs(selectedItem.requested_date).format('DD/MM/YYYY HH:mm')}
                  />
                </Form.Item>
                <Form.Item label="Reason">
                  <Input.TextArea disabled rows={2} value={selectedItem.motif} />
                </Form.Item>
              </>
            )}

            <Form.Item
              label="Decision"
              name="action"
              rules={[{ required: true }]}
            >
              <Select>
                <Select.Option value="approved">Approve</Select.Option>
                <Select.Option value="rejected">Reject</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item label="Notes" name="notes">
              <Input.TextArea rows={3} placeholder="Add validation notes..." />
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default DirectorApprovalPanel;