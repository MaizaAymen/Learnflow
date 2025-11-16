# Timetable Management Quick Start Script

Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "  Learnflow Timetable Management" -ForegroundColor Cyan
Write-Host "  Quick Start Guide" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

$choice = Read-Host "What would you like to do?
1. Start Backend Services (Auth + Reference)
2. Start Frontend Development Server
3. Start Everything (All Services)
4. View Access URLs
5. Run Database Time Slot Setup
Enter your choice (1-5)"

switch ($choice) {
    "1" {
        Write-Host "`nStarting Backend Services..." -ForegroundColor Green
        Write-Host "Opening two terminals for backend services..." -ForegroundColor Yellow
        
        # Auth Service
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'c:\Users\aymen\Desktop\learflow (1)\Learnflow\backend\auth-service'; Write-Host 'Starting Auth Service on port 4000...' -ForegroundColor Green; node server.js"
        
        Start-Sleep -Seconds 2
        
        # Reference Service
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'c:\Users\aymen\Desktop\learflow (1)\Learnflow\backend\Reference_documents'; Write-Host 'Starting Reference Service on port 3000...' -ForegroundColor Green; node server.js"
        
        Write-Host "`n✅ Backend services are starting..." -ForegroundColor Green
        Write-Host "Auth Service: http://localhost:4000" -ForegroundColor Cyan
        Write-Host "Reference Service: http://localhost:3000" -ForegroundColor Cyan
    }
    "2" {
        Write-Host "`nStarting Frontend Development Server..." -ForegroundColor Green
        cd "c:\Users\aymen\Desktop\learflow (1)\Learnflow\frontend\learnflow"
        Write-Host "Frontend will be available at: http://localhost:5173" -ForegroundColor Cyan
        npm run dev
    }
    "3" {
        Write-Host "`nStarting All Services..." -ForegroundColor Green
        
        # Auth Service
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'c:\Users\aymen\Desktop\learflow (1)\Learnflow\backend\auth-service'; Write-Host 'Starting Auth Service on port 4000...' -ForegroundColor Green; node server.js"
        
        Start-Sleep -Seconds 2
        
        # Reference Service
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'c:\Users\aymen\Desktop\learflow (1)\Learnflow\backend\Reference_documents'; Write-Host 'Starting Reference Service on port 3000...' -ForegroundColor Green; node server.js"
        
        Start-Sleep -Seconds 3
        
        # Frontend
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'c:\Users\aymen\Desktop\learflow (1)\Learnflow\frontend\learnflow'; Write-Host 'Starting Frontend on port 5173...' -ForegroundColor Green; npm run dev"
        
        Write-Host "`n✅ All services are starting..." -ForegroundColor Green
        Write-Host "`nAccess URLs:" -ForegroundColor Yellow
        Write-Host "- Auth Service: http://localhost:4000" -ForegroundColor Cyan
        Write-Host "- Reference Service: http://localhost:3000" -ForegroundColor Cyan
        Write-Host "- Frontend: http://localhost:5173" -ForegroundColor Cyan
        Write-Host "`nTimetable URLs:" -ForegroundColor Yellow
        Write-Host "- Monthly View: http://localhost:5173/calendar/timetable-manager" -ForegroundColor Cyan
        Write-Host "- Weekly View: http://localhost:5173/calendar/weekly-view" -ForegroundColor Cyan
    }
    "4" {
        Write-Host "`n=======================================" -ForegroundColor Cyan
        Write-Host "  Access URLs" -ForegroundColor Cyan
        Write-Host "=======================================" -ForegroundColor Cyan
        Write-Host "`nBackend Services:" -ForegroundColor Yellow
        Write-Host "- Auth Service: http://localhost:4000" -ForegroundColor White
        Write-Host "- Reference/Calendar Service: http://localhost:3000" -ForegroundColor White
        Write-Host "`nFrontend:" -ForegroundColor Yellow
        Write-Host "- Main App: http://localhost:5173" -ForegroundColor White
        Write-Host "`nTimetable Management:" -ForegroundColor Yellow
        Write-Host "- Monthly Calendar: http://localhost:5173/calendar/timetable-manager" -ForegroundColor White
        Write-Host "- Weekly View: http://localhost:5173/calendar/weekly-view" -ForegroundColor White
        Write-Host "- Admin Timetable: http://localhost:5173/admin/timetable" -ForegroundColor White
        Write-Host "`nOther Calendar Routes:" -ForegroundColor Yellow
        Write-Host "- Calendar Dashboard: http://localhost:5173/calendar/dashboard" -ForegroundColor White
        Write-Host "- Time Slots: http://localhost:5173/calendar/timeslots" -ForegroundColor White
        Write-Host "- Enhanced Viewer: http://localhost:5173/calendar/timetable" -ForegroundColor White
        Write-Host ""
    }
    "5" {
        Write-Host "`nTime Slot Setup Instructions:" -ForegroundColor Yellow
        Write-Host "Run this SQL in your PostgreSQL database:" -ForegroundColor Cyan
        Write-Host ""
        Write-Host @"
-- Create sample time slots for the week
INSERT INTO referentiels.time_slot (day_of_week, start_time, end_time, description, is_active) VALUES
-- Monday
('Lundi', '08:00:00', '09:30:00', 'Première séance', true),
('Lundi', '09:45:00', '11:15:00', 'Deuxième séance', true),
('Lundi', '11:30:00', '13:00:00', 'Troisième séance', true),
('Lundi', '14:00:00', '15:30:00', 'Quatrième séance', true),
('Lundi', '15:45:00', '17:15:00', 'Cinquième séance', true),
('Lundi', '17:30:00', '19:00:00', 'Sixième séance', true),

-- Tuesday
('Mardi', '08:00:00', '09:30:00', 'Première séance', true),
('Mardi', '09:45:00', '11:15:00', 'Deuxième séance', true),
('Mardi', '11:30:00', '13:00:00', 'Troisième séance', true),
('Mardi', '14:00:00', '15:30:00', 'Quatrième séance', true),
('Mardi', '15:45:00', '17:15:00', 'Cinquième séance', true),
('Mardi', '17:30:00', '19:00:00', 'Sixième séance', true),

-- Wednesday
('Mercredi', '08:00:00', '09:30:00', 'Première séance', true),
('Mercredi', '09:45:00', '11:15:00', 'Deuxième séance', true),
('Mercredi', '11:30:00', '13:00:00', 'Troisième séance', true),
('Mercredi', '14:00:00', '15:30:00', 'Quatrième séance', true),
('Mercredi', '15:45:00', '17:15:00', 'Cinquième séance', true),
('Mercredi', '17:30:00', '19:00:00', 'Sixième séance', true),

-- Thursday
('Jeudi', '08:00:00', '09:30:00', 'Première séance', true),
('Jeudi', '09:45:00', '11:15:00', 'Deuxième séance', true),
('Jeudi', '11:30:00', '13:00:00', 'Troisième séance', true),
('Jeudi', '14:00:00', '15:30:00', 'Quatrième séance', true),
('Jeudi', '15:45:00', '17:15:00', 'Cinquième séance', true),
('Jeudi', '17:30:00', '19:00:00', 'Sixième séance', true),

-- Friday
('Vendredi', '08:00:00', '09:30:00', 'Première séance', true),
('Vendredi', '09:45:00', '11:15:00', 'Deuxième séance', true),
('Vendredi', '11:30:00', '13:00:00', 'Troisième séance', true),
('Vendredi', '14:00:00', '15:30:00', 'Quatrième séance', true),
('Vendredi', '15:45:00', '17:15:00', 'Cinquième séance', true),
('Vendredi', '17:30:00', '19:00:00', 'Sixième séance', true),

-- Saturday
('Samedi', '08:00:00', '09:30:00', 'Première séance', true),
('Samedi', '09:45:00', '11:15:00', 'Deuxième séance', true),
('Samedi', '11:30:00', '13:00:00', 'Troisième séance', true),
('Samedi', '14:00:00', '15:30:00', 'Quatrième séance', true),
('Samedi', '15:45:00', '17:15:00', 'Cinquième séance', true),
('Samedi', '17:30:00', '19:00:00', 'Sixième séance', true)
ON CONFLICT DO NOTHING;
"@ -ForegroundColor Green
        Write-Host ""
        Write-Host "Or use the Auto Generator at:" -ForegroundColor Yellow
        Write-Host "http://localhost:5173/calendar/timeslots/auto" -ForegroundColor Cyan
    }
    default {
        Write-Host "`n❌ Invalid choice. Please run the script again." -ForegroundColor Red
    }
}

Write-Host "`n=======================================" -ForegroundColor Cyan
Write-Host "  For complete documentation, see:" -ForegroundColor Yellow
Write-Host "  TIMETABLE_MANAGEMENT_GUIDE.md" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
