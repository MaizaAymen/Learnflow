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
  Select,
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

const MatiereManagementSimple = () => {
  const [matieres, setMatieres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMatiere, setEditingMatiere] = useState(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  
  // Course popup states
  const [courseModalVisible, setCourseModalVisible] = useState(false);
  const [selectedMatiere, setSelectedMatiere] = useState(null);
  const [courses, setCourses] = useState([]);
  const [courseForm] = Form.useForm();
  const [editingCourse, setEditingCourse] = useState(null);
  const [users, setUsers] = useState([]);
  
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // Fetch all matieres
  const fetchMatieres = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3000/api/reference/matieres");
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
    fetchUsers();
  }, []);

  // Fetch users (teachers)
  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/auth/getAllUsers');
      if (response.ok) {
        const data = await response.json();
        const teachers = data.filter(user => user.role === 'enseignant');
        setUsers(teachers);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // Fetch courses for a matiere
  const fetchCourses = async (matiereId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/courses/matiere/${matiereId}`);
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      message.error('Error fetching courses');
    }
  };

  // Handle open course popup
  const handleViewCourses = (matiere) => {
    setSelectedMatiere(matiere);
    fetchCourses(matiere.id);
    setCourseModalVisible(true);
  };

  // Handle course submit
  const handleCourseSubmit = async (values) => {
    try {
      const courseData = {
        ...values,
        matiereId: selectedMatiere.id,
      };

      const url = editingCourse
        ? `http://localhost:3000/api/courses/${editingCourse.id}`
        : 'http://localhost:3000/api/courses';
      
      const method = editingCourse ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(courseData),
      });

      if (response.ok) {
        message.success(
          editingCourse 
            ? 'Course updated successfully!'
            : 'Course created successfully!'
        );
        courseForm.resetFields();
        setEditingCourse(null);
        fetchCourses(selectedMatiere.id);
      } else {
        const data = await response.json();
        message.error(data.error || 'Operation failed');
      }
    } catch (error) {
      console.error('Error:', error);
      message.error('An error occurred');
    }
  };

  // Handle delete course
  const handleDeleteCourse = async (courseId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/courses/${courseId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        message.success('Course deleted successfully!');
        fetchCourses(selectedMatiere.id);
      } else {
        message.error('Delete failed');
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      message.error('Error deleting course');
    }
  };

  // Handle create/update
  const handleSubmit = async (values) => {
    try {
      const url = editingMatiere
        ? `http://localhost:3000/api/reference/matieres/${editingMatiere.id}`
        : "http://localhost:3000/api/reference/matieres";
      
      const method = editingMatiere ? "PUT" : "POST";
      console.log("Values sent to backend:", values);

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
        `http://localhost:3000/api/reference/matieres/${id}`,
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
      width: 60,
    },
    {
      title: "Nom",
      dataIndex: "nom",
      key: "nom",
      width: 150,
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
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="default"
            size="small"
            onClick={() => handleViewCourses(record)}
          >
            📚 Courses
          </Button>
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          />
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
          defaultSelectedKeys={["matieres"]}
          defaultOpenKeys={["reference"]}
          style={{ height: "100%", borderRight: 0 }}
          items={items2}
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
            { title: "Matières" },
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

      {/* Modal for Create/Edit Matiere */}
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
          style={{ marginTop: 20 }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Nom"
                name="name"
                rules={[
                  {
                    required: true,
                    message: "Please input the matiere name!",
                  },
                ]}
              >
                <Input placeholder="Entrez le nom de la matière" />
              </Form.Item>
            </Col>
            <Col span={12}>
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
                <Input placeholder="Entrez le code de la matière" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Crédits"
            name="credits"
            rules={[
              {
                required: true,
                message: "Please input the credits!",
              },
            ]}
          >
            <InputNumber
              min={1}
              placeholder="Entrez le nombre de crédits"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
          >
            <TextArea
              rows={4}
              placeholder="Entrez la description de la matière"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button
                onClick={() => {
                  setModalVisible(false);
                  setEditingMatiere(null);
                  form.resetFields();
                }}
              >
                Annuler
              </Button>
              <Button type="primary" htmlType="submit">
                {editingMatiere ? "Mettre à jour" : "Créer"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal for Courses Popup */}
      <Modal
        title={`Courses for ${selectedMatiere?.name || ''}`}
        open={courseModalVisible}
        onCancel={() => {
          setCourseModalVisible(false);
          setSelectedMatiere(null);
          setCourses([]);
          setEditingCourse(null);
          courseForm.resetFields();
        }}
        footer={null}
        width={900}
      >
        <div style={{ marginBottom: 20 }}>
          <Card 
            size="small" 
            style={{ backgroundColor: '#f0f2f5', marginBottom: 16 }}
          >
            <p><strong>Matière:</strong> {selectedMatiere?.name}</p>
            <p><strong>Code:</strong> {selectedMatiere?.code}</p>
            <p><strong>Total Courses:</strong> {courses.length}</p>
          </Card>

          {/* Add/Edit Course Form */}
          <Card 
            title={editingCourse ? "Edit Course" : "Add New Course"} 
            size="small"
            style={{ marginBottom: 16 }}
          >
            <Form
              form={courseForm}
              layout="vertical"
              onFinish={handleCourseSubmit}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Title"
                    name="title"
                    rules={[{ required: true, message: 'Required!' }]}
                  >
                    <Input placeholder="Course title" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Teacher"
                    name="userId"
                    rules={[{ required: true, message: 'Required!' }]}
                  >
                    <Select placeholder="Select Teacher">
                      {users.map(user => (
                        <Select.Option key={user.id} value={user.id}>
                          {user.nom} {user.prenom}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item label="Description" name="description">
                <TextArea rows={2} placeholder="Course description" />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Video URL" name="videoUrl">
                    <Input placeholder="https://..." />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Duration (min)" name="duration">
                    <InputNumber min={0} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                <Space>
                  {editingCourse && (
                    <Button onClick={() => {
                      setEditingCourse(null);
                      courseForm.resetFields();
                    }}>
                      Cancel
                    </Button>
                  )}
                  <Button type="primary" htmlType="submit">
                    {editingCourse ? 'Update' : 'Add'} Course
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>

          {/* Courses List */}
          <Card title="Courses List" size="small">
            {courses.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#999' }}>No courses yet</p>
            ) : (
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {courses.map((course) => (
                  <Card 
                    key={course.id} 
                    size="small" 
                    style={{ marginBottom: 8 }}
                  >
                    <Row justify="space-between" align="middle">
                      <Col span={16}>
                        <h4 style={{ margin: 0 }}>{course.title}</h4>
                        <p style={{ margin: '4px 0', fontSize: '12px', color: '#666' }}>
                          Teacher: {course.enseignant?.nom} {course.enseignant?.prenom}
                        </p>
                        {course.duration && (
                          <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>
                            Duration: {course.duration} min
                          </p>
                        )}
                      </Col>
                      <Col>
                        <Space>
                          <Button
                            size="small"
                            onClick={() => {
                              setEditingCourse(course);
                              courseForm.setFieldsValue({
                                title: course.title,
                                userId: course.userId,
                                description: course.description,
                                videoUrl: course.videoUrl,
                                duration: course.duration,
                              });
                            }}
                          >
                            Edit
                          </Button>
                          <Popconfirm
                            title="Delete this course?"
                            onConfirm={() => handleDeleteCourse(course.id)}
                            okText="Yes"
                            cancelText="No"
                          >
                            <Button size="small" danger>
                              Delete
                            </Button>
                          </Popconfirm>
                        </Space>
                      </Col>
                    </Row>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        </div>
      </Modal>
    </Layout>
  );
};

export default MatiereManagementSimple;