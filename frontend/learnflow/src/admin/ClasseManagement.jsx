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
    ],
  },
];

const ClasseManagement = () => {
  const [classes, setClasses] = useState([]);
  const [niveaux, setNiveaux] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingClasse, setEditingClasse] = useState(null);
  const [form] = Form.useForm();
  
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // Fetch all classes
  const fetchClasses = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3001/api/reference/classes");
      const data = await response.json();
      if (response.ok) {
        setClasses(data);
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
    fetchClasses();
    fetchNiveaux();
  }, []);

  // Handle create/update
  const handleSubmit = async (values) => {
    try {
      const url = editingClasse
        ? `http://localhost:3001/api/reference/classes/${editingClasse.id}`
        : "http://localhost:3001/api/reference/classes";
      
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
        `http://localhost:3001/api/reference/classes/${id}`,
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
    setEditingClasse(classe);
    form.setFieldsValue({
      nom: classe.nom,
      description: classe.description,
      effectif: classe.effectif,
      niveau_id: classe.niveau_id,
    });
    setModalVisible(true);
  };

  // Handle add new
  const handleAddNew = () => {
    setEditingClasse(null);
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
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Effectif",
      dataIndex: "effectif",
      key: "effectif",
      width: 100,
    },
    {
      title: "Niveau",
      dataIndex: "niveau_id",
      key: "niveau_id",
      width: 150,
      render: (niveau_id) => {
        const niveau = niveaux.find(n => n.id === niveau_id);
        return niveau ? niveau.name : niveau_id;
      }
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
            defaultSelectedKeys={["classes"]}
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
                    scroll={{ x: 900 }}
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
              { required: true, message: "Please enter the name!" },
              { min: 2, message: "Name must be at least 2 characters!" },
            ]}
          >
            <Input placeholder="Entrez le nom de la classe (ex: G1, 2ème Info A)" />
          </Form.Item>

          <Form.Item
            label="Niveau"
            name="niveau_id"
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

          <Form.Item
            label="Effectif"
            name="effectif"
            rules={[
              { required: true, message: "Please enter the effectif!" },
              { type: "number", min: 1, message: "Effectif must be at least 1!" },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder="Nombre d'étudiants"
              min={1}
            />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[
              { required: true, message: "Please enter the description!" },
              { max: 500, message: "Description cannot exceed 500 characters!" },
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Entrez la description de la classe"
            />
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
    </Layout>
  );
};

export default ClasseManagement;