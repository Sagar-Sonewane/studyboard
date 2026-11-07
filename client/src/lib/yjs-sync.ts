import { useState, useEffect, useRef, useCallback } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import type { Editor, TLRecord } from '@tldraw/tldraw';

export interface YjsSyncOptions {
  roomId: string;
  isForked?: boolean;
  forkedBoardId?: string | null;
  user?: {
    id?: string;
    displayName: string;
    color?: string;
    isHost?: boolean;
  };
  wsUrl?: string;
}

export type YjsSyncStatus = 'connecting' | 'connected' | 'reconnecting' | 'disconnected' | 'error';

export interface YjsSyncState {
  status: YjsSyncStatus;
  isConnected: boolean;
  isSynced: boolean;
  peerCount: number;
  doc: Y.Doc | null;
  provider: WebsocketProvider | null;
  hostCamera: { x: number; y: number; z: number } | null;
  reconnect?: () => void;
  errorMessage?: string | null;
}

/**
 * Filter for record types that belong to the shared document (shapes, bindings, assets)
 */
function isDocumentRecord(record: TLRecord): boolean {
  const typeName = (record as any)?.typeName;
  return (
    typeName === 'shape' ||
    typeName === 'binding' ||
    typeName === 'asset' ||
    typeName === 'page'
  );
}

export function useYjsWhiteboardSync({
  roomId,
  isForked = false,
  forkedBoardId = null,
  user,
  wsUrl,
}: YjsSyncOptions) {
  const [editor, setEditor] = useState<Editor | null>(null);
  const [syncState, setSyncState] = useState<YjsSyncState>({
    status: isForked ? 'connected' : 'connecting',
    isConnected: false,
    isSynced: isForked,
    peerCount: 1,
    doc: null,
    provider: null,
    hostCamera: null,
  });

  const docRef = useRef<Y.Doc | null>(null);
  const providerRef = useRef<WebsocketProvider | null>(null);
  const isApplyingRemote = useRef(false);
  const userRef = useRef(user);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // Compute WebSocket URL
  const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
  let resolvedWsUrl: string = wsUrl || '';

  if (!resolvedWsUrl) {
    if (import.meta.env.VITE_YJS_WS_URL) {
      resolvedWsUrl = import.meta.env.VITE_YJS_WS_URL.replace(/\/+$/, '');
    } else if (import.meta.env.VITE_WS_URL) {
      resolvedWsUrl = import.meta.env.VITE_WS_URL.replace(/\/ws\/?$/, '').replace(/\/+$/, '') + '/yjs';
    } else if (import.meta.env.VITE_API_URL) {
      const apiUrl = import.meta.env.VITE_API_URL.replace(/\/+$/, '');
      resolvedWsUrl = apiUrl.replace(/^http:/, 'ws:').replace(/^https:/, 'wss:') + '/yjs';
    } else {
      const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
      resolvedWsUrl = `${isHttps ? 'wss:' : 'ws:'}//${host}:4000/yjs`;
    }
  }

  if (isHttps && resolvedWsUrl.startsWith('ws:')) {
    resolvedWsUrl = resolvedWsUrl.replace(/^ws:/, 'wss:');
  }

  const docName = isForked
    ? `studysync-forked-${forkedBoardId || roomId}-${user?.id || 'local'}`
    : `studysync-room-${roomId}`;

  // Manual reconnect helper
  const handleReconnect = useCallback(() => {
    if (providerRef.current) {
      setSyncState((prev) => ({ ...prev, status: 'connecting', errorMessage: null }));
      try {
        providerRef.current.connect();
      } catch (err: any) {
        setSyncState((prev) => ({
          ...prev,
          status: 'error',
          errorMessage: err.message || 'Failed to reconnect',
        }));
      }
    }
  }, []);

  // 1. Initialize Y.Doc & WebsocketProvider (stable lifecycle per roomId/board)
  useEffect(() => {
    if (!roomId) return;

    const doc = new Y.Doc();
    docRef.current = doc;

    let provider: WebsocketProvider | null = null;

    if (!isForked) {
      setSyncState((prev) => ({
        ...prev,
        status: 'connecting',
        reconnect: handleReconnect,
      }));

      provider = new WebsocketProvider(resolvedWsUrl, docName, doc, {
        connect: true,
      });
      providerRef.current = provider;

      if (userRef.current) {
        provider.awareness.setLocalStateField('user', {
          id: userRef.current.id,
          name: userRef.current.displayName,
          color: userRef.current.color || '#4f46e5',
          isHost: Boolean(userRef.current.isHost),
        });
      }

      provider.on('status', (event: { status: 'connected' | 'connecting' | 'disconnected' }) => {
        setSyncState((prev) => {
          let newStatus: YjsSyncStatus = 'connecting';
          if (event.status === 'connected') {
            newStatus = 'connected';
          } else if (event.status === 'disconnected') {
            newStatus = prev.isConnected ? 'reconnecting' : 'disconnected';
          }
          return {
            ...prev,
            status: newStatus,
            isConnected: event.status === 'connected',
            reconnect: handleReconnect,
          };
        });
      });

      provider.on('sync', (synced: boolean) => {
        setSyncState((prev) => ({
          ...prev,
          isSynced: synced,
          status: synced ? 'connected' : prev.status,
          reconnect: handleReconnect,
        }));
      });

      provider.awareness.on('change', () => {
        const states = provider?.awareness.getStates();
        let currentHostCamera: { x: number; y: number; z: number } | null = null;

        if (states) {
          for (const state of states.values()) {
            if (state?.user?.isHost && state?.camera) {
              currentHostCamera = state.camera;
            }
          }
        }

        setSyncState((prev) => ({
          ...prev,
          peerCount: states ? states.size : 1,
          hostCamera: currentHostCamera,
          reconnect: handleReconnect,
        }));
      });
    } else {
      setSyncState({
        status: 'connected',
        isConnected: false,
        isSynced: true,
        peerCount: 1,
        doc,
        provider: null,
        hostCamera: null,
        reconnect: handleReconnect,
      });
    }

    setSyncState((prev) => ({
      ...prev,
      doc,
      provider,
      reconnect: handleReconnect,
    }));

    return () => {
      if (provider) {
        provider.destroy();
        providerRef.current = null;
      }
      doc.destroy();
      docRef.current = null;
    };
  }, [roomId, isForked, docName, resolvedWsUrl, handleReconnect]);

  // 2. Separate lightweight effect to update user info in awareness without tearing down Y.Doc
  useEffect(() => {
    if (providerRef.current && user) {
      providerRef.current.awareness.setLocalStateField('user', {
        id: user.id,
        name: user.displayName,
        color: user.color || '#4f46e5',
        isHost: Boolean(user.isHost),
      });
    }
  }, [user?.id, user?.displayName, user?.color, user?.isHost]);

  // 3. Bind tldraw store <-> Yjs Y.Map with batched updates and origin echo guard
  useEffect(() => {
    if (!editor || !docRef.current) return;

    const doc = docRef.current;
    const yRecords = doc.getMap<any>('tldraw_records');
    const store = editor.store;

    // Load initial remote records into tldraw store
    const initialRecords: TLRecord[] = [];
    yRecords.forEach((recordData) => {
      if (recordData && isDocumentRecord(recordData)) {
        initialRecords.push(recordData);
      }
    });

    if (initialRecords.length > 0) {
      isApplyingRemote.current = true;
      try {
        store.mergeRemoteChanges(() => {
          store.put(initialRecords);
        });
      } finally {
        isApplyingRemote.current = false;
      }
    } else if (isForked) {
      const currentRecords = store.allRecords();
      doc.transact(() => {
        for (const record of currentRecords) {
          if (isDocumentRecord(record)) {
            yRecords.set(record.id, record);
          }
        }
      }, 'tldraw-local-fork');
    }

    // Pending change buffers for batching/throttling sync to Yjs
    const pendingPuts = new Map<string, TLRecord>();
    const pendingDeletes = new Set<string>();
    let flushTimeout: number | null = null;
    let lastFlushTime = 0;
    const THROTTLE_INTERVAL_MS = 40; // ~25 updates/sec network sync rate

    const flushPendingChanges = () => {
      if (flushTimeout !== null) {
        clearTimeout(flushTimeout);
        flushTimeout = null;
      }

      if (pendingPuts.size === 0 && pendingDeletes.size === 0) return;

      const putsToApply = Array.from(pendingPuts.values());
      const deletesToApply = Array.from(pendingDeletes.values());
      pendingPuts.clear();
      pendingDeletes.clear();
      lastFlushTime = performance.now();

      doc.transact(() => {
        for (const record of putsToApply) {
          yRecords.set(record.id, record);
        }
        for (const id of deletesToApply) {
          yRecords.delete(id);
        }
      }, 'tldraw-local');
    };

    const scheduleFlush = () => {
      const now = performance.now();
      const elapsed = now - lastFlushTime;

      if (elapsed >= THROTTLE_INTERVAL_MS) {
        flushPendingChanges();
      } else if (flushTimeout === null) {
        flushTimeout = window.setTimeout(flushPendingChanges, THROTTLE_INTERVAL_MS - elapsed);
      }
    };

    // Listen to local tldraw changes, tag author metadata on create, and queue batched sync
    const unlistenStore = store.listen(
      (entry) => {
        if (isApplyingRemote.current) return;

        let hasChanges = false;
        const currentUser = userRef.current;

        // Added records: tag author metadata once at creation
        for (const record of Object.values(entry.changes.added)) {
          if (isDocumentRecord(record)) {
            if (record.typeName === 'shape' && !(record as any).meta?.authorName) {
              (record as any).meta = {
                ...(record as any).meta,
                authorId: currentUser?.id,
                authorName: currentUser?.displayName || 'Participant',
                authorColor: currentUser?.color || '#4f46e5',
              };
            }
            pendingPuts.set(record.id, record);
            pendingDeletes.delete(record.id);
            hasChanges = true;
          }
        }

        // Updated records: buffer for throttled batching
        for (const [, to] of Object.values(entry.changes.updated)) {
          if (isDocumentRecord(to)) {
            pendingPuts.set(to.id, to);
            pendingDeletes.delete(to.id);
            hasChanges = true;
          }
        }

        // Removed records: buffer for deletion
        for (const record of Object.values(entry.changes.removed)) {
          if (isDocumentRecord(record)) {
            pendingPuts.delete(record.id);
            pendingDeletes.add(record.id);
            hasChanges = true;
          }
        }

        if (hasChanges) {
          scheduleFlush();
        }
      },
      { source: 'user', scope: 'document' }
    );

    // Flush immediately when user releases pointer or focuses away
    const handlePointerUp = () => {
      flushPendingChanges();
    };
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('blur', handlePointerUp);

    // Observe Yjs remote updates and merge into tldraw store with strict origin echo guard
    const handleYjsObserver = (event: Y.YMapEvent<any>) => {
      // Skip local transactions (already applied in local store)
      if (event.transaction.origin === 'tldraw-local' || event.transaction.origin === 'tldraw-local-fork') {
        return;
      }

      isApplyingRemote.current = true;
      try {
        const toPut: TLRecord[] = [];
        const toRemove: string[] = [];

        event.changes.keys.forEach((change, key) => {
          if (change.action === 'add' || change.action === 'update') {
            const record = yRecords.get(key);
            if (record && isDocumentRecord(record)) {
              toPut.push(record);
            }
          } else if (change.action === 'delete') {
            toRemove.push(key as any);
          }
        });

        if (toPut.length > 0 || toRemove.length > 0) {
          store.mergeRemoteChanges(() => {
            if (toPut.length > 0) {
              store.put(toPut);
            }
            if (toRemove.length > 0) {
              store.remove(toRemove as any);
            }
          });
        }
      } catch (err) {
        console.error('[Yjs Sync] Error merging remote changes into tldraw:', err);
      } finally {
        isApplyingRemote.current = false;
      }
    };

    yRecords.observe(handleYjsObserver);

    // Throttled camera awareness broadcast for host viewport sync (~20fps cap)
    let unlistenCamera: (() => void) | undefined;
    if (providerRef.current && user?.isHost) {
      let lastCameraBroadcast = 0;
      let cameraBroadcastTimeout: number | null = null;
      const CAMERA_THROTTLE_MS = 50;

      const broadcastCamera = () => {
        if (cameraBroadcastTimeout !== null) {
          clearTimeout(cameraBroadcastTimeout);
          cameraBroadcastTimeout = null;
        }
        lastCameraBroadcast = performance.now();
        try {
          const camera = editor.getCamera();
          providerRef.current?.awareness.setLocalStateField('camera', {
            x: camera.x,
            y: camera.y,
            z: camera.z,
          });
        } catch {
          // ignore
        }
      };

      const handleCameraChange = () => {
        const now = performance.now();
        const elapsed = now - lastCameraBroadcast;
        if (elapsed >= CAMERA_THROTTLE_MS) {
          broadcastCamera();
        } else if (cameraBroadcastTimeout === null) {
          cameraBroadcastTimeout = window.setTimeout(broadcastCamera, CAMERA_THROTTLE_MS - elapsed);
        }
      };

      broadcastCamera();
      unlistenCamera = editor.store.listen(handleCameraChange, {
        source: 'user',
        scope: 'session',
      });
    }

    return () => {
      flushPendingChanges();
      unlistenStore();
      yRecords.unobserve(handleYjsObserver);
      if (unlistenCamera) unlistenCamera();
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('blur', handlePointerUp);
    };
  }, [editor, docRef.current, isForked]);

  const onEditorMount = useCallback((editorInstance: Editor) => {
    setEditor(editorInstance);
  }, []);

  return {
    editor,
    onEditorMount,
    syncState,
    provider: providerRef.current,
  };
}
