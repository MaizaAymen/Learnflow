import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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

const ReferenceManagementSimple = () => {
  const [selectedComponent, setSelectedComponent] = useState('dashboard');
  const navigate = useNavigate();
  
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleLogout = () => {
    console.log("Logging out...");
    // Add logout logic here
    navigate("/auth");
  };

  const handleMenuClick = (e) => {
    setSelectedComponent(e.key);
    // Navigate to the selected component
    if (e.key !== 'dashboard') {
      navigate(`/reference/${e.key}`);
    }
  };

  const navigateToComponent = (componentName) => {
    navigate(`/reference/${componentName}`);
  };

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
          items={items1}
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
        <Sider width={200} className="site-layout-background">
          <Menu
            mode="inline"
            selectedKeys={[selectedComponent]}
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
                    onClick={() => navigateToComponent('specialites')}
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
                    onClick={() => navigateToComponent('departements')}
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
                    onClick={() => navigateToComponent('niveaux')}
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
                    onClick={() => navigateToComponent('classes')}
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
                    onClick={() => navigateToComponent('salles')}
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
                    onClick={() => navigateToComponent('matieres')}
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
                        onClick={() => navigateToComponent('specialites')}
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
                        onClick={() => navigateToComponent('departements')}
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
                        onClick={() => navigateToComponent('niveaux')}
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
                        onClick={() => navigateToComponent('classes')}
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
                        onClick={() => navigateToComponent('salles')}
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
                        onClick={() => navigateToComponent('matieres')}
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
};

export default ReferenceManagementSimple;