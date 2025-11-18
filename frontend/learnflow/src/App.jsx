import './App.css'
import Auth from './auth/auth.jsx'
import ShowUsers from './admin/showusers.jsx'
import UserManagement from './admin/UserManagement.jsx'
import { Route, Routes } from "react-router-dom"
import Profile from './user/Profile.jsx'
import AdminPanel from './admin/adminpanel.jsx'
import CreationClasse from './admin/creationclasse.jsx'
import CreateDepartment from './admin/CreateDepartement.jsx'
import Showdepartments from './admin/showdepar.jsx'
import AppLayout from './components/Layout.jsx'
import ModernDashboard from './components/ModernDashboard.jsx'
// Import new reference management components
import ReferenceManagement from './admin/ReferenceManagement.jsx'
import ReferenceManagementSimple from './admin/ReferenceManagementSimple.jsx'
import SpecialiteManagement from './admin/SpecialiteManagement.jsx'
import SpecialiteManagementSimple from './admin/SpecialiteManagementSimple.jsx'
import DepartementManagement from './admin/DepartementManagement.jsx'
import NiveauManagementSimple from './admin/NiveauManagementSimple.jsx'
import ClasseManagementSimple from './admin/ClasseManagementSimple.jsx'
import SalleManagementSimple from './admin/SalleManagementSimple.jsx'
import MatiereManagementSimple from './admin/MatiereManagementSimple.jsx'
import TestReferenceAPI from './admin/TestReferenceAPI.jsx'
import SimpleReference from './admin/SimpleReference.jsx'
import UploadStudents from './admin/upload.jsx'

// Import Calendar System components
import CalendarDashboard from './admin/CalendarDashboard.jsx'
import TimeSlotManagement from './admin/TimeSlotManagement.jsx'
import ScheduleManagementComplete from './admin/ScheduleManagementComplete.jsx'
import ClassScheduleViewer from './admin/ClassScheduleViewer.jsx'
import EventCalendar from './admin/EventCalendar.jsx'
import WeeklySchedule from './components/WeeklySchedule.jsx'
import CreateSchedule from './admin/CreateSchedule.jsx'
import AutoTimeSlotGenerator from './admin/AutoTimeSlotGenerator.jsx'
import ClassCalendarDashboard from './admin/ClassCalendarDashboard.jsx'
import ClassCalendar from './admin/ClassCalendar.jsx'
import EnhancedTimetableViewer from './admin/EnhancedTimetableViewer.jsx'
import TimetableManager from './admin/TimetableManager.jsx'
import WeeklyTimetableView from './admin/WeeklyTimetableView.jsx'
import TeacherCalendar from './admin/TeacherCalendar.jsx'
import DirectorApprovalPanel from './admin/DirectorApprovalPanel.jsx'
import NOTFOUND from './components/NOTFOUND.JSX'
import StudentBulkAssignment from './admin/StudentBulkAssignment.jsx'
import StudentBulkAssignmentTest from './admin/StudentBulkAssignmentTest.jsx'
import WeeklyViewReadOnly from './admin/WeeklyViewReadOnly.jsx'

// Import Department Head components
import DepartmentHeadDashboard from './components/DepartmentHeadDashboard.jsx'
import StudentDetailPage from './components/StudentDetailPage.jsx'
import DepartmentStatistics from './components/DepartmentStatistics.jsx'

const isAuthRoute =location.pathname=== '/auth';
function App() {
  return (
    <>
    {
      isAuthRoute ? (
        <Routes>
          <Route path="/auth" element={<Auth />} />
        </Routes>
      ) : (
        <div id="app">
          <AppLayout>
          <Routes>
            <Route path="/" element={<ModernDashboard />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/students/assign" element={<StudentBulkAssignment />} />
            <Route path="/students/assign/test" element={<StudentBulkAssignmentTest />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/create-department" element={<CreateDepartment />} />
            <Route path="/show-departments" element={<Showdepartments />} />
            <Route path="/CreationClasse" element={<CreationClasse />} />
            
            {/* New Reference Management Routes */}
            <Route path="/reference" element={<ReferenceManagementSimple />} />
            <Route path="/reference/dashboard" element={<ReferenceManagementSimple />} />
            <Route path="/reference/specialites" element={<SpecialiteManagementSimple />} />
            <Route path="/reference/departements" element={<DepartementManagement />} />
            <Route path="/reference/niveaux" element={<NiveauManagementSimple />} />
            <Route path="/reference/classes" element={<ClasseManagementSimple />} />
            <Route path="/reference/salles" element={<SalleManagementSimple />} />
            <Route path="/reference/matieres" element={<MatiereManagementSimple />} />
            <Route path="/upload-students" element={<UploadStudents />} />
          

            {/* Calendar System Routes */}
            <Route path="/calendar" element={<CalendarDashboard />} />
            <Route path="/calendar/dashboard" element={<CalendarDashboard />} />
            <Route path="/calendar/classes" element={<ClassCalendarDashboard />} />
            <Route path="/calendar/class/:classeId/events" element={<WeeklyViewReadOnly />} />
            <Route path="/calendar/schedules" element={<ScheduleManagementComplete />} />
            <Route path="/calendar/create" element={<CreateSchedule />} />
            <Route path="/calendar/class-schedule" element={<ClassScheduleViewer />} />
            <Route path="/calendar/timetable" element={<EnhancedTimetableViewer />} />
            <Route path="/calendar/timetable-manager" element={<TimetableManager />} />
            <Route path="/calendar/weekly-view" element={<WeeklyTimetableView />} />
            <Route path="/calendar/events" element={<EventCalendar />} />
            <Route path="/calendar/weekly-schedule" element={<WeeklySchedule />} />
            <Route path="/calendar/teacher" element={<TeacherCalendar />} />
            <Route path="/calendar/director-approval" element={<DirectorApprovalPanel />} />
            {/* Admin Calendar Routes (alternative paths) */}
            <Route path="/admin/calendar/schedules" element={<ScheduleManagementComplete />} />
            <Route path="/admin/timetable" element={<TimetableManager />} />
            <Route path="/admin/timetable/weekly" element={<WeeklyTimetableView />} />
            

            {/* Test route for API */}
            <Route path="/test-api" element={<TestReferenceAPI />} />
            
            {/* Department Head Routes */}
            <Route path="/department-head" element={<DepartmentHeadDashboard />} />
            <Route path="/department-head/student/:studentId" element={<StudentDetailPage />} />
            <Route path="/department-head/statistics" element={<DepartmentStatistics />} />
            
              <Route path="*" element={<NOTFOUND />} />
          </Routes>
        </AppLayout>
      </div>
      )}
    </>
  )
}

export default App
