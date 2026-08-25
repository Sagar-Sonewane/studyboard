import { Server as HttpServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import crypto from 'crypto';

export interface WSMessage<T = any> {
  type: string;
  payload?: T;
  timestamp?: string;
}

export interface ParticipantState {
  participantId: string;
  roomId: string;
  userId?: string | null;
  guestName?: string | null;
  displayName: string;
  isHost: boolean;
  muted: boolean;
  speaking: boolean;
  joinedAt: string;
}

// Map<roomId, Map<WebSocket, ParticipantState>>
const roomConnections = new Map<string, Map<WebSocket, ParticipantState>>();

// Map<WebSocket, { roomId: string; participantId: string }>()
const socketMetadata = new Map<WebSocket, { roomId: string; participantId: string }>();

function broadcastToRoom(roomId: string, message: WSMessage, excludeWs?: WebSocket) {
  const roomSockets = roomConnections.get(roomId);
  if (!roomSockets) return;

  const raw = JSON.stringify({
    ...message,
    timestamp: message.timestamp || new Date().toISOString(),
  });

  for (const [socket, _state] of roomSockets.entries()) {
    if (socket !== excludeWs && socket.readyState === WebSocket.OPEN) {
      try {
        socket.send(raw);
      } catch (err) {
        console.error(`[WS] Failed to send to socket in room ${roomId}:`, err);
      }
    }
  }
}

function handleSocketLeave(ws: WebSocket) {
  const meta = socketMetadata.get(ws);
  if (!meta) return;

  const { roomId, participantId } = meta;
  socketMetadata.delete(ws);

  const roomSockets = roomConnections.get(roomId);
  if (!roomSockets) return;

  const leavingParticipant = roomSockets.get(ws);
  roomSockets.delete(ws);

  if (roomSockets.size === 0) {
    roomConnections.delete(roomId);
  }

  if (leavingParticipant) {
    console.log(`[WS] Participant ${leavingParticipant.displayName} left room ${roomId}`);
    broadcastToRoom(roomId, {
      type: 'presence:leave',
      payload: {
        participantId,
        userId: leavingParticipant.userId,
        guestName: leavingParticipant.guestName,
        displayName: leavingParticipant.displayName,
        participantCount: roomSockets.size,
      },
    });
  }
}

export function setupPresenceWebSocketServer(): WebSocketServer {
  const wss = new WebSocketServer({ noServer: true });

  wss.on('connection', (ws: WebSocket, req) => {
    const ip = req.socket.remoteAddress;
    console.log(`[WS Presence] Client connected from ${ip}`);

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

        switch (data.type) {
          case 'ping': {
            ws.send(
              JSON.stringify({
                type: 'pong',
                payload: {
                  clientTimestamp: data.payload?.timestamp,
                  serverTimestamp: new Date().toISOString(),
                },
              })
            );
            break;
          }

          case 'room:join': {
            const {
              roomId,
              participantId = crypto.randomUUID(),
              userId = null,
              guestName = null,
              displayName = 'Participant',
              isHost = false,
              muted = false,
              speaking = false,
            } = data.payload || {};

            if (!roomId) {
              ws.send(
                JSON.stringify({
                  type: 'error',
                  payload: { message: 'roomId is required to join a room' },
                })
              );
              return;
            }

            // Remove from any existing room before joining new one
            handleSocketLeave(ws);

            const participantState: ParticipantState = {
              participantId,
              roomId,
              userId,
              guestName,
              displayName,
              isHost: Boolean(isHost),
              muted: Boolean(muted),
              speaking: Boolean(speaking),
              joinedAt: new Date().toISOString(),
            };

            // Register room socket
            if (!roomConnections.has(roomId)) {
              roomConnections.set(roomId, new Map());
            }
            const roomSockets = roomConnections.get(roomId)!;
            roomSockets.set(ws, participantState);
            socketMetadata.set(ws, { roomId, participantId });

            console.log(
              `[WS] ${participantState.displayName} (${isHost ? 'Host' : 'Guest'}) joined room ${roomId}. Active peers: ${roomSockets.size}`
            );

            // 1. Send complete current roster (presence:sync) to the joining client
            const allParticipants = Array.from(roomSockets.values());
            ws.send(
              JSON.stringify({
                type: 'presence:sync',
                payload: {
                  roomId,
                  participants: allParticipants,
                  myParticipantId: participantId,
                },
              })
            );

            // 2. Broadcast presence:join to everyone else in the room
            broadcastToRoom(
              roomId,
              {
                type: 'presence:join',
                payload: {
                  ...participantState,
                  participantCount: roomSockets.size,
                },
              },
              ws
            );
            break;
          }

          case 'room:leave': {
            handleSocketLeave(ws);
            break;
          }

          case 'presence:mic_status': {
            const meta = socketMetadata.get(ws);
            if (!meta) return;

            const roomSockets = roomConnections.get(meta.roomId);
            const participant = roomSockets?.get(ws);
            if (participant) {
              participant.muted = Boolean(data.payload?.muted);
              broadcastToRoom(meta.roomId, {
                type: 'presence:mic_status',
                payload: {
                  participantId: meta.participantId,
                  userId: participant.userId,
                  muted: participant.muted,
                },
              });
            }
            break;
          }

          case 'presence:speaking': {
            const meta = socketMetadata.get(ws);
            if (!meta) return;

            const roomSockets = roomConnections.get(meta.roomId);
            const participant = roomSockets?.get(ws);
            if (participant) {
              participant.speaking = Boolean(data.payload?.speaking);
              broadcastToRoom(meta.roomId, {
                type: 'presence:speaking',
                payload: {
                  participantId: meta.participantId,
                  userId: participant.userId,
                  speaking: participant.speaking,
                },
              });
            }
            break;
          }

          default: {
            ws.send(
              JSON.stringify({
                type: 'ack',
                payload: { receivedType: data.type },
              })
            );
            break;
          }
        }
      } catch (err) {
        console.error('[WS] Error processing message:', err);
      }
    });

    ws.on('close', () => {
      handleSocketLeave(ws);
      console.log(`[WS] Client disconnected`);
    });

    ws.on('error', (error) => {
      console.error('[WS] Socket error:', error);
      handleSocketLeave(ws);
    });
  });

  return wss;
}

export const setupWebSocketServer = setupPresenceWebSocketServer;
