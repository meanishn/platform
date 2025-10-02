export const Dashboard = () => {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gradient mb-3">Dashboard</h1>
        <p className="text-black/70 text-lg">Welcome back! Here's an overview of your activity.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="glass-card group hover:animate-pulse-glow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center group-hover:animate-float">
              <span className="text-white text-xl">📋</span>
            </div>
            <div className="text-right">
              <p className="text-black/60 text-sm font-medium">Active</p>
              <p className="text-black/60 text-sm font-medium">Requests</p>
            </div>
          </div>
          <h3 className="text-lg font-medium text-black/90 mb-2">Active Requests</h3>
          <p className="text-4xl font-bold text-primary-600 mb-2">0</p>
          <div className="flex items-center text-sm">
            <span className="text-green-600">↗ 0%</span>
            <span className="text-black/60 ml-2">from last week</span>
          </div>
        </div>

        <div className="glass-card group hover:animate-pulse-glow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center group-hover:animate-float">
              <span className="text-white text-xl">✅</span>
            </div>
            <div className="text-right">
              <p className="text-black/60 text-sm font-medium">Completed</p>
              <p className="text-black/60 text-sm font-medium">Jobs</p>
            </div>
          </div>
          <h3 className="text-lg font-medium text-black/90 mb-2">Completed Jobs</h3>
          <p className="text-4xl font-bold text-green-600 mb-2">0</p>
          <div className="flex items-center text-sm">
            <span className="text-green-600">↗ 0%</span>
            <span className="text-black/60 ml-2">from last week</span>
          </div>
        </div>

        <div className="glass-card group hover:animate-pulse-glow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-accent-400 to-accent-600 rounded-xl flex items-center justify-center group-hover:animate-float">
              <span className="text-white text-xl">💰</span>
            </div>
            <div className="text-right">
              <p className="text-black/60 text-sm font-medium">Total</p>
              <p className="text-black/60 text-sm font-medium">Spent</p>
            </div>
          </div>
          <h3 className="text-lg font-medium text-black/90 mb-2">Total Spent</h3>
          <p className="text-4xl font-bold text-accent-600 mb-2">$0</p>
          <div className="flex items-center text-sm">
            <span className="text-green-600">↗ 0%</span>
            <span className="text-black/60 ml-2">from last week</span>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="glass-card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-black">Recent Activity</h2>
          <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center animate-pulse-glow">
            <span className="text-white text-sm">📊</span>
          </div>
        </div>
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-400/30 to-secondary-400/30 rounded-full mx-auto mb-4 flex items-center justify-center animate-float">
            <span className="text-black/60 text-2xl">📈</span>
          </div>
          <p className="text-black/60 text-lg">No recent activity to display</p>
          <p className="text-black/40 text-sm mt-2">Your recent requests and activities will appear here</p>
        </div>
      </div>
    </div>
  );
};
