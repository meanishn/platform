import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { AuthLoading } from './AuthLoading';

interface RoleBasedRedirectProps {
  children?: React.ReactNode;
}

export const RoleBasedRedirect: React.FC<RoleBasedRedirectProps> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <AuthLoading message="Setting up your dashboard..." />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect based on user role if no children provided
  if (!children) {
    switch (user.role) {
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
