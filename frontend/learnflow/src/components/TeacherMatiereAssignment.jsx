import React, { useState, useEffect } from 'react';
import {
  Modal,
  Select,
  Button,
  Space,
  message,
  Spin,
  Card,
  Row,
  Col,
  Tag,
  Divider,
  Empty
} from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

const { Option } = Select;

const TeacherMatiereAssignment = ({ 
  visible, 
  onCancel, 
  onSuccess,
  teacher,
  departement 
}) => {
  const [matieres, setMatieres] = useState([]);
  const [assignedMatieres, setAssignedMatieres] = useState([]);
  const [selectedMatieres, setSelectedMatieres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [matieresLoading, setMatieresLoading] = useState(false);

  // Fetch all matières when modal opens
  useEffect(() => {
    if (visible) {
      fetchDepartmentMatieres();
      fetchTeacherMatieres();
    }
  }, [visible, teacher?.id]);

  const fetchDepartmentMatieres = async () => {
    setMatieresLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/reference/matieres`);
      const data = await response.json();
      
      if (Array.isArray(data)) {
        console.log('Total matieres available:', data.length);
        // Show ALL matières without filtering by department
        setMatieres(data);
      } else {
        console.warn('No data or not an array:', data);
        setMatieres([]);
      }
    } catch (error) {
      console.error('Error fetching matieres:', error);
      message.error('Failed to load matières');
      setMatieres([]);
    } finally {
      setMatieresLoading(false);
    }
  };

  const fetchTeacherMatieres = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/reference/teachers/${teacher.id}/matieres`
      );
      
      if (response.ok) {
        const data = await response.json();
        const matieresIds = Array.isArray(data) ? data.map(m => m.id) : [];
        setAssignedMatieres(matieresIds);
        setSelectedMatieres(matieresIds);
      }
    } catch (error) {
      console.error('Error fetching teacher matieres:', error);
    }
  };

  const handleSaveAssignments = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3000/api/reference/teachers/${teacher.id}/assign-matieres`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ matieresIds: selectedMatieres }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        message.success(data.message || 'Matières assignées avec succès');
        setAssignedMatieres(selectedMatieres);
        if (onSuccess) {
          onSuccess();
        }
        onCancel();
      } else {
        message.error(data.error || 'Erreur lors de l\'assignation');
      }
    } catch (error) {
      console.error('Error assigning matieres:', error);
      message.error('Erreur lors de l\'assignation des matières');
    } finally {
      setLoading(false);
    }
  };

  if (!teacher) {
    return null;
  }

  // Get selected matière details
  const selectedMatieresDetails = matieres.filter(m => 
    selectedMatieres.includes(m.id)
  );

  return (
    <Modal
      title={`Assigner les Matières à ${teacher.nom} ${teacher.prenom}`}
      open={visible}
      onCancel={onCancel}
      width={700}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Annuler
        </Button>,
        <Button 
          key="submit" 
          type="primary" 
          loading={loading}
          onClick={handleSaveAssignments}
        >
          Enregistrer les Assignations
        </Button>,
      ]}
    >
      <Spin spinning={matieresLoading} tip="Chargement des matières...">
        <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
          {/* Teacher Info */}
          <Card 
            size="small" 
            style={{ marginBottom: 20, backgroundColor: '#f0f2f5' }}
          >
            <Row gutter={16}>
              <Col span={24}>
                <p>
                  <strong>Enseignant:</strong> {teacher.nom} {teacher.prenom}
                </p>
              </Col>
              <Col span={24}>
                <p>
                  <strong>Email:</strong> {teacher.email}
                </p>
              </Col>
            </Row>
          </Card>

          <Divider />

          {/* Matière Selection */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: 10 }}>
              Sélectionnez les Matières à Assigner:
            </label>
            <Select
              mode="multiple"
              placeholder="Sélectionnez une ou plusieurs matières"
              style={{ width: '100%' }}
              value={selectedMatieres}
              onChange={setSelectedMatieres}
              loading={matieresLoading}
              optionLabelProp="label"
            >
              {matieres.map(m => (
                <Option key={m.id} value={m.id}>
                  <div>
                    <strong>{m.name}</strong>
                    <span style={{ marginLeft: 8, color: '#666' }}>({m.code})</span>
                    {assignedMatieres.includes(m.id) && (
                      <Tag color="blue" style={{ marginLeft: 8 }}>
                        Actuellement assignée
                      </Tag>
                    )}
                  </div>
                </Option>
              ))}
            </Select>
            {matieres.length === 0 && !matieresLoading && (
              <div style={{ marginTop: 20, padding: '20px', backgroundColor: '#fff7e6', borderRadius: '4px', border: '1px solid #ffd591' }}>
                <p style={{ margin: 0, color: '#ad6800' }}>
                  <strong>⚠️ Aucune matière disponible</strong>
                </p>
                <p style={{ margin: '8px 0 0 0', color: '#ad6800', fontSize: '12px' }}>
                  Vérifiez que des matières sont créées dans le système
                </p>
              </div>
            )}
          </div>

          <Divider />

          {/* Summary of Selected Matières */}
          <div>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: 10 }}>
              Matières Sélectionnées ({selectedMatieresDetails.length}):
            </label>
            {selectedMatieresDetails.length === 0 ? (
              <Empty description="Aucune matière sélectionnée" size="small" />
            ) : (
              <div>
                {selectedMatieresDetails.map(m => (
                  <Tag 
                    key={m.id} 
                    color="cyan"
                    style={{ marginBottom: 8, padding: '4px 12px' }}
                  >
                    {m.name} ({m.code})
                  </Tag>
                ))}
              </div>
            )}
          </div>

          {/* Show changes summary */}
          {selectedMatieres.length !== assignedMatieres.length && (
            <div style={{ marginTop: 20 }}>
              <Card size="small" style={{ backgroundColor: '#e6f7ff' }}>
                <p style={{ margin: 0, color: '#0050b3' }}>
                  <CheckCircleOutlined /> Vous êtes sur le point de modifier {selectedMatieres.length} matière(s)
                </p>
              </Card>
            </div>
          )}
        </div>
      </Spin>
    </Modal>
  );
};

export default TeacherMatiereAssignment;
