import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ServiceRequestForm } from '../../components/ServiceRequestForm';
import { RoleGuard } from '../../components/auth/RoleGuard';
import { useAuth } from '../../hooks/useAuth';

interface ServiceRequestFormData {
  categoryId: number | null;
  tierId: number | null;
  title: string;
  description: string;
  address: string;
  preferredDate: string;
  estimatedHours: number;
  urgency: 'low' | 'medium' | 'high' | 'emergency';
}

export const ServiceRequestPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleFormSubmit = (_data: ServiceRequestFormData) => {
    // After successful form submission, redirect based on user role
    setTimeout(() => {
      if (user?.role === 'provider') {
        navigate('/provider/dashboard');
      } else {
        navigate('/requests');
      }
    }, 2000); // Allow time for success notification to be seen
  };

  const handleCancel = () => {
    // Redirect to appropriate dashboard based on user role
    if (user?.role === 'provider') {
      navigate('/provider/dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <RoleGuard allowedRoles={['customer', 'provider']}>
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-800 to-indigo-900 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-white mb-2">
              Request a Service
            </h1>
            <p className="text-white/70">
              Choose your service category and provider level to get started
            </p>
          </div>

          {/* Service Request Form */}
          <ServiceRequestForm 
            onSubmit={handleFormSubmit}
            onCancel={handleCancel}
          />

          {/* Help Text */}
          <div className="mt-8 text-center">
            <p className="text-white/60 text-sm">
              Need help? Contact our support team or{' '}
              <button 
                onClick={() => navigate(user?.role === 'provider' ? '/provider/dashboard' : '/dashboard')}
                className="text-blue-300 hover:text-blue-200 underline"
              >
                return to dashboard
              </button>
            </p>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
};