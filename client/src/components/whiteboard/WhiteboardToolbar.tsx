import React, { useState, useRef, useEffect } from 'react';
import type { Editor } from '@tldraw/tldraw';
import { DefaultColorStyle, DefaultSizeStyle, DefaultDashStyle, GeoShapeGeoStyle } from '@tldraw/tlschema';
import {
  MousePointer,
  PenTool,
  Highlighter,
  Eraser,
  Square,
  Circle,
  Triangle,
  Diamond,
  ArrowRight,
  Type,
  StickyNote,
  Undo2,
  Redo2,
  Palette,
  Minus,
  Lock,
  Hand,
  Check,
} from 'lucide-react';

export type ActiveTool =
  | 'select'
  | 'draw'
  | 'highlight'
  | 'eraser'
  | 'geo'
  | 'text'
  | 'note'
  | 'arrow'
  | 'line';

export type WhiteboardColor =
  | 'black'
  | 'grey'
  | 'blue'
  | 'green'
  | 'yellow'
  | 'orange'
  | 'red'
  | 'violet';

export type WhiteboardSize = 's' | 'm' | 'l' | 'xl';
export type WhiteboardDash = 'draw' | 'solid' | 'dashed' | 'dotted';

interface WhiteboardToolbarProps {
  editor: Editor | null;
  activeTool: string;
  onToolSelect: (tool: string, geoType?: string) => void;
  canUndo?: boolean;
  canRedo?: boolean;
  canDraw?: boolean;
  onRequestDraw?: () => void;
  drawRequestSent?: boolean;
  drawRequestFeedback?: string | null;
}

// Curated StudySync Color Palette
const COLORS: { name: string; value: WhiteboardColor; bgClass: string }[] = [
  { name: 'black', value: 'black', bgClass: 'bg-neutral-900' },
  { name: 'grey', value: 'grey', bgClass: 'bg-neutral-500' },
  { name: 'blue', value: 'blue', bgClass: 'bg-indigo-600' },
  { name: 'green', value: 'green', bgClass: 'bg-emerald-600' },
  { name: 'yellow', value: 'yellow', bgClass: 'bg-amber-500' },
  { name: 'orange', value: 'orange', bgClass: 'bg-orange-500' },
  { name: 'red', value: 'red', bgClass: 'bg-rose-500' },
  { name: 'violet', value: 'violet', bgClass: 'bg-purple-600' },
];

// Stroke sizes
const SIZES: { label: string; value: WhiteboardSize; dotSize: string }[] = [
  { label: 'small', value: 's', dotSize: 'w-1.5 h-1.5' },
  { label: 'medium', value: 'm', dotSize: 'w-2.5 h-2.5' },
  { label: 'large', value: 'l', dotSize: 'w-3.5 h-3.5' },
  { label: 'extra large', value: 'xl', dotSize: 'w-4.5 h-4.5' },
];

// Stroke dash patterns
const DASH_STYLES: { label: string; value: WhiteboardDash; lineClass: string }[] = [
  { label: 'solid', value: 'solid', lineClass: 'border-t-2 border-current w-5' },
  { label: 'dashed', value: 'dashed', lineClass: 'border-t-2 border-dashed border-current w-5' },
  { label: 'dotted', value: 'dotted', lineClass: 'border-t-2 border-dotted border-current w-5' },
  { label: 'draw', value: 'draw', lineClass: 'border-t-2 border-current w-5 italic font-mono' },
];

const SHAPES = [
  { id: 'rectangle', label: 'rectangle', icon: Square, geoType: 'rectangle' },
  { id: 'ellipse', label: 'ellipse', icon: Circle, geoType: 'ellipse' },
  { id: 'triangle', label: 'triangle', icon: Triangle, geoType: 'triangle' },
  { id: 'diamond', label: 'diamond', icon: Diamond, geoType: 'diamond' },
  { id: 'arrow', label: 'arrow', icon: ArrowRight, geoType: undefined },
  { id: 'line', label: 'line', icon: Minus, geoType: undefined },
];

export const WhiteboardToolbar: React.FC<WhiteboardToolbarProps> = ({
  editor,
  activeTool,
  onToolSelect,
  canUndo = true,
  canRedo = true,
  canDraw = true,
  onRequestDraw,
  drawRequestSent = false,
  drawRequestFeedback = null,
}) => {
  const [shapesMenuOpen, setShapesMenuOpen] = useState(false);
  const [paletteMenuOpen, setPaletteMenuOpen] = useState(false);
  const [selectedShape, setSelectedShape] = useState('rectangle');
  const [selectedColor, setSelectedColor] = useState<WhiteboardColor>('black');
  const [selectedSize, setSelectedSize] = useState<WhiteboardSize>('m');
  const [selectedDash, setSelectedDash] = useState<WhiteboardDash>('draw');

  const shapesRef = useRef<HTMLDivElement>(null);
  const paletteRef = useRef<HTMLDivElement>(null);

  // Close flyouts on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (shapesRef.current && !shapesRef.current.contains(e.target as Node)) {
        setShapesMenuOpen(false);
      }
      if (paletteRef.current && !paletteRef.current.contains(e.target as Node)) {
        setPaletteMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleShapeSelect = (shapeId: string) => {
    setSelectedShape(shapeId);
    setShapesMenuOpen(false);
    if (shapeId === 'arrow') {
      onToolSelect('arrow');
    } else if (shapeId === 'line') {
      onToolSelect('line');
    } else {
      onToolSelect('geo', shapeId);
      if (editor) {
        editor.setStyleForNextShapes(GeoShapeGeoStyle, shapeId as any);
        editor.setStyleForSelectedShapes(GeoShapeGeoStyle, shapeId as any);
      }
    }
  };

  const handleColorChange = (color: WhiteboardColor) => {
    setSelectedColor(color);
    if (editor) {
      editor.setStyleForNextShapes(DefaultColorStyle, color as any);
      editor.setStyleForSelectedShapes(DefaultColorStyle, color as any);
    }
  };

  const handleSizeChange = (size: WhiteboardSize) => {
    setSelectedSize(size);
    if (editor) {
      editor.setStyleForNextShapes(DefaultSizeStyle, size as any);
      editor.setStyleForSelectedShapes(DefaultSizeStyle, size as any);
    }
  };

  const handleDashChange = (dash: WhiteboardDash) => {
    setSelectedDash(dash);
    if (editor) {
      editor.setStyleForNextShapes(DefaultDashStyle, dash as any);
      editor.setStyleForSelectedShapes(DefaultDashStyle, dash as any);
    }
  };

  const handleUndo = () => {
    if (editor) {
      editor.undo();
    }
  };

  const handleRedo = () => {
    if (editor) {
      editor.redo();
    }
  };

  // When participant does not have draw permission (Locked Mode)
  if (!canDraw) {
    return (
      <aside className="fixed md:absolute right-3 top-1/2 -translate-y-1/2 z-30 select-none flex flex-col gap-2 items-end">
        <div className="bg-white/95 backdrop-blur-sm p-2 rounded-2xl border hairline-border shadow-xs flex flex-col items-center gap-2 max-w-[140px] text-center">
          <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500">
            <Lock className="w-4 h-4" />
          </div>

          <div className="text-[11px] font-medium text-neutral-600 leading-tight">
            drawing locked
          </div>

          <button
            onClick={onRequestDraw}
            disabled={drawRequestSent}
            className="w-full py-1.5 px-2 bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-neutral-200 disabled:text-neutral-500 rounded-xl text-[11px] font-medium transition-colors flex items-center justify-center gap-1 cursor-pointer disabled:cursor-default"
          >
            {drawRequestSent ? (
              <>
                <Check className="w-3 h-3 text-emerald-300" />
                <span>sent</span>
              </>
            ) : (
              <>
                <Hand className="w-3 h-3" />
                <span>request to draw</span>
              </>
            )}
          </button>
        </div>

        {drawRequestFeedback && (
          <div className="bg-neutral-900 text-white text-[11px] px-2.5 py-1 rounded-lg shadow-md animate-in fade-in slide-in-from-right-1 duration-150">
            {drawRequestFeedback}
          </div>
        )}
      </aside>
    );
  }

  const isGeoActive = activeTool === 'geo' || activeTool === 'arrow' || activeTool === 'line';

  return (
    <aside className="fixed md:absolute right-3 top-1/2 -translate-y-1/2 z-30 select-none flex flex-col gap-1.5">
      {/* Main vertical icon toolbar per DESIGN.md */}
      <div className="flex flex-col gap-1 bg-white/95 backdrop-blur-sm p-1.5 rounded-2xl border hairline-border shadow-xs">
        {/* 1. Select / Pointer */}
        <button
          onClick={() => onToolSelect('select')}
          className={`p-2 rounded-xl transition-colors cursor-pointer group relative ${
            activeTool === 'select'
              ? 'bg-indigo-50 text-indigo-600'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
          }`}
          title="select tool (v)"
        >
          <MousePointer className="w-4 h-4" />
          <span className="sr-only">select</span>
        </button>

        {/* 2. Pen */}
        <button
          onClick={() => onToolSelect('draw')}
          className={`p-2 rounded-xl transition-colors cursor-pointer group relative ${
            activeTool === 'draw'
              ? 'bg-indigo-50 text-indigo-600'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
          }`}
          title="pen tool (p)"
        >
          <PenTool className="w-4 h-4" />
          <span className="sr-only">pen</span>
        </button>

        {/* 3. Highlighter */}
        <button
          onClick={() => onToolSelect('highlight')}
          className={`p-2 rounded-xl transition-colors cursor-pointer group relative ${
            activeTool === 'highlight'
              ? 'bg-indigo-50 text-indigo-600'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
          }`}
          title="highlighter tool (h)"
        >
          <Highlighter className="w-4 h-4" />
          <span className="sr-only">highlighter</span>
        </button>

        {/* 4. Eraser */}
        <button
          onClick={() => onToolSelect('eraser')}
          className={`p-2 rounded-xl transition-colors cursor-pointer group relative ${
            activeTool === 'eraser'
              ? 'bg-indigo-50 text-indigo-600'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
          }`}
          title="eraser tool (e)"
        >
          <Eraser className="w-4 h-4" />
          <span className="sr-only">eraser</span>
        </button>

        {/* 5. Shapes with flyout */}
        <div className="relative" ref={shapesRef}>
          <button
            onClick={() => {
              setShapesMenuOpen((prev) => !prev);
              if (!isGeoActive) {
                handleShapeSelect(selectedShape);
              }
            }}
            className={`p-2 rounded-xl transition-colors cursor-pointer group relative flex items-center justify-center ${
              isGeoActive
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
            title="shapes (r)"
          >
            {selectedShape === 'ellipse' ? (
              <Circle className="w-4 h-4" />
            ) : selectedShape === 'triangle' ? (
              <Triangle className="w-4 h-4" />
            ) : selectedShape === 'diamond' ? (
              <Diamond className="w-4 h-4" />
            ) : selectedShape === 'arrow' ? (
              <ArrowRight className="w-4 h-4" />
            ) : selectedShape === 'line' ? (
              <Minus className="w-4 h-4" />
            ) : (
              <Square className="w-4 h-4" />
            )}
          </button>

          {/* Shapes flyout menu (left side of rail) */}
          {shapesMenuOpen && (
            <div className="absolute right-12 top-0 bg-white border hairline-border rounded-xl p-1.5 shadow-md flex items-center gap-1 z-40 animate-in fade-in zoom-in-95 duration-100">
              {SHAPES.map((shape) => {
                const Icon = shape.icon;
                const isSelected = selectedShape === shape.id;
                return (
                  <button
                    key={shape.id}
                    onClick={() => handleShapeSelect(shape.id)}
                    className={`p-2 rounded-lg text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer ${
                      isSelected ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'hover:bg-neutral-100'
                    }`}
                    title={shape.label}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 6. Text */}
        <button
          onClick={() => onToolSelect('text')}
          className={`p-2 rounded-xl transition-colors cursor-pointer group relative ${
            activeTool === 'text'
              ? 'bg-indigo-50 text-indigo-600'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
          }`}
          title="text tool (t)"
        >
          <Type className="w-4 h-4" />
          <span className="sr-only">text</span>
        </button>

        {/* 7. Sticky Note */}
        <button
          onClick={() => onToolSelect('note')}
          className={`p-2 rounded-xl transition-colors cursor-pointer group relative ${
            activeTool === 'note'
              ? 'bg-indigo-50 text-indigo-600'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
          }`}
          title="sticky note tool (n)"
        >
          <StickyNote className="w-4 h-4" />
          <span className="sr-only">note</span>
        </button>

        {/* Hairline Divider */}
        <div className="h-px bg-neutral-200 my-1 mx-1" />

        {/* 8. Palette & Styling Popover (Color, Stroke Size, Dash Style) */}
        <div className="relative" ref={paletteRef}>
          <button
            onClick={() => setPaletteMenuOpen((prev) => !prev)}
            className={`p-2 rounded-xl transition-colors cursor-pointer group relative ${
              paletteMenuOpen
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
            title="color, stroke size and dash style"
          >
            <Palette className="w-4 h-4" />
          </button>

          {/* Palette Flyout */}
          {paletteMenuOpen && (
            <div className="absolute right-12 top-0 bg-white border hairline-border rounded-2xl p-3 shadow-md z-40 w-52 animate-in fade-in zoom-in-95 duration-100 space-y-3">
              {/* Color Selection */}
              <div>
                <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider block mb-1.5">
                  color
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  {COLORS.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => handleColorChange(c.value)}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-transform cursor-pointer ${c.bgClass} ${
                        selectedColor === c.value
                          ? 'ring-2 ring-indigo-500 ring-offset-2 scale-105'
                          : 'hover:scale-105'
                      }`}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              {/* Stroke Size Selection */}
              <div className="border-t hairline-border pt-2">
                <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider block mb-1.5">
                  stroke size
                </span>
                <div className="flex items-center justify-between bg-neutral-50 p-1 rounded-xl border hairline-border">
                  {SIZES.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => handleSizeChange(s.value)}
                      className={`p-1.5 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                        selectedSize === s.value
                          ? 'bg-white shadow-xs text-indigo-600'
                          : 'text-neutral-400 hover:text-neutral-700'
                      }`}
                      title={s.label}
                    >
                      <div className={`rounded-full bg-current ${s.dotSize}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Dash Style Selection */}
              <div className="border-t hairline-border pt-2">
                <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider block mb-1.5">
                  dash style
                </span>
                <div className="grid grid-cols-4 gap-1 bg-neutral-50 p-1 rounded-xl border hairline-border">
                  {DASH_STYLES.map((d) => (
                    <button
                      key={d.value}
                      onClick={() => handleDashChange(d.value)}
                      className={`py-1.5 px-1 rounded-lg flex items-center justify-center text-xs transition-colors cursor-pointer ${
                        selectedDash === d.value
                          ? 'bg-white shadow-xs text-indigo-600 font-medium'
                          : 'text-neutral-500 hover:text-neutral-800'
                      }`}
                      title={d.label}
                    >
                      <div className={d.lineClass} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 9. Undo */}
        <button
          onClick={handleUndo}
          disabled={!canUndo}
          className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
          title="undo (ctrl+z)"
        >
          <Undo2 className="w-4 h-4" />
          <span className="sr-only">undo</span>
        </button>

        {/* 10. Redo */}
        <button
          onClick={handleRedo}
          disabled={!canRedo}
          className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
          title="redo (ctrl+y / ctrl+shift+z)"
        >
          <Redo2 className="w-4 h-4" />
          <span className="sr-only">redo</span>
        </button>
      </div>
    </aside>
  );
};
