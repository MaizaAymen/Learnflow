const { Event, EventRegistration } = require('../models');
const { QueryTypes } = require('sequelize');
const sequelize = require('../../auth-service/config');
const NotificationClient = require('../../Service de Notifications/services/NotificationClient');

async function createEvent(req, res){
  try{
    const { title, type, visibility, description, start_date, end_date, is_all_day, departement_id, created_by, metadata } = req.body;
    if(!title || !type || !start_date) return res.status(400).json({ error: 'title, type and start_date are required' });

    const newEvent = await Event.create({ title, type, visibility, description, start_date, end_date, is_all_day, departement_id, created_by, metadata });
    
    // 📢 Send notification about new event creation
    // Get all students in this department for notification
    if (departement_id) {
      try {
        // You may need to adjust this query based on your actual schema
        const departmentStudents = await sequelize.query(
          `SELECT id FROM utilisateurs WHERE departement_id = ? AND role = 'student'`,
          {
            replacements: [departement_id],
            type: QueryTypes.SELECT
          }
        );
        
        const studentIds = departmentStudents.map(s => s.id);
        
        // Notify all students (up to 50 at a time to avoid overload)
        if (studentIds.length > 0) {
          const notificationIds = studentIds.slice(0, 50);
          await NotificationClient.notifyEventCreated(
            newEvent.id,
            title,
            created_by,
            departement_id,
            notificationIds
          );
        }
      } catch (notifError) {
        console.warn('⚠️ Could not send event creation notifications:', notifError.message);
        // Don't fail the event creation if notifications fail
      }
    }
    
    res.status(201).json(newEvent);
  }catch(err){
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

async function listEvents(req, res){
  try{
    const { type, departement_id, visibility } = req.query;
    const where = {};
    if(type) where.type = type;
    if(departement_id) where.departement_id = departement_id;
    if(visibility) where.visibility = visibility;

    const events = await Event.findAll({ where, order: [['start_date','DESC']] });
    
    // Add participant count to each event
    const eventsWithCounts = await Promise.all(events.map(async (event) => {
      const count = await EventRegistration.count({
        where: { event_id: event.id, status: 'registered' }
      });
      return {
        ...event.toJSON(),
        participant_count: count
      };
    }));
    
    res.json(eventsWithCounts);
  }catch(err){
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

async function getEvent(req, res){
  try{
    const { id } = req.params;
    const event = await Event.findByPk(id);
    if(!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
  }catch(err){
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

async function updateEvent(req, res){
  try{
    const { id } = req.params;
    const event = await Event.findByPk(id);
    if(!event) return res.status(404).json({ error: 'Event not found' });

    await event.update(req.body);
    res.json(event);
  }catch(err){
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

async function deleteEvent(req, res){
  try{
    const { id } = req.params;
    const event = await Event.findByPk(id);
    if(!event) return res.status(404).json({ error: 'Event not found' });
    await event.destroy();
    res.json({ success: true });
  }catch(err){
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

async function joinEvent(req, res){
  try{
    const { id } = req.params;
    const { student_id } = req.body;
    if(!student_id) return res.status(400).json({ error: 'student_id is required' });

    const event = await Event.findByPk(id);
    if(!event) return res.status(404).json({ error: 'Event not found' });

    // Check if already registered
    const existing = await EventRegistration.findOne({
      where: { event_id: id, student_id }
    });
    if(existing) return res.status(400).json({ error: 'Already registered for this event' });

    const registration = await EventRegistration.create({
      event_id: id,
      student_id,
      status: 'registered'
    });
    
    // 📢 Send notifications
    try {
      // Notify the student
      await NotificationClient.notifyEventRegistration(student_id, id, event.title);
      
      // Notify event creator about new registration
      if (event.created_by) {
        const totalRegistrations = await EventRegistration.count({
          where: { event_id: id, status: 'registered' }
        });
        
        // Try to get student name for better notification
        const studentName = student_id; // Fallback to ID if can't get name
        await NotificationClient.notifyNewRegistration(
          event.created_by,
          id,
          event.title,
          `Student ${studentName}`,
          totalRegistrations
        );
      }
    } catch (notifError) {
      console.warn('⚠️ Could not send registration notifications:', notifError.message);
      // Don't fail the registration if notifications fail
    }
    
    res.status(201).json(registration);
  }catch(err){
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

async function leaveEvent(req, res){
  try{
    const { id } = req.params;
    const { student_id } = req.body;
    if(!student_id) return res.status(400).json({ error: 'student_id is required' });

    const registration = await EventRegistration.findOne({
      where: { event_id: id, student_id }
    });
    if(!registration) return res.status(404).json({ error: 'Registration not found' });

    const event = await Event.findByPk(id);
    
    // 📢 Send notifications
    try {
      // Notify the student
      if (event) {
        await NotificationClient.notifyEventUnregistration(student_id, id, event.title);
        
        // Notify event creator
        if (event.created_by) {
          const remainingRegistrations = await EventRegistration.count({
            where: { event_id: id, status: 'registered' }
          });
          
          await NotificationClient.notifyUnregistration(
            event.created_by,
            id,
            event.title,
            `Student ${student_id}`,
            Math.max(0, remainingRegistrations - 1)
          );
        }
      }
    } catch (notifError) {
      console.warn('⚠️ Could not send unregistration notifications:', notifError.message);
      // Don't fail the unregistration if notifications fail
    }

    await registration.destroy();
    res.json({ success: true });
  }catch(err){
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

async function getStudentEvents(req, res){
  try{
    const { student_id } = req.params;
    const registrations = await EventRegistration.findAll({
      where: { student_id },
      include: [
        {
          model: Event,
          as: 'event',
          required: true
        }
      ],
      order: [[sequelize.literal('"event"."start_date"'), 'DESC']]
    });

    const events = registrations.map(r => r.event);
    res.json(events);
  }catch(err){
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

async function checkRegistration(req, res){
  try{
    const { eventId, studentId } = req.query;
    if(!eventId || !studentId) {
      return res.status(400).json({ error: 'eventId and studentId are required' });
    }

    const registration = await EventRegistration.findOne({
      where: { event_id: eventId, student_id: studentId }
    });

    res.json({ registered: !!registration });
  }catch(err){
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

async function getEventParticipants(req, res){
  try{
    const { id } = req.params;
    const event = await Event.findByPk(id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    const registrations = await EventRegistration.findAll({
      where: { event_id: id, status: 'registered' },
      attributes: ['id', 'student_id', 'registered_at', 'createdAt']
    });
    res.json({
      event_id: id,
      event_title: event.title,
      participant_count: registrations.length,
      participants: registrations
    });
  }catch(err){
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  createEvent,
  listEvents,
  getEvent,
  updateEvent,
  deleteEvent,
  joinEvent,
  leaveEvent,
  getStudentEvents,
  checkRegistration,
  getEventParticipants
};
