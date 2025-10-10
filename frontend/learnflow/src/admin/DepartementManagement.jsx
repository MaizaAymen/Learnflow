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
  ArrowLeftOutlined
} from "@ant-design/icons";

const { TextArea } = Input;
const { Option } = Select;

const DepartementManagement = () => {
  const [departements, setDepartements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingDepartement, setEditingDepartement] = useState(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // Fetch all departements
  const fetchDepartements = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3001/api/reference/departements");
      const data = await response.json();
      if (response.ok) {
        setDepartements(data);
      } else {
        message.error(data.message || "Failed to fetch departements");
      }
    } catch (error) {
      console.error("Error fetching departements:", error);
      message.error("Error fetching departements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartements();
  }, []);

  // Handle create/update
  const handleSubmit = async (values) => {
    try {
      const url = editingDepartement
        ? `http://localhost:3001/api/reference/departements/${editingDepartement.id}`
        : "http://localhost:3001/api/reference/adddepartements";
      
      const method = editingDepartement ? "PUT" : "POST";
      
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
          editingDepartement 
            ? "Département updated successfully!"
            : "Département created successfully!"
        );
        setModalVisible(false);
        setEditingDepartement(null);
        form.resetFields();
        fetchDepartements();
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
        `http://localhost:3001/api/reference/departements/${id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        message.success("Département deleted successfully!");
        fetchDepartements();
      } else {
        const data = await response.json();
        message.error(data.message || "Delete failed");
      }
    } catch (error) {
      console.error("Error deleting departement:", error);
      message.error("Error deleting departement");
    }
  };

  // Handle edit
  const handleEdit = (departement) => {
    setEditingDepartement(departement);
    form.setFieldsValue({
      name: departement.name,
      description: departement.description,
      code: departement.code,
      chef_departement_id: departement.chef_departement_id,
      budget: departement.budget,
      statut: departement.statut,
      localisation: departement.localisation,
      telephone: departement.telephone,
      email: departement.email,
      capacite_max: departement.capacite_max,
    });
    setModalVisible(true);
  };

  // Handle add new
  const handleAddNew = () => {
    setEditingDepartement(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleLogout = () => {
    // Add logout logic here
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
      dataIndex: "name",
      key: "name",
      width: 150,
    },
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
      width: 80,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 180,
    },
    {
      title: "Téléphone",
      dataIndex: "telephone",
      key: "telephone",
      width: 120,
    },
    {
      title: "Statut",
      dataIndex: "statut",
      key: "statut",
      width: 100,
      render: (statut) => {
        let color = statut === "actif" ? "green" : statut === "inactif" ? "red" : "orange";
        return <Tag color={color}>{statut?.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Budget",
      dataIndex: "budget",
      key: "budget",
      width: 100,
      render: (budget) => `${budget || 0} €`,
    },
    {
      title: "Capacité Max",
      dataIndex: "capacite_max",
      key: "capacite_max",
      width: 100,
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
            title="Are you sure to delete this département?"
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
    <>
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
                { title: "Départements" },
              ]}
            />
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card
              title="Gestion des Départements"
              extra={
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddNew}
                >
                  Ajouter Département
                </Button>
              }
            >
              <Table
                dataSource={departements}
                columns={columns}
                rowKey="id"
                loading={loading}
                scroll={{ x: 1200 }}
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
      </div>

      {/* Modal for Create/Edit */}
      <Modal
        title={editingDepartement ? "Modifier Département" : "Ajouter Département"}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingDepartement(null);
          form.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ marginTop: 20 }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Nom"
                name="name"
                rules={[
                  { required: true, message: "Please enter the name!" },
                  { min: 2, message: "Name must be at least 2 characters!" },
                ]}
              >
                <Input placeholder="Entrez le nom du département" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Code"
                name="code"
                rules={[
                  { required: true, message: "Please enter the code!" },
                  { max: 10, message: "Code cannot exceed 10 characters!" },
                ]}
              >
                <Input placeholder="Entrez le code du département" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Description"
            name="description"
            rules={[
              { required: true, message: "Please enter the description!" },
              { max: 500, message: "Description cannot exceed 500 characters!" },
            ]}
          >
            <TextArea
              rows={3}
              placeholder="Entrez la description du département"
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Chef de Département ID"
                name="chef_departement_id"
                rules={[
                  { required: true, message: "Please enter chef departement ID!" },
                ]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder="ID du chef de département"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Budget"
                name="budget"
                rules={[
                  { required: true, message: "Please enter the budget!" },
                ]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder="Budget du département"
                  formatter={value => `€ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/€\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Statut"
                name="statut"
                rules={[
                  { required: true, message: "Please select the status!" },
                ]}
              >
                <Select placeholder="Sélectionnez le statut">
                  <Option value="actif">Actif</Option>
                  <Option value="inactif">Inactif</Option>
                  <Option value="suspendu">Suspendu</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Capacité Max"
                name="capacite_max"
                rules={[
                  { required: true, message: "Please enter max capacity!" },
                ]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={1}
                  placeholder="Capacité maximale"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Localisation"
            name="localisation"
            rules={[
              { required: true, message: "Please enter the location!" },
            ]}
          >
            <Input placeholder="Entrez la localisation" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Téléphone"
                name="telephone"
                rules={[
                  { required: true, message: "Please enter the phone!" },
                  { pattern: /^[\d\s\-\+\(\)]{8,20}$/, message: "Invalid phone format!" },
                ]}
              >
                <Input placeholder="Numéro de téléphone" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: "Please enter the email!" },
                  { type: "email", message: "Invalid email format!" },
                ]}
              >
                <Input placeholder="Adresse email" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button
                onClick={() => {
                  setModalVisible(false);
                  setEditingDepartement(null);
                  form.resetFields();
                }}
              >
                Annuler
              </Button>
              <Button type="primary" htmlType="submit">
                {editingDepartement ? "Mettre à jour" : "Créer"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default DepartementManagement;