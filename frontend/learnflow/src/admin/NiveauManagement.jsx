import React, { useState, useEffect } from "react";
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
  theme
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  LaptopOutlined,
  LogoutOutlined
} from "@ant-design/icons";

const { Header, Content, Sider } = Layout;
const { TextArea } = Input;
const { Option } = Select;

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
    ],
  },
];

const NiveauManagement = () => {
  const [niveaux, setNiveaux] = useState([]);
  const [specialites, setSpecialites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingNiveau, setEditingNiveau] = useState(null);
  const [form] = Form.useForm();
  
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // Fetch all niveaux
  const fetchNiveaux = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3001/api/reference/niveaux");
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

  // Fetch specialites for dropdown
  const fetchSpecialites = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/reference/specialites");
      const data = await response.json();
      if (response.ok) {
        setSpecialites(data);
      }
    } catch (error) {
      console.error("Error fetching specialites:", error);
    }
  };

  useEffect(() => {
    fetchNiveaux();
    fetchSpecialites();
  }, []);

  // Handle create/update
  const handleSubmit = async (values) => {
    try {
      const url = editingNiveau
        ? `http://localhost:3001/api/reference/niveaux/${editingNiveau.id}`
        : "http://localhost:3001/api/reference/niveaux";
      
      const method = editingNiveau ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nom: values.nom,
          description: values.description,
          specialiteId: values.specialiteId,
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
        `http://localhost:3001/api/reference/niveaux/${id}`,
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
      nom: niveau.name,
      description: niveau.description,
      specialiteId: niveau.specialiteId,
    });
    setModalVisible(true);
  };

  // Handle add new
  const handleAddNew = () => {
    setEditingNiveau(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleLogout = () => {
    // Add logout logic here
    console.log("Logging out...");
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "Nom",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Spécialité ID",
      dataIndex: "specialiteId",
      key: "specialiteId",
      width: 120,
      render: (specialiteId) => {
        const specialite = specialites.find(s => s.id === specialiteId);
        return specialite ? specialite.name : specialiteId;
      }
    },
    {
      title: "Actions",
      key: "actions",
      width: 200,
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
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
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

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
          <Breadcrumb
            style={{ margin: "16px 0" }}
            items={[
              { title: "Home" },
              { title: "Reference" },
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
                    pagination={{
                      pageSize: 10,
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: (total, range) =>
                        `${range[0]}-${range[1]} of ${total} items`,
                    }}
                  />
                </Card>
              </Col>
            </Row>
          </Content>
        </Layout>
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
              { required: true, message: "Please enter the name!" },
              { min: 2, message: "Name must be at least 2 characters!" },
            ]}
          >
            <Input placeholder="Entrez le nom du niveau" />
          </Form.Item>

          <Form.Item
            label="Spécialité"
            name="specialiteId"
            rules={[
              { required: true, message: "Please select a specialite!" },
            ]}
          >
            <Select placeholder="Sélectionnez une spécialité">
              {specialites.map(specialite => (
                <Option key={specialite.id} value={specialite.id}>
                  {specialite.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[
              { required: false },
              { max: 500, message: "Description cannot exceed 500 characters!" },
            ]}
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