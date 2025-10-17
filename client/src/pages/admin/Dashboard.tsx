import React, { useState, useEffect } from 'react';
import { RoleGuard } from '../../components/auth/RoleGuard';
import { LoadingSkeleton, PageHeader, PageContainer } from '../../components/ui';
import { 
  AdminStatCard, 
  AdminQuickActionsGrid, 
  AdminActivityFeed, 
  AdminPendingActions,
  type ActivityItem,
  type QuickAction,
  type PendingAction
} from '../../components/admin';
import { adminApi } from '../../services/apiService';
import { responsiveGrids } from '../../styles/responsive.config';
import { AdminStatsDto } from '../../types/api';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStatsDto>({
    users: { total: 0, active: 0, new: 0 },
    providers: { total: 0, pending: 0, approved: 0, rejected: 0, suspended: 0 },
    requests: { total: 0, pending: 0, inProgress: 0, completed: 0, cancelled: 0 },
    revenue: { total: 0, thisMonth: 0, lastMonth: 0 }
  });
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsResult, activityResult] = await Promise.all([
        adminApi.getAdminStats(),
        adminApi.getAdminActivity(10)
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
        users: { total: 0, active: 0, new: 0 },
        providers: { total: 0, pending: 0, approved: 0, rejected: 0, suspended: 0 },
        requests: { total: 0, pending: 0, inProgress: 0, completed: 0, cancelled: 0 },
        revenue: { total: 0, thisMonth: 0, lastMonth: 0 }
      });
      setRecentActivity([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSkeleton type="page" />;
  }

  // Calculate derived stats
  const monthlyGrowth = stats.revenue.lastMonth > 0
    ? Math.round(((stats.revenue.thisMonth - stats.revenue.lastMonth) / stats.revenue.lastMonth) * 100)
    : 0;

  // Data configuration for components
  const quickActions: QuickAction[] = [
    { icon: '👥', label: 'Manage Users', href: '/admin/users' },
    { icon: '🛠️', label: 'Provider Verification', href: '/admin/providers' },
    { icon: '📋', label: 'Service Categories', href: '/admin/services' },
    { icon: '📊', label: 'Analytics', href: '/admin/analytics' },
    { icon: '📈', label: 'Reports', href: '/admin/reports' },
    { icon: '⚙️', label: 'Settings', href: '/admin/settings' },
  ];

  const pendingActions: PendingAction[] = [
    {
      id: '1',
      icon: '⏳',
      title: 'Provider Verifications',
      description: `${stats.providers.pending} providers waiting for approval`,
      actionLabel: 'Review',
      actionHref: '/admin/providers?status=pending',
      colorScheme: 'yellow',
    },
    {
      id: '2',
      icon: '🚨',
      title: 'Reported Issues',
      description: '3 user reports need investigation',
      actionLabel: 'Review',
      actionHref: '/admin/reports?status=open',
      colorScheme: 'blue',
    },
    {
      id: '3',
      icon: '💳',
      title: 'Payment Issues',
      description: '2 disputed transactions need review',
      actionLabel: 'Review',
      actionHref: '/admin/payments?status=disputed',
      colorScheme: 'purple',
    },
  ];

  return (
    <RoleGuard allowedRoles={['admin']}>
      <PageContainer maxWidth="7xl">
          <PageHeader
            title="Admin Dashboard"
            description="Platform overview and management"
          />

          {/* Stats Cards */}
          <div className={responsiveGrids.adminStats}>
            <AdminStatCard
              label="Total Users"
              value={stats.users.total.toLocaleString()}
              icon="👥"
              colorScheme="blue"
            />
            <AdminStatCard
              label="Providers"
              value={stats.providers.approved.toLocaleString()}
              icon="🛠️"
              colorScheme="green"
            />
            <AdminStatCard
              label="Active Users"
              value={stats.users.active.toLocaleString()}
              icon="👤"
              colorScheme="purple"
            />
            <AdminStatCard
              label="Pending Verifications"
              value={stats.providers.pending}
              icon="⏳"
              colorScheme="yellow"
            />
            <AdminStatCard
              label="Active Requests"
              value={stats.requests.pending + stats.requests.inProgress}
              icon="📋"
              colorScheme="indigo"
            />
            <AdminStatCard
              label="Total Revenue"
              value={`$${stats.revenue.total.toLocaleString()}`}
              icon="💰"
              colorScheme="red"
            />
            <AdminStatCard
              label="Monthly Growth"
              value={`${monthlyGrowth > 0 ? '+' : ''}${monthlyGrowth}%`}
              icon="📈"
              colorScheme="teal"
            />
          </div>

          {/* Quick Actions */}
          <AdminQuickActionsGrid actions={quickActions} />

          {/* Activity Feed and Pending Actions */}
          <div className={responsiveGrids.content2}>
            <AdminActivityFeed activities={recentActivity} />
            <AdminPendingActions actions={pendingActions} />
          </div>
      </PageContainer>
    </RoleGuard>
  );
};
