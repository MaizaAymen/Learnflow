import React, { useState, useEffect } from 'react';
import { Card, List, Tag, Empty, Spin, Button, Space, Modal, Drawer, Descriptions, Badge, message } from 'antd';
import { EyeOutlined, CheckCircleOutlined, LoginOutlined, LogoutOutlined, FilePdfOutlined, DownloadOutlined } from '@ant-design/icons';
import EventsAPI from '../services/EventsAPI';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import './EventsViewer.css';

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

const visibilityMap = {
  'public': 'Public',
  'department': 'Département',
  'private': 'Privé'
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

const getColorByVisibility = (visibility) => {
  const colors = {
    'public': 'green',
    'department': 'blue',
    'private': 'gray'
  };
  return colors[visibility] || 'gray';
};

function EventsViewer() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filters, setFilters] = useState({ visibility: 'public' });
  const [currentUser, setCurrentUser] = useState(null);
  const [registrationStatus, setRegistrationStatus] = useState({});
  const [registering, setRegistering] = useState({});
  const [pdfModalVisible, setPdfModalVisible] = useState(false);
  const [selectedPdfUrl, setSelectedPdfUrl] = useState(null);
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

  useEffect(() => {
    fetchEvents();
  }, [filters]);

  // Check registration status for all events when user or events change
  useEffect(() => {
    if (currentUser?.id && events.length > 0) {
      checkAllRegistrations();
    }
  }, [currentUser, events]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await eventsAPI.getEvents(filters);
      setEvents(data.sort((a, b) => new Date(b.start_date) - new Date(a.start_date)));
    } catch (error) {
      console.error('Erreur lors du chargement des événements', error);
      message.error('Erreur lors du chargement des événements');
    } finally {
      setLoading(false);
    }
  };

  const checkAllRegistrations = async () => {
    if (!currentUser?.id) return;

    const status = {};
    for (const event of events) {
      try {
        const result = await eventsAPI.checkRegistration(event.id, currentUser.id);
        status[event.id] = result.registered;
      } catch (error) {
        console.error(`Error checking registration for event ${event.id}:`, error);
        status[event.id] = false;
      }
    }
    setRegistrationStatus(status);
  };

  const handleViewDetails = (event) => {
    setSelectedEvent(event);
    setDrawerVisible(true);
  };

  const handleJoinEvent = async (event) => {
    if (!currentUser?.id) {
      message.warning('Veuillez vous connecter pour participer à un événement');
      return;
    }

    try {
      setRegistering(prev => ({ ...prev, [event.id]: true }));
      await eventsAPI.joinEvent(event.id, currentUser.id);
      setRegistrationStatus(prev => ({ ...prev, [event.id]: true }));
      message.success('Vous êtes maintenant inscrit à cet événement');
    } catch (error) {
      console.error('Error joining event:', error);
      message.error('Erreur lors de l\'inscription à l\'événement');
    } finally {
      setRegistering(prev => ({ ...prev, [event.id]: false }));
    }
  };

  const handleLeaveEvent = async (event) => {
    if (!currentUser?.id) return;

    Modal.confirm({
      title: 'Se désinscrire',
      content: `Êtes-vous sûr de vouloir vous désinscrire de "${event.title}" ?`,
      okText: 'Oui',
      cancelText: 'Non',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          setRegistering(prev => ({ ...prev, [event.id]: true }));
          await eventsAPI.leaveEvent(event.id, currentUser.id);
          setRegistrationStatus(prev => ({ ...prev, [event.id]: false }));
          message.success('Vous avez été désinscrit de cet événement');
        } catch (error) {
          console.error('Error leaving event:', error);
          message.error('Erreur lors de la désinscription');
        } finally {
          setRegistering(prev => ({ ...prev, [event.id]: false }));
        }
      }
    });
  };

  const isUpcoming = (startDate) => dayjs(startDate).isAfter(dayjs());

  const handleViewPdf = (pdfPath) => {
    setSelectedPdfUrl(`http://localhost:3004${pdfPath}`);
    setPdfModalVisible(true);
  };

  return (
    <div className="events-viewer">
      <div className="events-viewer-header">
        <h1>Événements Universitaires</h1>
        <p>Consultez tous les événements de la plateforme</p>
      </div>

      <Spin spinning={loading}>
        {events.length === 0 ? (
          <Empty description="Aucun événement disponible" />
        ) : (
          <List
            dataSource={events}
            renderItem={(event) => (
              <Card className="event-list-item" style={{ marginBottom: 16 }}>
                <div className="event-item-content">
                  <div className="event-item-left">
                    <Badge
                      status={isUpcoming(event.start_date) ? 'processing' : 'default'}
                      text={
                        <span style={{ fontSize: 14 }}>
                          {isUpcoming(event.start_date) ? 'À venir' : 'Passé'}
                        </span>
                      }
                    />
                    <h3 style={{ marginTop: 10, marginBottom: 8 }}>{event.title}</h3>
                    <Space wrap>
                      <Tag color={getColorByType(event.type)}>
                        {eventTypesMap[event.type]}
                      </Tag>
                      <Tag color={getColorByVisibility(event.visibility)}>
                        {visibilityMap[event.visibility]}
                      </Tag>
                      {event.is_all_day && <Tag color="default">Journée complète</Tag>}
                    </Space>
                    <p className="event-date" style={{ marginTop: 8, color: '#666' }}>
                      <strong>Date de début:</strong> {dayjs(event.start_date).format('dddd DD MMMM YYYY HH:mm')}
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
                        Voir détails
                      </Button>
                      {currentUser && (
                        registrationStatus[event.id] ? (
                          <Button
                            danger
                            icon={<LogoutOutlined />}
                            onClick={() => handleLeaveEvent(event)}
                            loading={registering[event.id]}
                          >
                            Se désinscrire
                          </Button>
                        ) : (
                          <Button
                            type="success"
                            icon={<LoginOutlined />}
                            onClick={() => handleJoinEvent(event)}
                            loading={registering[event.id]}
                          >
                            Participer
                          </Button>
                        )
                      )}
                    </Space>
                  </div>
                </div>
              </Card>
            )}
          />
        )}
      </Spin>

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
            <Descriptions.Item label="Visibilité">
              <Tag color={getColorByVisibility(selectedEvent.visibility)}>
                {visibilityMap[selectedEvent.visibility]}
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
            {selectedEvent.departement_id && (
              <Descriptions.Item label="Département">
                ID: {selectedEvent.departement_id}
              </Descriptions.Item>
            )}
            {selectedEvent.pdf_path && (
              <Descriptions.Item label="Fichier PDF">
                <Space>
                  <Button 
                    type="primary" 
                    size="small" 
                    icon={<EyeOutlined />}
                    onClick={() => handleViewPdf(selectedEvent.pdf_path)}
                  >
                    Aperçu
                  </Button>
                  <Button 
                    size="small" 
                    icon={<DownloadOutlined />}
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = `http://localhost:3004${selectedEvent.pdf_path}`;
                      link.download = selectedEvent.pdf_filename || 'document.pdf';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                  >
                    Télécharger
                  </Button>
                  <span style={{ fontSize: '12px', color: '#666' }}>
                    {selectedEvent.pdf_filename}
                  </span>
                </Space>
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Créé le">
              {dayjs(selectedEvent.createdAt).format('DD/MM/YYYY HH:mm')}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>

      <Modal
        title="Aperçu du PDF"
        open={pdfModalVisible}
        onCancel={() => setPdfModalVisible(false)}
        footer={[
          <Button key="download" icon={<DownloadOutlined />} onClick={() => {
            const link = document.createElement('a');
            link.href = selectedPdfUrl;
            link.download = 'document.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}>
            Télécharger
          </Button>,
          <Button key="close" onClick={() => setPdfModalVisible(false)}>
            Fermer
          </Button>
        ]}
        width={900}
        style={{ top: 20 }}
      >
        {selectedPdfUrl && (
          <iframe
            src={`${selectedPdfUrl}#toolbar=0`}
            style={{
              width: '100%',
              height: '600px',
              border: 'none',
              borderRadius: '4px'
            }}
            title="PDF Viewer"
          />
        )}
      </Modal>
    </div>
  );
}

export default EventsViewer;
