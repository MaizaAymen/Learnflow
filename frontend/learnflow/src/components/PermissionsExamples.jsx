/**
 * Example Component: How to Use Permissions
 * This file demonstrates various ways to check and use permissions in components
 */

import React from 'react';
import { usePermissions } from '../hooks/usePermissions';
import { 
  isAdmin, 
  isStudent, 
  isTeacher, 
  isDepartmentHead,
  isDirector,
  getCurrentUserRole,
  getRoleDisplayName,
  getRoleColor
} from '../config/permissionUtils';

/**
 * Example 1: Using the Hook (Recommended)
 */
export const Example1_UsingHook = () => {
  const { userRole, isAdmin, isStudent, isTeacher, loading } = usePermissions();

  if (loading) {
    return <p>Loading permissions...</p>;
  }

  return (
    <div>
      <h2>Example 1: Using usePermissions Hook</h2>
      <p>Current User Role: {userRole}</p>
      
      {isAdmin && <p>✅ You are an Admin</p>}
      {isStudent && <p>✅ You are a Student</p>}
      {isTeacher && <p>✅ You are a Teacher</p>}
    </div>
  );
};

/**
 * Example 2: Conditional Rendering
 */
export const Example2_ConditionalRendering = () => {
  return (
    <div>
      <h2>Example 2: Conditional Rendering</h2>
      
      {isAdmin() && (
        <div style={{ padding: '10px', backgroundColor: '#fff2f0', border: '1px solid #ffccc7', marginBottom: '10px' }}>
          <h3>Admin Section</h3>
          <p>Only admins can see this</p>
          <button>Admin Action Button</button>
        </div>
      )}
      
      {isStudent() && (
        <div style={{ padding: '10px', backgroundColor: '#e6f7ff', border: '1px solid #91d5ff', marginBottom: '10px' }}>
          <h3>Student Section</h3>
          <p>Only students can see this</p>
          <button>Student Action Button</button>
        </div>
      )}
      
      {isTeacher() && (
        <div style={{ padding: '10px', backgroundColor: '#fffbe6', border: '1px solid #ffe58f', marginBottom: '10px' }}>
          <h3>Teacher Section</h3>
          <p>Only teachers can see this</p>
          <button>Teacher Action Button</button>
        </div>
      )}
    </div>
  );
};

/**
 * Example 3: Role-Based Navigation Menu
 */
export const Example3_NavigationMenu = () => {
  const navigationItems = [
    {
      label: 'Home',
      path: '/',
      allowedRoles: ['ADMIN', 'STUDENT', 'TEACHER', 'DEPARTMENT_HEAD', 'DIRECTOR'],
    },
    {
      label: 'Admin Panel',
      path: '/admin',
      allowedRoles: ['ADMIN'],
    },
    {
      label: 'My Calendar',
      path: '/calendar/teacher',
      allowedRoles: ['TEACHER'],
    },
    {
      label: 'Department Head Dashboard',
      path: '/department-head',
      allowedRoles: ['DEPARTMENT_HEAD'],
    },
    {
      label: 'Approvals',
      path: '/calendar/director-approval',
      allowedRoles: ['DIRECTOR'],
    },
  ];

  const userRole = getCurrentUserRole();

  const accessibleItems = navigationItems.filter(item =>
    item.allowedRoles.includes(userRole)
  );

  return (
    <div>
      <h2>Example 3: Role-Based Navigation</h2>
      <nav>
        {accessibleItems.map(item => (
          <a key={item.path} href={item.path} style={{ marginRight: '15px' }}>
            {item.label}
          </a>
        ))}
      </nav>
    </div>
  );
};

/**
 * Example 4: Displaying User Role with Styling
 */
export const Example4_UserRoleDisplay = () => {
  const userRole = getCurrentUserRole();
  const displayName = getRoleDisplayName(userRole);
  const roleColor = getRoleColor(userRole);

  return (
    <div>
      <h2>Example 4: User Role Display</h2>
      <div style={{
        padding: '10px 15px',
        backgroundColor: '#f0f2f5',
        borderRadius: '4px',
        display: 'inline-block',
      }}>
        <span style={{ color: roleColor, fontWeight: 'bold' }}>
          {displayName}
        </span>
      </div>
    </div>
  );
};

/**
 * Example 5: Protected Actions with Role Check
 */
export const Example5_ProtectedActions = () => {
  const handleAdminAction = () => {
    if (!isAdmin()) {
      alert('You do not have permission to perform this action');
      return;
    }
    alert('Admin action executed!');
  };

  const handleTeacherAction = () => {
    if (!isTeacher()) {
      alert('Only teachers can perform this action');
      return;
    }
    alert('Teacher action executed!');
  };

  return (
    <div>
      <h2>Example 5: Protected Actions</h2>
      <button 
        onClick={handleAdminAction}
        disabled={!isAdmin()}
        style={{ marginRight: '10px' }}
      >
        Admin Action {isAdmin() ? '✅' : '❌'}
      </button>
      
      <button 
        onClick={handleTeacherAction}
        disabled={!isTeacher()}
      >
        Teacher Action {isTeacher() ? '✅' : '❌'}
      </button>
    </div>
  );
};

/**
 * Example 6: Complex Permission Logic
 */
export const Example6_ComplexLogic = () => {
  const { isAdmin, isDepartmentHead, isTeacher } = usePermissions();
  
  const canManageUsers = isAdmin;
  const canViewStatistics = isAdmin || isDepartmentHead;
  const canGradeStudents = isTeacher;

  return (
    <div>
      <h2>Example 6: Complex Permission Logic</h2>
      
      {canManageUsers && (
        <div>
          <h3>User Management</h3>
          <p>Only admins can manage users</p>
        </div>
      )}
      
      {canViewStatistics && (
        <div>
          <h3>Statistics View</h3>
          <p>Admins and department heads can view statistics</p>
        </div>
      )}
      
      {canGradeStudents && (
        <div>
          <h3>Grading System</h3>
          <p>Teachers can grade students</p>
        </div>
      )}
    </div>
  );
};

/**
 * Example 7: Tabs with Role-Based Content
 */
export const Example7_RoleBasedTabs = () => {
  const { userRole } = usePermissions();

  const getTabs = () => {
    const allTabs = {
      ADMIN: [
        { key: 'dashboard', label: 'Dashboard', icon: '📊' },
        { key: 'users', label: 'Users', icon: '👥' },
        { key: 'reports', label: 'Reports', icon: '📈' },
        { key: 'settings', label: 'Settings', icon: '⚙️' },
      ],
      STUDENT: [
        { key: 'dashboard', label: 'Dashboard', icon: '📚' },
        { key: 'grades', label: 'My Grades', icon: '📊' },
        { key: 'documents', label: 'Documents', icon: '📄' },
      ],
      TEACHER: [
        { key: 'dashboard', label: 'Dashboard', icon: '📚' },
        { key: 'calendar', label: 'Calendar', icon: '📅' },
        { key: 'grades', label: 'Grades', icon: '📊' },
      ],
    };

    return allTabs[userRole] || [];
  };

  const tabs = getTabs();

  return (
    <div>
      <h2>Example 7: Role-Based Tabs</h2>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        {tabs.map(tab => (
          <button key={tab.key} style={{
            padding: '8px 16px',
            backgroundColor: '#1890ff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

/**
 * Example 8: Table with Role-Based Actions
 */
export const Example8_RoleBasedTableActions = () => {
  const userData = [
    { id: 1, name: 'John Doe', role: 'STUDENT' },
    { id: 2, name: 'Jane Smith', role: 'TEACHER' },
  ];

  const canDeleteUser = isAdmin();
  const canEditUser = isAdmin();
  const canViewDetails = !isStudent(); // Everyone except students

  return (
    <div>
      <h2>Example 8: Role-Based Table Actions</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f0f0f0' }}>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>ID</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Name</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Role</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {userData.map(user => (
            <tr key={user.id}>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.id}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.name}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.role}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                {canViewDetails && <button>View</button>}
                {canEditUser && <button>Edit</button>}
                {canDeleteUser && <button>Delete</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/**
 * Main Example Component - Shows All Examples
 */
export default function PermissionsExamples() {
  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <h1>🔐 Permissions System Examples</h1>
      <p>This page demonstrates various ways to use permissions in your application.</p>
      
      <hr style={{ margin: '30px 0' }} />
      
      <Example1_UsingHook />
      <hr style={{ margin: '30px 0' }} />
      
      <Example2_ConditionalRendering />
      <hr style={{ margin: '30px 0' }} />
      
      <Example3_NavigationMenu />
      <hr style={{ margin: '30px 0' }} />
      
      <Example4_UserRoleDisplay />
      <hr style={{ margin: '30px 0' }} />
      
      <Example5_ProtectedActions />
      <hr style={{ margin: '30px 0' }} />
      
      <Example6_ComplexLogic />
      <hr style={{ margin: '30px 0' }} />
      
      <Example7_RoleBasedTabs />
      <hr style={{ margin: '30px 0' }} />
      
      <Example8_RoleBasedTableActions />
    </div>
  );
}
