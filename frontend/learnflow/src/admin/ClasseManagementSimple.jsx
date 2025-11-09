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
  Tag
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
const { Option } = Select;

const ClasseManagementSimple = () => {
  const [classes, setClasses] = useState([]);
  const [niveaux, setNiveaux] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingClasse, setEditingClasse] = useState(null);
  const [departements, setDepartements] = useState([]);
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

  // Fetch all classes
const fetchClasses = async () => {
  setLoading(true);
  try {
    const response = await fetch("http://localhost:3000/api/reference/classes");
    const data = await response.json();
    console.log("Fetched classes:", data);  
    if (response.ok) {
      const formatted = data.map(c => ({
        ...c,
        niveau_nom: c.niveau?.name || "—",
        departement_nom: c.departement?.name || "—",
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


  const fetchDepartements= async () => {
    try {
      const response = await fetch("http://localhost:3000/api/reference/departements");
      const data = await response.json();

      if (response.ok) {
        setDepartements(data);
      }
    } catch (error) {
      console.error("Error fetching departements:", error);
    }
  };

  // Fetch niveaux for dropdown
  const fetchNiveaux = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/reference/niveaux");
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
    fetchDepartements();
  }, []);

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
      width: 150,
    },
    {
      title: "Département",
      dataIndex: "departement_nom",
      key: "departement_nom",
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
            <Select placeholder="Sélectionnez le niveau">
              {niveaux.map(niveau => (
                <Option key={niveau.id} value={niveau.id}>
                  {niveau.name}
                </Option>
              ))}
            </Select>

          </Form.Item>
          <Form.Item
            label="département"
            name="departement_id"
            rules={[
              {
                required: true,
                message: "Please select a département!",
              },
            ]}
          >

            <Select placeholder="Sélectionnez le département">
              {departements.map(departement => (
                <Option key={departement.id} value={departement.id}>
                  {departement.name}
                </Option>
              ))}
            </Select>
            

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

export default ClasseManagementSimple;