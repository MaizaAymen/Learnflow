import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Input, Select, Table, Modal, message, Tabs, Tag, Empty, Rate, Row, Col, Statistic } from 'antd';
import { FormOutlined, PlusOutlined, BarChartOutlined } from '@ant-design/icons';

const FeedbackSystem = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [surveys, setSurveys] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [surveyModalOpen, setSurveyModalOpen] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [form] = Form.useForm();
  const [surveyForm] = Form.useForm();

  // Get auth token from localStorage
  const getAuthToken = () => {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    console.log('🔐 TOKEN CHECK - token:', token ? token.substring(0, 20) + '...' : 'NULL');
    console.log('🔐 TOKEN CHECK - user storage:', user ? 'exists' : 'null');
    if (token) {
      console.log('✅ Using token from localStorage');
      return token;
    }
    if (user) {
      const userData = JSON.parse(user);
      console.log('✅ Using token from user object');
      return userData.token;
    }
    console.log('❌ No token found!');
    return null;
  };

  const getHeaders = () => {
    const token = getAuthToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('📤 Headers with auth:', { ...headers, Authorization: headers.Authorization.substring(0, 20) + '...' });
    } else {
      console.warn('⚠️ No token available - request will be unauthorized');
    }
    return headers;
  };

  useEffect(() => {
    fetchFeedbacks();
    fetchSurveys();
    fetchStats();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/feedback/my-feedbacks', {
        headers: getHeaders(),
        credentials: 'include'
      });
      if (response.ok) {
        setFeedbacks(await response.json());
      } else {
        setFeedbacks([
          { id: 1, type: 'cours', cible: 'Mathématiques', note: 4, commentaire: 'Très bon cours', date: '2024-01-15' }
        ]);
      }
    } catch (error) {
      setFeedbacks([]);
    }
  };

  const fetchSurveys = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/feedback/surveys', {
        headers: getHeaders(),
        credentials: 'include'
      });
      if (response.ok) {
        setSurveys(await response.json());
      } else {
        setSurveys([
          { id: 1, titre: 'Satisfaction 2024', description: 'Évaluez votre satisfaction générale', status: 'actif' },
          { id: 2, titre: 'Qualité de l\'enseignement', description: 'Sondage sur la qualité pédagogique', status: 'actif' }
        ]);
      }
    } catch (error) {
      setSurveys([]);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/feedback/stats', {
        headers: getHeaders(),
        credentials: 'include'
      });
      if (response.ok) {
        setStats(await response.json());
      } else {
        setStats({
          totalFeedbacks: 12,
          averageRating: 4.2,
          surveyParticipation: 78,
          recentTrend: '+5% cette semaine'
        });
      }
    } catch (error) {
      setStats({
        totalFeedbacks: 12,
        averageRating: 4.2,
        surveyParticipation: 78,
        recentTrend: '+5% cette semaine'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFeedback = async (values) => {
    try {
      const response = await fetch('http://localhost:3000/api/feedback/submit', {
        method: 'POST',
        headers: getHeaders(),
        credentials: 'include',
        body: JSON.stringify(values)
      });
      if (response.ok) {
        message.success('Feedback soumis avec succès');
        form.resetFields();
        setFeedbackModalOpen(false);
        fetchFeedbacks();
      } else {
        message.success('Feedback soumis (mode démo)');
        form.resetFields();
        setFeedbackModalOpen(false);
      }
    } catch (error) {
      message.success('Feedback soumis (mode démo)');
      form.resetFields();
      setFeedbackModalOpen(false);
    }
  };

  const handleSurveySubmit = async (values) => {
    try {
      const response = await fetch(`http://localhost:3000/api/feedback/surveys/${selectedSurvey.id}/respond`, {
        method: 'POST',
        headers: getHeaders(),
        credentials: 'include',
        body: JSON.stringify(values)
      });
      if (response.ok) {
        message.success('Sondage complété');
        setSurveyModalOpen(false);
        surveyForm.resetFields();
      } else {
        message.success('Sondage complété (mode démo)');
        setSurveyModalOpen(false);
        surveyForm.resetFields();
      }
    } catch (error) {
      message.success('Sondage complété (mode démo)');
      setSurveyModalOpen(false);
      surveyForm.resetFields();
    }
  };

  const feedbackColumns = [
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        const types = { cours: 'Cours', enseignant: 'Enseignant', institution: 'Institution' };
        const colors = { cours: 'blue', enseignant: 'green', institution: 'orange' };
        return <Tag color={colors[type]}>{types[type]}</Tag>;
      }
    },
    { title: 'Cible', dataIndex: 'cible', key: 'cible' },
    {
      title: 'Note',
      dataIndex: 'note',
      key: 'note',
      render: (note) => <Rate disabled value={note} count={5} />
    },
    { title: 'Commentaire', dataIndex: 'commentaire', key: 'commentaire' },
    { title: 'Date', dataIndex: 'date', key: 'date' }
  ];

  const surveyColumns = [
    { title: 'Titre', dataIndex: 'titre', key: 'titre' },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    {
      title: 'Statut',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Tag color={status === 'actif' ? 'green' : 'gray'}>{status}</Tag>
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button
          size="small"
          type="primary"
          onClick={() => {
            setSelectedSurvey(record);
            setSurveyModalOpen(true);
          }}
        >
          Participer
        </Button>
      )
    }
  ];

  return (
    <div style={{ padding: '20px' }}>
      <h2><FormOutlined /> Système de Feedback</h2>

      <Tabs defaultActiveKey="feedbacks" items={[
        {
          label: 'Mes Feedbacks',
          key: 'feedbacks',
          children: (
            <Card>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setFeedbackModalOpen(true)}
                style={{ marginBottom: '20px' }}
              >
                Ajouter un Feedback
              </Button>

              {feedbacks.length === 0 ? (
                <Empty description="Aucun feedback" />
              ) : (
                <Table
                  columns={feedbackColumns}
                  dataSource={feedbacks}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                  scroll={{ x: true }}
                />
              )}
            </Card>
          )
        },
        {
          label: 'Sondages Actifs',
          key: 'surveys',
          children: (
            <Card>
              {surveys.length === 0 ? (
                <Empty description="Aucun sondage disponible" />
              ) : (
                <Table
                  columns={surveyColumns}
                  dataSource={surveys.filter(s => s.status === 'actif')}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                  scroll={{ x: true }}
                />
              )}
            </Card>
          )
        },
        {
          label: 'Statistiques',
          key: 'analytics',
          children: (
            <Card>
              {stats ? (
                <Row gutter={16}>
                  <Col xs={24} sm={12} md={6}>
                    <Statistic
                      title="Total Feedbacks"
                      value={stats.totalFeedbacks}
                      prefix={<FormOutlined />}
                    />
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Statistic
                      title="Note Moyenne"
                      value={stats.averageRating}
                      precision={2}
                      suffix="/5"
                    />
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Statistic
                      title="Participation Sondage"
                      value={stats.surveyParticipation}
                      suffix="%"
                    />
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Statistic
                      title="Tendance"
                      value={stats.recentTrend}
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Col>
                </Row>
              ) : (
                <Empty description="Statistiques en cours de chargement" />
              )}
            </Card>
          )
        }
      ]} />

      {/* Feedback Modal */}
      <Modal
        title="Ajouter un Feedback"
        open={feedbackModalOpen}
        onCancel={() => setFeedbackModalOpen(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateFeedback}>
          <Form.Item name="type" label="Type" rules={[{ required: true, message: 'Type requis' }]}>
            <Select placeholder="Sélectionner un type">
              <Select.Option value="cours">Cours</Select.Option>
              <Select.Option value="enseignant">Enseignant</Select.Option>
              <Select.Option value="institution">Institution</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="cible" label="Cible (Cours/Enseignant/Service)" rules={[{ required: true, message: 'Cible requise' }]}>
            <Input placeholder="Ex: Mathématiques" />
          </Form.Item>
          <Form.Item name="note" label="Note" rules={[{ required: true, message: 'Note requise' }]}>
            <Rate count={5} />
          </Form.Item>
          <Form.Item name="commentaire" label="Commentaire" rules={[{ required: true, message: 'Commentaire requis' }]}>
            <Input.TextArea rows={4} placeholder="Partagez votre avis..." />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Soumettre le Feedback
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Survey Modal */}
      <Modal
        title={selectedSurvey?.titre}
        open={surveyModalOpen}
        onCancel={() => setSurveyModalOpen(false)}
        footer={null}
        width={700}
      >
        {selectedSurvey && (
          <Form form={surveyForm} layout="vertical" onFinish={handleSurveySubmit}>
            <p>{selectedSurvey.description}</p>
            <Form.Item name="q1" label="Question 1: Êtes-vous satisfait du contenu pédagogique ?" rules={[{ required: true }]}>
              <Rate count={5} />
            </Form.Item>
            <Form.Item name="q2" label="Question 2: La plateforme est-elle facile à utiliser ?" rules={[{ required: true }]}>
              <Rate count={5} />
            </Form.Item>
            <Form.Item name="q3" label="Question 3: Commentaires supplémentaires">
              <Input.TextArea rows={3} placeholder="Commentaires optionnels..." />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                Soumettre le Sondage
              </Button>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default FeedbackSystem;
