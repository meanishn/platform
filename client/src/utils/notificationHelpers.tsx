/**
 * Notification Helpers
 * 
 * Utility functions for notification icons and styling.
 * Extracted from Notifications.tsx to follow separation of concerns.
 */

import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Info, 
  Wrench, 
  DollarSign, 
  HardHat, 
  Settings, 
  PartyPopper, 
  Megaphone 
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const getNotificationIcon = (type: string): LucideIcon => {
  switch (type) {
    case 'success': return CheckCircle;
    case 'warning': return AlertTriangle;
    case 'error': return XCircle;
    case 'info':
    default: return Info;
  }
};

export const getCategoryIcon = (category: string): LucideIcon => {
  switch (category) {
    case 'service_request': return Wrench;
    case 'payment': return DollarSign;
    case 'provider_update': return HardHat;
    case 'system': return Settings;
    case 'promotion': return PartyPopper;
    default: return Megaphone;
  }
};

export const getCategoryColor = (category: string): 'default' | 'success' | 'info' | 'warning' => {
  switch (category) {
    case 'service_request': return 'default';
    case 'payment': return 'success'; // emerald - semantic for financial success
    case 'provider_update': return 'info'; // blue - only semantic use
    case 'system': return 'default';
    case 'promotion': return 'warning'; // amber - semantic for attention
    default: return 'default';
  }
};

