import './App.css'
// Vercel deployment fix
import Auth from './auth/auth.jsx'
import ShowUsers from './admin/showusers.jsx'
import UserManagement from './admin/UserManagement.jsx'
import { Route, Routes, useLocation } from "react-router-dom"
import Profile from './user/Profile.jsx'
import AdminPanel from './admin/adminpanel.jsx'
import { NotificationProvider } from './hooks/useNotifications.jsx'
import NotificationsCenter from './pages/NotificationsCenter.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import { useEffect, useState } from 'react'
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
import ChefReferenceManagement from './admin/ChefReferenceManagement.jsx'
import ReferenceRouter from './admin/ReferenceRouter.jsx'

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
import Messaging from './pages/Messaging.jsx'
import EventsViewer from './pages/EventsViewer.jsx'
// Import Department Head components
import DepartmentHeadDashboard from './components/DepartmentHeadDashboard.jsx'
import StudentDetailPage from './components/StudentDetailPage.jsx'
import DepartmentStatistics from './components/DepartmentStatistics.jsx'
// Import Events Management
import EventsManagement from './admin/EventsManagement.jsx'
import EventsStudentDashboard from './pages/EventsStudentDashboard.jsx'
import ForgotPassword from './auth/ForgotPassword.jsx'
// Import Professional System Components
import GradeManagement from './components/GradeManagement/GradeManagement.jsx'
import DocumentRepository from './components/Documents/DocumentRepository.jsx'
import StudentRequests from './components/StudentRequests/StudentRequests.jsx'
import AnnouncementsFeed from './components/Announcements/AnnouncementsFeed.jsx'
import ProjectManagement from './components/Projects/ProjectManagement.jsx'

// Import Absence Justification Components
import StudentJustificationDashboard from './components/StudentJustificationDashboard.jsx'
import AdminJustificationReview from './components/AdminJustificationReview.jsx'

// Import Service Components
import LibraryDashboard from './components/Library/LibraryDashboard.jsx'
import SupportCenter from './components/Support/SupportCenter.jsx'
import Feedback from './pages/Feedback.jsx'

// Import Chef de Département components
import ChefDepartementDashboard from './admin/ChefDepartementDashboard.jsx'
import ChefDepartementTeachersManagement from './admin/ChefDepartementTeachersManagement.jsx'

// Import Teacher Dashboard
import TeacherDashboard from './pages/TeacherDashboard.jsx'

function App() {
  const location = useLocation();
  const isAuthRoute = location.pathname === '/auth';
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user role from localStorage or auth service
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        // Try to get user info from localStorage first
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          // Normalize role: trim whitespace and ensure lowercase
          const role = (user.role || user.type || '').trim().toLowerCase();
          setUserRole(role);
          console.log('User role from localStorage:', role);
        } else {
          // Fallback: try to fetch from auth service
          const response = await fetch('http://localhost:3000/api/auth/profile', {
            credentials: 'include'
          });
          if (response.ok) {
            const user = await response.json();
            const role = (user.role || user.type || '').trim().toLowerCase();
            setUserRole(role);
            console.log('User role from auth service:', role);
          }
        }
      } catch (error) {
        console.warn('Could not fetch user role:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!isAuthRoute) {
      fetchUserRole();
    } else {
      setLoading(false);
    }
  }, [isAuthRoute]);

  if (loading && !isAuthRoute) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f0f2f5'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2>Loading...</h2>
        </div>
      </div>
    );
  }
  return (
    <>
    {
      isAuthRoute ? (
        <Routes>
          <Route path="/auth" element={<Auth />} />
        </Routes>
      ) : (
        <NotificationProvider>
          <div id="app">
            <AppLayout>
            <Routes>
            <Route path="/" element={<ProtectedRoute element={<ModernDashboard />} userRole={userRole} pathname="/" />} />
            <Route path="/users" element={<ProtectedRoute element={<UserManagement />} userRole={userRole} pathname="/users" />} />
            <Route path="/students/assign" element={<ProtectedRoute element={<StudentBulkAssignment />} userRole={userRole} pathname="/students/assign" />} />
            <Route path="/students/assign/test" element={<ProtectedRoute element={<StudentBulkAssignmentTest />} userRole={userRole} pathname="/students/assign/test" />} />
            <Route path="/profile" element={<ProtectedRoute element={<Profile />} userRole={userRole} pathname="/profile" />} />
            <Route path="/admin" element={<ProtectedRoute element={<AdminPanel />} userRole={userRole} pathname="/admin" />} />
            <Route path="/create-department" element={<ProtectedRoute element={<CreateDepartment />} userRole={userRole} pathname="/create-department" />} />
            <Route path="/show-departments" element={<ProtectedRoute element={<Showdepartments />} userRole={userRole} pathname="/show-departments" />} />
            <Route path="/CreationClasse" element={<ProtectedRoute element={<CreationClasse />} userRole={userRole} pathname="/CreationClasse" />} />
            
            {/* New Reference Management Routes */}
            <Route path="/reference" element={<ProtectedRoute element={<ReferenceRouter />} userRole={userRole} pathname="/reference" />} />
            <Route path="/reference/dashboard" element={<ProtectedRoute element={<ReferenceManagementSimple />} userRole={userRole} pathname="/reference/dashboard" />} />
            <Route path="/reference/specialites" element={<ProtectedRoute element={<SpecialiteManagementSimple />} userRole={userRole} pathname="/reference/specialites" />} />
            <Route path="/reference/departements" element={<ProtectedRoute element={<DepartementManagement />} userRole={userRole} pathname="/reference/departements" />} />
            <Route path="/reference/niveaux" element={<ProtectedRoute element={<NiveauManagementSimple />} userRole={userRole} pathname="/reference/niveaux" />} />
            <Route path="/reference/classes" element={<ProtectedRoute element={<ClasseManagementSimple />} userRole={userRole} pathname="/reference/classes" />} />
            <Route path="/reference/salles" element={<ProtectedRoute element={<SalleManagementSimple />} userRole={userRole} pathname="/reference/salles" />} />
            <Route path="/reference/matieres" element={<ProtectedRoute element={<MatiereManagementSimple />} userRole={userRole} pathname="/reference/matieres" />} />
            <Route path="/reference/users" element={<ProtectedRoute element={<ChefDepartementTeachersManagement />} userRole={userRole} pathname="/reference/users" />} />
            <Route path="/reference/department-dashboard" element={<ProtectedRoute element={<ChefDepartementDashboard />} userRole={userRole} pathname="/reference/department-dashboard" />} />
            <Route path="/upload-students" element={<ProtectedRoute element={<UploadStudents />} userRole={userRole} pathname="/upload-students" />} />
          

            {/* Calendar System Routes */}
            <Route path="/calendar" element={<ProtectedRoute element={<CalendarDashboard />} userRole={userRole} pathname="/calendar" />} />
            <Route path="/calendar/dashboard" element={<ProtectedRoute element={<CalendarDashboard />} userRole={userRole} pathname="/calendar/dashboard" />} />
            <Route path="/calendar/classes" element={<ProtectedRoute element={<ClassCalendarDashboard />} userRole={userRole} pathname="/calendar/classes" />} />
            <Route path="/calendar/class/:classeId/events" element={<ProtectedRoute element={<WeeklyViewReadOnly />} userRole={userRole} pathname={location.pathname} />} />
            <Route path="/calendar/schedules" element={<ProtectedRoute element={<ScheduleManagementComplete />} userRole={userRole} pathname="/calendar/schedules" />} />
            <Route path="/calendar/create" element={<ProtectedRoute element={<CreateSchedule />} userRole={userRole} pathname="/calendar/create" />} />
            <Route path="/calendar/class-schedule" element={<ProtectedRoute element={<ClassScheduleViewer />} userRole={userRole} pathname="/calendar/class-schedule" />} />
            <Route path="/calendar/timetable" element={<ProtectedRoute element={<EnhancedTimetableViewer />} userRole={userRole} pathname="/calendar/timetable" />} />
            <Route path="/calendar/timetable-manager" element={<ProtectedRoute element={<TimetableManager />} userRole={userRole} pathname="/calendar/timetable-manager" />} />
            <Route path="/calendar/weekly-view" element={<ProtectedRoute element={<WeeklyTimetableView />} userRole={userRole} pathname="/calendar/weekly-view" />} />
            <Route path="/calendar/events" element={<ProtectedRoute element={<EventCalendar />} userRole={userRole} pathname="/calendar/events" />} />
            <Route path="/calendar/weekly-schedule" element={<ProtectedRoute element={<WeeklySchedule />} userRole={userRole} pathname="/calendar/weekly-schedule" />} />
            <Route path="/calendar/teacher" element={<ProtectedRoute element={<TeacherCalendar />} userRole={userRole} pathname="/calendar/teacher" />} />
            <Route path="/calendar/director-approval" element={<ProtectedRoute element={<DirectorApprovalPanel />} userRole={userRole} pathname="/calendar/director-approval" />} />
            {/* Admin Calendar Routes (alternative paths) */}
            <Route path="/admin/calendar/schedules" element={<ProtectedRoute element={<ScheduleManagementComplete />} userRole={userRole} pathname="/admin/calendar/schedules" />} />
            <Route path="/admin/timetable" element={<ProtectedRoute element={<TimetableManager />} userRole={userRole} pathname="/admin/timetable" />} />
            <Route path="/admin/timetable/weekly" element={<ProtectedRoute element={<WeeklyTimetableView />} userRole={userRole} pathname="/admin/timetable/weekly" />} />
            <Route path="/messaging" element={<ProtectedRoute element={<Messaging />} userRole={userRole} pathname="/messaging" />} />
            <Route path="/events" element={<ProtectedRoute element={<EventsViewer />} userRole={userRole} pathname="/events" />} />
            <Route path="/student/events" element={<ProtectedRoute element={<EventsStudentDashboard />} userRole={userRole} pathname="/student/events" />} />
            <Route path="/admin/events" element={<ProtectedRoute element={<EventsManagement />} userRole={userRole} pathname="/admin/events" />} />
            <Route path="/notifications" element={<ProtectedRoute element={<NotificationsCenter />} userRole={userRole} pathname="/notifications" />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            
            {/* Professional System Routes */}
            <Route path="/grades" element={<ProtectedRoute element={<GradeManagement />} userRole={userRole} pathname="/grades" />} />
            <Route path="/documents" element={<ProtectedRoute element={<DocumentRepository />} userRole={userRole} pathname="/documents" />} />
            <Route path="/requests" element={<ProtectedRoute element={<StudentRequests />} userRole={userRole} pathname="/requests" />} />
            <Route path="/announcements" element={<ProtectedRoute element={<AnnouncementsFeed />} userRole={userRole} pathname="/announcements" />} />
            <Route path="/projects" element={<ProtectedRoute element={<ProjectManagement />} userRole={userRole} pathname="/projects" />} />

            {/* Absence Justification Routes */}
            <Route path="/absences/justifications" element={<ProtectedRoute element={<StudentJustificationDashboard />} userRole={userRole} pathname="/absences/justifications" />} />
            <Route path="/admin/absences/justifications" element={<ProtectedRoute element={<AdminJustificationReview />} userRole={userRole} pathname="/admin/absences/justifications" />} />

            {/* Test route for API */}
            <Route path="/test-api" element={<ProtectedRoute element={<TestReferenceAPI />} userRole={userRole} pathname="/test-api" />} />
            
            {/* Department Head Routes */}
            <Route path="/department-head" element={<ProtectedRoute element={<DepartmentHeadDashboard />} userRole={userRole} pathname="/department-head" />} />
            <Route path="/department-head/student/:studentId" element={<ProtectedRoute element={<StudentDetailPage />} userRole={userRole} pathname={location.pathname} />} />
            <Route path="/department-head/statistics" element={<ProtectedRoute element={<DepartmentStatistics />} userRole={userRole} pathname="/department-head/statistics" />} />
            
            {/* Teacher Dashboard Route */}
            <Route path="/teacher/dashboard" element={<ProtectedRoute element={<TeacherDashboard />} userRole={userRole} pathname="/teacher/dashboard" />} />
            
            {/* Service Routes */}
            <Route path="/library" element={<ProtectedRoute element={<LibraryDashboard />} userRole={userRole} pathname="/library" />} />
            <Route path="/support" element={<ProtectedRoute element={<SupportCenter />} userRole={userRole} pathname="/support" />} />
            <Route path="/feedback" element={<ProtectedRoute element={<Feedback />} userRole={userRole} pathname="/feedback" />} />
            
              <Route path="*" element={<NOTFOUND />} />
          </Routes>
        </AppLayout>
      </div>
        </NotificationProvider>
      )}
    </>
  )
}

export default App
