import React from 'react';
import { Button } from './Button';
import { LucideIcon } from 'lucide-react';

export interface QuickActionProps {
  icon: LucideIcon | string;
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
    <div className="p-6 bg-white border border-slate-200 rounded-lg shadow-md">
      {title && <h3 className="text-lg font-semibold text-slate-900 leading-snug mb-4">{title}</h3>}
      <div className={`grid ${gridCols[columns]} gap-3`}>
        {actions.map((action, index) => {
          const IconComponent = typeof action.icon === 'string' ? null : action.icon;
          
          const ButtonComponent = (
            <Button
              className={`w-full justify-start gap-2 ${action.customClassName || ''}`}
              variant={action.variant || 'outline'}
              onClick={action.onClick}
            >
              {IconComponent ? (
                <IconComponent className="w-4 h-4" strokeWidth={2} />
              ) : typeof action.icon === 'string' ? (
                <span>{action.icon}</span>
              ) : null}
              <span>
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
