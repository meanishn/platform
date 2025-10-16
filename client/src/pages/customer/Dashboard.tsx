import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/ui';
import { customerApi } from '../../services/realApi';
import type { CustomerStatsDto, ActivityItemDto } from '../../types/api';
import {
  DashboardStatCard,
  LoadingSkeleton,
  PageHeader,
  ActivityList,
  QuickActionsCard
} from '../../components/ui';
import { HelpCard } from '../../components/customer';
import { ClipboardList, CheckCircle2, DollarSign, Star, Search, User, MessageCircle } from 'lucide-react';

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
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
        <PageHeader
          title={`Welcome back, ${user?.firstName}!`}
          description="Here's what's happening with your services"
        />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-6">
        <DashboardStatCard
          icon={ClipboardList}
          label="Active Requests"
          value={stats.activeRequests}
          colorScheme="blue"
        />
        <DashboardStatCard
          icon={CheckCircle2}
          label="Completed Jobs"
          value={stats.completedJobs}
          colorScheme="green"
        />
        <DashboardStatCard
          icon={DollarSign}
          label="Total Spent"
          value={`$${stats.totalSpent.toLocaleString()}`}
          colorScheme="yellow"
        />
        <DashboardStatCard
          icon={Star}
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
                { icon: Search, label: 'Browse Services', href: '/services' },
                { icon: ClipboardList, label: 'My Requests', href: '/my-requests' },
                { icon: User, label: 'Edit Profile', href: '/profile' },
                { icon: MessageCircle, label: 'Get Support', href: '/support' }
              ]}
            />
          </Card>
        </div>

        <div>
          <HelpCard
            title="Need Help?"
            description="Our support team is here to help you find the right service providers."
            primaryAction={{
              label: 'Contact Support',
              onClick: () => window.location.href = '/support'
            }}
            secondaryAction={{
              label: 'View FAQ',
              onClick: () => window.location.href = '/faq'
            }}
          />
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <div className="p-4 sm:p-6">
          <h3 className="text-lg font-medium text-slate-900 mb-4">
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
    </div>
  );
};
