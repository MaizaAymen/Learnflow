# 📚 Emploi du Temps - Timetable Management System

## ✨ Complete System Overview

This is a comprehensive university timetable management system with full conflict detection, data validation, and relationship management.

---

## 🏗️ Data Model Architecture

### Core Hierarchy Chain
```
Département → Spécialité → Niveau → Classe (Groupe)
```

### Complete Relations

#### 1️⃣ **Département (Department)**
- **Has Many:** Spécialités, Salles
- **Constraints:** RESTRICT on delete (prevents deletion if child records exist)
- **Fields:** `name`, `code`, `chef_departement_id`, `budget`, `statut`, `localisation`

#### 2️⃣ **Spécialité (Specialization)**
- **Belongs To:** Département (required)
- **Has Many:** Niveaux
- **Constraints:** RESTRICT on delete, CASCADE on update
- **Fields:** `name`, `departementId`, `code`, `duree_annees`

#### 3️⃣ **Niveau (Academic Level)**
- **Belongs To:** Spécialité (required)
- **Has Many:** Classes, Matières
- **Constraints:** RESTRICT on delete, CASCADE on update
- **Fields:** `name`, `specialiteId`, `ordre`

#### 4️⃣ **Classe (Class/Group)**
- **Belongs To:** Niveau (required)
- **Has Many:** Students (Users), Schedules
- **Many-to-Many:** Matières (through MatiereClasse)
- **Constraints:** CASCADE on delete (deletes schedules)
- **Fields:** `nom`, `effectif`, `niveau_id`, `annee_scolaire`

#### 5️⃣ **Matière (Subject)**
- **Belongs To:** Niveau (required)
- **Many-to-Many:** Classes (through MatiereClasse), Enseignants (through MatiereEnseignant)
- **Has Many:** Schedules, Courses
- **Fields:** `name`, `code`, `credits`, `niveauId`

#### 6️⃣ **Salle (Room)**
- **Belongs To:** Département (required)
- **Has Many:** Schedules
- **Constraints:** SET NULL on schedule if deleted
- **Fields:** `nom`, `type`, `capacite`, `departement_id`, `statut`, `equipements`
- **Types:** `Amphi`, `TP`, `TD`, `Cours`, `Laboratoire`, `Salle_Informatique`

#### 7️⃣ **Enseignant (Teacher)**
- **Model:** User with `role='enseignant'`
- **Many-to-Many:** Matières (through MatiereEnseignant)
- **Has Many:** Schedules, Courses
- **Constraints:** RESTRICT on delete (prevents deletion if has schedules)

#### 8️⃣ **TimeSlot (Créneau Horaire)**
- **Fields:** `day_of_week`, `start_time`, `end_time`, `is_active`
- **Has Many:** Schedules
- **Unique Constraint:** (day_of_week, start_time, end_time)

#### 9️⃣ **Schedule (Emploi du Temps)**
- **Belongs To:** TimeSlot, Classe, Matière, Salle (optional), Enseignant (optional)
- **Has Many:** Bookings
- **Fields:** `time_slot_id`, `classe_id`, `matiere_id`, `salle_id`, `enseignant_id`, `date_debut`, `date_fin`, `type_cours`, `recurrence`, `statut`
- **Types:** `Cours`, `TD`, `TP`, `Examen`, `Soutien`
- **Statuts:** `planifie`, `confirme`, `annule`, `termine`, `reporte`

---

## 🛡️ Comprehensive Conflict Detection

### Conflict Types Detected

#### 1. **Salle (Room) Conflict**
✅ **Check:** Room already occupied at the same time
```json
{
  "success": false,
  "type": "conflict",
  "target": "salle",
  "message": "La salle est déjà occupée à cette heure par la classe L3-INFO-A."
}
```

#### 2. **Enseignant (Teacher) Conflict**
✅ **Check:** Teacher already has another class at the same time
```json
{
  "success": false,
  "type": "conflict",
  "target": "enseignant",
  "message": "L'enseignant est déjà occupé à cette heure (cours de Mathématiques avec L2-INFO-B)."
}
```

#### 3. **Groupe/Classe (Class) Conflict**
✅ **Check:** Class already has another course scheduled
```json
{
  "success": false,
  "type": "conflict",
  "target": "groupe",
  "message": "Le groupe/classe a déjà un cours à cette heure (Physique)."
}
```

#### 4. **Matière-Niveau (Subject-Level) Compatibility**
✅ **Check:** Subject matches the academic level of the class
```json
{
  "success": false,
  "type": "conflict",
  "target": "matiere",
  "message": "La matière 'Algorithmique Avancée' (niveau: L3) ne correspond pas au niveau de la classe 'L1-INFO-A' (niveau: L1)."
}
```

#### 5. **Matière-Classe Association**
✅ **Check:** Subject is assigned to the class (via MatiereClasse)
```json
{
  "success": false,
  "type": "conflict",
  "target": "matiere",
  "message": "La matière 'Bases de Données' n'est pas assignée à la classe 'L2-MECA-A'."
}
```

#### 6. **Enseignant-Matière Authorization**
✅ **Check:** Teacher is authorized to teach the subject
```json
{
  "success": false,
  "type": "conflict",
  "target": "enseignant",
  "message": "L'enseignant Jean Dupont n'est pas autorisé à enseigner la matière 'Chimie Organique'."
}
```

#### 7. **Salle Capacity vs Class Size**
✅ **Check:** Room capacity is sufficient for the number of students
```json
{
  "success": false,
  "type": "conflict",
  "target": "salle",
  "message": "La capacité de la salle 'TD-102' (30 places) est insuffisante pour la classe 'L1-INFO-A' (45 étudiants)."
}
```

#### 8. **Salle Type vs Course Type Compatibility**
⚠️ **Check:** Room type is suitable for course type (warning only)
```json
{
  "success": false,
  "type": "warning",
  "target": "salle",
  "message": "Le type de salle 'TD' pourrait ne pas être adapté pour un cours de type 'TP'. Types recommandés: TP, Laboratoire, Salle_Informatique."
}
```

#### 9. **Salle Status**
✅ **Check:** Room is available (not in maintenance)
```json
{
  "success": false,
  "type": "conflict",
  "target": "salle",
  "message": "La salle 'Amphi-A' n'est pas disponible (statut: maintenance)."
}
```

---

## 📡 API Endpoints

### Time Slots Management

#### Create Time Slot
```http
POST /api/calendar/timeslots
Content-Type: application/json

{
  "day_of_week": "Lundi",
  "start_time": "08:00:00",
  "end_time": "09:30:00",
  "description": "Créneau 1",
  "is_active": true
}
```

#### Get All Time Slots
```http
GET /api/calendar/timeslots
GET /api/calendar/timeslots?day_of_week=Lundi
GET /api/calendar/timeslots?is_active=true
```

#### Bulk Create Time Slots
```http
POST /api/calendar/timeslots/bulk
Content-Type: application/json

{
  "timeSlots": [
    {
      "day_of_week": "Lundi",
      "start_time": "08:00:00",
      "end_time": "09:30:00",
      "is_active": true
    },
    {
      "day_of_week": "Lundi",
      "start_time": "09:45:00",
      "end_time": "11:15:00",
      "is_active": true
    }
  ]
}
```

---

### Schedule Management

#### Create Schedule (with Full Conflict Detection)
```http
POST /api/calendar/schedules
Content-Type: application/json

{
  "time_slot_id": 1,
  "classe_id": 5,
  "matiere_id": 3,
  "salle_id": 2,
  "enseignant_id": 10,
  "date_debut": "2025-01-15",
  "date_fin": "2025-06-30",
  "type_cours": "Cours",
  "recurrence": "hebdomadaire",
  "notes": "Cours magistral"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Planning créé avec succès",
  "data": {
    "id": 42,
    "time_slot_id": 1,
    "classe_id": 5,
    "matiere_id": 3,
    "timeSlot": { "day_of_week": "Lundi", "start_time": "08:00:00" },
    "classe": { "nom": "L3-INFO-A" },
    "matiere": { "name": "Bases de Données" }
  }
}
```

**Conflict Response (409):**
```json
{
  "success": false,
  "type": "conflict",
  "target": "enseignant",
  "message": "L'enseignant est déjà occupé à cette heure.",
  "allConflicts": [...],
  "conflictCount": 2
}
```

#### Check Conflicts Before Creating
```http
POST /api/calendar/schedules/check-conflicts
Content-Type: application/json

{
  "time_slot_id": 1,
  "classe_id": 5,
  "matiere_id": 3,
  "salle_id": 2,
  "enseignant_id": 10,
  "date_debut": "2025-01-15",
  "date_fin": "2025-06-30",
  "type_cours": "TP"
}
```

**Response:**
```json
{
  "success": true,
  "hasConflicts": false,
  "message": "Aucun conflit détecté"
}
```

#### Update Schedule
```http
PUT /api/calendar/schedules/:id
Content-Type: application/json

{
  "salle_id": 3,
  "statut": "confirme"
}
```

#### Drag & Drop Update (Optimized)
```http
PATCH /api/calendar/schedules/:id/drag-drop
Content-Type: application/json

{
  "time_slot_id": 5,
  "salle_id": 8
}
```

#### Get All Schedules (with Filters)
```http
GET /api/calendar/schedules
GET /api/calendar/schedules?classe_id=5
GET /api/calendar/schedules?enseignant_id=10
GET /api/calendar/schedules?salle_id=2
GET /api/calendar/schedules?date=2025-01-15
GET /api/calendar/schedules?statut=confirme
```

#### Get Complete Timetable for a Class
```http
GET /api/calendar/timetable/classe/5
GET /api/calendar/timetable/classe/5?date_debut=2025-01-15
```

**Response:**
```json
{
  "success": true,
  "classe_id": 5,
  "totalSchedules": 24,
  "schedules": [...],
  "timetableByDay": {
    "Lundi": [...],
    "Mardi": [...],
    "Mercredi": [...]
  }
}
```

#### Get Complete Timetable for a Teacher
```http
GET /api/calendar/timetable/enseignant/10
GET /api/calendar/timetable/enseignant/10?date_debut=2025-01-15
```

#### Bulk Create Schedules
```http
POST /api/calendar/schedules/bulk
Content-Type: application/json

{
  "schedules": [
    {
      "time_slot_id": 1,
      "classe_id": 5,
      "matiere_id": 3,
      "salle_id": 2,
      "enseignant_id": 10,
      "date_debut": "2025-01-15",
      "type_cours": "Cours"
    },
    {
      "time_slot_id": 2,
      "classe_id": 5,
      "matiere_id": 4,
      "salle_id": 3,
      "enseignant_id": 11,
      "date_debut": "2025-01-15",
      "type_cours": "TD"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "summary": {
    "total": 2,
    "created": 1,
    "conflicts": 1,
    "errors": 0
  },
  "details": {
    "created": [...],
    "conflicts": [...],
    "errors": []
  }
}
```

#### Cancel Schedule
```http
PATCH /api/calendar/schedules/:id/cancel
```

#### Delete Schedule
```http
DELETE /api/calendar/schedules/:id
```

---

### Availability Check

#### Get Availability for Time Slot
```http
GET /api/calendar/availability/:time_slot_id?date=2025-01-15
GET /api/calendar/availability/:time_slot_id?date=2025-01-15&departementId=1
GET /api/calendar/availability/:time_slot_id?date=2025-01-15&niveauId=3
```

**Response:**
```json
{
  "success": true,
  "timeSlotId": 1,
  "date": "2025-01-15",
  "availability": {
    "salles": [
      { "id": 1, "nom": "TD-101", "type": "TD", "capacite": 30 },
      { "id": 3, "nom": "Amphi-A", "type": "Amphi", "capacite": 200 }
    ],
    "classes": [
      { "id": 2, "nom": "L2-INFO-A", "effectif": 35 }
    ],
    "enseignants": [
      { "id": 5, "nom": "Dupont", "prenom": "Jean" }
    ]
  },
  "busy": {
    "salleIds": [2, 4],
    "classeIds": [1, 5],
    "enseignantIds": [10, 12]
  }
}
```

---

## 🔧 Setup Instructions

### 1. Install Dependencies
```bash
cd backend/Reference_documents
npm install
```

### 2. Database Setup
The models will automatically create tables with proper relations when the server starts.

### 3. Start the Server
```bash
node server.js
```

### 4. Initialize Time Slots (Optional)
Use the bulk create endpoint to set up standard time slots:

```bash
curl -X POST http://localhost:5000/api/calendar/timeslots/bulk \
  -H "Content-Type: application/json" \
  -d '{
    "timeSlots": [
      {"day_of_week": "Lundi", "start_time": "08:00:00", "end_time": "09:30:00", "is_active": true},
      {"day_of_week": "Lundi", "start_time": "09:45:00", "end_time": "11:15:00", "is_active": true},
      {"day_of_week": "Lundi", "start_time": "11:30:00", "end_time": "13:00:00", "is_active": true},
      {"day_of_week": "Lundi", "start_time": "14:00:00", "end_time": "15:30:00", "is_active": true},
      {"day_of_week": "Lundi", "start_time": "15:45:00", "end_time": "17:15:00", "is_active": true}
    ]
  }'
```

---

## 📊 Database Schema Summary

### Key Tables
- `referentiels.departement`
- `referentiels.specialite`
- `referentiels.niveau`
- `referentiels.classe`
- `referentiels.matiere`
- `referentiels.salle`
- `referentiels.time_slot`
- `referentiels.schedule`
- `referentiels.matiere_classe` (junction table)
- `referentiels.matiere_enseignant` (junction table)
- `referentiels.booking`
- `auth.utilisateur` (users including students and teachers)

### Foreign Key Constraints
All foreign keys are properly defined with appropriate cascade rules:
- **CASCADE:** Deletes child records when parent is deleted
- **RESTRICT:** Prevents deletion if child records exist
- **SET NULL:** Sets FK to null when parent is deleted

---

## ✅ Testing Checklist

### Basic Operations
- [ ] Create time slots
- [ ] Create schedules without conflicts
- [ ] View class timetable
- [ ] View teacher timetable
- [ ] Filter schedules by various criteria

### Conflict Detection
- [ ] Test room conflict (same room, same time)
- [ ] Test teacher conflict (same teacher, same time)
- [ ] Test class conflict (same class, same time)
- [ ] Test matière-niveau mismatch
- [ ] Test matière-classe unassigned
- [ ] Test teacher not authorized for subject
- [ ] Test room capacity insufficient
- [ ] Test room type incompatibility
- [ ] Test room unavailable status

### Update Operations
- [ ] Update schedule details
- [ ] Drag & drop schedule to new time slot
- [ ] Cancel schedule
- [ ] Delete schedule

### Bulk Operations
- [ ] Bulk create time slots
- [ ] Bulk create schedules with conflict handling

---

## 🚀 Advanced Features

### Recurrence Support
Schedules can be set to recur:
- `unique`: One-time event
- `hebdomadaire`: Weekly
- `bihebdomadaire`: Bi-weekly
- `mensuelle`: Monthly

### Course Types
- `Cours`: Lecture
- `TD`: Tutorial
- `TP`: Practical lab
- `Examen`: Exam
- `Soutien`: Support session

### Status Tracking
- `planifie`: Planned
- `confirme`: Confirmed
- `annule`: Cancelled
- `termine`: Completed
- `reporte`: Postponed

---

## 📝 Notes

- All conflict checks are performed automatically before creating or updating schedules
- The system supports cross-schema relationships between `auth` and `referentiels` schemas
- Students are users with `role='etudiant'` in the `auth.utilisateur` table
- Teachers are users with `role='enseignant'`
- All responses follow a consistent format with `success`, `type`, `target`, and `message` fields for conflicts

---

## 🔗 Related Files

- **Models:** `backend/Reference_documents/models/`
- **Routes:** `backend/Reference_documents/routes/Calendar.js`
- **Conflict Service:** `backend/Reference_documents/services/conflictDetection.js`
- **Main Server:** `backend/Reference_documents/server.js`

---

## 📞 Support

For issues or questions, refer to:
- Main README: `README.md`
- Architecture docs: `arch/`
- Database migration: `database_migration_fix_relations.sql`

---

**Last Updated:** November 13, 2025
**Version:** 2.0 - Complete Conflict Detection System
