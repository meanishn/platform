import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Card, Button, Badge } from '../../components/ui';
import { api, handleResponse } from '../../services/apiClient';

interface ServiceRequest {
  id: number;
  userId: number;
  categoryId: number;
  tierId: number;
  title: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  preferredDate?: string;
  urgency: 'low' | 'medium' | 'high';
  estimatedHours: number;
  status: 'pending' | 'awaiting_customer_confirmation' | 'confirmed' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  assignedProviderId?: number;
  createdAt: string;
  updatedAt: string;
  assignedAt?: string;
  providerAcceptedAt?: string;
  customerConfirmedAt?: string;
  startedAt?: string;
  completedAt?: string;
}

interface Provider {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  averageRating?: number;
  totalJobsCompleted?: number;
}

export const RequestDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [provider, setProvider] = useState<Provider | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchRequestDetail = useCallback(async () => {
    if (!token || !id) return;
    
    try {
      // Fetch request details
      const response = await api.get('/api/service-requests');
      const data = await handleResponse<{ success: boolean; data: ServiceRequest[] }>(response);
      const foundRequest = data.data.find((r: ServiceRequest) => r.id === parseInt(id));
      
      if (foundRequest) {
        setRequest(foundRequest);
        
        // If provider is assigned, fetch provider details
        if (foundRequest.assignedProviderId) {
          try {
            const providerResponse = await api.get(`/api/requests/${id}/assigned-provider`);
            const providerData = await handleResponse<{ success: boolean; data: Provider }>(providerResponse);
            setProvider(providerData.data);
          } catch (error) {
            console.error('Failed to fetch provider:', error);
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch request:', error);
    } finally {
      setIsLoading(false);
    }
  }, [token, id]);

  useEffect(() => {
    fetchRequestDetail();
  }, [fetchRequestDetail]);

  const handleConfirmProvider = async () => {
    if (!id) return;
    setIsProcessing(true);
    try {
      const response = await api.patch(`/api/service-requests/${id}/confirm-provider`);
      await handleResponse(response);
      await fetchRequestDetail();
      alert('Provider confirmed! Work will begin soon.');
    } catch (error) {
      console.error('Failed to confirm provider:', error);
      alert('Failed to confirm provider. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectProvider = async () => {
    if (!id || !confirm('Are you sure you want to reject this provider? Your request will be reopened and sent to other providers.')) {
      return;
    }
    setIsProcessing(true);
    try {
      const response = await api.patch(`/api/service-requests/${id}/reject-provider`);
      await handleResponse(response);
      await fetchRequestDetail();
      alert('Provider rejected. Your request has been reopened and sent to other qualified providers.');
    } catch (error) {
      console.error('Failed to reject provider:', error);
      alert('Failed to reject provider. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!id || !confirm('Are you sure you want to cancel this request?')) {
      return;
    }
    setIsProcessing(true);
    try {
      const response = await api.patch(`/api/service-requests/${id}/cancel`);
      await handleResponse(response);
      await fetchRequestDetail();
      alert('Request cancelled successfully.');
    } catch (error) {
      console.error('Failed to cancel request:', error);
      alert('Failed to cancel request. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'awaiting_customer_confirmation': return 'info';
      case 'confirmed': return 'primary';
      case 'in_progress': return 'primary';
      case 'completed': return 'success';
      case 'cancelled': return 'danger';
      default: return 'default';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <Card>
            <div className="p-6 space-y-4">
              <div className="h-6 bg-gray-200 rounded"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="p-8">
        <Card>
          <div className="p-8 text-center">
            <div className="text-4xl mb-4">❌</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Request Not Found</h2>
            <p className="text-gray-600 mb-4">
              This request may have been removed or you don't have access to it.
            </p>
            <Link to="/requests">
              <Button>Back to My Requests</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link to="/requests" className="text-blue-600 hover:text-blue-700 mb-4 inline-block">
          ← Back to My Requests
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Request Details</h1>
          <div className="flex gap-2">
            <Badge variant={getStatusColor(request.status)} size="md">
              {request.status.replace('_', ' ')}
            </Badge>
            <Badge variant={getUrgencyColor(request.urgency)} size="md">
              {request.urgency}
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Request Info Card */}
        <Card>
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{request.title}</h2>
            <p className="text-gray-700 mb-6">{request.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm font-medium text-gray-500">Address</p>
                <p className="text-gray-900">📍 {request.address}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Estimated Duration</p>
                <p className="text-gray-900">⏰ {request.estimatedHours} hour(s)</p>
              </div>
              {request.preferredDate && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Preferred Date</p>
                  <p className="text-gray-900">📅 {new Date(request.preferredDate).toLocaleDateString()}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-500">Category ID</p>
                <p className="text-gray-900">🏷️ {request.categoryId}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Tier ID</p>
                <p className="text-gray-900">⭐ {request.tierId}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Created</p>
                <p className="text-gray-900">📅 {new Date(request.createdAt).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Provider Info Card - Show if provider is assigned */}
        {provider && (
          <Card>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {request.status === 'awaiting_customer_confirmation' ? '⏳ Provider Awaiting Your Confirmation' : '👷‍♂️ Assigned Provider'}
              </h3>
              
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {provider.firstName[0]}{provider.lastName[0]}
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-900">
                    {provider.firstName} {provider.lastName}
                  </h4>
                  <p className="text-gray-600">{provider.email}</p>
                  <p className="text-gray-600">📞 {provider.phone}</p>
                  {provider.averageRating && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-yellow-500">★ {provider.averageRating.toFixed(1)}</span>
                      <span className="text-gray-500 text-sm">• {provider.totalJobsCompleted} jobs completed</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Confirmation buttons for awaiting_customer_confirmation status */}
              {request.status === 'awaiting_customer_confirmation' && (
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-purple-700 mb-4 bg-purple-50 p-3 rounded">
                    This provider has accepted your request. Please review their profile above and confirm to proceed with the work.
                  </p>
                  <div className="flex gap-3">
                    <Button
                      onClick={handleConfirmProvider}
                      disabled={isProcessing}
                      className="flex-1 bg-purple-600 hover:bg-purple-700"
                    >
                      {isProcessing ? 'Processing...' : '✓ Confirm Provider'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleRejectProvider}
                      disabled={isProcessing}
                      className="flex-1 border-purple-300 text-purple-700 hover:bg-purple-50"
                    >
                      ✕ Reject & Find Another
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Status Timeline */}
        <Card>
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Status Timeline</h3>
            <div className="space-y-4">
              {/* Created */}
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                  ✓
                </div>
                <div>
                  <p className="font-medium text-gray-900">Request Created</p>
                  <p className="text-sm text-gray-500">{new Date(request.createdAt).toLocaleString()}</p>
                </div>
              </div>

              {/* Provider Accepted */}
              {request.providerAcceptedAt && (
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                    ✓
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Provider Accepted</p>
                    <p className="text-sm text-gray-500">{new Date(request.providerAcceptedAt).toLocaleString()}</p>
                  </div>
                </div>
              )}

              {/* Customer Confirmed */}
              {request.customerConfirmedAt && (
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                    ✓
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Customer Confirmed</p>
                    <p className="text-sm text-gray-500">{new Date(request.customerConfirmedAt).toLocaleString()}</p>
                  </div>
                </div>
              )}

              {/* Work Started */}
              {request.startedAt && (
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600">
                    ✓
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Work Started</p>
                    <p className="text-sm text-gray-500">{new Date(request.startedAt).toLocaleString()}</p>
                  </div>
                </div>
              )}

              {/* Completed */}
              {request.completedAt && (
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                    ✓
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Work Completed</p>
                    <p className="text-sm text-gray-500">{new Date(request.completedAt).toLocaleString()}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <Card>
          <div className="p-6">
            <div className="flex gap-3 justify-end">
              {request.status === 'pending' && (
                <Button
                  variant="outline"
                  onClick={handleCancelRequest}
                  disabled={isProcessing}
                  className="border-red-300 text-red-700 hover:bg-red-50"
                >
                  Cancel Request
                </Button>
              )}
              {request.status === 'completed' && (
                <Button onClick={() => navigate(`/requests/${request.id}/review`)}>
                  Leave Review
                </Button>
              )}
              <Button variant="outline" onClick={() => navigate('/requests')}>
                Back to All Requests
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
