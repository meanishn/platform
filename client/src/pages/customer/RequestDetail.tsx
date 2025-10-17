/**
 * RequestDetail Page
 * 
 * Displays detailed information about a specific service request.
 * REFACTORED: Following design system and refactor guidelines.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Card, Button, LoadingSkeleton, EmptyState, PageContainer, BackLink, ReviewModal, SubmitReviewModal } from '../../components/ui';
import { 
  AcceptedProvidersModal,
  RequestInfoGrid,
  StatusAlertCard,
  ProviderInfoCard,
  StatusTimeline,
} from '../../components/customer';
import { api, handleResponse } from '../../services/apiClient';
import type { ServiceRequestDetailDto, ProviderWithContactDto, ReviewDetailDto, ApiResponse, CanReviewResponse } from '../../types/api';
import { useSocketEvent, SocketEvents } from '../../hooks/useWebSocket';
import { useConfirmationModal } from '../../hooks/useConfirmationModal';
import { getStatusBadge, getUrgencyBadge } from '../../utils/badgeHelpers';
import { Users, X, AlertTriangle, Star, MessageSquare } from 'lucide-react';

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
  
  // Review states
  const [reviews, setReviews] = useState<ReviewDetailDto[]>([]);
  const [canReview, setCanReview] = useState<boolean>(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isSubmitReviewModalOpen, setIsSubmitReviewModalOpen] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  
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

  const fetchReviews = useCallback(async () => {
    if (!id) return;
    
    try {
      const response = await api.get(`/api/reviews/request/${id}`);
      const data = await handleResponse<ApiResponse<ReviewDetailDto[]>>(response);
      
      if (data.success && data.data) {
        setReviews(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    }
  }, [id]);

  const checkCanReview = useCallback(async () => {
    if (!id || !token) return;
    
    try {
      const response = await api.get(`/api/reviews/request/${id}/can-review`);
      const data = await handleResponse<ApiResponse<CanReviewResponse>>(response);
      
      if (data.success && data.data) {
        setCanReview(data.data.canReview);
      }
    } catch (error) {
      console.error('Failed to check review status:', error);
    }
  }, [id, token]);

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

        // Always fetch reviews to show existing reviews at any stage
        fetchReviews();
        
        // Check if user can review (only possible after completion)
        if (foundRequest.status === 'completed') {
          checkCanReview();
        }
      }
    } catch (error) {
      console.error('Failed to fetch request:', error);
    } finally {
      setIsLoading(false);
    }
  }, [token, id, fetchAcceptedProviderCount, fetchReviews, checkCanReview]);

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

  const handleViewReviews = () => {
    setIsReviewModalOpen(true);
  };

  const handleSubmitReview = async (rating: number, comment: string) => {
    if (!id) return;
    
    setIsSubmittingReview(true);
    try {
      const response = await api.post(`/api/reviews/${id}`, {
        rating,
        comment,
        isPublic: true,
      });
      
      await handleResponse(response);
      
      // Refresh data to hide "Leave Review" button
      await fetchReviews();
      await checkCanReview();
      
      // Modal will show success message and auto-close
    } catch (error) {
      console.error('Failed to submit review:', error);
      throw error;
    } finally {
      setIsSubmittingReview(false);
    }
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
        <div className="space-y-3 sm:space-y-4">
        <BackLink to="/requests">Back to My Requests</BackLink>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 leading-tight">Request Details</h1>
          <div className="flex flex-wrap gap-2">
            {getStatusBadge(request.status)}
            {getUrgencyBadge(request.urgency)}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-4 sm:space-y-6">
        {/* Request Info Card */}
        <Card>
          <div className="p-4 sm:p-5 md:p-6">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 mb-3 sm:mb-4">{request.title}</h2>
            <p className="text-sm sm:text-base text-slate-700 mb-4 sm:mb-6 leading-relaxed">{request.description}</p>
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
            reviews={reviews.filter(review => review.revieweeId === provider.id)}
            onViewReviews={handleViewReviews}
          />
        )}

        {/* Status Timeline */}
        <StatusTimeline request={request} />

        {/* Action Buttons */}
        <Card>
          <div className="p-4 sm:p-5 md:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-3 sm:mb-4">Actions</h3>
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2">
              {request.status === 'pending' && acceptedProviderCount === 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleViewProviders}
                  className="w-full sm:w-auto"
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
                  className="w-full sm:w-auto text-red-600 border-red-300 hover:bg-red-50"
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
              
              {/* Show reviews button at all stages if reviews exist */}
              {reviews.length > 0 && (
                <Button 
                  size="sm"
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={handleViewReviews}
                >
                  <span className="inline-flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4" strokeWidth={2} />
                    <span>View Reviews ({reviews.length})</span>
                  </span>
                </Button>
              )}
              
              {/* Only show "Leave Review" button when completed and eligible */}
              {request.status === 'completed' && canReview && (
                <Button 
                  size="sm"
                  className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600"
                  onClick={() => setIsSubmitReviewModalOpen(true)}
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
                className="w-full sm:w-auto"
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

      {/* Review Modals */}
      {request && (
        <>
          <ReviewModal
            isOpen={isReviewModalOpen}
            onClose={() => setIsReviewModalOpen(false)}
            reviews={reviews}
            title="Job Reviews"
          />
          
          <SubmitReviewModal
            isOpen={isSubmitReviewModalOpen}
            onClose={() => setIsSubmitReviewModalOpen(false)}
            onSubmit={handleSubmitReview}
            revieweeName={provider ? `${provider.firstName} ${provider.lastName}` : 'Service Provider'}
            isSubmitting={isSubmittingReview}
          />
        </>
      )}
    </PageContainer>
  );
};
