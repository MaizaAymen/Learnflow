import React, { useState, useEffect } from "react";
import {
  Layout,
  Table,
  Button,
  Modal,
  Select,
  message,
  Space,
  Card,
  Row,
  Col,
  theme,
  Tag,
  Alert,
  Breadcrumb,
  Divider,
  Spin,
  Empty,
} from "antd";
import {
  ArrowLeftOutlined,
  UserOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Content } = Layout;
const { Option } = Select;

const StudentBulkAssignment = () => {
  const navigate = useNavigate();
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  // State management
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  
  // New states for controlled modal
  const [assignmentModalVisible, setAssignmentModalVisible] = useState(false);
  const [studentsToAssign, setStudentsToAssign] = useState([]);

  // Fetch students from auth service
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:4000/api/auth/getallstudents", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Format students data with necessary fields
      const formattedStudents = Array.isArray(data) ? data : data.students || data.data || [];
      console.log("Students loaded:", formattedStudents.length);
      
      setStudents(
        formattedStudents.map((student, index) => ({
          ...student,
          key: student.id || student._id || index,
          fullName: `${student.prenom || ''} ${student.nom || ''}`.trim(),
        }))
      );
    } catch (error) {
      console.error("Error fetching students:", error);
      message.error("Erreur lors du chargement des étudiants: " + error.message);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch classes from reference service
  const fetchClasses = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/reference/classes");
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Classes loaded:", data);
      
      const classesArray = Array.isArray(data) ? data : 
                          data.classes || data.data || [];
      setClasses(classesArray);
    } catch (error) {
      console.error("Error fetching classes:", error);
      message.error("Erreur lors du chargement des classes: " + error.message);
      setClasses([]);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchClasses();
  }, []);

  // Handle row selection
  const handleSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  // Show assignment confirmation modal
  const showAssignmentModal = () => {
    console.log("🎯 showAssignmentModal called");
    console.log("   Selected row keys:", selectedRowKeys);
    console.log("   Selected class:", selectedClass);
    
    if (selectedRowKeys.length === 0) {
      message.warning("Veuillez sélectionner au moins un étudiant");
      return;
    }

    if (!selectedClass) {
      message.warning("Veuillez sélectionner une classe");
      return;
    }

    const selectedStudents = students.filter((s) =>
      selectedRowKeys.includes(s.key)
    );
    
    console.log("   Selected students:", selectedStudents.length);
    
    // Set the students to assign and show the modal
    setStudentsToAssign(selectedStudents);
    setAssignmentModalVisible(true);
  };

  // Handle modal confirmation
  const handleModalConfirm = async () => {
    setAssignmentModalVisible(false);
    await handleAssignStudents(studentsToAssign);
  };

  // Handle modal cancel
  const handleModalCancel = () => {
    setAssignmentModalVisible(false);
    setStudentsToAssign([]);
  };

  // Assign selected students to class
  const handleAssignStudents = async (studentsToAssign) => {
    setConfirmLoading(true);
    try {
      const payload = {
        studentIds: studentsToAssign.map((s) => s.id || s._id),
        classeId: selectedClass,
      };
      
      console.log("📤 Sending assignment request:", payload);

      const response = await fetch(
        "http://localhost:4000/api/auth/assign-students-to-class",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();
      console.log("📥 Response data:", data);

      if (response.ok) {
        message.success(
          `✅ ${data.assignedCount || studentsToAssign.length} étudiant(s) assigné(s) avec succès!`
        );
        setSelectedRowKeys([]);
        setSelectedClass(null);
        setStudentsToAssign([]);
        await fetchStudents(); // Refresh the list
      } else {
        message.error(`❌ Erreur: ${data.error || data.message || "Assignation échouée"}`);
        throw new Error(data.error || "Assignation échouée");
      }
    } catch (error) {
      console.error("❌ Assignment error:", error);
      message.error("❌ Erreur lors de l'assignation: " + error.message);
    } finally {
      setConfirmLoading(false);
    }
  };

  // Remove students from class
  const handleRemoveFromClass = async (studentId) => {
    Modal.confirm({
      title: "Retirer de la classe",
      content: "Êtes-vous sûr de vouloir retirer cet étudiant de sa classe?",
      okText: "Oui",
      cancelText: "Non",
      okType: "danger",
      onOk: async () => {
        try {
          const response = await fetch(
            `http://localhost:3000/api/students/${studentId}/remove-from-class`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
            }
          );

          if (response.ok) {
            message.success("Étudiant retiré de la classe");
            fetchStudents();
          } else {
            const data = await response.json();
            message.error(data.error || "Erreur lors du retrait");
          }
        } catch (error) {
          message.error("Erreur: " + error.message);
        }
      },
    });
  };

  // Table columns
  const columns = [
    {
      title: "Nom",
      dataIndex: "nom",
      key: "nom",
      width: 150,
      render: (text) => text || "-",
    },
    {
      title: "Prénom",
      dataIndex: "prenom",
      key: "prenom",
      width: 150,
      render: (text) => text || "-",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 200,
      render: (text) => text || "-",
    },
    {
      title: "Spécialité",
      dataIndex: "specialite",
      key: "specialite",
      width: 150,
      render: (text) => text || "-",
    },
    {
      title: "Statut",
      key: "status",
      width: 120,
      render: (_, record) => (
        record.classe_id ? (
          <Tag color="green">Assigné</Tag>
        ) : (
          <Tag color="orange">Non assigné</Tag>
        )
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: (_, record) => (
        <Space size="small">
          {record.classe_id && (
            <Button
              type="text"
              danger
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => handleRemoveFromClass(record.id || record._id)}
            >
              Retirer
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: handleSelectChange,
    getCheckboxProps: (record) => ({
      disabled: !!record.classe_id,
    }),
  };

  const selectableStudents = students.filter((s) => !s.classe_id);
  const assignedStudents = students.filter((s) => s.classe_id);
  const targetClass = classes.find((c) => c.id === selectedClass);

  return (
    <Layout style={{ minHeight: "100vh", background: colorBgContainer }}>
      <Content style={{ padding: "24px" }}>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col span={24}>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/users")}
            >
              Retour à la Gestion des Utilisateurs
            </Button>
          </Col>
        </Row>

        <Breadcrumb
          style={{ marginBottom: 16 }}
          items={[
            { 
              title: (
                <span 
                  onClick={() => navigate("/")} 
                  style={{ cursor: 'pointer' }}
                >
                  Accueil
                </span>
              )
            },
            { title: "Sélectionner et Assigner des Étudiants" },
          ]}
        />

        <Card
          title={
            <div>
              <UserOutlined style={{ marginRight: 8 }} />
              Sélectionner et Assigner des Étudiants à une Classe
            </div>
          }
          style={{ marginBottom: 16 }}
        >
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col xs={24} sm={12} lg={8}>
              <div>
                <label style={{ fontWeight: "bold", display: "block", marginBottom: 8 }}>
                  Sélectionner une classe *
                </label>
                <Select
                  placeholder="Choisissez une classe"
                  value={selectedClass}
                  onChange={setSelectedClass}
                  style={{ width: "100%" }}
                  allowClear
                >
                  {classes.map((classe) => (
                    <Option key={classe.id} value={classe.id}>
                      {classe.nom}
                    </Option>
                  ))}
                </Select>
              </div>
            </Col>
            <Col xs={24} sm={12} lg={16} style={{ display: "flex", alignItems: "flex-end" }}>
              <Button
                type="primary"
                size="large"
                onClick={showAssignmentModal}
                disabled={selectedRowKeys.length === 0 || !selectedClass}
                style={{ width: "100%" }}
              >
                Assigner {selectedRowKeys.length > 0 && `(${selectedRowKeys.length})`}
              </Button>
            </Col>
          </Row>

          {selectedRowKeys.length > 0 && (
            <Alert
              message={`${selectedRowKeys.length} étudiant(s) sélectionné(s) pour l'assignation à ${targetClass?.nom || 'la classe sélectionnée'}`}
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}
        </Card>

        <Card
          title={
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Liste des Étudiants Non Assignés</span>
              <Tag color="blue">
                Total: {students.length} | Assignés: {assignedStudents.length} | Non assignés: {selectableStudents.length}
              </Tag>
            </div>
          }
        >
          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px' }}>
              <Spin size="large" />
            </div>
          ) : selectableStudents.length === 0 ? (
            <Empty description="Aucun étudiant non assigné trouvé" />
          ) : (
            <Table
              dataSource={selectableStudents}
              columns={columns}
              rowKey="key"
              loading={loading}
              rowSelection={rowSelection}
              scroll={{ x: 1000 }}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} de ${total} étudiants`,
              }}
            />
          )}
        </Card>

        {/* Controlled Assignment Modal */}
        <Modal
          title={
            <div>
              <ExclamationCircleOutlined style={{ color: '#faad14', marginRight: 8 }} />
              Confirmer l'assignation
            </div>
          }
          open={assignmentModalVisible}
          onOk={handleModalConfirm}
          onCancel={handleModalCancel}
          okText="Confirmer l'assignation"
          cancelText="Annuler"
          okButtonProps={{ 
            type: 'primary',
            loading: confirmLoading 
          }}
          cancelButtonProps={{ disabled: confirmLoading }}
          width={600}
        >
          <div>
            <p>
              <strong>Nombre d'étudiants :</strong> {studentsToAssign.length}
            </p>
            <p>
              <strong>Classe :</strong> {targetClass?.nom || 'Classe inconnue'}
            </p>
            <Divider />
            <p><strong>Étudiants sélectionnés :</strong></p>
            <div style={{ 
              maxHeight: 200, 
              overflowY: "auto", 
              border: '1px solid #d9d9d9',
              borderRadius: '6px',
              padding: '12px',
              background: '#fafafa'
            }}>
              {studentsToAssign.map((student) => (
                <Tag 
                  key={student.key} 
                  color="blue" 
                  style={{ 
                    marginBottom: 4,
                    padding: '4px 8px',
                    fontSize: '13px'
                  }}
                >
                  {student.fullName}
                </Tag>
              ))}
            </div>
            <Divider />
            <Alert
              message="Confirmation"
              description="Êtes-vous sûr de vouloir assigner ces étudiants à la classe sélectionnée ?"
              type="warning"
              showIcon
            />
          </div>
        </Modal>
      </Content>
    </Layout>
  );
};

export default StudentBulkAssignment;