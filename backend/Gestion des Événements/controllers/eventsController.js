const { Event, EventRegistration } = require('../models');
const { QueryTypes } = require('sequelize');
const sequelize = require('../../auth-service/config');
const NotificationClient = require('../../Service de Notifications/services/NotificationClient');
const fs = require('fs');
const path = require('path');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

async function createEvent(req, res){
  try{
    console.log('📝 createEvent called with body:', req.body);
    console.log('📁 File:', req.file ? { name: req.file.originalname, size: req.file.size } : 'No file');
    
    const { title, type, visibility, description, start_date, end_date, is_all_day, departement_id, created_by, metadata } = req.body;
    if(!title || !type || !start_date) return res.status(400).json({ error: 'title, type and start_date are required' });

    const eventData = { 
      title, 
      type, 
      visibility, 
      description, 
      start_date, 
      is_all_day: is_all_day === 'true' || is_all_day === true, 
      departement_id: departement_id || null, 
      created_by: created_by || 1, 
      metadata 
    };
    
    // Only include end_date if it was provided and is valid
    if (end_date && end_date !== '' && end_date !== 'null') {
      eventData.end_date = end_date;
    }
    
    console.log('✅ Creating event with data:', eventData);
    
    // Handle PDF upload if file exists
    if (req.file) {
      console.log('📄 Processing PDF file:', req.file.originalname);
      const filename = `event_${Date.now()}_${req.file.originalname}`;
      const filepath = path.join(uploadsDir, filename);
      fs.writeFileSync(filepath, req.file.buffer);
      eventData.pdf_path = `/uploads/${filename}`;
      eventData.pdf_filename = req.file.originalname;
      console.log('✅ PDF saved to:', filepath);
    }

    const newEvent = await Event.create(eventData);
    console.log('✅ Event created successfully:', newEvent.id);
    
    // 📢 Send notification about new event creation based on visibility
    try {
      let recipientIds = [];
      
      if (visibility === 'public') {
        // Notify ALL students
        console.log('📢 Event is PUBLIC - notifying all students');
        const allStudents = await sequelize.query(
          `SELECT id FROM auth.utilisateur WHERE role = 'etudiant'`,
          {
            type: QueryTypes.SELECT
          }
        );
        recipientIds = allStudents.map(s => s.id);
        console.log(`📊 Found ${recipientIds.length} students to notify`);
        
      } else if (visibility === 'department' && departement_id) {
        // Notify only department students
        console.log(`📢 Event is DEPARTMENT - notifying students in department ${departement_id}`);
        const departmentStudents = await sequelize.query(
          `SELECT id FROM auth.utilisateur WHERE departement_id = ? AND role = 'etudiant'`,
          {
            replacements: [departement_id],
            type: QueryTypes.SELECT
          }
        );
        recipientIds = departmentStudents.map(s => s.id);
        console.log(`📊 Found ${recipientIds.length} department students to notify`);
        
      } else if (visibility === 'private') {
        // Private events - no automatic notifications
        console.log('🔒 Event is PRIVATE - no notifications sent');
      }
      
      // Send notifications to recipients (batch by 50 to avoid overload)
      if (recipientIds.length > 0) {
        const batchSize = 50;
        for (let i = 0; i < recipientIds.length; i += batchSize) {
          const batch = recipientIds.slice(i, i + batchSize);
          console.log(`📧 Sending notifications to ${batch.length} students...`);
          await NotificationClient.notifyEventCreated(
            newEvent.id,
            title,
            created_by || 1,
            departement_id || null,
            batch
          );
        }
        console.log(`✅ Notifications sent to ${recipientIds.length} students`);
      }
    } catch (notifError) {
      console.warn('⚠️ Could not send event creation notifications:', notifError.message);
      // Don't fail the event creation if notifications fail
    }
    
    res.status(201).json(newEvent);
  }catch(err){
    console.error('❌ Error creating event:', err);
    console.error('Error stack:', err.stack);
    res.status(500).json({ error: err.message, details: err.stack });
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
    console.log('🔄 updateEvent called with ID:', req.params.id);
    console.log('📝 Request body:', req.body);
    console.log('📁 File:', req.file ? { name: req.file.originalname, size: req.file.size } : 'No file');
    
    const { id } = req.params;
    const event = await Event.findByPk(id);
    if(!event) return res.status(404).json({ error: 'Event not found' });

    // Create update data object - only include fields that have actual values
    const updateData = {};
    
    // Only add fields from req.body if they're not empty/null/undefined
    if (req.body.title) updateData.title = req.body.title;
    if (req.body.type) updateData.type = req.body.type;
    if (req.body.visibility) updateData.visibility = req.body.visibility;
    if (req.body.description !== undefined) updateData.description = req.body.description;
    if (req.body.start_date) updateData.start_date = req.body.start_date;
    if (req.body.end_date && req.body.end_date !== '' && req.body.end_date !== 'null') {
      updateData.end_date = req.body.end_date;
    } else if (req.body.end_date === '' || req.body.end_date === 'null') {
      // Allow clearing end_date
      updateData.end_date = null;
    }
    
    if (req.body.is_all_day !== undefined) {
      updateData.is_all_day = req.body.is_all_day === 'true' || req.body.is_all_day === true;
    }
    if (req.body.departement_id) updateData.departement_id = req.body.departement_id;
    if (req.body.metadata) updateData.metadata = req.body.metadata;

    // Handle PDF upload if file exists
    if (req.file) {
      console.log('📄 Processing new PDF file:', req.file.originalname);
      // Delete old PDF if it exists
      if (event.pdf_path) {
        const oldFilePath = path.join(__dirname, '../..', event.pdf_path);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
          console.log('🗑️  Old PDF deleted:', oldFilePath);
        }
      }
      
      const filename = `event_${Date.now()}_${req.file.originalname}`;
      const filepath = path.join(uploadsDir, filename);
      fs.writeFileSync(filepath, req.file.buffer);
      updateData.pdf_path = `/uploads/${filename}`;
      updateData.pdf_filename = req.file.originalname;
      console.log('✅ New PDF saved to:', filepath);
    }

    console.log('📋 Final update data:', updateData);
    await event.update(updateData);
    console.log('✅ Event updated successfully');

    // 🔔 Send notifications to registered students about event update
    try {
      const registeredStudents = await EventRegistration.findAll({
        where: { event_id: id, status: 'registered' },
        attributes: ['student_id'],
        raw: true
      });

      if (registeredStudents.length > 0) {
        const studentIds = registeredStudents.map(r => r.student_id);
        console.log(`📧 Notifying ${studentIds.length} students about event update`);

        await NotificationClient.send({
          recipient_ids: studentIds,
          type: 'event_updated',
          title: '📅 Event Updated',
          content: `The event "${updateData.title || event.title}" has been updated`,
          metadata: {
            event_id: id,
            title: updateData.title || event.title,
            updated_fields: Object.keys(updateData),
            timestamp: new Date().toISOString()
          },
          priority: 'medium',
          action_url: `/events/${id}`
        });
      }
    } catch (notifError) {
      console.warn('⚠️ Could not send event update notifications:', notifError.message);
    }

    res.json(event);
  }catch(err){
    console.error('❌ Error updating event:', err);
    console.error('Error stack:', err.stack);
    res.status(500).json({ error: err.message, details: err.stack });
  }
}

async function deleteEvent(req, res){
  try{
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }

    const event = await Event.findByPk(id);
    if(!event) return res.status(404).json({ error: 'Event not found' });

    // Get registered students before deleting event
    const registeredStudents = await EventRegistration.findAll({
      where: { event_id: id, status: 'registered' },
      attributes: ['student_id'],
      raw: true
    });

    // First delete all registrations for this event (cascade)
    await EventRegistration.destroy({
      where: { event_id: id }
    });

    // Then delete the event itself
    await event.destroy();

    // 🔔 Send cancellation notifications to registered students
    try {
      if (registeredStudents.length > 0) {
        const studentIds = registeredStudents.map(r => r.student_id);
        console.log(`📧 Notifying ${studentIds.length} students about event cancellation`);

        await NotificationClient.send({
          recipient_ids: studentIds,
          type: 'event_cancelled',
          title: '❌ Event Cancelled',
          content: `The event "${event.title}" has been cancelled`,
          metadata: {
            event_id: id,
            title: event.title,
            cancelled_at: new Date().toISOString()
          },
          priority: 'high',
          action_url: `/events`
        });
      }
    } catch (notifError) {
      console.warn('⚠️ Could not send event cancellation notifications:', notifError.message);
    }
    
    res.json({ success: true, message: 'Event deleted successfully' });
  }catch(err){
    console.error('Delete event error:', err);
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
