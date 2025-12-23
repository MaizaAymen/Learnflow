import React from 'react';
import './Layout.css';

/**
 * Main App Layout Component
 * Provides the shell layout for the application
 */
const AppLayout = ({ children }) => {
  return (
    <div className="app-layout">
      {children}
    </div>
  );
};

export default AppLayout;
