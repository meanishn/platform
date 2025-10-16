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
import { Modal, Button, Badge } from '../ui';
import { MatchBadge } from '../provider';
import { providerApi } from '../../services/realApi';
import { useNotificationService } from '../../services/notificationService';
import type { ProviderJobDetailDto, ProviderActionRequest } from '../../types/api';
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
  Star,
  AlertCircle,
  CheckCircle,
  FileText,
  Rocket,
  ExternalLink,
  X
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

  const fetchJobDetails = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await providerApi.getJobDetails(jobId);
      
      if (response.success && response.data) {
        setJob(response.data);
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
  }, [jobId]);

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
                <div className="flex-1">
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
                    {job.title}
                  </h2>
                  <p className="text-slate-600 text-sm">Request #{job.id}</p>
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
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <p className="text-slate-600 text-sm mb-1 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    Location
                  </p>
                  <p className="text-slate-900 font-medium">
                    {isAssigned ? job.address : 'General Area: Downtown'}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <p className="text-slate-600 text-sm mb-1 flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    Estimated Duration
                  </p>
                  <p className="text-slate-900 font-medium">
                    {job.estimatedHours ? `${job.estimatedHours} hours` : 'TBD'}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <p className="text-slate-600 text-sm mb-1 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    Preferred Date
                  </p>
                  <p className="text-slate-900 font-medium">
                    {job.preferredDate 
                      ? new Date(job.preferredDate).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit'
                        })
                      : 'Flexible'}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <p className="text-slate-600 text-sm mb-1 flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4" />
                    Rate
                  </p>
                  <p className="text-slate-900 font-medium">
                    ${job.tier.baseHourlyRate}/hour ({job.tier.name} Tier)
                  </p>
                </div>
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
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold text-lg">
                      {job.customer.firstName?.[0] || 'C'}
                    </div>
                    <div>
                      <p className="text-slate-900 font-semibold">
                        {job.customer.firstName} {job.customer.lastName?.[0]}.
                      </p>
                      {job.customer.averageRating && (
                        <p className="text-slate-600 text-sm flex items-center gap-1">
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                          {job.customer.averageRating.toFixed(1)} stars
                          {job.customer.totalJobsCompleted && ` (${job.customer.totalJobsCompleted} jobs)`}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="success" className="text-xs flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Verified Customer
                    </Badge>
                    <Badge variant="default" className="text-xs">Always Pays On Time</Badge>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4">
                    <p className="text-amber-900 text-sm flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <span>Full contact details (phone, email, exact address) will be shown after customer assigns this job to you.</span>
                    </p>
                  </div>
                </div>
              ) : (
                /* AFTER Assignment - Full Contact Info */
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold text-lg">
                      {job.customer.firstName?.[0] || 'C'}
                    </div>
                    <div>
                      <p className="text-slate-900 font-semibold">
                        {job.customer.firstName} {job.customer.lastName}
                      </p>
                      {job.customer.averageRating && (
                        <p className="text-slate-600 text-sm flex items-center gap-1">
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                          {job.customer.averageRating.toFixed(1)} stars ({job.customer.totalJobsCompleted || 0} jobs)
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <a 
                      href={`tel:${customerWithContact?.phone || ''}`}
                      className="flex items-center gap-3 bg-white rounded-lg p-3 border border-slate-200 hover:bg-slate-50 transition-colors"
                    >
                      <Phone className="w-5 h-5 text-slate-600" />
                      <div>
                        <p className="text-slate-600 text-xs">Phone</p>
                        <p className="text-slate-900 font-medium">{customerWithContact?.phone || 'Not available'}</p>
                      </div>
                    </a>

                    <a 
                      href={`mailto:${customerWithContact?.email || ''}`}
                      className="flex items-center gap-3 bg-white rounded-lg p-3 border border-slate-200 hover:bg-slate-50 transition-colors"
                    >
                      <Mail className="w-5 h-5 text-slate-600" />
                      <div>
                        <p className="text-slate-600 text-xs">Email</p>
                        <p className="text-slate-900 font-medium">{customerWithContact?.email || 'Not available'}</p>
                      </div>
                    </a>

                    <a 
                      href={`https://maps.google.com/?q=${encodeURIComponent(job.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 bg-white rounded-lg p-3 border border-slate-200 hover:bg-slate-50 transition-colors"
                    >
                      <MapPin className="w-5 h-5 text-slate-600" />
                      <div className="flex-1">
                        <p className="text-slate-600 text-xs">Address</p>
                        <p className="text-slate-900 font-medium">{job.address}</p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-slate-500" />
                    </a>
                  </div>

                  {/* Customer Notes - from job description */}
                  {job.description && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                      <p className="text-slate-900 text-sm mb-1 font-semibold flex items-center gap-1.5">
                        <FileText className="w-4 h-4" />
                        Customer Details:
                      </p>
                      <p className="text-slate-700 text-sm">{job.description}</p>
                    </div>
                  )}
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
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-600">Job not found</p>
          </div>
        )}
      </div>
    </Modal>
  );
};
