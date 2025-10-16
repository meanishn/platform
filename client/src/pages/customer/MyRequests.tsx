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
  Button,
  PageHeader,
  LoadingSkeleton,
  SearchBar,
  FilterButtonGroup,
  EmptyState,
  PageContainer,
  StatCard,
} from '../../components/ui';
import { 
  AcceptedProvidersModal, 
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
  RefreshCw,
  Plus,
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
  const assignedCount = requests.filter(r => r.status === 'assigned').length;
  const inProgressCount = requests.filter(r => r.status === 'in_progress').length;
  const completedCount = requests.filter(r => r.status === 'completed').length;

  return (
    <PageContainer maxWidth="7xl">
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Pending"
          value={pendingCount}
          icon={Clock}
          colorScheme="blue"
          isActive={filter === 'pending'}
          onClick={() => setFilter('pending')}
        />
        <StatCard
          label="Assigned"
          value={assignedCount}
          icon={CheckCircle}
          colorScheme="purple"
          isActive={filter === 'assigned'}
          onClick={() => setFilter('assigned')}
        />
        <StatCard
          label="Active"
          value={inProgressCount}
          icon={Hammer}
          colorScheme="amber"
          isActive={filter === 'in_progress'}
          onClick={() => setFilter('in_progress')}
        />
        <StatCard
          label="Completed"
          value={completedCount}
          icon={CheckCircle2}
          colorScheme="emerald"
          isActive={filter === 'completed'}
          onClick={() => setFilter('completed')}
        />
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-3">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by title, category, or location..."
          className="w-full"
        />
        <FilterButtonGroup
          options={[
            { value: 'all', label: 'All Requests', icon: ClipboardList },
            { value: 'pending', label: 'Pending', icon: Clock },
            { value: 'assigned', label: 'Assigned', icon: CheckCircle },
            { value: 'in_progress', label: 'Active', icon: Hammer },
            { value: 'completed', label: 'Done', icon: CheckCircle2 }
          ]}
          activeFilter={filter}
          onChange={setFilter}
        />
      </div>

      {/* Requests List */}
      <div>
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
        <EmptyState
          icon={ClipboardList}
          title={filter === 'all' ? 'No Requests Yet' : `No ${filter} Requests`}
          description={
            filter === 'all' 
              ? "You haven't created any service requests yet. Get started by browsing available services!"
              : `You don't have any ${filter} requests at the moment.`
          }
          action={{
            label: filter === 'all' ? 'Browse Services' : 'View All Requests',
            onClick: filter === 'all' ? () => navigate('/request-service') : () => setFilter('all'),
            variant: filter === 'all' ? 'primary' : 'outline',
          }}
        />
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
    </PageContainer>
  );
};
