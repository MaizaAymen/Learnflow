# 🎯 QUICK FIX: Calendar Events Display

## Problem
Need to display course schedules in the calendar at `http://localhost:5173/calendar/events`

## Solution Summary
I've fixed the EventCalendar component to fetch real schedules from the backend and display them with proper color coding.

## ✅ What Was Fixed

### 1. Frontend (EventCalendar.jsx)
- ✅ Added API call to fetch schedules from backend
- ✅ Added date filtering logic to show courses on correct days
- ✅ Added color coding by course type (Cours/TD/TP/Examen/Soutien)
- ✅ Added loading state and error handling
- ✅ Added legend for color codes
- ✅ Shows course time, subject, and class name

### 2. Backend (Already exists)
- ✅ Calendar API routes at `/api/calendar/*`
- ✅ Schedule model with all relations
- ✅ TimeSlot, Classe, Matière, Salle models

### 3. Helper Scripts Created
- ✅ `addSampleSchedules.js` - Add test data
- ✅ `testCalendarAPI.js` - Test API connectivity
- ✅ `start-backend.ps1` - Start both servers

## 🚀 Quick Start (3 Steps)

### Step 1: Start Backend Server
```powershell
cd "backend\Reference_documents"
node server.js
```
Server should start on **port 3000** ✅

### Step 2: Add Sample Data (if database is empty)
```powershell
# Initialize time slots
cd backend\scripts
node initCalendar.js

# Add sample schedules
node addSampleSchedules.js
```

### Step 3: Open Calendar
```
http://localhost:5173/calendar/events
```

## 🧪 Test API
```powershell
cd backend\scripts
node testCalendarAPI.js
```

This will verify:
- ✅ Backend is running
- ✅ API is accessible
- ✅ Schedules are in database
- ✅ Data structure is correct

## 📊 Expected Result

You should see:
- Monthly calendar view
- Color-coded course badges on specific dates
- Course info: Time, Subject, Class
- Legend showing what each color means
- Total count of scheduled courses

### Color Legend
- 🔵 **Blue (processing)** = Cours (Lecture)
- 🟡 **Yellow (warning)** = TD (Tutorial)  
- 🟢 **Green (success)** = TP (Lab Work)
- 🔴 **Red (error)** = Examen (Exam)
- ⚪ **Gray (default)** = Soutien (Support)

## 🔍 How It Works

### Data Flow
```
PostgreSQL Database
    ↓
Schedule Model (with relations to TimeSlot, Classe, Matière, Salle)
    ↓
GET /api/calendar/schedules
    ↓
EventCalendar Component (React)
    ↓
Ant Design Calendar with custom cell renderer
    ↓
User sees courses on calendar
```

### Logic
1. Component fetches all schedules on mount
2. For each calendar date, it:
   - Gets day of week (Lundi, Mardi, etc.)
   - Filters schedules that:
     - Match the day of week
     - Are within date range (date_debut to date_fin)
     - Are not cancelled (statut !== 'annule')
3. Displays each course as a badge with:
   - Color based on type_cours
   - Text showing time, subject, and class

## 🐛 Troubleshooting

### Calendar Shows "No courses found"
**Solution:**
```powershell
cd backend\scripts
node addSampleSchedules.js
```

### API Error 500
**Check:**
1. Backend server running? `http://localhost:3000/api/calendar/schedules`
2. Database connected? Check server.js output
3. Tables created? Run `node backend/scripts/initCalendar.js`

### CORS Error
**Fix:** Backend already has CORS enabled for `http://localhost:5173`
```javascript
app.use(cors({ 
  origin: "http://localhost:5173", 
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true 
}));
```

### Nothing Shows on Calendar
**Debug steps:**
1. Open browser DevTools (F12)
2. Check Console tab for errors
3. Check Network tab - verify API call to `/api/calendar/schedules`
4. Check if response has data

### Port Already in Use
```powershell
# Kill process on port 3000
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force
```

## 📁 Files Changed/Created

### Modified
- ✅ `frontend/learnflow/src/admin/EventCalendar.jsx` - Complete rewrite to fetch real data

### Created
- ✅ `backend/scripts/addSampleSchedules.js` - Add test schedules
- ✅ `backend/scripts/testCalendarAPI.js` - Test API
- ✅ `start-backend.ps1` - Start servers
- ✅ `CALENDAR_EVENTS_SETUP.md` - Detailed setup guide
- ✅ `CALENDAR_EVENTS_QUICKFIX.md` - This file

## 🎨 Features

### Current Features
- ✅ Monthly calendar view
- ✅ Color-coded events by type
- ✅ Shows time, subject, and class
- ✅ Handles recurring schedules
- ✅ Filters cancelled courses
- ✅ Loading state
- ✅ Error handling
- ✅ Empty state message
- ✅ Color legend

### Data Shown Per Event
- Time slot (e.g., "08:00 - 10:00")
- Subject name (Matière)
- Class name (Classe)

### Color Coding
Based on `type_cours` field:
- Cours → Blue
- TD → Yellow
- TP → Green
- Examen → Red
- Soutien → Gray

## 🔗 Related Endpoints

```javascript
// Get all schedules
GET /api/calendar/schedules

// Get schedules for a specific class
GET /api/calendar/schedules?classe_id=1

// Get schedules for a specific subject
GET /api/calendar/schedules?matiere_id=2

// Get schedules for a specific date
GET /api/calendar/schedules?date=2025-01-15

// Get weekly schedule for a class
GET /api/calendar/schedules/classe/:classe_id/week

// Get time slots
GET /api/calendar/timeslots
```

## 📝 Sample Schedule Object

```json
{
  "id": 1,
  "time_slot_id": 1,
  "classe_id": 1,
  "matiere_id": 5,
  "salle_id": 10,
  "enseignant_id": 42,
  "date_debut": "2025-01-01",
  "date_fin": "2025-06-30",
  "type_cours": "Cours",
  "recurrence": "hebdomadaire",
  "statut": "confirme",
  "timeSlot": {
    "day_of_week": "Lundi",
    "start_time": "08:00:00",
    "end_time": "10:00:00"
  },
  "classe": { "nom": "G1" },
  "matiere": { "nom": "Mathématiques" },
  "salle": { "nom": "Amphi A" }
}
```

## 🎯 Next Steps (Optional)

If you want to enhance further:

1. **Add Filters**: Filter by class, subject, or teacher
2. **Add Click Events**: Show detail modal on event click
3. **Add Create Button**: Create schedules directly from calendar
4. **Add Week View**: Alternative weekly view
5. **Add Today Indicator**: Highlight current date
6. **Add Event Count**: Show number of events per day

## ✅ Verification Checklist

- [ ] Backend server running on port 3000
- [ ] Frontend running on port 5173  
- [ ] Database connected
- [ ] Time slots created (run initCalendar.js)
- [ ] Sample schedules added (run addSampleSchedules.js)
- [ ] Calendar loads without errors
- [ ] Courses appear on correct dates
- [ ] Colors match course types
- [ ] Legend displays correctly

## 🆘 Still Having Issues?

Run the test script:
```powershell
cd backend\scripts
node testCalendarAPI.js
```

This will tell you exactly what's wrong!

---

**That's it! Your calendar should now be working! 🎉**
