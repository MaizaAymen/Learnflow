/**
 * TIMETABLE SYSTEM - SAMPLE DATA SETUP SCRIPT
 * 
 * This script creates sample data for testing the timetable system
 * Run with: node setupSampleData.js
 */

const { 
  Departement, 
  Specialite, 
  Niveau, 
  Classe, 
  Matiere, 
  Salle, 
  TimeSlot,
  MatiereClasse,
  MatiereEnseignant,
  User
} = require('../models');

async function setupSampleData() {
  try {
    console.log('🚀 Starting sample data setup...\n');

    // ========================================================================
    // 1. CREATE DÉPARTEMENT
    // ========================================================================
    console.log('📁 Creating Département...');
    const dept = await Departement.findOrCreate({
      where: { code: 'INFO' },
      defaults: {
        name: 'Informatique',
        description: 'Département d\'Informatique',
        code: 'INFO',
        statut: 'actif',
        capacite_max: 500
      }
    });
    console.log(`✅ Département: ${dept[0].name} (ID: ${dept[0].id})\n`);

    // ========================================================================
    // 2. CREATE SPÉCIALITÉ
    // ========================================================================
    console.log('🎓 Creating Spécialité...');
    const spec = await Specialite.findOrCreate({
      where: { code: 'INFO-GEN' },
      defaults: {
        name: 'Informatique Générale',
        code: 'INFO-GEN',
        departementId: dept[0].id,
        duree_annees: 3
      }
    });
    console.log(`✅ Spécialité: ${spec[0].name} (ID: ${spec[0].id})\n`);

    // ========================================================================
    // 3. CREATE NIVEAUX
    // ========================================================================
    console.log('📚 Creating Niveaux...');
    const niveaux = [];
    for (let i = 1; i <= 3; i++) {
      const niveau = await Niveau.findOrCreate({
        where: { name: `L${i}`, specialiteId: spec[0].id },
        defaults: {
          name: `L${i}`,
          description: `Licence ${i}ère année`,
          specialiteId: spec[0].id,
          ordre: i
        }
      });
      niveaux.push(niveau[0]);
      console.log(`✅ Niveau: ${niveau[0].name} (ID: ${niveau[0].id})`);
    }
    console.log('');

    // ========================================================================
    // 4. CREATE CLASSES
    // ========================================================================
    console.log('👥 Creating Classes...');
    const classes = [];
    for (let i = 0; i < niveaux.length; i++) {
      for (let j = 1; j <= 2; j++) {
        const groupe = String.fromCharCode(64 + j); // A, B
        const classe = await Classe.findOrCreate({
          where: { 
            nom: `L${i + 1}-INFO-${groupe}`,
            niveau_id: niveaux[i].id 
          },
          defaults: {
            nom: `L${i + 1}-INFO-${groupe}`,
            niveau_id: niveaux[i].id,
            effectif: 30 + Math.floor(Math.random() * 20),
            annee_scolaire: '2024-2025'
          }
        });
        classes.push(classe[0]);
        console.log(`✅ Classe: ${classe[0].nom} (ID: ${classe[0].id}, Effectif: ${classe[0].effectif})`);
      }
    }
    console.log('');

    // ========================================================================
    // 5. CREATE SALLES
    // ========================================================================
    console.log('🏢 Creating Salles...');
    const salleTypes = ['Amphi', 'TD', 'TP', 'Laboratoire', 'Salle_Informatique'];
    const salles = [];
    
    // Create 2 of each type
    for (let i = 0; i < salleTypes.length; i++) {
      for (let j = 1; j <= 2; j++) {
        const capacite = salleTypes[i] === 'Amphi' ? 150 : (salleTypes[i] === 'TD' ? 35 : 25);
        const salle = await Salle.findOrCreate({
          where: { 
            nom: `${salleTypes[i]}-${j}`,
            departement_id: dept[0].id 
          },
          defaults: {
            nom: `${salleTypes[i]}-${j}`,
            type: salleTypes[i],
            capacite: capacite,
            departement_id: dept[0].id,
            statut: 'disponible',
            localisation: `Bâtiment ${i + 1}, Étage ${j}`
          }
        });
        salles.push(salle[0]);
        console.log(`✅ Salle: ${salle[0].nom} (ID: ${salle[0].id}, Type: ${salle[0].type}, Capacité: ${salle[0].capacite})`);
      }
    }
    console.log('');

    // ========================================================================
    // 6. CREATE MATIÈRES
    // ========================================================================
    console.log('📖 Creating Matières...');
    const matieresData = [
      // L1
      { name: 'Algorithmique', code: 'ALG-L1', credits: 6, niveauId: niveaux[0].id },
      { name: 'Programmation C', code: 'PROG-L1', credits: 6, niveauId: niveaux[0].id },
      { name: 'Mathématiques pour l\'Informatique', code: 'MATH-L1', credits: 5, niveauId: niveaux[0].id },
      { name: 'Architecture des Ordinateurs', code: 'ARCH-L1', credits: 4, niveauId: niveaux[0].id },
      // L2
      { name: 'Structures de Données', code: 'SD-L2', credits: 6, niveauId: niveaux[1].id },
      { name: 'Bases de Données', code: 'BD-L2', credits: 6, niveauId: niveaux[1].id },
      { name: 'Programmation Orientée Objet', code: 'POO-L2', credits: 6, niveauId: niveaux[1].id },
      { name: 'Systèmes d\'Exploitation', code: 'SE-L2', credits: 5, niveauId: niveaux[1].id },
      // L3
      { name: 'Génie Logiciel', code: 'GL-L3', credits: 6, niveauId: niveaux[2].id },
      { name: 'Réseaux Informatiques', code: 'RESEAU-L3', credits: 5, niveauId: niveaux[2].id },
      { name: 'Intelligence Artificielle', code: 'IA-L3', credits: 6, niveauId: niveaux[2].id },
      { name: 'Développement Web', code: 'WEB-L3', credits: 5, niveauId: niveaux[2].id }
    ];

    const matieres = [];
    for (const matiereData of matieresData) {
      const matiere = await Matiere.findOrCreate({
        where: { code: matiereData.code },
        defaults: matiereData
      });
      matieres.push(matiere[0]);
      console.log(`✅ Matière: ${matiere[0].name} (ID: ${matiere[0].id}, Code: ${matiere[0].code}, Niveau: L${matiereData.niveauId - niveaux[0].id + 1})`);
    }
    console.log('');

    // ========================================================================
    // 7. CREATE ENSEIGNANTS
    // ========================================================================
    console.log('👨‍🏫 Creating Enseignants...');
    const enseignants = [];
    const enseignantsData = [
      { nom: 'Dupont', prenom: 'Jean', email: 'jean.dupont@univ.edu' },
      { nom: 'Martin', prenom: 'Marie', email: 'marie.martin@univ.edu' },
      { nom: 'Bernard', prenom: 'Pierre', email: 'pierre.bernard@univ.edu' },
      { nom: 'Dubois', prenom: 'Sophie', email: 'sophie.dubois@univ.edu' },
      { nom: 'Laurent', prenom: 'Luc', email: 'luc.laurent@univ.edu' }
    ];

    for (const ensData of enseignantsData) {
      const enseignant = await User.findOrCreate({
        where: { email: ensData.email },
        defaults: {
          ...ensData,
          login: ensData.email,
          mdp_hash: 'hashed_password_here', // In real scenario, use bcrypt
          role: 'enseignant',
          specialite: 'informatique',
          departement: 'Informatique'
        }
      });
      enseignants.push(enseignant[0]);
      console.log(`✅ Enseignant: ${enseignant[0].prenom} ${enseignant[0].nom} (ID: ${enseignant[0].id})`);
    }
    console.log('');

    // ========================================================================
    // 8. ASSOCIATE MATIÈRES TO CLASSES
    // ========================================================================
    console.log('🔗 Associating Matières to Classes...');
    let associationCount = 0;
    
    // Associate each matière to classes of the same niveau
    for (const matiere of matieres) {
      const classesOfLevel = classes.filter(c => c.niveau_id === matiere.niveauId);
      
      for (const classe of classesOfLevel) {
        await MatiereClasse.findOrCreate({
          where: {
            matiereId: matiere.id,
            classeId: classe.id
          },
          defaults: {
            matiereId: matiere.id,
            classeId: classe.id,
            heures_semaine: 3,
            coefficient: 1.0
          }
        });
        associationCount++;
      }
    }
    console.log(`✅ Created ${associationCount} Matière-Classe associations\n`);

    // ========================================================================
    // 9. ASSOCIATE MATIÈRES TO ENSEIGNANTS
    // ========================================================================
    console.log('🔗 Associating Matières to Enseignants...');
    let enseignantAssocCount = 0;
    
    // Each enseignant teaches 2-3 matières
    for (let i = 0; i < enseignants.length; i++) {
      const startIdx = i * 2;
      const endIdx = Math.min(startIdx + 3, matieres.length);
      
      for (let j = startIdx; j < endIdx; j++) {
        await MatiereEnseignant.findOrCreate({
          where: {
            matiere_id: matieres[j % matieres.length].id,
            enseignant_id: enseignants[i].id
          },
          defaults: {
            matiere_id: matieres[j % matieres.length].id,
            enseignant_id: enseignants[i].id,
            is_principal: j === startIdx,
            date_debut: new Date()
          }
        });
        enseignantAssocCount++;
      }
    }
    console.log(`✅ Created ${enseignantAssocCount} Matière-Enseignant associations\n`);

    // ========================================================================
    // 10. CREATE TIME SLOTS
    // ========================================================================
    console.log('⏰ Creating Time Slots...');
    const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
    const timeSlots = [
      { start: '08:00:00', end: '09:30:00', desc: 'Créneau 1' },
      { start: '09:45:00', end: '11:15:00', desc: 'Créneau 2' },
      { start: '11:30:00', end: '13:00:00', desc: 'Créneau 3' },
      { start: '14:00:00', end: '15:30:00', desc: 'Créneau 4' },
      { start: '15:45:00', end: '17:15:00', desc: 'Créneau 5' }
    ];

    let timeSlotCount = 0;
    for (const day of days) {
      for (const slot of timeSlots) {
        await TimeSlot.findOrCreate({
          where: {
            day_of_week: day,
            start_time: slot.start,
            end_time: slot.end
          },
          defaults: {
            day_of_week: day,
            start_time: slot.start,
            end_time: slot.end,
            description: `${day} - ${slot.desc}`,
            is_active: true
          }
        });
        timeSlotCount++;
      }
    }
    console.log(`✅ Created ${timeSlotCount} time slots\n`);

    // ========================================================================
    // SUMMARY
    // ========================================================================
    console.log('═'.repeat(80));
    console.log('✨ SAMPLE DATA SETUP COMPLETED SUCCESSFULLY!');
    console.log('═'.repeat(80));
    console.log('\n📊 Summary:');
    console.log(`   • ${1} Département`);
    console.log(`   • ${1} Spécialité`);
    console.log(`   • ${niveaux.length} Niveaux`);
    console.log(`   • ${classes.length} Classes`);
    console.log(`   • ${salles.length} Salles`);
    console.log(`   • ${matieres.length} Matières`);
    console.log(`   • ${enseignants.length} Enseignants`);
    console.log(`   • ${associationCount} Matière-Classe associations`);
    console.log(`   • ${enseignantAssocCount} Matière-Enseignant associations`);
    console.log(`   • ${timeSlotCount} Time Slots`);
    console.log('\n🎉 You can now test the timetable system!');
    console.log('   Run: node scripts/testTimetableSystem.js\n');

  } catch (error) {
    console.error('❌ Error setting up sample data:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the setup
setupSampleData()
  .then(() => {
    console.log('✅ Setup completed, exiting...');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  });
