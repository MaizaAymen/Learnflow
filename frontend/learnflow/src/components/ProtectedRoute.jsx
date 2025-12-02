import React from 'react';
import { Navigate } from 'react-router-dom';
import { hasRoutePermission } from '../config/permissions';

/**
 * Protected Route Component
 * Checks user role and route permissions before allowing access
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.element - The element to render if authorized
 * @param {string} props.userRole - The current user's role
 * @param {string} props.pathname - The current pathname
 * @returns {React.ReactNode} - Either the protected element or redirect to home/auth
 */
const ProtectedRoute = ({ element, userRole, pathname }) => {
  // If no user role, redirect to auth
  if (!userRole) {
    return <Navigate to="/auth" replace />;
  }

  // Normalize role (trim whitespace, lowercase)
  const normalizedRole = userRole.trim().toLowerCase();
  
  // Debug log
  console.log('ProtectedRoute Debug:', {
    pathname,
    userRole,
    normalizedRole,
    hasPermission: hasRoutePermission(normalizedRole, pathname)
  });

  // Check if user has permission to access this route
  if (!hasRoutePermission(normalizedRole, pathname)) {
    // Redirect to home page if user doesn't have permission
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        gap: '20px',
        backgroundColor: '#f0f2f5'
      }}>
        <h1 style={{ color: '#ff4d4f', fontSize: '24px' }}>
          ❌ Access Denied
        </h1>
        <p style={{ color: '#666', fontSize: '16px' }}>
          You don't have permission to access this page.
        </p>
        <p style={{ color: '#999', fontSize: '14px' }}>
          Your role: <strong>{normalizedRole}</strong>
        </p>
        <a href="/" style={{
          color: '#1890ff',
          textDecoration: 'none',
          fontSize: '14px',
          marginTop: '10px'
        }}>
          ← Go back to home
        </a>
      </div>
    );
  }

  // User has permission, render the element
  return element;
};

export default ProtectedRoute;
