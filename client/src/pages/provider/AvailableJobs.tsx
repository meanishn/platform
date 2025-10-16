import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, Button, Badge, FilterButtonGroup, SortDropdown, PageContainer } from '../../components/ui';
import { 
  MatchBadge, 
  StatCard, 
  UrgencyBadge, 
  StatusBadge,
  EmptyState,
  PageHeader,
  JobDetailItem,
  CenteredLoadingSpinner
} from '../../components/provider';
import { providerApi } from '../../services/realApi';
import { useNotificationService } from '../../services/notificationService';
import { useJobDetailsModal } from '../../hooks';
import type { JobDto, ProviderActionRequest } from '../../types/api';
import { SocketEvents, useSocketEvent } from '../../hooks/useWebSocket';
import { Target, RefreshCw, Clock, MapPin, Trophy, Timer, Calendar, DollarSign, Search, Zap, FileText, Check, X, CheckCircle2 } from 'lucide-react';

type FilterType = 'all' | 'nearby' | 'high-match' | 'urgent';
type SortType = 'match-score' | 'distance' | 'posted-date' | 'urgency';

interface SocketEventData {
  requestId?: number | string;
  [key: string]: unknown;
}

export const AvailableJobsEnhanced: React.FC = () => {
  const notify = useNotificationService();
  const { openJobDetails, JobDetailsModalComponent } = useJobDetailsModal();
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState<JobDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('match-score');
  const [actioningJobId, setActioningJobId] = useState<number | null>(null);

  const fetchAvailableJobs = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await providerApi.getAvailableJobs();
      
      if (response.success && response.data) {
        setJobs(response.data);
      } else {
        notify.error('Error', response.message || 'Failed to load available jobs');
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
      notify.error('Error', 'Failed to load available jobs');
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchAvailableJobs();
  }, [fetchAvailableJobs]);

  // Handle opening job details from URL parameter (e.g., from notifications)
  useEffect(() => {
    const jobIdParam = searchParams.get('jobId');
    if (jobIdParam && !isLoading) {
      const jobId = parseInt(jobIdParam, 10);
      if (!isNaN(jobId)) {
        // Open the modal
        openJobDetails(jobId, fetchAvailableJobs);
        // Clear the URL parameter to avoid reopening on page refresh
        setSearchParams({}, { replace: true });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, isLoading]);

    // WebSocket: Listen for real-time updates
    useSocketEvent(SocketEvents.REQUEST_CREATED, useCallback((data: SocketEventData) => {
      console.log('🔔 New request created:', data);
      fetchAvailableJobs(); // Refresh to show new jobs
    }, [fetchAvailableJobs]));
  
    useSocketEvent(SocketEvents.REQUEST_STATUS_CHANGED, useCallback((data: SocketEventData) => {
      console.log('🔔 Request status changed:', data);
      fetchAvailableJobs(); // Refresh to update job status
    }, [fetchAvailableJobs]));
  
    useSocketEvent(SocketEvents.PROVIDER_ASSIGNED, useCallback((data: SocketEventData) => {
      console.log('🔔 Provider assigned:', data);
      fetchAvailableJobs(); // Refresh to remove assigned jobs
    }, [fetchAvailableJobs]));

    
  const handlePerformAction = async (jobId: number, action: ProviderActionRequest) => {
    try {
      setActioningJobId(jobId);
      const response = await providerApi.performAction(jobId, action);
      
      if (response.success && response.data) {
        notify.success(
          'Success', 
          response.data.message || `Job ${action.action}ed successfully`
        );
        
        // Refresh list
        await fetchAvailableJobs();
      } else {
        notify.error('Error', response.message || `Failed to ${action.action} job`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Failed to ${action.action} job`;
      notify.error('Error', errorMessage);
    } finally {
      setActioningJobId(null);
    }
  };

  const handleQuickAccept = (jobId: number) => {
    handlePerformAction(jobId, { action: 'accept' });
  };

  const handleQuickDecline = (jobId: number, reason?: string) => {
    handlePerformAction(jobId, { 
      action: 'decline',
      reason: reason || 'Not interested' 
    });
  };

  // Filter jobs
  const getFilteredJobs = () => {
    let filtered = [...jobs];
    
    switch (filter) {
      case 'nearby':
        filtered = filtered.filter(j => (j.distanceMiles ?? 999) <= 10);
        break;
      case 'high-match':
        filtered = filtered.filter(j => (j.matchScore ?? 0) >= 80);
        break;
      case 'urgent':
        filtered = filtered.filter(j => j.urgency === 'high' || j.urgency === 'emergency');
        break;
      default:
        break;
    }
    
    return filtered;
  };

  // Sort jobs
  const getSortedJobs = (filtered: JobDto[]) => {
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'match-score':
          return (b.matchScore ?? 0) - (a.matchScore ?? 0);
        case 'distance':
          return (a.distanceMiles ?? 999) - (b.distanceMiles ?? 999);
        case 'posted-date':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      // Sort jobs
      case 'urgency': {
        const urgencyOrder = { emergency: 4, high: 3, medium: 2, low: 1 };
        return (urgencyOrder[b.urgency] || 0) - (urgencyOrder[a.urgency] || 0);
      }
      default:
        return 0;
      }
    });
  };

  const filteredJobs = getSortedJobs(getFilteredJobs());
  const pendingCount = jobs.filter(j => j.status === 'pending').length;
  const urgentCount = jobs.filter(j => j.urgency === 'high').length;
  const nearbyCount = jobs.filter(j => (j.distanceMiles ?? 999) <= 10).length;
  const highMatchCount = jobs.filter(j => (j.matchScore ?? 0) >= 80).length;

  if (isLoading) {
    return <CenteredLoadingSpinner message="Loading available jobs..." />;
  }

  return (
    <PageContainer maxWidth="7xl">
        {/* Header */}
        <PageHeader
          icon={Target}
          title="Available Jobs"
          description="Service requests matching your skills and location"
          action={{
            label: 'Refresh',
            icon: RefreshCw,
            onClick: fetchAvailableJobs,
            disabled: isLoading,
          }}
        />

      {/* Stats - Clickable filters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="All Jobs"
          value={pendingCount}
          icon={Clock}
          colorScheme="primary"
          isActive={filter === 'all'}
          onClick={() => setFilter('all')}
        />
        <StatCard
          label="Urgent"
          value={urgentCount}
          icon={Zap}
          colorScheme="yellow"
          isActive={filter === 'urgent'}
          onClick={() => setFilter('urgent')}
        />
        <StatCard
          label="Nearby"
          value={nearbyCount}
          icon={MapPin}
          colorScheme="blue"
          isActive={filter === 'nearby'}
          onClick={() => setFilter('nearby')}
        />
        <StatCard
          label="High Match"
          value={highMatchCount}
          icon={Trophy}
          colorScheme="green"
          isActive={filter === 'high-match'}
          onClick={() => setFilter('high-match')}
        />
      </div>

      {/* Filters and Sort */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-start">
        <div className="flex-1 min-w-0">
          <FilterButtonGroup
            options={[
              { value: 'all', label: 'All', count: jobs.length },
              { value: 'urgent', label: 'Urgent', icon: Zap, count: urgentCount },
              { value: 'nearby', label: 'Nearby', icon: MapPin, count: nearbyCount },
              { value: 'high-match', label: 'High Match', icon: Trophy, count: highMatchCount },
            ]}
            activeFilter={filter}
            onChange={(value) => setFilter(value as FilterType)}
          />
        </div>

        <div className="sm:ml-auto shrink-0">
          <SortDropdown
            options={[
              { value: 'match-score', label: 'Match Score' },
              { value: 'distance', label: 'Distance' },
              { value: 'posted-date', label: 'Posted Date' },
              { value: 'urgency', label: 'Urgency' },
            ]}
            value={sortBy}
            onChange={(value) => setSortBy(value as SortType)}
          />
        </div>
      </div>

      {/* Jobs List */}
      {filteredJobs.length > 0 ? (
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <Card 
              key={job.id} 
              className="overflow-hidden bg-white border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-300"
            >
              <div className="p-4 md:p-6">
                {/* Match Badge - Prominent at top */}
                {(job.matchScore || job.rank || job.distanceMiles) && (
                  <div className="mb-4">
                    <MatchBadge
                      score={job.matchScore}
                      rank={job.rank}
                      distance={job.distanceMiles}
                    />
                  </div>
                )}

                <div className="flex items-start justify-between mb-4 gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 md:gap-3 mb-2 flex-wrap">
                      <h3 className="text-lg md:text-xl font-semibold text-slate-900">
                        {job.title}
                      </h3>
                      <StatusBadge status={job.status} />
                      {job.urgency && <UrgencyBadge urgency={job.urgency} />}
                    </div>
                    
                    <p className="text-sm md:text-base text-slate-600 mb-3 line-clamp-2">
                      {job.description}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 text-sm">
                      <JobDetailItem label="Location" value={job.address} icon={MapPin} />
                      <JobDetailItem 
                        label="Est. Hours" 
                        value={`${job.estimatedHours || 'TBD'} hrs`} 
                        icon={Timer} 
                      />
                      <JobDetailItem 
                        label="Preferred" 
                        value={job.preferredDate ? new Date(job.preferredDate).toLocaleDateString() : 'Flexible'} 
                        icon={Calendar} 
                      />
                      <JobDetailItem label="Rate" value={`$${job.tier.baseHourlyRate}/hr`} icon={DollarSign} />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-200">
                  <Button
                    onClick={() => openJobDetails(job.id, fetchAvailableJobs)}
                    variant="outline"
                    className="flex-1 sm:flex-none flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" strokeWidth={2} />
                    <span>View Full Details</span>
                  </Button>
                  
                  {job.status === 'pending' && (
                    <>
                      <Button
                        onClick={() => handleQuickAccept(job.id)}
                        disabled={actioningJobId === job.id}
                        variant="primary"
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2"
                      >
                        {actioningJobId === job.id ? (
                          'Processing...'
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
                            <span>Quick Accept</span>
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => handleQuickDecline(job.id)}
                        disabled={actioningJobId === job.id}
                        variant="danger"
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5"
                      >
                        <X className="w-4 h-4" strokeWidth={2} />
                        <span>Decline</span>
                      </Button>
                    </>
                  )}
                  
                  {job.status === 'accepted' && (
                    <Badge variant="success" className="self-center px-4 py-2 flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5" strokeWidth={2} />
                      <span>Awaiting Customer Selection</span>
                    </Badge>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Search}
          title="No Jobs Match Your Filter"
          description="Try adjusting your filters to see more opportunities"
          action={{
            label: `View All Jobs (${jobs.length})`,
            onClick: () => setFilter('all'),
          }}
        />
      )}

      {/* Job Details Modal - Opened via hook */}
      {JobDetailsModalComponent}
    </PageContainer>
  );
};
