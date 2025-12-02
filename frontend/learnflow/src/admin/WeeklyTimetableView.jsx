import React, { useState, useEffect, useCallback } from 'react';
import { 
  Modal, 
  Form, 
  Select, 
  Button, 
  App,
  Spin, 
  Tooltip, 
  Popconfirm, 
  Tag,
  Card,
  Alert,
  DatePicker,
  Input,
  ConfigProvider
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  LeftOutlined,
  RightOutlined,
  UserOutlined,
  HomeOutlined,
  BookOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
  ExclamationCircleOutlined,
  WarningOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import './WeeklyTimetableView.css';

dayjs.extend(isBetween);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(weekOfYear);

const { Option } = Select;

const WeeklyTimetableViewContent = () => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  
  const [currentWeek, setCurrentWeek] = useState(dayjs());
  const [schedules, setSchedules] = useState([]);
  const [classes, setClasses] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [salles, setSalles] = useState([]);
  const [enseignants, setEnseignants] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [error, setError] = useState(null);
  const [draggedSchedule, setDraggedSchedule] = useState(null);
  const [filteredEnseignants, setFilteredEnseignants] = useState([]);

  const API_BASE = 'http://localhost:3000/api';
  const AUTH_API = 'http://localhost:4000/api';

  const defaultTimeSlots = [
    { id: 'slot-1', start: '08:00', end: '09:30', label: '08:00 - 09:30' },
    { id: 'slot-2', start: '10:45', end: '11:15', label: '10:45 - 11:15' },
    { id: 'slot-3', start: '11:30', end: '13:00', label: '11:30 - 13:00' },
    { id: 'slot-4', start: '14:00', end: '15:30', label: '14:00 - 15:30' },
    { id: 'slot-5', start: '15:45', end: '17:15', label: '15:45 - 17:15' },
    { id: 'slot-6', start: '17:30', end: '19:00', label: '17:30 - 19:00' }
  ];

  const weekDays = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

  // Color palette for courses - diverse and distinct colors
  const courseTypeColors = {
    'Cours': '#1890ff',
    'TD': '#faad14',
    'TP': '#52c41a',
    'Examen': '#ff4d4f',
    'Soutien': '#8c8c8c'
  };

  const classColors = [
    '#1890ff', '#ff4d4f', '#52c41a', '#faad14', '#13c2c2',
    '#722ed1', '#eb2f96', '#fa541c', '#45b039', '#2f54eb'
  ];

  // Get unique color for each class
  const getClassColor = useCallback((classId) => {
    if (!classId || typeof classId !== 'string') return '#8c8c8c';
    // Use class ID to determine color index consistently
    const index = (classId.charCodeAt(0) + classId.length) % classColors.length;
    return classColors[index];
  }, []);

  // Conflict Detection Service
  const detectConflicts = useCallback((scheduleData, existingSchedules = [], excludeScheduleId = null) => {
    const conflicts = [];

    const {
      classe_id,
      matiere_id,
      salle_id,
      enseignant_id,
      start_time,
      end_time,
      day_of_week,
      date_debut
    } = scheduleData;

    // Helper: Convert time string HH:MM or HH:MM:SS to minutes
    const timeToMinutes = (time) => {
      if (!time) return 0;
      const parts = time.split(':');
      return parseInt(parts[0]) * 60 + parseInt(parts[1]);
    };

    // Helper: Check if two time ranges overlap
    const timesOverlap = (start1, end1, start2, end2) => {
      const startMin1 = timeToMinutes(start1);
      const endMin1 = timeToMinutes(end1);
      const startMin2 = timeToMinutes(start2);
      const endMin2 = timeToMinutes(end2);
      
      return startMin1 < endMin2 && startMin2 < endMin1;
    };

    // Filter schedules to check (same date and day)
    const schedulesToCheck = existingSchedules.filter(sch => {
      // Exclude the current schedule if editing
      if (excludeScheduleId && sch.id === excludeScheduleId) return false;
      
      // Only check active schedules (not cancelled)
      if (sch.statut === 'annule') return false;

      // Check if dates match
      if (sch.day_of_week !== day_of_week) return false;
      
      // Check if the schedule is in the date range
      if (date_debut) {
        const checkDate = dayjs(date_debut);
        const startDate = sch.date_debut ? dayjs(sch.date_debut) : null;
        const endDate = sch.date_fin ? dayjs(sch.date_fin) : null;
        
        if (!startDate?.isValid()) return false;
        
        const isInRange = checkDate.isSameOrAfter(startDate, 'day') && 
                         (!endDate || !endDate.isValid() || checkDate.isSameOrBefore(endDate, 'day'));
        if (!isInRange) return false;
      }

      return true;
    });

    // Check each conflict type
    for (const sch of schedulesToCheck) {
      // 1. Salle déjà occupée (same room at same time)
      if (salle_id && sch.salle_id === salle_id) {
        if (timesOverlap(start_time, end_time, sch.start_time, sch.end_time)) {
          conflicts.push({
            type: 'SALLE_OCCUPEE',
            message: `Salle ${sch.salle?.nom || 'unknown'} déjà occupée à cet horaire (${sch.start_time} - ${sch.end_time})`,
            severity: 'critical'
          });
        }
      }

      // 2. Enseignant occupé (same teacher at same time)
      if (enseignant_id && sch.enseignant_id === enseignant_id) {
        if (timesOverlap(start_time, end_time, sch.start_time, sch.end_time)) {
          conflicts.push({
            type: 'ENSEIGNANT_OCCUPE',
            message: `Enseignant ${sch.enseignant?.prenom} ${sch.enseignant?.nom} occupé à cet horaire (${sch.start_time} - ${sch.end_time})`,
            severity: 'critical'
          });
        }
      }

      // 3. Groupe occupé (same class at same time)
      if (classe_id && sch.classe_id === classe_id) {
        if (timesOverlap(start_time, end_time, sch.start_time, sch.end_time)) {
          conflicts.push({
            type: 'GROUPE_OCCUPE',
            message: `Groupe ${sch.classe?.nom || 'unknown'} occupé à cet horaire (${sch.start_time} - ${sch.end_time})`,
            severity: 'critical'
          });
        }
      }

      // 4. Matière en double (same subject for same class on same time)
      if (matiere_id && classe_id && 
          sch.matiere_id === matiere_id && 
          sch.classe_id === classe_id &&
          sch.type_cours === scheduleData.type_cours) {
        if (timesOverlap(start_time, end_time, sch.start_time, sch.end_time)) {
          conflicts.push({
            type: 'MATIERE_DOUBLE',
            message: `Matière ${sch.matiere?.nom || 'unknown'} déjà programmée pour cette classe à cet horaire`,
            severity: 'major'
          });
        }
      }

      // 5. Chevauchement d'horaires (general overlap for same class)
      if (classe_id && sch.classe_id === classe_id) {
        if (timesOverlap(start_time, end_time, sch.start_time, sch.end_time)) {
          // Only add if not already flagged above
          if (!conflicts.some(c => c.type === 'GROUPE_OCCUPE')) {
            conflicts.push({
              type: 'CHEVAUCHEMENT',
              message: `Chevauchement d'horaires détecté avec ${sch.matiere?.nom || 'unknown'} (${sch.start_time} - ${sch.end_time})`,
              severity: 'major'
            });
          }
        }
      }
    }

    return conflicts;
  }, []);

  // TEACHER CONFLICT MANAGEMENT SYSTEM

  // Helper: Convert time string HH:MM or HH:MM:SS to minutes
  const timeToMinutes = useCallback((time) => {
    if (!time) return 0;
    const parts = time.split(':');
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
  }, []);

  // Helper: Check if two time ranges overlap
  const timesOverlap = useCallback((start1, end1, start2, end2) => {
    const startMin1 = timeToMinutes(start1);
    const endMin1 = timeToMinutes(end1);
    const startMin2 = timeToMinutes(start2);
    const endMin2 = timeToMinutes(end2);
    return startMin1 < endMin2 && startMin2 < endMin1;
  }, [timeToMinutes]);

  // Detect if a teacher is busy at a specific time
  const detectTeacherConflict = useCallback((enseignant_id, scheduleData, existingSchedules, excludeScheduleId = null) => {
    if (!enseignant_id) return null;

    const {
      start_time,
      end_time,
      day_of_week,
      date_debut
    } = scheduleData;

    // Filter schedules where this teacher is already assigned
    const teacherSchedules = existingSchedules.filter(sch => {
      if (excludeScheduleId && sch.id === excludeScheduleId) return false;
      if (sch.statut === 'annule') return false;
      if (sch.enseignant_id !== enseignant_id) return false;
      if (sch.day_of_week !== day_of_week) return false;

      // Check date match
      if (date_debut) {
        const checkDate = dayjs(date_debut);
        const startDate = sch.date_debut ? dayjs(sch.date_debut) : null;
        if (!startDate?.isValid()) return false;
        if (!checkDate.isSame(startDate, 'day')) return false;
      }

      return true;
    });

    // Check for time overlap with any of teacher's existing courses
    for (const sch of teacherSchedules) {
      if (timesOverlap(start_time, end_time, sch.start_time, sch.end_time)) {
        return {
          conflictingSchedule: sch,
          message: `❌ Ce professeur est déjà occupé sur cette plage horaire (${sch.start_time} - ${sch.end_time})`
        };
      }
    }

    return null;
  }, [timesOverlap]);

  // Get teacher's available time slots
  const getTeacherAvailableSlots = useCallback((enseignant_id, day, existingSchedules) => {
    if (!enseignant_id) return defaultTimeSlots;

    const teacherSchedules = existingSchedules.filter(sch => 
      sch.enseignant_id === enseignant_id && 
      sch.day_of_week === day &&
      sch.statut !== 'annule'
    );

    return defaultTimeSlots.map(slot => ({
      ...slot,
      isBusy: teacherSchedules.some(sch => 
        timesOverlap(slot.start, slot.end, sch.start_time, sch.end_time)
      )
    }));
  }, [defaultTimeSlots, timesOverlap]);

  // Find nearest available time slot
  const findNearestFreeSlot = useCallback((enseignant_id, day, scheduleData, existingSchedules) => {
    const availableSlots = getTeacherAvailableSlots(enseignant_id, day, existingSchedules);
    
    // Find slots that don't have conflict
    const freeSlots = availableSlots.filter(slot => !slot.isBusy);
    
    if (freeSlots.length > 0) {
      // Return the first available slot
      return freeSlots[0];
    }

    // If no free slots on this day, suggest next day
    const dayIndex = weekDays.indexOf(day);
    if (dayIndex >= 0 && dayIndex < weekDays.length - 1) {
      const nextDay = weekDays[dayIndex + 1];
      const nextDaySlots = getTeacherAvailableSlots(enseignant_id, nextDay, existingSchedules);
      const nextFreeSlots = nextDaySlots.filter(slot => !slot.isBusy);
      if (nextFreeSlots.length > 0) {
        return { ...nextFreeSlots[0], suggestedDay: nextDay };
      }
    }

    return null;
  }, [getTeacherAvailableSlots, weekDays]);

  // Get teacher's schedule for the week (for sidebar display)
  const getTeacherWeekSchedule = useCallback((enseignant_id) => {
    if (!enseignant_id || schedules.length === 0) return [];

    return schedules.filter(sch => 
      sch.enseignant_id === enseignant_id && 
      sch.statut !== 'annule'
    );
  }, [schedules]);

  // ============ STUDENT GROUP CONFLICT DETECTION ============
  // Detect if a student group already has a course at this time
  const detectStudentGroupConflict = useCallback((classe_id, scheduleData, existingSchedules, excludeScheduleId = null) => {
    if (!classe_id) return null;

    const {
      start_time,
      end_time,
      day_of_week,
      date_debut
    } = scheduleData;

    // Filter schedules where this group is already assigned
    const groupSchedules = existingSchedules.filter(sch => {
      if (excludeScheduleId && sch.id === excludeScheduleId) return false;
      if (sch.statut === 'annule') return false;
      if (sch.classe_id !== classe_id) return false;
      if (sch.day_of_week !== day_of_week) return false;

      // Check date match
      if (date_debut) {
        const checkDate = dayjs(date_debut);
        const startDate = sch.date_debut ? dayjs(sch.date_debut) : null;
        if (!startDate?.isValid()) return false;
        if (!checkDate.isSame(startDate, 'day')) return false;
      }

      return true;
    });

    // Check for time overlap with any of group's existing courses
    for (const sch of groupSchedules) {
      if (timesOverlap(start_time, end_time, sch.start_time, sch.end_time)) {
        return {
          conflictingSchedule: sch,
          message: `❌ Ce groupe a déjà un cours sur cette plage horaire (${sch.start_time} - ${sch.end_time})`
        };
      }
    }

    return null;
  }, [timesOverlap]);

  // Get group's available time slots
  const getGroupAvailableSlots = useCallback((classe_id, day, existingSchedules) => {
    if (!classe_id) return defaultTimeSlots;

    const groupSchedules = existingSchedules.filter(sch => 
      sch.classe_id === classe_id && 
      sch.day_of_week === day &&
      sch.statut !== 'annule'
    );

    return defaultTimeSlots.map(slot => ({
      ...slot,
      isBusy: groupSchedules.some(sch => 
        timesOverlap(slot.start, slot.end, sch.start_time, sch.end_time)
      )
    }));
  }, [defaultTimeSlots, timesOverlap]);

  // Get group's schedule for the week
  const getGroupWeekSchedule = useCallback((classe_id) => {
    if (!classe_id || schedules.length === 0) return [];

    return schedules.filter(sch => 
      sch.classe_id === classe_id && 
      sch.statut !== 'annule'
    );
  }, [schedules]);

  // ============ ROOM CONFLICT DETECTION ============
  // Detect if a room is already booked at this time
  const detectRoomConflict = useCallback((salle_id, scheduleData, existingSchedules, excludeScheduleId = null) => {
    if (!salle_id) return null;

    const {
      start_time,
      end_time,
      day_of_week,
      date_debut
    } = scheduleData;

    // Filter schedules where this room is already assigned
    const roomSchedules = existingSchedules.filter(sch => {
      if (excludeScheduleId && sch.id === excludeScheduleId) return false;
      if (sch.statut === 'annule') return false;
      if (sch.salle_id !== salle_id) return false;
      if (sch.day_of_week !== day_of_week) return false;

      // Check date match
      if (date_debut) {
        const checkDate = dayjs(date_debut);
        const startDate = sch.date_debut ? dayjs(sch.date_debut) : null;
        if (!startDate?.isValid()) return false;
        if (!checkDate.isSame(startDate, 'day')) return false;
      }

      return true;
    });

    // Check for time overlap with any of room's existing courses
    for (const sch of roomSchedules) {
      if (timesOverlap(start_time, end_time, sch.start_time, sch.end_time)) {
        return {
          conflictingSchedule: sch,
          message: `❌ Cette salle est déjà occupée sur cette plage horaire (${sch.start_time} - ${sch.end_time})`
        };
      }
    }

    return null;
  }, [timesOverlap]);

  // Get room's available time slots
  const getRoomAvailableSlots = useCallback((salle_id, day, existingSchedules) => {
    if (!salle_id) return defaultTimeSlots;

    const roomSchedules = existingSchedules.filter(sch => 
      sch.salle_id === salle_id && 
      sch.day_of_week === day &&
      sch.statut !== 'annule'
    );

    return defaultTimeSlots.map(slot => ({
      ...slot,
      isBusy: roomSchedules.some(sch => 
        timesOverlap(slot.start, slot.end, sch.start_time, sch.end_time)
      )
    }));
  }, [defaultTimeSlots, timesOverlap]);

  // Get room's schedule for the week
  const getRoomWeekSchedule = useCallback((salle_id) => {
    if (!salle_id || schedules.length === 0) return [];

    return schedules.filter(sch => 
      sch.salle_id === salle_id && 
      sch.statut !== 'annule'
    );
  }, [schedules]);

  // ============ ROOM SUGGESTIONS ============
  // Find nearest available room with sufficient capacity
  const findNearestFreeRoom = useCallback((scheduleData, existingSchedules, excludeScheduleId = null) => {
    if (!scheduleData.start_time || !scheduleData.end_time) return [];

    // Get the group's size to determine room capacity needed
    const groupe = classes.find(c => c.id === scheduleData.classe_id);
    const groupSize = groupe?.effectif || 30; // Default to 30 if not found

    // Filter rooms by capacity
    const suitableRooms = salles.filter(room => 
      room.capacite >= groupSize
    );

    // Mark each room with availability status
    const roomsWithStatus = suitableRooms.map(room => {
      const conflict = detectRoomConflict(room.id, scheduleData, existingSchedules, excludeScheduleId);
      return {
        ...room,
        isAvailable: !conflict,
        status: conflict ? 'occupied' : 'free'
      };
    });

    // Sort: available rooms first, then by capacity
    return roomsWithStatus.sort((a, b) => {
      if (a.isAvailable !== b.isAvailable) {
        return a.isAvailable ? -1 : 1;
      }
      return a.capacite - b.capacite;
    });
  }, [classes, salles, detectRoomConflict]);

  // Get room availability color coding
  const getRoomAvailabilityColor = useCallback((room, day, timeSlot, existingSchedules) => {
    if (!room || !day || !timeSlot) return '#8c8c8c'; // grey - unknown

    const scheduleData = {
      start_time: timeSlot.start,
      end_time: timeSlot.end,
      day_of_week: day
    };

    const conflict = detectRoomConflict(room.id, scheduleData, existingSchedules);

    if (conflict) return '#ff4d4f'; // red - occupied
    
    // Check if room is almost busy (adjacent slots busy)
    const availableSlots = getRoomAvailableSlots(room.id, day, existingSchedules);
    const slotStatus = availableSlots.find(s => s.start === timeSlot.start);
    if (slotStatus?.isBusy) return '#faad14'; // yellow - almost busy

    return '#52c41a'; // green - free
  }, [detectRoomConflict, getRoomAvailableSlots]);

  // Mémoized callbacks pour optimiser les performances
  const fetchClasses = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/reference/classes`);
      if (!response.ok) throw new Error('Failed to fetch classes');
      const data = await response.json();
      setClasses(Array.isArray(data) ? data : []);
    } catch (error) {
      setClasses([]);
    }
  }, [API_BASE]);

  const fetchMatieres = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/reference/matieres`);
      if (!response.ok) throw new Error('Failed to fetch matieres');
      const data = await response.json();
      setMatieres(Array.isArray(data) ? data : []);
    } catch (error) {
      setMatieres([]);
    }
  }, [API_BASE]);

  const fetchSalles = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/reference/salles`);
      if (!response.ok) throw new Error('Failed to fetch salles');
      const data = await response.json();
      setSalles(Array.isArray(data) ? data : []);
    } catch (error) {
      setSalles([]);
    }
  }, [API_BASE]);

  const fetchEnseignants = useCallback(async () => {
    try {
      const response = await fetch(`${AUTH_API}/auth/users?role=enseignant`);
      if (!response.ok) throw new Error('Failed to fetch enseignants');
      const data = await response.json();
      setEnseignants(Array.isArray(data) ? data : []);
    } catch (error) {
      setEnseignants([]);
    }
  }, [AUTH_API]);

  // No longer fetching time slots from database - using defaultTimeSlots directly

  const fetchSchedules = useCallback(async () => {
    try {
      setLoading(true);
      const url = selectedClass 
        ? `${API_BASE}/calendar/schedules?classe_id=${selectedClass}`
        : `${API_BASE}/calendar/schedules`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch schedules');
      const data = await response.json();
      
      // Ensure we have an array and filter out any null/undefined entries
      const validSchedules = (Array.isArray(data) ? data : []).filter(s => s && s.id);
      
      setSchedules(validSchedules);
      setError(null);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      setSchedules([]);
      setError('Erreur lors du chargement des séances');
    } finally {
      setLoading(false);
    }
  }, [API_BASE, selectedClass]);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch reference data in parallel
      await Promise.all([
        fetchClasses(),
        fetchMatieres(),
        fetchSalles(),
        fetchEnseignants()
      ]);
      // Then fetch schedules after all reference data is ready
      await fetchSchedules();
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  }, [fetchClasses, fetchMatieres, fetchSalles, fetchEnseignants, fetchSchedules]);

  // Initial load on mount
  useEffect(() => {
    fetchAllData();
  }, []);

  // Refetch schedules when selectedClass changes
  useEffect(() => {
    if (classes.length > 0) {
      fetchSchedules();
    }
  }, [selectedClass, fetchSchedules, classes.length]);

  const goToPreviousWeek = () => {
    setCurrentWeek(prev => prev.subtract(1, 'week'));
  };

  const goToNextWeek = () => {
    setCurrentWeek(prev => prev.add(1, 'week'));
  };

  const goToCurrentWeek = () => {
    setCurrentWeek(dayjs());
  };

  // Handle matière selection - filter teachers by selected matière
  const handleMatiereChange = async (matiereId) => {
    form.setFieldValue('matiere_id', matiereId);
    
    if (!matiereId) {
      setFilteredEnseignants(enseignants);
      return;
    }

    try {
      // Fetch teachers who teach this matière
      const response = await fetch(`${API_BASE}/reference/matieres/${matiereId}`);
      if (!response.ok) throw new Error('Failed to fetch matière details');
      
      const matiereData = await response.json();
      console.log('Matière data:', matiereData);
      
      // If the matière has teachers assigned via MatiereEnseignant
      // We need to get the teachers list from the API
      const teachersResponse = await fetch(`${API_BASE}/reference/matieres/${matiereId}/enseignants`);
      
      if (teachersResponse.ok) {
        const teachersData = await teachersResponse.json();
        console.log('Teachers for matière:', teachersData);
        // Filter enseignants list to only show those who teach this matière
        const teacherIds = Array.isArray(teachersData) ? teachersData.map(t => t.id) : [];
        const filtered = enseignants.filter(ens => teacherIds.includes(ens.id));
        setFilteredEnseignants(filtered.length > 0 ? filtered : enseignants);
      } else {
        setFilteredEnseignants(enseignants);
      }
    } catch (error) {
      console.error('Error filtering teachers:', error);
      setFilteredEnseignants(enseignants);
    }
  };

  const getWeekDates = useCallback(() => {
    const startOfWeek = currentWeek.startOf('week').add(1, 'day'); // Lundi
    return weekDays.map((day, index) => ({
      day,
      date: startOfWeek.add(index, 'day')
    }));
  }, [currentWeek]);

  const getScheduleForSlot = useCallback((day, timeSlot) => {
    const weekDates = getWeekDates();
    const dayDate = weekDates.find(d => d.day === day)?.date;
    
    if (!dayDate) return null;

    const matchingSchedule = schedules.find(schedule => {
      try {
        const startDate = schedule.date_debut ? dayjs(schedule.date_debut) : null;
        const endDate = schedule.date_fin ? dayjs(schedule.date_fin) : null;
        
        if (!startDate?.isValid()) return false;
        
        // Check if schedule is cancelled
        if (schedule.statut === 'annule') return false;
        
        // Vérifier si la date est dans l'intervalle
        const isInRange = dayDate.isSameOrAfter(startDate, 'day') && 
                         (!endDate || !endDate.isValid() || dayDate.isSameOrBefore(endDate, 'day'));
        
        // Vérifier le jour de la semaine
        const dayMatches = schedule.day_of_week === day;
        
        if (!isInRange || !dayMatches) {
          return false;
        }
        
        // For time matching: normalize both times to HH:MM format
        const scheduleStartTime = schedule.start_time 
          ? schedule.start_time.substring(0, 5) 
          : null;
        
        if (!scheduleStartTime) return false;
        
        const slotStartMinutes = parseInt(timeSlot.start.split(':')[0]) * 60 + parseInt(timeSlot.start.split(':')[1]);
        const slotEndMinutes = parseInt(timeSlot.end.split(':')[0]) * 60 + parseInt(timeSlot.end.split(':')[1]);
        const scheduleStartMinutes = parseInt(scheduleStartTime.split(':')[0]) * 60 + parseInt(scheduleStartTime.split(':')[1]);
        
        // Schedule is shown in slot if its start time falls within that slot
        const timeMatches = scheduleStartMinutes >= slotStartMinutes && scheduleStartMinutes < slotEndMinutes;
        
        return timeMatches;
      } catch (error) {
        // Schedule check error - continue
        console.warn('Error in getScheduleForSlot:', error);
        return false;
      }
    });

    return matchingSchedule || null;
  }, [schedules, getWeekDates]);

  // Check if a time slot has any conflicts (for visual highlighting)
  const getSlotConflicts = useCallback((day, timeSlot) => {
    const weekDates = getWeekDates();
    const dayDate = weekDates.find(d => d.day === day)?.date;
    
    if (!dayDate) return [];

    const conflictingSchedules = [];

    // Find any schedules that overlap this slot
    for (const sch of schedules) {
      try {
        if (sch.statut === 'annule') continue;
        if (sch.day_of_week !== day) continue;

        const startDate = sch.date_debut ? dayjs(sch.date_debut) : null;
        const endDate = sch.date_fin ? dayjs(sch.date_fin) : null;
        
        if (!startDate?.isValid()) continue;
        
        const isInRange = dayDate.isSameOrAfter(startDate, 'day') && 
                         (!endDate || !endDate.isValid() || dayDate.isSameOrBefore(endDate, 'day'));
        
        if (!isInRange) continue;

        // Check time overlap
        const timeToMinutes = (time) => {
          if (!time) return 0;
          const parts = time.split(':');
          return parseInt(parts[0]) * 60 + parseInt(parts[1]);
        };

        const slotStartMin = timeToMinutes(timeSlot.start);
        const slotEndMin = timeToMinutes(timeSlot.end);
        const schStartMin = timeToMinutes(sch.start_time);
        const schEndMin = timeToMinutes(sch.end_time);

        if (schStartMin < slotEndMin && slotStartMin < schEndMin) {
          conflictingSchedules.push(sch);
        }
      } catch (e) {
        // Skip on error
      }
    }

    return conflictingSchedules;
  }, [schedules, getWeekDates]);

  const getCourseTypeColor = (type, classId = null) => {
    // If classId is provided, use class-based color
    if (classId) {
      return getClassColor(classId);
    }
    // Otherwise use type-based color
    const colors = {
      'Cours': '#1890ff',
      'TD': '#faad14',
      'TP': '#52c41a',
      'Examen': '#ff4d4f',
      'Soutien': '#8c8c8c'
    };
    return colors[type] || '#8c8c8c';
  };

  const handleCreateSchedule = (day, timeSlot) => {
    const weekDates = getWeekDates();
    const dayDate = weekDates.find(d => d.day === day)?.date;
    
    if (!dayDate) {
      message.error('Date invalide');
      return;
    }

    const initialValues = {
      date_debut: dayDate.format('YYYY-MM-DD'),
      classe_id: selectedClass || undefined,
      day_of_week: day,
      start_time: timeSlot.start, // HH:MM format for time input
      end_time: timeSlot.end,     // HH:MM format for time input
      type_cours: 'Cours',
      recurrence: 'unique',
      notes: ''
    };

    setModalMode('create');
    setSelectedSchedule(null);
    setModalVisible(true);
    
    setTimeout(() => {
      form.setFieldsValue(initialValues);
    }, 100);
  };

  const handleEditSchedule = (schedule) => {
    if (!schedule) return;

    // Convert time from HH:MM:SS to HH:MM for time input
    const formatTimeForInput = (time) => {
      if (!time) return time;
      return time.substring(0, 5); // Get HH:MM from HH:MM:SS
    };

    const initialValues = {
      classe_id: schedule.classe_id,
      matiere_id: schedule.matiere_id,
      salle_id: schedule.salle_id,
      enseignant_id: schedule.enseignant_id,
      day_of_week: schedule.day_of_week,
      start_time: formatTimeForInput(schedule.start_time),
      end_time: formatTimeForInput(schedule.end_time),
      date_debut: schedule.date_debut ? dayjs(schedule.date_debut) : null,
      date_fin: schedule.date_fin ? dayjs(schedule.date_fin) : null,
      type_cours: schedule.type_cours || 'Cours',
      recurrence: schedule.recurrence || 'unique',
      notes: schedule.notes || ''
    };

    setSelectedSchedule(schedule);
    setModalMode('edit');
    setModalVisible(true);
    
    setTimeout(() => {
      form.setFieldsValue(initialValues);
    }, 100);
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setSelectedSchedule(null);
    setFilteredEnseignants([]);
    form.resetFields();
  };

  const handleModalSubmit = async () => {
    try {
      await form.validateFields();
      setLoading(true);

      const allValues = form.getFieldsValue(true);

      // Ensure time format is HH:MM:SS
      const formatTime = (time) => {
        if (!time) return time;
        // If format is HH:MM, add :00
        if (time.length === 5) return time + ':00';
        // If already HH:MM:SS, return as is
        return time;
      };

      const scheduleData = {
        ...allValues,
        start_time: formatTime(allValues.start_time),
        end_time: formatTime(allValues.end_time),
        date_debut: allValues.date_debut 
          ? (typeof allValues.date_debut === 'string' ? allValues.date_debut : allValues.date_debut.format('YYYY-MM-DD'))
          : allValues.date_debut,
        date_fin: allValues.date_fin?.format ? allValues.date_fin.format('YYYY-MM-DD') : allValues.date_fin || null
      };

      // Check for conflicts BEFORE submitting
      const conflicts = detectConflicts(
        scheduleData,
        schedules,
        modalMode === 'edit' ? selectedSchedule.id : null
      );

      // Check for teacher-specific conflicts
      const teacherConflict = detectTeacherConflict(
        scheduleData.enseignant_id,
        scheduleData,
        schedules,
        modalMode === 'edit' ? selectedSchedule.id : null
      );

      // Check for student group conflicts
      const groupConflict = detectStudentGroupConflict(
        scheduleData.classe_id,
        scheduleData,
        schedules,
        modalMode === 'edit' ? selectedSchedule.id : null
      );

      // Check for room conflicts
      const roomConflict = detectRoomConflict(
        scheduleData.salle_id,
        scheduleData,
        schedules,
        modalMode === 'edit' ? selectedSchedule.id : null
      );

      if (conflicts.length > 0 || teacherConflict || groupConflict || roomConflict) {
        setLoading(false);
        
        // Prepare all conflict messages
        const allConflicts = [
          ...conflicts,
          ...(groupConflict ? [{
            type: 'GROUP_CONFLICT',
            message: groupConflict.message,
            severity: 'critical'
          }] : []),
          ...(teacherConflict ? [{
            type: 'TEACHER_CONFLICT',
            message: teacherConflict.message,
            severity: 'critical'
          }] : []),
          ...(roomConflict ? [{
            type: 'ROOM_CONFLICT',
            message: roomConflict.message,
            severity: 'critical'
          }] : [])
        ];

        // Find suggestions based on conflicts
        let suggestions = [];
        
        if (groupConflict && scheduleData.classe_id) {
          const availableSlots = getGroupAvailableSlots(
            scheduleData.classe_id,
            scheduleData.day_of_week,
            schedules
          );
          const freeSlots = availableSlots.filter(s => !s.isBusy).slice(0, 2);
          if (freeSlots.length > 0) {
            suggestions.push({
              type: 'group',
              label: '💡 Créneaux disponibles pour ce groupe:',
              items: freeSlots.map(s => s.label)
            });
          }
        }

        if (roomConflict && scheduleData.salle_id) {
          const alternativeRooms = findNearestFreeRoom(scheduleData, schedules, modalMode === 'edit' ? selectedSchedule.id : null);
          const availableRooms = alternativeRooms.filter(r => r.isAvailable).slice(0, 3);
          if (availableRooms.length > 0) {
            suggestions.push({
              type: 'room',
              label: '🏛️ Salles disponibles (même créneau):',
              items: availableRooms.map(r => `${r.nom} (capacité: ${r.capacite})`)
            });
          }
        }

        if (teacherConflict && scheduleData.enseignant_id) {
          const nearestSlot = findNearestFreeSlot(
            scheduleData.enseignant_id,
            scheduleData.day_of_week,
            scheduleData,
            schedules
          );
          if (nearestSlot) {
            suggestions.push({
              type: 'teacher',
              label: '💡 Créneau disponible pour ce professeur:',
              items: [nearestSlot.suggestedDay ? `${nearestSlot.suggestedDay} ${nearestSlot.label}` : nearestSlot.label]
            });
          }
        }

        // Show conflict modal with suggestions
        Modal.error({
          title: '⚠️ Conflit d\'horaire détecté',
          icon: <ExclamationCircleOutlined />,
          content: (
            <div className="conflict-modal-content">
              <p style={{ marginBottom: '16px', color: '#ff4d4f', fontWeight: '600' }}>
                Impossible d'enregistrer cette séance. Conflits détectés:
              </p>
              <ul style={{ marginLeft: '20px', color: '#262626' }}>
                {allConflicts.map((conflict, idx) => (
                  <li key={idx} style={{ marginBottom: '8px' }}>
                    <span style={{ 
                      color: conflict.severity === 'critical' ? '#ff4d4f' : '#faad14',
                      fontWeight: '600'
                    }}>
                      {conflict.severity === 'critical' ? '🔴' : '🟠'} {conflict.message}
                    </span>
                  </li>
                ))}
              </ul>
              
              {suggestions.length > 0 && (
                <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {suggestions.map((suggestion, idx) => (
                    <div 
                      key={idx}
                      style={{ 
                        padding: '12px', 
                        backgroundColor: '#f0f5ff', 
                        borderLeft: '4px solid #1890ff',
                        borderRadius: '4px'
                      }}
                    >
                      <p style={{ margin: '0 0 8px 0', fontWeight: '600', color: '#1890ff' }}>
                        {suggestion.label}
                      </p>
                      <ul style={{ margin: 0, paddingLeft: '20px', color: '#262626' }}>
                        {suggestion.items.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ),
          okText: 'Comprendre',
          onOk() {
            // User acknowledges the conflict
          },
        });
        return;
      }

      const url = modalMode === 'create' 
        ? `${API_BASE}/calendar/schedules`
        : `${API_BASE}/calendar/schedules/${selectedSchedule.id}`;
      
      const method = modalMode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scheduleData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      
      message.success(modalMode === 'create' ? 'Séance créée avec succès' : 'Séance modifiée avec succès');
      handleModalCancel();
      
      // Delay slightly to ensure backend has processed
      setTimeout(() => {
        fetchSchedules();
      }, 300);
      
    } catch (error) {
      // Handle validation errors from form
      if (error.errorFields) {
        // Form validation error - let Ant Design handle it
        return;
      }
      // Handle API errors
      const errorMsg = error.message || 'Une erreur est survenue';
      const conflictMsg = errorMsg.includes('409') ? 'Conflit d\'horaire détecté' : errorMsg;
      message.error(conflictMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/calendar/schedules/${scheduleId}`, {
        method: 'DELETE'
      });

      if (!response.ok && response.status !== 404) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      message.success('Séance supprimée avec succès');
      
      // Fetch schedules after deletion
      setTimeout(() => {
        fetchSchedules();
      }, 300);
    } catch (error) {
      console.error('Error deleting schedule:', error);
      message.error('Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (e, schedule) => {
    e.stopPropagation();
    setDraggedSchedule(schedule);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDropOnCell = async (e, day, timeSlot) => {
    e.preventDefault();
    
    if (!draggedSchedule) return;

    const weekDates = getWeekDates();
    const dayDate = weekDates.find(d => d.day === day)?.date;
    
    if (!dayDate) {
      message.error('Date invalide');
      setDraggedSchedule(null);
      return;
    }

    // Don't allow drop on the same cell
    if (draggedSchedule.day_of_week === day && 
        draggedSchedule.start_time?.substring(0, 5) === timeSlot.start) {
      setDraggedSchedule(null);
      return;
    }

    try {
      // Check for conflicts before allowing drag and drop
      const conflictCheckData = {
        ...draggedSchedule,
        day_of_week: day,
        start_time: timeSlot.start + ':00',
        end_time: timeSlot.end + ':00',
        date_debut: draggedSchedule.date_debut
      };

      const conflicts = detectConflicts(
        conflictCheckData,
        schedules,
        draggedSchedule.id
      );

      // Check for teacher-specific conflicts during drag-drop
      const teacherConflict = detectTeacherConflict(
        draggedSchedule.enseignant_id,
        conflictCheckData,
        schedules,
        draggedSchedule.id
      );

      // Check for student group conflicts during drag-drop
      const groupConflict = detectStudentGroupConflict(
        draggedSchedule.classe_id,
        conflictCheckData,
        schedules,
        draggedSchedule.id
      );

      // Check for room conflicts during drag-drop
      const roomConflict = detectRoomConflict(
        draggedSchedule.salle_id,
        conflictCheckData,
        schedules,
        draggedSchedule.id
      );

      if (conflicts.length > 0 || teacherConflict || groupConflict || roomConflict) {
        // Prepare all conflict messages
        const allConflicts = [
          ...conflicts,
          ...(groupConflict ? [{
            type: 'GROUP_CONFLICT',
            message: groupConflict.message,
            severity: 'critical'
          }] : []),
          ...(teacherConflict ? [{
            type: 'TEACHER_CONFLICT',
            message: teacherConflict.message,
            severity: 'critical'
          }] : []),
          ...(roomConflict ? [{
            type: 'ROOM_CONFLICT',
            message: roomConflict.message,
            severity: 'critical'
          }] : [])
        ];

        // Find suggestions based on conflicts
        let suggestions = [];
        
        if (groupConflict && draggedSchedule.classe_id) {
          const availableSlots = getGroupAvailableSlots(
            draggedSchedule.classe_id,
            day,
            schedules
          );
          const freeSlots = availableSlots.filter(s => !s.isBusy).slice(0, 2);
          if (freeSlots.length > 0) {
            suggestions.push({
              type: 'group',
              label: '💡 Créneaux disponibles pour ce groupe:',
              items: freeSlots.map(s => s.label)
            });
          }
        }

        if (roomConflict && draggedSchedule.salle_id) {
          const alternativeRooms = findNearestFreeRoom(conflictCheckData, schedules, draggedSchedule.id);
          const availableRooms = alternativeRooms.filter(r => r.isAvailable).slice(0, 3);
          if (availableRooms.length > 0) {
            suggestions.push({
              type: 'room',
              label: '🏛️ Salles disponibles (même créneau):',
              items: availableRooms.map(r => `${r.nom} (capacité: ${r.capacite})`)
            });
          }
        }

        if (teacherConflict && draggedSchedule.enseignant_id) {
          const nearestSlot = findNearestFreeSlot(
            draggedSchedule.enseignant_id,
            day,
            conflictCheckData,
            schedules
          );
          if (nearestSlot) {
            suggestions.push({
              type: 'teacher',
              label: '💡 Créneau disponible pour ce professeur:',
              items: [nearestSlot.suggestedDay ? `${nearestSlot.suggestedDay} ${nearestSlot.label}` : nearestSlot.label]
            });
          }
        }

        // Show conflict warning with suggestions
        Modal.warning({
          title: '❌ Impossible de déplacer la séance',
          icon: <ExclamationCircleOutlined />,
          content: (
            <div className="conflict-modal-content">
              <p style={{ marginBottom: '16px', color: '#ff4d4f', fontWeight: '600' }}>
                Ce créneau présente des conflits:
              </p>
              <ul style={{ marginLeft: '20px', color: '#262626' }}>
                {allConflicts.map((conflict, idx) => (
                  <li key={idx} style={{ marginBottom: '8px' }}>
                    <span style={{ 
                      color: conflict.severity === 'critical' ? '#ff4d4f' : '#faad14',
                      fontWeight: '600'
                    }}>
                      {conflict.severity === 'critical' ? '🔴' : '🟠'} {conflict.message}
                    </span>
                  </li>
                ))}
              </ul>

              {suggestions.length > 0 && (
                <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {suggestions.map((suggestion, idx) => (
                    <div 
                      key={idx}
                      style={{ 
                        padding: '12px', 
                        backgroundColor: '#f0f5ff', 
                        borderLeft: '4px solid #1890ff',
                        borderRadius: '4px'
                      }}
                    >
                      <p style={{ margin: '0 0 8px 0', fontWeight: '600', color: '#1890ff' }}>
                        {suggestion.label}
                      </p>
                      <ul style={{ margin: 0, paddingLeft: '20px', color: '#262626' }}>
                        {suggestion.items.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ),
          okText: 'OK',
        });
        setDraggedSchedule(null);
        return;
      }

      setLoading(true);
      
      const updateData = {
        day_of_week: day,
        start_time: timeSlot.start + ':00',
        end_time: timeSlot.end + ':00'
      };

      const response = await fetch(`${API_BASE}/calendar/schedules/${draggedSchedule.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      message.success('Séance déplacée avec succès');
      
      // Reset drag state BEFORE fetching to prevent stale state
      setDraggedSchedule(null);
      
      // Fetch all data to refresh the calendar
      await fetchSchedules();
      
    } catch (error) {
      const errorMsg = error.message || 'Erreur lors du déplacement';
      const conflictMsg = errorMsg.includes('409') ? 'Conflit d\'horaire détecté' : errorMsg;
      message.error(conflictMsg);
      setDraggedSchedule(null);
    } finally {
      setLoading(false);
    }
  };

  const weekDates = getWeekDates();

  if (error) {
    return (
      <div className="weekly-timetable-view">
        <Card>
          <Alert
            message="Erreur de chargement"
            description={error}
            type="error"
            showIcon
            action={
              <Button size="small" onClick={fetchAllData} icon={<ReloadOutlined />}>
                Réessayer
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="weekly-timetable-view">
      <Spin spinning={loading} tip="Chargement...">
          <Card className="weekly-header-card">
            <div className="weekly-header">
              <div className="header-content">
                <h1>📅 Emploi du Temps Hebdomadaire</h1>
                <p>Vue hebdomadaire des plannings de cours</p>
              </div>
              
              <div className="header-controls">
                <Select
                  placeholder="Filtrer par classe"
                  style={{ width: 250 }}
                  value={selectedClass}
                  onChange={setSelectedClass}
                  allowClear
                >
                  {classes.map(classe => (
                    <Option key={classe.id} value={classe.id}>
                      {classe.nom}
                    </Option>
                  ))}
                </Select>
                <Button 
                  icon={<ReloadOutlined />} 
                  onClick={fetchAllData}
                  style={{ marginLeft: 8 }}
                >
                  Actualiser
                </Button>
              </div>
            </div>
          </Card>

          <Card className="week-navigation-card">
            <div className="week-navigation">
              <Button icon={<LeftOutlined />} onClick={goToPreviousWeek}>
                Semaine précédente
              </Button>
              
              <div className="week-info">
                <h2>Semaine {currentWeek.week()} - {currentWeek.year()}</h2>
                <p>
                  {weekDates[0]?.date.format('D MMM')} - {weekDates[5]?.date.format('D MMM YYYY')}
                </p>
              </div>
              
              <Button onClick={goToCurrentWeek}>Aujourd'hui</Button>
              
              <Button icon={<RightOutlined />} onClick={goToNextWeek}>
                Semaine suivante
              </Button>
            </div>
          </Card>

          <div className="weekly-legend">
            <Tag color="blue">Cours</Tag>
            <Tag color="orange">TD</Tag>
            <Tag color="green">TP</Tag>
            <Tag color="red">Examen</Tag>
            <Tag color="default">Soutien</Tag>
            <div className="drag-hint">💡 Glissez les cours pour les déplacer</div>
          </div>

          <Card className="timetable-card">
            <div className="weekly-grid-container">
              {/* Teacher Schedule Sidebar */}
              {form.getFieldValue('enseignant_id') && (
                <div className="teacher-schedule-sidebar" style={{
                  position: 'absolute',
                  right: '20px',
                  top: '100px',
                  width: '300px',
                  backgroundColor: '#fafafa',
                  border: '1px solid #d9d9d9',
                  borderRadius: '8px',
                  padding: '16px',
                  maxHeight: '500px',
                  overflowY: 'auto',
                  zIndex: 100
                }}>
                  <h4 style={{ marginTop: 0, marginBottom: '12px', color: '#1890ff' }}>
                    📅 Horaire du professeur
                  </h4>
                  {getTeacherWeekSchedule(form.getFieldValue('enseignant_id')).length > 0 ? (
                    <div>
                      {getTeacherWeekSchedule(form.getFieldValue('enseignant_id')).map((sch, idx) => (
                        <div 
                          key={idx}
                          style={{
                            padding: '8px',
                            marginBottom: '8px',
                            backgroundColor: '#fff',
                            border: '1px solid #f0f0f0',
                            borderRadius: '4px',
                            fontSize: '12px'
                          }}
                        >
                          <div style={{ fontWeight: '600', color: '#262626' }}>
                            {sch.day_of_week} {sch.start_time} - {sch.end_time}
                          </div>
                          <div style={{ color: '#8c8c8c', fontSize: '11px' }}>
                            {sch.matiere?.nom || 'N/A'}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: '#8c8c8c', fontSize: '12px' }}>Aucun cours programmé</p>
                  )}
                </div>
              )}

              <div className="weekly-grid">
                <div className="grid-header">
                  <div className="time-header">Horaires</div>
                  {weekDates.map(({ day, date }) => (
                    <div key={day} className="day-header">
                      <div className="day-name">{day}</div>
                      <div className="day-date">{date.format('DD/MM')}</div>
                    </div>
                  ))}
                </div>

                {defaultTimeSlots.map((timeSlot) => (
                  <div key={timeSlot.id} className="grid-row">
                    <div className="time-cell">
                      <ClockCircleOutlined />
                      <span>{timeSlot.label}</span>
                    </div>
                    
                    {weekDays.map((day) => {
                      const schedule = getScheduleForSlot(day, timeSlot);
                      const slotConflicts = getSlotConflicts(day, timeSlot);
                      const hasConflicts = slotConflicts.length > 0 && !schedule;

                      const conflictTooltip = hasConflicts 
                        ? `Créneau en conflit: ${slotConflicts.map(s => s.matiere?.nom || 'Unknown').join(', ')}`
                        : '';
                      
                      return (
                        <Tooltip key={`${day}-${timeSlot.id}`} title={conflictTooltip} color={hasConflicts ? '#ff4d4f' : 'default'}>
                          <div
                            className={`schedule-cell ${schedule ? 'has-schedule' : 'empty-cell'} ${draggedSchedule?.id === schedule?.id ? 'dragging' : ''} ${hasConflicts ? 'conflict-zone' : ''}`}
                            onClick={() => !schedule && handleCreateSchedule(day, timeSlot)}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDropOnCell(e, day, timeSlot)}
                          >
                          {schedule ? (
                            <div
                              className="schedule-card"
                              style={{
                                borderLeft: `4px solid ${getCourseTypeColor(schedule.type_cours, schedule.classe_id)}`,
                                background: `linear-gradient(135deg, ${getCourseTypeColor(schedule.type_cours, schedule.classe_id)}15 0%, ${getCourseTypeColor(schedule.type_cours, schedule.classe_id)}05 100%)`
                              }}
                              draggable
                              onDragStart={(e) => handleDragStart(e, schedule)}
                              onDragEnd={() => setDraggedSchedule(null)}
                            >
                              <div className="schedule-header">
                                <div 
                                  className="schedule-type" 
                                  style={{ background: getCourseTypeColor(schedule.type_cours, schedule.classe_id) }}
                                >
                                  {schedule.type_cours}
                                </div>
                                <div className="schedule-actions">
                                  <Tooltip title="Modifier">
                                    <Button
                                      size="small"
                                      type="text"
                                      icon={<EditOutlined />}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditSchedule(schedule);
                                      }}
                                    />
                                  </Tooltip>
                                  <Popconfirm
                                    title="Supprimer cette séance ?"
                                    description="Êtes-vous sûr de vouloir supprimer cette séance ?"
                                    onConfirm={(e) => {
                                      e?.stopPropagation();
                                      handleDeleteSchedule(schedule.id);
                                    }}
                                    onCancel={(e) => e?.stopPropagation()}
                                    okText="Oui"
                                    cancelText="Non"
                                    okType="danger"
                                  >
                                    <Tooltip title="Supprimer">
                                      <Button
                                        size="small"
                                        type="text"
                                        danger
                                        icon={<DeleteOutlined />}
                                        onClick={(e) => e.stopPropagation()}
                                      />
                                    </Tooltip>
                                  </Popconfirm>
                                </div>
                              </div>
                              
                              <div className="schedule-matiere">
                                <BookOutlined /> {schedule.matiere?.nom || schedule.matiere?.name || 'N/A'}
                              </div>
                              
                              {schedule.enseignant && (
                                <div className="schedule-enseignant">
                                  <UserOutlined /> {schedule.enseignant.prenom} {schedule.enseignant.nom}
                                </div>
                              )}
                              
                              {schedule.salle && (
                                <div className="schedule-salle">
                                  <HomeOutlined /> {schedule.salle.nom}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="empty-slot">
                              <PlusOutlined />
                              <span>Ajouter</span>
                            </div>
                          )}
                          </div>
                        </Tooltip>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Modal
            title={modalMode === 'create' ? 'Créer une séance' : 'Modifier la séance'}
            open={modalVisible}
            onOk={handleModalSubmit}
            onCancel={handleModalCancel}
            width={600}
            okText={modalMode === 'create' ? 'Créer' : 'Modifier'}
            cancelText="Annuler"
            confirmLoading={loading}
          >
            <Form 
              form={form} 
              layout="vertical"
              preserve={false}
            >
              <Form.Item 
                name="classe_id" 
                label="Classe" 
                rules={[{ required: true, message: 'Veuillez sélectionner une classe' }]}
              >
                <Select placeholder="Sélectionner une classe" showSearch>
                  {classes.map(classe => (
                    <Option key={classe.id} value={classe.id}>{classe.nom}</Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item 
                name="matiere_id" 
                label="Matière" 
                rules={[{ required: true, message: 'Veuillez sélectionner une matière' }]}
              >
                <Select 
                  placeholder="Sélectionner une matière" 
                  showSearch
                  onChange={handleMatiereChange}
                >
                  {matieres.map(matiere => (
                    <Option key={matiere.id} value={matiere.id}>
                      {matiere.nom || matiere.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item 
                name="enseignant_id" 
                label="Enseignant" 
                rules={[{ required: true, message: 'Veuillez sélectionner un enseignant' }]}
              >
                <Select placeholder="Sélectionner un enseignant" showSearch>
                  {(filteredEnseignants.length > 0 ? filteredEnseignants : enseignants).map(ens => (
                    <Option key={ens.id} value={ens.id}>
                      {ens.prenom} {ens.nom}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item 
                name="salle_id" 
                label="Salle" 
                rules={[{ required: true, message: 'Veuillez sélectionner une salle' }]}
              >
                <Select placeholder="Sélectionner une salle" showSearch>
                  {salles.map(salle => (
                    <Option key={salle.id} value={salle.id}>{salle.nom}</Option>
                  ))}
                </Select>
              </Form.Item>

              {/* Hidden field for day of week */}
              <Form.Item name="day_of_week" hidden={true}>
                <Input />
              </Form.Item>
              {modalMode === 'create' && (
                <Form.Item name="date_debut" hidden={true}>
                  <Input />
                </Form.Item>
              )}

              {/* Editable time fields */}
              <Form.Item 
                name="start_time" 
                label="Heure de début" 
                rules={[{ required: true, message: 'Veuillez saisir l\'heure de début' }]}
              >
                <Input type="time" step="60" style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item 
                name="end_time" 
                label="Heure de fin" 
                rules={[{ required: true, message: 'Veuillez saisir l\'heure de fin' }]}
              >
                <Input type="time" step="60" style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item 
                name="type_cours" 
                label="Type de cours" 
                rules={[{ required: true, message: 'Veuillez sélectionner le type de cours' }]}
              >
                <Select>
                  <Option value="Cours">Cours</Option>
                  <Option value="TD">TD</Option>
                  <Option value="TP">TP</Option>
                  <Option value="Examen">Examen</Option>
                  <Option value="Soutien">Soutien</Option>
                </Select>
              </Form.Item>

              {modalMode === 'edit' && (
                <Form.Item 
                  name="date_debut" 
                  label="Date de début" 
                  rules={[{ required: true, message: 'Veuillez sélectionner une date de début' }]}
                >
                  <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                </Form.Item>
              )}

              <Form.Item name="date_fin" label="Date de fin">
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>

              <Form.Item name="recurrence" label="Récurrence">
                <Select>
                  <Option value="unique">Unique</Option>
                  <Option value="hebdomadaire">Hebdomadaire</Option>
                  <Option value="bihebdomadaire">Bihebdomadaire</Option>
                  <Option value="mensuelle">Mensuelle</Option>
                </Select>
              </Form.Item>

              <Form.Item name="notes" label="Notes">
                <Input.TextArea placeholder="Notes supplémentaires..." rows={3} />
              </Form.Item>
            </Form>
          </Modal>
        </Spin>
      </div>
    );
};

// Main wrapper with ConfigProvider and App
const WeeklyTimetableView = () => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1890ff',
        },
      }}
    >
      <App>
        <WeeklyTimetableViewContent />
      </App>
    </ConfigProvider>
  );
};

export default WeeklyTimetableView;