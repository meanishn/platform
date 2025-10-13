import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Badge } from '../../components/ui';
import { requestApi } from '../../services/realApi';
import { ServiceRequestDetailDto } from '../../types/api';
import { useNotificationService } from '../../services/notificationService';
import { formatDistanceToNow } from 'date-fns';

export const ProviderRequestDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const notify = useNotificationService();
  const [request, setRequest] = useState<ServiceRequestDetailDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (id) {
      fetchRequestDetail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchRequestDetail = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      const response = await requestApi.getRequest(parseInt(id));
      
      if (response.success && response.data) {
        setRequest(response.data);
      } else {
        notify.error('Error', response.message || 'Failed to load request details');
      }
    } catch (error) {
      console.error('Failed to fetch request:', error);
      notify.error('Error', 'Failed to load request details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!id) return;
    
    setIsProcessing(true);
    
    try {
      const response = await requestApi.acceptAssignment({
        requestId: parseInt(id)
      });
      
      if (response.success) {
        notify.success(
          'Assignment Accepted',
          'You have successfully accepted this service request'
        );
        navigate('/provider/assignments');
      } else {
        notify.error('Error', response.message || 'Failed to accept assignment');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to accept assignment';
      console.error('Failed to accept assignment:', error);
      notify.error('Error', errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecline = async () => {
    if (!id) return;
    
    const reason = prompt('Reason for declining (optional):');
    
    setIsProcessing(true);
    
    try {
      const response = await requestApi.declineAssignment({
        requestId: parseInt(id),
        reason: reason || undefined
      });
      
      if (response.success) {
        notify.info(
          'Assignment Declined',
          'You have declined this service request'
        );
        navigate('/provider/assignments');
      } else {
        notify.error('Error', response.message || 'Failed to decline assignment');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to decline assignment';
      console.error('Failed to decline assignment:', error);
      notify.error('Error', errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: 'default' | 'primary' | 'success' | 'warning' | 'danger', label: string }> = {
      pending: { variant: 'warning', label: 'Pending' },
      pending_selection: { variant: 'primary', label: 'Pending Selection' },
      assigned: { variant: 'primary', label: 'Assigned' },
      in_progress: { variant: 'primary', label: 'In Progress' },
      completed: { variant: 'success', label: 'Completed' },
      cancelled: { variant: 'danger', label: 'Cancelled' }
    };

    const config = statusConfig[status] || { variant: 'default' as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getUrgencyBadge = (urgency: string) => {
    const urgencyConfig: Record<string, { variant: 'default' | 'primary' | 'success' | 'warning' | 'danger', label: string }> = {
      emergency: { variant: 'danger', label: '🚨 Emergency' },
      high: { variant: 'warning', label: '⚡ High' },
      medium: { variant: 'primary', label: '📋 Medium' },
      low: { variant: 'default', label: '📌 Low' }
    };

    const config = urgencyConfig[urgency] || { variant: 'default' as const, label: urgency };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="p-8 text-center">
          <p className="text-gray-500 mb-4">Request not found</p>
          <Button onClick={() => navigate('/provider/assignments')}>
            Back to Assignments
          </Button>
        </Card>
      </div>
    );
  }

  const canAccept = request.status === 'assigned' || request.status === 'in_progress';

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{request.title}</h1>
          <p className="text-white/70">Request #{request.id}</p>
        </div>
        <div className="flex gap-2">
          {getStatusBadge(request.status)}
          {getUrgencyBadge(request.urgency)}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column - Main Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Description */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Description</h2>
            <p className="text-white/80 whitespace-pre-wrap">{request.description}</p>
          </Card>

          {/* Service Details */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Service Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-white/60 text-sm mb-1">Category</p>
                <p className="text-white font-medium">{request.category.name}</p>
              </div>
              <div>
                <p className="text-white/60 text-sm mb-1">Service Tier</p>
                <p className="text-white font-medium">{request.tier.name}</p>
              </div>
              <div>
                <p className="text-white/60 text-sm mb-1">Estimated Hours</p>
                <p className="text-white font-medium">{request.estimatedHours} hours</p>
              </div>
              <div>
                <p className="text-white/60 text-sm mb-1">Estimated Cost</p>
                <p className="text-white font-medium">
                  ${(request.estimatedHours * (request.tier.hourlyRate || 50)).toFixed(2)}
                </p>
              </div>
            </div>
          </Card>

          {/* Location */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Location</h2>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <span className="text-xl">📍</span>
                <div>
                  <p className="text-white font-medium">{request.address}</p>
                  {request.latitude && request.longitude && (
                    <p className="text-white/60 text-sm">
                      Coordinates: {request.latitude.toFixed(6)}, {request.longitude.toFixed(6)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Timeline */}
          {request.preferredDate && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Preferred Schedule</h2>
              <div className="flex items-center gap-2">
                <span className="text-xl">📅</span>
                <p className="text-white">
                  {new Date(request.preferredDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </Card>
          )}
        </div>

        {/* Right Column - Actions & Info */}
        <div className="space-y-6">
          {/* Action Buttons */}
          {canAccept && (
            <Card className="p-6">
              <h3 className="font-semibold text-white mb-4">Take Action</h3>
              <div className="space-y-3">
                <Button
                  onClick={handleAccept}
                  disabled={isProcessing}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                >
                  {isProcessing ? 'Processing...' : '✅ Accept Request'}
                </Button>
                <Button
                  onClick={handleDecline}
                  disabled={isProcessing}
                  variant="outline"
                  className="w-full"
                >
                  ❌ Decline
                </Button>
              </div>
            </Card>
          )}

          {/* Request Info */}
          <Card className="p-6">
            <h3 className="font-semibold text-white mb-4">Request Information</h3>
            <div className="space-y-3">
              <div>
                <p className="text-white/60 text-sm mb-1">Created</p>
                <p className="text-white text-sm">
                  {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                </p>
              </div>
              <div>
                <p className="text-white/60 text-sm mb-1">Status</p>
                <p className="text-white text-sm capitalize">{request.status.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-white/60 text-sm mb-1">Priority</p>
                <p className="text-white text-sm capitalize">{request.urgency}</p>
              </div>
            </div>
          </Card>

          {/* Customer Info (if available) */}
          {request.customer && (
            <Card className="p-6">
              <h3 className="font-semibold text-white mb-4">Customer</h3>
              <div className="space-y-2">
                <p className="text-white font-medium">
                  {request.customer.firstName} {request.customer.lastName}
                </p>
                <p className="text-white/60 text-sm">Contact info available after acceptance</p>
              </div>
            </Card>
          )}

          {/* Back Button */}
          <Button
            onClick={() => navigate('/provider/assignments')}
            variant="outline"
            className="w-full"
          >
            ← Back to Assignments
          </Button>
        </div>
      </div>
    </div>
  );
};
