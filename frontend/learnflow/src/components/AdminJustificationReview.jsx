import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Table,
  Modal,
  Form,
  Input,
  Tag,
  Space,
  Spin,
  Empty,
  message,
  Tabs,
  Statistic,
  Row,
  Col,
  Badge,
  Divider,
  Drawer,
  Image,
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  DownloadOutlined,
  FileOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import AbsenceJustificationAPI from '@/services/AbsenceJustificationAPI.js';
import './AdminJustificationReview.css';

const AdminJustificationReview = () => {
  const [justifications, setJustifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedJustification, setSelectedJustification] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [actionModal, setActionModal] = useState(null);
  const [stats, setStats] = useState(null);
  const [form] = Form.useForm();
  const [statusFilter, setStatusFilter] = useState('pending');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadJustifications();
    loadStatistics();
  }, [statusFilter, currentPage]);

  const loadJustifications = async () => {
    setLoading(true);
    try {
      let data;
      if (statusFilter === 'all') {
        data = await AbsenceJustificationAPI.getAllJustifications({
          page: currentPage,
          limit: 20,
        });
      } else {
        data = await AbsenceJustificationAPI.getAllJustifications({
          status: statusFilter,
          page: currentPage,
          limit: 20,
        });
      }
      
      setJustifications(data?.data || []);
      
      if (!data.success) {
        console.warn('⚠️ Partial load warning:', data.error);
        message.warning('Certaines données n\'ont pas pu être chargées');
      }
    } catch (error) {
      console.error('❌ Error loading justifications:', error);
      setJustifications([]);
      message.error('Erreur lors du chargement des justifications');
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      console.log('📊 Loading statistics...');
      const data = await AbsenceJustificationAPI.getStatistics();
      
      // Ensure all expected fields exist
      const sanitizedStats = {
        byStatus: data?.byStatus || {
          pending: 0,
          approved: 0,
          rejected: 0,
          revision_needed: 0
        },
        byType: data?.byType || {
          medical: 0,
          family_issue: 0,
          administrative: 0,
          personal: 0,
          other: 0
        },
        total: data?.total || 0,
        success: data?.success !== false,
        isFallback: data?.isFallback || false,
        error: data?.error || null
      };
      
      if (sanitizedStats.isFallback || sanitizedStats.error) {
        console.warn('⚠️ Statistics loaded with fallback/warning:', sanitizedStats.error);
        message.warning('Certaines statistiques utilisent les données par défaut');
      }
      
      setStats(sanitizedStats);
    } catch (error) {
      console.error('❌ Error loading stats:', error);
      
      // Set fallback statistics
      const fallbackStats = {
        byStatus: {
          pending: 0,
          approved: 0,
          rejected: 0,
          revision_needed: 0
        },
        byType: {
          medical: 0,
          family_issue: 0,
          administrative: 0,
          personal: 0,
          other: 0
        },
        total: 0,
        success: false,
        isFallback: true,
        error: error.message
      };
      
      setStats(fallbackStats);
      message.warning('Impossible de charger les statistiques - affichage des données par défaut');
    }
  };

  const handleApprove = (record) => {
    Modal.confirm({
      title: 'Approuver cette justification',
      content: `Êtes-vous sûr de vouloir approuver la justification de ${record.StudentAbsence?.User?.nom} ?`,
      okText: 'Approuver',
      okType: 'primary',
      cancelText: 'Annuler',
      onOk: async () => {
        try {
          await AbsenceJustificationAPI.approveJustification(record.id);
          message.success('Justification approuvée');
          loadJustifications();
          setDrawerVisible(false);
        } catch (error) {
          message.error(error.message || 'Erreur');
        }
      },
    });
  };

  const handleReject = (record) => {
    setSelectedJustification(record);
    setActionModal('reject');
  };

  const handleRequestRevision = (record) => {
    setSelectedJustification(record);
    setActionModal('revision');
  };

  const submitRejectAction = async (values) => {
    try {
      await AbsenceJustificationAPI.rejectJustification(
        selectedJustification.id,
        values.reason
      );
      message.success('Justification rejetée');
      setActionModal(null);
      form.resetFields();
      loadJustifications();
      setDrawerVisible(false);
    } catch (error) {
      message.error(error.message || 'Erreur');
    }
  };

  const submitRevisionAction = async (values) => {
    try {
      await AbsenceJustificationAPI.requestRevision(
        selectedJustification.id,
        values.message
      );
      message.success('Demande de révision envoyée');
      setActionModal(null);
      form.resetFields();
      loadJustifications();
      setDrawerVisible(false);
    } catch (error) {
      message.error(error.message || 'Erreur');
    }
  };

  const getDocumentPreview = (justification) => {
    if (!justification.document_filename) return null;

    const filename = justification.document_filename;
    const isImage = /\.(jpg|jpeg|png)$/i.test(filename);

    if (isImage) {
      return (
        <div className="document-preview">
          <Image
            src={`/api/absences/justifications/${justification.id}/document`}
            alt="Justification document"
            style={{ maxWidth: '100%', maxHeight: 400 }}
          />
        </div>
      );
    }

    return (
      <div className="document-preview">
        <FileOutlined style={{ fontSize: 48, color: '#999' }} />
        <p>{filename}</p>
        <Button
          icon={<DownloadOutlined />}
          onClick={() => downloadDocument(justification)}
        >
          Télécharger le PDF
        </Button>
      </div>
    );
  };

  const downloadDocument = async (justification) => {
    try {
      const blob = await AbsenceJustificationAPI.downloadDocument(justification.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = justification.document_filename || 'document.pdf';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      message.error('Erreur');
    }
  };

  const columns = [
    {
      title: 'Étudiant',
      key: 'student',
      render: (_, record) => record.StudentAbsence?.User?.nom || 'N/A',
      width: 150,
    },
    {
      title: 'Classe',
      key: 'classe',
      render: (_, record) => record.Classe?.nom || 'N/A',
    },
    {
      title: 'Matière',
      key: 'matiere',
      render: (_, record) => record.Matiere?.nom || 'N/A',
    },
    {
      title: 'Type',
      dataIndex: 'justification_type',
      render: (type) => (
        <Tag color="blue">{AbsenceJustificationAPI.getTypeLabel(type)}</Tag>
      ),
    },
    {
      title: 'État',
      dataIndex: 'status',
      render: (status) => {
        const config = {
          pending: { icon: <ExclamationCircleOutlined />, color: 'warning' },
          approved: { icon: <CheckCircleOutlined />, color: 'success' },
          rejected: { icon: <CloseCircleOutlined />, color: 'error' },
          revision_needed: { icon: <ExclamationCircleOutlined />, color: 'warning' },
        };
        const c = config[status] || {};
        return (
          <Tag icon={c.icon} color={c.color}>
            {AbsenceJustificationAPI.getStatusLabel(status)}
          </Tag>
        );
      },
    },
    {
      title: 'Date',
      dataIndex: 'submitted_at',
      render: (date) => new Date(date).toLocaleDateString('fr-FR'),
      width: 100,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button
          type="primary"
          onClick={() => {
            setSelectedJustification(record);
            setDrawerVisible(true);
          }}
        >
          Examiner
        </Button>
      ),
      width: 100,
    },
  ];

  return (
    <div className="admin-justification-review">
      {/* Statistics Cards */}
      {stats && (
        <Card style={{ marginBottom: 20 }}>
          <Row gutter={16}>
            <Col xs={24} sm={6}>
              <Statistic
                title="En attente"
                value={stats.byStatus?.pending || 0}
                prefix={<ExclamationCircleOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Col>
            <Col xs={24} sm={6}>
              <Statistic
                title="Approuvées"
                value={stats.byStatus?.approved || 0}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Col>
            <Col xs={24} sm={6}>
              <Statistic
                title="Rejetées"
                value={stats.byStatus?.rejected || 0}
                prefix={<CloseCircleOutlined />}
                valueStyle={{ color: '#f5222d' }}
              />
            </Col>
            <Col xs={24} sm={6}>
              <Statistic
                title="Révision"
                value={stats.byStatus?.revision_needed || 0}
                prefix={<ExclamationCircleOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Col>
          </Row>
        </Card>
      )}

      {/* Main Card */}
      <Card>
        <div className="header-section">
          <h1>📋 Examen des Justifications d'Absence</h1>
          <Tabs
            activeKey={statusFilter}
            onChange={(key) => {
              setStatusFilter(key);
              setCurrentPage(1);
            }}
            items={[
              { label: 'En attente', key: 'pending' },
              { label: 'Approuvées', key: 'approved' },
              { label: 'Rejetées', key: 'rejected' },
              { label: 'Révision', key: 'revision_needed' },
              { label: 'Toutes', key: 'all' },
            ]}
          />
        </div>

        <Divider />

        {/* Table */}
        <Spin spinning={loading}>
          {justifications.length > 0 ? (
            <Table
              columns={columns}
              dataSource={justifications}
              rowKey="id"
              pagination={{
                current: currentPage,
                onChange: setCurrentPage,
                pageSize: 20,
              }}
              scroll={{ x: true }}
            />
          ) : (
            <Empty description="Aucune justification" />
          )}
        </Spin>
      </Card>

      {/* Detail Drawer */}
      <Drawer
        title="Détails de la justification"
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={600}
      >
        {selectedJustification && (
          <div className="justification-details">
            <div className="detail-section">
              <h3>Informations de l'étudiant</h3>
              <p>
                <strong>Nom:</strong> {selectedJustification.StudentAbsence?.User?.nom}
              </p>
              <p>
                <strong>Classe:</strong> {selectedJustification.Classe?.nom}
              </p>
              <p>
                <strong>Matière:</strong> {selectedJustification.Matiere?.nom}
              </p>
            </div>

            <Divider />

            <div className="detail-section">
              <h3>Détails de la justification</h3>
              <p>
                <strong>Titre:</strong> {selectedJustification.title}
              </p>
              <p>
                <strong>Type:</strong>{' '}
                {AbsenceJustificationAPI.getTypeLabel(selectedJustification.justification_type)}
              </p>
              <p>
                <strong>État:</strong>{' '}
                <Tag color="blue">
                  {AbsenceJustificationAPI.getStatusLabel(selectedJustification.status)}
                </Tag>
              </p>
              <p>
                <strong>Date de soumission:</strong>{' '}
                {new Date(selectedJustification.submitted_at).toLocaleDateString('fr-FR')}
              </p>
            </div>

            <Divider />

            <div className="detail-section">
              <h3>Explication</h3>
              <p className="explanation">{selectedJustification.explanation}</p>
            </div>

            <Divider />

            <div className="detail-section">
              <h3>Document justificatif</h3>
              {getDocumentPreview(selectedJustification)}
            </div>

            {selectedJustification.review_notes && (
              <>
                <Divider />
                <div className="detail-section">
                  <h3>Notes de révision</h3>
                  <p>{selectedJustification.review_notes}</p>
                </div>
              </>
            )}

            <Divider />

            {/* Action Buttons */}
            {selectedJustification.status === 'pending' && (
              <div className="action-buttons">
                <Space wrap>
                  <Button
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    onClick={() => handleApprove(selectedJustification)}
                  >
                    Approuver
                  </Button>
                  <Button
                    danger
                    icon={<CloseCircleOutlined />}
                    onClick={() => handleReject(selectedJustification)}
                  >
                    Rejeter
                  </Button>
                  <Button
                    icon={<ExclamationCircleOutlined />}
                    onClick={() => handleRequestRevision(selectedJustification)}
                  >
                    Demander plus d'info
                  </Button>
                </Space>
              </div>
            )}
          </div>
        )}
      </Drawer>

      {/* Reject Modal */}
      <Modal
        title="Rejeter la justification"
        open={actionModal === 'reject'}
        onCancel={() => {
          setActionModal(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={submitRejectAction}>
          <Form.Item
            name="reason"
            label="Raison du rejet"
            rules={[{ required: true, message: 'Veuillez indiquer la raison' }]}
          >
            <Input.TextArea rows={4} placeholder="Expliquez pourquoi cette justification est rejetée..." />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Rejeter
              </Button>
              <Button onClick={() => setActionModal(null)}>Annuler</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Revision Modal */}
      <Modal
        title="Demander une révision"
        open={actionModal === 'revision'}
        onCancel={() => {
          setActionModal(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={submitRevisionAction}>
          <Form.Item
            name="message"
            label="Message de révision"
            rules={[{ required: true, message: 'Veuillez entrer un message' }]}
          >
            <Input.TextArea rows={4} placeholder="Décrivez ce qui doit être revisé..." />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Envoyer
              </Button>
              <Button onClick={() => setActionModal(null)}>Annuler</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminJustificationReview;
