/**
 * Simple test to verify calendar API is working
 * Run this to check if schedules can be fetched
 */

const API_BASE = 'http://localhost:3000/api/calendar';

async function testCalendarAPI() {
  console.log('🧪 Testing Calendar API...\n');

  try {
    // Test 1: Fetch all schedules
    console.log('1️⃣ Testing GET /schedules...');
    const response = await fetch(`${API_BASE}/schedules`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const schedules = await response.json();
    console.log(`✅ Success! Found ${schedules.length} schedules\n`);

    if (schedules.length > 0) {
      console.log('📋 Sample schedule:');
      const sample = schedules[0];
      console.log(JSON.stringify(sample, null, 2));
      console.log('');
    } else {
      console.log('⚠️  No schedules found. Run: node backend/scripts/addSampleSchedules.js\n');
    }

    // Test 2: Fetch time slots
    console.log('2️⃣ Testing GET /timeslots...');
    const tsResponse = await fetch(`${API_BASE}/timeslots`);
    const timeSlots = await tsResponse.json();
    console.log(`✅ Success! Found ${timeSlots.length} time slots\n`);

    console.log('✨ Calendar API is working correctly!\n');
    console.log('📍 View calendar at: http://localhost:5173/calendar/events\n');

  } catch (error) {
    console.error('❌ Error testing API:', error.message);
    console.log('\n📝 Make sure:');
    console.log('  1. Backend server is running (node backend/Reference_documents/server.js)');
    console.log('  2. Database is configured correctly');
    console.log('  3. Tables are created (node backend/scripts/initCalendar.js)');
    console.log('');
  }
}

// Run the test
testCalendarAPI();
