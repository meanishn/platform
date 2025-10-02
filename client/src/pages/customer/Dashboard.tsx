import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Card, Button } from '../../components/ui';
import { Link } from 'react-router-dom';
import { customerApi } from '../../services/realApi';

interface DashboardStats {
  activeRequests: number;
  completedJobs: number;
  totalSpent: number;
  pendingReviews: number;
}

interface RecentActivity {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export const CustomerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    activeRequests: 0,
    completedJobs: 0,
    totalSpent: 0,
    pendingReviews: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
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
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-white/20 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-white/10 rounded-xl border border-white/20"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-black">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-black/70">Here's what's happening with your services</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <div className="p-6 glass-card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center border border-blue-400/30">
                  <span className="text-blue-300 text-sm font-medium">📋</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-black/70 truncate">
                    Active Requests
                  </dt>
                  <dd className="text-lg font-medium text-black">
                    {stats.activeRequests}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6 glass-card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center border border-green-400/30">
                  <span className="text-green-300 text-sm font-medium">✅</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-black/70 truncate">
                    Completed Jobs
                  </dt>
                  <dd className="text-lg font-medium text-black">
                    {stats.completedJobs}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6 glass-card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center border border-yellow-400/30">
                  <span className="text-yellow-300 text-sm font-medium">💰</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-black/70 truncate">
                    Total Spent
                  </dt>
                  <dd className="text-lg font-medium text-black">
                    ${stats.totalSpent.toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6 glass-card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center border border-purple-400/30">
                  <span className="text-purple-300 text-sm font-medium">⭐</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-black/70 truncate">
                    Pending Reviews
                  </dt>
                  <dd className="text-lg font-medium text-black">
                    {stats.pendingReviews}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
          <Card>
            <div className="p-6 glass-card">
              <h3 className="text-lg font-medium text-black mb-4">
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <Link to="/services">
                  <Button className="w-full justify-start text-black " variant="outline">
                    <span className="mr-2">🔍</span>
                    <span className="text-black/60">Browse Services</span>
                  </Button>
                </Link>
                <Link to="/my-requests">
                  <Button className="w-full justify-start text-black" variant="outline">
                    <span className="mr-2">📋</span>
                    <span className="text-black/60">My Requests</span>
                  </Button>
                </Link>
                <Link to="/profile">
                  <Button className="w-full justify-start" variant="outline">
                    <span className="mr-2">👤</span>
                    <span className="text-black/60">Edit Profile</span>
                  </Button>
                </Link>
                <Link to="/support">
                  <Button className="w-full justify-start" variant="outline">
                    <span className="mr-2">💬</span>
                    <span className="text-black/60">Get Support</span>
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>

        <div>
          <Card>
            <div className="p-6 glass-card">
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
        <div className="p-6 glass-card">
          <h3 className="text-lg font-medium text-black mb-4">
            Recent Activity
          </h3>
          {recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-black/10 rounded-full flex items-center justify-center border border-black/20">
                      <span className="text-xs">
                        {activity.type === 'request_created' && '📝'}
                        {activity.type === 'proposal_received' && '💡'}
                        {activity.type === 'job_completed' && '✅'}
                        {activity.type === 'payment' && '💰'}
                        {!['request_created', 'proposal_received', 'job_completed', 'payment'].includes(activity.type) && '📋'}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-black">
                      {activity.title}
                    </p>
                    <p className="text-sm text-black/70">
                      {activity.description}
                    </p>
                    <p className="text-xs text-black/50 mt-1">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-black/40 text-4xl mb-2">📝</div>
              <p className="text-black/70">No recent activity</p>
              <p className="text-sm text-black/50">
                Start by browsing services or creating a request
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
