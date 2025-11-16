import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Select, 
  Spin, 
  Card,
  Table,
  Tag,
  Empty,
  Button,
  App,
  Space
} from 'antd';
import { 
  LeftOutlined,
  RightOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import './WeeklyViewReadOnly.css';

dayjs.extend(weekOfYear);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const { Option } = Select;

const WeeklyViewReadOnly = () => {
  const { classeId } = useParams();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(dayjs());
  const [schedules, setSchedules] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(classeId ? parseInt(classeId) : null);
  const [className, setClassName] = useState('');

  const API_BASE = 'http://localhost:3000/api';

  const weekDays = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

  // Fetch classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await fetch(`${API_BASE}/reference/classes`);
        if (response.ok) {
          const data = await response.json();
          setClasses(Array.isArray(data) ? data : []);
          
          // If classeId is in URL, set it
          if (classeId) {
            const classId = parseInt(classeId);
            setSelectedClass(classId);
            const foundClass = data.find(c => c.id === classId);
            if (foundClass) {
              setClassName(foundClass.nom);
            }
          } else if (data.length > 0) {
            setSelectedClass(data[0].id);
            setClassName(data[0].nom);
          }
        }
      } catch (error) {
        console.error('Error fetching classes:', error);
      }
    };
    fetchClasses();
  }, [classeId]);

  // Fetch schedules
  useEffect(() => {
    if (selectedClass) {
      fetchSchedules();
    }
  }, [selectedClass]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const url = `${API_BASE}/calendar/schedules?classe_id=${selectedClass}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setSchedules(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching schedules:', error);
      message.error('Error loading schedules');
    } finally {
      setLoading(false);
    }
  };

  const goToPreviousWeek = () => {
    setCurrentWeek(prev => prev.subtract(1, 'week'));
  };

  const goToNextWeek = () => {
    setCurrentWeek(prev => prev.add(1, 'week'));
  };

  const goToCurrentWeek = () => {
    setCurrentWeek(dayjs());
  };

  const getWeekDates = useCallback(() => {
    const startOfWeek = currentWeek.startOf('week').add(1, 'day'); // Lundi
    return weekDays.map((day, index) => ({
      day,
      date: startOfWeek.add(index, 'day')
    }));
  }, [currentWeek]);

  const getScheduleForDayAndSlot = useCallback((day, dayDate) => {
    return schedules.filter(schedule => {
      try {
        const startDate = schedule.date_debut ? dayjs(schedule.date_debut) : null;
        const endDate = schedule.date_fin ? dayjs(schedule.date_fin) : null;
        const recurrence = schedule.recurrence || 'unique';
        
        if (!startDate?.isValid()) return false;
        
        // Check if date is in range
        const isInRange = dayDate.isSameOrAfter(startDate, 'day') && 
                         (!endDate || !endDate.isValid() || dayDate.isSameOrBefore(endDate, 'day'));
        
        // Check day of week
        const dayMatches = schedule.day_of_week === day;
        
        if (!isInRange || !dayMatches || schedule.statut === 'annule') {
          return false;
        }
        
        // Handle recurrence patterns
        if (recurrence === 'unique') {
          // Only on exact date
          return dayDate.isSame(startDate, 'day');
        } else if (recurrence === 'hebdomadaire') {
          // Every week on this day
          return true;
        } else if (recurrence === 'bihebdomadaire') {
          // Every 2 weeks
          const weeksDiff = Math.floor(dayDate.diff(startDate, 'days') / 7);
          return weeksDiff % 2 === 0;
        } else if (recurrence === 'mensuelle') {
          // Same day of month
          return dayDate.date() === startDate.date();
        }
        
        return true;
      } catch (error) {
        return false;
      }
    });
  }, [schedules]);

  const buildTableData = useCallback(() => {
    const weekDates = getWeekDates();
    const allSchedulesInWeek = [];

    // Collect all unique time slots (start and end times)
    const timeSlotsMap = new Map();
    schedules.forEach(s => {
      if (s.start_time && s.end_time) {
        const startTime = formatTime(s.start_time);
        const endTime = formatTime(s.end_time);
        const timeSlotKey = `${startTime}-${endTime}`;
        if (!timeSlotsMap.has(timeSlotKey)) {
          timeSlotsMap.set(timeSlotKey, { start: startTime, end: endTime });
        }
      }
    });
    
    // Convert to sorted array
    const timeSlots = Array.from(timeSlotsMap.entries())
      .sort((a, b) => a[1].start.localeCompare(b[1].start))
      .map(entry => ({ key: entry[0], start: entry[1].start, end: entry[1].end }));

    if (timeSlots.length === 0) {
      return [];
    }

    // Build rows for each time slot
    return timeSlots.map((timeSlot, index) => {
      const row = {
        key: `slot-${index}`,
        time: `${timeSlot.start} - ${timeSlot.end}`
      };

      weekDates.forEach(({ day, date }) => {
        const daySchedules = getScheduleForDayAndSlot(day, date);
        const scheduleForTime = daySchedules.find(s => {
          const sStart = formatTime(s.start_time);
          const sEnd = formatTime(s.end_time);
          return sStart === timeSlot.start && sEnd === timeSlot.end;
        });

        row[day.toLowerCase()] = scheduleForTime || null;
      });

      return row;
    });
  }, [getWeekDates, getScheduleForDayAndSlot, schedules]);

  const getTypeColor = (type) => {
    const colors = {
      'Cours': 'blue',
      'TD': 'orange',
      'TP': 'green',
      'Examen': 'red',
      'Soutien': 'default'
    };
    return colors[type] || 'default';
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    // Handle both HH:MM:SS and HH:MM formats
    return timeStr.substring(0, 5);
  };

  const columns = [
    {
      title: 'Horaire',
      dataIndex: 'time',
      key: 'time',
      width: 100,
      fixed: 'left',
      align: 'center',
      render: (text) => <strong>{text}</strong>
    },
    ...weekDays.map(day => ({
      title: day,
      dataIndex: day.toLowerCase(),
      key: day.toLowerCase(),
      width: 180,
      align: 'center',
      render: (schedule) => {
        if (!schedule) {
          return <div style={{ color: '#bfbfbf', fontSize: '18px' }}>—</div>;
        }
        return (
          <div 
            style={{ 
              backgroundColor: '#fafafa',
              border: `2px solid ${getTypeColor(schedule.type_cours)}`,
              borderRadius: '4px',
              padding: '10px',
              minHeight: '100px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ marginBottom: '6px' }}>
              <Tag color={getTypeColor(schedule.type_cours)} style={{ fontSize: '11px' }}>
                {schedule.type_cours}
              </Tag>
            </div>
            <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#1f1f1f' }}>
              {schedule.matiere?.nom || 'N/A'}
            </div>
            <div style={{ fontSize: '11px', marginBottom: '4px', color: '#595959' }}>
              {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
            </div>
            {schedule.salle?.nom && (
              <div style={{ fontSize: '10px', color: '#666', marginBottom: '2px' }}>
                📍 {schedule.salle.nom}
              </div>
            )}
            {schedule.enseignant && (
              <div style={{ fontSize: '10px', color: '#666' }}>
                👨‍🏫 {schedule.enseignant?.nom || schedule.enseignant?.prenom}
              </div>
            )}
          </div>
        );
      }
    }))
  ];

  const tableData = buildTableData();
  const weekDates = getWeekDates();
  const weekStart = weekDates[0].date.format('DD/MM');
  const weekEnd = weekDates[6].date.format('DD/MM/YYYY');

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <Card 
        title="📅 Weekly Schedule View (Read-Only)" 
        extra={
          <Space>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={fetchSchedules}
              loading={loading}
            >
              Refresh
            </Button>
          </Space>
        }
      >
        <Space direction="vertical" style={{ width: '100%', marginBottom: '20px' }} size="large">
          {/* Display Class Name */}
          {className && (
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1890ff' }}>
              Class: <Tag color="blue">{className}</Tag>
            </div>
          )}

          {/* Class Selection (only show if not in URL) */}
          {!classeId && (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span>Select Class:</span>
              <Select 
                style={{ width: 200 }}
                value={selectedClass}
                onChange={(value) => {
                  setSelectedClass(value);
                  const selected = classes.find(c => c.id === value);
                  if (selected) setClassName(selected.nom);
                }}
              >
                {classes.map(cls => (
                  <Option key={cls.id} value={cls.id}>
                    {cls.nom} ({cls.niveau?.nom || 'N/A'})
                  </Option>
                ))}
              </Select>
            </div>
          )}

          {/* Week Navigation */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'space-between' }}>
            <Space>
              <Button 
                icon={<LeftOutlined />} 
                onClick={goToPreviousWeek}
              >
                Previous Week
              </Button>
              <Button 
                onClick={goToCurrentWeek}
              >
                Current Week
              </Button>
              <Button 
                icon={<RightOutlined />} 
                onClick={goToNextWeek}
              >
                Next Week
              </Button>
            </Space>
            <span style={{ fontSize: '16px', fontWeight: 'bold' }}>
              Week: {weekStart} - {weekEnd}
            </span>
          </div>
        </Space>

        {/* Schedule Table */}
        <Spin spinning={loading}>
          {tableData.length === 0 ? (
            <Empty 
              description="No schedules found for this class" 
              style={{ marginTop: '50px' }}
            />
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <Table 
                columns={columns}
                dataSource={tableData}
                pagination={false}
                bordered
                size="small"
                scroll={{ x: 1200 }}
                style={{ 
                  backgroundColor: 'white',
                  borderRadius: '4px'
                }}
              />
            </div>
          )}
        </Spin>

        {/* Legend */}
        <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
          <strong>Legend:</strong>
          <div style={{ display: 'flex', gap: '20px', marginTop: '10px', flexWrap: 'wrap' }}>
            <span><Tag color="blue">Cours</Tag></span>
            <span><Tag color="orange">TD</Tag></span>
            <span><Tag color="green">TP</Tag></span>
            <span><Tag color="red">Examen</Tag></span>
            <span><Tag color="default">Soutien</Tag></span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default WeeklyViewReadOnly;