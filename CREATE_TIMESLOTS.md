# Create Time Slots for Timetable

## Problem
You can only create schedules at 10:45-11:15 because that's the only time slot in your database.

## Solution
You need to create time slots for all the times shown in your weekly calendar.

## Quick Fix - Run this in Browser Console

Go to `http://localhost:5173/calendar/weekly-view` and paste this in the browser console (F12):

```javascript
// Time slots to create
const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const slots = [
  { start: '08:00:00', end: '09:30:00' },
  { start: '10:45:00', end: '11:15:00' }, // Already exists
  { start: '11:30:00', end: '13:00:00' },
  { start: '14:00:00', end: '15:30:00' },
  { start: '15:45:00', end: '17:15:00' },
  { start: '17:30:00', end: '19:00:00' }
];

async function createTimeSlots() {
  for (const day of days) {
    for (const slot of slots) {
      try {
        const response = await fetch('http://localhost:3000/api/calendar/timeslots', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            day_of_week: day,
            start_time: slot.start,
            end_time: slot.end,
            is_active: true,
            description: `${day} ${slot.start.substring(0,5)} - ${slot.end.substring(0,5)}`
          })
        });
        
        if (response.ok) {
          console.log(`✓ Created: ${day} ${slot.start} - ${slot.end}`);
        } else {
          const error = await response.text();
          console.log(`✗ ${day} ${slot.start}: ${error}`);
        }
      } catch (error) {
        console.error(`Error creating ${day} ${slot.start}:`, error);
      }
      
      // Small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  console.log('✅ Done! Refresh the page to see all time slots.');
}

// Run it
createTimeSlots();
```

## Manual Method

Or go to: `http://localhost:5173/calendar/timeslots`

And create these time slots for EACH day (Lundi, Mardi, Mercredi, Jeudi, Vendredi, Samedi):

1. **08:00 - 09:30**
2. **10:45 - 11:15** (already exists)
3. **11:30 - 13:00**
4. **14:00 - 15:30**
5. **15:45 - 17:15**
6. **17:30 - 19:00**

Total: 6 time slots × 6 days = 36 time slots needed

## After Creating Time Slots

1. Refresh the weekly view page
2. You'll now be able to click on any time slot to create a schedule
3. The time slot dropdown in the form will show all available slots
