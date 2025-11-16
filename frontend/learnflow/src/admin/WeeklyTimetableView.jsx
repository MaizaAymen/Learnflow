import React, { useState, useEffect, useCallback } from 'react';
import { 
  Modal, 
  Form, 
  Select, 
  Button, 
  App,
  Spin, 
  Tooltip, 
  Popconfirm, 
  Tag,
  Card,
  Alert,
  DatePicker,
  Input,
  ConfigProvider
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  LeftOutlined,
  RightOutlined,
  UserOutlined,
  HomeOutlined,
  BookOutlined,
  ClockCircleOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import './WeeklyTimetableView.css';

dayjs.extend(isBetween);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(weekOfYear);

const { Option } = Select;

const WeeklyTimetableViewContent = () => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  
  const [currentWeek, setCurrentWeek] = useState(dayjs());
  const [schedules, setSchedules] = useState([]);
  const [classes, setClasses] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [salles, setSalles] = useState([]);
  const [enseignants, setEnseignants] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [error, setError] = useState(null);
  const [draggedSchedule, setDraggedSchedule] = useState(null);

  const API_BASE = 'http://localhost:3000/api';
  const AUTH_API = 'http://localhost:4000/api';

  const defaultTimeSlots = [
    { id: 'slot-1', start: '08:00', end: '09:30', label: '08:00 - 09:30' },
    { id: 'slot-2', start: '10:45', end: '11:15', label: '10:45 - 11:15' },
    { id: 'slot-3', start: '11:30', end: '13:00', label: '11:30 - 13:00' },
    { id: 'slot-4', start: '14:00', end: '15:30', label: '14:00 - 15:30' },
    { id: 'slot-5', start: '15:45', end: '17:15', label: '15:45 - 17:15' },
    { id: 'slot-6', start: '17:30', end: '19:00', label: '17:30 - 19:00' }
  ];

  const weekDays = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

  // Mémoized callbacks pour optimiser les performances
  const fetchClasses = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/reference/classes`);
      if (!response.ok) throw new Error('Failed to fetch classes');
      const data = await response.json();
      setClasses(Array.isArray(data) ? data : []);
    } catch (error) {
      setClasses([]);
    }
  }, [API_BASE]);

  const fetchMatieres = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/reference/matieres`);
      if (!response.ok) throw new Error('Failed to fetch matieres');
      const data = await response.json();
      setMatieres(Array.isArray(data) ? data : []);
    } catch (error) {
      setMatieres([]);
    }
  }, [API_BASE]);

  const fetchSalles = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/reference/salles`);
      if (!response.ok) throw new Error('Failed to fetch salles');
      const data = await response.json();
      setSalles(Array.isArray(data) ? data : []);
    } catch (error) {
      setSalles([]);
    }
  }, [API_BASE]);

  const fetchEnseignants = useCallback(async () => {
    try {
      const response = await fetch(`${AUTH_API}/auth/users?role=enseignant`);
      if (!response.ok) throw new Error('Failed to fetch enseignants');
      const data = await response.json();
      setEnseignants(Array.isArray(data) ? data : []);
    } catch (error) {
      setEnseignants([]);
    }
  }, [AUTH_API]);

  // No longer fetching time slots from database - using defaultTimeSlots directly

  const fetchSchedules = useCallback(async () => {
    try {
      const url = selectedClass 
        ? `${API_BASE}/calendar/schedules?classe_id=${selectedClass}`
        : `${API_BASE}/calendar/schedules`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch schedules');
      const data = await response.json();
      setSchedules(Array.isArray(data) ? data : []);
    } catch (error) {
      setSchedules([]);
    }
  }, [API_BASE, selectedClass]);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchClasses(),
        fetchMatieres(),
        fetchSalles(),
        fetchEnseignants()
      ]);
      await fetchSchedules();
    } catch (error) {
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  }, [fetchClasses, fetchMatieres, fetchSalles, fetchEnseignants, fetchSchedules]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const goToPreviousWeek = () => {
    setCurrentWeek(prev => prev.subtract(1, 'week'));
  };

  const goToNextWeek = () => {
    setCurrentWeek(prev => prev.add(1, 'week'));
  };

  const goToCurrentWeek = () => {
    setCurrentWeek(dayjs());
  };

  const getWeekDates = useCallback(() => {
    const startOfWeek = currentWeek.startOf('week').add(1, 'day'); // Lundi
    return weekDays.map((day, index) => ({
      day,
      date: startOfWeek.add(index, 'day')
    }));
  }, [currentWeek]);

  const getScheduleForSlot = useCallback((day, timeSlot) => {
    const weekDates = getWeekDates();
    const dayDate = weekDates.find(d => d.day === day)?.date;
    
    if (!dayDate) return null;

    const matchingSchedule = schedules.find(schedule => {
      try {
        const startDate = schedule.date_debut ? dayjs(schedule.date_debut) : null;
        const endDate = schedule.date_fin ? dayjs(schedule.date_fin) : null;
        
        if (!startDate?.isValid()) return false;
        
        // Vérifier si la date est dans l'intervalle
        const isInRange = dayDate.isSameOrAfter(startDate, 'day') && 
                         (!endDate || !endDate.isValid() || dayDate.isSameOrBefore(endDate, 'day'));
        
        // Vérifier le jour de la semaine
        const dayMatches = schedule.day_of_week === day;
        
        if (!isInRange || !dayMatches || schedule.statut === 'annule') {
          return false;
        }
        
        // For time matching: check if schedule start time falls within this slot's time range
        const scheduleStartTime = schedule.start_time?.substring(0, 5);
        const slotStartMinutes = parseInt(timeSlot.start.split(':')[0]) * 60 + parseInt(timeSlot.start.split(':')[1]);
        const slotEndMinutes = parseInt(timeSlot.end.split(':')[0]) * 60 + parseInt(timeSlot.end.split(':')[1]);
        const scheduleStartMinutes = parseInt(scheduleStartTime.split(':')[0]) * 60 + parseInt(scheduleStartTime.split(':')[1]);
        
        // Schedule is shown in slot if its start time falls within that slot
        const timeMatches = scheduleStartMinutes >= slotStartMinutes && scheduleStartMinutes < slotEndMinutes;
        
        return timeMatches;
      } catch (error) {
        // Schedule check error - continue
        return false;
      }
    });

    return matchingSchedule || null;
  }, [schedules, getWeekDates]);

  const getCourseTypeColor = (type) => {
    const colors = {
      'Cours': '#1890ff',
      'TD': '#faad14',
      'TP': '#52c41a',
      'Examen': '#ff4d4f',
      'Soutien': '#8c8c8c'
    };
    return colors[type] || '#8c8c8c';
  };

  const handleCreateSchedule = (day, timeSlot) => {
    const weekDates = getWeekDates();
    const dayDate = weekDates.find(d => d.day === day)?.date;
    
    if (!dayDate) {
      message.error('Date invalide');
      return;
    }

    const initialValues = {
      date_debut: dayDate.format('YYYY-MM-DD'),
      classe_id: selectedClass || undefined,
      day_of_week: day,
      start_time: timeSlot.start, // HH:MM format for time input
      end_time: timeSlot.end,     // HH:MM format for time input
      type_cours: 'Cours',
      recurrence: 'unique',
      notes: ''
    };

    setModalMode('create');
    setSelectedSchedule(null);
    setModalVisible(true);
    
    setTimeout(() => {
      form.setFieldsValue(initialValues);
    }, 100);
  };

  const handleEditSchedule = (schedule) => {
    if (!schedule) return;

    // Convert time from HH:MM:SS to HH:MM for time input
    const formatTimeForInput = (time) => {
      if (!time) return time;
      return time.substring(0, 5); // Get HH:MM from HH:MM:SS
    };

    const initialValues = {
      classe_id: schedule.classe_id,
      matiere_id: schedule.matiere_id,
      salle_id: schedule.salle_id,
      enseignant_id: schedule.enseignant_id,
      day_of_week: schedule.day_of_week,
      start_time: formatTimeForInput(schedule.start_time),
      end_time: formatTimeForInput(schedule.end_time),
      date_debut: schedule.date_debut ? dayjs(schedule.date_debut) : null,
      date_fin: schedule.date_fin ? dayjs(schedule.date_fin) : null,
      type_cours: schedule.type_cours || 'Cours',
      recurrence: schedule.recurrence || 'unique',
      notes: schedule.notes || ''
    };

    setSelectedSchedule(schedule);
    setModalMode('edit');
    setModalVisible(true);
    
    setTimeout(() => {
      form.setFieldsValue(initialValues);
    }, 100);
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setSelectedSchedule(null);
    form.resetFields();
  };

  const handleModalSubmit = async () => {
    try {
      await form.validateFields();
      setLoading(true);

      const allValues = form.getFieldsValue(true);

      // Ensure time format is HH:MM:SS
      const formatTime = (time) => {
        if (!time) return time;
        // If format is HH:MM, add :00
        if (time.length === 5) return time + ':00';
        // If already HH:MM:SS, return as is
        return time;
      };

      const scheduleData = {
        ...allValues,
        start_time: formatTime(allValues.start_time),
        end_time: formatTime(allValues.end_time),
        date_debut: allValues.date_debut 
          ? (typeof allValues.date_debut === 'string' ? allValues.date_debut : allValues.date_debut.format('YYYY-MM-DD'))
          : allValues.date_debut,
        date_fin: allValues.date_fin?.format ? allValues.date_fin.format('YYYY-MM-DD') : allValues.date_fin || null
      };

      const url = modalMode === 'create' 
        ? `${API_BASE}/calendar/schedules`
        : `${API_BASE}/calendar/schedules/${selectedSchedule.id}`;
      
      const method = modalMode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scheduleData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      
      message.success(modalMode === 'create' ? 'Séance créée avec succès' : 'Séance modifiée avec succès');
      handleModalCancel();
      await fetchAllData();
      
    } catch (error) {
      // Silently handle error, show user-friendly message
      const errorMsg = error.message || 'Une erreur est survenue';
      const conflictMsg = errorMsg.includes('409') ? 'Conflit d\'horaire détecté' : errorMsg;
      message.error(conflictMsg);
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

      if (!response.ok && response.status !== 404) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      message.success('Séance supprimée avec succès');
      await fetchAllData();
    } catch (error) {
      // Silently handle errors
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (e, schedule) => {
    e.stopPropagation();
    setDraggedSchedule(schedule);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDropOnCell = async (e, day, timeSlot) => {
    e.preventDefault();
    
    if (!draggedSchedule) return;

    const weekDates = getWeekDates();
    const dayDate = weekDates.find(d => d.day === day)?.date;
    
    if (!dayDate) {
      message.error('Date invalide');
      return;
    }

    // Don't allow drop on the same cell
    if (draggedSchedule.day_of_week === day && 
        draggedSchedule.start_time?.substring(0, 5) === timeSlot.start) {
      setDraggedSchedule(null);
      return;
    }

    try {
      setLoading(true);
      
      const updateData = {
        day_of_week: day,
        start_time: timeSlot.start + ':00',
        end_time: timeSlot.end + ':00'
      };

      const response = await fetch(`${API_BASE}/calendar/schedules/${draggedSchedule.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      message.success('Séance déplacée avec succès');
      setDraggedSchedule(null);
      await fetchAllData();
    } catch (error) {
      const errorMsg = error.message || 'Erreur lors du déplacement';
      const conflictMsg = errorMsg.includes('409') ? 'Conflit d\'horaire détecté' : errorMsg;
      message.error(conflictMsg);
    } finally {
      setLoading(false);
    }
  };

  const weekDates = getWeekDates();

  if (error) {
    return (
      <div className="weekly-timetable-view">
        <Card>
          <Alert
            message="Erreur de chargement"
            description={error}
            type="error"
            showIcon
            action={
              <Button size="small" onClick={fetchAllData} icon={<ReloadOutlined />}>
                Réessayer
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="weekly-timetable-view">
      <Spin spinning={loading} tip="Chargement...">
          <Card className="weekly-header-card">
            <div className="weekly-header">
              <div className="header-content">
                <h1>📅 Emploi du Temps Hebdomadaire</h1>
                <p>Vue hebdomadaire des plannings de cours</p>
              </div>
              
              <div className="header-controls">
                <Select
                  placeholder="Filtrer par classe"
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
                <Button 
                  icon={<ReloadOutlined />} 
                  onClick={fetchAllData}
                  style={{ marginLeft: 8 }}
                >
                  Actualiser
                </Button>
              </div>
            </div>
          </Card>

          <Card className="week-navigation-card">
            <div className="week-navigation">
              <Button icon={<LeftOutlined />} onClick={goToPreviousWeek}>
                Semaine précédente
              </Button>
              
              <div className="week-info">
                <h2>Semaine {currentWeek.week()} - {currentWeek.year()}</h2>
                <p>
                  {weekDates[0]?.date.format('D MMM')} - {weekDates[5]?.date.format('D MMM YYYY')}
                </p>
              </div>
              
              <Button onClick={goToCurrentWeek}>Aujourd'hui</Button>
              
              <Button icon={<RightOutlined />} onClick={goToNextWeek}>
                Semaine suivante
              </Button>
            </div>
          </Card>

          <div className="weekly-legend">
            <Tag color="blue">Cours</Tag>
            <Tag color="orange">TD</Tag>
            <Tag color="green">TP</Tag>
            <Tag color="red">Examen</Tag>
            <Tag color="default">Soutien</Tag>
            <div className="drag-hint">💡 Glissez les cours pour les déplacer</div>
          </div>

          <Card className="timetable-card">
            <div className="weekly-grid-container">
              <div className="weekly-grid">
                <div className="grid-header">
                  <div className="time-header">Horaires</div>
                  {weekDates.map(({ day, date }) => (
                    <div key={day} className="day-header">
                      <div className="day-name">{day}</div>
                      <div className="day-date">{date.format('DD/MM')}</div>
                    </div>
                  ))}
                </div>

                {defaultTimeSlots.map((timeSlot) => (
                  <div key={timeSlot.id} className="grid-row">
                    <div className="time-cell">
                      <ClockCircleOutlined />
                      <span>{timeSlot.label}</span>
                    </div>
                    
                    {weekDays.map((day) => {
                      const schedule = getScheduleForSlot(day, timeSlot);
                      
                      return (
                        <div
                          key={`${day}-${timeSlot.id}`}
                          className={`schedule-cell ${schedule ? 'has-schedule' : 'empty-cell'} ${draggedSchedule?.id === schedule?.id ? 'dragging' : ''}`}
                          onClick={() => !schedule && handleCreateSchedule(day, timeSlot)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDropOnCell(e, day, timeSlot)}
                        >
                          {schedule ? (
                            <div
                              className="schedule-card"
                              style={{
                                borderLeft: `4px solid ${getCourseTypeColor(schedule.type_cours)}`
                              }}
                              draggable
                              onDragStart={(e) => handleDragStart(e, schedule)}
                              onDragEnd={() => setDraggedSchedule(null)}
                            >
                              <div className="schedule-header">
                                <div 
                                  className="schedule-type" 
                                  style={{ background: getCourseTypeColor(schedule.type_cours) }}
                                >
                                  {schedule.type_cours}
                                </div>
                                <div className="schedule-actions">
                                  <Tooltip title="Modifier">
                                    <Button
                                      size="small"
                                      type="text"
                                      icon={<EditOutlined />}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditSchedule(schedule);
                                      }}
                                    />
                                  </Tooltip>
                                  <Popconfirm
                                    title="Supprimer cette séance ?"
                                    description="Êtes-vous sûr de vouloir supprimer cette séance ?"
                                    onConfirm={(e) => {
                                      e?.stopPropagation();
                                      handleDeleteSchedule(schedule.id);
                                    }}
                                    onCancel={(e) => e?.stopPropagation()}
                                    okText="Oui"
                                    cancelText="Non"
                                    okType="danger"
                                  >
                                    <Tooltip title="Supprimer">
                                      <Button
                                        size="small"
                                        type="text"
                                        danger
                                        icon={<DeleteOutlined />}
                                        onClick={(e) => e.stopPropagation()}
                                      />
                                    </Tooltip>
                                  </Popconfirm>
                                </div>
                              </div>
                              
                              <div className="schedule-matiere">
                                <BookOutlined /> {schedule.matiere?.nom || schedule.matiere?.name || 'N/A'}
                              </div>
                              
                              {schedule.enseignant && (
                                <div className="schedule-enseignant">
                                  <UserOutlined /> {schedule.enseignant.prenom} {schedule.enseignant.nom}
                                </div>
                              )}
                              
                              {schedule.salle && (
                                <div className="schedule-salle">
                                  <HomeOutlined /> {schedule.salle.nom}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="empty-slot">
                              <PlusOutlined />
                              <span>Ajouter</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Modal
            title={modalMode === 'create' ? 'Créer une séance' : 'Modifier la séance'}
            open={modalVisible}
            onOk={handleModalSubmit}
            onCancel={handleModalCancel}
            width={600}
            okText={modalMode === 'create' ? 'Créer' : 'Modifier'}
            cancelText="Annuler"
            confirmLoading={loading}
          >
            <Form 
              form={form} 
              layout="vertical"
              preserve={false}
            >
              <Form.Item 
                name="classe_id" 
                label="Classe" 
                rules={[{ required: true, message: 'Veuillez sélectionner une classe' }]}
              >
                <Select placeholder="Sélectionner une classe" showSearch>
                  {classes.map(classe => (
                    <Option key={classe.id} value={classe.id}>{classe.nom}</Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item 
                name="matiere_id" 
                label="Matière" 
                rules={[{ required: true, message: 'Veuillez sélectionner une matière' }]}
              >
                <Select placeholder="Sélectionner une matière" showSearch>
                  {matieres.map(matiere => (
                    <Option key={matiere.id} value={matiere.id}>
                      {matiere.nom || matiere.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item 
                name="enseignant_id" 
                label="Enseignant" 
                rules={[{ required: true, message: 'Veuillez sélectionner un enseignant' }]}
              >
                <Select placeholder="Sélectionner un enseignant" showSearch>
                  {enseignants.map(ens => (
                    <Option key={ens.id} value={ens.id}>
                      {ens.prenom} {ens.nom}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item 
                name="salle_id" 
                label="Salle" 
                rules={[{ required: true, message: 'Veuillez sélectionner une salle' }]}
              >
                <Select placeholder="Sélectionner une salle" showSearch>
                  {salles.map(salle => (
                    <Option key={salle.id} value={salle.id}>{salle.nom}</Option>
                  ))}
                </Select>
              </Form.Item>

              {/* Hidden field for day of week */}
              <Form.Item name="day_of_week" hidden={true}>
                <Input />
              </Form.Item>
              {modalMode === 'create' && (
                <Form.Item name="date_debut" hidden={true}>
                  <Input />
                </Form.Item>
              )}

              {/* Editable time fields */}
              <Form.Item 
                name="start_time" 
                label="Heure de début" 
                rules={[{ required: true, message: 'Veuillez saisir l\'heure de début' }]}
              >
                <Input type="time" step="60" style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item 
                name="end_time" 
                label="Heure de fin" 
                rules={[{ required: true, message: 'Veuillez saisir l\'heure de fin' }]}
              >
                <Input type="time" step="60" style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item 
                name="type_cours" 
                label="Type de cours" 
                rules={[{ required: true, message: 'Veuillez sélectionner le type de cours' }]}
              >
                <Select>
                  <Option value="Cours">Cours</Option>
                  <Option value="TD">TD</Option>
                  <Option value="TP">TP</Option>
                  <Option value="Examen">Examen</Option>
                  <Option value="Soutien">Soutien</Option>
                </Select>
              </Form.Item>

              {modalMode === 'edit' && (
                <Form.Item 
                  name="date_debut" 
                  label="Date de début" 
                  rules={[{ required: true, message: 'Veuillez sélectionner une date de début' }]}
                >
                  <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                </Form.Item>
              )}

              <Form.Item name="date_fin" label="Date de fin">
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>

              <Form.Item name="recurrence" label="Récurrence">
                <Select>
                  <Option value="unique">Unique</Option>
                  <Option value="hebdomadaire">Hebdomadaire</Option>
                  <Option value="bihebdomadaire">Bihebdomadaire</Option>
                  <Option value="mensuelle">Mensuelle</Option>
                </Select>
              </Form.Item>

              <Form.Item name="notes" label="Notes">
                <Input.TextArea placeholder="Notes supplémentaires..." rows={3} />
              </Form.Item>
            </Form>
          </Modal>
        </Spin>
      </div>
    );
};

// Main wrapper with ConfigProvider and App
const WeeklyTimetableView = () => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1890ff',
        },
      }}
    >
      <App>
        <WeeklyTimetableViewContent />
      </App>
    </ConfigProvider>
  );
};

export default WeeklyTimetableView;