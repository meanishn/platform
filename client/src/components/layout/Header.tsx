import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui';
import { NotificationBell } from '../notifications/NotificationBell';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-slate-700 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-2xl font-bold text-slate-900">ServiceHub</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {user?.role === 'customer' && (
              <>
                <Link to="/dashboard" className="text-slate-600 hover:text-slate-900 transition-colors font-medium">
                  Dashboard
                </Link>
                <Link to="/services" className="text-slate-600 hover:text-slate-900 transition-colors font-medium">
                  Browse Services
                </Link>
                <Link to="/request-service" className="text-slate-600 hover:text-slate-900 transition-colors font-medium">
                  Request Service
                </Link>
                <Link to="/requests" className="text-slate-600 hover:text-slate-900 transition-colors font-medium">
                  My Requests
                </Link>
              </>
            )}
            {user?.role === 'provider' && (
              <>
                <Link to="/provider/dashboard" className="text-slate-600 hover:text-slate-900 transition-colors font-medium">
                  Provider Dashboard
                </Link>
                <Link to="/provider/assignments" className="text-slate-600 hover:text-slate-900 transition-colors font-medium">
                  Assignments
                </Link>
                <span className="text-slate-300">|</span>
                <Link to="/request-service" className="text-slate-600 hover:text-slate-900 transition-colors font-medium">
                  Request Service
                </Link>
                <Link to="/requests" className="text-slate-600 hover:text-slate-900 transition-colors font-medium">
                  My Requests
                </Link>
              </>
            )}
            {user?.role === 'admin' && (
              <Link to="/admin/dashboard" className="text-slate-600 hover:text-slate-900 transition-colors font-medium">
                Admin Panel
              </Link>
            )}
          </nav>

          {/* User menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <NotificationBell />
                
                <div className="flex items-center space-x-3 bg-slate-50 rounded-xl px-3 py-2 border border-slate-200">
                  <div className="w-9 h-9 bg-slate-700 rounded-xl flex items-center justify-center shadow-sm">
                    <span className="text-sm font-bold text-white">
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-slate-900">
                    {user.firstName} {user.lastName}
                  </span>
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login">
                  <Button variant="outline" size="sm">Login</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
