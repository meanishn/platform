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
  Badge,
  PageHeader,
  LoadingSkeleton,
} from '../../components/ui';
import { AcceptedProvidersModal } from '../../components/customer';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api, handleResponse } from '../../services/apiClient';
import { ServiceRequestListItemDto } from '../../types/api';
import { formatDistanceToNow } from 'date-fns';
import { useSocketEvent, SocketEvents } from '../../hooks/useWebSocket';
import { useConfirmationModal } from '../../hooks/useConfirmationModal';
import {
  Clock,
  Wrench,
  CheckCircle2,
  BarChart3,
  RefreshCw,
  Plus,
  MapPin,
  Calendar,
  Tag,
  User,
  Search,
  FileText,
  AlertCircle,
  XCircle,
  Star,
  CheckCircle,
  Hammer,
  ClipboardList,
  Users,
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

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { variant: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info', label: string, IconComponent: typeof Clock }> = {
      pending: { variant: 'warning', label: 'Awaiting Providers', IconComponent: Clock },
      assigned: { variant: 'info', label: 'Provider Assigned', IconComponent: CheckCircle },
      in_progress: { variant: 'primary', label: 'In Progress', IconComponent: Hammer },
      completed: { variant: 'success', label: 'Completed', IconComponent: CheckCircle2 },
      cancelled: { variant: 'danger', label: 'Cancelled', IconComponent: XCircle },
    };
    
    const config = configs[status] || { variant: 'default' as const, label: status, IconComponent: AlertCircle };
    
    return (
      <Badge variant={config.variant} size="sm">
        <span className="inline-flex items-center gap-1.5">
          <config.IconComponent className="w-3.5 h-3.5" strokeWidth={2} />
          <span>{config.label}</span>
        </span>
      </Badge>
    );
  };

  const getUrgencyBadge = (urgency: string) => {
    const configs: Record<string, { variant: 'default' | 'primary' | 'success' | 'warning' | 'danger', IconComponent: typeof AlertCircle }> = {
      emergency: { variant: 'danger', IconComponent: AlertCircle },
      high: { variant: 'danger', IconComponent: AlertCircle },
      medium: { variant: 'warning', IconComponent: AlertCircle },
      low: { variant: 'success', IconComponent: CheckCircle },
    };
    
    const config = configs[urgency] || { variant: 'default' as const, IconComponent: AlertCircle };
    
    return (
      <Badge variant={config.variant} size="sm">
        <span className="inline-flex items-center gap-1.5">
          <config.IconComponent className="w-3.5 h-3.5" strokeWidth={2} />
          <span className="capitalize">{urgency}</span>
        </span>
      </Badge>
    );
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
        <button 
          onClick={() => setFilter('pending')}
          className={`bg-blue-50 border rounded-lg p-4 md:p-6 hover:shadow-md transition-shadow cursor-pointer text-left ${
            filter === 'pending' ? 'border-blue-400 shadow-md ring-2 ring-blue-200' : 'border-blue-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-slate-600 text-xs md:text-sm mb-1">Pending</p>
              <p className="text-2xl md:text-3xl font-bold text-blue-900">{pendingCount}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center ml-4 flex-shrink-0">
              <Clock className="w-6 h-6 text-blue-600" strokeWidth={2} />
            </div>
          </div>
        </button>
        
        <button 
          onClick={() => setFilter('in_progress')}
          className={`bg-amber-50 border rounded-lg p-4 md:p-6 hover:shadow-md transition-shadow cursor-pointer text-left ${
            filter === 'in_progress' ? 'border-amber-400 shadow-md ring-2 ring-amber-200' : 'border-amber-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-slate-600 text-xs md:text-sm mb-1">Active</p>
              <p className="text-2xl md:text-3xl font-bold text-amber-900">{inProgressCount}</p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center ml-4 flex-shrink-0">
              <Hammer className="w-6 h-6 text-amber-600" strokeWidth={2} />
            </div>
          </div>
        </button>
        
        <button 
          onClick={() => setFilter('completed')}
          className={`bg-emerald-50 border rounded-lg p-4 md:p-6 hover:shadow-md transition-shadow cursor-pointer text-left ${
            filter === 'completed' ? 'border-emerald-400 shadow-md ring-2 ring-emerald-200' : 'border-emerald-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-slate-600 text-xs md:text-sm mb-1">Completed</p>
              <p className="text-2xl md:text-3xl font-bold text-emerald-900">{completedCount}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center ml-4 flex-shrink-0">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" strokeWidth={2} />
            </div>
          </div>
        </button>
        
        <button 
          onClick={() => setFilter('all')}
          className={`bg-slate-50 border rounded-lg p-4 md:p-6 hover:shadow-md transition-shadow cursor-pointer text-left ${
            filter === 'all' ? 'border-slate-400 shadow-md ring-2 ring-slate-200' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-slate-600 text-xs md:text-sm mb-1">Total</p>
              <p className="text-2xl md:text-3xl font-bold text-slate-900">{requests.length}</p>
            </div>
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center ml-4 flex-shrink-0">
              <BarChart3 className="w-6 h-6 text-slate-600" strokeWidth={2} />
            </div>
          </div>
        </button>
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
          {filteredRequests.map((request) => {
            const acceptedCount = acceptedProviderCounts[request.id] || 0;
            const hasAcceptedProviders = acceptedCount > 0;
            const isCompleted = request.status === 'completed';
            const isPending = request.status === 'pending';
            const isActive = request.status === 'in_progress' || request.status === 'assigned';
            
            // Status-based card styling
            const getCardBackground = () => {
              if (isCompleted) return 'bg-emerald-50/30 border-emerald-200/50';
              if (isActive) return 'bg-amber-50/30 border-amber-200/50';
              if (isPending && request.urgency === 'high') return 'bg-red-50/30 border-red-200/50';
              if (isPending) return 'bg-blue-50/30 border-blue-200/50';
              return 'bg-slate-50/30 border-slate-200';
            };
            
            // Status-based left accent border
            const getAccentBorder = () => {
              if (isCompleted) return 'border-l-4 border-l-emerald-300';
              if (isActive) return 'border-l-4 border-l-amber-300';
              if (isPending && request.urgency === 'high') return 'border-l-4 border-l-red-300';
              if (isPending) return 'border-l-4 border-l-blue-300';
              return 'border-l-4 border-l-slate-300';
            };
            
            return (
              <Card 
                key={request.id} 
                className={`${getCardBackground()} ${getAccentBorder()} border shadow-md hover:shadow-xl transition-all duration-200`}
              >
                <div className="p-5">
                  {/* Header: Title + Priority + Status */}
                  <div className="flex items-start justify-between gap-3 mb-4 pb-3 border-b border-slate-200/60">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-slate-900 mb-2 leading-tight">
                        {request.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2">
                        {getStatusBadge(request.status)}
                        {getUrgencyBadge(request.urgency)}
                      </div>
                    </div>
                  </div>

                  {/* Body: Description, Category, Time Info */}
                  {!isCompleted && (
                    <>
                      <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                        {request.description}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Tag className="w-4 h-4 text-slate-600" strokeWidth={2} />
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 font-medium">Category</p>
                            <p className="text-sm text-slate-900">{request.category.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Clock className="w-4 h-4 text-slate-600" strokeWidth={2} />
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 font-medium">Duration</p>
                            <p className="text-sm text-slate-900">{request.estimatedHours}h estimated</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <MapPin className="w-4 h-4 text-slate-600" strokeWidth={2} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-slate-500 font-medium">Location</p>
                            <p className="text-sm text-slate-900 truncate">{request.address}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Calendar className="w-4 h-4 text-slate-600" strokeWidth={2} />
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 font-medium">Created</p>
                            <p className="text-sm text-slate-900">{formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}</p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Collapsed view for completed requests */}
                  {isCompleted && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-3 text-slate-600">
                          <span className="flex items-center gap-1.5">
                            <Tag className="w-3.5 h-3.5" strokeWidth={2} />
                            {request.category.name}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" strokeWidth={2} />
                            {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Accepted Providers Alert */}
                  {isPending && hasAcceptedProviders && (
                    <div className="mb-4 p-4 bg-emerald-50 border-l-4 border-emerald-600 rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0 border border-emerald-200">
                          <Users className="w-5 h-5 text-emerald-700" strokeWidth={2} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 mb-1">
                            {acceptedCount === 1 
                              ? '1 Provider Ready!'
                              : `${acceptedCount} Providers Ready!`
                            }
                          </p>
                          <p className="text-sm text-slate-600 mb-3">
                            Review profiles and select the best match for your project.
                          </p>
                          <Button
                            size="sm"
                            onClick={() => handleViewProviders(request.id, request.title)}
                            className="bg-slate-700 text-white hover:bg-slate-800 font-medium flex items-center gap-2"
                          >
                            <User className="w-4 h-4" strokeWidth={2} />
                            <span>View & Select Provider</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Assigned/In Progress Status */}
                  {isActive && (
                    <div className={`mb-4 p-4 rounded-lg ${
                      request.status === 'in_progress' 
                        ? 'bg-amber-100 border border-amber-300' 
                        : 'bg-blue-100 border border-blue-300'
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          request.status === 'in_progress'
                            ? 'bg-amber-200'
                            : 'bg-blue-200'
                        }`}>
                          {request.status === 'in_progress' ? (
                            <Wrench className="w-5 h-5 text-amber-700" strokeWidth={2} />
                          ) : (
                            <CheckCircle className="w-5 h-5 text-blue-700" strokeWidth={2} />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">
                            {request.status === 'in_progress' ? 'Work in Progress' : 'Provider Confirmed'}
                          </p>
                          <p className="text-sm text-slate-700">
                            {request.status === 'in_progress' 
                              ? 'Your provider is actively working on this request'
                              : 'Work will begin soon'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Completed Status Banner */}
                  {isCompleted && (
                    <div className="mb-4 p-2.5 bg-emerald-100 border border-emerald-200 rounded-lg flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" strokeWidth={2} />
                      <p className="font-medium text-emerald-900 text-sm">Work Completed</p>
                    </div>
                  )}

                  {/* Footer: Action Buttons with Clear Hierarchy */}
                  <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-200/60">
                    {/* Primary action based on status */}
                    {isPending && hasAcceptedProviders && (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleViewProviders(request.id, request.title)}
                        className="flex items-center gap-2 font-medium"
                      >
                        <Users className="w-4 h-4" strokeWidth={2} />
                        <span>Select Provider</span>
                      </Button>
                    )}
                    
                    {/* Secondary actions */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/requests/${request.id}`)}
                      className="flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" strokeWidth={2} />
                      <span>View Details</span>
                    </Button>
                    
                    {isPending && !hasAcceptedProviders && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewProviders(request.id, request.title)}
                        className="flex items-center gap-2"
                      >
                        <Users className="w-4 h-4" strokeWidth={2} />
                        <span>Check Providers</span>
                      </Button>
                    )}
                    
                    {isCompleted && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/requests/${request.id}/review`)}
                        className="flex items-center gap-2"
                      >
                        <Star className="w-4 h-4" strokeWidth={2} />
                        <span>Leave Review</span>
                      </Button>
                    )}
                    
                    {/* Destructive action */}
                    {isPending && (
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleCancelRequest(request.id, request.title)}
                        className="flex items-center gap-2 ml-auto"
                      >
                        <XCircle className="w-4 h-4" strokeWidth={2} />
                        <span>Cancel</span>
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
