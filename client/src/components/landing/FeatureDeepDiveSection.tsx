import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Mic,
  GitFork,
  FileText,
  Volume2,
  Eye,
  EyeOff,
  CheckCircle2,
  Crown,
} from 'lucide-react';

export const FeatureDeepDiveSection: React.FC = () => {
  const [annotationsVisible, setAnnotationsVisible] = useState(true);
  const [activeBoardView, setActiveBoardView] = useState<'shared' | 'forked'>('forked');

  return (
    <section id="features" className="py-20 md:py-28 bg-white border-t-2 border-[#15162B] scroll-mt-[72px]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF3C2] border-2 border-[#15162B] text-xs font-mono uppercase tracking-wider font-bold text-[#15162B] mb-3">
            Core Capabilities
          </span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-[#15162B] tracking-tight [text-wrap:balance]">
            Designed for how groups actually solve problems
          </h2>
          <p className="text-base sm:text-lg text-[#444654] mt-4 leading-relaxed font-normal">
            Every feature in StudySync removes collaborative friction: talking while sketching,
            exploring ideas without cluttering the shared board, and marking up documents non&#8209;destructively.
          </p>
        </div>

        {/* Feature 1: Talk while you draw */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center mb-24 pb-20 border-b-2 border-[#15162B]/10">
          <div className="lg:col-span-6 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#DCE3FF] border border-[#3355FF]/40 text-xs font-mono font-bold text-[#3355FF]">
              <Mic className="w-3.5 h-3.5" />
              <span>Voice + Canvas Integration</span>
            </div>
            <h3 className="font-display font-bold text-2xl sm:text-3xl text-[#15162B] tracking-tight [text-wrap:balance]">
              Talk naturally while you draw — no second call app
            </h3>
            <p className="text-base text-[#444654] leading-relaxed font-normal">
              Forget switching between a video call in one window and an interactive whiteboard in another.
              StudySync builds voice chat directly into every room with live speaker pulses.
            </p>

            <ul className="space-y-2.5 pt-1 text-sm text-[#15162B] font-medium">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#3355FF] shrink-0 mt-0.5" />
                <span>Active speaker indicators on participant avatars</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#3355FF] shrink-0 mt-0.5" />
                <span>Voice and board stay in one unified browser tab</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#3355FF] shrink-0 mt-0.5" />
                <span>No separate meeting links or software to download</span>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-6">
            <div className="bg-[#F7F5EF] border-2 border-[#15162B] hard-shadow-lg rounded-2xl p-5 sm:p-6 relative" aria-hidden="true">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#15162B]/10 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-emerald-600 animate-pulse" />
                  <span className="font-bold text-[#15162B]">Voice room: 2 connected</span>
                </div>
                <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                  Voice active
                </span>
              </div>

              {/* Mock Participant Rail Preview (Exactly 2 people matching "2 connected") */}
              <div className="bg-white border-2 border-[#15162B] hard-shadow-sm rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-[#3355FF] text-white font-bold text-xs flex items-center justify-center ring-2 ring-emerald-500 ring-offset-2">
                        S
                      </div>
                      <Crown className="w-3.5 h-3.5 text-[#FFDD33] fill-[#FFDD33] absolute -top-1.5 -right-1.5" />
                    </div>
                    <div>
                      <div className="text-xs font-display font-bold text-[#15162B] flex items-center gap-1.5">
                        <span>Sarah (Host)</span>
                        <span className="text-[10px] text-emerald-600 font-mono font-bold">● speaking</span>
                      </div>
                      <div className="text-[10px] text-[#444654]">explaining database schema</div>
                    </div>
                  </div>
                  <Mic className="w-4 h-4 text-emerald-600" />
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-50 border border-neutral-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#FF5B4C] text-white font-bold text-xs flex items-center justify-center">
                      J
                    </div>
                    <div>
                      <div className="text-xs font-display font-bold text-[#15162B]">Jordan</div>
                      <div className="text-[10px] text-[#444654]">drawing system arrows</div>
                    </div>
                  </div>
                  <Mic className="w-4 h-4 text-[#444654]" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 2: Fork your own copy */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center mb-24 pb-20 border-b-2 border-[#15162B]/10">
          <div className="lg:col-span-6 lg:order-2 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#FFF3C2] border border-[#FFDD33] text-xs font-mono font-bold text-[#15162B]">
              <GitFork className="w-3.5 h-3.5 text-[#3355FF]" />
              <span>Independent Branching</span>
            </div>
            <h3 className="font-display font-bold text-2xl sm:text-3xl text-[#15162B] tracking-tight [text-wrap:balance]">
              Fork your own copy to brainstorm without disrupting the group
            </h3>
            <p className="text-base text-[#444654] leading-relaxed font-normal">
              Need a private scratchpad to work through a math proof or draft a separate architecture idea?
              Hit "Fork" to clone the board, sketch freely on your private copy, and switch back anytime.
            </p>

            <ul className="space-y-2.5 pt-1 text-sm text-[#15162B] font-medium">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#3355FF] shrink-0 mt-0.5" />
                <span>Instant private copy with all shapes, drawings, and notes</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#3355FF] shrink-0 mt-0.5" />
                <span>Working context banner showing when you are on your copy</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#3355FF] shrink-0 mt-0.5" />
                <span>One-click toggle between your personal fork and the shared board</span>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-6 lg:order-1">
            <div className="bg-[#F7F5EF] border-2 border-[#15162B] hard-shadow-lg rounded-2xl p-5 sm:p-6 relative" aria-hidden="true">
              {/* Natural Board View Switcher */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#15162B]/10">
                <span className="text-xs font-mono font-bold text-[#15162B]">Canvas view:</span>
                <div className="flex gap-1 bg-white border border-[#15162B] p-0.5 rounded-lg text-xs font-bold font-display">
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setActiveBoardView('shared')}
                    className={`px-3 py-1 rounded transition-colors ${
                      activeBoardView === 'shared' ? 'bg-[#3355FF] text-white' : 'text-[#15162B] hover:bg-neutral-100'
                    }`}
                  >
                    Shared Room
                  </button>
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setActiveBoardView('forked')}
                    className={`px-3 py-1 rounded transition-colors ${
                      activeBoardView === 'forked' ? 'bg-[#FFDD33] text-[#15162B]' : 'text-[#15162B] hover:bg-neutral-100'
                    }`}
                  >
                    Private Fork
                  </button>
                </div>
              </div>

              {/* Visual Preview based on toggle */}
              <div className="bg-white border-2 border-[#15162B] hard-shadow-sm rounded-xl p-5 relative overflow-hidden">
                {activeBoardView === 'forked' ? (
                  <div>
                    {/* Fork Banner Indicator */}
                    <div className="bg-[#FFF3C2] border-2 border-[#15162B] rounded-lg p-2.5 mb-4 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 font-display font-bold text-[#15162B]">
                        <GitFork className="w-4 h-4 text-[#3355FF]" />
                        <span>Working in your private board copy</span>
                      </div>
                      <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-[#15162B]">
                        solo mode
                      </span>
                    </div>

                    <div className="h-36 bg-[#F7F5EF] rounded-lg border border-[#15162B] p-3 flex flex-col justify-between">
                      <div className="flex items-center justify-between text-[11px] font-mono text-[#444654]">
                        <span>• Edits are local only</span>
                        <span>• Shared room unaffected</span>
                      </div>
                      <div className="my-auto text-center">
                        <span className="px-3 py-1.5 bg-white border-2 border-[#15162B] rounded-lg hard-shadow-sm font-display font-bold text-xs inline-block">
                          Alternative Auth Architecture (Draft)
                        </span>
                      </div>
                      <div className="text-[10px] text-right font-mono text-[#3355FF] font-bold">
                        Click "Shared Room" to return ➔
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="bg-[#DCE3FF] border-2 border-[#15162B] rounded-lg p-2.5 mb-4 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 font-display font-bold text-[#15162B]">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Viewing the live shared team board</span>
                      </div>
                      <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-[#15162B]">
                        2 active
                      </span>
                    </div>

                    <div className="h-36 bg-[#F7F5EF] rounded-lg border border-[#15162B] p-3 flex flex-col justify-between">
                      <div className="flex items-center justify-between text-[11px] font-mono text-[#444654]">
                        <span>• Instant live sync</span>
                        <span>• Live collaborator cursors</span>
                      </div>
                      <div className="my-auto text-center">
                        <span className="px-3 py-1.5 bg-white border-2 border-[#15162B] rounded-lg hard-shadow-sm font-display font-bold text-xs inline-block">
                          Primary Production Pipeline
                        </span>
                      </div>
                      <div className="text-[10px] text-right font-mono text-[#444654]">
                        All edits visible to everyone
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Feature 3: Mark up any file */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          <div className="lg:col-span-6 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#FFE3E0] border border-[#FF5B4C]/40 text-xs font-mono font-bold text-[#FF5B4C]">
              <FileText className="w-3.5 h-3.5" />
              <span>Document Annotation</span>
            </div>
            <h3 className="font-display font-bold text-2xl sm:text-3xl text-[#15162B] tracking-tight [text-wrap:balance]">
              Drop PDFs onto the canvas with a non&#8209;destructive markup layer
            </h3>
            <p className="text-base text-[#444654] leading-relaxed font-normal">
              Upload problem sets, lecture slides, or diagrams. Documents render directly into draggable pages on the board,
              with highlighter strokes and notes living on a separate layer you can hide or show anytime.
            </p>

            <ul className="space-y-2.5 pt-1 text-sm text-[#15162B] font-medium">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#3355FF] shrink-0 mt-0.5" />
                <span>Multi-page PDF pages placed directly on the board</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#3355FF] shrink-0 mt-0.5" />
                <span>Independent markup layer toggle to reveal or hide ink strokes</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#3355FF] shrink-0 mt-0.5" />
                <span>Underlying files remain untouched and easily readable</span>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-6">
            <div className="bg-[#F7F5EF] border-2 border-[#15162B] hard-shadow-lg rounded-2xl p-5 sm:p-6 relative" aria-hidden="true">
              {/* Natural Markup Layer Control */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#15162B]/10">
                <span className="text-xs font-mono font-bold text-[#15162B]">Markup layer:</span>
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setAnnotationsVisible(!annotationsVisible)}
                  className="px-3 py-1.5 rounded-lg border-2 border-[#15162B] bg-white hover:bg-neutral-50 text-xs font-display font-bold flex items-center gap-1.5 hard-shadow-sm transition-all"
                >
                  {annotationsVisible ? (
                    <>
                      <Eye className="w-3.5 h-3.5 text-[#3355FF]" />
                      <span>Annotations: ON</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3.5 h-3.5 text-[#FF5B4C]" />
                      <span>Annotations: HIDDEN</span>
                    </>
                  )}
                </button>
              </div>

              {/* Document Mockup with Toggleable Overlay */}
              <div className="bg-white border-2 border-[#15162B] hard-shadow-sm rounded-xl p-5 relative overflow-hidden">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#15162B]/10 text-xs font-mono text-[#444654]">
                  <span>lecture-slide-04.pdf (Page 1 of 4)</span>
                  <span className="bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-300">page 1</span>
                </div>

                <div className="relative p-4 bg-[#FAFAFA] rounded-lg border border-[#15162B]/20 text-sm space-y-2">
                  <div className="font-display font-bold text-[#15162B] text-base">
                    Theorem 4.2: Realtime Conflict Resolution
                  </div>
                  <p className="text-xs text-[#444654] leading-relaxed">
                    Given two concurrent actions executed on independent branches,
                    state stays in sync automatically without conflicts.
                  </p>

                  {/* Highlighter Mark (Toggled independently) */}
                  {annotationsVisible && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-x-3 top-10 h-7 bg-[#FFDD33]/45 -rotate-1 rounded pointer-events-none border-b border-[#FFDD33]"
                    />
                  )}

                  <div className="pt-2 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-[#3355FF] font-bold">• Highlighted by Sarah</span>
                    <span className="text-[#444654]">Source untouched</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
