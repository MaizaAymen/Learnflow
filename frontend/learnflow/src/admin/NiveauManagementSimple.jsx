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
const { Option } = Select;

const NiveauManagement = () => {
  const [niveaux, setNiveaux] = useState([]);
  const [specialites, setSpecialites] = useState([]);
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
        const formatted = data.map(n => ({
          ...n,
          specialite_nom: n.specialite?.name || "—",
          departement_nom: n.specialite?.departement?.name || "—"
        }));
        setNiveaux(formatted);
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
      const response = await fetch("http://localhost:3000/api/reference/specialites");
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
        ? `http://localhost:3000/api/reference/niveaux/${editingNiveau.id}`
        : "http://localhost:3000/api/reference/niveaux";

      const method = editingNiveau ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: values.name,
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
      name: niveau.name,
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

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 60,
    },
    {
      title: "Nom",
      dataIndex: "name",
      key: "name",
      width: 150,
    },
    {
      title: "Spécialité",
      dataIndex: "specialite_nom",
      key: "specialite_nom",
      width: 150,
    },
    {
      title: "Département",
      dataIndex: "departement_nom",
      key: "departement_nom",
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
          defaultSelectedKeys={["niveaux"]}
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
            name="name"
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
            label="Spécialité"
            name="specialiteId"
            rules={[
              {
                required: true,
                message: "Please select a spécialité!",
              },
            ]}
          >
            <Select 
              placeholder="Sélectionnez la spécialité"
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {specialites.map(spec => (
                <Option key={spec.id} value={spec.id}>
                  {spec.name}
                  {spec.departement && spec.departement.name && ` (${spec.departement.name})`}
                </Option>
              ))}
            </Select>
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