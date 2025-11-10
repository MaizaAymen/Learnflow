import React, { useState, useEffect } from 'react';
import { Form, Select, DatePicker, Button, message, Card, Row, Col, Input } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import './ScheduleManagement.css';

const { TextArea } = Input;

/**
 * Simple form to create course schedules for classes
 */
const CreateSchedule = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [scheduleMode, setScheduleMode] = useState('single'); // 'single' or 'recurring'
  
  // Data from API
  const [classes, setClasses] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [salles, setSalles] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);

  // Fetch all required data
  useEffect(() => {
    fetchData();
    
    // Set preselected class if provided
    if (location.state?.preselectedClasseId) {
      form.setFieldsValue({ classe_id: location.state.preselectedClasseId });
    }
  }, [location.state]);

  const fetchData = async () => {
    try {
      // Fetch classes
      const classesRes = await fetch('http://localhost:3000/api/reference/classes');
      const classesData = await classesRes.json();
      setClasses(classesData);

      // Fetch subjects
      const matieresRes = await fetch('http://localhost:3000/api/reference/matieres');
      const matieresData = await matieresRes.json();
      setMatieres(matieresData);

      // Fetch rooms
      const sallesRes = await fetch('http://localhost:3000/api/reference/salles');
      const sallesData = await sallesRes.json();
      setSalles(sallesData);

      // Fetch time slots
      const timeSlotsRes = await fetch('http://localhost:3000/api/calendar/timeslots');
      const timeSlotsData = await timeSlotsRes.json();
      setTimeSlots(timeSlotsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      message.error('Erreur lors du chargement des données');
    }
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      let scheduleData;

      if (scheduleMode === 'single') {
        // Single date mode - only this specific date
        const selectedDate = values.single_date.format('YYYY-MM-DD');
        const dayName = values.single_date.locale('fr').format('dddd');
        const dayNameCapitalized = dayName.charAt(0).toUpperCase() + dayName.slice(1);

        scheduleData = {
          time_slot_id: values.time_slot_id,
          classe_id: values.classe_id,
          matiere_id: values.matiere_id,
          salle_id: values.salle_id,
          enseignant_id: values.enseignant_id || null,
          day_of_week: dayNameCapitalized,
          date_debut: selectedDate,
          date_fin: selectedDate, // Same as start date for single occurrence
          type_cours: values.type_cours,
          recurrence: 'unique',
          statut: 'confirme',
          notes: values.notes || ''
        };
      } else {
        // Recurring mode - weekly repetition
        const endDate = values.end_date 
          ? values.end_date.format('YYYY-MM-DD')
          : values.start_date.add(6, 'month').format('YYYY-MM-DD');

        scheduleData = {
          time_slot_id: values.time_slot_id,
          classe_id: values.classe_id,
          matiere_id: values.matiere_id,
          salle_id: values.salle_id,
          enseignant_id: values.enseignant_id || null,
          day_of_week: values.day_of_week,
          date_debut: values.start_date.format('YYYY-MM-DD'),
          date_fin: endDate,
          type_cours: values.type_cours,
          recurrence: values.recurrence,
          statut: 'confirme',
          notes: values.notes || ''
        };
      }

      const response = await fetch('http://localhost:3000/api/calendar/schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scheduleData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la création');
      }

      message.success('Planning créé avec succès! 🎉');
      form.resetFields();
      
      // Ask if user wants to view calendar
      setTimeout(() => {
        if (window.confirm('Voulez-vous voir le calendrier?')) {
          navigate('/calendar/events');
        }
      }, 500);

    } catch (error) {
      console.error('Error creating schedule:', error);
      message.error(error.message || 'Erreur lors de la création du planning');
    } finally {
      setLoading(false);
    }
  };

  // Group time slots by day
  const groupedTimeSlots = timeSlots.reduce((acc, slot) => {
    if (!acc[slot.day_of_week]) {
      acc[slot.day_of_week] = [];
    }
    acc[slot.day_of_week].push(slot);
    return acc;
  }, {});

  return (
    <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
      <Card>
        <h1 style={{ marginBottom: '24px' }}>📅 Créer un Planning de Cours</h1>
        <p style={{ color: '#666', marginBottom: '24px' }}>
          Planifiez les cours pour une classe. Le cours sera visible dans le calendrier.
        </p>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            type_cours: 'Cours',
            recurrence: 'hebdomadaire',
            start_date: dayjs(),
            single_date: dayjs()
          }}
        >
          {/* Mode Selector */}
          <Card style={{ marginBottom: '24px', background: '#e6f7ff', border: '1px solid #1890ff' }}>
            <Form.Item label="Mode de Planification" style={{ marginBottom: 0 }}>
              <Select 
                value={scheduleMode} 
                onChange={setScheduleMode}
                size="large"
              >
                <Select.Option value="single">📅 Date Unique (Une seule fois)</Select.Option>
                <Select.Option value="recurring">🔄 Récurrent (Chaque semaine)</Select.Option>
              </Select>
            </Form.Item>
          </Card>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Classe"
                name="classe_id"
                rules={[{ required: true, message: 'Sélectionnez une classe' }]}
              >
                <Select
                  placeholder="Sélectionnez une classe"
                  showSearch
                  optionFilterProp="children"
                  size="large"
                >
                  {classes.map(classe => (
                    <Select.Option key={classe.id} value={classe.id}>
                      {classe.nom}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="Matière"
                name="matiere_id"
                rules={[{ required: true, message: 'Sélectionnez une matière' }]}
              >
                <Select
                  placeholder="Sélectionnez une matière"
                  showSearch
                  optionFilterProp="children"
                  size="large"
                >
                  {matieres.map(matiere => (
                    <Select.Option key={matiere.id} value={matiere.id}>
                      {matiere.nom}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Créneau Horaire"
                name="time_slot_id"
                rules={[{ required: true, message: 'Sélectionnez un créneau' }]}
              >
                <Select
                  placeholder="Sélectionnez un créneau"
                  size="large"
                >
                  {Object.entries(groupedTimeSlots).map(([day, slots]) => (
                    <Select.OptGroup key={day} label={day}>
                      {slots.map(slot => (
                        <Select.Option key={slot.id} value={slot.id}>
                          {slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}
                          {slot.description && ` (${slot.description})`}
                        </Select.Option>
                      ))}
                    </Select.OptGroup>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="Salle"
                name="salle_id"
              >
                <Select
                  placeholder="Sélectionnez une salle (optionnel)"
                  allowClear
                  size="large"
                >
                  {salles.map(salle => (
                    <Select.Option key={salle.id} value={salle.id}>
                      {salle.nom} {salle.capacite && `(${salle.capacite} places)`}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Type de Cours"
                name="type_cours"
                rules={[{ required: true, message: 'Sélectionnez un type' }]}
              >
                <Select size="large">
                  <Select.Option value="Cours">📚 Cours</Select.Option>
                  <Select.Option value="TD">📝 TD (Travaux Dirigés)</Select.Option>
                  <Select.Option value="TP">🔬 TP (Travaux Pratiques)</Select.Option>
                  <Select.Option value="Examen">📋 Examen</Select.Option>
                  <Select.Option value="Soutien">🎓 Soutien</Select.Option>
                </Select>
              </Form.Item>
            </Col>

            {scheduleMode === 'recurring' && (
              <Col xs={24} md={12}>
                <Form.Item
                  label="Récurrence"
                  name="recurrence"
                  rules={[{ required: scheduleMode === 'recurring', message: 'Sélectionnez une récurrence' }]}
                >
                  <Select size="large">
                    <Select.Option value="hebdomadaire">� Chaque semaine</Select.Option>
                    <Select.Option value="bihebdomadaire">📅 Toutes les 2 semaines</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            )}
          </Row>

          {/* Single Date Mode */}
          {scheduleMode === 'single' && (
            <Form.Item
              label="Date du Cours"
              name="single_date"
              rules={[{ required: true, message: 'Sélectionnez une date' }]}
            >
              <DatePicker
                style={{ width: '100%' }}
                size="large"
                format="DD/MM/YYYY"
                placeholder="Sélectionnez la date exacte"
              />
            </Form.Item>
          )}

          {/* Recurring Mode */}
          {scheduleMode === 'recurring' && (
            <>
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Jour de la Semaine"
                    name="day_of_week"
                    rules={[{ required: true, message: 'Sélectionnez un jour' }]}
                  >
                    <Select size="large" placeholder="Sélectionnez un jour">
                      <Select.Option value="Lundi">📅 Lundi</Select.Option>
                      <Select.Option value="Mardi">📅 Mardi</Select.Option>
                      <Select.Option value="Mercredi">📅 Mercredi</Select.Option>
                      <Select.Option value="Jeudi">📅 Jeudi</Select.Option>
                      <Select.Option value="Vendredi">📅 Vendredi</Select.Option>
                      <Select.Option value="Samedi">📅 Samedi</Select.Option>
                      <Select.Option value="Dimanche">📅 Dimanche</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    label="Date de Début"
                    name="start_date"
                    rules={[{ required: scheduleMode === 'recurring', message: 'Sélectionnez une date' }]}
                  >
                    <DatePicker
                      style={{ width: '100%' }}
                      size="large"
                      format="DD/MM/YYYY"
                      placeholder="Date de début"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="Date de Fin (optionnelle)"
                name="end_date"
              >
                <DatePicker
                  style={{ width: '100%' }}
                  size="large"
                  format="DD/MM/YYYY"
                  placeholder="Laissez vide pour 6 mois par défaut"
                />
              </Form.Item>
            </>
          )}

          <Form.Item
            label="ID Enseignant (optionnel)"
            name="enseignant_id"
          >
            <Input
              type="number"
              placeholder="Ex: 42"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Notes (optionnel)"
            name="notes"
          >
            <TextArea
              rows={3}
              placeholder="Informations supplémentaires..."
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              block
              style={{
                height: '50px',
                fontSize: '16px',
                fontWeight: 'bold',
                marginTop: '16px'
              }}
            >
              ✨ Créer le Planning
            </Button>
          </Form.Item>

          <Button
            type="default"
            onClick={() => navigate('/calendar/events')}
            size="large"
            block
          >
            👁️ Voir le Calendrier
          </Button>
        </Form>
      </Card>

      <Card style={{ marginTop: '24px', background: '#f5f5f5' }}>
        <h3>💡 Conseils</h3>
        {scheduleMode === 'single' ? (
          <ul style={{ marginBottom: 0 }}>
            <li>Mode <strong>Date Unique</strong>: Le cours aura lieu une seule fois à la date sélectionnée</li>
            <li>Parfait pour les examens, rattrapages ou cours exceptionnels</li>
            <li>Le jour de la semaine sera automatiquement détecté</li>
            <li>Les cours apparaîtront dans le calendrier avec des couleurs différentes</li>
          </ul>
        ) : (
          <ul style={{ marginBottom: 0 }}>
            <li>Mode <strong>Récurrent</strong>: Le cours sera répété chaque semaine</li>
            <li>Sélectionnez le jour de la semaine où le cours aura lieu</li>
            <li>Le cours se répétera automatiquement selon la récurrence choisie</li>
            <li>Si vous ne spécifiez pas de date de fin, le cours sera planifié pour 6 mois</li>
            <li>Vérifiez qu'il n'y a pas de conflits d'horaires</li>
          </ul>
        )}
      </Card>
    </div>
  );
};

export default CreateSchedule;
