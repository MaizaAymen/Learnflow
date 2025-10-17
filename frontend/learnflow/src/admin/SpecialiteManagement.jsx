import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
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
  theme,
  Layout,
  Typography,
  Badge,
  Statistic,
  Avatar,
  Tag,
  Tooltip
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
  GoldOutlined,
  TeamOutlined,
  BarChartOutlined,
  EyeOutlined,
  SearchOutlined,
  FilterOutlined
} from "@ant-design/icons";

const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;
const { Header, Content } = Layout;

const SpecialiteManagement = () => {
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
      const response = await fetch("http://localhost:3001/api/reference/specialites");
      const data = await response.json();
      if (response.ok) {
        setSpecialites(data);
      } else {
        message.error(data.message || "Failed to fetch specialites");
      }
    } catch (error) {
      console.error("Error fetching specialites:", error);
      message.error("Error fetching specialites");
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
        ? `http://localhost:3001/api/reference/specialites/${editingSpecialite.id}`
        : "http://localhost:3001/api/reference/specialites";
      
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

      const data = await response.json();
      
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
        `http://localhost:3001/api/reference/specialites/${id}`,
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
      nom: specialite.name,
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
    // Add logout logic here
    console.log("Logging out...");
  };

  const columns = [
    {
      title: (
        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
          <GoldOutlined style={{ marginRight: '8px', color: 'var(--primary-500)' }} />
          ID
        </span>
      ),
      dataIndex: "id",
      key: "id",
      width: 80,
      render: (id) => (
        <Badge count={id} style={{ backgroundColor: 'var(--primary-500)' }} />
      ),
    },
    {
      title: (
        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
          <TeamOutlined style={{ marginRight: '8px', color: 'var(--success-500)' }} />
          Nom de la Spécialité
        </span>
      ),
      dataIndex: "name",
      key: "name",
      render: (name) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar 
            style={{ 
              backgroundColor: 'var(--warning-100)', 
              color: 'var(--warning-600)',
              marginRight: '12px'
            }}
            size="small"
            icon={<GoldOutlined />}
          />
          <Text strong style={{ color: 'var(--text-primary)' }}>{name}</Text>
        </div>
      ),
    },
    {
      title: (
        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
          <BarChartOutlined style={{ marginRight: '8px', color: 'var(--info-500)' }} />
          Description
        </span>
      ),
      dataIndex: "description",
      key: "description",
      ellipsis: {
        showTitle: false,
      },
      render: (description) => (
        <Tooltip title={description}>
          <Text type="secondary" ellipsis style={{ maxWidth: '300px' }}>
            {description || 'Aucune description disponible'}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: (
        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
          Actions
        </span>
      ),
      key: "actions",
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Voir les détails">
            <Button
              type="text"
              icon={<EyeOutlined />}
              size="small"
              className="action-button action-button--info"
              onClick={() => {
                message.info(`Affichage des détails pour: ${record.name}`);
              }}
            />
          </Tooltip>
          <Tooltip title="Modifier">
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              className="action-button action-button--warning"
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Supprimer cette spécialité?"
            description="Cette action est irréversible."
            onConfirm={() => handleDelete(record.id)}
            okText="Supprimer"
            cancelText="Annuler"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Supprimer">
              <Button
                type="text"
                icon={<DeleteOutlined />}
                size="small"
                className="action-button action-button--danger"
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="page-wrapper animate-fadeInUp" style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <div className="app-container" style={{ padding: 'var(--space-6)' }}>
        {/* Header Section */}
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate("/reference")}
                className="btn-ghost"
                style={{ marginRight: 'var(--space-4)' }}
              >
                Retour au Dashboard
              </Button>
              <div>
                <Title level={1} style={{ 
                  margin: 0, 
                  background: 'linear-gradient(135deg, var(--warning-500) 0%, var(--warning-600) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <GoldOutlined style={{ marginRight: 'var(--space-3)', color: 'var(--warning-500)' }} />
                  Gestion des Spécialités
                </Title>
                <Paragraph style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 'var(--font-size-lg)' }}>
                  Organisez et gérez les spécialités académiques de votre établissement
                </Paragraph>
              </div>
            </div>

            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddNew}
              size="large"
              className="btn-primary"
              style={{
                background: 'linear-gradient(135deg, var(--warning-500) 0%, var(--warning-600) 100%)',
                border: 'none',
                boxShadow: 'var(--shadow-md)',
                height: '48px',
                padding: '0 24px'
              }}
            >
              Nouvelle Spécialité
            </Button>
          </div>

          <Breadcrumb
            style={{ 
              padding: 'var(--space-3) var(--space-4)',
              background: 'white',
              borderRadius: 'var(--border-radius-lg)',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-sm)'
            }}
            items={[
              { title: "🏠 Accueil" },
              { 
                title: (
                  <span 
                    onClick={() => navigate("/reference")} 
                    style={{ 
                      cursor: 'pointer', 
                      color: 'var(--primary-500)',
                      fontWeight: 500
                    }}
                  >
                    📊 Données de Référence
                  </span>
                )
              },
              { title: "🎓 Spécialités" },
            ]}
          />
        </div>

        {/* Statistics Cards */}
        <Row gutter={[24, 24]} style={{ marginBottom: 'var(--space-8)' }}>
          <Col xs={24} sm={8}>
            <Card 
              className="data-card hover-lift"
              style={{
                background: 'linear-gradient(135deg, var(--warning-500) 0%, var(--warning-600) 100%)',
                border: 'none',
                color: 'white'
              }}
              bodyStyle={{ padding: 'var(--space-6)' }}
            >
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>Total Spécialités</span>}
                value={specialites.length}
                valueStyle={{ color: 'white', fontSize: '2.5rem', fontWeight: 700 }}
                prefix={<GoldOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card 
              className="data-card hover-lift"
              style={{
                background: 'linear-gradient(135deg, var(--success-500) 0%, var(--success-600) 100%)',
                border: 'none',
                color: 'white'
              }}
              bodyStyle={{ padding: 'var(--space-6)' }}
            >
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>Spécialités Actives</span>}
                value={specialites.filter(s => s.name).length}
                valueStyle={{ color: 'white', fontSize: '2.5rem', fontWeight: 700 }}
                prefix={<TeamOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card 
              className="data-card hover-lift"
              style={{
                background: 'linear-gradient(135deg, var(--info-500) 0%, var(--info-600) 100%)',
                border: 'none',
                color: 'white'
              }}
              bodyStyle={{ padding: 'var(--space-6)' }}
            >
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>Avec Description</span>}
                value={specialites.filter(s => s.description).length}
                valueStyle={{ color: 'white', fontSize: '2.5rem', fontWeight: 700 }}
                prefix={<BarChartOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* Main Table */}
        <Card
          className="data-card"
          style={{
            background: 'white',
            borderRadius: 'var(--border-radius-lg)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-lg)'
          }}
          bodyStyle={{ padding: 0 }}
        >
          <div style={{
            padding: 'var(--space-6) var(--space-6) 0',
            borderBottom: '1px solid var(--border-light)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Title level={3} style={{ margin: 0, color: 'var(--text-primary)' }}>
                  Liste des Spécialités
                </Title>
                <Text type="secondary">
                  Gérez toutes les spécialités de votre établissement
                </Text>
              </div>
              <Space>
                <Button icon={<SearchOutlined />} className="btn-ghost">
                  Rechercher
                </Button>
                <Button icon={<FilterOutlined />} className="btn-ghost">
                  Filtrer
                </Button>
              </Space>
            </div>
          </div>

          <div style={{ padding: 'var(--space-6)' }}>
            <Table
              dataSource={specialites}
              columns={columns}
              rowKey="id"
              loading={loading}
              className="modern-table"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `Affichage de ${range[0]}-${range[1]} sur ${total} spécialités`,
                style: { marginTop: 'var(--space-4)' }
              }}
              rowClassName={(record, index) => 
                index % 2 === 0 ? 'table-row-even' : 'table-row-odd'
              }
            />
          </div>
        </Card>
      </div>

      {/* Modern Modal for Create/Edit */}
      <Modal
        title={
          <div style={{ 
            display: 'flex', 
            alignItems: 'center',
            padding: 'var(--space-4) 0',
            borderBottom: '1px solid var(--border-light)',
            marginBottom: 'var(--space-6)'
          }}>
            <Avatar 
              style={{ 
                backgroundColor: 'var(--warning-100)', 
                color: 'var(--warning-600)',
                marginRight: 'var(--space-3)'
              }}
              icon={<GoldOutlined />}
            />
            <div>
              <Title level={4} style={{ margin: 0, color: 'var(--text-primary)' }}>
                {editingSpecialite ? "Modifier la Spécialité" : "Nouvelle Spécialité"}
              </Title>
              <Text type="secondary" style={{ fontSize: 'var(--font-size-sm)' }}>
                {editingSpecialite ? "Modifiez les informations de la spécialité" : "Créez une nouvelle spécialité académique"}
              </Text>
            </div>
          </div>
        }
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingSpecialite(null);
          form.resetFields();
        }}
        footer={null}
        width={700}
        className="modern-modal"
        style={{
          top: '20vh',
        }}
        bodyStyle={{
          padding: 'var(--space-6)',
          background: 'var(--bg-primary)'
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ marginTop: 'var(--space-4)' }}
        >
          <Row gutter={24}>
            <Col span={24}>
              <Form.Item
                label={
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    <TeamOutlined style={{ marginRight: '8px', color: 'var(--primary-500)' }} />
                    Nom de la Spécialité
                  </span>
                }
                name="nom"
                rules={[
                  { required: true, message: "Le nom de la spécialité est requis!" },
                  { min: 2, message: "Le nom doit contenir au moins 2 caractères!" },
                  { max: 100, message: "Le nom ne peut pas dépasser 100 caractères!" },
                ]}
              >
                <Input 
                  placeholder="Ex: Informatique, Mathématiques, Sciences Physiques..."
                  className="modern-input"
                  style={{
                    height: '48px',
                    borderRadius: 'var(--border-radius-md)',
                    border: '2px solid var(--border-color)',
                    fontSize: 'var(--font-size-md)'
                  }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={24}>
              <Form.Item
                label={
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    <BarChartOutlined style={{ marginRight: '8px', color: 'var(--info-500)' }} />
                    Description
                  </span>
                }
                name="description"
                rules={[
                  { max: 500, message: "La description ne peut pas dépasser 500 caractères!" },
                ]}
              >
                <TextArea
                  rows={4}
                  placeholder="Décrivez la spécialité, ses objectifs, et ses domaines d'application..."
                  className="modern-textarea"
                  style={{
                    borderRadius: 'var(--border-radius-md)',
                    border: '2px solid var(--border-color)',
                    fontSize: 'var(--font-size-md)',
                    resize: 'none'
                  }}
                  showCount
                  maxLength={500}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ marginBottom: 0, marginTop: 'var(--space-6)' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              gap: 'var(--space-3)',
              padding: 'var(--space-4) 0',
              borderTop: '1px solid var(--border-light)'
            }}>
              <Button
                onClick={() => {
                  setModalVisible(false);
                  setEditingSpecialite(null);
                  form.resetFields();
                }}
                className="btn-ghost"
                style={{
                  height: '40px',
                  padding: '0 24px',
                  borderRadius: 'var(--border-radius-md)'
                }}
              >
                Annuler
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                className="btn-primary"
                style={{
                  height: '40px',
                  padding: '0 24px',
                  background: 'linear-gradient(135deg, var(--warning-500) 0%, var(--warning-600) 100%)',
                  border: 'none',
                  borderRadius: 'var(--border-radius-md)',
                  boxShadow: 'var(--shadow-md)'
                }}
              >
                {editingSpecialite ? "💾 Mettre à jour" : "✨ Créer la Spécialité"}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SpecialiteManagement;