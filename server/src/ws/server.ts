import { Server as HttpServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';

export interface WSMessage {
  type: string;
  payload?: any;
  timestamp?: string;
}

export function setupWebSocketServer(httpServer: HttpServer): WebSocketServer {
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws: WebSocket, req) => {
    const ip = req.socket.remoteAddress;
    console.log(`[WS] Client connected from ${ip}`);

    // Send initial welcome & connection diagnostic
    const welcomeMsg: WSMessage = {
      type: 'connection:established',
      payload: {
        message: 'Connected to StudySync Realtime WebSocket Server',
        serverTime: new Date().toISOString(),
        clientsCount: wss.clients.size,
      },
    };
    ws.send(JSON.stringify(welcomeMsg));

    ws.on('message', (rawMessage: string) => {
      try {
        const data: WSMessage = JSON.parse(rawMessage.toString());

        if (data.type === 'ping') {
          ws.send(
            JSON.stringify({
              type: 'pong',
              payload: {
                clientTimestamp: data.payload?.timestamp,
                serverTimestamp: new Date().toISOString(),
              },
            })
          );
        } else {
          // Placeholder for future room events / whiteboard sync
          ws.send(
            JSON.stringify({
              type: 'ack',
              payload: { receivedType: data.type },
            })
          );
        }
      } catch (err) {
        console.error('[WS] Error processing message:', err);
      }
    });

    ws.on('close', () => {
      console.log(`[WS] Client disconnected`);
    });

    ws.on('error', (error) => {
      console.error('[WS] Socket error:', error);
    });
  });

  return wss;
}
