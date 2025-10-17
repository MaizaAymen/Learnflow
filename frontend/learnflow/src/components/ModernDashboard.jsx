import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Avatar, List, Progress, Tag, Button, Space, Typography } from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  BookOutlined,
  TrophyOutlined,
  RiseOutlined,
  EyeOutlined,
  HeartOutlined,
  MessageOutlined,
  CalendarOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;

const ModernDashboard = () => {
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    totalUsers: 1234,
    activeUsers: 892,
    totalCourses: 45,
    completionRate: 78.5
  });

  const [recentActivity, setRecentActivity] = useState([
    {
      id: 1,
      user: 'Ahmed Ben Ali',
      action: 'a terminé le cours',
      target: 'Introduction à React',
      time: '2 minutes ago',
      avatar: null
    },
    {
      id: 2,
      user: 'Fatma Mahmoud',
      action: 'a rejoint la classe',
      target: 'Développement Web Avancé',
      time: '15 minutes ago',
      avatar: null
    },
    {
      id: 3,
      user: 'Mohamed Sassi',
      action: 'a soumis un projet',
      target: 'Application Mobile',
      time: '1 heure ago',
      avatar: null
    }
  ]);

  const [topCourses, setTopCourses] = useState([
    { name: 'React Fundamentals', students: 156, rating: 4.8, progress: 85 },
    { name: 'Node.js Backend', students: 134, rating: 4.7, progress: 92 },
    { name: 'Database Design', students: 98, rating: 4.6, progress: 78 },
    { name: 'UI/UX Design', students: 87, rating: 4.9, progress: 65 }
  ]);

  return (
    <div className="page-wrapper animate-fadeInUp">
      <div className="app-container">
        {/* Welcome Section */}
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <Title level={2} className="form-title">
            Tableau de Bord
          </Title>
          <Text type="secondary" style={{ fontSize: 'var(--font-size-lg)' }}>
            Bienvenue sur votre plateforme d'apprentissage moderne
          </Text>
        </div>

        {/* Statistics Cards */}
        <div className="stats-grid" style={{ marginBottom: 'var(--space-8)' }}>
          <Card className="data-card hover-lift" bodyStyle={{ padding: 'var(--space-6)' }}>
            <Statistic
              title={<Text strong style={{ color: 'var(--text-secondary)' }}>Total Utilisateurs</Text>}
              value={stats.totalUsers}
              prefix={<TeamOutlined style={{ color: 'var(--primary-500)' }} />}
              valueStyle={{ 
                color: 'var(--primary-600)', 
                fontSize: 'var(--font-size-3xl)',
                fontWeight: 'var(--font-weight-bold)'
              }}
            />
            <div style={{ marginTop: 'var(--space-2)' }}>
              <Tag color="green">+12% ce mois</Tag>
            </div>
          </Card>

          <Card className="data-card hover-lift" bodyStyle={{ padding: 'var(--space-6)' }}>
            <Statistic
              title={<Text strong style={{ color: 'var(--text-secondary)' }}>Utilisateurs Actifs</Text>}
              value={stats.activeUsers}
              prefix={<UserOutlined style={{ color: 'var(--success-500)' }} />}
              valueStyle={{ 
                color: 'var(--success-600)', 
                fontSize: 'var(--font-size-3xl)',
                fontWeight: 'var(--font-weight-bold)'
              }}
            />
            <div style={{ marginTop: 'var(--space-2)' }}>
              <Tag color="blue">72% en ligne</Tag>
            </div>
          </Card>

          <Card className="data-card hover-lift" bodyStyle={{ padding: 'var(--space-6)' }}>
            <Statistic
              title={<Text strong style={{ color: 'var(--text-secondary)' }}>Cours Disponibles</Text>}
              value={stats.totalCourses}
              prefix={<BookOutlined style={{ color: 'var(--accent-orange)' }} />}
              valueStyle={{ 
                color: 'var(--accent-orange)', 
                fontSize: 'var(--font-size-3xl)',
                fontWeight: 'var(--font-weight-bold)'
              }}
            />
            <div style={{ marginTop: 'var(--space-2)' }}>
              <Tag color="orange">5 nouveaux</Tag>
            </div>
          </Card>

          <Card className="data-card hover-lift" bodyStyle={{ padding: 'var(--space-6)' }}>
            <Statistic
              title={<Text strong style={{ color: 'var(--text-secondary)' }}>Taux de Réussite</Text>}
              value={stats.completionRate}
              suffix="%"
              prefix={<TrophyOutlined style={{ color: 'var(--accent-gold)' }} />}
              valueStyle={{ 
                color: 'var(--accent-gold)', 
                fontSize: 'var(--font-size-3xl)',
                fontWeight: 'var(--font-weight-bold)'
              }}
            />
            <div style={{ marginTop: 'var(--space-2)' }}>
              <Progress percent={stats.completionRate} size="small" showInfo={false} />
            </div>
          </Card>
        </div>

        {/* Main Content Grid */}
        <Row gutter={[24, 24]}>
          {/* Recent Activity */}
          <Col xs={24} lg={14}>
            <Card 
              title={
                <Space>
                  <ClockCircleOutlined style={{ color: 'var(--primary-500)' }} />
                  <span>Activité Récente</span>
                </Space>
              }
              className="data-card"
              extra={
                <Button type="link" icon={<EyeOutlined />}>
                  Voir tout
                </Button>
              }
            >
              <List
                dataSource={recentActivity}
                renderItem={(item) => (
                  <List.Item style={{ border: 'none', padding: 'var(--space-4) 0' }}>
                    <List.Item.Meta
                      avatar={
                        <Avatar 
                          src={item.avatar} 
                          icon={<UserOutlined />} 
                          style={{ backgroundColor: 'var(--primary-500)' }}
                        />
                      }
                      title={
                        <Space>
                          <Text strong>{item.user}</Text>
                          <Text type="secondary">{item.action}</Text>
                          <Text strong style={{ color: 'var(--primary-600)' }}>{item.target}</Text>
                        </Space>
                      }
                      description={
                        <Text type="secondary">
                          <ClockCircleOutlined style={{ marginRight: 'var(--space-1)' }} />
                          {item.time}
                        </Text>
                      }
                    />
                    <Space>
                      <Button type="text" icon={<HeartOutlined />} />
                      <Button type="text" icon={<MessageOutlined />} />
                    </Space>
                  </List.Item>
                )}
              />
            </Card>
          </Col>

          {/* Top Courses */}
          <Col xs={24} lg={10}>
            <Card 
              title={
                <Space>
                  <RiseOutlined style={{ color: 'var(--success-500)' }} />
                  <span>Cours Populaires</span>
                </Space>
              }
              className="data-card"
              extra={
                <Button type="link" icon={<EyeOutlined />}>
                  Voir tout
                </Button>
              }
            >
              <List
                dataSource={topCourses}
                renderItem={(course, index) => (
                  <List.Item style={{ border: 'none', padding: 'var(--space-4) 0' }}>
                    <List.Item.Meta
                      avatar={
                        <div style={{
                          width: 40,
                          height: 40,
                          borderRadius: 'var(--radius-lg)',
                          background: `linear-gradient(135deg, var(--primary-${300 + index * 100}) 0%, var(--primary-${400 + index * 100}) 100%)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--text-white)',
                          fontWeight: 'var(--font-weight-bold)'
                        }}>
                          {index + 1}
                        </div>
                      }
                      title={
                        <div>
                          <Text strong>{course.name}</Text>
                          <br />
                          <Space size="small" style={{ marginTop: 'var(--space-1)' }}>
                            <Tag color="blue">{course.students} étudiants</Tag>
                            <Text type="secondary">⭐ {course.rating}</Text>
                          </Space>
                        </div>
                      }
                      description={
                        <Progress 
                          percent={course.progress} 
                          size="small" 
                          strokeColor="var(--success-500)"
                        />
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>

        {/* Quick Actions */}
        <Card 
          title={
            <Space>
              <CalendarOutlined style={{ color: 'var(--accent-purple)' }} />
              <span>Actions Rapides</span>
            </Space>
          }
          className="data-card hover-lift"
          style={{ marginTop: 'var(--space-6)' }}
        >
          <div className="button-group">
            <Button 
              type="primary" 
              icon={<UserOutlined />} 
              size="large"
              className="hover-lift"
            >
              Ajouter un Utilisateur
            </Button>
            <Button 
              type="primary" 
              icon={<BookOutlined />} 
              size="large"
              style={{ 
                background: 'linear-gradient(135deg, var(--success-500) 0%, var(--success-600) 100%)',
                borderColor: 'var(--success-500)'
              }}
              className="hover-lift"
            >
              Créer un Cours
            </Button>
            <Button 
              type="primary" 
              icon={<CalendarOutlined />} 
              size="large"
              onClick={() => navigate('/calendar')}
              style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderColor: '#667eea'
              }}
              className="hover-lift"
            >
              📅 Calendrier
            </Button>
            <Button 
              type="primary" 
              icon={<TeamOutlined />} 
              size="large"
              style={{ 
                background: 'linear-gradient(135deg, var(--accent-orange) 0%, #d46b08 100%)',
                borderColor: 'var(--accent-orange)'
              }}
              className="hover-lift"
            >
              Gérer les Classes
            </Button>
            <Button 
              type="primary" 
              icon={<TrophyOutlined />} 
              size="large"
              style={{ 
                background: 'linear-gradient(135deg, var(--accent-purple) 0%, #531dab 100%)',
                borderColor: 'var(--accent-purple)'
              }}
              className="hover-lift"
            >
              Voir les Résultats
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ModernDashboard;