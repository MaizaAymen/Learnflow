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

const SalleManagementSimple = () => {
  const [salles, setSalles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSalle, setEditingSalle] = useState(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

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
      width: 80,
    },
    {
      title: "Nom",
      dataIndex: "nom",
      key: "nom",
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
              { title: "Salles" },
            ]}
          />
        </Col>
      </Row>

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
            <Input placeholder="Enter salle name" />
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
              placeholder="Enter capacity" 
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            label="Localisation"
            name="localisation"
          >
            <Input placeholder="Enter location" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
              >
                {editingSalle ? "Mettre à jour" : "Créer"}
              </Button>
              <Button
                onClick={() => {
                  setModalVisible(false);
                  setEditingSalle(null);
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

export default SalleManagementSimple;