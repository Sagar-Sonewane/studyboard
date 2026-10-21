import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  Mic,
  Crown,
  MousePointer,
  PenTool,
  Highlighter,
  Square,
  StickyNote,
  Undo2,
  Redo2,
  Paperclip,
  GitFork,
  ZoomIn,
  ZoomOut,
  Volume2,
  Check,
} from 'lucide-react';

export const HeroWorkspacePreview: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const [activeBoardView, setActiveBoardView] = useState<'shared' | 'my-copy'>('shared');
  const [activeTool, setActiveTool] = useState<'select' | 'pen' | 'highlighter' | 'shapes' | 'sticky'>('pen');
  const [isSimulatingAudio, setIsSimulatingAudio] = useState(true);

  // Gentle pulse simulation for voice activity
  useEffect(() => {
    const interval = setInterval(() => {
      setIsSimulatingAudio((prev) => !prev);
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full max-w-2xl mx-auto lg:max-w-none pt-2 pb-3 px-2 select-none" aria-hidden="true">
      {/* Outer 4px hard shadow container per DESIGN.md & QA instructions */}
      <div className="relative bg-white border-2 border-[#15162B] shadow-[4px_4px_0px_#15162B] rounded-2xl overflow-hidden transition-all duration-300">
        
        {/* Top Window Bar (Authentic StudySync in-room header) */}
        <div className="bg-[#F7F5EF] border-b-2 border-[#15162B] px-4 py-3 flex items-center justify-between">
          {/* Traffic Lights & Room Metadata */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5" aria-hidden="true">
              <span className="w-3 h-3 rounded-full bg-[#FF5B4C] border border-[#15162B]" />
              <span className="w-3 h-3 rounded-full bg-[#FFDD33] border border-[#15162B]" />
              <span className="w-3 h-3 rounded-full bg-[#2FE69C] border border-[#15162B]" />
            </div>

            <div className="h-4 w-[1px] bg-[#15162B]/20 hidden sm:block" />

            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-xs sm:text-sm text-[#15162B] tracking-tight">
                sprint-architecture · room
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#DCE3FF] text-[#3355FF] border border-[#3355FF]/30">
                #m7k-42p
              </span>
            </div>
          </div>

          {/* Right Status Indicators: Audio Pulse & Participant Avatars */}
          <div className="flex items-center gap-2">
            {/* Live Voice Indicator */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-[11px] font-bold text-emerald-800">
              <span
                className={`w-2 h-2 rounded-full bg-emerald-500 ${
                  isSimulatingAudio && !shouldReduceMotion ? 'animate-pulse' : ''
                }`}
                aria-hidden="true"
              />
              <Volume2 className="w-3 h-3 text-emerald-600 hidden xs:inline" aria-hidden="true" />
              <span>Voice live</span>
            </div>

            {/* Room Participant Avatars matching real participant rail */}
            <div className="hidden sm:flex items-center -space-x-1.5 pl-1" title="Active collaborators">
              <div className="w-6 h-6 rounded-full bg-[#3355FF] text-white flex items-center justify-center font-bold text-[10px] border border-[#15162B]">
                S
              </div>
              <div className="w-6 h-6 rounded-full bg-[#FF5B4C] text-white flex items-center justify-center font-bold text-[10px] border border-[#15162B]">
                J
              </div>
              <div className="w-6 h-6 rounded-full bg-[#FFDD33] text-[#15162B] flex items-center justify-center font-bold text-[10px] border border-[#15162B]">
                A
              </div>
            </div>
          </div>
        </div>

        {/* Main Workspace Canvas Viewport */}
        <div className="relative min-h-[380px] sm:min-h-[420px] bg-[#F7F5EF] overflow-hidden p-4 sm:p-6 flex flex-col justify-between">
          {/* Subtle Grid Pattern Background */}
          <div
            className="absolute inset-0 opacity-30 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#15162B 1px, transparent 1px)',
              backgroundSize: '22px 22px',
            }}
            aria-hidden="true"
          />

          {/* Canvas Top Bar: Active Host Indicator & Real In-App View Toggle (Shared vs My copy) */}
          <div className="relative z-10 flex items-center justify-between">
            {/* Host active indicator pill */}
            <div className="inline-flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border-2 border-[#15162B] shadow-[2px_2px_0px_#15162B] text-xs">
              <div className="relative">
                <span className="w-6 h-6 rounded-full bg-[#3355FF] text-white font-bold text-[11px] flex items-center justify-center">
                  S
                </span>
                <Crown
                  className="w-3.5 h-3.5 text-[#FFDD33] fill-[#FFDD33] absolute -top-1.5 -right-1.5 drop-shadow-xs"
                  aria-hidden="true"
                />
              </div>
              <div className="leading-tight">
                <div className="font-display font-bold text-[#15162B] text-xs flex items-center gap-1.5">
                  <span>Sarah (Host)</span>
                  {isSimulatingAudio && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-mono text-emerald-600 font-bold">
                      <span className="inline-block w-1 h-2 bg-emerald-500 rounded-full animate-bounce" />
                      <span className="inline-block w-1 h-3 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.15s]" />
                      <span className="inline-block w-1 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.3s]" />
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-[#444654]">speaking · sharing canvas</div>
              </div>
            </div>

            {/* In-App Board Mode Switcher: Shared vs My Copy */}
            <div className="flex items-center gap-1 bg-white border-2 border-[#15162B] shadow-[2px_2px_0px_#15162B] rounded-lg p-0.5 text-xs font-bold font-display">
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setActiveBoardView('shared')}
                className={`px-3 py-1 rounded transition-colors ${
                  activeBoardView === 'shared' ? 'bg-[#3355FF] text-white' : 'text-[#15162B] hover:bg-[#F7F5EF]'
                }`}
              >
                Shared
              </button>
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setActiveBoardView('my-copy')}
                className={`px-3 py-1 rounded transition-colors ${
                  activeBoardView === 'my-copy' ? 'bg-[#FFDD33] text-[#15162B]' : 'text-[#15162B] hover:bg-[#F7F5EF]'
                }`}
              >
                My copy
              </button>
            </div>
          </div>

          {/* Canvas Center: Single Coherent Scene (Sprint Launch) */}
          <div className="relative z-10 my-auto py-3">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center max-w-lg mx-auto">
              
              {/* Card 1: Checklist Card (No overlap with sticky or cursors) */}
              <div className="sm:col-span-7 bg-white border-2 border-[#15162B] shadow-[3px_3px_0px_#15162B] rounded-xl p-4 relative">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#15162B]/10">
                  <span className="font-display font-bold text-xs sm:text-sm text-[#15162B]">
                    Sprint Review Objectives
                  </span>
                  <span className="text-[11px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                    2 of 3 done
                  </span>
                </div>

                <div className="space-y-2.5 text-xs font-medium text-[#15162B]">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="text-xs">Multiplayer canvas drawing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="text-xs">In-room voice channel</span>
                  </div>
                  
                  {/* Item with Red Dashed Annotation Circle cleanly framing it without touching text */}
                  <div className="relative flex items-center gap-2 p-1 rounded-md">
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-[#3355FF] flex items-center justify-center shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#3355FF]" />
                    </span>
                    <span className="text-xs text-[#15162B] font-semibold">
                      Instant guest join links
                    </span>
                    
                    {/* Red dashed circle drawn around this single item with generous clearance */}
                    <div 
                      className="absolute -inset-1 border-2 border-[#FF5B4C] border-dashed rounded-lg pointer-events-none opacity-85"
                      aria-hidden="true" 
                    />
                  </div>
                </div>
              </div>

              {/* Card 2: Sticky Note (Cleanly placed to the right, non-overlapping) */}
              <motion.div
                initial={shouldReduceMotion ? false : { rotate: 2 }}
                animate={shouldReduceMotion ? {} : { rotate: [2, 3.5, 2] }}
                transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
                className="sm:col-span-5 bg-[#FFF3C2] border-2 border-[#15162B] shadow-[3px_3px_0px_#15162B] rounded-xl p-3.5"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-[#15162B] mx-auto mb-1.5" aria-hidden="true" />
                <p className="font-display font-bold text-xs text-[#15162B] leading-tight mb-2">
                  Launch Notes 📌
                </p>
                <ul className="text-xs text-[#444654] space-y-1 leading-snug">
                  <li>• System flow approved ✓</li>
                  <li>• Whiteboard tools verified ✓</li>
                  <li>• Slide markup tested</li>
                </ul>
              </motion.div>
            </div>

            {/* Live Collaborator Cursor 1: Jordan (Red) placed in clear canvas space outside cards */}
            <motion.div
              initial={shouldReduceMotion ? false : { x: 0, y: 0 }}
              animate={
                shouldReduceMotion
                  ? {}
                  : {
                      x: [0, 15, -10, 0],
                      y: [0, -10, 8, 0],
                    }
              }
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute z-20 pointer-events-none flex items-center gap-1 left-4 -top-5"
            >
              <MousePointer className="w-4 h-4 text-[#FF5B4C] fill-[#FF5B4C] drop-shadow-xs" />
              <span className="text-[11px] font-mono font-bold bg-[#FF5B4C] text-white px-1.5 py-0.5 rounded shadow-xs border border-[#15162B]">
                Jordan
              </span>
            </motion.div>

            {/* Live Collaborator Cursor 2: Alex (Yellow) placed in open bottom space, NOT over text */}
            <motion.div
              initial={shouldReduceMotion ? false : { x: 0, y: 0 }}
              animate={
                shouldReduceMotion
                  ? {}
                  : {
                      x: [0, -15, 10, 0],
                      y: [0, 8, -6, 0],
                    }
              }
              transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute z-20 pointer-events-none hidden sm:flex items-center gap-1 right-6 -bottom-5"
            >
              <MousePointer className="w-4 h-4 text-[#FFDD33] fill-[#FFDD33] drop-shadow-xs" />
              <span className="text-[11px] font-mono font-bold bg-[#FFDD33] text-[#15162B] px-1.5 py-0.5 rounded shadow-xs border border-[#15162B]">
                Alex
              </span>
            </motion.div>
          </div>

          {/* Canvas Bottom Control Strip (Matches in-room WhiteboardCanvas) */}
          <div className="relative z-10 flex items-center justify-between text-xs font-mono pt-2 border-t border-[#15162B]/10">
            {/* Upload file badge (bottom-left) */}
            <div className="flex items-center gap-1.5 text-xs text-[#444654] bg-white px-2.5 py-1 rounded-lg border border-[#15162B]">
              <Paperclip className="w-3.5 h-3.5 text-[#3355FF]" aria-hidden="true" />
              <span>slides-w4.pdf (4 pages)</span>
            </div>

            {/* Zoom controls (bottom-right) */}
            <div className="flex items-center gap-1.5 text-xs text-[#15162B] bg-white px-2.5 py-1 rounded-lg border border-[#15162B]">
              <ZoomOut className="w-3.5 h-3.5 text-[#444654]" aria-hidden="true" />
              <span className="font-bold">100%</span>
              <ZoomIn className="w-3.5 h-3.5 text-[#444654]" aria-hidden="true" />
            </div>
          </div>
        </div>

        {/* Realistic Floating Studio Toolbar (Faithful to WhiteboardToolbar.tsx) */}
        <div className="bg-[#F7F5EF] border-t-2 border-[#15162B] px-3 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-1 sm:gap-1.5">
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setActiveTool('select')}
              className={`p-1.5 rounded-lg border-2 transition-all ${
                activeTool === 'select'
                  ? 'bg-[#3355FF] text-white border-[#15162B] shadow-[2px_2px_0px_#15162B]'
                  : 'bg-white text-[#15162B] border-[#15162B] hover:bg-neutral-50'
              }`}
              title="Select tool"
            >
              <MousePointer className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setActiveTool('pen')}
              className={`p-1.5 rounded-lg border-2 transition-all ${
                activeTool === 'pen'
                  ? 'bg-[#3355FF] text-white border-[#15162B] shadow-[2px_2px_0px_#15162B]'
                  : 'bg-white text-[#15162B] border-[#15162B] hover:bg-neutral-50'
              }`}
              title="Freehand pen"
            >
              <PenTool className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setActiveTool('highlighter')}
              className={`p-1.5 rounded-lg border-2 transition-all ${
                activeTool === 'highlighter'
                  ? 'bg-[#FFDD33] text-[#15162B] border-[#15162B] shadow-[2px_2px_0px_#15162B]'
                  : 'bg-white text-[#15162B] border-[#15162B] hover:bg-neutral-50'
              }`}
              title="Highlighter"
            >
              <Highlighter className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setActiveTool('shapes')}
              className={`p-1.5 rounded-lg border-2 transition-all ${
                activeTool === 'shapes'
                  ? 'bg-[#3355FF] text-white border-[#15162B] shadow-[2px_2px_0px_#15162B]'
                  : 'bg-white text-[#15162B] border-[#15162B] hover:bg-neutral-50'
              }`}
              title="Shapes"
            >
              <Square className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setActiveTool('sticky')}
              className={`p-1.5 rounded-lg border-2 transition-all ${
                activeTool === 'sticky'
                  ? 'bg-[#FFDD33] text-[#15162B] border-[#15162B] shadow-[2px_2px_0px_#15162B]'
                  : 'bg-white text-[#15162B] border-[#15162B] hover:bg-neutral-50'
              }`}
              title="Sticky Note"
            >
              <StickyNote className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Canvas Actions (Undo, Redo, Fork) */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            <button
              type="button"
              tabIndex={-1}
              className="p-1.5 rounded-lg border-2 border-[#15162B] bg-white text-[#444654] hover:text-[#15162B] hover:bg-neutral-50 transition-colors"
              title="Undo"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              tabIndex={-1}
              className="p-1.5 rounded-lg border-2 border-[#15162B] bg-white text-[#444654] hover:text-[#15162B] hover:bg-neutral-50 transition-colors"
              title="Redo"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
            <div className="h-4 w-[1px] bg-[#15162B]/20 mx-1 hidden sm:block" />
            <button
              type="button"
              tabIndex={-1}
              className="px-2.5 py-1 text-xs font-display font-bold rounded-lg border-2 border-[#15162B] bg-white hover:bg-[#DCE3FF] text-[#15162B] transition-colors inline-flex items-center gap-1"
              title="Fork your own board"
            >
              <GitFork className="w-3.5 h-3.5 text-[#3355FF]" />
              <span className="hidden xs:inline">Fork</span>
            </button>
          </div>
        </div>
      </div>

      {/* Floating Corner Badges (Positioned cleanly outside main content, no overlap with toolbar or clipping) */}
      <div className="absolute -bottom-1 -left-1 z-30 bg-[#FFDD33] text-[#15162B] border-2 border-[#15162B] font-mono text-xs uppercase tracking-wider font-bold px-3 py-1 rounded-md shadow-[2px_2px_0px_#15162B] -rotate-[3deg]">
        forked by you
      </div>

      <div className="absolute -top-1 right-2 z-30 hidden sm:inline-flex items-center gap-1.5 bg-[#DCE3FF] text-[#15162B] border-2 border-[#15162B] font-mono text-xs font-bold px-3 py-1 rounded-full shadow-[2px_2px_0px_#15162B] rotate-[2deg]">
        <Mic className="w-3.5 h-3.5 text-[#3355FF]" aria-hidden="true" />
        <span>ambient voice</span>
      </div>
    </div>
  );
};
