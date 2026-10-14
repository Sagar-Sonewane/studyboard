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
  { name: 'black', value: 'black', bgClass: 'bg-[#15162B]' },
  { name: 'grey', value: 'grey', bgClass: 'bg-[#444654]' },
  { name: 'blue', value: 'blue', bgClass: 'bg-[#3355FF]' },
  { name: 'green', value: 'green', bgClass: 'bg-[#00AA72]' },
  { name: 'yellow', value: 'yellow', bgClass: 'bg-[#FFDD33]' },
  { name: 'orange', value: 'orange', bgClass: 'bg-[#FF9900]' },
  { name: 'red', value: 'red', bgClass: 'bg-[#FF5B4C]' },
  { name: 'violet', value: 'violet', bgClass: 'bg-[#8A3FFC]' },
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
      <aside className="fixed md:absolute right-3 top-1/2 -translate-y-1/2 z-30 select-none flex flex-col gap-2 font-sans">
        <div className="bg-[#FAF8F3] border-2 border-[#15162B] hard-shadow-md rounded-2xl p-3 flex flex-col items-center gap-2 max-w-[130px] text-center">
          <div className="w-8 h-8 rounded-xl bg-[#FFF9D6] border-2 border-[#15162B] flex items-center justify-center text-[#15162B]">
            <Lock className="w-4 h-4 text-[#D47500]" />
          </div>

          <div className="text-[11px] font-display font-bold text-[#15162B] leading-tight">
            Drawing locked
          </div>

          <button
            onClick={onRequestDraw}
            disabled={drawRequestSent}
            className="w-full py-1.5 px-2 bg-[#3355FF] text-white hover:bg-[#2545D9] disabled:bg-neutral-200 disabled:text-neutral-500 border-2 border-[#15162B] hard-shadow-xs rounded-xl text-xs font-display font-bold transition-all flex items-center justify-center gap-1 cursor-pointer disabled:cursor-default"
          >
            {drawRequestSent ? (
              <>
                <Check className="w-3 h-3 text-[#FFDD33]" />
                <span>Sent</span>
              </>
            ) : (
              <>
                <Hand className="w-3 h-3" />
                <span>Request</span>
              </>
            )}
          </button>
        </div>

        {drawRequestFeedback && (
          <div className="bg-[#15162B] text-white text-[11px] font-mono px-3 py-1.5 rounded-xl border border-white/20 shadow-md animate-in fade-in slide-in-from-right-1 duration-150">
            {drawRequestFeedback}
          </div>
        )}
      </aside>
    );
  }

  const isGeoActive = activeTool === 'geo' || activeTool === 'arrow' || activeTool === 'line';

  return (
    <aside className="fixed md:absolute right-3 top-1/2 -translate-y-1/2 z-30 select-none flex flex-col gap-1.5 font-sans">
      {/* Main vertical icon toolbar per StudySync Design */}
      <div className="flex flex-col gap-1 bg-[#FAF8F3]/95 backdrop-blur-md p-1.5 rounded-2xl border-2 border-[#15162B] hard-shadow-sm">
        {/* 1. Select / Pointer */}
        <button
          onClick={() => onToolSelect('select')}
          className={`p-2 rounded-xl transition-all cursor-pointer group relative ${
            activeTool === 'select'
              ? 'bg-[#3355FF] text-white border-2 border-[#15162B] hard-shadow-xs'
              : 'text-[#15162B] hover:bg-white hover:border-[#15162B]/20 border border-transparent'
          }`}
          title="Select tool (v)"
        >
          <MousePointer className="w-4 h-4" />
          <span className="sr-only">select</span>
        </button>

        {/* 2. Pen */}
        <button
          onClick={() => onToolSelect('draw')}
          className={`p-2 rounded-xl transition-all cursor-pointer group relative ${
            activeTool === 'draw'
              ? 'bg-[#3355FF] text-white border-2 border-[#15162B] hard-shadow-xs'
              : 'text-[#15162B] hover:bg-white hover:border-[#15162B]/20 border border-transparent'
          }`}
          title="Pen tool (p)"
        >
          <PenTool className="w-4 h-4" />
          <span className="sr-only">pen</span>
        </button>

        {/* 3. Highlighter */}
        <button
          onClick={() => onToolSelect('highlight')}
          className={`p-2 rounded-xl transition-all cursor-pointer group relative ${
            activeTool === 'highlight'
              ? 'bg-[#3355FF] text-white border-2 border-[#15162B] hard-shadow-xs'
              : 'text-[#15162B] hover:bg-white hover:border-[#15162B]/20 border border-transparent'
          }`}
          title="Highlighter tool (h)"
        >
          <Highlighter className="w-4 h-4" />
          <span className="sr-only">highlighter</span>
        </button>

        {/* 4. Eraser */}
        <button
          onClick={() => onToolSelect('eraser')}
          className={`p-2 rounded-xl transition-all cursor-pointer group relative ${
            activeTool === 'eraser'
              ? 'bg-[#3355FF] text-white border-2 border-[#15162B] hard-shadow-xs'
              : 'text-[#15162B] hover:bg-white hover:border-[#15162B]/20 border border-transparent'
          }`}
          title="Eraser tool (e)"
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
            className={`p-2 rounded-xl transition-all cursor-pointer group relative flex items-center justify-center ${
              isGeoActive
                ? 'bg-[#3355FF] text-white border-2 border-[#15162B] hard-shadow-xs'
                : 'text-[#15162B] hover:bg-white hover:border-[#15162B]/20 border border-transparent'
            }`}
            title="Shapes (r)"
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
            <div className="absolute right-14 top-0 bg-[#FAF8F3] border-2 border-[#15162B] hard-shadow-md rounded-2xl p-2 flex items-center gap-1.5 z-40 animate-in fade-in zoom-in-95 duration-100">
              {SHAPES.map((shape) => {
                const Icon = shape.icon;
                const isSelected = selectedShape === shape.id;
                return (
                  <button
                    key={shape.id}
                    onClick={() => handleShapeSelect(shape.id)}
                    className={`p-2 rounded-xl transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#3355FF] text-white border-2 border-[#15162B] hard-shadow-xs'
                        : 'text-[#15162B] hover:bg-white hover:border-[#15162B]/20 border border-transparent'
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
          className={`p-2 rounded-xl transition-all cursor-pointer group relative ${
            activeTool === 'text'
              ? 'bg-[#3355FF] text-white border-2 border-[#15162B] hard-shadow-xs'
              : 'text-[#15162B] hover:bg-white hover:border-[#15162B]/20 border border-transparent'
          }`}
          title="Text tool (t)"
        >
          <Type className="w-4 h-4" />
          <span className="sr-only">text</span>
        </button>

        {/* 7. Sticky Note */}
        <button
          onClick={() => onToolSelect('note')}
          className={`p-2 rounded-xl transition-all cursor-pointer group relative ${
            activeTool === 'note'
              ? 'bg-[#3355FF] text-white border-2 border-[#15162B] hard-shadow-xs'
              : 'text-[#15162B] hover:bg-white hover:border-[#15162B]/20 border border-transparent'
          }`}
          title="Sticky note tool (n)"
        >
          <StickyNote className="w-4 h-4" />
          <span className="sr-only">note</span>
        </button>

        {/* Divider */}
        <div className="h-px bg-[#15162B]/15 my-1 mx-1" />

        {/* 8. Palette & Styling Popover (Color, Stroke Size, Dash Style) */}
        <div className="relative" ref={paletteRef}>
          <button
            onClick={() => setPaletteMenuOpen((prev) => !prev)}
            className={`p-2 rounded-xl transition-all cursor-pointer group relative ${
              paletteMenuOpen
                ? 'bg-[#FFDD33] text-[#15162B] border-2 border-[#15162B] hard-shadow-xs'
                : 'text-[#15162B] hover:bg-white hover:border-[#15162B]/20 border border-transparent'
            }`}
            title="Color, stroke size and dash style"
          >
            <Palette className="w-4 h-4" />
          </button>

          {/* Palette Flyout */}
          {paletteMenuOpen && (
            <div className="absolute right-14 top-0 bg-[#FAF8F3] border-2 border-[#15162B] hard-shadow-md rounded-2xl p-3.5 z-40 w-56 animate-in fade-in zoom-in-95 duration-100 space-y-3.5">
              {/* Color Selection */}
              <div>
                <span className="text-[10px] font-mono font-bold text-[#444654] uppercase tracking-wider block mb-2">
                  Color
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {COLORS.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => handleColorChange(c.value)}
                      className={`w-7 h-7 rounded-lg border-2 border-[#15162B] flex items-center justify-center transition-transform cursor-pointer ${c.bgClass} ${
                        selectedColor === c.value
                          ? 'ring-2 ring-[#3355FF] ring-offset-2 scale-110 shadow-sm'
                          : 'hover:scale-105'
                      }`}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              {/* Stroke Size Selection */}
              <div className="border-t-2 border-[#15162B]/10 pt-2.5">
                <span className="text-[10px] font-mono font-bold text-[#444654] uppercase tracking-wider block mb-2">
                  Stroke Size
                </span>
                <div className="flex items-center justify-between bg-white p-1 rounded-xl border-2 border-[#15162B]">
                  {SIZES.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => handleSizeChange(s.value)}
                      className={`p-1.5 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                        selectedSize === s.value
                          ? 'bg-[#3355FF] text-white shadow-xs'
                          : 'text-[#444654] hover:text-[#15162B]'
                      }`}
                      title={s.label}
                    >
                      <div className={`rounded-full bg-current ${s.dotSize}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Dash Style Selection */}
              <div className="border-t-2 border-[#15162B]/10 pt-2.5">
                <span className="text-[10px] font-mono font-bold text-[#444654] uppercase tracking-wider block mb-2">
                  Dash Style
                </span>
                <div className="grid grid-cols-4 gap-1 bg-white p-1 rounded-xl border-2 border-[#15162B]">
                  {DASH_STYLES.map((d) => (
                    <button
                      key={d.value}
                      onClick={() => handleDashChange(d.value)}
                      className={`py-1.5 px-1 rounded-lg flex items-center justify-center text-xs transition-colors cursor-pointer ${
                        selectedDash === d.value
                          ? 'bg-[#3355FF] text-white font-bold'
                          : 'text-[#444654] hover:text-[#15162B]'
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
          className="p-2 rounded-xl text-[#15162B] hover:bg-white hover:border-[#15162B]/20 border border-transparent transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="w-4 h-4" />
          <span className="sr-only">undo</span>
        </button>

        {/* 10. Redo */}
        <button
          onClick={handleRedo}
          disabled={!canRedo}
          className="p-2 rounded-xl text-[#15162B] hover:bg-white hover:border-[#15162B]/20 border border-transparent transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
          title="Redo (Ctrl+Y)"
        >
          <Redo2 className="w-4 h-4" />
          <span className="sr-only">redo</span>
        </button>
      </div>
    </aside>
  );
};
