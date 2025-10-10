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
  theme
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ArrowLeftOutlined
} from "@ant-design/icons";

const { TextArea } = Input;

const NiveauManagement = () => {
  const [niveaux, setNiveaux] = useState([]);
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

  useEffect(() => {
    fetchNiveaux();
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
      nom: niveau.nom,
      description: niveau.description,
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
      width: 80,
    },
    {
      title: "Nom",
      dataIndex: "nom",
      key: "nom",
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
    <div style={{ padding: "24px" }}>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/reference")}
            style={{ marginBottom: 16 }}
          >
            Retour au Dashboard
          </Button>
          <Breadcrumb
            items={[
              { title: "Home" },
              { title: <span onClick={() => navigate("/reference")} style={{ cursor: 'pointer' }}>Données de Référence</span> },
              { title: "Niveaux" },
            ]}
          />
        </Col>
      </Row>

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
                  `${range[0]}-${range[1]} de ${total} éléments`,
              }}
            />
          </Card>
        </Col>
      </Row>

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
        >
          <Form.Item
            label="Nom"
            name="nom"
            rules={[
              {
                required: true,
                message: "Please input the niveau name!",
              },
            ]}
          >
            <Input placeholder="Enter niveau name" />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
          >
            <TextArea
              rows={4}
              placeholder="Enter niveau description"
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
              >
                {editingNiveau ? "Mettre à jour" : "Créer"}
              </Button>
              <Button
                onClick={() => {
                  setModalVisible(false);
                  setEditingNiveau(null);
                  form.resetFields();
                }}
              >
                Annuler
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default NiveauManagement;