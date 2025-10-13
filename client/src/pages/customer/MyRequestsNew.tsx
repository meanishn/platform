/**
 * My Requests Page - Customer Service Request Management
 * Shows all customer's service requests with ability to:
 * - View accepted providers
 * - Confirm/select provider
 * - Track request status
 * - Cancel requests
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { 
  Card, 
  Button, 
  Input, 
  Badge,
  PageHeader,
  StatCard,
  LoadingSkeleton,
} from '../../components/ui';
import { AcceptedProvidersModal } from '../../components/customer';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api, handleResponse } from '../../services/apiClient';
import { ServiceRequestListItemDto } from '../../types/api';
import { formatDistanceToNow } from 'date-fns';

export const MyRequests: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [requests, setRequests] = useState<ServiceRequestListItemDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [acceptedProviderCounts, setAcceptedProviderCounts] = useState<Record<number, number>>({});
  
  // Modal state
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const [selectedRequestTitle, setSelectedRequestTitle] = useState<string>('');
  const [isProvidersModalOpen, setIsProvidersModalOpen] = useState(false);

  const fetchRequests = useCallback(async () => {
    if (!token) return;
    
    try {
      const response = await api.get(`/api/service-requests`);
      const data = await handleResponse<{ success: boolean; data: ServiceRequestListItemDto[] }>(response);
      setRequests(data.data || []);
      
      // Fetch accepted provider counts for pending requests
      const pendingRequests = (data.data || []).filter(r => r.status === 'pending');
      for (const request of pendingRequests) {
        fetchAcceptedProviderCount(request.id);
      }
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const fetchAcceptedProviderCount = async (requestId: number) => {
    try {
      const response = await api.get(`/api/service-requests/${requestId}/accepted-providers`);
      const data = await handleResponse<{ 
        success: boolean; 
        data: { providers: Array<{ id: number }>; status: string } 
      }>(response);
      
      if (data.success && data.data) {
        setAcceptedProviderCounts(prev => ({
          ...prev,
          [requestId]: data.data.providers.length
        }));
      }
    } catch {
      // Silently fail - count just won't show
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Check for requestId query parameter to open providers modal
  useEffect(() => {
    const requestIdParam = searchParams.get('requestId');
    if (requestIdParam && !isLoading) {
      const requestId = parseInt(requestIdParam, 10);
      if (!isNaN(requestId)) {
        const request = requests.find(r => r.id === requestId);
        if (request) {
          handleViewProviders(requestId, request.title);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, isLoading, requests]);

  const handleViewProviders = (requestId: number, title: string) => {
    setSelectedRequestId(requestId);
    setSelectedRequestTitle(title);
    setIsProvidersModalOpen(true);
    setSearchParams({ requestId: requestId.toString() });
  };

  const handleCloseProvidersModal = () => {
    setIsProvidersModalOpen(false);
    setSelectedRequestId(null);
    setSelectedRequestTitle('');
    setSearchParams({});
  };

  const handleProviderConfirmed = () => {
    fetchRequests(); // Refresh to show updated status
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { variant: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info', label: string, icon: string }> = {
      pending: { variant: 'warning', label: 'Awaiting Providers', icon: '⏳' },
      assigned: { variant: 'info', label: 'Provider Assigned', icon: '✓' },
      in_progress: { variant: 'primary', label: 'In Progress', icon: '🔨' },
      completed: { variant: 'success', label: 'Completed', icon: '✅' },
      cancelled: { variant: 'danger', label: 'Cancelled', icon: '✕' },
    };
    
    const config = configs[status] || { variant: 'default' as const, label: status, icon: '•' };
    
    return (
      <Badge variant={config.variant} size="sm">
        <span className="inline-flex items-center gap-1">
          <span>{config.icon}</span>
          <span>{config.label}</span>
        </span>
      </Badge>
    );
  };

  const getUrgencyBadge = (urgency: string) => {
    const configs: Record<string, { variant: 'default' | 'primary' | 'success' | 'warning' | 'danger', icon: string }> = {
      emergency: { variant: 'danger', icon: '🚨' },
      high: { variant: 'danger', icon: '🔴' },
      medium: { variant: 'warning', icon: '🟡' },
      low: { variant: 'success', icon: '🟢' },
    };
    
    const config = configs[urgency] || { variant: 'default' as const, icon: '•' };
    
    return (
      <Badge variant={config.variant} size="sm">
        <span className="inline-flex items-center gap-1">
          <span>{config.icon}</span>
          <span className="capitalize">{urgency}</span>
        </span>
      </Badge>
    );
  };

  const handleCancelRequest = async (requestId: number, title: string) => {
    if (!confirm(`Are you sure you want to cancel "${title}"?`)) {
      return;
    }
    
    const reason = prompt('Please provide a reason for cancellation (optional):');
    
    try {
      const response = await api.patch(`/api/service-requests/${requestId}/cancel`, { reason });
      await handleResponse(response);
      fetchRequests();
    } catch (error) {
      console.error('Failed to cancel request:', error);
      alert('Failed to cancel request. Please try again.');
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesFilter = filter === 'all' || request.status === filter;
    const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (isLoading) {
    return <LoadingSkeleton type="page" />;
  }

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const inProgressCount = requests.filter(r => r.status === 'in_progress' || r.status === 'assigned').length;
  const completedCount = requests.filter(r => r.status === 'completed').length;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <PageHeader
          title="My Service Requests"
          description="Manage and track your service requests"
        />
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={fetchRequests}
            disabled={isLoading}
            size="sm"
          >
            🔄 Refresh
          </Button>
          <Button onClick={() => navigate('/request-service')}>
            + New Request
          </Button>
        </div>
      </div>
        
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Pending"
          value={pendingCount}
          icon="⏳"
          colorScheme="blue"
        />
        <StatCard
          label="Active"
          value={inProgressCount}
          icon="🔨"
          colorScheme="yellow"
        />
        <StatCard
          label="Completed"
          value={completedCount}
          icon="✅"
          colorScheme="green"
        />
        <StatCard
          label="Total"
          value={requests.length}
          icon="📊"
          colorScheme="purple"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="flex-1">
          <Input
            placeholder="🔍 Search requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {[
            { value: 'all', label: 'All' },
            { value: 'pending', label: 'Pending' },
            { value: 'assigned', label: 'Assigned' },
            { value: 'in_progress', label: 'Active' },
            { value: 'completed', label: 'Done' }
          ].map(option => (
            <Button
              key={option.value}
              variant={filter === option.value ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter(option.value)}
              className="whitespace-nowrap"
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Requests List */}
      {filteredRequests.length > 0 ? (
        <div className="space-y-4">
          {filteredRequests.map((request) => {
            const acceptedCount = acceptedProviderCounts[request.id] || 0;
            const hasAcceptedProviders = acceptedCount > 0;
            
            return (
              <Card key={request.id} padding="sm" className="hover:shadow-md transition-shadow">
                <div className="p-1 sm:p-1">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-white-900 truncate">
                          {request.title}
                        </h3>
                        {getStatusBadge(request.status)}
                        {getUrgencyBadge(request.urgency)}
                      </div>
                      <p className="text-white-600 text-sm sm:text-base line-clamp-2">
                        {request.description}
                      </p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-white-500 mb-4">
                    <div className="flex items-center gap-1">
                      <span>🏷️</span>
                      <span>{request.category.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>⏰</span>
                      <span>{request.estimatedHours}h estimated</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>📍</span>
                      <span className="truncate">{request.address}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>📅</span>
                      <span>{formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}</span>
                    </div>
                  </div>

                  {/* Accepted Providers Alert */}
                  {request.status === 'pending' && hasAcceptedProviders && (
                    <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg animate-pulse">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">👋</span>
                        <div className="flex-1">
                          <p className="font-semibold text-blue-900 mb-1">
                            {acceptedCount === 1 
                              ? '1 provider has accepted!'
                              : `${acceptedCount} providers have accepted!`
                            }
                          </p>
                          <p className="text-sm text-blue-700 mb-3">
                            Review their profiles and choose the best match for your needs.
                          </p>
                          <Button
                            size="sm"
                            onClick={() => handleViewProviders(request.id, request.title)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            👤 View & Select Provider
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Assigned/In Progress Status */}
                  {(request.status === 'assigned' || request.status === 'in_progress') && (
                    <div className={`mb-4 p-4 rounded-lg border-2 ${
                      request.status === 'in_progress' 
                        ? 'bg-yellow-50 border-yellow-200' 
                        : 'bg-blue-50 border-blue-200'
                    }`}>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">
                          {request.status === 'in_progress' ? '🔨' : '✓'}
                        </span>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {request.status === 'in_progress' ? 'Work in Progress' : 'Provider Confirmed'}
                          </p>
                          <p className="text-sm text-gray-600">
                            {request.status === 'in_progress' 
                              ? 'Your service provider is currently working on this request'
                              : 'A provider has been assigned and will start soon'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Completed Status */}
                  {request.status === 'completed' && (
                    <div className="mb-4 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">✅</span>
                        <div>
                          <p className="font-semibold text-green-900">Work Completed!</p>
                          <p className="text-sm text-green-700">
                            Please review your service provider's work
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/requests/${request.id}`)}
                    >
                      📄 View Details
                    </Button>
                    
                    {request.status === 'pending' && !hasAcceptedProviders && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewProviders(request.id, request.title)}
                      >
                        👥 Check for Providers
                      </Button>
                    )}
                    
                    {request.status === 'pending' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCancelRequest(request.id, request.title)}
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        ✕ Cancel Request
                      </Button>
                    )}
                    
                    {request.status === 'completed' && (
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => navigate(`/requests/${request.id}/review`)}
                      >
                        ⭐ Leave Review
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <div className="p-8 sm:p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {filter === 'all' ? 'No Requests Yet' : `No ${filter} Requests`}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {filter === 'all' 
                ? "You haven't created any service requests yet. Get started by browsing available services!"
                : `You don't have any ${filter} requests at the moment.`
              }
            </p>
            {filter === 'all' && (
              <Button onClick={() => navigate('/request-service')} size="lg">
                🔍 Browse Services
              </Button>
            )}
            {filter !== 'all' && (
              <Button variant="outline" onClick={() => setFilter('all')}>
                View All Requests
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Accepted Providers Modal */}
      {selectedRequestId && (
        <AcceptedProvidersModal
          requestId={selectedRequestId}
          requestTitle={selectedRequestTitle}
          isOpen={isProvidersModalOpen}
          onClose={handleCloseProvidersModal}
          onProviderConfirmed={handleProviderConfirmed}
        />
      )}
    </div>
  );
};
