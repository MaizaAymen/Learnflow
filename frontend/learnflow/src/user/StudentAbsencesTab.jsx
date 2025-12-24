import React, { useEffect, useState } from 'react';
import {
  Card,
  Table,
  Space,
  Typography,
  Tag,
  Empty,
  Spin,
  Row,
  Col,
  Statistic,
  Progress,
  Divider,
  message,
  Button,
  Modal,
  Tooltip,
  Form,
  Input,
  DatePicker,
  Upload,
  Select
} from 'antd';
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  DownloadOutlined,
  ReloadOutlined,
  UploadOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const StudentAbsencesTab = ({ studentId }) => {
  const [absences, setAbsences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [eliminations, setEliminations] = useState({});
  const [justificationModalVisible, setJustificationModalVisible] = useState(false);
  const [selectedAbsence, setSelectedAbsence] = useState(null);
  const [justificationLoading, setJustificationLoading] = useState(false);
  const [justificationForm] = Form.useForm();
  const [statistics, setStatistics] = useState({
    total: 0,
    absent: 0,
    excused: 0,
    late: 0,
    present: 0
  });

  // Fetch absences for the student
  const fetchStudentAbsences = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/student/absences/${studentId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Impossible de charger les absences');
      }

      const data = await response.json();
      if (Array.isArray(data)) {
        setAbsences(data);
        calculateStatistics(data);
        calculateEliminations(data);
        message.success('Absences chargées avec succès');
      } else {
        setAbsences([]);
        message.info('Aucune absence enregistrée');
      }
    } catch (error) {
      console.error('Erreur de chargement des absences:', error);
      message.error('Impossible de charger vos absences. Vérifiez votre connexion.');
      setAbsences([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const calculateStatistics = (absenceList) => {
    const stats = {
      total: absenceList.length,
      absent: 0,
      excused: 0,
      late: 0,
      present: 0
    };

    absenceList.forEach(absence => {
      if (absence.absence_type === 'absent') stats.absent++;
      else if (absence.absence_type === 'excused') stats.excused++;
      else if (absence.absence_type === 'late') stats.late++;
      else if (absence.absence_type === 'present') stats.present++;
    });

    setStatistics(stats);
  };

  // Calculate eliminations per subject
  const calculateEliminations = (absenceList) => {
    const eliminationThreshold = 0.25; // 25% absences = elimination
    const eliminationMap = {};

    absenceList.forEach(absence => {
      const matiereName = absence.schedule?.matiere?.name || 'Matière inconnue';
      
      if (!eliminationMap[matiereName]) {
        eliminationMap[matiereName] = {
          total: 0,
          absences: 0,
          matiereName: matiereName,
          code: absence.schedule?.matiere?.code || ''
        };
      }

      eliminationMap[matiereName].total++;
      
      if (absence.absence_type === 'absent') {
        eliminationMap[matiereName].absences++;
      }
    });

    // Calculate elimination status
    Object.keys(eliminationMap).forEach(key => {
      const subject = eliminationMap[key];
      const absenceRate = subject.absences / subject.total;
      subject.rate = (absenceRate * 100).toFixed(2);
      subject.isEliminated = absenceRate >= eliminationThreshold;
    });

    setEliminations(eliminationMap);
  };

  useEffect(() => {
    if (studentId) {
      fetchStudentAbsences();
    }
  }, [studentId]);

  // Get status color and icon
  const getStatusTag = (absenceType) => {
    const statusMap = {
      present: { color: 'green', label: 'Présent', icon: <CheckCircleOutlined /> },
      absent: { color: 'red', label: 'Absent', icon: <ExclamationCircleOutlined /> },
      excused: { color: 'orange', label: 'Justifié', icon: <FileTextOutlined /> },
      late: { color: 'blue', label: 'Retard', icon: <ClockCircleOutlined /> },
      left_early: { color: 'purple', label: 'Départ anticipé', icon: <ExclamationCircleOutlined /> }
    };

    const status = statusMap[absenceType] || statusMap.absent;
    return <Tag icon={status.icon} color={status.color}>{status.label}</Tag>;
  };

  // Get approval status
  const getApprovalStatus = (statut) => {
    const statusMap = {
      pending: { color: 'orange', label: 'En attente', icon: <ClockCircleOutlined /> },
      approved: { color: 'green', label: 'Approuvé', icon: <CheckCircleOutlined /> },
      rejected: { color: 'red', label: 'Rejeté', icon: <ExclamationCircleOutlined /> }
    };

    const status = statusMap[statut] || statusMap.pending;
    return <Tag icon={status.icon} color={status.color}>{status.label}</Tag>;
  };

  // Open justification modal for a specific absence
  const handleOpenJustificationModal = (absence) => {
    setSelectedAbsence(absence);
    setJustificationModalVisible(true);
    justificationForm.resetFields();
  };

  // Close justification modal
  const handleCloseJustificationModal = () => {
    setJustificationModalVisible(false);
    setSelectedAbsence(null);
    justificationForm.resetFields();
  };

  // Submit justification for absence
  const handleSubmitJustification = async (values) => {
    if (!selectedAbsence) {
      message.error('Erreur: Absence non sélectionnée');
      return;
    }

    setJustificationLoading(true);
    try {
      const formData = new FormData();
      // Backend expects student_absence_id, not absence_id
      formData.append('student_absence_id', selectedAbsence.id);
      // Backend expects title (subject + date) and explanation (description)
      const subjectName = selectedAbsence.schedule?.matiere?.name || 'Absence';
      const dateStr = formatDate(selectedAbsence.schedule?.date_debut);
      formData.append('title', `Justification - ${subjectName} (${dateStr})`);
      formData.append('explanation', values.description);
      // Justification type must be one of: medical, family_issue, administrative, personal, other
      const typeMapping = {
        medical: 'medical',
        family: 'family_issue',
        other: 'other'
      };
      formData.append('justification_type', typeMapping[values.justification_type] || 'personal');

      // Add document if provided
      if (values.documents && values.documents.length > 0) {
        const file = values.documents[0].originFileObj;
        if (file) {
          formData.append('document', file);
        }
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/absences/justifications`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Backend error:', errorData);
        
        // Handle specific error cases
        if (response.status === 400) {
          if (errorData.currentStatus === 'pending') {
            throw new Error('⏳ Votre justification précédente est toujours en attente de révision. Veuillez attendre.');
          } else if (errorData.currentStatus === 'approved') {
            throw new Error('✅ Cette absence a déjà été justifiée et approuvée. Vous ne pouvez pas soumettre une nouvelle justification.');
          } else if (errorData.message) {
            throw new Error(errorData.message);
          }
        }
        
        throw new Error(errorData.error || `Erreur ${response.status}: Échec de la soumission`);
      }

      const data = await response.json();
      message.success('Justification soumise avec succès!');
      handleCloseJustificationModal();
      fetchStudentAbsences(); // Refresh data
    } catch (error) {
      console.error('Erreur détaillée:', error);
      message.error(error.message || 'Impossible de soumettre la justification. Veuillez réessayer.');
    } finally {
      setJustificationLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Columns for absences table
  const absenceColumns = [
    {
      title: 'Matière',
      dataIndex: ['schedule', 'matiere', 'name'],
      key: 'matiere',
      render: (text, record) => (
        <Tooltip title={record.schedule?.matiere?.code}>
          <span>{text || 'Non spécifiée'}</span>
        </Tooltip>
      ),
      width: 150
    },
    {
      title: 'Type',
      dataIndex: 'absence_type',
      key: 'absence_type',
      render: (text) => getStatusTag(text),
      width: 120
    },
    {
      title: 'Date',
      dataIndex: ['schedule', 'date_debut'],
      key: 'date',
      render: (text) => formatDate(text),
      width: 160
    },
    {
      title: 'Enseignant',
      dataIndex: ['schedule', 'enseignant_id'],
      key: 'enseignant',
      render: (text) => text || 'Non renseigné',
      width: 100
    },
    {
      title: 'Motif',
      dataIndex: 'motif',
      key: 'motif',
      render: (text) => text || '-',
      ellipsis: {
        showTitle: false,
      },
      render: (text) => (
        <Tooltip title={text}>
          {text ? text.substring(0, 50) + (text.length > 50 ? '...' : '') : '-'}
        </Tooltip>
      )
    },
    {
      title: 'Statut',
      dataIndex: 'statut',
      key: 'statut',
      render: (text) => getApprovalStatus(text),
      width: 120
    },
    {
      title: 'Notes',
      dataIndex: 'notes',
      key: 'notes',
      render: (text) => (
        <Tooltip title={text}>
          {text ? text.substring(0, 30) + (text.length > 30 ? '...' : '') : '-'}
        </Tooltip>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 180,
      render: (_, record) => {
        // Determine button state
        const isPresent = record.absence_type === 'present';
        const isAlreadyApproved = record.statut === 'approved';
        const canJustify = !isPresent && !isAlreadyApproved;
        
        return (
          <Space size="small">
            <Tooltip title={
              isPresent ? 'Vous êtes présent, pas besoin de justification' :
              isAlreadyApproved ? 'Cette absence est déjà justifiée et approuvée' :
              'Soumettre une justification pour cette absence'
            }>
              <Button
                type={canJustify ? "primary" : "default"}
                size="small"
                onClick={() => handleOpenJustificationModal(record)}
                disabled={!canJustify}
              >
                {isAlreadyApproved ? '✓ Justifiée' : 'Justifier'}
              </Button>
            </Tooltip>
          </Space>
        );
      }
    }
  ];

  // Elimination columns
  const eliminationColumns = [
    {
      title: 'Matière',
      dataIndex: 'matiereName',
      key: 'matiereName',
      render: (text, record) => (
        <Tooltip title={record.code}>
          <span><strong>{text}</strong></span>
        </Tooltip>
      ),
      width: 200
    },
    {
      title: 'Cours Total',
      dataIndex: 'total',
      key: 'total',
      render: (text) => <Tag color="blue">{text}</Tag>,
      width: 100
    },
    {
      title: 'Absences',
      dataIndex: 'absences',
      key: 'absences',
      render: (text) => <Tag color="red">{text}</Tag>,
      width: 100
    },
    {
      title: 'Taux (%)',
      dataIndex: 'rate',
      key: 'rate',
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Progress 
            type="circle" 
            percent={parseFloat(text)} 
            size={40}
            strokeColor={parseFloat(text) >= 25 ? '#ff4d4f' : '#52c41a'}
          />
          <span>{text}%</span>
        </div>
      ),
      width: 150
    },
    {
      title: 'État',
      dataIndex: 'isEliminated',
      key: 'isEliminated',
      render: (isEliminated) => (
        isEliminated ? 
          <Tag icon={<ExclamationCircleOutlined />} color="red">ÉLIMINÉ (25%+)</Tag> :
          <Tag icon={<CheckCircleOutlined />} color="green">ADMIS</Tag>
      ),
      width: 150
    }
  ];

  return (
    <div className="page-wrapper animate-fadeInUp">
      <div className="app-container">
        {/* Statistics Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} md={6}>
            <Card className="data-card hover-lift" styles={{ body: { padding: '16px' } }}>
              <Statistic
                title="Absences Total"
                value={statistics.total}
                prefix={<ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="data-card hover-lift" styles={{ body: { padding: '16px' } }}>
              <Statistic
                title="Non Justifiées"
                value={statistics.absent}
                prefix={<ExclamationCircleOutlined style={{ color: '#ff7a45' }} />}
                valueStyle={{ color: '#ff7a45' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="data-card hover-lift" styles={{ body: { padding: '16px' } }}>
              <Statistic
                title="Justifiées"
                value={statistics.excused}
                prefix={<FileTextOutlined style={{ color: '#faad14' }} />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="data-card hover-lift" styles={{ body: { padding: '16px' } }}>
              <Statistic
                title="Présences"
                value={statistics.present}
                prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Absence History Section */}
        <Card
          title={
            <Space>
              <ClockCircleOutlined style={{ color: '#1890ff', fontSize: '20px' }} />
              <span>Historique des Absences</span>
            </Space>
          }
          extra={
            <Button 
              type="primary" 
              icon={<ReloadOutlined />}
              onClick={fetchStudentAbsences}
              loading={loading}
            >
              Actualiser
            </Button>
          }
          style={{ marginBottom: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
          styles={{ body: { padding: '16px' } }}
        >
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Spin size="large" />
              <Text style={{ display: 'block', marginTop: '16px' }}>
                Chargement de vos absences...
              </Text>
            </div>
          ) : absences.length === 0 ? (
            <Empty
              description="Aucune absence enregistrée"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              style={{ marginTop: '20px' }}
            >
              <Paragraph type="secondary">
                Vous n'avez pas d'absences enregistrées dans le système.
              </Paragraph>
            </Empty>
          ) : (
            <Table
              columns={absenceColumns}
              dataSource={absences.map((absence, index) => ({ ...absence, key: absence.id || index }))}
              pagination={{ pageSize: 10, responsive: true }}
              scroll={{ x: true }}
              rowClassName={(record) => {
                if (record.absence_type === 'absent') return 'table-row-error';
                if (record.absence_type === 'excused') return 'table-row-warning';
                return 'table-row-success';
              }}
            />
          )}
        </Card>

        <Divider />

        {/* Elimination Status Section */}
        <Card
          title={
            <Space>
              <ExclamationCircleOutlined style={{ color: '#ff4d4f', fontSize: '20px' }} />
              <span>État d'Élimination par Matière</span>
            </Space>
          }
          style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
          styles={{ body: { padding: '16px' } }}
        >
          <Paragraph type="secondary" style={{ marginBottom: '16px' }}>
            <strong>Seuil d'élimination:</strong> 25% d'absences = Élimination de la matière
          </Paragraph>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Spin size="large" />
              <Text style={{ display: 'block', marginTop: '16px' }}>
                Calcul de l'état d'élimination...
              </Text>
            </div>
          ) : Object.keys(eliminations).length === 0 ? (
            <Empty
              description="Aucune donnée disponible"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              style={{ marginTop: '20px' }}
            />
          ) : (
            <Table
              columns={eliminationColumns}
              dataSource={Object.values(eliminations).map((elim, index) => ({ ...elim, key: elim.matiereName || index }))}
              pagination={false}
              scroll={{ x: true }}
              rowClassName={(record) => record.isEliminated ? 'table-row-error' : 'table-row-success'}
            />
          )}
        </Card>

        {/* Export Section */}
        <Card
          style={{ marginTop: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
          styles={{ body: { padding: '16px' } }}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text strong>Actions</Text>
            <Space>
              <Button 
                type="primary" 
                icon={<DownloadOutlined />}
                onClick={() => {
                  message.info('Export en PDF en cours de développement');
                }}
              >
                Télécharger en PDF
              </Button>
              <Button 
                icon={<FileTextOutlined />}
                onClick={() => {
                  message.info('Export en CSV en cours de développement');
                }}
              >
                Exporter en CSV
              </Button>
            </Space>
          </Space>
        </Card>

        {/* Justification Modal */}
        <Modal
          title={`Justifier votre absence - ${selectedAbsence?.schedule?.matiere?.name || 'Matière'}`}
          open={justificationModalVisible}
          onCancel={handleCloseJustificationModal}
          footer={null}
          width={700}
        >
          {selectedAbsence && (
            <div style={{ marginBottom: '20px' }}>
              <Row gutter={16} style={{ marginBottom: '20px' }}>
                <Col xs={24} sm={12}>
                  <div>
                    <Text strong>Matière:</Text>
                    <br />
                    <Text>{selectedAbsence.schedule?.matiere?.name || 'Non spécifiée'}</Text>
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <div>
                    <Text strong>Date:</Text>
                    <br />
                    <Text>{formatDate(selectedAbsence.schedule?.date_debut)}</Text>
                  </div>
                </Col>
              </Row>

              <Form
                form={justificationForm}
                layout="vertical"
                onFinish={handleSubmitJustification}
              >
                <Form.Item
                  label="Type de justification"
                  name="justification_type"
                  initialValue="medical"
                  rules={[{ required: true, message: 'Veuillez sélectionner un type' }]}
                >
                  <Select placeholder="Sélectionnez un type">
                    <Select.Option value="medical">Justification médicale</Select.Option>
                    <Select.Option value="family">Raison familiale</Select.Option>
                    <Select.Option value="other">Autre raison</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  label="Description / Motif"
                  name="description"
                  rules={[
                    { required: true, message: 'Veuillez décrire le motif de votre absence' },
                    { min: 10, message: 'La description doit contenir au moins 10 caractères' },
                    { max: 500, message: 'La description ne doit pas dépasser 500 caractères' }
                  ]}
                >
                  <Input.TextArea 
                    rows={4}
                    placeholder="Décrivez le motif de votre absence..."
                    showCount
                    maxLength={500}
                  />
                </Form.Item>

                <Form.Item
                  label="Document justificatif (optionnel)"
                  name="documents"
                  valuePropName="fileList"
                  getValueFromEvent={(e) => e?.fileList}
                >
                  <Upload
                    maxCount={1}
                    beforeUpload={() => false}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  >
                    <Button icon={<UploadOutlined />}>
                      Télécharger un document
                    </Button>
                  </Upload>
                </Form.Item>

                <Form.Item>
                  <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                    <Button onClick={handleCloseJustificationModal}>
                      Annuler
                    </Button>
                    <Button 
                      type="primary" 
                      htmlType="submit"
                      loading={justificationLoading}
                    >
                      Soumettre la justification
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default StudentAbsencesTab;
