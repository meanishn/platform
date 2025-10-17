import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  Card, 
  Button,
  StatCard,
  LoadingSkeleton,
  PageHeader,
  ActivityList,
  QuickActionsCard,
  PageContainer,
  SectionHeader,
  FeaturedActionCard,
} from '../../components/ui';
import { RoleGuard } from '../../components/auth/RoleGuard';
import { providerApi } from '../../services/realApi';
import { ActivityItemDto } from '../../types/api';
import { ProfileStatusCard } from '../../components/provider';
import { ClipboardList, CheckCircle2, DollarSign, Star, User, Plus, FileText, Zap } from 'lucide-react';
import { responsiveGrids, responsiveSpacing } from '../../styles/responsive.config';

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
  const navigate = useNavigate();
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
      <PageContainer maxWidth="7xl">
        <PageHeader
          title="Provider Dashboard"
          description={`Welcome back, ${user?.firstName}! Find new jobs or manage your assignments.`}
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
            label="Total Earnings"
            value={`$${stats.totalEarnings.toLocaleString()}`}
            colorScheme="yellow"
          />
          <StatCard
            icon={Star}
            label="Avg Rating"
            value={stats.averageRating.toFixed(1)}
            colorScheme="purple"
          />
        </div>

        {/* Featured Primary Action - Find Available Jobs */}
        <FeaturedActionCard
          icon={Zap}
          title="Ready for New Work?"
          description="Browse available jobs matching your skills and start earning today"
          variant="primary"
          primaryAction={{
            label: 'Find Available Jobs',
            onClick: () => navigate('/provider/available-jobs'),
          }}
          secondaryAction={{
            label: 'View Assignments',
            onClick: () => navigate('/provider/assignments'),
          }}
        />

        {/* Quick Actions & Profile */}
        <div className={responsiveGrids.content3}>
          <div className="lg:col-span-2">
            <Card>
              <div className={responsiveSpacing.cardPadding}>
                <QuickActionsCard
                  title="Quick Actions"
                  actions={[
                    { icon: User, label: 'My Profile', href: '/profile' },
                    { icon: Plus, label: 'Request Service (as Customer)', href: '/request-service' },
                    { icon: FileText, label: 'My Customer Requests', href: '/requests' }
                  ]}
                />
              </div>
            </Card>
          </div>

          <div>
            <ProfileStatusCard
              status={{
                completionPercentage: 85,
                verificationStatus: 'verified'
              }}
              editProfileHref="/profile"
            />
          </div>
        </div>

        {/* Recent Activity */}
        <Card>
          <div className={responsiveSpacing.cardPadding}>
            <SectionHeader 
              title="Recent Activity"
              action={
                <Link to="/provider/requests">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              }
            />

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
              emptyMessage="No recent activity"
              emptyDescription="Your recent assignments and activities will appear here"
              showBadges={true}
            />
          </div>
        </Card>
      </PageContainer>
    </RoleGuard>
  );
};
