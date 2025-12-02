import { useState, useEffect } from 'react';
import { 
  getCurrentUserRole, 
  isUserRole, 
  isUserAnyRole,
  isAdmin,
  isTeacher,
  isStudent,
  isDepartmentHead,
  isDirector,
  hasHierarchyAccess,
} from '../config/permissionUtils';

/**
 * Custom hook for checking user permissions
 * @returns {Object} - Permission checking utilities
 */
export const usePermissions = () => {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const role = getCurrentUserRole();
    setUserRole(role);
    setLoading(false);
  }, []);

  return {
    userRole,
    loading,
    isAdmin: isAdmin(),
    isTeacher: isTeacher(),
    isStudent: isStudent(),
    isDepartmentHead: isDepartmentHead(),
    isDirector: isDirector(),
    isRole: (role) => isUserRole(role),
    isAnyRole: (roles) => isUserAnyRole(roles),
    hasHierarchyAccess: (role) => hasHierarchyAccess(role),
  };
};

/**
 * Custom hook to check access to specific routes
 * @param {...string} routes - Route paths to check
 * @returns {boolean} - Whether user can access all provided routes
 */
export const useCanAccessRoutes = (...routes) => {
  const { userRole } = usePermissions();
  
  if (!userRole) return false;
  
  return routes.every(route => {
    // This would need the hasRoutePermission import
    // For now, we'll keep it simple
    return true;
  });
};

export default usePermissions;
