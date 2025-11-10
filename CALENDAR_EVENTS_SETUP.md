# 📅 Calendar Events - Quick Setup Guide

## Overview
This guide will help you set up and view course schedules in the calendar at: `http://localhost:5173/calendar/events`

## Prerequisites
1. Backend server running on port 3000
2. Frontend running on port 5173
3. Database with proper schema setup

## Setup Steps

### Step 1: Start the Backend Server
```bash
cd backend/Reference_documents
node server.js
```

The server should start on port 3000 and create the necessary tables.

### Step 2: Initialize Time Slots (if not already done)
```bash
cd backend/scripts
node initCalendar.js
```

This creates default time slots for the week (Monday to Saturday, 4 slots per day).

### Step 3: Add Sample Schedules
```bash
cd backend/scripts
node addSampleSchedules.js
```

This will create sample course schedules that will appear in the calendar.

### Step 4: View the Calendar
Open your browser and navigate to:
```
http://localhost:5173/calendar/events
```

## Features

### Calendar Display
- **Monthly View**: See all courses for the current month
- **Color Coding**: 
  - 🔵 Blue = Cours (Lecture)
  - 🟡 Yellow = TD (Tutorial)
  - 🟢 Green = TP (Lab Work)
  - 🔴 Red = Examen (Exam)
  - ⚪ Gray = Soutien (Support)

### Course Information
Each calendar entry shows:
- Time slot (e.g., 08:00 - 10:00)
- Subject name
- Class name

## API Endpoints

### Get All Schedules
```
GET http://localhost:3000/api/calendar/schedules
```

### Get Schedules with Filters
```
GET http://localhost:3000/api/calendar/schedules?classe_id=1
GET http://localhost:3000/api/calendar/schedules?matiere_id=2
GET http://localhost:3000/api/calendar/schedules?date=2025-01-15
```

### Create a New Schedule
```
POST http://localhost:3000/api/calendar/schedules
Content-Type: application/json

{
  "time_slot_id": 1,
  "classe_id": 1,
  "matiere_id": 1,
  "salle_id": 1,
  "date_debut": "2025-01-01",
  "date_fin": "2025-06-30",
  "type_cours": "Cours",
  "recurrence": "hebdomadaire",
  "statut": "confirme"
}
```

## Troubleshooting

### No Courses Showing?
1. Check if backend server is running: `http://localhost:3000/api/calendar/schedules`
2. Verify schedules exist in database
3. Check browser console for errors
4. Ensure CORS is enabled on backend

### Backend Not Starting?
1. Check database connection in `backend/auth-service/config/index.js`
2. Ensure PostgreSQL is running
3. Check for port conflicts (port 3000)

### Frontend Not Displaying?
1. Check if frontend is running on port 5173
2. Open browser developer tools (F12) and check console
3. Verify API URL in `EventCalendar.jsx` (should be `http://localhost:3000`)

## Manual Schedule Creation

If you want to create schedules manually through the UI:

1. Go to Calendar Dashboard: `http://localhost:5173/calendar`
2. Click on "Planning des Cours"
3. Fill in the form with course details
4. Submit to create

## Data Requirements

For schedules to display properly, you need:
- ✅ Time slots created (Monday-Saturday, 4 slots each)
- ✅ At least one class (Classe)
- ✅ At least one subject (Matière)
- ✅ At least one schedule entry
- ⚠️ Optional: Rooms (Salle) and teachers

## Testing with Sample Data

The `addSampleSchedules.js` script creates 10 sample schedules using:
- Existing classes in the database
- Existing subjects (matières)
- Available time slots
- Random teacher IDs

## Architecture

```
Frontend (React)
    ↓
EventCalendar.jsx
    ↓
Fetch: http://localhost:3000/api/calendar/schedules
    ↓
Backend (Express)
    ↓
Calendar.js (Routes)
    ↓
Schedule Model
    ↓
PostgreSQL Database
```

## Need Help?

- Check the main documentation: `arch/DOCUMENTATION_INDEX.md`
- Calendar API guide: `arch/CALENDAR_CRUD_COMPLETE.md`
- Quick start: `arch/QUICK_START_CALENDAR.md`
