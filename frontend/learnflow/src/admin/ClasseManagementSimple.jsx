import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
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
  ArrowLeftOutlined
} from "@ant-design/icons";

const { TextArea } = Input;
const { Option } = Select;

const ClasseManagementSimple = () => {
  const [classes, setClasses] = useState([]);
  const [niveaux, setNiveaux] = useState([]);
  const [departements, setDepartements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingClasse, setEditingClasse] = useState(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  
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

  // Fetch departements for dropdown
  const fetchDepartements = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/reference/departements");
      const data = await response.json();
      if (response.ok) {
        setDepartements(data);
      }
    } catch (error) {
      console.error("Error fetching departements:", error);
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
      width: 80,
    },
    {
      title: "Nom",
      dataIndex: "nom",
      key: "nom",
    },
    {
      title: "Niveau",
      dataIndex: "niveau_nom",
      key: "niveau_nom",
    },
    {
      title: "Département",
      dataIndex: "departement_nom",
      key: "departement_nom",
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
              { title: "Classes" },
            ]}
          />
        </Col>
      </Row>

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
            <Input placeholder="Enter classe name" />
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
            <Select placeholder="Select niveau">
              {niveaux.map(niveau => (
                <Option key={niveau.id} value={niveau.id}>
                  {niveau.nom}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Département"
            name="departement_id"
            rules={[
              {
                required: true,
                message: "Please select a département!",
              },
            ]}
          >
            <Select placeholder="Select département">
              {departements.map(dept => (
                <Option key={dept.id} value={dept.id}>
                  {dept.nom}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
              >
                {editingClasse ? "Mettre à jour" : "Créer"}
              </Button>
              <Button
                onClick={() => {
                  setModalVisible(false);
                  setEditingClasse(null);
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

export default ClasseManagementSimple;