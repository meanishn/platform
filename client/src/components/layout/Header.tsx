import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui';
import { NotificationBell } from '../notifications/NotificationBell';
import { Menu } from 'lucide-react';
import { headerConfig } from '../../styles/responsive.config';

interface HeaderProps {
  onMenuClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="mx-auto px-3 sm:px-4 md:px-6">
        <div className={`flex justify-between items-center ${headerConfig.height}`}>
          {/* Left section: Menu button (mobile) + Logo */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Hamburger Menu Button - Only show when user is logged in */}
            {user && (
              <button
                onClick={onMenuClick}
                className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5 text-slate-600" />
              </button>
            )}
            
            {/* Logo - Responsive sizing */}
            <Link to="/" className="flex items-center gap-1.5 sm:gap-2 md:gap-3 group">
              <div className={`${headerConfig.logoSize} bg-slate-700 rounded-lg sm:rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow`}>
                <span className="text-white font-bold text-sm sm:text-base md:text-lg">S</span>
              </div>
              <span className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-slate-900">ServiceHub</span>
            </Link>
          </div>

          {/* Navigation - Progressive disclosure based on screen size */}
          <nav className="hidden lg:flex items-center gap-4 xl:gap-6">
            {user?.role === 'customer' && (
              <>
                <Link to="/dashboard" className="text-sm xl:text-base text-slate-600 hover:text-slate-900 transition-colors font-medium whitespace-nowrap">
                  Dashboard
                </Link>
                <Link to="/services" className="text-sm xl:text-base text-slate-600 hover:text-slate-900 transition-colors font-medium whitespace-nowrap">
                  <span className="hidden xl:inline">Browse </span>Services
                </Link>
                <span className="text-slate-300">|</span>
                <Link to="/request-service" className="text-sm xl:text-base text-slate-600 hover:text-slate-900 transition-colors font-medium whitespace-nowrap">
                  <span className="hidden xl:inline">Request </span>Service
                </Link>
                <Link to="/requests" className="text-sm xl:text-base text-slate-600 hover:text-slate-900 transition-colors font-medium whitespace-nowrap">
                  <span className="hidden xl:inline">My </span>Requests
                </Link>
              </>
            )}
            {user?.role === 'provider' && (
              <>
                <Link to="/provider/dashboard" className="text-sm xl:text-base text-slate-600 hover:text-slate-900 transition-colors font-medium whitespace-nowrap">
                  <span className="hidden xl:inline">Provider </span>Dashboard
                </Link>
                <Link to="/provider/assignments" className="text-sm xl:text-base text-slate-600 hover:text-slate-900 transition-colors font-medium whitespace-nowrap">
                  Assignments
                </Link>
                <span className="text-slate-300">|</span>
                <Link to="/request-service" className="text-sm xl:text-base text-slate-600 hover:text-slate-900 transition-colors font-medium whitespace-nowrap">
                  <span className="hidden xl:inline">Request </span>Service
                </Link>
                <Link to="/requests" className="text-sm xl:text-base text-slate-600 hover:text-slate-900 transition-colors font-medium whitespace-nowrap">
                  <span className="hidden xl:inline">My </span>Requests
                </Link>
              </>
            )}
            {user?.role === 'admin' && (
              <Link to="/admin/dashboard" className="text-sm xl:text-base text-slate-600 hover:text-slate-900 transition-colors font-medium whitespace-nowrap">
                Admin Panel
              </Link>
            )}
          </nav>

          {/* User menu - Optimized spacing for different screen sizes */}
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 lg:gap-4">
            {user ? (
              <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 lg:gap-4">
                {/* Notifications */}
                <NotificationBell />
                
                {/* User Profile Display - Progressive disclosure */}
                <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-50 rounded-lg sm:rounded-xl px-1.5 py-1 sm:px-2 sm:py-1.5 md:px-3 md:py-2 border border-slate-200">
                  <div className={`${headerConfig.avatarSize} bg-slate-700 rounded-lg sm:rounded-xl flex items-center justify-center shadow-sm flex-shrink-0`}>
                    <span className="text-[10px] sm:text-xs md:text-sm font-bold text-white">
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </span>
                  </div>
                  {/* User name - hide on small and medium, show on lg+ */}
                  <span className="hidden lg:inline text-xs lg:text-sm font-medium text-slate-900 max-w-[120px] xl:max-w-none truncate">
                    {user.firstName} {user.lastName}
                  </span>
                </div>
                
                {/* Logout Button - Responsive text */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLogout}
                  className="hidden sm:flex text-xs lg:text-sm px-2 sm:px-2.5 lg:px-3"
                >
                  <span className="hidden md:inline">Logout</span>
                  <span className="md:hidden">Exit</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
                <Link to="/login">
                  <Button variant="outline" size="sm" className="text-xs sm:text-sm px-2 sm:px-2.5 md:px-3">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="text-xs sm:text-sm px-2 sm:px-2.5 md:px-3">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
