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
import ClassScheduleViewer from './admin/ClassScheduleViewer.jsx'
import EventCalendar from './admin/EventCalendar.jsx'
function App() {
  return (
    <>
      <div id="app">
        <AppLayout>
          <Routes>
            <Route path="/" element={<ModernDashboard />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin" element={<AdminPanel />} />
            
            {/* Legacy routes - you might want to remove these eventually */}
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
            <Route path="/calendar/timeslots" element={<TimeSlotManagement />} />
            <Route path="/calendar/class-schedule" element={<ClassScheduleViewer />} />
            <Route path="/calendar/events" element={<EventCalendar />} />
            {/* Add more calendar routes as you create the components */}

            {/* Test route for API */}
            <Route path="/test-api" element={<TestReferenceAPI />} />
          </Routes>
        </AppLayout>
      </div>
    </>
  )
}

export default App
