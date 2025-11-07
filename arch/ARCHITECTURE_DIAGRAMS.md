# 🏗️ Architecture & Flow Diagrams

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        LEARNFLOW CALENDAR                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   FRONTEND (React)                      │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │                                                         │   │
│  │  ┌────────────────────────────────────────────────┐   │   │
│  │  │     DragDropSchedule Component                 │   │   │
│  │  ├────────────────────────────────────────────────┤   │   │
│  │  │  • handleDragStart()                           │   │   │
│  │  │  • handleDragOver()                            │   │   │
│  │  │  • handleDrop()                                │   │   │
│  │  │  • findAvailableTimeSlot()                     │   │   │
│  │  └────────────────────────────────────────────────┘   │   │
│  │           ↓                         ↓                 │   │
│  │  ┌────────────────────┐  ┌─────────────────────────┐ │   │
│  │  │ DragDropSchedule   │  │  CalendarAPI Service    │ │   │
│  │  │      .css          │  │                         │ │   │
│  │  │ • Animations       │  │ • getSchedules()        │ │   │
│  │  │ • Styling          │  │ • dragDropSchedule()    │ │   │
│  │  │ • Responsive       │  │ • updateSchedule()      │ │   │
│  │  └────────────────────┘  └─────────────────────────┘ │   │
│  │                             ↓                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                         ↓ HTTP                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│              NETWORK LAYER (HTTP REST API)                      │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  PATCH /api/calendar/schedules/:id/drag-drop             │  │
│  │  PUT   /api/calendar/schedules/:id                       │  │
│  │  GET   /api/calendar/timeslots                           │  │
│  │  GET   /api/calendar/schedules                           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│                         ↓ Routing                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              BACKEND (Node.js/Express)                 │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │                                                         │   │
│  │  ┌────────────────────────────────────────────────┐   │   │
│  │  │  Calendar Router (Calendar.js)                 │   │   │
│  │  ├────────────────────────────────────────────────┤   │   │
│  │  │  • POST   /timeslots                           │   │   │
│  │  │  • GET    /timeslots                           │   │   │
│  │  │  • POST   /schedules                           │   │   │
│  │  │  • GET    /schedules                           │   │   │
│  │  │  • PUT    /schedules/:id        (existing)     │   │   │
│  │  │  • PATCH  /schedules/:id/drag-drop (NEW!)      │   │   │
│  │  │  • DELETE /schedules/:id                       │   │   │
│  │  └────────────────────────────────────────────────┘   │   │
│  │                     ↓                               │   │   │
│  │  ┌────────────────────────────────────────────────┐   │   │
│  │  │  Conflict Detection Logic                      │   │   │
│  │  ├────────────────────────────────────────────────┤   │   │
│  │  │  • checkScheduleConflicts()                    │   │   │
│  │  │    - Check class availability                  │   │   │
│  │  │    - Check room availability                   │   │   │
│  │  │    - Check teacher availability                │   │   │
│  │  └────────────────────────────────────────────────┘   │   │
│  │                     ↓                               │   │   │
│  │  ┌────────────────────────────────────────────────┐   │   │
│  │  │  Database Models (Sequelize)                   │   │   │
│  │  ├────────────────────────────────────────────────┤   │   │
│  │  │  • TimeSlot                                    │   │   │
│  │  │  • Schedule                                    │   │   │
│  │  │  • Classe                                      │   │   │
│  │  │  • Salle                                       │   │   │
│  │  │  • Matière                                     │   │   │
│  │  └────────────────────────────────────────────────┘   │   │
│  │                     ↓                               │   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│                         ↓ SQL                                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │           DATABASE (MySQL/PostgreSQL)                  │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │                                                         │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────┐   │   │
│  │  │  timeslots   │  │  schedules   │  │ classes    │   │   │
│  │  ├──────────────┤  ├──────────────┤  ├────────────┤   │   │
│  │  │ id           │  │ id           │  │ id         │   │   │
│  │  │ day_of_week  │  │ time_slot_id │  │ name       │   │   │
│  │  │ start_time   │  │ classe_id    │  │ niveau     │   │   │
│  │  │ end_time     │  │ matiere_id   │  └────────────┘   │   │
│  │  │ is_active    │  │ salle_id     │                   │   │
│  │  └──────────────┘  │ date_debut   │  ┌────────────┐   │   │
│  │                    │ statut       │  │  salles    │   │   │
│  │                    └──────────────┘  ├────────────┤   │   │
│  │                                      │ id         │   │   │
│  │                    ┌──────────────┐  │ nom        │   │   │
│  │                    │ matieres     │  │ capacite   │   │   │
│  │                    ├──────────────┤  └────────────┘   │   │
│  │                    │ id           │                   │   │
│  │                    │ name         │                   │   │
│  │                    └──────────────┘                   │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Drag & Drop Flow Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                    USER INTERACTION                          │
└──────────────────────────────────────────────────────────────┘

1. DRAG START
   ┌─────────────────────────┐
   │ User clicks & holds     │
   │ course card             │
   └────────────┬────────────┘
                │
                ▼
   ┌─────────────────────────┐
   │ handleDragStart()       │
   │ • Set dragged course    │
   │ • Set grab cursor       │
   │ • Update UI opacity     │
   └────────────┬────────────┘
                │
                ▼
   ┌─────────────────────────┐
   │ Visual Feedback         │
   │ • Show drag handle      │
   │ • Fade out card (0.5)   │
   │ • Rotate slightly       │
   └─────────────────────────┘

2. DRAG OVER
   ┌─────────────────────────┐
   │ User drags over         │
   │ target day              │
   └────────────┬────────────┘
                │
                ▼
   ┌─────────────────────────┐
   │ handleDragOver()        │
   │ • Allow drop effect     │
   │ • Highlight target day  │
   └────────────┬────────────┘
                │
                ▼
   ┌─────────────────────────┐
   │ Visual Feedback         │
   │ • Day column highlight  │
   │ • Blue border           │
   │ • Glow effect           │
   └─────────────────────────┘

3. DROP
   ┌─────────────────────────┐
   │ User releases mouse     │
   │ on target day           │
   └────────────┬────────────┘
                │
                ▼
   ┌─────────────────────────┐
   │ handleDrop()            │
   │ • Get target day        │
   │ • Find available slot   │
   │ • Prepare update data   │
   └────────────┬────────────┘
                │
                ▼
   ┌─────────────────────────────────────────┐
   │ Call API: dragDropSchedule()            │
   │ PATCH /schedules/:id/drag-drop          │
   │ Body: { time_slot_id: X, classe_id: Y } │
   └────────────┬────────────────────────────┘
                │
                ▼ HTTP Request
   
4. BACKEND PROCESSING
   ┌──────────────────────────────────────────┐
   │ Backend Router (Calendar.js)             │
   │ /schedules/:id/drag-drop (PATCH)        │
   └────────────┬─────────────────────────────┘
                │
                ▼
   ┌──────────────────────────────────────────┐
   │ Validate Input                           │
   │ • Schedule exists?                       │
   │ • Valid data?                            │
   └────────────┬─────────────────────────────┘
                │
                ▼
   ┌──────────────────────────────────────────┐
   │ Check for Conflicts                      │
   │ checkScheduleConflicts()                 │
   │ • Class available?                       │
   │ • Room available?                        │
   │ • Teacher available?                     │
   └────────────┬──────────────────┬──────────┘
                │                  │
        ┌───────▼────────┐   ┌─────▼────────────┐
        │ CONFLICT FOUND │   │ NO CONFLICTS ✓   │
        └───────┬────────┘   └─────┬────────────┘
                │                  │
                ▼                  ▼
        ┌──────────────┐  ┌──────────────────┐
        │ Return Error │  │ Update Database  │
        │ 409 Conflict │  │ • Update record  │
        └──────────────┘  │ • Fetch updated  │
                          └────────┬─────────┘
                                   │
                                   ▼
                          ┌──────────────────┐
                          │ Return Success   │
                          │ 200 OK + data    │
                          └────────┬─────────┘
                                   │

5. FRONTEND RESPONSE HANDLING
   ┌──────────────────────────────────────────┐
   │ Response received from backend           │
   └────────────┬─────────────────────────────┘
                │
        ┌───────┴────────┐
        │                │
    ┌───▼────────┐   ┌──▼──────────────┐
    │  ERROR?    │   │  SUCCESS?       │
    └───┬────────┘   └──┬──────────────┘
        │                │
        ▼                ▼
    ┌─────────┐    ┌──────────────────┐
    │ Revert  │    │ Update UI        │
    │ state   │    │ • Show success   │
    │ Show    │    │ • Refresh data   │
    │ error   │    │ • Clear state    │
    │ message │    │ • Show notif     │
    └─────────┘    └──────────────────┘

6. USER SEES RESULT
   ┌──────────────────────────────────────────┐
   │ Course moved to new day OR                │
   │ Course reverted with error message       │
   └──────────────────────────────────────────┘
```

---

## Component Hierarchy

```
DragDropSchedule (Main Component)
│
├── State Management
│   ├── draggedSchedule (dragged item)
│   ├── updating (loading state)
│   └── notification (messages)
│
├── Header Section
│   ├── Title
│   ├── Drag Hint (shows "Drag here" / "Drop here")
│   └── Refresh Button
│
├── Notification Component
│   ├── Success (green)
│   ├── Error (red)
│   └── Warning (yellow)
│
├── Schedule Grid (6 columns for 6 days)
│   │
│   ├── DayColumn (Lundi)
│   │   ├── DayHeader
│   │   │   ├── Day Name
│   │   │   └── Course Count
│   │   └── DaySchedule
│   │       ├── DragDropScheduleCard (Course 1)
│   │       ├── DragDropScheduleCard (Course 2)
│   │       └── ... (more courses)
│   │
│   ├── DayColumn (Mardi)
│   │   └── ... (same structure)
│   │
│   ├── DayColumn (Mercredi)
│   │   └── ... (same structure)
│   │
│   ├── DayColumn (Jeudi)
│   │   └── ... (same structure)
│   │
│   ├── DayColumn (Vendredi)
│   │   └── ... (same structure)
│   │
│   └── DayColumn (Samedi)
│       └── ... (same structure)
│
├── Each ScheduleCard Contains
│   ├── Drag Handle (⋮⋮)
│   ├── Card Header
│   │   ├── Time (HH:MM - HH:MM)
│   │   └── Type Badge (Cours/TD/TP/Examen)
│   ├── Card Body
│   │   ├── Subject Name
│   │   ├── Room Info
│   │   ├── Teacher ID
│   │   └── Notes
│   └── Card Footer
│       └── Status Badge
│
└── Info Section
    └── Usage Tips
```

---

## Data Flow Diagram

```
User Action
    │
    ▼
┌─────────────────┐
│ Drag Course     │
└────────┬────────┘
         │
         ▼
┌──────────────────────────────────┐
│ Frontend State Updated           │
│ draggedSchedule = courseObject   │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ Visual Feedback Applied          │
│ • Card opacity: 0.5              │
│ • Show drag handle               │
│ • Update cursor to grab          │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ User Drops on Target Day         │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ Find Available Time Slot         │
│ • Query timeslots for target day │
│ • Select first available slot    │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ Prepare API Payload              │
│ {                                │
│   time_slot_id: 5,              │
│   classe_id: 1,                 │
│   salle_id: 3                   │
│ }                                │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ Send PATCH Request               │
│ /api/calendar/schedules/1/       │
│ drag-drop                        │
└────────┬─────────────────────────┘
         │ HTTP
         ▼ (Network)
    
┌──────────────────────────────────┐
│ BACKEND                          │
│ • Validate schedule exists       │
│ • Check conflicts                │
│ • Update database                │
│ • Return updated schedule        │
└────────┬─────────────────────────┘
         │ Response
         ▼ with new data
    
┌──────────────────────────────────┐
│ Check Response Status            │
└────┬──────────────────────────┬──┘
     │                          │
  409 Error           200 Success
     │                          │
     ▼                          ▼
┌──────────────┐    ┌──────────────────────┐
│ Show Error   │    │ Update Frontend      │
│ Message:     │    │ • Update state       │
│ "Conflict    │    │ • Re-fetch schedule  │
│ detected"    │    │ • Clear dragged item │
│              │    │ • Show success notif │
│ Revert UI    │    │ • Clear updating     │
└──────────────┘    └──────────────────────┘
                            │
                            ▼
                    ┌──────────────────┐
                    │ UI Refreshed     │
                    │ Course visible   │
                    │ in new day       │
                    └──────────────────┘
```

---

## API Endpoint Interaction

```
Frontend Component
│
├─ GET /timeslots?day_of_week=Lundi&is_active=true
│  └─ Response: [TimeSlot1, TimeSlot2, ...]
│
├─ PATCH /schedules/:id/drag-drop
│  ├─ Request Body:
│  │  {
│  │    time_slot_id: 5,
│  │    classe_id: 1,
│  │    salle_id: 3
│  │  }
│  │
│  ├─ Server Processing:
│  │  ├─ Validate input
│  │  ├─ Check conflicts
│  │  │  ├─ Is class available?
│  │  │  ├─ Is room available?
│  │  │  └─ Is teacher available?
│  │  ├─ Update database if OK
│  │  └─ Return response
│  │
│  └─ Response:
│     └─ Success (200 OK):
│        {
│          message: "Planning déplacé avec succès",
│          data: {
│            id: 1,
│            time_slot_id: 5,
│            classe_id: 1,
│            matiere_id: 1,
│            salle_id: 3,
│            date_debut: "2025-01-15",
│            statut: "confirme",
│            timeSlot: {...},
│            classe: {...},
│            matiere: {...},
│            salle: {...}
│          }
│        }
│
│     OR Error (409 Conflict):
│        {
│          error: "Conflit détecté...",
│          conflicts: [
│            {
│              type: "classe",
│              message: "La classe a déjà..."
│            }
│          ]
│        }
│
└─ GET /schedules?classe_id=1
   └─ Response: [Schedule1, Schedule2, ...]
      (Used to refresh after successful move)
```

---

## State Management Flow

```
Initial State:
{
  draggedSchedule: null,
  updating: false,
  notification: null,
  schedules: [],
  timeSlots: {},
  loading: true,
  error: null
}

User drags course:
{
  draggedSchedule: { id: 1, ... },  ← CHANGED
  updating: false,
  notification: null,
  ...
}

User drops, API called:
{
  draggedSchedule: { id: 1, ... },
  updating: true,               ← CHANGED
  notification: null,
  ...
}

Server returns success:
{
  draggedSchedule: null,        ← CLEARED
  updating: false,              ← CHANGED
  notification: {               ← CHANGED
    message: "Cours déplacé...",
    type: "success"
  },
  schedules: [...updated...],   ← CHANGED
  ...
}

After 3 seconds:
{
  draggedSchedule: null,
  updating: false,
  notification: null,           ← AUTO-CLEARED
  schedules: [...updated...],
  ...
}
```

---

**Status**: ✅ Complete  
**Last Updated**: November 5, 2025
