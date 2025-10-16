import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  LayoutDashboard, 
  Search, 
  Plus, 
  ClipboardList, 
  User, 
  Briefcase, 
  CheckCircle2, 
  FileText, 
  Bell, 
  Users, 
  Building2, 
  Wrench,
  X
} from 'lucide-react';
import { sidebarConfig } from '../../styles/responsive.config';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  // Close sidebar on route change (mobile)
  useEffect(() => {
    onClose();
  }, [location.pathname, onClose]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const customerLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/services', label: 'Browse Services', icon: Search },
    { path: '/request-service', label: 'Request Service', icon: Plus },
    { path: '/requests', label: 'My Requests', icon: ClipboardList },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  const providerLinks = [
    { path: '/provider/dashboard', label: 'Provider Dashboard', icon: LayoutDashboard },
    { path: '/provider/available-jobs', label: 'Available Jobs', icon: Briefcase },
    { path: '/provider/accepted-jobs', label: 'Accepted Jobs', icon: CheckCircle2 },
    { path: '/provider/assignments', label: 'My Assignments', icon: ClipboardList },
    { path: '/request-service', label: 'Request Service', icon: Plus },
    { path: '/requests', label: 'My Requests', icon: FileText },
    { path: '/profile', label: 'Profile', icon: User },
    { path: '/notifications', label: 'Notifications', icon: Bell },
  ];

  const adminLinks = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/users', label: 'Users', icon: Users },
    { path: '/admin/providers', label: 'Providers', icon: Building2 },
    { path: '/admin/services', label: 'Services', icon: Wrench },
    { path: '/admin/requests', label: 'Requests', icon: ClipboardList },
  ];

  const getLinks = () => {
    if (user?.role === 'admin') return adminLinks;
    if (user?.role === 'provider') return providerLinks;
    return customerLinks;
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className={`${sidebarConfig.mobileOverlay} lg:hidden`}
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          ${sidebarConfig.desktopWidth} 
          bg-white border-r border-slate-200 
          h-screen overflow-y-auto
          transition-transform duration-300 ease-in-out
          lg:sticky lg:top-0 lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isOpen ? sidebarConfig.mobileSidebar : 'hidden lg:block'}
        `}
      >
        {/* Mobile Close Button */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900">Menu</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <nav className="mt-4 lg:mt-8">
          <div className="px-3 sm:px-4 pb-6">
            <ul className="space-y-1 sm:space-y-2">
              {getLinks().map((link) => {
                const IconComponent = link.icon;
                return (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className={`
                        flex items-center px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-sm font-medium transition-all group
                        ${isActive(link.path)
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                        }
                      `}
                    >
                      <IconComponent className={`mr-2.5 sm:mr-3 w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ${isActive(link.path) ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                      <span className="font-medium text-xs sm:text-sm">{link.label}</span>
                      {isActive(link.path) && (
                        <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
            
            {/* User info card */}
            <div className="mt-6 sm:mt-8 px-2 sm:px-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 sm:p-4 text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full mx-auto mb-2 sm:mb-3 flex items-center justify-center">
                  <User className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
                <p className="text-slate-600 text-xs sm:text-sm font-medium truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-[10px] sm:text-xs text-slate-500 mt-1 capitalize">
                  {user?.role}
                </p>
              </div>
            </div>
          </div>
        </nav>
      </aside>
    </>
  );
};
