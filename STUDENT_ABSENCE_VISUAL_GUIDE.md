# Student Absence Marking - Visual Guide & Workflow Diagrams

## 🎯 Feature Overview Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     TEACHER CALENDAR                             │
│                   /calendar/teacher                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                   Click on Lesson Cell
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              SESSION DETAILS MODAL                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Subject: Mathematics                                    │   │
│  │ Class: 2A                                               │   │
│  │ Room: 101                                               │   │
│  │ Time: 08:00 - 09:30                                     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌────────────────┐ ┌────────────────────┐ ┌──────────────┐   │
│  │ Mark Absences  │ │ View Attendance    │ │ Declare      │   │
│  │     [NEW]      │ │      [NEW]         │ │ Absence      │   │
│  └────────────────┘ └────────────────────┘ └──────────────┘   │
└─────────────────────────────────────────────────────────────────┘
           │                              │
           │                              │
           ▼                              ▼
    ┌──────────────────┐         ┌──────────────────────┐
    │ MARK ABSENCES    │         │ VIEW ATTENDANCE      │
    │ MODAL [NEW]      │         │ MODAL [NEW]          │
    │                  │         │                      │
    │ • Students list  │         │ • Statistics         │
    │ • Select status  │         │ • Records table      │
    │ • Add reasons    │         │ • Edit function      │
    │ • Bulk ops       │         │ • Delete function    │
    │ • Statistics     │         │ • CSV export         │
    └──────────────────┘         └──────────────────────┘
           │                              │
           └──────────────┬───────────────┘
                          │
                          ▼
            ┌─────────────────────────┐
            │  STUDENT_ABSENCE TABLE  │
            │  (Database)             │
            │  • Attendance Records   │
            │  • Timestamps           │
            │  • Reasons/Motif        │
            └─────────────────────────┘
```

## 📊 Mark Absences Workflow

```
┌─────────────────────────────────────────────────────────────┐
│         STUDENT ABSENCE MODAL - MARK ABSENCES               │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Session Info:                                               │
│  Math - Class 2A - Room 101 - 08:00-09:30                   │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│  STATISTICS:  ✓ Present: 0   ✗ Absent: 0                   │
│               ⚠ Excused: 0   🕒 Late: 0                    │
│               ⏱ Left Early: 0                               │
├─────────────────────────────────────────────────────────────┤
│  BULK ACTIONS:                                              │
│  Set All To: [Dropdown: Present ▼] [Apply]                │
│  Global Reason: [TextArea] [Apply Reason]  [Reset All]    │
├─────────────────────────────────────────────────────────────┤
│  STUDENTS TABLE:                                             │
│  ┌──────────────────┬──────────────┬────────────────┐       │
│  │ Student          │ Status       │ Reason         │       │
│  ├──────────────────┼──────────────┼────────────────┤       │
│  │ Ahmed Ali        │ [Dropdown ▼] │ [TextArea]     │       │
│  │ Fatima Hassan    │ [Dropdown ▼] │ [TextArea]     │       │
│  │ Mohammed Karim   │ [Dropdown ▼] │ [TextArea]     │       │
│  │ Zainab Sara      │ [Dropdown ▼] │ [TextArea]     │       │
│  │ ...              │ ...          │ ...            │       │
│  └──────────────────┴──────────────┴────────────────┘       │
│                                                               │
│  [Cancel]                        [Save Attendance]          │
└─────────────────────────────────────────────────────────────┘
```

## 👁️ View Attendance Workflow

```
┌──────────────────────────────────────────────────────────────┐
│      STUDENT ATTENDANCE VIEWER - VIEW ATTENDANCE             │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  STATISTICS:                                                  │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐    │
│  │ 👥  │ │ ✓    │ │ ✗    │ │ ⚠    │ │ 🕒   │ │ ⏱    │    │
│  │ 30  │ │ 28   │ │ 1    │ │ 1    │ │ 0    │ │ 0    │    │
│  │Total│ │Pres. │ │Abs.  │ │Exc.  │ │Late  │ │Left  │    │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘    │
├──────────────────────────────────────────────────────────────┤
│  ATTENDANCE RECORDS:                                          │
│  ┌──────────────┬────────────┬──────────┬─────────┬────────┐ │
│  │ Student      │ Email      │ Status   │ Reason  │ Action │ │
│  ├──────────────┼────────────┼──────────┼─────────┼────────┤ │
│  │ Ahmed Ali    │ a@email.com│ ✓Present │ —       │ ✏️ 🗑️ │ │
│  │ Fatima H.    │ f@email.com│ ✓Present │ —       │ ✏️ 🗑️ │ │
│  │ Mohammed K.  │ m@email.com│ ✗Absent  │ Sick    │ ✏️ 🗑️ │ │
│  │ Zainab S.    │ z@email.com│ ⚠Excused │ Doctor  │ ✏️ 🗑️ │ │
│  │ ...          │ ...        │ ...      │ ...     │ ...    │ │
│  └──────────────┴────────────┴──────────┴─────────┴────────┘ │
│                                                                │
│  [Close] [Refresh] [Export CSV]                             │
└──────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow Diagram

```
┌─────────────────────┐
│  TEACHER CALENDAR   │
│   Component         │
└──────────┬──────────┘
           │
           │ Click Lesson
           ▼
┌─────────────────────────────────────────────┐
│  SESSION DETAILS MODAL                      │
│  - Shows lesson info                        │
│  - 2 new buttons: Mark Absences, View       │
└──────────────┬──────────────────────────────┘
               │
        ┌──────┴──────┐
        │             │
        ▼             ▼
  ┌──────────────┐  ┌──────────────────┐
  │ MARK MODAL   │  │ VIEWER MODAL     │
  └──────┬───────┘  └────────┬─────────┘
         │                   │
         │                   │
         ▼                   ▼
    POST REQUEST         GET REQUEST
    Mark Absences        Get Records
         │                   │
         ▼                   ▼
    ┌────────────────────────────────┐
    │  BACKEND ROUTES                │
    │  TeacherCalendar.js            │
    └────────────────────────────────┘
         │                   │
         ▼                   ▼
    ┌────────────────────────────────┐
    │  DATABASE                      │
    │  student_absence table         │
    └────────────────────────────────┘
```

## 🎨 Component Hierarchy

```
TeacherCalendar
│
├─ StudentAbsenceModal
│  ├─ Form
│  ├─ Table (Students)
│  ├─ Statistics Cards
│  └─ Bulk Operation Controls
│
├─ StudentAttendanceViewer
│  ├─ Statistics Dashboard
│  ├─ Table (Attendance Records)
│  ├─ Edit Modal
│  └─ Export Button
│
└─ (Updated) Session Details Modal
   ├─ Mark Absences Button → StudentAbsenceModal
   └─ View Attendance Button → StudentAttendanceViewer
```

## 📱 Absence Types Reference

```
Status Types:

┌──────────────┬──────────────┬────────────────────────┐
│ Status       │ Icon & Color │ Use Case               │
├──────────────┼──────────────┼────────────────────────┤
│ Present      │ ✓ GREEN      │ Student attended       │
│ Absent       │ ✗ RED        │ Student was absent     │
│ Excused      │ ⚠ ORANGE     │ Absence with reason    │
│ Late         │ 🕒 BLUE      │ Student arrived late   │
│ Left Early   │ ⏱ PURPLE     │ Left before end        │
└──────────────┴──────────────┴────────────────────────┘
```

## 🔐 Security & Authorization Flow

```
┌──────────────────────────────────────┐
│  User Request with JWT Token         │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  Verify Token & Extract Teacher ID   │
│  getTeacherIdFromRequest()           │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  Check: Teacher owns the Schedule    │
│  Schedule.enseignant_id === teacerId │
└──────────────┬───────────────────────┘
               │
        ┌──────┴──────┐
        │             │
   YES  ▼             ▼  NO
  ┌────────────┐  ┌─────────┐
  │ PROCEED    │  │ DENY    │
  │ (201/200)  │  │ (403)   │
  └────────────┘  └─────────┘
```

## 📊 Database Schema Visualization

```
SCHEDULE                          STUDENT_ABSENCE              STUDENT
┌─────────────────┐              ┌──────────────────┐         ┌──────────────┐
│ id (PK)         │◄─FK──────────│ schedule_id      │         │ id (PK)      │
│ enseignant_id   │              │ student_id (FK)──────FK────►│ nom          │
│ classe_id       │              │ enseignant_id    │         │ prenom       │
│ matiere_id      │              │ absence_type     │         │ email        │
│ start_time      │              │ motif            │         │ matricule    │
│ end_time        │              │ marked_at        │         └──────────────┘
│ date_debut      │              │ notes            │
│ date_fin        │              │ statut           │
│ type_cours      │              │ createdAt        │
└─────────────────┘              │ updatedAt        │
                                 │ UNIQUE(sch,stud) │
                                 └──────────────────┘
```

## 🚀 Deployment Architecture

```
┌─────────────────────────────────────────────┐
│         Production Environment              │
├─────────────────────────────────────────────┤
│                                              │
│  FRONTEND (React/Vite)                      │
│  ├─ TeacherCalendar.jsx                    │
│  ├─ StudentAbsenceModal.jsx (NEW)          │
│  └─ StudentAttendanceViewer.jsx (NEW)      │
│                                              │
│  BACKEND (Node.js/Express)                 │
│  ├─ routes/TeacherCalendar.js (UPDATED)   │
│  ├─ models/StudentAbsence.js (NEW)        │
│  └─ Authentication Middleware              │
│                                              │
│  DATABASE (MySQL)                          │
│  └─ referentiels.student_absence (NEW)    │
│                                              │
│  CACHE (Optional)                          │
│  └─ Redis (for performance)               │
│                                              │
└─────────────────────────────────────────────┘
```

## 📈 User Journey Map

```
BEFORE Feature              AFTER Feature
─────────────────────────────────────────────────
│                           │
├─ View Calendar       ────►├─ View Calendar
│                           │
├─ Click on Lesson     ────►├─ Click on Lesson
│                           │
├─ View Details        ────►├─ View Details
│                           ├─ NEW: "Mark Absences"
│                           ├─ NEW: "View Attendance"
│                           │
├─ Limited Actions     ────►├─ Full Attendance Mgmt
│  (only teacher         │   ✓ Mark individual
│   absence)             │   ✓ Bulk operations
│                        │   ✓ Edit records
│                        │   ✓ Export data
│                        │
└─ Declare Absence ───────►└─ Declare Absence
                           │  (unchanged)
                           │
```

## 💾 Data State Transitions

```
Session Opened
    │
    ▼
┌─────────────────────────┐
│ Initial State           │
│ • Students loaded       │
│ • All set to "present"  │
│ • Stats: 0,0,0,0,0      │
└────────────┬────────────┘
             │
    Teacher marks students
             │
             ▼
┌─────────────────────────┐
│ Updated State           │
│ • Statuses changed      │
│ • Reasons added         │
│ • Stats updated         │
└────────────┬────────────┘
             │
    Teacher clicks Save
             │
             ▼
┌─────────────────────────┐
│ Submitted to Backend    │
│ • API Call              │
│ • Validation            │
│ • Database Save         │
└────────────┬────────────┘
             │
    Success/Error Response
             │
             ▼
┌─────────────────────────┐
│ Records Persisted       │
│ • In Database           │
│ • Can be edited later   │
│ • Can be viewed         │
│ • Can be exported       │
└─────────────────────────┘
```

## 🎯 Feature Checklist Visual

```
Frontend Development:
  [✓] StudentAbsenceModal component
  [✓] StudentAbsenceModal CSS
  [✓] StudentAttendanceViewer component
  [✓] StudentAttendanceViewer CSS
  [✓] TeacherCalendar integration

Backend Development:
  [✓] StudentAbsence model
  [✓] API endpoints (4)
  [✓] Authorization checks
  [✓] Error handling

Documentation:
  [✓] Feature documentation
  [✓] Quick start guide
  [✓] Implementation checklist
  [✓] Delivery summary

Integration Tasks (TODO):
  [ ] Update models/index.js
  [ ] Update server.js
  [ ] Create database table
  [ ] Add class students endpoint
  [ ] Test all functionality
  [ ] Deploy to production
```

---

**This visual guide helps understand the complete flow, architecture, and implementation of the Student Absence Marking Feature.**

For detailed technical documentation, see the accompanying markdown files.
