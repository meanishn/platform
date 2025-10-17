import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  Card,
  StatCard,
  LoadingSkeleton,
  PageHeader,
  ActivityList,
  QuickActionsCard,
  PageContainer,
  SectionHeader,
  FeaturedActionCard,
} from '../../components/ui';
import { customerApi } from '../../services/apiService';
import type { CustomerStatsDto, ActivityItemDto } from '../../types/api';
import { HelpCard } from '../../components/customer';
import { ClipboardList, CheckCircle2, DollarSign, Star, User, MessageCircle, Sparkles } from 'lucide-react';
import { responsiveGrids, responsiveSpacing } from '../../styles/responsive.config';

export const CustomerDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
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
    <PageContainer maxWidth="7xl">
      <PageHeader
        title={`Welcome back, ${user?.firstName}!`}
        description="Here's what's happening with your services"
      />

      {/* Stats Cards - Show overview first for context */}
      <div className={responsiveGrids.stats4}>
        <StatCard
          icon={ClipboardList}
          label="Active Requests"
          value={stats.activeRequests}
          colorScheme="blue"
        />
        <StatCard
          icon={CheckCircle2}
          label="Completed Jobs"
          value={stats.completedJobs}
          colorScheme="green"
        />
        <StatCard
          icon={DollarSign}
          label="Total Spent"
          value={`$${stats.totalSpent.toLocaleString()}`}
          colorScheme="yellow"
        />
        <StatCard
          icon={Star}
          label="Pending Reviews"
          value={stats.pendingReviews}
          colorScheme="purple"
        />
      </div>

      {/* Featured Primary Action - Request a Service */}
      <FeaturedActionCard
        icon={Sparkles}
        title="Need a Service?"
        description="Submit your service request and we'll automatically match you with qualified providers"
        variant="primary"
        primaryAction={{
          label: 'Request Service',
          onClick: () => navigate('/request-service'),
        }}
        secondaryAction={{
          label: 'View My Requests',
          onClick: () => navigate('/my-requests'),
        }}
      />

      {/* Quick Actions & Help */}
      <div className={responsiveGrids.content3}>
        <div className="lg:col-span-2">
          <Card>
            <div className={responsiveSpacing.cardPadding}>
              <QuickActionsCard
                title="Quick Actions"
                actions={[
                  { icon: ClipboardList, label: 'My Requests', href: '/my-requests' },
                  { icon: User, label: 'Edit Profile', href: '/profile' },
                  { icon: MessageCircle, label: 'Get Support', href: '/support' }
                ]}
              />
            </div>
          </Card>
        </div>

        <div>
          <HelpCard
            title="Need Help?"
            description="Our support team is here to help you find the right service providers."
            primaryAction={{
              label: 'Contact Support',
              onClick: () => navigate('/support')
            }}
            secondaryAction={{
              label: 'View FAQ',
              onClick: () => navigate('/faq')
            }}
          />
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <div className={responsiveSpacing.cardPadding}>
          <SectionHeader title="Recent Activity" />
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
    </PageContainer>
  );
};
