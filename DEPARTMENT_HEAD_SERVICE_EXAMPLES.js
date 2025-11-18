// departmentHeadService.test.js - Examples and test cases

/**
 * EXEMPLES D'UTILISATION DU SERVICE CHEF DE DÉPARTEMENT
 */

// ============================================================================
// 1. RÉCUPÉRER LE DÉPARTEMENT
// ============================================================================

async function testGetDepartment() {
  try {
    const department = await departmentHeadService.getDepartment();
    console.log('Département:', department);
    // Résultat:
    // {
    //   id: 1,
    //   name: "Informatique",
    //   code: "INF",
    //   chef_departement_id: 5,
    //   email: "chef@univ.tn"
    // }
  } catch (error) {
    console.error('Erreur:', error);
  }
}

// ============================================================================
// 2. RÉCUPÉRER LES ÉTUDIANTS - SANS FILTRE
// ============================================================================

async function testGetAllStudents() {
  try {
    const students = await departmentHeadService.getStudents();
    console.log(`${students.length} étudiants trouvés`);
    students.forEach(s => console.log(`${s.prenom} ${s.nom} - ${s.eliminationStatus}`));
  } catch (error) {
    console.error('Erreur:', error);
  }
}

// ============================================================================
// 3. RÉCUPÉRER LES ÉTUDIANTS - AVEC FILTRES
// ============================================================================

// Exemple 1: Rechercher par nom
async function testSearchByName() {
  const students = await departmentHeadService.getStudents({
    search: 'Ahmed'
  });
  console.log('Résultats pour "Ahmed":', students.length);
}

// Exemple 2: Filtrer par groupe
async function testFilterByGroup() {
  const students = await departmentHeadService.getStudents({
    groupe: 'A1'
  });
  console.log('Étudiants du groupe A1:', students.length);
}

// Exemple 3: Filtrer par spécialité
async function testFilterBySpeciality() {
  const students = await departmentHeadService.getStudents({
    specialite: 'Informatique'
  });
  console.log('Étudiants en Informatique:', students.length);
}

// Exemple 4: Filtrer par statut
async function testFilterByStatus() {
  // Obtenir les étudiants en risque
  const riskStudents = await departmentHeadService.getStudents({
    statut: 'Risque'
  });
  console.log('Étudiants en risque:', riskStudents.length);
  
  riskStudents.forEach(s => {
    console.log(`${s.prenom} ${s.nom} - ${s.absencePercentage}%`);
  });
}

// Exemple 5: Filtres combinés
async function testMultipleFilters() {
  const students = await departmentHeadService.getStudents({
    groupe: 'A1',
    specialite: 'Informatique',
    statut: 'Éliminé'
  });
  console.log('Étudiants éliminés en Informatique groupe A1:', students.length);
}

// ============================================================================
// 4. RÉCUPÉRER LES DÉTAILS D'UN ÉTUDIANT
// ============================================================================

async function testGetStudentDetails() {
  try {
    const details = await departmentHeadService.getStudentDetails(1);
    
    console.log('=== INFORMATIONS GÉNÉRALES ===');
    console.log(details.student);
    // {
    //   id: 1,
    //   nom: "Ahmed",
    //   prenom: "Mohamed",
    //   email: "ahmed@student.tn",
    //   specialite: "Informatique",
    //   groupe: "A1"
    // }
    
    console.log('\n=== ABSENCES ===');
    details.absences.forEach(a => {
      console.log(`${a.date} - ${a.subject} (${a.status})`);
    });
    
    console.log('\n=== ÉTAT PAR MATIÈRE ===');
    details.absencesBySubject.forEach(s => {
      console.log(`${s.subject}: ${s.totalAbsences} absences (${s.absencePercentage}%)`);
    });
  } catch (error) {
    console.error('Erreur:', error);
  }
}

// ============================================================================
// 5. RÉCUPÉRER LES STATISTIQUES
// ============================================================================

async function testGetStatistics() {
  try {
    const stats = await departmentHeadService.getStatistics();
    
    console.log('=== STATISTIQUES DÉPARTEMENTALES ===');
    console.log(`Total étudiants: ${stats.totalStudents}`);
    console.log(`OK: ${stats.okCount}`);
    console.log(`En risque: ${stats.atRiskCount}`);
    console.log(`Éliminés: ${stats.eliminatedCount}`);
    console.log(`Taux moyen: ${stats.averageAbsenteeismRate}%`);
    
    console.log('\n=== ABSENCE PAR DATE ===');
    stats.absencesByDate.forEach(item => {
      console.log(`${item.date}: ${item.count} absences`);
    });
    
    console.log('\n=== ÉTUDIANTS PAR SPÉCIALITÉ ===');
    Object.entries(stats.studentsBySpecialite).forEach(([spec, count]) => {
      console.log(`${spec}: ${count} étudiants`);
    });
  } catch (error) {
    console.error('Erreur:', error);
  }
}

// ============================================================================
// 6. EXPORTER EN CSV
// ============================================================================

async function testExportCSV() {
  try {
    await departmentHeadService.exportCSV();
    console.log('✅ Fichier CSV téléchargé');
    // Génère un fichier: department_students_2024-11-17T10:30:00.000Z.csv
  } catch (error) {
    console.error('❌ Erreur export:', error);
  }
}

// ============================================================================
// 7. CAS D'USAGE RÉELS
// ============================================================================

// Cas 1: Obtenir les top 5 étudiants les plus absentéistes
async function getTopAbsenters() {
  const students = await departmentHeadService.getStudents();
  const sorted = students
    .sort((a, b) => b.absencePercentage - a.absencePercentage)
    .slice(0, 5);
  
  console.log('=== TOP 5 LES PLUS ABSENTÉISTES ===');
  sorted.forEach((s, i) => {
    console.log(`${i+1}. ${s.prenom} ${s.nom} - ${s.absencePercentage}%`);
  });
}

// Cas 2: Identifier les matières à problème
async function identifyProblematicSubjects(studentId) {
  const details = await departmentHeadService.getStudentDetails(studentId);
  
  const problematic = details.absencesBySubject
    .filter(s => s.absencePercentage > 30)
    .sort((a, b) => b.absencePercentage - a.absencePercentage);
  
  console.log('=== MATIÈRES À PROBLÈME ===');
  problematic.forEach(s => {
    console.log(`⚠️ ${s.subject}: ${s.absencePercentage}% - ${s.eliminationStatus}`);
  });
  
  return problematic;
}

// Cas 3: Générer un rapport d'alerte
async function generateAlertReport() {
  console.log('📋 RAPPORT D\'ALERTE - ' + new Date().toLocaleDateString('fr-FR'));
  
  // Récupérer les statistiques
  const stats = await departmentHeadService.getStatistics();
  
  console.log('\n--- RÉSUMÉ ---');
  console.log(`Total: ${stats.totalStudents} étudiants`);
  console.log(`🟢 OK: ${stats.okCount} (${(stats.okCount/stats.totalStudents*100).toFixed(1)}%)`);
  console.log(`🟠 Risque: ${stats.atRiskCount} (${(stats.atRiskCount/stats.totalStudents*100).toFixed(1)}%)`);
  console.log(`🔴 Éliminé: ${stats.eliminatedCount} (${(stats.eliminatedCount/stats.totalStudents*100).toFixed(1)}%)`);
  console.log(`📊 Taux moyen: ${stats.averageAbsenteeismRate}%`);
  
  // Récupérer les étudiants en risque
  const riskStudents = await departmentHeadService.getStudents({
    statut: 'Risque'
  });
  
  console.log('\n--- ÉTUDIANTS EN RISQUE ---');
  riskStudents.slice(0, 10).forEach(s => {
    console.log(`⚠️ ${s.prenom} ${s.nom} (${s.groupe}) - ${s.absencePercentage}%`);
  });
  
  // Actions recommandées
  console.log('\n--- ACTIONS RECOMMANDÉES ---');
  if (stats.eliminatedCount > 0) {
    console.log(`1. Revoir les dossiers des ${stats.eliminatedCount} étudiants éliminés`);
  }
  if (stats.atRiskCount > stats.totalStudents * 0.2) {
    console.log('2. Mettre en place un programme de suivi spécialisé');
  }
  if (stats.averageAbsenteeismRate > 20) {
    console.log('3. Organiser une réunion avec les enseignants');
  }
}

// Cas 4: Comparer les groupes
async function compareGroups() {
  const students = await departmentHeadService.getStudents();
  
  // Regrouper par groupe
  const byGroup = {};
  students.forEach(s => {
    if (!byGroup[s.groupe]) {
      byGroup[s.groupe] = [];
    }
    byGroup[s.groupe].push(s);
  });
  
  console.log('=== COMPARAISON DES GROUPES ===');
  Object.entries(byGroup).forEach(([group, groupStudents]) => {
    const avgAbsence = groupStudents.reduce((a, b) => a + b.absencePercentage, 0) / groupStudents.length;
    const eliminated = groupStudents.filter(s => s.eliminationStatus === 'Éliminé').length;
    
    console.log(`\nGroupe ${group}:`);
    console.log(`  Effectif: ${groupStudents.length}`);
    console.log(`  Moyenne absences: ${avgAbsence.toFixed(1)}%`);
    console.log(`  Éliminés: ${eliminated}`);
  });
}

// ============================================================================
// 8. GESTION DES ERREURS
// ============================================================================

async function testErrorHandling() {
  try {
    // Test avec ID invalide
    await departmentHeadService.getStudentDetails(999999);
  } catch (error) {
    console.error('Erreur attendue:', error.message);
    // Résultat: "Error fetching student details: ..."
  }
}

// ============================================================================
// 9. SCRIPT DE TEST COMPLET
// ============================================================================

async function runAllTests() {
  console.log('🚀 DÉMARRAGE DES TESTS\n');
  
  try {
    console.log('1. Récupération du département...');
    await testGetDepartment();
    
    console.log('\n2. Récupération de tous les étudiants...');
    await testGetAllStudents();
    
    console.log('\n3. Filtres...');
    await testFilterByStatus();
    
    console.log('\n4. Détails d\'un étudiant...');
    await testGetStudentDetails();
    
    console.log('\n5. Statistiques...');
    await testGetStatistics();
    
    console.log('\n6. Rapport d\'alerte...');
    await generateAlertReport();
    
    console.log('\n7. Comparaison des groupes...');
    await compareGroups();
    
    console.log('\n✅ TOUS LES TESTS TERMINÉS');
  } catch (error) {
    console.error('❌ ERREUR PENDANT LES TESTS:', error);
  }
}

// ============================================================================
// EXPORT POUR UTILISATION
// ============================================================================

export {
  testGetDepartment,
  testGetAllStudents,
  testFilterByStatus,
  testGetStudentDetails,
  testGetStatistics,
  testExportCSV,
  getTopAbsenters,
  identifyProblematicSubjects,
  generateAlertReport,
  compareGroups,
  testErrorHandling,
  runAllTests
};

// ============================================================================
// NOTES D'UTILISATION
// ============================================================================

/*
CONFIGURATION REQUISE:
1. Token JWT valide dans localStorage ou cookies
2. Backend running sur http://localhost:4000
3. Service API configuré avec la bonne URL

RÉSULTATS ATTENDUS:
- Tous les appels API retournent les données formatées
- Les filtres réduisent correctement la liste
- Les statistiques sont calculées correctement
- L'export CSV fonctionne sans erreur

DÉBOGAGE:
- Ouvrir la console du navigateur (F12)
- Vérifier les logs du backend
- Valider les données dans la base de données
- Vérifier les erreurs CORS

UTILISATION EN PRODUCTION:
- Gérer les erreurs avec try/catch
- Ajouter des spinners de chargement
- Valider les entrées utilisateur
- Implémenter une mise en cache
- Ajouter des notifications d'erreur
*/
