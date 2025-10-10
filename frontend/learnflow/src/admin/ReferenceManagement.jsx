import React, { useState } from "react";
import {
  Layout,
  Menu,
  Breadcrumb,
  Card,
  Row,
  Col,
  Statistic,
  Button,
  theme
} from "antd";
import {
  UserOutlined,
  LaptopOutlined,
  LogoutOutlined,
  BookOutlined,
  HomeOutlined,
  TeamOutlined,
  BankOutlined,
  GoldOutlined,
  BuildOutlined
} from "@ant-design/icons";

// Import all management components
import SpecialiteManagement from './SpecialiteManagement';
import DepartementManagement from './DepartementManagement';
import NiveauManagement from './NiveauManagement';
import ClasseManagement from './ClasseManagement';
import SalleManagement from './SalleManagement';
import MatiereManagement from './MatiereManagement';

const { Header, Content, Sider } = Layout;

const items1 = [
  { key: '1', label: 'Dashboard' },
  { key: '2', label: 'Users' },
  { key: '3', label: 'Reports' }
];

const items2 = [
  {
    key: 'users',
    icon: React.createElement(UserOutlined),
    label: 'User Management',
    children: [
      { key: 'show-users', label: 'Show Users' },
      { key: 'add-user', label: 'Add User' },
    ],
  },
  {
    key: 'reference',
    icon: React.createElement(LaptopOutlined),
    label: 'Reference Data',
    children: [
      { key: 'dashboard', label: 'Dashboard' },
      { key: 'specialites', label: 'Spécialités' },
      { key: 'departements', label: 'Départements' },
      { key: 'niveaux', label: 'Niveaux' },
      { key: 'classes', label: 'Classes' },
      { key: 'salles', label: 'Salles' },
      { key: 'matieres', label: 'Matières' },
    ],
  },
];

const ReferenceManagement = () => {
  const [selectedComponent, setSelectedComponent] = useState('dashboard');
  
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleLogout = () => {
    // Add logout logic here
    console.log("Logging out...");
  };

  const handleMenuClick = (e) => {
    setSelectedComponent(e.key);
  };

  const renderContent = () => {
    switch (selectedComponent) {
      case 'specialites':
        return <SpecialiteManagement />;
      case 'departements':
        return <DepartementManagement />;
      case 'niveaux':
        return <NiveauManagement />;
      case 'classes':
        return <ClasseManagement />;
      case 'salles':
        return <SalleManagement />;
      case 'matieres':
        return <MatiereManagement />;
      default:
        return (
          <Layout style={{ minHeight: "100vh" }}>
            <Header
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 20px",
              }}
            >
              <div className="demo-logo" style={{ color: "#fff", fontWeight: "bold" }}>
                LearnFlow Admin
              </div>

              <Menu
                theme="dark"
                mode="horizontal"
                defaultSelectedKeys={["1"]}
                            prefix={<HomeOutlined />}
                style={{ flex: 1, minWidth: 0 }}
              />

              <Button
                type="primary"
                icon={<LogoutOutlined />}
                onClick={handleLogout}
                danger
              >
                Logout
              </Button>
            </Header>

            <Layout>
              <Sider width={250} style={{ background: colorBgContainer }}>
                <Menu
                  mode="inline"
                          icon={<HomeOutlined />}
                  defaultOpenKeys={["reference"]}
                  style={{ height: "100%", borderRight: 0 }}
                  items={items2}
                  onClick={handleMenuClick}
                />
              </Sider>

              <Layout style={{ padding: "0 24px 24px" }}>
                <Breadcrumb
                  style={{ margin: "16px 0" }}
                  items={[
                    { title: "Home" },
                    { title: "Reference Data" },
                    { title: "Dashboard" },
                  ]}
                />

                <Content
                  style={{
                    padding: 24,
                    margin: 0,
                    minHeight: 280,
                    background: colorBgContainer,
                    borderRadius: borderRadiusLG,
                  }}
                >
                  <h1 style={{ marginBottom: 24 }}>Tableau de Bord - Données de Référence</h1>
                  
                  <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                    <Col xs={24} sm={12} md={8} lg={6}>
                      <Card>
                        <Statistic
                          title="Spécialités"
                          value={0}
                          prefix={<GoldOutlined />}
                          valueStyle={{ color: '#3f8600' }}
                        />
                        <Button 
                          type="link" 
                          onClick={() => setSelectedComponent('specialites')}
                          style={{ marginTop: 8 }}
                        >
                          Gérer les spécialités
                        </Button>
                      </Card>
                    </Col>
                    
                    <Col xs={24} sm={12} md={8} lg={6}>
                      <Card>
                        <Statistic
                          title="Départements"
                          value={0}
                          prefix={<BankOutlined />}
                          valueStyle={{ color: '#1890ff' }}
                        />
                        <Button 
                          type="link" 
                          onClick={() => setSelectedComponent('departements')}
                          style={{ marginTop: 8 }}
                        >
                          Gérer les départements
                        </Button>
                      </Card>
                    </Col>
                    
                    <Col xs={24} sm={12} md={8} lg={6}>
                      <Card>
                        <Statistic
                          title="Niveaux"
                          value={0}
                          prefix={<TeamOutlined />}
                          valueStyle={{ color: '#722ed1' }}
                        />
                        <Button 
                          type="link" 
                          onClick={() => setSelectedComponent('niveaux')}
                          style={{ marginTop: 8 }}
                        >
                          Gérer les niveaux
                        </Button>
                      </Card>
                    </Col>
                    
                    <Col xs={24} sm={12} md={8} lg={6}>
                      <Card>
                        <Statistic
                          title="Classes"
                          value={0}
                          prefix={<HomeOutlined />}
                          valueStyle={{ color: '#fa8c16' }}
                        />
                        <Button 
                          type="link" 
                          onClick={() => setSelectedComponent('classes')}
                          style={{ marginTop: 8 }}
                        >
                          Gérer les classes
                        </Button>
                      </Card>
                    </Col>
                    
                    <Col xs={24} sm={12} md={8} lg={6}>
                      <Card>
                        <Statistic
                          title="Salles"
                          value={0}
                          prefix={<BuildOutlined />}
                          valueStyle={{ color: '#52c41a' }}
                        />
                        <Button 
                          type="link" 
                          onClick={() => setSelectedComponent('salles')}
                          style={{ marginTop: 8 }}
                        >
                          Gérer les salles
                        </Button>
                      </Card>
                    </Col>
                    
                    <Col xs={24} sm={12} md={8} lg={6}>
                      <Card>
                        <Statistic
                          title="Matières"
                          value={0}
                          prefix={<BookOutlined />}
                          valueStyle={{ color: '#eb2f96' }}
                        />
                        <Button 
                          type="link" 
                          onClick={() => setSelectedComponent('matieres')}
                          style={{ marginTop: 8 }}
                        >
                          Gérer les matières
                        </Button>
                      </Card>
                    </Col>
                  </Row>

                  <Row gutter={[16, 16]}>
                    <Col span={24}>
                      <Card title="Actions Rapides" bordered={false}>
                        <Row gutter={[16, 16]}>
                          <Col xs={24} sm={12} md={8} lg={6}>
                            <Button 
                              type="primary" 
                              size="large" 
                              block
                              icon={<GoldOutlined />}
                              onClick={() => setSelectedComponent('specialites')}
                            >
                              Nouvelle Spécialité
                            </Button>
                          </Col>
                          <Col xs={24} sm={12} md={8} lg={6}>
                            <Button 
                              type="primary" 
                              size="large" 
                              block
                              icon={<BankOutlined />}
                              onClick={() => setSelectedComponent('departements')}
                            >
                              Nouveau Département
                            </Button>
                          </Col>
                          <Col xs={24} sm={12} md={8} lg={6}>
                            <Button 
                              type="primary" 
                              size="large" 
                              block
                              icon={<TeamOutlined />}
                              onClick={() => setSelectedComponent('niveaux')}
                            >
                              Nouveau Niveau
                            </Button>
                          </Col>
                          <Col xs={24} sm={12} md={8} lg={6}>
                            <Button 
                              type="primary" 
                              size="large" 
                              block
                              icon={<HomeOutlined />}
                              onClick={() => setSelectedComponent('classes')}
                            >
                              Nouvelle Classe
                            </Button>
                          </Col>
                          <Col xs={24} sm={12} md={8} lg={6}>
                            <Button 
                              type="primary" 
                              size="large" 
                              block
                              icon={<BuildOutlined />}
                              onClick={() => setSelectedComponent('salles')}
                            >
                              Nouvelle Salle
                            </Button>
                          </Col>
                          <Col xs={24} sm={12} md={8} lg={6}>
                            <Button 
                              type="primary" 
                              size="large" 
                              block
                              icon={<BookOutlined />}
                              onClick={() => setSelectedComponent('matieres')}
                            >
                              Nouvelle Matière
                            </Button>
                          </Col>
                        </Row>
                      </Card>
                    </Col>
                  </Row>

                  <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                    <Col span={24}>
                      <Card title="Informations Système" bordered={false}>
                        <p><strong>Version:</strong> LearnFlow v1.0.0</p>
                        <p><strong>Dernière mise à jour:</strong> {new Date().toLocaleDateString()}</p>
                        <p><strong>État du système:</strong> <span style={{ color: '#52c41a' }}>Opérationnel</span></p>
                      </Card>
                    </Col>
                  </Row>
                </Content>
              </Layout>
            </Layout>
          </Layout>
        );
    }
  };

  // If a specific component is selected, render it directly
  if (selectedComponent !== 'dashboard') {
    return renderContent();
  }

  // Otherwise render the dashboard
  return renderContent();
};

export default ReferenceManagement;