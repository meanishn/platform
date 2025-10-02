import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Card, Button, Badge } from '../../components/ui';
import { Link } from 'react-router-dom';
import { RoleGuard } from '../../components/auth/RoleGuard';
import { providerApi } from '../../services/realApi';
import { ServiceRequestListItemDto } from '../../types/api';

interface ProviderStats {
  activeRequests: number;
  completedJobs: number;
  totalEarnings: number;
  averageRating: number;
  responseTime: string;
  completionRate: number;
  pendingAssignments: number;
}

export const ProviderDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<ProviderStats>({
    activeRequests: 0,
    completedJobs: 0,
    totalEarnings: 0,
    averageRating: 0,
    responseTime: '0h',
    completionRate: 0,
    pendingAssignments: 0
  });
  const [recentRequests, setRecentRequests] = useState<ServiceRequestListItemDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsResult, requestsResult] = await Promise.all([
        providerApi.getProviderStats(),
        providerApi.getProviderActivity()
      ]);

      if (statsResult.success && statsResult.data) {
        setStats(statsResult.data);
      }
      if (requestsResult.success && requestsResult.data) {
        setRecentRequests(requestsResult.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'accepted': return 'info';
      case 'in_progress': return 'primary';
      case 'completed': return 'success';
      default: return 'default';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles={['provider']}>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">
            Provider Dashboard
          </h1>
          <p className="text-white/70">
            Welcome back, {user?.firstName}! Manage your service assignments below, or request services from other providers.
          </p>
        </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
        <Card>
          <div className="p-6 glass-card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center border border-blue-400/30">
                  <span className="text-blue-400 text-sm font-medium">📋</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-black/70">Active Requests</p>
                <p className="text-lg font-semibold text-black">{stats.activeRequests}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6 glass-card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center border border-green-400/30">
                  <span className="text-green-400 text-sm font-medium">✅</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-black/70">Completed Jobs</p>
                <p className="text-lg font-semibold text-black">{stats.completedJobs}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6 glass-card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center border border-yellow-400/30">
                  <span className="text-yellow-400 text-sm font-medium">💰</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-black/70">Total Earnings</p>
                <p className="text-lg font-semibold text-black">
                  ${stats.totalEarnings.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6 glass-card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center border border-purple-400/30">
                  <span className="text-purple-400 text-sm font-medium">⭐</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-black/70">Avg Rating</p>
                <p className="text-lg font-semibold text-black">
                  {stats.averageRating.toFixed(1)}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6 glass-card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center border border-indigo-400/30">
                  <span className="text-indigo-400 text-sm font-medium">⏱️</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-black/70">Response Time</p>
                <p className="text-lg font-semibold text-black">{stats.responseTime}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6 glass-card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center border border-red-400/30">
                  <span className="text-red-400 text-sm font-medium">📊</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-black/70">Completion Rate</p>
                <p className="text-lg font-semibold text-black">{stats.completionRate}%</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
        <div className="lg:col-span-3">
          <Card>
            <div className="p-6 glass-card">
              <h3 className="text-lg font-medium text-black mb-4">
                Quick Actions
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-black/70 mb-2">Provider Actions</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <Link to="/provider/assignments">
                      <Button className="w-full justify-start bg-blue-600 hover:bg-blue-700">
                        <span className="mr-2">📋</span>
                        View Assignments
                      </Button>
                    </Link>
                    <Link to="/profile">
                      <Button className="w-full justify-start" variant="outline">
                        <span className="mr-2">👤</span>
                        My Profile
                      </Button>
                    </Link>
                  </div>
                </div>
                
                <div className="pt-3 border-t border-black/10">
                  <h4 className="text-sm font-medium text-black/70 mb-2">Need a Service? Request as Customer</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <Link to="/request-service">
                      <Button className="w-full justify-start bg-green-600 hover:bg-green-700">
                        <span className="mr-2">➕</span>
                        Request Service
                      </Button>
                    </Link>
                    <Link to="/requests">
                      <Button className="w-full justify-start" variant="outline">
                        <span className="mr-2">📝</span>
                        My Requests
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div>
          <Card>
            <div className="p-6 glass-card">
              <h3 className="text-lg font-medium text-black mb-4">
                Profile Status
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-black/70">Profile Complete</span>
                  <Badge variant="success" size="sm">85%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-black/70">Verification</span>
                  <Badge variant="success" size="sm">Verified</Badge>
                </div>
                <div className="mt-4">
                  <Link to="/provider/profile">
                    <Button variant="outline" size="sm" className="w-full">
                      Complete Profile
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Requests */}
      <Card>
        <div className="p-6 glass-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-black">
              Recent Service Requests
            </h3>
            <Link to="/provider/requests">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>

          {recentRequests.length > 0 ? (
            <div className="space-y-4">
              {recentRequests.slice(0, 5).map((request) => (
                <div key={request.id} className="flex items-center justify-between p-4 bg-black/5 rounded-lg border border-black/10">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-black">{request.title}</h4>
                      <Badge variant={getUrgencyColor(request.urgency)} size="sm">
                        {request.urgency}
                      </Badge>
                      <Badge variant={getStatusColor(request.status)} size="sm">
                        {request.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-black/70 mb-2">{request.description}</p>
                    <div className="flex items-center gap-4 text-xs text-black/60">
                      <span>� {request.category.name}</span>
                      <span>💰 ${request.tier.baseHourlyRate}/hr</span>
                      <span>📍 {request.address}</span>
                      <span>📅 {new Date(request.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link to={`/provider/requests/${request.id}`}>
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                    </Link>
                    {request.status === 'pending' && (
                      <Button size="sm">
                        Respond
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-black/60 text-4xl mb-2">📋</div>
              <p className="text-black">No recent requests</p>
              <p className="text-sm text-black/70 mb-4">
                You'll receive notifications when new requests match your qualifications
              </p>
              <Link to="/provider/assignments">
                <Button>
                  View All Assignments
                </Button>
              </Link>
            </div>
          )}
        </div>
      </Card>
    </div>
    </RoleGuard>
  );
};
