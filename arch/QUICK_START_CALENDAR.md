# 🚀 QUICK START - Calendar CRUD System

## ⚡ 5-Minute Setup

### Step 1: Start Backend
```powershell
cd backend/Reference_documents
npm install  # If needed
npm start
# Should run on http://localhost:3000
```

### Step 2: Start Frontend
```powershell
cd frontend/learnflow
npm install  # If needed
npm run dev
# Should run on http://localhost:5173
```

### Step 3: Access Components

**Time Slots Management:**
```
http://localhost:5173/admin/calendar/timeslots
```

**Schedules Management:**
```
http://localhost:5173/admin/calendar/schedules
```

---

## 📋 Basic Workflow

### 1. Create Time Slots
1. Go to `/admin/calendar/timeslots`
2. Click "➕ Nouveau Planning"
3. Fill form:
   - Day: Select a day (Lundi, Mardi, etc.)
   - Start time: e.g., 08:00
   - End time: e.g., 10:00
   - Description: "Matin 2h"
   - Active: Toggle ON
4. Click "✓ Créer"

**Example slots to create:**
- Monday 08:00-10:00 (Morning 2h)
- Monday 10:15-12:15 (Morning 2h)
- Monday 13:00-15:00 (Afternoon 2h)
- Tuesday 08:00-10:00 (Morning 2h)
- ... repeat for other days

### 2. View Time Slots
- Scroll down to see table
- Slots are grouped by day
- Shows: Start time, End time, Status (Active/Inactive)
- 📊 Statistics at bottom: Total, Active, Inactive counts

### 3. Edit Time Slot
1. Find the time slot in table
2. Click ✏️ button
3. Form auto-fills
4. Modify and click "✓ Mettre à jour"

### 4. Delete Time Slot
1. Find the time slot in table
2. Click 🗑️ button
3. Confirm deletion
4. Removed from list

---

## 📅 Create Schedules

### 1. Go to Schedules
```
http://localhost:5173/admin/calendar/schedules
```

### 2. Create Schedule
1. Click "➕ Nouveau Planning"
2. Fill required fields:
   - **Créneau** (Time Slot)*: Select from dropdown
   - **Classe**: Select a class
   - **Matière**: Select a subject
3. Fill optional fields:
   - Salle: Select room
   - Enseignant ID: Enter teacher ID
   - Date de Début: Set start date
   - Date de Fin: Set end date
   - Type de Cours: Select type
   - Récurrence: Select recurrence
   - Statut: Select status
   - Notes: Add notes

4. Click "✓ Créer le Planning"

### 3. View Schedules
- Table shows all schedules
- Columns: Créneau, Classe, Matière, Salle, Type, Dates, Statut, Actions
- Color-coded status badges:
  - 🟡 Yellow: Planifié (Planned)
  - 🟢 Green: Confirmé (Confirmed)
  - 🔴 Red: Annulé (Cancelled)
  - 🔵 Cyan: Terminé (Completed)

### 4. View Calendar
1. Click "📅 Calendrier" tab
2. See visual schedule
3. Courses shown with:
   - Time range
   - Subject name
   - Room assignment
   - Course type badge

### 5. Drag & Drop
1. In Calendar view, click and hold a course
2. Drag to another day
3. Release to move
4. System updates automatically

### 6. Edit Schedule
1. In List view, click ✏️ on a schedule
2. Form populates with data
3. Modify fields
4. Click "✓ Mettre à jour"

### 7. Delete Schedule
1. In List view, click 🗑️ on a schedule
2. Confirm deletion
3. Schedule removed

---

## 🎯 Common Tasks

### Create Weekly Schedule
**Goal**: Set up Monday-Friday classes

```
1. Create time slots:
   - Mon/Tue/Wed/Thu/Fri: 08:00-10:00 (Slot A)
   - Mon/Tue/Wed/Thu/Fri: 10:15-12:15 (Slot B)
   - Mon/Tue/Wed/Thu/Fri: 13:00-15:00 (Slot C)
   - Mon/Tue/Wed/Thu/Fri: 15:15-17:15 (Slot D)

2. Create schedules:
   - Mathematics in Slot A - Class 1A - Room 101
   - Physics in Slot B - Class 1A - Room 102
   - Chemistry in Slot C - Class 1A - Room 103
   - ... repeat for other classes

3. View in Calendar tab
```

### Reschedule a Class
```
1. Go to Schedules → List View
2. Find the class to reschedule
3. Click ✏️ button
4. Change "Créneau" to new time slot
5. Update any date fields if needed
6. Click "✓ Mettre à jour"
```

### Cancel a Class
```
1. Go to Schedules → List View
2. Find the class to cancel
3. Click ✏️ button
4. Change "Statut" to "Annulé"
5. Add cancellation reason in Notes
6. Click "✓ Mettre à jour"
```

### View Teacher's Schedule
```
API endpoint:
GET http://localhost:3000/api/calendar/schedules/teacher/{enseignant_id}

Use in frontend:
const api = new CalendarAPI();
const schedule = await api.getTeacherSchedule(teacherId);
```

### View Class's Week Schedule
```
API endpoint:
GET http://localhost:3000/api/calendar/schedules/classe/{classe_id}/week

Use in frontend:
const api = new CalendarAPI();
const weekSchedule = await api.getClassWeeklySchedule(classeId);
```

---

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| 404 errors | Restart backend server |
| Classes dropdown empty | Create classes in ReferenceManagement first |
| Can't see schedules | Check time slots are created and active |
| Drag-drop not working | Make sure you're in Calendar tab |
| Form not submitting | Check required fields are filled |
| Data not persisting | Check database connection |
| Slow loading | Check API responses in browser Network tab |

---

## 📊 Statistics

### At the bottom of each page:
- **Time Slots**:
  - Total slots
  - Active count
  - Inactive count

- **Schedules**:
  - Total schedules
  - Planifiés (Planned)
  - Confirmés (Confirmed)
  - Annulés (Cancelled)

---

## 🎨 UI Components Reference

### Buttons
- 🟣 **Nouveau Planning** (Primary): Create new
- ✅ **Créer/Mettre à jour** (Success): Submit form
- ⚪ **Annuler** (Secondary): Cancel action
- ✏️ **Edit Button**: Modify existing
- 🗑️ **Delete Button**: Remove item

### Tabs
- 📋 **Liste**: Table view of all items
- 📅 **Calendrier**: Visual calendar view

### Status Indicators
- 🟢 Active/Confirmé (Green)
- 🟡 Planifié (Yellow)
- 🔴 Annulé (Red)
- 🔵 Terminé (Cyan)

---

## 📞 Support

### Check These Files for Details
- `CALENDAR_CRUD_COMPLETE.md` - Full documentation
- `backend/Reference_documents/routes/Calendar.js` - API endpoints
- `frontend/learnflow/src/services/CalendarAPI.js` - Frontend methods
- Browser Console (F12) - Error messages

### Error Messages Format
```
❌ Error message here

Example:
❌ Le créneau, la classe et la matière sont requis
❌ Erreur: Failed to create schedule
❌ Erreur lors de la suppression: Network error
```

---

## ✅ You're All Set!

Your calendar CRUD system is ready to use. 

**Access Points:**
- TimeSlots: `/admin/calendar/timeslots`
- Schedules: `/admin/calendar/schedules`

**Happy scheduling! 📅✨**
