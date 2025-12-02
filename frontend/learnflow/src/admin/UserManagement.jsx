import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
  Tag,
  Upload,
  DatePicker,
  Alert,
  Steps,
  Radio,
  Divider,
  Statistic,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
  UserOutlined,
  LaptopOutlined,
  UploadOutlined,
  DownloadOutlined,
  SaveOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  DragOutlined,
  BookOutlined,
} from "@ant-design/icons";
import moment from "moment";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import TeacherMatiereAssignment from "../components/TeacherMatiereAssignment.jsx";

const { Content, Sider } = Layout;
const { Option } = Select;
const { Step } = Steps;
const { TextArea } = Input;

const UserManagement = () => {
  const [searchParams] = useSearchParams();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState(searchParams.get('tab') || 'show-users');
  const [form] = Form.useForm();
  const navigate = useNavigate();

  // Advanced student management states
  const [students, setStudents] = useState([]);
  const [niveaux, setNiveaux] = useState([]);
  const [classes, setClasses] = useState([]);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [importedBatchId, setImportedBatchId] = useState(null);
  const [assignmentAlgorithm, setAssignmentAlgorithm] = useState("balanced");
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [randomSeed, setRandomSeed] = useState(null);
  const [kanbanData, setKanbanData] = useState({});
  const [assignForm] = Form.useForm();
  
  // Teacher matière assignment state
  const [matiereAssignmentModalVisible, setMatiereAssignmentModalVisible] = useState(false);
  const [selectedTeacherForMatieres, setSelectedTeacherForMatieres] = useState(null);
  
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // Fetch all users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:4000/api/auth/getAllUsers", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await response.json();
      if (response.ok) {
        const usersData = Array.isArray(data) ? data : data.users || [];
        setUsers(usersData);
        applyFilter(usersData, selectedFilter);
      } else {
        message.error(data.message || "Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      message.error("Error fetching users");
    } finally {
      setLoading(false);
    }
  };

  // Apply filter based on selected menu item
  const applyFilter = (usersData, filterKey) => {
    let filtered = [];
    
    switch (filterKey) {
      case 'show-teachers':
        filtered = usersData.filter(user => user.role === 'enseignant');
        break;
      case 'show-admins':
        filtered = usersData.filter(user => user.role === 'admin');
        break;
      case 'show-department-heads':
        // Show users who are marked as department heads OR have chef_de_department role
        filtered = usersData.filter(user => 
          user.role === 'chef_de_department' || user.is_department_head === true
        );
        break;
      case 'show-users':
      default:
        filtered = usersData.filter(user => user.role === 'etudiant');
        break;
    }
    
    setFilteredUsers(filtered);
  };

  // Fetch students for advanced management
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

  // Handle CSV upload
  const handleUpload = async (file) => {
    setLoading(true);
    
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:4000/api/auth/upload-csv", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        // Backend returns: { message, added, skipped }
        message.success(data.message || `Étudiants importés avec succès! ${data.added} ajoutés, ${data.skipped} ignorés`);
        setImportedBatchId(data.batchId);
        setCurrentStep(1);
        fetchUsers(); // Refresh the user list
        fetchStudents({ is_temporary: true });
      } else {
        message.error(data.error || "Import failed");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      message.error("Erreur lors de l'importation du fichier");
    } finally {
      setLoading(false);
    }
    
    // Return false to prevent auto upload by antd
    return false;
  };

  // Handle auto assignment
  const handleAutoAssign = async (values) => {
    setLoading(true);
    try {
      // Validate selection
      if (!selectedClasses || selectedClasses.length === 0) {
        message.warning("Veuillez sélectionner au moins une classe");
        setLoading(false);
        return;
      }

      const payload = {
        algorithm: assignmentAlgorithm,
        classeIds: selectedClasses,
      };

      if (assignmentAlgorithm === "random" && randomSeed) {
        payload.seed = parseInt(randomSeed);
      }

      console.log('Sending assignment payload:', payload);

      const response = await fetch("http://localhost:3000/api/students/assign-groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        message.success(`${data.assignedCount || 0} étudiants assignés avec succès!`);
        setCurrentStep(2);
        fetchStudents({ is_temporary: true });
        await loadKanbanData();
        setAssignModalVisible(false);
      } else {
        message.error(data.error || "Assignment failed");
      }
    } catch (error) {
      console.error("Error assigning students:", error);
      message.error("Erreur lors de l'affectation des étudiants: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Load kanban data
  const loadKanbanData = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/students?is_temporary=true");
      const data = await response.json();

      if (response.ok) {
        const studentsData = data.students || [];
        const grouped = { unassigned: [] };
        
        // Initialize all class columns
        classes.forEach((classe) => {
          grouped[classe.id] = [];
        });
        
        // Group students by class
        studentsData.forEach((student) => {
          const classeKey = student.classe_id || "unassigned";
          if (!grouped[classeKey]) {
            grouped[classeKey] = [];
          }
          grouped[classeKey].push(student);
        });
        
        setKanbanData(grouped);
      } else {
        console.error('Error loading kanban data:', data);
      }
    } catch (error) {
      console.error("Error loading kanban data:", error);
      message.error("Erreur lors du chargement des données kanban");
    }
  };

  // Handle drag and drop
  const handleDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    
    if (!destination) return;
    
    // If dropped in same position, do nothing
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const studentId = parseInt(draggableId);
    const newClasseId = destination.droppableId === "unassigned" ? null : parseInt(destination.droppableId);

    try {
      const response = await fetch(`http://localhost:3000/api/students/${studentId}/group`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classe_id: newClasseId }),
      });

      if (response.ok) {
        message.success("Étudiant déplacé avec succès!");
        // Update local kanban data immediately for better UX
        await loadKanbanData();
      } else {
        const errorData = await response.json();
        message.error(errorData.error || "Erreur lors du déplacement de l'étudiant");
      }
    } catch (error) {
      console.error("Error moving student:", error);
      message.error("Erreur lors du déplacement: " + error.message);
    }
  };

  // Handle commit
  const handleCommit = async () => {
    Modal.confirm({
      title: "Confirmer l'enregistrement",
      content: "Êtes-vous sûr de vouloir enregistrer définitivement tous les étudiants?",
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

  // Handle menu click
  const handleMenuClick = (e) => {
    setSelectedFilter(e.key);
    if (e.key === 'bulk-assign') {
      // Navigate to the bulk assignment page
      navigate('/students/assign');
    } else if (e.key === 'affecter-classes' || e.key === 'ajuster-manuellement') {
      fetchStudents();
      fetchNiveaux();
      fetchClasses();
      if (e.key === 'ajuster-manuellement') {
        loadKanbanData();
      }
    } else {
      applyFilter(users, e.key);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Apply filter whenever users data or selectedFilter changes
  useEffect(() => {
    if (users && users.length > 0) {
      applyFilter(users, selectedFilter);
    }
  }, [selectedFilter, users]);

  // Handle URL parameter changes
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && tab !== selectedFilter) {
      setSelectedFilter(tab);
      if (tab === 'affecter-classes' || tab === 'ajuster-manuellement') {
        fetchStudents();
        fetchNiveaux();
        fetchClasses();
      }
    }
  }, [searchParams]);

  
  const handleSubmit = async (values) => {
    try {
      // Format date if exists
      const formattedValues = {
        ...values,
        date_naissance: values.date_naissance 
          ? moment(values.date_naissance).format('YYYY-MM-DD')
          : null,
      };

      // Remove empty/undefined values for cleaner payload
      Object.keys(formattedValues).forEach(key => {
        if (formattedValues[key] === undefined || formattedValues[key] === '') {
          delete formattedValues[key];
        }
      });

      const url = editingUser
        ? `http://localhost:4000/api/auth/updateuser/${editingUser.id}`
        : "http://localhost:4000/api/auth/register";
      
      const method = editingUser ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formattedValues),
      });

      const data = await response.json();
      
      if (response.ok) {
        message.success(
          editingUser 
            ? "Utilisateur mis à jour avec succès!"
            : "Utilisateur créé avec succès!"
        );
        setModalVisible(false);
        setEditingUser(null);
        form.resetFields();
        
        // Refresh appropriate list
        if (selectedFilter === 'student-management') {
          fetchStudents();
        } else {
          fetchUsers();
        }
      } else {
        message.error(data.error || data.message || "Operation failed");
      }
    } catch (error) {
      console.error("Error:", error);
      message.error("An error occurred");
    }
  };

  
  const handleDelete = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/auth/deleteuser/${id}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      if (response.ok) {
        message.success("Utilisateur supprimé avec succès!");
        fetchUsers();
      } else {
        const data = await response.json();
        message.error(data.message || "Delete failed");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      message.error("Error deleting user");
    }
  };

  
  const handleEdit = (user) => {
    setEditingUser(user);
    
    // Format date if it exists
    const formValues = {
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      role: user.role,
      phone: user.phone,
      date_naissance: user.date_naissance ? moment(user.date_naissance) : null,
      // Student-specific fields
      numero_etudiant: user.numero_etudiant,
      niveau_id: user.niveau_id,
      classe_id: user.classe_id,
      statut: user.statut,
      adresse: user.adresse,
      notes: user.notes,
      // Don't set password for security
    };
    
    form.setFieldsValue(formValues);
    setModalVisible(true);
  };

  // Handle add new
  const handleAddNew = () => {
    setEditingUser(null);
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
      title: "Prénom",
      dataIndex: "prenom",
      key: "prenom",
      width: 150,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 200,
    },
    {
      title: "Rôle",
      dataIndex: "role",
      key: "role",
      width: 100,
      render: (role) => {
        let color;
        if (role === "admin") color = "geekblue";
        else if (role === "enseignant") color = "green";
        else if (role === "chef_de_department") color = "purple";
        else color = "orange";
        return <Tag color={color}>{role?.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          {selectedFilter === 'show-teachers' && (
            <Button
              type="default"
              icon={<BookOutlined />}
              size="small"
              title="Assign Matières"
              onClick={() => {
                setSelectedTeacherForMatieres(record);
                setMatiereAssignmentModalVisible(true);
              }}
            >
              Matières
            </Button>
          )}
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Êtes-vous sûr de vouloir supprimer cet utilisateur?"
            onConfirm={() => handleDelete(record.id)}
            okText="Oui"
            cancelText="Non"
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
    label: 'Gestion utilisateur',
    children: [
      { key: 'show-users', label: 'Afficher les etudiants' },
      { key: 'show-teachers', label: 'Afficher les enseignants' },
      { key: 'show-admins', label: 'Afficher les administrateurs' },
      { key: 'show-department-heads', label: 'Afficher les chefs de département' },
    ],
  },
  {
    key: 'student-advanced',
    icon: React.createElement(TeamOutlined),
    label: 'Gestion Étudiants Avancée',
    children: [
      { key: 'bulk-assign', label: 'Sélectionner et Assigner' },
      { key: 'affecter-classes', label: 'Affecter aux Classes' },
      { key: 'ajuster-manuellement', label: 'Ajuster Manuellement' },
    ],
  }/*,
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
  },*/
];

  // Calculate statistics for student management
  const tempStudents = students.filter((s) => s.is_temporary);
  const assignedStudents = tempStudents.filter((s) => s.classe_id);
  const unassignedStudents = tempStudents.filter((s) => !s.classe_id);

  // PAGE 1: AFFECTER AUX CLASSES (Import + Auto-Assignment)
  if (selectedFilter === 'affecter-classes') {
    return (
      <Layout style={{ minHeight: "100vh" }}>
        <Sider width={250} style={{ background: colorBgContainer }}>
          <Menu
            mode="inline"
            defaultSelectedKeys={["show-users"]}
            defaultOpenKeys={["users"]}
            selectedKeys={[selectedFilter]}
            style={{ height: "100%", borderRight: 0 }}
            items={items2}
            onClick={handleMenuClick}
          />
        </Sider>

        <Layout style={{ padding: "0 24px 24px" }}>
          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col span={24}>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate("/")}
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
              { title: "Gestion Avancée des Étudiants" },
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
            <Card>
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <FileExcelOutlined style={{ fontSize: 64, color: '#1890ff', marginBottom: 24 }} />
                <Title level={3}>Importation des Étudiants</Title>
                <Paragraph type="secondary" style={{ fontSize: 16, marginBottom: 32 }}>
                  L'importation des étudiants se fait maintenant via la page dédiée.
                </Paragraph>
                <Space direction="vertical" size="large">
                  <Button
                    type="primary"
                    size="large"
                    icon={<UploadOutlined />}
                    onClick={() => navigate('/upload-students')}
                  >
                    Aller à la page de téléversement
                  </Button>
                  <Paragraph type="secondary">
                    Les étudiants seront automatiquement assignés aux classes selon leur spécialité
                  </Paragraph>
                </Space>
              </div>
            </Card>
          </Content>
        </Layout>
      </Layout>
    );
  }

  // PAGE 2: AJUSTER MANUELLEMENT (Kanban Drag & Drop)
  if (selectedFilter === 'ajuster-manuellement') {
    return (
      <Layout style={{ minHeight: "100vh" }}>
        <Sider width={250} style={{ background: colorBgContainer }}>
          <Menu
            mode="inline"
            defaultSelectedKeys={["show-users"]}
            defaultOpenKeys={["users", "student-advanced"]}
            selectedKeys={[selectedFilter]}
            style={{ height: "100%", borderRight: 0 }}
            items={items2}
            onClick={handleMenuClick}
          />
        </Sider>

        <Layout style={{ padding: "0 24px 24px" }}>
          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col span={24}>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate("/")}
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
              { title: "Ajuster Manuellement" },
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
            {tempStudents.length === 0 ? (
              <Alert
                message="Aucun étudiant importé"
                description="Veuillez d'abord importer des étudiants via la page 'Affecter aux Classes' avant d'utiliser l'ajustement manuel."
                type="warning"
                showIcon
              />
            ) : (
              <>
                <Card style={{ marginBottom: 16 }}>
                  <Row gutter={16}>
                    <Col span={8}>
                      <Card>
                        <Statistic
                          title="Total"
                          value={tempStudents.length}
                          prefix={<TeamOutlined />}
                        />
                      </Card>
                    </Col>
                    <Col span={8}>
                      <Card>
                        <Statistic
                          title="Affectés"
                          value={assignedStudents.length}
                          valueStyle={{ color: '#3f8600' }}
                          prefix={<CheckCircleOutlined />}
                        />
                      </Card>
                    </Col>
                    <Col span={8}>
                      <Card>
                        <Statistic
                          title="Non Affectés"
                          value={unassignedStudents.length}
                          valueStyle={{ color: '#cf1322' }}
                          prefix={<WarningOutlined />}
                        />
                      </Card>
                    </Col>
                  </Row>
                </Card>

                {/* Kanban View for Manual Adjustment */}
                <Card title="Vue Kanban - Glisser-Déposer pour Ajuster" style={{ marginBottom: 16 }}>
                  <Alert
                    message="Mode Ajustement Manuel"
                    description="Glissez et déposez les étudiants entre les classes pour ajuster leur affectation. Les changements sont appliqués immédiatement."
                    type="info"
                    showIcon
                    style={{ marginBottom: 16 }}
                  />
                  
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Row gutter={16}>
                      {/* Unassigned Column */}
                      <Col span={6}>
                        <Card
                          size="small"
                          title="Non Affectés"
                          headStyle={{ background: '#fff1f0', color: '#cf1322' }}
                        >
                          <Droppable droppableId="unassigned">
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                style={{ minHeight: 300 }}
                              >
                                {(kanbanData.unassigned || []).map((student, index) => (
                                  <Draggable
                                    key={student.id}
                                    draggableId={String(student.id)}
                                    index={index}
                                  >
                                    {(provided) => (
                                      <Card
                                        size="small"
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        style={{
                                          marginBottom: 8,
                                          cursor: 'grab',
                                          ...provided.draggableProps.style,
                                        }}
                                      >
                                        <div>
                                          <strong>{student.nom} {student.prenom}</strong>
                                          <br />
                                          <small>{student.email}</small>
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
                      </Col>

                      {/* Class Columns */}
                      {classes.map((classe) => (
                        <Col span={6} key={classe.id}>
                          <Card
                            size="small"
                            title={classe.nom}
                            headStyle={{ background: '#e6f7ff' }}
                          >
                            <Droppable droppableId={String(classe.id)}>
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.droppableProps}
                                  style={{ minHeight: 300 }}
                                >
                                  {(kanbanData[classe.id] || []).map((student, index) => (
                                    <Draggable
                                      key={student.id}
                                      draggableId={String(student.id)}
                                      index={index}
                                    >
                                      {(provided) => (
                                        <Card
                                          size="small"
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                          style={{
                                            marginBottom: 8,
                                            cursor: 'grab',
                                            ...provided.draggableProps.style,
                                          }}
                                        >
                                          <div>
                                            <strong>{student.nom} {student.prenom}</strong>
                                            <br />
                                            <small>{student.email}</small>
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
                        </Col>
                      ))}
                    </Row>
                  </DragDropContext>
                </Card>

                {/* Action Buttons */}
                <Card>
                  <Space>
                    <Button
                      icon={<SaveOutlined />}
                      type="primary"
                      size="large"
                      onClick={handleCommit}
                      disabled={assignedStudents.length === 0}
                    >
                      Enregistrer Définitivement
                    </Button>
                    
                    <Button icon={<DownloadOutlined />} onClick={handleExport}>
                      Exporter CSV
                    </Button>

                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      onClick={async () => {
                        if (importedBatchId) {
                          try {
                            await fetch(`http://localhost:3000/api/students/batch/${importedBatchId}`, {
                              method: 'DELETE',
                            });
                            message.success('Import annulé');
                            setImportedBatchId(null);
                            setCurrentStep(0);
                            fetchStudents();
                          } catch (error) {
                            message.error('Erreur lors de l\'annulation');
                          }
                        }
                      }}
                    >
                      Annuler l'Import
                    </Button>
                  </Space>
                </Card>
              </>
            )}
          </Content>
        </Layout>
      </Layout>
    );
  }

  // Default view for other tabs
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider width={250} style={{ background: colorBgContainer }}>
        <Menu
          mode="inline"
          defaultSelectedKeys={["show-users"]}
          defaultOpenKeys={["users"]}
          selectedKeys={[selectedFilter]}
          style={{ height: "100%", borderRight: 0 }}
          items={items2}
          onClick={handleMenuClick}
        />
      </Sider>

      <Layout style={{ padding: "0 24px 24px" }}>
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col span={24}>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/")}
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
            { title: "Gestion des Utilisateurs" },
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
                title={
                  selectedFilter === 'show-teachers' 
                    ? 'Liste des Enseignants' 
                    : selectedFilter === 'show-admins' 
                    ? 'Liste des Administrateurs' 
                    : 'Gestion des Utilisateurs'
                }
                extra={
                  <Space>
                    <Tag color="blue">
                      Total: {filteredUsers.length}
                    </Tag>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={handleAddNew}
                    >
                      Ajouter Utilisateur
                    </Button>
                  </Space>
                }
              >
                <Table
                  dataSource={filteredUsers}
                  columns={columns}
                  rowKey="id"
                  loading={loading}
                  scroll={{ x: 1000 }}
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

      {/* Modal for Create/Edit */}
      <Modal
        title={editingUser ? "Modifier Utilisateur" : "Ajouter Utilisateur"}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingUser(null);
          form.resetFields();
        }}
        footer={null}
        width={900}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ marginTop: 20 }}
        >
          <Divider orientation="left">Informations Générales</Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Nom"
                name="nom"
                rules={[
                  { required: true, message: "Veuillez entrer le nom!" },
                  { min: 2, message: "Le nom doit contenir au moins 2 caractères!" },
                ]}
              >
                <Input placeholder="Entrez le nom" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Prénom"
                name="prenom"
                rules={[
                  { required: true, message: "Veuillez entrer le prénom!" },
                  { min: 2, message: "Le prénom doit contenir au moins 2 caractères!" },
                ]}
              >
                <Input placeholder="Entrez le prénom" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Veuillez entrer l'email!" },
              { type: "email", message: "Format d'email invalide!" },
            ]}
          >
            <Input placeholder="Entrez l'email" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Téléphone"
                name="phone"
              >
                <Input placeholder="Entrez le numéro de téléphone" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Date de Naissance"
                name="date_naissance"
              >
                <DatePicker 
                  style={{ width: '100%' }}
                  placeholder="Sélectionnez la date"
                  format="DD/MM/YYYY"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Mot de passe"
                name="password"
                rules={[
                  { 
                    required: !editingUser, 
                    message: "Veuillez entrer le mot de passe!" 
                  },
                  { 
                    min: 6, 
                    message: "Le mot de passe doit contenir au moins 6 caractères!" 
                  },
                ]}
              >
                <Input.Password 
                  placeholder={editingUser ? "Laisser vide pour ne pas changer" : "Entrez le mot de passe"} 
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Rôle"
                name="role"
                rules={[
                  { required: true, message: "Veuillez sélectionner le rôle!" },
                ]}
              >
                <Select placeholder="Sélectionnez le rôle">
                  <Option value="admin">Admin</Option>
                  <Option value="enseignant">Enseignant</Option>
                  <Option value="etudiant">Étudiant</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.role !== currentValues.role}
          >
            {({ getFieldValue }) =>
              getFieldValue('role') === 'etudiant' ? (
                <>
                  <Divider orientation="left">Informations Étudiant</Divider>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        label="Numéro Étudiant"
                        name="numero_etudiant"
                      >
                        <Input placeholder="Ex: ETU2024001" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        label="Statut"
                        name="statut"
                        initialValue="actif"
                      >
                        <Select>
                          <Option value="actif">Actif</Option>
                          <Option value="inactif">Inactif</Option>
                          <Option value="diplome">Diplômé</Option>
                          <Option value="abandonne">Abandonné</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        label="Niveau"
                        name="niveau_id"
                      >
                        <Select
                          placeholder="Sélectionnez le niveau"
                          allowClear
                        >
                          {niveaux.map((niveau) => (
                            <Option key={niveau.id} value={niveau.id}>
                              {niveau.nom}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        label="Classe"
                        name="classe_id"
                      >
                        <Select
                          placeholder="Sélectionnez la classe"
                          allowClear
                        >
                          {classes.map((classe) => (
                            <Option key={classe.id} value={classe.id}>
                              {classe.nom} ({classe.Niveau?.nom || 'N/A'})
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    label="Adresse"
                    name="adresse"
                  >
                    <TextArea rows={2} placeholder="Entrez l'adresse complète" />
                  </Form.Item>

                  <Form.Item
                    label="Notes"
                    name="notes"
                  >
                    <TextArea rows={3} placeholder="Notes additionnelles..." />
                  </Form.Item>
                </>
              ) : null
            }
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button
                onClick={() => {
                  setModalVisible(false);
                  setEditingUser(null);
                  form.resetFields();
                }}
              >
                Annuler
              </Button>
              <Button type="primary" htmlType="submit">
                {editingUser ? "Mettre à jour" : "Créer"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Teacher Matière Assignment Modal */}
      <TeacherMatiereAssignment
        visible={matiereAssignmentModalVisible}
        onCancel={() => {
          setMatiereAssignmentModalVisible(false);
          setSelectedTeacherForMatieres(null);
        }}
        onSuccess={() => {
          fetchUsers();
        }}
        teacher={selectedTeacherForMatieres}
        departement={selectedTeacherForMatieres?.departement}
      />
    </Layout>
  );
};

export default UserManagement;
