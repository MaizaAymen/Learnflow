import React, { useState, useEffect } from 'react';
import { Calendar, Modal, Form, Select, TimePicker, Button, message, Spin, Badge, Tooltip, Popconfirm, Tag } from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  DragOutlined,
  ClockCircleOutlined,
  UserOutlined,
  HomeOutlined,
  BookOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import weekday from 'dayjs/plugin/weekday';
import localeData from 'dayjs/plugin/localeData';
import 'dayjs/locale/fr';
import './TimetableManager.css';

dayjs.extend(isBetween);
dayjs.extend(weekday);
dayjs.extend(localeData);
dayjs.locale('fr');

const { Option } = Select;

const TimetableManager = () => {
  // ==================== STATE MANAGEMENT ====================
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  
  // Data states
  const [schedules, setSchedules] = useState([]);
  const [classes, setClasses] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [salles, setSalles] = useState([]);
  const [enseignants, setEnseignants] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  
  // Filter states
  const [selectedClass, setSelectedClass] = useState(null);
  const [viewMode, setViewMode] = useState('month'); // 'month' or 'week'

  // ==================== API ENDPOINTS ====================
  const API_BASE = 'http://localhost:3000/api';
  const AUTH_API = 'http://localhost:4000/api';

  // ==================== FETCH DATA ON MOUNT ====================
  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchSchedulesForClass(selectedClass);
    } else {
      fetchSchedules();
    }
  }, [selectedClass]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchClasses(),
        fetchMatieres(),
        fetchSalles(),
        fetchEnseignants(),
        fetchTimeSlots(),
        fetchSchedules()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      message.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await fetch(`${API_BASE}/reference/classes`);
      const data = await response.json();
      setClasses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchMatieres = async () => {
    try {
      const response = await fetch(`${API_BASE}/reference/matieres`);
      const data = await response.json();
      setMatieres(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching matieres:', error);
    }
  };

  const fetchSalles = async () => {
    try {
      const response = await fetch(`${API_BASE}/reference/salles`);
      const data = await response.json();
      setSalles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching salles:', error);
    }
  };

  const fetchEnseignants = async () => {
    try {
      const response = await fetch(`${AUTH_API}/auth/users?role=enseignant`);
      const data = await response.json();
      setEnseignants(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching enseignants:', error);
    }
  };

  const fetchTimeSlots = async () => {
    try {
      const response = await fetch(`${API_BASE}/calendar/timeslots?is_active=true`);
      const data = await response.json();
      setTimeSlots(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching time slots:', error);
    }
  };

  const fetchSchedules = async () => {
    try {
      const response = await fetch(`${API_BASE}/calendar/schedules`);
      const data = await response.json();
      setSchedules(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    }
  };

  const fetchSchedulesForClass = async (classeId) => {
    try {
      const response = await fetch(`${API_BASE}/calendar/schedules?classe_id=${classeId}`);
      const data = await response.json();
      setSchedules(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching class schedules:', error);
    }
  };

  // ==================== CALENDAR CELL RENDERING ====================
  const getListData = (value) => {
    if (!value || !schedules.length) return [];

    try {
      const dateStr = value.format('YYYY-MM-DD');
      const dayOfWeek = value.format('dddd');
      
      const dayMap = {
        'lundi': 'Lundi',
        'mardi': 'Mardi',
        'mercredi': 'Mercredi',
        'jeudi': 'Jeudi',
        'vendredi': 'Vendredi',
        'samedi': 'Samedi',
        'dimanche': 'Dimanche'
      };
      
      const frenchDay = dayMap[dayOfWeek.toLowerCase()];
      if (!frenchDay) return [];

      const daySchedules = schedules.filter(schedule => {
        if (!schedule || !schedule.timeSlot) return false;
        
        try {
          const startDate = new Date(schedule.date_debut);
          const endDate = schedule.date_fin ? new Date(schedule.date_fin) : null;
          const currentDate = value.toDate();
          
          const isInRange = currentDate >= startDate && 
                           (!endDate || currentDate <= endDate);
          
          const dayMatches = schedule.timeSlot.day_of_week === frenchDay;
          
          return isInRange && dayMatches && schedule.statut !== 'annule';
        } catch (error) {
          return false;
        }
      });

      return daySchedules.map((schedule) => {
        const matiereName = schedule.matiere?.name || 'Cours';
        const className = schedule.classe?.nom || '';
        const time = schedule.timeSlot ? 
          `${schedule.timeSlot.start_time.substring(0, 5)}` : '';
        
        return {
          type: getStatusBadgeType(schedule.type_cours),
          content: `${time} ${matiereName} - ${className}`,
          schedule: schedule
        };
      });
    } catch (error) {
      console.error('Error in getListData:', error);
      return [];
    }
  };

  const getStatusBadgeType = (typeCours) => {
    const types = {
      'Cours': 'processing',
      'TD': 'warning',
      'TP': 'success',
      'Examen': 'error',
      'Soutien': 'default'
    };
    return types[typeCours] || 'default';
  };

  const dateCellRender = (value) => {
    const listData = getListData(value);
    
    if (listData.length === 0) return null;

    return (
      <ul className="events" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {listData.map((item, index) => (
          <li key={index} style={{ marginBottom: '4px' }}>
            <Tooltip title={item.content}>
              <Badge 
                status={item.type} 
                text={
                  <span 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditSchedule(item.schedule);
                    }}
                    style={{ 
                      fontSize: '11px',
                      cursor: 'pointer',
                      color: '#1890ff'
                    }}
                  >
                    {item.content.length > 25 ? item.content.substring(0, 25) + '...' : item.content}
                  </span>
                } 
              />
            </Tooltip>
          </li>
        ))}
      </ul>
    );
  };

  const cellRender = (current, info) => {
    if (info.type === 'date') {
      return dateCellRender(current);
    }
    return info.originNode;
  };

  // ==================== MODAL HANDLERS ====================
  const handleCellClick = (value) => {
    setSelectedDate(value);
    setModalMode('create');
    setSelectedSchedule(null);
    form.resetFields();
    
    // Pre-fill the date and day of week
    const dayOfWeek = value.format('dddd');
    const dayMap = {
      'lundi': 'Lundi',
      'mardi': 'Mardi',
      'mercredi': 'Mercredi',
      'jeudi': 'Jeudi',
      'vendredi': 'Vendredi',
      'samedi': 'Samedi',
      'dimanche': 'Dimanche'
    };
    
    form.setFieldsValue({
      date_debut: value.format('YYYY-MM-DD'),
      classe_id: selectedClass
    });
    
    setModalVisible(true);
  };

  const handleEditSchedule = (schedule) => {
    setSelectedSchedule(schedule);
    setModalMode('edit');
    
    form.setFieldsValue({
      time_slot_id: schedule.time_slot_id,
      classe_id: schedule.classe_id,
      matiere_id: schedule.matiere_id,
      salle_id: schedule.salle_id,
      enseignant_id: schedule.enseignant_id,
      date_debut: schedule.date_debut,
      date_fin: schedule.date_fin,
      type_cours: schedule.type_cours,
      recurrence: schedule.recurrence,
      notes: schedule.notes
    });
    
    setModalVisible(true);
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setSelectedSchedule(null);
    form.resetFields();
  };

  const handleModalSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const scheduleData = {
        ...values,
        date_debut: values.date_debut,
        date_fin: values.date_fin || null
      };

      console.log('Creating/updating schedule with data:', scheduleData);

      let response;
      if (modalMode === 'create') {
        response = await fetch(`${API_BASE}/calendar/schedules`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(scheduleData)
        });
      } else {
        response = await fetch(`${API_BASE}/calendar/schedules/${selectedSchedule.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(scheduleData)
        });
      }

      const result = await response.json();

      if (response.ok && result.success) {
        message.success(modalMode === 'create' ? 'Séance créée avec succès' : 'Séance modifiée avec succès');
        handleModalCancel();
        if (selectedClass) {
          fetchSchedulesForClass(selectedClass);
        } else {
          fetchSchedules();
        }
      } else {
        if (result.type === 'conflict') {
          // Show detailed conflict information
          const conflictType = result.target === 'enseignant' ? 'L\'enseignant' : 
                              result.target === 'salle' ? 'La salle' : 
                              result.target === 'classe' ? 'La classe' : 'Une ressource';
          message.error({
            content: `${conflictType} ${result.message || 'est déjà occupé(e) à ce créneau'}`,
            duration: 5
          });
          
          // Log full details for debugging
          console.log('Conflict details:', result);
        } else {
          message.error(result.error || 'Erreur lors de l\'opération');
        }
      }
    } catch (error) {
      console.error('Error submitting schedule:', error);
      message.error('Erreur lors de la soumission');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/calendar/schedules/${scheduleId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        message.success('Séance supprimée avec succès');
        if (selectedClass) {
          fetchSchedulesForClass(selectedClass);
        } else {
          fetchSchedules();
        }
      } else {
        message.error('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Error deleting schedule:', error);
      message.error('Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  // ==================== DRAG AND DROP HANDLER ====================
  const handleDragStart = (e, schedule) => {
    e.dataTransfer.setData('schedule', JSON.stringify(schedule));
  };

  const handleDrop = async (e, date) => {
    e.preventDefault();
    try {
      const scheduleData = JSON.parse(e.dataTransfer.getData('schedule'));
      
      // Calculate the new day of week
      const dayOfWeek = date.format('dddd');
      const dayMap = {
        'lundi': 'Lundi',
        'mardi': 'Mardi',
        'mercredi': 'Mercredi',
        'jeudi': 'Jeudi',
        'vendredi': 'Vendredi',
        'samedi': 'Samedi',
        'dimanche': 'Dimanche'
      };
      const frenchDay = dayMap[dayOfWeek.toLowerCase()];
      
      // Find a time slot for the new day
      const newTimeSlot = timeSlots.find(ts => ts.day_of_week === frenchDay);
      
      if (!newTimeSlot) {
        message.error('Aucun créneau disponible pour ce jour');
        return;
      }

      setLoading(true);
      const response = await fetch(`${API_BASE}/calendar/schedules/${scheduleData.id}/drag-drop`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          time_slot_id: newTimeSlot.id,
          classe_id: scheduleData.classe_id,
          salle_id: scheduleData.salle_id
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        message.success('Séance déplacée avec succès');
        if (selectedClass) {
          fetchSchedulesForClass(selectedClass);
        } else {
          fetchSchedules();
        }
      } else {
        if (result.type === 'conflict') {
          message.error(`Conflit détecté: ${result.message}`);
        } else {
          message.error('Erreur lors du déplacement');
        }
      }
    } catch (error) {
      console.error('Error in drag-drop:', error);
      message.error('Erreur lors du déplacement');
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // ==================== RENDER ====================
  return (
    <div className="timetable-manager">
      <Spin spinning={loading}>
        <div className="timetable-header">
          <div className="header-content">
            <h1>
              <CalendarOutlined /> Gestion de l'Emploi du Temps
            </h1>
            <p>Créer, modifier et gérer les séances de cours</p>
          </div>
          
          <div className="header-actions">
            <Select
              placeholder="Sélectionner une classe"
              style={{ width: 250 }}
              value={selectedClass}
              onChange={setSelectedClass}
              allowClear
            >
              {classes.map(classe => (
                <Option key={classe.id} value={classe.id}>
                  {classe.nom}
                </Option>
              ))}
            </Select>
          </div>
        </div>

        <div className="timetable-legend">
          <Tag color="blue">Cours</Tag>
          <Tag color="orange">TD</Tag>
          <Tag color="green">TP</Tag>
          <Tag color="red">Examen</Tag>
          <Tag color="default">Soutien</Tag>
        </div>

        <div className="calendar-container">
          <Calendar 
            cellRender={cellRender}
            onSelect={handleCellClick}
            className="custom-calendar"
          />
        </div>

        {/* CREATE/EDIT MODAL */}
        <Modal
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {modalMode === 'create' ? <PlusOutlined /> : <EditOutlined />}
              {modalMode === 'create' ? 'Créer une séance' : 'Modifier la séance'}
            </div>
          }
          open={modalVisible}
          onOk={handleModalSubmit}
          onCancel={handleModalCancel}
          width={700}
          okText={modalMode === 'create' ? 'Créer' : 'Modifier'}
          cancelText="Annuler"
          confirmLoading={loading}
        >
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              type_cours: 'Cours',
              recurrence: 'hebdomadaire'
            }}
          >
            <Form.Item
              name="classe_id"
              label={<><BookOutlined /> Groupe (Classe)</>}
              rules={[{ required: true, message: 'Veuillez sélectionner une classe' }]}
            >
              <Select placeholder="Sélectionner une classe">
                {classes.map(classe => (
                  <Option key={classe.id} value={classe.id}>
                    {classe.nom}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="matiere_id"
              label={<><BookOutlined /> Matière</>}
              rules={[{ required: true, message: 'Veuillez sélectionner une matière' }]}
            >
              <Select 
                placeholder="Sélectionner une matière"
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().includes(input.toLowerCase())
                }
              >
                {matieres.map(matiere => (
                  <Option key={matiere.id} value={matiere.id}>
                    {matiere.name} ({matiere.code})
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="enseignant_id"
              label={<><UserOutlined /> Enseignant</>}
              rules={[{ required: true, message: 'Veuillez sélectionner un enseignant' }]}
            >
              <Select 
                placeholder="Sélectionner un enseignant"
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().includes(input.toLowerCase())
                }
              >
                {enseignants.map(ens => (
                  <Option key={ens.id} value={ens.id}>
                    {ens.prenom} {ens.nom}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="salle_id"
              label={<><HomeOutlined /> Salle</>}
              rules={[{ required: true, message: 'Veuillez sélectionner une salle' }]}
            >
              <Select 
                placeholder="Sélectionner une salle"
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().includes(input.toLowerCase())
                }
              >
                {salles.map(salle => (
                  <Option key={salle.id} value={salle.id}>
                    {salle.nom} - {salle.type} (Capacité: {salle.capacite})
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="time_slot_id"
              label={<><ClockCircleOutlined /> Créneau horaire</>}
              rules={[{ required: true, message: 'Veuillez sélectionner un créneau' }]}
            >
              <Select placeholder="Sélectionner un créneau">
                {timeSlots.map(slot => (
                  <Option key={slot.id} value={slot.id}>
                    {slot.day_of_week} - {slot.start_time.substring(0, 5)} à {slot.end_time.substring(0, 5)}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="type_cours"
              label="Type de cours"
              rules={[{ required: true }]}
            >
              <Select>
                <Option value="Cours">Cours magistral</Option>
                <Option value="TD">Travaux Dirigés</Option>
                <Option value="TP">Travaux Pratiques</Option>
                <Option value="Examen">Examen</Option>
                <Option value="Soutien">Soutien</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="date_debut"
              label="Date de début"
              rules={[{ required: true, message: 'Veuillez sélectionner une date de début' }]}
            >
              <input type="date" style={{ width: '100%', padding: '8px', border: '1px solid #d9d9d9', borderRadius: '4px' }} />
            </Form.Item>

            <Form.Item
              name="date_fin"
              label="Date de fin (optionnelle)"
            >
              <input type="date" style={{ width: '100%', padding: '8px', border: '1px solid #d9d9d9', borderRadius: '4px' }} />
            </Form.Item>

            <Form.Item
              name="recurrence"
              label="Récurrence"
            >
              <Select>
                <Option value="unique">Unique</Option>
                <Option value="hebdomadaire">Hebdomadaire</Option>
                <Option value="bihebdomadaire">Bihebdomadaire</Option>
                <Option value="mensuelle">Mensuelle</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="notes"
              label="Notes (optionnelles)"
            >
              <input type="text" placeholder="Notes supplémentaires..." style={{ width: '100%', padding: '8px', border: '1px solid #d9d9d9', borderRadius: '4px' }} />
            </Form.Item>

            {modalMode === 'edit' && (
              <Form.Item>
                <Popconfirm
                  title="Êtes-vous sûr de vouloir supprimer cette séance ?"
                  onConfirm={() => {
                    handleDeleteSchedule(selectedSchedule.id);
                    handleModalCancel();
                  }}
                  okText="Oui"
                  cancelText="Non"
                >
                  <Button danger icon={<DeleteOutlined />} block>
                    Supprimer cette séance
                  </Button>
                </Popconfirm>
              </Form.Item>
            )}
          </Form>
        </Modal>
      </Spin>
    </div>
  );
};

// Add missing icon import
import { CalendarOutlined } from '@ant-design/icons';

export default TimetableManager;
