import React, { useState, useEffect } from 'react';
import { Card, Spin, message, Button, Empty, Table, Space, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import { CalendarOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
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

  const columns = [
    {
      title: 'Classe',
      dataIndex: 'nom',
      key: 'nom',
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #000000ff 0%, #000000ff 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            color: 'white',
            fontWeight: 'bold',
          }}>
            {text.charAt(0)}
          </div>
          <strong style={{ fontSize: '16px' }}>{text}</strong>
        </div>
      ),
    },
    {
      title: 'Niveau',
      dataIndex: 'niveau',
      key: 'niveau',
      render: (niveau) => niveau ? niveau.nom : '-',
    },
    {
      title: 'Spécialité',
      dataIndex: 'specialite',
      key: 'specialite',
      render: (specialite) => specialite ? specialite.nom : '-',
    },
    {
      title: 'Cours Planifiés',
      key: 'total',
      align: 'center',
      render: (_, record) => {
        const stats = scheduleStats[record.id] || { total: 0, active: 0, cancelled: 0 };
        return (
          <div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1890ff' }}>
              {stats.total}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>cours</div>
          </div>
        );
      },
    },
    {
      title: 'Statut',
      key: 'status',
      align: 'center',
      render: (_, record) => {
        const stats = scheduleStats[record.id] || { total: 0, active: 0, cancelled: 0 };
        return (
          <Space direction="vertical" size={0}>
            {stats.active > 0 && (
              <Tag color="success" icon={<CalendarOutlined />}>
                {stats.active} Actifs
              </Tag>
            )}
            {stats.cancelled > 0 && (
              <Tag color="error">
                {stats.cancelled} Annulés
              </Tag>
            )}
            {stats.total === 0 && (
              <Tag color="default">Aucun cours</Tag>
            )}
          </Space>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'center',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => viewClassCalendar(record.id)}
          >
            Voir Calendrier
          </Button>
          <Button
            icon={<PlusOutlined />}
            onClick={() => createScheduleForClass(record.id)}
          >
            Créer Planning
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1> Calendriers par Classe</h1>
        <p style={{ color: '#666', fontSize: '16px' }}>
          Consultez le calendrier de chaque classe. Total: <strong>{classes.length} classes</strong>
        </p>
      </div>

      <Card>
        <Table
          dataSource={classes}
          columns={columns}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total: ${total} classes`,
          }}
          bordered
        />
      </Card>
      *{/* Quick Actions 
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
      </Card>*/}
    </div>
  );
};

export default ClassCalendarDashboard;
