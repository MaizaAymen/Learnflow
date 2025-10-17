import React from 'react';
import { Button as AntButton } from 'antd';
import './button.scss';

const Button = ({ 
  variant = 'primary', 
  size = 'medium', 
  fullWidth = false, 
  loading = false,
  disabled = false,
  children, 
  className = '',
  ...props 
}) => {
  const buttonClasses = [
    'enhanced-button',
    `enhanced-button--${variant}`,
    `enhanced-button--${size}`,
    fullWidth ? 'enhanced-button--full-width' : '',
    loading ? 'enhanced-button--loading' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <AntButton
      className={buttonClasses}
      loading={loading}
      disabled={disabled}
      {...props}
    >
      {children}
    </AntButton>
  );
};

export default Button;
