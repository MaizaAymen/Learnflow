# Teacher Student Absence Marking Feature

## Overview

This feature allows teachers to mark student absences directly from lesson cells in the teacher calendar. It provides a comprehensive attendance management system with support for multiple absence types, bulk operations, and detailed tracking.

## Features

### 1. **Mark Student Absences Modal** (`StudentAbsenceModal.jsx`)

An interactive modal that appears when teachers click "Mark Absences" on a lesson. Features include:

- **Student List Display**: Automatically loads all students in the class
- **Individual Status Selection**: Set attendance status for each student
  - ✓ Present
  - ✗ Absent
  - ⚠ Excused
  - 🕒 Late
  - ⏱ Left Early

- **Bulk Operations**:
  - Set all students to same status
  - Apply global reason to all students
  - Reset all to present

- **Individual Notes**: Add reasons for absences per student
- **Real-time Statistics**: Shows count of Present, Absent, Excused, Late, and Left Early

### 2. **Attendance Viewer Modal** (`StudentAttendanceViewer.jsx`)

Displays and manages recorded attendance. Features include:

- **Attendance Records Table**: 
  - Student name and email
  - Attendance status with color coding
  - Reason for absence
  - Timestamp when marked

- **Statistics Dashboard**:
  - Total students
  - Present count
  - Absent count
  - Excused count
  - Late count
  - Left Early count

- **Attendance Management**:
  - Edit individual records
  - Delete records
  - Export to CSV

### 3. **Integration with TeacherCalendar**

The TeacherCalendar component now includes:

- **Session Details Modal** enhanced with two new action buttons:
  - **Mark Absences**: Opens the StudentAbsenceModal
  - **View Attendance**: Opens the StudentAttendanceViewer

## Database Schema

### StudentAbsence Model (`StudentAbsence.js`)

```javascript
{
  id: UUID (primary key),
  schedule_id: INTEGER (FK to Schedule),
  student_id: INTEGER (FK to Student),
  enseignant_id: INTEGER (teacher ID),
  absence_type: ENUM ('present', 'absent', 'excused', 'late', 'left_early'),
  motif: STRING(500) - reason for absence,
  marked_at: DATETIME,
  notes: TEXT,
  statut: ENUM ('pending', 'approved', 'rejected')
}
```

**Unique Constraint**: One record per student per schedule (prevents duplicate entries)

## API Endpoints

### 1. POST `/api/teacher/mark-student-absences`

Records attendance for multiple students in a lesson.

**Request:**
```json
{
  "schedule_id": 123,
  "absences": [
    {
      "student_id": 1,
      "schedule_id": 123,
      "absence_type": "absent",
      "motif": "Sick leave"
    },
    {
      "student_id": 2,
      "schedule_id": 123,
      "absence_type": "present",
      "motif": null
    }
  ]
}
```

**Response:**
```json
{
  "message": "Student absences marked successfully",
  "count": 2,
  "data": [...]
}
```

### 2. GET `/api/teacher/schedule/:scheduleId/absences`

Retrieves all attendance records for a specific lesson.

**Response:**
```json
[
  {
    "id": "uuid",
    "schedule_id": 123,
    "student_id": 1,
    "enseignant_id": 5,
    "absence_type": "absent",
    "motif": "Sick leave",
    "marked_at": "2025-11-16T10:30:00Z",
    "student": {
      "id": 1,
      "nom": "Dupont",
      "prenom": "Jean",
      "email": "jean@example.com"
    }
  }
]
```

### 3. PUT `/api/teacher/student-absence/:absenceId`

Updates an individual attendance record.

**Request:**
```json
{
  "absence_type": "excused",
  "motif": "Doctor's note provided"
}
```

### 4. DELETE `/api/teacher/student-absence/:absenceId`

Deletes an attendance record.

**Response:**
```json
{
  "message": "Attendance record deleted"
}
```

## File Structure

```
frontend/learnflow/src/admin/
├── TeacherCalendar.jsx (updated)
├── TeacherCalendar.css
├── StudentAbsenceModal.jsx (new)
├── StudentAbsenceModal.css (new)
├── StudentAttendanceViewer.jsx (new)
└── StudentAttendanceViewer.css (new)

backend/Reference_documents/
├── models/
│   ├── StudentAbsence.js (new)
│   └── index.js (needs update to register StudentAbsence)
└── routes/
    └── TeacherCalendar.js (updated with new endpoints)
```

## Usage Flow

### For Teachers

1. **View Calendar**: Navigate to `/calendar/teacher` to view teaching calendar
2. **Click on Lesson**: Click on a lesson cell to view session details
3. **Mark Absences**: Click "Mark Absences" button
4. **Select Status**: 
   - Choose individual status for each student OR
   - Use bulk operations to apply to all students
5. **Add Notes**: Optionally add reasons for absences
6. **Save**: Click "Save Attendance" to record
7. **View Records**: Click "View Attendance" to see recorded attendance or export to CSV

### Bulk Operations

- **Apply Status to All**: Select a status and click "Apply" to set all students to that status
- **Apply Global Reason**: Enter a reason and click "Apply Reason" to add reason to all students
- **Reset All**: Click "Reset All" to set all students back to "Present"

## Styling

### StudentAbsenceModal.css

- Statistics dashboard with color-coded cards
- Responsive grid layout for bulk actions
- Clean table layout for student selection
- Color-coded absence types

### StudentAttendanceViewer.css

- Statistics cards showing attendance breakdown
- Color-coded status badges
- Responsive table layout
- Edit and delete buttons

## Integration Notes

### Required Backend Updates

1. **Update Models Index** (`models/index.js`):
   - Import and register the `StudentAbsence` model
   - Set up relationships with `Schedule` and `Student`

2. **API Route Registration** (`server.js`):
   - Register `/api/teacher` routes from `TeacherCalendar.js`
   - Ensure models are available via `req.app.get('models')`

### Dependencies

- Ant Design (UI components)
- dayjs (date formatting)
- React (core framework)

## Features for Future Enhancement

1. **Approval Workflow**: Admin approval of marked absences
2. **Notifications**: Send notifications to students/parents of absences
3. **Attendance Analytics**: Generate attendance reports and trends
4. **Makeup Classes**: Link absences to makeup/rattrapage sessions
5. **QR Code Attendance**: Use QR codes for quick attendance marking
6. **Mobile App Support**: Optimize for mobile attendance marking
7. **Batch Import**: Import attendance from external systems
8. **Integration with Grades**: Link absences to grade calculations

## Error Handling

The system handles:
- Unauthorized access (teacher trying to mark absences for another's classes)
- Schedule not found
- Student not in class
- Missing authentication
- Invalid absence data
- Duplicate entries (prevented by unique constraint)

## Performance Considerations

- Attendance records are deleted and recreated per lesson (prevents duplicates)
- Indexes on `schedule_id`, `student_id`, and `enseignant_id` for fast queries
- CSV export for large attendance records
- Pagination in attendance viewer (10 records per page)

## Security

- All endpoints require authentication (JWT token validation)
- Teacher can only mark absences for their own classes
- Teacher can only view/edit/delete their own attendance records
- Authorization checks on every operation

## Testing

### Manual Testing Steps

1. Login as teacher
2. Navigate to teacher calendar
3. Click on a lesson
4. Click "Mark Absences"
5. Select different absence types for students
6. Use bulk operations
7. Submit
8. Click "View Attendance" to verify records
9. Edit a record
10. Export to CSV

### API Testing

Use Postman or similar tool to test:
- POST /api/teacher/mark-student-absences
- GET /api/teacher/schedule/:scheduleId/absences
- PUT /api/teacher/student-absence/:absenceId
- DELETE /api/teacher/student-absence/:absenceId
