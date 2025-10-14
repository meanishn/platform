import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, Button, Badge } from '../../components/ui';
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
  const acceptedCount = jobs.filter(j => j.status === 'accepted').length;
  const nearbyCount = jobs.filter(j => (j.distanceMiles ?? 999) <= 10).length;
  const highMatchCount = jobs.filter(j => (j.matchScore ?? 0) >= 80).length;

  if (isLoading) {
    return <CenteredLoadingSpinner message="Loading available jobs..." />;
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <PageHeader
        icon="🎯"
        title="Available Jobs"
        description="Service requests matching your skills and location"
        action={{
          label: 'Refresh',
          icon: '🔄',
          onClick: fetchAvailableJobs,
          disabled: isLoading,
        }}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <StatCard
          label="New"
          value={pendingCount}
          icon="⏳"
          colorScheme="yellow"
        />
        <StatCard
          label="Accepted"
          value={acceptedCount}
          icon="✅"
          colorScheme="green"
        />
        <StatCard
          label="Nearby"
          value={nearbyCount}
          icon="📍"
          colorScheme="blue"
        />
        <StatCard
          label="High Match"
          value={highMatchCount}
          icon="🏆"
          colorScheme="purple"
        />
      </div>

      {/* Filters and Sort */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={filter === 'all' ? 'primary' : 'outline'}
            onClick={() => setFilter('all')}
            size="sm"
          >
            All ({jobs.length})
          </Button>
          <Button
            variant={filter === 'nearby' ? 'primary' : 'outline'}
            onClick={() => setFilter('nearby')}
            size="sm"
          >
            📍 Nearby ({nearbyCount})
          </Button>
          <Button
            variant={filter === 'high-match' ? 'primary' : 'outline'}
            onClick={() => setFilter('high-match')}
            size="sm"
          >
            🏆 High Match ({highMatchCount})
          </Button>
          <Button
            variant={filter === 'urgent' ? 'primary' : 'outline'}
            onClick={() => setFilter('urgent')}
            size="sm"
          >
            ⚡ Urgent
          </Button>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-white/70 text-sm whitespace-nowrap">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortType)}
            className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 text-white text-sm backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="match-score">Match Score</option>
            <option value="distance">Distance</option>
            <option value="posted-date">Posted Date</option>
            <option value="urgency">Urgency</option>
          </select>
        </div>
      </div>

      {/* Jobs List */}
      {filteredJobs.length > 0 ? (
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <Card 
              key={job.id} 
              className="overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
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
                      <h3 className="text-lg md:text-xl font-semibold text-white">
                        {job.title}
                      </h3>
                      <StatusBadge status={job.status} />
                      {job.urgency && <UrgencyBadge urgency={job.urgency} />}
                    </div>
                    
                    <p className="text-sm md:text-base text-white/70 mb-3 line-clamp-2">
                      {job.description}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 text-sm">
                      <JobDetailItem label="Location" value={job.address} icon="📍" />
                      <JobDetailItem 
                        label="Est. Hours" 
                        value={`${job.estimatedHours || 'TBD'} hrs`} 
                        icon="⏱️" 
                      />
                      <JobDetailItem 
                        label="Preferred" 
                        value={job.preferredDate ? new Date(job.preferredDate).toLocaleDateString() : 'Flexible'} 
                        icon="📅" 
                      />
                      <JobDetailItem label="Rate" value={`$${job.tier.baseHourlyRate}/hr`} icon="💵" />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/10">
                  <Button
                    onClick={() => openJobDetails(job.id, fetchAvailableJobs)}
                    variant="primary"
                    className="flex-1 sm:flex-none"
                  >
                    📋 View Full Details
                  </Button>
                  
                  {job.status === 'pending' && (
                    <>
                      <Button
                        onClick={() => handleQuickAccept(job.id)}
                        disabled={actioningJobId === job.id}
                        className="flex-1 sm:flex-none bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:opacity-50"
                      >
                        {actioningJobId === job.id ? '...' : '✅ Quick Accept'}
                      </Button>
                      <Button
                        onClick={() => handleQuickDecline(job.id)}
                        disabled={actioningJobId === job.id}
                        variant="outline"
                        className="flex-1 sm:flex-none"
                      >
                        Decline
                      </Button>
                    </>
                  )}
                  
                  {job.status === 'accepted' && (
                    <Badge variant="success" className="self-center px-4 py-2">
                      ✓ Awaiting Customer Selection
                    </Badge>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon="🔍"
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
    </div>
  );
};
