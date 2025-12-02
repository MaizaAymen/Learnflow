const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// ✅ IMPORTANT: Import models directly from models directory
const {
  Classe,
  Matiere,
  Schedule,
  Student,
  StudentAbsence,
  User,
} = require('../models');

const secretKey = 'alex';

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
 * GET /api/teacher/:teacherId/classes
 * Get all classes taught by a specific teacher
 */
router.get('/:teacherId/classes', async (req, res) => {
  try {
    const { teacherId } = req.params;
    console.log(`📚 Fetching classes for teacher: ${teacherId}`);

    // Get all schedules for this teacher
    const schedules = await Schedule.findAll({
      where: { enseignant_id: teacherId },
      include: [{ model: Classe, as: 'classe', attributes: ['id', 'nom'] }],
      attributes: ['classe_id'],
      subQuery: false,
      raw: false,
    });

    // Get unique classes
    const classIds = [...new Set(schedules.map((s) => s.classe_id))];

    const classes = await Classe.findAll({
      where: { id: classIds },
      attributes: ['id', 'nom'],
    });

    // Enrich classes with student count and subjects
    const enrichedClasses = await Promise.all(
      classes.map(async (classe) => {
        const studentCount = await Student.count({
          where: { classe_id: classe.id },
        });

        const classSchedules = await Schedule.findAll({
          where: { enseignant_id: teacherId, classe_id: classe.id },
          include: [{ model: Matiere, as: 'matiere' }],
          raw: false,
        });

        const subjects = [...new Set(classSchedules.map((s) => s.matiere?.name).filter(Boolean))];

        return {
          id: classe.id,
          nom: classe.nom,
          student_count: studentCount,
          subjects,
        };
      })
    );

    res.json(enrichedClasses);
  } catch (error) {
    console.error('Error fetching teacher classes:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/teacher/:teacherId/subjects
 * Get all subjects taught by a specific teacher
 */
router.get('/:teacherId/subjects', async (req, res) => {
  try {
    const { teacherId } = req.params;
    console.log(`📖 Fetching subjects for teacher: ${teacherId}`);

    // Get all schedules for this teacher with matière details
    const schedules = await Schedule.findAll({
      where: { enseignant_id: teacherId },
      include: [{ model: Matiere, as: 'matiere' }],
      raw: false,
    });

    // Extract unique subjects with aggregated data
    const subjectsMap = new Map();

    schedules.forEach((schedule) => {
      if (schedule.matiere) {
        const key = schedule.matiere.id;
        if (!subjectsMap.has(key)) {
          subjectsMap.set(key, {
            id: schedule.matiere.id,
            name: schedule.matiere.name,
            code: schedule.matiere.code,
            niveau: schedule.matiere.niveau,
            hours: schedule.matiere.hours || 0,
            count: 1,
          });
        } else {
          const existing = subjectsMap.get(key);
          existing.count += 1;
        }
      }
    });

    const subjects = Array.from(subjectsMap.values());
    res.json(subjects);
  } catch (error) {
    console.error('Error fetching teacher subjects:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/teacher/:teacherId/students
 * Get all students grouped by class for a specific teacher
 */
router.get('/:teacherId/students', async (req, res) => {
  try {
    const { teacherId } = req.params;
    console.log(`👥 Fetching students for teacher: ${teacherId}`);

    // Get all classes taught by this teacher
    const schedules = await Schedule.findAll({
      where: { enseignant_id: teacherId },
      attributes: ['classe_id'],
      raw: true,
    });

    console.log(`📋 Found ${schedules.length} schedules for teacher`);
    const classIds = [...new Set(schedules.map((s) => s.classe_id))];
    console.log(`📚 Unique class IDs: ${classIds}`);

    const classes = await Classe.findAll({
      where: { id: classIds },
      include: [
        {
          model: Student,
          as: 'directStudents',
          attributes: ['id', 'nom', 'prenom', 'email', 'numero_etudiant'],
        },
      ],
    });

    console.log(`📚 Found ${classes.length} classes`);

    // Build response grouped by class
    const studentsGrouped = {};

    for (const classe of classes) {
      console.log(`📚 Class: ${classe.nom}, DirectStudents:`, classe.directStudents);
      
      // Always include the class, even if no students
      if (classe.directStudents && classe.directStudents.length > 0) {
        console.log(`  ✅ Class ${classe.nom} has ${classe.directStudents.length} students`);
        studentsGrouped[classe.nom] = await Promise.all(
          classe.directStudents.map(async (student) => {
            // Calculate attendance rate
            const totalSchedules = schedules.filter((s) => s.classe_id === classe.id).length;
            const absences = await StudentAbsence.count({
              where: { student_id: student.id, enseignant_id: teacherId },
            });

            const attendanceRate = totalSchedules > 0
              ? (((totalSchedules - absences) / totalSchedules) * 100).toFixed(1)
              : 100;

            return {
              id: student.id,
              nom: student.nom,
              prenom: student.prenom,
              email: student.email,
              numero_etudiant: student.numero_etudiant,
              attendance_rate: attendanceRate,
            };
          })
        );
      } else {
        // Include class with empty students array
        console.log(`  ⚠️  Class ${classe.nom} has no students`);
        studentsGrouped[classe.nom] = [];
      }
    }

    console.log(`✅ Returning students grouped by class:`, studentsGrouped);
    res.json(studentsGrouped);
  } catch (error) {
    console.error('Error fetching teacher students:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/teacher/:teacherId/absences
 * Get all student absences for a specific teacher's classes
 */
router.get('/:teacherId/absences', async (req, res) => {
  try {
    const { teacherId } = req.params;
    console.log(`📋 Fetching absences for teacher: ${teacherId}`);

    // Get all schedules for this teacher
    const schedules = await Schedule.findAll({
      where: { enseignant_id: teacherId },
      attributes: ['id'],
      raw: true,
    });

    const scheduleIds = schedules.map((s) => s.id);

    // Get all absences for these schedules
    const absences = await StudentAbsence.findAll({
      where: { schedule_id: scheduleIds },
      include: [
        { model: User, as: 'student', attributes: ['id', 'nom', 'prenom'] },
        { model: Schedule, as: 'schedule' },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json(absences);
  } catch (error) {
    console.error('Error fetching absences:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/teacher/:teacherId/absence-alerts
 * Get high-absence student alerts for a teacher
 */
router.get('/:teacherId/absence-alerts', async (req, res) => {
  try {
    const { teacherId } = req.params;
    console.log(`⚠️  Fetching absence alerts for teacher: ${teacherId}`);

    // Get all classes taught by this teacher
    const schedules = await Schedule.findAll({
      where: { enseignant_id: teacherId },
      attributes: ['classe_id', 'id'],
      raw: false,
    });

    const classIds = [...new Set(schedules.map((s) => s.classe_id))];
    const scheduleIds = schedules.map((s) => s.id);

    // Get all students in these classes
    const students = await Student.findAll({
      where: { classe_id: classIds },
      attributes: ['id', 'nom', 'prenom'],
    });

    // Calculate absence rate for each student
    const alerts = await Promise.all(
      students.map(async (student) => {
        const totalSchedules = schedules.filter(
          (s) => s.classe_id === student.classe_id
        ).length;

        const absenceCount = await StudentAbsence.count({
          where: { 
            schedule_id: scheduleIds,
            student_id: student.id,
            enseignant_id: teacherId
          },
        });

        const absenceRate = totalSchedules > 0
          ? ((absenceCount / totalSchedules) * 100).toFixed(1)
          : 0;

        return {
          student_id: student.id,
          student_name: `${student.prenom} ${student.nom}`,
          absence_rate: absenceRate,
          absence_count: absenceCount,
        };
      })
    );

    // Filter for critical (>75%) and warning (>60%) absences
    const criticalAlerts = alerts.filter((a) => parseFloat(a.absence_rate) > 75);
    const warningAlerts = alerts.filter(
      (a) => parseFloat(a.absence_rate) > 60 && parseFloat(a.absence_rate) <= 75
    );

    const result = [
      ...criticalAlerts.map((a) => ({ ...a, severity: 'critical' })),
      ...warningAlerts.map((a) => ({ ...a, severity: 'warning' })),
    ].sort((a, b) => parseFloat(b.absence_rate) - parseFloat(a.absence_rate));

    res.json(result);
  } catch (error) {
    console.error('Error fetching absence alerts:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
