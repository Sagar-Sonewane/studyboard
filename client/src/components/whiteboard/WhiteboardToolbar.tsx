import React, { useState, useRef, useEffect } from 'react';
import type { Editor } from '@tldraw/tldraw';
import { DefaultColorStyle, DefaultSizeStyle } from '@tldraw/tlschema';
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

interface WhiteboardToolbarProps {
  editor: Editor | null;
  activeTool: string;
  onToolSelect: (tool: string, geoType?: string) => void;
  canUndo?: boolean;
  canRedo?: boolean;
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

const SHAPES = [
  { id: 'rectangle', label: 'rectangle', icon: Square },
  { id: 'ellipse', label: 'ellipse', icon: Circle },
  { id: 'triangle', label: 'triangle', icon: Triangle },
  { id: 'diamond', label: 'diamond', icon: Diamond },
  { id: 'arrow', label: 'arrow', icon: ArrowRight },
  { id: 'line', label: 'line', icon: Minus },
];

export const WhiteboardToolbar: React.FC<WhiteboardToolbarProps> = ({
  editor,
  activeTool,
  onToolSelect,
  canUndo = true,
  canRedo = true,
}) => {
  const [shapesMenuOpen, setShapesMenuOpen] = useState(false);
  const [paletteMenuOpen, setPaletteMenuOpen] = useState(false);
  const [selectedShape, setSelectedShape] = useState('rectangle');
  const [selectedColor, setSelectedColor] = useState<WhiteboardColor>('black');
  const [selectedSize, setSelectedSize] = useState<WhiteboardSize>('m');

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
                    className={`p-2 rounded-lg text-neutral-600 hover:text-neutral-900 transition-colors ${
                      isSelected ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-neutral-100'
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

        {/* 8. Palette & Styling Popover */}
        <div className="relative" ref={paletteRef}>
          <button
            onClick={() => setPaletteMenuOpen((prev) => !prev)}
            className={`p-2 rounded-xl transition-colors cursor-pointer group relative ${
              paletteMenuOpen
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
            title="color and stroke style"
          >
            <Palette className="w-4 h-4" />
          </button>

          {/* Palette Flyout */}
          {paletteMenuOpen && (
            <div className="absolute right-12 top-0 bg-white border hairline-border rounded-2xl p-3 shadow-md z-40 w-48 animate-in fade-in zoom-in-95 duration-100 space-y-3">
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
