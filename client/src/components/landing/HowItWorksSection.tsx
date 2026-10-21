import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Plus, Copy, Users } from 'lucide-react';

export const HowItWorksSection: React.FC<{ onStartRoom: () => void }> = ({ onStartRoom }) => {
  const shouldReduceMotion = useReducedMotion();

  const steps = [
    {
      number: '01',
      title: 'Create your room in one click',
      tag: 'Host creation',
      description:
        'Hit start to create a room with an infinite whiteboard and built-in voice channel. No calendar invites or software downloads needed.',
      visual: (
        <div className="bg-white border-2 border-[#15162B] hard-shadow-sm rounded-xl p-4" aria-hidden="true">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#15162B]/10 text-xs">
            <span className="font-display font-bold text-[#15162B]">New Session</span>
            <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200">
              host ready
            </span>
          </div>
          <div className="space-y-2">
            <div className="w-full bg-neutral-100 border border-[#15162B] px-3 py-1.5 rounded text-xs font-mono text-[#15162B] flex items-center justify-between">
              <span>sprint-planning</span>
              <Plus className="w-3.5 h-3.5 text-[#3355FF]" />
            </div>
            <button
              type="button"
              tabIndex={-1}
              onClick={onStartRoom}
              className="w-full py-2 bg-[#3355FF] text-white text-xs font-display font-bold rounded border-2 border-[#15162B] hard-shadow-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-transform"
            >
              Start room →
            </button>
          </div>
        </div>
      ),
    },
    {
      number: '02',
      title: 'Share the link with your group',
      tag: 'Zero friction',
      description:
        'Copy the direct link or share your 6-character room code. Teammates join instantly as guests—no mandatory signups, passwords, or credit cards.',
      visual: (
        <div className="bg-white border-2 border-[#15162B] hard-shadow-sm rounded-xl p-4" aria-hidden="true">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#15162B]/10 text-xs">
            <span className="font-display font-bold text-[#15162B]">Shareable Link</span>
            <span className="text-[10px] font-mono bg-[#DCE3FF] text-[#3355FF] px-1.5 py-0.5 rounded border border-[#3355FF]">
              code: m7k-42p
            </span>
          </div>
          <div className="bg-[#F7F5EF] border border-[#15162B] p-2 rounded flex items-center justify-between text-xs font-mono text-[#15162B] mb-2">
            <span className="truncate max-w-[170px]">studyboard.live/room/m7k-42p</span>
            <span className="p-1 rounded bg-white border border-[#15162B] text-[#3355FF]">
              <Copy className="w-3 h-3" />
            </span>
          </div>
          <div className="text-[11px] text-[#444654] flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Guests enter name &amp; join immediately</span>
          </div>
        </div>
      ),
    },
    {
      number: '03',
      title: 'Talk, sketch & solve together',
      tag: 'Live studio',
      description:
        'Speak over clear audio while drawing freehand, organizing architecture diagrams, highlighting uploaded lecture PDFs, or branching private board copies.',
      visual: (
        <div className="bg-white border-2 border-[#15162B] hard-shadow-sm rounded-xl p-4" aria-hidden="true">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#15162B]/10 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-[#15162B]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Voice live</span>
            </div>
            <span className="text-[10px] font-mono bg-[#FFF3C2] text-[#15162B] px-1.5 py-0.5 rounded border border-[#15162B]">
              3 drawing
            </span>
          </div>
          <div className="relative h-18 bg-[#F7F5EF] rounded border border-[#15162B] p-2 flex items-center justify-around overflow-hidden">
            <div className="text-center">
              <span className="px-2 py-1 bg-white border border-[#15162B] rounded text-[10px] font-bold block hard-shadow-sm">
                System flow
              </span>
            </div>
            <svg className="w-12 h-6 text-[#3355FF]" viewBox="0 0 60 20" fill="none">
              <path d="M 5 10 Q 30 0 55 10" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3" />
              <polygon points="55,7 60,10 55,13" fill="currentColor" />
            </svg>
            <div className="text-center">
              <span className="px-2 py-1 bg-[#DCE3FF] border border-[#15162B] rounded text-[10px] font-bold block hard-shadow-sm">
                Active fork
              </span>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-[#F7F5EF] border-t-2 border-[#15162B] scroll-mt-[72px]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DCE3FF] border-2 border-[#15162B] text-xs font-mono uppercase tracking-wider font-bold text-[#3355FF] mb-3">
            How It Works
          </span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-[#15162B] tracking-tight [text-wrap:balance]">
            From empty idea to shared workspace in 3 steps
          </h2>
          <p className="text-base sm:text-lg text-[#444654] mt-4 leading-relaxed font-normal">
            No complex setup or software installations. Start a room, send the link, and immediately think out loud together.
          </p>
        </div>

        {/* 3 Steps Grid: Unified divider line and mock height */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative items-stretch">
          {steps.map((step) => (
            <motion.div
              key={step.number}
              whileHover={shouldReduceMotion ? {} : { y: -4 }}
              className="bg-white border-2 border-[#15162B] hard-shadow-lg rounded-2xl p-6 sm:p-7 flex flex-col justify-between h-full relative"
            >
              {/* Top Section */}
              <div>
                {/* Step number badge & tag */}
                <div className="flex items-center justify-between mb-5">
                  <span className="w-9 h-9 rounded-xl bg-[#FFDD33] border-2 border-[#15162B] hard-shadow-sm flex items-center justify-center font-display font-black text-sm text-[#15162B]">
                    {step.number}
                  </span>
                  <span className="font-mono text-xs uppercase tracking-wider font-bold text-[#444654] bg-[#F7F5EF] px-2.5 py-1 rounded border border-[#15162B]/20">
                    {step.tag}
                  </span>
                </div>

                {/* Title & Description with balanced height */}
                <div className="min-h-[125px] sm:min-h-[135px]">
                  <h3 className="font-display font-bold text-xl text-[#15162B] mb-2.5 tracking-tight [text-wrap:balance]">
                    {step.title}
                  </h3>
                  <p className="text-sm text-[#444654] leading-relaxed font-normal">
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Interface Visual (Aligned at the exact same horizontal position across all cards) */}
              <div className="mt-4 pt-4 border-t-2 border-[#15162B]/10">
                {step.visual}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
