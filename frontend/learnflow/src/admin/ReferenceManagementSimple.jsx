import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Button,
  Typography,
  Space,
  message,
  Spin,
  Layout,
  Menu,
  Breadcrumb,
  Badge
} from "antd";
import {
  BookOutlined,
  TeamOutlined,
  BankOutlined,
  GoldOutlined,
  BuildOutlined,
  PlusOutlined,
  SettingOutlined,
  ArrowRightOutlined,
  HomeOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  InfoCircleOutlined
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Header, Content, Sider } = Layout;

const referenceModules = [
  {
    key: 'specialites',
    title: 'Spécialités',
    description: 'Gérer les domaines d\'études et spécialités académiques disponibles dans l\'établissement',
    icon: <GoldOutlined />,
    color: '#faad14',
    route: '/reference/specialites',
    features: ['Créer', 'Modifier', 'Archiver', 'Statistiques']
  },
  {
    key: 'departements', 
    title: 'Départements',
    description: 'Organiser la structure administrative et pédagogique par départements',
    icon: <BankOutlined />,
    color: '#1677ff',
    route: '/reference/departements',
    features: ['Structure', 'Hiérarchie', 'Personnel', 'Budget']
  },
  {
    key: 'niveaux',
    title: 'Niveaux d\'Étude',
    description: 'Définir et organiser les différents niveaux académiques et cursus',
    icon: <TeamOutlined />,
    color: '#722ed1', 
    route: '/reference/niveaux',
    features: ['L1-L3', 'M1-M2', 'Doctorat', 'Certifications']
  },
  {
    key: 'classes',
    title: 'Classes',
    description: 'Administrer les groupes d\'étudiants et leur organisation pédagogique',
    icon: <TeamOutlined />,
    color: '#fa8c16',
    route: '/reference/classes',
    features: ['Effectifs', 'Planning', 'Enseignants', 'Locaux']
  },
  {
    key: 'salles',
    title: 'Salles & Espaces',
    description: 'Gérer les infrastructures et espaces dédiés à l\'enseignement',
    icon: <BuildOutlined />,
    color: '#52c41a',
    route: '/reference/salles',
    features: ['Capacité', 'Équipements', 'Réservation', 'Maintenance']
  },
  {
    key: 'matieres',
    title: 'Matières',
    description: 'Organiser le catalogue des matières et unités d\'enseignement',
    icon: <BookOutlined />,
    color: '#eb2f96',
    route: '/reference/matieres',
    features: ['Programmes', 'Coefficients', 'Prérequis', 'Évaluation']
  }
];

const ReferenceManagementSimple = () => {
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [selectedModule, setSelectedModule] = useState('dashboard');
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

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

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-container__spinner" />
        <div className="loading-container__text">
          Chargement des données de référence...
        </div>
      </div>
    );
  }

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
              Mode Simple
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
                { title: 'Référence Simple' }
              ]}
            />
          </div>

          <Space>
            <Badge count={3} size="small">
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
              {/* Header */}
              <div style={{ marginBottom: 'var(--space-8)', textAlign: 'center' }}>
                <Title level={1} className="form-title">
                  🎯 Données de Référence
                </Title>
                <Text style={{ fontSize: 'var(--font-size-lg)', color: 'var(--text-secondary)' }}>
                  Accédez rapidement à la gestion de toutes les données structurelles de votre plateforme
                </Text>
              </div>

        {/* Reference Modules Grid */}
        <Row gutter={[24, 24]}>
          {referenceModules.map((module) => (
            <Col xs={24} sm={12} lg={8} key={module.key}>
              <Card
                className="data-card hover-lift"
                style={{ height: '100%' }}
                bodyStyle={{ padding: 'var(--space-6)', height: '100%' }}
                actions={[
                  <Button
                    key="manage"
                    type="primary"
                    size="large"
                    icon={<SettingOutlined />}
                    onClick={() => navigateToModule(module.route)}
                    style={{ width: '80%' }}
                  >
                    Gérer
                  </Button>,
                  <Button
                    key="create"
                    type="outline"
                    size="large" 
                    icon={<PlusOutlined />}
                    onClick={() => {
                      navigateToModule(module.route);
                      message.info(`Redirection vers la création d'un nouvel élément`);
                    }}
                    style={{ width: '80%', marginTop: 'var(--space-2)' }}
                  >
                    Créer
                  </Button>
                ]}
              >
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  height: '100%',
                  minHeight: '200px'
                }}>
                  {/* Module Header */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    marginBottom: 'var(--space-4)' 
                  }}>
                    <div 
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: 'var(--radius-xl)',
                        background: `${module.color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 'var(--space-4)',
                        fontSize: 'var(--font-size-xl)',
                        color: module.color
                      }}
                    >
                      {module.icon}
                    </div>
                    <div>
                      <Title level={4} style={{ margin: 0, color: module.color }}>
                        {module.title}
                      </Title>
                    </div>
                  </div>

                  {/* Description */}
                  <Text 
                    style={{ 
                      color: 'var(--text-secondary)', 
                      fontSize: 'var(--font-size-sm)',
                      lineHeight: 'var(--line-height-relaxed)',
                      marginBottom: 'var(--space-4)',
                      flex: 1
                    }}
                  >
                    {module.description}
                  </Text>

                  {/* Features */}
                  <div>
                    <Text 
                      strong 
                      style={{ 
                        fontSize: 'var(--font-size-xs)', 
                        color: 'var(--text-tertiary)',
                        marginBottom: 'var(--space-2)',
                        display: 'block'
                      }}
                    >
                      FONCTIONNALITÉS CLÉS:
                    </Text>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1)' }}>
                      {module.features.map((feature, index) => (
                        <span
                          key={index}
                          style={{
                            padding: '2px 6px',
                            backgroundColor: `${module.color}10`,
                            color: module.color,
                            fontSize: 'var(--font-size-xs)',
                            borderRadius: 'var(--radius-sm)',
                            border: `1px solid ${module.color}30`
                          }}
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Quick Access Section */}
        <Card 
          className="data-card"
          style={{ marginTop: 'var(--space-8)' }}
          title={
            <Space>
              <ArrowRightOutlined style={{ color: 'var(--accent-purple)' }} />
              <span>Accès Rapide</span>
            </Space>
          }
        >
          <Row gutter={[16, 16]}>
            {referenceModules.map((module) => (
              <Col xs={12} sm={8} md={6} lg={4} key={`quick-${module.key}`}>
                <Button
                  size="large"
                  block
                  onClick={() => navigateToModule(module.route)}
                  className="hover-lift"
                  style={{
                    height: '64px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-1)',
                    border: `2px solid ${module.color}20`,
                    backgroundColor: `${module.color}05`
                  }}
                >
                  <div style={{ fontSize: 'var(--font-size-lg)', color: module.color }}>
                    {module.icon}
                  </div>
                  <Text style={{ fontSize: 'var(--font-size-xs)', color: module.color }}>
                    {module.title}
                  </Text>
                </Button>
              </Col>
            ))}
          </Row>
        </Card>
            </div>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default ReferenceManagementSimple;