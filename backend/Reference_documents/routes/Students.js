const express = require('express');
const router = express.Router();
const { Classe, Niveau, Specialite, Departement, StudentAbsence, Schedule } = require('../models');
const { Parser } = require('json2csv');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const crypto = require('crypto'); // Use crypto instead of uuid
const bcrypt = require('bcrypt');

// UUID v4 generator using crypto
const uuidv4 = () => crypto.randomUUID();

// Import User model from auth-service (students are users with role='etudiant')
const User = require('../../auth-service/models/userModel');
const sequelize = require('../../auth-service/config');

// Configure multer for CSV uploads
const upload = multer({ dest: 'uploads/' });

// ============================================================================
// HELPER: Generate random password
// ============================================================================
const generateRandomPassword = () => {
  return Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);
};

// ============================================================================
// 1. IMPORT CSV - Upload and Parse
// ============================================================================

router.post('/import-csv', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const results = [];
    const batchId = uuidv4();
    let successCount = 0;
    const errors = [];

    // Parse CSV file
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        try {
          for (let i = 0; i < results.length; i++) {
            const row = results[i];
            const rowNum = i + 2;

            // Validate required fields
            if (!row.nom || !row.prenom || !row.email || !row.numero_etudiant) {
              errors.push({
                row: rowNum,
                message: 'Missing required fields (nom, prenom, email, numero_etudiant)'
              });
              continue;
            }

            // Check for duplicate email
            const existingEmail = await User.findOne({
              where: { email: row.email }
            });

            if (existingEmail) {
              errors.push({
                row: rowNum,
                message: `Email already exists: ${row.email}`
              });
              continue;
            }

            // Check for duplicate numero_etudiant
            const existingNumero = await User.findOne({
              where: { numero_etudiant: row.numero_etudiant }
            });

            if (existingNumero) {
              errors.push({
                row: rowNum,
                message: `Numero_etudiant already exists: ${row.numero_etudiant}`
              });
              continue;
            }

            // Generate password hash if not provided
            let mdp_hash = row.mdp_hash;
            if (!mdp_hash) {
              const tempPassword = generateRandomPassword();
              mdp_hash = await bcrypt.hash(tempPassword, 10);
              // TODO: Send email with tempPassword
            }

            // Create student (user with role='etudiant')
            await User.create({
              nom: row.nom,
              prenom: row.prenom,
              email: row.email,
              numero_etudiant: row.numero_etudiant,
              login: row.email, // Use email as login
              mdp_hash,
              role: 'etudiant', // ✅ Critical: Set role
              phone: row.phone || row.telephone || null,
              date_naissance: row.date_naissance || null,
              adresse: row.adresse || null,
              ville: row.ville || null,
              pays: row.pays || null,
              niveau_id: row.niveau_id ? parseInt(row.niveau_id) : null,
              classe_id: null, // Will be assigned later
              statut: row.statut || 'actif',
              notes: row.notes || null,
              is_temporary: true,
              import_batch_id: batchId
            });

            successCount++;
          }

          // Delete uploaded file
          fs.unlinkSync(req.file.path);

          res.json({
            message: 'Import successful',
            batchId,
            successCount,
            errorCount: errors.length,
            errors: errors.length > 0 ? errors : undefined
          });

        } catch (error) {
          console.error('Error processing CSV:', error);
          fs.unlinkSync(req.file.path);
          res.status(500).json({ error: 'Failed to process CSV', details: error.message });
        }
      })
      .on('error', (error) => {
        console.error('Error reading CSV:', error);
        fs.unlinkSync(req.file.path);
        res.status(500).json({ error: 'Failed to read CSV file' });
      });

  } catch (error) {
    console.error('Error in import-csv:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// ============================================================================
// 2. AUTO ASSIGNMENT - Assign students to classes
// ============================================================================

router.post('/assign-groups', async (req, res) => {
  try {
    const { algorithm, classeIds, seed } = req.body;

    if (!algorithm || !classeIds || classeIds.length === 0) {
      return res.status(400).json({ error: 'algorithm and classeIds are required' });
    }

    // Get temporary students
    const students = await User.findAll({
      where: {
        role: 'etudiant',
        is_temporary: true
      }
    });

    if (students.length === 0) {
      return res.status(400).json({ error: 'No temporary students to assign' });
    }

    let assignedCount = 0;

    // ALGORITHM 1: Random assignment
    if (algorithm === 'random') {
      const seededRandom = seed ? (() => {
        let s = seed;
        return () => {
          s = (s * 9301 + 49297) % 233280;
          return s / 233280;
        };
      })() : Math.random;

      for (const student of students) {
        const randomIndex = Math.floor(seededRandom() * classeIds.length);
        await student.update({ classe_id: classeIds[randomIndex] });
        assignedCount++;
      }
    }

    // ALGORITHM 2: Balanced distribution
    else if (algorithm === 'balanced') {
      const studentsPerClass = Math.ceil(students.length / classeIds.length);
      let currentClassIndex = 0;
      let countInCurrentClass = 0;

      for (const student of students) {
        await student.update({ classe_id: classeIds[currentClassIndex] });
        assignedCount++;
        countInCurrentClass++;

        if (countInCurrentClass >= studentsPerClass) {
          currentClassIndex++;
          countInCurrentClass = 0;
          if (currentClassIndex >= classeIds.length) {
            currentClassIndex = classeIds.length - 1;
          }
        }
      }
    }

    // ALGORITHM 3: By niveau (group by niveau_id)
    else if (algorithm === 'by_niveau') {
      // Get classes with their niveau_id
      const classes = await Classe.findAll({
        where: { id: classeIds }
      });

      // Group students by niveau_id
      const studentsByNiveau = {};
      for (const student of students) {
        const niveauId = student.niveau_id || 'null';
        if (!studentsByNiveau[niveauId]) {
          studentsByNiveau[niveauId] = [];
        }
        studentsByNiveau[niveauId].push(student);
      }

      // Assign students to classes of the same niveau
      for (const [niveauId, studentsInNiveau] of Object.entries(studentsByNiveau)) {
        const matchingClasses = classes.filter(c => String(c.niveau_id) === String(niveauId));
        
        if (matchingClasses.length === 0) {
          // If no matching classe, assign to first available
          for (const student of studentsInNiveau) {
            await student.update({ classe_id: classeIds[0] });
            assignedCount++;
          }
        } else {
          // Distribute evenly among matching classes
          const studentsPerClass = Math.ceil(studentsInNiveau.length / matchingClasses.length);
          let currentClassIndex = 0;
          let countInCurrentClass = 0;

          for (const student of studentsInNiveau) {
            await student.update({ classe_id: matchingClasses[currentClassIndex].id });
            assignedCount++;
            countInCurrentClass++;

            if (countInCurrentClass >= studentsPerClass) {
              currentClassIndex++;
              countInCurrentClass = 0;
              if (currentClassIndex >= matchingClasses.length) {
                currentClassIndex = matchingClasses.length - 1;
              }
            }
          }
        }
      }
    }

    else {
      return res.status(400).json({ error: 'Invalid algorithm. Use: random, balanced, or by_niveau' });
    }

    res.json({
      message: 'Students assigned successfully',
      assignedCount
    });

  } catch (error) {
    console.error('Error in assign-groups:', error);
    res.status(500).json({ error: 'Failed to assign students', details: error.message });
  }
});

// ============================================================================
// 3. MANUAL GROUP CHANGE - Update student's classe_id
// ============================================================================

router.put('/:id/group', async (req, res) => {
  try {
    const { id } = req.params;
    const { classe_id } = req.body;

    const student = await User.findOne({
      where: { id, role: 'etudiant' }
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    await student.update({ classe_id: classe_id || null });

    res.json({
      message: 'Student group updated',
      student
    });

  } catch (error) {
    console.error('Error updating student group:', error);
    res.status(500).json({ error: 'Failed to update student group' });
  }
});

// ============================================================================
// 4. CREATE STUDENT MANUALLY
// ============================================================================

router.post('/', async (req, res) => {
  try {
    const { nom, prenom, email, numero_etudiant, date_naissance, phone, adresse,
            niveau_id, classe_id, statut, notes } = req.body;

    // Validate required fields
    if (!nom || !prenom || !email || !numero_etudiant) {
      return res.status(400).json({ error: 'nom, prenom, email, and numero_etudiant are required' });
    }

    // Check duplicates
    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const existingNumero = await User.findOne({ where: { numero_etudiant } });
    if (existingNumero) {
      return res.status(400).json({ error: 'Numero_etudiant already exists' });
    }

    // Generate password
    const tempPassword = generateRandomPassword();
    const mdp_hash = await bcrypt.hash(tempPassword, 10);

    // Create student
    const student = await User.create({
      nom,
      prenom,
      email,
      numero_etudiant,
      login: email,
      mdp_hash,
      role: 'etudiant',
      phone,
      date_naissance,
      adresse,
      niveau_id,
      classe_id,
      statut: statut || 'actif',
      notes,
      is_temporary: false
    });

    res.status(201).json({
      message: 'Student created successfully',
      student,
      tempPassword // TODO: Send via email instead
    });

  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({ error: 'Failed to create student', details: error.message });
  }
});

// ============================================================================
// 5. COMMIT - Make all temporary students permanent
// ============================================================================

router.post('/commit', async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const [updatedCount] = await User.update(
      { is_temporary: false },
      {
        where: {
          role: 'etudiant',
          is_temporary: true
        },
        transaction: t
      }
    );

    await t.commit();

    res.json({
      message: 'Students committed successfully',
      committedCount: updatedCount
    });

  } catch (error) {
    await t.rollback();
    console.error('Error committing students:', error);
    res.status(500).json({ error: 'Failed to commit students', details: error.message });
  }
});

// ============================================================================
// 6. EXPORT CSV
// ============================================================================

router.get('/export', async (req, res) => {
  try {
    const students = await User.findAll({
      where: {
        role: 'etudiant',
        is_temporary: false
      },
      include: [
        {
          model: Niveau,
          as: 'niveauStudent',
          include: [
            {
              model: Specialite,
              as: 'specialite',
              include: [{ model: Departement, as: 'departement' }]
            }
          ]
        },
        {
          model: Classe,
          as: 'classeStudent'
        }
      ]
    });

    const data = students.map(s => ({
      numero_etudiant: s.numero_etudiant,
      nom: s.nom,
      prenom: s.prenom,
      email: s.email,
      phone: s.phone,
      date_naissance: s.date_naissance,
      adresse: s.adresse,
      ville: s.ville,
      pays: s.pays,
      statut: s.statut,
      departement: s.niveauStudent?.specialite?.departement?.name || '',
      specialite: s.niveauStudent?.specialite?.name || '',
      niveau: s.niveauStudent?.name || '',
      classe: s.classeStudent?.nom || '',
      notes: s.notes
    }));

    const parser = new Parser();
    const csv = '\uFEFF' + parser.parse(data); // BOM for Excel

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=etudiants_${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csv);

  } catch (error) {
    console.error('Error exporting students:', error);
    res.status(500).json({ error: 'Failed to export students' });
  }
});

// ============================================================================
// 7. GET ALL STUDENTS (with pagination and filters)
// ============================================================================

router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, statut, is_temporary, niveau_id, classe_id } = req.query;
    const offset = (page - 1) * limit;

    const where = { role: 'etudiant' };
    if (statut) where.statut = statut;
    if (is_temporary !== undefined) where.is_temporary = is_temporary === 'true';
    if (niveau_id) where.niveau_id = parseInt(niveau_id);
    if (classe_id) where.classe_id = parseInt(classe_id);

    const { count, rows: students } = await User.findAndCountAll({
      where,
      include: [
        { model: Niveau, as: 'niveauStudent' },
        { model: Classe, as: 'classeStudent' }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['nom', 'ASC'], ['prenom', 'ASC']]
    });

    res.json({
      students,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
        totalItems: count
      }
    });

  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// ============================================================================
// 8. GET SINGLE STUDENT
// ============================================================================

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const student = await User.findOne({
      where: { id, role: 'etudiant' },
      include: [
        { model: Niveau, as: 'niveauStudent' },
        { model: Classe, as: 'classeStudent' }
      ]
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json(student);

  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ error: 'Failed to fetch student' });
  }
});

// ============================================================================
// 9. UPDATE STUDENT
// ============================================================================

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Don't allow changing role
    delete updateData.role;
    delete updateData.mdp_hash;
    delete updateData.is_temporary;
    delete updateData.import_batch_id;

    const student = await User.findOne({
      where: { id, role: 'etudiant' }
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    await student.update(updateData);

    res.json({
      message: 'Student updated successfully',
      student
    });

  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ error: 'Failed to update student', details: error.message });
  }
});

// ============================================================================
// 10. DELETE STUDENT
// ============================================================================

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const student = await User.findOne({
      where: { id, role: 'etudiant' }
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    await student.destroy();

    res.json({ message: 'Student deleted successfully' });

  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ error: 'Failed to delete student' });
  }
});

// ============================================================================
// 11. BULK ASSIGN STUDENTS TO CLASS
// ============================================================================

router.post('/assign-to-class', async (req, res) => {
  try {
    const { studentIds, classeId } = req.body;

    console.log('📥 ASSIGN TO CLASS REQUEST:', { studentIds, classeId });

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      console.log('❌ Invalid studentIds:', studentIds);
      return res.status(400).json({ error: 'Invalid studentIds provided' });
    }

    if (!classeId) {
      console.log('❌ Missing classeId');
      return res.status(400).json({ error: 'classeId is required' });
    }

    // Verify the class exists
    const classe = await Classe.findByPk(classeId);
    console.log('🔍 Class found:', classe ? classe.nom : 'NOT FOUND');
    
    if (!classe) {
      return res.status(404).json({ error: 'Class not found' });
    }

    // Check if students exist before updating
    const existingStudents = await User.findAll({
      where: {
        id: studentIds,
        role: 'etudiant'
      }
    });
    
    console.log('🔍 Students found:', existingStudents.length, 'out of', studentIds.length);
    
    if (existingStudents.length === 0) {
      return res.status(404).json({ 
        error: 'No matching students found',
        details: 'Students may not exist or are not marked as etudiant'
      });
    }

    // Update all students with the new class assignment
    const [updatedCount] = await User.update(
      { classe_id: classeId },
      {
        where: {
          id: studentIds,
          role: 'etudiant'
        }
      }
    );

    console.log('✅ Updated count:', updatedCount);

    res.json({
      message: `${updatedCount} student(s) assigned successfully`,
      assignedCount: updatedCount
    });

  } catch (error) {
    console.error('❌ Error assigning students:', error);
    res.status(500).json({ error: 'Failed to assign students', details: error.message });
  }
});

// ============================================================================
// 12. REMOVE STUDENT FROM CLASS
// ============================================================================

router.put('/:id/remove-from-class', async (req, res) => {
  try {
    const { id } = req.params;

    const student = await User.findOne({
      where: { id, role: 'etudiant' }
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    await student.update({ classe_id: null });

    res.json({
      message: 'Student removed from class successfully',
      student
    });

  } catch (error) {
    console.error('Error removing student from class:', error);
    res.status(500).json({ error: 'Failed to remove student from class' });
  }
});

// ============================================================================
// DELETE BATCH
// ============================================================================

router.delete('/batch/:batchId', async (req, res) => {
  try {
    const { batchId } = req.params;

    const deletedCount = await User.destroy({
      where: {
        role: 'etudiant',
        import_batch_id: batchId,
        is_temporary: true
      }
    });

    res.json({
      message: 'Batch deleted successfully',
      deletedCount
    });

  } catch (error) {
    console.error('Error deleting batch:', error);
    res.status(500).json({ error: 'Failed to delete batch' });
  }
});

// ============================================================================
// GET STUDENT ABSENCES - Called by auth service
// ============================================================================

/**
 * GET /api/student/absences/:studentId
 * Fetch all absences for a specific student
 * Called by auth-service which proxies from frontend
 */
router.get('/absences/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!studentId) {
      return res.status(400).json({ error: 'Student ID is required' });
    }

    console.log(`📝 Fetching absences for student ID: ${studentId}`);

    // Fetch student absences with related schedule and matiere information
    const absences = await StudentAbsence.findAll({
      where: { student_id: studentId },
      include: [
        {
          model: Schedule,
          as: 'schedule',
          attributes: ['id', 'date_debut', 'matiere_id', 'enseignant_id'],
          include: [
            {
              model: require('../models').Matiere,
              as: 'matiere',
              attributes: ['id', 'name', 'code']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']],
      raw: false
    });

    console.log(`✅ Found ${absences.length} absences for student ${studentId}`);

    res.json(absences || []);

  } catch (error) {
    console.error('❌ Error fetching student absences:', error);
    res.status(500).json({ error: 'Failed to fetch student absences', details: error.message });
  }
});

module.exports = router;
