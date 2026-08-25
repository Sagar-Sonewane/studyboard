import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from server root or project root
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import http from 'http';
import express from 'express';
import cors from 'cors';
import { healthRouter } from './routes/health';
import { roomsRouter } from './routes/rooms';
import { setupPresenceWebSocketServer } from './ws/server';
import { createYjsWebSocketServer } from './ws/yjs';

const app = express();
const PORT = process.env.PORT || 4000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

// Middleware
app.use(
  cors({
    origin: CORS_ORIGIN === '*' ? '*' : [CORS_ORIGIN, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);
app.use(express.json());

// Routes
app.use('/api', healthRouter);
app.use('/api/rooms', roomsRouter);

// Root fallback
app.get('/', (_req, res) => {
  res.json({
    status: 'online',
    app: 'StudySync Backend',
    health: '/api/health',
    ws: '/ws',
    yjs: '/yjs',
  });
});

// Create HTTP and WebSocket servers
const server = http.createServer(app);
const presenceWss = setupPresenceWebSocketServer();
const yjsWss = createYjsWebSocketServer();

// Dispatch WebSocket upgrade requests based on path
server.on('upgrade', (request, socket, head) => {
  const url = new URL(request.url || '', `http://${request.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  if (pathname === '/ws') {
    presenceWss.handleUpgrade(request, socket, head, (ws) => {
      presenceWss.emit('connection', ws, request);
    });
  } else if (pathname === '/yjs' || pathname.startsWith('/yjs/')) {
    yjsWss.handleUpgrade(request, socket, head, (ws) => {
      yjsWss.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

server.listen(PORT, () => {
  console.log(`[StudySync Server] Running on http://localhost:${PORT}`);
  console.log(`[StudySync Server] Presence WebSocket ready at ws://localhost:${PORT}/ws`);
  console.log(`[StudySync Server] Yjs Whiteboard WebSocket ready at ws://localhost:${PORT}/yjs`);
  console.log(`[StudySync Server] Health check available at http://localhost:${PORT}/api/health`);
});

export { app, server, presenceWss, yjsWss };
