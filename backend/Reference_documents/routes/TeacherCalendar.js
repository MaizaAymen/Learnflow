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

module.exports = router;
