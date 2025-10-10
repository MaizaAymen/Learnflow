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
  InputNumber,
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
      { key: 'salles', label: 'Salles' },
      { key: 'matieres', label: 'Matières' },
    ],
  },
];

const MatiereManagement = () => {
  const [matieres, setMatieres] = useState([]);
  const [niveaux, setNiveaux] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMatiere, setEditingMatiere] = useState(null);
  const [form] = Form.useForm();
  
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // Fetch all matieres
  const fetchMatieres = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3001/api/reference/matieres");
      const data = await response.json();
      if (response.ok) {
        setMatieres(data);
      } else {
        message.error(data.message || "Failed to fetch matieres");
      }
    } catch (error) {
      console.error("Error fetching matieres:", error);
      message.error("Error fetching matieres");
    } finally {
      setLoading(false);
    }
  };

  // Fetch niveaux for dropdown
  const fetchNiveaux = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/reference/niveaux");
      const data = await response.json();
      if (response.ok) {
        setNiveaux(data);
      }
    } catch (error) {
      console.error("Error fetching niveaux:", error);
    }
  };

  useEffect(() => {
    fetchMatieres();
    fetchNiveaux();
  }, []);

  // Handle create/update
  const handleSubmit = async (values) => {
    try {
      const url = editingMatiere
        ? `http://localhost:3001/api/reference/matieres/${editingMatiere.id}`
        : "http://localhost:3001/api/reference/matieres";
      
      const method = editingMatiere ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: values.name,
          description: values.description,
          code: values.code,
          credits: values.credits,
          niveauId: values.niveauId,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        message.success(
          editingMatiere 
            ? "Matière updated successfully!"
            : "Matière created successfully!"
        );
        setModalVisible(false);
        setEditingMatiere(null);
        form.resetFields();
        fetchMatieres();
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
        `http://localhost:3001/api/reference/matieres/${id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        message.success("Matière deleted successfully!");
        fetchMatieres();
      } else {
        const data = await response.json();
        message.error(data.message || "Delete failed");
      }
    } catch (error) {
      console.error("Error deleting matiere:", error);
      message.error("Error deleting matiere");
    }
  };

  // Handle edit
  const handleEdit = (matiere) => {
    setEditingMatiere(matiere);
    form.setFieldsValue({
      name: matiere.name,
      description: matiere.description,
      code: matiere.code,
      credits: matiere.credits,
      niveauId: matiere.niveauId,
    });
    setModalVisible(true);
  };

  // Handle add new
  const handleAddNew = () => {
    setEditingMatiere(null);
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
      title: "Code",
      dataIndex: "code",
      key: "code",
      width: 120,
    },
    {
      title: "Crédits",
      dataIndex: "credits",
      key: "credits",
      width: 100,
    },
    {
      title: "Niveau",
      dataIndex: "niveauId",
      key: "niveauId",
      width: 150,
      render: (niveauId) => {
        const niveau = niveaux.find(n => n.id === niveauId);
        return niveau ? niveau.name : niveauId;
      }
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
            title="Are you sure to delete this matière?"
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
            defaultSelectedKeys={["matieres"]}
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
              { title: "Matières" },
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
                  title="Gestion des Matières"
                  extra={
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={handleAddNew}
                    >
                      Ajouter Matière
                    </Button>
                  }
                >
                  <Table
                    dataSource={matieres}
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
        title={editingMatiere ? "Modifier Matière" : "Ajouter Matière"}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingMatiere(null);
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
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Nom"
                name="name"
                rules={[
                  { required: true, message: "Please enter the name!" },
                  { min: 2, message: "Name must be at least 2 characters!" },
                ]}
              >
                <Input placeholder="Entrez le nom de la matière" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Code"
                name="code"
                rules={[
                  { required: true, message: "Please enter the code!" },
                  { min: 2, message: "Code must be at least 2 characters!" },
                ]}
              >
                <Input placeholder="Code de la matière (ex: MATH101)" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Crédits"
                name="credits"
                rules={[
                  { required: false },
                  { type: "number", min: 1, message: "Credits must be at least 1!" },
                ]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder="Nombre de crédits"
                  min={1}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Niveau"
                name="niveauId"
                rules={[
                  { required: true, message: "Please select a niveau!" },
                ]}
              >
                <Select placeholder="Sélectionnez un niveau">
                  {niveaux.map(niveau => (
                    <Option key={niveau.id} value={niveau.id}>
                      {niveau.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

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
              placeholder="Entrez la description de la matière"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button
                onClick={() => {
                  setModalVisible(false);
                  setEditingMatiere(null);
                  form.resetFields();
                }}
              >
                Annuler
              </Button>
              <Button type="primary" htmlType="submit">
                {editingMatiere ? "Mettre à jour" : "Créer"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default MatiereManagement;