/**
 * AdminActivityFeed Component
 * 
 * Extracted from Admin Dashboard to encapsulate activity feed display.
 * Shows recent platform activity with icons and timestamps.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Button } from '../ui';

export interface ActivityItem {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface AdminActivityFeedProps {
  activities: ActivityItem[];
  viewAllHref?: string;
}

const getActivityIcon = (type: string): string => {
  switch (type) {
    case 'user_registration': return '👤';
    case 'provider_verification': return '✅';
    case 'service_request': return '🛠️';
    case 'payment': return '💰';
    default: return '📋';
  }
};

export const AdminActivityFeed: React.FC<AdminActivityFeedProps> = ({
  activities,
  viewAllHref = '/admin/activity',
}) => {
  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-slate-900">
          Recent Activity
        </h3>
        <Link to={viewAllHref}>
          <Button variant="outline" size="sm">
            View All
          </Button>
        </Link>
      </div>

      {activities.length > 0 ? (
        <div className="space-y-4">
          {activities.slice(0, 8).map((activity) => (
            <div key={activity.id} className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                <span className="text-sm">{getActivityIcon(activity.type)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900">{activity.title}</p>
                <p className="text-sm text-slate-600">{activity.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-slate-500">
                    {new Date(activity.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-slate-400 text-4xl mb-2">📋</div>
          <p className="text-slate-500">No recent activity</p>
        </div>
      )}
    </Card>
  );
};

