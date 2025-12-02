/**
 * Permission utilities and helpers
 * Provides functions for checking permissions throughout the application
 */

import { ROLE_PERMISSIONS, ROLE_HIERARCHY } from './permissions';

/**
 * Get current user's role from localStorage
 * @returns {string|null} - The user's role or null
 */
export const getCurrentUserRole = () => {
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.role || user.type || null;
    }
  } catch (error) {
    console.warn('Error reading user from localStorage:', error);
  }
  return null;
};

/**
 * Get current user object from localStorage
 * @returns {Object|null} - The user object or null
 */
export const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
  } catch (error) {
    console.warn('Error reading user from localStorage:', error);
  }
  return null;
};

/**
 * Check if user is authenticated
 * @returns {boolean} - Whether user is logged in
 */
export const isUserAuthenticated = () => {
  return getCurrentUserRole() !== null;
};

/**
 * Check if user has a specific role
 * @param {string} role - The role to check
 * @returns {boolean} - Whether user has the role
 */
export const isUserRole = (role) => {
  return getCurrentUserRole() === role;
};

/**
 * Check if user has one of multiple roles
 * @param {string[]} roles - Array of roles to check
 * @returns {boolean} - Whether user has any of the roles
 */
export const isUserAnyRole = (roles) => {
  const userRole = getCurrentUserRole();
  return roles.includes(userRole);
};

/**
 * Check if user is admin
 * @returns {boolean} - Whether user is admin
 */
export const isAdmin = () => {
  return isUserRole('admin');
};

/**
 * Check if user is teacher
 * @returns {boolean} - Whether user is teacher
 */
export const isTeacher = () => {
  return isUserRole('enseignant');
};

/**
 * Check if user is student
 * @returns {boolean} - Whether user is student
 */
export const isStudent = () => {
  return isUserRole('etudiant');
};

/**
 * Check if user is department head
 * @returns {boolean} - Whether user is department head
 */
export const isDepartmentHead = () => {
  return isUserRole('chef_de_department');
};

/**
 * Check if user is director
 * @returns {boolean} - Whether user is director
 */
export const isDirector = () => {
  return isUserRole('directeur');
};

/**
 * Filter routes based on user's permissions
 * @param {Object[]} routes - Array of route objects
 * @returns {Object[]} - Filtered routes user can access
 */
export const filterAccessibleRoutes = (routes) => {
  const userRole = getCurrentUserRole();
  if (!userRole) return [];
  
  return routes.filter(route => {
    const allowedRoutes = ROLE_PERMISSIONS[userRole] || [];
    return allowedRoutes.some(allowedRoute => {
      // Exact match or pattern match for dynamic routes
      if (allowedRoute === route.path) return true;
      
      const routeRegex = allowedRoute
        .replace(/:[^\s/]+/g, '[^/]+')
        .replace(/\//g, '\\/');
      
      return new RegExp(`^${routeRegex}$`).test(route.path);
    });
  });
};

/**
 * Get role display name (with formatting)
 * @param {string} role - The role
 * @returns {string} - Formatted role name
 */
export const getRoleDisplayName = (role) => {
  const roleNames = {
    admin: 'Administrator',
    etudiant: 'Student',
    enseignant: 'Teacher',
    chef_de_department: 'Department Head',
    directeur: 'Director',
  };
  
  return roleNames[role] || role;
};

/**
 * Get role color for UI components
 * @param {string} role - The role
 * @returns {string} - Color code
 */
export const getRoleColor = (role) => {
  const roleColors = {
    admin: '#ff4d4f',      // Red
    etudiant: '#1890ff',    // Blue
    enseignant: '#faad14',    // Orange
    chef_de_department: '#52c41a', // Green
    directeur: '#722ed1',   // Purple
  };
  
  return roleColors[role] || '#999999';
};

/**
 * Check if user has sufficient hierarchy to perform an action
 * Admins have the highest level and can access everything
 * @param {string} requiredLevel - The required role for an action
 * @returns {boolean} - Whether user has sufficient access
 */
export const hasHierarchyAccess = (requiredLevel) => {
  const userRole = getCurrentUserRole();
  if (!userRole) return false;
  
  const userLevel = ROLE_HIERARCHY[userRole] || 0;
  const required = ROLE_HIERARCHY[requiredLevel] || 0;
  
  return userLevel >= required;
};

/**
 * Get all route groups and their accessibility
 * Useful for building navigation menus
 * @returns {Object} - Route groups with accessibility info
 */
export const getRouteGroups = () => {
  const userRole = getCurrentUserRole();
  const allowedRoutes = ROLE_PERMISSIONS[userRole] || [];
  
  const routeGroups = {
    admin: {
      label: 'Admin',
      routes: [
        { path: '/admin', label: 'Admin Panel' },
        { path: '/users', label: 'User Management' },
        { path: '/create-department', label: 'Create Department' },
        { path: '/show-departments', label: 'Show Departments' },
        { path: '/reference', label: 'Reference Management' },
        { path: '/calendar', label: 'Calendar Management' },
        { path: '/admin/events', label: 'Events Management' },
        { path: '/admin/absences/justifications', label: 'Absence Justifications' },
      ],
      visible: isAdmin(),
    },
    student: {
      label: 'Student',
      routes: [
        { path: '/profile', label: 'My Profile' },
        { path: '/student/events', label: 'Events' },
        { path: '/messaging', label: 'Messaging' },
        { path: '/absences/justifications', label: 'My Justifications' },
        { path: '/grades', label: 'My Grades' },
        { path: '/documents', label: 'Documents' },
      ],
      visible: isStudent(),
    },
    teacher: {
      label: 'Teacher',
      routes: [
        { path: '/calendar/teacher', label: 'My Calendar' },
        { path: '/profile', label: 'My Profile' },
        { path: '/grades', label: 'Grades' },
      ],
      visible: isTeacher(),
    },
    departmentHead: {
      label: 'Department Head',
      routes: [
        { path: '/department-head', label: 'Dashboard' },
        { path: '/department-head/statistics', label: 'Statistics' },
      ],
      visible: isDepartmentHead(),
    },
    director: {
      label: 'Director',
      routes: [
        { path: '/calendar/director-approval', label: 'Approvals' },
        { path: '/admin/events', label: 'Events' },
      ],
      visible: isDirector(),
    },
  };
  
  return routeGroups;
};
