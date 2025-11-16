import React, { useState, useEffect } from "react";
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
  DatePicker,
  Upload,
  message,
  Space,
  Popconfirm,
  Card,
  Row,
  Col,
  theme,
  Tag,
  Alert,
  Steps,
  Radio,
  Divider,
  Spin,
  Statistic,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  LaptopOutlined,
  LogoutOutlined,
  UploadOutlined,
  DownloadOutlined,
  SaveOutlined,
  TeamOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import moment from "moment";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const { Header, Content, Sider } = Layout;
const { TextArea } = Input;
const { Option } = Select;
const { Step } = Steps;

const items1 = [
  { key: "1", label: "Dashboard" },
  { key: "2", label: "Users" },
  { key: "3", label: "Reports" },
];

const items2 = [
  {
    key: "users",
    icon: React.createElement(UserOutlined),
    label: "User Management",
    children: [
      { key: "show-users", label: "Show Users" },
      { key: "add-user", label: "Add User" },
    ],
  },
  {
    key: "reference",
    icon: React.createElement(LaptopOutlined),
    label: "Reference Data",
    children: [
      { key: "specialites", label: "Spécialités" },
      { key: "departements", label: "Départements" },
      { key: "niveaux", label: "Niveaux" },
      { key: "classes", label: "Classes" },
      { key: "students", label: "Étudiants" },
    ],
  },
];

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [niveaux, setNiveaux] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [importedBatchId, setImportedBatchId] = useState(null);
  const [assignmentAlgorithm, setAssignmentAlgorithm] = useState("balanced");
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [randomSeed, setRandomSeed] = useState(null);
  const [kanbanData, setKanbanData] = useState({});
  const [form] = Form.useForm();
  const [assignForm] = Form.useForm();

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // Fetch all students
  const fetchStudents = async (filters = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams(filters);
      const response = await fetch(`http://localhost:3000/api/students?${params}`);
      const data = await response.json();
      if (response.ok) {
        setStudents(data.students || []);
      } else {
        message.error(data.error || "Failed to fetch students");
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      message.error("Error fetching students");
    } finally {
      setLoading(false);
    }
  };

  // Fetch niveaux
  const fetchNiveaux = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/reference/niveaux");
      const data = await response.json();
      if (response.ok) {
        setNiveaux(data);
      }
    } catch (error) {
      console.error("Error fetching niveaux:", error);
    }
  };

  // Fetch classes
  const fetchClasses = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/reference/classes");
      const data = await response.json();
      if (response.ok) {
        setClasses(data);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchNiveaux();
    fetchClasses();
  }, []);

  // Handle CSV upload
  const handleUpload = async (info) => {
    const { file, fileList } = info;

    if (file.status === "uploading") {
      setLoading(true);
      return;
    }

    if (file.status === "done") {
      const formData = new FormData();
      formData.append("file", file.originFileObj);

      try {
        const response = await fetch("http://localhost:4000/api/auth/upload-csv", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (response.ok) {
          message.success(data.message || `Étudiants importés avec succès!`);
          setImportedBatchId(data.batchId);
          setCurrentStep(1);
          fetchStudents({ is_temporary: true });
        } else {
          message.error(data.error || "Import failed");
        }
      } catch (error) {
        console.error("Error uploading file:", error);
        message.error("Error uploading file");
      } finally {
        setLoading(false);
      }
    }

    if (file.status === "error") {
      message.error(`${file.name} file upload failed.`);
      setLoading(false);
    }
  };

  // Handle auto assignment
  const handleAutoAssign = async (values) => {
    setLoading(true);
    try {
      const payload = {
        algorithm: assignmentAlgorithm,
        classeIds: selectedClasses,
      };

      if (assignmentAlgorithm === "random" && randomSeed) {
        payload.seed = parseInt(randomSeed);
      }

      const response = await fetch("http://localhost:3000/api/students/assign-groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        message.success(`${data.assignedCount} étudiants assignés avec succès!`);
        setCurrentStep(2);
        fetchStudents({ is_temporary: true });
        await loadKanbanData();
      } else {
        message.error(data.error || "Assignment failed");
      }
    } catch (error) {
      console.error("Error assigning students:", error);
      message.error("Error assigning students");
    } finally {
      setLoading(false);
      setAssignModalVisible(false);
    }
  };

  // Load kanban data
  const loadKanbanData = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/students?is_temporary=true");
      const data = await response.json();

      if (response.ok) {
        const students = data.students || [];
        const grouped = {};

        // Group by classe
        students.forEach((student) => {
          const classeKey = student.classe_id || "unassigned";
          if (!grouped[classeKey]) {
            grouped[classeKey] = [];
          }
          grouped[classeKey].push(student);
        });

        setKanbanData(grouped);
      }
    } catch (error) {
      console.error("Error loading kanban data:", error);
    }
  };

  // Handle drag and drop
  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    if (source.droppableId === destination.droppableId) return;

    const studentId = parseInt(draggableId);
    const newClasseId =
      destination.droppableId === "unassigned" ? null : parseInt(destination.droppableId);

    try {
      const response = await fetch(`http://localhost:3000/api/students/${studentId}/group`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ classe_id: newClasseId }),
      });

      if (response.ok) {
        message.success("Étudiant déplacé avec succès!");
        await loadKanbanData();
      } else {
        const data = await response.json();
        message.error(data.error || "Failed to move student");
      }
    } catch (error) {
      console.error("Error moving student:", error);
      message.error("Error moving student");
    }
  };

  // Handle commit
  const handleCommit = async () => {
    Modal.confirm({
      title: "Confirmer l'enregistrement",
      content:
        "Êtes-vous sûr de vouloir enregistrer définitivement tous les étudiants et leurs affectations?",
      okText: "Oui",
      cancelText: "Non",
      onOk: async () => {
        setLoading(true);
        try {
          const response = await fetch("http://localhost:3000/api/students/commit", {
            method: "POST",
          });

          const data = await response.json();

          if (response.ok) {
            message.success(`${data.committedCount} étudiants enregistrés avec succès!`);
            setCurrentStep(0);
            setImportedBatchId(null);
            fetchStudents();
          } else {
            message.error(data.error || "Commit failed");
          }
        } catch (error) {
          console.error("Error committing students:", error);
          message.error("Error committing students");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // Handle export
  const handleExport = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/students/export");

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `etudiants_${moment().format("YYYY-MM-DD")}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        message.success("Export réussi!");
      } else {
        message.error("Export failed");
      }
    } catch (error) {
      console.error("Error exporting:", error);
      message.error("Error exporting");
    }
  };

  // Handle create/update student
  const handleSubmit = async (values) => {
    try {
      const payload = {
        ...values,
        date_naissance: values.date_naissance
          ? values.date_naissance.format("YYYY-MM-DD")
          : null,
      };

      const url = editingStudent
        ? `http://localhost:3000/api/students/${editingStudent.id}`
        : "http://localhost:3000/api/students";

      const method = editingStudent ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        message.success(
          editingStudent
            ? "Étudiant modifié avec succès!"
            : "Étudiant créé avec succès!"
        );
        setModalVisible(false);
        setEditingStudent(null);
        form.resetFields();
        fetchStudents();
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
      const response = await fetch(`http://localhost:3000/api/students/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        message.success("Étudiant supprimé avec succès!");
        fetchStudents();
      } else {
        const data = await response.json();
        message.error(data.error || "Delete failed");
      }
    } catch (error) {
      console.error("Error deleting student:", error);
      message.error("Error deleting student");
    }
  };

  // Handle edit
  const handleEdit = (student) => {
    setEditingStudent(student);
    form.setFieldsValue({
      ...student,
      date_naissance: student.date_naissance ? moment(student.date_naissance) : null,
    });
    setModalVisible(true);
  };

  // Handle add new
  const handleAddNew = () => {
    setEditingStudent(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleLogout = () => {
    console.log("Logging out...");
  };

  const columns = [
    {
      title: "Numéro Étudiant",
      dataIndex: "numero_etudiant",
      key: "numero_etudiant",
      width: 150,
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
      width: 200,
    },
    {
      title: "Statut",
      dataIndex: "statut",
      key: "statut",
      width: 100,
      render: (statut) => {
        const colors = {
          actif: "green",
          inactif: "red",
          diplome: "blue",
          abandonne: "orange",
        };
        return <Tag color={colors[statut]}>{statut}</Tag>;
      },
    },
    {
      title: "Niveau",
      dataIndex: "niveau_id",
      key: "niveau_id",
      width: 120,
      render: (niveau_id, record) =>
        record.niveau ? record.niveau.name : niveau_id || "-",
    },
    {
      title: "Classe",
      dataIndex: "classe_id",
      key: "classe_id",
      width: 120,
      render: (classe_id, record) =>
        record.classe ? record.classe.nom : classe_id || "-",
    },
    {
      title: "Temporaire",
      dataIndex: "is_temporary",
      key: "is_temporary",
      width: 100,
      render: (is_temporary) => (
        <Tag color={is_temporary ? "orange" : "green"}>
          {is_temporary ? "Oui" : "Non"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Êtes-vous sûr de supprimer cet étudiant?"
            onConfirm={() => handleDelete(record.id)}
            okText="Oui"
            cancelText="Non"
          >
            <Button type="primary" danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Get stats
  const tempStudents = students.filter((s) => s.is_temporary);
  const assignedStudents = tempStudents.filter((s) => s.classe_id);
  const unassignedStudents = tempStudents.filter((s) => !s.classe_id);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
        }}
      >
        <div className="demo-logo" style={{ color: "#fff", fontWeight: "bold" }}>
          LearnFlow Admin
        </div>

        <Menu
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={["1"]}
          items={items1}
          style={{ flex: 1, minWidth: 0 }}
        />

        <Button type="primary" icon={<LogoutOutlined />} onClick={handleLogout} danger>
          Logout
        </Button>
      </Header>

      <Layout>
        <Sider width={250} style={{ background: colorBgContainer }}>
          <Menu
            mode="inline"
            defaultSelectedKeys={["students"]}
            defaultOpenKeys={["reference"]}
            style={{ height: "100%", borderRight: 0 }}
            items={items2}
          />
        </Sider>

        <Layout style={{ padding: "0 24px 24px" }}>
          <Breadcrumb
            style={{ margin: "16px 0" }}
            items={[
              { title: "Home" },
              { title: "Reference" },
              { title: "Étudiants" },
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
            {/* Workflow Steps */}
            {importedBatchId && (
              <Card style={{ marginBottom: 16 }}>
                <Steps current={currentStep}>
                  <Step title="Import CSV" icon={<UploadOutlined />} />
                  <Step title="Affectation Automatique" icon={<TeamOutlined />} />
                  <Step title="Ajustements Manuels" icon={<EditOutlined />} />
                  <Step title="Enregistrement" icon={<SaveOutlined />} />
                </Steps>

                {/* Stats */}
                <Row gutter={16} style={{ marginTop: 20 }}>
                  <Col span={8}>
                    <Statistic
                      title="Total Importés"
                      value={tempStudents.length}
                      prefix={<UserOutlined />}
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title="Assignés"
                      value={assignedStudents.length}
                      valueStyle={{ color: "#3f8600" }}
                      prefix={<CheckCircleOutlined />}
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title="Non Assignés"
                      value={unassignedStudents.length}
                      valueStyle={{ color: "#cf1322" }}
                    />
                  </Col>
                </Row>

                {/* Actions */}
                <Divider />
                <Space>
                  {currentStep === 1 && (
                    <Button
                      type="primary"
                      icon={<TeamOutlined />}
                      onClick={() => setAssignModalVisible(true)}
                    >
                      Affecter aux Classes
                    </Button>
                  )}
                  {currentStep === 2 && (
                    <>
                      <Button
                        type="primary"
                        icon={<SaveOutlined />}
                        onClick={handleCommit}
                      >
                        Enregistrer Définitivement
                      </Button>
                      <Button onClick={() => setCurrentStep(1)}>Réaffecter</Button>
                    </>
                  )}
                  <Button
                    danger
                    onClick={async () => {
                      try {
                        await fetch(
                          `http://localhost:3000/api/students/batch/${importedBatchId}`,
                          { method: "DELETE" }
                        );
                        message.success("Importation annulée");
                        setImportedBatchId(null);
                        setCurrentStep(0);
                        fetchStudents();
                      } catch (error) {
                        message.error("Error canceling import");
                      }
                    }}
                  >
                    Annuler l'Importation
                  </Button>
                </Space>
              </Card>
            )}

            {/* Kanban View for Manual Adjustments */}
            {currentStep === 2 && (
              <Card title="Ajustements Manuels - Glisser-Déposer" style={{ marginBottom: 16 }}>
                <Alert
                  message="Glissez et déposez les étudiants entre les classes pour ajuster les affectations"
                  type="info"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
                <DragDropContext onDragEnd={handleDragEnd}>
                  <div style={{ display: "flex", gap: "16px", overflowX: "auto" }}>
                    {/* Unassigned Column */}
                    <div style={{ minWidth: 250, flex: 1 }}>
                      <Card
                        title="Non Assignés"
                        size="small"
                        style={{ backgroundColor: "#f5f5f5" }}
                      >
                        <Droppable droppableId="unassigned">
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              style={{ minHeight: 200 }}
                            >
                              {(kanbanData["unassigned"] || []).map((student, index) => (
                                <Draggable
                                  key={student.id}
                                  draggableId={String(student.id)}
                                  index={index}
                                >
                                  {(provided) => (
                                    <Card
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      size="small"
                                      style={{
                                        marginBottom: 8,
                                        cursor: "move",
                                      }}
                                    >
                                      <div>
                                        <strong>
                                          {student.nom} {student.prenom}
                                        </strong>
                                      </div>
                                      <div style={{ fontSize: 12, color: "#666" }}>
                                        {student.numero_etudiant}
                                      </div>
                                    </Card>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </Card>
                    </div>

                    {/* Class Columns */}
                    {classes
                      .filter((c) => selectedClasses.includes(c.id))
                      .map((classe) => (
                        <div key={classe.id} style={{ minWidth: 250, flex: 1 }}>
                          <Card
                            title={`${classe.nom} (${
                              (kanbanData[classe.id] || []).length
                            })`}
                            size="small"
                            style={{ backgroundColor: "#e6f7ff" }}
                          >
                            <Droppable droppableId={String(classe.id)}>
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.droppableProps}
                                  style={{ minHeight: 200 }}
                                >
                                  {(kanbanData[classe.id] || []).map((student, index) => (
                                    <Draggable
                                      key={student.id}
                                      draggableId={String(student.id)}
                                      index={index}
                                    >
                                      {(provided) => (
                                        <Card
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                          size="small"
                                          style={{
                                            marginBottom: 8,
                                            cursor: "move",
                                          }}
                                        >
                                          <div>
                                            <strong>
                                              {student.nom} {student.prenom}
                                            </strong>
                                          </div>
                                          <div style={{ fontSize: 12, color: "#666" }}>
                                            {student.numero_etudiant}
                                          </div>
                                        </Card>
                                      )}
                                    </Draggable>
                                  ))}
                                  {provided.placeholder}
                                </div>
                              )}
                            </Droppable>
                          </Card>
                        </div>
                      ))}
                  </div>
                </DragDropContext>
              </Card>
            )}

            {/* Main Table */}
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Card
                  title="Gestion des Étudiants"
                  extra={
                    <Space>
                      <Upload
                        accept=".csv"
                        showUploadList={false}
                        customRequest={({ file, onSuccess }) => {
                          setTimeout(() => {
                            onSuccess("ok");
                          }, 0);
                        }}
                        onChange={handleUpload}
                      >
                        <Button type="primary" icon={<UploadOutlined />}>
                          Importer CSV
                        </Button>
                      </Upload>
                      <Button icon={<DownloadOutlined />} onClick={handleExport}>
                        Exporter CSV
                      </Button>
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAddNew}
                      >
                        Ajouter Étudiant
                      </Button>
                    </Space>
                  }
                >
                  <Table
                    dataSource={students}
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
          </Content>
        </Layout>
      </Layout>

      {/* Modal for Assignment */}
      <Modal
        title="Affecter les Étudiants aux Classes"
        open={assignModalVisible}
        onCancel={() => setAssignModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={assignForm}
          layout="vertical"
          onFinish={handleAutoAssign}
          style={{ marginTop: 20 }}
        >
          <Form.Item
            label="Algorithme d'Affectation"
            name="algorithm"
            initialValue="balanced"
          >
            <Radio.Group
              value={assignmentAlgorithm}
              onChange={(e) => setAssignmentAlgorithm(e.target.value)}
            >
              <Space direction="vertical">
                <Radio value="random">
                  <strong>Aléatoire</strong> - Répartition aléatoire
                </Radio>
                <Radio value="balanced">
                  <strong>Équilibrée</strong> - Distribution égale dans chaque classe
                </Radio>
                <Radio value="by_niveau">
                  <strong>Par Niveau</strong> - Grouper les étudiants du même niveau
                </Radio>
              </Space>
            </Radio.Group>
          </Form.Item>

          {assignmentAlgorithm === "random" && (
            <Form.Item
              label="Seed (optionnel pour reproductibilité)"
              name="seed"
              help="Utilisez le même seed pour obtenir le même résultat"
            >
              <Input
                type="number"
                value={randomSeed}
                onChange={(e) => setRandomSeed(e.target.value)}
                placeholder="Ex: 12345"
              />
            </Form.Item>
          )}

          <Form.Item
            label="Sélectionner les Classes Cibles"
            name="classes"
            rules={[
              { required: true, message: "Veuillez sélectionner au moins une classe!" },
            ]}
          >
            <Select
              mode="multiple"
              placeholder="Sélectionnez les classes"
              value={selectedClasses}
              onChange={setSelectedClasses}
            >
              {classes.map((classe) => (
                <Option key={classe.id} value={classe.id}>
                  {classe.nom} ({classe.niveau?.name || "Sans niveau"})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button onClick={() => setAssignModalVisible(false)}>Annuler</Button>
              <Button type="primary" htmlType="submit">
                Affecter
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal for Create/Edit */}
      <Modal
        title={editingStudent ? "Modifier Étudiant" : "Ajouter Étudiant"}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingStudent(null);
          form.resetFields();
        }}
        footer={null}
        width={700}
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
                name="nom"
                rules={[{ required: true, message: "Le nom est requis!" }]}
              >
                <Input placeholder="Nom de famille" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Prénom"
                name="prenom"
                rules={[{ required: true, message: "Le prénom est requis!" }]}
              >
                <Input placeholder="Prénom" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: "L'email est requis!" },
                  { type: "email", message: "Email invalide!" },
                ]}
              >
                <Input placeholder="email@example.com" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Numéro Étudiant"
                name="numero_etudiant"
                rules={[
                  { required: true, message: "Le numéro étudiant est requis!" },
                ]}
              >
                <Input placeholder="Ex: 20230001" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Date de Naissance" name="date_naissance">
                <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Téléphone" name="phone">
                <Input placeholder="+216 XX XXX XXX" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Niveau" name="niveau_id">
                <Select placeholder="Sélectionnez un niveau">
                  {niveaux.map((niveau) => (
                    <Option key={niveau.id} value={niveau.id}>
                      {niveau.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Classe" name="classe_id">
                <Select placeholder="Sélectionnez une classe">
                  {classes.map((classe) => (
                    <Option key={classe.id} value={classe.id}>
                      {classe.nom}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Statut"
                name="statut"
                initialValue="actif"
                rules={[{ required: true, message: "Le statut est requis!" }]}
              >
                <Select>
                  <Option value="actif">Actif</Option>
                  <Option value="inactif">Inactif</Option>
                  <Option value="diplome">Diplômé</Option>
                  <Option value="abandonne">Abandonné</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Photo URL" name="photo_url">
                <Input placeholder="https://example.com/photo.jpg" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Adresse" name="adresse">
            <TextArea rows={2} placeholder="Adresse complète" />
          </Form.Item>

          <Form.Item label="Notes" name="notes">
            <TextArea rows={3} placeholder="Notes supplémentaires" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button
                onClick={() => {
                  setModalVisible(false);
                  setEditingStudent(null);
                  form.resetFields();
                }}
              >
                Annuler
              </Button>
              <Button type="primary" htmlType="submit">
                {editingStudent ? "Mettre à jour" : "Créer"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default StudentManagement;
