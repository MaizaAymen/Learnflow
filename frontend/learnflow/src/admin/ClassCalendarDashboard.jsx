import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Spin, message, Button, Empty } from 'antd';
import { useNavigate } from 'react-router-dom';
import { CalendarOutlined, EyeOutlined } from '@ant-design/icons';
import './ClassCalendarDashboard.css';

/**
 * Dashboard showing all classes with their own calendar
 */
const ClassCalendarDashboard = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scheduleStats, setScheduleStats] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);

      // Fetch all classes
      const classesRes = await fetch('http://localhost:3000/api/reference/classes');
      if (!classesRes.ok) throw new Error('Failed to fetch classes');
      const classesData = await classesRes.json();
      setClasses(classesData);

      // Fetch schedules count for each class
      const schedulesRes = await fetch('http://localhost:3000/api/calendar/schedules');
      if (schedulesRes.ok) {
        const schedulesData = await schedulesRes.json();
        
        // Count schedules per class
        const stats = {};
        schedulesData.forEach(schedule => {
          const classeId = schedule.classe_id;
          if (!stats[classeId]) {
            stats[classeId] = {
              total: 0,
              active: 0,
              cancelled: 0
            };
          }
          stats[classeId].total++;
          if (schedule.statut === 'confirme') stats[classeId].active++;
          if (schedule.statut === 'annule') stats[classeId].cancelled++;
        });
        setScheduleStats(stats);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      message.error('Erreur lors du chargement des classes');
    } finally {
      setLoading(false);
    }
  };

  const viewClassCalendar = (classeId) => {
    navigate(`/calendar/class/${classeId}/events`);
  };

  const createScheduleForClass = (classeId) => {
    navigate('/calendar/create', { state: { preselectedClasseId: classeId } });
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <Spin size="large" />
        <p style={{ marginTop: '20px' }}>Chargement des classes...</p>
      </div>
    );
  }

  if (classes.length === 0) {
    return (
      <div style={{ padding: '24px' }}>
        <Card>
          <Empty
            description="Aucune classe trouvée"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button type="primary" onClick={() => navigate('/reference/classes')}>
              Créer une Classe
            </Button>
          </Empty>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1>📚 Calendriers par Classe</h1>
        <p style={{ color: '#666', fontSize: '16px' }}>
          Consultez le calendrier de chaque classe. Total: <strong>{classes.length} classes</strong>
        </p>
      </div>

      <Row gutter={[16, 16]}>
        {classes.map((classe) => {
          const stats = scheduleStats[classe.id] || { total: 0, active: 0, cancelled: 0 };
          
          return (
            <Col xs={24} sm={12} md={8} lg={6} key={classe.id}>
              <Card
                hoverable
                className="class-calendar-card"
                style={{
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  {/* Class Icon */}
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                    fontSize: '36px',
                    color: 'white',
                    fontWeight: 'bold',
                  }}>
                    {classe.nom.charAt(0)}
                  </div>

                  {/* Class Name */}
                  <h3 style={{ 
                    fontSize: '20px', 
                    fontWeight: 'bold', 
                    marginBottom: '8px',
                    color: '#1890ff'
                  }}>
                    {classe.nom}
                  </h3>

                  {/* Class Details */}
                  {classe.niveau && (
                    <p style={{ color: '#666', fontSize: '14px', marginBottom: '4px' }}>
                      Niveau: {classe.niveau.nom}
                    </p>
                  )}
                  {classe.specialite && (
                    <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px' }}>
                      {classe.specialite.nom}
                    </p>
                  )}

                  {/* Statistics */}
                  <div style={{
                    background: '#f5f5f5',
                    padding: '12px',
                    borderRadius: '8px',
                    marginBottom: '16px'
                  }}>
                    <div style={{ marginBottom: '8px' }}>
                      <CalendarOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                      <strong>{stats.total}</strong> cours planifiés
                    </div>
                    {stats.total > 0 && (
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        <span style={{ color: '#52c41a' }}>✓ {stats.active} actifs</span>
                        {stats.cancelled > 0 && (
                          <span style={{ marginLeft: '8px', color: '#ff4d4f' }}>
                            ✗ {stats.cancelled} annulés
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <Button
                    type="primary"
                    icon={<EyeOutlined />}
                    onClick={() => viewClassCalendar(classe.id)}
                    block
                    size="large"
                    style={{ marginBottom: '8px' }}
                  >
                    Voir Calendrier
                  </Button>

                  <Button
                    type="default"
                    onClick={() => createScheduleForClass(classe.id)}
                    block
                  >
                    ➕ Créer Planning
                  </Button>
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* Quick Actions */}
      <Card style={{ marginTop: '24px', background: '#f0f9ff' }}>
        <h3>Actions Rapides</h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Button type="primary" onClick={() => navigate('/calendar/create')}>
            ➕ Créer un Planning
          </Button>
          <Button onClick={() => navigate('/calendar/timeslots/auto')}>
            ⚡ Générer Créneaux Auto
          </Button>
          <Button onClick={() => navigate('/reference/classes')}>
            🏫 Gérer les Classes
          </Button>
          <Button onClick={() => navigate('/calendar/events')}>
            📆 Voir Tous les Calendriers
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ClassCalendarDashboard;
