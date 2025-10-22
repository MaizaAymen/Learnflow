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
  ArrowLeftOutlined,
  UserOutlined,
  LaptopOutlined,
} from "@ant-design/icons";

const { Content, Sider } = Layout;
const { TextArea } = Input;

const SalleManagementSimple = () => {
  const [salles, setSalles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSalle, setEditingSalle] = useState(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();
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
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // Fetch all salles
  const fetchSalles = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3000/api/reference/salles");
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
        ? `http://localhost:3000/api/reference/salles/${editingSalle.id}`
        : "http://localhost:3000/api/reference/salles";
      
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
        `http://localhost:3000/api/reference/salles/${id}`,
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
    form.setFieldsValue(salle);
    setModalVisible(true);
  };

  // Handle add new
  const handleAddNew = () => {
    setEditingSalle(null);
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
      title: "Type",
      dataIndex: "type",
      key: "type",
      width: 120,
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
      width: 150,
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
          defaultSelectedKeys={["salles"]}
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
                  scroll={{ x: 700 }}
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
          <Form.Item
            label="Nom"
            name="nom"
            rules={[
              {
                required: true,
                message: "Please input the salle name!",
              },
            ]}
          >
            <Input placeholder="Entrez le nom de la salle" />
          </Form.Item>

          <Form.Item
            label="Type"
            name="type"
            rules={[
              {
                required: true,
                message: "Please input the salle type!",
              },
            ]}
          >
            <Input placeholder="Entrez le type (ex: Laboratoire, Salle de cours, Amphithéâtre)" />
          </Form.Item>

          <Form.Item
            label="Capacité"
            name="capacite"
            rules={[
              {
                required: true,
                message: "Please input the capacity!",
              },
            ]}
          >
            <InputNumber 
              min={1} 
              placeholder="Entrez la capacité" 
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            label="Localisation"
            name="localisation"
          >
            <Input placeholder="Entrez la localisation" />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
          >
            <TextArea 
              rows={4}
              placeholder="Entrez une description (optionnel)" 
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

export default SalleManagementSimple;