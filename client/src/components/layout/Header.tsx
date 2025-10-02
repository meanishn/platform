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
    <header className="glass border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-all duration-300">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-2xl font-bold text-gradient">ServiceHub</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {user?.role === 'customer' && (
              <>
                <Link to="/dashboard" className="text-white/80 hover:text-white transition-colors duration-200 font-medium hover:text-glow">
                  Dashboard
                </Link>
                <Link to="/services" className="text-white/80 hover:text-white transition-colors duration-200 font-medium hover:text-glow">
                  Browse Services
                </Link>
                <Link to="/request-service" className="text-white/80 hover:text-white transition-colors duration-200 font-medium hover:text-glow">
                  Request Service
                </Link>
                <Link to="/requests" className="text-white/80 hover:text-white transition-colors duration-200 font-medium hover:text-glow">
                  My Requests
                </Link>
              </>
            )}
            {user?.role === 'provider' && (
              <>
                <Link to="/provider/dashboard" className="text-white/80 hover:text-white transition-colors duration-200 font-medium hover:text-glow">
                  Provider Dashboard
                </Link>
                <Link to="/provider/assignments" className="text-white/80 hover:text-white transition-colors duration-200 font-medium hover:text-glow">
                  Assignments
                </Link>
                <span className="text-white/40">|</span>
                <Link to="/request-service" className="text-white/80 hover:text-white transition-colors duration-200 font-medium hover:text-glow">
                  Request Service
                </Link>
                <Link to="/requests" className="text-white/80 hover:text-white transition-colors duration-200 font-medium hover:text-glow">
                  My Requests
                </Link>
              </>
            )}
            {user?.role === 'admin' && (
              <Link to="/admin/dashboard" className="text-white/80 hover:text-white transition-colors duration-200 font-medium hover:text-glow">
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
                
                <div className="flex items-center space-x-3 bg-white/10 rounded-xl px-3 py-2 backdrop-blur-sm border border-white/20">
                  <div className="w-9 h-9 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-sm font-bold text-white">
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-white">
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
