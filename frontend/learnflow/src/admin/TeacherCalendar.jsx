import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Badge,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  TimePicker,
  Tabs,
  Card,
  Row,
  Col,
  Tag,
  Divider,
  Empty,
  Spin,
  message,
  Checkbox,
  Space
} from 'antd';
import {
  ClockCircleOutlined,
  EnvironmentOutlined,
  UserOutlined,
  BookOutlined,
  PlusOutlined,
  CalendarOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import './TeacherCalendar.css';

dayjs.extend(isBetween);

const TeacherCalendar = () => {
  const [schedules, setSchedules] = useState([]);
  const [absences, setAbsences] = useState([]);
  const [rattrapages, setRattrapages] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [absenceModalVisible, setAbsenceModalVisible] = useState(false);
  const [rattrapageModalVisible, setRattrapageModalVisible] = useState(false);
  const [filterSubject, setFilterSubject] = useState(null);
  const [form] = Form.useForm();
  const [absenceForm] = Form.useForm();
  const [rattrapageForm] = Form.useForm();

  // Fetch data on mount
  useEffect(() => {
    fetchTeacherData();
  }, []);

  const fetchTeacherData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('Not authenticated');
        setLoading(false);
        return;
      }

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      const [schedulesRes, absencesRes, rattrapagesRes, subjectsRes] = await Promise.all([
        fetch('http://localhost:3000/api/teacher/schedules', { headers, credentials: 'include' }),
        fetch('http://localhost:3000/api/teacher/absences', { headers, credentials: 'include' }),
        fetch('http://localhost:3000/api/teacher/rattrapages', { headers, credentials: 'include' }),
        fetch('http://localhost:3000/api/teacher/subjects', { headers, credentials: 'include' })
      ]);

      if (schedulesRes.ok) setSchedules(await schedulesRes.json());
      else console.warn('Failed to fetch schedules:', schedulesRes.status);
      
      if (absencesRes.ok) setAbsences(await absencesRes.json());
      else console.warn('Failed to fetch absences:', absencesRes.status);
      
      if (rattrapagesRes.ok) setRattrapages(await rattrapagesRes.json());
      else console.warn('Failed to fetch rattrapages:', rattrapagesRes.status);
      
      if (subjectsRes.ok) setSubjects(await subjectsRes.json());
      else console.warn('Failed to fetch subjects:', subjectsRes.status);
    } catch (error) {
      console.error('Error fetching teacher data:', error);
      message.error('Failed to load calendar data');
    } finally {
      setLoading(false);
    }
  };

  // Get calendar events
  const getCalendarEvents = () => {
    const events = [];

    // Add sessions
    schedules.forEach(schedule => {
      if (filterSubject && schedule.matiere_id !== filterSubject) return;

      events.push({
        title: `${schedule.matiere?.name || 'Course'} - ${schedule.type_cours || 'Session'}`,
        start: schedule.date_debut || `${schedule.date_debut}T${schedule.start_time}`,
        end: schedule.date_fin || `${schedule.date_fin}T${schedule.end_time}`,
        extendedProps: {
          type: 'session',
          schedule,
          color: '#1890ff'
        }
      });
    });

    // Add absences
    absences.forEach(absence => {
      events.push({
        title: `Absence - ${absence.motif}`,
        start: absence.date_debut,
        end: absence.date_fin,
        extendedProps: {
          type: 'absence',
          absence,
          color: absence.statut === 'approved' ? '#ff4d4f' : '#faad14'
        }
      });
    });

    // Add rattrapages
    rattrapages.forEach(rattrapage => {
      if (rattrapage.statut === 'pending') {
        events.push({
          title: `Rattrapage Request - ${rattrapage.motif}`,
          start: rattrapage.requested_date,
          extendedProps: {
            type: 'rattrapage',
            rattrapage,
            color: '#faad14'
          }
        });
      }
    });

    return events;
  };

  // Handle session click
  const handleSessionClick = (schedule) => {
    setSelectedSchedule(schedule);
    setDetailsModalVisible(true);
  };

  // Submit absence
  const handleAbsenceSubmit = async (values) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('Not authenticated');
        return;
      }

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      const response = await fetch('http://localhost:3000/api/teacher/absences', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          schedule_id: selectedSchedule?.id,
          motif: values.motif,
          date_debut: values.date_range[0].toISOString(),
          date_fin: values.date_range[1].toISOString()
        })
      });

      if (response.ok) {
        message.success('Absence declared successfully');
        setAbsenceModalVisible(false);
        absenceForm.resetFields();
        fetchTeacherData();
      } else {
        console.error('Error response:', response.status);
        message.error('Failed to declare absence: ' + response.status);
      }
    } catch (error) {
      console.error('Error declaring absence:', error);
      message.error('Failed to declare absence');
    }
  };

  // Submit rattrapage
  const handleRattrapageSubmit = async (values) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('Not authenticated');
        return;
      }

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      const response = await fetch('http://localhost:3000/api/teacher/rattrapages', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          original_schedule_id: selectedSchedule?.id,
          requested_date: values.requested_date.toISOString(),
          requested_start_time: values.start_time.format('HH:mm:ss'),
          requested_end_time: values.end_time.format('HH:mm:ss'),
          motif: values.motif
        })
      });

      if (response.ok) {
        message.success('Rattrapage requested successfully');
        setRattrapageModalVisible(false);
        rattrapageForm.resetFields();
        fetchTeacherData();
      } else {
        console.error('Error response:', response.status);
        message.error('Failed to request rattrapage: ' + response.status);
      }
    } catch (error) {
      console.error('Error requesting rattrapage:', error);
      message.error('Failed to request rattrapage');
    }
  };

  const getStatusColor = (statut) => {
    const colors = {
      pending: 'orange',
      approved: 'green',
      rejected: 'red',
      completed: 'blue'
    };
    return colors[statut] || 'default';
  };

  return (
    <div className="teacher-calendar-container">
      <Row gutter={[24, 24]}>
        {/* Sidebar */}
        <Col xs={24} md={6}>
          <Card className="sidebar-card">
            <h3>
              <BookOutlined /> My Subjects
            </h3>
            <div className="subject-filter">
              <Button
                block
                type={filterSubject === null ? 'primary' : 'default'}
                onClick={() => setFilterSubject(null)}
                className="mb-2"
              >
                All Subjects
              </Button>
              {subjects.map(subject => (
                <Button
                  key={subject.id}
                  block
                  type={filterSubject === subject.id ? 'primary' : 'default'}
                  onClick={() => setFilterSubject(subject.id)}
                  className="mb-2"
                >
                  {subject.name} ({subject.code})
                </Button>
              ))}
            </div>

            <Divider />

            <h3>Statistics</h3>
            <div className="stats">
              <div className="stat-item">
                <span className="stat-label">Total Sessions:</span>
                <Badge count={schedules.length} style={{ backgroundColor: '#1890ff' }} />
              </div>
              <div className="stat-item">
                <span className="stat-label">Pending Absences:</span>
                <Badge count={absences.filter(a => a.statut === 'pending').length} style={{ backgroundColor: '#faad14' }} />
              </div>
              <div className="stat-item">
                <span className="stat-label">Pending Rattrapages:</span>
                <Badge count={rattrapages.filter(r => r.statut === 'pending').length} style={{ backgroundColor: '#faad14' }} />
              </div>
            </div>
          </Card>
        </Col>

        {/* Main Calendar */}
        <Col xs={24} md={18}>
          <Spin spinning={loading}>
            <Card className="calendar-card">
              <h2>My Teaching Calendar</h2>
              <TeacherCalendarView
                events={getCalendarEvents()}
                onSessionClick={handleSessionClick}
              />
            </Card>

            {/* Sessions List Tab */}
            <Card className="mt-3">
              <Tabs
                items={[
                  {
                    key: 'sessions',
                    label: 'Sessions',
                    children: (
                      <div className="sessions-list">
                        {schedules.length === 0 ? (
                          <Empty description="No sessions scheduled" />
                        ) : (
                          schedules
                            .filter(s => !filterSubject || s.matiere_id === filterSubject)
                            .map(schedule => (
                              <Card
                                key={schedule.id}
                                className="session-card"
                                onClick={() => handleSessionClick(schedule)}
                                hoverable
                              >
                                <Row justify="space-between" align="middle">
                                  <Col>
                                    <h4>{schedule.matiere?.name}</h4>
                                    <Space>
                                      <ClockCircleOutlined />
                                      {schedule.start_time} - {schedule.end_time}
                                    </Space>
                                    <br />
                                    <Space>
                                      <EnvironmentOutlined />
                                      {schedule.salle?.nom}
                                    </Space>
                                  </Col>
                                  <Col>
                                    <Tag color="blue">{schedule.type_cours}</Tag>
                                  </Col>
                                </Row>
                              </Card>
                            ))
                        )}
                      </div>
                    )
                  },
                  {
                    key: 'absences',
                    label: 'Absences',
                    children: (
                      <div className="absences-list">
                        {absences.length === 0 ? (
                          <Empty description="No absences" />
                        ) : (
                          absences.map(absence => (
                            <Card key={absence.id} className="absence-card">
                              <Row justify="space-between" align="middle">
                                <Col>
                                  <h4>{absence.motif}</h4>
                                  <p>{dayjs(absence.date_debut).format('DD/MM/YYYY')} - {dayjs(absence.date_fin).format('DD/MM/YYYY')}</p>
                                  <p>{absence.schedule?.matiere?.name}</p>
                                </Col>
                                <Col>
                                  <Tag color={getStatusColor(absence.statut)}>{absence.statut?.toUpperCase()}</Tag>
                                </Col>
                              </Row>
                            </Card>
                          ))
                        )}
                      </div>
                    )
                  },
                  {
                    key: 'rattrapages',
                    label: 'Rattrapages',
                    children: (
                      <div className="rattrapages-list">
                        {rattrapages.length === 0 ? (
                          <Empty description="No rattrapage requests" />
                        ) : (
                          rattrapages.map(rattrapage => (
                            <Card key={rattrapage.id} className="rattrapage-card">
                              <Row justify="space-between" align="middle">
                                <Col>
                                  <h4>{rattrapage.motif}</h4>
                                  <p>Requested: {dayjs(rattrapage.requested_date).format('DD/MM/YYYY HH:mm')}</p>
                                  <p>{rattrapage.schedule?.matiere?.name}</p>
                                </Col>
                                <Col>
                                  <Tag color={getStatusColor(rattrapage.statut)}>{rattrapage.statut?.toUpperCase()}</Tag>
                                </Col>
                              </Row>
                            </Card>
                          ))
                        )}
                      </div>
                    )
                  }
                ]}
              />
            </Card>
          </Spin>
        </Col>
      </Row>

      {/* Session Details Modal */}
      <Modal
        title="Session Details"
        open={detailsModalVisible}
        onCancel={() => setDetailsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailsModalVisible(false)}>
            Close
          </Button>,
          <Button
            key="absence"
            type="primary"
            danger
            onClick={() => {
              setDetailsModalVisible(false);
              setAbsenceModalVisible(true);
            }}
          >
            Declare Absence
          </Button>,
          <Button
            key="rattrapage"
            type="primary"
            onClick={() => {
              setDetailsModalVisible(false);
              setRattrapageModalVisible(true);
            }}
          >
            Request Rattrapage
          </Button>
        ]}
      >
        {selectedSchedule && (
          <div>
            <p><strong>Subject:</strong> {selectedSchedule.matiere?.name}</p>
            <p><strong>Class:</strong> {selectedSchedule.classe?.nom}</p>
            <p><strong>Room:</strong> {selectedSchedule.salle?.nom}</p>
            <p><strong>Type:</strong> {selectedSchedule.type_cours}</p>
            <p><strong>Time:</strong> {selectedSchedule.start_time} - {selectedSchedule.end_time}</p>
            <p><strong>Day:</strong> {selectedSchedule.day_of_week}</p>
          </div>
        )}
      </Modal>

      {/* Absence Declaration Modal */}
      <Modal
        title="Declare Absence"
        open={absenceModalVisible}
        onOk={() => absenceForm.submit()}
        onCancel={() => setAbsenceModalVisible(false)}
      >
        <Form form={absenceForm} layout="vertical" onFinish={handleAbsenceSubmit}>
          <Form.Item
            label="Reason for Absence"
            name="motif"
            rules={[{ required: true, message: 'Please enter reason' }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item
            label="Date Range"
            name="date_range"
            rules={[{ required: true, message: 'Please select dates' }]}
          >
            <DatePicker.RangePicker />
          </Form.Item>
        </Form>
      </Modal>

      {/* Rattrapage Request Modal */}
      <Modal
        title="Request Rattrapage"
        open={rattrapageModalVisible}
        onOk={() => rattrapageForm.submit()}
        onCancel={() => setRattrapageModalVisible(false)}
      >
        <Form form={rattrapageForm} layout="vertical" onFinish={handleRattrapageSubmit}>
          <Form.Item
            label="Proposed Date"
            name="requested_date"
            rules={[{ required: true, message: 'Please select date' }]}
          >
            <DatePicker />
          </Form.Item>
          <Form.Item label="Start Time" name="start_time" rules={[{ required: true }]}>
            <TimePicker format="HH:mm" />
          </Form.Item>
          <Form.Item label="End Time" name="end_time" rules={[{ required: true }]}>
            <TimePicker format="HH:mm" />
          </Form.Item>
          <Form.Item
            label="Reason"
            name="motif"
            rules={[{ required: true, message: 'Please enter reason' }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

// Simple calendar view component
const TeacherCalendarView = ({ events, onSessionClick }) => {
  const [currentDate, setCurrentDate] = useState(dayjs());

  const getDaysInMonth = () => {
    const month = currentDate.month();
    const year = currentDate.year();
    const firstDay = dayjs().year(year).month(month).startOf('month').day();
    const daysCount = dayjs().year(year).month(month).daysInMonth();
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysCount; i++) {
      days.push(dayjs().year(year).month(month).date(i));
    }

    return days;
  };

  const getDayEvents = (day) => {
    if (!day) return [];
    return events.filter(e => dayjs(e.start).isSame(day, 'day'));
  };

  return (
    <div className="teacher-calendar-view">
      <div className="calendar-header">
        <Button onClick={() => setCurrentDate(currentDate.subtract(1, 'month'))}>←</Button>
        <h3>{currentDate.format('MMMM YYYY')}</h3>
        <Button onClick={() => setCurrentDate(currentDate.add(1, 'month'))}>→</Button>
      </div>
      <div className="calendar-weekdays">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="weekday">
            {day}
          </div>
        ))}
      </div>
      <div className="calendar-days">
        {getDaysInMonth().map((day, idx) => (
          <div key={idx} className="calendar-day">
            {day && (
              <>
                <div className="day-number">{day.date()}</div>
                <div className="day-events">
                  {getDayEvents(day).map((event, i) => (
                    <div
                      key={i}
                      className="event"
                      style={{ backgroundColor: event.extendedProps.color }}
                      onClick={() => event.extendedProps.type === 'session' && onSessionClick(event.extendedProps.schedule)}
                    >
                      {event.title.substring(0, 15)}...
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeacherCalendar;
