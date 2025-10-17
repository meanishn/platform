/**
 * AcceptedJobs Page
 * Shows jobs that provider has accepted but customer hasn't selected yet
 * Provider can view rank, match quality, and decline if needed
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Badge, PageContainer } from '../../components/ui';
import { 
  MatchBadge, 
  JobDetailItem, 
  UrgencyBadge, 
  InfoBanner, 
  EmptyState,
  PageHeader,
  LoadingSkeleton
} from '../../components/provider';
import { providerApi } from '../../services/realApi';
import { useNotificationService } from '../../services/notificationService';
import { useJobDetailsModal, useConfirmationModal } from '../../hooks';
import type { JobDto } from '../../types/api';
import { formatDistanceToNow } from 'date-fns';
import { RefreshCw, Info, AlertTriangle, MapPin, Timer, DollarSign, Lightbulb, Sparkles, Clock, Trophy, CheckCircle2, BarChart3, Users, FileText, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AcceptedJobs: React.FC = () => {
  const notify = useNotificationService();
  const navigate = useNavigate();
  const { openJobDetails, JobDetailsModalComponent } = useJobDetailsModal();
  const { confirm, ConfirmationModalComponent } = useConfirmationModal();
  const [jobs, setJobs] = useState<JobDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAcceptedJobs = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await providerApi.getAcceptedPendingJobs();
      
      if (response.success && response.data) {
        setJobs(response.data);
      } else {
        notify.error('Error', response.message || 'Failed to load accepted jobs');
      }
    } catch (error) {
      console.error('Failed to fetch accepted jobs:', error);
      notify.error('Error', 'Failed to load accepted jobs');
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchAcceptedJobs();
  }, [fetchAcceptedJobs]);

  const handleDecline = (jobId: number) => {
    confirm(
      {
        title: 'Decline Job Offer',
        message: 'Are you sure you want to decline this job? Please provide a reason so we can improve our matching algorithm.',
        confirmText: 'Confirm Decline',
        confirmVariant: 'danger',
        requireReason: true,
        reasonLabel: 'Reason for declining',
        reasonPlaceholder: 'e.g., Schedule conflict, Too far from my location, Not my specialty, Better opportunity...',
        warningMessage: 'Once declined, this job will be available for other providers. You won\'t be able to accept it again unless the customer reopens it.',
        icon: AlertTriangle,
      },
      async (reason) => {
        try {
          const response = await providerApi.performAction(jobId, {
            action: 'decline',
            reason: reason || '',
          });

          if (response.success) {
            notify.success('Success', 'Job declined successfully');
            fetchAcceptedJobs(); // Refresh list
          } else {
            notify.error('Error', response.message || 'Failed to decline job');
          }
        } catch (error) {
          console.error('Failed to decline job:', error);
          notify.error('Error', 'Failed to decline job');
        }
      }
    );
  };

  if (isLoading) {
    return <LoadingSkeleton type="page" />;
  }

  return (
    <PageContainer maxWidth="7xl">
        {/* Header */}
        <PageHeader
          title="Accepted Jobs - Pending Selection"
          description="Jobs you've accepted. Customer is reviewing providers and will select one soon."
        action={{
          label: 'Refresh',
          icon: RefreshCw,
          onClick: fetchAcceptedJobs,
        }}
      />

      {/* Info Banner */}
      <InfoBanner
        icon={Info}
        title="What happens next?"
        message="The customer is reviewing all providers who accepted this job. If selected, you'll receive a notification and the job will move to your Active Work. If not selected, the job will be removed from this list."
        variant="info"
      />

      {/* Jobs List */}
      {jobs.length > 0 ? (
        <div className="space-y-4">
          {jobs.map((job) => (
            <Card key={job.id} className="bg-white border-slate-200 hover:border-slate-300 transition-colors">
              <div className="p-5">
              {/* Status Badge */}
              <div className="flex items-center justify-between mb-4">
                <Badge variant="warning" className="text-sm flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" strokeWidth={2} />
                  <span>PENDING SELECTION</span>
                </Badge>
                {job.rank && job.rank === 1 && (
                  <Badge variant="success" className="text-sm flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5" strokeWidth={2} />
                    <span>You're Rank #1!</span>
                  </Badge>
                )}
              </div>

              {/* Job Title & Match Badge */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">
                    {job.title}
                  </h3>
                  <p className="text-slate-600 text-sm line-clamp-2 mb-3">
                    {job.description}
                  </p>
                </div>
                {(job.matchScore || job.rank || job.distanceMiles) && (
                  <div className="ml-4">
                    <MatchBadge
                      score={job.matchScore}
                      rank={job.rank}
                      distance={job.distanceMiles}
                    />
                  </div>
                )}
              </div>

              {/* Job Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 pb-4 border-b border-slate-200">
                <JobDetailItem label="Location" value={job.address} icon={MapPin} />
                <JobDetailItem label="Duration" value={`${job.estimatedHours}h est.`} icon={Timer} />
                <JobDetailItem 
                  label="Urgency" 
                  value={<UrgencyBadge urgency={job.urgency} />} 
                />
                <JobDetailItem label="Rate" value={`$${job.tier?.baseHourlyRate}/hr`} icon={DollarSign} />
              </div>

              {/* Acceptance Info */}
              <div className="mb-4">
                <p className="text-slate-700 text-sm flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" strokeWidth={2} />
                  <span>You accepted {job.createdAt ? formatDistanceToNow(new Date(job.createdAt), { addSuffix: true }) : 'recently'}</span>
                </p>
                {job.matchScore && (
                  <p className="text-slate-600 text-sm mt-1 flex items-center gap-1.5">
                    <BarChart3 className="w-4 h-4 text-slate-500" strokeWidth={2} />
                    <span>Match: {job.matchScore}% • {job.distanceMiles ? `${job.distanceMiles.toFixed(1)} miles` : 'Distance unknown'}</span>
                  </p>
                )}
              </div>

              {/* Rank-based tip */}
              {job.rank === 1 && (
                <InfoBanner
                  icon={Lightbulb}
                  message={<><strong>Tip:</strong> Being Rank #1 means you're the top match! You have a great chance of being selected.</>}
                  variant="warning"
                  className="mb-4"
                />
              )}
              {job.rank && job.rank > 1 && (
                <p className="text-slate-600 text-sm mb-4 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-slate-500" strokeWidth={2} />
                  <span>You're ranked #{job.rank} - Other providers may also be considered</span>
                </p>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <Button
                  onClick={() => openJobDetails(job.id, fetchAcceptedJobs)}
                  variant="primary"
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4" strokeWidth={2} />
                  <span>View Details</span>
                </Button>
                <Button
                  onClick={() => handleDecline(job.id)}
                  variant="danger"
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" strokeWidth={2} />
                  <span>Decline Offer</span>
                </Button>
              </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Sparkles}
          title="No Accepted Jobs"
          description="You haven't accepted any jobs yet, or all accepted jobs have been processed."
          action={{
            label: 'Browse Available Jobs',
            onClick: () => navigate('/provider/available-jobs'),
          }}
        />
      )}

      {/* Job Details Modal */}
      {JobDetailsModalComponent}

      {/* Decline Confirmation Modal */}
      {ConfirmationModalComponent}
    </PageContainer>
  );
};
