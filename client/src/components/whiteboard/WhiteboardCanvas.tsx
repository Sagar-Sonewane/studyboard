import React, { useState, useCallback } from 'react';
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
} from 'lucide-react';

interface WhiteboardCanvasProps {
  roomId: string;
  user?: {
    id?: string;
    displayName: string;
    color?: string;
  };
  token?: string | null;
  onUploadFile?: () => void;
}

export const WhiteboardCanvas: React.FC<WhiteboardCanvasProps> = ({
  roomId,
  user,
  token,
  onUploadFile,
}) => {
  const [isForked, setIsForked] = useState(false);
  const [forkedBoardId, setForkedBoardId] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<string>('select');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isForking, setIsForking] = useState(false);

  // Yjs synchronization hook
  const { editor, onEditorMount, syncState } = useYjsWhiteboardSync({
    roomId,
    isForked,
    forkedBoardId,
    user,
  });

  const handleMount = useCallback(
    (editorInstance: Editor) => {
      onEditorMount(editorInstance);

      // Set initial tool
      editorInstance.setCurrentTool('draw');
      setActiveTool('draw');

      // Subscribe to tool changes & history changes
      const cleanup = editorInstance.store.listen(() => {
        try {
          const currentToolId = editorInstance.getCurrentToolId();
          setActiveTool(currentToolId);
          setCanUndo(editorInstance.getCanUndo());
          setCanRedo(editorInstance.getCanRedo());
          setZoomLevel(Math.round(editorInstance.getZoomLevel() * 100));
        } catch {
          // ignore
        }
      });

      return () => {
        cleanup();
      };
    },
    [onEditorMount]
  );

  const handleToolSelect = useCallback(
    (tool: string, geoType?: string) => {
      if (!editor) return;

      try {
        if (tool === 'geo') {
          editor.setCurrentTool('geo');
          if (geoType) {
            editor.setStyleForNextShapes(GeoShapeGeoStyle, geoType as any);
            editor.setStyleForSelectedShapes(GeoShapeGeoStyle, geoType as any);
          }
        } else {
          editor.setCurrentTool(tool as any);
        }
        setActiveTool(tool);
      } catch (err) {
        console.error('[Whiteboard] Failed to set tool:', err);
      }
    },
    [editor]
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

  // Zoom helpers
  const handleZoomIn = () => {
    if (editor) {
      editor.zoomIn();
      setZoomLevel(Math.round(editor.getZoomLevel() * 100));
    }
  };

  const handleZoomOut = () => {
    if (editor) {
      editor.zoomOut();
      setZoomLevel(Math.round(editor.getZoomLevel() * 100));
    }
  };

  const handleResetZoom = () => {
    if (editor) {
      editor.resetZoom();
      setZoomLevel(100);
    }
  };

  const handleZoomToFit = () => {
    if (editor) {
      editor.zoomToFit();
      setZoomLevel(Math.round(editor.getZoomLevel() * 100));
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
        /* Top Status Indicator for Shared Board Sync */
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 hidden sm:flex items-center gap-1.5 px-3 py-1 bg-white/90 backdrop-blur-sm border hairline-border rounded-full shadow-xs text-[11px] font-medium text-neutral-600">
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
      )}

      {/* Tldraw Canvas Engine with hidden default UI */}
      <div className="absolute inset-0 z-0" key={isForked ? `forked-${forkedBoardId}` : `shared-${roomId}`}>
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
      />

      {/* Canvas-Anchored Action: Upload File (bottom-left corner per DESIGN.md) */}
      <div className="absolute bottom-4 left-4 z-20 hidden sm:block">
        <button
          onClick={onUploadFile}
          className="flex items-center gap-1.5 px-3 py-2 bg-white/95 backdrop-blur-sm border hairline-border rounded-xl text-xs font-medium text-neutral-700 hover:bg-neutral-50 shadow-xs transition-colors cursor-pointer"
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
