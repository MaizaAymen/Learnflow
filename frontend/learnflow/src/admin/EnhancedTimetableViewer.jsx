import React, { useState, useEffect } from 'react';
import { CalendarAPI } from '../services/CalendarAPI';
import './EnhancedTimetableViewer.css';

/**
 * Enhanced Timetable Viewer with Conflict Detection
 * Shows complete timetable for classes or teachers with visual conflict indicators
 */
const EnhancedTimetableViewer = () => {
  const [viewType, setViewType] = useState('class'); // 'class' or 'teacher'
  const [selectedId, setSelectedId] = useState('');
  const [timetable, setTimetable] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const api = new CalendarAPI();

  // Days and time structure
  const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const timeSlots = [
    { start: '08:00', end: '09:30' },
    { start: '09:45', end: '11:15' },
    { start: '11:30', end: '13:00' },
    { start: '14:00', end: '15:30' },
    { start: '15:45', end: '17:15' },
    { start: '17:30', end: '19:00' }
  ];

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      // Fetch classes
      const classesRes = await fetch('http://localhost:3000/api/reference/classes');
      const classesData = await classesRes.json();
      setClasses(Array.isArray(classesData) ? classesData : []);

      // Fetch teachers
      const teachersRes = await fetch('http://localhost:4000/api/auth/users?role=enseignant');
      const teachersData = await teachersRes.json();
      setTeachers(Array.isArray(teachersData) ? teachersData : []);
    } catch (err) {
      console.error('Error fetching initial data:', err);
    }
  };

  const handleViewTimetable = async () => {
    if (!selectedId) {
      setError('Veuillez sélectionner une classe ou un enseignant');
      return;
    }

    setLoading(true);
    setError('');
    setTimetable([]);

    try {
      let data;
      if (viewType === 'class') {
        data = await api.getClassTimetable(selectedId);
      } else {
        data = await api.getTeacherTimetable(selectedId);
      }
      
      setTimetable(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Erreur lors du chargement: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getCourseForSlot = (day, time) => {
    return timetable.find(course => {
      if (!course.timeSlot) return false;
      const courseStart = course.timeSlot.start_time?.substring(0, 5);
      return course.timeSlot.day_of_week === day && courseStart === time.start;
    });
  };

  const getCourseTypeColor = (type) => {
    const colors = {
      'Cours': '#3498db',
      'TD': '#9b59b6',
      'TP': '#e67e22',
      'Examen': '#e74c3c',
      'Soutien': '#27ae60'
    };
    return colors[type] || '#95a5a6';
  };

  const getSelectedName = () => {
    if (!selectedId) return '';
    if (viewType === 'class') {
      const classe = classes.find(c => c.id === parseInt(selectedId));
      return classe ? classe.name : '';
    } else {
      const teacher = teachers.find(t => t.id === parseInt(selectedId));
      return teacher ? `${teacher.prenom} ${teacher.nom}` : '';
    }
  };

  return (
    <div className="enhanced-timetable-viewer">
      <div className="viewer-header">
        <h1>📅 Emploi du Temps Complet</h1>
        <p>Visualisation complète avec détection des conflits</p>
      </div>

      <div className="viewer-controls">
        <div className="control-group">
          <label>Type de vue:</label>
          <div className="view-type-buttons">
            <button
              className={`view-btn ${viewType === 'class' ? 'active' : ''}`}
              onClick={() => {
                setViewType('class');
                setSelectedId('');
                setTimetable([]);
              }}
            >
              🏫 Par Classe
            </button>
            <button
              className={`view-btn ${viewType === 'teacher' ? 'active' : ''}`}
              onClick={() => {
                setViewType('teacher');
                setSelectedId('');
                setTimetable([]);
              }}
            >
              👨‍🏫 Par Enseignant
            </button>
          </div>
        </div>

        <div className="control-group">
          <label>
            {viewType === 'class' ? 'Sélectionner une classe:' : 'Sélectionner un enseignant:'}
          </label>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="select-input"
          >
            <option value="">-- Sélectionner --</option>
            {viewType === 'class'
              ? classes.map(classe => (
                  <option key={classe.id} value={classe.id}>
                    {classe.name}
                  </option>
                ))
              : teachers.map(teacher => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.prenom} {teacher.nom}
                  </option>
                ))
            }
          </select>
        </div>

        <button
          className="btn-load"
          onClick={handleViewTimetable}
          disabled={!selectedId || loading}
        >
          {loading ? '🔄 Chargement...' : '📊 Afficher l\'emploi du temps'}
        </button>
      </div>

      {error && (
        <div className="error-alert">
          ❌ {error}
        </div>
      )}

      {timetable.length > 0 && (
        <div className="timetable-container">
          <div className="timetable-header">
            <h2>
              Emploi du temps de: <span className="highlight">{getSelectedName()}</span>
            </h2>
            <div className="legend">
              <div className="legend-item">
                <span className="legend-color" style={{ background: '#3498db' }}></span>
                Cours
              </div>
              <div className="legend-item">
                <span className="legend-color" style={{ background: '#9b59b6' }}></span>
                TD
              </div>
              <div className="legend-item">
                <span className="legend-color" style={{ background: '#e67e22' }}></span>
                TP
              </div>
              <div className="legend-item">
                <span className="legend-color" style={{ background: '#e74c3c' }}></span>
                Examen
              </div>
              <div className="legend-item">
                <span className="legend-color" style={{ background: '#27ae60' }}></span>
                Soutien
              </div>
            </div>
          </div>

          <div className="timetable-grid-wrapper">
            <table className="timetable-grid">
              <thead>
                <tr>
                  <th className="time-column">Horaires</th>
                  {days.map(day => (
                    <th key={day}>{day}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((time, idx) => (
                  <tr key={idx}>
                    <td className="time-cell">
                      <div className="time-range">
                        <div>{time.start}</div>
                        <div className="separator">-</div>
                        <div>{time.end}</div>
                      </div>
                    </td>
                    {days.map(day => {
                      const course = getCourseForSlot(day, time);
                      return (
                        <td key={`${day}-${idx}`} className="course-cell">
                          {course ? (
                            <div
                              className="course-card"
                              style={{ 
                                borderLeft: `4px solid ${getCourseTypeColor(course.type_cours)}`,
                                background: `linear-gradient(135deg, ${getCourseTypeColor(course.type_cours)}15 0%, ${getCourseTypeColor(course.type_cours)}05 100%)`
                              }}
                            >
                              <div className="course-type-badge" style={{ background: getCourseTypeColor(course.type_cours) }}>
                                {course.type_cours}
                              </div>
                              <div className="course-name">
                                {course.matiere?.name || 'N/A'}
                              </div>
                              {viewType === 'class' && course.enseignant && (
                                <div className="course-teacher">
                                  👨‍🏫 {course.enseignant.prenom} {course.enseignant.nom}
                                </div>
                              )}
                              {viewType === 'teacher' && course.classe && (
                                <div className="course-class">
                                  🏫 {course.classe.name}
                                </div>
                              )}
                              {course.salle && (
                                <div className="course-room">
                                  🚪 {course.salle.nom}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="empty-slot">-</div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="timetable-stats">
            <div className="stat-item">
              <span className="stat-label">Total cours:</span>
              <span className="stat-value">{timetable.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Cours magistraux:</span>
              <span className="stat-value">{timetable.filter(c => c.type_cours === 'Cours').length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">TD:</span>
              <span className="stat-value">{timetable.filter(c => c.type_cours === 'TD').length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">TP:</span>
              <span className="stat-value">{timetable.filter(c => c.type_cours === 'TP').length}</span>
            </div>
          </div>
        </div>
      )}

      {!loading && timetable.length === 0 && selectedId && (
        <div className="no-data-message">
          <div className="no-data-icon">📭</div>
          <h3>Aucun cours planifié</h3>
          <p>Il n'y a pas encore de cours dans l'emploi du temps.</p>
        </div>
      )}
    </div>
  );
};

export default EnhancedTimetableViewer;
