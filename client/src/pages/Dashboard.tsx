import { DashboardStatCard, PageHeader } from '../components/ui';

export const Dashboard = () => {
  return (
    <div className="p-3 sm:p-6">
      <PageHeader
        title="Dashboard"
        description="Welcome back! Here's an overview of your activity."
      />
      
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 mb-6">
        <DashboardStatCard
          icon="📋"
          label="Active Requests"
          value={0}
          colorScheme="blue"
        />
        <DashboardStatCard
          icon="✅"
          label="Completed Jobs"
          value={0}
          colorScheme="green"
        />
        <DashboardStatCard
          icon="💰"
          label="Total Spent"
          value="$0"
          colorScheme="yellow"
        />
      </div>

      {/* Recent Activity Section */}
      <div className="glass-card">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-2xl font-bold text-black">Recent Activity</h2>
          <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center">
            <span className="text-white text-sm">📊</span>
          </div>
        </div>
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-400/30 to-secondary-400/30 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-black/60 text-2xl">📈</span>
          </div>
          <p className="text-black/70 text-lg font-medium">No recent activity to display</p>
          <p className="text-black/40 text-sm mt-2">Your recent requests and activities will appear here</p>
        </div>
      </div>
    </div>
  );
};
