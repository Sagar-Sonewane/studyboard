import React, { useState, useCallback } from 'react';
import { Tldraw, Editor } from '@tldraw/tldraw';
import { GeoShapeGeoStyle } from '@tldraw/tlschema';
import { WhiteboardToolbar } from './WhiteboardToolbar';
import {
  UploadCloud,
  GitFork,
  ZoomIn,
  ZoomOut,
  Maximize,
} from 'lucide-react';

interface WhiteboardCanvasProps {
  onUploadFile?: () => void;
  onForkBoard?: () => void;
}

export const WhiteboardCanvas: React.FC<WhiteboardCanvasProps> = ({
  onUploadFile,
  onForkBoard,
}) => {
  const [editor, setEditor] = useState<Editor | null>(null);
  const [activeTool, setActiveTool] = useState<string>('select');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const handleMount = useCallback((editorInstance: Editor) => {
    setEditor(editorInstance);
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
  }, []);

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
      {/* Tldraw Canvas Engine with hidden default UI */}
      <div className="absolute inset-0 z-0">
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

      {/* Canvas-Anchored Action: Fork My Board (bottom-right corner per DESIGN.md) */}
      <div className="absolute bottom-4 right-16 z-20 hidden sm:block">
        <button
          onClick={onForkBoard}
          className="flex items-center gap-1.5 px-3 py-2 bg-white/95 backdrop-blur-sm border hairline-border rounded-xl text-xs font-medium text-neutral-700 hover:bg-neutral-50 shadow-xs transition-colors cursor-pointer"
          title="fork your own private copy of this whiteboard"
        >
          <GitFork className="w-3.5 h-3.5 text-indigo-600" />
          <span>fork my board</span>
        </button>
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
