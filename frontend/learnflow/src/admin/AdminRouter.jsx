import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import all management components
import ReferenceManagement from './ReferenceManagement';
import SpecialiteManagement from './SpecialiteManagement';
import DepartementManagement from './DepartementManagement';
import NiveauManagement from './NiveauManagement';
import ClasseManagement from './ClasseManagement';
import SalleManagement from './SalleManagement';
import MatiereManagement from './MatiereManagement';
import ScheduleManagementComplete from './ScheduleManagementComplete';
import TimeSlotManagement from './TimeSlotManagement';
import StudentManagement from './StudentManagement';

const AdminRouter = () => {
  return (
    <Router>
      <Routes>
        {/* Default route redirects to reference management dashboard */}
        <Route path="/" element={<Navigate to="/admin/reference" replace />} />
        
        {/* Reference management routes */}
        <Route path="/admin/reference" element={<ReferenceManagement />} />
        <Route path="/admin/reference/dashboard" element={<ReferenceManagement />} />
        <Route path="/admin/reference/specialites" element={<SpecialiteManagement />} />
        <Route path="/admin/reference/departements" element={<DepartementManagement />} />
        <Route path="/admin/reference/niveaux" element={<NiveauManagement />} />
        <Route path="/admin/reference/classes" element={<ClasseManagement />} />
        <Route path="/admin/reference/salles" element={<SalleManagement />} />
        <Route path="/admin/reference/matieres" element={<MatiereManagement />} />
        
        {/* User management routes */}
        <Route path="/admin/users" element={<StudentManagement />} />
        <Route path="/admin/users/students" element={<StudentManagement />} />
        
        {/* Calendar management routes */}
        <Route path="/admin/calendar/timeslots" element={<TimeSlotManagement />} />
        <Route path="/admin/calendar/schedules" element={<ScheduleManagementComplete />} />
        
        {/* Catch all route - redirect to dashboard */}
        <Route path="*" element={<Navigate to="/admin/reference" replace />} />
      </Routes>
    </Router>
  );
};

export default AdminRouter;