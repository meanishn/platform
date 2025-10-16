/**
 * AdminPendingActions Component
 * 
 * Extracted from Admin Dashboard to encapsulate pending actions display.
 * Shows items requiring admin attention with action buttons.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Button } from '../ui';

export interface PendingAction {
  id: string;
  icon: string; // emoji
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
  colorScheme: 'yellow' | 'blue' | 'purple';
}

export interface AdminPendingActionsProps {
  actions: PendingAction[];
}

const colorSchemeClasses = {
  yellow: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    iconBg: 'bg-yellow-100',
    iconText: 'text-yellow-600',
  },
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    iconBg: 'bg-blue-100',
    iconText: 'text-blue-600',
  },
  purple: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    iconBg: 'bg-purple-100',
    iconText: 'text-purple-600',
  },
};

export const AdminPendingActions: React.FC<AdminPendingActionsProps> = ({ actions }) => {
  return (
    <Card>
      <h3 className="text-lg font-medium text-slate-900 mb-4">
        Pending Actions
      </h3>
      
      <div className="space-y-4">
        {actions.map((action) => {
          const colors = colorSchemeClasses[action.colorScheme];
          
          return (
            <div 
              key={action.id} 
              className={`flex items-center justify-between p-4 ${colors.bg} rounded-lg border ${colors.border}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 ${colors.iconBg} rounded-lg flex items-center justify-center`}>
                  <span className={colors.iconText}>{action.icon}</span>
                </div>
                <div>
                  <p className="font-medium text-slate-900">{action.title}</p>
                  <p className="text-sm text-slate-600">{action.description}</p>
                </div>
              </div>
              <Link to={action.actionHref}>
                <Button size="sm">
                  {action.actionLabel}
                </Button>
              </Link>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

