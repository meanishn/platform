/**
 * JobDetailsModal Component
 * Shows full job details with progressive disclosure
 * BEFORE accepting: Partial customer info (name initial, rating)
 * AFTER assigned: Full customer contact (phone, email, address)
 * 
 * Uses provider-specific endpoint: GET /api/providers/requests/:id
 * - Includes match metadata (score, rank, distance)
 * - Progressive customer contact disclosure
 * - No assignedProvider confusion (provider knows it's them)
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Button, Badge, InfoBox, ContactLinkCard, InfoAlert, ReviewModal, SubmitReviewModal, StarRating } from '../ui';
import { MatchBadge, CustomerInfoHeader } from '../provider';
import { providerApi } from '../../services/apiService';
import { useNotificationService } from '../../services/notificationService';
import { api, handleResponse } from '../../services/apiClient';
import type { ProviderJobDetailDto, ProviderActionRequest, ReviewDetailDto, ApiResponse, CanReviewResponse } from '../../types/api';
import type { PublicUserDto } from '../../../../shared-types/user';
import type { CustomerWithContactDto } from '../../../../shared-types/user';
import { 
  MapPin, 
  Clock, 
  Calendar, 
  DollarSign, 
  Camera,
  User,
  Phone,
  Mail,
  AlertCircle,
  CheckCircle,
  Rocket,
  ExternalLink,
  X,
  Star
} from 'lucide-react';

interface JobDetailsModalProps {
  jobId: number;
  isOpen: boolean;
  onClose: () => void;
  onActionComplete?: () => void;
}

export const JobDetailsModal: React.FC<JobDetailsModalProps> = ({
  jobId,
  isOpen,
  onClose,
  onActionComplete
}) => {
  const notify = useNotificationService();
  const [job, setJob] = useState<ProviderJobDetailDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActioning, setIsActioning] = useState(false);
  const [showDeclineReason, setShowDeclineReason] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  
  // Review states
  const [reviews, setReviews] = useState<ReviewDetailDto[]>([]);
  const [canReview, setCanReview] = useState<boolean>(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isSubmitReviewModalOpen, setIsSubmitReviewModalOpen] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const fetchReviews = useCallback(async () => {
    try {
      const response = await api.get(`/api/reviews/request/${jobId}`);
      const data = await handleResponse<ApiResponse<ReviewDetailDto[]>>(response);
      
      if (data.success && data.data) {
        setReviews(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    }
  }, [jobId]);

  const checkCanReview = useCallback(async () => {
    try {
      const response = await api.get(`/api/reviews/request/${jobId}/can-review`);
      const data = await handleResponse<ApiResponse<CanReviewResponse>>(response);
      
      if (data.success && data.data) {
        setCanReview(data.data.canReview);
      }
    } catch (error) {
      console.error('Failed to check review status:', error);
    }
  }, [jobId]);

  const fetchJobDetails = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await providerApi.getJobDetails(jobId);
      
      if (response.success && response.data) {
        setJob(response.data);
        
        // Always fetch reviews to show existing reviews at any stage
        fetchReviews();
        
        // Check if user can review (only possible after completion)
        if (response.data.status === 'completed') {
          checkCanReview();
        }
      } else {
        notify.error('Error', response.message || 'Failed to load job details');
      }
    } catch (error) {
      console.error('Failed to fetch job details:', error);
      notify.error('Error', 'Failed to load job details');
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId, fetchReviews, checkCanReview]);

  useEffect(() => {
    if (isOpen && jobId) {
      fetchJobDetails();
    }
  }, [isOpen, jobId, fetchJobDetails]);

  const handleAction = async (action: ProviderActionRequest) => {
    try {
      setIsActioning(true);
      const response = await providerApi.performAction(jobId, action);
      
      if (response.success && response.data) {
        notify.success('Success', response.data.message || `Job ${action.action}ed successfully`);
        onClose();
        onActionComplete?.();
      } else {
        notify.error('Error', response.message || `Failed to ${action.action} job`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Failed to ${action.action} job`;
      notify.error('Error', errorMessage);
    } finally {
      setIsActioning(false);
    }
  };

  const handleAccept = () => {
    handleAction({ action: 'accept' });
  };

  const handleDeclineConfirm = () => {
    if (!declineReason.trim()) {
      notify.warning('Required', 'Please provide a reason for declining');
      return;
    }
    handleAction({ action: 'decline', reason: declineReason });
  };

  const handleViewReviews = () => {
    setIsReviewModalOpen(true);
  };

  const handleSubmitReview = async (rating: number, comment: string) => {
    setIsSubmittingReview(true);
    try {
      const response = await api.post(`/api/reviews/${jobId}`, {
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

  const getUrgencyBadge = (urgency: string) => {
    const configs: Record<string, { variant: 'danger' | 'warning' | 'info' | 'default' }> = {
      emergency: { variant: 'danger' },
      high: { variant: 'warning' },
      medium: { variant: 'info' },
      low: { variant: 'default' }
    };
    
    const config = configs[urgency] || configs.low;
    return (
      <Badge variant={config.variant}>
        {urgency.toUpperCase()}
      </Badge>
    );
  };

  const isAssigned = job?.status === 'assigned' || job?.status === 'in_progress';
  const isAvailable = job?.status === 'pending';
  const isCompleted = job?.status === 'completed';

  // Type guard to check if customer has contact info (assigned provider view)
  const hasCustomerContact = (customer: PublicUserDto | CustomerWithContactDto): customer is CustomerWithContactDto => {
    return customer && 'email' in customer;
  };

  // Get customer with proper typing - will have contact info if assigned
  const customerWithContact = job?.customer && hasCustomerContact(job.customer) ? job.customer : null;

  if (!isOpen) return null;

  return (
    <Modal title="Job Detail" isOpen={isOpen} onClose={onClose} size="lg" theme="light" noPadding={true}>
      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-700"></div>
              <p className="text-slate-600">Loading job details...</p>
            </div>
          </div>
        ) : job ? (
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight">
                    {job.title}
                  </h2>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2 flex-wrap">
                {isAssigned && (
                  <Badge variant="success" className="text-sm flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    ASSIGNED TO YOU
                  </Badge>
                )}
                {isAvailable && (
                  <Badge variant="info" className="text-sm flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    AVAILABLE
                  </Badge>
                )}
                {job.urgency && getUrgencyBadge(job.urgency)}
              </div>
            </div>

            {/* Match Quality - Only for available jobs */}
            {isAvailable && (job.matchScore || job.rank || job.distanceMiles) && (
              <div className="bg-emerald-50 border-l-4 border-emerald-600 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <MatchBadge
                    score={job.matchScore}
                    rank={job.rank}
                    distance={job.distanceMiles}
                  />
                </div>
                <div className="space-y-2 text-sm text-slate-700">
                  <p className="font-semibold text-slate-900 flex items-center gap-2">
                    <Star className="w-4 h-4 text-emerald-600" />
                    Why you're a great match:
                  </p>
                  <ul className="space-y-1 ml-4">
                    {job.matchScore && job.matchScore >= 90 && (
                      <li>• Perfect skill match ({job.category.name} Expert)</li>
                    )}
                    {job.rank === 1 && (
                      <li>• You're the closest qualified provider</li>
                    )}
                    {job.distanceMiles && job.distanceMiles < 5 && (
                      <li>• Very close to your location</li>
                    )}
                    <li>• Available at preferred time</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Description</h3>
              <p className="text-slate-700 leading-relaxed">{job.description}</p>
            </div>

            {/* Job Details */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoBox 
                  icon={MapPin}
                  label="Location"
                  value={isAssigned ? job.address : 'General Area: Downtown'}
                />
                <InfoBox 
                  icon={Clock}
                  label="Estimated Duration"
                  value={job.estimatedHours ? `${job.estimatedHours} hours` : 'TBD'}
                />
                <InfoBox 
                  icon={Calendar}
                  label="Preferred Date"
                  value={job.preferredDate 
                    ? new Date(job.preferredDate).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit'
                      })
                    : 'Flexible'}
                />
                <InfoBox 
                  icon={DollarSign}
                  label="Rate"
                  value={`$${job.tier.baseHourlyRate}/hour (${job.tier.name} Tier)`}
                />
              </div>
            </div>

            {/* Photos - TODO: Add photo gallery */}
            {job.images && job.images.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Photos ({job.images.length})
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {job.images.map((image, index) => (
                    <div key={index} className="aspect-video bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center">
                      <img src={image} alt={`Job photo ${index + 1}`} className="w-full h-full object-cover rounded-lg" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Customer Information */}
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <User className="w-5 h-5" />
                {isAssigned ? 'Customer Details' : 'Customer Information'}
              </h3>
              
              {isAvailable ? (
                /* BEFORE Assignment - Partial Info */
                <div className="space-y-3">
                  <CustomerInfoHeader 
                    firstName={job.customer.firstName}
                    lastName={job.customer.lastName}
                    averageRating={job.customer.averageRating}
                    totalJobsCompleted={job.customer.totalJobsCompleted}
                    showFullLastName={false}
                  />
                  
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="success" className="text-xs flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" strokeWidth={2} />
                      Verified Customer
                    </Badge>
                    <Badge variant="default" className="text-xs">Always Pays On Time</Badge>
                  </div>

                  {/* Reviews - Simple inline display */}
                  <div className="pt-3 border-t border-slate-200/60">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <StarRating rating={job.customer.averageRating || 0} readonly size="sm" />
                        <span className="text-xs text-slate-600">
                          {reviews.length > 0 
                            ? `${reviews.length} ${reviews.length === 1 ? 'review' : 'reviews'}`
                            : 'No reviews yet'
                          }
                        </span>
                      </div>
                      {reviews.length > 0 && (
                        <button
                          onClick={handleViewReviews}
                          className="text-xs text-blue-600 hover:text-blue-700 underline cursor-pointer"
                        >
                          View reviews
                        </button>
                      )}
                    </div>
                  </div>

                  <InfoAlert icon={AlertCircle} variant="warning" className="mt-4">
                    Full contact details (phone, email, exact address) will be shown after customer assigns this job to you.
                  </InfoAlert>
                </div>
              ) : (
                /* AFTER Assignment - Full Contact Info */
                <div className="space-y-4">
                  <CustomerInfoHeader 
                    firstName={job.customer.firstName}
                    lastName={job.customer.lastName}
                    averageRating={job.customer.averageRating}
                    totalJobsCompleted={job.customer.totalJobsCompleted}
                    showFullLastName={true}
                  />

                  {/* Reviews - Simple inline display */}
                  <div className="pt-2 pb-3 border-b border-slate-200/60">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <StarRating rating={job.customer.averageRating || 0} readonly size="sm" />
                        <span className="text-xs text-slate-600">
                          {reviews.length > 0 
                            ? `${reviews.length} ${reviews.length === 1 ? 'review' : 'reviews'}`
                            : 'No reviews yet'
                          }
                        </span>
                      </div>
                      {reviews.length > 0 && (
                        <button
                          onClick={handleViewReviews}
                          className="text-xs text-blue-600 hover:text-blue-700 underline cursor-pointer"
                        >
                          View reviews
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <ContactLinkCard 
                      icon={Phone}
                      label="Phone"
                      value={customerWithContact?.phone || 'Not available'}
                      href={`tel:${customerWithContact?.phone || ''}`}
                    />

                    <ContactLinkCard 
                      icon={Mail}
                      label="Email"
                      value={customerWithContact?.email || 'Not available'}
                      href={`mailto:${customerWithContact?.email || ''}`}
                    />

                    <ContactLinkCard 
                      icon={MapPin}
                      label="Address"
                      value={job.address}
                      href={`https://maps.google.com/?q=${encodeURIComponent(job.address)}`}
                      rightIcon={ExternalLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-200">
              {isAvailable && !showDeclineReason && (
                <>
                  <Button
                    onClick={handleAccept}
                    disabled={isActioning}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center justify-center gap-2"
                  >
                    {isActioning ? '...' : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Accept This Job
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => setShowDeclineReason(true)}
                    disabled={isActioning}
                    variant="danger"
                    className="flex-1 flex items-center justify-center gap-1.5"
                  >
                    <X className="w-4 h-4" strokeWidth={2} />
                    <span>Decline</span>
                  </Button>
                </>
              )}

              {showDeclineReason && (
                <div className="w-full space-y-3">
                  <div>
                    <label className="block text-slate-700 text-sm mb-2">
                      Reason for declining (required)
                    </label>
                    <textarea
                      value={declineReason}
                      onChange={(e) => setDeclineReason(e.target.value)}
                      placeholder="e.g., Schedule conflict, Too far, Not my specialty..."
                      className="w-full px-4 py-3 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500 min-h-[100px]"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={handleDeclineConfirm}
                      disabled={isActioning}
                      variant="danger"
                      className="flex-1"
                    >
                      {isActioning ? '...' : 'Confirm Decline'}
                    </Button>
                    <Button
                      onClick={() => {
                        setShowDeclineReason(false);
                        setDeclineReason('');
                      }}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {isAssigned && (
                <>
                  <Button
                    onClick={() => handleAction({ action: 'start' })}
                    disabled={isActioning}
                    className="flex-1 bg-slate-700 hover:bg-slate-800 text-white flex items-center justify-center gap-2"
                  >
                    <Rocket className="w-4 h-4" />
                    Start Job
                  </Button>
                  <Button
                    onClick={() => window.location.href = `tel:${customerWithContact?.phone || ''}`}
                    variant="outline"
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    <Phone className="w-4 h-4" />
                    Call Customer
                  </Button>
                </>
              )}

              {/* Only show "Leave Review" button when completed and eligible */}
              {isCompleted && canReview && (
                <Button 
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center gap-2"
                  onClick={() => setIsSubmitReviewModalOpen(true)}
                >
                  <Star className="w-4 h-4" />
                  Leave Review
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-600">Job not found</p>
          </div>
        )}
      </div>

      {/* Review Modals */}
      {job && (
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
            revieweeName={
              customerWithContact 
                ? `${customerWithContact.firstName} ${customerWithContact.lastName}`
                : job.customer 
                  ? `${job.customer.firstName} ${job.customer.lastName}`
                  : 'Customer'
            }
            isSubmitting={isSubmittingReview}
          />
        </>
      )}
    </Modal>
  );
};
