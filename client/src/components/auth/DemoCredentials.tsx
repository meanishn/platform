import React from 'react';

export const DemoCredentials: React.FC = () => {
  return (
    <div className="glass-card mb-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-black mb-2 flex items-center gap-2">
          <span className="animate-float">🎭</span>
          Demo Credentials
        </h3>
        <p className="text-black/70 text-sm mb-4">
          Use these credentials to test different user roles:
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-1">
        <div className="bg-black/5 rounded-xl p-4 border border-black/10">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">👑</span>
            <span className="font-medium text-black">Admin</span>
          </div>
          <div className="text-sm space-y-1">
            <div>
              <span className="text-black/60">Email:</span>
              <code className="ml-2 text-primary-600">aadmin@platform.com</code>
            </div>
            <div>
              <span className="text-black/60">Password:</span>
              <code className="ml-2 text-primary-600">admin123</code>
            </div>
          </div>
        </div>

        <div className="bg-black/5 rounded-xl p-4 border border-black/10">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🛠️</span>
            <span className="font-medium text-black">Provider</span>
          </div>
          <div className="text-sm space-y-1">
            <div>
              <span className="text-black/60">Email:</span>
              <code className="ml-2 text-secondary-600">maria.garcia@email.com</code>
            </div>
            <div>
              <span className="text-black/60">Password:</span>
              <code className="ml-2 text-secondary-600">password123</code>
            </div>
          </div>
        </div>

        <div className="bg-black/5 rounded-xl p-4 border border-black/10">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">👤</span>
            <span className="font-medium text-black">Customer</span>
          </div>
          <div className="text-sm space-y-1">
            <div>
              <span className="text-black/60">Email:</span>
              <code className="ml-2 text-accent-600">customer@example.com</code>
            </div>
            <div>
              <span className="text-black/60">Password:</span>
              <code className="ml-2 text-accent-600">password123</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
