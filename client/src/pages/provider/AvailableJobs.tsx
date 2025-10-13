import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Badge } from '../../components/ui';
import { providerApi } from '../../services/realApi';
import { useNotificationService } from '../../services/notificationService';
import { formatDistanceToNow } from 'date-fns';
import { ServiceRequestListItemDto } from '../../../../shared-types';

export const AvailableJobs: React.FC = () => {
  const navigate = useNavigate();
  const notify = useNotificationService();
  const [jobs, setJobs] = useState<ServiceRequestListItemDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');

  useEffect(() => {
    fetchAvailableJobs();
  }, []);

  const fetchAvailableJobs = async () => {
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
  };

  const handleQuickAccept = async (assignmentId: number) => {
    try {
      const response = await providerApi.acceptAssignment({ assignmentId });
      
      if (response.success) {
        notify.success('Success', 'Assignment accepted successfully');
        fetchAvailableJobs(); // Refresh list
      } else {
        notify.error('Error', response.message || 'Failed to accept assignment');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to accept assignment';
      notify.error('Error', errorMessage);
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    const configs: Record<string, { variant: 'danger' | 'warning' | 'primary' | 'default', icon: string }> = {
      emergency: { variant: 'danger', icon: '🚨' },
      high: { variant: 'warning', icon: '⚡' },
      medium: { variant: 'primary', icon: '📋' },
      low: { variant: 'default', icon: '📌' }
    };
    
    const config = configs[urgency] || configs.low;
    return (
      <Badge variant={config.variant}>
        {config.icon} {urgency.toUpperCase()}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { variant: 'warning' | 'success' | 'danger' | 'info', label: string }> = {
      pending: { variant: 'warning', label: 'Pending' },
      accepted: { variant: 'success', label: 'Accepted' },
      declined: { variant: 'danger', label: 'Declined' },
      expired: { variant: 'danger', label: 'Expired' }
    };
    
    const config = configs[status] || { variant: 'info' as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filteredJobs = filter === 'pending' 
    ? jobs.filter(j => j.status === 'pending')
    : jobs;

  const pendingCount = jobs.filter(j => j.status === 'pending').length;
  const acceptedCount = jobs.filter(j => j.status === 'accepted').length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white drop-shadow-lg mb-2">Available Jobs</h1>
          <p className="text-white/90 drop-shadow">
            Service requests matching your skills and location
          </p>
        </div>
        <Button
          onClick={fetchAvailableJobs}
          variant="outline"
          className="flex items-center gap-2"
        >
          <span>🔄</span> Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/90 text-sm mb-1 drop-shadow font-medium">Pending Review</p>
              <p className="text-3xl font-bold text-white drop-shadow-lg">{pendingCount}</p>
            </div>
            <div className="text-4xl">⏳</div>
          </div>
        </Card>
        
        <Card className="p-6 bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/90 text-sm mb-1 drop-shadow font-medium">Accepted</p>
              <p className="text-3xl font-bold text-white drop-shadow-lg">{acceptedCount}</p>
            </div>
            <div className="text-4xl">✅</div>
          </div>
        </Card>
        
        <Card className="p-6 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border-blue-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/90 text-sm mb-1 drop-shadow font-medium">Total Opportunities</p>
              <p className="text-3xl font-bold text-white drop-shadow-lg">{jobs.length}</p>
            </div>
            <div className="text-4xl">📊</div>
          </div>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'pending' ? 'primary' : 'outline'}
          onClick={() => setFilter('pending')}
        >
          Pending ({pendingCount})
        </Button>
        <Button
          variant={filter === 'all' ? 'primary' : 'outline'}
          onClick={() => setFilter('all')}
        >
          All ({jobs.length})
        </Button>
      </div>

      {/* Jobs List */}
      {filteredJobs.length > 0 ? (
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <Card key={job.id} className="overflow-hidden hover:shadow-2xl transition-all duration-300">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-white drop-shadow">
                        Request #{job.id}
                      </h3>
                      {getStatusBadge(job.status)}
                      {job.urgency && getUrgencyBadge(job.urgency)}
                    </div>
                    
                    {job && (
                      <>
                        <h4 className="text-lg text-white drop-shadow mb-2">{job.title}</h4>
                        <p className="text-white/90 drop-shadow mb-3 line-clamp-2">{job.description}</p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-white/80 mb-1 font-medium">📍 Location</p>
                            <p className="text-white drop-shadow font-medium">{job.address}</p>
                          </div>
                          <div>
                            <p className="text-white/80 mb-1 font-medium">⏱️ Est. Hours</p>
                            <p className="text-white drop-shadow font-medium">{job.estimatedHours || 'TBD'} hrs</p>
                          </div>
                          <div>
                            <p className="text-white/80 mb-1 font-medium">📅 Preferred Date</p>
                            <p className="text-white drop-shadow font-medium">
                              {job.preferredDate
                                ? new Date(job.preferredDate).toLocaleDateString()
                                : 'Flexible'}
                            </p>
                          </div>
                          <div>
                            <p className="text-white/80 mb-1 font-medium">🔔 Notified</p>
                            <p className="text-white drop-shadow font-medium">
                              {formatDistanceToNow(new Date(job.notifiedAt), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Expiration Warning */}
                {job.status === 'pending' && job.expiresAt && (
                  <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 mb-4">
                    <p className="text-red-100 text-sm flex items-center gap-2 font-medium drop-shadow">
                      <span>⏰</span>
                      <span>
                        Expires {formatDistanceToNow(new Date(job.expiresAt), { addSuffix: true })}
                      </span>
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-white/10">
                  <Button
                    onClick={() => navigate(`/provider/jobs/${job.requestId}`)}
                    variant="primary"
                    className="flex-1"
                  >
                    📋 View Full Details
                  </Button>
                  
                  {job.status === 'pending' && (
                    <Button
                      onClick={() => handleQuickAccept(job.id)}
                      className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                    >
                      ✅ Quick Accept
                    </Button>
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
        <Card className="p-12 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-white drop-shadow-lg mb-2">
            {filter === 'pending' ? 'No Pending Jobs' : 'No Jobs Available'}
          </h3>
          <p className="text-white/90 drop-shadow mb-6">
            {filter === 'pending'
              ? 'You have no pending job requests at the moment. Check back soon!'
              : 'There are no job opportunities available right now. New requests will appear here when they match your profile.'}
          </p>
          {filter === 'pending' && jobs.length > 0 && (
            <Button onClick={() => setFilter('all')} variant="primary">
              View All Jobs
            </Button>
          )}
        </Card>
      )}
    </div>
  );
};
