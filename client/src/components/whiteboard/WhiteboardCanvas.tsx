import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Tldraw, Editor } from '@tldraw/tldraw';
import { GeoShapeGeoStyle } from '@tldraw/tlschema';
import { WhiteboardToolbar } from './WhiteboardToolbar';
import { useYjsWhiteboardSync } from '../../lib/yjs-sync';
import { forkBoard } from '../../lib/api';
import {
  UploadCloud,
  GitFork,
  ZoomIn,
  ZoomOut,
  Maximize,
  Radio,
  Lock,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  User,
} from 'lucide-react';

interface WhiteboardCanvasProps {
  roomId: string;
  user?: {
    id?: string;
    displayName: string;
    color?: string;
    isHost?: boolean;
  };
  token?: string | null;
  canDraw?: boolean;
  onRequestDraw?: () => void;
  drawRequestSent?: boolean;
  drawRequestFeedback?: string | null;
  onUploadFile?: () => void;
}

export const WhiteboardCanvas: React.FC<WhiteboardCanvasProps> = ({
  roomId,
  user,
  token,
  canDraw = true,
  onRequestDraw,
  drawRequestSent = false,
  drawRequestFeedback = null,
  onUploadFile,
}) => {
  const [isForked, setIsForked] = useState(false);
  const [forkedBoardId, setForkedBoardId] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<string>('select');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isForking, setIsForking] = useState(false);

  // Follow-host camera state (non-hosts default to following on join)
  const isHost = Boolean(user?.isHost);
  const [isFollowingHost, setIsFollowingHost] = useState(!isHost);
  const [selectedAuthor, setSelectedAuthor] = useState<{ name: string; color: string } | null>(null);

  // References to prevent unnecessary React re-renders during active continuous drag
  const lastToolIdRef = useRef<string>('select');
  const lastCanUndoRef = useRef<boolean>(false);
  const lastCanRedoRef = useRef<boolean>(false);
  const lastZoomLevelRef = useRef<number>(100);
  const lastSelectedShapeIdRef = useRef<string | null>(null);

  // Yjs synchronization hook
  const { editor, onEditorMount, syncState } = useYjsWhiteboardSync({
    roomId,
    isForked,
    forkedBoardId,
    user,
  });

  const isUpdatingCameraProgrammatically = useRef(false);

  // Sync readonly state with canDraw permission
  useEffect(() => {
    if (!editor) return;
    try {
      editor.updateInstanceState({ isReadonly: !canDraw });
    } catch {
      // ignore
    }
  }, [editor, canDraw]);

  // Follow-host viewport synchronization
  useEffect(() => {
    if (!editor || isHost || !isFollowingHost || !syncState.hostCamera || isForked) {
      return;
    }

    const hostCam = syncState.hostCamera;
    const currentCam = editor.getCamera();

    // Only update if difference is meaningful
    const dx = Math.abs(currentCam.x - hostCam.x);
    const dy = Math.abs(currentCam.y - hostCam.y);
    const dz = Math.abs(currentCam.z - hostCam.z);

    if (dx > 1 || dy > 1 || dz > 0.01) {
      isUpdatingCameraProgrammatically.current = true;
      try {
        editor.setCamera({ x: hostCam.x, y: hostCam.y, z: hostCam.z }, { animation: { duration: 100 } });
        const newZoom = Math.round(hostCam.z * 100);
        if (newZoom !== lastZoomLevelRef.current) {
          lastZoomLevelRef.current = newZoom;
          setZoomLevel(newZoom);
        }
      } finally {
        setTimeout(() => {
          isUpdatingCameraProgrammatically.current = false;
        }, 120);
      }
    }
  }, [editor, isHost, isFollowingHost, syncState.hostCamera, isForked]);

  const handleMount = useCallback(
    (editorInstance: Editor) => {
      onEditorMount(editorInstance);

      // Set initial tool
      if (canDraw) {
        editorInstance.setCurrentTool('draw');
        setActiveTool('draw');
        lastToolIdRef.current = 'draw';
      } else {
        editorInstance.updateInstanceState({ isReadonly: true });
        editorInstance.setCurrentTool('select');
        setActiveTool('select');
        lastToolIdRef.current = 'select';
      }

      // Selective listener: only triggers React state updates on actual state changes
      const cleanup = editorInstance.store.listen(() => {
        try {
          const currentToolId = editorInstance.getCurrentToolId();
          if (currentToolId !== lastToolIdRef.current) {
            lastToolIdRef.current = currentToolId;
            setActiveTool(currentToolId);
          }

          const currentCanUndo = editorInstance.getCanUndo();
          if (currentCanUndo !== lastCanUndoRef.current) {
            lastCanUndoRef.current = currentCanUndo;
            setCanUndo(currentCanUndo);
          }

          const currentCanRedo = editorInstance.getCanRedo();
          if (currentCanRedo !== lastCanRedoRef.current) {
            lastCanRedoRef.current = currentCanRedo;
            setCanRedo(currentCanRedo);
          }

          const currentZoom = Math.round(editorInstance.getZoomLevel() * 100);
          if (currentZoom !== lastZoomLevelRef.current) {
            lastZoomLevelRef.current = currentZoom;
            setZoomLevel(currentZoom);
          }

          // Check selected shape author attribution only when selected IDs change
          const selected = editorInstance.getSelectedShapes();
          const primarySelectedId = selected.length === 1 ? selected[0].id : null;

          if (primarySelectedId !== lastSelectedShapeIdRef.current) {
            lastSelectedShapeIdRef.current = primarySelectedId;
            if (selected.length === 1 && (selected[0] as any)?.meta?.authorName) {
              setSelectedAuthor({
                name: (selected[0] as any).meta.authorName,
                color: (selected[0] as any).meta.authorColor || '#4f46e5',
              });
            } else {
              setSelectedAuthor(null);
            }
          }
        } catch {
          // ignore
        }
      });

      return () => {
        cleanup();
      };
    },
    [onEditorMount, canDraw]
  );

  const handleToolSelect = useCallback(
    (tool: string, geoType?: string) => {
      if (!editor || !canDraw) return;

      try {
        if (tool === 'geo') {
          editor.setCurrentTool('geo');
          const targetGeo = geoType || 'rectangle';
          editor.setStyleForNextShapes(GeoShapeGeoStyle, targetGeo as any);
          editor.setStyleForSelectedShapes(GeoShapeGeoStyle, targetGeo as any);
        } else if (tool === 'arrow') {
          editor.setCurrentTool('arrow');
        } else if (tool === 'line') {
          editor.setCurrentTool('line');
        } else {
          editor.setCurrentTool(tool as any);
        }
        lastToolIdRef.current = tool;
        setActiveTool(tool);
      } catch (err) {
        console.error('[Whiteboard] Failed to set tool:', err);
      }
    },
    [editor, canDraw]
  );

  // Fork shared board into a private copy
  const handleForkBoard = async () => {
    if (isForking) return;
    setIsForking(true);
    try {
      const res = await forkBoard(roomId, token);
      setForkedBoardId(res.board.id);
      setIsForked(true);
    } catch (err) {
      console.error('[Whiteboard] Failed to fork board via API, creating local session:', err);
      setForkedBoardId(`local-${Date.now()}`);
      setIsForked(true);
    } finally {
      setIsForking(false);
    }
  };

  // Switch back to shared room board
  const handleSwitchToShared = () => {
    setIsForked(false);
    setForkedBoardId(null);
  };

  // Zoom helpers (breaking away from host follow)
  const handleZoomIn = () => {
    if (editor) {
      setIsFollowingHost(false);
      editor.zoomIn();
      const newZoom = Math.round(editor.getZoomLevel() * 100);
      lastZoomLevelRef.current = newZoom;
      setZoomLevel(newZoom);
    }
  };

  const handleZoomOut = () => {
    if (editor) {
      setIsFollowingHost(false);
      editor.zoomOut();
      const newZoom = Math.round(editor.getZoomLevel() * 100);
      lastZoomLevelRef.current = newZoom;
      setZoomLevel(newZoom);
    }
  };

  const handleResetZoom = () => {
    if (editor) {
      setIsFollowingHost(false);
      editor.resetZoom();
      lastZoomLevelRef.current = 100;
      setZoomLevel(100);
    }
  };

  const handleZoomToFit = () => {
    if (editor) {
      setIsFollowingHost(false);
      editor.zoomToFit();
      const newZoom = Math.round(editor.getZoomLevel() * 100);
      lastZoomLevelRef.current = newZoom;
      setZoomLevel(newZoom);
    }
  };

  const handleJumpToHost = () => {
    if (syncState.hostCamera && editor) {
      editor.setCamera(syncState.hostCamera, { animation: { duration: 150 } });
      const newZoom = Math.round(syncState.hostCamera.z * 100);
      lastZoomLevelRef.current = newZoom;
      setZoomLevel(newZoom);
      setIsFollowingHost(true);
    }
  };

  return (
    <div className="relative w-full h-full flex-1 overflow-hidden bg-[#fdfdfd]">
      {/* Top Banner when in Forked / Personal Copy Mode */}
      {isForked ? (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 px-4 py-2 bg-indigo-900/90 backdrop-blur-md text-white border hairline-border border-indigo-700/50 rounded-2xl shadow-sm text-xs animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-1.5 font-medium">
            <Lock className="w-3.5 h-3.5 text-indigo-300" />
            <span>personal copy · private board</span>
          </div>
          <div className="w-px h-3 bg-indigo-700" />
          <button
            onClick={handleSwitchToShared}
            className="flex items-center gap-1 text-indigo-200 hover:text-white transition-colors font-medium cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>switch to shared board</span>
          </button>
        </div>
      ) : (
        /* Top Status Indicator & Follow-Host Controls for Shared Board */
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 hidden sm:flex items-center gap-2">
          {/* Live Sync Status */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-white/90 backdrop-blur-sm border hairline-border rounded-full shadow-xs text-[11px] font-medium text-neutral-600">
            {syncState.isConnected ? (
              <>
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>multiplayer live</span>
              </>
            ) : (
              <>
                <Radio className="w-3 h-3 text-neutral-400 animate-spin" />
                <span>connecting sync...</span>
              </>
            )}
          </div>

          {/* Follow-Host Viewport Pill (for non-hosts) */}
          {!isHost && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-white/90 backdrop-blur-sm border hairline-border rounded-full shadow-xs text-[11px] font-medium">
              {isFollowingHost ? (
                <div className="flex items-center gap-1.5 text-indigo-600">
                  <Eye className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
                  <span>following host</span>
                  <button
                    onClick={() => setIsFollowingHost(false)}
                    className="ml-1 text-[10px] text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
                    title="stop following host viewport"
                  >
                    <EyeOff className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleJumpToHost}
                  className="flex items-center gap-1 text-neutral-600 hover:text-indigo-600 transition-colors cursor-pointer"
                  title="snap and follow host viewport"
                >
                  <Eye className="w-3.5 h-3.5 text-neutral-400" />
                  <span>jump to host</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Selected Shape Author Attribution Tooltip */}
      {selectedAuthor && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 px-3 py-1 bg-neutral-900/90 backdrop-blur-sm text-white text-[11px] font-medium rounded-full shadow-md animate-in fade-in duration-150">
          <div
            style={{ backgroundColor: selectedAuthor.color }}
            className="w-2 h-2 rounded-full"
          />
          <User className="w-3 h-3 text-neutral-400" />
          <span>created by {selectedAuthor.name}</span>
        </div>
      )}

      {/* Tldraw Canvas Engine with hidden default UI */}
      <div
        className="absolute inset-0 z-0"
        key={isForked ? `forked-${forkedBoardId}` : `shared-${roomId}`}
      >
        <Tldraw
          hideUi
          onMount={handleMount}
          autoFocus
        />
      </div>

      {/* Right Rail: Custom Vertical Icon Toolbar per DESIGN.md */}
      <WhiteboardToolbar
        editor={editor}
        activeTool={activeTool}
        onToolSelect={handleToolSelect}
        canUndo={canUndo}
        canRedo={canRedo}
        canDraw={canDraw}
        onRequestDraw={onRequestDraw}
        drawRequestSent={drawRequestSent}
        drawRequestFeedback={drawRequestFeedback}
      />

      {/* Canvas-Anchored Action: Upload File (bottom-left corner per DESIGN.md) */}
      <div className="absolute bottom-4 left-4 z-20 hidden sm:block">
        <button
          onClick={onUploadFile}
          disabled={!canDraw}
          className="flex items-center gap-1.5 px-3 py-2 bg-white/95 backdrop-blur-sm border hairline-border rounded-xl text-xs font-medium text-neutral-700 hover:bg-neutral-50 shadow-xs transition-colors cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
          title="upload document, image, or PDF"
        >
          <UploadCloud className="w-3.5 h-3.5 text-indigo-600" />
          <span>upload file</span>
        </button>
      </div>

      {/* Canvas-Anchored Action: Fork My Board / Back to Shared (bottom-right corner per DESIGN.md) */}
      <div className="absolute bottom-4 right-16 z-20 hidden sm:block">
        {isForked ? (
          <button
            onClick={handleSwitchToShared}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white border border-indigo-700 rounded-xl text-xs font-medium hover:bg-indigo-700 shadow-xs transition-colors cursor-pointer"
            title="return to live shared room board"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>view shared board</span>
          </button>
        ) : (
          <button
            onClick={handleForkBoard}
            disabled={isForking}
            className="flex items-center gap-1.5 px-3 py-2 bg-white/95 backdrop-blur-sm border hairline-border rounded-xl text-xs font-medium text-neutral-700 hover:bg-neutral-50 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            title="fork your own private copy of this whiteboard"
          >
            <GitFork className="w-3.5 h-3.5 text-indigo-600" />
            <span>{isForking ? 'forking...' : 'fork my board'}</span>
          </button>
        )}
      </div>

      {/* Canvas-Anchored Subtle Zoom Controls (bottom-left next to upload button) */}
      <div className="absolute bottom-4 left-36 z-20 hidden md:flex items-center gap-0.5 bg-white/95 backdrop-blur-sm border hairline-border rounded-xl p-1 shadow-xs text-neutral-600">
        <button
          onClick={handleZoomOut}
          className="p-1 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
          title="zoom out (-)"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleResetZoom}
          className="px-1.5 py-0.5 text-[10px] font-mono hover:bg-neutral-100 rounded-md transition-colors cursor-pointer"
          title="reset zoom (100%)"
        >
          {zoomLevel}%
        </button>
        <button
          onClick={handleZoomIn}
          className="p-1 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
          title="zoom in (+)"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <div className="w-px h-3 bg-neutral-200 mx-0.5" />
        <button
          onClick={handleZoomToFit}
          className="p-1 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
          title="zoom to fit (shift+1)"
        >
          <Maximize className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
