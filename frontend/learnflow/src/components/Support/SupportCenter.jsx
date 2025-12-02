import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Input, Select, Table, Modal, message, Tabs, Collapse, Tag, Empty } from 'antd';
import { MessageOutlined, QuestionCircleOutlined, PlusOutlined } from '@ant-design/icons';
import ChatSupport from './ChatSupport';

const SupportCenter = () => {
  const [tickets, setTickets] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [ticketDetail, setTicketDetail] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [form] = Form.useForm();

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
    fetchTickets();
    fetchFAQs();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/support/my-tickets', {
        headers: getHeaders(),
        credentials: 'include'
      });
      if (response.ok) {
        setTickets(await response.json());
      } else {
        setTickets([
          { id: 1, titre: 'Problème d\'accès', categorie: 'technique', priorite: 'haute', statut: 'ouvert', description: 'Je ne peux pas accéder à mon compte' }
        ]);
      }
    } catch (error) {
      setTickets([]);
    }
  };

  const fetchFAQs = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/support/faqs', {
        headers: getHeaders(),
        credentials: 'include'
      });
      if (response.ok) {
        setFaqs(await response.json());
      } else {
        setFaqs([
          { id: 1, categorie: 'inscription', question: 'Comment créer un compte ?', reponse: 'Visitez la page d\'inscription et remplissez le formulaire' },
          { id: 2, categorie: 'technique', question: 'Navigateurs supportés ?', reponse: 'Chrome, Firefox, Safari, Edge version 2023+' }
        ]);
      }
    } catch (error) {
      setFaqs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (values) => {
    try {
      console.log('📤 POST /api/support/tickets - Request body:', JSON.stringify(values, null, 2));
      
      const token = getAuthToken();
      if (!token) {
        message.error('Authentication requise');
        return;
      }

      const response = await fetch('http://localhost:3000/api/support/tickets', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(values)
      });

      console.log('📥 Response status:', response.status);
      const responseData = await response.json();
      console.log('📥 Response data:', responseData);

      if (response.ok) {
        message.success('Ticket créé avec succès');
        form.resetFields();
        setCreateModalOpen(false);
        fetchTickets();
      } else {
        message.error(`Erreur: ${responseData.error || 'Erreur inconnue'}`);
      }
    } catch (error) {
      console.error('❌ Error creating ticket:', error);
      message.error('Erreur lors de la création du ticket');
    }
  };

  const ticketColumns = [
    { title: 'Numéro', dataIndex: 'id', key: 'id', render: (id) => `#${id}` },
    { title: 'Titre', dataIndex: 'titre', key: 'titre' },
    {
      title: 'Catégorie',
      dataIndex: 'categorie',
      key: 'categorie',
      render: (cat) => {
        const colors = { technique: 'blue', academique: 'green', administratif: 'orange', autre: 'default' };
        return <Tag color={colors[cat]}>{cat}</Tag>;
      }
    },
    {
      title: 'Priorité',
      dataIndex: 'priorite',
      key: 'priorite',
      render: (pri) => {
        const colors = { basse: 'blue', normale: 'green', haute: 'orange', urgente: 'red' };
        return <Tag color={colors[pri]}>{pri}</Tag>;
      }
    },
    {
      title: 'Statut',
      dataIndex: 'statut',
      key: 'statut',
      render: (statut) => {
        const colors = { ouvert: 'blue', en_cours: 'orange', resolu: 'green', ferme: 'gray' };
        return <Tag color={colors[statut]}>{statut}</Tag>;
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button size="small" onClick={() => {
          setTicketDetail(record);
          setDetailModalOpen(true);
        }}>
          Détails
        </Button>
      )
    }
  ];

  const faqsByCategory = faqs.reduce((acc, faq) => {
    if (!acc[faq.categorie]) acc[faq.categorie] = [];
    acc[faq.categorie].push(faq);
    return acc;
  }, {});

  const tabItems = [
    {
      label: 'Mes Tickets',
      key: 'tickets',
      children: (
        <Card>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalOpen(true)}
            style={{ marginBottom: '20px',
              color: 'white',
              background: 'linear-gradient(135deg, #383636ff 0%, #242424ff 100%)',
              border: 'none'
             }}
          >
            Créer un Ticket
          </Button>

          {tickets.length === 0 ? (
            <Empty description="Aucun ticket" />
          ) : (
            <Table
              columns={ticketColumns}
              dataSource={tickets}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              scroll={{ x: true }}
            />
          )}
        </Card>
      )
    },
    {
      label: 'FAQ',
      key: 'faq',
      children: (
        <Card>
          {Object.keys(faqsByCategory).length === 0 ? (
            <Empty description="Aucune FAQ disponible" />
          ) : (
            Object.entries(faqsByCategory).map(([category, categoryFaqs]) => (
              <div key={category} style={{ marginBottom: '30px' }}>
                <h3><QuestionCircleOutlined /> {category}</h3>
                <Collapse
                  items={categoryFaqs.map(faq => ({
                    key: faq.id,
                    label: faq.question,
                    children: <p>{faq.reponse}</p>
                  }))}
                />
              </div>
            ))
          )}
        </Card>
      )
    },
    {
      label: 'Chat Support',
      key: 'chat',
      children: (
        <ChatSupport />
      )
    }
  ];

  return (
    <div style={{ padding: '20px' }}>
      <Card title={<><MessageOutlined /> Support Center</>} extra={<span>Besoin d'aide ?</span>}>
        <Tabs defaultActiveKey="tickets" items={tabItems} />
      </Card>

      {/* Create Ticket Modal */}
      <Modal
        title="Créer un Ticket de Support"
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateTicket}>
          <Form.Item name="titre" label="Titre" rules={[{ required: true, message: 'Titre requis' }]}>
            <Input placeholder="Résumé de votre problème" />
          </Form.Item>
          <Form.Item name="description" label="Description" rules={[{ required: true, message: 'Description requise' }]}>
            <Input.TextArea rows={4} placeholder="Décrivez votre problème en détail..." />
          </Form.Item>
          <Form.Item name="categorie" label="Catégorie" rules={[{ required: true, message: 'Catégorie requise' }]}>
            <Select placeholder="Sélectionner une catégorie">
              <Select.Option value="technique">Technique</Select.Option>
              <Select.Option value="academique">Académique</Select.Option>
              <Select.Option value="administratif">Administratif</Select.Option>
              <Select.Option value="autre">Autre</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="priorite" label="Priorité" initialValue="normale">
            <Select>
              <Select.Option value="basse">Basse</Select.Option>
              <Select.Option value="normale">Normale</Select.Option>
              <Select.Option value="haute">Haute</Select.Option>
              <Select.Option value="urgente">Urgente</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Créer le Ticket
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Ticket Detail Modal */}
      <Modal
        title={`Ticket #${ticketDetail?.id}`}
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={null}
        width={700}
      >
        {ticketDetail && (
          <div>
            <p><strong>Titre:</strong> {ticketDetail.titre}</p>
            <p><strong>Statut:</strong> <Tag>{ticketDetail.statut}</Tag></p>
            <p><strong>Description:</strong></p>
            <p>{ticketDetail.description}</p>
            <hr />
            <h4>Messages</h4>
            <Input.TextArea
              rows={3}
              placeholder="Ajouter un message..."
              onPressEnter={(e) => {
                if (e.currentTarget.value) {
                  message.success('Message ajouté');
                  e.currentTarget.value = '';
                }
              }}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SupportCenter;
