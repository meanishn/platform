import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: ('customer' | 'provider' | 'admin')[];
  redirectTo?: string;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ 
  children, 
  allowedRoles, 
  redirectTo 
}) => {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role as 'customer' | 'provider' | 'admin')) {
    if (redirectTo) {
      return <Navigate to={redirectTo} replace />;
    }
    
    // Default redirect based on user role
    switch (user?.role) {
      case 'admin':
        return <Navigate to="/admin/dashboard" replace />;
      case 'provider':
        return <Navigate to="/provider/dashboard" replace />;
      case 'customer':
      default:
        return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
};
