import React, { useState } from 'react';
import { Card, Button, message, TimePicker, InputNumber, Select, Space, Divider } from 'antd';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

/**
 * Auto-generate time slots for the week
 */
const AutoTimeSlotGenerator = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState({
    morningStart: '08:30',
    morningEnd: '13:30',
    afternoonStart: '14:30',
    afternoonEnd: '17:30',
    slotDuration: 120, // minutes
    breakBetweenSlots: 15 // minutes
  });

  const generateTimeSlots = () => {
    const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const timeSlots = [];

    days.forEach(day => {
      // Morning slots
      const morningSlots = generateSlotsForPeriod(
        config.morningStart,
        config.morningEnd,
        config.slotDuration,
        config.breakBetweenSlots,
        'Matinée'
      );
      morningSlots.forEach(slot => {
        timeSlots.push({
          day_of_week: day,
          start_time: slot.start,
          end_time: slot.end,
          description: slot.description,
          is_active: true
        });
      });

      // Afternoon slots
      const afternoonSlots = generateSlotsForPeriod(
        config.afternoonStart,
        config.afternoonEnd,
        config.slotDuration,
        config.breakBetweenSlots,
        'Après-midi'
      );
      afternoonSlots.forEach(slot => {
        timeSlots.push({
          day_of_week: day,
          start_time: slot.start,
          end_time: slot.end,
          description: slot.description,
          is_active: true
        });
      });
    });

    return timeSlots;
  };

  const generateSlotsForPeriod = (startTime, endTime, duration, breakTime, period) => {
    const slots = [];
    let currentTime = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);
    let slotNumber = 1;

    while (currentTime + duration <= endMinutes) {
      const slotStart = minutesToTime(currentTime);
      const slotEnd = minutesToTime(currentTime + duration);
      
      slots.push({
        start: slotStart,
        end: slotEnd,
        description: `Séance ${slotNumber} - ${period}`
      });

      currentTime += duration + breakTime;
      slotNumber++;
    }

    return slots;
  };

  const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const minutesToTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:00`;
  };

  const handleGenerate = async () => {
    try {
      setLoading(true);
      
      const timeSlots = generateTimeSlots();
      
      // Show preview
      console.log('Generated Time Slots:', timeSlots);
      message.info(`Génération de ${timeSlots.length} créneaux horaires...`);

      // Send to backend
      const response = await fetch('http://localhost:3000/api/calendar/timeslots/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ timeSlots })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la création');
      }

      const result = await response.json();
      message.success(`✅ ${result.length} créneaux créés avec succès!`);
      
      setTimeout(() => {
        if (window.confirm('Voulez-vous voir les créneaux créés?')) {
          navigate('/calendar/timeslots');
        }
      }, 500);

    } catch (error) {
      console.error('Error generating time slots:', error);
      message.error(error.message || 'Erreur lors de la génération');
    } finally {
      setLoading(false);
    }
  };

  const previewSlots = generateTimeSlots();
  const slotsByDay = previewSlots.reduce((acc, slot) => {
    if (!acc[slot.day_of_week]) acc[slot.day_of_week] = [];
    acc[slot.day_of_week].push(slot);
    return acc;
  }, {});

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      <Card>
        <h1 style={{ marginBottom: '24px' }}> Génération Automatique des Créneaux</h1>
        <p style={{ color: '#666', marginBottom: '24px' }}>
          Créez automatiquement des créneaux horaires pour toute la semaine (Lundi à Samedi).
        </p>

        <Card type="inner" title="⚙️ Configuration" style={{ marginBottom: '24px' }}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div>
              <h3>🌅 Horaires Matinée</h3>
              <Space>
                <div>
                  <label>Début:</label>
                  <TimePicker
                    format="HH:mm"
                    value={dayjs(config.morningStart, 'HH:mm')}
                    onChange={(time) => setConfig({...config, morningStart: time.format('HH:mm')})}
                    size="large"
                  />
                </div>
                <div>
                  <label>Fin:</label>
                  <TimePicker
                    format="HH:mm"
                    value={dayjs(config.morningEnd, 'HH:mm')}
                    onChange={(time) => setConfig({...config, morningEnd: time.format('HH:mm')})}
                    size="large"
                  />
                </div>
              </Space>
            </div>

            <div>
              <h3>🌆 Horaires Après-midi</h3>
              <Space>
                <div>
                  <label>Début:</label>
                  <TimePicker
                    format="HH:mm"
                    value={dayjs(config.afternoonStart, 'HH:mm')}
                    onChange={(time) => setConfig({...config, afternoonStart: time.format('HH:mm')})}
                    size="large"
                  />
                </div>
                <div>
                  <label>Fin:</label>
                  <TimePicker
                    format="HH:mm"
                    value={dayjs(config.afternoonEnd, 'HH:mm')}
                    onChange={(time) => setConfig({...config, afternoonEnd: time.format('HH:mm')})}
                    size="large"
                  />
                </div>
              </Space>
            </div>

            <Divider />

            <div>
              <h3>⏱️ Durée des Séances</h3>
              <Space>
                <div>
                  <label>Durée (minutes):</label>
                  <InputNumber
                    min={30}
                    max={300}
                    step={15}
                    value={config.slotDuration}
                    onChange={(value) => setConfig({...config, slotDuration: value})}
                    size="large"
                    style={{ width: '150px' }}
                  />
                </div>
                <div>
                  <label>Pause (minutes):</label>
                  <InputNumber
                    min={0}
                    max={60}
                    step={5}
                    value={config.breakBetweenSlots}
                    onChange={(value) => setConfig({...config, breakBetweenSlots: value})}
                    size="large"
                    style={{ width: '150px' }}
                  />
                </div>
              </Space>
            </div>
          </Space>
        </Card>

        <Card 
          type="inner" 
          title={`📋 Aperçu (${previewSlots.length} créneaux au total)`}
          style={{ marginBottom: '24px', maxHeight: '400px', overflow: 'auto' }}
        >
          {Object.entries(slotsByDay).map(([day, slots]) => (
            <div key={day} style={{ marginBottom: '16px' }}>
              <h4 style={{ color: '#1890ff', marginBottom: '8px' }}>{day} ({slots.length} créneaux)</h4>
              {slots.map((slot, idx) => (
                <div key={idx} style={{ 
                  padding: '8px 12px', 
                  background: '#f5f5f5', 
                  marginBottom: '4px',
                  borderRadius: '4px'
                }}>
                  <strong>{slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}</strong>
                  <span style={{ marginLeft: '12px', color: '#666' }}>
                    {slot.description}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </Card>

        <Space size="large" style={{ width: '100%' }}>
          <Button
            type="primary"
            size="large"
            loading={loading}
            onClick={handleGenerate}
            style={{ width: '250px', height: '50px', fontSize: '16px' }}
          >
            ⚡ Générer {previewSlots.length} Créneaux
          </Button>
          <Button
            size="large"
            onClick={() => navigate('/calendar/timeslots')}
            style={{ height: '50px' }}
          >
            📋 Voir les Créneaux Existants
          </Button>
          <Button
            size="large"
            onClick={() => navigate('/calendar')}
            style={{ height: '50px' }}
          >
            🏠 Retour
          </Button>
        </Space>
      </Card>

      <Card style={{ marginTop: '24px', background: '#f0f9ff' }}>
        <h3>💡 Configuration par Défaut</h3>
        <ul>
          <li><strong>Jours:</strong> Lundi à Samedi (6 jours)</li>
          <li><strong>Matinée:</strong> 08:30 - 13:30</li>
          <li><strong>Après-midi:</strong> 14:30 - 17:30</li>
          <li><strong>Durée:</strong> 2 heures (120 minutes) par séance</li>
          <li><strong>Pause:</strong> 15 minutes entre les séances</li>
          <li><strong>Total:</strong> ~4 créneaux par jour × 6 jours = ~24 créneaux</li>
        </ul>
      </Card>
    </div>
  );
};

export default AutoTimeSlotGenerator;
