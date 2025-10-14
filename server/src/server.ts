import http from 'http';
import app from './app';
import { initializeSocket } from './services/socketService';

const PORT = process.env.PORT || 4000;

// Create HTTP server
const httpServer = http.createServer(app);

// Initialize Socket.IO with authentication
initializeSocket(httpServer);
// Start server
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔌 WebSocket server ready`);
});