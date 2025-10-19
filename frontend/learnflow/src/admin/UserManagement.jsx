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
  message,
  Space,
  Popconfirm,
  Card,
  Row,
  Col,
  theme,
  Tag,
  Upload
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
  UserOutlined,
  LaptopOutlined,
  UploadOutlined,
} from "@ant-design/icons";

const { Content, Sider } = Layout;
const { Option } = Select;

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // Fetch all users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:4000/api/auth/getAllUsers", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await response.json();
      if (response.ok) {
        setUsers(Array.isArray(data) ? data : data.users || []);
      } else {
        message.error(data.message || "Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      message.error("Error fetching users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  
  const handleSubmit = async (values) => {
    try {
      const url = editingUser
        ? `http://localhost:4000/api/auth/updateuser/${editingUser.id}`
        : "http://localhost:4000/api/auth/register";
      
      const method = editingUser ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(values),
      });

      const data = await response.json();
      
      if (response.ok) {
        message.success(
          editingUser 
            ? "Utilisateur mis à jour avec succès!"
            : "Utilisateur créé avec succès!"
        );
        setModalVisible(false);
        setEditingUser(null);
        form.resetFields();
        fetchUsers();
      } else {
        message.error(data.error || data.message || "Operation failed");
      }
    } catch (error) {
      console.error("Error:", error);
      message.error("An error occurred");
    }
  };

  
  const handleDelete = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/auth/deleteuser/${id}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      if (response.ok) {
        message.success("Utilisateur supprimé avec succès!");
        fetchUsers();
      } else {
        const data = await response.json();
        message.error(data.message || "Delete failed");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      message.error("Error deleting user");
    }
  };

  
  const handleEdit = (user) => {
    setEditingUser(user);
    form.setFieldsValue({
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      role: user.role,
      // Don't set password for security
    });
    setModalVisible(true);
  };

  // Handle add new
  const handleAddNew = () => {
    setEditingUser(null);
    form.resetFields();
    setModalVisible(true);
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
      title: "Prénom",
      dataIndex: "prenom",
      key: "prenom",
      width: 150,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 200,
    },
    {
      title: "Rôle",
      dataIndex: "role",
      key: "role",
      width: 100,
      render: (role) => {
        let color = role === "admin" ? "geekblue" : role === "enseignant" ? "green" : "orange";
        return <Tag color={color}>{role?.toUpperCase()}</Tag>;
      },
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
            title="Êtes-vous sûr de vouloir supprimer cet utilisateur?"
            onConfirm={() => handleDelete(record.id)}
            okText="Oui"
            cancelText="Non"
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
          defaultSelectedKeys={["users"]}
          defaultOpenKeys={["users"]}
          style={{ height: "100%", borderRight: 0 }}
          items={items2}
        />
      </Sider>

      <Layout style={{ padding: "0 24px 24px" }}>
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col span={24}>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/")}
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
            { title: "Gestion des Utilisateurs" },
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
                title="Gestion des Utilisateurs"
                extra={
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAddNew}
                  >
                    Ajouter Utilisateur
                  </Button>
                }
              >
                <Table
                  dataSource={users}
                  columns={columns}
                  rowKey="id"
                  loading={loading}
                  scroll={{ x: 1000 }}
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
        title={editingUser ? "Modifier Utilisateur" : "Ajouter Utilisateur"}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingUser(null);
          form.resetFields();
        }}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ marginTop: 20 }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Nom"
                name="nom"
                rules={[
                  { required: true, message: "Veuillez entrer le nom!" },
                  { min: 2, message: "Le nom doit contenir au moins 2 caractères!" },
                ]}
              >
                <Input placeholder="Entrez le nom" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Prénom"
                name="prenom"
                rules={[
                  { required: true, message: "Veuillez entrer le prénom!" },
                  { min: 2, message: "Le prénom doit contenir au moins 2 caractères!" },
                ]}
              >
                <Input placeholder="Entrez le prénom" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Veuillez entrer l'email!" },
              { type: "email", message: "Format d'email invalide!" },
            ]}
          >
            <Input placeholder="Entrez l'email" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Mot de passe"
                name="password"
                rules={[
                  { 
                    required: !editingUser, 
                    message: "Veuillez entrer le mot de passe!" 
                  },
                  { 
                    min: 6, 
                    message: "Le mot de passe doit contenir au moins 6 caractères!" 
                  },
                ]}
              >
                <Input.Password 
                  placeholder={editingUser ? "Laisser vide pour ne pas changer" : "Entrez le mot de passe"} 
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Rôle"
                name="role"
                rules={[
                  { required: true, message: "Veuillez sélectionner le rôle!" },
                ]}
              >
                <Select placeholder="Sélectionnez le rôle">
                  <Option value="admin">Admin</Option>
                  <Option value="enseignant">Enseignant</Option>
                  <Option value="etudiant">Étudiant</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button
                onClick={() => {
                  setModalVisible(false);
                  setEditingUser(null);
                  form.resetFields();
                }}
              >
                Annuler
              </Button>
              <Button type="primary" htmlType="submit">
                {editingUser ? "Mettre à jour" : "Créer"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default UserManagement;
