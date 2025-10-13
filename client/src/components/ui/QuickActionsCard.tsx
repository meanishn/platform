import React from 'react';
import { Button } from './Button';

export interface QuickActionProps {
  icon: string;
  label: string;
  onClick?: () => void;
  href?: string;
  variant?: 'primary' | 'outline' | 'secondary' | 'ghost' | 'danger';
  customClassName?: string;
}

export interface QuickActionsCardProps {
  title: string;
  actions: QuickActionProps[];
  columns?: 1 | 2 | 3;
}

export const QuickActionsCard: React.FC<QuickActionsCardProps> = ({
  title,
  actions,
  columns = 2
}) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3'
  };

  return (
    <div className="p-6 glass-card">
      <h3 className="text-lg font-medium text-black mb-4">{title}</h3>
      <div className={`grid ${gridCols[columns]} gap-3`}>
        {actions.map((action, index) => {
          const ButtonComponent = (
            <Button
              className={`w-full justify-start ${action.customClassName || ''}`}
              variant={action.variant || 'outline'}
              onClick={action.onClick}
            >
              <span className="mr-2">{action.icon}</span>
              <span className={action.variant === 'outline' ? 'text-black/70' : ''}>
                {action.label}
              </span>
            </Button>
          );

          return action.href ? (
            <a key={index} href={action.href}>
              {ButtonComponent}
            </a>
          ) : (
            <div key={index}>{ButtonComponent}</div>
          );
        })}
      </div>
    </div>
  );
};
