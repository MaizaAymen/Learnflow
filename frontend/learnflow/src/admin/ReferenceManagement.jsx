import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Statistic,
  Button,
  Typography,
  Space,
  Badge,
  Progress,
  Tag,
  Avatar,
  Divider,
  Alert,
  message,
  Layout,
  Menu,
  Breadcrumb
} from "antd";
import {
  BookOutlined,
  TeamOutlined,
  BankOutlined,
  GoldOutlined,
  BuildOutlined,
  PlusOutlined,
  BarChartOutlined,
  RiseOutlined,
  DatabaseOutlined,
  SettingOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  HomeOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;
const { Header, Content, Sider } = Layout;

// Reference data configuration
const referenceModules = [
  {
    key: 'specialites',
    title: 'Spécialités',
    description: 'Gérer les spécialités académiques',
    icon: <GoldOutlined />,
    color: '#faad14',
    gradient: 'linear-gradient(135deg, #faad14 0%, #d48806 100%)',
    route: '/reference/specialites',
    stats: { total: 0, active: 0, trend: 'up' }
  },
  {
    key: 'departements',
    title: 'Départements',
    description: 'Organiser les départements',
    icon: <BankOutlined />,
    color: '#1677ff',
    gradient: 'linear-gradient(135deg, #1677ff 0%, #0958d9 100%)',
    route: '/reference/departements',
    stats: { total: 0, active: 0, trend: 'stable' }
  },
  {
    key: 'niveaux',
    title: 'Niveaux',
    description: 'Définir les niveaux d\'étude',
    icon: <TeamOutlined />,
    color: '#722ed1',
    gradient: 'linear-gradient(135deg, #722ed1 0%, #531dab 100%)',
    route: '/reference/niveaux',
    stats: { total: 0, active: 0, trend: 'up' }
  },
  {
    key: 'classes',
    title: 'Classes',
    description: 'Administrer les classes',
    icon: <TeamOutlined />,
    color: '#fa8c16',
    gradient: 'linear-gradient(135deg, #fa8c16 0%, #d46b08 100%)',
    route: '/reference/classes',
    stats: { total: 0, active: 0, trend: 'down' }
  },
  {
    key: 'salles',
    title: 'Salles',
    description: 'Gérer les espaces de cours',
    icon: <BuildOutlined />,
    color: '#52c41a',
    gradient: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
    route: '/reference/salles',
    stats: { total: 0, active: 0, trend: 'up' }
  },
  {
    key: 'matieres',
    title: 'Matières',
    description: 'Organiser les matières enseignées',
    icon: <BookOutlined />,
    color: '#eb2f96',
    gradient: 'linear-gradient(135deg, #eb2f96 0%, #c41d7f 100%)',
    route: '/reference/matieres',
    stats: { total: 0, active: 0, trend: 'stable' }
  }
];

const ReferenceManagement = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [recentActivity, setRecentActivity] = useState([]);
  const [collapsed, setCollapsed] = useState(false);
  const [selectedModule, setSelectedModule] = useState('dashboard');
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Simulate API calls to fetch reference data statistics
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data - replace with actual API calls
      setStats({
        specialites: { total: 8, active: 7, growth: 12.5 },
        departements: { total: 5, active: 5, growth: 0 },
        niveaux: { total: 6, active: 6, growth: 8.3 },
        classes: { total: 24, active: 22, growth: -5.2 },
        salles: { total: 15, active: 14, growth: 6.7 },
        matieres: { total: 42, active: 38, growth: 15.8 }
      });

      setRecentActivity([
        { action: 'Nouvelle spécialité ajoutée', details: 'Intelligence Artificielle', time: '2 min', type: 'create' },
        { action: 'Classe modifiée', details: 'Info 3A - Capacité mise à jour', time: '15 min', type: 'update' },
        { action: 'Salle désactivée', details: 'Salle B204 - Maintenance', time: '1 h', type: 'delete' },
        { action: 'Nouveau département', details: 'Cybersécurité', time: '2 h', type: 'create' },
        { action: 'Matière archivée', details: 'Ancienne méthode de prog.', time: '3 h', type: 'archive' }
      ]);
    } catch (error) {
      message.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const navigateToModule = (route) => {
    navigate(route);
  };

  const handleMenuClick = (e) => {
    setSelectedModule(e.key);
    if (e.key !== 'dashboard') {
      const module = referenceModules.find(m => m.key === e.key);
      if (module?.route) {
        navigate(module.route);
      }
    }
  };

  const menuItems = [
    {
      key: 'dashboard',
      icon: <HomeOutlined />,
      label: 'Tableau de Bord',
    },
    {
      type: 'divider',
    },
    ...referenceModules.map(module => ({
      key: module.key,
      icon: module.icon,
      label: module.title,
    })),
    {
      type: 'divider',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Paramètres',
    }
  ];

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return <RiseOutlined style={{ color: '#52c41a' }} />;
      case 'down': return <RiseOutlined style={{ color: '#ff4d4f', transform: 'rotate(180deg)' }} />;
      default: return <BarChartOutlined style={{ color: '#faad14' }} />;
    }
  };

  return (
    <Layout style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Sider 
        collapsible 
        collapsed={collapsed} 
        onCollapse={setCollapsed}
        theme="light"
        width={260}
        style={{
          background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
          borderRight: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div style={{ 
          padding: '24px 16px', 
          borderBottom: '1px solid var(--border-color)',
          textAlign: 'center'
        }}>
          <Title level={4} style={{ margin: 0, color: 'var(--primary-600)' }}>
            {collapsed ? 'LF' : 'LearnFlow'}
          </Title>
          {!collapsed && (
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Données de Référence
            </Text>
          )}
        </div>
        
        <Menu
          mode="inline"
          selectedKeys={[selectedModule]}
          onClick={handleMenuClick}
          style={{ 
            border: 'none',
            background: 'transparent',
            marginTop: '16px'
          }}
          items={menuItems}
        />
      </Sider>

      <Layout>
        <Header style={{ 
          background: 'white', 
          padding: '0 24px', 
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ marginRight: '16px' }}
            />
            
            <Breadcrumb
              items={[
                { title: <HomeOutlined /> },
                { title: 'Administration' },
                { title: 'Données de Référence' }
              ]}
            />
          </div>

          <Space>
            <Badge count={5} size="small">
              <Button type="text" icon={<InfoCircleOutlined />} />
            </Badge>
          </Space>
        </Header>

        <Content style={{ 
          padding: '24px', 
          background: 'var(--bg-primary)',
          overflow: 'auto'
        }}>
          <div className="page-wrapper animate-fadeInUp">
            <div className="app-container">
              {/* Header Section */}
              <div style={{ marginBottom: 'var(--space-8)' }}>
                <Title level={1} className="form-title" style={{ marginBottom: 'var(--space-2)' }}>
                  📊 Données de Référence
                </Title>
                <Paragraph style={{ fontSize: 'var(--font-size-lg)', color: 'var(--text-secondary)' }}>
                  Gérez efficacement toutes les données de base de votre plateforme éducative
                </Paragraph>
                
                <Alert
                  message="Système opérationnel"
                  description="Toutes les fonctionnalités de gestion des données de référence sont disponibles"
                  type="success"
                  showIcon
                  closable
                  style={{ marginTop: 'var(--space-4)' }}
                />
              </div>

        {/* Statistics Overview */}
        <div className="stats-grid" style={{ marginBottom: 'var(--space-8)' }}>
          {referenceModules.map((module) => {
            const moduleStats = stats[module.key] || { total: 0, active: 0, growth: 0 };
            return (
              <Card 
                key={module.key}
                className="data-card hover-lift"
                loading={loading}
                style={{ 
                  background: module.gradient,
                  border: 'none',
                  color: 'white'
                }}
                bodyStyle={{ padding: 'var(--space-6)' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                      <Avatar 
                        size="large" 
                        icon={module.icon} 
                        style={{ 
                          backgroundColor: 'rgba(255,255,255,0.2)',
                          color: 'white',
                          marginRight: 'var(--space-3)'
                        }} 
                      />
                      <div>
                        <Title level={4} style={{ color: 'white', margin: 0 }}>
                          {module.title}
                        </Title>
                        <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 'var(--font-size-sm)' }}>
                          {module.description}
                        </Text>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                      <Statistic
                        title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Total</span>}
                        value={moduleStats.total}
                        valueStyle={{ color: 'white', fontSize: 'var(--font-size-2xl)' }}
                      />
                      <Statistic
                        title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Actifs</span>}
                        value={moduleStats.active}
                        valueStyle={{ color: 'white', fontSize: 'var(--font-size-xl)' }}
                      />
                    </div>

                    <div style={{ marginTop: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      {getTrendIcon(module.stats.trend)}
                      <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 'var(--font-size-sm)' }}>
                        {moduleStats.growth > 0 ? '+' : ''}{moduleStats.growth.toFixed(1)}% ce mois
                      </Text>
                    </div>
                  </div>
                </div>

                <Button
                  type="primary"
                  ghost
                  block
                  size="large"
                  icon={<SettingOutlined />}
                  onClick={() => navigateToModule(module.route)}
                  style={{ 
                    marginTop: 'var(--space-4)',
                    borderColor: 'rgba(255,255,255,0.5)',
                    color: 'white'
                  }}
                >
                  Gérer {module.title}
                </Button>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions & Recent Activity */}
        <Row gutter={[24, 24]}>
          {/* Quick Actions */}
          <Col xs={24} lg={14}>
            <Card 
              className="data-card"
              title={
                <Space>
                  <PlusOutlined style={{ color: 'var(--primary-500)' }} />
                  <span>Actions Rapides</span>
                </Space>
              }
              extra={
                <Tag color="blue" icon={<InfoCircleOutlined />}>
                  Créer du contenu
                </Tag>
              }
            >
              <Row gutter={[16, 16]}>
                {referenceModules.map((module) => (
                  <Col xs={12} sm={8} md={6} key={module.key}>
                    <Button
                      type="outline"
                      size="large"
                      block
                      icon={module.icon}
                      onClick={() => navigateToModule(module.route)}
                      className="hover-lift"
                      style={{
                        height: '80px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--space-2)',
                        border: `2px solid ${module.color}20`,
                        color: module.color
                      }}
                    >
                      <div style={{ fontSize: 'var(--font-size-lg)' }}>
                        {module.icon}
                      </div>
                      <Text style={{ fontSize: 'var(--font-size-xs)', color: module.color }}>
                        Nouveau {module.title.toLowerCase()}
                      </Text>
                    </Button>
                  </Col>
                ))}
              </Row>
            </Card>
          </Col>

          {/* Recent Activity */}
          <Col xs={24} lg={10}>
            <Card 
              className="data-card"
              title={
                <Space>
                  <BarChartOutlined style={{ color: 'var(--secondary-500)' }} />
                  <span>Activité Récente</span>
                </Space>
              }
              extra={
                <Badge count={recentActivity.length} style={{ backgroundColor: 'var(--secondary-500)' }} />
              }
            >
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {recentActivity.map((activity, index) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    padding: 'var(--space-3) 0',
                    borderBottom: index < recentActivity.length - 1 ? '1px solid var(--border-light)' : 'none'
                  }}>
                    <Avatar 
                      size="small" 
                      style={{ 
                        backgroundColor: activity.type === 'create' ? 'var(--success-500)' : 
                                       activity.type === 'update' ? 'var(--warning-500)' : 
                                       activity.type === 'delete' ? 'var(--error-500)' : 'var(--info-500)',
                        marginRight: 'var(--space-3)'
                      }}
                      icon={
                        activity.type === 'create' ? <PlusOutlined /> :
                        activity.type === 'update' ? <SettingOutlined /> :
                        activity.type === 'delete' ? <ExclamationCircleOutlined /> : 
                        <CheckCircleOutlined />
                      }
                    />
                    <div style={{ flex: 1 }}>
                      <Text strong style={{ fontSize: 'var(--font-size-sm)' }}>
                        {activity.action}
                      </Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 'var(--font-size-xs)' }}>
                        {activity.details}
                      </Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 'var(--font-size-xs)' }}>
                        Il y a {activity.time}
                      </Text>
                    </div>
                  </div>
                ))}
              </div>
              
              <Divider />
              
              <Button 
                type="link" 
                block 
                onClick={() => message.info('Historique complet à venir')}
                style={{ color: 'var(--text-secondary)' }}
              >
                Voir toute l'activité
              </Button>
            </Card>
          </Col>
        </Row>

        {/* System Information */}
        <Row gutter={[24, 24]} style={{ marginTop: 'var(--space-8)' }}>
          <Col span={24}>
            <Card 
              className="data-card"
              title={
                <Space>
                  <DatabaseOutlined style={{ color: 'var(--accent-purple)' }} />
                  <span>État du Système</span>
                </Space>
              }
            >
              <Row gutter={[24, 24]}>
                <Col xs={24} md={8}>
                  <Statistic
                    title="Version Plateforme"
                    value="LearnFlow v2.1.0"
                    prefix={<CheckCircleOutlined style={{ color: 'var(--success-500)' }} />}
                  />
                </Col>
                <Col xs={24} md={8}>
                  <Statistic
                    title="Dernière Synchronisation"
                    value={new Date().toLocaleString('fr-FR')}
                    prefix={<InfoCircleOutlined style={{ color: 'var(--info-500)' }} />}
                  />
                </Col>
                <Col xs={24} md={8}>
                  <div>
                    <Text strong>Performance Système</Text>
                    <Progress 
                      percent={94} 
                      status="active" 
                      strokeColor={{
                        '0%': 'var(--success-500)',
                        '100%': 'var(--success-600)',
                      }}
                    />
                    <Text type="secondary" style={{ fontSize: 'var(--font-size-sm)' }}>
                      Excellente performance
                    </Text>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
            </div>
          </div>
        </Content>
      </Layout>
    </Layout>
  );

};

export default ReferenceManagement;