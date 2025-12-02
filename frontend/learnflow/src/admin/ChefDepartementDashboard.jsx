import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Layout,
  Card,
  Row,
  Col,
  Button,
  Typography,
  Space,
  message,
  Spin,
  Menu,
  Breadcrumb,
  Statistic,
  Descriptions,
  Alert,
  Divider,
  Badge,
  Tag
} from "antd";
import {
  TeamOutlined,
  BankOutlined,
  BookOutlined,
  CopyOutlined,
  SettingOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  HomeOutlined,
  LaptopOutlined,
  UserOutlined,
  PlusOutlined
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;
const { Header, Content, Sider } = Layout;

const ChefDepartementDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [departmentInfo, setDepartmentInfo] = useState(null);
  const [stats, setStats] = useState({
    teachers: 0,
    specialites: 0,
    niveaux: 0,
    classes: 0,
    matieres: 0,
    salles: 0
  });
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  // Check user role and permissions
  useEffect(() => {
    const checkAccess = () => {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setUserRole(user.role);
        
        // Only allow chef_de_department or admin
        if (!['chef_de_department', 'admin'].includes(user.role) && !user.is_department_head) {
          message.error("Accès refusé. Vous n'êtes pas un chef de département.");
          navigate('/');
        }
      }
    };
    checkAccess();
  }, [navigate]);

  // Fetch department info
  const fetchDepartmentInfo = async () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        message.error("User information not found");
        return;
      }

      const user = JSON.parse(userStr);
      const response = await fetch(`http://localhost:3000/api/reference/departements/${user.departement}`);
      const data = await response.json();

      if (response.ok) {
        setDepartmentInfo(data);
        await fetchStats(user.departement);
      } else {
        message.error(data.message || "Failed to fetch department info");
      }
    } catch (error) {
      console.error("Error fetching department info:", error);
      message.error("Error fetching department information");
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics for the department
  const fetchStats = async (deptId) => {
    try {
      const [teachersRes, specialitesRes, niveauxRes, classesRes, matieresRes, sallesRes] = await Promise.all([
        fetch("http://localhost:3000/api/reference/teachers"),
        fetch("http://localhost:3000/api/reference/specialites"),
        fetch("http://localhost:3000/api/reference/niveaux"),
        fetch("http://localhost:3000/api/reference/classes"),
        fetch("http://localhost:3000/api/reference/matieres"),
        fetch("http://localhost:3000/api/reference/salles"),
      ]);

      const teachersData = await teachersRes.json();
      const specialitesData = await specialitesRes.json();
      const niveauxData = await niveauxRes.json();
      const classesData = await classesRes.json();
      const matieresData = await matieresRes.json();
      const sallesData = await sallesRes.json();

      // Filter data for this department
      let teachersCount = Array.isArray(teachersData) 
        ? teachersData.filter(t => t.departement === deptId).length 
        : 0;
      let specialitesCount = Array.isArray(specialitesData) 
        ? specialitesData.filter(s => s.departementId === deptId).length 
        : 0;
      let niveauxCount = Array.isArray(niveauxData) 
        ? niveauxData.filter(n => n.specialite && n.specialite.departementId === deptId).length 
        : 0;
      let classesCount = Array.isArray(classesData) 
        ? classesData.filter(c => c.niveau && c.niveau.specialite && c.niveau.specialite.departementId === deptId).length 
        : 0;
      let matieresCount = Array.isArray(matieresData) 
        ? matieresData.filter(m => m.niveauId && m.niveau && m.niveau.specialite && m.niveau.specialite.departementId === deptId).length 
        : 0;
      let sallesCount = Array.isArray(sallesData) ? sallesData.length : 0;

      setStats({
        teachers: teachersCount,
        specialites: specialitesCount,
        niveaux: niveauxCount,
        classes: classesCount,
        matieres: matieresCount,
        salles: sallesCount
      });
    } catch (error) {
      console.error("Error fetching statistics:", error);
    }
  };

  useEffect(() => {
    fetchDepartmentInfo();
  }, []);

  const modules = [
    {
      key: 'specialites',
      title: 'Spécialités',
      description: 'Gérer les domaines d\'études de votre département',
      icon: <BookOutlined style={{ fontSize: 32, color: '#faad14' }} />,
      route: '/reference/specialites',
      count: stats.specialites,
      features: ['Créer', 'Modifier', 'Archiver']
    },
    {
      key: 'niveaux',
      title: 'Niveaux d\'Étude',
      description: 'Définir et organiser les niveaux académiques',
      icon: <TeamOutlined style={{ fontSize: 32, color: '#722ed1' }} />,
      route: '/reference/niveaux',
      count: stats.niveaux,
      features: ['L1-L3', 'M1-M2', 'Certification']
    },
    {
      key: 'classes',
      title: 'Classes',
      description: 'Administrer les groupes d\'étudiants',
      icon: <TeamOutlined style={{ fontSize: 32, color: '#fa8c16' }} />,
      route: '/reference/classes',
      count: stats.classes,
      features: ['Effectifs', 'Planning', 'Enseignants']
    },
    {
      key: 'matieres',
      title: 'Matières',
      description: 'Organiser le catalogue des matières',
      icon: <BookOutlined style={{ fontSize: 32, color: '#eb2f96' }} />,
      route: '/reference/matieres',
      count: stats.matieres,
      features: ['Programmes', 'Coefficients', 'Évaluation']
    },
    {
      key: 'teachers',
      title: 'Enseignants',
      description: 'Gérer les enseignants et leurs matières',
      icon: <UserOutlined style={{ fontSize: 32, color: '#1677ff' }} />,
      route: '/reference/users',
      count: stats.teachers,
      features: ['Assigner matières', 'Workload', 'Planning']
    },
    {
      key: 'salles',
      title: 'Salles & Espaces',
      description: 'Gérer les infrastructures',
      icon: <CopyOutlined style={{ fontSize: 32, color: '#52c41a' }} />,
      route: '/reference/salles',
      count: stats.salles,
      features: ['Capacité', 'Équipements', 'Réservation']
    }
  ];

  const handleMenuClick = (e) => {
    const module = modules.find(m => m.key === e.key);
    if (module?.route) {
      navigate(module.route);
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
    ...modules.map(module => ({
      key: module.key,
      icon: module.icon,
      label: `${module.title} (${module.count})`,
    })),
    {
      type: 'divider',
    },
    {
      key: 'back',
      icon: <ArrowLeftOutlined />,
      label: 'Retour Référence',
    }
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider width={250} style={{ background: '#fff' }}>
        <div style={{ padding: '16px', textAlign: 'center', borderBottom: '1px solid #f0f0f0' }}>
          <Title level={4} style={{ margin: 0 }}>Chef de Département</Title>
        </div>
        <Menu
          mode="inline"
          defaultSelectedKeys={["dashboard"]}
          style={{ height: "100%", borderRight: 0 }}
          items={menuItems}
          onClick={(e) => {
            if (e.key === 'back') navigate('/reference');
            else handleMenuClick(e);
          }}
        />
      </Sider>

      <Layout style={{ padding: "0 24px 24px" }}>
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col span={24}>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/reference")}
              style={{ marginBottom: 16 }}
            >
              Retour aux Données de Référence
            </Button>
          </Col>
        </Row>

        <Breadcrumb
          style={{ margin: "16px 0" }}
          items={[
            { 
              title: (
                <span 
                  onClick={() => navigate("/")} 
                  style={{ cursor: 'pointer' }}
                >
                  Home
                </span>
              )
            },
            { 
              title: (
                <span 
                  onClick={() => navigate("/reference")} 
                  style={{ cursor: 'pointer' }}
                >
                  Données de Référence
                </span>
              )
            },
            { title: "Tableau de Bord Chef de Département" },
          ]}
        />

        <Content style={{ padding: 24 }}>
          {/* Department Info Card */}
          {departmentInfo && (
            <Card
              title={
                <span>
                  <BankOutlined style={{ marginRight: 8 }} />
                  {departmentInfo.name}
                </span>
              }
              style={{ marginBottom: 32 }}
              extra={
                <Tag color="blue">{departmentInfo.code}</Tag>
              }
            >
              <Row gutter={[24, 24]}>
                <Col xs={24} sm={12} lg={6}>
                  <Statistic
                    title="Enseignants"
                    value={stats.teachers}
                    prefix={<TeamOutlined />}
                  />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Statistic
                    title="Spécialités"
                    value={stats.specialites}
                    prefix={<BookOutlined />}
                  />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Statistic
                    title="Niveaux"
                    value={stats.niveaux}
                    prefix={<LaptopOutlined />}
                  />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Statistic
                    title="Classes"
                    value={stats.classes}
                    prefix={<TeamOutlined />}
                  />
                </Col>
              </Row>

              <Divider />

              <Descriptions column={{ xxl: 4, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }}>
                <Descriptions.Item label="Localisation">
                  {departmentInfo.localisation || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                  {departmentInfo.email || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Téléphone">
                  {departmentInfo.telephone || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Capacité Max">
                  {departmentInfo.capacite_max || "N/A"}
                </Descriptions.Item>
              </Descriptions>

              {departmentInfo.description && (
                <>
                  <Divider />
                  <Paragraph>
                    <strong>Description:</strong> {departmentInfo.description}
                  </Paragraph>
                </>
              )}
            </Card>
          )}

          {/* Access Control Info */}
          <Alert
            message="Accès Restreint au Département"
            description="Vous ne pouvez voir et modifier que les ressources appartenant à votre département. Les ressources d'autres départements sont masquées."
            type="info"
            showIcon
            style={{ marginBottom: 32 }}
          />

          {/* Modules Grid */}
          <Row gutter={[16, 16]}>
            {modules.map(module => (
              <Col xs={24} sm={12} lg={8} key={module.key}>
                <Card
                  hoverable
                  onClick={() => navigate(module.route)}
                  style={{ height: '100%', cursor: 'pointer', borderLeft: `4px solid #${Math.floor(Math.random()*16777215).toString(16)}` }}
                >
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div style={{ fontSize: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      {module.icon}
                      <Badge count={module.count} style={{ backgroundColor: '#52c41a' }} />
                    </div>
                    <Title level={4} style={{ margin: 0 }}>{module.title}</Title>
                    <Text type="secondary">{module.description}</Text>
                    <div>
                      {module.features.map(feature => (
                        <Tag key={feature} color="blue" style={{ marginRight: 4 }}>
                          {feature}
                        </Tag>
                      ))}
                    </div>
                    <Button 
                      type="primary" 
                      block 
                      icon={<ArrowRightOutlined />}
                      onClick={() => navigate(module.route)}
                    >
                      Gérer
                    </Button>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Quick Actions */}
          <Divider style={{ margin: '32px 0' }}>Actions Rapides</Divider>

          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <Button 
                type="default" 
                block 
                size="large"
                icon={<UserOutlined />}
                onClick={() => navigate('/reference/users')}
              >
                Voir Enseignants
              </Button>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Button 
                type="default" 
                block 
                size="large"
                icon={<BookOutlined />}
                onClick={() => navigate('/reference/matieres')}
              >
                Gérer Matières
              </Button>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Button 
                type="default" 
                block 
                size="large"
                icon={<TeamOutlined />}
                onClick={() => navigate('/reference/classes')}
              >
                Gérer Classes
              </Button>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Button 
                type="default" 
                block 
                size="large"
                icon={<SettingOutlined />}
                onClick={() => navigate('/reference')}
              >
                Configuration
              </Button>
            </Col>
          </Row>
        </Content>
      </Layout>
    </Layout>
  );
};

export default ChefDepartementDashboard;
