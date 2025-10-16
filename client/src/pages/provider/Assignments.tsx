/**
 * Active Work Page (Provider Assignments)
 * Uber-inspired dual-view: shows ongoing and upcoming jobs with instant visibility
 * Implements the spec from PROVIDER_UI_UX_SPEC.md Section 4
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Button, 
  EmptyState, 
  LoadingSkeleton,
  ActiveJobCard,
  UpcomingJobCard,
  TabFilter,
  type TabOption 
} from '../../components/ui';
import { JobDetailsModal } from '../../components/provider';
import { providerApi } from '../../services/realApi';
import { useNotificationService } from '../../services/notificationService';
import { useConfirmationModal } from '../../hooks';
import type { ProviderAssignmentDto } from '../../types/api';
import { Hammer, CheckCircle2, AlertTriangle, RefreshCw, Sparkles, ClipboardList, ArrowDown, Zap, Lightbulb } from 'lucide-react';

type ViewMode = 'split' | 'ongoing' | 'upcoming';

// Helper to safely extract customer info from assignment
const getCustomerInfo = (assignment: ProviderAssignmentDto) => {
  const customer = assignment.request.customer;
  const fullName = `${customer.firstName} ${customer.lastName}`.trim();
  
  return {
    name: fullName || 'Customer',
    rating: customer.averageRating,
    reviewCount: customer.totalJobsCompleted,
    // Contact info only available if CustomerWithContactDto
    phone: 'phone' in customer ? customer.phone : undefined,
    email: 'email' in customer ? customer.email : undefined,
    notes: undefined, // Notes would be in a different field if available
  };
};

export const ProviderAssignments: React.FC = () => {
  const notify = useNotificationService();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { confirm, ConfirmationModalComponent } = useConfirmationModal();
  
  const [assignments, setAssignments] = useState<ProviderAssignmentDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  
  // Job details modal state
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewDetails = (requestId: number) => {
    setSelectedJobId(requestId);
    setIsModalOpen(true);
    // Update URL with query parameter for deep linking
    setSearchParams({ jobId: requestId.toString() });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedJobId(null);
    // Remove query parameter when modal closes
    setSearchParams({});
  };

  const handleModalActionComplete = () => {
    fetchAssignments(); // Refresh the list after any action
  };

  // Fetch assignments
  const fetchAssignments = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await providerApi.getAssignments();
      
      if (response.success && response.data) {
        setAssignments(response.data);
      } else {
        notify.error('Error', response.message || 'Failed to load assignments');
      }
    } catch (error) {
      console.error('Failed to fetch assignments:', error);
      notify.error('Error', 'Failed to load assignments');
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  // Check for jobId query parameter and open modal if present
  useEffect(() => {
    const jobIdParam = searchParams.get('requestId');
    if (jobIdParam && !isLoading) {
      const jobId = parseInt(jobIdParam, 10);
      if (!isNaN(jobId)) {
        setSelectedJobId(jobId);
        setIsModalOpen(true);
      }
    }
  }, [searchParams, isLoading]);

  // Separate jobs by request status (not assignment status)
  const ongoingJobs = assignments.filter(a => a.request.status === 'in_progress');
  const upcomingJobs = assignments.filter(a => a.request.status === 'assigned')
    .sort((a, b) => {
      const dateA = new Date(a.request.preferredDate || 0).getTime();
      const dateB = new Date(b.request.preferredDate || 0).getTime();
      return dateA - dateB;
    });

  // Tab options for filter
  const tabOptions: TabOption[] = [
    { 
      id: 'ongoing', 
      label: 'Ongoing', 
      count: ongoingJobs.length,
      badge: upcomingJobs.length > 0 ? `Next: ${upcomingJobs.length}` : undefined
    },
    { 
      id: 'upcoming', 
      label: 'Upcoming', 
      count: upcomingJobs.length,
      badge: ongoingJobs.length > 0 ? `Active: ${ongoingJobs.length}` : undefined
    },
  ];

  // Action handlers
  const handleStartJob = (_assignmentId: number, requestId: number) => {
    confirm(
      {
        title: 'Start This Job?',
        message: 'Are you ready to start working on this job? Make sure you\'re at the location and have all necessary tools.',
        confirmText: 'Start Job',
        confirmVariant: 'primary',
        icon: Hammer,
      },
      async () => {
        try {
          const response = await providerApi.performAction(requestId, {
            action: 'start',
          });

          if (response.success) {
            notify.success('Success', 'Job started successfully');
            fetchAssignments();
          } else {
            notify.error('Error', response.message || 'Failed to start job');
          }
        } catch (error) {
          console.error('Failed to start job:', error);
          notify.error('Error', 'Failed to start job');
        }
      }
    );
  };

  const handleCompleteJob = (_assignmentId: number, requestId: number) => {
    confirm(
      {
        title: 'Complete This Job?',
        message: 'Have you finished all the work? The customer will be notified and asked to review your service.',
        confirmText: 'Complete Job',
        confirmVariant: 'primary',
        icon: CheckCircle2,
      },
      async () => {
        try {
          const response = await providerApi.performAction(requestId, {
            action: 'complete',
          });

          if (response.success) {
            notify.success('Success', 'Job completed! Waiting for customer review.');
            fetchAssignments();
          } else {
            notify.error('Error', response.message || 'Failed to complete job');
          }
        } catch (error) {
          console.error('Failed to complete job:', error);
          notify.error('Error', 'Failed to complete job');
        }
      }
    );
  };

  const handleCancelJob = (_assignmentId: number, requestId: number, isInProgress: boolean) => {
    confirm(
      {
        title: isInProgress ? 'Emergency Cancel' : 'Cancel Assignment',
        message: isInProgress 
          ? 'This will cancel a job that\'s already in progress. This should only be done in emergency situations. Please provide a detailed reason.'
          : 'Are you sure you want to cancel this assignment? Please provide a reason.',
        confirmText: 'Confirm Cancel',
        confirmVariant: 'danger',
        requireReason: true,
        reasonLabel: 'Reason for cancellation',
        reasonPlaceholder: 'e.g., Emergency, Equipment failure, Safety concern...',
        warningMessage: 'The customer will be notified and may leave feedback about the cancellation.',
        icon: AlertTriangle,
      },
      async (reason) => {
        try {
          const response = await providerApi.performAction(requestId, {
            action: 'cancel',
            reason: reason || '',
          });

          if (response.success) {
            notify.success('Success', 'Assignment cancelled');
            fetchAssignments();
          } else {
            notify.error('Error', response.message || 'Failed to cancel assignment');
          }
        } catch (error) {
          console.error('Failed to cancel assignment:', error);
          notify.error('Error', 'Failed to cancel assignment');
        }
      }
    );
  };

  // Loading state
  if (isLoading) {
    return <LoadingSkeleton type="page" />;
  }

  // Empty state - no jobs at all
  if (ongoingJobs.length === 0 && upcomingJobs.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
          <div className="mb-4 sm:mb-6">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Active Work</h1>
          </div>

          <EmptyState
          icon={Sparkles}
          title="You're all caught up!"
          description="No ongoing or upcoming jobs"
          action={{
            label: 'Browse Available Jobs',
            onClick: () => navigate('/provider/jobs/available'),
          }}
        />
        
        <div className="mt-4 text-center">
          <p className="text-slate-600 mb-3">Ready to take on new work?</p>
          <Link to="/provider/jobs/accepted">
            <Button variant="outline">
              View Accepted Jobs
            </Button>
          </Link>
        </div>

        {ConfirmationModalComponent}
        </div>
      </div>
    );
  }

  // Determine layout based on screen size and view mode
  const showSplitView = viewMode === 'split' && (ongoingJobs.length > 0 && upcomingJobs.length > 0);
  const showOngoingOnly = viewMode === 'ongoing' || (viewMode === 'split' && ongoingJobs.length > 0 && upcomingJobs.length === 0);
  const showUpcomingOnly = viewMode === 'upcoming' || (viewMode === 'split' && ongoingJobs.length === 0 && upcomingJobs.length > 0);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
        {/* Header with tabs */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <h1 className="text-2xl font-bold text-slate-900">Active Work</h1>
          
          <div className="flex gap-3">
            <Link to="/provider/history">
              <Button variant="outline" size="sm">View History</Button>
            </Link>
          </div>
        </div>

        {/* Tab Filter - only show if both types exist */}
        {ongoingJobs.length > 0 && upcomingJobs.length > 0 && (
          <TabFilter
            options={tabOptions}
            activeTab={viewMode === 'split' ? 'ongoing' : viewMode}
            onChange={(tabId) => setViewMode(tabId as ViewMode)}
          />
        )}
      </div>

      {/* Split View - Desktop (both ongoing and upcoming) */}
      {showSplitView && (
        <div className="hidden lg:grid lg:grid-cols-2 gap-4 mb-6">
          {/* Ongoing Jobs Column */}
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Hammer className="w-5 h-5 text-amber-600" strokeWidth={2} />
              <span>IN PROGRESS ({ongoingJobs.length})</span>
            </h2>
            <div className="space-y-3">
              {ongoingJobs.map((assignment) => (
                <ActiveJobCard
                  key={assignment.id}
                  id={assignment.request.id}
                  title={assignment.request.title}
                  location={assignment.request.address}
                  startedAt={assignment.respondedAt || assignment.notifiedAt}
                  estimatedHours={assignment.request.estimatedHours}
                  customer={getCustomerInfo(assignment)}
                  onComplete={() => handleCompleteJob(assignment.id, assignment.request.id)}
                  onViewDetails={() => handleViewDetails(assignment.request.id)}
                  onCancel={() => handleCancelJob(assignment.id, assignment.request.id, true)}
                  compact
                />
              ))}
            </div>
          </div>

          {/* Upcoming Jobs Column */}
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-slate-600" strokeWidth={2} />
              <span>UPCOMING ({upcomingJobs.length})</span>
            </h2>
            <div className="space-y-3">
              {upcomingJobs.map((assignment) => (
                <UpcomingJobCard
                  key={assignment.id}
                  id={assignment.request.id}
                  title={assignment.request.title}
                  location={assignment.request.address}
                  startTime={assignment.request.preferredDate || new Date().toISOString()}
                  estimatedHours={assignment.request.estimatedHours}
                  hourlyRate={assignment.request.tier?.baseHourlyRate}
                  tierName={assignment.request.tier?.name}
                  customer={getCustomerInfo(assignment)}
                  onStart={() => handleStartJob(assignment.id, assignment.request.id)}
                  onViewDetails={() => handleViewDetails(assignment.request.id)}
                  onCancel={() => handleCancelJob(assignment.id, assignment.request.id, false)}
                  compact
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mobile/Tablet Stacked View with badges */}
      {showSplitView && (
        <div className="lg:hidden space-y-6">
          {/* Ongoing Jobs */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Hammer className="w-5 h-5 text-amber-600" strokeWidth={2} />
                <span>IN PROGRESS</span>
              </h2>
              {upcomingJobs.length > 0 && (
                <span className="px-2 py-1 rounded bg-slate-100 text-slate-700 text-xs font-medium flex items-center gap-1 border border-slate-200">
                  <ClipboardList className="w-3.5 h-3.5" strokeWidth={2} />
                  <span>Next: {upcomingJobs.length}</span>
                </span>
              )}
            </div>
            
            {ongoingJobs.map((assignment, index) => (
              <div key={assignment.id} className={index > 0 ? 'mt-4' : ''}>
                <ActiveJobCard
                  id={assignment.request.id}
                  title={assignment.request.title}
                  location={assignment.request.address}
                  startedAt={assignment.respondedAt || assignment.notifiedAt}
                  estimatedHours={assignment.request.estimatedHours}
                  customer={getCustomerInfo(assignment)}
                  onComplete={() => handleCompleteJob(assignment.id, assignment.request.id)}
                  onViewDetails={() => handleViewDetails(assignment.request.id)}
                  onCancel={() => handleCancelJob(assignment.id, assignment.request.id, true)}
                />
              </div>
            ))}
          </div>

          {/* Next Up Separator */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200"></div>
            <span className="text-slate-600 font-medium flex items-center gap-1.5">
              <ArrowDown className="w-4 h-4" strokeWidth={2} />
              <span>NEXT UP</span>
            </span>
            <div className="flex-1 h-px bg-slate-200"></div>
          </div>

          {/* Upcoming Jobs */}
          <div className="space-y-4">
            {upcomingJobs.map((assignment) => (
              <UpcomingJobCard
                key={assignment.id}
                id={assignment.request.id}
                title={assignment.request.title}
                location={assignment.request.address}
                startTime={assignment.request.preferredDate || new Date().toISOString()}
                estimatedHours={assignment.request.estimatedHours}
                hourlyRate={assignment.request.tier?.baseHourlyRate}
                tierName={assignment.request.tier?.name}
                customer={getCustomerInfo(assignment)}
                onStart={() => handleStartJob(assignment.id, assignment.request.id)}
                onViewDetails={() => handleViewDetails(assignment.request.id)}
                onCancel={() => handleCancelJob(assignment.id, assignment.request.id, false)}
                compact
              />
            ))}
          </div>
        </div>
      )}

      {/* Ongoing Only View (Focus Mode) */}
      {showOngoingOnly && !showSplitView && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
              <Hammer className="w-5 h-5 text-amber-600" strokeWidth={2} />
              <span>IN PROGRESS</span>
            </h2>
            {upcomingJobs.length > 0 && (
              <button
                onClick={() => setViewMode('upcoming')}
                className="text-sm text-slate-600 hover:text-slate-900 flex items-center gap-1"
              >
                <Zap className="w-4 h-4" strokeWidth={2} />
                <span>Next: {upcomingJobs.length}</span>
              </button>
            )}
          </div>

          <div className="space-y-4">
            {ongoingJobs.map((assignment) => (
              <ActiveJobCard
                key={assignment.id}
                id={assignment.request.id}
                title={assignment.request.title}
                location={assignment.request.address}
                startedAt={assignment.respondedAt || assignment.notifiedAt}
                estimatedHours={assignment.request.estimatedHours}
                customer={getCustomerInfo(assignment)}
                onComplete={() => handleCompleteJob(assignment.id, assignment.request.id)}
                onViewDetails={() => handleViewDetails(assignment.request.id)}
                onCancel={() => handleCancelJob(assignment.id, assignment.request.id, true)}
              />
            ))}
          </div>

          {upcomingJobs.length > 0 && (
            <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-slate-700 text-sm flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-slate-600" strokeWidth={2} />
                <span>
                  Your next job starts at{' '}
                  {new Date(upcomingJobs[0].request.preferredDate || '').toLocaleTimeString([], { 
                    hour: 'numeric', 
                    minute: '2-digit' 
                  })}
                </span>
              </p>
              <button
                onClick={() => setViewMode('upcoming')}
                className="text-slate-700 hover:text-slate-900 text-sm mt-2 font-medium"
              >
                [Tap "Upcoming" to see details]
              </button>
            </div>
          )}
        </div>
      )}

      {/* Upcoming Only View (Planning Mode) */}
      {showUpcomingOnly && !showSplitView && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-slate-600" strokeWidth={2} />
              <span>UPCOMING ASSIGNMENTS</span>
            </h2>
            {ongoingJobs.length > 0 && (
              <button
                onClick={() => setViewMode('ongoing')}
                className="text-sm text-slate-600 hover:text-slate-900 flex items-center gap-1"
              >
                <Hammer className="w-4 h-4 text-amber-600" strokeWidth={2} />
                <span>Active: {ongoingJobs.length}</span>
              </button>
            )}
          </div>

          {ongoingJobs.length === 0 && (
            <div className="mb-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-slate-700 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-slate-500" strokeWidth={2} />
                <span>No active work - All clear!</span>
              </p>
            </div>
          )}

          <div className="space-y-4">
            {upcomingJobs.map((assignment, index) => (
              <div key={assignment.id}>
                {index === 0 && (
                  <div className="mb-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-sm font-medium border border-slate-200">
                      <ClipboardList className="w-3.5 h-3.5" strokeWidth={2} />
                      <span>NEXT ASSIGNMENT - Ready to Start</span>
                    </span>
                  </div>
                )}
                
                <UpcomingJobCard
                  id={assignment.request.id}
                  title={assignment.request.title}
                  location={assignment.request.address}
                  startTime={assignment.request.preferredDate || new Date().toISOString()}
                  estimatedHours={assignment.request.estimatedHours}
                  hourlyRate={assignment.request.tier?.baseHourlyRate}
                  tierName={assignment.request.tier?.name}
                  customer={getCustomerInfo(assignment)}
                  onStart={() => handleStartJob(assignment.id, assignment.request.id)}
                  onViewDetails={() => handleViewDetails(assignment.request.id)}
                  onCancel={() => handleCancelJob(assignment.id, assignment.request.id, false)}
                />
              </div>
            ))}
          </div>

          {ongoingJobs.length > 0 && (
            <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-amber-900 text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" strokeWidth={2} />
                <span>Finish current job first before starting this one</span>
              </p>
              <button
                onClick={() => setViewMode('ongoing')}
                className="text-slate-700 hover:text-slate-900 text-sm mt-2 flex items-center gap-1.5 font-medium"
              >
                <RefreshCw className="w-3.5 h-3.5" strokeWidth={2} />
                <span>Back to Ongoing</span>
              </button>
            </div>
          )}
        </div>
      )}

      {ConfirmationModalComponent}
      
      {/* Job Details Modal */}
      {selectedJobId && (
        <JobDetailsModal
          jobId={selectedJobId}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onActionComplete={handleModalActionComplete}
        />
      )}
      </div>
    </div>
  );
};


