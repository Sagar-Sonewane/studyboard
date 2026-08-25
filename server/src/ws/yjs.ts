import { IncomingMessage } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import * as Y from 'yjs';
import * as syncProtocol from 'y-protocols/sync';
import * as awarenessProtocol from 'y-protocols/awareness';
import * as encoding from 'lib0/encoding';
import * as decoding from 'lib0/decoding';

const messageSync = 0;
const messageAwareness = 1;

export interface YjsRoom {
  name: string;
  doc: Y.Doc;
  awareness: awarenessProtocol.Awareness;
  conns: Map<WebSocket, Set<number>>;
}

const docs = new Map<string, YjsRoom>();

function send(conn: WebSocket, message: Uint8Array) {
  if (conn.readyState !== WebSocket.OPEN) {
    return;
  }
  try {
    conn.send(message);
  } catch (e) {
    console.error('[Yjs WS] Failed to send message to client:', e);
  }
}

export function getYjsDoc(docname: string, gc: boolean = true): YjsRoom {
  let room = docs.get(docname);
  if (!room) {
    const doc = new Y.Doc({ gc });
    const awareness = new awarenessProtocol.Awareness(doc);
    awareness.setLocalState(null);

    const conns = new Map<WebSocket, Set<number>>();

    room = {
      name: docname,
      doc,
      awareness,
      conns,
    };

    // Broadcast local updates to all connected clients
    doc.on('update', (update: Uint8Array, origin: any) => {
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, messageSync);
      syncProtocol.writeUpdate(encoder, update);
      const message = encoding.toUint8Array(encoder);

      room!.conns.forEach((_, conn) => {
        if (conn !== origin) {
          send(conn, message);
        }
      });
    });

    // Broadcast awareness updates
    awareness.on('update', ({ added, updated, removed }: any, origin: any) => {
      const changedClients = added.concat(updated, removed);
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, messageAwareness);
      encoding.writeVarUint8Array(
        encoder,
        awarenessProtocol.encodeAwarenessUpdate(awareness, changedClients)
      );
      const message = encoding.toUint8Array(encoder);

      room!.conns.forEach((_, conn) => {
        if (conn !== origin) {
          send(conn, message);
        }
      });
    });

    docs.set(docname, room);
    console.log(`[Yjs WS] Created new Y.Doc room: ${docname}`);
  }
  return room;
}

export function setupYjsConnection(conn: WebSocket, req: IncomingMessage, docName: string) {
  conn.binaryType = 'arraybuffer';
  const room = getYjsDoc(docName);
  const controlledIds = new Set<number>();
  room.conns.set(conn, controlledIds);

  console.log(`[Yjs WS] Client connected to doc: ${docName}. Total peers: ${room.conns.size}`);

  // 1. Send sync step 1
  const encoder = encoding.createEncoder();
  encoding.writeVarUint(encoder, messageSync);
  syncProtocol.writeSyncStep1(encoder, room.doc);
  send(conn, encoding.toUint8Array(encoder));

  // 2. Send current awareness states
  const awarenessStates = room.awareness.getStates();
  if (awarenessStates.size > 0) {
    const awarenessEncoder = encoding.createEncoder();
    encoding.writeVarUint(awarenessEncoder, messageAwareness);
    encoding.writeVarUint8Array(
      awarenessEncoder,
      awarenessProtocol.encodeAwarenessUpdate(
        room.awareness,
        Array.from(awarenessStates.keys())
      )
    );
    send(conn, encoding.toUint8Array(awarenessEncoder));
  }

  // Handle incoming binary messages
  conn.on('message', (message: ArrayBuffer | Buffer) => {
    try {
      const uint8 = new Uint8Array(message);
      const decoder = decoding.createDecoder(uint8);
      const messageType = decoding.readVarUint(decoder);

      switch (messageType) {
        case messageSync: {
          const replyEncoder = encoding.createEncoder();
          encoding.writeVarUint(replyEncoder, messageSync);
          syncProtocol.readSyncMessage(decoder, replyEncoder, room.doc, conn);

          if (encoding.length(replyEncoder) > 1) {
            send(conn, encoding.toUint8Array(replyEncoder));
          }
          break;
        }

        case messageAwareness: {
          awarenessProtocol.applyAwarenessUpdate(
            room.awareness,
            decoding.readVarUint8Array(decoder),
            conn
          );
          break;
        }
      }
    } catch (err) {
      console.error(`[Yjs WS] Error processing Yjs binary message for doc ${docName}:`, err);
    }
  });

  const handleClose = () => {
    room.conns.delete(conn);
    awarenessProtocol.removeAwarenessStates(room.awareness, Array.from(controlledIds), null);
    console.log(`[Yjs WS] Client disconnected from doc: ${docName}. Remaining peers: ${room.conns.size}`);
  };

  conn.on('close', handleClose);
  conn.on('error', handleClose);
}

export function createYjsWebSocketServer(): WebSocketServer {
  const wss = new WebSocketServer({ noServer: true });

  wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
    const url = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
    const roomParam = url.searchParams.get('room') || url.pathname.replace(/^\/yjs\/?/, '') || 'default-room';
    setupYjsConnection(ws, req, roomParam);
  });

  return wss;
}
