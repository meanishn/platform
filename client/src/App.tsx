import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
import { Layout } from './components/layout/Layout';
import { ToastContainer, useToast } from './components/notifications/ToastNotification';

// Auth Pages
import { LoginForm } from './pages/auth/LoginForm';
import { RegisterForm } from './pages/auth/RegisterForm';
import { ProtectedRoute } from './pages/auth/ProtectedRoute';
import { RoleBasedRedirect } from './components/auth/RoleBasedRedirect';

// Customer Pages
import { CustomerDashboard } from './pages/customer/Dashboard';
import { Services } from './pages/customer/Services';
import { MyRequests } from './pages/customer/MyRequests';
import { ServiceRequestPage } from './pages/customer/ServiceRequest';
import { RequestDetail } from './pages/customer/RequestDetail';

// Provider Pages
import { ProviderDashboard } from './pages/provider/Dashboard';
import { ProviderAssignments } from './pages/provider/Assignments';

import { AvailableJobsEnhanced } from './pages/provider/AvailableJobs';
import { AcceptedJobs } from './pages/provider/AcceptedJobs';

// Admin Pages
import { AdminDashboard } from './pages/admin/Dashboard';

// Shared Pages
import { Profile } from './pages/shared/Profile';
import { NotificationsPage } from './pages/shared/Notifications';

// Test Pages
import { AuthDebug } from './components/AuthDebug';


// App content wrapper for toast notifications
const AppContent = () => {
  const { toasts, removeToast } = useToast();

  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        
        {/* Protected routes with layout */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          {/* Default redirect based on user role */}
          <Route index element={<RoleBasedRedirect />} />
          
          {/* Customer routes */}
          <Route path="/dashboard" element={<CustomerDashboard />} />
          <Route path="/services" element={<Services />} />
          <Route path="/requests" element={<MyRequests />} />
          <Route path="/requests/:id" element={<RequestDetail />} />
          <Route path="/request-service" element={<ServiceRequestPage />} />
          
          {/* Provider routes */}
          <Route path="/provider/dashboard" element={<ProviderDashboard />} />
          <Route path="/provider/available-jobs" element={<AvailableJobsEnhanced />} />
          <Route path="/provider/accepted-jobs" element={<AcceptedJobs />} />
          <Route path="/provider/assignments" element={<ProviderAssignments />} />
          
          {/* Admin routes */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          
          {/* Shared routes - accessible to all authenticated users */}
          <Route path="/profile" element={<Profile />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          
        </Route>
      </Routes>

      {/* Toast notifications */}
      <ToastContainer notifications={toasts} onRemove={removeToast} />
      
      {/* Debug component for development */}
      {/* {import.meta.env.DEV && <AuthDebug />} */}
    </>
  );
};

function App() {
  return (
    <AuthProvider>
        <NotificationProvider>
          <Router>
            <AppContent />
          </Router>
        </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
