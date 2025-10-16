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
import { adminApi } from '../../services/realApi';
import { responsiveGrids } from '../../styles/responsive.config';

interface AdminStats {
  totalUsers: number;
  totalProviders: number;
  totalCustomers: number;
  pendingVerifications: number;
  activeRequests: number;
  completedRequests?: number;
  totalRevenue: number;
  monthlyGrowth: number;
}

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalProviders: 0,
    totalCustomers: 0,
    pendingVerifications: 0,
    activeRequests: 0,
    totalRevenue: 0,
    monthlyGrowth: 0
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
        totalUsers: 0,
        totalProviders: 0,
        totalCustomers: 0,
        pendingVerifications: 0,
        activeRequests: 0,
        totalRevenue: 0,
        monthlyGrowth: 0
      });
      setRecentActivity([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSkeleton type="page" />;
  }

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
      description: `${stats.pendingVerifications} providers waiting for approval`,
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
              value={stats.totalUsers.toLocaleString()}
              icon="👥"
              colorScheme="blue"
            />
            <AdminStatCard
              label="Providers"
              value={stats.totalProviders.toLocaleString()}
              icon="🛠️"
              colorScheme="green"
            />
            <AdminStatCard
              label="Customers"
              value={stats.totalCustomers.toLocaleString()}
              icon="👤"
              colorScheme="purple"
            />
            <AdminStatCard
              label="Pending Verifications"
              value={stats.pendingVerifications}
              icon="⏳"
              colorScheme="yellow"
            />
            <AdminStatCard
              label="Active Requests"
              value={stats.activeRequests}
              icon="📋"
              colorScheme="indigo"
            />
            <AdminStatCard
              label="Total Revenue"
              value={`$${stats.totalRevenue.toLocaleString()}`}
              icon="💰"
              colorScheme="red"
            />
            <AdminStatCard
              label="Monthly Growth"
              value={`${stats.monthlyGrowth > 0 ? '+' : ''}${stats.monthlyGrowth}%`}
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
