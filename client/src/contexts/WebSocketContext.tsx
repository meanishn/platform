/**
 * WebSocket Context - Real-time Communication with Server
 * Provides authenticated Socket.IO connection across the app
 */

import React, { createContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../hooks/useAuthContext';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EventHandler = (...args: any[]) => void;

interface WebSocketContextType {
  socket: Socket | null;
  connected: boolean;
  on: (event: string, handler: EventHandler) => void;
  off: (event: string, handler?: EventHandler) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  emit: (event: string, data?: any) => void;
}

export const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Only connect if user is authenticated
    if (!isAuthenticated || !token) {
      if (socket) {
        console.log('🔌 Disconnecting socket (user logged out)');
        socket.disconnect();
        setSocket(null);
        setConnected(false);
      }
      return;
    }

    // Create socket connection with authentication
    const serverUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
    
    console.log('🔌 Connecting to WebSocket server...');
    const newSocket = io(serverUrl, {
      auth: {
        token: token,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('✅ WebSocket connected');
      setConnected(true);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
      setConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error.message);
      setConnected(false);
    });

    // Heartbeat
    const heartbeatInterval = setInterval(() => {
      if (newSocket.connected) {
        newSocket.emit('ping');
      }
    }, 30000); // Every 30 seconds

    setSocket(newSocket);

    // Cleanup on unmount or token change
    return () => {
      console.log('🔌 Cleaning up WebSocket connection');
      clearInterval(heartbeatInterval);
      newSocket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, token]);

  // Helper to add event listener
  const on = useCallback((event: string, handler: EventHandler) => {
    if (socket) {
      socket.on(event, handler);
    }
  }, [socket]);

  // Helper to remove event listener
  const off = useCallback((event: string, handler?: EventHandler) => {
    if (socket) {
      if (handler) {
        socket.off(event, handler);
      } else {
        socket.off(event);
      }
    }
  }, [socket]);

  // Helper to emit event
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const emit = useCallback((event: string, data?: any) => {
    if (socket && connected) {
      socket.emit(event, data);
    }
  }, [socket, connected]);

  return (
    <WebSocketContext.Provider value={{ socket, connected, on, off, emit }}>
      {children}
    </WebSocketContext.Provider>
  );
};
