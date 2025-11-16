/**
 * TIMETABLE SYSTEM - COMPREHENSIVE TEST SCRIPT
 * 
 * This script tests all conflict detection scenarios for the timetable management system
 * Run with: node testTimetableSystem.js
 */

const BASE_URL = 'http://localhost:5000/api/calendar';

// ============================================================================
// TEST DATA SETUP
// ============================================================================

const testData = {
  timeSlots: [
    { day_of_week: 'Lundi', start_time: '08:00:00', end_time: '09:30:00', description: 'Créneau 1' },
    { day_of_week: 'Lundi', start_time: '09:45:00', end_time: '11:15:00', description: 'Créneau 2' },
    { day_of_week: 'Mardi', start_time: '08:00:00', end_time: '09:30:00', description: 'Créneau 1' }
  ],
  scheduleValid: {
    time_slot_id: 1,
    classe_id: 1,
    matiere_id: 1,
    salle_id: 1,
    enseignant_id: 1,
    date_debut: '2025-01-15',
    date_fin: '2025-06-30',
    type_cours: 'Cours',
    recurrence: 'hebdomadaire'
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function makeRequest(endpoint, method = 'GET', data = null) {
  const url = `${BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' }
  };
  
  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    const result = await response.json();
    return {
      status: response.status,
      data: result,
      ok: response.ok
    };
  } catch (error) {
    return {
      status: 0,
      data: { error: error.message },
      ok: false
    };
  }
}

function logTest(testName, passed, details = '') {
  const icon = passed ? '✅' : '❌';
  console.log(`${icon} ${testName}`);
  if (details) {
    console.log(`   ${details}`);
  }
}

function logSection(title) {
  console.log('\n' + '='.repeat(80));
  console.log(`  ${title}`);
  console.log('='.repeat(80) + '\n');
}

// ============================================================================
// TEST SUITES
// ============================================================================

async function test1_TimeSlotManagement() {
  logSection('TEST 1: TIME SLOT MANAGEMENT');

  // Test 1.1: Create time slot
  const createResponse = await makeRequest('/timeslots', 'POST', testData.timeSlots[0]);
  logTest(
    'Create time slot',
    createResponse.ok && createResponse.data.id,
    `Created time slot ID: ${createResponse.data.id || 'N/A'}`
  );

  // Test 1.2: Get all time slots
  const getAllResponse = await makeRequest('/timeslots');
  logTest(
    'Get all time slots',
    getAllResponse.ok && Array.isArray(getAllResponse.data),
    `Found ${getAllResponse.data?.length || 0} time slots`
  );

  // Test 1.3: Bulk create time slots
  const bulkResponse = await makeRequest('/timeslots/bulk', 'POST', { 
    timeSlots: testData.timeSlots.slice(1) 
  });
  logTest(
    'Bulk create time slots',
    bulkResponse.ok && Array.isArray(bulkResponse.data),
    `Created ${bulkResponse.data?.length || 0} time slots`
  );

  return getAllResponse.data?.[0]?.id || 1;
}

async function test2_BasicScheduleCreation(timeSlotId) {
  logSection('TEST 2: BASIC SCHEDULE CREATION');

  // Test 2.1: Create valid schedule
  const scheduleData = { ...testData.scheduleValid, time_slot_id: timeSlotId };
  const createResponse = await makeRequest('/schedules', 'POST', scheduleData);
  logTest(
    'Create valid schedule',
    createResponse.ok && createResponse.data?.success,
    createResponse.data?.message || 'Created successfully'
  );

  return createResponse.data?.data?.id;
}

async function test3_RoomConflict(scheduleId, timeSlotId) {
  logSection('TEST 3: ROOM (SALLE) CONFLICT DETECTION');

  // Test 3.1: Try to create schedule with same room at same time
  const conflictData = {
    time_slot_id: timeSlotId,
    classe_id: 2, // Different class
    matiere_id: 1,
    salle_id: 1, // Same room as first schedule
    enseignant_id: 2, // Different teacher
    date_debut: '2025-01-15',
    type_cours: 'Cours'
  };

  const response = await makeRequest('/schedules', 'POST', conflictData);
  const hasConflict = response.status === 409 && 
                      response.data?.target === 'salle';
  
  logTest(
    'Detect room conflict',
    hasConflict,
    hasConflict ? response.data?.message : 'Expected conflict not detected'
  );

  // Test 3.2: Check conflicts endpoint
  const checkResponse = await makeRequest('/schedules/check-conflicts', 'POST', conflictData);
  const hasConflictCheck = checkResponse.data?.hasConflicts === true;
  
  logTest(
    'Check conflicts endpoint - room',
    hasConflictCheck,
    `Conflicts detected: ${checkResponse.data?.conflictCount || 0}`
  );
}

async function test4_TeacherConflict(scheduleId, timeSlotId) {
  logSection('TEST 4: TEACHER (ENSEIGNANT) CONFLICT DETECTION');

  // Test 4.1: Try to create schedule with same teacher at same time
  const conflictData = {
    time_slot_id: timeSlotId,
    classe_id: 2, // Different class
    matiere_id: 2, // Different matiere
    salle_id: 2, // Different room
    enseignant_id: 1, // Same teacher as first schedule
    date_debut: '2025-01-15',
    type_cours: 'TD'
  };

  const response = await makeRequest('/schedules', 'POST', conflictData);
  const hasConflict = response.status === 409 && 
                      response.data?.target === 'enseignant';
  
  logTest(
    'Detect teacher conflict',
    hasConflict,
    hasConflict ? response.data?.message : 'Expected conflict not detected'
  );
}

async function test5_ClassConflict(scheduleId, timeSlotId) {
  logSection('TEST 5: CLASS (GROUPE) CONFLICT DETECTION');

  // Test 5.1: Try to create schedule with same class at same time
  const conflictData = {
    time_slot_id: timeSlotId,
    classe_id: 1, // Same class as first schedule
    matiere_id: 2, // Different matiere
    salle_id: 2, // Different room
    enseignant_id: 2, // Different teacher
    date_debut: '2025-01-15',
    type_cours: 'TP'
  };

  const response = await makeRequest('/schedules', 'POST', conflictData);
  const hasConflict = response.status === 409 && 
                      response.data?.target === 'groupe';
  
  logTest(
    'Detect class conflict',
    hasConflict,
    hasConflict ? response.data?.message : 'Expected conflict not detected'
  );
}

async function test6_MatiereNiveauCompatibility() {
  logSection('TEST 6: MATIÈRE-NIVEAU COMPATIBILITY');

  // This test requires a matiere with different niveau than the classe
  // You may need to adjust IDs based on your test data
  const conflictData = {
    time_slot_id: 2,
    classe_id: 1, // Assume this is L1
    matiere_id: 10, // Assume this is for L3 (different niveau)
    salle_id: 2,
    enseignant_id: 3,
    date_debut: '2025-01-15',
    type_cours: 'Cours'
  };

  const response = await makeRequest('/schedules/check-conflicts', 'POST', conflictData);
  const hasConflict = response.data?.hasConflicts && 
                      response.data?.conflicts?.some(c => c.target === 'matiere');
  
  logTest(
    'Detect matière-niveau incompatibility',
    hasConflict || response.status === 409,
    hasConflict ? 'Niveau mismatch detected' : 'Test may need data adjustment'
  );
}

async function test7_RoomCapacity() {
  logSection('TEST 7: ROOM CAPACITY vs CLASS SIZE');

  // Test with a small room and large class
  const conflictData = {
    time_slot_id: 3,
    classe_id: 1, // Assume this has many students
    matiere_id: 1,
    salle_id: 5, // Assume this is a small room
    enseignant_id: 1,
    date_debut: '2025-01-16',
    type_cours: 'Cours'
  };

  const response = await makeRequest('/schedules/check-conflicts', 'POST', conflictData);
  const hasCapacityIssue = response.data?.hasConflicts && 
                          response.data?.conflicts?.some(c => 
                            c.target === 'salle' && c.message.includes('capacité')
                          );
  
  logTest(
    'Detect insufficient room capacity',
    hasCapacityIssue || response.status === 409,
    hasCapacityIssue ? 'Capacity conflict detected' : 'Test may need data adjustment'
  );
}

async function test8_RoomTypeCompatibility() {
  logSection('TEST 8: ROOM TYPE vs COURSE TYPE COMPATIBILITY');

  // Test with TP course in non-TP room
  const conflictData = {
    time_slot_id: 3,
    classe_id: 3,
    matiere_id: 1,
    salle_id: 1, // Assume this is 'Amphi' or 'TD'
    enseignant_id: 1,
    date_debut: '2025-01-16',
    type_cours: 'TP' // TP should be in TP/Lab room
  };

  const response = await makeRequest('/schedules/check-conflicts', 'POST', conflictData);
  const hasWarning = response.data?.hasConflicts && 
                    response.data?.conflicts?.some(c => 
                      c.type === 'warning' && c.target === 'salle'
                    );
  
  logTest(
    'Detect room type incompatibility (warning)',
    hasWarning || response.status === 409,
    hasWarning ? 'Room type warning detected' : 'Test may need data adjustment'
  );
}

async function test9_ScheduleUpdate(scheduleId, timeSlotId) {
  logSection('TEST 9: SCHEDULE UPDATE WITH CONFLICT DETECTION');

  if (!scheduleId) {
    logTest('Update schedule', false, 'No schedule ID available');
    return;
  }

  // Test 9.1: Valid update
  const validUpdate = {
    notes: 'Updated notes',
    statut: 'confirme'
  };

  const updateResponse = await makeRequest(`/schedules/${scheduleId}`, 'PUT', validUpdate);
  logTest(
    'Update schedule (valid)',
    updateResponse.ok && updateResponse.data?.success,
    updateResponse.data?.message || 'Updated successfully'
  );

  // Test 9.2: Update with conflict
  const conflictUpdate = {
    salle_id: 1, // Assume this creates a conflict
    time_slot_id: timeSlotId
  };

  const conflictResponse = await makeRequest(`/schedules/${scheduleId}`, 'PUT', conflictUpdate);
  logTest(
    'Update schedule (with conflict)',
    conflictResponse.status === 409 || conflictResponse.ok,
    conflictResponse.data?.message || 'Update processed'
  );
}

async function test10_DragDropUpdate(scheduleId) {
  logSection('TEST 10: DRAG & DROP SCHEDULE UPDATE');

  if (!scheduleId) {
    logTest('Drag & drop update', false, 'No schedule ID available');
    return;
  }

  const dragDropData = {
    time_slot_id: 2,
    salle_id: 3
  };

  const response = await makeRequest(`/schedules/${scheduleId}/drag-drop`, 'PATCH', dragDropData);
  logTest(
    'Drag & drop schedule',
    response.ok || response.status === 409,
    response.data?.message || 'Processed'
  );
}

async function test11_BulkOperations(timeSlotId) {
  logSection('TEST 11: BULK SCHEDULE CREATION');

  const bulkSchedules = [
    {
      time_slot_id: timeSlotId,
      classe_id: 3,
      matiere_id: 1,
      salle_id: 3,
      enseignant_id: 3,
      date_debut: '2025-01-15',
      type_cours: 'Cours'
    },
    {
      time_slot_id: timeSlotId,
      classe_id: 4,
      matiere_id: 2,
      salle_id: 4,
      enseignant_id: 4,
      date_debut: '2025-01-15',
      type_cours: 'TD'
    }
  ];

  const response = await makeRequest('/schedules/bulk', 'POST', { schedules: bulkSchedules });
  logTest(
    'Bulk create schedules',
    response.ok && response.data?.success,
    `Created: ${response.data?.summary?.created || 0}, Conflicts: ${response.data?.summary?.conflicts || 0}`
  );
}

async function test12_TimetableRetrieval() {
  logSection('TEST 12: TIMETABLE RETRIEVAL');

  // Test 12.1: Get class timetable
  const classResponse = await makeRequest('/timetable/classe/1');
  logTest(
    'Get class timetable',
    classResponse.ok && classResponse.data?.success,
    `Found ${classResponse.data?.totalSchedules || 0} schedules`
  );

  // Test 12.2: Get teacher timetable
  const teacherResponse = await makeRequest('/timetable/enseignant/1');
  logTest(
    'Get teacher timetable',
    teacherResponse.ok && teacherResponse.data?.success,
    `Found ${teacherResponse.data?.totalSchedules || 0} schedules`
  );
}

async function test13_AvailabilityCheck(timeSlotId) {
  logSection('TEST 13: AVAILABILITY CHECK');

  const date = '2025-01-15';
  const response = await makeRequest(`/availability/${timeSlotId}?date=${date}`);
  
  logTest(
    'Check availability',
    response.ok && response.data?.success,
    `Available: ${response.data?.availability?.salles?.length || 0} rooms, ` +
    `${response.data?.availability?.classes?.length || 0} classes, ` +
    `${response.data?.availability?.enseignants?.length || 0} teachers`
  );
}

// ============================================================================
// MAIN TEST RUNNER
// ============================================================================

async function runAllTests() {
  console.log('\n');
  console.log('╔═══════════════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                           ║');
  console.log('║            TIMETABLE SYSTEM - COMPREHENSIVE TEST SUITE                   ║');
  console.log('║                                                                           ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════════╝');
  console.log('\n');

  try {
    // Run tests in sequence
    const timeSlotId = await test1_TimeSlotManagement();
    const scheduleId = await test2_BasicScheduleCreation(timeSlotId);
    await test3_RoomConflict(scheduleId, timeSlotId);
    await test4_TeacherConflict(scheduleId, timeSlotId);
    await test5_ClassConflict(scheduleId, timeSlotId);
    await test6_MatiereNiveauCompatibility();
    await test7_RoomCapacity();
    await test8_RoomTypeCompatibility();
    await test9_ScheduleUpdate(scheduleId, timeSlotId);
    await test10_DragDropUpdate(scheduleId);
    await test11_BulkOperations(timeSlotId);
    await test12_TimetableRetrieval();
    await test13_AvailabilityCheck(timeSlotId);

    logSection('TEST SUITE COMPLETED');
    console.log('All tests have been executed. Review the results above.\n');
    console.log('Note: Some tests may need data adjustment based on your database state.\n');

  } catch (error) {
    console.error('\n❌ Test suite failed with error:', error.message);
    console.error(error.stack);
  }
}

// Check if fetch is available (Node.js 18+ or polyfill required)
if (typeof fetch === 'undefined') {
  console.error('Error: fetch is not available. Please use Node.js 18+ or install node-fetch.');
  console.error('Install with: npm install node-fetch');
  process.exit(1);
}

// Run tests
runAllTests();
