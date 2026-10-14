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
  const [activeTool, setActiveTool] = useState<'select' | 'pen' | 'highlighter' | 'shapes' | 'sticky'>('pen');
  const [isSimulatingAudio, setIsSimulatingAudio] = useState(true);
  const [activeTab, setActiveTab] = useState<'architecture' | 'wireframe'>('architecture');

  // Automatic gentle pulse for audio activity
  useEffect(() => {
    const interval = setInterval(() => {
      setIsSimulatingAudio((prev) => !prev);
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full max-w-2xl mx-auto lg:max-w-none">
      {/* Outer hard shadow layer */}
      <div className="relative bg-white border-2 border-[#15162B] hard-shadow-xl rounded-2xl overflow-hidden shadow-2xl transition-all duration-300">
        {/* Top Window Bar */}
        <div className="bg-[#F7F5EF] border-b-2 border-[#15162B] px-4 py-3 flex items-center justify-between select-none">
          {/* Traffic Lights & Room Name */}
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
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#DCE3FF] text-[#3355FF] border border-[#3355FF]/30">
                #sync-49
              </span>
            </div>
          </div>

          {/* Right Status Indicators: Audio Pulse & Participant Pill */}
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

            {/* Room Participant Counter */}
            <div className="hidden sm:flex items-center -space-x-1.5 pl-1" title="Active collaborators">
              <div className="w-6 h-6 rounded-full bg-[#3355FF] text-white flex items-center justify-center font-bold text-[10px] border border-[#15162B] shadow-xs">
                S
              </div>
              <div className="w-6 h-6 rounded-full bg-[#FF5B4C] text-white flex items-center justify-center font-bold text-[10px] border border-[#15162B] shadow-xs">
                J
              </div>
              <div className="w-6 h-6 rounded-full bg-[#FFDD33] text-[#15162B] flex items-center justify-center font-bold text-[10px] border border-[#15162B] shadow-xs">
                A
              </div>
              <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-[9px] border border-[#15162B] shadow-xs">
                +1
              </div>
            </div>
          </div>
        </div>

        {/* Main Workspace Canvas Viewport */}
        <div className="relative h-[360px] sm:h-[420px] bg-[#F7F5EF] overflow-hidden p-4 sm:p-6 flex flex-col justify-between select-none">
          {/* Subtle Grid Pattern Background */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#15162B 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
            aria-hidden="true"
          />

          {/* Active Collaborators Bar (Top Inside Canvas) */}
          <div className="relative z-10 flex items-center justify-between">
            {/* Host active indicator pill */}
            <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-lg border-2 border-[#15162B] hard-shadow-sm text-xs font-medium">
              <div className="relative">
                <span className="w-6 h-6 rounded-full bg-[#3355FF] text-white font-bold text-[10px] flex items-center justify-center">
                  S
                </span>
                <Crown
                  className="w-3 h-3 text-[#FFDD33] fill-[#FFDD33] absolute -top-1.5 -right-1.5 drop-shadow-xs"
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
                <div className="text-[10px] text-[#444654]">speaking · drawing architecture</div>
              </div>
            </div>

            {/* View Mode switcher */}
            <div className="hidden sm:flex items-center gap-1 bg-white border-2 border-[#15162B] hard-shadow-sm rounded-lg p-0.5 text-xs font-bold font-display">
              <button
                type="button"
                onClick={() => setActiveTab('architecture')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  activeTab === 'architecture' ? 'bg-[#3355FF] text-white' : 'text-[#15162B] hover:bg-[#F7F5EF]'
                }`}
              >
                Architecture
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('wireframe')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  activeTab === 'wireframe' ? 'bg-[#3355FF] text-white' : 'text-[#15162B] hover:bg-[#F7F5EF]'
                }`}
              >
                Checklist
              </button>
            </div>
          </div>

          {/* Interactive Collaborative Diagram Center */}
          <div className="relative z-10 my-auto">
            {activeTab === 'architecture' ? (
              <div className="grid grid-cols-3 gap-3 sm:gap-6 items-center max-w-lg mx-auto">
                {/* Node 1: Client Application */}
                <motion.div
                  whileHover={shouldReduceMotion ? {} : { y: -2 }}
                  className="bg-white border-2 border-[#15162B] hard-shadow rounded-xl p-3 sm:p-4 text-center"
                >
                  <span className="font-mono text-[10px] uppercase font-bold text-[#3355FF] block mb-0.5">
                    Frontend
                  </span>
                  <span className="font-display font-bold text-xs sm:text-sm text-[#15162B] block">
                    Client App
                  </span>
                  <span className="text-[10px] text-[#444654] block mt-1">
                    Vite · React 18
                  </span>
                </motion.div>

                {/* Flow Connector Arrow with Hand-drawn Aesthetic */}
                <div className="flex flex-col items-center justify-center relative">
                  <svg className="w-full h-8 text-[#3355FF]" viewBox="0 0 100 24" fill="none" aria-hidden="true">
                    <path
                      d="M 5 12 C 35 4, 65 20, 95 12"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeDasharray="4 4"
                    />
                    <polygon points="95,8 100,12 95,16" fill="currentColor" />
                  </svg>
                  <span className="text-[9px] font-mono font-bold text-[#15162B] bg-[#FFF3C2] px-1.5 py-0.5 rounded border border-[#15162B] -mt-1">
                    实时同步
                  </span>
                </div>

                {/* Node 2: Realtime Engine */}
                <motion.div
                  whileHover={shouldReduceMotion ? {} : { y: -2 }}
                  className="bg-[#DCE3FF] border-2 border-[#15162B] hard-shadow rounded-xl p-3 sm:p-4 text-center"
                >
                  <span className="font-mono text-[10px] uppercase font-bold text-[#15162B] block mb-0.5">
                    Unified Room
                  </span>
                  <span className="font-display font-bold text-xs sm:text-sm text-[#15162B] block">
                    Voice + Board
                  </span>
                  <span className="text-[10px] text-[#444654] block mt-1">
                    Single Room Link
                  </span>
                </motion.div>
              </div>
            ) : (
              /* Alternative View: Real Collaborative Notes */
              <div className="max-w-md mx-auto bg-white border-2 border-[#15162B] hard-shadow rounded-xl p-4 sm:p-5">
                <div className="flex items-center justify-between mb-3 border-b pb-2 border-[#15162B]/10">
                  <span className="font-display font-bold text-sm text-[#15162B]">
                    Sprint Review Objectives
                  </span>
                  <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                    3 of 3 ready
                  </span>
                </div>
                <div className="space-y-2 text-xs font-medium text-[#15162B]">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Multiplayer infinite canvas drawing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Realtime WebRTC voice room without separate tabs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Instant guest join links for external reviewers</span>
                  </div>
                </div>
              </div>
            )}

            {/* Hand-drawn Circular Annotation Highlight around the Engine */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 sm:w-64 h-24 border-2 border-[#FF5B4C] border-dashed rounded-full pointer-events-none opacity-60 -rotate-2" />
          </div>

          {/* Sticky Note: Q3 Launch Checklist */}
          <motion.div
            initial={shouldReduceMotion ? false : { rotate: -3 }}
            animate={shouldReduceMotion ? {} : { rotate: [-3, -1.5, -3] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-14 right-4 sm:right-8 bg-[#FFF3C2] border-2 border-[#15162B] hard-shadow-sm rounded-lg p-3 max-w-[160px] sm:max-w-[180px] z-20"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-[#15162B] mx-auto mb-1.5" aria-hidden="true" />
            <p className="font-display font-bold text-xs text-[#15162B] leading-tight mb-1">
              Q3 Roadmap 📌
            </p>
            <ul className="text-[11px] text-[#444654] space-y-0.5 leading-snug">
              <li>• System diagram ✓</li>
              <li>• Exam review notes ✓</li>
              <li>• PDF slide markups</li>
            </ul>
          </motion.div>

          {/* Live Collaborator Cursor 1: Jordan (Red) */}
          <motion.div
            initial={shouldReduceMotion ? false : { x: 30, y: 140 }}
            animate={
              shouldReduceMotion
                ? {}
                : {
                    x: [30, 80, 50, 30],
                    y: [140, 110, 160, 140],
                  }
            }
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute z-30 pointer-events-none flex items-center gap-1"
          >
            <MousePointer className="w-4 h-4 text-[#FF5B4C] fill-[#FF5B4C] drop-shadow-xs" />
            <span className="text-[10px] font-mono font-bold bg-[#FF5B4C] text-white px-1.5 py-0.5 rounded shadow-xs border border-[#15162B]">
              Jordan
            </span>
          </motion.div>

          {/* Live Collaborator Cursor 2: Alex (Yellow) */}
          <motion.div
            initial={shouldReduceMotion ? false : { x: 280, y: 190 }}
            animate={
              shouldReduceMotion
                ? {}
                : {
                    x: [280, 320, 260, 280],
                    y: [190, 220, 180, 190],
                  }
            }
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="absolute z-30 pointer-events-none hidden sm:flex items-center gap-1"
          >
            <MousePointer className="w-4 h-4 text-[#FFDD33] fill-[#FFDD33] drop-shadow-xs" />
            <span className="text-[10px] font-mono font-bold bg-[#FFDD33] text-[#15162B] px-1.5 py-0.5 rounded shadow-xs border border-[#15162B]">
              Alex
            </span>
          </motion.div>

          {/* Canvas Bottom Control Strip */}
          <div className="relative z-20 flex items-center justify-between text-xs font-mono pt-2 border-t border-[#15162B]/10">
            {/* Upload file badge (bottom-left) */}
            <div className="flex items-center gap-1.5 text-[11px] text-[#444654] bg-white px-2 py-1 rounded border border-[#15162B]">
              <Paperclip className="w-3 h-3 text-[#3355FF]" aria-hidden="true" />
              <span>slides-w4.pdf (4 pages)</span>
            </div>

            {/* Zoom controls (bottom-right) */}
            <div className="flex items-center gap-1 text-[11px] text-[#15162B] bg-white px-2 py-0.5 rounded border border-[#15162B]">
              <ZoomOut className="w-3 h-3 text-[#444654]" aria-hidden="true" />
              <span className="font-bold">100%</span>
              <ZoomIn className="w-3 h-3 text-[#444654]" aria-hidden="true" />
            </div>
          </div>
        </div>

        {/* Realistic Floating Studio Toolbar (faithful to client WhiteboardToolbar.tsx) */}
        <div className="bg-[#F7F5EF] border-t-2 border-[#15162B] px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveTool('select')}
              className={`p-1.5 rounded-lg border-2 transition-all ${
                activeTool === 'select'
                  ? 'bg-[#3355FF] text-white border-[#15162B] hard-shadow-sm'
                  : 'bg-white text-[#15162B] border-[#15162B] hover:bg-neutral-50'
              }`}
              title="Select tool"
            >
              <MousePointer className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setActiveTool('pen')}
              className={`p-1.5 rounded-lg border-2 transition-all ${
                activeTool === 'pen'
                  ? 'bg-[#3355FF] text-white border-[#15162B] hard-shadow-sm'
                  : 'bg-white text-[#15162B] border-[#15162B] hover:bg-neutral-50'
              }`}
              title="Freehand pen"
            >
              <PenTool className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setActiveTool('highlighter')}
              className={`p-1.5 rounded-lg border-2 transition-all ${
                activeTool === 'highlighter'
                  ? 'bg-[#FFDD33] text-[#15162B] border-[#15162B] hard-shadow-sm'
                  : 'bg-white text-[#15162B] border-[#15162B] hover:bg-neutral-50'
              }`}
              title="Highlighter"
            >
              <Highlighter className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setActiveTool('shapes')}
              className={`p-1.5 rounded-lg border-2 transition-all ${
                activeTool === 'shapes'
                  ? 'bg-[#3355FF] text-white border-[#15162B] hard-shadow-sm'
                  : 'bg-white text-[#15162B] border-[#15162B] hover:bg-neutral-50'
              }`}
              title="Shapes"
            >
              <Square className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setActiveTool('sticky')}
              className={`p-1.5 rounded-lg border-2 transition-all ${
                activeTool === 'sticky'
                  ? 'bg-[#FFDD33] text-[#15162B] border-[#15162B] hard-shadow-sm'
                  : 'bg-white text-[#15162B] border-[#15162B] hover:bg-neutral-50'
              }`}
              title="Sticky Note"
            >
              <StickyNote className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Action buttons (Undo, Redo, Fork) */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              className="p-1.5 rounded-lg border-2 border-[#15162B] bg-white text-[#444654] hover:text-[#15162B] hover:bg-neutral-50 transition-colors"
              title="Undo"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              className="p-1.5 rounded-lg border-2 border-[#15162B] bg-white text-[#444654] hover:text-[#15162B] hover:bg-neutral-50 transition-colors"
              title="Redo"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
            <div className="h-4 w-[1px] bg-[#15162B]/20 mx-1 hidden sm:block" />
            <button
              type="button"
              className="px-2.5 py-1 text-xs font-display font-bold rounded-lg border-2 border-[#15162B] bg-white hover:bg-[#DCE3FF] text-[#15162B] transition-colors inline-flex items-center gap-1"
              title="Fork your own board"
            >
              <GitFork className="w-3.5 h-3.5 text-[#3355FF]" />
              <span className="hidden xs:inline">Fork</span>
            </button>
          </div>
        </div>
      </div>

      {/* Floating Corner Badges (Positioned cleanly outside main content) */}
      <div className="absolute -bottom-3 -left-3 z-30 bg-[#FFDD33] text-[#15162B] border-2 border-[#15162B] font-mono text-xs uppercase tracking-wider font-bold px-3 py-1 rounded-md hard-shadow-sm -rotate-[4deg]">
        forked by you
      </div>

      <div className="absolute -top-3 -right-2 z-30 hidden sm:inline-flex items-center gap-1 bg-[#DCE3FF] text-[#15162B] border-2 border-[#15162B] font-mono text-[11px] font-bold px-2.5 py-0.5 rounded-full hard-shadow-sm rotate-[3deg]">
        <Mic className="w-3 h-3 text-[#3355FF]" aria-hidden="true" />
        <span>ambient voice</span>
      </div>
    </div>
  );
};
