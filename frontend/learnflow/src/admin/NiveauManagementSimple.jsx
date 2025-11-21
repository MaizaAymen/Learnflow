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
  Empty,
  Drawer,
  Descriptions,
  Spin
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
  UserOutlined,
  LaptopOutlined,
  EyeOutlined,
  UndoOutlined,
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
  const [searchText, setSearchText] = useState("");
  const [filteredNiveaux, setFilteredNiveaux] = useState([]);
  const [viewingNiveau, setViewingNiveau] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [lastDeletedNiveau, setLastDeletedNiveau] = useState(null);
  const [specialitesDropdownLoading, setSpecialitesDropdownLoading] = useState(false);
  
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

  // Filter niveaux based on search text
  useEffect(() => {
    if (!searchText.trim()) {
      setFilteredNiveaux(niveaux);
    } else {
      const searchLower = searchText.toLowerCase();
      const filtered = niveaux.filter(niveau =>
        niveau.name?.toLowerCase().includes(searchLower) ||
        niveau.specialite_nom?.toLowerCase().includes(searchLower) ||
        niveau.departement_nom?.toLowerCase().includes(searchLower) ||
        niveau.description?.toLowerCase().includes(searchLower)
      );
      setFilteredNiveaux(filtered);
    }
  }, [searchText, niveaux]);

  // Handle create/update
  const handleSubmit = async (values) => {
    // Validate duplicate niveau names within the same specialite
    if (checkDuplicateNiveau(values.name, values.specialiteId, editingNiveau?.id)) {
      message.error("A niveau with this name already exists in this specialite!");
      return;
    }

    try {
      const url = editingNiveau
        ? `http://localhost:3000/api/reference/niveaux/${editingNiveau.id}`
        : "http://localhost:3000/api/reference/niveaux";

      const method = editingNiveau ? "PUT" : "POST";
      const previousNiveaux = niveaux;
      
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
        const successMsg = editingNiveau 
          ? "Niveau updated successfully!"
          : "Niveau created successfully!";
        
        message.success({
          content: (
            <div>
              <span>{successMsg}</span>
              <Button 
                type="link" 
                size="small"
                icon={<UndoOutlined />}
                onClick={() => handleUndoLastAction(previousNiveaux)}
                style={{ marginLeft: 8 }}
              >
                Undo
              </Button>
            </div>
          ),
          duration: 5,
        });

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

  // Handle undo action
  const handleUndoLastAction = (previousNiveaux) => {
    setNiveaux(previousNiveaux);
    message.info("Action undone!");
  };

  // Handle delete
  const handleDelete = async (id) => {
    try {
      const deletedNiveau = niveaux.find(n => n.id === id);
      const previousNiveaux = niveaux;

      const response = await fetch(
        `http://localhost:3000/api/reference/niveaux/${id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setLastDeletedNiveau(deletedNiveau);
        message.success({
          content: (
            <div>
              <span>Niveau deleted successfully!</span>
              <Button 
                type="link" 
                size="small"
                icon={<UndoOutlined />}
                onClick={() => handleUndoDelete(previousNiveaux)}
                style={{ marginLeft: 8 }}
              >
                Undo
              </Button>
            </div>
          ),
          duration: 5,
        });
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

  // Handle undo delete
  const handleUndoDelete = (previousNiveaux) => {
    setNiveaux(previousNiveaux);
    message.info("Deletion undone!");
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

  // Handle quick view
  const handleQuickView = (niveau) => {
    setViewingNiveau(niveau);
    setDrawerVisible(true);
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
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            ghost
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleQuickView(record)}
            title="Quick View"
          />
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
            title="Edit"
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
              title="Delete"
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
            { 
              title: (
                <span 
                  onClick={() => navigate("/reference/departements")} 
                  style={{ cursor: 'pointer' }}
                >
                  Départements
                </span>
              )
            },
            { 
              title: (
                <span 
                  onClick={() => navigate("/reference/specialites")} 
                  style={{ cursor: 'pointer' }}
                >
                  Spécialités
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
                {/* Search and Filter */}
                <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
                  <Col span={24}>
                    <Input
                      placeholder="Rechercher par nom, spécialité, département ou description..."
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      allowClear
                      style={{ height: 40 }}
                    />
                  </Col>
                </Row>

                {/* Display results count */}
                {searchText && (
                  <div style={{ marginBottom: 12, color: '#666' }}>
                    {filteredNiveaux.length} résultat(s) trouvé(s)
                  </div>
                )}

                {filteredNiveaux.length === 0 && niveaux.length > 0 ? (
                  <Empty
                    description="Aucun résultat"
                    style={{ marginTop: 24 }}
                  />
                ) : (
                  <Table
                    dataSource={filteredNiveaux}
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
                )}
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

      {/* Quick View Drawer */}
      <Drawer
        title={viewingNiveau ? `${viewingNiveau.name}` : "Détails du Niveau"}
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={400}
      >
        {viewingNiveau ? (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="ID">{viewingNiveau.id}</Descriptions.Item>
            <Descriptions.Item label="Nom">{viewingNiveau.name}</Descriptions.Item>
            <Descriptions.Item label="Spécialité">
              {viewingNiveau.specialite_nom}
            </Descriptions.Item>
            <Descriptions.Item label="Département">
              {viewingNiveau.departement_nom}
            </Descriptions.Item>
            <Descriptions.Item label="Description">
              {viewingNiveau.description || "N/A"}
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <Spin />
        )}
      </Drawer>
    </Layout>
  );
};

export default NiveauManagement;