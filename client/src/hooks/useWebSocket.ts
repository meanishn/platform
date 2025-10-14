/**
 * WebSocket Hooks - Custom hooks for WebSocket functionality
 */

import { useContext, useEffect } from 'react';
import { WebSocketContext } from '../contexts/WebSocketContext';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EventHandler = (...args: any[]) => void;

/**
 * Hook to use WebSocket connection
 */
export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

/**
 * Hook to listen for specific WebSocket events
 * Automatically handles cleanup on unmount
 */
export const useSocketEvent = (event: string, handler: EventHandler) => {
  // const { on, off } = useWebSocket();

  // useEffect(() => {
  //   on(event, handler);
  //   return () => {
  //     off(event, handler);
  //   };
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [event, on, off]);
  return
};

/**
 * Event types for type safety
 */
export const SocketEvents = {
  // Service Request Events
  REQUEST_CREATED: 'request:created',
  REQUEST_UPDATED: 'request:updated',
  REQUEST_STATUS_CHANGED: 'request:status_changed',
  REQUEST_CANCELLED: 'request:cancelled',
  
  // Provider Events
  PROVIDER_ACCEPTED: 'provider:accepted',
  PROVIDER_ASSIGNED: 'provider:assigned',
  PROVIDER_CONFIRMED: 'provider:confirmed',
  PROVIDER_REJECTED: 'provider:rejected',
  
  // Notification Events
  NEW_NOTIFICATION: 'notification:new',
  NOTIFICATION_READ: 'notification:read',
  
  // Work Status Events
  WORK_STARTED: 'work:started',
  WORK_COMPLETED: 'work:completed',
  
  // Review Events
  REVIEW_SUBMITTED: 'review:submitted',
} as const;
