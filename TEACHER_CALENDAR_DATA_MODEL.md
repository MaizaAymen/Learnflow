# Teacher Calendar System - Data Model Architecture

## 📊 Complete Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│              TEACHER CALENDAR SYSTEM                         │
└─────────────────────────────────────────────────────────────┘

                        ┌─────────────────┐
                        │   UTILISATEUR   │ (Auth Service)
                        │   (Teacher)     │
                        └────────┬────────┘
                                 │
                    ┌────────────┼────────────┐
                    │            │            │
           ┌────────▼──────┐ ┌──▼─────────┐ ┌──▼─────────┐
           │  SCHEDULE     │ │  ABSENCE   │ │ RATTRAPAGE │
           │               │ │            │ │            │
           │ ├─ id         │ │ ├─ id      │ │ ├─ id      │
           │ ├─ matiere_id │ │ ├─ sched-  │ │ ├─ orig-   │
           │ ├─ classe_id  │ │ │   ule_id │ │ │   sched-  │
           │ ├─ salle_id   │ │ ├─ enseg-  │ │ │   ule_id  │
           │ ├─ day_of     │ │ │   nant_id│ │ ├─ enseg-   │
           │ │   week      │ │ ├─ motif   │ │ │   nant_id │
           │ ├─ start_time │ │ ├─ date-   │ │ ├─ req-     │
           │ ├─ end_time   │ │ │   debut  │ │ │   uested- │
           │ ├─ type_cours │ │ ├─ date_fin│ │ │   date    │
           │ ├─ statut     │ │ ├─ statut  │ │ ├─ req-     │
           │ └─ notes      │ │ ├─ valid-  │ │ │   uested- │
           │               │ │ │   ated-  │ │ │   start-  │
           │               │ │ │   by     │ │ │   time    │
           │               │ │ ├─ valid-  │ │ ├─ motif    │
           │               │ │ │   ation- │ │ ├─ statut   │
           │               │ │ │   date   │ │ ├─ new-     │
           │               │ │ ├─ notes   │ │ │   sched-  │
           │               │ │ └─────────┘ │ │   ule_id   │
           │               │               │ ├─ validated│
           │               │               │ │   _by     │
           │               │               │ ├─ validation│
           │               │               │ │   _date   │
           │               │               │ ├─ notes    │
           │               │               │ └───────────┘
           └─────────────┬────────────────┘
                         │
                ┌────────┴─────────┐
                │                  │
           ┌────▼─────┐      ┌────▼──────┐
           │  MATIERE  │      │  CLASSE   │
           └───────────┘      └───────────┘
```

---

## 🔗 Relationship Diagram

### Schedule Relationships
```
SCHEDULE (1 entity)
  ├─ belongs_to MATIERE (many schedules per subject)
  ├─ belongs_to CLASSE (many schedules per class)
  ├─ belongs_to SALLE (many schedules per room)
  ├─ belongs_to UTILISATEUR (many schedules per teacher)
  ├─ has_many ABSENCE (one-to-many)
  └─ has_many RATTRAPAGE (one-to-many)

ABSENCE (N entities)
  ├─ belongs_to SCHEDULE (many-to-one)
  ├─ belongs_to UTILISATEUR as ENSEIGNANT (many-to-one)
  └─ belongs_to UTILISATEUR as VALIDATOR (many-to-one, nullable)

RATTRAPAGE (N entities)
  ├─ belongs_to SCHEDULE as ORIGINAL_SCHEDULE (many-to-one)
  ├─ belongs_to SCHEDULE as NEW_SCHEDULE (many-to-one, nullable)
  ├─ belongs_to UTILISATEUR as ENSEIGNANT (many-to-one)
  └─ belongs_to UTILISATEUR as VALIDATOR (many-to-one, nullable)
```

---

## 📋 Data Model Specifications

### ABSENCE Entity

**Purpose:** Track teacher absences from scheduled sessions

**Attributes:**
```javascript
{
  id: UUID,                           // Unique identifier
  schedule_id: UUID (FK),             // Which session is affected
  enseignant_id: INTEGER (FK),        // Which teacher
  motif: VARCHAR(500),                // Reason (medical, personal, etc.)
  date_debut: DATE,                   // When absence starts
  date_fin: DATE,                     // When absence ends
  statut: ENUM,                       // pending|approved|rejected
  validated_by: INTEGER (FK, NULL),   // Director who decided
  validation_date: DATE (NULL),       // When decision was made
  notes: TEXT (NULL),                 // Additional comments
  createdAt: TIMESTAMP,               // When request created
  updatedAt: TIMESTAMP                // When last modified
}
```

**Indexes:**
```sql
CREATE INDEX idx_absence_schedule ON absence(schedule_id);
CREATE INDEX idx_absence_teacher ON absence(enseignant_id);
CREATE INDEX idx_absence_status ON absence(statut);
CREATE INDEX idx_absence_created ON absence(created_at);
```

**Constraints:**
- `schedule_id` NOT NULL (must reference valid schedule)
- `enseignant_id` NOT NULL (must reference valid teacher)
- `motif` NOT NULL AND NOT EMPTY
- `date_debut` <= `date_fin`
- `statut` IN ('pending', 'approved', 'rejected')
- `validated_by` REFERENCES utilisateur (on delete cascade)
- Dates must be in the future or present

---

### RATTRAPAGE Entity

**Purpose:** Track requests for makeup sessions after missed classes

**Attributes:**
```javascript
{
  id: UUID,                           // Unique identifier
  original_schedule_id: UUID (FK),    // Which session is being rescheduled
  enseignant_id: INTEGER (FK),        // Which teacher
  requested_date: DATE,               // Proposed date for makeup
  requested_start_time: TIME,         // Start time
  requested_end_time: TIME,           // End time
  motif: VARCHAR(500),                // Reason for makeup
  statut: ENUM,                       // pending|approved|rejected|completed
  validated_by: INTEGER (FK, NULL),   // Director who decided
  validation_date: DATE (NULL),       // When decision was made
  new_schedule_id: UUID (FK, NULL),   // Created schedule if approved
  notes: TEXT (NULL),                 // Additional comments
  createdAt: TIMESTAMP,               // When request created
  updatedAt: TIMESTAMP                // When last modified
}
```

**Indexes:**
```sql
CREATE INDEX idx_rattrapage_original ON rattrapage(original_schedule_id);
CREATE INDEX idx_rattrapage_new ON rattrapage(new_schedule_id);
CREATE INDEX idx_rattrapage_teacher ON rattrapage(enseignant_id);
CREATE INDEX idx_rattrapage_status ON rattrapage(statut);
CREATE INDEX idx_rattrapage_date ON rattrapage(requested_date);
```

**Constraints:**
- `original_schedule_id` NOT NULL (must reference valid schedule)
- `enseignant_id` NOT NULL (must reference valid teacher)
- `requested_date` > original schedule date
- `requested_start_time` < `requested_end_time`
- `motif` NOT NULL AND NOT EMPTY
- `statut` IN ('pending', 'approved', 'rejected', 'completed')
- `new_schedule_id` only set when `statut='approved'`
- Dates must be in the future

---

## 🔄 State Transitions

### Absence State Machine
```
┌─────────┐
│ PENDING │ (Initial state - awaiting director review)
└────┬────┘
     │
     ├─────► ┌──────────┐
     │       │ APPROVED │ (Director approved the absence)
     │       └──────────┘
     │
     └─────► ┌──────────┐
             │ REJECTED │ (Director rejected the absence)
             └──────────┘

Note: Cannot revert once approved/rejected (immutable after decision)
```

### Rattrapage State Machine
```
┌─────────┐
│ PENDING │ (Initial state - awaiting director review)
└────┬────┘
     │
     ├─────► ┌──────────┐
     │       │ APPROVED │ (Director approved, new session created)
     │       └────┬─────┘
     │            │
     │            └─────► ┌───────────┐
     │                    │ COMPLETED │ (Makeup session held)
     │                    └───────────┘
     │
     └─────► ┌──────────┐
             │ REJECTED │ (Director rejected the request)
             └──────────┘

Note: Automatic transition to COMPLETED when new_schedule ends
```

---

## 💾 Database Operations

### Create Absence
```sql
INSERT INTO referentiels.absence (
  id, schedule_id, enseignant_id, motif, 
  date_debut, date_fin, statut
) VALUES (
  uuid_generate_v4(),
  $1, $2, $3, $4, $5, 'pending'
);
```

### Approve Absence
```sql
UPDATE referentiels.absence
SET statut = 'approved',
    validated_by = $1,
    validation_date = NOW(),
    notes = $2
WHERE id = $3 AND statut = 'pending';
```

### Create Rattrapage with Auto-Schedule
```sql
-- 1. Create rattrapage
INSERT INTO referentiels.rattrapage (
  id, original_schedule_id, enseignant_id,
  requested_date, requested_start_time, requested_end_time,
  motif, statut
) VALUES (
  $1, $2, $3, $4, $5, $6, $7, 'pending'
);

-- 2. On approval, create new schedule
INSERT INTO referentiels.schedule (
  id, classe_id, matiere_id, enseignant_id, salle_id,
  day_of_week, start_time, end_time, type_cours,
  date_debut, date_fin, statut, notes
) VALUES (
  uuid_generate_v4(),
  (SELECT classe_id FROM schedule WHERE id = $2),
  (SELECT matiere_id FROM schedule WHERE id = $2),
  $3,
  (SELECT salle_id FROM schedule WHERE id = $2),
  to_char($4::date, 'Day'),
  $5, $6, 'Rattrapage',
  $4, $4, 'active',
  CONCAT('Rattrapage for ', $4::date)
);

-- 3. Update rattrapage with new schedule
UPDATE referentiels.rattrapage
SET statut = 'approved',
    new_schedule_id = (last inserted schedule id),
    validated_by = $8,
    validation_date = NOW()
WHERE id = $1;
```

---

## 🔍 Query Examples

### Get Teacher's Absences
```sql
SELECT 
  a.id, a.motif, a.date_debut, a.date_fin, a.statut,
  s.matiere_id, s.classe_id,
  m.name as subject_name
FROM referentiels.absence a
JOIN referentiels.schedule s ON a.schedule_id = s.id
JOIN referentiels.matiere m ON s.matiere_id = m.id
WHERE a.enseignant_id = $1
ORDER BY a.date_debut DESC;
```

### Get Pending Requests for Director
```sql
SELECT 
  'absence' as type,
  a.id, a.motif, a.date_debut, a.statut,
  u.nom, u.prenom, m.name
FROM referentiels.absence a
JOIN auth.utilisateur u ON a.enseignant_id = u.id
JOIN referentiels.schedule s ON a.schedule_id = s.id
JOIN referentiels.matiere m ON s.matiere_id = m.id
WHERE a.statut = 'pending'

UNION ALL

SELECT 
  'rattrapage' as type,
  r.id, r.motif, r.requested_date, r.statut,
  u.nom, u.prenom, m.name
FROM referentiels.rattrapage r
JOIN auth.utilisateur u ON r.enseignant_id = u.id
JOIN referentiels.schedule s ON r.original_schedule_id = s.id
JOIN referentiels.matiere m ON s.matiere_id = m.id
WHERE r.statut = 'pending'
ORDER BY date_debut DESC;
```

### Get Conflict Validation for Rattrapage
```sql
SELECT COUNT(*) as conflicts
FROM referentiels.schedule s
WHERE s.enseignant_id = $1  -- Same teacher
  AND s.day_of_week = $2     -- Same day
  AND s.classe_id = $3       -- Same class
  AND s.salle_id = $4        -- Same room
  AND (
    -- Time overlap check
    (s.start_time < $6 AND s.end_time > $5)
  )
  AND s.statut != 'annule'   -- Only active schedules
  AND s.id != $7;            -- Exclude original schedule
```

---

## 🧮 Aggregate Queries

### Teacher Statistics
```sql
SELECT 
  COUNT(DISTINCT s.id) as total_sessions,
  COUNT(DISTINCT CASE WHEN a.statut = 'approved' THEN a.id END) as approved_absences,
  COUNT(DISTINCT CASE WHEN a.statut = 'pending' THEN a.id END) as pending_absences,
  COUNT(DISTINCT CASE WHEN r.statut = 'pending' THEN r.id END) as pending_rattrapages
FROM auth.utilisateur u
LEFT JOIN referentiels.schedule s ON u.id = s.enseignant_id
LEFT JOIN referentiels.absence a ON s.id = a.schedule_id
LEFT JOIN referentiels.rattrapage r ON s.id = r.original_schedule_id
WHERE u.id = $1;
```

### Director Dashboard
```sql
SELECT 
  COUNT(DISTINCT CASE WHEN a.statut = 'pending' THEN a.id END) as pending_absences,
  COUNT(DISTINCT CASE WHEN a.statut = 'approved' THEN a.id END) as approved_absences,
  COUNT(DISTINCT CASE WHEN r.statut = 'pending' THEN r.id END) as pending_rattrapages,
  COUNT(DISTINCT CASE WHEN r.statut = 'approved' THEN r.id END) as approved_rattrapages,
  COUNT(DISTINCT CASE WHEN r.statut = 'rejected' THEN r.id END) as rejected_rattrapages
FROM referentiels.absence a
FULL OUTER JOIN referentiels.rattrapage r ON 1=1;
```

---

## 🔐 Data Integrity Rules

### Foreign Key Integrity
- `schedule_id` must exist in schedule table
- `enseignant_id` must exist in utilisateur table
- `new_schedule_id` must exist in schedule table (if not null)
- `validated_by` must exist in utilisateur table (if not null)

### Business Logic Integrity
- Cannot approve absence if original schedule already rescheduled
- Cannot create rattrapage if already have pending/approved for same schedule
- Cannot modify request after director decision (immutable)
- Absence and rattrapage dates must be in valid ranges

### Temporal Integrity
- `date_debut` must be ≤ `date_fin` for absences
- `requested_date` must be after original session
- `requested_start_time` must be < `requested_end_time` for rattrapages
- `validation_date` must be after `createdAt`

---

## 📈 Performance Considerations

### Indexing Strategy
```sql
-- Speed up absence lookups
CREATE INDEX idx_absence_schedule ON absence(schedule_id);
CREATE INDEX idx_absence_teacher ON absence(enseignant_id);
CREATE INDEX idx_absence_status ON absence(statut);
CREATE INDEX idx_absence_date ON absence(date_debut, date_fin);

-- Speed up rattrapage lookups
CREATE INDEX idx_rattrapage_original ON rattrapage(original_schedule_id);
CREATE INDEX idx_rattrapage_teacher ON rattrapage(enseignant_id);
CREATE INDEX idx_rattrapage_status ON rattrapage(statut);
CREATE INDEX idx_rattrapage_date ON rattrapage(requested_date);

-- Composite indexes for common queries
CREATE INDEX idx_absence_teacher_status 
  ON absence(enseignant_id, statut);
CREATE INDEX idx_rattrapage_teacher_status 
  ON rattrapage(enseignant_id, statut);
```

### Query Optimization
- Use indexed columns in WHERE clauses
- Avoid full table scans for pending requests
- Use batch operations for bulk approvals
- Cache director panel data (5-minute TTL)

---

## 🗑️ Data Cleanup

### Archive Old Records (Monthly)
```sql
-- Archive approved absences older than 1 year
INSERT INTO referentiels.absence_archive
SELECT * FROM referentiels.absence
WHERE statut = 'approved' 
  AND validation_date < NOW() - INTERVAL '1 year';

DELETE FROM referentiels.absence
WHERE statut = 'approved' 
  AND validation_date < NOW() - INTERVAL '1 year';
```

### Purge Rejected Requests (Quarterly)
```sql
-- Delete rejected requests older than 6 months
DELETE FROM referentiels.absence
WHERE statut = 'rejected' 
  AND updated_at < NOW() - INTERVAL '6 months';

DELETE FROM referentiels.rattrapage
WHERE statut = 'rejected' 
  AND updated_at < NOW() - INTERVAL '6 months';
```

---

## 📊 Schema Evolution

### Migration: Add Email Notifications
```sql
ALTER TABLE referentiels.absence 
ADD COLUMN notification_sent BOOLEAN DEFAULT FALSE;

ALTER TABLE referentiels.rattrapage 
ADD COLUMN notification_sent BOOLEAN DEFAULT FALSE;
```

### Migration: Add Document Attachments
```sql
CREATE TABLE referentiels.absence_documents (
  id UUID PRIMARY KEY,
  absence_id UUID NOT NULL REFERENCES absence(id),
  file_path VARCHAR(500),
  file_type VARCHAR(50),
  uploaded_at TIMESTAMP,
  uploaded_by INTEGER
);
```

### Migration: Add Audit Log
```sql
CREATE TABLE referentiels.request_audit_log (
  id UUID PRIMARY KEY,
  request_id UUID,
  request_type ENUM('absence', 'rattrapage'),
  action ENUM('created', 'approved', 'rejected', 'modified'),
  actor_id INTEGER,
  old_values JSONB,
  new_values JSONB,
  timestamp TIMESTAMP
);
```
