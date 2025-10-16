import React from 'react';
import { Button } from './Button';
import { LucideIcon } from 'lucide-react';
import { responsiveTypography, responsiveSizes } from '../../styles/responsive.config';

export interface QuickActionProps {
  icon: LucideIcon | string;
  label: string;
  onClick?: () => void;
  href?: string;
  variant?: 'primary' | 'outline' | 'secondary' | 'ghost' | 'danger';
  customClassName?: string;
}

export interface QuickActionsCardProps {
  title?: string;
  actions: QuickActionProps[];
  columns?: 1 | 2 | 3;
}

export const QuickActionsCard: React.FC<QuickActionsCardProps> = ({
  title,
  actions,
  columns = 2
}) => {
  // Responsive grid classes based on columns prop
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
  };

  return (
    <div>
      {title && (
        <h3 className={`${responsiveTypography.subsectionHeading} mb-3 sm:mb-4`}>
          {title}
        </h3>
      )}
      <div className={`grid ${gridCols[columns]} gap-2 sm:gap-3`}>
        {actions.map((action, index) => {
          const IconComponent = typeof action.icon === 'string' ? null : action.icon;
          
          const ButtonComponent = (
            <Button
              className={`w-full justify-start ${responsiveSizes.buttonPaddingMd} text-xs sm:text-sm ${action.customClassName || ''}`}
              variant={action.variant || 'outline'}
              onClick={action.onClick}
            >
              {IconComponent ? (
                <IconComponent className={`${responsiveSizes.iconSizeSmall} flex-shrink-0`} strokeWidth={2} />
              ) : typeof action.icon === 'string' ? (
                <span className="flex-shrink-0">{action.icon}</span>
              ) : null}
              <span className="truncate text-left">
                {action.label}
              </span>
            </Button>
          );

          return action.href ? (
            <a key={index} href={action.href} className="block">
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
