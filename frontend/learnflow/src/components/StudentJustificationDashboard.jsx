import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Table,
  Modal,
  Form,
  Input,
  Select,
  Upload,
  Tag,
  Space,
  Spin,
  Empty,
  message,
  Divider,
  Collapse,
  Alert,
} from 'antd';
import {
  UploadOutlined,
  EditOutlined,
  DeleteOutlined,
  DownloadOutlined,
  FileOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import AbsenceJustificationAPI from '@/services/AbsenceJustificationAPI.js';
import './StudentJustificationDashboard.css';

const StudentJustificationDashboard = () => {
  const [justifications, setJustifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [statusFilter, setStatusFilter] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Helper function to get type label
  const getTypeLabel = (type) => {
    const typeLabels = {
      medical: 'Médicale',
      family_issue: 'Problème familial',
      administrative: 'Administrative',
      personal: 'Personnelle',
      other: 'Autre'
    };
    return typeLabels[type] || type;
  };

  // Load justifications on mount
  useEffect(() => {
    loadJustifications();
  }, [statusFilter, currentPage]);

  const loadJustifications = async () => {
    setLoading(true);
    try {
      const data = await AbsenceJustificationAPI.getMyJustifications(statusFilter, currentPage);
      setJustifications(data.data || []);
    } catch (error) {
      message.error('Erreur lors du chargement des justifications');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (record = null) => {
    if (record) {
      setEditingId(record.id);
      form.setFieldsValue({
        title: record.title,
        explanation: record.explanation,
        justification_type: record.justification_type,
      });
      if (record.document_filename) {
        setFileList([
          {
            uid: '-1',
            name: record.document_filename,
            status: 'done',
            url: `/api/absences/justifications/${record.id}/document`,
          },
        ]);
      }
    } else {
      setEditingId(null);
      form.resetFields();
      setFileList([]);
      setSelectedFile(null);
    }
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setEditingId(null);
    setSelectedFile(null);
    setFileList([]);
    form.resetFields();
  };

  const handleSubmit = async (values) => {
    try {
      // Validate file for new justifications
      if (!editingId && !selectedFile && fileList.length === 0) {
        message.warning('Veuillez télécharger un document');
        return;
      }

      const justificationData = {
        title: values.title,
        explanation: values.explanation,
        justification_type: values.justification_type,
        document: selectedFile,
      };

      if (editingId) {
        await AbsenceJustificationAPI.updateJustification(editingId, justificationData);
        message.success('Justification mise à jour avec succès');
      } else {
        // For new submission, need absence ID - would come from props or context
        const absenceId = sessionStorage.getItem('currentAbsenceId');
        if (!absenceId) {
          message.error('ID d\'absence manquant');
          return;
        }
        await AbsenceJustificationAPI.submitJustification(absenceId, justificationData);
        message.success('Justification soumise avec succès');
      }

      handleCloseModal();
      loadJustifications();
    } catch (error) {
      message.error(error.message || 'Erreur lors de la sauvegarde');
    }
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: 'Confirmation de suppression',
      content: 'Êtes-vous sûr de vouloir supprimer cette justification ?',
      okText: 'Supprimer',
      okType: 'danger',
      cancelText: 'Annuler',
      onOk: async () => {
        try {
          await AbsenceJustificationAPI.deleteJustification(record.id);
          message.success('Justification supprimée');
          loadJustifications();
        } catch (error) {
          message.error('Erreur lors de la suppression');
        }
      },
    });
  };

  const handleDownload = async (record) => {
    try {
      const blob = await AbsenceJustificationAPI.downloadDocument(record.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = record.document_filename || 'document.pdf';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      message.error('Erreur lors du téléchargement');
    }
  };

  const handleFileChange = ({ fileList: newFileList, file }) => {
    setFileList(newFileList);
    if (file.originFileObj) {
      try {
        AbsenceJustificationAPI.validateFile(file.originFileObj);
        setSelectedFile(file.originFileObj);
      } catch (error) {
        message.error(error.message);
        setFileList([]);
        setSelectedFile(null);
      }
    }
  };

  const columns = [
    {
      title: 'Titre',
      dataIndex: 'title',
      key: 'title',
      width: 150,
    },
    {
      title: 'Type',
      dataIndex: 'justification_type',
      key: 'type',
      render: (type) => (
        <Tag color="blue">{getTypeLabel(type)}</Tag>
      ),
    },
    {
      title: 'État',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusConfig = {
          pending: { icon: <ClockCircleOutlined />, color: 'warning', label: 'En attente' },
          approved: { icon: <CheckCircleOutlined />, color: 'success', label: 'Approuvée' },
          rejected: { icon: <CloseCircleOutlined />, color: 'error', label: 'Rejetée' },
          revision_needed: { icon: <ExclamationCircleOutlined />, color: 'warning', label: 'Révision nécessaire' },
        };
        const config = statusConfig[status] || { label: status };
        return (
          <Tag icon={config.icon} color={config.color}>
            {config.label}
          </Tag>
        );
      },
    },
    {
      title: 'Date de soumission',
      dataIndex: 'submitted_at',
      key: 'submitted_at',
      render: (date) => new Date(date).toLocaleDateString('fr-FR'),
    },
    {
      title: 'Document',
      key: 'document',
      render: (_, record) => (
        record.document_filename ? (
          <Button
            type="link"
            icon={<DownloadOutlined />}
            onClick={() => handleDownload(record)}
          >
            Télécharger
          </Button>
        ) : (
          <span>-</span>
        )
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          {(record.status === 'pending' || record.status === 'revision_needed') && (
            <Button
              type="primary"
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleOpenModal(record)}
            >
              Modifier
            </Button>
          )}
          {(record.status === 'pending' || record.status === 'revision_needed') && (
            <Button
              danger
              icon={<DeleteOutlined />}
              size="small"
              onClick={() => handleDelete(record)}
            >
              Supprimer
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="student-justification-dashboard">
      <Card className="justification-card">
        <div className="dashboard-header">
          <h1>📋 Mes Justifications d'Absence</h1>
          <Button
            type="primary"
            size="large"
            onClick={() => handleOpenModal()}
          >
            + Nouvelle Justification
          </Button>
        </div>

        <Divider />

        {/* Status Filter */}
        <div className="filter-section">
          <Select
            placeholder="Filtrer par état"
            style={{ width: 200 }}
            allowClear
            onChange={setStatusFilter}
            options={[
              { label: 'En attente', value: 'pending' },
              { label: 'Approuvée', value: 'approved' },
              { label: 'Rejetée', value: 'rejected' },
              { label: 'Révision nécessaire', value: 'revision_needed' },
            ]}
          />
        </div>

        <Divider />

        {/* Info Alert */}
        <Alert
          message="Information"
          description="Vous pouvez justifier vos absences en téléchargeant un document (PDF, JPG, PNG) et en expliquant votre situation."
          type="info"
          showIcon
          style={{ marginBottom: 20 }}
        />

        {/* Justifications Table */}
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
            <Empty description="Aucune justification trouvée" />
          )}
        </Spin>
      </Card>

      {/* Modal for Submit/Edit */}
      <Modal
        title={editingId ? 'Modifier la justification' : 'Nouvelle justification'}
        open={modalVisible}
        onCancel={handleCloseModal}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="title"
            label="Titre de la justification"
            rules={[
              { required: true, message: 'Le titre est obligatoire' },
              { min: 3, message: 'Minimum 3 caractères' },
              { max: 255, message: 'Maximum 255 caractères' },
            ]}
          >
            <Input placeholder="Décrivez brièvement votre justification" />
          </Form.Item>

          <Form.Item
            name="justification_type"
            label="Type de justification"
            rules={[{ required: true, message: 'Veuillez sélectionner un type' }]}
          >
            <Select
              placeholder="Choisir un type"
              options={[
                { label: 'Médicale', value: 'medical' },
                { label: 'Problème familial', value: 'family_issue' },
                { label: 'Administrative', value: 'administrative' },
                { label: 'Personnelle', value: 'personal' },
                { label: 'Autre', value: 'other' },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="explanation"
            label="Explication détaillée"
            rules={[
              { required: true, message: 'L\'explication est obligatoire' },
              { min: 10, message: 'Minimum 10 caractères' },
              { max: 5000, message: 'Maximum 5000 caractères' },
            ]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Expliquez en détail les raisons de votre absence..."
            />
          </Form.Item>

          <Form.Item
            label="Document justificatif"
            required={!editingId}
          >
            <Upload
              maxCount={1}
              accept=".pdf,.jpg,.jpeg,.png"
              beforeUpload={() => false}
              onChange={handleFileChange}
              fileList={fileList}
            >
              <Button icon={<UploadOutlined />}>
                Cliquez pour télécharger (PDF, JPG, PNG - Max 10MB)
              </Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingId ? 'Mettre à jour' : 'Soumettre'}
              </Button>
              <Button onClick={handleCloseModal}>Annuler</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default StudentJustificationDashboard;
