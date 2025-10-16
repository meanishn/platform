/**
 * RequestDetail Page
 * 
 * Displays detailed information about a specific service request.
 * REFACTORED: Following design system and refactor guidelines.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Card, Button, LoadingSkeleton, EmptyState, PageContainer, BackLink } from '../../components/ui';
import { 
  AcceptedProvidersModal,
  RequestInfoGrid,
  StatusAlertCard,
  ProviderInfoCard,
  StatusTimeline,
} from '../../components/customer';
import { api, handleResponse } from '../../services/apiClient';
import type { ServiceRequestDetailDto, ProviderWithContactDto } from '../../types/api';
import { useSocketEvent, SocketEvents } from '../../hooks/useWebSocket';
import { useConfirmationModal } from '../../hooks/useConfirmationModal';
import { getStatusBadge, getUrgencyBadge } from '../../utils/badgeHelpers';
import { Users, X, AlertTriangle, Star } from 'lucide-react';

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

  if (isLoading) {
    return (
      <div className="p-8">
        <LoadingSkeleton type="page" count={1} />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="p-8">
        <EmptyState
          icon={X}
          title="Request Not Found"
          description="This request may have been removed or you don't have access to it."
          action={{
            label: 'Back to My Requests',
            onClick: () => navigate('/requests'),
          }}
        />
      </div>
    );
  }

  return (
    <PageContainer maxWidth="7xl">
        {/* Header */}
        <div>
        <BackLink to="/requests">Back to My Requests</BackLink>
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
            <RequestInfoGrid request={request} />
          </div>
        </Card>

        {/* Accepted Providers Alert */}
        {request.status === 'pending' && acceptedProviderCount > 0 && (
          <StatusAlertCard
            type="accepted_providers"
            providerCount={acceptedProviderCount}
            onViewProviders={handleViewProviders}
          />
        )}

        {/* Assigned Status */}
        {request.status === 'assigned' && (
          <StatusAlertCard type="assigned" />
        )}

        {/* In Progress Status */}
        {request.status === 'in_progress' && (
          <StatusAlertCard type="in_progress" />
        )}

        {/* Completed Status */}
        {request.status === 'completed' && (
          <StatusAlertCard type="completed" />
        )}

        {/* Provider Info Card - Show if provider is assigned */}
        {provider && (
          <ProviderInfoCard
            provider={provider}
            status={request.status}
            isPending={!!request.assignedProviderId}
            isProcessing={isProcessing}
            onConfirm={handleConfirmProvider}
            onReject={handleRejectProvider}
          />
        )}

        {/* Status Timeline */}
        <StatusTimeline request={request} />

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
    </PageContainer>
  );
};
