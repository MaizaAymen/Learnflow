# Student Absence Marking - Quick Start Guide

## 🎯 Feature Overview

This feature enables teachers to mark student attendance/absences directly from lesson cells in the calendar. It supports marking multiple students at once with different status types, bulk operations, and detailed tracking.

## 🚀 Quick Start

### For Teachers

1. **Navigate to Teacher Calendar**
   ```
   http://localhost:5173/calendar/teacher
   ```

2. **Click on a Lesson**
   - View the lesson details modal

3. **Click "Mark Absences"**
   - A modal with all class students will open

4. **Select Status for Each Student**
   - ✓ Present
   - ✗ Absent
   - ⚠ Excused (with documented reason)
   - 🕒 Late
   - ⏱ Left Early

5. **Add Reasons** (Optional)
   - Enter reason for absence per student
   - Or use bulk reason application

6. **Submit**
   - Click "Save Attendance"
   - Records saved to database

7. **View Records**
   - Click "View Attendance" to see all marked absences
   - Edit records if needed
   - Export to CSV for reports

## 📊 Dashboard Features

### Mark Absences Modal
- **Real-time Statistics**: See count of Present, Absent, Excused, Late, Left Early
- **Bulk Operations**:
  - Apply same status to all students
  - Apply same reason to all students
  - Reset all to present with one click
- **Individual Control**: Set status and reason per student

### View Attendance Modal
- **Statistics Cards**: Overview of attendance breakdown
- **Detailed Table**: Student name, email, status, reason, timestamp
- **Edit Records**: Update status or reason anytime
- **Delete Records**: Remove incorrect entries
- **Export CSV**: Download attendance records for reports/analysis

## 📁 New Files Created

```
Frontend:
- src/admin/StudentAbsenceModal.jsx        (350 lines)
- src/admin/StudentAbsenceModal.css        (140 lines)
- src/admin/StudentAttendanceViewer.jsx    (280 lines)
- src/admin/StudentAttendanceViewer.css    (100 lines)

Backend:
- models/StudentAbsence.js                 (80 lines)

Routes (Updated):
- routes/TeacherCalendar.js                (+180 lines for new endpoints)

Documentation:
- STUDENT_ABSENCE_MARKING_FEATURE.md       (Complete reference)
- STUDENT_ABSENCE_IMPLEMENTATION_CHECKLIST.md (Setup guide)
```

## 🔌 Integration Requirements

### Step 1: Update Database

Run this migration in MySQL:

```sql
-- Create StudentAbsence table
CREATE TABLE IF NOT EXISTS `referentiels`.`student_absence` (
  `id` VARCHAR(36) PRIMARY KEY,
  `schedule_id` INT NOT NULL,
  `student_id` INT NOT NULL,
  `enseignant_id` INT NOT NULL,
  `absence_type` ENUM('present', 'absent', 'excused', 'late', 'left_early') DEFAULT 'absent',
  `motif` VARCHAR(500),
  `marked_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `notes` TEXT,
  `statut` ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`schedule_id`) REFERENCES `schedule`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`student_id`) REFERENCES `student`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_student_per_schedule` (`schedule_id`, `student_id`),
  INDEX `idx_schedule_id` (`schedule_id`),
  INDEX `idx_student_id` (`student_id`),
  INDEX `idx_enseignant_id` (`enseignant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### Step 2: Update Backend Models

**File: `backend/Reference_documents/models/index.js`**

Add after other model definitions:

```javascript
// Import StudentAbsence
const StudentAbsence = require('./StudentAbsence');

// Register StudentAbsence
sequelize.models.StudentAbsence = StudentAbsence;

// Set up relationships
StudentAbsence.belongsTo(Schedule, { 
  foreignKey: 'schedule_id', 
  as: 'schedule' 
});
StudentAbsence.belongsTo(Student, { 
  foreignKey: 'student_id', 
  as: 'student' 
});
StudentAbsence.belongsTo(Utilisateur, { 
  foreignKey: 'enseignant_id', 
  as: 'teacher' 
});

Schedule.hasMany(StudentAbsence, { 
  foreignKey: 'schedule_id', 
  as: 'attendance' 
});
Student.hasMany(StudentAbsence, { 
  foreignKey: 'student_id', 
  as: 'absences' 
});
```

### Step 3: Verify Backend Routes

**File: `backend/Reference_documents/server.js`**

Ensure this is configured:

```javascript
// Models should be available to routes
const models = {
  Schedule,
  Student,
  StudentAbsence,
  Utilisateur,
  Classe,
  Matiere,
  Salle,
  Absence,
  Rattrapage,
  // ... other models
};

app.set('models', models);

// Register teacher routes
const teacherCalendarRoutes = require('./routes/TeacherCalendar');
app.use('/api/teacher', teacherCalendarRoutes);
```

### Step 4: Add Missing Endpoint

If not already present, add to `routes/Calendar.js` or create new:

```javascript
/**
 * GET /api/classes/:classId/students
 * Get all students in a class
 */
router.get('/classes/:classId/students', async (req, res) => {
  try {
    const { Classe, Student } = req.app.get('models');
    const classId = req.params.classId;
    
    // Find students through classe enrollment
    const students = await Student.findAll({
      include: [{
        model: Classe,
        where: { id: classId },
        attributes: [],
        through: { attributes: [] }
      }],
      attributes: ['id', 'nom', 'prenom', 'email', 'matricule']
    });
    
    res.json(students || []);
  } catch (error) {
    console.error('Error fetching class students:', error);
    res.status(500).json({ error: error.message });
  }
});
```

### Step 5: Restart Servers

```bash
# Backend
cd backend/Reference_documents
npm start

# Frontend  
cd frontend/learnflow
npm run dev
```

## ✅ Verification Steps

1. **Open Teacher Calendar**
   - Navigate to http://localhost:5173/calendar/teacher
   - Login as a teacher with lessons

2. **Test Marking Absences**
   - Click on a lesson
   - Click "Mark Absences" button
   - Verify students load
   - Mark different statuses
   - Submit form
   - Verify success message

3. **Test View Attendance**
   - Click on same lesson again
   - Click "View Attendance"
   - Verify marked records display
   - Test edit and delete
   - Export CSV

4. **Test Database**
   - Query StudentAbsence table
   - Verify records created correctly
   - Check timestamps

## 🛠️ API Endpoints Reference

### Mark Absences
```
POST /api/teacher/mark-student-absences
Content-Type: application/json
Authorization: Bearer {token}

{
  "schedule_id": 123,
  "absences": [
    {
      "student_id": 1,
      "absence_type": "absent",
      "motif": "Sick"
    }
  ]
}
```

### Get Attendance Records
```
GET /api/teacher/schedule/123/absences
Authorization: Bearer {token}
```

### Update Record
```
PUT /api/teacher/student-absence/{absenceId}
Content-Type: application/json
Authorization: Bearer {token}

{
  "absence_type": "excused",
  "motif": "Doctor's note"
}
```

### Delete Record
```
DELETE /api/teacher/student-absence/{absenceId}
Authorization: Bearer {token}
```

## 💡 Usage Tips

1. **Bulk Operations**: Use "Set All To" to quickly mark a large class
2. **Export Data**: Use CSV export for attendance reports
3. **Edit Anytime**: Records can be edited after creation
4. **Reasons**: Add reasons for excused/late absences for documentation
5. **Timestamps**: All records are timestamped for audit trail

## ❓ Troubleshooting

### Students Not Loading
- Check students are enrolled in the class
- Verify API endpoint `/api/classes/{classId}/students` works
- Check browser console for errors

### Can't Save Absences
- Verify you own the lesson (teacher authorization)
- Check authentication token is valid
- Ensure StudentAbsence table exists in database

### CSV Not Downloading
- Check browser allows downloads
- Verify attendance records exist
- Clear browser cache and try again

## 📚 Full Documentation

For complete details see:
- `STUDENT_ABSENCE_MARKING_FEATURE.md` - Comprehensive feature docs
- `STUDENT_ABSENCE_IMPLEMENTATION_CHECKLIST.md` - Setup checklist

## 🎓 Code Examples

### Mark Multiple Students Present
1. Click lesson → "Mark Absences"
2. Select "Present" in "Set All To" dropdown
3. Click "Apply"
4. All students marked present
5. Click "Save Attendance"

### Mark Some Absent with Reason
1. Click lesson → "Mark Absences"
2. For each absent student:
   - Set status to "Absent" 
   - Add reason "Sick leave" (or use bulk apply)
3. Click "Save Attendance"

### Export Attendance Report
1. Click lesson → "View Attendance"
2. Click "Export CSV"
3. File downloads: `attendance-{scheduleId}-{date}.csv`
4. Open in Excel for analysis

---

**Ready to use!** Teachers can now mark student absences directly from the calendar.

For support or issues, refer to the full documentation files.
