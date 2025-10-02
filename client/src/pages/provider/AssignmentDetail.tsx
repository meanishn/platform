import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Card, Button, Badge } from '../../components/ui';
import { api, handleResponse } from '../../services/apiClient';

interface Assignment {
  notification: {
    id: number;
    providerId: number;
    requestId: number;
    status: 'pending' | 'accepted' | 'declined' | 'expired';
    notifiedAt: string;
    respondedAt?: string;
    expiresAt?: string;
  };
  request: {
    id: number;
    userId: number;
    categoryId: number;
    tierId: number;
    title: string;
    description: string;
    address: string;
    preferredDate?: string;
    urgency: 'low' | 'medium' | 'high' | 'emergency';
    estimatedHours: number;
    status: string;
    createdAt: string;
  };
}

export const AssignmentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchAssignmentDetail = async () => {
      if (!token || !id) return;
      
      try {
        const response = await api.get('/api/providers/assignments');
        const data = await handleResponse<{ success: boolean; data: Assignment[] }>(response);
        
        // Find the specific assignment
        const foundAssignment = data.data.find(
          (a: Assignment) => a.notification.id.toString() === id
        );
        
        setAssignment(foundAssignment || null);
      } catch (error) {
        console.error('Failed to fetch assignment:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignmentDetail();
  }, [id, token]);

  const handleAccept = async () => {
    if (!assignment) return;
    
    setIsProcessing(true);
    
    try {
      const response = await api.patch(`/api/assignments/${assignment.notification.id}/accept`);
      await handleResponse(response);
      navigate('/provider/assignments');
    } catch (error: any) {
      console.error('Failed to accept assignment:', error);
      alert(error.message || 'Failed to accept assignment');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecline = async () => {
    if (!assignment) return;
    
    const reason = prompt('Reason for declining (optional):');
    
    setIsProcessing(true);
    
    try {
      const response = await api.patch(`/api/assignments/${assignment.notification.id}/decline`, { reason });
      await handleResponse(response);
      
      navigate('/provider/assignments');
    } catch (error) {
      console.error('Failed to decline assignment:', error);
      alert('Failed to decline assignment');
    } finally {
      setIsProcessing(false);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'emergency': return 'danger';
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'accepted': return 'info';
      case 'declined': return 'danger';
      case 'expired': return 'default';
      default: return 'default';
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <Card>
          <div className="p-8 text-center">
            <div className="text-4xl mb-4">⏳</div>
            <p className="text-gray-600">Loading assignment details...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="p-8">
        <Card>
          <div className="p-8 text-center">
            <div className="text-4xl mb-4">❌</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Assignment Not Found</h2>
            <p className="text-gray-600 mb-4">
              This assignment may have been removed or is no longer available.
            </p>
            <Link to="/provider/assignments">
              <Button>Back to Assignments</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const { notification, request } = assignment;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link to="/provider/assignments" className="text-blue-600 hover:text-blue-700 mb-4 inline-block">
          ← Back to Assignments
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Assignment Details</h1>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Request Info Card */}
        <Card>
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{request.title}</h2>
                <div className="flex items-center gap-3">
                  <Badge variant={getUrgencyColor(request.urgency)}>
                    {request.urgency.toUpperCase()}
                  </Badge>
                  <Badge variant={getStatusColor(notification.status)}>
                    {notification.status}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">📍 Location</h3>
                <p className="text-gray-900">{request.address}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">⏱️ Estimated Duration</h3>
                <p className="text-gray-900">{request.estimatedHours} hour(s)</p>
              </div>

              {request.preferredDate && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">📅 Preferred Date</h3>
                  <p className="text-gray-900">
                    {new Date(request.preferredDate).toLocaleDateString()}
                  </p>
                </div>
              )}

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">🕐 Request Created</h3>
                <p className="text-gray-900">
                  {new Date(request.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">📝 Description</h3>
              <p className="text-gray-900 whitespace-pre-wrap">{request.description}</p>
            </div>

            {notification.expiresAt && notification.status === 'pending' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 text-sm">
                  ⏰ This assignment expires on{' '}
                  <strong>{new Date(notification.expiresAt).toLocaleString()}</strong>
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Notification Info Card */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Details</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Notified At:</span>
                <span className="text-gray-900 font-medium">
                  {new Date(notification.notifiedAt).toLocaleString()}
                </span>
              </div>
              
              {notification.respondedAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Responded At:</span>
                  <span className="text-gray-900 font-medium">
                    {new Date(notification.respondedAt).toLocaleString()}
                  </span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <Badge variant={getStatusColor(notification.status)}>
                  {notification.status}
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        {notification.status === 'pending' && (
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Take Action</h3>
              <div className="flex gap-4">
                <Button
                  onClick={handleAccept}
                  disabled={isProcessing}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {isProcessing ? 'Processing...' : '✓ Accept Assignment'}
                </Button>
                <Button
                  onClick={handleDecline}
                  disabled={isProcessing}
                  variant="outline"
                  className="flex-1 border-red-600 text-red-600 hover:bg-red-50"
                >
                  ✗ Decline
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

