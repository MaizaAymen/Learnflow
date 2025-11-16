# 🏗️ TIMETABLE SYSTEM ARCHITECTURE

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         TIMETABLE MANAGEMENT SYSTEM                          │
│                     University Management Platform                           │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND LAYER                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Calendar   │  │   Schedule   │  │   Conflict   │  │   Reports    │  │
│  │     View     │  │    Forms     │  │   Resolver   │  │  Dashboard   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                                              │
│  React Components with Drag & Drop, Validation, Real-time Updates          │
│                                                                              │
└──────────────────────────────────┬──────────────────────────────────────────┘
                                   │
                                   │ HTTP/REST API
                                   │
┌──────────────────────────────────▼──────────────────────────────────────────┐
│                              BACKEND LAYER                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │                        API ROUTES (Calendar.js)                    │    │
│  ├────────────────────────────────────────────────────────────────────┤    │
│  │  POST   /schedules              - Create schedule                  │    │
│  │  PUT    /schedules/:id          - Update schedule                  │    │
│  │  PATCH  /schedules/:id/drag-drop - Drag & drop update             │    │
│  │  DELETE /schedules/:id          - Delete schedule                  │    │
│  │  GET    /schedules              - Get schedules (with filters)     │    │
│  │  GET    /timetable/classe/:id   - Get class timetable             │    │
│  │  GET    /timetable/enseignant/:id - Get teacher timetable         │    │
│  │  POST   /schedules/check-conflicts - Check conflicts               │    │
│  │  GET    /availability/:id       - Check availability               │    │
│  │  POST   /schedules/bulk         - Bulk create schedules            │    │
│  │  POST   /timeslots              - Create time slot                 │    │
│  │  GET    /timeslots              - Get time slots                   │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                   │                                          │
│                                   │                                          │
│  ┌────────────────────────────────▼────────────────────────────────┐       │
│  │          CONFLICT DETECTION SERVICE (conflictDetection.js)       │       │
│  ├──────────────────────────────────────────────────────────────────┤       │
│  │  ✓ Salle Conflict            - Room already occupied             │       │
│  │  ✓ Enseignant Conflict       - Teacher already busy              │       │
│  │  ✓ Groupe/Classe Conflict    - Class already scheduled           │       │
│  │  ✓ Matière-Niveau Match      - Subject-Level compatibility       │       │
│  │  ✓ Matière-Classe Association - Subject assigned to class        │       │
│  │  ✓ Enseignant Authorization  - Teacher qualified for subject     │       │
│  │  ✓ Room Capacity Check       - Capacity vs class size            │       │
│  │  ✓ Room Type Compatibility   - Room type vs course type          │       │
│  │  ✓ Room Status Check         - Room available (not maintenance)  │       │
│  └──────────────────────────────────────────────────────────────────┘       │
│                                   │                                          │
│                                   │                                          │
│  ┌────────────────────────────────▼────────────────────────────────┐       │
│  │                    SEQUELIZE ORM MODELS                          │       │
│  ├──────────────────────────────────────────────────────────────────┤       │
│  │  • Département      • Spécialité      • Niveau      • Classe     │       │
│  │  • Matière          • Salle           • TimeSlot    • Schedule   │       │
│  │  • User (Enseignant/Étudiant)        • Booking                   │       │
│  │  • MatiereClasse    • MatiereEnseignant                          │       │
│  └──────────────────────────────────────────────────────────────────┘       │
│                                                                              │
└──────────────────────────────────┬──────────────────────────────────────────┘
                                   │
                                   │ SQL Queries
                                   │
┌──────────────────────────────────▼──────────────────────────────────────────┐
│                            DATABASE LAYER                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────┐       │
│  │                      PostgreSQL Database                         │       │
│  ├─────────────────────────────────────────────────────────────────┤       │
│  │                                                                  │       │
│  │  Schema: auth                Schema: referentiels                │       │
│  │  ┌────────────────┐         ┌────────────────┐                 │       │
│  │  │  utilisateur   │         │  departement   │                 │       │
│  │  │  (Users/       │         │  specialite    │                 │       │
│  │  │   Teachers/    │         │  niveau        │                 │       │
│  │  │   Students)    │         │  classe        │                 │       │
│  │  └────────────────┘         │  matiere       │                 │       │
│  │                             │  salle         │                 │       │
│  │                             │  time_slot     │                 │       │
│  │                             │  schedule      │                 │       │
│  │                             │  booking       │                 │       │
│  │                             │  matiere_classe│                 │       │
│  │                             │  matiere_enseignant│             │       │
│  │                             └────────────────┘                 │       │
│  │                                                                  │       │
│  │  Views:                                                          │       │
│  │  • v_timetable_complete      - Complete timetable with details  │       │
│  │  • v_current_week_schedules  - Active schedules for current week│       │
│  │  • v_class_room_occupancy    - Room utilization rates           │       │
│  │  • v_teacher_workload        - Teacher hours and courses        │       │
│  │                                                                  │       │
│  │  Functions:                                                      │       │
│  │  • get_available_rooms()     - Find available rooms              │       │
│  │  • is_teacher_available()    - Check teacher availability        │       │
│  │                                                                  │       │
│  └─────────────────────────────────────────────────────────────────┘       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Data Model Hierarchy

```
┌───────────────────────────────────────────────────────────────┐
│                     ORGANIZATIONAL HIERARCHY                   │
└───────────────────────────────────────────────────────────────┘

                    ┌─────────────────┐
                    │   Département   │
                    │   (INFO, MATH)  │
                    └────────┬────────┘
                             │ 1:N (RESTRICT)
                             │
                    ┌────────▼────────┐
                    │   Spécialité    │
                    │  (Info Générale)│
                    └────────┬────────┘
                             │ 1:N (RESTRICT)
                             │
                    ┌────────▼────────┐
                    │     Niveau      │
                    │   (L1, L2, L3)  │
                    └────────┬────────┘
                             │ 1:N (RESTRICT)
                             │
                    ┌────────▼────────┐
                    │     Classe      │
                    │  (L1-INFO-A)    │
                    └─────────────────┘


┌───────────────────────────────────────────────────────────────┐
│                     INFRASTRUCTURE                             │
└───────────────────────────────────────────────────────────────┘

    ┌─────────────────┐                  ┌─────────────────┐
    │   Département   │──────────────────│      Salle      │
    │                 │  1:N (RESTRICT)  │  (TD-101, ...)  │
    └─────────────────┘                  └─────────────────┘


┌───────────────────────────────────────────────────────────────┐
│                     ACADEMIC RELATIONSHIPS                     │
└───────────────────────────────────────────────────────────────┘

    ┌─────────────────┐                  ┌─────────────────┐
    │     Niveau      │──────────────────│     Matière     │
    │                 │  1:N (RESTRICT)  │ (Algorithmique) │
    └─────────────────┘                  └─────────────────┘


    ┌─────────────────┐     N:M via      ┌─────────────────┐
    │     Matière     │────MatiereClasse──│     Classe      │
    │                 │                   │                 │
    └─────────────────┘                   └─────────────────┘


    ┌─────────────────┐     N:M via      ┌─────────────────┐
    │     Matière     │─MatiereEnseignant─│   Enseignant    │
    │                 │                   │   (User table)  │
    └─────────────────┘                   └─────────────────┘


┌───────────────────────────────────────────────────────────────┐
│                     SCHEDULING                                 │
└───────────────────────────────────────────────────────────────┘

    ┌─────────────┐
    │  TimeSlot   │───┐
    │ (Lundi 8h)  │   │
    └─────────────┘   │
                      │
    ┌─────────────┐   │   ┌──────────────────────────────┐
    │   Classe    │───┼───│         Schedule             │
    │ (L1-INFO-A) │   │   │   (Emploi du Temps Entry)    │
    └─────────────┘   │   └──────────────────────────────┘
                      │              │
    ┌─────────────┐   │              │
    │   Matière   │───┤              │
    │ (BD)        │   │              │
    └─────────────┘   │              │
                      │              │
    ┌─────────────┐   │              │
    │   Salle     │───┤              │
    │ (TD-101)    │   │              │
    └─────────────┘   │              │
                      │              │
    ┌─────────────┐   │              │
    │ Enseignant  │───┘              │
    │ (Dupont)    │                  │
    └─────────────┘                  │
                                     │
                            ┌────────▼────────┐
                            │     Booking     │
                            │  (Attendance)   │
                            └─────────────────┘
```

---

## Conflict Detection Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    SCHEDULE CREATION FLOW                                │
└─────────────────────────────────────────────────────────────────────────┘

  Frontend                  Backend API              Conflict Service
     │                          │                           │
     │  POST /schedules         │                           │
     ├─────────────────────────►│                           │
     │                          │                           │
     │                          │  detectScheduleConflicts()│
     │                          ├──────────────────────────►│
     │                          │                           │
     │                          │                    ┌──────▼──────┐
     │                          │                    │ Check 1:    │
     │                          │                    │ Room        │
     │                          │                    │ Conflict    │
     │                          │                    └──────┬──────┘
     │                          │                           │
     │                          │                    ┌──────▼──────┐
     │                          │                    │ Check 2:    │
     │                          │                    │ Teacher     │
     │                          │                    │ Conflict    │
     │                          │                    └──────┬──────┘
     │                          │                           │
     │                          │                    ┌──────▼──────┐
     │                          │                    │ Check 3:    │
     │                          │                    │ Class       │
     │                          │                    │ Conflict    │
     │                          │                    └──────┬──────┘
     │                          │                           │
     │                          │                    ┌──────▼──────┐
     │                          │                    │ Check 4:    │
     │                          │                    │ Subject     │
     │                          │                    │ Level Match │
     │                          │                    └──────┬──────┘
     │                          │                           │
     │                          │                    ┌──────▼──────┐
     │                          │                    │ Check 5:    │
     │                          │                    │ Subject     │
     │                          │                    │ Assignment  │
     │                          │                    └──────┬──────┘
     │                          │                           │
     │                          │                    ┌──────▼──────┐
     │                          │                    │ Check 6:    │
     │                          │                    │ Teacher     │
     │                          │                    │ Authorization│
     │                          │                    └──────┬──────┘
     │                          │                           │
     │                          │                    ┌──────▼──────┐
     │                          │                    │ Check 7:    │
     │                          │                    │ Room        │
     │                          │                    │ Capacity    │
     │                          │                    └──────┬──────┘
     │                          │                           │
     │                          │                    ┌──────▼──────┐
     │                          │                    │ Check 8:    │
     │                          │                    │ Room Type   │
     │                          │                    │ Compatibility│
     │                          │                    └──────┬──────┘
     │                          │                           │
     │                          │                    ┌──────▼──────┐
     │                          │                    │ Check 9:    │
     │                          │                    │ Room Status │
     │                          │                    └──────┬──────┘
     │                          │                           │
     │                          │   { hasConflicts, ... }   │
     │                          │◄──────────────────────────┤
     │                          │                           │
     │    ┌──────────┐          │                           │
     │    │ Conflicts│          │                           │
     │    │ Found?   │          │                           │
     │    └────┬─────┘          │                           │
     │         │                │                           │
     │    YES  │  NO            │                           │
     │    ┌────▼────┐    ┌──────▼──────┐                   │
     │    │ Return  │    │   Create    │                   │
     │    │  409    │    │  Schedule   │                   │
     │    │Conflict │    │   in DB     │                   │
     │    └─────────┘    └──────┬──────┘                   │
     │         │                │                           │
     │◄────────┴────────────────┤                           │
     │                          │                           │
```

---

## Database Schema Diagram

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         SCHEMA: auth                                      │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ utilisateur                                                      │    │
│  ├─────────────────────────────────────────────────────────────────┤    │
│  │ • id (PK)                  • role (etudiant/enseignant/...)     │    │
│  │ • nom, prenom, email       • niveau_id (FK → referentiels)      │    │
│  │ • login, mdp_hash          • classe_id (FK → referentiels)      │    │
│  │ • phone, bio, image        • statut                              │    │
│  │ • date_naissance           • ...                                 │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘


┌──────────────────────────────────────────────────────────────────────────┐
│                      SCHEMA: referentiels                                 │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌──────────────────┐       ┌──────────────────┐                        │
│  │  departement     │       │   specialite     │                        │
│  ├──────────────────┤       ├──────────────────┤                        │
│  │ • id (PK)        │───┐   │ • id (PK)        │                        │
│  │ • name, code     │   └──►│ • departementId  │                        │
│  │ • description    │       │ • name, code     │                        │
│  │ • statut         │       │ • duree_annees   │                        │
│  └──────────────────┘       └────────┬─────────┘                        │
│                                      │                                   │
│                             ┌────────▼─────────┐                         │
│                             │     niveau       │                         │
│                             ├──────────────────┤                         │
│                             │ • id (PK)        │                         │
│                             │ • specialiteId   │                         │
│                             │ • name, ordre    │                         │
│                             └────────┬─────────┘                         │
│                                      │                                   │
│                    ┌─────────────────┴──────────────────┐               │
│                    │                                     │               │
│           ┌────────▼─────────┐              ┌───────────▼───────┐      │
│           │     classe       │              │     matiere       │      │
│           ├──────────────────┤              ├───────────────────┤      │
│           │ • id (PK)        │              │ • id (PK)         │      │
│           │ • niveau_id (FK) │              │ • niveauId (FK)   │      │
│           │ • nom, effectif  │              │ • name, code      │      │
│           └──────────────────┘              │ • credits         │      │
│                    │                        └───────────────────┘      │
│                    │                                   │                │
│                    │                                   │                │
│                    └────────────┬──────────────────────┘                │
│                                 │                                       │
│                        ┌────────▼─────────┐                            │
│                        │ matiere_classe   │ (Junction)                 │
│                        ├──────────────────┤                            │
│                        │ • id (PK)        │                            │
│                        │ • matiereId (FK) │                            │
│                        │ • classeId (FK)  │                            │
│                        │ • heures_semaine │                            │
│                        │ • coefficient    │                            │
│                        └──────────────────┘                            │
│                                                                         │
│                                                                         │
│  ┌──────────────────┐       ┌──────────────────────┐                  │
│  │ matiere_enseignant│      │    salle             │                  │
│  ├──────────────────┤       ├──────────────────────┤                  │
│  │ • id (PK)        │       │ • id (PK)            │                  │
│  │ • matiere_id (FK)│       │ • departement_id(FK) │                  │
│  │ • enseignant_id  │       │ • nom, type          │                  │
│  │ • is_principal   │       │ • capacite, statut   │                  │
│  │ • date_debut/fin │       └──────────────────────┘                  │
│  └──────────────────┘                                                  │
│                                                                         │
│                                                                         │
│  ┌──────────────────┐       ┌──────────────────────┐                  │
│  │   time_slot      │       │      schedule        │                  │
│  ├──────────────────┤       ├──────────────────────┤                  │
│  │ • id (PK)        │───┐   │ • id (PK)            │                  │
│  │ • day_of_week    │   └──►│ • time_slot_id (FK)  │                  │
│  │ • start_time     │       │ • classe_id (FK)     │                  │
│  │ • end_time       │       │ • matiere_id (FK)    │                  │
│  │ • is_active      │       │ • salle_id (FK)      │                  │
│  └──────────────────┘       │ • enseignant_id (FK) │                  │
│                             │ • date_debut/fin     │                  │
│                             │ • type_cours, statut │                  │
│                             └──────────┬───────────┘                  │
│                                        │                               │
│                               ┌────────▼─────────┐                    │
│                               │     booking      │                    │
│                               ├──────────────────┤                    │
│                               │ • id (PK)        │                    │
│                               │ • schedule_id(FK)│                    │
│                               │ • user_id (FK)   │                    │
│                               │ • presence       │                    │
│                               │ • statut         │                    │
│                               └──────────────────┘                    │
│                                                                         │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## File Structure

```
Learnflow/
├── backend/
│   ├── auth-service/
│   │   ├── config/
│   │   │   └── index.js              # Sequelize configuration
│   │   ├── models/
│   │   │   └── userModel.js          # User (students, teachers)
│   │   └── server.js
│   │
│   └── Reference_documents/
│       ├── models/
│       │   ├── index.js              # ✨ Relations definition
│       │   ├── Département.js
│       │   ├── Specialite.js
│       │   ├── Niveau.js
│       │   ├── Classe.js
│       │   ├── Matière.js
│       │   ├── Salle.js
│       │   ├── TimeSlot.js
│       │   ├── Schedule.js           # ✨ Main timetable entity
│       │   ├── Booking.js
│       │   ├── MatiereClasse.js
│       │   └── MatiereEnseignant.js
│       │
│       ├── routes/
│       │   └── Calendar.js           # ✨ All timetable endpoints
│       │
│       ├── services/
│       │   └── conflictDetection.js  # ✨ NEW: Conflict detection logic
│       │
│       ├── scripts/
│       │   ├── setupSampleData.js    # ✨ NEW: Create test data
│       │   └── testTimetableSystem.js # ✨ NEW: Automated tests
│       │
│       └── server.js
│
├── frontend/
│   └── learnflow/
│       └── src/
│           ├── admin/
│           │   ├── CalendarDashboard.jsx
│           │   ├── StudentBulkAssignment.jsx
│           │   └── ...
│           └── ...
│
├── database_timetable_constraints.sql  # ✨ NEW: DB migration
├── TIMETABLE_SYSTEM_COMPLETE.md        # ✨ NEW: Full documentation
├── TIMETABLE_IMPLEMENTATION_SUMMARY.md # ✨ NEW: What was done
├── TIMETABLE_API_QUICK_REFERENCE.md    # ✨ NEW: API reference
├── TIMETABLE_ARCHITECTURE.md           # ✨ NEW: This file
└── GETTING_STARTED.md                  # ✨ NEW: Getting started guide
```

---

## Technology Stack

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND                                │
├─────────────────────────────────────────────────────────────┤
│  • React 18                                                  │
│  • Vite (Build Tool)                                         │
│  • React Router                                              │
│  • Axios / Fetch API                                         │
│  • Drag & Drop Libraries (react-beautiful-dnd, etc.)         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      BACKEND                                 │
├─────────────────────────────────────────────────────────────┤
│  • Node.js 18+                                               │
│  • Express.js                                                │
│  • Sequelize ORM                                             │
│  • Custom Services (Conflict Detection)                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      DATABASE                                │
├─────────────────────────────────────────────────────────────┤
│  • PostgreSQL 12+                                            │
│  • Two Schemas: auth, referentiels                           │
│  • Foreign Keys with Cascades                                │
│  • Indexes for Performance                                   │
│  • Views for Reporting                                       │
│  • Helper Functions                                          │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Design Decisions

### 1. **Comprehensive Conflict Detection**
- All conflicts checked before database insert
- Clear error messages with specific targets
- Multiple conflict types in single response

### 2. **Proper Cascade Rules**
- RESTRICT for critical relations (prevent accidental deletion)
- CASCADE for dependent data (clean up automatically)
- SET NULL for optional relations

### 3. **Separation of Concerns**
- Conflict detection in separate service
- Reusable across different endpoints
- Easy to maintain and extend

### 4. **Performance Optimization**
- Database indexes on frequently queried fields
- Views for complex queries
- Helper functions for common operations

### 5. **API Design**
- RESTful endpoints
- Consistent response format
- Detailed error messages
- Pre-validation endpoints

---

**Last Updated**: November 13, 2025  
**Version**: 2.0  
**Status**: Production Ready
