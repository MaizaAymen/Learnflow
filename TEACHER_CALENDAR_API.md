# Teacher Calendar System - Complete API Documentation

## 🎯 Overview
This API enables teachers to manage their teaching calendar, declare absences, and request rattrapages (makeup sessions). Department Directors can review and approve/reject these requests.

---

## 📋 Data Models

### 1. Absence Model
Represents a teacher's absence from a scheduled session.

```javascript
{
  id: UUID (primary key),
  schedule_id: UUID (foreign key to Schedule),
  enseignant_id: INTEGER (foreign key to User),
  motif: STRING(500) - Reason for absence,
  date_debut: DATE - Start of absence period,
  date_fin: DATE - End of absence period,
  statut: ENUM('pending', 'approved', 'rejected'),
  validated_by: INTEGER - Director who approved/rejected (nullable),
  validation_date: DATE - When decision was made (nullable),
  notes: TEXT - Additional notes (nullable),
  createdAt: DATE,
  updatedAt: DATE
}
```

### 2. Rattrapage Model
Represents a request for makeup session scheduling.

```javascript
{
  id: UUID (primary key),
  original_schedule_id: UUID (foreign key to Schedule),
  enseignant_id: INTEGER (foreign key to User),
  requested_date: DATE - Proposed date for rattrapage,
  requested_start_time: TIME,
  requested_end_time: TIME,
  motif: STRING(500) - Reason for rattrapage,
  statut: ENUM('pending', 'approved', 'rejected', 'completed'),
  validated_by: INTEGER - Director who approved/rejected (nullable),
  validation_date: DATE - When decision was made (nullable),
  new_schedule_id: UUID - Created schedule after approval (nullable),
  notes: TEXT - Additional notes (nullable),
  createdAt: DATE,
  updatedAt: DATE
}
```

---

## 🔌 API Endpoints

### Teacher Calendar Endpoints

#### 1. Get All Teacher Sessions
```
GET /api/teacher/schedules
```

**Response:**
```json
[
  {
    "id": "uuid",
    "day_of_week": "Lundi",
    "start_time": "09:00:00",
    "end_time": "11:00:00",
    "date_debut": "2025-11-17",
    "type_cours": "Cours",
    "classe": { "id": "2", "nom": "TI15" },
    "matiere": { "id": "1", "name": "Database Design", "code": "DB101" },
    "salle": { "id": "3", "nom": "Amphi A", "localisation": "Building 1" }
  }
]
```

#### 2. Get Teacher Subjects
```
GET /api/teacher/subjects
```

**Response:**
```json
[
  { "id": "1", "name": "Database Design", "code": "DB101" },
  { "id": "2", "name": "Web Development", "code": "WEB201" }
]
```

#### 3. Declare Absence
```
POST /api/teacher/absences
```

**Request Body:**
```json
{
  "schedule_id": "uuid",
  "motif": "Medical appointment",
  "date_debut": "2025-11-17T09:00:00Z",
  "date_fin": "2025-11-17T11:00:00Z"
}
```

**Response:**
```json
{
  "id": "uuid",
  "schedule_id": "uuid",
  "enseignant_id": 5,
  "motif": "Medical appointment",
  "date_debut": "2025-11-17T09:00:00Z",
  "date_fin": "2025-11-17T11:00:00Z",
  "statut": "pending",
  "validated_by": null,
  "validation_date": null,
  "notes": null,
  "createdAt": "2025-11-14T...",
  "updatedAt": "2025-11-14T..."
}
```

#### 4. Get All Teacher Absences
```
GET /api/teacher/absences
```

**Response:**
```json
[
  {
    "id": "uuid",
    "schedule_id": "uuid",
    "motif": "Medical appointment",
    "date_debut": "2025-11-17",
    "date_fin": "2025-11-17",
    "statut": "pending",
    "schedule": {
      "matiere": { "name": "Database Design", "code": "DB101" }
    }
  }
]
```

#### 5. Request Rattrapage
```
POST /api/teacher/rattrapages
```

**Request Body:**
```json
{
  "original_schedule_id": "uuid",
  "requested_date": "2025-11-18T09:00:00Z",
  "requested_start_time": "10:00:00",
  "requested_end_time": "12:00:00",
  "motif": "COVID-19 related absence"
}
```

**Response:**
```json
{
  "id": "uuid",
  "original_schedule_id": "uuid",
  "enseignant_id": 5,
  "requested_date": "2025-11-18",
  "requested_start_time": "10:00:00",
  "requested_end_time": "12:00:00",
  "motif": "COVID-19 related absence",
  "statut": "pending",
  "validated_by": null,
  "validation_date": null,
  "new_schedule_id": null,
  "notes": null,
  "createdAt": "2025-11-14T...",
  "updatedAt": "2025-11-14T..."
}
```

#### 6. Get All Teacher Rattrapages
```
GET /api/teacher/rattrapages
```

**Response:**
```json
[
  {
    "id": "uuid",
    "requested_date": "2025-11-18",
    "requested_start_time": "10:00:00",
    "motif": "COVID-19 related absence",
    "statut": "pending",
    "schedule": {
      "matiere": { "name": "Database Design", "code": "DB101" }
    }
  }
]
```

---

### Director Approval Endpoints

#### 1. Get Pending Absences
```
GET /api/director/absences/pending
```

**Response:**
```json
[
  {
    "id": "uuid",
    "motif": "Medical appointment",
    "date_debut": "2025-11-17",
    "date_fin": "2025-11-17",
    "statut": "pending",
    "enseignant": { "id": 5, "nom": "Durand", "prenom": "Jean", "email": "jean.durand@..." },
    "schedule": {
      "matiere": { "id": "1", "name": "Database Design", "code": "DB101" }
    }
  }
]
```

#### 2. Approve Absence
```
POST /api/director/absences/:id/approved
```

**Request Body:**
```json
{
  "notes": "Approved - Medical documentation provided"
}
```

**Response:** Updated Absence object with `statut: "approved"`

#### 3. Reject Absence
```
POST /api/director/absences/:id/rejected
```

**Request Body:**
```json
{
  "notes": "Insufficient documentation provided"
}
```

**Response:** Updated Absence object with `statut: "rejected"`

#### 4. Get Pending Rattrapages
```
GET /api/director/rattrapages/pending
```

**Response:**
```json
[
  {
    "id": "uuid",
    "requested_date": "2025-11-18",
    "requested_start_time": "10:00:00",
    "requested_end_time": "12:00:00",
    "motif": "COVID-19 related absence",
    "statut": "pending",
    "enseignant": { "id": 5, "nom": "Durand", "prenom": "Jean", "email": "jean.durand@..." },
    "schedule": {
      "matiere": { "id": "1", "name": "Database Design", "code": "DB101" }
    }
  }
]
```

#### 5. Approve Rattrapage
```
POST /api/director/rattrapages/:id/approved
```

**Request Body:**
```json
{
  "notes": "Approved - New session created"
}
```

**Response:**
```json
{
  "rattrapage": {
    "id": "uuid",
    "statut": "approved",
    "new_schedule_id": "uuid"
  },
  "newSchedule": {
    "id": "uuid",
    "date_debut": "2025-11-18",
    "start_time": "10:00:00",
    "end_time": "12:00:00",
    "type_cours": "Rattrapage"
  }
}
```

#### 6. Reject Rattrapage
```
POST /api/director/rattrapages/:id/rejected
```

**Request Body:**
```json
{
  "notes": "Date/time not suitable for class schedule"
}
```

**Response:** Updated Rattrapage object with `statut: "rejected"`

---

## 🔄 Workflow

### Absence Workflow
1. Teacher declares absence via `POST /api/teacher/absences`
2. Absence created with `statut: "pending"`
3. Director reviews via `GET /api/director/absences/pending`
4. Director approves/rejects:
   - `POST /api/director/absences/:id/approved` → `statut: "approved"`
   - `POST /api/director/absences/:id/rejected` → `statut: "rejected"`

### Rattrapage Workflow
1. Teacher requests rattrapage via `POST /api/teacher/rattrapages`
2. Rattrapage created with `statut: "pending"`
3. Director reviews via `GET /api/director/rattrapages/pending`
4. Director approves/rejects:
   - `POST /api/director/rattrapages/:id/approved`:
     - Creates new Schedule with proposed date/time
     - Updates Rattrapage with `statut: "approved"` and `new_schedule_id`
   - `POST /api/director/rattrapages/:id/rejected` → `statut: "rejected"`

---

## 🎨 Frontend Components

### TeacherCalendar.jsx
Main teacher calendar interface featuring:
- **Sidebar**: Subject filtering, statistics badges
- **Calendar View**: Month view with color-coded events
- **Tabs**:
  - Sessions: All upcoming sessions
  - Absences: Declared absences with status
  - Rattrapages: Requested makeup sessions
- **Modals**:
  - Session Details: View full session information
  - Absence Declaration: Declare absence with date range
  - Rattrapage Request: Request makeup session

### DirectorApprovalPanel.jsx
Director interface for managing requests:
- **Statistics**: Badges showing pending counts
- **Tabs**:
  - Absences: Table of pending/approved/rejected absences
  - Rattrapages: Table of pending/approved/rejected rattrapages
- **Actions**:
  - Approve: With optional notes
  - Reject: With mandatory reason notes

---

## 🔒 Permissions & Validation

### Teacher Permissions
- ✅ View own sessions
- ✅ Create absence requests
- ✅ Create rattrapage requests
- ❌ Edit/delete own requests (pending only)
- ❌ View other teachers' calendars
- ❌ Approve requests

### Director Permissions
- ✅ View all pending requests
- ✅ Approve/reject absences
- ✅ Approve/reject rattrapages
- ✅ Create new schedules on rattrapage approval
- ✅ Add validation notes
- ❌ View teacher sessions directly

### Validation Rules
- **Absence**: Cannot overlap with non-cancelled sessions
- **Rattrapage**: Must include valid date, time range, and reason
- **Rattrapage Approval**: Automatically checks schedule conflicts
- **Dates**: All dates normalized to UTC for consistency

---

## 🚀 Integration Steps

1. **Backend**: Routes registered in `server.js`
2. **Frontend**: Routes available at `/calendar/teacher` and `/calendar/director-approval`
3. **Database**: Models auto-sync via Sequelize
4. **Auth**: Uses existing teacher/director role permissions

---

## 📊 Conflict Detection

When approving rattrapages, the system checks:
- No overlapping sessions for same teacher
- No overlapping sessions for same class
- No overlapping sessions for same room
- Room availability for proposed time slot

---

## 📝 Example Usage

### Teacher Flow
```javascript
// 1. Fetch my sessions
const sessions = await fetch('http://localhost:3000/api/teacher/schedules');

// 2. Declare absence
await fetch('http://localhost:3000/api/teacher/absences', {
  method: 'POST',
  body: JSON.stringify({
    schedule_id: 'session-uuid',
    motif: 'Medical appointment',
    date_debut: '2025-11-17T09:00:00Z',
    date_fin: '2025-11-17T11:00:00Z'
  })
});

// 3. Request rattrapage
await fetch('http://localhost:3000/api/teacher/rattrapages', {
  method: 'POST',
  body: JSON.stringify({
    original_schedule_id: 'session-uuid',
    requested_date: '2025-11-18T10:00:00Z',
    requested_start_time: '10:00:00',
    requested_end_time: '12:00:00',
    motif: 'Medical appointment'
  })
});
```

### Director Flow
```javascript
// 1. Fetch pending absences
const absences = await fetch('http://localhost:3000/api/director/absences/pending');

// 2. Approve absence
await fetch('http://localhost:3000/api/director/absences/uuid/approved', {
  method: 'POST',
  body: JSON.stringify({
    notes: 'Approved - Medical documentation verified'
  })
});

// 3. Fetch pending rattrapages
const rattrapages = await fetch('http://localhost:3000/api/director/rattrapages/pending');

// 4. Approve rattrapage
await fetch('http://localhost:3000/api/director/rattrapages/uuid/approved', {
  method: 'POST',
  body: JSON.stringify({
    notes: 'Approved - Schedule created'
  })
});
```

---

## 🛠️ Error Handling

All endpoints return appropriate HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad request (validation error)
- `401`: Unauthorized
- `403`: Forbidden (insufficient permissions)
- `404`: Not found
- `500`: Server error

Error response format:
```json
{
  "error": "Error message describing what went wrong"
}
```

---

## 📦 Deployment Checklist

- [x] Backend models created (Absence, Rattrapage)
- [x] Backend routes implemented
- [x] Frontend components built
- [x] Routes integrated in App.jsx
- [x] Database relationships configured
- [x] API documentation complete
- [ ] Test with real teacher/director users
- [ ] Configure CORS for production
- [ ] Set up email notifications (optional)
- [ ] Configure audit logging (optional)
