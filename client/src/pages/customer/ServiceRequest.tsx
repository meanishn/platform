import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ServiceRequestForm } from '../../components/ServiceRequestForm';
import { RoleGuard } from '../../components/auth/RoleGuard';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui';

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
      navigate('/requests');
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
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
          {/* Page Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Request a Service
            </h1>
            <p className="text-slate-600">
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
            <p className="text-slate-600 text-sm">
              Need help? Contact our support team or{' '}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(user?.role === 'provider' ? '/provider/dashboard' : '/dashboard')}
                className="text-slate-700 hover:text-slate-900 underline font-medium inline-flex p-0 h-auto"
              >
                return to dashboard
              </Button>
            </p>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
};