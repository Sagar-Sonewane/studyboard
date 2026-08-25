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
  };
  wsUrl?: string;
}

export interface YjsSyncState {
  isConnected: boolean;
  isSynced: boolean;
  peerCount: number;
  doc: Y.Doc | null;
  provider: WebsocketProvider | null;
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
    isConnected: false,
    isSynced: false,
    peerCount: 1,
    doc: null,
    provider: null,
  });

  const docRef = useRef<Y.Doc | null>(null);
  const providerRef = useRef<WebsocketProvider | null>(null);
  const isApplyingRemote = useRef(false);

  // Compute WebSocket URL
  const resolvedWsUrl =
    wsUrl ||
    (import.meta.env.VITE_WS_URL
      ? import.meta.env.VITE_WS_URL.replace(/\/ws\/?$/, '') + '/yjs'
      : `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${
          window.location.hostname
        }:4000/yjs`);

  const docName = isForked
    ? `studysync-forked-${forkedBoardId || roomId}-${user?.id || 'local'}`
    : `studysync-room-${roomId}`;

  // Initialize Y.Doc & WebsocketProvider
  useEffect(() => {
    if (!roomId) return;

    // Create unique Y.Doc for this room or forked board
    const doc = new Y.Doc();
    docRef.current = doc;

    let provider: WebsocketProvider | null = null;

    // If it's a shared board, connect to WebSocket provider for live sync
    if (!isForked) {
      provider = new WebsocketProvider(resolvedWsUrl, docName, doc, {
        connect: true,
      });
      providerRef.current = provider;

      // Set user awareness info
      if (user) {
        provider.awareness.setLocalStateField('user', {
          name: user.displayName,
          color: user.color || '#4f46e5',
        });
      }

      provider.on('status', (event: { status: 'connected' | 'connecting' | 'disconnected' }) => {
        setSyncState((prev) => ({
          ...prev,
          isConnected: event.status === 'connected',
        }));
      });

      provider.on('sync', (synced: boolean) => {
        setSyncState((prev) => ({
          ...prev,
          isSynced: synced,
        }));
      });

      provider.awareness.on('change', () => {
        const states = provider?.awareness.getStates();
        setSyncState((prev) => ({
          ...prev,
          peerCount: states ? states.size : 1,
        }));
      });
    } else {
      // Local private forked board (no remote sync)
      setSyncState({
        isConnected: false,
        isSynced: true,
        peerCount: 1,
        doc,
        provider: null,
      });
    }

    setSyncState((prev) => ({
      ...prev,
      doc,
      provider,
    }));

    return () => {
      if (provider) {
        provider.destroy();
        providerRef.current = null;
      }
      doc.destroy();
      docRef.current = null;
    };
  }, [roomId, isForked, docName, resolvedWsUrl]);

  // Bind tldraw store <-> Yjs Y.Map
  useEffect(() => {
    if (!editor || !docRef.current) return;

    const doc = docRef.current;
    const yRecords = doc.getMap<any>('tldraw_records');
    const store = editor.store;

    // 1. Load initial remote records into tldraw store if Yjs doc already has data
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
      // For forked boards, populate Yjs map from current editor state
      const currentRecords = store.allRecords();
      doc.transact(() => {
        for (const record of currentRecords) {
          if (isDocumentRecord(record)) {
            yRecords.set(record.id, record);
          }
        }
      }, 'tldraw-local-fork');
    }

    // 2. Listen to local tldraw changes and push to Yjs
    const unlistenStore = store.listen(
      (entry) => {
        if (isApplyingRemote.current) return;

        doc.transact(() => {
          // Added records
          for (const record of Object.values(entry.changes.added)) {
            if (isDocumentRecord(record)) {
              yRecords.set(record.id, record);
            }
          }

          // Updated records
          for (const [, to] of Object.values(entry.changes.updated)) {
            if (isDocumentRecord(to)) {
              yRecords.set(to.id, to);
            }
          }

          // Removed records
          for (const record of Object.values(entry.changes.removed)) {
            if (isDocumentRecord(record)) {
              yRecords.delete(record.id);
            }
          }
        }, 'tldraw-local');
      },
      { source: 'user', scope: 'document' }
    );

    // 3. Observe Yjs remote updates and merge into tldraw store
    const handleYjsObserver = (event: Y.YMapEvent<any>) => {
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

    return () => {
      unlistenStore();
      yRecords.unobserve(handleYjsObserver);
    };
  }, [editor, docRef.current, isForked]);

  const onEditorMount = useCallback((editorInstance: Editor) => {
    setEditor(editorInstance);
  }, []);

  return {
    editor,
    onEditorMount,
    syncState,
  };
}
