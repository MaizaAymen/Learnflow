const express = require('express');
const router = express.Router();
const controller = require('../controllers/eventsController');

// Non-parameterized routes (must come first)
router.post('/', controller.createEvent);
router.get('/', controller.listEvents);

// Specific query routes
router.get('/check-registration', controller.checkRegistration);
router.get('/student/:student_id', controller.getStudentEvents);

// Parameterized routes (must come last)
router.get('/:id/participants', controller.getEventParticipants);
router.get('/:id', controller.getEvent);
router.put('/:id', controller.updateEvent);
router.delete('/:id', controller.deleteEvent);
router.post('/:id/join', controller.joinEvent);
router.post('/:id/leave', controller.leaveEvent);

module.exports = router;
