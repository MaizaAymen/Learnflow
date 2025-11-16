import React, { useState, useEffect } from 'react';
import { CalendarAPI } from '../services/CalendarAPI';
import './ScheduleManagement.css';

const ScheduleManagementComplete = () => {
  const [schedules, setSchedules] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [rooms, setRooms] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [activeTab, setActiveTab] = useState('list'); // 'list' or 'calendar'
  
  const [formData, setFormData] = useState({
    time_slot_id: '',
    classe_id: '',
    matiere_id: '',
    salle_id: '',
    enseignant_id: '',
    date_debut: new Date().toISOString().split('T')[0],
    date_fin: '',
    type_cours: 'Cours',
    recurrence: 'unique',
    notes: '',
    statut: 'planifie'
  });
  
  const [conflicts, setConflicts] = useState(null);
  const [checkingConflicts, setCheckingConflicts] = useState(false);
  const [teachers, setTeachers] = useState([]);

  const api = new CalendarAPI();
  const courseTypes = ['Cours', 'TD', 'TP', 'Examen', 'Soutien'];
  const recurrenceTypes = ['unique', 'quotidien', 'hebdomadaire', 'bihebdomadaire', 'mensuel'];
  const statusTypes = ['planifie', 'confirme', 'annule', 'termine'];

  // Fetch all data
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch schedules
      const schedulesData = await api.getSchedules();
      setSchedules(Array.isArray(schedulesData) ? schedulesData : []);

      // Fetch time slots
      const timeSlotsData = await api.getTimeSlots();
      setTimeSlots(Array.isArray(timeSlotsData) ? timeSlotsData : []);

      // Fetch classes (from reference API)
      try {
        const classesRes = await fetch('http://localhost:3000/api/reference/classes');
        const classesData = await classesRes.json();
        setClasses(Array.isArray(classesData) ? classesData : []);
      } catch (err) {
        console.warn('Could not fetch classes:', err);
      }

      // Fetch subjects (from reference API)
      try {
        const subjectsRes = await fetch('http://localhost:3000/api/reference/matieres');
        const subjectsData = await subjectsRes.json();
        setSubjects(Array.isArray(subjectsData) ? subjectsData : []);
      } catch (err) {
        console.warn('Could not fetch subjects:', err);
      }

      // Fetch rooms (from reference API)
      try {
        const roomsRes = await fetch('http://localhost:3000/api/reference/salles');
        const roomsData = await roomsRes.json();
        setRooms(Array.isArray(roomsData) ? roomsData : []);
      } catch (err) {
        console.warn('Could not fetch rooms:', err);
      }

      // Fetch teachers (from auth service)
      try {
        const teachersRes = await fetch('http://localhost:4000/api/auth/users?role=enseignant');
        const teachersData = await teachersRes.json();
        setTeachers(Array.isArray(teachersData) ? teachersData : []);
      } catch (err) {
        console.warn('Could not fetch teachers:', err);
      }
    } catch (err) {
      setError('Erreur lors du chargement des données: ' + err.message);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear conflicts when form changes
    if (conflicts) setConflicts(null);
  };

  const handleCheckConflicts = async () => {
    if (!formData.time_slot_id || !formData.classe_id || !formData.matiere_id) {
      setError('Veuillez remplir au moins: créneau, classe et matière');
      return;
    }

    setCheckingConflicts(true);
    setError('');
    setConflicts(null);

    try {
      const result = await api.checkConflicts(formData);
      
      if (result.hasConflicts) {
        setConflicts(result.conflicts);
        setError('⚠️ Des conflits ont été détectés!');
      } else {
        setConflicts([]);
        alert('✅ Aucun conflit détecté! Vous pouvez créer ce planning.');
      }
    } catch (err) {
      setError('Erreur lors de la vérification: ' + err.message);
    } finally {
      setCheckingConflicts(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setConflicts(null);

    // Validation
    if (!formData.time_slot_id || !formData.classe_id || !formData.matiere_id) {
      setError('Le créneau, la classe et la matière sont requis');
      return;
    }

    try {
      if (editingId) {
        await api.updateSchedule(editingId, formData);
        alert('✅ Planning mis à jour avec succès!');
        setEditingId(null);
      } else {
        await api.createSchedule(formData);
        alert('✅ Planning créé avec succès!');
      }
      
      setShowForm(false);
      setFormData({
        time_slot_id: '',
        classe_id: '',
        matiere_id: '',
        salle_id: '',
        enseignant_id: '',
        date_debut: new Date().toISOString().split('T')[0],
        date_fin: '',
        type_cours: 'Cours',
        recurrence: 'unique',
        notes: '',
        statut: 'planifie'
      });
      fetchAllData();
    } catch (err) {
      if (err.type === 'conflict') {
        setConflicts(err.conflicts || [{ type: err.target, message: err.message }]);
        setError('⚠️ CONFLIT DÉTECTÉ: ' + err.message);
      } else {
        setError('❌ Erreur: ' + err.message);
      }
      console.error('Error:', err);
    }
  };

  const handleEdit = (schedule) => {
    setEditingId(schedule.id);
    setFormData({
      time_slot_id: schedule.time_slot_id || '',
      classe_id: schedule.classe_id || '',
      matiere_id: schedule.matiere_id || '',
      salle_id: schedule.salle_id || '',
      enseignant_id: schedule.enseignant_id || '',
      date_debut: schedule.date_debut || new Date().toISOString().split('T')[0],
      date_fin: schedule.date_fin || '',
      type_cours: schedule.type_cours || 'Cours',
      recurrence: schedule.recurrence || 'unique',
      notes: schedule.notes || '',
      statut: schedule.statut || 'planifie'
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce planning?')) return;

    try {
      await api.deleteSchedule(id);
      alert('Planning supprimé avec succès!');
      fetchAllData();
    } catch (err) {
      alert('Erreur lors de la suppression: ' + err.message);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      time_slot_id: '',
      classe_id: '',
      matiere_id: '',
      salle_id: '',
      enseignant_id: '',
      date_debut: new Date().toISOString().split('T')[0],
      date_fin: '',
      type_cours: 'Cours',
      recurrence: 'unique',
      notes: '',
      statut: 'planifie'
    });
  };

  const getTimeSlotDisplay = (id) => {
    const slot = timeSlots.find(t => t.id === id);
    if (slot) {
      return `${slot.day_of_week} ${slot.start_time?.substring(0, 5)} - ${slot.end_time?.substring(0, 5)}`;
    }
    return 'Créneau non trouvé';
  };

  const getClassDisplay = (id) => {
    const classe = classes.find(c => c.id === id);
    return classe ? classe.name : 'Classe non trouvée';
  };

  const getSubjectDisplay = (id) => {
    const subject = subjects.find(s => s.id === id);
    return subject ? subject.name : 'Matière non trouvée';
  };

  const getRoomDisplay = (id) => {
    if (!id) return '-';
    const room = rooms.find(r => r.id === id);
    return room ? room.nom : 'Salle non trouvée';
  };

  const getStatusColor = (status) => {
    const colors = {
      planifie: '#ffc107',
      confirme: '#28a745',
      annule: '#dc3545',
      termine: '#17a2b8'
    };
    return colors[status] || '#6c757d';
  };

  if (loading) return <div className="loading">⏳ Chargement des données...</div>;

  return (
    <div className="schedule-management-complete">
      <div className="header">
        <h1>📅 Gestion des Plannings</h1>
        <div className="header-actions">
          <div className="tab-buttons">
            <button
              className={`tab-btn ${activeTab === 'list' ? 'active' : ''}`}
              onClick={() => setActiveTab('list')}
            >
              📋 Liste
            </button>
            <button
              className={`tab-btn ${activeTab === 'calendar' ? 'active' : ''}`}
              onClick={() => setActiveTab('calendar')}
            >
              📅 Calendrier
            </button>
          </div>
          <button 
            className="btn-primary" 
            onClick={() => {
              if (showForm) {
                handleCancel();
              } else {
                setShowForm(true);
              }
            }}
          >
            {showForm ? '✕ Fermer' : '➕ Nouveau Planning'}
          </button>
        </div>
      </div>

      {error && <div className="error-message">❌ {error}</div>}

      {showForm && (
        <form className="schedule-form" onSubmit={handleSubmit}>
          <h2>{editingId ? 'Modifier le Planning' : 'Créer un Nouveau Planning'}</h2>
          
          <div className="form-grid">
            <div className="form-group">
              <label>Créneau Horaire *</label>
              <select
                name="time_slot_id"
                value={formData.time_slot_id}
                onChange={handleInputChange}
                required
              >
                <option value="">-- Sélectionner --</option>
                {timeSlots.map(slot => (
                  <option key={slot.id} value={slot.id}>
                    {slot.day_of_week} {slot.start_time?.substring(0, 5)} - {slot.end_time?.substring(0, 5)}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Classe *</label>
              <select
                name="classe_id"
                value={formData.classe_id}
                onChange={handleInputChange}
                required
              >
                <option value="">-- Sélectionner --</option>
                {classes.map(classe => (
                  <option key={classe.id} value={classe.id}>
                    {classe.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Matière *</label>
              <select
                name="matiere_id"
                value={formData.matiere_id}
                onChange={handleInputChange}
                required
              >
                <option value="">-- Sélectionner --</option>
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Salle</label>
              <select
                name="salle_id"
                value={formData.salle_id}
                onChange={handleInputChange}
              >
                <option value="">-- Optionnel --</option>
                {rooms.map(room => (
                  <option key={room.id} value={room.id}>
                    {room.nom}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Enseignant</label>
              <select
                name="enseignant_id"
                value={formData.enseignant_id}
                onChange={handleInputChange}
              >
                <option value="">-- Optionnel --</option>
                {teachers.map(teacher => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.prenom} {teacher.nom}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Date de Début</label>
              <input
                type="date"
                name="date_debut"
                value={formData.date_debut}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>Date de Fin</label>
              <input
                type="date"
                name="date_fin"
                value={formData.date_fin}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>Type de Cours</label>
              <select
                name="type_cours"
                value={formData.type_cours}
                onChange={handleInputChange}
              >
                {courseTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Récurrence</label>
              <select
                name="recurrence"
                value={formData.recurrence}
                onChange={handleInputChange}
              >
                {recurrenceTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Statut</label>
              <select
                name="statut"
                value={formData.statut}
                onChange={handleInputChange}
              >
                {statusTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="form-group full-width">
              <label>Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Notes supplémentaires..."
                rows="3"
              />
            </div>
          </div>

          {conflicts && conflicts.length > 0 && (
            <div className="conflicts-alert">
              <h3>⚠️ Conflits Détectés:</h3>
              <ul>
                {conflicts.map((conflict, idx) => (
                  <li key={idx} className={`conflict-${conflict.type}`}>
                    <strong>{conflict.type === 'salle' ? '🏫 Salle' : conflict.type === 'enseignant' ? '👨‍🏫 Enseignant' : '👥 Groupe'}:</strong>
                    <br />
                    {conflict.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {conflicts && conflicts.length === 0 && (
            <div className="no-conflicts-alert">
              ✅ Aucun conflit - Prêt à créer!
            </div>
          )}

          <div className="form-actions">
            <button 
              type="button" 
              className="btn-info"
              onClick={handleCheckConflicts}
              disabled={checkingConflicts}
            >
              {checkingConflicts ? '🔄 Vérification...' : '🔍 Vérifier les Conflits'}
            </button>
            <button type="submit" className="btn-success">
              {editingId ? '✓ Mettre à jour' : '✓ Créer le Planning'}
            </button>
            <button type="button" className="btn-secondary" onClick={handleCancel}>
              Annuler
            </button>
          </div>
        </form>
      )}

      {activeTab === 'list' && (
        <div className="schedules-list">
          {schedules.length > 0 ? (
            <table className="schedules-table">
              <thead>
                <tr>
                  <th>Créneau</th>
                  <th>Classe</th>
                  <th>Matière</th>
                  <th>Salle</th>
                  <th>Type</th>
                  <th>Dates</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map(schedule => (
                  <tr key={schedule.id} className={`status-${schedule.statut}`}>
                    <td>{getTimeSlotDisplay(schedule.time_slot_id)}</td>
                    <td>{getClassDisplay(schedule.classe_id)}</td>
                    <td>{getSubjectDisplay(schedule.matiere_id)}</td>
                    <td>{getRoomDisplay(schedule.salle_id)}</td>
                    <td>{schedule.type_cours}</td>
                    <td>
                      {schedule.date_debut}
                      {schedule.date_fin && ` à ${schedule.date_fin}`}
                    </td>
                    <td>
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(schedule.statut) }}
                      >
                        {schedule.statut}
                      </span>
                    </td>
                    <td className="actions">
                      <button
                        className="btn-edit"
                        onClick={() => handleEdit(schedule)}
                        title="Modifier"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(schedule.id)}
                        title="Supprimer"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="no-data">Aucun planning créé. Créez-en un avec le bouton ci-dessus.</div>
          )}
        </div>
      )}

      {activeTab === 'calendar' && schedules.length > 0 && (
        <div className="calendar-view">
          <h2>📅 Vue Calendrier des Plannings</h2>
          <div className="calendar-schedule-view">
            <table className="schedules-table">
              <thead>
                <tr>
                  <th>Créneau</th>
                  <th>Classe</th>
                  <th>Matière</th>
                  <th>Type</th>
                  <th>Dates</th>
                  <th>Salle</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map(schedule => (
                  <tr key={schedule.id} className={`status-${schedule.statut}`}>
                    <td>
                      {timeSlots.find(t => t.id === schedule.time_slot_id)?.day_of_week}{' '}
                      {timeSlots.find(t => t.id === schedule.time_slot_id)?.start_time?.substring(0, 5)} 
                      {' '}-{' '}
                      {timeSlots.find(t => t.id === schedule.time_slot_id)?.end_time?.substring(0, 5)}
                    </td>
                    <td>{getClassDisplay(schedule.classe_id)}</td>
                    <td>{getSubjectDisplay(schedule.matiere_id)}</td>
                    <td>{schedule.type_cours}</td>
                    <td>
                      {schedule.date_debut}
                      {schedule.date_fin && ` → ${schedule.date_fin}`}
                    </td>
                    <td>{getRoomDisplay(schedule.salle_id)}</td>
                    <td>
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(schedule.statut) }}
                      >
                        {schedule.statut}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="stats">
        <p>
          Total: <strong>{schedules.length}</strong> plannings |
          Planifiés: <strong>{schedules.filter(s => s.statut === 'planifie').length}</strong> |
          Confirmés: <strong>{schedules.filter(s => s.statut === 'confirme').length}</strong> |
          Annulés: <strong>{schedules.filter(s => s.statut === 'annule').length}</strong>
        </p>
      </div>
    </div>
  );
};

export default ScheduleManagementComplete;
