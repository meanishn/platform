/**
 * Socket.IO Service - Real-time WebSocket Communication
 * Handles authenticated WebSocket connections and real-time updates
 */

import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'mysecret';

interface AuthenticatedSocket extends Socket {
  userId?: number;
  userRole?: 'customer' | 'provider' | 'admin';
}

interface JwtPayload {
  id: number;
  role: 'customer' | 'provider' | 'admin';
}

let io: Server;

/**
 * Initialize Socket.IO server with authentication
 */
export const initializeSocket = (httpServer: HttpServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    },
  });

  // Authentication middleware
  io.use((socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  // Connection handler
  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`✅ User connected: ${socket.userId} (${socket.userRole})`);

    // Join user-specific room for targeted notifications
    if (socket.userId) {
      socket.join(`user:${socket.userId}`);
    }

    // Join role-specific room
    if (socket.userRole) {
      socket.join(`role:${socket.userRole}`);
    }

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.userId}`);
    });

    // Heartbeat to keep connection alive
    socket.on('ping', () => {
      socket.emit('pong');
    });
  });

  console.log('🔌 Socket.IO initialized with authentication');
  return io;
};

/**
 * Get the Socket.IO server instance
 */
export const getIO = (): Server => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

/**
 * Emit event to specific user
 */
export const emitToUser = (userId: number, event: string, data: any) => {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, data);
  console.log(`📤 Emitted "${event}" to user ${userId}`);
};

/**
 * Emit event to all users with a specific role
 */
export const emitToRole = (role: 'customer' | 'provider' | 'admin', event: string, data: any) => {
  if (!io) return;
  io.to(`role:${role}`).emit(event, data);
  console.log(`📤 Emitted "${event}" to all ${role}s`);
};

/**
 * Emit event to multiple users
 */
export const emitToUsers = (userIds: number[], event: string, data: any) => {
  if (!io) return;
  userIds.forEach(userId => {
    io.to(`user:${userId}`).emit(event, data);
  });
  console.log(`📤 Emitted "${event}" to ${userIds.length} users`);
};

/**
 * Emit event to all connected clients
 */
export const emitToAll = (event: string, data: any) => {
  if (!io) return;
  io.emit(event, data);
  console.log(`📤 Emitted "${event}" to all clients`);
};

// Event types for type safety
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

export type SocketEvent = typeof SocketEvents[keyof typeof SocketEvents];
