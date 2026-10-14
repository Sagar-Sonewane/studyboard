import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Tldraw, Editor } from '@tldraw/tldraw';
import { GeoShapeGeoStyle, createShapeId, AssetRecordType, TLAsset } from '@tldraw/tlschema';
import { WhiteboardToolbar } from './WhiteboardToolbar';
import { useYjsWhiteboardSync } from '../../lib/yjs-sync';
import { forkBoard, uploadRoomFile } from '../../lib/api';
import { renderPdfToPages } from '../../lib/pdf-renderer';
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
  Loader2,
  Highlighter,
  AlertCircle,
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

  // File Upload & Annotation Layer State (Phase 6)
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState<string | null>(null);
  const [uploadFeedback, setUploadFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showAnnotations, setShowAnnotations] = useState(true);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
          if (tool === 'draw' || tool === 'highlight') {
            setShowAnnotations(true);
          }
        }
        lastToolIdRef.current = tool;
        setActiveTool(tool);
      } catch (err) {
        console.error('[Whiteboard] Failed to set tool:', err);
      }
    },
    [editor, canDraw]
  );

  // Trigger file upload dialog
  const handleTriggerUpload = useCallback(() => {
    if (!canDraw || isUploading) return;
    if (onUploadFile) {
      onUploadFile();
    }
    fileInputRef.current?.click();
  }, [canDraw, isUploading, onUploadFile]);

  // Handle selected image or PDF file upload (Phase 6)
  const handleFileSelected = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Reset input value so same file can be re-selected if desired
      e.target.value = '';

      // 1. Enforce 10MB file size limit client-side (Free tier cap)
      const MAX_SIZE = 10 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        setUploadFeedback({
          type: 'error',
          message: `File exceeds 10MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB). Free tier maximum is 10MB.`,
        });
        setTimeout(() => setUploadFeedback(null), 6000);
        return;
      }

      setUploadFeedback(null);
      setIsUploading(true);

      try {
        const isPdf =
          file.type === 'application/pdf' ||
          file.name.toLowerCase().endsWith('.pdf');

        if (isPdf) {
          setUploadProgressText('Parsing PDF pages...');
          const pages = await renderPdfToPages(file, (curr, total) => {
            setUploadProgressText(`Rendering page ${curr}/${total}...`);
          });

          if (pages.length === 0) {
            throw new Error('No pages could be extracted from this PDF');
          }

          const center = editor?.getViewportPageBounds()?.center || { x: 400, y: 300 };
          const startX = Math.round(center.x - pages[0].width / 2);
          let currentY = Math.round(center.y - pages[0].height / 2);

          const createdShapeIds: string[] = [];

          for (let i = 0; i < pages.length; i++) {
            const page = pages[i];
            setUploadProgressText(`Uploading page ${i + 1}/${pages.length}...`);

            const pageFileName = `${file.name.replace(/\.pdf$/i, '')}-page-${page.pageNumber}.png`;
            const uploadRes = await uploadRoomFile(roomId, page.blob, {
              originalFilename: pageFileName,
              fileType: 'pdf_page',
              boardId: isForked ? forkedBoardId : null,
              token,
            });

            if (editor) {
              const assetId = AssetRecordType.createId();
              const asset: TLAsset = {
                id: assetId,
                typeName: 'asset',
                type: 'image',
                props: {
                  name: pageFileName,
                  src: uploadRes.url,
                  w: page.width,
                  h: page.height,
                  mimeType: 'image/png',
                  isAnimated: false,
                },
                meta: {},
              };
              editor.createAssets([asset]);

              const shapeId = createShapeId();
              editor.createShape({
                id: shapeId,
                type: 'image',
                x: startX,
                y: currentY,
                props: {
                  w: page.width,
                  h: page.height,
                  assetId: assetId,
                  url: uploadRes.url,
                },
                meta: {
                  authorName: user?.displayName || 'User',
                  authorColor: user?.color || '#4f46e5',
                  fileType: 'pdf_page',
                  originalFilename: file.name,
                  pageNumber: page.pageNumber,
                },
              });
              createdShapeIds.push(shapeId as string);

              // 40px spacing between pages
              currentY += page.height + 40;
            }
          }

          if (editor && createdShapeIds.length > 0) {
            editor.setSelectedShapes([createdShapeIds[0] as any]);
          }

          setUploadFeedback({
            type: 'success',
            message: `Uploaded PDF (${pages.length} ${pages.length === 1 ? 'page' : 'pages'})`,
          });
          setTimeout(() => setUploadFeedback(null), 4000);
        } else {
          // Standard image upload
          setUploadProgressText('Processing image...');

          const dimensions = await new Promise<{ width: number; height: number }>((resolve) => {
            const img = new Image();
            const objectUrl = URL.createObjectURL(file);
            img.onload = () => {
              URL.revokeObjectURL(objectUrl);
              resolve({ width: img.naturalWidth || 600, height: img.naturalHeight || 400 });
            };
            img.onerror = () => {
              URL.revokeObjectURL(objectUrl);
              resolve({ width: 600, height: 400 });
            };
            img.src = objectUrl;
          });

          // Scale down if larger than 900px wide for clean canvas fit
          const maxWidth = 900;
          const scale = dimensions.width > maxWidth ? maxWidth / dimensions.width : 1;
          const displayWidth = Math.round(dimensions.width * scale);
          const displayHeight = Math.round(dimensions.height * scale);

          setUploadProgressText('Uploading to storage...');
          const uploadRes = await uploadRoomFile(roomId, file, {
            originalFilename: file.name,
            fileType: 'image',
            boardId: isForked ? forkedBoardId : null,
            token,
          });

          if (editor) {
            const center = editor.getViewportPageBounds()?.center || { x: 400, y: 300 };
            const posX = Math.round(center.x - displayWidth / 2);
            const posY = Math.round(center.y - displayHeight / 2);

            const assetId = AssetRecordType.createId();
            const asset: TLAsset = {
              id: assetId,
              typeName: 'asset',
              type: 'image',
              props: {
                name: file.name,
                src: uploadRes.url,
                w: displayWidth,
                h: displayHeight,
                mimeType: file.type || 'image/png',
                isAnimated: false,
              },
              meta: {},
            };
            editor.createAssets([asset]);

            const shapeId = createShapeId();
            editor.createShape({
              id: shapeId,
              type: 'image',
              x: posX,
              y: posY,
              props: {
                w: displayWidth,
                h: displayHeight,
                assetId: assetId,
                url: uploadRes.url,
              },
              meta: {
                authorName: user?.displayName || 'User',
                authorColor: user?.color || '#4f46e5',
                fileType: 'image',
                originalFilename: file.name,
              },
            });
            editor.setSelectedShapes([shapeId as any]);
          }

          setUploadFeedback({
            type: 'success',
            message: `Uploaded ${file.name}`,
          });
          setTimeout(() => setUploadFeedback(null), 4000);
        }
      } catch (err: any) {
        console.error('[WhiteboardCanvas] Upload error:', err);
        setUploadFeedback({
          type: 'error',
          message: err?.message || 'Upload failed',
        });
        setTimeout(() => setUploadFeedback(null), 6000);
      } finally {
        setIsUploading(false);
        setUploadProgressText(null);
      }
    },
    [editor, roomId, isForked, forkedBoardId, token, user]
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
    <div
      className={`relative w-full h-full flex-1 overflow-hidden bg-white ${
        !showAnnotations ? 'sb-hide-annotations' : ''
      }`}
    >
      {/* Top Banner when in Forked / Personal Copy Mode */}
      {isForked ? (
        <div className="absolute top-3.5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 px-4 py-2 bg-[#15162B] text-white border-2 border-[#15162B] hard-shadow-sm rounded-2xl text-xs animate-in fade-in slide-in-from-top-2 duration-200 font-sans">
          <div className="flex items-center gap-1.5 font-display font-bold text-[#FFDD33]">
            <Lock className="w-3.5 h-3.5" />
            <span>Personal Copy · Private Board</span>
          </div>
          <div className="w-px h-3.5 bg-white/20" />
          <button
            onClick={handleSwitchToShared}
            className="flex items-center gap-1 text-white hover:text-[#FFDD33] transition-colors font-display font-bold cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Switch to shared board</span>
          </button>
        </div>
      ) : (
        /* Top Status Indicator & Follow-Host Controls for Shared Board */
        <div className="absolute top-3.5 left-1/2 -translate-x-1/2 z-30 hidden sm:flex items-center gap-2 font-sans">
          {/* Live Sync Status */}
          <div className="flex items-center gap-2 px-3 py-1 bg-[#FAF8F3] border-2 border-[#15162B] hard-shadow-xs rounded-full text-xs font-mono font-bold text-[#15162B]">
            {syncState.isConnected ? (
              <>
                <div className="w-2 h-2 rounded-full bg-[#00AA72] animate-pulse" />
                <span>Multiplayer live</span>
              </>
            ) : (
              <>
                <Radio className="w-3.5 h-3.5 text-[#D47500] animate-spin" />
                <span>Connecting sync...</span>
              </>
            )}
          </div>

          {/* Follow-Host Viewport Pill (for non-hosts) */}
          {!isHost && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-[#FAF8F3] border-2 border-[#15162B] hard-shadow-xs rounded-full text-xs font-display font-bold">
              {isFollowingHost ? (
                <div className="flex items-center gap-1.5 text-[#3355FF]">
                  <Eye className="w-3.5 h-3.5 text-[#3355FF] animate-pulse" />
                  <span>Following host</span>
                  <button
                    onClick={() => setIsFollowingHost(false)}
                    className="ml-1 text-[11px] text-[#444654] hover:text-[#15162B] transition-colors cursor-pointer"
                    title="Stop following host viewport"
                  >
                    <EyeOff className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleJumpToHost}
                  className="flex items-center gap-1.5 text-[#15162B] hover:text-[#3355FF] transition-colors cursor-pointer"
                  title="Snap and follow host viewport"
                >
                  <Eye className="w-3.5 h-3.5 text-[#3355FF]" />
                  <span>Jump to host</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Selected Shape Author Attribution Tooltip */}
      {selectedAuthor && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-3.5 py-1.5 bg-[#15162B] text-white border-2 border-[#15162B] hard-shadow-sm text-xs font-display font-medium rounded-full animate-in fade-in duration-150">
          <div
            style={{ backgroundColor: selectedAuthor.color }}
            className="w-2.5 h-2.5 rounded-full border border-white"
          />
          <User className="w-3.5 h-3.5 text-[#B9BAC7]" />
          <span>Created by {selectedAuthor.name}</span>
        </div>
      )}

      {/* Non-intrusive Upload Status & Error Banner */}
      {uploadFeedback && (
        <div
          className={`absolute top-14 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-display font-bold hard-shadow-md animate-in fade-in slide-in-from-top-1 ${
            uploadFeedback.type === 'error'
              ? 'bg-[#FFE3E0] text-[#FF5B4C] border-2 border-[#FF5B4C]'
              : 'bg-[#FAF8F3] text-[#15162B] border-2 border-[#15162B]'
          }`}
        >
          {uploadFeedback.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-[#FF5B4C]" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-[#00AA72]" />
          )}
          <span>{uploadFeedback.message}</span>
        </div>
      )}

      {/* Tldraw Canvas Engine with hidden default UI */}
      <div
        className="absolute inset-0 z-0 bg-white"
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

      {/* Canvas-Anchored Action: Upload File (bottom-left corner per StudySync Design) */}
      <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 font-sans">
        <button
          onClick={handleTriggerUpload}
          disabled={!canDraw || isUploading}
          className="flex items-center gap-1.5 px-3 py-2 bg-[#FAF8F3] hover:bg-white border-2 border-[#15162B] hard-shadow-xs rounded-xl text-xs font-display font-bold text-[#15162B] transition-transform cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
          title="Upload document, image, or PDF (up to 10MB)"
        >
          {isUploading ? (
            <Loader2 className="w-4 h-4 text-[#3355FF] animate-spin" />
          ) : (
            <UploadCloud className="w-4 h-4 text-[#3355FF]" />
          )}
          <span>{isUploading ? uploadProgressText || 'Uploading...' : 'Upload file'}</span>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif,.pdf,application/pdf"
          onChange={handleFileSelected}
          className="hidden"
        />

        {/* Canvas-Anchored Annotation Layer Toggle (Highlighter & Pen on/off) */}
        <button
          onClick={() => setShowAnnotations(!showAnnotations)}
          className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 border-[#15162B] hard-shadow-xs text-xs font-display font-bold transition-transform cursor-pointer ${
            showAnnotations
              ? 'bg-[#FAF8F3] text-[#15162B] hover:bg-white'
              : 'bg-[#FFF9D6] text-[#B87A00] hover:bg-[#FFF3C2]'
          }`}
          title={showAnnotations ? 'Hide ink & highlighter annotations' : 'Show ink & highlighter annotations'}
        >
          {showAnnotations ? (
            <>
              <Highlighter className="w-4 h-4 text-[#3355FF]" />
              <span>Annotations: on</span>
            </>
          ) : (
            <>
              <EyeOff className="w-4 h-4 text-[#D47500]" />
              <span>Annotations: hidden</span>
            </>
          )}
        </button>

        {/* Canvas-Anchored Subtle Zoom Controls */}
        <div className="hidden md:flex items-center gap-1 bg-[#FAF8F3] border-2 border-[#15162B] hard-shadow-xs rounded-xl p-1 text-[#15162B]">
          <button
            onClick={handleZoomOut}
            className="p-1 rounded-lg hover:bg-white transition-colors cursor-pointer"
            title="Zoom out (-)"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleResetZoom}
            className="px-1.5 py-0.5 text-xs font-mono font-bold hover:bg-white rounded-md transition-colors cursor-pointer"
            title="Reset zoom (100%)"
          >
            {zoomLevel}%
          </button>
          <button
            onClick={handleZoomIn}
            className="p-1 rounded-lg hover:bg-white transition-colors cursor-pointer"
            title="Zoom in (+)"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-3.5 bg-[#15162B]/20 mx-0.5" />
          <button
            onClick={handleZoomToFit}
            className="p-1 rounded-lg hover:bg-white transition-colors cursor-pointer"
            title="Zoom to fit (Shift+1)"
          >
            <Maximize className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Canvas-Anchored Action: Fork My Board / Back to Shared (bottom-right corner per StudySync Design) */}
      <div className="absolute bottom-4 right-16 z-20 hidden sm:block font-sans">
        {isForked ? (
          <button
            onClick={handleSwitchToShared}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#3355FF] text-white border-2 border-[#15162B] hard-shadow-xs rounded-xl text-xs font-display font-bold hover:bg-[#2545D9] transition-transform cursor-pointer"
            title="Return to live shared room board"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>View shared board</span>
          </button>
        ) : (
          <button
            onClick={handleForkBoard}
            disabled={isForking}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#FAF8F3] hover:bg-white text-[#15162B] border-2 border-[#15162B] hard-shadow-xs rounded-xl text-xs font-display font-bold transition-transform cursor-pointer disabled:opacity-50"
            title="Fork your own private copy of this whiteboard"
          >
            <GitFork className="w-4 h-4 text-[#3355FF]" />
            <span>{isForking ? 'Forking...' : 'Fork my board'}</span>
          </button>
        )}
      </div>
    </div>
  );
};

