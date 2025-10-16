/**
 * NotificationCard Component
 * 
 * Displays a single notification with icon, title, message, timestamp, and actions.
 * Extracted from Notifications.tsx following design system and refactor guidelines.
 * Fully responsive with mobile-first design.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Badge, Checkbox } from './';
import { formatDistanceToNow } from 'date-fns';
import { getNotificationIcon, getCategoryIcon, getCategoryColor } from '../../utils/notificationHelpers';
import { responsiveSpacing, responsiveSizes, responsiveTypography } from '../../styles/responsive.config';
import { ArrowRight, Check, Trash2 } from 'lucide-react';

export interface NotificationCardProps {
  notification: {
    id: string;
    title: string;
    message: string;
    category: string;
    type: string;
    read: boolean;
    timestamp: Date;
    actionText?: string;
    actionUrl?: string;
  };
  isSelected: boolean;
  onSelect: (id: string) => void;
  onMarkAsRead: (id: string) => void;
  onRemove: (id: string) => void;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  isSelected,
  onSelect,
  onMarkAsRead,
  onRemove,
}) => {
  const navigate = useNavigate();
  const CategoryIcon = getCategoryIcon(notification.category);
  const TypeIcon = getNotificationIcon(notification.type);

  const handleActionClick = () => {
    if (notification.actionUrl) {
      // Mark as read when navigating
      if (!notification.read) {
        onMarkAsRead(notification.id);
      }
      // Navigate to the action URL
      navigate(notification.actionUrl);
    }
  };

  return (
    <Card>
      <div className={`${responsiveSpacing.cardPadding} ${!notification.read ? 'bg-slate-50' : ''}`}>
        <div className="flex items-start gap-2 sm:gap-3 md:gap-4">
          {/* Checkbox */}
          <div className="mt-1">
            <Checkbox
              checked={isSelected}
              onChange={() => onSelect(notification.id)}
              label={`Select notification: ${notification.title}`}
            />
          </div>
          
          {/* Category Icon - Hidden on very small screens */}
          <div className="hidden sm:flex flex-shrink-0">
            <div className={`${responsiveSizes.iconMedium} bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200`}>
              <CategoryIcon className={responsiveSizes.iconSizeMedium} />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Title Row */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
              <h3 className={`${responsiveTypography.cardTitle} truncate`}>
                {notification.title}
              </h3>
              <Badge variant={getCategoryColor(notification.category)} size="sm">
                {notification.category.replace('_', ' ')}
              </Badge>
              <TypeIcon className={`${responsiveSizes.iconSizeSmall} text-slate-500 flex-shrink-0`} />
              {!notification.read && (
                <div className="w-2 h-2 bg-red-600 rounded-full flex-shrink-0" aria-label="Unread"></div>
              )}
            </div>
            
            {/* Message */}
            <p className={`${responsiveTypography.bodyPrimary} mb-2 sm:mb-3`}>
              {notification.message}
            </p>
            
            {/* Footer with timestamp and actions */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <span className="text-xs sm:text-sm text-slate-600 flex-shrink-0">
                {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
              </span>
              
              {/* All action buttons in one row */}
              <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
                {notification.actionText && notification.actionUrl && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleActionClick}
                    className="text-xs sm:text-sm whitespace-nowrap flex items-center gap-1.5"
                  >
                    <span>{notification.actionText}</span>
                    <ArrowRight className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2} />
                  </Button>
                )}
                {!notification.read && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onMarkAsRead(notification.id)}
                    className="text-xs sm:text-sm whitespace-nowrap flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2} />
                    <span className="hidden sm:inline">Mark as read</span>
                    <span className="sm:hidden">Read</span>
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => onRemove(notification.id)}
                  className="text-xs sm:text-sm whitespace-nowrap flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2} />
                  <span>Delete</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

