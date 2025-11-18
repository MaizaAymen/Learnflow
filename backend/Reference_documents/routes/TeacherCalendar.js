const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { generateUUID } = require('../utils/uuidGenerator');

const secretKey = 'alex'; // Same as auth-service

/**
 * Helper function to extract teacher ID from Authorization header or cookies
 */
const getTeacherIdFromRequest = (req) => {
  // Try Authorization header first (Bearer token)
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const decoded = jwt.verify(token, secretKey);
      return decoded.id;
    } catch (error) {
      console.error('Authorization header token verification error:', error.message);
    }
  }

  // Fall back to cookies
  const token = req.cookies?.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, secretKey);
      return decoded.id;
    } catch (error) {
      console.error('Cookie token verification error:', error.message);
    }
  }

  return null;
};

/**
 * GET /api/teacher/schedules
 * Get all sessions for the authenticated teacher
 */
router.get('/schedules', async (req, res) => {
  try {
    const { Schedule, Matiere, Salle, Classe } = req.app.get('models');
    const enseignantId = getTeacherIdFromRequest(req);

    if (!enseignantId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const schedules = await Schedule.findAll({
      where: { enseignant_id: enseignantId },
      include: [
        { model: Matiere, as: 'matiere', attributes: ['id', 'name', 'code'] },
        { model: Salle, as: 'salle', attributes: ['id', 'nom', 'localisation'] },
        { model: Classe, as: 'classe', attributes: ['id', 'nom'] }
      ],
      order: [['date_debut', 'ASC']]
    });

    res.json(schedules);
  } catch (error) {
    console.error('Error fetching teacher schedules:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/teacher/absences
 * Get all absences for the authenticated teacher
 */
router.get('/absences', async (req, res) => {
  try {
    const { Absence, Schedule, Matiere } = req.app.get('models');
    const enseignantId = getTeacherIdFromRequest(req);

    if (!enseignantId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const absences = await Absence.findAll({
      where: { enseignant_id: enseignantId },
      include: [
        {
          model: Schedule,
          as: 'schedule',
          include: [{ model: Matiere, as: 'matiere', attributes: ['id', 'name', 'code'] }]
        }
      ],
      order: [['date_debut', 'DESC']]
    });

    res.json(absences);
  } catch (error) {
    console.error('Error fetching absences:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/teacher/absences
 * Declare an absence
 */
router.post('/absences', async (req, res) => {
  console.log('🚨 POST /absences called!');
  
  try {
    console.log('📦 Getting models from req.app.get()...');
    const models = req.app.get('models');
    console.log('📦 Models available:', models ? Object.keys(models) : 'NONE');
    
    if (!models) {
      console.error('❌ Models not found in app');
      return res.status(500).json({ error: 'Models not loaded in app' });
    }

    const { Absence, Schedule } = models;
    const enseignantId = getTeacherIdFromRequest(req);
    const { schedule_id, motif, date_debut, date_fin } = req.body;

    console.log('📝 Request data:', { schedule_id, motif, date_debut, date_fin, enseignantId });

    if (!enseignantId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!Schedule) {
      console.error('❌ Schedule model not found');
      return res.status(500).json({ error: 'Schedule model not loaded' });
    }

    if (!Absence) {
      console.error('❌ Absence model not found');
      return res.status(500).json({ error: 'Absence model not loaded' });
    }

    console.log('✅ Both models loaded');
    console.log('🔍 Finding schedule with ID:', schedule_id);
    
    const schedule = await Schedule.findByPk(schedule_id);

    console.log('🔍 Schedule found:', schedule ? 'YES' : 'NO');
    if (!schedule) {
      console.error(`❌ Schedule ${schedule_id} not found. Teacher ${enseignantId} has no access to this schedule.`);
      return res.status(404).json({ error: `Schedule ${schedule_id} not found` });
    }

    // Additional validation: Check if teacher is authorized for this schedule
    console.log(`🔐 Checking authorization: Schedule.enseignant_id=${schedule.enseignant_id}, Current teacher=${enseignantId}`);
    
    if (schedule.enseignant_id && schedule.enseignant_id !== enseignantId) {
      console.error(`❌ Authorization failed: Schedule belongs to teacher ${schedule.enseignant_id}, not ${enseignantId}`);
      return res.status(403).json({ error: 'Unauthorized: Schedule belongs to another teacher' });
    }

    console.log('✅ Authorization passed. Creating absence...');
    const absence = await Absence.create({
      id: generateUUID(),
      schedule_id,
      enseignant_id: enseignantId,
      motif,
      date_debut,
      date_fin,
      statut: 'pending'
    });

    console.log('✅ Absence created:', absence.id);
    res.status(201).json(absence);
  } catch (error) {
    console.error('❌ Error in POST /absences:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/teacher/rattrapages
 * Get all rattrapages for the authenticated teacher
 */
router.get('/rattrapages', async (req, res) => {
  try {
    const { Rattrapage, Schedule, Matiere } = req.app.get('models');
    const enseignantId = getTeacherIdFromRequest(req);

    if (!enseignantId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const rattrapages = await Rattrapage.findAll({
      where: { enseignant_id: enseignantId },
      include: [
        {
          model: Schedule,
          as: 'original_schedule',
          include: [{ model: Matiere, as: 'matiere', attributes: ['id', 'name', 'code'] }]
        }
      ],
      order: [['requested_date', 'DESC']]
    });

    res.json(rattrapages);
  } catch (error) {
    console.error('Error fetching rattrapages:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/teacher/rattrapages
 * Request a rattrapage for a missed session
 */
router.post('/rattrapages', async (req, res) => {
  console.log('🚨 POST /rattrapages called!');
  
  try {
    console.log('📦 Getting models from req.app.get()...');
    const models = req.app.get('models');
    console.log('📦 Models available:', models ? Object.keys(models) : 'NONE');
    
    if (!models) {
      console.error('❌ Models not found in app');
      return res.status(500).json({ error: 'Models not loaded in app' });
    }

    const { Rattrapage, Schedule } = models;
    const enseignantId = getTeacherIdFromRequest(req);
    const {
      original_schedule_id,
      requested_date,
      requested_start_time,
      requested_end_time,
      motif
    } = req.body;

    console.log('📝 Request data:', { original_schedule_id, requested_date, requested_start_time, requested_end_time, motif, enseignantId });

    if (!enseignantId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!Schedule) {
      console.error('❌ Schedule model not found');
      return res.status(500).json({ error: 'Schedule model not loaded' });
    }

    if (!Rattrapage) {
      console.error('❌ Rattrapage model not found');
      return res.status(500).json({ error: 'Rattrapage model not loaded' });
    }

    console.log('✅ Both models loaded');
    console.log('🔍 Finding schedule with ID:', original_schedule_id);

    // Verify schedule belongs to teacher
    const schedule = await Schedule.findByPk(original_schedule_id);

    console.log('🔍 Schedule found:', schedule ? 'YES' : 'NO');
    if (!schedule) {
      console.error(`❌ Schedule ${original_schedule_id} not found. Teacher ${enseignantId} has no access to this schedule.`);
      return res.status(404).json({ error: `Schedule ${original_schedule_id} not found` });
    }

    // Additional validation: Check if teacher is authorized for this schedule
    console.log(`🔐 Checking authorization: Schedule.enseignant_id=${schedule.enseignant_id}, Current teacher=${enseignantId}`);
    
    if (schedule.enseignant_id && schedule.enseignant_id !== enseignantId) {
      console.error(`❌ Authorization failed: Schedule belongs to teacher ${schedule.enseignant_id}, not ${enseignantId}`);
      return res.status(403).json({ error: 'Unauthorized: Schedule belongs to another teacher' });
    }

    console.log('✅ Authorization passed. Creating rattrapage...');
    const rattrapage = await Rattrapage.create({
      id: generateUUID(),
      original_schedule_id,
      enseignant_id: enseignantId,
      requested_date,
      requested_start_time,
      requested_end_time,
      motif,
      statut: 'pending'
    });

    console.log('✅ Rattrapage created:', rattrapage.id);
    res.status(201).json(rattrapage);
  } catch (error) {
    console.error('❌ Error in POST /rattrapages:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/teacher/subjects
 * Get distinct subjects taught by the teacher
 */
router.get('/subjects', async (req, res) => {
  try {
    const { Schedule, Matiere } = req.app.get('models');
    const enseignantId = getTeacherIdFromRequest(req);

    if (!enseignantId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const schedules = await Schedule.findAll({
      where: { enseignant_id: enseignantId },
      include: [{ model: Matiere, as: 'matiere', attributes: ['id', 'name', 'code'] }],
      attributes: [],
      raw: true,
      subQuery: false
    });

    const subjects = [...new Set(schedules.map(s => s['matiere.id']))].map(id => {
      const subject = schedules.find(s => s['matiere.id'] === id);
      return {
        id: subject['matiere.id'],
        name: subject['matiere.name'],
        code: subject['matiere.code']
      };
    });

    res.json(subjects);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/teacher/classes/:classId/students - removed in favor of /:classId/students
 * Route now available at /api/classes/:classId/students when using /api/classes prefix
 */

/**
 * GET /api/classes/:classId/students
 * Alternative endpoint for getting class students (public route for modals)
 */
router.get('/:classId/students', async (req, res) => {
  try {
    const models = req.app.get('models');
    if (!models) {
      return res.status(500).json({ error: 'Models not loaded in app' });
    }

    const { Classe, Student, User } = models;
    const classId = req.params.classId;

    if (!classId) {
      return res.status(400).json({ error: 'Class ID is required' });
    }

    // Find the class
    const classe = await Classe.findByPk(classId);
    if (!classe) {
      return res.status(404).json({ error: 'Class not found' });
    }

    // Try to get students from Student model first
    let students = await Student.findAll({
      where: { classe_id: classId },
      attributes: ['id', 'nom', 'prenom', 'email', 'numero_etudiant'],
      order: [['nom', 'ASC'], ['prenom', 'ASC']]
    });

    // If no students found in Student model, try User model (students are Users with role='etudiant')
    if (!students || students.length === 0) {
      console.log('📍 No students found in Student model, checking User model for classe_id:', classId);
      students = await User.findAll({
        where: { classe_id: classId, role: 'etudiant' },
        attributes: ['id', 'nom', 'prenom', 'email', 'numero_etudiant'],
        order: [['nom', 'ASC'], ['prenom', 'ASC']]
      });
    }

    console.log(`✅ Found ${students?.length || 0} students for class ${classId}`);
    res.json(students || []);
  } catch (error) {
    console.error('Error fetching class students:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/teacher/mark-student-absences
 * Mark attendance/absence for multiple students in a lesson
 */
router.post('/mark-student-absences', async (req, res) => {
  console.log('🚨 POST /mark-student-absences called!');
  
  try {
    const models = req.app.get('models');
    if (!models) {
      console.error('❌ Models not found in app');
      return res.status(500).json({ error: 'Models not loaded in app' });
    }

    const { StudentAbsence, Schedule } = models;
    const enseignantId = getTeacherIdFromRequest(req);
    const { schedule_id, absences } = req.body;

    console.log('📝 Request data:', { schedule_id, totalStudents: absences?.length, enseignantId });
    console.log('📋 Full absences array:');
    absences?.forEach((a, idx) => {
      console.log(`  [${idx}] Student ${a.student_id}: ${a.absence_type}`);
    });

    if (!enseignantId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!StudentAbsence) {
      console.error('❌ StudentAbsence model not found');
      return res.status(500).json({ error: 'StudentAbsence model not loaded' });
    }

    if (!Schedule) {
      console.error('❌ Schedule model not found');
      return res.status(500).json({ error: 'Schedule model not loaded' });
    }

    if (!Array.isArray(absences) || absences.length === 0) {
      return res.status(400).json({ error: 'Invalid absences data' });
    }

    // Verify schedule belongs to the teacher
    const schedule = await Schedule.findByPk(schedule_id);
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    if (schedule.enseignant_id !== enseignantId) {
      return res.status(403).json({ error: 'Unauthorized: Schedule belongs to another teacher' });
    }

    console.log('✅ Authorization passed. Processing', absences.length, 'absence records...');

    // Process each absence record individually
    // Only update/create records for absent/excused/late/left_early students
    const recordsToProcess = absences.filter(a => a.absence_type !== 'present');
    console.log(`📝 Processing ${recordsToProcess.length} non-present students out of ${absences.length}`);

    // Delete ALL previous records for this schedule to avoid duplicates
    const deletedCount = await StudentAbsence.destroy({
      where: { 
        schedule_id
      }
    });
    console.log(`🗑️ Deleted ${deletedCount} previous records for schedule ${schedule_id}`);

    // Bulk create absence records only for non-present students
    const createdAbsences = await StudentAbsence.bulkCreate(
      recordsToProcess.map(absence => ({
        id: generateUUID(),
        schedule_id,
        student_id: absence.student_id,
        enseignant_id: enseignantId,
        absence_type: absence.absence_type || 'absent',
        motif: absence.motif || null,
        marked_at: new Date(),
        statut: 'pending'
      }))
    );

    console.log('✅ Created', createdAbsences.length, 'attendance records (only for non-present students)');
    res.status(201).json({
      message: 'Student absences marked successfully',
      count: createdAbsences.length,
      data: createdAbsences
    });
  } catch (error) {
    console.error('❌ Error in POST /mark-student-absences:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/teacher/schedule/:scheduleId/absences
 * Get attendance records for a specific lesson
 */
router.get('/schedule/:scheduleId/absences', async (req, res) => {
  try {
    const models = req.app.get('models');
    if (!models) {
      return res.status(500).json({ error: 'Models not loaded in app' });
    }

    const { StudentAbsence, Schedule } = models;
    const enseignantId = getTeacherIdFromRequest(req);
    const { scheduleId } = req.params;

    if (!enseignantId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Verify schedule belongs to teacher
    const schedule = await Schedule.findByPk(scheduleId);
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    if (schedule.enseignant_id !== enseignantId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Get attendance records
    const absences = await StudentAbsence.findAll({
      where: { schedule_id: scheduleId },
      include: [
        {
          model: models.User,
          as: 'student',
          attributes: ['id', 'nom', 'prenom', 'email']
        }
      ],
      order: [['marked_at', 'DESC']]
    });

    res.json(absences);
  } catch (error) {
    console.error('Error fetching absence records:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/teacher/student-absence/:absenceId
 * Update an attendance record
 */
router.put('/student-absence/:absenceId', async (req, res) => {
  try {
    const models = req.app.get('models');
    if (!models) {
      return res.status(500).json({ error: 'Models not loaded in app' });
    }

    const { StudentAbsence } = models;
    const enseignantId = getTeacherIdFromRequest(req);
    const { absenceId } = req.params;
    const { absence_type, motif } = req.body;

    if (!enseignantId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const absence = await StudentAbsence.findByPk(absenceId);
    if (!absence) {
      return res.status(404).json({ error: 'Absence record not found' });
    }

    if (absence.enseignant_id !== enseignantId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await absence.update({
      absence_type: absence_type || absence.absence_type,
      motif: motif !== undefined ? motif : absence.motif
    });

    res.json(absence);
  } catch (error) {
    console.error('Error updating absence record:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/teacher/student-absence/:absenceId
 * Delete an attendance record
 */
router.delete('/student-absence/:absenceId', async (req, res) => {
  try {
    const models = req.app.get('models');
    if (!models) {
      return res.status(500).json({ error: 'Models not loaded in app' });
    }

    const { StudentAbsence } = models;
    const enseignantId = getTeacherIdFromRequest(req);
    const { absenceId } = req.params;

    if (!enseignantId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const absence = await StudentAbsence.findByPk(absenceId);
    if (!absence) {
      return res.status(404).json({ error: 'Absence record not found' });
    }

    if (absence.enseignant_id !== enseignantId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await absence.destroy();
    res.json({ message: 'Attendance record deleted' });
  } catch (error) {
    console.error('Error deleting absence record:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/student/absences/:studentId
 * Get all absences for a specific student (for student profile view)
 */
router.get('/student/absences/:studentId', async (req, res) => {
  try {
    console.log('🚨 GET /student/absences/:studentId called!');
    
    const { studentId } = req.params;
    const models = req.app.get('models');

    if (!models) {
      console.error('❌ Models not found in app');
      return res.status(500).json({ error: 'Models not loaded in app' });
    }

    const { StudentAbsence, Schedule, Matiere, User } = models;

    if (!StudentAbsence || !Schedule || !Matiere) {
      console.error('❌ Required models not found');
      return res.status(500).json({ error: 'Required models not loaded' });
    }

    console.log('📝 Fetching absences for student ID:', studentId);

    // Fetch all absences for the student
    const absences = await StudentAbsence.findAll({
      where: { student_id: studentId },
      include: [
        {
          model: Schedule,
          as: 'schedule',
          attributes: ['id', 'date_debut', 'date_fin', 'enseignant_id'],
          include: [
            {
              model: Matiere,
              as: 'matiere',
              attributes: ['id', 'name', 'code']
            }
          ]
        }
      ],
      order: [['marked_at', 'DESC']]
    });

    console.log(`✅ Found ${absences.length} absence records for student ${studentId}`);
    
    // Format response
    const formattedAbsences = absences.map(absence => ({
      id: absence.id,
      schedule_id: absence.schedule_id,
      student_id: absence.student_id,
      enseignant_id: absence.enseignant_id,
      absence_type: absence.absence_type,
      motif: absence.motif,
      marked_at: absence.marked_at,
      notes: absence.notes,
      statut: absence.statut,
      schedule: absence.schedule ? {
        id: absence.schedule.id,
        date_debut: absence.schedule.date_debut,
        date_fin: absence.schedule.date_fin,
        enseignant_id: absence.schedule.enseignant_id,
        matiere: absence.schedule.matiere
      } : null
    }));

    res.json(formattedAbsences);

  } catch (error) {
    console.error('❌ Error fetching student absences:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
