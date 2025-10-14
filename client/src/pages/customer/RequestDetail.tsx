import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Card, Button, Badge } from '../../components/ui';
import { AcceptedProvidersModal } from '../../components/customer';
import { api, handleResponse } from '../../services/apiClient';
import type { ServiceRequestDetailDto, ProviderWithContactDto } from '../../types/api';
import { formatDistanceToNow } from 'date-fns';
import { useSocketEvent, SocketEvents } from '../../hooks/useWebSocket';

interface SocketEventData {
  requestId?: number | string;
  [key: string]: unknown;
}

export const RequestDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [request, setRequest] = useState<ServiceRequestDetailDto | null>(null);
  const [provider, setProvider] = useState<ProviderWithContactDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [acceptedProviderCount, setAcceptedProviderCount] = useState<number>(0);
  const [isProvidersModalOpen, setIsProvidersModalOpen] = useState(false);

  const fetchAcceptedProviderCount = useCallback(async () => {
    if (!id) return;
    try {
      const response = await api.get(`/api/service-requests/${id}/accepted-providers`);
      const data = await handleResponse<{ 
        success: boolean; 
        data: { providers: Array<{ id: number }>; status: string } 
      }>(response);
      
      if (data.success && data.data) {
        setAcceptedProviderCount(data.data.providers.length);
      }
    } catch {
      // Silently fail - count just won't show
    }
  }, [id]);

  const fetchRequestDetail = useCallback(async () => {
    if (!token || !id) return;
    
    try {
      // Fetch request details
      const response = await api.get('/api/service-requests');
      const data = await handleResponse<{ success: boolean; data: ServiceRequestDetailDto[] }>(response);
      const foundRequest = data.data.find((r: ServiceRequestDetailDto) => r.id === parseInt(id));
      
      if (foundRequest) {
        setRequest(foundRequest);
        
        // Fetch accepted provider count for pending requests
        if (foundRequest.status === 'pending') {
          fetchAcceptedProviderCount();
        }
        
        // If provider is assigned, fetch provider details
        if (foundRequest.assignedProviderId) {
          try {
            const providerResponse = await api.get(`/api/requests/${id}/assigned-provider`);
            const providerData = await handleResponse<{ success: boolean; data: ProviderWithContactDto }>(providerResponse);
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
  }, [token, id, fetchAcceptedProviderCount]);

  useEffect(() => {
    fetchRequestDetail();
  }, [fetchRequestDetail]);

  // WebSocket: Listen for real-time updates for this specific request
  useSocketEvent(SocketEvents.REQUEST_STATUS_CHANGED, useCallback((data: SocketEventData) => {
    if (data.requestId && data.requestId.toString() === id) {
      console.log('🔔 Request status changed:', data);
      fetchRequestDetail();
    }
  }, [id, fetchRequestDetail]));

  useSocketEvent(SocketEvents.PROVIDER_ACCEPTED, useCallback((data: SocketEventData) => {
    if (data.requestId && data.requestId.toString() === id) {
      console.log('🔔 Provider accepted:', data);
      fetchRequestDetail();
      fetchAcceptedProviderCount();
    }
  }, [id, fetchRequestDetail, fetchAcceptedProviderCount]));

  useSocketEvent(SocketEvents.PROVIDER_CONFIRMED, useCallback((data: SocketEventData) => {
    if (data.requestId && data.requestId.toString() === id) {
      console.log('🔔 Provider confirmed:', data);
      fetchRequestDetail();
    }
  }, [id, fetchRequestDetail]));

  useSocketEvent(SocketEvents.WORK_STARTED, useCallback((data: SocketEventData) => {
    if (data.requestId && data.requestId.toString() === id) {
      console.log('🔔 Work started:', data);
      fetchRequestDetail();
    }
  }, [id, fetchRequestDetail]));

  useSocketEvent(SocketEvents.WORK_COMPLETED, useCallback((data: SocketEventData) => {
    if (data.requestId && data.requestId.toString() === id) {
      console.log('🔔 Work completed:', data);
      fetchRequestDetail();
    }
  }, [id, fetchRequestDetail]));

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
    if (!id || !request || !confirm(`Are you sure you want to cancel "${request.title}"?`)) {
      return;
    }
    
    const reason = prompt('Please provide a reason for cancellation (optional):');
    
    setIsProcessing(true);
    try {
      const response = await api.patch(`/api/service-requests/${id}/cancel`, { reason });
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

  const handleViewProviders = () => {
    setIsProvidersModalOpen(true);
  };

  const handleCloseProvidersModal = () => {
    setIsProvidersModalOpen(false);
  };

  const handleProviderConfirmed = () => {
    fetchRequestDetail(); // Refresh to show updated status
    setIsProvidersModalOpen(false);
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { variant: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info', label: string, icon: string }> = {
      pending: { variant: 'warning', label: 'Awaiting Providers', icon: '⏳' },
      assigned: { variant: 'info', label: 'Provider Assigned', icon: '✓' },
      in_progress: { variant: 'primary', label: 'In Progress', icon: '🔨' },
      completed: { variant: 'success', label: 'Completed', icon: '✅' },
      cancelled: { variant: 'danger', label: 'Cancelled', icon: '✕' },
    };
    
    const config = configs[status] || { variant: 'default' as const, label: status, icon: '•' };
    
    return (
      <Badge variant={config.variant} size="sm">
        <span className="inline-flex items-center gap-1">
          <span>{config.icon}</span>
          <span>{config.label}</span>
        </span>
      </Badge>
    );
  };

  const getUrgencyBadge = (urgency: string) => {
    const configs: Record<string, { variant: 'default' | 'primary' | 'success' | 'warning' | 'danger', icon: string }> = {
      emergency: { variant: 'danger', icon: '🚨' },
      high: { variant: 'danger', icon: '🔴' },
      medium: { variant: 'warning', icon: '🟡' },
      low: { variant: 'success', icon: '🟢' },
    };
    
    const config = configs[urgency] || { variant: 'default' as const, icon: '•' };
    
    return (
      <Badge variant={config.variant} size="sm">
        <span className="inline-flex items-center gap-1">
          <span>{config.icon}</span>
          <span className="capitalize">{urgency}</span>
        </span>
      </Badge>
    );
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
            <h2 className="text-xl font-bold text-white-900 mb-2">Request Not Found</h2>
            <p className="text-white-600 mb-4">
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
          <h1 className="text-3xl font-bold text-white-900">Request Details</h1>
          <div className="flex gap-2">
            {getStatusBadge(request.status)}
            {getUrgencyBadge(request.urgency)}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Request Info Card */}
        <Card>
          <div className="p-6">
            <h2 className="text-2xl font-bold text-white-900 mb-4">{request.title}</h2>
            <p className="text-white-700 mb-6">{request.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm font-medium text-white-500 mb-1">🏷️ Category</p>
                <p className="text-white-900">{request.category?.name || `Category ID: ${request.categoryId}`}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-white-500 mb-1">⏰ Estimated Hours</p>
                <p className="text-white-900">{request.estimatedHours}h estimated</p>
              </div>
              <div>
                <p className="text-sm font-medium text-white-500 mb-1">📍 Location</p>
                <p className="text-white-900">{request.address}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-white-500 mb-1">📅 Created</p>
                <p className="text-white-900">{formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}</p>
              </div>
              {request.preferredDate && (
                <div>
                  <p className="text-sm font-medium text-white-500 mb-1">📅 Preferred Date</p>
                  <p className="text-white-900">{new Date(request.preferredDate).toLocaleDateString()}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-white-500 mb-1">⭐ Service Tier</p>
                <p className="text-white-900">{request.tier?.name || `Tier ID: ${request.tierId}`}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Accepted Providers Alert */}
        {request.status === 'pending' && acceptedProviderCount > 0 && (
          <Card>
            <div className="p-6">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg p-4 animate-pulse">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">👋</span>
                  <div className="flex-1">
                    <p className="font-semibold text-blue-900 mb-1">
                      {acceptedProviderCount === 1 
                        ? '1 provider has accepted!'
                        : `${acceptedProviderCount} providers have accepted!`
                      }
                    </p>
                    <p className="text-sm text-blue-700 mb-3">
                      Review their profiles and choose the best match for your needs.
                    </p>
                    <Button
                      size="sm"
                      onClick={handleViewProviders}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      👤 View & Select Provider
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Assigned/In Progress Status */}
        {(request.status === 'assigned' || request.status === 'in_progress') && (
          <Card>
            <div className={`p-6 rounded-lg border-2 ${
              request.status === 'in_progress' 
                ? 'bg-yellow-50 border-yellow-200' 
                : 'bg-blue-50 border-blue-200'
            }`}>
              <div className="flex items-center gap-2">
                <span className="text-2xl">
                  {request.status === 'in_progress' ? '🔨' : '✓'}
                </span>
                <div>
                  <p className="font-semibold text-white-900">
                    {request.status === 'in_progress' ? 'Work in Progress' : 'Provider Confirmed'}
                  </p>
                  <p className="text-sm text-white-600">
                    {request.status === 'in_progress' 
                      ? 'Your service provider is currently working on this request'
                      : 'A provider has been assigned and will start soon'
                    }
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Completed Status */}
        {request.status === 'completed' && (
          <Card>
            <div className="p-6">
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">✅</span>
                  <div>
                    <p className="font-semibold text-green-900">Work Completed!</p>
                    <p className="text-sm text-green-700">
                      Please review your service provider's work
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Provider Info Card - Show if provider is assigned */}
        {provider && (
          <Card>
            <div className="p-6">
              <h3 className="text-xl font-bold text-white-900 mb-4">
                {request.status === 'pending' && request.assignedProviderId ? '⏳ Provider Awaiting Your Confirmation' : '👷‍♂️ Assigned Provider'}
              </h3>
              
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {provider.firstName[0]}{provider.lastName[0]}
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-white-900">
                    {provider.firstName} {provider.lastName}
                  </h4>
                  <p className="text-white-600">{provider.email}</p>
                  <p className="text-white-600">📞 {provider.phone}</p>
                  {provider.averageRating && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-yellow-500">★ {provider.averageRating.toFixed(1)}</span>
                      <span className="text-white-500 text-sm">• {provider.totalJobsCompleted} jobs completed</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Confirmation buttons for pending status with assigned provider */}
              {request.status === 'pending' && request.assignedProviderId && (
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
            <h3 className="text-xl font-bold text-white-900 mb-4">Status Timeline</h3>
            <div className="space-y-4">
              {/* Created */}
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                  ✓
                </div>
                <div>
                  <p className="font-medium text-white-900">Request Created</p>
                  <p className="text-sm text-white-500">{new Date(request.createdAt).toLocaleString()}</p>
                </div>
              </div>

              {/* Provider Assigned */}
              {request.assignedAt && (
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                    ✓
                  </div>
                  <div>
                    <p className="font-medium text-white-900">Provider Assigned</p>
                    <p className="text-sm text-white-500">{new Date(request.assignedAt).toLocaleString()}</p>
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
                    <p className="font-medium text-white-900">Work Started</p>
                    <p className="text-sm text-white-500">{new Date(request.startedAt).toLocaleString()}</p>
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
                    <p className="font-medium text-white-900">Work Completed</p>
                    <p className="text-sm text-white-500">{new Date(request.completedAt).toLocaleString()}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-white-900 mb-4">Actions</h3>
            <div className="flex flex-wrap gap-2">
              {request.status === 'pending' && acceptedProviderCount === 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleViewProviders}
                >
                  👥 Check for Providers
                </Button>
              )}
              
              {request.status === 'pending' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancelRequest}
                  disabled={isProcessing}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  {isProcessing ? 'Processing...' : '✕ Cancel Request'}
                </Button>
              )}
              
              {request.status === 'completed' && (
                <Button 
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => navigate(`/requests/${request.id}/review`)}
                >
                  ⭐ Leave Review
                </Button>
              )}
              
              <Button 
                size="sm"
                variant="outline" 
                onClick={() => navigate('/requests')}
              >
                ← Back to All Requests
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Accepted Providers Modal */}
      {request && (
        <AcceptedProvidersModal
          requestId={request.id}
          requestTitle={request.title}
          isOpen={isProvidersModalOpen}
          onClose={handleCloseProvidersModal}
          onProviderConfirmed={handleProviderConfirmed}
        />
      )}
    </div>
  );
};
