import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { AuthLoading } from './AuthLoading';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: 'customer' | 'provider' | 'admin';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = (props) => {
  const { children, requireRole } = props;
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <AuthLoading message="Verifying your access..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireRole && user?.role !== requireRole) {
    // Redirect to appropriate dashboard based on user role
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
