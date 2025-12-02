const express = require('express');
const router = express.Router();
const multer = require('multer');
const controller = require('../controllers/eventsController');

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Non-parameterized routes (must come first)
router.post('/', upload.single('pdf'), controller.createEvent);
router.get('/', controller.listEvents);

// Specific query routes
router.get('/check-registration', controller.checkRegistration);
router.get('/student/:student_id', controller.getStudentEvents);

// Parameterized routes (must come last)
router.get('/:id/participants', controller.getEventParticipants);
router.get('/:id', controller.getEvent);
router.put('/:id', upload.single('pdf'), controller.updateEvent);
router.delete('/:id', controller.deleteEvent);
router.post('/:id/join', controller.joinEvent);
router.post('/:id/leave', controller.leaveEvent);

module.exports = router;
