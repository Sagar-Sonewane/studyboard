import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { XCircle, CheckCircle2 } from 'lucide-react';

export const ProblemSolutionSection: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section id="problem" className="py-20 md:py-28 bg-white border-t-2 border-[#15162B] scroll-mt-[72px]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFE3E0] border-2 border-[#15162B] text-xs font-mono uppercase tracking-wider font-bold text-[#FF5B4C] mb-3">
            01 · The Problem &amp; The Fix
          </span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-[#15162B] tracking-tight">
            Stop wrestling between call tabs and drawing boards
          </h2>
          <p className="text-base sm:text-lg text-[#444654] mt-4 leading-relaxed font-normal">
            Visual thinking grinds to a halt when one person screen-shares while everyone else watches passively.
            StudySync brings ambient voice and an infinite canvas into a single collaborative room.
          </p>
        </div>

        {/* Side-by-Side Comparison Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch max-w-5xl mx-auto">
          {/* Card 1: The Fragmented Old Way */}
          <motion.div
            whileHover={shouldReduceMotion ? {} : { y: -3 }}
            className="bg-[#FAFAFA] border-2 border-[#15162B]/30 rounded-2xl p-6 sm:p-8 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#15162B]/10">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-neutral-200 border border-neutral-400 flex items-center justify-center text-neutral-600 font-bold text-xs">
                    ✕
                  </span>
                  <div>
                    <h3 className="font-display font-bold text-lg text-[#15162B]">
                      The Fragmented Setup
                    </h3>
                    <p className="text-xs text-[#444654]">Separate video calls + separate whiteboards</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-300">
                  Tool fatigue
                </span>
              </div>

              <ul className="space-y-4 text-sm text-[#444654]">
                <li className="flex items-start gap-3">
                  <XCircle className="w-4 h-4 text-[#FF5B4C] shrink-0 mt-0.5" aria-hidden="true" />
                  <span>
                    <strong>Screen-sharing bottlenecks:</strong> Only one person can draw while everyone else watches like an audience.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="w-4 h-4 text-[#FF5B4C] shrink-0 mt-0.5" aria-hidden="true" />
                  <span>
                    <strong>Split-screen context loss:</strong> Juggling meeting links in Slack and boards in another browser tab.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="w-4 h-4 text-[#FF5B4C] shrink-0 mt-0.5" aria-hidden="true" />
                  <span>
                    <strong>Guest onboarding friction:</strong> Teammates or clients forced to create accounts just to view a diagram.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="w-4 h-4 text-[#FF5B4C] shrink-0 mt-0.5" aria-hidden="true" />
                  <span>
                    <strong>Fear of messing up:</strong> No way to test ideas in a private scratchpad without editing the master board.
                  </span>
                </li>
              </ul>
            </div>

            <div className="pt-6 mt-6 border-t border-[#15162B]/10 text-xs font-mono text-neutral-500 flex items-center justify-between">
              <span>Friction score</span>
              <span className="font-bold text-[#FF5B4C]">High context switching</span>
            </div>
          </motion.div>

          {/* Card 2: The StudySync Way */}
          <motion.div
            whileHover={shouldReduceMotion ? {} : { y: -3 }}
            className="bg-[#F7F5EF] border-2 border-[#15162B] hard-shadow-lg rounded-2xl p-6 sm:p-8 flex flex-col justify-between relative"
          >
            {/* Top recommendation pill */}
            <div className="absolute -top-3.5 right-6 bg-[#3355FF] text-white text-xs font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full border-2 border-[#15162B] hard-shadow-sm">
              Unified Workflow
            </div>

            <div>
              <div className="flex items-center justify-between pb-4 mb-6 border-b-2 border-[#15162B]/10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#3355FF] border-2 border-[#15162B] hard-shadow-sm flex items-center justify-center text-white font-bold text-xs">
                    ✓
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg text-[#15162B]">
                      The StudySync Room
                    </h3>
                    <p className="text-xs text-[#444654]">One room link for voice, canvas, and files</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-[#3355FF] bg-[#DCE3FF] px-2 py-0.5 rounded border border-[#3355FF]">
                  Zero setup
                </span>
              </div>

              <ul className="space-y-4 text-sm text-[#15162B]">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#3355FF] shrink-0 mt-0.5" aria-hidden="true" />
                  <span>
                    <strong>True multiplayer collaboration:</strong> Everyone draws, highlights, and speaks simultaneously in real time.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#3355FF] shrink-0 mt-0.5" aria-hidden="true" />
                  <span>
                    <strong>Built-in low-latency voice:</strong> Talk naturally without opening Zoom, Google Meet, or second call links.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#3355FF] shrink-0 mt-0.5" aria-hidden="true" />
                  <span>
                    <strong>Friction-free guest joins:</strong> Collaborators join via link with just a display name—no passwords or credit cards.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#3355FF] shrink-0 mt-0.5" aria-hidden="true" />
                  <span>
                    <strong>Fork your own copy:</strong> Branch the master board into an independent local version to experiment solo.
                  </span>
                </li>
              </ul>
            </div>

            <div className="pt-6 mt-6 border-t-2 border-[#15162B]/10 text-xs font-mono text-[#3355FF] font-bold flex items-center justify-between">
              <span>Result</span>
              <span className="bg-[#DCE3FF] px-2 py-0.5 rounded border border-[#15162B]">One link. Talk &amp; sketch.</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
