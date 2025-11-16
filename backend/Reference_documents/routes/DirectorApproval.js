const express = require('express');
const dayjs = require('dayjs');
const router = express.Router();

/**
 * GET /api/director/absences/pending
 * Get all pending absences for director review
 */
router.get('/absences/pending', async (req, res) => {
  try {
    console.log('🚨 GET /absences/pending called!');
    const models = req.app.get('models');
    console.log('📦 Available models:', models ? Object.keys(models) : 'NONE');
    
    const { Absence, Schedule, Matiere, User } = models;

    if (!Absence || !Schedule || !User) {
      console.error('❌ Missing required models');
      return res.status(500).json({ error: 'Required models not loaded' });
    }

    console.log('✅ All models loaded. Fetching pending absences...');
    const absences = await Absence.findAll({
      where: { statut: 'pending' },
      include: [
        {
          model: Schedule,
          as: 'schedule',
          include: [{ model: Matiere, as: 'matiere', attributes: ['id', 'name', 'code'] }]
        },
        {
          model: User,
          as: 'enseignant',
          attributes: ['id', 'nom', 'prenom', 'email']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    console.log(`✅ Found ${absences.length} pending absences`);
    res.json(absences);
  } catch (error) {
    console.error('❌ Error fetching pending absences:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/director/absences/:id/approved
 * Approve an absence
 */
router.post('/absences/:id/approved', async (req, res) => {
  try {
    const { Absence } = req.app.get('models');
    const { id } = req.params;
    const { notes } = req.body;
    const directorId = req.user?.id;

    const absence = await Absence.findByPk(id);
    if (!absence) {
      return res.status(404).json({ error: 'Absence not found' });
    }

    absence.statut = 'approved';
    absence.validated_by = directorId;
    absence.validation_date = new Date();
    absence.notes = notes;
    await absence.save();

    res.json(absence);
  } catch (error) {
    console.error('Error approving absence:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/director/absences/:id/rejected
 * Reject an absence
 */
router.post('/absences/:id/rejected', async (req, res) => {
  try {
    const { Absence } = req.app.get('models');
    const { id } = req.params;
    const { notes } = req.body;
    const directorId = req.user?.id;

    const absence = await Absence.findByPk(id);
    if (!absence) {
      return res.status(404).json({ error: 'Absence not found' });
    }

    absence.statut = 'rejected';
    absence.validated_by = directorId;
    absence.validation_date = new Date();
    absence.notes = notes;
    await absence.save();

    res.json(absence);
  } catch (error) {
    console.error('Error rejecting absence:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/director/rattrapages/pending
 * Get all pending rattrapages for director review
 */
router.get('/rattrapages/pending', async (req, res) => {
  try {
    console.log('🚨 GET /rattrapages/pending called!');
    const models = req.app.get('models');
    console.log('📦 Available models:', models ? Object.keys(models) : 'NONE');
    
    const { Rattrapage, Schedule, Matiere, User } = models;

    if (!Rattrapage || !Schedule || !User) {
      console.error('❌ Missing required models');
      return res.status(500).json({ error: 'Required models not loaded' });
    }

    console.log('✅ All models loaded. Fetching pending rattrapages...');
    const rattrapages = await Rattrapage.findAll({
      where: { statut: 'pending' },
      include: [
        {
          model: Schedule,
          as: 'original_schedule',
          include: [{ model: Matiere, as: 'matiere', attributes: ['id', 'name', 'code'] }]
        },
        {
          model: User,
          as: 'enseignant',
          attributes: ['id', 'nom', 'prenom', 'email']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    console.log(`✅ Found ${rattrapages.length} pending rattrapages`);
    res.json(rattrapages);
  } catch (error) {
    console.error('❌ Error fetching pending rattrapages:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/director/rattrapages/:id/approved
 * Approve a rattrapage and create new schedule
 */
router.post('/rattrapages/:id/approved', async (req, res) => {
  try {
    const { Rattrapage, Schedule, Classe } = req.app.get('models');
    const { id } = req.params;
    const { notes } = req.body;
    const directorId = req.user?.id;

    const rattrapage = await Rattrapage.findByPk(id, {
      include: [{ model: Schedule, as: 'original_schedule' }]
    });

    if (!rattrapage) {
      return res.status(404).json({ error: 'Rattrapage not found' });
    }

    const originalSchedule = rattrapage.original_schedule;

    // Create new schedule for rattrapage
    const newSchedule = await Schedule.create({
      classe_id: originalSchedule.classe_id,
      matiere_id: originalSchedule.matiere_id,
      enseignant_id: originalSchedule.enseignant_id,
      salle_id: originalSchedule.salle_id,
      day_of_week: dayjs(rattrapage.requested_date).format('dddd'),
      start_time: rattrapage.requested_start_time,
      end_time: rattrapage.requested_end_time,
      date_debut: rattrapage.requested_date,
      date_fin: rattrapage.requested_date,
      type_cours: 'Cours',
      statut: 'confirme',
      notes: `Rattrapage for session on ${originalSchedule.date_debut}`
    });

    rattrapage.statut = 'approved';
    rattrapage.validated_by = directorId;
    rattrapage.validation_date = new Date();
    rattrapage.new_schedule_id = newSchedule.id;
    rattrapage.notes = notes;
    await rattrapage.save();

    res.json({ rattrapage, newSchedule });
  } catch (error) {
    console.error('Error approving rattrapage:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/director/rattrapages/:id/rejected
 * Reject a rattrapage
 */
router.post('/rattrapages/:id/rejected', async (req, res) => {
  try {
    const { Rattrapage } = req.app.get('models');
    const { id } = req.params;
    const { notes } = req.body;
    const directorId = req.user?.id;

    const rattrapage = await Rattrapage.findByPk(id);
    if (!rattrapage) {
      return res.status(404).json({ error: 'Rattrapage not found' });
    }

    rattrapage.statut = 'rejected';
    rattrapage.validated_by = directorId;
    rattrapage.validation_date = new Date();
    rattrapage.notes = notes;
    await rattrapage.save();

    res.json(rattrapage);
  } catch (error) {
    console.error('Error rejecting rattrapage:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
