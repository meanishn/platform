import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Card, Button, Badge } from '../../components/ui';
import { Link } from 'react-router-dom';
import { providerApi } from '../../services/realApi';
import { ProviderAssignmentDto } from '../../types/api';

export const ProviderAssignments: React.FC = () => {
  const { token } = useAuth();
  const [assignments, setAssignments] = useState<ProviderAssignmentDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'declined'>('all');

  useEffect(() => {
    const fetchAssignments = async () => {
      if (!token) return;
      
      try {
        const response = await providerApi.getAssignments();
        if (response.success && response.data) {
          setAssignments(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch assignments:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignments();
  }, [token]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'accepted': return 'info';
      case 'declined': return 'danger';
      default: return 'default';
    }
  };

  const filteredAssignments = assignments.filter(assignment => {
    if (filter === 'all') return true;
    return assignment.status === filter;
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">
          My Assignments
        </h1>
        <p className="text-white/70">
          Manage your service requests and assignments
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={filter === 'all' ? 'primary' : 'outline'}
          onClick={() => setFilter('all')}
          size="sm"
        >
          All ({assignments.length})
        </Button>
        <Button
          variant={filter === 'pending' ? 'primary' : 'outline'}
          onClick={() => setFilter('pending')}
          size="sm"
        >
          Pending ({assignments.filter(a => a.status === 'pending').length})
        </Button>
        <Button
          variant={filter === 'accepted' ? 'primary' : 'outline'}
          onClick={() => setFilter('accepted')}
          size="sm"
        >
          Accepted ({assignments.filter(a => a.status === 'accepted').length})
        </Button>
        <Button
          variant={filter === 'declined' ? 'primary' : 'outline'}
          onClick={() => setFilter('declined')}
          size="sm"
        >
          Declined ({assignments.filter(a => a.status === 'declined').length})
        </Button>
      </div>

      {/* Assignments List */}
      {filteredAssignments.length > 0 ? (
        <div className="space-y-4">
          {filteredAssignments.map((assignment) => (
            <Card key={assignment.id}>
              <div className="p-6 glass-card">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-medium text-black">Request #{assignment.requestId}</h3>
                      <Badge variant={getStatusColor(assignment.status)} size="sm">
                        {assignment.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-black/60 mb-3">
                      <span>📅 Notified: {new Date(assignment.notifiedAt).toLocaleDateString()}</span>
                      {assignment.respondedAt && (
                        <span>✅ Responded: {new Date(assignment.respondedAt).toLocaleDateString()}</span>
                      )}
                      {assignment.expiresAt && assignment.status === 'pending' && (
                        <span className="text-red-600">⏰ Expires: {new Date(assignment.expiresAt).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Link to={`/provider/assignments/${assignment.id}`}>
                      <Button size="sm">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <div className="p-12 glass-card text-center">
            <div className="text-black/60 text-4xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-black mb-2">No assignments found</h3>
            <p className="text-sm text-black/70 mb-6">
              {filter === 'all' 
                ? "You don't have any assignments yet. New assignments will appear here when service requests match your profile."
                : `No ${filter} assignments at this time.`
              }
            </p>
            <Link to="/provider/dashboard">
              <Button>
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
};
