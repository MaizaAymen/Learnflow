import React from 'react';
import { useClassSchedule } from '../services/CalendarAPI';
import { formatTime, groupSchedulesByDay, getCourseTypeColor } from '../services/CalendarAPI';
import './WeeklySchedule.css';

/**
 * WeeklySchedule Component
 * Displays the weekly schedule for a class in a calendar view
 */
const WeeklySchedule = ({ classeId, className }) => {
  const { schedule, loading, error, refresh } = useClassSchedule(classeId);

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

  const scheduleByDay = groupSchedulesByDay(schedule);
  const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

  return (
    <div className="weekly-schedule">
      <div className="schedule-header">
        <h2>📅 Planning hebdomadaire - {className || `Classe ${classeId}`}</h2>
        <button className="refresh-btn" onClick={refresh}>
          🔄 Actualiser
        </button>
      </div>

      <div className="schedule-grid">
        {days.map(day => (
          <div key={day} className="day-column">
            <div className="day-header">
              <h3>{day}</h3>
              <span className="course-count">
                {scheduleByDay[day]?.length || 0} cours
              </span>
            </div>

            <div className="day-schedule">
              {scheduleByDay[day]?.length > 0 ? (
                scheduleByDay[day].map(item => (
                  <ScheduleCard key={item.id} schedule={item} />
                ))
              ) : (
                <div className="no-classes">
                  <p>Aucun cours</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * ScheduleCard Component
 * Displays a single schedule item
 */
const ScheduleCard = ({ schedule }) => {
  const typeColor = getCourseTypeColor(schedule.type_cours);
  
  return (
    <div className={`schedule-card status-${schedule.statut}`}>
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

export default WeeklySchedule;
