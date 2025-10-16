import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Card, Button, Badge } from '../../components/ui';
import { AcceptedProvidersModal } from '../../components/customer';
import { api, handleResponse } from '../../services/apiClient';
import type { ServiceRequestDetailDto, ProviderWithContactDto } from '../../types/api';
import { formatDistanceToNow } from 'date-fns';
import { useSocketEvent, SocketEvents } from '../../hooks/useWebSocket';
import { useConfirmationModal } from '../../hooks/useConfirmationModal';
import { 
  Users, 
  Clock, 
  CheckCircle2, 
  Phone, 
  Hourglass, 
  Check, 
  Hammer, 
  X, 
  AlertTriangle, 
  AlertCircle, 
  Circle, 
  Tag, 
  MapPin, 
  Calendar, 
  Star 
} from 'lucide-react';

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
  
  const { confirm: confirmCancel, ConfirmationModalComponent: CancelConfirmationModal } = useConfirmationModal();

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
    if (!id || !request) {
      return;
    }
    
    confirmCancel(
      {
        title: 'Cancel Request',
        message: `Are you sure you want to cancel "${request.title}"? This action cannot be undone.`,
        confirmText: 'Cancel Request',
        cancelText: 'Go Back',
        confirmVariant: 'danger',
        requireReason: false,
        reasonLabel: 'Cancellation Reason (Optional)',
        reasonPlaceholder: 'Please provide a reason for cancellation...',
        warningMessage: 'The service provider will be notified of this cancellation.',
        icon: AlertTriangle,
      },
      async (reason) => {
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
      }
    );
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
    const configs: Record<string, { 
      variant: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info', 
      label: string, 
      IconComponent: typeof Clock 
    }> = {
      pending: { variant: 'warning', label: 'Awaiting Providers', IconComponent: Hourglass },
      assigned: { variant: 'info', label: 'Provider Assigned', IconComponent: Check },
      in_progress: { variant: 'primary', label: 'In Progress', IconComponent: Hammer },
      completed: { variant: 'success', label: 'Completed', IconComponent: CheckCircle2 },
      cancelled: { variant: 'danger', label: 'Cancelled', IconComponent: X },
    };
    
    const config = configs[status] || { variant: 'default' as const, label: status, IconComponent: Circle };
    const Icon = config.IconComponent;
    
    return (
      <Badge variant={config.variant} size="sm">
        <span className="inline-flex items-center gap-1.5">
          <Icon className="w-3.5 h-3.5" strokeWidth={2} />
          <span>{config.label}</span>
        </span>
      </Badge>
    );
  };

  const getUrgencyBadge = (urgency: string) => {
    const configs: Record<string, { 
      variant: 'default' | 'primary' | 'success' | 'warning' | 'danger', 
      IconComponent: typeof AlertTriangle 
    }> = {
      emergency: { variant: 'danger', IconComponent: AlertTriangle },
      high: { variant: 'danger', IconComponent: AlertCircle },
      medium: { variant: 'warning', IconComponent: AlertCircle },
      low: { variant: 'success', IconComponent: Circle },
    };
    
    const config = configs[urgency] || { variant: 'default' as const, IconComponent: Circle };
    const Icon = config.IconComponent;
    
    return (
      <Badge variant={config.variant} size="sm">
        <span className="inline-flex items-center gap-1.5">
          <Icon className="w-3.5 h-3.5" strokeWidth={2} />
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
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <X className="w-8 h-8 text-red-600" strokeWidth={2} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Request Not Found</h2>
            <p className="text-slate-600 mb-4">
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
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
        {/* Header */}
        <div className="mb-6">
        <Link to="/requests" className="text-slate-700 hover:text-slate-900 mb-4 inline-block">
          ← Back to My Requests
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-900">Request Details</h1>
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
            <h2 className="text-2xl font-bold text-slate-900 mb-4">{request.title}</h2>
            <p className="text-slate-700 mb-6">{request.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1 flex items-center gap-1.5">
                  <Tag className="w-4 h-4" strokeWidth={2} />
                  <span>Category</span>
                </p>
                <p className="text-slate-900">{request.category?.name || `Category ID: ${request.categoryId}`}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1 flex items-center gap-1.5">
                  <Clock className="w-4 h-4" strokeWidth={2} />
                  <span>Estimated Hours</span>
                </p>
                <p className="text-slate-900">{request.estimatedHours}h estimated</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" strokeWidth={2} />
                  <span>Location</span>
                </p>
                <p className="text-slate-900">{request.address}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" strokeWidth={2} />
                  <span>Created</span>
                </p>
                <p className="text-slate-900">{formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}</p>
              </div>
              {request.preferredDate && (
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" strokeWidth={2} />
                    <span>Preferred Date</span>
                  </p>
                  <p className="text-slate-900">{new Date(request.preferredDate).toLocaleDateString()}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1 flex items-center gap-1.5">
                  <Star className="w-4 h-4" strokeWidth={2} />
                  <span>Service Tier</span>
                </p>
                <p className="text-slate-900">{request.tier?.name || `Tier ID: ${request.tierId}`}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Accepted Providers Alert */}
        {request.status === 'pending' && acceptedProviderCount > 0 && (
          <Card>
            <div className="p-6">
              <div className="bg-emerald-50 border-l-4 border-emerald-600 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0 border border-emerald-200">
                    <Users className="w-5 h-5 text-emerald-700" strokeWidth={2} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900 mb-1">
                      {acceptedProviderCount === 1 
                        ? '1 provider has accepted!'
                        : `${acceptedProviderCount} providers have accepted!`
                      }
                    </p>
                    <p className="text-sm text-slate-600 mb-3">
                      Review their profiles and choose the best match for your needs.
                    </p>
                    <Button
                      size="sm"
                      onClick={handleViewProviders}
                      className="bg-slate-700 hover:bg-slate-800 text-white font-medium"
                    >
                      View & Select Provider
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
            <div className={`p-6 rounded-lg border ${
              request.status === 'in_progress' 
                ? 'bg-amber-50 border-amber-200' 
                : 'bg-blue-50 border-blue-200'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  request.status === 'in_progress'
                    ? 'bg-amber-100 text-amber-600'
                    : 'bg-blue-100 text-blue-600'
                }`}>
                  {request.status === 'in_progress' 
                    ? <Hammer className="w-5 h-5" strokeWidth={2} />
                    : <Check className="w-5 h-5" strokeWidth={2} />
                  }
                </div>
                <div>
                  <p className="font-semibold text-slate-900">
                    {request.status === 'in_progress' ? 'Work in Progress' : 'Provider Confirmed'}
                  </p>
                  <p className="text-sm text-slate-700">
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
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="font-semibold text-emerald-900">Work Completed!</p>
                    <p className="text-sm text-emerald-700">
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
              <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                {request.status === 'pending' && request.assignedProviderId ? (
                  <>
                    <Clock className="w-5 h-5 text-amber-600" strokeWidth={2} />
                    <span>Provider Awaiting Your Confirmation</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" strokeWidth={2} />
                    <span>Assigned Provider</span>
                  </>
                )}
              </h3>
              
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-shrink-0 w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 text-2xl font-bold border-2 border-slate-300">
                  {provider.firstName[0]}{provider.lastName[0]}
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-slate-900">
                    {provider.firstName} {provider.lastName}
                  </h4>
                  <p className="text-slate-600">{provider.email}</p>
                  <p className="text-slate-600 flex items-center gap-1.5">
                    <Phone className="w-4 h-4" strokeWidth={2} />
                    <span>{provider.phone}</span>
                  </p>
                  {provider.averageRating && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-amber-600">★ {provider.averageRating.toFixed(1)}</span>
                      <span className="text-slate-500 text-sm">• {provider.totalJobsCompleted} jobs completed</span>
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
                      <span className="inline-flex items-center gap-1.5">
                        {isProcessing ? (
                          'Processing...'
                        ) : (
                          <>
                            <Check className="w-4 h-4" strokeWidth={2} />
                            <span>Confirm Provider</span>
                          </>
                        )}
                      </span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleRejectProvider}
                      disabled={isProcessing}
                      className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                    >
                      <span className="inline-flex items-center gap-1.5">
                        <X className="w-4 h-4" strokeWidth={2} />
                        <span>Reject & Find Another</span>
                      </span>
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
            <h3 className="text-xl font-bold text-slate-900 mb-4">Status Timeline</h3>
            <div className="space-y-4">
              {/* Created */}
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-blue-600" strokeWidth={2} />
                </div>
                <div>
                  <p className="font-medium text-slate-900">Request Created</p>
                  <p className="text-sm text-slate-600">{new Date(request.createdAt).toLocaleString()}</p>
                </div>
              </div>

              {/* Provider Assigned */}
              {request.assignedAt && (
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-purple-600" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Provider Assigned</p>
                    <p className="text-sm text-slate-600">{new Date(request.assignedAt).toLocaleString()}</p>
                  </div>
                </div>
              )}

              {/* Work Started */}
              {request.startedAt && (
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-amber-600" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Work Started</p>
                    <p className="text-sm text-slate-600">{new Date(request.startedAt).toLocaleString()}</p>
                  </div>
                </div>
              )}

              {/* Completed */}
              {request.completedAt && (
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-emerald-600" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Work Completed</p>
                    <p className="text-sm text-slate-600">{new Date(request.completedAt).toLocaleString()}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Actions</h3>
            <div className="flex flex-wrap gap-2">
              {request.status === 'pending' && acceptedProviderCount === 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleViewProviders}
                >
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="w-4 h-4" strokeWidth={2} />
                    <span>Check for Providers</span>
                  </span>
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
                  <span className="inline-flex items-center gap-1.5">
                    {isProcessing ? (
                      'Processing...'
                    ) : (
                      <>
                        <X className="w-4 h-4" strokeWidth={2} />
                        <span>Cancel Request</span>
                      </>
                    )}
                  </span>
                </Button>
              )}
              
              {request.status === 'completed' && (
                <Button 
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => navigate(`/requests/${request.id}/review`)}
                >
                  <span className="inline-flex items-center gap-1.5">
                    <Star className="w-4 h-4" strokeWidth={2} />
                    <span>Leave Review</span>
                  </span>
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
      
      {/* Cancel Request Confirmation Modal */}
      {CancelConfirmationModal}
      </div>
    </div>
  );
};
