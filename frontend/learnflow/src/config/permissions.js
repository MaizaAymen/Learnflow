/**
 * Role-based permissions and route access configuration
 * Defines which routes are accessible to each user role
 */

export const ROLE_PERMISSIONS = {
  admin: [
    // Dashboard
    "/",
    "/admin",
    
    // User Management
    "/users",
    "/profile",
    
    // Department Management
    "/create-department",
    "/show-departments",
    
    // Class Management
    "/CreationClasse",
    
    // Reference Management
    "/reference",
    "/reference/dashboard",
    "/reference/specialites",
    "/reference/departements",
    "/reference/niveaux",
    "/reference/classes",
    "/reference/salles",
    "/reference/matieres",
    "/upload-students",
    
    // Calendar & Schedule
    "/calendar",
    "/calendar/dashboard",
    "/calendar/classes",
    "/calendar/class/:classeId/events",
    "/calendar/schedules",
    "/calendar/create",
    "/calendar/class-schedule",
    "/calendar/timetable",
    "/calendar/timetable-manager",
    "/calendar/weekly-view",
    "/calendar/events",
    "/calendar/weekly-schedule",
    "/admin/calendar/schedules",
    "/admin/timetable",
    "/admin/timetable/weekly",
    
    // Student Management
    "/students/assign",
    "/students/assign/test",
    
    // Events Management
    "/admin/events",
    
    // Notifications
    "/notifications",
    
    // Absence Management
    "/admin/absences/justifications",
    
    // Service Routes
    "/library",
    "/support",
    "/feedback",
    
    // Test Routes (remove in production)
    "/test-api",
  ],
  
  etudiant: [
    // Dashboard
    "/",
    
    // Profile
    "/profile",
    
    // Calendar - Class events
    "/calendar/class/:classeId/events",
    
    // Events
    "/student/events",
    "/events",
    
    // Messaging
    "/messaging",
    
    // Absences & Justifications
    "/absences/justifications",
    
    // Professional System
    "/grades",
    "/documents",
    "/requests",
    "/announcements",
    "/projects",
    
    // Service Routes
    "/library",
    "/support",
    "/feedback",
    
    // Notifications
    "/notifications",
  ],
  
  enseignant: [
    // Dashboard
    "/",
    
    // Profile
    "/profile",
    
    // Calendar & Schedule
    "/calendar",
    "/calendar/dashboard",
    "/calendar/teacher",
    "/calendar/weekly-view",
    "/calendar/events",
    
    // Events
    "/student/events",
    "/events",
    
    // Messaging
    "/messaging",
    
    // Professional System
    "/grades",
    "/documents",
    "/announcements",
    
    // Service Routes
    "/library",
    "/support",
    "/feedback",
    
    // Notifications
    "/notifications",
  ],
  
  chef_de_department: [
    // Dashboard
    "/",
    
    // Profile
    "/profile",
    
    // Department Head Dashboard
    "/department-head",
    "/department-head/statistics",
    "/department-head/student/:studentId",
    
    // Reference Management - Limited Features (Only view department-related items)
    "/reference",
    "/reference/dashboard",
    "/reference/users",
    "/reference/department-dashboard",
    
    // Calendar
    "/calendar",
    "/calendar/dashboard",
    "/calendar/teacher",
    "/calendar/weekly-view",
    "/calendar/events",
    
    // Events
    "/student/events",
    "/events",
    
    // Messaging
    "/messaging",
    
    // Professional System (Limited - view only)
    "/announcements",
    
    // Service Routes
    "/library",
    "/support",
    "/feedback",
    
    // Notifications
    "/notifications",
  ],
  
  directeur: [
    // Dashboard
    "/",
    
    // Profile
    "/profile",
    
    // Calendar & Approvals
    "/calendar",
    "/calendar/dashboard",
    "/calendar/director-approval",
    "/calendar/events",
    
    // Events
    "/student/events",
    "/events",
    
    // Admin Events
    "/admin/events",
    
    // Messaging
    "/messaging",
    
    // Professional System
    "/announcements",
    
    // Service Routes
    "/library",
    "/support",
    "/feedback",
    
    // Notifications
    "/notifications",
  ],
};

/**
 * Check if a user has permission to access a route
 * @param {string} userRole - The user's role
 * @param {string} pathname - The pathname to check
 * @returns {boolean} - Whether the user has access to this route
 */
export const hasRoutePermission = (userRole, pathname) => {
  // Normalize the role
  const normalizedRole = (userRole || '').trim().toLowerCase();
  
  // Admin has access to everything
  if (normalizedRole === 'admin') {
    return true;
  }

  if (!normalizedRole || !ROLE_PERMISSIONS[normalizedRole]) {
    console.warn(`No permissions found for role: "${normalizedRole}"`, {
      availableRoles: Object.keys(ROLE_PERMISSIONS)
    });
    return false;
  }
  
  const allowedRoutes = ROLE_PERMISSIONS[normalizedRole];
  
  // Check exact match
  if (allowedRoutes.includes(pathname)) {
    return true;
  }
  
  // Check dynamic route patterns (e.g., /department-head/student/:studentId)
  return allowedRoutes.some(route => {
    const routeRegex = route
      .replace(/:[^\s/]+/g, '[^/]+') // Replace :paramName with regex for any char except /
      .replace(/\//g, '\\/'); // Escape forward slashes
    
    return new RegExp(`^${routeRegex}$`).test(pathname);
  });
};

/**
 * Get all allowed routes for a user role
 * @param {string} userRole - The user's role
 * @returns {string[]} - Array of allowed routes
 */
export const getAllowedRoutes = (userRole) => {
  return ROLE_PERMISSIONS[userRole] || [];
};

/**
 * Role hierarchy for permission inheritance
 * Higher role indices can access lower role routes
 */
export const ROLE_HIERARCHY = {
  admin: 5,
  directeur: 4,
  chef_de_department: 3,
  enseignant: 2,
  etudiant: 1,
};

/**
 * Check if a user role has a higher or equal hierarchy level
 * @param {string} userRole - The user's role
 * @param {string} requiredRole - The required role
 * @returns {boolean} - Whether the user has the required hierarchy level
 */
export const checkRoleHierarchy = (userRole, requiredRole) => {
  const userLevel = ROLE_HIERARCHY[userRole] || 0;
  const requiredLevel = ROLE_HIERARCHY[requiredRole] || 0;
  return userLevel >= requiredLevel;
};
