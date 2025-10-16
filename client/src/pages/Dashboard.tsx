import { DashboardStatCard, PageHeader } from '../components/ui';
import { ClipboardList, CheckCircle2, DollarSign, TrendingUp } from 'lucide-react';

export const Dashboard = () => {
  return (
    <div className="p-3 sm:p-6">
      <PageHeader
        title="Dashboard"
        description="Welcome back! Here's an overview of your activity."
      />
      
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 mb-6">
        <DashboardStatCard
          icon={ClipboardList}
          label="Active Requests"
          value={0}
          colorScheme="blue"
        />
        <DashboardStatCard
          icon={CheckCircle2}
          label="Completed Jobs"
          value={0}
          colorScheme="green"
        />
        <DashboardStatCard
          icon={DollarSign}
          label="Total Spent"
          value="$0"
          colorScheme="yellow"
        />
      </div>

      {/* Recent Activity Section */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-md p-5">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900 leading-tight">Recent Activity</h2>
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-blue-600" strokeWidth={2} />
          </div>
        </div>
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-100 rounded-xl mx-auto mb-4 flex items-center justify-center">
            <TrendingUp className="w-8 h-8 text-slate-400" strokeWidth={2} />
          </div>
          <p className="text-slate-900 text-lg font-medium">No recent activity to display</p>
          <p className="text-slate-500 text-sm mt-2">Your recent requests and activities will appear here</p>
        </div>
      </div>
    </div>
  );
};
