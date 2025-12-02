import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Button,
  Table,
  Modal,
  Form,
  Input,
  Select,
  Typography,
  Space,
  message,
  Spin,
  Layout,
  Menu,
  Breadcrumb,
  Tag,
  Descriptions,
  Empty,
  Alert,
  Tabs,
  Badge,
  Statistic,
  Divider
} from "antd";
import {
  BookOutlined,
  TeamOutlined,
  BankOutlined,
  GoldOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  HomeOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ArrowRightOutlined,
  ExclamationCircleOutlined,
  LockOutlined
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;
const { Header, Content, Sider } = Layout;

const ChefReferenceManagement = () => {
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userDepartment, setUserDepartment] = useState(null);
  const [currentTab, setCurrentTab] = useState('overview');
  const navigate = useNavigate();

  // Data states
  const [specialites, setSpecialites] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [classes, setClasses] = useState([]);
  const [department, setDepartment] = useState(null);

  // Modal states
  const [specialiteModalVisible, setSpecialiteModalVisible] = useState(false);
  const [matiereModalVisible, setMatiereModalVisible] = useState(false);
  const [classeModalVisible, setClasseModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Forms
  const [specialiteForm] = Form.useForm();
  const [matiereForm] = Form.useForm();
  const [classeForm] = Form.useForm();

  useEffect(() => {
    // Check user role and department
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    console.log('User from localStorage:', user);
    setUserRole(user.role);
    
    // Don't set department yet - we'll fetch it from the API
    // The backend will find which department this chef manages

    // Redirect if not chef de département
    if (user.role !== 'chef_de_department') {
      message.error('Accès non autorisé');
      navigate('/');
      return;
    }

    // Load data
    const timer = setTimeout(() => {
      loadData(user.id);
    }, 800);

    return () => clearTimeout(timer);
  }, [navigate]);

  const loadData = async (userId) => {
    try {
      setLoading(true);
      console.log('Loading data for chef user:', userId);
      
      // First, find which department this chef manages
      // Query: GET /api/reference/departements?chef_id=userId
      const deptsRes = await fetch(
        `http://localhost:3000/api/reference/departements`
      );
      if (deptsRes.ok) {
        const deptsData = await deptsRes.json();
        console.log('All departments:', deptsData);
        
        // Find department where this user is the chef
        const userDept = Array.isArray(deptsData)
          ? deptsData.find(d => d.chef_departement_id === userId)
          : null;
        
        if (userDept) {
          console.log('Found user department:', userDept);
          setUserDepartment(userDept.id);
          setDepartment(userDept);
          
          // Now fetch the data for this department
          await fetchDepartmentData(userDept.id);
        } else {
          console.warn('No department found for chef user:', userId);
          message.warning('Aucun département n\'a été assigné à votre profil. Veuillez contacter un administrateur.');
          setLoading(false);
        }
      } else {
        console.warn('Failed to fetch departments:', deptsRes.status);
        message.error('Erreur lors du chargement des départements');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error loading departments:', error);
      message.error('Erreur lors du chargement des données');
      setLoading(false);
    }
  };

  const fetchDepartmentData = async (departmentId) => {
    try {
      console.log('Fetching data for department:', departmentId);
      
      // Fetch ALL specialites, then filter by department
      const specRes = await fetch(
        `http://localhost:3000/api/reference/specialites`
      );
      if (specRes.ok) {
        const specData = await specRes.json();
        console.log('All specialites:', specData);
        // Filter specialites by department
        const filteredSpec = Array.isArray(specData) 
          ? specData.filter(s => s.departementId === departmentId)
          : [];
        console.log('Filtered specialites:', filteredSpec);
        setSpecialites(filteredSpec);
      } else {
        console.warn('Failed to fetch specialites:', specRes.status);
      }

      // Fetch ALL matieres, then filter by department via nivea → specialite → department
      const matRes = await fetch(
        `http://localhost:3000/api/reference/matieres`
      );
      if (matRes.ok) {
        const matData = await matRes.json();
        console.log('All matieres:', matData);
        // Filter matieres by department (through niveau → specialite → departement)
        const filteredMat = Array.isArray(matData)
          ? matData.filter(m => 
              m.niveau?.specialite?.departement?.id === departmentId ||
              m.niveau?.specialite?.departementId === departmentId
            )
          : [];
        console.log('Filtered matieres:', filteredMat);
        setMatieres(filteredMat);
      } else {
        console.warn('Failed to fetch matieres:', matRes.status);
      }

      // Fetch ALL classes, then filter by department
      const classRes = await fetch(
        `http://localhost:3000/api/reference/classes`
      );
      if (classRes.ok) {
        const classData = await classRes.json();
        console.log('All classes:', classData);
        // Filter classes by department (through niveau → specialite → departement)
        const filteredClasses = Array.isArray(classData)
          ? classData.filter(c =>
              c.niveau?.specialite?.departement?.id === departmentId ||
              c.niveau?.specialite?.departementId === departmentId
            )
          : [];
        console.log('Filtered classes:', filteredClasses);
        setClasses(filteredClasses);
      } else {
        console.warn('Failed to fetch classes:', classRes.status);
      }

      message.success('Données chargées avec succès');
    } catch (error) {
      console.error('Error fetching department data:', error);
      message.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  // ===================== SPECIALITES =====================
  const handleAddSpecialite = () => {
    setIsEditing(false);
    setSelectedRecord(null);
    specialiteForm.resetFields();
    setSpecialiteModalVisible(true);
  };

  const handleEditSpecialite = (record) => {
    setIsEditing(true);
    setSelectedRecord(record);
    specialiteForm.setFieldsValue({
      nom: record.name,
      code: record.code,
      description: record.description
    });
    setSpecialiteModalVisible(true);
  };

  const handleSpecialiteSubmit = async (values) => {
    try {
      const url = isEditing
        ? `http://localhost:3000/api/reference/specialites/${selectedRecord.id}`
        : `http://localhost:3000/api/reference/specialites`;

      const method = isEditing ? 'PUT' : 'POST';
      const payload = {
        name: values.nom,
        code: values.code,
        description: values.description,
        departementId: userDepartment
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        message.success(isEditing ? 'Spécialité mise à jour' : 'Spécialité créée');
        setSpecialiteModalVisible(false);
        loadData();
      } else {
        const errorData = await res.json();
        message.error(errorData.error || 'Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Error:', error);
      message.error('Erreur lors de la sauvegarde');
    }
  };

  const specialiteColumns = [
    {
      title: 'Nom',
      dataIndex: 'name',
      key: 'name',
      width: 250
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: 300
    },
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
      width: 100
    },
    {
      title: 'Créée',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date) => date ? new Date(date).toLocaleDateString('fr-FR') : '-'
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            ghost
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditSpecialite(record)}
          >
            Éditer
          </Button>
        </Space>
      )
    }
  ];

  // ===================== MATIERES =====================
  const handleAddMatiere = () => {
    setIsEditing(false);
    setSelectedRecord(null);
    matiereForm.resetFields();
    setMatiereModalVisible(true);
  };

  const handleEditMatiere = (record) => {
    setIsEditing(true);
    setSelectedRecord(record);
    matiereForm.setFieldsValue({
      nom: record.name,
      code: record.code,
      description: record.description,
      credit: record.credits,
      niveau_id: record.niveau?.id
    });
    setMatiereModalVisible(true);
  };

  const handleMatiereSubmit = async (values) => {
    try {
      const url = isEditing
        ? `http://localhost:3000/api/reference/matieres/${selectedRecord.id}`
        : `http://localhost:3000/api/reference/matieres`;

      const method = isEditing ? 'PUT' : 'POST';
      const payload = {
        name: values.nom,
        code: values.code,
        description: values.description,
        credits: values.credit,
        niveauId: values.niveau_id
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        message.success(isEditing ? 'Matière mise à jour' : 'Matière créée');
        setMatiereModalVisible(false);
        loadData();
      } else {
        const errorData = await res.json();
        message.error(errorData.error || 'Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Error:', error);
      message.error('Erreur lors de la sauvegarde');
    }
  };

  const matiereColumns = [
    {
      title: 'Nom',
      dataIndex: 'name',
      key: 'name',
      width: 250
    },
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
      width: 100
    },
    {
      title: 'Niveau',
      dataIndex: ['niveau', 'name'],
      key: 'niveau',
      width: 200
    },
    {
      title: 'Crédit',
      dataIndex: 'credits',
      key: 'credits',
      width: 80
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            ghost
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditMatiere(record)}
          >
            Éditer
          </Button>
        </Space>
      )
    }
  ];

  // ===================== CLASSES =====================
  const handleAddClasse = () => {
    setIsEditing(false);
    setSelectedRecord(null);
    classeForm.resetFields();
    setClasseModalVisible(true);
  };

  const handleEditClasse = (record) => {
    setIsEditing(true);
    setSelectedRecord(record);
    classeForm.setFieldsValue(record);
    setClasseModalVisible(true);
  };

  const handleClasseSubmit = async (values) => {
    try {
      const url = isEditing
        ? `http://localhost:3000/api/reference/classes/${selectedRecord.id}`
        : `http://localhost:3000/api/reference/classes`;

      const method = isEditing ? 'PUT' : 'POST';
      const payload = {
        nom: values.nom,
        description: values.description,
        effectif: values.effectif,
        niveau_id: values.niveau_id,
        annee_scolaire: values.annee_scolaire
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        message.success(isEditing ? 'Classe mise à jour' : 'Classe créée');
        setClasseModalVisible(false);
        loadData();
      } else {
        const errorData = await res.json();
        message.error(errorData.error || 'Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Error:', error);
      message.error('Erreur lors de la sauvegarde');
    }
  };

  const classeColumns = [
    {
      title: 'Nom',
      dataIndex: 'nom',
      key: 'nom',
      width: 200
    },
    {
      title: 'Niveau',
      dataIndex: ['niveau', 'name'],
      key: 'niveau',
      width: 150
    },
    {
      title: 'Effectif',
      dataIndex: 'effectif',
      key: 'effectif',
      width: 100,
      render: (effectif) => effectif || 0
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            ghost
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditClasse(record)}
          >
            Éditer
          </Button>
        </Space>
      )
    }
  ];

  const tabItems = [
    {
      key: 'overview',
      label: '📊 Aperçu',
      children: (
        <div>
          {!userDepartment && (
            <Alert
              message="Département non défini"
              description="Votre profil n'a pas de département assigné. Veuillez contacter un administrateur pour configurar votre département."
              type="warning"
              showIcon
              style={{ marginBottom: '24px' }}
            />
          )}

          <Alert
            message="Mode Département"
            description={`Vous consultez les données de votre département (ID: ${userDepartment || 'non défini'}). Seules les données de ${department?.name || department?.nom || 'votre département'} sont visibles.`}
            type="info"
            showIcon
            style={{ marginBottom: '24px' }}
            icon={<LockOutlined />}
          />

          <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title="Spécialités"
                value={specialites.length}
                prefix={<GoldOutlined style={{ color: '#faad14' }} />}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title="Matières"
                value={matieres.length}
                prefix={<BookOutlined style={{ color: '#eb2f96' }} />}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title="Classes"
                value={classes.length}
                prefix={<TeamOutlined style={{ color: '#fa8c16' }} />}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title="Total Étudiants"
                value={classes.reduce((sum, c) => sum + (c.effectif || 0), 0)}
                prefix={<TeamOutlined style={{ color: '#1677ff' }} />}
              />
            </Col>
          </Row>

          {department && (
            <Card title="📋 Informations Département (Lecture Seule)" style={{ marginBottom: '24px' }}>
              <Descriptions column={1} bordered>
                <Descriptions.Item label="Nom">
                  {department.name || department.nom}
                </Descriptions.Item>
                <Descriptions.Item label="Description">
                  {department.description || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Code">
                  {department.code || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Nombre de Classes">
                  {classes.length}
                </Descriptions.Item>
                <Descriptions.Item label="Nombre d'Étudiants">
                  {classes.reduce((sum, c) => sum + (c.effectif || 0), 0)}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          )}
        </div>
      )
    },
    {
      key: 'specialites',
      label: '✨ Spécialités',
      children: (
        <div>
          <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={3}>Gestion des Spécialités</Title>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddSpecialite}
            >
              Ajouter Spécialité
            </Button>
          </div>

          {specialites.length === 0 ? (
            <Empty description="Aucune spécialité trouvée" />
          ) : (
            <Table
              columns={specialiteColumns}
              dataSource={specialites}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          )}
        </div>
      )
    },
    {
      key: 'matieres',
      label: '📚 Matières',
      children: (
        <div>
          <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={3}>Gestion des Matières</Title>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddMatiere}
            >
              Ajouter Matière
            </Button>
          </div>

          {matieres.length === 0 ? (
            <Empty description="Aucune matière trouvée" />
          ) : (
            <Table
              columns={matiereColumns}
              dataSource={matieres}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          )}
        </div>
      )
    },
    {
      key: 'classes',
      label: '👥 Classes',
      children: (
        <div>
          <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={3}>Gestion des Classes</Title>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddClasse}
            >
              Ajouter Classe
            </Button>
          </div>

          {classes.length === 0 ? (
            <Empty description="Aucune classe trouvée" />
          ) : (
            <Table
              columns={classeColumns}
              dataSource={classes}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          )}
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" tip="Chargement des données..." />
      </div>
    );
  }

  if (!userRole || userRole !== 'chef_de_department') {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Alert
          message="Accès non autorisé"
          description="Cette page est réservée aux chefs de département."
          type="error"
          showIcon
        />
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
            {collapsed ? 'CD' : 'Chef Dept'}
          </Title>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Gestion Département
          </Text>
        </div>
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
                { title: 'Référence' },
                { title: 'Département' }
              ]}
            />
          </div>

          <Button type="default" onClick={() => navigate('/department-head')}>
            ← Retour
          </Button>
        </Header>

        <Content style={{ 
          padding: '24px', 
          background: 'var(--bg-primary)',
          overflow: 'auto'
        }}>
          <div className="page-wrapper animate-fadeInUp">
            <div className="app-container">
              <div style={{ marginBottom: '32px', textAlign: 'center' }}>
                <Title level={1} className="form-title">
                  🏢 Gestion des Références Département
                </Title>
                <Text style={{ fontSize: 'var(--font-size-lg)', color: 'var(--text-secondary)' }}>
                  Gérez les spécialités, matières et classes de votre département
                </Text>
              </div>

              <Tabs 
                items={tabItems}
                activeKey={currentTab}
                onChange={setCurrentTab}
              />
            </div>
          </div>
        </Content>
      </Layout>

      {/* SPECIALITE MODAL */}
      <Modal
        title={isEditing ? 'Éditer Spécialité' : 'Ajouter Spécialité'}
        open={specialiteModalVisible}
        onCancel={() => setSpecialiteModalVisible(false)}
        onOk={() => specialiteForm.submit()}
      >
        <Form
          form={specialiteForm}
          layout="vertical"
          onFinish={handleSpecialiteSubmit}
        >
          <Form.Item
            name="nom"
            label="Nom"
            rules={[{ required: true, message: 'Le nom est requis' }]}
          >
            <Input placeholder="Ex: Informatique" />
          </Form.Item>

          <Form.Item
            name="code"
            label="Code"
            rules={[{ required: true, message: 'Le code est requis' }]}
          >
            <Input placeholder="Ex: INFO" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea rows={4} placeholder="Description de la spécialité" />
          </Form.Item>
        </Form>
      </Modal>

      {/* MATIERE MODAL */}
      <Modal
        title={isEditing ? 'Éditer Matière' : 'Ajouter Matière'}
        open={matiereModalVisible}
        onCancel={() => setMatiereModalVisible(false)}
        onOk={() => matiereForm.submit()}
      >
        <Form
          form={matiereForm}
          layout="vertical"
          onFinish={handleMatiereSubmit}
        >
          <Form.Item
            name="nom"
            label="Nom"
            rules={[{ required: true, message: 'Le nom est requis' }]}
          >
            <Input placeholder="Ex: Programmation Python" />
          </Form.Item>

          <Form.Item
            name="code"
            label="Code"
            rules={[{ required: true, message: 'Le code est requis' }]}
          >
            <Input placeholder="Ex: PROG101" />
          </Form.Item>

          <Form.Item
            name="niveau_id"
            label="Niveau"
            rules={[{ required: true, message: 'Sélectionnez un niveau' }]}
          >
            <Select
              placeholder="Choisir un niveau"
              options={[
                { label: '1ère Année', value: 1 },
                { label: '2ème Année', value: 2 },
                { label: '3ème Année', value: 3 }
              ]}
            />
          </Form.Item>

          <Form.Item
            name="credit"
            label="Crédit"
            rules={[{ required: true, message: 'Le crédit est requis' }]}
          >
            <Input type="number" placeholder="Ex: 3" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea rows={4} placeholder="Description de la matière" />
          </Form.Item>
        </Form>
      </Modal>

      {/* CLASSE MODAL */}
      <Modal
        title={isEditing ? 'Éditer Classe' : 'Ajouter Classe'}
        open={classeModalVisible}
        onCancel={() => setClasseModalVisible(false)}
        onOk={() => classeForm.submit()}
        width={700}
      >
        <Form
          form={classeForm}
          layout="vertical"
          onFinish={handleClasseSubmit}
        >
          <Form.Item
            name="nom"
            label="Nom"
            rules={[{ required: true, message: 'Le nom est requis' }]}
          >
            <Input placeholder="Ex: 1ère Année Informatique A" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="niveau_id"
                label="Niveau"
                rules={[{ required: true, message: 'Sélectionnez un niveau' }]}
              >
                <Select
                  placeholder="Choisir un niveau"
                  options={[
                    { label: '1ère Année', value: 1 },
                    { label: '2ème Année', value: 2 },
                    { label: '3ème Année', value: 3 }
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="specialite_id"
                label="Spécialité"
                rules={[{ required: true, message: 'Sélectionnez une spécialité' }]}
              >
                <Select
                  placeholder="Choisir une spécialité"
                  options={specialites.map(s => ({
                    label: s.nom,
                    value: s.id
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="effectif"
            label="Effectif"
          >
            <Input type="number" placeholder="Ex: 30" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea rows={3} placeholder="Description de la classe" />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default ChefReferenceManagement;
