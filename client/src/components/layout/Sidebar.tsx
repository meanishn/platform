import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const customerLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/services', label: 'Browse Services', icon: '🔍' },
    { path: '/request-service', label: 'Request Service', icon: '➕' },
    { path: '/requests', label: 'My Requests', icon: '📋' },
    { path: '/profile', label: 'Profile', icon: '👤' },
  ];

  const providerLinks = [
    { path: '/provider/dashboard', label: 'Provider Dashboard', icon: '📊' },
    { path: '/provider/assignments', label: 'Assignments', icon: '📋' },
    { path: '/request-service', label: 'Request Service', icon: '➕' },
    { path: '/requests', label: 'My Requests', icon: '📝' },
    { path: '/profile', label: 'Profile', icon: '👤' },
    { path: '/notifications', label: 'Notifications', icon: '🔔' },
  ];

  const adminLinks = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/admin/users', label: 'Users', icon: '👥' },
    { path: '/admin/providers', label: 'Providers', icon: '🏢' },
    { path: '/admin/services', label: 'Services', icon: '🛠️' },
    { path: '/admin/requests', label: 'Requests', icon: '📋' },
  ];

  const getLinks = () => {
    if (user?.role === 'admin') return adminLinks;
    if (user?.role === 'provider') return providerLinks;
    return customerLinks;
  };

  return (
    <aside className="w-64 glass border-r border-white/10 min-h-screen">
      <nav className="mt-8">
        <div className="px-4">
          <ul className="space-y-3">
            {getLinks().map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className={`
                    flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 group
                    ${isActive(link.path)
                      ? 'bg-gradient-to-r from-primary-500/30 to-secondary-500/30 text-white border border-primary-400/30 shadow-lg backdrop-blur-sm'
                      : 'text-white/80 hover:text-white hover:bg-white/10 hover:backdrop-blur-sm hover:border-white/20 border border-transparent'
                    }
                  `}
                >
                  <span className="mr-3 text-lg group-hover:animate-float">{link.icon}</span>
                  <span className="font-medium">{link.label}</span>
                  {isActive(link.path) && (
                    <div className="ml-auto w-2 h-2 bg-primary-400 rounded-full animate-pulse-glow"></div>
                  )}
                </Link>
              </li>
            ))}
          </ul>
          
          {/* Decorative element */}
          <div className="mt-8 px-4">
            <div className="glass rounded-xl p-4 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full mx-auto mb-3 flex items-center justify-center animate-float">
                <span className="text-white text-xl">✨</span>
              </div>
              <p className="text-white/70 text-sm">
                Welcome to your dashboard
              </p>
            </div>
          </div>
        </div>
      </nav>
    </aside>
  );
};
