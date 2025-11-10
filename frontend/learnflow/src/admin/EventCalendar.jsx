import React, { useState, useEffect } from 'react';
import { Badge, Calendar, Spin, message } from 'antd';
import './EventCalendar.css';

const EventCalendar = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch schedules from backend
  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/calendar/schedules');
      if (!response.ok) {
        throw new Error('Failed to fetch schedules');
      }
      const data = await response.json();
      setSchedules(data);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      message.error('Erreur lors du chargement des cours');
    } finally {
      setLoading(false);
    }
  };

  // Get events for a specific date
  const getListData = (value) => {
    const dateStr = value.format('YYYY-MM-DD');
    const dayOfWeek = value.format('dddd');
    
    // Map French day names
    const dayMap = {
      'Monday': 'Lundi',
      'Tuesday': 'Mardi',
      'Wednesday': 'Mercredi',
      'Thursday': 'Jeudi',
      'Friday': 'Vendredi',
      'Saturday': 'Samedi',
      'Sunday': 'Dimanche'
    };
    
    const frenchDay = dayMap[dayOfWeek];
    
    // Filter schedules for this date
    const daySchedules = schedules.filter(schedule => {
      if (!schedule.timeSlot) return false;
      
      const startDate = new Date(schedule.date_debut);
      const endDate = schedule.date_fin ? new Date(schedule.date_fin) : null;
      const currentDate = value.toDate();
      
      // Check if date is within schedule range
      const isInRange = currentDate >= startDate && (!endDate || currentDate <= endDate);
      
      // Check if day matches
      const dayMatches = schedule.timeSlot.day_of_week === frenchDay;
      
      return isInRange && dayMatches && schedule.statut !== 'annule';
    });

    // Convert to calendar event format
    return daySchedules.map(schedule => {
      const typeColors = {
        'Cours': 'processing',
        'TD': 'warning',
        'TP': 'success',
        'Examen': 'error',
        'Soutien': 'default'
      };
      
      const matiereName = schedule.matiere?.nom || 'Cours';
      const className = schedule.classe?.nom || '';
      const time = schedule.timeSlot ? 
        `${schedule.timeSlot.start_time.substring(0, 5)} - ${schedule.timeSlot.end_time.substring(0, 5)}` : 
        '';
      
      return {
        type: typeColors[schedule.type_cours] || 'default',
        content: `${time} ${matiereName} ${className}`.trim()
      };
    });
  };

  const dateCellRender = (value) => {
    const listData = getListData(value);
    return (
      <ul className="events">
        {listData.map((item, index) => (
          <li key={index}>
            <Badge status={item.type} text={item.content} />
          </li>
        ))}
      </ul>
    );
  };

  const cellRender = (current, info) => {
    if (info.type === 'date') return dateCellRender(current);
    return info.originNode;
  };

  if (loading) {
    return (
      <div className="event-calendar-container">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
          <p>Chargement des cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="event-calendar-container">
      <div className="event-calendar-header">
        <h1> Calendrier des Cours</h1>
        <p>Planning mensuel des cours et événements</p>
        <p style={{ fontSize: '14px', color: '#666' }}>
          Total des cours planifiés: {schedules.length}
        </p>
        {schedules.length === 0 && (
          <p style={{ fontSize: '14px', color: '#ff6b6b', marginTop: '10px' }}>
            ℹ️ Aucun cours trouvé. Veuillez créer des plannings de cours.
          </p>
        )}
      </div>
      <div className="calendar-wrapper">
        <Calendar cellRender={cellRender} />
      </div>
      <div style={{ marginTop: '20px', padding: '15px', background: '#f5f5f5', borderRadius: '8px' }}>
        <h3 style={{ marginBottom: '10px' }}>Légende des couleurs:</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
          <span><Badge status="processing" /> Cours</span>
          <span><Badge status="warning" /> TD (Travaux Dirigés)</span>
          <span><Badge status="success" /> TP (Travaux Pratiques)</span>
          <span><Badge status="error" /> Examen</span>
          <span><Badge status="default" /> Soutien</span>
        </div>
      </div>
    </div>
  );
};

export default EventCalendar;
