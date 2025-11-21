import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Spin, 
  message, 
  Button, 
  Empty, 
  Table, 
  Space, 
  Tag, 
  Row, 
  Col,
  Statistic,
  Typography,
  Grid
} from 'antd';
import { useNavigate } from 'react-router-dom';
import { 
  CalendarOutlined, 
  EyeOutlined, 
  PlusOutlined, 
  TeamOutlined,
  RocketOutlined,
  SettingOutlined
} from '@ant-design/icons';
import './ClassCalendarDashboard.css';

const { Title, Text, Paragraph } = Typography;
const { useBreakpoint } = Grid;

/**
 * Dashboard showing all classes with their own calendar
 */
const ClassCalendarDashboard = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scheduleStats, setScheduleStats] = useState({});
  const navigate = useNavigate();
  const screens = useBreakpoint();

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

  // Calculate overall statistics
  const overallStats = {
    totalClasses: classes.length,
    totalSchedules: Object.values(scheduleStats).reduce((sum, stat) => sum + stat.total, 0),
    activeSchedules: Object.values(scheduleStats).reduce((sum, stat) => sum + stat.active, 0),
    classesWithSchedules: Object.values(scheduleStats).filter(stat => stat.total > 0).length,
  };

  if (loading) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '100px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Spin size="large" />
        <Text style={{ marginTop: '20px', fontSize: '16px', color: '#666' }}>
          Chargement des classes...
        </Text>
      </div>
    );
  }

  if (classes.length === 0) {
    return (
      <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
        <Card>
          <Empty
            description={
              <div>
                <Title level={4} style={{ color: '#666', marginBottom: '8px' }}>
                  Aucune classe trouvée
                </Title>
                <Paragraph style={{ color: '#999' }}>
                  Commencez par créer votre première classe pour organiser vos plannings.
                </Paragraph>
              </div>
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button type="primary" size="large" onClick={() => navigate('/reference/classes')}>
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
        <Space size="middle">
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #ffffffff 0%, #313131ff 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            color: 'white',
            fontWeight: 'bold',
            boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
          }}>
            {text.charAt(0).toUpperCase()}
          </div>
          <div>
            <Text strong style={{ fontSize: '16px' }}>{text}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              ID: {record.id}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Niveau',
      dataIndex: 'niveau',
      key: 'niveau',
      render: (niveau) => (
        <Tag color="blue" style={{ padding: '4px 8px', borderRadius: '12px' }}>
          {niveau ? niveau.nom : 'Non défini'}
        </Tag>
      ),
    },
    {
      title: 'Spécialité',
      dataIndex: 'specialite',
      key: 'specialite',
      render: (specialite) => (
        <Tag color="purple" style={{ padding: '4px 8px', borderRadius: '12px' }}>
          {specialite ? specialite.nom : 'Générale'}
        </Tag>
      ),
    },
    {
      title: 'Cours Planifiés',
      key: 'total',
      align: 'center',
      render: (_, record) => {
        const stats = scheduleStats[record.id] || { total: 0, active: 0, cancelled: 0 };
        return (
          <div style={{ textAlign: 'center' }}>
            <Statistic
              value={stats.total}
              valueStyle={{ 
                color: stats.total > 0 ? '#1890ff' : '#d9d9d9',
                fontSize: '24px'
              }}
              suffix={
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  cours
                </Text>
              }
            />
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
          <Space direction="vertical" size={4}>
            {stats.active > 0 && (
              <Tag 
                color="success" 
                icon={<CalendarOutlined />}
                style={{ margin: 0, borderRadius: '12px' }}
              >
                {stats.active} Actifs
              </Tag>
            )}
            {stats.cancelled > 0 && (
              <Tag 
                color="error"
                style={{ margin: 0, borderRadius: '12px' }}
              >
                {stats.cancelled} Annulés
              </Tag>
            )}
            {stats.total === 0 && (
              <Tag 
                color="default"
                style={{ margin: 0, borderRadius: '12px' }}
              >
                Aucun cours
              </Tag>
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
        <Space size="small" direction={screens.xs ? "vertical" : "horizontal"}>
  <Button
    type="primary"
    icon={<EyeOutlined />}
    onClick={() => viewClassCalendar(record.id)}
    style={{
      borderRadius: '6px',
      color: '#fff',
      backgroundColor: '#000',   // 🔥 Pure black
      borderColor: '#000',       // Keep border same color
    }}
  >
    Calendrier
  </Button>

  <Button
    icon={<PlusOutlined />}
    onClick={() => createScheduleForClass(record.id)}
    style={{ borderRadius: '6px' }}
  >
    Planning
  </Button>
</Space>

      ),
    },
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header Section */}
      <div style={{ marginBottom: '32px' }}>
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <Title level={2} style={{ margin: 0, color: '#1f1f1f' }}>
            📅 Calendriers par Classe
          </Title>
          <Paragraph style={{ color: '#666', fontSize: '16px', margin: 0 }}>
            Gérez et consultez les calendriers de chaque classe. 
            Surveillez les cours planifiés et leur statut.
          </Paragraph>
        </Space>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ background: 'linear-gradient(135deg, #ffffffff 0%, #ffffffff 100%)' }}>
            <Statistic
              title="Total des Classes"
              value={overallStats.totalClasses}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#000000ff' }}
              suffix={<Text style={{ color: 'rgba(0, 0, 0, 0.8)' }}>classes</Text>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ background: 'linear-gradient(135deg, #ffffffff 0%, #ffffffff 100%)' }}>
            <Statistic
              title="Cours Planifiés"
              value={overallStats.totalSchedules}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#000000ff' }}
              suffix={<Text style={{ color: 'rgba(0, 0, 0, 0.8)' }}>cours</Text>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ background: 'linear-gradient(135deg, #ffffffff 0%, #ffffffff 100%)' }}>
            <Statistic
              title="Cours Actifs"
              value={overallStats.activeSchedules}
              prefix=""
              valueStyle={{ color: '#000000ff' }}
              suffix={<Text style={{ color: 'rgba(0, 0, 0, 0.8)' }}>cours</Text>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ background: 'linear-gradient(135deg, #ffffffff 0%, #ffffffff 100%)' }}>
            <Statistic
              title="Classes Actives"
              value={overallStats.classesWithSchedules}
              prefix=""
              valueStyle={{ color: '#000000ff' }}
              suffix={<Text style={{ color: 'rgba(0, 0, 0, 0.8)' }}>classes</Text>}
            />
          </Card>
        </Col>
      </Row>

      {/* Classes Table */}
      <Card 
        bordered={false}
        style={{
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          overflow: 'hidden'
        }}
        bodyStyle={{ padding: '0' }}
      >
        <Table
          dataSource={classes}
          columns={columns}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} sur ${total} classes`,
            style: { padding: '16px 24px' }
          }}
          scroll={{ x: 800 }}
          style={{ border: 'none' }}
        />
      </Card>

      {/* Quick Actions */}
    
    </div>
  );
};

export default ClassCalendarDashboard;