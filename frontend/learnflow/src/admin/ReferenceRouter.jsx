import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spin } from 'antd';
import ReferenceManagementSimple from './ReferenceManagementSimple';
import ChefReferenceManagement from './ChefReferenceManagement';

/**
 * Smart Reference Router
 * Routes to the appropriate reference page based on user role:
 * - Admin: Full reference management
 * - Chef de Département: Department-specific reference management
 * - Others: Redirected away
 */
const ReferenceRouter = () => {
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const role = user.role;
    
    setUserRole(role);
    setLoading(false);

    // Redirect if not authorized
    if (!role || (role !== 'admin' && role !== 'chef_de_department')) {
      navigate('/');
    }
  }, [navigate]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  // Route to appropriate component based on role
  if (userRole === 'chef_de_department') {
    return <ChefReferenceManagement />;
  }

  if (userRole === 'admin') {
    return <ReferenceManagementSimple />;
  }

  // Default: show nothing (will redirect in useEffect)
  return null;
};

export default ReferenceRouter;
