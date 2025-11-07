import React, { useState, useEffect } from 'react';
import { CalendarAPI } from '../services/CalendarAPI';
import './TimeSlotManagement.css';

const TimeSlotManagement = () => {
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    day_of_week: 'Lundi',
    start_time: '',
    end_time: '',
    description: '',
    is_active: true
  });

  const api = new CalendarAPI();
  const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

  useEffect(() => {
    fetchTimeSlots();
  }, []);

  const fetchTimeSlots = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.getTimeSlots();
      setTimeSlots(data || []);
    } catch (error) {
      setError('Erreur lors du chargement des créneaux: ' + error.message);
      console.error('Error fetching time slots:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!formData.start_time || !formData.end_time) {
      setError('Les heures de début et fin sont requises');
      return;
    }

    if (formData.start_time >= formData.end_time) {
      setError('L\'heure de fin doit être après l\'heure de début');
      return;
    }

    try {
      if (editingId) {
        // Update
        await api.updateTimeSlot(editingId, formData);
        alert('Créneau mis à jour avec succès!');
        setEditingId(null);
      } else {
        // Create
        await api.createTimeSlot(formData);
        alert('Créneau créé avec succès!');
      }
      
      setShowForm(false);
      setFormData({
        day_of_week: 'Lundi',
        start_time: '',
        end_time: '',
        description: '',
        is_active: true
      });
      fetchTimeSlots();
    } catch (error) {
      setError('Erreur: ' + error.message);
      console.error('Error:', error);
    }
  };

  const handleEdit = (slot) => {
    setEditingId(slot.id);
    setFormData({
      day_of_week: slot.day_of_week,
      start_time: slot.start_time || '',
      end_time: slot.end_time || '',
      description: slot.description || '',
      is_active: slot.is_active !== false
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce créneau?')) return;
    
    try {
      await api.deleteTimeSlot(id);
      alert('Créneau supprimé avec succès!');
      fetchTimeSlots();
    } catch (error) {
      alert('Erreur lors de la suppression: ' + error.message);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      day_of_week: 'Lundi',
      start_time: '',
      end_time: '',
      description: '',
      is_active: true
    });
  };

  const groupedSlots = days.map(day => ({
    day,
    slots: timeSlots.filter(slot => slot.day_of_week === day).sort((a, b) => {
      const timeA = a.start_time || '';
      const timeB = b.start_time || '';
      return timeA.localeCompare(timeB);
    })
  }));

  if (loading) return <div className="loading">⏳ Chargement des créneaux...</div>;

  return (
    <div className="timeslot-management">
      <div className="header">
        <h1>🕐 Gestion des Créneaux Horaires</h1>
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
          {showForm ? '✕ Fermer' : '➕ Nouveau Créneau'}
        </button>
      </div>

      {error && <div className="error-message">❌ {error}</div>}

      {showForm && (
        <form className="timeslot-form" onSubmit={handleSubmit}>
          <h2>{editingId ? 'Modifier le Créneau' : 'Créer un Nouveau Créneau'}</h2>
          
          <div className="form-grid">
            <div className="form-group">
              <label>Jour de la semaine</label>
              <select
                name="day_of_week"
                value={formData.day_of_week}
                onChange={handleInputChange}
                required
              >
                {days.map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Heure de début</label>
              <input
                type="time"
                name="start_time"
                value={formData.start_time}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Heure de fin</label>
              <input
                type="time"
                name="end_time"
                value={formData.end_time}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Ex: Séance 1 - Matinée"
              />
            </div>

            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                />
                Actif
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-success">
              {editingId ? '✓ Mettre à jour' : '✓ Créer le Créneau'}
            </button>
            <button type="button" className="btn-secondary" onClick={handleCancel}>
              Annuler
            </button>
          </div>
        </form>
      )}

      <div className="timeslots-grid">
        {groupedSlots.map(({ day, slots }) => (
          <div key={day} className="day-card">
            <h3>{day}</h3>
            <div className="slots-list">
              {slots.length > 0 ? (
                slots.map(slot => (
                  <div key={slot.id} className={`slot-item ${!slot.is_active ? 'inactive' : ''}`}>
                    <div className="slot-content">
                      <div className="slot-time">
                        🕐 {slot.start_time?.substring(0, 5)} - {slot.end_time?.substring(0, 5)}
                      </div>
                      <div className="slot-desc">
                        {slot.description ? `📝 ${slot.description}` : '(Sans description)'}
                      </div>
                      <div className="slot-status">
                        {slot.is_active ? '✅ Actif' : '⛔ Inactif'}
                      </div>
                    </div>
                    <div className="slot-actions">
                      <button 
                        className="btn-edit" 
                        onClick={() => handleEdit(slot)}
                        title="Modifier"
                      >
                        ✏️
                      </button>
                      <button 
                        className="btn-delete" 
                        onClick={() => handleDelete(slot.id)}
                        title="Supprimer"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-slots">Aucun créneau pour ce jour</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="stats">
        <p>Total: <strong>{timeSlots.length}</strong> créneaux | 
           Actifs: <strong>{timeSlots.filter(s => s.is_active).length}</strong> | 
           Inactifs: <strong>{timeSlots.filter(s => !s.is_active).length}</strong>
        </p>
      </div>
    </div>
  );
};

export default TimeSlotManagement;
