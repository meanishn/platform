/**
 * My Requests Page - Customer Service Request Management
 * Shows all customer's service requests with ability to:
 * - View accepted providers
 * - Confirm/select provider
 * - Track request status
 * - Cancel requests
 * 
 * DESIGN: Updated with new minimalistic design system
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { 
  Card, 
  Button, 
  Input,
  PageHeader,
  LoadingSkeleton,
} from '../../components/ui';
import { 
  AcceptedProvidersModal, 
  FilterStatCard, 
  ServiceRequestCard 
} from '../../components/customer';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api, handleResponse } from '../../services/apiClient';
import { ServiceRequestListItemDto } from '../../types/api';
import { useSocketEvent, SocketEvents } from '../../hooks/useWebSocket';
import { useConfirmationModal } from '../../hooks/useConfirmationModal';
import {
  Clock,
  CheckCircle2,
  BarChart3,
  RefreshCw,
  Plus,
  Search,
  CheckCircle,
  Hammer,
  ClipboardList,
  AlertTriangle,
} from 'lucide-react';

interface SocketEventData {
  requestId?: number | string;
  [key: string]: unknown;
}

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
  
  // Confirmation modal
  const { confirm: confirmCancel, ConfirmationModalComponent: CancelConfirmationModal } = useConfirmationModal();

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

  // WebSocket: Listen for real-time updates
  useSocketEvent(SocketEvents.REQUEST_STATUS_CHANGED, useCallback((data: SocketEventData) => {
    console.log('🔔 Request status changed:', data);
    fetchRequests(); // Refresh the list
  }, [fetchRequests]));

  useSocketEvent(SocketEvents.PROVIDER_ACCEPTED, useCallback((data: SocketEventData) => {
    console.log('🔔 Provider accepted request:', data);
    fetchRequests(); // Refresh to show new accepted provider
    if (data.requestId) {
      fetchAcceptedProviderCount(Number(data.requestId)); // Update specific request count
    }
  }, [fetchRequests]));

  useSocketEvent(SocketEvents.PROVIDER_CONFIRMED, useCallback((data: SocketEventData) => {
    console.log('🔔 Provider confirmed:', data);
    fetchRequests(); // Refresh to show assignment
  }, [fetchRequests]));

  useSocketEvent(SocketEvents.WORK_STARTED, useCallback((data: SocketEventData) => {
    console.log('🔔 Work started:', data);
    fetchRequests(); // Refresh to show in-progress status
  }, [fetchRequests]));

  useSocketEvent(SocketEvents.WORK_COMPLETED, useCallback((data: SocketEventData) => {
    console.log('🔔 Work completed:', data);
    fetchRequests(); // Refresh to show completed status
  }, [fetchRequests]));

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


  const handleCancelRequest = async (requestId: number, title: string) => {
    confirmCancel(
      {
        title: 'Cancel Request',
        message: `Are you sure you want to cancel "${title}"? This action cannot be undone.`,
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
        try {
          const response = await api.patch(`/api/service-requests/${requestId}/cancel`, { reason });
          await handleResponse(response);
          fetchRequests();
        } catch (error) {
          console.error('Failed to cancel request:', error);
          alert('Failed to cancel request. Please try again.');
        }
      }
    );
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
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
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
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" strokeWidth={2} />
            <span>Refresh</span>
          </Button>
          <Button 
            onClick={() => navigate('/request-service')}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
            <span>New Request</span>
          </Button>
        </div>
      </div>
        
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
        <FilterStatCard
          label="Pending"
          count={pendingCount}
          icon={Clock}
          colorScheme="blue"
          isActive={filter === 'pending'}
          onClick={() => setFilter('pending')}
        />
        <FilterStatCard
          label="Active"
          count={inProgressCount}
          icon={Hammer}
          colorScheme="amber"
          isActive={filter === 'in_progress'}
          onClick={() => setFilter('in_progress')}
        />
        <FilterStatCard
          label="Completed"
          count={completedCount}
          icon={CheckCircle2}
          colorScheme="emerald"
          isActive={filter === 'completed'}
          onClick={() => setFilter('completed')}
        />
        <FilterStatCard
          label="Total"
          count={requests.length}
          icon={BarChart3}
          colorScheme="slate"
          isActive={filter === 'all'}
          onClick={() => setFilter('all')}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" strokeWidth={2} />
          <Input
            placeholder="Search by title, category, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 text-sm h-10 border-slate-300 focus:border-slate-400"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
          {[
            { value: 'all', label: 'All Requests', icon: ClipboardList },
            { value: 'pending', label: 'Pending', icon: Clock },
            { value: 'assigned', label: 'Assigned', icon: CheckCircle },
            { value: 'in_progress', label: 'Active', icon: Hammer },
            { value: 'completed', label: 'Done', icon: CheckCircle2 }
          ].map(option => {
            const Icon = option.icon;
            const isActive = filter === option.value;
            return (
              <Button
                key={option.value}
                variant={isActive ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilter(option.value)}
                className={`whitespace-nowrap flex items-center gap-2 font-medium ${
                  isActive ? 'shadow-md' : ''
                }`}
              >
                <Icon className="w-4 h-4" strokeWidth={2} />
                {option.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Requests List */}
      <div className="pt-2">
        {filteredRequests.length > 0 ? (
          <div className="space-y-3">
            {filteredRequests.map((request) => (
              <ServiceRequestCard
                key={request.id}
                request={request}
                acceptedProviderCount={acceptedProviderCounts[request.id] || 0}
                onViewProviders={handleViewProviders}
                onCancel={handleCancelRequest}
              />
            ))}
          </div>
      ) : (
        <Card>
          <div className="p-8 sm:p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-50 rounded-full flex items-center justify-center">
              <ClipboardList className="w-8 h-8 text-slate-400" strokeWidth={2} />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              {filter === 'all' ? 'No Requests Yet' : `No ${filter} Requests`}
            </h3>
            <p className="text-slate-600 mb-6 max-w-md mx-auto">
              {filter === 'all' 
                ? "You haven't created any service requests yet. Get started by browsing available services!"
                : `You don't have any ${filter} requests at the moment.`
              }
            </p>
            {filter === 'all' && (
              <Button 
                onClick={() => navigate('/request-service')} 
                size="lg"
                className="flex items-center gap-2 mx-auto"
              >
                <Search className="w-5 h-5" strokeWidth={2} />
                <span>Browse Services</span>
              </Button>
            )}
            {filter !== 'all' && (
              <Button 
                variant="outline" 
                onClick={() => setFilter('all')}
                className="mx-auto"
              >
                View All Requests
              </Button>
            )}
          </div>
        </Card>
        )}
      </div>

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
      
      {/* Cancel Request Confirmation Modal */}
      {CancelConfirmationModal}
      </div>
    </div>
  );
};
