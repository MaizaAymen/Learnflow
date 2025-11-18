import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Badge, Calendar, Spin, message, Button, Card, Tag, App, Modal, Form, Select, Input, ConfigProvider } from 'antd';
import { ArrowLeftOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import './ClassCalendar.css';

// Suppression du warning de compatibilité
const originalError = console.error;
console.error = (...args) => {
  if (args.length > 0 && typeof args[0] === 'string' && args[0].includes('antd: compatible')) {
    return;
  }
  originalError.apply(console, args);
};

/**
 * Calendar view for a specific class
 */
const ClassCalendarContent = () => {
  const { classeId } = useParams();
  const navigate = useNavigate();
  const { message: messageApi } = App.useApp();
  const [form] = Form.useForm();
  const [schedules, setSchedules] = useState([]);
  const [classe, setClasse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [salles, setSalles] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [enseignants, setEnseignants] = useState([]);
  const [draggedSchedule, setDraggedSchedule] = useState(null);

  useEffect(() => {
    if (classeId) {
      fetchData();
    }
  }, [classeId]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch class info
      const classeRes = await fetch(`http://localhost:3000/api/reference/classes/${classeId}`);
      if (classeRes.ok) {
        const classeData = await classeRes.json();
        setClasse(classeData);
      }

      // Fetch schedules for this class
      const schedulesRes = await fetch(
        `http://localhost:3000/api/calendar/schedules?classe_id=${classeId}`
      );
      if (!schedulesRes.ok) {
        throw new Error('Failed to fetch schedules');
      }
      const schedulesData = await schedulesRes.json();
      setSchedules(schedulesData || []);

      // Fetch reference data for modal
      const [sallesRes, matieresRes, enseignantsRes] = await Promise.all([
        fetch('http://localhost:3000/api/reference/salles'),
        fetch('http://localhost:3000/api/reference/matieres'),
        fetch('http://localhost:4000/api/auth/users?role=enseignant')
      ]);

      if (sallesRes.ok) setSalles(await sallesRes.json());
      if (matieresRes.ok) setMatieres(await matieresRes.json());
      if (enseignantsRes.ok) setEnseignants(await enseignantsRes.json());

    } catch (error) {
      console.error('Error fetching data:', error);
      messageApi.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const getListData = (value) => {
    // Get the day of week using getDay() for reliability (0-6, where 0 is Sunday)
    const dayIndex = value.toDate().getDay();
    const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const frenchDay = dayNames[dayIndex];
    
    const currentDate = new Date(value.toDate());
    currentDate.setHours(0, 0, 0, 0);
    const dateStr = currentDate.toISOString().split('T')[0];
    
    console.log(`\n=== Filtering for ${frenchDay} (${dateStr}) ===`);
    
    const daySchedules = (schedules || []).filter(schedule => {
      if (!schedule) return false;
      
      // Check if day of week matches (check both timeSlot and direct day_of_week field)
      const dayMatches = (schedule.timeSlot?.day_of_week === frenchDay) || 
                        (schedule.day_of_week === frenchDay);
      
      // Check if schedule is not cancelled
      const isActive = schedule.statut !== 'annule';
      
      if (!dayMatches) {
        console.log(`  ✗ Schedule ${schedule.id}: day mismatch (${schedule.day_of_week} !== ${frenchDay})`);
        return false;
      }
      
      if (!isActive) {
        console.log(`  ✗ Schedule ${schedule.id}: cancelled (${schedule.statut})`);
        return false;
      }
      
      // If no date_debut set (flexible scheduling), show the schedule for all matching days
      if (!schedule.date_debut) {
        console.log(`  ✓ Schedule ${schedule.id}: no date_debut (flexible)`);
        return true;
      }
      
      // Get the schedule's start date and recurrence pattern
      const startDate = new Date(schedule.date_debut);
      const endDate = schedule.date_fin ? new Date(schedule.date_fin) : null;
      const recurrence = schedule.recurrence || 'unique';
      
      // Normalize dates to compare just the date part
      startDate.setHours(0, 0, 0, 0);
      if (endDate) endDate.setHours(0, 0, 0, 0);
      
      // Check if current date is within the date range
      const isAfterStart = currentDate >= startDate;
      const isBeforeEnd = !endDate || currentDate <= endDate;
      
      if (!isAfterStart || !isBeforeEnd) {
        console.log(`  ✗ Schedule ${schedule.id}: outside date range (${schedule.date_debut} to ${schedule.date_fin}, checking ${dateStr})`);
        return false;
      }
      
      // Handle recurrence logic
      if (recurrence === 'unique') {
        // Show ONLY on the exact start date, not on every matching day of week
        const matches = currentDate.getTime() === startDate.getTime();
        console.log(`  ${matches ? '✓' : '✗'} Schedule ${schedule.id} (unique): date match? ${dateStr} === ${schedule.date_debut} = ${matches}`);
        return matches;
      } else if (recurrence === 'hebdomadaire') {
        // Show every week on the matching day (already filtered by dayMatches)
        console.log(`  ✓ Schedule ${schedule.id} (hebdomadaire): shows every week`);
        return true;
      } else if (recurrence === 'bihebdomadaire') {
        // Show every 2 weeks on the matching day
        const weeksDiff = Math.floor((currentDate - startDate) / (7 * 24 * 60 * 60 * 1000));
        const matches = weeksDiff % 2 === 0;
        console.log(`  ${matches ? '✓' : '✗'} Schedule ${schedule.id} (bihebdomadaire): week offset=${weeksDiff}, matches=${matches}`);
        return matches;
      } else if (recurrence === 'mensuelle') {
        // Show on the same day of month as start date
        const matches = currentDate.getDate() === startDate.getDate();
        console.log(`  ${matches ? '✓' : '✗'} Schedule ${schedule.id} (mensuelle): day of month ${currentDate.getDate()} === ${startDate.getDate()}`);
        return matches;
      }
      
      console.log(`  ✓ Schedule ${schedule.id}: default match`);
      return true;
    });

    console.log(`Found ${daySchedules.length} schedules for ${frenchDay}\n`);

    return daySchedules.map(schedule => {
      const typeColors = {
        'Cours': 'processing',
        'TD': 'warning',
        'TP': 'success',
        'Examen': 'error',
        'Soutien': 'default'
      };
      
      const matiereName = schedule.matiere?.nom || schedule.matiere?.name || 'Cours';
      const startTime = schedule.timeSlot?.start_time || schedule.start_time || '';
      const endTime = schedule.timeSlot?.end_time || schedule.end_time || '';
      const time = startTime && endTime ? 
        `${startTime.substring(0, 5)} - ${endTime.substring(0, 5)}` : 
        '';
      const salleName = schedule.salle?.nom || '';
      
      return {
        type: typeColors[schedule.type_cours] || 'default',
        content: `${time} ${matiereName} ${salleName ? `(${salleName})` : ''}`.trim(),
        schedule: schedule
      };
    });
  };

  const dateCellRender = (value) => {
    const listData = getListData(value);
    
    // Get the day of week using getDay() for reliability
    const dayIndex = value.toDate().getDay();
    const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const frenchDay = dayNames[dayIndex];

    return (
      <div
        onDragOver={handleDragOver}
        onDrop={(e) => handleDropOnDay(e, frenchDay)}
        style={{
          minHeight: '100px',
          padding: '4px',
          border: draggedSchedule ? '2px dashed #1890ff' : 'none',
          borderRadius: '4px',
          backgroundColor: draggedSchedule ? '#f0f8ff' : 'transparent'
        }}
      >
        <ul className="events" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {listData.map((item, index) => (
            <li 
              key={index} 
              style={{ 
                marginBottom: '4px', 
                cursor: 'grab',
                opacity: draggedSchedule?.id === item.schedule?.id ? 0.5 : 1,
                transition: 'opacity 0.2s',
                padding: '2px 4px',
                borderRadius: '2px',
                backgroundColor: 'white'
              }}
              draggable
              onDragStart={(e) => handleDragStart(e, item.schedule)}
              onDragEnd={handleDragEnd}
              onClick={() => handleViewSchedule(item.schedule)}
            >
              <Badge status={item.type} text={item.content} />
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const handleViewSchedule = (schedule) => {
    setSelectedSchedule(schedule);
    setModalVisible(true);
  };

  const handleDeleteSchedule = async (scheduleId) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3000/api/calendar/schedules/${scheduleId}`, {
        method: 'DELETE'
      });

      if (!response.ok && response.status !== 404) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      messageApi.success('Séance supprimée avec succès');
      setModalVisible(false);
      await fetchData();
    } catch (error) {
      console.error('Error deleting schedule:', error);
      messageApi.error('Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedSchedule(null);
    form.resetFields();
  };

  const handleDragStart = (e, schedule) => {
    e.dataTransfer.setData('text/plain', schedule.id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedSchedule(schedule);
  };

  const handleDragEnd = () => {
    setDraggedSchedule(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDropOnDay = async (e, newDay) => {
    e.preventDefault();
    
    if (!draggedSchedule) return;

    // Don't allow drop on the same day
    if (draggedSchedule.day_of_week === newDay) {
      setDraggedSchedule(null);
      return;
    }

    try {
      setLoading(true);
      
      const updateData = {
        day_of_week: newDay,
        // Conserver les autres données importantes
        time_slot_id: draggedSchedule.time_slot_id,
        classe_id: draggedSchedule.classe_id,
        matiere_id: draggedSchedule.matiere_id,
        salle_id: draggedSchedule.salle_id,
        enseignant_id: draggedSchedule.enseignant_id,
        type_cours: draggedSchedule.type_cours,
        date_debut: draggedSchedule.date_debut,
        date_fin: draggedSchedule.date_fin
      };

      const response = await fetch(`http://localhost:3000/api/calendar/schedules/${draggedSchedule.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP ${response.status}`);
      }

      const result = await response.json();
      
      messageApi.success('Séance déplacée avec succès');
      setDraggedSchedule(null);
      await fetchData();
    } catch (error) {
      console.error('Error moving schedule:', error);
      const errorMsg = error.message || 'Erreur lors du déplacement';
      const conflictMsg = errorMsg.includes('409') || errorMsg.includes('conflit') || errorMsg.includes('conflict') 
        ? 'Conflit d\'horaire détecté' 
        : 'Erreur lors du déplacement de la séance';
      messageApi.error(conflictMsg);
    } finally {
      setLoading(false);
    }
  };

  const cellRender = (current, info) => {
    if (info.type === 'date') return dateCellRender(current);
    return info.originNode;
  };

  if (loading && schedules.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <Spin size="large" />
        <p style={{ marginTop: '20px' }}>Chargement du calendrier...</p>
      </div>
    );
  }

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1890ff',
        },
      }}
    >
      <div style={{ padding: '24px' }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/calendar/classes')}
          style={{ marginBottom: '16px' }}
        >
          Retour aux Classes
        </Button>

        <Card style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ margin: 0, fontSize: '28px', color: '#1890ff' }}>
                Calendrier - {classe?.nom || `Classe ${classeId}`}
              </h1>
              {classe && (
                <div style={{ marginTop: '8px', color: '#666' }}>
                  {classe.niveau && <Tag color="blue">{classe.niveau.nom}</Tag>}
                  {classe.specialite && <Tag color="green">{classe.specialite.nom}</Tag>}
                </div>
              )}
            </div>
            <div>
              <Button
                type="primary"
                onClick={() => navigate('/calendar/create', { 
                  state: { preselectedClasseId: parseInt(classeId) } 
                })}
              >
                ➕ Créer un Planning
              </Button>
            </div>
          </div>

          <div style={{ marginTop: '16px', padding: '12px', background: '#f5f5f5', borderRadius: '8px' }}>
            <strong>Statistiques:</strong>
            <div style={{ marginTop: '8px' }}>
              <span style={{ marginRight: '20px' }}>
                📚 Total: <strong>{schedules.length}</strong> cours
              </span>
              <span style={{ marginRight: '20px' }}>
                ✅ Actifs: <strong>{schedules.filter(s => s.statut === 'confirme').length}</strong>
              </span>
              <span>
                📋 Planifiés: <strong>{schedules.filter(s => s.statut === 'planifie').length}</strong>
              </span>
            </div>
          </div>
        </Card>

        <Card>
          <Calendar 
            cellRender={cellRender}
            headerRender={({ value, type, onChange, onTypeChange }) => {
              const current = value;
              const month = current.format('MMMM YYYY');
              
              return (
                <div style={{ padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Button
                    onClick={() => {
                      const newValue = current.clone().subtract(1, 'month');
                      onChange(newValue);
                    }}
                  >
                    ‹
                  </Button>
                  <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{month}</div>
                  <Button
                    onClick={() => {
                      const newValue = current.clone().add(1, 'month');
                      onChange(newValue);
                    }}
                  >
                    ›
                  </Button>
                </div>
              );
            }}
          />
        </Card>

        <Card style={{ marginTop: '24px', background: '#f5f5f5' }}>
          <h3>💡 Légende et Instructions</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginBottom: '15px' }}>
            <span><Badge status="processing" /> Cours</span>
            <span><Badge status="warning" /> TD (Travaux Dirigés)</span>
            <span><Badge status="success" /> TP (Travaux Pratiques)</span>
            <span><Badge status="error" /> Examen</span>
            <span><Badge status="default" /> Soutien</span>
          </div>
          <div style={{ color: '#666', fontSize: '14px' }}>
            <strong>Fonctionnalités :</strong>
            <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
              <li>📅 <strong>Cliquez</strong> sur un cours pour voir les détails</li>
              <li>🔄 <strong>Glissez-déposez</strong> un cours vers un autre jour pour le déplacer</li>
              <li>🗑️ <strong>Supprimez</strong> un cours depuis la modale de détails</li>
            </ul>
          </div>
        </Card>

        <Modal
          title="Détails de la séance"
          open={modalVisible}
          onCancel={handleCloseModal}
          footer={[
            <Button key="close" onClick={handleCloseModal}>
              Fermer
            </Button>,
            <Button 
              key="delete" 
              danger
              onClick={() => {
                if (selectedSchedule) handleDeleteSchedule(selectedSchedule.id);
              }}
              icon={<DeleteOutlined />}
              loading={loading}
            >
              Supprimer
            </Button>
          ]}
        >
          <Form form={form}>
            {selectedSchedule && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <strong>Matière:</strong> {selectedSchedule.matiere?.nom || selectedSchedule.matiere?.name || 'Non spécifiée'}
              </div>
              <div>
                <strong>Enseignant:</strong> {selectedSchedule.enseignant ? `${selectedSchedule.enseignant.prenom} ${selectedSchedule.enseignant.nom}` : 'Non assigné'}
              </div>
              <div>
                <strong>Salle:</strong> {selectedSchedule.salle?.nom || 'Non assignée'}
              </div>
              <div>
                <strong>Jour:</strong> {selectedSchedule.day_of_week}
              </div>
              <div>
                <strong>Heure:</strong> {selectedSchedule.start_time?.substring(0, 5) || '--:--'} - {selectedSchedule.end_time?.substring(0, 5) || '--:--'}
              </div>
              <div>
                <strong>Type:</strong> <Tag color={
                  selectedSchedule.type_cours === 'Cours' ? 'blue' :
                  selectedSchedule.type_cours === 'TD' ? 'orange' :
                  selectedSchedule.type_cours === 'TP' ? 'green' :
                  selectedSchedule.type_cours === 'Examen' ? 'red' : 'default'
                }>
                  {selectedSchedule.type_cours}
                </Tag>
              </div>
              <div>
                <strong>Statut:</strong> <Tag color={
                  selectedSchedule.statut === 'confirme' ? 'green' :
                  selectedSchedule.statut === 'planifie' ? 'blue' :
                  selectedSchedule.statut === 'annule' ? 'red' : 'default'
                }>
                  {selectedSchedule.statut}
                </Tag>
              </div>
              <div>
                <strong>Période:</strong> {selectedSchedule.date_debut} 
                {selectedSchedule.date_fin ? ` au ${selectedSchedule.date_fin}` : ' (sans fin spécifiée)'}
              </div>
              </div>
            )}
          </Form>
        </Modal>
      </div>
    </ConfigProvider>
  );
};

// Wrapper with App provider
const ClassCalendar = () => {
  return (
    <App>
      <ClassCalendarContent />
    </App>
  );
};

export default ClassCalendar;