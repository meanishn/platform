import React, { useState, useEffect } from 'react';
import { Card, Button } from '../../components/ui';
import { Link } from 'react-router-dom';
import { RoleGuard } from '../../components/auth/RoleGuard';
import { adminApi } from '../../services/realApi';

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

interface RecentActivity {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
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
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
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

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_registration': return '👤';
      case 'provider_verification': return '✅';
      case 'service_request': return '🛠️';
      case 'payment': return '💰';
      default: return '📋';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4, 5, 6, 7].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles={['admin']}>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Platform overview and management
          </p>
        </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-6 mb-8">
        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 text-sm font-medium">👥</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="text-lg font-semibold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 text-sm font-medium">🛠️</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Providers</p>
                <p className="text-lg font-semibold text-gray-900">{stats.totalProviders.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600 text-sm font-medium">👤</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Customers</p>
                <p className="text-lg font-semibold text-gray-900">{stats.totalCustomers.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <span className="text-yellow-600 text-sm font-medium">⏳</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Pending Verifications</p>
                <p className="text-lg font-semibold text-gray-900">{stats.pendingVerifications}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <span className="text-indigo-600 text-sm font-medium">📋</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Active Requests</p>
                <p className="text-lg font-semibold text-gray-900">{stats.activeRequests}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <span className="text-red-600 text-sm font-medium">💰</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <p className="text-lg font-semibold text-gray-900">
                  ${stats.totalRevenue.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                  <span className="text-teal-600 text-sm font-medium">📈</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Monthly Growth</p>
                <p className="text-lg font-semibold text-gray-900">
                  {stats.monthlyGrowth > 0 ? '+' : ''}{stats.monthlyGrowth}%
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mb-8">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Link to="/admin/users">
              <Button className="w-full justify-start" variant="outline">
                <span className="mr-2">👥</span>
                Manage Users
              </Button>
            </Link>
            <Link to="/admin/providers">
              <Button className="w-full justify-start" variant="outline">
                <span className="mr-2">🛠️</span>
                Provider Verification
              </Button>
            </Link>
            <Link to="/admin/services">
              <Button className="w-full justify-start" variant="outline">
                <span className="mr-2">📋</span>
                Service Categories
              </Button>
            </Link>
            <Link to="/admin/analytics">
              <Button className="w-full justify-start" variant="outline">
                <span className="mr-2">📊</span>
                Analytics
              </Button>
            </Link>
            <Link to="/admin/reports">
              <Button className="w-full justify-start" variant="outline">
                <span className="mr-2">📈</span>
                Reports
              </Button>
            </Link>
            <Link to="/admin/settings">
              <Button className="w-full justify-start" variant="outline">
                <span className="mr-2">⚙️</span>
                Settings
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Recent Activity
              </h3>
              <Link to="/admin/activity">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>

            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.slice(0, 8).map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-sm">{getActivityIcon(activity.type)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">
                          {new Date(activity.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-2">📋</div>
                <p className="text-gray-500">No recent activity</p>
              </div>
            )}
          </div>
        </Card>

        {/* Pending Actions */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Pending Actions
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <span className="text-yellow-600">⏳</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Provider Verifications</p>
                    <p className="text-sm text-gray-600">
                      {stats.pendingVerifications} providers waiting for approval
                    </p>
                  </div>
                </div>
                <Link to="/admin/providers?status=pending">
                  <Button size="sm">
                    Review
                  </Button>
                </Link>
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600">🚨</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Reported Issues</p>
                    <p className="text-sm text-gray-600">
                      3 user reports need investigation
                    </p>
                  </div>
                </div>
                <Link to="/admin/reports?status=open">
                  <Button size="sm">
                    Review
                  </Button>
                </Link>
              </div>

              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-purple-600">💳</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Payment Issues</p>
                    <p className="text-sm text-gray-600">
                      2 disputed transactions need review
                    </p>
                  </div>
                </div>
                <Link to="/admin/payments?status=disputed">
                  <Button size="sm">
                    Review
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
    </RoleGuard>
  );
};
