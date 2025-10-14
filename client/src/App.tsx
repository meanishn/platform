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
import { MyRequests } from './pages/customer/MyRequestsNew';
import { ServiceRequestPage } from './pages/customer/ServiceRequest';
import { RequestDetail } from './pages/customer/RequestDetail';

// Provider Pages
import { ProviderDashboard } from './pages/provider/Dashboard';
import { ProviderAssignments } from './pages/provider/Assignments';
import { AssignmentDetail } from './pages/provider/AssignmentDetail';
import { ProviderRequestDetail } from './pages/provider/RequestDetail';
import { AvailableJobsEnhanced } from './pages/provider/AvailableJobsEnhanced';
import { AcceptedJobs } from './pages/provider/AcceptedJobs';

// Admin Pages
import { AdminDashboard } from './pages/admin/Dashboard';

// Shared Pages
import { Profile } from './pages/shared/Profile';
import { NotificationsPage } from './pages/shared/Notifications';

// Test Pages
import { TestSCSS } from './pages/TestSCSS';
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
          <Route path="/provider/assignments/:id" element={<AssignmentDetail />} />
          <Route path="/provider/requests/:id" element={<ProviderRequestDetail />} />
          <Route path="/provider/jobs/:id" element={<ProviderRequestDetail />} />
          
          {/* Admin routes */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          
          {/* Shared routes - accessible to all authenticated users */}
          <Route path="/profile" element={<Profile />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          
          {/* Test routes */}
          <Route path="/test-scss" element={<TestSCSS />} />
        </Route>
      </Routes>

      {/* Toast notifications */}
      <ToastContainer notifications={toasts} onRemove={removeToast} />
      
      {/* Debug component for development */}
      {import.meta.env.DEV && <AuthDebug />}
    </>
  );
};

function App() {
  return (
    <AuthProvider>
        <NotificationProvider>
          <Router>
            <div className="page-container">
              <AppContent />
            </div>
          </Router>
        </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
