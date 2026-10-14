import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  GraduationCap,
  Rocket,
  Globe2,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Layers,
  MessageSquare,
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
    items: { label: string; detail: string; tag?: string }[];
    annotation: string;
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
      'Talk through solutions naturally with zero audio lag',
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
        { label: 'Step 1: Parametrize Surface S', detail: 'r(u,v) = ⟨u, v, 1 - u² - v²⟩', tag: 'Verified' },
        { label: 'Step 2: Normal Vector n', detail: '∂r/∂u × ∂r/∂v = ⟨2u, 2v, 1⟩', tag: 'Step Complete' },
        { label: 'Step 3: Evaluate ∬ (∇×F) · dS', detail: 'Boundary circle C with radius R=1', tag: 'In Progress' },
      ],
      annotation: '“Remember to check orientation: upward normal vector matches counterclockwise boundary.”',
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
        { label: 'Client / Next.js SPA', detail: 'Edge TLS Termination & Route Cache', tag: 'Fastly' },
        { label: 'Go Stateless Auth Gateway', detail: 'Token Validation & Rate Limiter', tag: 'p99 < 8ms' },
        { label: 'Distributed Redis Cluster', detail: 'Ephemeral session states & lease sync', tag: 'Cluster OK' },
      ],
      annotation: '“Move token verification to edge worker to cut 24ms round-trip latency on cold requests.”',
      stickyNote: {
        author: 'Elena R.',
        text: 'Action: Alex finalizes proto specs by Thursday sprint sync.',
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
    heading: 'Collaborative retros, design critiques, and team huddles.',
    description:
      'Eliminate silent, disengaged screen shares. In StudySync, every participant has their own active cursor and voice channel, turning presentations into energetic workshops.',
    benefits: [
      'Active participation: everyone draws, highlights, and speaks simultaneously',
      'Works in any modern browser without installing heavy desktop clients',
      'No invite friction: share one link with contractors or clients',
      'Lightweight and battery-friendly, even on low-bandwidth connections',
    ],
    sessionTitle: 'Sprint 42 Retrospective & Design Alignment',
    collaborators: [
      { name: 'Chris W.', color: '#3355FF', role: 'Facilitator' },
      { name: 'Amina L.', color: '#D47500', role: 'Designer' },
      { name: 'Lukas M.', color: '#00AA72', role: 'Eng Lead' },
    ],
    activeVoiceSpeaker: 'Amina L.',
    canvasSnippet: {
      title: 'Retrospective Board',
      items: [
        { label: 'What worked well', detail: 'Design tokens unified typography and spacing', tag: '3 votes' },
        { label: 'What slowed us down', detail: 'Waiting on backend mock endpoints in staging', tag: 'Actionable' },
        { label: 'Ideas for next cycle', detail: 'Pair sketching on StudySync before Jira tickets', tag: 'Adopted' },
      ],
      annotation: '“Agreement: 15-minute quick-draw huddles replacing lengthy RFC comment threads.”',
      stickyNote: {
        author: 'Chris W.',
        text: 'Board link pinned to Slack #eng-announcements.',
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
      className="py-20 md:py-28 bg-[#F7F5EF] border-b-2 border-[#15162B] relative"
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8">
        {/* Section Eyebrow & Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border-2 border-[#15162B] hard-shadow-xs rounded-full text-xs font-mono font-bold text-[#15162B] mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#3355FF]" aria-hidden="true" />
            <span>BUILT FOR COLLABORATIVE PROBLEM SOLVERS</span>
          </div>

          <h2 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl text-[#15162B] tracking-tight leading-[1.15]">
            One shared room for{' '}
            <span className="relative inline-block px-1">
              <span className="relative z-10">every team</span>
              <span
                className="absolute inset-x-0 bottom-1 h-3.5 bg-[#FFDD33] -rotate-1 rounded-sm -z-0"
                aria-hidden="true"
              />
            </span>
          </h2>

          <p className="mt-4 text-base sm:text-lg text-[#444654] leading-relaxed">
            Whether you are deriving formulas, architecting microservices, or running a sprint retro,
            StudySync brings your voice and sketches into the same room.
          </p>
        </div>

        {/* Audience Selector Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
          {(Object.keys(AUDIENCE_DATA) as AudienceType[]).map((tabKey) => {
            const item = AUDIENCE_DATA[tabKey];
            const Icon = item.icon;
            const isSelected = activeTab === tabKey;

            return (
              <button
                key={tabKey}
                onClick={() => setActiveTab(tabKey)}
                className={`flex items-center gap-2.5 px-5 py-3 rounded-xl border-2 border-[#15162B] text-sm font-display font-bold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3355FF] ${
                  isSelected
                    ? 'bg-[#15162B] text-white hard-shadow -translate-y-0.5'
                    : 'bg-white text-[#15162B] hover:bg-[#F2EFE6] hard-shadow-xs'
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${isSelected ? 'text-[#FFDD33]' : 'text-[#3355FF]'}`}
                  aria-hidden="true"
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="bg-white border-2 border-[#15162B] hard-shadow-xl rounded-2xl md:rounded-3xl p-6 sm:p-8 md:p-10"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left Column: Narrative & Benefits */}
              <div className="lg:col-span-5 space-y-6">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F7F5EF] border border-[#15162B] rounded-md text-xs font-mono font-bold text-[#3355FF]">
                  <Layers className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{current.badge}</span>
                </div>

                <h3 className="font-display font-bold text-2xl sm:text-3xl text-[#15162B] tracking-tight leading-snug">
                  {current.heading}
                </h3>

                <p className="text-base text-[#444654] leading-relaxed">
                  {current.description}
                </p>

                <div className="space-y-3 pt-2">
                  {current.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-[#E5EDFF] border border-[#3355FF] flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#3355FF]" aria-hidden="true" />
                      </div>
                      <span className="text-sm font-medium text-[#15162B] leading-tight">
                        {benefit}
                      </span>
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

              {/* Right Column: Contextual Interactive Canvas Preview */}
              <div className="lg:col-span-7">
                <div className="bg-[#FAF8F3] border-2 border-[#15162B] rounded-2xl p-5 sm:p-6 hard-shadow relative overflow-hidden">
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
                    {/* Visual Diagram Box */}
                    <div className="bg-white border-2 border-[#15162B] rounded-xl p-4 hard-shadow-sm">
                      <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#15162B]/10">
                        <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#444654]">
                          {current.canvasSnippet.title}
                        </span>
                        <span className="text-[11px] font-mono text-[#00AA72] bg-[#E8F8F1] px-2 py-0.5 rounded border border-[#00AA72]/20 font-bold">
                          Live Sync
                        </span>
                      </div>

                      <div className="space-y-2.5">
                        {current.canvasSnippet.items.map((it, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2.5 bg-[#F7F5EF] rounded-lg border border-[#15162B]/10 text-xs"
                          >
                            <div className="space-y-0.5">
                              <span className="font-display font-bold text-[#15162B] block">
                                {it.label}
                              </span>
                              <span className="font-mono text-[#444654]">
                                {it.detail}
                              </span>
                            </div>
                            {it.tag && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white border border-[#15162B]/15 text-[#15162B]">
                                {it.tag}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Annotation callout & Tilted Sticky Note */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start pt-1">
                      {/* Teacher / Lead Quote Callout */}
                      <div className="sm:col-span-7 bg-[#EBF3FF] border border-[#3355FF]/40 rounded-xl p-3 text-xs text-[#15162B]">
                        <div className="flex items-center gap-1.5 font-bold text-[#3355FF] mb-1">
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Voice Note</span>
                        </div>
                        <p className="italic text-[#15162B] leading-relaxed">
                          {current.canvasSnippet.annotation}
                        </p>
                      </div>

                      {/* Sticky Note */}
                      <div
                        className="sm:col-span-5 p-3 rounded-lg border-2 border-[#15162B] hard-shadow-sm rotate-1 text-xs text-[#15162B] leading-snug"
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
