/**
 * AdminQuickActionsGrid Component
 * 
 * Extracted from Admin Dashboard to encapsulate quick actions section.
 * Displays a grid of action buttons for common admin tasks.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Button } from '../ui';

export interface QuickAction {
  icon: string; // emoji
  label: string;
  href: string;
}

export interface AdminQuickActionsGridProps {
  actions: QuickAction[];
}

export const AdminQuickActionsGrid: React.FC<AdminQuickActionsGridProps> = ({ actions }) => {
  return (
    <Card>
      <h3 className="text-lg font-medium text-slate-900 mb-4">
        Quick Actions
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {actions.map((action, index) => (
          <Link key={index} to={action.href}>
            <Button className="w-full justify-start" variant="outline">
              <span className="mr-2">{action.icon}</span>
              {action.label}
            </Button>
          </Link>
        ))}
      </div>
    </Card>
  );
};

