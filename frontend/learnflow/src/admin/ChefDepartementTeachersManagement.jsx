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
  Spin,
  List,
  Tag,
  Statistic,
  Badge,
  Progress,
  Alert,
  Timeline,
  Divider
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
  BookOutlined,
  TeamOutlined,
  BankOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  AlertOutlined,
} from "@ant-design/icons";

const { Content, Sider } = Layout;
const { TextArea } = Input;
const { Option } = Select;

const ChefDepartementTeachersManagement = () => {
  const [teachers, setTeachers] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [departmentInfo, setDepartmentInfo] = useState(null);
  const [viewingTeacher, setViewingTeacher] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [assignMatieresModalVisible, setAssignMatieresModalVisible] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [teacherMatieres, setTeacherMatieres] = useState([]);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [filteredTeachers, setFilteredTeachers] = useState([]);

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // New state for schedule and workload
  const [teacherSchedule, setTeacherSchedule] = useState([]);
  const [teacherWorkload, setTeacherWorkload] = useState({ total: 0, max: 40, utilisé: 0, remaining: 40 });
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);
  const [workloadModalVisible, setWorkloadModalVisible] = useState(false);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [chefMatieres, setChefMatieres] = useState([]);
  const [chefMatieresModalVisible, setChefMatieresModalVisible] = useState(false);

  // Fetch department info from user (assuming chef de département is logged in)
  const fetchDepartmentInfo = async () => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        // Fetch department details
        const response = await fetch(`http://localhost:3000/api/reference/departements/${user.departement}`);
        const data = await response.json();
        if (response.ok) {
          setDepartmentInfo(data);
        }
      }
    } catch (error) {
      console.error("Error fetching department info:", error);
    }
  };

  // Fetch teachers for the department
  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3000/api/reference/teachers");
      const data = await response.json();
      if (Array.isArray(data)) {
        // Filter teachers by department (if chef de département)
        const userStr = localStorage.getItem('user');
        let filtered = data;
        if (userStr) {
          const user = JSON.parse(userStr);
          if (user.role === 'chef_de_department' || user.is_department_head) {
            filtered = data.filter(t => t.departement === user.departement);
          }
        }
        setTeachers(filtered);
      } else {
        message.error(data.message || "Failed to fetch teachers");
      }
    } catch (error) {
      console.error("Error fetching teachers:", error);
      message.error("Error fetching teachers");
    } finally {
      setLoading(false);
    }
  };

  // Fetch matieres
  const fetchMatieres = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/reference/matieres");
      const data = await response.json();
      if (Array.isArray(data)) {
        // Filter matieres by department (if chef de département)
        const userStr = localStorage.getItem('user');
        let filtered = data;
        if (userStr) {
          const user = JSON.parse(userStr);
          if (user.role === 'chef_de_department' || user.is_department_head) {
            // Filter matieres belonging to this department
            filtered = data.filter(m => m.niveauId && m.niveau && m.niveau.specialite && m.niveau.specialite.departementId === user.departement);
          }
        }
        setMatieres(filtered);
      }
    } catch (error) {
      console.error("Error fetching matieres:", error);
    }
  };

  useEffect(() => {
    fetchDepartmentInfo();
    fetchTeachers();
    fetchMatieres();
  }, []);

  // Filter teachers based on search text
  useEffect(() => {
    if (!searchText.trim()) {
      setFilteredTeachers(teachers);
    } else {
      const searchLower = searchText.toLowerCase();
      const filtered = teachers.filter(teacher =>
        teacher.nom?.toLowerCase().includes(searchLower) ||
        teacher.prenom?.toLowerCase().includes(searchLower) ||
        teacher.email?.toLowerCase().includes(searchLower) ||
        teacher.cin?.toLowerCase().includes(searchLower)
      );
      setFilteredTeachers(filtered);
    }
  }, [searchText, teachers]);

  // Handle view teacher details
  const handleQuickView = (teacher) => {
    setViewingTeacher(teacher);
    setDrawerVisible(true);
  };

  // Handle assign matieres
  const handleAssignMatieres = async (teacher) => {
    setSelectedTeacher(teacher);
    try {
      const response = await fetch(`http://localhost:3000/api/reference/teachers/${teacher.id}/matieres`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setTeacherMatieres(data);
      } else {
        setTeacherMatieres([]);
      }
    } catch (error) {
      console.error("Error fetching teacher matieres:", error);
      setTeacherMatieres([]);
    }
    setAssignMatieresModalVisible(true);
  };

  // Submit assign matieres
  const handleSubmitMatieres = async (values) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/reference/teachers/${selectedTeacher.id}/assign-matieres`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            matieresIds: values.matieresIds || [],
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        message.success("Matières assignées avec succès!");
        setAssignMatieresModalVisible(false);
        form.resetFields();
        fetchTeachers();
      } else {
        message.error(data.error || "Assignment failed");
      }
    } catch (error) {
      console.error("Error:", error);
      message.error("An error occurred");
    }
  };

  // Fetch teacher schedule
  const handleViewSchedule = async (teacher) => {
    setSelectedTeacher(teacher);
    setScheduleLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/api/calendar/schedules/teacher/${teacher.id}`);
      const data = await response.json();
      if (response.ok) {
        setTeacherSchedule(Array.isArray(data) ? data : []);
        // Calculate workload
        calculateWorkload(data);
        setScheduleModalVisible(true);
      } else {
        message.error(data.message || "Failed to fetch schedule");
      }
    } catch (error) {
      console.error("Error fetching schedule:", error);
      message.error("Error fetching teacher schedule");
    } finally {
      setScheduleLoading(false);
    }
  };

  // Calculate teacher workload
  const calculateWorkload = (schedules) => {
    if (!Array.isArray(schedules) || schedules.length === 0) {
      setTeacherWorkload({ total: 0, max: 40, utilisé: 0, remaining: 40 });
      return;
    }

    // Sum up hours from all schedules
    let totalHours = 0;
    schedules.forEach(schedule => {
      // Assuming schedule has a duration or we can calculate from times
      if (schedule.timeSlot && schedule.timeSlot.duration) {
        totalHours += parseInt(schedule.timeSlot.duration) || 0;
      } else if (schedule.duree) {
        totalHours += parseInt(schedule.duree) || 0;
      } else {
        // Default to 1 hour if no duration specified
        totalHours += 1;
      }
    });

    const maxHours = 40; // Standard max workload
    const remaining = Math.max(0, maxHours - totalHours);
    const percentage = Math.min(100, (totalHours / maxHours) * 100);

    setTeacherWorkload({
      total: schedules.length,
      max: maxHours,
      utilisé: totalHours,
      remaining: remaining,
      percentage: percentage
    });
  };

  // Handle chef de département assigning courses to themselves
  const handleAssignChefMatieres = async () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        message.error("Utilisateur non trouvé");
        return;
      }
      const user = JSON.parse(userStr);
      
      // Fetch current chef's matieres
      const response = await fetch(`http://localhost:3000/api/reference/teachers/${user.id}/matieres`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setChefMatieres(data);
      } else {
        setChefMatieres([]);
      }
      setChefMatieresModalVisible(true);
    } catch (error) {
      console.error("Error fetching chef matieres:", error);
      message.error("Erreur lors du chargement des matières");
    }
  };

  // Submit chef matieres assignment
  const handleSubmitChefMatieres = async (values) => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        message.error("Utilisateur non trouvé");
        return;
      }
      const user = JSON.parse(userStr);

      const response = await fetch(
        `http://localhost:3000/api/reference/teachers/${user.id}/assign-matieres`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            matieresIds: values.matieresIds || [],
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        message.success("Vos matières d'enseignement ont été mises à jour avec succès!");
        setChefMatieresModalVisible(false);
        form.resetFields();
        setChefMatieres(data.matieres || []);
      } else {
        message.error(data.error || "L'assignation a échoué");
      }
    } catch (error) {
      console.error("Error:", error);
      message.error("Une erreur s'est produite");
    }
  };

  // Validate if teacher can teach a subject
  const validateTeacherCanTeachSubject = (teacher, subject) => {
    // Check if teacher has the subject already assigned
    const hasSubject = teacherMatieres.some(m => m.id === subject.id);
    if (hasSubject) {
      return { valid: true, message: "Sujet déjà assigné" };
    }

    // Check workload
    if (teacherWorkload.remaining <= 0) {
      return { valid: false, message: "Charge horaire complète - impossible d'assigner plus de matières" };
    }

    // Check if teacher's specialty matches (if available)
    if (teacher.specialite && subject.niveau) {
      // Could add more complex validation here
      return { valid: true, message: "Validation OK" };
    }

    return { valid: true, message: "Validation OK" };
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
      width: 120,
    },
    {
      title: "Prénom",
      dataIndex: "prenom",
      key: "prenom",
      width: 120,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 150,
      ellipsis: true,
    },
    {
      title: "CIN",
      dataIndex: "cin",
      key: "cin",
      width: 100,
    },
    {
      title: "Spécialité",
      dataIndex: "specialite",
      key: "specialite",
      width: 120,
    },
    {
      title: "Actions",
      key: "actions",
      width: 280,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
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
            icon={<BookOutlined />}
            size="small"
            onClick={() => handleAssignMatieres(record)}
            title="Assigner les matières"
          >
            Matières
          </Button>
          <Button
            type="default"
            icon={<ClockCircleOutlined />}
            size="small"
            onClick={() => handleViewSchedule(record)}
            title="Voir emploi du temps"
          >
            Planning
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider width={250} style={{ background: colorBgContainer }}>
        <Menu
          mode="inline"
          defaultSelectedKeys={["teachers"]}
          defaultOpenKeys={["reference"]}
          style={{ height: "100%", borderRight: 0 }}
          items={[
            {
              key: 'reference',
              icon: <LaptopOutlined />,
              label: 'Données de Référence',
              children: [
                { key: 'department', label: 'Mon Département' },
                { key: 'specialites', label: 'Spécialités' },
                { key: 'niveaux', label: 'Niveaux' },
                { key: 'classes', label: 'Classes' },
                { key: 'matieres', label: 'Matières' },
                { key: 'teachers', label: 'Enseignants' },
              ],
            },
          ]}
          onClick={(e) => {
            if (e.key === 'specialites') navigate('/reference/specialites');
            else if (e.key === 'niveaux') navigate('/reference/niveaux');
            else if (e.key === 'classes') navigate('/reference/classes');
            else if (e.key === 'matieres') navigate('/reference/matieres');
            else if (e.key === 'department') navigate('/reference/department-dashboard');
          }}
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
            { title: "Gestion des Enseignants" },
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
            {/* Department Info Cards */}
            {departmentInfo && (
              <Col span={24}>
                <Card
                  title={
                    <span>
                      <BankOutlined style={{ marginRight: 8 }} />
                      {departmentInfo.name}
                    </span>
                  }
                  style={{ marginBottom: 24 }}
                >
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} lg={6}>
                      <Statistic
                        title="Enseignants"
                        value={teachers.length}
                        prefix={<TeamOutlined />}
                      />
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                      <Statistic
                        title="Matières"
                        value={matieres.length}
                        prefix={<BookOutlined />}
                      />
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                      <Statistic
                        title="Code"
                        value={departmentInfo.code || "N/A"}
                      />
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                      <Statistic
                        title="Localisation"
                        value={departmentInfo.localisation || "N/A"}
                      />
                    </Col>
                  </Row>
                  {departmentInfo.description && (
                    <div style={{ marginTop: 16, color: '#666' }}>
                      <strong>Description:</strong> {departmentInfo.description}
                    </div>
                  )}
                </Card>
              </Col>
            )}

            {/* Chef de Département Teaching Section */}
            <Col span={24}>
              <Card
                title={
                  <span>
                    <BookOutlined style={{ marginRight: 8 }} />
                    Vos Matières d'Enseignement
                  </span>
                }
                extra={
                  <Button 
                    type="primary" 
                    icon={<EditOutlined />}
                    onClick={handleAssignChefMatieres}
                  >
                    Gérer mes matières
                  </Button>
                }
                style={{ marginBottom: 24 }}
              >
                {chefMatieres && chefMatieres.length > 0 ? (
                  <div>
                    <p style={{ marginBottom: 16, color: '#666' }}>
                      Vous enseignez actuellement <strong>{chefMatieres.length}</strong> matière(s):
                    </p>
                    <List
                      dataSource={chefMatieres}
                      renderItem={(matiere) => (
                        <List.Item
                          key={matiere.id}
                          style={{
                            padding: '8px 0',
                            borderBottom: '1px solid #f0f0f0'
                          }}
                        >
                          <List.Item.Meta
                            avatar={<BookOutlined style={{ fontSize: 18, color: '#1677ff' }} />}
                            title={
                              <Space>
                                <span>{matiere.name}</span>
                                <Tag color="blue">{matiere.code}</Tag>
                              </Space>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  </div>
                ) : (
                  <Empty
                    description="Vous n'enseignez pas encore de matières"
                    style={{ marginTop: 24 }}
                  />
                )}
              </Card>
            </Col>

            {/* Teachers Management Card */}
            <Col span={24}>
              <Card
                title="Gestion des Enseignants"
              >
                {/* Search and Filter */}
                <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
                  <Col span={24}>
                    <Input
                      placeholder="Rechercher par nom, prénom, email ou CIN..."
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
                    {filteredTeachers.length} résultat(s) trouvé(s)
                  </div>
                )}

                {filteredTeachers.length === 0 && teachers.length > 0 ? (
                  <Empty
                    description="Aucun enseignant trouvé"
                    style={{ marginTop: 24 }}
                  />
                ) : (
                  <Table
                    dataSource={filteredTeachers}
                    columns={columns}
                    rowKey="id"
                    loading={loading}
                    scroll={{ x: 800 }}
                    pagination={{
                      pageSize: 10,
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: (total, range) =>
                        `${range[0]}-${range[1]} de ${total} enseignants`,
                    }}
                  />
                )}
              </Card>
            </Col>
          </Row>
        </Content>
      </Layout>

      {/* Teacher Details Drawer */}
      <Drawer
        title={viewingTeacher ? `${viewingTeacher.nom} ${viewingTeacher.prenom}` : "Détails de l'Enseignant"}
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={400}
      >
        {viewingTeacher ? (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="ID">{viewingTeacher.id}</Descriptions.Item>
            <Descriptions.Item label="Nom">{viewingTeacher.nom}</Descriptions.Item>
            <Descriptions.Item label="Prénom">{viewingTeacher.prenom}</Descriptions.Item>
            <Descriptions.Item label="Email">{viewingTeacher.email}</Descriptions.Item>
            <Descriptions.Item label="CIN">{viewingTeacher.cin}</Descriptions.Item>
            <Descriptions.Item label="Spécialité">{viewingTeacher.specialite || "N/A"}</Descriptions.Item>
            <Descriptions.Item label="Département">{viewingTeacher.departement || "N/A"}</Descriptions.Item>
          </Descriptions>
        ) : (
          <Spin />
        )}
      </Drawer>

      {/* Assign Matieres Modal */}
      <Modal
        title={selectedTeacher ? `Assigner les matières à ${selectedTeacher.nom} ${selectedTeacher.prenom}` : "Assigner les matières"}
        open={assignMatieresModalVisible}
        onCancel={() => {
          setAssignMatieresModalVisible(false);
          setSelectedTeacher(null);
          setTeacherMatieres([]);
          form.resetFields();
        }}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitMatieres}
          style={{ marginTop: 20 }}
        >
          <Form.Item
            label="Sélectionner les matières"
            name="matieresIds"
            rules={[
              {
                required: true,
                message: "Veuillez sélectionner au moins une matière!",
              },
            ]}
          >
            <Select
              mode="multiple"
              placeholder="Sélectionnez les matières à assigner"
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {matieres.map(matiere => {
                const validation = validateTeacherCanTeachSubject(selectedTeacher, matiere);
                return (
                  <Option key={matiere.id} value={matiere.id} disabled={!validation.valid}>
                    {matiere.name} ({matiere.code || 'N/A'})
                    {!validation.valid && ` - ${validation.message}`}
                  </Option>
                );
              })}
            </Select>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button
                onClick={() => {
                  setAssignMatieresModalVisible(false);
                  setSelectedTeacher(null);
                  setTeacherMatieres([]);
                  form.resetFields();
                }}
              >
                Annuler
              </Button>
              <Button type="primary" htmlType="submit">
                Assigner
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Teacher Schedule Modal */}
      <Modal
        title={selectedTeacher ? `Emploi du temps - ${selectedTeacher.nom} ${selectedTeacher.prenom}` : "Emploi du temps"}
        open={scheduleModalVisible}
        onCancel={() => {
          setScheduleModalVisible(false);
          setSelectedTeacher(null);
          setTeacherSchedule([]);
        }}
        footer={[
          <Button key="close" type="primary" onClick={() => {
            setScheduleModalVisible(false);
            setSelectedTeacher(null);
            setTeacherSchedule([]);
          }}>
            Fermer
          </Button>
        ]}
        width={900}
      >
        {scheduleLoading ? (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <Spin size="large" />
          </div>
        ) : (
          <>
            {/* Workload Summary */}
            <Card style={{ marginBottom: 20 }}>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                  <Statistic
                    title="Sessions"
                    value={teacherWorkload.total}
                    prefix={<ClockCircleOutlined />}
                  />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Statistic
                    title="Heures Utilisées"
                    value={teacherWorkload.utilisé}
                    suffix={`/ ${teacherWorkload.max}h`}
                  />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Statistic
                    title="Heures Restantes"
                    value={teacherWorkload.remaining}
                    suffix="h"
                    valueStyle={{ color: teacherWorkload.remaining > 10 ? '#52c41a' : '#ff4d4f' }}
                  />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <div>
                    <div style={{ marginBottom: 8, fontSize: '12px', fontWeight: 'bold', color: '#666' }}>
                      Taux d'Utilisation
                    </div>
                    <Progress
                      type="circle"
                      percent={Math.round(teacherWorkload.percentage || 0)}
                      width={80}
                      strokeColor={{
                        '0%': '#108ee9',
                        '100%': teacherWorkload.percentage > 90 ? '#ff4d4f' : '#52c41a',
                      }}
                    />
                  </div>
                </Col>
              </Row>

              {teacherWorkload.remaining <= 0 && (
                <Alert
                  message="Charge horaire complète"
                  description="Cet enseignant a atteint sa charge horaire maximale. Aucune autre matière ne peut être assignée."
                  type="warning"
                  icon={<AlertOutlined />}
                  showIcon
                  style={{ marginTop: 16 }}
                />
              )}
            </Card>

            {/* Schedules List */}
            {teacherSchedule.length > 0 ? (
              <div>
                <div style={{ marginBottom: 16, color: '#666' }}>
                  {teacherSchedule.length} session(s) programmée(s)
                </div>
                <List
                  dataSource={teacherSchedule}
                  renderItem={(schedule) => (
                    <List.Item
                      key={schedule.id}
                      style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid #f0f0f0',
                        backgroundColor: new Date(schedule.date_debut) < new Date() ? '#f5f5f5' : 'white'
                      }}
                    >
                      <List.Item.Meta
                        avatar={
                          new Date(schedule.date_debut) < new Date() ? 
                          <CheckCircleOutlined style={{ fontSize: 20, color: '#52c41a' }} /> :
                          <ClockCircleOutlined style={{ fontSize: 20, color: '#1677ff' }} />
                        }
                        title={
                          <Space>
                            <span style={{ fontWeight: 'bold' }}>
                              {schedule.matiere?.name || 'Matière N/A'}
                            </span>
                            <Tag color="blue">{schedule.matiere?.code || 'N/A'}</Tag>
                            {schedule.classe && (
                              <Tag color="cyan">{schedule.classe?.nom || 'Classe N/A'}</Tag>
                            )}
                          </Space>
                        }
                        description={
                          <div>
                            <div>
                              <strong>Date:</strong> {new Date(schedule.date_debut).toLocaleDateString('fr-FR', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </div>
                            <div>
                              <strong>Horaire:</strong> {schedule.date_debut ? new Date(schedule.date_debut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : 'N/A'} - {schedule.date_fin ? new Date(schedule.date_fin).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                            </div>
                            {schedule.salle && (
                              <div>
                                <strong>Salle:</strong> {schedule.salle?.nom || 'N/A'} ({schedule.salle?.localisation || 'N/A'})
                              </div>
                            )}
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              </div>
            ) : (
              <Empty
                description="Aucune session programmée"
                style={{ marginTop: 24 }}
              />
            )}
          </>
        )}
      </Modal>

      {/* Chef de Département - Assign Own Matieres Modal */}
      <Modal
        title="Gérer vos matières d'enseignement"
        open={chefMatieresModalVisible}
        onCancel={() => {
          setChefMatieresModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={700}
      >
        <Alert
          message="Assignation de matières"
          description="Sélectionnez les matières que vous enseignez. Vous pouvez modifier votre sélection à tout moment."
          type="info"
          icon={<BookOutlined />}
          showIcon
          style={{ marginBottom: 20 }}
        />
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitChefMatieres}
          style={{ marginTop: 20 }}
        >
          <Form.Item
            label="Sélectionnez vos matières d'enseignement"
            name="matieresIds"
            rules={[
              {
                required: false,
                message: "Veuillez sélectionner au moins une matière!",
              },
            ]}
          >
            <Select
              mode="multiple"
              placeholder="Sélectionnez les matières que vous enseignez"
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {matieres.map(matiere => (
                <Option key={matiere.id} value={matiere.id}>
                  {matiere.name} ({matiere.code || 'N/A'})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button
                onClick={() => {
                  setChefMatieresModalVisible(false);
                  form.resetFields();
                }}
              >
                Annuler
              </Button>
              <Button type="primary" htmlType="submit">
                Enregistrer
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default ChefDepartementTeachersManagement;
