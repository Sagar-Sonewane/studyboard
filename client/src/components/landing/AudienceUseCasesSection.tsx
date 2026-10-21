import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  GraduationCap,
  Rocket,
  Globe2,
  CheckCircle2,
  ArrowRight,
  MousePointer,
} from 'lucide-react';

type AudienceType = 'study' | 'startups' | 'remote';

interface AudienceContent {
  id: AudienceType;
  label: string;
  tagline: string;
  badge: string;
  icon: React.ElementType;
  heading: string;
  description: string;
  benefits: string[];
  sessionTitle: string;
  collaborators: { name: string; color: string; role: string }[];
  activeVoiceSpeaker: string;
  canvasSnippet: {
    title: string;
    items: { label: string; detail: string }[];
    stickyNote: { author: string; text: string; color: string };
  };
}

const AUDIENCE_DATA: Record<AudienceType, AudienceContent> = {
  study: {
    id: 'study',
    label: 'Study Groups & Tutors',
    tagline: 'Work through complex proofs, code, and problem sets together.',
    badge: 'Academics & Tutoring',
    icon: GraduationCap,
    heading: 'Step-by-step problem solving with live voice explanation.',
    description:
      'Students and tutors talk through challenging homework, annotate lecture slides, and work through formulas simultaneously on an infinite workspace without awkward screen sharing.',
    benefits: [
      'Write formulas and annotate problem sets with stylus or mouse',
      'Talk through solutions naturally with instant voice',
      'Students fork their own copy to keep notes before the room closes',
      'Guests join with a single click—no accounts needed for study buddies',
    ],
    sessionTitle: 'Calculus III — Vector Fields & Stokes Theorem',
    collaborators: [
      { name: 'Prof. Miller', color: '#3355FF', role: 'Tutor / Host' },
      { name: 'Maya S.', color: '#00AA72', role: 'Student' },
      { name: 'Devon K.', color: '#D47500', role: 'Student' },
    ],
    activeVoiceSpeaker: 'Prof. Miller',
    canvasSnippet: {
      title: 'Problem #4: Surface Integral Proof',
      items: [
        { label: 'Step 1: Parametrize Surface S', detail: 'r(u,v) = ⟨u, v, 1 - u² - v²⟩' },
        { label: 'Step 2: Normal Vector n', detail: '∂r/∂u × ∂r/∂v = ⟨2u, 2v, 1⟩' },
        { label: 'Step 3: Evaluate ∬ (∇×F) · dS', detail: 'Boundary circle C with radius R=1' },
      ],
      stickyNote: {
        author: 'Maya S.',
        text: 'Does this apply if the surface has open boundaries at z=0?',
        color: '#FFF275',
      },
    },
  },
  startups: {
    id: 'startups',
    label: 'Startups & Builders',
    tagline: 'Map architectures, plan sprints, and review systems fast.',
    badge: 'Product & Engineering',
    icon: Rocket,
    heading: 'Sprint planning and system design without switching apps.',
    description:
      'Map backend microservices, sketch UX flows, and align technical direction in high-bandwidth sessions. One room holds your voice call and whiteboard notes in sync.',
    benefits: [
      'Draw architecture diagrams, sequence flows, and wireframes together',
      'Zero setup overhead: spin up a room instantly during ad-hoc huddles',
      'Team members can copy or fork the board directly into sprint docs',
      'Never lose context toggling between call windows and browser tabs',
    ],
    sessionTitle: 'Q3 Auth Gateway & Session Store Architecture',
    collaborators: [
      { name: 'Alex P.', color: '#3355FF', role: 'Staff Eng' },
      { name: 'Elena R.', color: '#9B51E0', role: 'Product Lead' },
      { name: 'Sam T.', color: '#00AA72', role: 'Frontend' },
    ],
    activeVoiceSpeaker: 'Alex P.',
    canvasSnippet: {
      title: 'Edge Gateway Topology',
      items: [
        { label: 'Client / Next.js SPA', detail: 'Edge TLS Termination & Route Cache' },
        { label: 'Go Stateless Auth Gateway', detail: 'Token Validation & Rate Limiter' },
        { label: 'Distributed Redis Cluster', detail: 'Ephemeral session states & lease sync' },
      ],
      stickyNote: {
        author: 'Elena R.',
        text: 'Action: Alex finalizes proto spec by Thursday sprint sync.',
        color: '#B5E2FA',
      },
    },
  },
  remote: {
    id: 'remote',
    label: 'Remote & Distributed Teams',
    tagline: 'Async or real-time workshops across time zones.',
    badge: 'Distributed Workspaces',
    icon: Globe2,
    heading: 'Collaborative sketching, design critiques, and team huddles.',
    description:
      'Eliminate silent, disengaged screen shares. In StudySync, every participant has their own active cursor and voice channel, turning presentations into energetic workshops.',
    benefits: [
      'Active participation: everyone draws, highlights, and speaks simultaneously',
      'Works in any modern browser without installing heavy desktop clients',
      'No invite friction: share one link with contractors or clients',
      'Lightweight and responsive, even on low-bandwidth connections',
    ],
    sessionTitle: 'UX Flow & Interaction Sketching',
    collaborators: [
      { name: 'Chris W.', color: '#3355FF', role: 'Facilitator' },
      { name: 'Amina L.', color: '#D47500', role: 'Designer' },
      { name: 'Lukas M.', color: '#00AA72', role: 'Eng Lead' },
    ],
    activeVoiceSpeaker: 'Amina L.',
    canvasSnippet: {
      title: 'Whiteboard Sketch & Flow Map',
      items: [
        { label: 'Step 1: Invite Link', detail: 'Guest opens room in browser instantly' },
        { label: 'Step 2: Shared Canvas', detail: 'Live sketching and idea mapping' },
        { label: 'Step 3: Action Items', detail: 'Notes pinned with sticky comments' },
      ],
      stickyNote: {
        author: 'Amina L.',
        text: 'Agreement: 15-minute quick-draw huddles replacing lengthy spec comment threads.',
        color: '#FFDAC1',
      },
    },
  },
};

export const AudienceUseCasesSection: React.FC<{
  onStartRoom: () => void;
}> = ({ onStartRoom }) => {
  const [activeTab, setActiveTab] = useState<AudienceType>('study');
  const current = AUDIENCE_DATA[activeTab];

  return (
    <section
      id="who-its-for"
      className="py-20 md:py-28 bg-[#F7F5EF] border-t-2 border-[#15162B] relative scroll-mt-[72px]"
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 md:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white border-2 border-[#15162B] hard-shadow-xs rounded-full text-xs font-mono font-bold text-[#15162B] mb-4">
            <Globe2 className="w-3.5 h-3.5 text-[#3355FF]" aria-hidden="true" />
            <span>BUILT FOR COLLABORATION</span>
          </div>

          <h2 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl text-[#15162B] tracking-tight leading-[1.15] [text-wrap:balance]">
            One shared room for{' '}
            <span className="relative inline-block px-1">
              <span className="relative z-10">any kind of group.</span>
              <span
                className="absolute inset-x-0 bottom-1 h-3.5 bg-[#FFDD33] -rotate-1 rounded-sm -z-0"
                aria-hidden="true"
              />
            </span>
          </h2>

          <p className="mt-4 text-base sm:text-lg text-[#444654] leading-relaxed">
            Whether preparing for midterms, diagramming cloud infrastructure, or running a sprint retrospective, StudySync keeps conversation and sketches aligned.
          </p>
        </div>

        {/* Tab Selection Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-12">
          {(Object.keys(AUDIENCE_DATA) as AudienceType[]).map((tabKey) => {
            const tab = AUDIENCE_DATA[tabKey];
            const Icon = tab.icon;
            const isActive = activeTab === tabKey;

            return (
              <button
                key={tabKey}
                onClick={() => setActiveTab(tabKey)}
                className={`w-full sm:w-auto px-5 py-3 rounded-xl border-2 border-[#15162B] font-display font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#3355FF] text-white hard-shadow -translate-y-0.5'
                    : 'bg-white text-[#15162B] hover:bg-[#FAF8F3] hard-shadow-xs'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#FFDD33]' : 'text-[#3355FF]'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Interactive Tab Content Display */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="bg-white border-2 border-[#15162B] rounded-2xl md:rounded-3xl p-6 sm:p-8 md:p-10 hard-shadow-lg"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left Column: Narrative & Specific Benefits */}
              <div className="lg:col-span-5 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#FFF9D6] border border-[#15162B] text-xs font-mono font-bold text-[#15162B]">
                  <span>{current.badge}</span>
                </div>

                <h3 className="font-display font-bold text-2xl sm:text-3xl text-[#15162B] tracking-tight leading-snug [text-wrap:balance]">
                  {current.heading}
                </h3>

                <p className="text-sm sm:text-base text-[#444654] leading-relaxed">
                  {current.description}
                </p>

                <div className="space-y-3 pt-2">
                  {current.benefits.map((b, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#15162B]">
                      <CheckCircle2 className="w-4 h-4 text-[#00AA72] shrink-0 mt-0.5" />
                      <span className="font-medium">{b}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 flex items-center gap-4">
                  <button
                    onClick={onStartRoom}
                    className="min-h-[44px] px-5 py-2.5 bg-[#3355FF] text-white font-display font-bold text-sm rounded-xl border-2 border-[#15162B] hard-shadow hard-shadow-hover inline-flex items-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3355FF]"
                  >
                    <span>Try it with your team</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                  <span className="text-xs text-[#444654] font-mono">
                    Free tier · Up to 5 users
                  </span>
                </div>
              </div>

              {/* Right Column: Contextual Canvas Preview (No fake votes/tags/Voice Note cards) */}
              <div className="lg:col-span-7">
                <div className="bg-[#FAF8F3] border-2 border-[#15162B] rounded-2xl p-5 sm:p-6 hard-shadow relative overflow-hidden" aria-hidden="true">
                  {/* Subtle Grid Canvas Background */}
                  <div
                    className="absolute inset-0 opacity-40 pointer-events-none"
                    style={{
                      backgroundImage:
                        'radial-gradient(circle, #15162B 1px, transparent 1px)',
                      backgroundSize: '20px 20px',
                    }}
                    aria-hidden="true"
                  />

                  {/* Room Chrome / Top Bar */}
                  <div className="relative z-10 flex flex-wrap items-center justify-between pb-4 border-b border-[#15162B]/15 gap-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#00AA72] animate-pulse" />
                      <span className="font-display font-bold text-sm text-[#15162B] truncate max-w-[220px] sm:max-w-xs">
                        {current.sessionTitle}
                      </span>
                    </div>

                    {/* Participant Avatars & Active Voice Pill */}
                    <div className="flex items-center gap-2">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#E5EDFF] border border-[#3355FF] rounded-full text-xs font-mono font-bold text-[#3355FF]">
                        <span className="w-2 h-2 rounded-full bg-[#3355FF] animate-ping" />
                        <span>Speaking: {current.activeVoiceSpeaker}</span>
                      </div>

                      <div className="flex -space-x-1.5 overflow-hidden">
                        {current.collaborators.map((c, i) => (
                          <div
                            key={i}
                            className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white shadow-xs"
                            style={{ backgroundColor: c.color }}
                            title={`${c.name} (${c.role})`}
                          >
                            {c.name.charAt(0)}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Main Canvas Body Snippet */}
                  <div className="relative z-10 mt-5 space-y-4">
                    {activeTab === 'remote' ? (
                      /* Freehand Whiteboard Sketching Scene for Remote Teams */
                      <div className="space-y-4">
                        <div className="bg-white border-2 border-[#15162B] rounded-xl p-4 hard-shadow-sm relative min-h-[160px]">
                          <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#15162B]/10">
                            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#444654]">
                              {current.canvasSnippet.title}
                            </span>
                            <span className="text-[11px] font-mono text-[#3355FF] bg-[#E5EDFF] px-2 py-0.5 rounded border border-[#3355FF]/30 font-bold">
                              Multiplayer Canvas
                            </span>
                          </div>

                          {/* Freehand Flow Diagram with Arrows */}
                          <div className="grid grid-cols-3 gap-2 sm:gap-3 items-center pt-2">
                            <div className="bg-[#FAF8F3] border-2 border-[#15162B] rounded-lg p-2.5 text-center shadow-[2px_2px_0px_#15162B]">
                              <span className="text-xs font-display font-bold text-[#15162B] block">
                                1. Voice In
                              </span>
                              <span className="text-[11px] text-[#444654] block mt-0.5">
                                Single click link
                              </span>
                            </div>

                            <div className="flex flex-col items-center justify-center text-[#3355FF]">
                              <svg className="w-full h-5" viewBox="0 0 60 16" fill="none">
                                <path d="M 5 8 Q 30 2 52 8" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3" />
                                <polygon points="52,5 57,8 52,11" fill="currentColor" />
                              </svg>
                              <span className="text-[10px] font-mono font-bold text-[#15162B] -mt-1">draw</span>
                            </div>

                            <div className="bg-[#FAF8F3] border-2 border-[#15162B] rounded-lg p-2.5 text-center shadow-[2px_2px_0px_#15162B]">
                              <span className="text-xs font-display font-bold text-[#15162B] block">
                                2. Shared Board
                              </span>
                              <span className="text-[11px] text-[#444654] block mt-0.5">
                                Realtime sketch
                              </span>
                            </div>
                          </div>

                          {/* Live Collaborator Cursors in Sketch Area */}
                          <div className="absolute top-10 right-8 flex items-center gap-1 pointer-events-none">
                            <MousePointer className="w-3.5 h-3.5 text-[#D47500] fill-[#D47500]" />
                            <span className="text-[10px] font-mono font-bold bg-[#D47500] text-white px-1 py-0.2 rounded">
                              Amina
                            </span>
                          </div>
                        </div>

                        {/* Sticky Note for Remote Teams */}
                        <div
                          className="p-3 rounded-lg border-2 border-[#15162B] hard-shadow-sm rotate-1 text-xs text-[#15162B] leading-snug"
                          style={{ backgroundColor: current.canvasSnippet.stickyNote.color }}
                        >
                          <div className="font-mono text-[10px] font-bold text-[#15162B]/70 pb-1 mb-1 border-b border-[#15162B]/10">
                            {current.canvasSnippet.stickyNote.author}
                          </div>
                          <p className="font-medium">
                            {current.canvasSnippet.stickyNote.text}
                          </p>
                        </div>
                      </div>
                    ) : (
                      /* Standard Diagram View for Study Groups and Startups (No votes or false tags) */
                      <div className="space-y-4">
                        <div className="bg-white border-2 border-[#15162B] rounded-xl p-4 hard-shadow-sm">
                          <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#15162B]/10">
                            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#444654]">
                              {current.canvasSnippet.title}
                            </span>
                          </div>

                          <div className="space-y-2.5">
                            {current.canvasSnippet.items.map((it, idx) => (
                              <div
                                key={idx}
                                className="p-2.5 bg-[#F7F5EF] rounded-lg border border-[#15162B]/10 text-xs"
                              >
                                <span className="font-display font-bold text-[#15162B] block">
                                  {it.label}
                                </span>
                                <span className="font-mono text-[#444654]">
                                  {it.detail}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Sticky Note */}
                        <div
                          className="p-3 rounded-lg border-2 border-[#15162B] hard-shadow-sm rotate-1 text-xs text-[#15162B] leading-snug"
                          style={{ backgroundColor: current.canvasSnippet.stickyNote.color }}
                        >
                          <div className="font-mono text-[10px] font-bold text-[#15162B]/70 pb-1 mb-1 border-b border-[#15162B]/10">
                            {current.canvasSnippet.stickyNote.author}
                          </div>
                          <p className="font-medium">
                            {current.canvasSnippet.stickyNote.text}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};
