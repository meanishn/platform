import React from 'react';
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
  Wrench 
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

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
    <aside className="w-64 bg-white border-r border-slate-200 min-h-screen">
      <nav className="mt-8">
        <div className="px-4">
          <ul className="space-y-2">
            {getLinks().map((link) => {
              const IconComponent = link.icon;
              return (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className={`
                      flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all group
                      ${isActive(link.path)
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                      }
                    `}
                  >
                    <IconComponent className={`mr-3 w-5 h-5 ${isActive(link.path) ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                    <span className="font-medium">{link.label}</span>
                    {isActive(link.path) && (
                      <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full"></div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
          
          {/* User info card */}
          <div className="mt-8 px-4">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-slate-600 text-sm font-medium">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-slate-500 mt-1 capitalize">
                {user?.role}
              </p>
            </div>
          </div>
        </div>
      </nav>
    </aside>
  );
};
