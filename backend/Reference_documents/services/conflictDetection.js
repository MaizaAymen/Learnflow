/**
 * Conflict Detection Service for Timetable Management System
 * 
 * This service provides comprehensive conflict detection for:
 * - Salle (Room) conflicts
 * - Enseignant (Teacher) conflicts
 * - Groupe/Classe (Class) conflicts
 * - Matière-Niveau (Subject-Level) compatibility
 * - Capacity constraints
 */

const { Op } = require('sequelize');
const Schedule = require('../models/Schedule');
const Salle = require('../models/Salle');
const Classe = require('../models/Classe');
const Matiere = require('../models/Matiére');
const Niveau = require('../models/Niveau');
const MatiereClasse = require('../models/MatiereClasse');
const MatiereEnseignant = require('../models/MatiereEnseignant');
const User = require('../../auth-service/models/userModel');

/**
 * Main conflict detection function
 * @param {Object} scheduleData - Schedule data to check
 * @param {number} scheduleData.time_slot_id - TimeSlot ID (optional, for backward compatibility)
 * @param {string} scheduleData.day_of_week - Day of week (Lundi, Mardi, etc.)
 * @param {string} scheduleData.start_time - Start time (HH:MM:SS)
 * @param {string} scheduleData.end_time - End time (HH:MM:SS)
 * @param {number} scheduleData.classe_id - Classe ID
 * @param {number} scheduleData.matiere_id - Matière ID
 * @param {number} scheduleData.salle_id - Salle ID (optional)
 * @param {number} scheduleData.enseignant_id - Enseignant ID (optional)
 * @param {string} scheduleData.date_debut - Start date
 * @param {string} scheduleData.date_fin - End date (optional)
 * @param {string} scheduleData.type_cours - Course type (optional)
 * @param {number} scheduleData.excludeId - Schedule ID to exclude from conflict check (for updates)
 * @returns {Promise<Object>} Conflict result object
 */
async function detectScheduleConflicts(scheduleData) {
  const {
    time_slot_id,
    day_of_week,
    start_time,
    end_time,
    classe_id,
    matiere_id,
    salle_id,
    enseignant_id,
    date_debut,
    date_fin,
    type_cours,
    excludeId
  } = scheduleData;

  const conflicts = [];

  // Build base where clause for time overlap
  const timeOverlapWhere = {
    date_debut: { [Op.lte]: date_fin || date_debut },
    [Op.or]: [
      { date_fin: { [Op.gte]: date_debut } },
      { date_fin: null }
    ],
    statut: { [Op.ne]: 'annule' }
  };

  // Add time matching - prefer direct time fields, fallback to time_slot_id
  if (day_of_week && start_time) {
    timeOverlapWhere.day_of_week = day_of_week;
    timeOverlapWhere.start_time = start_time;
  } else if (time_slot_id) {
    timeOverlapWhere.time_slot_id = time_slot_id;
  }

  if (excludeId) {
    timeOverlapWhere.id = { [Op.ne]: excludeId };
  }

  // ============================================================================
  // 1. CHECK CLASSE CONFLICT
  // Groupe ayant déjà un autre cours
  // ============================================================================
  if (classe_id) {
    const classeConflict = await Schedule.findOne({
      where: { ...timeOverlapWhere, classe_id },
      include: [
        { association: 'matiere', attributes: ['id', 'name'] },
        { association: 'salle', attributes: ['id', 'nom'] }
      ]
    });

    if (classeConflict) {
      conflicts.push({
        success: false,
        type: 'conflict',
        target: 'groupe',
        message: `Le groupe/classe a déjà un cours à cette heure (${classeConflict.matiere?.name || 'Matière inconnue'}).`,
        details: {
          conflictingScheduleId: classeConflict.id,
          conflictingMatiere: classeConflict.matiere?.name,
          conflictingSalle: classeConflict.salle?.nom
        }
      });
    }
  }

  // ============================================================================
  // 2. CHECK SALLE CONFLICT
  // Salle déjà occupée à la même heure
  // ============================================================================
  if (salle_id) {
    const salleConflict = await Schedule.findOne({
      where: { ...timeOverlapWhere, salle_id },
      include: [
        { association: 'classe', attributes: ['id', 'nom'] },
        { association: 'matiere', attributes: ['id', 'name'] }
      ]
    });

    if (salleConflict) {
      conflicts.push({
        success: false,
        type: 'conflict',
        target: 'salle',
        message: `La salle est déjà occupée à cette heure par la classe ${salleConflict.classe?.nom || 'inconnue'}.`,
        details: {
          conflictingScheduleId: salleConflict.id,
          conflictingClasse: salleConflict.classe?.nom,
          conflictingMatiere: salleConflict.matiere?.name
        }
      });
    }
  }

  // ============================================================================
  // 3. CHECK ENSEIGNANT CONFLICT
  // Enseignant déjà affecté à une autre séance
  // ============================================================================
  if (enseignant_id) {
    const enseignantConflict = await Schedule.findOne({
      where: { ...timeOverlapWhere, enseignant_id },
      include: [
        { association: 'classe', attributes: ['id', 'nom'] },
        { association: 'matiere', attributes: ['id', 'name'] },
        { association: 'salle', attributes: ['id', 'nom'] }
      ]
    });

    if (enseignantConflict) {
      conflicts.push({
        success: false,
        type: 'conflict',
        target: 'enseignant',
        message: `L'enseignant est déjà occupé à cette heure (cours de ${enseignantConflict.matiere?.name || 'matière inconnue'} avec ${enseignantConflict.classe?.nom || 'classe inconnue'}).`,
        details: {
          conflictingScheduleId: enseignantConflict.id,
          conflictingClasse: enseignantConflict.classe?.nom,
          conflictingMatiere: enseignantConflict.matiere?.name,
          conflictingSalle: enseignantConflict.salle?.nom
        }
      });
    }
  }

  // ============================================================================
  // 4. CHECK MATIÈRE-NIVEAU COMPATIBILITY
  // Matière ne correspondant pas au niveau du groupe
  // ============================================================================
  if (matiere_id && classe_id) {
    try {
      // Get classe with its niveau
      const classe = await Classe.findByPk(classe_id, {
        include: [{ association: 'niveau', attributes: ['id', 'name'] }]
      });

      // Get matière with its niveau
      const matiere = await Matiere.findByPk(matiere_id, {
        include: [{ association: 'niveau', attributes: ['id', 'name'] }]
      });

      if (classe && matiere && classe.niveau_id !== matiere.niveauId) {
        conflicts.push({
          success: false,
          type: 'conflict',
          target: 'matiere',
          message: `La matière "${matiere.name}" (niveau: ${matiere.niveau?.name || 'inconnu'}) ne correspond pas au niveau de la classe "${classe.nom}" (niveau: ${classe.niveau?.name || 'inconnu'}).`,
          details: {
            classeNiveauId: classe.niveau_id,
            classeNiveauName: classe.niveau?.name,
            matiereNiveauId: matiere.niveauId,
            matiereNiveauName: matiere.niveau?.name
          }
        });
      }

      // Check if matière is assigned to this classe (via MatiereClasse)
      // Note: This is now a warning, not a blocking error
      const matiereClasseAssociation = await MatiereClasse.findOne({
        where: {
          matiereId: matiere_id,
          classeId: classe_id
        }
      });

      if (!matiereClasseAssociation) {
        console.warn(`Warning: Matière ${matiere_id} is not formally assigned to classe ${classe_id}`);
        // Changed to warning type instead of conflict - allows creation but shows a warning
        conflicts.push({
          success: true,
          type: 'warning',
          target: 'matiere',
          message: `Remarque: La matière "${matiere?.name || 'inconnue'}" n'est pas formellement assignée à la classe "${classe?.nom || 'inconnue'}".`,
          details: {
            matiereId: matiere_id,
            classeId: classe_id,
            matiereName: matiere?.name,
            classeNom: classe?.nom
          }
        });
      }
    } catch (error) {
      console.error('Error checking matière-niveau compatibility:', error);
      conflicts.push({
        success: false,
        type: 'error',
        target: 'matiere',
        message: 'Erreur lors de la vérification de la compatibilité matière-niveau.',
        details: { error: error.message }
      });
    }
  }

  // ============================================================================
  // 5. CHECK ENSEIGNANT-MATIÈRE AUTHORIZATION
  // Vérifier que l'enseignant est autorisé à enseigner cette matière
  // ============================================================================
  if (enseignant_id && matiere_id) {
    try {
      const matiereEnseignantAssociation = await MatiereEnseignant.findOne({
        where: {
          enseignant_id,
          matiere_id,
          [Op.or]: [
            { date_fin: null },
            { date_fin: { [Op.gte]: date_debut } }
          ]
        }
      });

      if (!matiereEnseignantAssociation) {
        const enseignant = await User.findByPk(enseignant_id, {
          attributes: ['id', 'nom', 'prenom']
        });
        const matiere = await Matiere.findByPk(matiere_id, {
          attributes: ['id', 'name']
        });

        console.warn(`Warning: Enseignant ${enseignant_id} is not formally authorized for matière ${matiere_id}`);
        // Changed to warning type - allows creation but shows a warning
        conflicts.push({
          success: true,
          type: 'warning',
          target: 'enseignant',
          message: `Remarque: L'enseignant ${enseignant?.prenom || ''} ${enseignant?.nom || 'inconnu'} n'est pas formellement autorisé à enseigner "${matiere?.name || 'inconnue'}".`,
          details: {
            enseignantId: enseignant_id,
            matiereId: matiere_id,
            enseignantName: `${enseignant?.prenom || ''} ${enseignant?.nom || ''}`.trim(),
            matiereName: matiere?.name
          }
        });
      }
    } catch (error) {
      console.error('Error checking enseignant-matière authorization:', error);
    }
  }

  // ============================================================================
  // 6. CHECK SALLE CAPACITY vs CLASSE SIZE
  // Capacité de salle < nombre étudiants du groupe
  // ============================================================================
  if (salle_id && classe_id) {
    try {
      const salle = await Salle.findByPk(salle_id, {
        attributes: ['id', 'nom', 'capacite', 'type']
      });

      // Count students in the classe (from auth.utilisateur with role='etudiant')
      const studentCount = await User.count({
        where: {
          classe_id,
          role: 'etudiant'
        }
      });

      // Also check classe.effectif field
      const classe = await Classe.findByPk(classe_id, {
        attributes: ['id', 'nom', 'effectif']
      });

      const effectif = studentCount || classe?.effectif || 0;

      if (salle && effectif > salle.capacite) {
        conflicts.push({
          success: false,
          type: 'conflict',
          target: 'salle',
          message: `La capacité de la salle "${salle.nom}" (${salle.capacite} places) est insuffisante pour la classe "${classe?.nom || 'inconnue'}" (${effectif} étudiants).`,
          details: {
            salleId: salle_id,
            salleNom: salle.nom,
            salleCapacite: salle.capacite,
            classeEffectif: effectif,
            deficit: effectif - salle.capacite
          }
        });
      }

      // ============================================================================
      // 7. CHECK SALLE TYPE vs COURSE TYPE COMPATIBILITY
      // Vérifier que le type de salle correspond au type de cours
      // ============================================================================
      if (salle && type_cours) {
        const typeCompatibility = {
          'TP': ['TP', 'Laboratoire', 'Salle_Informatique'],
          'TD': ['TD', 'Cours'],
          'Cours': ['Amphi', 'Cours', 'TD'],
          'Examen': ['Amphi', 'Cours', 'TD'],
          'Soutien': ['TD', 'Cours']
        };

        const compatibleTypes = typeCompatibility[type_cours] || [];

        if (compatibleTypes.length > 0 && !compatibleTypes.includes(salle.type)) {
          conflicts.push({
            success: false,
            type: 'warning',
            target: 'salle',
            message: `Le type de salle "${salle.type}" pourrait ne pas être adapté pour un cours de type "${type_cours}". Types recommandés: ${compatibleTypes.join(', ')}.`,
            details: {
              salleType: salle.type,
              coursType: type_cours,
              recommendedTypes: compatibleTypes
            }
          });
        }
      }
    } catch (error) {
      console.error('Error checking salle capacity:', error);
    }
  }

  // ============================================================================
  // 8. CHECK SALLE STATUS
  // Vérifier que la salle est disponible (pas en maintenance)
  // ============================================================================
  if (salle_id) {
    try {
      const salle = await Salle.findByPk(salle_id, {
        attributes: ['id', 'nom', 'statut']
      });

      if (salle && salle.statut !== 'disponible') {
        conflicts.push({
          success: false,
          type: 'conflict',
          target: 'salle',
          message: `La salle "${salle.nom}" n'est pas disponible (statut: ${salle.statut}).`,
          details: {
            salleId: salle_id,
            salleNom: salle.nom,
            salleStatut: salle.statut
          }
        });
      }
    } catch (error) {
      console.error('Error checking salle status:', error);
    }
  }

  // Separate blocking conflicts from warnings
  const blockingConflicts = conflicts.filter(c => c.type === 'conflict' || c.type === 'error');
  const warnings = conflicts.filter(c => c.type === 'warning');

  return {
    hasConflicts: blockingConflicts.length > 0,
    conflicts: blockingConflicts,
    warnings,
    conflictCount: blockingConflicts.length,
    warningCount: warnings.length
  };
}

/**
 * Check for conflicts when dragging/dropping a schedule
 * Optimized for quick validation during drag operations
 */
async function detectDragDropConflicts(scheduleId, newTimeSlotId, newClasseId, newSalleId) {
  try {
    const schedule = await Schedule.findByPk(scheduleId, {
      include: [
        { association: 'classe', attributes: ['id', 'nom', 'effectif', 'niveau_id'] },
        { association: 'matiere', attributes: ['id', 'name', 'niveauId'] }
      ]
    });

    if (!schedule) {
      return {
        success: false,
        type: 'error',
        message: 'Planning introuvable'
      };
    }

    const scheduleData = {
      time_slot_id: newTimeSlotId || schedule.time_slot_id,
      classe_id: newClasseId || schedule.classe_id,
      matiere_id: schedule.matiere_id,
      salle_id: newSalleId || schedule.salle_id,
      enseignant_id: schedule.enseignant_id,
      date_debut: schedule.date_debut,
      date_fin: schedule.date_fin,
      type_cours: schedule.type_cours,
      excludeId: scheduleId
    };

    return await detectScheduleConflicts(scheduleData);
  } catch (error) {
    console.error('Error in detectDragDropConflicts:', error);
    return {
      hasConflicts: true,
      conflicts: [{
        success: false,
        type: 'error',
        message: 'Erreur lors de la vérification des conflits',
        details: { error: error.message }
      }]
    };
  }
}

/**
 * Get availability information for a specific time slot
 * Returns available teachers, rooms, and classes
 */
async function getAvailability(timeSlotId, date, options = {}) {
  try {
    const { departementId, niveauId, specialiteId } = options;

    // Get all schedules for this time slot and date
    const busySchedules = await Schedule.findAll({
      where: {
        time_slot_id: timeSlotId,
        date_debut: { [Op.lte]: date },
        [Op.or]: [
          { date_fin: { [Op.gte]: date } },
          { date_fin: null }
        ],
        statut: { [Op.ne]: 'annule' }
      },
      attributes: ['classe_id', 'salle_id', 'enseignant_id']
    });

    const busyClasseIds = busySchedules.map(s => s.classe_id).filter(Boolean);
    const busySalleIds = busySchedules.map(s => s.salle_id).filter(Boolean);
    const busyEnseignantIds = busySchedules.map(s => s.enseignant_id).filter(Boolean);

    // Get available salles
    const salleWhere = {
      id: { [Op.notIn]: busySalleIds.length > 0 ? busySalleIds : [0] },
      statut: 'disponible'
    };
    if (departementId) salleWhere.departement_id = departementId;

    const availableSalles = await Salle.findAll({
      where: salleWhere,
      attributes: ['id', 'nom', 'type', 'capacite'],
      order: [['nom', 'ASC']]
    });

    // Get available classes
    const classeWhere = {
      id: { [Op.notIn]: busyClasseIds.length > 0 ? busyClasseIds : [0] }
    };
    if (niveauId) classeWhere.niveau_id = niveauId;

    const availableClasses = await Classe.findAll({
      where: classeWhere,
      include: [{ association: 'niveau', attributes: ['id', 'name'] }],
      attributes: ['id', 'nom', 'effectif'],
      order: [['nom', 'ASC']]
    });

    // Get available enseignants
    const enseignantWhere = {
      id: { [Op.notIn]: busyEnseignantIds.length > 0 ? busyEnseignantIds : [0] },
      role: 'enseignant'
    };

    const availableEnseignants = await User.findAll({
      where: enseignantWhere,
      attributes: ['id', 'nom', 'prenom', 'email'],
      order: [['nom', 'ASC'], ['prenom', 'ASC']]
    });

    return {
      success: true,
      timeSlotId,
      date,
      availability: {
        salles: availableSalles,
        classes: availableClasses,
        enseignants: availableEnseignants
      },
      busy: {
        salleIds: busySalleIds,
        classeIds: busyClasseIds,
        enseignantIds: busyEnseignantIds
      }
    };
  } catch (error) {
    console.error('Error getting availability:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  detectScheduleConflicts,
  detectDragDropConflicts,
  getAvailability
};
