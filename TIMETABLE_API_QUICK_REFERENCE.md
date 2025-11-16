# 🚀 TIMETABLE API - QUICK REFERENCE

## Base URL
```
http://localhost:5000/api/calendar
```

---

## 🔥 Most Used Endpoints

### ✅ Create Schedule (with Auto Conflict Detection)
```bash
POST /schedules
Content-Type: application/json

{
  "time_slot_id": 1,
  "classe_id": 1,
  "matiere_id": 1,
  "salle_id": 1,
  "enseignant_id": 1,
  "date_debut": "2025-01-15",
  "date_fin": "2025-06-30",
  "type_cours": "Cours",
  "recurrence": "hebdomadaire"
}

# Success: 201
# Conflict: 409 with conflict details
```

### 🔍 Check Conflicts Before Creating
```bash
POST /schedules/check-conflicts
Content-Type: application/json

{
  "time_slot_id": 1,
  "classe_id": 1,
  "matiere_id": 1,
  "salle_id": 1,
  "enseignant_id": 1,
  "date_debut": "2025-01-15",
  "type_cours": "Cours"
}

# Returns: { hasConflicts: true/false, conflicts: [...] }
```

### 📋 Get Class Timetable
```bash
GET /timetable/classe/{classe_id}
GET /timetable/classe/{classe_id}?date_debut=2025-01-15

# Returns complete timetable grouped by day
```

### 👨‍🏫 Get Teacher Timetable
```bash
GET /timetable/enseignant/{enseignant_id}
GET /timetable/enseignant/{enseignant_id}?date_debut=2025-01-15

# Returns teacher's complete schedule
```

### 🔓 Check Availability
```bash
GET /availability/{time_slot_id}?date=2025-01-15
GET /availability/{time_slot_id}?date=2025-01-15&departementId=1

# Returns available rooms, classes, and teachers
```

### 📦 Bulk Create Schedules
```bash
POST /schedules/bulk
Content-Type: application/json

{
  "schedules": [
    { /* schedule 1 */ },
    { /* schedule 2 */ },
    { /* schedule 3 */ }
  ]
}

# Returns summary: created, conflicts, errors
```

### ✏️ Update Schedule
```bash
PUT /schedules/{id}
Content-Type: application/json

{
  "salle_id": 3,
  "statut": "confirme"
}

# Auto-checks conflicts for updated fields
```

### 🖱️ Drag & Drop Update
```bash
PATCH /schedules/{id}/drag-drop
Content-Type: application/json

{
  "time_slot_id": 5,
  "salle_id": 3
}

# Optimized for UI drag-drop operations
```

### 📅 Get All Schedules (with Filters)
```bash
GET /schedules
GET /schedules?classe_id=1
GET /schedules?enseignant_id=10
GET /schedules?salle_id=2
GET /schedules?date=2025-01-15
GET /schedules?statut=confirme

# Multiple filters can be combined
```

### ❌ Cancel Schedule
```bash
PATCH /schedules/{id}/cancel

# Sets status to 'annule'
```

### 🗑️ Delete Schedule
```bash
DELETE /schedules/{id}

# Permanently removes schedule
```

---

## ⏰ Time Slots

### Create Time Slot
```bash
POST /timeslots
Content-Type: application/json

{
  "day_of_week": "Lundi",
  "start_time": "08:00:00",
  "end_time": "09:30:00",
  "is_active": true
}
```

### Get All Time Slots
```bash
GET /timeslots
GET /timeslots?day_of_week=Lundi
GET /timeslots?is_active=true
```

### Bulk Create Time Slots
```bash
POST /timeslots/bulk
Content-Type: application/json

{
  "timeSlots": [
    { "day_of_week": "Lundi", "start_time": "08:00:00", "end_time": "09:30:00" },
    { "day_of_week": "Lundi", "start_time": "09:45:00", "end_time": "11:15:00" }
  ]
}
```

---

## 🎯 Conflict Response Format

When a conflict is detected (HTTP 409):

```json
{
  "success": false,
  "type": "conflict",
  "target": "enseignant | salle | groupe | matiere",
  "message": "L'enseignant est déjà occupé à cette heure.",
  "allConflicts": [
    {
      "success": false,
      "type": "conflict",
      "target": "enseignant",
      "message": "L'enseignant est déjà occupé...",
      "details": { ... }
    }
  ],
  "conflictCount": 2
}
```

**Conflict Targets:**
- `salle` - Room conflict
- `enseignant` - Teacher conflict  
- `groupe` - Class conflict
- `matiere` - Subject incompatibility

---

## 📊 Common Query Patterns

### Get Weekly Schedule for a Class
```bash
GET /schedules/classe/{classe_id}/week?date=2025-01-15
```

### Get Teacher's Schedule
```bash
GET /schedules/teacher/{enseignant_id}
GET /schedules/teacher/{enseignant_id}?date_debut=2025-01-15
```

### Check Room Availability for Specific Time
```bash
GET /schedules/availability/timeslots?date=2025-01-15&classe_id=1
```

---

## 🛠️ Setup Commands

### 1. Setup Sample Data
```bash
cd backend/Reference_documents
node scripts/setupSampleData.js
```

### 2. Run Tests
```bash
node scripts/testTimetableSystem.js
```

### 3. Run Database Migration
```bash
psql -U user -d database -f database_timetable_constraints.sql
```

---

## 📝 Field Reference

### Schedule Fields
```javascript
{
  time_slot_id: number,      // Required
  classe_id: number,         // Required
  matiere_id: number,        // Required
  salle_id: number,          // Optional
  enseignant_id: number,     // Optional
  date_debut: "YYYY-MM-DD",  // Required
  date_fin: "YYYY-MM-DD",    // Optional
  type_cours: string,        // "Cours" | "TD" | "TP" | "Examen" | "Soutien"
  recurrence: string,        // "unique" | "hebdomadaire" | "bihebdomadaire" | "mensuelle"
  statut: string,            // "planifie" | "confirme" | "annule" | "termine" | "reporte"
  notes: string,             // Optional
  couleur: "#RRGGBB"         // Optional hex color
}
```

### Room Types
- `Amphi` - Amphitheater
- `TD` - Tutorial room
- `TP` - Practical lab
- `Cours` - Standard classroom
- `Laboratoire` - Laboratory
- `Salle_Informatique` - Computer lab

### Days of Week
- `Lundi`, `Mardi`, `Mercredi`, `Jeudi`, `Vendredi`, `Samedi`, `Dimanche`

---

## 🔍 Debugging Tips

### Check if room exists and is available
```bash
GET /salles/{salle_id}
# Check: statut should be "disponible"
```

### Check if teacher is authorized for subject
```bash
# Query matiere_enseignant table to verify association
```

### Check if subject is assigned to class
```bash
# Query matiere_classe table to verify association
```

### View all conflicts for a potential schedule
```bash
POST /schedules/check-conflicts
# Returns ALL conflicts before creating
```

---

## 💡 Pro Tips

1. **Always use check-conflicts endpoint** before showing schedule form to user
2. **Use availability endpoint** to populate dropdowns with available options
3. **Bulk create** for semester planning - creates all possible, reports conflicts
4. **Drag-drop endpoint** is optimized - use it for UI interactions
5. **Filter by date** to get only active schedules
6. **Use timetable endpoints** for calendar views - data is pre-formatted by day

---

## 📞 Quick Support

- **Full Documentation**: `TIMETABLE_SYSTEM_COMPLETE.md`
- **Implementation Summary**: `TIMETABLE_IMPLEMENTATION_SUMMARY.md`
- **Test Suite**: `scripts/testTimetableSystem.js`
- **Sample Data Setup**: `scripts/setupSampleData.js`

---

**Last Updated**: November 13, 2025  
**API Version**: 2.0
