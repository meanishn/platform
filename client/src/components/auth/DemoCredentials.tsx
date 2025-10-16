import React from 'react';
import { Crown, Wrench, User } from 'lucide-react';

export const DemoCredentials: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-md p-5 mb-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900 leading-snug mb-2 flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <User className="w-4 h-4 text-blue-600" strokeWidth={2} />
          </div>
          Demo Credentials
        </h3>
        <p className="text-sm text-slate-600 leading-normal">
          Use these credentials to test different user roles:
        </p>
      </div>
      
      <div className="grid gap-3 md:grid-cols-1">
        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
              <Crown className="w-4 h-4 text-slate-600" strokeWidth={2} />
            </div>
            <span className="font-medium text-slate-900">Admin</span>
          </div>
          <div className="text-sm space-y-1">
            <div>
              <span className="text-slate-600">Email:</span>
              <code className="ml-2 text-slate-900 font-medium">aadmin@platform.com</code>
            </div>
            <div>
              <span className="text-slate-600">Password:</span>
              <code className="ml-2 text-slate-900 font-medium">admin123</code>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
              <Wrench className="w-4 h-4 text-amber-600" strokeWidth={2} />
            </div>
            <span className="font-medium text-slate-900">Provider</span>
          </div>
          <div className="text-sm space-y-1">
            <div>
              <span className="text-slate-600">Email:</span>
              <code className="ml-2 text-slate-900 font-medium">maria.garcia@email.com</code>
            </div>
            <div>
              <span className="text-slate-600">Password:</span>
              <code className="ml-2 text-slate-900 font-medium">password123</code>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <User className="w-4 h-4 text-blue-600" strokeWidth={2} />
            </div>
            <span className="font-medium text-slate-900">Customer</span>
          </div>
          <div className="text-sm space-y-1">
            <div>
              <span className="text-slate-600">Email:</span>
              <code className="ml-2 text-slate-900 font-medium">customer@example.com</code>
            </div>
            <div>
              <span className="text-slate-600">Password:</span>
              <code className="ml-2 text-slate-900 font-medium">password123</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
