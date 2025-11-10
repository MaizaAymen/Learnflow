import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Badge, Calendar, Spin, message, Button, Card, Tag } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import './ClassCalendar.css';

/**
 * Calendar view for a specific class
 */
const ClassCalendar = () => {
  const { classeId } = useParams();
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState([]);
  const [classe, setClasse] = useState(null);
  const [loading, setLoading] = useState(true);

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
      setSchedules(schedulesData);

    } catch (error) {
      console.error('Error fetching data:', error);
      message.error('Erreur lors du chargement du calendrier');
    } finally {
      setLoading(false);
    }
  };

  const getListData = (value) => {
    const dateStr = value.format('YYYY-MM-DD');
    const dayOfWeek = value.format('dddd');
    
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
    
    const daySchedules = schedules.filter(schedule => {
      if (!schedule.timeSlot) return false;
      
      const startDate = new Date(schedule.date_debut);
      const endDate = schedule.date_fin ? new Date(schedule.date_fin) : null;
      const currentDate = value.toDate();
      
      const isInRange = currentDate >= startDate && (!endDate || currentDate <= endDate);
      const dayMatches = schedule.timeSlot.day_of_week === frenchDay;
      
      return isInRange && dayMatches && schedule.statut !== 'annule';
    });

    return daySchedules.map(schedule => {
      const typeColors = {
        'Cours': 'processing',
        'TD': 'warning',
        'TP': 'success',
        'Examen': 'error',
        'Soutien': 'default'
      };
      
      const matiereName = schedule.matiere?.nom || 'Cours';
      const time = schedule.timeSlot ? 
        `${schedule.timeSlot.start_time.substring(0, 5)} - ${schedule.timeSlot.end_time.substring(0, 5)}` : 
        '';
      const salleName = schedule.salle?.nom || '';
      
      return {
        type: typeColors[schedule.type_cours] || 'default',
        content: `${time} ${matiereName} ${salleName ? `(${salleName})` : ''}`.trim()
      };
    });
  };

  const dateCellRender = (value) => {
    const listData = getListData(value);
    return (
      <ul className="events" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {listData.map((item, index) => (
          <li key={index} style={{ marginBottom: '4px' }}>
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
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <Spin size="large" />
        <p style={{ marginTop: '20px' }}>Chargement du calendrier...</p>
      </div>
    );
  }

  return (
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
              📅 Calendrier - {classe?.nom || `Classe ${classeId}`}
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
        <Calendar cellRender={cellRender} />
      </Card>

      <Card style={{ marginTop: '24px', background: '#f5f5f5' }}>
        <h3>💡 Légende des couleurs</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
          <span><Badge status="processing" /> Cours</span>
          <span><Badge status="warning" /> TD (Travaux Dirigés)</span>
          <span><Badge status="success" /> TP (Travaux Pratiques)</span>
          <span><Badge status="error" /> Examen</span>
          <span><Badge status="default" /> Soutien</span>
        </div>
      </Card>
    </div>
  );
};

export default ClassCalendar;
