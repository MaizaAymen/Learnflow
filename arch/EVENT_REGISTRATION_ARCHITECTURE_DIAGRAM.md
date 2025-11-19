# Student Event Registration - System Architecture

## Component Interaction Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  │  EventsViewer    │  │ Student Dashboard│  │ EventsManagement │
│  │  /events         │  │ /student/events  │  │ /admin/events    │
│  ├──────────────────┤  ├──────────────────┤  ├──────────────────┤
│  │ • Browse events  │  │ • View my events │  │ • Create events  │
│  │ • Join event     │  │ • See upcoming   │  │ • Edit events    │
│  │ • Leave event    │  │ • See past       │  │ • Delete events  │
│  │ • Register btn   │  │ • Unsubscribe    │  │ • Set visibility │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘
│           │                      │                      │
│           │ Uses EventsAPI       │                      │
│           └──────────────────────┼──────────────────────┘
│                                  │
└──────────────────────────────────┼──────────────────────────────┘
                                   │
                    ┌──────────────▼───────────────┐
                    │     EventsAPI Service        │
                    ├──────────────────────────────┤
                    │ • joinEvent()                │
                    │ • leaveEvent()               │
                    │ • getStudentEvents()         │
                    │ • checkRegistration()        │
                    │ • getEvents()                │
                    │ • createEvent()              │
                    │ • updateEvent()              │
                    │ • deleteEvent()              │
                    └──────────────┬───────────────┘
                                   │
                HTTP/JSON (Port 3004)
                                   │
┌──────────────────────────────────┼──────────────────────────────┐
│              BACKEND (Node.js/Express)                           │
├──────────────────────────────────┼──────────────────────────────┤
│                                  │                              │
│  ┌────────────────────────────────▼────────────────────────────┐│
│  │                    Routes Layer                             ││
│  ├────────────────────────────────────────────────────────────┤│
│  │ POST   /join              (joinEvent handler)              ││
│  │ POST   /leave             (leaveEvent handler)             ││
│  │ GET    /check-registration (checkRegistration handler)     ││
│  │ GET    /student/:id       (getStudentEvents handler)       ││
│  │ + CRUD endpoints (existing)                                ││
│  └────────────────────────────────────────────────────────────┘│
│                            │                                    │
│  ┌────────────────────────────────────────────────────────────┐│
│  │              Controllers Layer                             ││
│  ├────────────────────────────────────────────────────────────┤│
│  │ joinEvent()                                                ││
│  │   • Create EventRegistration                              ││
│  │   • Check duplicate                                       ││
│  │   • Return registration                                   ││
│  │                                                            ││
│  │ leaveEvent()                                              ││
│  │   • Update status to 'cancelled'                          ││
│  │   • Return success                                        ││
│  │                                                            ││
│  │ getStudentEvents()                                        ││
│  │   • Query EventRegistration with status='registered'     ││
│  │   • Include related Event data                            ││
│  │   • Return array                                          ││
│  │                                                            ││
│  │ checkRegistration()                                       ││
│  │   • Query EventRegistration table                         ││
│  │   • Return boolean flag                                   ││
│  └────────────────────────────────────────────────────────────┘│
│                            │                                    │
│  ┌────────────────────────────────────────────────────────────┐│
│  │            Sequelize ORM Layer                            ││
│  ├────────────────────────────────────────────────────────────┤│
│  │ • Event Model      (existing)                             ││
│  │ • EventRegistration Model (NEW)                           ││
│  │ • Relationships & Validations                             ││
│  └────────────────────────────────────────────────────────────┘│
│                            │                                    │
└────────────────────────────┼────────────────────────────────────┘
                             │
             PostgreSQL (auth_service database)
                             │
┌────────────────────────────▼────────────────────────────────────┐
│              DATABASE LAYER (PostgreSQL)                         │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  SCHEMA: referentiels                                            │
│                                                                   │
│  ┌──────────────────────────────┐ ┌──────────────────────────┐  │
│  │  Events Table                │ │ EventRegistrations Table │  │
│  ├──────────────────────────────┤ ├──────────────────────────┤  │
│  │ id (PK)                      │ │ id (PK)                  │  │
│  │ title                        │ │ event_id (FK)────────┐   │  │
│  │ type (ENUM)                  │ │ student_id           │   │  │
│  │ visibility (ENUM)            │ │ status (ENUM)        │   │  │
│  │ description                  │ │ registered_at        │   │  │
│  │ start_date                   │ │ createdAt            │   │  │
│  │ end_date                     │ │ updatedAt            │   │  │
│  │ is_all_day                   │ │                      │   │  │
│  │ departement_id               │ │ UNIQUE(event_id,     │   │  │
│  │ created_by                   │ │         student_id)  │   │  │
│  │ metadata (JSONB)             │ │                      │   │  │
│  │ createdAt                    │ └──────────────────────┼───┘  │
│  │ updatedAt                    │                        │       │
│  └──────────────────────────────┘                        │       │
│         │                                                 │       │
│         └─────────────────────────────────────────────────┘       │
│         (One-to-Many Relationship with CASCADE DELETE)           │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

## Data Flow: Student Joins Event

```
Student clicks "Participer"
         │
         ▼
EventsViewer.handleJoinEvent()
         │
         ├─ Check: currentUser?.id exists
         │   (if not → show warning + return)
         │
         ├─ Call: eventsAPI.joinEvent(eventId, studentId)
         │
         ▼
Frontend EventsAPI.joinEvent()
  POST /api/events/{eventId}/join
  Body: { student_id: studentId }
         │
         ▼
Backend eventsController.joinEvent()
  ├─ Extract: event_id, student_id
  ├─ Try: Create EventRegistration
  │   • INSERT into EventRegistrations table
  │   • Sequelize enforces UNIQUE constraint
  │
  ├─ Success:
  │   └─ Return: { success: true, registration: {...} }
  │
  └─ Error (duplicate):
      └─ Return: { error: "Already registered" }
         │
         ▼
Frontend updates state:
  ├─ setRegistrationStatus[eventId] = true
  ├─ setRegistering[eventId] = false
  ├─ Show success message
  └─ Button changes from "Participer" to "Se désinscrire"

Database now has:
  EventRegistrations: {
    event_id: <event_uuid>,
    student_id: <student_uuid>,
    status: 'registered',
    registered_at: <now>
  }
```

## Data Flow: Student Views "Mes Événements"

```
Student navigates to /student/events
         │
         ▼
EventsStudentDashboard component mounts
         │
         ├─ useEffect: fetchCurrentUser()
         │   • Call auth service for user info
         │   • Set currentUser state
         │
         ├─ useEffect: fetchStudentEvents()
         │   • Call eventsAPI.getStudentEvents(userId)
         │
         ▼
Frontend EventsAPI.getStudentEvents(studentId)
  GET /api/events/student/{studentId}
         │
         ▼
Backend eventsController.getStudentEvents()
  ├─ Query: EventRegistration.findAll({
  │   where: { student_id, status: 'registered' },
  │   include: [{ model: Event, as: 'event' }]
  │ })
  │
  ├─ Loop: For each registration, include full Event data
  │
  ├─ Return: [{
  │   registration: {...},
  │   event: {...},
  │   registered_at: <date>
  │ }]
  │
  ▼
Frontend receives events array
  ├─ Split into: upcoming (start_date > now) & past
  ├─ Render two sections:
  │   • "Événements à venir"
  │   • "Événements passés"
  │
  └─ Each event has "Se désinscrire" button

Student sees dashboard with registered events!
```

## Data Flow: Student Leaves Event

```
Student clicks "Se désinscrire"
         │
         ▼
Show confirmation Modal
  "Êtes-vous sûr de vouloir vous désinscrire?"
         │
         ├─ Cancel → Nothing happens
         │
         └─ OK (onOk callback):
             │
             ▼
         handleLeaveEvent(event)
             │
             ├─ Set registering[eventId] = true
             ├─ Call: eventsAPI.leaveEvent(eventId, studentId)
             │
             ▼
         Frontend EventsAPI.leaveEvent()
           POST /api/events/{eventId}/leave
           Body: { student_id: studentId }
             │
             ▼
         Backend eventsController.leaveEvent()
           ├─ Query: EventRegistration.update({
           │   status: 'cancelled'
           │ }, {
           │   where: { event_id, student_id }
           │ })
           │
           ├─ Return: { success: true }
             │
             ▼
         Frontend updates state:
           ├─ setRegistrationStatus[eventId] = false
           ├─ Show success message
           ├─ Button changes back to "Participer"
           ├─ Remove from dashboard list (if on dashboard)
             │
             ▼
         Database updated:
           EventRegistrations: {
             status: 'cancelled' (not deleted!)
           }
```

## State Management Flow

```
EventsViewer Component State:
├─ events: []
├─ registrationStatus: { eventId: boolean, ... }
├─ registering: { eventId: boolean, ... } (loading)
├─ currentUser: { id, name, email, ... }
├─ selectedEvent: { id, title, ... }
├─ drawerVisible: boolean
└─ filters: { visibility, type, ... }

EventsStudentDashboard Component State:
├─ events: []
├─ upcomingEvents: []
├─ pastEvents: []
├─ currentUser: { id, name, email, ... }
├─ loading: boolean
├─ selectedEvent: { id, title, ... }
└─ drawerVisible: boolean
```

## Validation & Error Handling

```
Frontend Validation:
├─ User must be logged in
├─ Event must exist
├─ Current user must have ID
└─ Show loading state during requests

Backend Validation:
├─ Unique constraint on (event_id, student_id)
├─ Foreign key constraint on event_id
├─ Status enum validation
├─ Student_id is required
└─ Return appropriate HTTP status codes
   • 201: Created (join)
   • 200: OK (leave, check)
   • 409: Conflict (duplicate registration)
   • 404: Not found (event/student)
   • 500: Server error

Database Validation:
├─ event_id must reference valid Event
├─ status must be in ['registered', 'cancelled']
├─ Cannot have duplicate (event_id, student_id)
└─ Cascade delete if Event deleted
```

## Key Design Decisions

1. **Soft Delete via Status Column**
   - Instead of deleting EventRegistration, mark as 'cancelled'
   - Preserves history for analytics
   - Can be un-cancelled if needed

2. **Unique Constraint**
   - Prevents duplicate registrations at database level
   - No need for manual duplicate checking in code
   - Enforced by database, not just application logic

3. **One-to-Many Relationship**
   - Event can have many registrations
   - EventRegistration belongs to one Event
   - CASCADE delete keeps referential integrity

4. **Separation of Concerns**
   - EventsViewer: Public event browsing & registration UI
   - EventsStudentDashboard: Student's personal event list
   - Both use same EventsAPI service
   - Admin uses separate EventsManagement component

5. **Real-time State Updates**
   - No page refresh needed after join/leave
   - State updates immediately in UI
   - Database changes reflected in next fetch

---

**Architecture Version**: 1.0  
**Last Updated**: 2024  
**Status**: Complete
