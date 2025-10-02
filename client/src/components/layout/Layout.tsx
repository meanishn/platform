import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children?: any;
}

export const Layout: React.FC<LayoutProps> = (props) => {
  const { children } = props;
  return (
    <div className="page-container">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-primary-400/30 to-secondary-400/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-accent-400/30 to-secondary-400/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-secondary-400/30 to-primary-400/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>
      
      <Header />
      <div className="flex relative z-10">
        <Sidebar />
        <main className="flex-1 p-6 content-container">
          <div className="glass-card">
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
};

export const AuthLayout: React.FC<LayoutProps> = (props) => {
  const { children } = props;
  return (
    <div className="page-container">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-primary-400/30 to-secondary-400/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-accent-400/30 to-secondary-400/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-secondary-400/30 to-primary-400/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>
      
      <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {children}
        </div>
      </div>
    </div>
  );
};
