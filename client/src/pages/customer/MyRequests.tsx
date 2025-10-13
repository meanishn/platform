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
import { useNavigate } from 'react-router-dom';
import { api, handleResponse } from '../../services/apiClient';
import { ServiceRequestListItemDto, ProviderWithContactDto } from '../../types/api';

// Component to show assigned provider info
interface AssignedProviderInfoProps {
  requestId: number;
  status: string;
  onConfirm?: () => void;
  onReject?: () => void;
}

const AssignedProviderInfo: React.FC<AssignedProviderInfoProps> = ({ requestId, status, onConfirm, onReject }) => {
  const { token } = useAuth();
  const [provider, setProvider] = useState<ProviderWithContactDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProvider = async () => {
      if (!token) return;
      try {
        const response = await api.get(`/api/requests/${requestId}/assigned-provider`);
        const data = await handleResponse<{ success: boolean; data: ProviderWithContactDto }>(response);
        setProvider(data.data);
      } catch (error) {
        console.error('Failed to fetch provider:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProvider();
  }, [requestId, token]);

  if (loading) {
    return (
      <div className="mt-3 p-3 bg-blue-50 rounded-lg animate-pulse">
        <div className="h-16 bg-blue-100 rounded"></div>
      </div>
    );
  }

  if (!provider) return null;

  const getBgColor = () => {
    if (status === 'awaiting_customer_confirmation') return 'bg-purple-50 border-purple-200';
    if (status === 'completed') return 'bg-green-50 border-green-200';
    if (status === 'in_progress') return 'bg-yellow-50 border-yellow-200';
    if (status === 'confirmed') return 'bg-blue-50 border-blue-200';
    return 'bg-blue-50 border-blue-200';
  };

  const getTextColor = () => {
    if (status === 'awaiting_customer_confirmation') return 'text-purple-900';
    if (status === 'completed') return 'text-green-900';
    if (status === 'in_progress') return 'text-yellow-900';
    if (status === 'confirmed') return 'text-blue-900';
    return 'text-blue-900';
  };

  const getIcon = () => {
    if (status === 'awaiting_customer_confirmation') return '⏳';
    if (status === 'completed') return '✅';
    if (status === 'in_progress') return '🔧';
    if (status === 'confirmed') return '✓';
    return '👷‍♂️';
  };

  const getStatusText = () => {
    if (status === 'awaiting_customer_confirmation') return 'Provider Accepted - Please Confirm';
    if (status === 'completed') return 'Completed by';
    if (status === 'in_progress') return 'In Progress';
    if (status === 'confirmed') return 'Confirmed Provider';
    return 'Assigned Provider';
  };

  return (
    <div className={`mt-3 p-4 rounded-lg border ${getBgColor()}`}>
      <div className="flex items-center gap-3">
        <span className="text-2xl">{getIcon()}</span>
        <div className="flex-1">
          <p className={`font-medium ${getTextColor()}`}>
            {getStatusText()}
          </p>
          <p className="text-sm font-semibold text-gray-900 mt-1">
            {provider.firstName} {provider.lastName}
          </p>
          {provider.averageRating && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-yellow-500 text-sm">★ {provider.averageRating.toFixed(1)}</span>
              <span className="text-gray-500 text-xs">• {provider.totalJobsCompleted} jobs completed</span>
            </div>
          )}
          {provider.phone && (
            <p className="text-sm text-gray-600 mt-1">
              📞 {provider.phone}
            </p>
          )}
        </div>
      </div>
      
      {/* Confirmation buttons for awaiting_customer_confirmation status */}
      {status === 'awaiting_customer_confirmation' && (
        <div className="mt-4 pt-4 border-t border-purple-200">
          <p className="text-sm text-purple-700 mb-3">
            This provider has accepted your request. Review their profile and confirm to proceed.
          </p>
          <div className="flex gap-3">
            <Button
              onClick={onConfirm}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              ✓ Confirm Provider
            </Button>
            <Button
              variant="outline"
              onClick={onReject}
              className="flex-1 border-purple-300 text-purple-700 hover:bg-purple-50"
            >
              ✕ Reject
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export const MyRequests: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<ServiceRequestListItemDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchRequests = useCallback(async () => {
    if (!token) return;
    
    try {
      const response = await api.get(`/api/service-requests`);
      const data = await handleResponse<{ success: boolean; data: ServiceRequestListItemDto[] }>(response);
      setRequests(data.data || []);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests, filter]);

  // Auto-refresh every 5 seconds to show status updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (token) {
        fetchRequests();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchRequests, token]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'accepted': return 'info';
      case 'in_progress': return 'primary';
      case 'completed': return 'success';
      case 'cancelled': return 'danger';
      default: return 'default';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const handleCancelRequest = async (requestId: number) => {
    try {
      const response = await api.patch(`/api/service-requests/${requestId}/cancel`);
      await handleResponse(response);
      setRequests(requests.map(req => 
        req.id === requestId ? { ...req, status: 'cancelled' } : req
      ));
    } catch (error) {
      console.error('Failed to cancel request:', error);
    }
  };

  const handleConfirmProvider = async (requestId: number) => {
    try {
      const response = await api.patch(`/api/service-requests/${requestId}/confirm-provider`);
      await handleResponse(response);
      // Refresh the requests to show updated status
      await fetchRequests();
      alert('Provider confirmed! Work will begin soon.');
    } catch (error) {
      console.error('Failed to confirm provider:', error);
      alert('Failed to confirm provider. Please try again.');
    }
  };

  const handleRejectProvider = async (requestId: number) => {
    if (!confirm('Are you sure you want to reject this provider? Your request will be reopened and sent to other providers.')) {
      return;
    }
    try {
      const response = await api.patch(`/api/service-requests/${requestId}/reject-provider`);
      await handleResponse(response);
      // Refresh the requests to show updated status
      await fetchRequests();
      alert('Provider rejected. Your request has been reopened and sent to other qualified providers.');
    } catch (error) {
      console.error('Failed to reject provider:', error);
      alert('Failed to reject provider. Please try again.');
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <PageHeader
          title="My Service Requests"
          description="Track and manage your service requests"
        />
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={fetchRequests}
            disabled={isLoading}
          >
            🔄 Refresh
          </Button>
          <Button onClick={() => navigate('/request-service')}>
            + New Request
          </Button>
        </div>
      </div>
        
      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex gap-2">
          {[
            { value: 'all', label: 'All' },
            { value: 'pending', label: 'Pending' },
            { value: 'accepted', label: 'Accepted' },
            { value: 'in_progress', label: 'In Progress' },
            { value: 'completed', label: 'Completed' }
          ].map(option => (
            <Button
              key={option.value}
              variant={filter === option.value ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Request Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Pending"
          value={requests.filter(r => r.status === 'pending').length}
          icon="⏳"
          colorScheme="blue"
        />
        <StatCard
          label="In Progress"
          value={requests.filter(r => r.status === 'in_progress').length}
          icon="🔧"
          colorScheme="yellow"
        />
        <StatCard
          label="Completed"
          value={requests.filter(r => r.status === 'completed').length}
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

      {/* Requests List */}
      {filteredRequests.length > 0 ? (
        <div className="space-y-6">
          {filteredRequests.map((request) => (
            <Card key={request.id}>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {request.title}
                      </h3>
                      <Badge variant={getStatusColor(request.status)} size="sm">
                        {request.status.replace('_', ' ')}
                      </Badge>
                      <Badge variant={getUrgencyColor(request.urgency)} size="sm">
                        {request.urgency}
                      </Badge>
                    </div>
                    <p className="text-gray-600 mb-3">{request.description}</p>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <span>🏷️ Category: {request.category.name}</span>
                      <span>⏰ {request.estimatedHours} hour(s)</span>
                      <span>📍 {request.address}</span>
                      <span>📅 {new Date(request.createdAt).toLocaleDateString()}</span>
                      {request.preferredDate && (
                        <span>�️ Preferred: {new Date(request.preferredDate).toLocaleDateString()}</span>
                      )}
                    </div>

                    {request.status === 'completed' && request.completedAt && (
                      <div className="mt-3 p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="text-green-600">✅</span>
                          <div>
                            <p className="font-medium text-green-900">
                              Work Completed
                            </p>
                            <p className="text-sm text-green-600">
                              Finished on {new Date(request.completedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {(request.status === 'assigned' || request.status === 'in_progress' || request.status === 'completed') && (
                      <AssignedProviderInfo
                        requestId={request.id}
                        status={request.status}
                        onConfirm={() => handleConfirmProvider(request.id)}
                        onReject={() => handleRejectProvider(request.id)}
                      />
                    )}
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <Button
                      size="sm"
                      onClick={() => navigate(`/requests/${request.id}`)}
                    >
                      View Details
                    </Button>
                    
                    {request.status === 'pending' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCancelRequest(request.id)}
                      >
                        Cancel
                      </Button>
                    )}
                    
                    {request.status === 'completed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/requests/${request.id}/review`)}
                      >
                        Leave Review
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <div className="p-8 text-center">
            <div className="text-gray-400 text-4xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No requests found
            </h3>
            <p className="text-gray-600 mb-4">
              {filter === 'all' 
                ? "You haven't made any service requests yet."
                : `No ${filter} requests found.`
              }
            </p>
            <Button onClick={() => navigate('/services')}>
              Browse Services
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
