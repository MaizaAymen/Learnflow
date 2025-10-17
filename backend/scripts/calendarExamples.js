/**
 * Calendar System Usage Examples
 * This file contains practical examples of how to use the calendar system API
 */

const API_BASE = 'http://localhost:3000/api/calendar';

// ============================================
// EXAMPLE 1: Setup Time Slots for a Week
// ============================================
async function setupWeeklyTimeSlots() {
  const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const slots = [
    { start: '08:00:00', end: '10:00:00', desc: 'Séance 1' },
    { start: '10:15:00', end: '12:15:00', desc: 'Séance 2' },
    { start: '14:00:00', end: '16:00:00', desc: 'Séance 3' },
    { start: '16:15:00', end: '18:15:00', desc: 'Séance 4' }
  ];

  const timeSlots = [];
  for (const day of days) {
    for (const slot of slots) {
      timeSlots.push({
        day_of_week: day,
        start_time: slot.start,
        end_time: slot.end,
        description: slot.desc,
        is_active: true
      });
    }
  }

  const response = await fetch(`${API_BASE}/timeslots/bulk`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ timeSlots })
  });

  return await response.json();
}

// ============================================
// EXAMPLE 2: Create a Weekly Course Schedule
// ============================================
async function createWeeklyCourseSchedule() {
  // Schedule: Mathématiques every Monday 08:00-10:00 for Class G1
  const scheduleData = {
    time_slot_id: 1, // Monday 08:00-10:00
    classe_id: 1, // Class G1
    matiere_id: 5, // Mathematics
    salle_id: 10, // Room Amphi A
    enseignant_id: 42, // Teacher ID
    date_debut: '2025-01-06', // Start date
    date_fin: '2025-06-30', // End date
    type_cours: 'Cours', // Course type
    recurrence: 'hebdomadaire', // Weekly recurrence
    notes: 'Cours magistral de mathématiques'
  };

  const response = await fetch(`${API_BASE}/schedules`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(scheduleData)
  });

  return await response.json();
}

// ============================================
// EXAMPLE 3: Get Weekly Schedule for a Class
// ============================================
async function getClassWeeklySchedule(classeId, date = null) {
  const dateParam = date ? `?date=${date}` : '';
  const response = await fetch(
    `${API_BASE}/schedules/classe/${classeId}/week${dateParam}`
  );
  
  const schedules = await response.json();
  
  // Display in a user-friendly format
  console.log(`\n📅 Planning hebdomadaire - Classe ${classeId}\n`);
  
  const dayOrder = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  
  dayOrder.forEach(day => {
    const daySchedules = schedules.filter(s => s.timeSlot.day_of_week === day);
    if (daySchedules.length > 0) {
      console.log(`\n${day}:`);
      daySchedules.forEach(schedule => {
        console.log(`  ${schedule.timeSlot.start_time} - ${schedule.timeSlot.end_time}`);
        console.log(`    📚 ${schedule.matiere.name}`);
        console.log(`    🏫 ${schedule.salle ? schedule.salle.nom : 'Salle non définie'}`);
        console.log(`    👨‍🏫 Enseignant ID: ${schedule.enseignant_id || 'Non assigné'}`);
        console.log(`    📝 ${schedule.type_cours}`);
      });
    }
  });
  
  return schedules;
}

// ============================================
// EXAMPLE 4: Check Available Time Slots
// ============================================
async function checkAvailableSlots(date, filters = {}) {
  const params = new URLSearchParams({
    date,
    ...filters // Can include: classe_id, salle_id, enseignant_id
  });

  const response = await fetch(
    `${API_BASE}/schedules/availability/timeslots?${params}`
  );
  
  const availability = await response.json();
  
  console.log(`\n✅ Créneaux disponibles pour le ${date}:`);
  console.log(`Total: ${availability.total} | Disponibles: ${availability.available} | Occupés: ${availability.busy}\n`);
  
  availability.availableSlots.forEach(slot => {
    console.log(`  ${slot.start_time} - ${slot.end_time} | ${slot.description}`);
  });
  
  return availability;
}

// ============================================
// EXAMPLE 5: Book a Class for a Student
// ============================================
async function bookClass(scheduleId, userId, userType = 'student') {
  const bookingData = {
    schedule_id: scheduleId,
    user_id: userId,
    user_type: userType,
    notes: 'Inscription automatique'
  };

  const response = await fetch(`${API_BASE}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bookingData)
  });

  return await response.json();
}

// ============================================
// EXAMPLE 6: Mark Student Attendance
// ============================================
async function markAttendance(bookingId, isPresent) {
  const response = await fetch(`${API_BASE}/bookings/${bookingId}/attendance`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ presence: isPresent })
  });

  return await response.json();
}

// ============================================
// EXAMPLE 7: Get Attendance Report
// ============================================
async function getAttendanceReport(scheduleId) {
  const response = await fetch(
    `${API_BASE}/bookings/schedule/${scheduleId}/attendance`
  );
  
  const report = await response.json();
  
  console.log(`\n📊 Rapport de présence - Cours ${scheduleId}\n`);
  console.log(`Total étudiants: ${report.statistics.total}`);
  console.log(`Présents: ${report.statistics.present} ✓`);
  console.log(`Absents: ${report.statistics.absent} ✗`);
  console.log(`En attente: ${report.statistics.pending} ⏳\n`);
  
  return report;
}

// ============================================
// EXAMPLE 8: Get Teacher's Schedule
// ============================================
async function getTeacherSchedule(enseignantId, dateDebut = null, dateFin = null) {
  const params = new URLSearchParams();
  if (dateDebut) params.append('date_debut', dateDebut);
  if (dateFin) params.append('date_fin', dateFin);

  const queryString = params.toString();
  const url = `${API_BASE}/schedules/teacher/${enseignantId}${queryString ? '?' + queryString : ''}`;
  
  const response = await fetch(url);
  const schedules = await response.json();
  
  console.log(`\n👨‍🏫 Planning enseignant ${enseignantId}\n`);
  console.log(`Nombre de cours: ${schedules.length}\n`);
  
  schedules.forEach((schedule, index) => {
    console.log(`${index + 1}. ${schedule.matiere.name} - Classe ${schedule.classe.nom}`);
    console.log(`   ${schedule.timeSlot.day_of_week} ${schedule.timeSlot.start_time}-${schedule.timeSlot.end_time}`);
    console.log(`   Salle: ${schedule.salle ? schedule.salle.nom : 'Non définie'}`);
    console.log(`   Statut: ${schedule.statut}\n`);
  });
  
  return schedules;
}

// ============================================
// EXAMPLE 9: Cancel a Schedule
// ============================================
async function cancelSchedule(scheduleId) {
  const response = await fetch(`${API_BASE}/schedules/${scheduleId}/cancel`, {
    method: 'PATCH'
  });

  return await response.json();
}

// ============================================
// EXAMPLE 10: Update Schedule (Change Room)
// ============================================
async function changeScheduleRoom(scheduleId, newSalleId) {
  const response = await fetch(`${API_BASE}/schedules/${scheduleId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ salle_id: newSalleId })
  });

  return await response.json();
}

// ============================================
// EXAMPLE 11: Bulk Create Schedules for a Semester
// ============================================
async function createSemesterSchedule(classeId, scheduleConfig) {
  /**
   * scheduleConfig example:
   * [
   *   { day: 'Lundi', time_slot_id: 1, matiere_id: 5, salle_id: 10, enseignant_id: 42 },
   *   { day: 'Mardi', time_slot_id: 5, matiere_id: 3, salle_id: 11, enseignant_id: 43 },
   *   ...
   * ]
   */
  
  const semester = {
    date_debut: '2025-02-01',
    date_fin: '2025-06-30'
  };

  const results = [];
  
  for (const config of scheduleConfig) {
    const scheduleData = {
      time_slot_id: config.time_slot_id,
      classe_id: classeId,
      matiere_id: config.matiere_id,
      salle_id: config.salle_id,
      enseignant_id: config.enseignant_id,
      date_debut: semester.date_debut,
      date_fin: semester.date_fin,
      type_cours: config.type_cours || 'Cours',
      recurrence: 'hebdomadaire'
    };

    try {
      const response = await fetch(`${API_BASE}/schedules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scheduleData)
      });
      
      const result = await response.json();
      results.push({ success: true, data: result });
    } catch (error) {
      results.push({ success: false, error: error.message, config });
    }
  }
  
  console.log(`\n✅ Création du planning semestriel terminée`);
  console.log(`Succès: ${results.filter(r => r.success).length}/${results.length}`);
  
  return results;
}

// ============================================
// EXAMPLE 12: Get Student's Personal Schedule
// ============================================
async function getStudentPersonalSchedule(userId) {
  // First, get all bookings for the student
  const response = await fetch(
    `${API_BASE}/bookings?user_id=${userId}&user_type=student&statut=confirmed`
  );
  
  const bookings = await response.json();
  
  console.log(`\n📚 Planning personnel - Étudiant ${userId}\n`);
  console.log(`Cours inscrits: ${bookings.length}\n`);
  
  // Group by day of week
  const scheduleByDay = {};
  
  bookings.forEach(booking => {
    const day = booking.schedule.timeSlot.day_of_week;
    if (!scheduleByDay[day]) {
      scheduleByDay[day] = [];
    }
    scheduleByDay[day].push(booking.schedule);
  });
  
  const dayOrder = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  
  dayOrder.forEach(day => {
    if (scheduleByDay[day]) {
      console.log(`\n${day}:`);
      scheduleByDay[day]
        .sort((a, b) => a.timeSlot.start_time.localeCompare(b.timeSlot.start_time))
        .forEach(schedule => {
          console.log(`  ${schedule.timeSlot.start_time} - ${schedule.timeSlot.end_time}`);
          console.log(`    📚 ${schedule.matiere.name}`);
          console.log(`    🏫 ${schedule.salle ? schedule.salle.nom : 'Salle TBD'}`);
          console.log(`    📝 ${schedule.type_cours}`);
        });
    }
  });
  
  return bookings;
}

// ============================================
// Export all examples
// ============================================
module.exports = {
  setupWeeklyTimeSlots,
  createWeeklyCourseSchedule,
  getClassWeeklySchedule,
  checkAvailableSlots,
  bookClass,
  markAttendance,
  getAttendanceReport,
  getTeacherSchedule,
  cancelSchedule,
  changeScheduleRoom,
  createSemesterSchedule,
  getStudentPersonalSchedule
};

// ============================================
// Demo Runner (uncomment to test)
// ============================================
/*
async function runDemo() {
  console.log('🚀 Running Calendar System Demo...\n');
  
  try {
    // 1. Setup time slots
    console.log('1️⃣ Setting up time slots...');
    await setupWeeklyTimeSlots();
    
    // 2. Create a schedule
    console.log('\n2️⃣ Creating a weekly schedule...');
    const schedule = await createWeeklyCourseSchedule();
    console.log('Created schedule:', schedule.id);
    
    // 3. Check availability
    console.log('\n3️⃣ Checking available slots...');
    await checkAvailableSlots('2025-01-20', { classe_id: 1 });
    
    // 4. Get class schedule
    console.log('\n4️⃣ Getting class weekly schedule...');
    await getClassWeeklySchedule(1);
    
    console.log('\n✨ Demo completed successfully!');
  } catch (error) {
    console.error('❌ Demo failed:', error);
  }
}

// Uncomment to run the demo
// runDemo();
*/
