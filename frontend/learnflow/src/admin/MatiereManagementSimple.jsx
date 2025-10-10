import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
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
  ArrowLeftOutlined
} from "@ant-design/icons";

const { TextArea } = Input;

const MatiereManagementSimple = () => {
  const [matieres, setMatieres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMatiere, setEditingMatiere] = useState(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  
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

  useEffect(() => {
    fetchMatieres();
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
        body: JSON.stringify(values),
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
    form.setFieldsValue(matiere);
    setModalVisible(true);
  };

  // Handle add new
  const handleAddNew = () => {
    setEditingMatiere(null);
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
      title: "Code",
      dataIndex: "code",
      key: "code",
      width: 100,
    },
    {
      title: "Heures",
      dataIndex: "heures",
      key: "heures",
      width: 100,
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
            title="Are you sure to delete this matiere?"
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
              { title: "Matières" },
            ]}
          />
        </Col>
      </Row>

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
                  `${range[0]}-${range[1]} de ${total} éléments`,
              }}
            />
          </Card>
        </Col>
      </Row>

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
        >
          <Form.Item
            label="Nom"
            name="nom"
            rules={[
              {
                required: true,
                message: "Please input the matiere name!",
              },
            ]}
          >
            <Input placeholder="Enter matiere name" />
          </Form.Item>

          <Form.Item
            label="Code"
            name="code"
            rules={[
              {
                required: true,
                message: "Please input the matiere code!",
              },
            ]}
          >
            <Input placeholder="Enter matiere code" />
          </Form.Item>

          <Form.Item
            label="Heures"
            name="heures"
            rules={[
              {
                required: true,
                message: "Please input the hours!",
              },
            ]}
          >
            <InputNumber 
              min={1} 
              placeholder="Enter hours" 
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
          >
            <TextArea
              rows={4}
              placeholder="Enter matiere description"
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
              >
                {editingMatiere ? "Mettre à jour" : "Créer"}
              </Button>
              <Button
                onClick={() => {
                  setModalVisible(false);
                  setEditingMatiere(null);
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

export default MatiereManagementSimple;