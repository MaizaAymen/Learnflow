const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const TimeSlot = require('../models/TimeSlot');
const Schedule = require('../models/Schedule');
const Booking = require('../models/Booking');
const Classe = require('../models/Classe');
const Matiere = require('../models/Matiére');
const Salle = require('../models/Salle');
const { 
  detectScheduleConflicts, 
  detectDragDropConflicts, 
  getAvailability 
} = require('../services/conflictDetection');

// ==================== TIME SLOTS MANAGEMENT ====================

// Create a new time slot
router.post('/timeslots', async (req, res) => {
  try {
    const { day_of_week, start_time, end_time, description, is_active } = req.body;
    
    if (!day_of_week || !start_time || !end_time) {
      return res.status(400).json({ 
        error: 'Le jour, l\'heure de début et l\'heure de fin sont requis' 
      });
    }

    // Check for overlapping time slots
    const overlap = await TimeSlot.findOne({
      where: {
        day_of_week,
        [Op.or]: [
          {
            start_time: { [Op.between]: [start_time, end_time] }
          },
          {
            end_time: { [Op.between]: [start_time, end_time] }
          },
          {
            [Op.and]: [
              { start_time: { [Op.lte]: start_time } },
              { end_time: { [Op.gte]: end_time } }
            ]
          }
        ]
      }
    });

    if (overlap) {
      return res.status(409).json({ 
        error: 'Un créneau horaire existe déjà pour cette période' 
      });
    }

    const newTimeSlot = await TimeSlot.create({ 
      day_of_week, 
      start_time, 
      end_time, 
      description, 
      is_active 
    });
    
    res.status(201).json(newTimeSlot);
  } catch (error) {
    console.error('Error creating time slot:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all time slots
router.get('/timeslots', async (req, res) => {
  try {
    const { day_of_week, is_active } = req.query;
    const where = {};
    
    if (day_of_week) where.day_of_week = day_of_week;
    if (is_active !== undefined) where.is_active = is_active === 'true';

    const timeSlots = await TimeSlot.findAll({ 
      where,
      order: [
        ['day_of_week', 'ASC'],
        ['start_time', 'ASC']
      ]
    });
    
    res.status(200).json(timeSlots);
  } catch (error) {
    console.error('Error fetching time slots:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get time slot by ID
router.get('/timeslots/:id', async (req, res) => {
  try {
    const timeSlot = await TimeSlot.findByPk(req.params.id);
    
    if (!timeSlot) {
      return res.status(404).json({ error: 'Créneau horaire introuvable' });
    }
    
    res.status(200).json(timeSlot);
  } catch (error) {
    console.error('Error fetching time slot:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update time slot
router.put('/timeslots/:id', async (req, res) => {
  try {
    const { day_of_week, start_time, end_time, description, is_active } = req.body;
    const timeSlot = await TimeSlot.findByPk(req.params.id);
    
    if (!timeSlot) {
      return res.status(404).json({ error: 'Créneau horaire introuvable' });
    }

    await timeSlot.update({ day_of_week, start_time, end_time, description, is_active });
    res.status(200).json({ message: 'Créneau horaire mis à jour avec succès', data: timeSlot });
  } catch (error) {
    console.error('Error updating time slot:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete time slot
router.delete('/timeslots/:id', async (req, res) => {
  try {
    const timeSlot = await TimeSlot.findByPk(req.params.id);
    
    if (!timeSlot) {
      return res.status(404).json({ error: 'Créneau horaire introuvable' });
    }

    // Check if time slot is used in schedules
    const scheduleCount = await Schedule.count({ where: { time_slot_id: req.params.id } });
    if (scheduleCount > 0) {
      return res.status(409).json({ 
        error: 'Impossible de supprimer ce créneau car il est utilisé dans des plannings' 
      });
    }

    await timeSlot.destroy();
    res.status(200).json({ message: 'Créneau horaire supprimé avec succès' });
  } catch (error) {
    console.error('Error deleting time slot:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Bulk create time slots (useful for initial setup)
router.post('/timeslots/bulk', async (req, res) => {
  try {
    const { timeSlots } = req.body;
    
    if (!Array.isArray(timeSlots) || timeSlots.length === 0) {
      return res.status(400).json({ error: 'Un tableau de créneaux horaires est requis' });
    }

    const createdTimeSlots = await TimeSlot.bulkCreate(timeSlots);
    res.status(201).json(createdTimeSlots);
  } catch (error) {
    console.error('Error bulk creating time slots:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== SCHEDULE MANAGEMENT ====================

// Create a new schedule
router.post('/schedules', async (req, res) => {
  try {
    const { 
      time_slot_id, 
      day_of_week,
      start_time,
      end_time,
      classe_id, 
      matiere_id, 
      salle_id, 
      enseignant_id,
      date_debut,
      date_fin,
      type_cours,
      recurrence,
      notes
    } = req.body;

    if (!classe_id || !matiere_id || !date_debut || !day_of_week || !start_time || !end_time) {
      return res.status(400).json({ 
        success: false,
        error: 'La classe, la matière, le jour, les heures et la date de début sont requis' 
      });
    }

    // Check for conflicts using enhanced conflict detection service
    const conflictResult = await detectScheduleConflicts({
      time_slot_id,
      day_of_week,
      start_time,
      end_time,
      classe_id,
      matiere_id,
      salle_id,
      enseignant_id,
      date_debut,
      date_fin,
      type_cours
    });

    if (conflictResult.hasConflicts) {
      // Return the first critical conflict
      const firstConflict = conflictResult.conflicts[0];
      return res.status(409).json({
        success: false,
        type: 'conflict',
        target: firstConflict.target,
        message: firstConflict.message,
        allConflicts: conflictResult.conflicts,
        conflictCount: conflictResult.conflictCount
      });
    }

    const newSchedule = await Schedule.create({
      time_slot_id: time_slot_id || null,
      day_of_week,
      start_time,
      end_time,
      classe_id,
      matiere_id,
      salle_id,
      enseignant_id,
      date_debut,
      date_fin,
      type_cours,
      recurrence,
      notes
    });

    const scheduleWithDetails = await Schedule.findByPk(newSchedule.id, {
      include: [
        { association: 'timeSlot', required: false },
        { association: 'classe' },
        { association: 'matiere' },
        { association: 'salle' },
        { association: 'enseignant', attributes: ['id', 'nom', 'prenom', 'email'] }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Planning créé avec succès',
      data: scheduleWithDetails
    });
  } catch (error) {
    console.error('Error creating schedule:', error);
    res.status(500).json({ 
      success: false,
      type: 'error',
      error: 'Erreur interne du serveur',
      details: error.message 
    });
  }
});

// Get all schedules with filters
router.get('/schedules', async (req, res) => {
  try {
    const { classe_id, matiere_id, salle_id, enseignant_id, date, statut } = req.query;
    const where = {};

    if (classe_id) where.classe_id = classe_id;
    if (matiere_id) where.matiere_id = matiere_id;
    if (salle_id) where.salle_id = salle_id;
    if (enseignant_id) where.enseignant_id = enseignant_id;
    if (statut) where.statut = statut;
    
    if (date) {
      where.date_debut = { [Op.lte]: date };
      where[Op.or] = [
        { date_fin: { [Op.gte]: date } },
        { date_fin: null }
      ];
    }

    const schedules = await Schedule.findAll({
      where,
      include: [
        { association: 'timeSlot', required: false },
        { association: 'classe' },
        { association: 'matiere' },
        { association: 'salle' },
        { association: 'enseignant', attributes: ['id', 'nom', 'prenom', 'email'] }
      ],
      order: [['date_debut', 'ASC']]
    });

    res.status(200).json(schedules);
  } catch (error) {
    console.error('Error fetching schedules:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get schedule by ID
router.get('/schedules/:id', async (req, res) => {
  try {
    const schedule = await Schedule.findByPk(req.params.id, {
      include: [
        { association: 'timeSlot' },
        { association: 'classe' },
        { association: 'matiere' },
        { association: 'salle' }
      ]
    });

    if (!schedule) {
      return res.status(404).json({ error: 'Planning introuvable' });
    }

    res.status(200).json(schedule);
  } catch (error) {
    console.error('Error fetching schedule:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get weekly schedule for a class
router.get('/schedules/classe/:classe_id/week', async (req, res) => {
  try {
    const { classe_id } = req.params;
    const { date } = req.query; // Date within the desired week

    const targetDate = date ? new Date(date) : new Date();

    const schedules = await Schedule.findAll({
      where: {
        classe_id,
        date_debut: { [Op.lte]: targetDate },
        [Op.or]: [
          { date_fin: { [Op.gte]: targetDate } },
          { date_fin: null }
        ],
        statut: { [Op.ne]: 'annule' }
      },
      include: [
        { association: 'timeSlot' },
        { association: 'matiere' },
        { association: 'salle' }
      ],
      order: [[{ association: 'timeSlot' }, 'day_of_week', 'ASC']]
    });

    res.status(200).json(schedules);
  } catch (error) {
    console.error('Error fetching weekly schedule:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get teacher's schedule
router.get('/schedules/teacher/:enseignant_id', async (req, res) => {
  try {
    const { enseignant_id } = req.params;
    const { date_debut, date_fin } = req.query;

    const where = { enseignant_id };
    
    if (date_debut) {
      where.date_debut = { [Op.lte]: date_debut };
      where[Op.or] = [
        { date_fin: { [Op.gte]: date_debut } },
        { date_fin: null }
      ];
    }

    const schedules = await Schedule.findAll({
      where,
      include: [
        { association: 'timeSlot' },
        { association: 'classe' },
        { association: 'matiere' },
        { association: 'salle' }
      ],
      order: [['date_debut', 'ASC']]
    });

    res.status(200).json(schedules);
  } catch (error) {
    console.error('Error fetching teacher schedule:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update schedule
router.put('/schedules/:id', async (req, res) => {
  try {
    const schedule = await Schedule.findByPk(req.params.id);

    if (!schedule) {
      return res.status(404).json({ 
        success: false,
        error: 'Planning introuvable' 
      });
    }

    const updateData = req.body;

    // Check for conflicts if key fields are being updated
    if (updateData.time_slot_id || updateData.classe_id || updateData.matiere_id || 
        updateData.salle_id || updateData.enseignant_id || updateData.date_debut || 
        updateData.date_fin || updateData.type_cours) {
      
      const conflictResult = await detectScheduleConflicts({
        time_slot_id: updateData.time_slot_id || schedule.time_slot_id,
        day_of_week: updateData.day_of_week || schedule.day_of_week,
        start_time: updateData.start_time || schedule.start_time,
        end_time: updateData.end_time || schedule.end_time,
        classe_id: updateData.classe_id || schedule.classe_id,
        matiere_id: updateData.matiere_id || schedule.matiere_id,
        salle_id: updateData.salle_id || schedule.salle_id,
        enseignant_id: updateData.enseignant_id || schedule.enseignant_id,
        date_debut: updateData.date_debut || schedule.date_debut,
        date_fin: updateData.date_fin || schedule.date_fin,
        type_cours: updateData.type_cours || schedule.type_cours,
        excludeId: req.params.id
      });

      if (conflictResult.hasConflicts) {
        const firstConflict = conflictResult.conflicts[0];
        return res.status(409).json({
          success: false,
          type: 'conflict',
          target: firstConflict.target,
          message: firstConflict.message,
          allConflicts: conflictResult.conflicts,
          conflictCount: conflictResult.conflictCount
        });
      }
    }

    await schedule.update(updateData);
    
    const updatedSchedule = await Schedule.findByPk(req.params.id, {
      include: [
        { association: 'timeSlot', required: false },
        { association: 'classe' },
        { association: 'matiere' },
        { association: 'salle' },
        { association: 'enseignant', attributes: ['id', 'nom', 'prenom', 'email'] }
      ]
    });

    res.status(200).json({ 
      success: true,
      message: 'Planning mis à jour avec succès',
      data: updatedSchedule 
    });
  } catch (error) {
    console.error('Error updating schedule:', error);
    res.status(500).json({ 
      success: false,
      type: 'error',
      error: 'Erreur interne du serveur',
      details: error.message 
    });
  }
});

// Drag and drop schedule update (minimal backend change)
router.patch('/schedules/:id/drag-drop', async (req, res) => {
  try {
    const { time_slot_id, classe_id, salle_id } = req.body;

    // Use specialized drag-drop conflict detection
    const conflictResult = await detectDragDropConflicts(
      req.params.id,
      time_slot_id,
      classe_id,
      salle_id
    );

    if (conflictResult.hasConflicts) {
      const firstConflict = conflictResult.conflicts[0];
      return res.status(409).json({
        success: false,
        type: 'conflict',
        target: firstConflict.target,
        message: firstConflict.message,
        allConflicts: conflictResult.conflicts,
        conflictCount: conflictResult.conflictCount
      });
    }

    const schedule = await Schedule.findByPk(req.params.id);

    if (!schedule) {
      return res.status(404).json({ 
        success: false,
        error: 'Planning introuvable' 
      });
    }

    // Apply updates
    if (time_slot_id && time_slot_id !== schedule.time_slot_id) {
      schedule.time_slot_id = time_slot_id;
    }

    if (classe_id && classe_id !== schedule.classe_id) {
      schedule.classe_id = classe_id;
    }

    if (salle_id && salle_id !== schedule.salle_id) {
      schedule.salle_id = salle_id;
    }

    await schedule.save();
    
    const updatedSchedule = await Schedule.findByPk(req.params.id, {
      include: [
        { association: 'timeSlot' },
        { association: 'classe' },
        { association: 'matiere' },
        { association: 'salle' },
        { association: 'enseignant', attributes: ['id', 'nom', 'prenom', 'email'] }
      ]
    });

    res.status(200).json({ 
      success: true,
      message: 'Planning déplacé avec succès',
      data: updatedSchedule 
    });
  } catch (error) {
    console.error('Error drag-drop updating schedule:', error);
    res.status(500).json({ 
      success: false,
      type: 'error',
      error: 'Erreur interne du serveur',
      details: error.message 
    });
  }
});

// Cancel schedule
router.patch('/schedules/:id/cancel', async (req, res) => {
  try {
    const schedule = await Schedule.findByPk(req.params.id);

    if (!schedule) {
      return res.status(404).json({ error: 'Planning introuvable' });
    }

    await schedule.update({ statut: 'annule' });
    
    res.status(200).json({ 
      message: 'Planning annulé avec succès',
      data: schedule 
    });
  } catch (error) {
    console.error('Error cancelling schedule:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete schedule
router.delete('/schedules/:id', async (req, res) => {
  try {
    const schedule = await Schedule.findByPk(req.params.id);

    if (!schedule) {
      return res.status(404).json({ error: 'Planning introuvable' });
    }

    await schedule.destroy();
    res.status(200).json({ message: 'Planning supprimé avec succès' });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Check for available time slots
router.get('/schedules/availability/timeslots', async (req, res) => {
  try {
    const { date, classe_id, salle_id, enseignant_id } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'La date est requise' });
    }

    const dayOfWeek = new Date(date).toLocaleDateString('fr-FR', { weekday: 'long' });
    const dayMap = {
      'lundi': 'Lundi',
      'mardi': 'Mardi',
      'mercredi': 'Mercredi',
      'jeudi': 'Jeudi',
      'vendredi': 'Vendredi',
      'samedi': 'Samedi',
      'dimanche': 'Dimanche'
    };

    const allTimeSlots = await TimeSlot.findAll({
      where: {
        day_of_week: dayMap[dayOfWeek.toLowerCase()],
        is_active: true
      },
      order: [['start_time', 'ASC']]
    });

    const busySchedules = await Schedule.findAll({
      where: {
        date_debut: { [Op.lte]: date },
        [Op.or]: [
          { date_fin: { [Op.gte]: date } },
          { date_fin: null }
        ],
        statut: { [Op.ne]: 'annule' },
        ...(classe_id && { classe_id }),
        ...(salle_id && { salle_id }),
        ...(enseignant_id && { enseignant_id })
      },
      include: [{ association: 'timeSlot' }]
    });

    const busyTimeSlotIds = busySchedules.map(s => s.time_slot_id);

    const availableTimeSlots = allTimeSlots.filter(
      ts => !busyTimeSlotIds.includes(ts.id)
    );

    res.status(200).json({
      date,
      dayOfWeek: dayMap[dayOfWeek.toLowerCase()],
      total: allTimeSlots.length,
      available: availableTimeSlots.length,
      busy: busyTimeSlotIds.length,
      availableSlots: availableTimeSlots
    });
  } catch (error) {
    console.error('Error checking availability:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== BOOKING MANAGEMENT ====================

// Create a booking
router.post('/bookings', async (req, res) => {
  try {
    const { schedule_id, user_id, user_type, notes } = req.body;

    if (!schedule_id || !user_id || !user_type) {
      return res.status(400).json({ 
        error: 'Le planning, l\'utilisateur et le type d\'utilisateur sont requis' 
      });
    }

    // Check if schedule exists and is not cancelled
    const schedule = await Schedule.findByPk(schedule_id);
    if (!schedule) {
      return res.status(404).json({ error: 'Planning introuvable' });
    }
    if (schedule.statut === 'annule') {
      return res.status(400).json({ error: 'Ce cours a été annulé' });
    }

    // Check if user already has a booking
    const existingBooking = await Booking.findOne({
      where: { schedule_id, user_id, user_type }
    });

    if (existingBooking) {
      return res.status(409).json({ 
        error: 'Une réservation existe déjà pour cet utilisateur' 
      });
    }

    const newBooking = await Booking.create({
      schedule_id,
      user_id,
      user_type,
      notes,
      statut: 'confirmed'
    });

    res.status(201).json(newBooking);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all bookings
router.get('/bookings', async (req, res) => {
  try {
    const { schedule_id, user_id, user_type, statut } = req.query;
    const where = {};

    if (schedule_id) where.schedule_id = schedule_id;
    if (user_id) where.user_id = user_id;
    if (user_type) where.user_type = user_type;
    if (statut) where.statut = statut;

    const bookings = await Booking.findAll({
      where,
      include: [
        { 
          association: 'schedule',
          include: [
            { association: 'timeSlot' },
            { association: 'classe' },
            { association: 'matiere' },
            { association: 'salle' }
          ]
        }
      ],
      order: [['booking_date', 'DESC']]
    });

    res.status(200).json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get booking by ID
router.get('/bookings/:id', async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: [
        { 
          association: 'schedule',
          include: [
            { association: 'timeSlot' },
            { association: 'classe' },
            { association: 'matiere' },
            { association: 'salle' }
          ]
        }
      ]
    });

    if (!booking) {
      return res.status(404).json({ error: 'Réservation introuvable' });
    }

    res.status(200).json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update booking (e.g., mark presence)
router.put('/bookings/:id', async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);

    if (!booking) {
      return res.status(404).json({ error: 'Réservation introuvable' });
    }

    await booking.update(req.body);
    res.status(200).json({ 
      message: 'Réservation mise à jour avec succès',
      data: booking 
    });
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark attendance
router.patch('/bookings/:id/attendance', async (req, res) => {
  try {
    const { presence } = req.body;
    const booking = await Booking.findByPk(req.params.id);

    if (!booking) {
      return res.status(404).json({ error: 'Réservation introuvable' });
    }

    await booking.update({ 
      presence,
      statut: 'completed' 
    });

    res.status(200).json({ 
      message: 'Présence enregistrée avec succès',
      data: booking 
    });
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Cancel booking
router.delete('/bookings/:id', async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);

    if (!booking) {
      return res.status(404).json({ error: 'Réservation introuvable' });
    }

    await booking.update({ statut: 'cancelled' });
    res.status(200).json({ message: 'Réservation annulée avec succès' });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get attendance report for a schedule
router.get('/bookings/schedule/:schedule_id/attendance', async (req, res) => {
  try {
    const { schedule_id } = req.params;

    const bookings = await Booking.findAll({
      where: { schedule_id },
      attributes: ['id', 'user_id', 'user_type', 'presence', 'statut']
    });

    const stats = {
      total: bookings.length,
      present: bookings.filter(b => b.presence === true).length,
      absent: bookings.filter(b => b.presence === false).length,
      pending: bookings.filter(b => b.presence === null).length
    };

    res.status(200).json({
      schedule_id,
      statistics: stats,
      details: bookings
    });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== BULK OPERATIONS ====================

// Bulk create schedules (useful for semester planning)
router.post('/schedules/bulk', async (req, res) => {
  try {
    const { schedules } = req.body;

    if (!Array.isArray(schedules) || schedules.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Un tableau de plannings est requis'
      });
    }

    const results = {
      created: [],
      conflicts: [],
      errors: []
    };

    // Process each schedule
    for (let i = 0; i < schedules.length; i++) {
      const scheduleData = schedules[i];

      try {
        // Validate required fields
        if (!scheduleData.time_slot_id || !scheduleData.classe_id || 
            !scheduleData.matiere_id || !scheduleData.date_debut) {
          results.errors.push({
            index: i,
            data: scheduleData,
            error: 'Données incomplètes'
          });
          continue;
        }

        // Check conflicts
        const conflictResult = await detectScheduleConflicts(scheduleData);

        if (conflictResult.hasConflicts) {
          results.conflicts.push({
            index: i,
            data: scheduleData,
            conflicts: conflictResult.conflicts
          });
          continue;
        }

        // Create schedule
        const newSchedule = await Schedule.create(scheduleData);
        results.created.push({
          index: i,
          id: newSchedule.id,
          data: newSchedule
        });

      } catch (error) {
        results.errors.push({
          index: i,
          data: scheduleData,
          error: error.message
        });
      }
    }

    res.status(200).json({
      success: true,
      summary: {
        total: schedules.length,
        created: results.created.length,
        conflicts: results.conflicts.length,
        errors: results.errors.length
      },
      details: results
    });

  } catch (error) {
    console.error('Error bulk creating schedules:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la création en masse',
      details: error.message
    });
  }
});

// Get complete timetable for a class (with all details)
router.get('/timetable/classe/:classe_id', async (req, res) => {
  try {
    const { classe_id } = req.params;
    const { date_debut, date_fin } = req.query;

    const where = {
      classe_id,
      statut: { [Op.ne]: 'annule' }
    };

    if (date_debut) {
      where.date_debut = { [Op.lte]: date_debut };
      where[Op.or] = [
        { date_fin: { [Op.gte]: date_debut } },
        { date_fin: null }
      ];
    }

    const schedules = await Schedule.findAll({
      where,
      include: [
        { 
          association: 'timeSlot',
          attributes: ['id', 'day_of_week', 'start_time', 'end_time']
        },
        { 
          association: 'matiere',
          attributes: ['id', 'name', 'code', 'credits']
        },
        { 
          association: 'salle',
          attributes: ['id', 'nom', 'type', 'capacite', 'localisation']
        },
        { 
          association: 'enseignant',
          attributes: ['id', 'nom', 'prenom', 'email']
        }
      ],
      order: [
        [{ association: 'timeSlot' }, 'day_of_week', 'ASC'],
        [{ association: 'timeSlot' }, 'start_time', 'ASC']
      ]
    });

    // Group by day of week
    const timetableByDay = {};
    const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
    
    days.forEach(day => {
      timetableByDay[day] = schedules.filter(s => s.timeSlot?.day_of_week === day);
    });

    res.status(200).json({
      success: true,
      classe_id,
      totalSchedules: schedules.length,
      schedules,
      timetableByDay
    });

  } catch (error) {
    console.error('Error fetching class timetable:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération de l\'emploi du temps',
      details: error.message
    });
  }
});

// Get complete timetable for a teacher
router.get('/timetable/enseignant/:enseignant_id', async (req, res) => {
  try {
    const { enseignant_id } = req.params;
    const { date_debut, date_fin } = req.query;

    const where = {
      enseignant_id,
      statut: { [Op.ne]: 'annule' }
    };

    if (date_debut) {
      where.date_debut = { [Op.lte]: date_debut };
      where[Op.or] = [
        { date_fin: { [Op.gte]: date_debut } },
        { date_fin: null }
      ];
    }

    const schedules = await Schedule.findAll({
      where,
      include: [
        { 
          association: 'timeSlot',
          attributes: ['id', 'day_of_week', 'start_time', 'end_time']
        },
        { 
          association: 'matiere',
          attributes: ['id', 'name', 'code', 'credits']
        },
        { 
          association: 'classe',
          attributes: ['id', 'nom', 'effectif'],
          include: [{
            association: 'niveau',
            attributes: ['id', 'name']
          }]
        },
        { 
          association: 'salle',
          attributes: ['id', 'nom', 'type', 'capacite', 'localisation']
        }
      ],
      order: [
        [{ association: 'timeSlot' }, 'day_of_week', 'ASC'],
        [{ association: 'timeSlot' }, 'start_time', 'ASC']
      ]
    });

    // Group by day of week
    const timetableByDay = {};
    const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
    
    days.forEach(day => {
      timetableByDay[day] = schedules.filter(s => s.timeSlot?.day_of_week === day);
    });

    res.status(200).json({
      success: true,
      enseignant_id,
      totalSchedules: schedules.length,
      schedules,
      timetableByDay
    });

  } catch (error) {
    console.error('Error fetching teacher timetable:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération de l\'emploi du temps',
      details: error.message
    });
  }
});

// ==================== VALIDATION ENDPOINTS ====================

// Check conflicts before creating/updating a schedule
router.post('/schedules/check-conflicts', async (req, res) => {
  try {
    const {
      time_slot_id,
      classe_id,
      matiere_id,
      salle_id,
      enseignant_id,
      date_debut,
      date_fin,
      type_cours,
      excludeId
    } = req.body;

    if (!time_slot_id || !classe_id || !matiere_id || !date_debut) {
      return res.status(400).json({
        success: false,
        error: 'Données insuffisantes pour vérifier les conflits'
      });
    }

    const conflictResult = await detectScheduleConflicts({
      time_slot_id,
      classe_id,
      matiere_id,
      salle_id,
      enseignant_id,
      date_debut,
      date_fin,
      type_cours,
      excludeId
    });

    if (conflictResult.hasConflicts) {
      return res.status(200).json({
        success: false,
        hasConflicts: true,
        conflicts: conflictResult.conflicts,
        conflictCount: conflictResult.conflictCount
      });
    }

    res.status(200).json({
      success: true,
      hasConflicts: false,
      message: 'Aucun conflit détecté'
    });
  } catch (error) {
    console.error('Error checking conflicts:', error);
    res.status(500).json({
      success: false,
      type: 'error',
      error: 'Erreur lors de la vérification des conflits',
      details: error.message
    });
  }
});

// Get availability for a time slot
router.get('/availability/:time_slot_id', async (req, res) => {
  try {
    const { time_slot_id } = req.params;
    const { date, departementId, niveauId, specialiteId } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        error: 'La date est requise'
      });
    }

    const availabilityResult = await getAvailability(
      parseInt(time_slot_id),
      date,
      {
        departementId: departementId ? parseInt(departementId) : undefined,
        niveauId: niveauId ? parseInt(niveauId) : undefined,
        specialiteId: specialiteId ? parseInt(specialiteId) : undefined
      }
    );

    res.status(200).json(availabilityResult);
  } catch (error) {
    console.error('Error getting availability:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des disponibilités',
      details: error.message
    });
  }
});

module.exports = router;
