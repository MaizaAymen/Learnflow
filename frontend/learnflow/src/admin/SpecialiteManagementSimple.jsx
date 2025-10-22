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

const onClickMenu = (e) => {
    if (e.key === 'specialites') {
      navigate('/reference/specialites');
    } else if (e.key === 'classes') {
      navigate('/CreationClasse');
    } else if (e.key === 'departements') {
      navigate('/reference/departements');
    } else if (e.key === 'niveaux') {
      navigate('/reference/niveaux');
    } else if (e.key === 'matieres') {
      navigate('/reference/matieres');
    }

    // Add other navigation cases as needed
  };
const { Content, Sider } = Layout;
const { TextArea } = Input;

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

const SpecialiteManagementSimple = () => {
  const [specialites, setSpecialites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSpecialite, setEditingSpecialite] = useState(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // Fetch all specialites
  const fetchSpecialites = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3000/api/reference/specialites");
      if (response.ok) {
        const data = await response.json();
        setSpecialites(data);
      } else {
        message.error("Failed to fetch specialites");
      }
    } catch (error) {
      console.error("Error fetching specialites:", error);
      message.error("Error fetching specialites - make sure your backend is running");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpecialites();
  }, []);

  // Handle create/update
  const handleSubmit = async (values) => {
    try {
      const url = editingSpecialite
        ? `http://localhost:3000/api/reference/specialites/${editingSpecialite.id}`
        : "http://localhost:3000/api/reference/specialites";

      const method = editingSpecialite ? "PUT" : "POST";
      
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

      if (response.ok) {
        message.success(
          editingSpecialite 
            ? "Spécialité updated successfully!"
            : "Spécialité created successfully!"
        );
        setModalVisible(false);
        setEditingSpecialite(null);
        form.resetFields();
        fetchSpecialites();
      } else {
        const data = await response.json();
        message.error(data.error || "Operation failed");
      }
    } catch (error) {
      console.error("Error:", error);
      message.error("An error occurred - make sure your backend is running");
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/reference/specialites/${id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        message.success("Spécialité deleted successfully!");
        fetchSpecialites();
      } else {
        const data = await response.json();
        message.error(data.message || "Delete failed");
      }
    } catch (error) {
      console.error("Error deleting specialite:", error);
      message.error("Error deleting specialite");
    }
  };

  // Handle edit
  const handleEdit = (specialite) => {
    setEditingSpecialite(specialite);
    form.setFieldsValue({
      nom: specialite.nom,
      description: specialite.description,
    });
    setModalVisible(true);
  };

  // Handle add new
  const handleAddNew = () => {
    setEditingSpecialite(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleLogout = () => {
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
            title="Are you sure to delete this specialite?"
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
      <Sider width={250} style={{ background: colorBgContainer }}>
        <Menu
          mode="inline"
          defaultSelectedKeys={["specialites"]}
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
            { title: "Spécialités" },
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
                title="Gestion des Spécialités"
                extra={
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAddNew}
                  >
                    Ajouter Spécialité
                  </Button>
                }
              >
                <Table
                  dataSource={specialites}
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
        title={editingSpecialite ? "Modifier Spécialité" : "Ajouter Spécialité"}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingSpecialite(null);
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
            <Input placeholder="Entrez le nom de la spécialité" />
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
              placeholder="Entrez la description de la spécialité"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button
                onClick={() => {
                  setModalVisible(false);
                  setEditingSpecialite(null);
                  form.resetFields();
                }}
              >
                Annuler
              </Button>
              <Button type="primary" htmlType="submit">
                {editingSpecialite ? "Mettre à jour" : "Créer"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default SpecialiteManagementSimple;