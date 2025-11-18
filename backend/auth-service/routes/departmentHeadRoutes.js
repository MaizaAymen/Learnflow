const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const sequelize = require("../config");
const User = require("../models/userModel");

let Student, Classe, Niveau, Specialite, Departement, StudentAbsence, Schedule, Matiere;

try {
  const models = require("../../Reference_documents/models");
  Student = models.Student;
  Classe = models.Classe;
  Niveau = models.Niveau;
  Specialite = models.Specialite;
  Departement = models.Departement;
  StudentAbsence = models.StudentAbsence;
  Schedule = models.Schedule;
  Matiere = models.Matiere;
} catch (error) {
  console.warn("⚠️ Warning: Could not load Reference_documents models", error.message);
}

const secretKey = "alex";

/**
 * Test route - Simple ping
 */
router.get("/test", (req, res) => {
  res.json({ message: "Department Head Routes - OK", timestamp: new Date().toISOString() });
});

/**
 * Middleware to verify token and extract user info
 */
const verifyToken = (req, res, next) => {
  try {
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: "Token d'authentification manquant" });
    }

    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: "Token invalide" });
      }
      req.user = decoded;
      next();
    });
  } catch (error) {
    res.status(500).json({ error: "Erreur d'authentification" });
  }
};

/**
 * GET /api/department-head/department
 * Get the department for the authenticated department head
 */
router.get("/department", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Find the department where this user is chef
    const department = await Departement.findOne({
      where: { chef_departement_id: userId }
    });

    if (!department) {
      return res.status(404).json({ error: "Aucun département trouvé pour cet utilisateur" });
    }

    res.json(department);
  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({ error: "Erreur lors de la récupération du département" });
  }
});

/**
 * GET /api/department-head/students
 * Get all students with their absence stats
 * PUBLIC ENDPOINT - VISIBLE TO EVERYONE - NO AUTH REQUIRED
 * Supports filtering by: groupe, spécialité, statut, recherche
 */
router.get("/students", async (req, res) => {
  try {
    console.log("📍 /students endpoint called");

    // Get students directly from User model (simpler approach - avoid deep nesting)
    const allStudents = await User.findAll({
      where: { role: 'etudiant' },
      attributes: ['id', 'nom', 'prenom', 'email', 'classe_id', 'statut'],
      order: [['nom', 'ASC']],
      limit: 100,
      raw: true
    });

    console.log("✅ Found students:", allStudents.length);

    // Get classe info separately to avoid nested join issues
    let students = [];
    for (const student of allStudents) {
      let specialite = 'N/A';
      let groupe = 'N/A';

      if (student.classe_id) {
        try {
          const classe = await Classe.findByPk(student.classe_id, {
            attributes: ['id', 'nom', 'niveau_id'],
            raw: true
          });

          if (classe) {
            groupe = classe.nom;
            
            // Get niveau
            const niveau = await Niveau.findByPk(classe.niveau_id, {
              attributes: ['id', 'name'],
              raw: true
            });

            if (niveau) {
              // Get specialite - query directly from DB since model might have issues
              const specialiteData = await sequelize.query(
                `SELECT "name" FROM "referentiels"."specialite" 
                 WHERE "id" IN (
                   SELECT "specialiteId" FROM "referentiels"."niveau" WHERE "id" = :niveauId
                 )`,
                { replacements: { niveauId: niveau.id }, type: sequelize.QueryTypes.SELECT }
              );
              
              if (specialiteData.length > 0) {
                specialite = specialiteData[0].name;
              }
            }
          }
        } catch (err) {
          console.warn("⚠️ Warning: Could not fetch classe info for student", student.id, err.message);
        }
      }

      // Calculate absence statistics for this student
      try {
        const totalAbsences = await StudentAbsence.count({
          where: { student_id: student.id }
        });

        // Get total scheduled classes for this student's classe
        const totalSchedules = await Schedule.count({
          where: { classe_id: student.classe_id }
        });

        console.log(`📊 Student ${student.id} (${student.nom}): ${totalAbsences} absences out of ${totalSchedules} schedules`);

        const absencePercentage = totalSchedules > 0 
          ? Math.round((totalAbsences / totalSchedules) * 100) 
          : 0;

        let eliminationStatus = "OK";
        if (absencePercentage >= 50) {
          eliminationStatus = "Éliminé";
        } else if (absencePercentage >= 30) {
          eliminationStatus = "Risque";
        }

        console.log(`  → ${absencePercentage}% absence rate → Status: ${eliminationStatus}`);

        students.push({
          id: student.id,
          nom: student.nom,
          prenom: student.prenom,
          email: student.email,
          specialite: specialite,
          groupe: groupe,
          totalAbsences: totalAbsences,
          threshold: totalSchedules,
          absencePercentage: absencePercentage,
          eliminationStatus: eliminationStatus,
          statut: student.statut
        });
      } catch (err) {
        console.warn("⚠️ Warning: Could not calculate absences for student", student.id, err.message);
        students.push({
          id: student.id,
          nom: student.nom,
          prenom: student.prenom,
          email: student.email,
          specialite: specialite,
          groupe: groupe,
          totalAbsences: 0,
          threshold: 0,
          absencePercentage: 0,
          eliminationStatus: "OK",
          statut: student.statut
        });
      }
    }

    // Apply filters
    const { groupe, specialite, statut, search } = req.query;
    let filteredStudents = students;

    if (statut) {
      filteredStudents = filteredStudents.filter(s => s.eliminationStatus === statut);
    }

    if (groupe) {
      filteredStudents = filteredStudents.filter(s => s.groupe === groupe);
    }

    if (specialite) {
      filteredStudents = filteredStudents.filter(s => s.specialite === specialite);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredStudents = filteredStudents.filter(s => 
        s.nom.toLowerCase().includes(searchLower) || 
        s.prenom.toLowerCase().includes(searchLower)
      );
    }

    console.log("✅ Returning", filteredStudents.length, "students with calculated absence stats");
    res.json(filteredStudents);

  } catch (error) {
    console.error("❌ Error in /students:", error.message);
    console.error("Stack:", error.stack);
    res.status(500).json({ 
      error: error.message
    });
  }
});

/**
 * GET /api/department-head/student/:studentId
 * Get detailed info for a specific student including all absences by subject
 * PUBLIC ENDPOINT - VISIBLE TO EVERYONE - NO AUTH REQUIRED
 */
router.get("/student/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;

    // Get student info
    const student = await User.findByPk(studentId, {
      attributes: ['id', 'nom', 'prenom', 'email', 'classe_id', 'statut'],
      raw: true
    });

    if (!student) {
      return res.status(404).json({ error: "Étudiant non trouvé" });
    }

    // Get classe/niveau/specialite info
    let specialite = 'N/A';
    let groupe = 'N/A';

    if (student.classe_id) {
      try {
        const classe = await Classe.findByPk(student.classe_id, {
          attributes: ['id', 'nom', 'niveau_id'],
          raw: true
        });

        if (classe) {
          groupe = classe.nom;
          
          const niveau = await Niveau.findByPk(classe.niveau_id, {
            attributes: ['id', 'name'],
            raw: true
          });

          if (niveau) {
            const specialiteData = await sequelize.query(
              `SELECT "name" FROM "referentiels"."specialite" 
               WHERE "id" IN (
                 SELECT "specialiteId" FROM "referentiels"."niveau" WHERE "id" = :niveauId
               )`,
              { replacements: { niveauId: niveau.id }, type: sequelize.QueryTypes.SELECT }
            );
            
            if (specialiteData.length > 0) {
              specialite = specialiteData[0].name;
            }
          }
        }
      } catch (err) {
        console.warn("⚠️ Warning: Could not fetch classe info", err.message);
      }
    }

    // Get all absences for this student (simplified query without includes)
    let absences = [];
    let absencesBySubject = {};
    let absencesData = [];

    try {
      absences = await StudentAbsence.findAll({
        where: { student_id: studentId },
        attributes: ['id', 'schedule_id', 'absence_type', 'statut', 'motif', 'marked_at'],
        raw: true,
        order: [['marked_at', 'DESC']],
        limit: 50
      });

      // For each absence, fetch related schedule and matiere data separately
      for (const absence of absences) {
        try {
          const schedule = await Schedule.findByPk(absence.schedule_id, {
            attributes: ['id', 'date', 'start_time', 'end_time', 'matiere_id'],
            raw: true
          });

          if (schedule) {
            const matiere = await Matiere.findByPk(schedule.matiere_id, {
              attributes: ['id', 'name'],
              raw: true
            });

            const subject = matiere?.name || 'Unknown';
            
            if (!absencesBySubject[subject]) {
              absencesBySubject[subject] = {
                subject: subject,
                totalAbsences: 0,
                absencePercentage: 0,
                eliminationStatus: "OK"
              };
            }

            absencesBySubject[subject].totalAbsences++;

            absencesData.push({
              date: schedule.date,
              subject: subject,
              horaire: `${schedule.start_time} - ${schedule.end_time}`,
              motif: absence.motif || 'Non spécifié',
              status: absence.absence_type,
              statut: absence.statut
            });
          }
        } catch (err) {
          console.warn("⚠️ Warning: Could not fetch schedule/matiere for absence", absence.id, err.message);
        }
      }
    } catch (err) {
      console.warn("⚠️ Warning: Could not fetch absences:", err.message);
    }

    res.json({
      student: {
        id: student.id,
        nom: student.nom,
        prenom: student.prenom,
        email: student.email,
        specialite: specialite,
        groupe: groupe
      },
      absences: absencesData,
      absencesBySubject: Object.values(absencesBySubject)
    });

  } catch (error) {
    console.error("❌ Error in /student/:studentId:", error.message);
    res.status(500).json({ error: "Erreur lors de la récupération des détails de l'étudiant" });
  }
});

/**
 * GET /api/department-head/statistics
 * Get department-wide absence and elimination statistics
 */
router.get("/statistics", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Find the department for this head
    const department = await Departement.findOne({
      where: { chef_departement_id: userId }
    });

    if (!department) {
      return res.status(404).json({ error: "Aucun département trouvé" });
    }

    // Get all classes in the department
    const departmentClasses = await Classe.findAll({
      include: [{
        model: Niveau,
        as: 'niveau',
        include: [{
          model: Specialite,
          as: 'specialite',
          where: { departement_id: department.id }
        }]
      }]
    });

    const classIds = departmentClasses.map(c => c.id);

    // Get all students in the department
    const allStudents = await User.findAll({
      where: {
        classe_id: { [sequelize.Op.in]: classIds },
        role: 'etudiant'
      },
      attributes: ['id', 'classe_id'],
      raw: true
    });

    const totalStudents = allStudents.length;
    let eliminatedCount = 0;
    let atRiskCount = 0;
    const absenceStats = [];

    // Calculate stats for each student
    for (const student of allStudents) {
      const totalAbsences = await StudentAbsence.count({
        where: {
          student_id: student.id,
          absence_type: { [sequelize.Op.in]: ['absent', 'excused'] }
        }
      });

      const enrollmentCount = await Schedule.count({
        where: { classe_id: student.classe_id }
      });

      const absencePercentage = enrollmentCount > 0 ? (totalAbsences / enrollmentCount) * 100 : 0;
      
      absenceStats.push(absencePercentage);

      if (absencePercentage >= 50) {
        eliminatedCount++;
      } else if (absencePercentage >= 30) {
        atRiskCount++;
      }
    }

    // Calculate averages
    const averageAbsenteeismRate = absenceStats.length > 0 
      ? Math.round(absenceStats.reduce((a, b) => a + b, 0) / absenceStats.length)
      : 0;

    // Get absence trends by week (for graph)
    const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const absencesByDate = await StudentAbsence.findAll({
      where: {
        created_at: { [sequelize.Op.gte]: twoWeeksAgo }
      },
      attributes: [
        [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
        [sequelize.fn('COUNT', '*'), 'count']
      ],
      group: [sequelize.fn('DATE', sequelize.col('created_at'))],
      raw: true,
      order: [['date', 'ASC']]
    });

    // Get students by specialite (for pie chart)
    const studentsBySpecialite = {};
    for (const student of allStudents) {
      // For statistics, we can just track by department for now
      // since getting specialite for each student would be inefficient
      studentsBySpecialite['Department'] = (studentsBySpecialite['Department'] || 0) + 1;
    }

    res.json({
      totalStudents,
      eliminatedCount,
      atRiskCount,
      okCount: totalStudents - eliminatedCount - atRiskCount,
      averageAbsenteeismRate,
      absencesByDate: absencesByDate,
      studentsBySpecialite: studentsBySpecialite
    });

  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({ error: "Erreur lors de la récupération des statistiques" });
  }
});

/**
 * GET /api/department-head/export-csv
 * Export students data to CSV
 */
router.get("/export-csv", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const department = await Departement.findOne({
      where: { chef_departement_id: userId }
    });

    if (!department) {
      return res.status(404).json({ error: "Aucun département trouvé" });
    }

    const departmentClasses = await Classe.findAll({
      include: [{
        model: Niveau,
        as: 'niveau',
        include: [{
          model: Specialite,
          as: 'specialite',
          where: { departement_id: department.id }
        }]
      }]
    });

    const classIds = departmentClasses.map(c => c.id);

    const students = await User.findAll({
      where: {
        classe_id: { [sequelize.Op.in]: classIds },
        role: 'etudiant'
      },
      attributes: ['id', 'nom', 'prenom', 'email', 'classe_id'],
      raw: true
    });

    // Build CSV content
    let csv = "Nom,Prénom,Email,Spécialité,Groupe,Total Absences,Seuil,Statut d'Élimination\n";

    for (const student of students) {
      const totalAbsences = await StudentAbsence.count({
        where: {
          student_id: student.id,
          absence_type: { [sequelize.Op.in]: ['absent', 'excused'] }
        }
      });

      const enrollmentCount = await Schedule.count({
        where: { classe_id: student.classe_id }
      });

      const threshold = Math.ceil(enrollmentCount * 0.3);
      const absencePercentage = enrollmentCount > 0 ? (totalAbsences / enrollmentCount) * 100 : 0;
      
      let eliminationStatus = "OK";
      if (absencePercentage >= 50) {
        eliminationStatus = "Éliminé";
      } else if (absencePercentage >= 30) {
        eliminationStatus = "Risque";
      }

      // Get classe/niveau/specialite info
      let specialite = 'N/A';
      let groupe = 'N/A';

      if (student.classe_id) {
        try {
          const classe = await Classe.findByPk(student.classe_id, {
            attributes: ['nom', 'niveau_id'],
            raw: true
          });

          if (classe) {
            groupe = classe.nom;
            
            const niveau = await Niveau.findByPk(classe.niveau_id, {
              attributes: ['id'],
              raw: true
            });

            if (niveau) {
              const specialiteData = await sequelize.query(
                `SELECT "name" FROM "referentiels"."specialite" 
                 WHERE "id" IN (
                   SELECT "specialiteId" FROM "referentiels"."niveau" WHERE "id" = :niveauId
                 )`,
                { replacements: { niveauId: niveau.id }, type: sequelize.QueryTypes.SELECT }
              );
              
              if (specialiteData.length > 0) {
                specialite = specialiteData[0].name;
              }
            }
          }
        } catch (err) {
          console.warn("⚠️ Warning: Could not fetch classe info for CSV", err.message);
        }
      }

      csv += `${student.nom},${student.prenom},${student.email},${specialite},${groupe},${totalAbsences},${threshold},${eliminationStatus}\n`;
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="department_students_${new Date().toISOString()}.csv"`);
    res.send(csv);

  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({ error: "Erreur lors de l'export CSV" });
  }
});

module.exports = router;
