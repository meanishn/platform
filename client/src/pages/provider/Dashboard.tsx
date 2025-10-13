import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Card, Button, Badge } from '../../components/ui';
import { Link } from 'react-router-dom';
import { RoleGuard } from '../../components/auth/RoleGuard';
import { providerApi } from '../../services/realApi';
import { ActivityItemDto } from '../../types/api';
import {
  DashboardStatCard,
  LoadingSkeleton,
  PageHeader,
  ActivityList,
  QuickActionsCard
} from '../../components/ui';

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
  const [recentRequests, setRecentRequests] = useState<ActivityItemDto[]>([]);
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

  if (isLoading) {
    return <LoadingSkeleton type="page" />;
  }

  return (
    <RoleGuard allowedRoles={['provider']}>
      <div className="p-3 sm:p-6">
        <PageHeader
          title="Provider Dashboard"
          description={`Welcome back, ${user?.firstName}! Manage your service assignments below, or request services from other providers.`}
        />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 mb-6">
        <DashboardStatCard
          icon="📋"
          label="Active Requests"
          value={stats.activeRequests}
          colorScheme="blue"
        />
        <DashboardStatCard
          icon="✅"
          label="Completed Jobs"
          value={stats.completedJobs}
          colorScheme="green"
        />
        <DashboardStatCard
          icon="💰"
          label="Total Earnings"
          value={`$${stats.totalEarnings.toLocaleString()}`}
          colorScheme="yellow"
        />
        <DashboardStatCard
          icon="⭐"
          label="Avg Rating"
          value={stats.averageRating.toFixed(1)}
          colorScheme="purple"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="lg:col-span-3">
          <Card>
            <div className="p-4 sm:p-6 glass-card space-y-4">
              <div>
                <h4 className="text-sm font-medium text-black/70 mb-2">Provider Actions</h4>
                <QuickActionsCard
                  title=""
                  actions={[
                    { icon: '📋', label: 'View Assignments', href: '/provider/assignments', variant: 'primary', customClassName: 'bg-blue-600 hover:bg-blue-700' },
                    { icon: '👤', label: 'My Profile', href: '/profile' }
                  ]}
                />
              </div>
              
              <div className="pt-3 border-t border-black/10">
                <h4 className="text-sm font-medium text-black/70 mb-2">Need a Service? Request as Customer</h4>
                <QuickActionsCard
                  title=""
                  actions={[
                    { icon: '➕', label: 'Request Service', href: '/request-service', variant: 'primary', customClassName: 'bg-green-600 hover:bg-green-700' },
                    { icon: '📝', label: 'My Requests', href: '/requests' }
                  ]}
                />
              </div>
            </div>
          </Card>
        </div>

        <div>
          <Card>
            <div className="p-4 sm:p-6 glass-card">
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
        <div className="p-4 sm:p-6 glass-card">
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

          <ActivityList
            activities={recentRequests.slice(0, 5).map(request => ({
              id: request.id,
              type: request.type,
              title: request.title,
              description: request.description,
              timestamp: request.timestamp,
              urgency: request.metadata?.urgency as 'high' | 'medium' | 'low' | undefined,
              status: request.metadata?.status as string | undefined,
              metadata: request.metadata
            }))}
            emptyMessage="No recent requests"
            emptyDescription="You'll receive notifications when new requests match your qualifications"
            showBadges={true}
          />
        </div>
      </Card>
    </div>
    </RoleGuard>
  );
};
