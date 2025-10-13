import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Card, Button } from '../../components/ui';
import { customerApi } from '../../services/realApi';
import type { CustomerStatsDto, ActivityItemDto } from '../../types/api';
import {
  DashboardStatCard,
  LoadingSkeleton,
  PageHeader,
  ActivityList,
  QuickActionsCard
} from '../../components/ui';

export const CustomerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<CustomerStatsDto>({
    activeRequests: 0,
    completedJobs: 0,
    totalSpent: 0,
    pendingReviews: 0
  });
  const [recentActivity, setRecentActivity] = useState<ActivityItemDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsResult, activityResult] = await Promise.all([
        customerApi.getStats(),
        customerApi.getActivity(10)
      ]);

      if (statsResult.success && statsResult.data) {
        setStats(statsResult.data);
      }
      if (activityResult.success && activityResult.data) {
        setRecentActivity(activityResult.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      // Set default values on error to prevent rendering issues
      setStats({
        activeRequests: 0,
        completedJobs: 0,
        totalSpent: 0,
        pendingReviews: 0
      });
      setRecentActivity([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSkeleton type="page" />;
  }

  return (
    <div className="p-3 sm:p-6">
      <PageHeader
        title={`Welcome back, ${user?.firstName}!`}
        description="Here's what's happening with your services"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-6">
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
          label="Total Spent"
          value={`$${stats.totalSpent.toLocaleString()}`}
          colorScheme="yellow"
        />
        <DashboardStatCard
          icon="⭐"
          label="Pending Reviews"
          value={stats.pendingReviews}
          colorScheme="purple"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 mb-6">
        <div className="lg:col-span-2">
          <Card>
            <QuickActionsCard
              title="Quick Actions"
              actions={[
                { icon: '🔍', label: 'Browse Services', href: '/services' },
                { icon: '📋', label: 'My Requests', href: '/my-requests' },
                { icon: '👤', label: 'Edit Profile', href: '/profile' },
                { icon: '💬', label: 'Get Support', href: '/support' }
              ]}
            />
          </Card>
        </div>

        <div>
          <Card>
            <div className="p-4 sm:p-6 glass-card">
              <h3 className="text-lg font-medium text-black mb-4">
                Need Help?
              </h3>
              <div className="space-y-3">
                <div className="text-sm text-black/70">
                  Our support team is here to help you find the right service providers.
                </div>
                <Button variant="primary" size="sm" className="w-full">
                  Contact Support
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  View FAQ
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <div className="p-4 sm:p-6 glass-card">
          <h3 className="text-lg font-medium text-black mb-4">
            Recent Activity
          </h3>
          <ActivityList
            activities={recentActivity.map(activity => ({
              ...activity,
              id: activity.id || String(Math.random())
            }))}
            emptyMessage="No recent activity"
            emptyDescription="Start by browsing services or creating a request"
          />
        </div>
      </Card>
    </div>
  );
};
