import React, { useState, useCallback } from 'react';
import { useClassSchedule, formatTime, groupSchedulesByDay, getCourseTypeColor } from '../services/CalendarAPI';
import { CalendarAPI } from '../services/CalendarAPI';
import './DragDropSchedule.css';

/**
 * DragDropSchedule Component
 * Enhanced weekly schedule with drag-and-drop functionality
 */
const DragDropSchedule = ({ classeId, className }) => {
  const { schedule, loading, error, refresh } = useClassSchedule(classeId);
  const [draggedSchedule, setDraggedSchedule] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [notification, setNotification] = useState(null);
  const api = new CalendarAPI();

  const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const scheduleByDay = groupSchedulesByDay(schedule);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleDragStart = useCallback((e, scheduleItem) => {
    setDraggedSchedule(scheduleItem);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('scheduleId', scheduleItem.id);
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
  };

  const handleDrop = useCallback(async (e, targetDay) => {
    e.preventDefault();
    
    if (!draggedSchedule) return;

    const sourceDay = draggedSchedule.timeSlot.day_of_week;
    
    // If dropped on the same day, no need to update
    if (sourceDay === targetDay) {
      setDraggedSchedule(null);
      return;
    }

    setUpdating(true);

    try {
      // Find a time slot for the target day
      const targetTimeSlot = await findAvailableTimeSlot(targetDay);
      
      if (!targetTimeSlot) {
        showNotification('Aucun créneau disponible pour ce jour', 'error');
        setUpdating(false);
        return;
      }

      // Update the schedule with the new time slot
      const response = await api.updateSchedule(draggedSchedule.id, {
        time_slot_id: targetTimeSlot.id,
        date_debut: draggedSchedule.date_debut,
        date_fin: draggedSchedule.date_fin
      });

      if (response.data) {
        showNotification(`Cours déplacé de ${sourceDay} à ${targetDay}`, 'success');
        refresh();
      } else if (response.error) {
        showNotification(`Erreur: ${response.error}`, 'error');
      }
    } catch (err) {
      showNotification(`Erreur lors du déplacement: ${err.message}`, 'error');
    } finally {
      setUpdating(false);
      setDraggedSchedule(null);
    }
  }, [draggedSchedule, refresh, api]);

  const findAvailableTimeSlot = async (day) => {
    try {
      const timeSlots = await api.getTimeSlots({ 
        day_of_week: day, 
        is_active: true 
      });
      
      if (timeSlots && timeSlots.length > 0) {
        // Return the first available time slot for that day
        return timeSlots[0];
      }
      return null;
    } catch (err) {
      console.error('Error fetching time slots:', err);
      return null;
    }
  };

  if (loading) {
    return (
      <div className="schedule-loading">
        <div className="spinner"></div>
        <p>Chargement du planning...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="schedule-error">
        <p>❌ Erreur: {error}</p>
        <button onClick={refresh}>Réessayer</button>
      </div>
    );
  }

  return (
    <div className="drag-drop-schedule">
      <div className="schedule-header">
        <h2>📅 Planning hebdomadaire - {className || `Classe ${classeId}`}</h2>
        <div className="header-controls">
          <span className={`drag-hint ${draggedSchedule ? 'active' : ''}`}>
            {draggedSchedule ? '🎯 Déposez le cours ici' : '💡 Glissez-déposez les cours'}
          </span>
          <button 
            className="refresh-btn" 
            onClick={refresh}
            disabled={updating}
          >
            {updating ? '⏳ Mise à jour...' : '🔄 Actualiser'}
          </button>
        </div>
      </div>

      {notification && (
        <div className={`notification notification-${notification.type}`}>
          {notification.message}
        </div>
      )}

      <div className="schedule-grid drag-drop-grid">
        {days.map(day => (
          <div 
            key={day} 
            className={`day-column ${draggedSchedule?.timeSlot?.day_of_week === day ? 'source-day' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, day)}
          >
            <div className="day-header">
              <h3>{day}</h3>
              <span className="course-count">
                {scheduleByDay[day]?.length || 0} cours
              </span>
            </div>

            <div className={`day-schedule ${draggedSchedule ? 'drag-active' : ''}`}>
              {scheduleByDay[day]?.length > 0 ? (
                scheduleByDay[day].map(item => (
                  <DragDropScheduleCard 
                    key={item.id} 
                    schedule={item}
                    isDragging={draggedSchedule?.id === item.id}
                    onDragStart={handleDragStart}
                  />
                ))
              ) : (
                <div className="no-classes">
                  <p>Aucun cours</p>
                  <span className="drop-zone-hint">↓ Déposez ici ↓</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="schedule-info">
        <p>💡 Conseil: Glissez un cours vers un autre jour pour le déplacer</p>
      </div>
    </div>
  );
};

/**
 * DragDropScheduleCard Component
 * Individual schedule card with drag functionality
 */
const DragDropScheduleCard = ({ schedule, isDragging, onDragStart }) => {
  const typeColor = getCourseTypeColor(schedule.type_cours);
  
  return (
    <div 
      className={`schedule-card status-${schedule.statut} ${isDragging ? 'dragging' : ''}`}
      draggable
      onDragStart={(e) => onDragStart(e, schedule)}
    >
      <div className="drag-handle">⋮⋮</div>
      
      <div className="card-header">
        <span className="time">
          {formatTime(schedule.timeSlot.start_time)} - {formatTime(schedule.timeSlot.end_time)}
        </span>
        <span className={`badge badge-${typeColor}`}>
          {schedule.type_cours}
        </span>
      </div>

      <div className="card-body">
        <h4 className="matiere-name">📚 {schedule.matiere.name}</h4>
        
        {schedule.salle && (
          <p className="salle-info">
            🏫 {schedule.salle.nom}
          </p>
        )}

        {schedule.enseignant_id && (
          <p className="teacher-info">
            👨‍🏫 Enseignant ID: {schedule.enseignant_id}
          </p>
        )}

        {schedule.notes && (
          <p className="notes">
            📝 {schedule.notes}
          </p>
        )}
      </div>

      <div className="card-footer">
        <span className={`status-badge status-${schedule.statut}`}>
          {getStatusLabel(schedule.statut)}
        </span>
      </div>
    </div>
  );
};

/**
 * Get human-readable status label
 */
const getStatusLabel = (status) => {
  const labels = {
    planifie: '⏰ Planifié',
    confirme: '✅ Confirmé',
    annule: '❌ Annulé',
    termine: '✓ Terminé'
  };
  return labels[status] || status;
};

export default DragDropSchedule;
