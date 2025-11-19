import React, { useState, useEffect } from 'react';
import { Card, List, Tag, Empty, Spin, Button, Space, Drawer, Descriptions, Badge, Modal, message } from 'antd';
import { DeleteOutlined, EyeOutlined, CheckCircleOutlined } from '@ant-design/icons';
import EventsAPI from '../services/EventsAPI';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import './EventsStudentDashboard.css';

dayjs.locale('fr');

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

function EventsStudentDashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const eventsAPI = new EventsAPI();

  // Fetch current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/auth/profile', {
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          setCurrentUser(data.user);
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };

    fetchCurrentUser();
  }, []);

  // Fetch student's events
  useEffect(() => {
    if (currentUser?.id) {
      fetchStudentEvents();
    }
  }, [currentUser]);

  const fetchStudentEvents = async () => {
    try {
      setLoading(true);
      const data = await eventsAPI.getStudentEvents(currentUser.id);
      setEvents(data.sort((a, b) => new Date(a.start_date) - new Date(b.start_date)));
    } catch (error) {
      console.error('Error fetching student events:', error);
      message.error('Erreur lors du chargement de vos événements');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (event) => {
    setSelectedEvent(event);
    setDrawerVisible(true);
  };

  const handleUnsubscribe = (event) => {
    Modal.confirm({
      title: 'Se désinscrire',
      content: `Êtes-vous sûr de vouloir vous désinscrire de "${event.title}" ?`,
      okText: 'Oui',
      cancelText: 'Non',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await eventsAPI.leaveEvent(event.id, currentUser.id);
          message.success('Vous avez été désinscrit');
          fetchStudentEvents();
        } catch (error) {
          message.error('Erreur lors de la désinscription');
          console.error(error);
        }
      }
    });
  };

  const isUpcoming = (startDate) => dayjs(startDate).isAfter(dayjs());
  const isPassed = (startDate) => dayjs(startDate).isBefore(dayjs());

  const upcomingEvents = events.filter(e => isUpcoming(e.start_date));
  const passedEvents = events.filter(e => isPassed(e.start_date));

  return (
    <div className="events-student-dashboard">
      <div className="dashboard-header">
        <h1>Mes Événements</h1>
        <p>Consultez tous les événements auxquels vous êtes inscrit</p>
      </div>

      <div className="events-sections">
        {/* Upcoming Events */}
        <Card className="events-section">
          <div className="section-header">
            <h2>À venir ({upcomingEvents.length})</h2>
            <CheckCircleOutlined style={{ fontSize: 24, color: '#52c41a' }} />
          </div>

          <Spin spinning={loading}>
            {upcomingEvents.length === 0 ? (
              <Empty description="Aucun événement prévu" />
            ) : (
              <List
                dataSource={upcomingEvents}
                renderItem={(event) => (
                  <Card className="event-list-item" style={{ marginBottom: 16 }}>
                    <div className="event-item-content">
                      <div className="event-item-left">
                        <Tag color={getColorByType(event.type)}>
                          {eventTypesMap[event.type]}
                        </Tag>
                        {event.is_all_day && <Tag color="default">Journée complète</Tag>}

                        <h3 style={{ marginTop: 10, marginBottom: 8 }}>{event.title}</h3>
                        <p className="event-date">
                          <strong>Date:</strong> {dayjs(event.start_date).format('dddd DD MMMM YYYY HH:mm')}
                        </p>
                        {event.description && (
                          <p className="event-preview">{event.description.substring(0, 100)}...</p>
                        )}
                      </div>
                      <div className="event-item-right">
                        <Space direction="vertical">
                          <Button
                            type="primary"
                            icon={<EyeOutlined />}
                            onClick={() => handleViewDetails(event)}
                          >
                            Détails
                          </Button>
                          <Button
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleUnsubscribe(event)}
                          >
                            Se désinscrire
                          </Button>
                        </Space>
                      </div>
                    </div>
                  </Card>
                )}
              />
            )}
          </Spin>
        </Card>

        {/* Passed Events */}
        {passedEvents.length > 0 && (
          <Card className="events-section events-section-passed">
            <div className="section-header">
              <h2>Passés ({passedEvents.length})</h2>
            </div>

            <List
              dataSource={passedEvents}
              renderItem={(event) => (
                <Card className="event-list-item event-passed" style={{ marginBottom: 16 }}>
                  <div className="event-item-content">
                    <div className="event-item-left">
                      <Badge status="default" text={<Tag>Passé</Tag>} />
                      <Tag color={getColorByType(event.type)}>
                        {eventTypesMap[event.type]}
                      </Tag>

                      <h3 style={{ marginTop: 10, marginBottom: 8 }}>{event.title}</h3>
                      <p className="event-date">
                        <strong>Date:</strong> {dayjs(event.start_date).format('DD MMMM YYYY HH:mm')}
                      </p>
                    </div>
                    <div className="event-item-right">
                      <Button
                        type="default"
                        icon={<EyeOutlined />}
                        onClick={() => handleViewDetails(event)}
                      >
                        Détails
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
            />
          </Card>
        )}
      </div>

      {/* Details Drawer */}
      <Drawer
        title="Détails de l'événement"
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={500}
      >
        {selectedEvent && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Titre">
              {selectedEvent.title}
            </Descriptions.Item>
            <Descriptions.Item label="Type">
              <Tag color={getColorByType(selectedEvent.type)}>
                {eventTypesMap[selectedEvent.type]}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Date de début">
              {dayjs(selectedEvent.start_date).format('DD/MM/YYYY HH:mm')}
            </Descriptions.Item>
            {selectedEvent.end_date && (
              <Descriptions.Item label="Date de fin">
                {dayjs(selectedEvent.end_date).format('DD/MM/YYYY HH:mm')}
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Journée complète">
              {selectedEvent.is_all_day ? 'Oui' : 'Non'}
            </Descriptions.Item>
            {selectedEvent.description && (
              <Descriptions.Item label="Description">
                <div className="event-description-full">{selectedEvent.description}</div>
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Créé le">
              {dayjs(selectedEvent.createdAt).format('DD/MM/YYYY HH:mm')}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  );
}

export default EventsStudentDashboard;
