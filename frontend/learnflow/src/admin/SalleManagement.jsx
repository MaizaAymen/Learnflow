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

const SalleManagement = () => {
  const [salles, setSalles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSalle, setEditingSalle] = useState(null);
  const [form] = Form.useForm();
  
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const salleTypes = ["Amphi", "TP", "TD", "Cours"];

  // Fetch all salles
  const fetchSalles = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3001/api/reference/salles");
      const data = await response.json();
      if (response.ok) {
        setSalles(data);
      } else {
        message.error(data.message || "Failed to fetch salles");
      }
    } catch (error) {
      console.error("Error fetching salles:", error);
      message.error("Error fetching salles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalles();
  }, []);

  // Handle create/update
  const handleSubmit = async (values) => {
    try {
      const url = editingSalle
        ? `http://localhost:3001/api/reference/salles/${editingSalle.id}`
        : "http://localhost:3001/api/reference/salles";
      
      const method = editingSalle ? "PUT" : "POST";
      
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
          editingSalle 
            ? "Salle updated successfully!"
            : "Salle created successfully!"
        );
        setModalVisible(false);
        setEditingSalle(null);
        form.resetFields();
        fetchSalles();
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
        `http://localhost:3001/api/reference/salles/${id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        message.success("Salle deleted successfully!");
        fetchSalles();
      } else {
        const data = await response.json();
        message.error(data.message || "Delete failed");
      }
    } catch (error) {
      console.error("Error deleting salle:", error);
      message.error("Error deleting salle");
    }
  };

  // Handle edit
  const handleEdit = (salle) => {
    setEditingSalle(salle);
    form.setFieldsValue({
      nom: salle.nom,
      type: salle.type,
      capacite: salle.capacite,
      localisation: salle.localisation,
      description: salle.description,
    });
    setModalVisible(true);
  };

  // Handle add new
  const handleAddNew = () => {
    setEditingSalle(null);
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
      width: 60,
    },
    {
      title: "Nom",
      dataIndex: "nom",
      key: "nom",
      width: 150,
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      width: 100,
      render: (type) => (
        <span style={{ 
          color: type === "Amphi" ? "#1890ff" : 
                type === "TP" ? "#52c41a" : 
                type === "TD" ? "#faad14" : "#f5222d"
        }}>
          {type}
        </span>
      )
    },
    {
      title: "Capacité",
      dataIndex: "capacite",
      key: "capacite",
      width: 100,
    },
    {
      title: "Localisation",
      dataIndex: "localisation",
      key: "localisation",
      ellipsis: true,
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
            title="Are you sure to delete this salle?"
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
            defaultSelectedKeys={["salles"]}
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
              { title: "Salles" },
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
                  title="Gestion des Salles"
                  extra={
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={handleAddNew}
                    >
                      Ajouter Salle
                    </Button>
                  }
                >
                  <Table
                    dataSource={salles}
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
      </Layout>

      {/* Modal for Create/Edit */}
      <Modal
        title={editingSalle ? "Modifier Salle" : "Ajouter Salle"}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingSalle(null);
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
                name="nom"
                rules={[
                  { required: true, message: "Please enter the name!" },
                  { min: 2, message: "Name must be at least 2 characters!" },
                ]}
              >
                <Input placeholder="Entrez le nom de la salle" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Type"
                name="type"
                rules={[
                  { required: true, message: "Please select the type!" },
                ]}
              >
                <Select placeholder="Sélectionnez le type de salle">
                  {salleTypes.map(type => (
                    <Option key={type} value={type}>{type}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Capacité"
                name="capacite"
                rules={[
                  { required: true, message: "Please enter the capacity!" },
                  { type: "number", min: 1, message: "Capacity must be at least 1!" },
                ]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder="Capacité de la salle"
                  min={1}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Localisation"
                name="localisation"
                rules={[
                  { required: false },
                ]}
              >
                <Input placeholder="Localisation de la salle" />
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
              placeholder="Entrez la description de la salle"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button
                onClick={() => {
                  setModalVisible(false);
                  setEditingSalle(null);
                  form.resetFields();
                }}
              >
                Annuler
              </Button>
              <Button type="primary" htmlType="submit">
                {editingSalle ? "Mettre à jour" : "Créer"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default SalleManagement;