import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Layout,
  Menu,
  Breadcrumb,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  message,
  Space,
  Popconfirm,
  Card,
  Row,
  Col,
  theme,
  Tag,
  Empty,
  Spin
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
  UserOutlined,
  LaptopOutlined,
  TeamOutlined,
} from "@ant-design/icons";
const { Content, Sider } = Layout;
const { TextArea } = Input;
const { Option } = Select;

const ClasseManagementSimple = () => {
  const [classes, setClasses] = useState([]);
  const [niveaux, setNiveaux] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingClasse, setEditingClasse] = useState(null);
  const [studentsModalVisible, setStudentsModalVisible] = useState(false);
  const [selectedClassStudents, setSelectedClassStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [selectedClassName, setSelectedClassName] = useState("");
  const [userRole, setUserRole] = useState(null);
  const [userDepartement, setUserDepartement] = useState(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  
  // Get user role and department from localStorage
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserRole(user.role);
    setUserDepartement(user.departement);
  }, []);
  
  const onClickMenu = (e) => {
    if (e.key === 'specialites') {
      navigate('/reference/specialites');
    } else if (e.key === 'classes') {
      navigate('/reference/classes');
    } else if (e.key === 'departements') {
      navigate('/reference/departements');
    } else if (e.key === 'niveaux') {
      navigate('/reference/niveaux');
    } else if (e.key === 'matieres') {
      navigate('/reference/matieres');
    } else if (e.key === 'salles') {
      navigate('/reference/salles');
    }
  };
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // Fetch all classes
const fetchClasses = async () => {
  setLoading(true);
  try {
    const response = await fetch("http://localhost:3000/api/reference/classes");
    const data = await response.json();
    console.log("Fetched all classes:", data);
    console.log("User Role:", userRole);
    console.log("User Department:", userDepartement);
    
    if (response.ok) {
      let filteredData = data;
      
      // Filter by department if user is chef_de_department
      if (userRole === 'chef_de_department' && userDepartement) {
        console.log("Filtering classes for department:", userDepartement);
        filteredData = data.filter(c => {
          const classDepId = c.niveau?.specialite?.departementId;
          console.log(`Class ${c.id} (${c.name}) - departmentId: ${classDepId}, matches: ${classDepId === userDepartement}`);
          return c.niveau && c.niveau.specialite && classDepId === userDepartement;
        });
        console.log("Filtered classes:", filteredData);
      }
      
      const formatted = filteredData.map(c => ({
        ...c,
        niveau_nom: c.niveau?.name || "—",
        specialite_nom: c.niveau?.specialite?.name || "—",
        departement_nom: c.niveau?.specialite?.departement?.name || "—",
      }));
      setClasses(formatted);
    } else {
      message.error(data.message || "Failed to fetch classes");
    }
  } catch (error) {
    console.error("Error fetching classes:", error);
    message.error("Error fetching classes");
  } finally {
    setLoading(false);
  }
};


  // Fetch niveaux for dropdown with full hierarchy
  const fetchNiveaux = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/reference/niveaux");
      const data = await response.json();
      if (response.ok) {
        let filteredData = data;
        
        // Filter by department if user is chef_de_department
        if (userRole === 'chef_de_department' && userDepartement) {
          filteredData = data.filter(n => n.specialite && n.specialite.departementId === userDepartement);
        }
        setNiveaux(filteredData);
      }
    } catch (error) {
      console.error("Error fetching niveaux:", error);
    }
  };

  useEffect(() => {
    if (userRole) {
      fetchClasses();
      fetchNiveaux();
    }
  }, [userRole, userDepartement]);

  // Handle create/update
  const handleSubmit = async (values) => {
    try {
      const url = editingClasse
        ? `http://localhost:3000/api/reference/classes/${editingClasse.id}`
        : "http://localhost:3000/api/reference/classes";
      
      const method = editingClasse ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();
      
      if (response.ok) {
        message.success(
          editingClasse 
            ? "Classe updated successfully!"
            : "Classe created successfully!"
        );
        setModalVisible(false);
        setEditingClasse(null);
        form.resetFields();
        fetchClasses();
      } else {
        console.error("Error response:", data);
        message.error(data.error || data.message || "Operation failed");
      }
    } catch (error) {
      console.error("Error:", error);
      message.error("An error occurred");
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    try {
      // Chef de département can only delete classes from their department
      if (userRole === 'chef_de_department' && userDepartement) {
        const classe = classes.find(c => c.id === id);
        if (classe) {
          const classDepId = classe.niveau?.specialite?.departementId;
          if (classDepId !== userDepartement) {
            message.error("Vous ne pouvez supprimer que les classes de votre département");
            return;
          }
        }
      }

      const response = await fetch(
        `http://localhost:3000/api/reference/classes/${id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        message.success("Classe deleted successfully!");
        fetchClasses();
      } else {
        const data = await response.json();
        message.error(data.message || "Delete failed");
      }
    } catch (error) {
      console.error("Error deleting classe:", error);
      message.error("Error deleting classe");
    }
  };

  // Handle edit
  const handleEdit = (classe) => {
    // Chef de département can only edit classes from their department
    if (userRole === 'chef_de_department' && userDepartement) {
      const classDepId = classe.niveau?.specialite?.departementId;
      if (classDepId !== userDepartement) {
        message.error("Vous ne pouvez éditer que les classes de votre département");
        return;
      }
    }
    setEditingClasse(classe);
    form.setFieldsValue(classe);
    setModalVisible(true);
  };

  // Handle add new
  const handleAddNew = () => {
    setEditingClasse(null);
    form.resetFields();
    setModalVisible(true);
  };

  // Fetch students by class
  const handleViewStudents = async (classe) => {
    setSelectedClassName(classe.nom);
    setStudentsModalVisible(true);
    setLoadingStudents(true);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_AUTH_URL?.replace('/auth', '') || 'http://localhost:3000'}/api/auth/getallstudents`);
      
      if (response.ok) {
        const data = await response.json();
        const studentsInClass = data.filter(student => student.classe_id === classe.id);
        setSelectedClassStudents(studentsInClass);
      } else {
        message.error("Failed to fetch students");
        setSelectedClassStudents([]);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      message.error("Error fetching students");
      setSelectedClassStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 60,
    },
    {
      title: "Nom",
      dataIndex: "nom",
      key: "nom",
      width: 150,
    },
    {
      title: "Niveau",
      dataIndex: "niveau_nom",
      key: "niveau_nom",
      width: 130,
    },
    {
      title: "Spécialité",
      dataIndex: "specialite_nom",
      key: "specialite_nom",
      width: 130,
    },
    {
      title: "Département",
      dataIndex: "departement_nom",
      key: "departement_nom",
      width: 130,
    },
    {
      title: "Étudiants",
      key: "students",
      width: 120,
      align: "center",
      render: (_, record) => (
        <Button
          type="default"
          icon={<TeamOutlined />}
          size="small"
          onClick={() => handleViewStudents(record)}
        >
          Voir
        </Button>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Are you sure to delete this classe?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              size="small"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];
const items1 = [
  { key: '1', label: 'Dashboard' },
  { key: '2', label: 'Users' },
  { key: '3', label: 'Reports' }
];

  const items2 = [
    {
      key: 'reference',
      icon: React.createElement(LaptopOutlined),
      label: 'Données de Référence',
      children: [
        { key: 'specialites', label: 'Spécialités' },
        { key: 'departements', label: 'Départements' },
        { key: 'niveaux', label: 'Niveaux' },
        { key: 'classes', label: 'Classes' },
        { key: 'salles', label: 'Salles' },
        { key: 'matieres', label: 'Matières' },
      ],
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider width={250} style={{ background: colorBgContainer }}>
        <Menu
          mode="inline"
          defaultSelectedKeys={["classes"]}
          defaultOpenKeys={["reference"]}
          style={{ height: "100%", borderRight: 0 }}
          items={items2}
          onClick={onClickMenu}
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
              Retour au Dashboard
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
            { title: "Classes" },
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
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Card
                title="Gestion des Classes"
                extra={
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAddNew}
                  >
                    Ajouter Classe
                  </Button>
                }
              >
                <Table
                  dataSource={classes}
                  columns={columns}
                  rowKey="id"
                  loading={loading}
                  scroll={{ x: 800 }}
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) =>
                      `${range[0]}-${range[1]} de ${total} éléments`,
                  }}
                />
              </Card>
            </Col>
          </Row>
        </Content>
      </Layout>

      {/* Modal for Create/Edit */}
      <Modal
        title={editingClasse ? "Modifier Classe" : "Ajouter Classe"}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingClasse(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ marginTop: 20 }}
        >
          <Form.Item
            label="Nom"
            name="nom"
            rules={[
              {
                required: true,
                message: "Please input the classe name!",
              },
            ]}
          >
            <Input placeholder="Entrez le nom de la classe" />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[
              {
                required: true,
                message: "Please input the description!",
              },
            ]}
          >
            <TextArea rows={3} placeholder="Entrez la description de la classe" />
          </Form.Item>

          <Form.Item
            label="Effectif"
            name="effectif"
            rules={[
              {
                required: true,
                message: "Please input the effectif!",
              },
            ]}
          >
            <InputNumber 
              style={{ width: "100%" }} 
              min={1} 
              placeholder="Nombre d'étudiants"
            />
          </Form.Item>

          <Form.Item
            label="Niveau"
            name="niveau_id"
            rules={[
              {
                required: true,
                message: "Please select a niveau!",
              },
            ]}
          >
            <Select 
              placeholder="Sélectionnez le niveau"
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {niveaux.map(niveau => (
                <Option key={niveau.id} value={niveau.id}>
                  {niveau.name}
                  {niveau.specialite && niveau.specialite.name && ` (${niveau.specialite.name})`}
                  {niveau.specialite && niveau.specialite.departement && niveau.specialite.departement.name && ` - ${niveau.specialite.departement.name}`}
                </Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item label="Info" style={{ marginBottom: 8 }}>
            <div style={{ 
              padding: '8px 12px', 
              background: '#f0f2f5', 
              borderRadius: '4px',
              fontSize: '12px',
              color: '#595959'
            }}>
              ℹ️ Le département et la spécialité sont déterminés automatiquement par le niveau sélectionné
            </div>
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button
                onClick={() => {
                  setModalVisible(false);
                  setEditingClasse(null);
                  form.resetFields();
                }}
              >
                Annuler
              </Button>
              <Button type="primary" htmlType="submit">
                {editingClasse ? "Mettre à jour" : "Créer"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal for Viewing Students */}
      <Modal
        title={
          <Space>
            <TeamOutlined />
            <span>Étudiants de la classe: {selectedClassName}</span>
          </Space>
        }
        open={studentsModalVisible}
        onCancel={() => {
          setStudentsModalVisible(false);
          setSelectedClassStudents([]);
          setSelectedClassName("");
        }}
        footer={[
          <Button
            key="close"
            type="primary"
            onClick={() => {
              setStudentsModalVisible(false);
              setSelectedClassStudents([]);
              setSelectedClassName("");
            }}
          >
            Fermer
          </Button>
        ]}
        width={800}
      >
        {loadingStudents ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <Spin size="large" />
            <p style={{ marginTop: 16 }}>Chargement des étudiants...</p>
          </div>
        ) : selectedClassStudents.length === 0 ? (
          <Empty
            description="Aucun étudiant assigné à cette classe"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <Table
            dataSource={selectedClassStudents}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showTotal: (total) => `${total} étudiant(s) au total`,
            }}
            columns={[
              {
                title: "ID",
                dataIndex: "id",
                key: "id",
                width: 60,
              },
              {
                title: "Nom",
                dataIndex: "nom",
                key: "nom",
                width: 120,
              },
              {
                title: "Prénom",
                dataIndex: "prenom",
                key: "prenom",
                width: 120,
              },
              {
                title: "Email",
                dataIndex: "email",
                key: "email",
                ellipsis: true,
              },
              {
                title: "Spécialité",
                dataIndex: "specialite",
                key: "specialite",
                width: 150,
                render: (text) => text || "—",
              },
            ]}
          />
        )}
      </Modal>
    </Layout>
  );
};

export default ClasseManagementSimple;