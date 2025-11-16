import React, { useState, useEffect } from 'react';
import { Badge, Calendar, Spin, message, Alert, Card, Button } from 'antd';
import './EventCalendar.css';

const EventCalendar = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch schedules from backend
  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('http://localhost:3000/api/calendar/schedules');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (isMounted) {
          console.log('Schedules loaded:', data);
          
          // Handle different response formats
          const schedulesData = Array.isArray(data) ? data : data.schedules || data.data || [];
          setSchedules(schedulesData);
        }
        
      } catch (error) {
        if (isMounted) {
          console.error('Error fetching schedules:', error);
          setError('Erreur lors du chargement des cours: ' + error.message);
          message.error('Erreur lors du chargement des cours');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Function to get events for a specific date with exact timing
  const getListData = (value) => {
    if (!value || !schedules.length) return [];

    try {
      const currentDate = value.toDate();
      const dateStr = value.format('YYYY-MM-DD');
      const dayOfWeek = value.format('dddd');
      
      // Map English day names to French
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
      
      console.log(`📅 Processing date: ${dateStr} (${frenchDay})`);

      // Filter schedules for this date
      const daySchedules = schedules.filter(schedule => {
        if (!schedule) return false;
        
        try {
          // First check: is schedule cancelled?
          if (schedule.statut === 'annule') return false;
          
          // Second check: does the day of week match?
          // Check both timeSlot.day_of_week and direct day_of_week field
          const scheduleDay = schedule.timeSlot?.day_of_week || schedule.day_of_week;
          
          if (!scheduleDay) {
            console.warn(`⚠️ Schedule ${schedule.id} has no day_of_week!`);
            return false;
          }
          
          const dayMatches = scheduleDay === frenchDay;
          
          if (!dayMatches) return false;
          
          // Third check: is the date within the schedule's date range?
          // If no date_debut is set, assume it's always active (recurring)
          if (!schedule.date_debut) {
            console.log(`  ✅ Schedule ${schedule.id} (${schedule.matiere?.name}): Recurring schedule (no date limit), showing for ${frenchDay}`);
            return true;
          }
          
          // If date_debut is set, check the date range
          const startDate = new Date(schedule.date_debut);
          const endDate = schedule.date_fin ? new Date(schedule.date_fin) : null;
          
          if (isNaN(startDate.getTime())) return false;
          
          // Normalize dates to compare just the date part
          startDate.setHours(0, 0, 0, 0);
          if (endDate) endDate.setHours(0, 0, 0, 0);
          currentDate.setHours(0, 0, 0, 0);
          
          const isInRange = currentDate >= startDate && (!endDate || currentDate <= endDate);
          
          if (isInRange) {
            console.log(`  ✅ Schedule ${schedule.id} (${schedule.matiere?.name}): Within date range [${schedule.date_debut} to ${schedule.date_fin || 'no end'}]`);
          } else {
            console.log(`  ❌ Schedule ${schedule.id} (${schedule.matiere?.name}): Out of date range [${schedule.date_debut} to ${schedule.date_fin || 'no end'}]`);
          }
          
          return isInRange;
        } catch (dateError) {
          console.warn('Error filtering schedule:', schedule, dateError);
          return false;
        }
      });

      console.log(`Found ${daySchedules.length} schedules for ${frenchDay}`);

      // Sort schedules by start time
      const sortedSchedules = daySchedules.sort((a, b) => {
        const timeA = a.timeSlot?.start_time || a.start_time || '00:00';
        const timeB = b.timeSlot?.start_time || b.start_time || '00:00';
        return timeA.localeCompare(timeB);
      });

      // Convert to calendar event format
      return sortedSchedules.map((schedule, index) => {
        const typeColors = {
          'Cours': 'processing',
          'TD': 'warning',
          'TP': 'success', 
          'Examen': 'error',
          'Soutien': 'default'
        };
        
        const matiereName = schedule.matiere?.name || schedule.matiere?.nom || schedule.matiere_name || 'Cours';
        const className = schedule.classe?.nom || schedule.classe_nom || schedule.class_name || '';
        const startTime = schedule.timeSlot?.start_time || schedule.start_time || '';
        const endTime = schedule.timeSlot?.end_time || schedule.end_time || '';
        const time = startTime && endTime ? 
          `${startTime.substring(0, 5)} - ${endTime.substring(0, 5)}` : 
          'Time not specified';
        
        const courseType = schedule.type_cours || 'Cours';
        const teacherName = schedule.enseignant ? 
          `${schedule.enseignant.nom || ''} ${schedule.enseignant.prenom || ''}`.trim() : 
          '';
        
        const fullContent = `${time} - ${matiereName}${className ? ` - ${className}` : ''}${teacherName ? ` - ${teacherName}` : ''}`;
        
        return {
          type: typeColors[courseType] || 'default',
          content: fullContent,
          startTime: startTime,
          schedule: schedule
        };
      });
    } catch (error) {
      console.error('Error in getListData:', error);
      return [];
    }
  };

  const dateCellRender = (value) => {
    try {
      const listData = getListData(value);
      
      if (listData.length === 0) {
        return null;
      }

      return (
        <ul className="events" style={{ padding: 0, margin: 0, listStyle: 'none' }}>
          {listData.map((item, index) => (
            <li 
              key={index} 
              style={{ 
                marginBottom: '3px',
                padding: '2px 4px',
                borderRadius: '3px',
                backgroundColor: '#f8f9fa',
                borderLeft: `3px solid ${
                  item.type === 'processing' ? '#1890ff' :
                  item.type === 'warning' ? '#faad14' :
                  item.type === 'success' ? '#52c41a' :
                  item.type === 'error' ? '#ff4d4f' : '#d9d9d9'
                }`
              }}
            >
              <Badge 
                status={item.type} 
                text={
                  <span 
                    style={{ 
                      fontSize: '10px',
                      lineHeight: '1.2',
                      fontWeight: '500'
                    }}
                    title={item.content}
                  >
                    {item.content}
                  </span>
                } 
              />
            </li>
          ))}
        </ul>
      );
    } catch (error) {
      console.error('Error in dateCellRender:', error);
      return null;
    }
  };

  const cellRender = (current, info) => {
    if (info.type === 'date') {
      return dateCellRender(current);
    }
    return info.originNode;
  };

  if (loading) {
    return (
      <div className="event-calendar-container">
        <Card>
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" />
            <p style={{ marginTop: '16px' }}>Chargement des cours...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="event-calendar-container">
        <Card>
          <Alert
            message="Erreur de chargement"
            description={error}
            type="error"
            showIcon
            action={
              <Button size="small" onClick={() => window.location.reload()}>
                Réessayer
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="event-calendar-container">
      <Card>
        <div className="event-calendar-header">
          <h1>Calendrier des Cours</h1>
          <p>Planning des cours avec horaires spécifiques</p>
          <div style={{ marginTop: '10px' }}>
            <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
              <strong>Total des cours planifiés:</strong> {schedules.length}
            </p>
            {schedules.length > 0 && (
              <p style={{ fontSize: '12px', color: '#999', margin: '5px 0 0 0' }}>
                Les cours sont affichés à leurs dates et heures exactes
              </p>
            )}
          </div>
        </div>

        {schedules.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Alert
              message="Aucun cours trouvé"
              description="Veuillez créer des plannings de cours pour les afficher dans le calendrier."
              type="info"
              showIcon
            />
          </div>
        ) : (
          <>
            <div className="calendar-wrapper">
              <Calendar 
                cellRender={cellRender}
                style={{ padding: '20px 0' }}
                headerRender={({ value, type, onChange, onTypeChange }) => (
                  <div style={{ padding: '10px', textAlign: 'center' }}>
                    <h3 style={{ margin: 0, color: '#1890ff' }}>
                      {value.format('MMMM YYYY')}
                    </h3>
                  </div>
                )}
              />
            </div>
            
            <div style={{ 
              marginTop: '20px', 
              padding: '15px', 
              background: '#f8f9fa', 
              borderRadius: '8px',
              border: '1px solid #e8e8e8'
            }}>
              <h3 style={{ marginBottom: '12px', fontSize: '16px' }}>Légende des couleurs:</h3>
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '20px',
                fontSize: '14px'
              }}>
                <span><Badge status="processing" /> Cours</span>
                <span><Badge status="warning" /> TD (Travaux Dirigés)</span>
                <span><Badge status="success" /> TP (Travaux Pratiques)</span>
                <span><Badge status="error" /> Examen</span>
                <span><Badge status="default" /> Soutien</span>
              </div>
              <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
                <p><strong>Format:</strong> Heure - Matière - Classe - Enseignant</p>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default EventCalendar;