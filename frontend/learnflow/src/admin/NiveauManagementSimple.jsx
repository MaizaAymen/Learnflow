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
  message,
  Space,
  Popconfirm,
  Card,
  Row,
  Col,
  theme
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
  UserOutlined,
  LaptopOutlined,
} from "@ant-design/icons";

const { Content, Sider } = Layout;
const { TextArea } = Input;

const NiveauManagement = () => {
  const [niveaux, setNiveaux] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingNiveau, setEditingNiveau] = useState(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // Fetch all niveaux
  const fetchNiveaux = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3000/api/reference/niveaux");
      const data = await response.json();
      if (response.ok) {
        setNiveaux(data);
      } else {
        message.error(data.message || "Failed to fetch niveaux");
      }
    } catch (error) {
      console.error("Error fetching niveaux:", error);
      message.error("Error fetching niveaux");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNiveaux();
  }, []);

  // Handle create/update
  const handleSubmit = async (values) => {
    try {
      const url = editingNiveau
        ? `http://localhost:3000/api/reference/niveaux/${editingNiveau.id}`
        : "http://localhost:3000/api/reference/niveaux";

      const method = editingNiveau ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nom: values.nom,
          description: values.description,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        message.success(
          editingNiveau 
            ? "Niveau updated successfully!"
            : "Niveau created successfully!"
        );
        setModalVisible(false);
        setEditingNiveau(null);
        form.resetFields();
        fetchNiveaux();
      } else {
        message.error(data.error || "Operation failed");
      }
    } catch (error) {
      console.error("Error:", error);
      message.error("An error occurred");
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/reference/niveaux/${id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        message.success("Niveau deleted successfully!");
        fetchNiveaux();
      } else {
        const data = await response.json();
        message.error(data.message || "Delete failed");
      }
    } catch (error) {
      console.error("Error deleting niveau:", error);
      message.error("Error deleting niveau");
    }
  };

  // Handle edit
  const handleEdit = (niveau) => {
    setEditingNiveau(niveau);
    form.setFieldsValue({
      nom: nom,
      description: description,
    });
    setModalVisible(true);
  };

  // Handle add new
  const handleAddNew = () => {
    setEditingNiveau(null);
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
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
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
            title="Are you sure to delete this niveau?"
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
          defaultSelectedKeys={["niveaux"]}
          defaultOpenKeys={["reference"]}
          style={{ height: "100%", borderRight: 0 }}
          items={items2}
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
            { title: "Niveaux" },
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
                title="Gestion des Niveaux"
                extra={
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAddNew}
                  >
                    Ajouter Niveau
                  </Button>
                }
              >
                <Table
                  dataSource={niveaux}
                  columns={columns}
                  rowKey="id"
                  loading={loading}
                  scroll={{ x: 600 }}
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
        title={editingNiveau ? "Modifier Niveau" : "Ajouter Niveau"}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingNiveau(null);
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
                message: "Please input the niveau name!",
              },
            ]}
          >
            <Input placeholder="Entrez le nom du niveau" />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
          >
            <TextArea
              rows={4}
              placeholder="Entrez la description du niveau"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button
                onClick={() => {
                  setModalVisible(false);
                  setEditingNiveau(null);
                  form.resetFields();
                }}
              >
                Annuler
              </Button>
              <Button type="primary" htmlType="submit">
                {editingNiveau ? "Mettre à jour" : "Créer"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default NiveauManagement;