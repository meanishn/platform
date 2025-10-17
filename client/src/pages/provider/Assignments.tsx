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
  PageContainer,
  SectionHeaderWithCount,
  InfoAlert,
  DividerWithText,
  InlineBadge,
  type TabOption 
} from '../../components/ui';
import { JobDetailsModal } from '../../components/provider';
import { providerApi } from '../../services/realApi';
import { useNotificationService } from '../../services/notificationService';
import { useConfirmationModal } from '../../hooks';
import type { ProviderAssignmentDto } from '../../types/api';
import { Hammer, CheckCircle2, AlertTriangle, RefreshCw, Sparkles, ClipboardList, ArrowDown, Zap, Lightbulb, History } from 'lucide-react';

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
      <PageContainer maxWidth="7xl">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight mb-6">Active Work</h1>

        <EmptyState
          icon={Sparkles}
          title="You're all caught up!"
          description="No ongoing or upcoming jobs"
          action={{
            label: 'Browse Available Jobs',
            onClick: () => navigate('/provider/available-jobs'),
          }}
        />
        
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600 mb-3">Ready to take on new work?</p>
          <Link to="/provider/accepted-jobs">
            <Button variant="outline">
              View Accepted Jobs
            </Button>
          </Link>
        </div>

        {ConfirmationModalComponent}
      </PageContainer>
    );
  }

  // Determine layout based on screen size and view mode
  const showSplitView = viewMode === 'split' && (ongoingJobs.length > 0 && upcomingJobs.length > 0);
  const showOngoingOnly = viewMode === 'ongoing' || (viewMode === 'split' && ongoingJobs.length > 0 && upcomingJobs.length === 0);
  const showUpcomingOnly = viewMode === 'upcoming' || (viewMode === 'split' && ongoingJobs.length === 0 && upcomingJobs.length > 0);

  return (
    <PageContainer maxWidth="7xl">
        {/* Header with tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight">Active Work</h1>
          
          <div className="flex gap-3">
            <Link to="/provider/history">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <History className="w-4 h-4" strokeWidth={2} />
                <span>View History</span>
              </Button>
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

      {/* Split View - Desktop (both ongoing and upcoming) */}
      {showSplitView && (
        <div className="hidden lg:grid lg:grid-cols-2 gap-4 mb-6">
          {/* Ongoing Jobs Column */}
          <div>
            <SectionHeaderWithCount
              icon={Hammer}
              iconColor="text-amber-600"
              title="IN PROGRESS"
              count={ongoingJobs.length}
            />
            <div className="space-y-3">
              {ongoingJobs.map((assignment) => (
                <ActiveJobCard
                  key={assignment.id}
                  id={assignment.request.id}
                  title={assignment.request.title}
                  description={assignment.request.description}
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
            <SectionHeaderWithCount
              icon={ClipboardList}
              title="UPCOMING"
              count={upcomingJobs.length}
            />
            <div className="space-y-3">
              {upcomingJobs.map((assignment) => (
                <UpcomingJobCard
                  key={assignment.id}
                  id={assignment.request.id}
                  title={assignment.request.title}
                  description={assignment.request.description}
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
            <SectionHeaderWithCount
              icon={Hammer}
              iconColor="text-amber-600"
              title="IN PROGRESS"
              badge={upcomingJobs.length > 0 && (
                <InlineBadge icon={ClipboardList}>Next: {upcomingJobs.length}</InlineBadge>
              )}
            />
            
            {ongoingJobs.map((assignment, index) => (
              <div key={assignment.id} className={index > 0 ? 'mt-4' : ''}>
              <ActiveJobCard
                id={assignment.request.id}
                title={assignment.request.title}
                description={assignment.request.description}
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
          <DividerWithText icon={ArrowDown}>NEXT UP</DividerWithText>

          {/* Upcoming Jobs */}
          <div className="space-y-4">
            {upcomingJobs.map((assignment) => (
              <UpcomingJobCard
                key={assignment.id}
                id={assignment.request.id}
                title={assignment.request.title}
                description={assignment.request.description}
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
          <SectionHeaderWithCount
            icon={Hammer}
            iconColor="text-amber-600"
            title="IN PROGRESS"
            action={upcomingJobs.length > 0 && (
              <button
                onClick={() => setViewMode('upcoming')}
                className="text-sm text-slate-600 hover:text-slate-900 flex items-center gap-1 transition-colors duration-200"
              >
                <Zap className="w-4 h-4" strokeWidth={2} />
                <span>Next: {upcomingJobs.length}</span>
              </button>
            )}
            className="mb-4"
          />

          <div className="space-y-4">
            {ongoingJobs.map((assignment) => (
              <ActiveJobCard
                key={assignment.id}
                id={assignment.request.id}
                title={assignment.request.title}
                description={assignment.request.description}
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
            <InfoAlert 
              icon={Lightbulb} 
              variant="info"
              className="mt-6"
              action={
                <button
                  onClick={() => setViewMode('upcoming')}
                  className="text-slate-700 hover:text-slate-900 text-sm font-medium transition-colors duration-200"
                >
                  Tap "Upcoming" to see details
                </button>
              }
            >
              Your next job starts at{' '}
              {new Date(upcomingJobs[0].request.preferredDate || '').toLocaleTimeString([], { 
                hour: 'numeric', 
                minute: '2-digit' 
              })}
            </InfoAlert>
          )}
        </div>
      )}

      {/* Upcoming Only View (Planning Mode) */}
      {showUpcomingOnly && !showSplitView && (
        <div>
          <SectionHeaderWithCount
            icon={ClipboardList}
            title="UPCOMING ASSIGNMENTS"
            action={ongoingJobs.length > 0 && (
              <button
                onClick={() => setViewMode('ongoing')}
                className="text-sm text-slate-600 hover:text-slate-900 flex items-center gap-1 transition-colors duration-200"
              >
                <Hammer className="w-4 h-4 text-amber-600" strokeWidth={2} />
                <span>Active: {ongoingJobs.length}</span>
              </button>
            )}
            className="mb-4"
          />

          {ongoingJobs.length === 0 && (
            <InfoAlert icon={CheckCircle2} variant="info" className="mb-4">
              No active work - All clear!
            </InfoAlert>
          )}

          <div className="space-y-4">
            {upcomingJobs.map((assignment, index) => (
              <div key={assignment.id}>
                {index === 0 && (
                  <div className="mb-2">
                    <InlineBadge icon={ClipboardList}>
                      NEXT ASSIGNMENT - Ready to Start
                    </InlineBadge>
                  </div>
                )}
                
                <UpcomingJobCard
                  id={assignment.request.id}
                  title={assignment.request.title}
                  description={assignment.request.description}
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
            <InfoAlert 
              icon={AlertTriangle} 
              variant="warning"
              className="mt-6"
              action={
                <button
                  onClick={() => setViewMode('ongoing')}
                  className="text-slate-700 hover:text-slate-900 text-sm flex items-center gap-1.5 font-medium transition-colors duration-200"
                >
                  <RefreshCw className="w-3.5 h-3.5" strokeWidth={2} />
                  <span>Back to Ongoing</span>
                </button>
              }
            >
              Finish current job first before starting this one
            </InfoAlert>
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
    </PageContainer>
  );
};


