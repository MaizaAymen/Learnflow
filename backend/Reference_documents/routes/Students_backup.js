const express = require('express');
const router = express.Router();
const { Classe, Niveau, Specialite, Departement } = require('../models');
const { Parser } = require('json2csv');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const crypto = require('crypto'); // Use crypto instead of uuid
// Import User model from auth-service (students are users with role='etudiant')
const User = require('../../auth-service/models/userModel');

// UUID v4 generator using crypto
const uuidv4 = () => crypto.randomUUID();

// Configure multer for CSV uploads
const upload = multer({ dest: 'uploads/' });

// ============================================================================
// 1. IMPORT CSV - Upload and Parse
// ============================================================================

router.post('/import-csv', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const results = [];
    const batchId = uuidv4(); // Generate unique batch ID for this import

    // Parse CSV file
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        try {
          // Validate and prepare students data
          const students = [];
          const errors = [];

          for (let i = 0; i < results.length; i++) {
            const row = results[i];
            const rowNum = i + 2; // +2 because row 1 is header, and arrays are 0-indexed

            // Validate required fields
            if (!row.nom || !row.prenom || !row.email || !row.numero_etudiant) {
              errors.push({
                row: rowNum,
                error: 'Missing required fields (nom, prenom, email, numero_etudiant)'
              });
              continue;
            }

            // Check for duplicate numero_etudiant in database
            const existing = await Student.findOne({
              where: { numero_etudiant: row.numero_etudiant }
            });

            if (existing) {
              errors.push({
                row: rowNum,
                numero_etudiant: row.numero_etudiant,
                error: 'Student with this numero_etudiant already exists'
              });
              continue;
            }

            students.push({
              nom: row.nom,
              prenom: row.prenom,
              email: row.email,
              numero_etudiant: row.numero_etudiant,
              date_naissance: row.date_naissance || null,
              telephone: row.telephone || null,
              adresse: row.adresse || null,
              niveau_id: row.niveau_id || null,
              classe_id: null, // Will be assigned later
              statut: row.statut || 'actif',
              is_temporary: true, // Mark as temporary until committed
              import_batch_id: batchId,
              notes: row.notes || null
            });
          }

          // Delete uploaded file
          fs.unlinkSync(req.file.path);

          if (errors.length > 0 && students.length === 0) {
            return res.status(400).json({
              error: 'All rows have errors',
              errors,
              validCount: 0,
              errorCount: errors.length
            });
          }

          res.json({
            message: 'CSV parsed successfully',
            batchId,
            students,
            validCount: students.length,
            errorCount: errors.length,
            errors: errors.length > 0 ? errors : undefined
          });

        } catch (error) {
          console.error('Error processing CSV:', error);
          res.status(500).json({ error: 'Error processing CSV data' });
        }
      })
      .on('error', (error) => {
        console.error('Error reading CSV:', error);
        fs.unlinkSync(req.file.path);
        res.status(500).json({ error: 'Error reading CSV file' });
      });

  } catch (error) {
    console.error('Error importing CSV:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================================
// 2. AUTO-ASSIGN TO GROUPS - Random, Balanced, or By Niveau
// ============================================================================

router.post('/assign-groups', async (req, res) => {
  try {
    const { students, algorithm = 'balanced', seed, targetClasses } = req.body;

    if (!students || !Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ error: 'Students array is required' });
    }

    if (!targetClasses || !Array.isArray(targetClasses) || targetClasses.length === 0) {
      return res.status(400).json({ error: 'Target classes array is required' });
    }

    // Verify all target classes exist
    const classes = await Classe.findAll({
      where: { id: targetClasses },
      include: [{ 
        model: Niveau, 
        as: 'niveau',
        include: [{ 
          model: Specialite, 
          as: 'specialite',
          include: [{ model: Departement, as: 'departement' }]
        }]
      }]
    });

    if (classes.length !== targetClasses.length) {
      return res.status(400).json({ error: 'Some target classes do not exist' });
    }

    let assignments = [];

    switch (algorithm) {
      case 'random':
        assignments = assignRandom(students, classes, seed);
        break;
      
      case 'balanced':
        assignments = assignBalanced(students, classes);
        break;
      
      case 'by_niveau':
        assignments = assignByNiveau(students, classes);
        break;
      
      default:
        return res.status(400).json({ 
          error: 'Invalid algorithm. Use: random, balanced, or by_niveau' 
        });
    }

    res.json({
      message: 'Students assigned successfully',
      algorithm,
      assignments,
      summary: {
        totalStudents: students.length,
        classCount: classes.length,
        distributionPerClass: assignments.reduce((acc, a) => {
          const classId = a.classe_id;
          acc[classId] = (acc[classId] || 0) + 1;
          return acc;
        }, {})
      }
    });

  } catch (error) {
    console.error('Error assigning groups:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper: Random assignment with optional seed
function assignRandom(students, classes, seed) {
  const seededRandom = seed ? createSeededRandom(seed) : Math.random;
  const assignments = [];

  students.forEach(student => {
    const randomIndex = Math.floor(seededRandom() * classes.length);
    assignments.push({
      ...student,
      classe_id: classes[randomIndex].id,
      classe_nom: classes[randomIndex].nom
    });
  });

  return assignments;
}

// Helper: Balanced assignment (equal distribution)
function assignBalanced(students, classes) {
  const assignments = [];
  const studentsPerClass = Math.ceil(students.length / classes.length);
  let classIndex = 0;
  let countInCurrentClass = 0;

  students.forEach(student => {
    assignments.push({
      ...student,
      classe_id: classes[classIndex].id,
      classe_nom: classes[classIndex].nom
    });

    countInCurrentClass++;
    if (countInCurrentClass >= studentsPerClass && classIndex < classes.length - 1) {
      classIndex++;
      countInCurrentClass = 0;
    }
  });

  return assignments;
}

// Helper: Assignment by niveau (students with same niveau stay together)
function assignByNiveau(students, classes) {
  const assignments = [];
  
  // Group students by niveau_id
  const studentsByNiveau = students.reduce((acc, student) => {
    const niveauId = student.niveau_id || 'no_niveau';
    if (!acc[niveauId]) acc[niveauId] = [];
    acc[niveauId].push(student);
    return acc;
  }, {});

  // Group classes by niveau_id
  const classesByNiveau = classes.reduce((acc, classe) => {
    const niveauId = classe.niveau_id || 'no_niveau';
    if (!acc[niveauId]) acc[niveauId] = [];
    acc[niveauId].push(classe);
    return acc;
  }, {});

  // Assign students to classes with same niveau
  Object.entries(studentsByNiveau).forEach(([niveauId, studentsInNiveau]) => {
    const matchingClasses = classesByNiveau[niveauId] || classes; // fallback to all classes
    
    studentsInNiveau.forEach((student, index) => {
      const classIndex = index % matchingClasses.length;
      assignments.push({
        ...student,
        classe_id: matchingClasses[classIndex].id,
        classe_nom: matchingClasses[classIndex].nom
      });
    });
  });

  return assignments;
}

// Helper: Create seeded random number generator
function createSeededRandom(seed) {
  let current = seed;
  return function() {
    current = (current * 9301 + 49297) % 233280;
    return current / 233280;
  };
}

// ============================================================================
// 3. MANUAL EDITING - Change Student Group
// ============================================================================

router.put('/:id/group', async (req, res) => {
  try {
    const { id } = req.params;
    const { classe_id } = req.body;

    if (!classe_id) {
      return res.status(400).json({ error: 'classe_id is required' });
    }

    // Verify classe exists
    const classe = await Classe.findByPk(classe_id);
    if (!classe) {
      return res.status(404).json({ error: 'Classe not found' });
    }

    // Find student (can be temporary or permanent)
    const student = await Student.findByPk(id);
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Update classe_id
    await student.update({ classe_id });

    // Return updated student with classe details
    const updatedStudent = await Student.findByPk(id, {
      include: [
        { model: Classe, as: 'classe' },
        { model: Niveau, as: 'niveau' }
      ]
    });

    res.json({
      message: 'Student group updated successfully',
      student: updatedStudent
    });

  } catch (error) {
    console.error('Error updating student group:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================================
// 4. ADD STUDENT MANUALLY
// ============================================================================

router.post('/', async (req, res) => {
  try {
    const { 
      nom, prenom, email, numero_etudiant, 
      date_naissance, telephone, adresse, 
      niveau_id, classe_id, statut, notes,
      is_temporary, import_batch_id 
    } = req.body;

    // Validate required fields
    if (!nom || !prenom || !email || !numero_etudiant) {
      return res.status(400).json({ 
        error: 'Missing required fields: nom, prenom, email, numero_etudiant' 
      });
    }

    // Check for duplicate email
    const existingEmail = await Student.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Check for duplicate numero_etudiant
    const existingNumero = await Student.findOne({ where: { numero_etudiant } });
    if (existingNumero) {
      return res.status(400).json({ error: 'Student number already exists' });
    }

    // Create student
    const student = await Student.create({
      nom,
      prenom,
      email,
      numero_etudiant,
      date_naissance: date_naissance || null,
      telephone: telephone || null,
      adresse: adresse || null,
      niveau_id: niveau_id || null,
      classe_id: classe_id || null,
      statut: statut || 'actif',
      is_temporary: is_temporary !== undefined ? is_temporary : false,
      import_batch_id: import_batch_id || null,
      notes: notes || null
    });

    // Return with relationships
    const createdStudent = await Student.findByPk(student.id, {
      include: [
        { model: Classe, as: 'classe' },
        { model: Niveau, as: 'niveau' }
      ]
    });

    res.status(201).json({
      message: 'Student created successfully',
      student: createdStudent
    });

  } catch (error) {
    console.error('Error creating student:', error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ 
        error: 'Validation error', 
        details: error.errors.map(e => e.message) 
      });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================================
// 5. COMMIT FINAL - Save All Assignments
// ============================================================================

router.post('/commit', async (req, res) => {
  const transaction = await Student.sequelize.transaction();
  
  try {
    const { students, batchId } = req.body;

    if (!students || !Array.isArray(students) || students.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Students array is required' });
    }

    const results = {
      created: 0,
      updated: 0,
      errors: []
    };

    for (const studentData of students) {
      try {
        // Check if student already exists (by numero_etudiant)
        const existing = await Student.findOne({
          where: { numero_etudiant: studentData.numero_etudiant },
          transaction
        });

        if (existing) {
          // Update existing student
          await existing.update({
            classe_id: studentData.classe_id,
            is_temporary: false
          }, { transaction });
          results.updated++;
        } else {
          // Create new student
          await Student.create({
            ...studentData,
            is_temporary: false,
            import_batch_id: batchId || null
          }, { transaction });
          results.created++;
        }
      } catch (error) {
        results.errors.push({
          numero_etudiant: studentData.numero_etudiant,
          error: error.message
        });
      }
    }

    // Rollback if there are critical errors
    if (results.errors.length > 0 && results.created === 0 && results.updated === 0) {
      await transaction.rollback();
      return res.status(400).json({
        error: 'All operations failed',
        results
      });
    }

    // Commit transaction
    await transaction.commit();

    res.json({
      message: 'Students committed successfully',
      results: {
        created: results.created,
        updated: results.updated,
        total: results.created + results.updated,
        errors: results.errors.length > 0 ? results.errors : undefined
      }
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Error committing students:', error);
    res.status(500).json({ error: 'Internal server error during commit' });
  }
});

// ============================================================================
// 6. EXPORT CSV - Download Students with Assigned Groups
// ============================================================================

router.get('/export', async (req, res) => {
  try {
    const { format = 'csv', batchId, classe_id, niveau_id, statut } = req.query;

    // Build query filters
    const where = {};
    if (batchId) where.import_batch_id = batchId;
    if (classe_id) where.classe_id = classe_id;
    if (niveau_id) where.niveau_id = niveau_id;
    if (statut) where.statut = statut;

    // Fetch students with relationships
    const students = await Student.findAll({
      where,
      include: [
        { 
          model: Classe, 
          as: 'classe',
          include: [{
            model: Niveau,
            as: 'niveau',
            include: [{
              model: Specialite,
              as: 'specialite',
              include: [{ model: Departement, as: 'departement' }]
            }]
          }]
        },
        { 
          model: Niveau, 
          as: 'niveau',
          include: [{
            model: Specialite,
            as: 'specialite',
            include: [{ model: Departement, as: 'departement' }]
          }]
        }
      ],
      order: [['nom', 'ASC'], ['prenom', 'ASC']]
    });

    if (students.length === 0) {
      return res.status(404).json({ error: 'No students found' });
    }

    // Prepare data for export
    const exportData = students.map(student => ({
      numero_etudiant: student.numero_etudiant,
      nom: student.nom,
      prenom: student.prenom,
      email: student.email,
      date_naissance: student.date_naissance || '',
      telephone: student.telephone || '',
      classe_nom: student.classe?.nom || 'Non assigné',
      classe_id: student.classe?.id || '',
      niveau_nom: student.niveau?.name || student.classe?.niveau?.name || '',
      specialite_nom: student.niveau?.specialite?.name || student.classe?.niveau?.specialite?.name || '',
      departement_nom: student.niveau?.specialite?.departement?.name || student.classe?.niveau?.specialite?.departement?.name || '',
      statut: student.statut,
      notes: student.notes || ''
    }));

    if (format === 'csv') {
      // Generate CSV
      const fields = [
        'numero_etudiant', 'nom', 'prenom', 'email', 'date_naissance', 
        'telephone', 'classe_nom', 'classe_id', 'niveau_nom', 
        'specialite_nom', 'departement_nom', 'statut', 'notes'
      ];
      
      const json2csvParser = new Parser({ fields });
      const csv = json2csvParser.parse(exportData);

      res.header('Content-Type', 'text/csv; charset=utf-8');
      res.header('Content-Disposition', `attachment; filename=students_export_${Date.now()}.csv`);
      res.send('\uFEFF' + csv); // Add BOM for Excel compatibility
    } else {
      // Return JSON
      res.json({
        count: exportData.length,
        students: exportData
      });
    }

  } catch (error) {
    console.error('Error exporting students:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================================
// 7. GET ALL STUDENTS (with filters)
// ============================================================================

router.get('/', async (req, res) => {
  try {
    const { 
      batchId, classe_id, niveau_id, statut, 
      is_temporary, page = 1, limit = 50 
    } = req.query;

    // Build query filters
    const where = {};
    if (batchId) where.import_batch_id = batchId;
    if (classe_id) where.classe_id = classe_id;
    if (niveau_id) where.niveau_id = niveau_id;
    if (statut) where.statut = statut;
    if (is_temporary !== undefined) where.is_temporary = is_temporary === 'true';

    // Calculate pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Fetch students
    const { count, rows: students } = await Student.findAndCountAll({
      where,
      include: [
        { 
          model: Classe, 
          as: 'classe',
          include: [{
            model: Niveau,
            as: 'niveau',
            include: [{
              model: Specialite,
              as: 'specialite',
              include: [{ model: Departement, as: 'departement' }]
            }]
          }]
        },
        { 
          model: Niveau, 
          as: 'niveau',
          include: [{
            model: Specialite,
            as: 'specialite',
            include: [{ model: Departement, as: 'departement' }]
          }]
        }
      ],
      order: [['nom', 'ASC'], ['prenom', 'ASC']],
      limit: parseInt(limit),
      offset
    });

    res.json({
      count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / parseInt(limit)),
      students
    });

  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================================
// 8. GET SINGLE STUDENT
// ============================================================================

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findByPk(id, {
      include: [
        { 
          model: Classe, 
          as: 'classe',
          include: [{
            model: Niveau,
            as: 'niveau',
            include: [{
              model: Specialite,
              as: 'specialite',
              include: [{ model: Departement, as: 'departement' }]
            }]
          }]
        },
        { 
          model: Niveau, 
          as: 'niveau',
          include: [{
            model: Specialite,
            as: 'specialite',
            include: [{ model: Departement, as: 'departement' }]
          }]
        }
      ]
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json(student);

  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================================
// 9. UPDATE STUDENT
// ============================================================================

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const student = await Student.findByPk(id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Check for unique constraints if email or numero_etudiant is being updated
    if (updateData.email && updateData.email !== student.email) {
      const existing = await Student.findOne({ where: { email: updateData.email } });
      if (existing) {
        return res.status(400).json({ error: 'Email already exists' });
      }
    }

    if (updateData.numero_etudiant && updateData.numero_etudiant !== student.numero_etudiant) {
      const existing = await Student.findOne({ where: { numero_etudiant: updateData.numero_etudiant } });
      if (existing) {
        return res.status(400).json({ error: 'Student number already exists' });
      }
    }

    await student.update(updateData);

    // Return updated student with relationships
    const updatedStudent = await Student.findByPk(id, {
      include: [
        { model: Classe, as: 'classe' },
        { model: Niveau, as: 'niveau' }
      ]
    });

    res.json({
      message: 'Student updated successfully',
      student: updatedStudent
    });

  } catch (error) {
    console.error('Error updating student:', error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ 
        error: 'Validation error', 
        details: error.errors.map(e => e.message) 
      });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================================
// 10. DELETE STUDENT
// ============================================================================

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findByPk(id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    await student.destroy();

    res.json({ message: 'Student deleted successfully' });

  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================================
// 11. DELETE TEMPORARY STUDENTS (cleanup)
// ============================================================================

router.delete('/batch/:batchId', async (req, res) => {
  try {
    const { batchId } = req.params;

    const deleted = await Student.destroy({
      where: {
        import_batch_id: batchId,
        is_temporary: true
      }
    });

    res.json({
      message: 'Temporary students deleted',
      count: deleted
    });

  } catch (error) {
    console.error('Error deleting temporary students:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
