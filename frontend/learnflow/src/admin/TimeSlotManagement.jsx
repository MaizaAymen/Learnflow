import React, { useState, useEffect } from 'react';
import CalendarAPI from '../services/CalendarAPI';
import './TimeSlotManagement.css';

const TimeSlotManagement = () => {
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
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
      const data = await api.getTimeSlots();
      setTimeSlots(data);
    } catch (error) {
      alert('Erreur lors du chargement des créneaux');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createTimeSlot(formData);
      alert('Créneau créé avec succès!');
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
      alert('Erreur lors de la création du créneau');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce créneau?')) return;
    
    try {
      await fetch(`http://localhost:3000/api/calendar/timeslots/${id}`, {
        method: 'DELETE'
      });
      alert('Créneau supprimé!');
      fetchTimeSlots();
    } catch (error) {
      alert('Erreur lors de la suppression');
    }
  };

  const groupedSlots = days.map(day => ({
    day,
    slots: timeSlots.filter(slot => slot.day_of_week === day)
  }));

  if (loading) return <div className="loading">Chargement...</div>;

  return (
    <div className="timeslot-management">
      <div className="header">
        <h1>🕐 Gestion des Créneaux Horaires</h1>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Fermer' : '➕ Nouveau Créneau'}
        </button>
      </div>

      {showForm && (
        <form className="timeslot-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Jour de la semaine</label>
              <select
                value={formData.day_of_week}
                onChange={(e) => setFormData({...formData, day_of_week: e.target.value})}
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
                value={formData.start_time}
                onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label>Heure de fin</label>
              <input
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Ex: Séance 1 - Matinée"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-success">✓ Créer le Créneau</button>
            <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
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
                    <div className="slot-time">
                      {slot.start_time?.substring(0, 5)} - {slot.end_time?.substring(0, 5)}
                    </div>
                    <div className="slot-desc">{slot.description || 'Sans description'}</div>
                    <button 
                      className="btn-delete" 
                      onClick={() => handleDelete(slot.id)}
                      title="Supprimer"
                    >
                      🗑️
                    </button>
                  </div>
                ))
              ) : (
                <p className="no-slots">Aucun créneau</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimeSlotManagement;
