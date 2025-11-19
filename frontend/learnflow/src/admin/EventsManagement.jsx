import React, { useState, useEffect } from 'react';
import { Button, Form, Input, Select, DatePicker, Switch, message, Modal, Spin, Space, Tag, Card, Empty, Drawer, Table, Badge } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined, TeamOutlined } from '@ant-design/icons';
import EventsAPI from '../services/EventsAPI';
import dayjs from 'dayjs';
import './EventsManagement.css';

const eventTypesMap = {
  'fermeture': 'Fermeture Exceptionnelle',
  'conference': 'Conférence',
  'journee_scientifique': 'Journée Scientifique',
  'seminaire': 'Séminaire',
  'examen_exceptionnel': 'Examen Exceptionnel',
  'reunion_pedagogique': 'Réunion Pédagogique',
  'rattrapage_global': 'Rattrapage Global',
  'annonce_departementale': 'Annonce Départementale'
};

const eventTypeOptions = Object.entries(eventTypesMap).map(([key, label]) => ({
  label,
  value: key
}));

const visibilityMap = {
  'public': 'Public',
  'department': 'Département',
  'private': 'Privé'
};

const visibilityOptions = Object.entries(visibilityMap).map(([key, label]) => ({
  label,
  value: key
}));

const getColorByType = (type) => {
  const colors = {
    'fermeture': '#ff4d4f',
    'conference': '#1890ff',
    'journee_scientifique': '#faad14',
    'seminaire': '#52c41a',
    'examen_exceptionnel': '#722ed1',
    'reunion_pedagogique': '#13c2c2',
    'rattrapage_global': '#eb2f96',
    'annonce_departementale': '#fa541c'
  };
  return colors[type] || '#1890ff';
};

const getColorByVisibility = (visibility) => {
  const colors = {
    'public': 'green',
    'department': 'blue',
    'private': 'gray'
  };
  return colors[visibility] || 'gray';
};

function EventsManagement() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [form] = Form.useForm();
  const [filters, setFilters] = useState({ type: '', departement_id: '', visibility: '' });
  const [participantsDrawerVisible, setParticipantsDrawerVisible] = useState(false);
  const [selectedEventParticipants, setSelectedEventParticipants] = useState(null);
  const [participantsLoading, setParticipantsLoading] = useState(false);
  const eventsAPI = new EventsAPI();

  // Fetch events on component mount and when filters change
  useEffect(() => {
    fetchEvents();
  }, [filters]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await eventsAPI.getEvents(filters);
      setEvents(data);
    } catch (error) {
      message.error('Erreur lors du chargement des événements');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClick = () => {
    setEditingEvent(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditClick = (event) => {
    setEditingEvent(event);
    form.setFieldsValue({
      title: event.title,
      type: event.type,
      visibility: event.visibility,
      description: event.description,
      start_date: dayjs(event.start_date),
      end_date: event.end_date ? dayjs(event.end_date) : null,
      is_all_day: event.is_all_day,
      departement_id: event.departement_id
    });
    setModalVisible(true);
  };

  const handleDeleteClick = (event) => {
    Modal.confirm({
      title: 'Confirmer la suppression',
      content: `Êtes-vous sûr de vouloir supprimer l'événement "${event.title}" ?`,
      okText: 'Oui',
      cancelText: 'Non',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await eventsAPI.deleteEvent(event.id);
          message.success('Événement supprimé avec succès');
          fetchEvents();
        } catch (error) {
          message.error('Erreur lors de la suppression');
          console.error(error);
        }
      }
    });
  };

  const handleSubmit = async (values) => {
    try {
      const payload = {
        ...values,
        start_date: values.start_date.toISOString(),
        end_date: values.end_date ? values.end_date.toISOString() : null
      };

      if (editingEvent) {
        await eventsAPI.updateEvent(editingEvent.id, payload);
        message.success('Événement modifié avec succès');
      } else {
        await eventsAPI.createEvent(payload);
        message.success('Événement créé avec succès');
      }

      setModalVisible(false);
      form.resetFields();
      fetchEvents();
    } catch (error) {
      message.error('Erreur lors de l\'enregistrement');
      console.error(error);
    }
  };

  const handleViewParticipants = async (event) => {
    try {
      setParticipantsLoading(true);
      const data = await eventsAPI.getEventParticipants(event.id);
      setSelectedEventParticipants({ ...event, ...data });
      setParticipantsDrawerVisible(true);
    } catch (error) {
      message.error('Erreur lors du chargement des participants');
      console.error(error);
    } finally {
      setParticipantsLoading(false);
    }
  };

  return (
    <div className="events-management">
      <div className="events-header">
        <h1>Gestion des Événements</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateClick} size="large">
          Nouvel Événement
        </Button>
      </div>

      <Card className="events-filters">
        <Space>
          <Select
            placeholder="Filtrer par type"
            style={{ width: 200 }}
            allowClear
            options={eventTypeOptions}
            onChange={(value) => setFilters({ ...filters, type: value })}
          />
          <Select
            placeholder="Filtrer par visibilité"
            style={{ width: 150 }}
            allowClear
            options={visibilityOptions}
            onChange={(value) => setFilters({ ...filters, visibility: value })}
          />
        </Space>
      </Card>

      <Spin spinning={loading}>
        {events.length === 0 ? (
          <Empty description="Aucun événement trouvé" />
        ) : (
          <div className="events-list">
            {events.map((event) => (
              <Card key={event.id} className="event-card">
                <div className="event-header">
                  <div>
                    <h3>{event.title}</h3>
                    <Space>
                      <Tag color={getColorByType(event.type)}>{eventTypesMap[event.type]}</Tag>
                      <Tag color={getColorByVisibility(event.visibility)}>{visibilityMap[event.visibility]}</Tag>
                      {event.is_all_day && <Tag color="default">Journée complète</Tag>}
                    </Space>
                  </div>
                  <Space>
                    <Button icon={<TeamOutlined />} onClick={() => handleViewParticipants(event)}>
                      Voir participants ({event.participant_count || 0})
                    </Button>
                    <Button type="primary" icon={<EditOutlined />} onClick={() => handleEditClick(event)}>
                      Modifier
                    </Button>
                    <Button danger icon={<DeleteOutlined />} onClick={() => handleDeleteClick(event)}>
                      Supprimer
                    </Button>
                  </Space>
                </div>

                <div className="event-body">
                  {event.description && (
                    <div className="event-description">
                      <strong>Description:</strong>
                      <p>{event.description}</p>
                    </div>
                  )}

                  <div className="event-dates">
                    <strong>Date de début:</strong> {dayjs(event.start_date).format('DD/MM/YYYY HH:mm')}
                    {event.end_date && (
                      <>
                        <br />
                        <strong>Date de fin:</strong> {dayjs(event.end_date).format('DD/MM/YYYY HH:mm')}
                      </>
                    )}
                  </div>

                  {event.departement_id && (
                    <div className="event-department">
                      <strong>Département ID:</strong> {event.departement_id}
                    </div>
                  )}
                </div>

                <div className="event-footer">
                  <small>Créé le {dayjs(event.createdAt).format('DD/MM/YYYY HH:mm')}</small>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Spin>

      <Modal
        title={editingEvent ? 'Modifier l\'événement' : 'Créer un nouvel événement'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <Form.Item
            name="title"
            label="Titre"
            rules={[{ required: true, message: 'Veuillez entrer un titre' }]}
          >
            <Input placeholder="Titre de l'événement" />
          </Form.Item>

          <Form.Item
            name="type"
            label="Type d'événement"
            rules={[{ required: true, message: 'Veuillez sélectionner un type' }]}
          >
            <Select options={eventTypeOptions} placeholder="Sélectionner un type" />
          </Form.Item>

          <Form.Item
            name="visibility"
            label="Visibilité"
            rules={[{ required: true, message: 'Veuillez sélectionner une visibilité' }]}
          >
            <Select options={visibilityOptions} placeholder="Sélectionner la visibilité" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea rows={4} placeholder="Description de l'événement (Markdown supporté)" />
          </Form.Item>

          <Form.Item
            name="start_date"
            label="Date de début"
            rules={[{ required: true, message: 'Veuillez sélectionner une date de début' }]}
          >
            <DatePicker showTime format="DD/MM/YYYY HH:mm" />
          </Form.Item>

          <Form.Item
            name="end_date"
            label="Date de fin"
          >
            <DatePicker showTime format="DD/MM/YYYY HH:mm" />
          </Form.Item>

          <Form.Item
            name="is_all_day"
            label="Journée complète"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="departement_id"
            label="Département ID (optionnel)"
          >
            <Input type="number" placeholder="ID du département" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingEvent ? 'Modifier' : 'Créer'}
              </Button>
              <Button onClick={() => setModalVisible(false)}>Annuler</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        title={`Participants - ${selectedEventParticipants?.title}`}
        placement="right"
        onClose={() => setParticipantsDrawerVisible(false)}
        open={participantsDrawerVisible}
        width={600}
      >
        {selectedEventParticipants && (
          <Spin spinning={participantsLoading}>
            <div style={{ marginBottom: 20 }}>
              <div style={{ marginBottom: 10 }}>
                <Badge
                  count={selectedEventParticipants.participant_count}
                  style={{ backgroundColor: '#52c41a', fontSize: '16px', padding: '4px 8px' }}
                />
                <span style={{ marginLeft: 10, fontSize: '16px', fontWeight: 'bold' }}>
                  Participant(s)
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                Date de l'événement: {dayjs(selectedEventParticipants.start_date).format('DD/MM/YYYY HH:mm')}
              </div>
            </div>

            {selectedEventParticipants.participants && selectedEventParticipants.participants.length > 0 ? (
              <Table
                dataSource={selectedEventParticipants.participants}
                columns={[
                  {
                    title: 'ID Étudiant',
                    dataIndex: 'student_id',
                    key: 'student_id',
                    render: (text) => <code>{String(text || 'N/A').substring(0, 8)}...</code>
                  },
                  {
                    title: 'Date d\'inscription',
                    dataIndex: 'registered_at',
                    key: 'registered_at',
                    render: (text) => text ? dayjs(text).format('DD/MM/YYYY HH:mm') : 'N/A'
                  }
                ]}
                rowKey="id"
                pagination={{ pageSize: 10 }}
                size="small"
              />
            ) : (
              <Empty description="Aucun participant" />
            )}
          </Spin>
        )}
      </Drawer>
    </div>
  );
}

export default EventsManagement;
