import React, { useState } from 'react';
import {
  Mic,
  GitFork,
  FileText,
  Check,
  ArrowRight,
  Sparkles,
  LogOut,
} from 'lucide-react';

interface LandingPageProps {
  onStartRoom: () => void;
  onJoinCode: () => void;
  onLogin: () => void;
  onSignOut?: () => void;
  user?: { email?: string; id?: string } | null;
  displayName?: string | null;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartRoom,
  onJoinCode,
  onLogin,
  onSignOut,
  user,
  displayName,
}) => {
  const [selectedAudience, setSelectedAudience] = useState<'all' | 'startups' | 'remote' | 'study'>('all');

  return (
    <div className="min-h-screen bg-[#F7F5EF] text-[#15162B] selection:bg-[#FFDD33] selection:text-[#15162B] font-sans overflow-x-hidden">
      {/* 1. NAV SECTION */}
      <header className="sticky top-0 z-40 bg-[#F7F5EF]/95 backdrop-blur-md border-b-2 border-[#15162B]">
        <div className="max-w-6xl mx-auto px-6 h-18 flex items-center justify-between">
          {/* Logo Mark + Wordmark */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#3355FF] border-2 border-[#15162B] hard-shadow-sm flex items-center justify-center text-white">
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="9" className="opacity-30" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <span className="font-display font-bold text-2xl text-[#15162B] tracking-tight">
              StudySync
            </span>
          </div>

          {/* Center Links */}
          <nav className="hidden md:flex items-center gap-8 font-display font-medium text-sm text-[#15162B]">
            <a
              href="#who-its-for"
              className="hover:text-[#3355FF] transition-colors"
            >
              For teams
            </a>
            <a
              href="#features"
              className="hover:text-[#3355FF] transition-colors"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="hover:text-[#3355FF] transition-colors"
            >
              Pricing
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-block text-xs font-mono text-[#6B6D7A]">
                  {displayName || user.email}
                </span>
                {onSignOut && (
                  <button
                    onClick={onSignOut}
                    className="p-1.5 rounded-lg border-2 border-[#15162B] bg-white hover:bg-[#FFE3E0] text-[#15162B] transition-colors cursor-pointer"
                    title="Sign out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={onLogin}
                className="px-3.5 py-2 text-sm font-display font-bold text-[#15162B] hover:text-[#3355FF] transition-colors cursor-pointer"
              >
                Log in
              </button>
            )}

            <button
              onClick={onStartRoom}
              className="px-4 py-2 bg-[#3355FF] text-white font-display font-bold text-sm rounded-lg border-2 border-[#15162B] hard-shadow hard-shadow-hover cursor-pointer"
            >
              Start a room
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION (Asymmetric 55/45 split) */}
      <section className="max-w-6xl mx-auto px-6 pt-12 pb-20 md:pt-18 md:pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column (~55%) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DCE3FF] border-2 border-[#15162B] text-xs font-mono font-bold text-[#15162B]">
              <Sparkles className="w-3.5 h-3.5 text-[#3355FF]" />
              <span>for teams, founders & study groups</span>
            </div>

            {/* Oversized Headline with Highlighter-stroke Mark */}
            <h1 className="font-display font-extrabold text-5xl sm:text-6xl md:text-[64px] tracking-tight text-[#15162B] leading-[1.08]">
              Say it.<br />
              Sketch it.<br />
              <span className="relative inline-block z-10 mt-1">
                <span className="relative z-10">Together.</span>
                <span
                  aria-hidden="true"
                  className="absolute left-[-6px] right-[-6px] bottom-[6px] h-[52%] bg-[#FFDD33] -z-10 transform -skew-x-[8deg] -rotate-[1deg] rounded-xs pointer-events-none"
                />
              </span>
            </h1>

            {/* Subhead covering work and study */}
            <p className="text-lg md:text-xl text-[#6B6D7A] leading-relaxed max-w-xl font-normal">
              The realtime collaboration room that pairs live voice chat with an
              infinite shared whiteboard. Built for sprint planning, client
              pitches, and late-night study sessions — talk and draw in one place
              without app-switching.
            </p>

            {/* Audience Chip Row */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs font-mono text-[#6B6D7A] mr-1">used by:</span>
              <button
                onClick={() => setSelectedAudience(selectedAudience === 'startups' ? 'all' : 'startups')}
                className={`px-3 py-1 rounded-full text-xs font-medium border-2 border-[#15162B] transition-transform hard-shadow-sm cursor-pointer ${
                  selectedAudience === 'startups' ? 'bg-[#FFDD33] text-[#15162B] font-bold' : 'bg-white text-[#15162B]'
                }`}
              >
                🚀 startups
              </button>
              <button
                onClick={() => setSelectedAudience(selectedAudience === 'remote' ? 'all' : 'remote')}
                className={`px-3 py-1 rounded-full text-xs font-medium border-2 border-[#15162B] transition-transform hard-shadow-sm cursor-pointer ${
                  selectedAudience === 'remote' ? 'bg-[#DCE3FF] text-[#15162B] font-bold' : 'bg-white text-[#15162B]'
                }`}
              >
                💼 remote teams
              </button>
              <button
                onClick={() => setSelectedAudience(selectedAudience === 'study' ? 'all' : 'study')}
                className={`px-3 py-1 rounded-full text-xs font-medium border-2 border-[#15162B] transition-transform hard-shadow-sm cursor-pointer ${
                  selectedAudience === 'study' ? 'bg-[#FFDAD5] text-[#15162B] font-bold' : 'bg-white text-[#15162B]'
                }`}
              >
                📚 study groups
              </button>
            </div>

            {/* Primary Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <button
                onClick={onStartRoom}
                className="w-full sm:w-auto px-7 py-3.5 bg-[#3355FF] text-white font-display font-bold text-base rounded-xl border-2 border-[#15162B] hard-shadow-lg hard-shadow-hover inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Create a room</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onJoinCode}
                className="w-full sm:w-auto px-5 py-3.5 bg-white text-[#15162B] font-display font-bold text-base rounded-xl border-2 border-[#15162B] hard-shadow hard-shadow-hover inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Join with link / code</span>
              </button>
            </div>

            {/* Reassurance text */}
            <p className="text-xs text-[#6B6D7A] font-mono">
              Free to start · no credit card required · instant guest links
            </p>
          </div>

          {/* Right Column (~45%): Tilted Whiteboard Mock Card */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md transform lg:rotate-[2.5deg] transition-transform hover:rotate-0 duration-300">
              {/* Corner Tag Peeking Off */}
              <div className="absolute -top-3.5 -right-3 z-20 bg-[#FFDD33] text-[#15162B] border-2 border-[#15162B] font-mono text-xs font-bold px-3 py-1 rounded-md hard-shadow-sm rotate-[5deg]">
                forked by you
              </div>

              {/* Whiteboard Preview Card */}
              <div className="bg-white border-2 border-[#15162B] hard-shadow-xl rounded-2xl overflow-hidden p-4 sm:p-5 relative">
                {/* Mock Window Top Bar */}
                <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-[#15162B]/10">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#FF5B4C] border border-[#15162B]" />
                    <span className="w-3 h-3 rounded-full bg-[#FFDD33] border border-[#15162B]" />
                    <span className="w-3 h-3 rounded-full bg-emerald-400 border border-[#15162B]" />
                    <span className="ml-2 text-xs font-mono font-bold text-[#15162B]">
                      sprint-architecture · room
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-emerald-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>voice active</span>
                  </div>
                </div>

                {/* Mock Canvas Sketch Area */}
                <div className="h-64 sm:h-72 bg-[#F7F5EF]/60 rounded-xl border-2 border-[#15162B] p-4 relative overflow-hidden flex flex-col justify-between">
                  {/* Background grid dots */}
                  <div
                    className="absolute inset-0 opacity-15 pointer-events-none"
                    style={{
                      backgroundImage: 'radial-gradient(#15162B 1px, transparent 1px)',
                      backgroundSize: '16px 16px',
                    }}
                  />

                  {/* Canvas Nodes with Arrows */}
                  <div className="relative z-10 flex items-start justify-between">
                    <div className="p-2.5 bg-white border-2 border-[#15162B] rounded-lg hard-shadow-sm text-xs font-display font-bold">
                      Auth v1
                    </div>

                    <svg className="w-20 h-10 text-[#3355FF]" viewBox="0 0 80 40">
                      <path
                        d="M 10 20 C 35 10, 45 30, 70 20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeDasharray="4 4"
                      />
                      <polygon points="70,16 78,20 70,24" fill="currentColor" />
                    </svg>

                    <div className="p-2.5 bg-[#DCE3FF] border-2 border-[#15162B] rounded-lg hard-shadow-sm text-xs font-display font-bold">
                      LiveKit Voice
                    </div>
                  </div>

                  {/* Center Node & Hand-drawn Arrows */}
                  <div className="relative z-10 flex items-center justify-center my-auto">
                    <div className="p-3 bg-white border-2 border-[#15162B] rounded-xl hard-shadow-sm text-center">
                      <span className="text-xs font-mono font-bold text-[#15162B] block">
                        Shared Canvas
                      </span>
                      <span className="text-[10px] text-[#6B6D7A]">
                        Yjs CRDT binary sync
                      </span>
                    </div>
                  </div>

                  {/* Mini Tilted Sticky Note inside canvas */}
                  <div className="absolute bottom-3 left-3 transform -rotate-3 p-3 bg-[#FFF3C2] border-2 border-[#15162B] hard-shadow-sm rounded-md max-w-[130px]">
                    <div className="w-2 h-2 rounded-full bg-[#15162B] mx-auto mb-1.5" />
                    <p className="text-[11px] font-mono font-bold text-[#15162B] leading-tight">
                      roadmap v2 📌
                    </p>
                    <p className="text-[9px] text-[#6B6D7A] font-mono mt-0.5">
                      voice + annotations
                    </p>
                  </div>

                  {/* Cursors with Participant Tags */}
                  <div className="absolute top-16 left-32 z-20 flex items-center gap-1">
                    <svg className="w-4 h-4 text-[#3355FF] fill-current" viewBox="0 0 24 24">
                      <path d="M4 2v18l5.5-5.5L14 20l3-1.5-4.5-5.5H20z" />
                    </svg>
                    <span className="text-[9px] font-bold font-mono bg-[#3355FF] text-white px-1.5 py-0.5 rounded border border-[#15162B]">
                      Alex (host)
                    </span>
                  </div>

                  <div className="absolute bottom-12 right-6 z-20 flex items-center gap-1">
                    <svg className="w-4 h-4 text-[#FF5B4C] fill-current" viewBox="0 0 24 24">
                      <path d="M4 2v18l5.5-5.5L14 20l3-1.5-4.5-5.5H20z" />
                    </svg>
                    <span className="text-[9px] font-bold font-mono bg-[#FF5B4C] text-white px-1.5 py-0.5 rounded border border-[#15162B]">
                      Maya
                    </span>
                  </div>
                </div>

                {/* Bottom Card Avatars Strip */}
                <div className="mt-3 flex items-center justify-between text-xs font-mono text-[#6B6D7A]">
                  <div className="flex items-center -space-x-2">
                    <div className="w-6 h-6 rounded-full bg-[#3355FF] text-white flex items-center justify-center font-bold text-[10px] border border-[#15162B]">
                      A
                    </div>
                    <div className="w-6 h-6 rounded-full bg-[#FF5B4C] text-white flex items-center justify-center font-bold text-[10px] border border-[#15162B]">
                      M
                    </div>
                    <div className="w-6 h-6 rounded-full bg-[#FFDD33] text-[#15162B] flex items-center justify-center font-bold text-[10px] border border-[#15162B]">
                      S
                    </div>
                    <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-[10px] border border-[#15162B]">
                      D
                    </div>
                  </div>
                  <span>4 in room · 0 latency</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. WHO IT'S FOR STRIP (Quiet 3-column row, plain text, ink top/bottom border) */}
      <section id="who-its-for" className="border-y-2 border-[#15162B] bg-white py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:divide-x-2 md:divide-[#15162B]/10">
            {/* Column 1: Startups */}
            <div className="md:pr-8">
              <span className="text-xs font-mono uppercase tracking-wider text-[#3355FF] font-bold block mb-1">
                01 · Founders & Teams
              </span>
              <h3 className="font-display font-bold text-xl text-[#15162B] mb-2">
                Startups & small teams
              </h3>
              <p className="text-sm text-[#6B6D7A] leading-relaxed">
                Sprint planning, wireframing, and architecture design with zero setup friction.
              </p>
            </div>

            {/* Column 2: Remote / WFH */}
            <div className="md:px-8">
              <span className="text-xs font-mono uppercase tracking-wider text-[#FF5B4C] font-bold block mb-1">
                02 · Distributed Orgs
              </span>
              <h3 className="font-display font-bold text-xl text-[#15162B] mb-2">
                Remote & WFH employees
              </h3>
              <p className="text-sm text-[#6B6D7A] leading-relaxed">
                Quick visual syncs, client design walkthroughs, and standups without toggling Zoom and Miro.
              </p>
            </div>

            {/* Column 3: Study groups */}
            <div className="md:pl-8">
              <span className="text-xs font-mono uppercase tracking-wider text-[#15162B] font-bold block mb-1">
                03 · Academics & Students
              </span>
              <h3 className="font-display font-bold text-xl text-[#15162B] mb-2">
                Study groups
              </h3>
              <p className="text-sm text-[#6B6D7A] leading-relaxed">
                Solve problem sets, diagram exam notes, and explain concepts together over low-latency audio.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FEATURES SECTION (3 Tilted Sticky Notes) */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-[#15162B] tracking-tight">
            Everything you need to think out loud
          </h2>
          <p className="text-base text-[#6B6D7A] mt-3">
            Designed for groups that need to talk and sketch simultaneously without app-hopping.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 items-start pt-4">
          {/* Sticky Note 1: Talk while you draw (rotate -3deg, yellow tint) */}
          <div className="relative transform md:-rotate-3 transition-transform hover:rotate-0 duration-200">
            {/* Centered Pushpin */}
            <div className="w-3.5 h-3.5 rounded-full bg-[#15162B] absolute -top-1.5 left-1/2 -translate-x-1/2 z-20 border border-[#15162B]" />

            <div className="bg-[#FFF3C2] border-2 border-[#15162B] hard-shadow-lg rounded-xl p-6 sm:p-7 pt-8 min-h-[260px] flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-[#FFDD33] border-2 border-[#15162B] hard-shadow-sm flex items-center justify-center mb-4">
                  <Mic className="w-5 h-5 text-[#15162B]" />
                </div>
                <h3 className="font-display font-bold text-2xl text-[#15162B] mb-2.5">
                  Talk while you draw
                </h3>
                <p className="text-sm text-[#15162B]/80 leading-relaxed font-normal">
                  Instant WebRTC audio baked directly into the whiteboard. No separate call links, no echo, no context switching.
                </p>
              </div>
              <div className="pt-4 border-t border-[#15162B]/20 text-xs font-mono font-bold text-[#15162B]/70">
                zero-lag voice engine
              </div>
            </div>
          </div>

          {/* Sticky Note 2: Fork your own copy (rotate +2deg, blue tint) */}
          <div className="relative transform md:rotate-2 transition-transform hover:rotate-0 duration-200">
            {/* Centered Pushpin */}
            <div className="w-3.5 h-3.5 rounded-full bg-[#15162B] absolute -top-1.5 left-1/2 -translate-x-1/2 z-20 border border-[#15162B]" />

            <div className="bg-[#DCE3FF] border-2 border-[#15162B] hard-shadow-lg rounded-xl p-6 sm:p-7 pt-8 min-h-[260px] flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-[#3355FF] border-2 border-[#15162B] hard-shadow-sm flex items-center justify-center mb-4 text-white">
                  <GitFork className="w-5 h-5" />
                </div>
                <h3 className="font-display font-bold text-2xl text-[#15162B] mb-2.5">
                  Fork your own copy
                </h3>
                <p className="text-sm text-[#15162B]/80 leading-relaxed font-normal">
                  Branch the shared whiteboard into a private personal board with one click to explore ideas solo, without disturbing the group.
                </p>
              </div>
              <div className="pt-4 border-t border-[#15162B]/20 text-xs font-mono font-bold text-[#15162B]/70">
                independent CRDT doc
              </div>
            </div>
          </div>

          {/* Sticky Note 3: Mark up any file (rotate -1.5deg, coral tint) */}
          <div className="relative transform md:-rotate-[1.5deg] transition-transform hover:rotate-0 duration-200">
            {/* Centered Pushpin */}
            <div className="w-3.5 h-3.5 rounded-full bg-[#15162B] absolute -top-1.5 left-1/2 -translate-x-1/2 z-20 border border-[#15162B]" />

            <div className="bg-[#FFDAD5] border-2 border-[#15162B] hard-shadow-lg rounded-xl p-6 sm:p-7 pt-8 min-h-[260px] flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-[#FF5B4C] border-2 border-[#15162B] hard-shadow-sm flex items-center justify-center mb-4 text-white">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="font-display font-bold text-2xl text-[#15162B] mb-2.5">
                  Mark up any file
                </h3>
                <p className="text-sm text-[#15162B]/80 leading-relaxed font-normal">
                  Drop multi-page PDFs and images directly onto the canvas. Annotations sit on an independent layer you can toggle or undo anytime.
                </p>
              </div>
              <div className="pt-4 border-t border-[#15162B]/20 text-xs font-mono font-bold text-[#15162B]/70">
                pdf.js page rasterizer
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PRICING SECTION (3 Ticket-Stub Cards) */}
      <section id="pricing" className="border-t-2 border-[#15162B] bg-[#F7F5EF] py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-mono uppercase tracking-wider text-[#3355FF] font-bold block mb-2">
              simple & transparent
            </span>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-[#15162B] tracking-tight">
              Host pays, guests join free
            </h2>
            <p className="text-base text-[#6B6D7A] mt-3">
              Billing attaches to the host's account only. Participants and invited guests never need an account or credit card to join.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end max-w-5xl mx-auto">
            {/* Ticket 1: Free ($0) */}
            <div className="bg-white border-2 border-[#15162B] hard-shadow-lg rounded-xl overflow-hidden flex flex-col justify-between">
              <div className="p-6 sm:p-7">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#6B6D7A]">
                  Free Tier
                </span>
                <div className="mt-3 mb-2 flex items-baseline gap-1">
                  <span className="font-display font-extrabold text-4xl text-[#15162B]">$0</span>
                  <span className="text-xs font-mono text-[#6B6D7A]">/ forever</span>
                </div>
                <p className="text-xs text-[#6B6D7A] leading-relaxed mb-6">
                  For spontaneous study jams, quick brainstorms, and one-off pairs.
                </p>

                {/* Dashed ticket divider */}
                <div className="border-t-2 border-dashed border-[#15162B] my-5" />

                <ul className="space-y-3 text-xs text-[#15162B] font-medium">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Up to 5 participants per room</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>10MB file & document uploads</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Full infinite whiteboard & live voice</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Fork private local boards</span>
                  </li>
                </ul>
              </div>

              <div className="p-6 pt-0">
                <button
                  onClick={onStartRoom}
                  className="w-full py-3 bg-white hover:bg-[#F7F5EF] text-[#15162B] font-display font-bold text-sm rounded-lg border-2 border-[#15162B] hard-shadow-sm hard-shadow-hover transition-colors cursor-pointer"
                >
                  Start free
                </button>
              </div>
            </div>

            {/* Ticket 2: Day pass ($3 / 24 hours) — Visually Emphasized */}
            <div className="bg-white border-2 border-[#15162B] hard-shadow-xl rounded-xl overflow-hidden flex flex-col justify-between md:-translate-y-4 relative">
              {/* Blue Header Band */}
              <div className="bg-[#3355FF] text-white py-2.5 px-4 font-display font-bold uppercase tracking-wider text-xs border-b-2 border-[#15162B] text-center">
                ★ Most popular · 24-hour pass
              </div>

              <div className="p-6 sm:p-7">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#3355FF]">
                  Day Pass
                </span>
                <div className="mt-3 mb-2 flex items-baseline gap-1">
                  <span className="font-display font-extrabold text-5xl text-[#15162B]">$3</span>
                  <span className="text-xs font-mono text-[#6B6D7A]">/ one-time 24h</span>
                </div>
                <p className="text-xs text-[#6B6D7A] leading-relaxed mb-6">
                  For client workshops, hackathons, and day-long sprint sessions.
                </p>

                {/* Dashed ticket divider */}
                <div className="border-t-2 border-dashed border-[#15162B] my-5" />

                <ul className="space-y-3 text-xs text-[#15162B] font-medium">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#3355FF] shrink-0" />
                    <span>Elevated participant capacity</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#3355FF] shrink-0" />
                    <span>50MB file size upload cap</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#3355FF] shrink-0" />
                    <span>24-hour uninterrupted host pass</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#3355FF] shrink-0" />
                    <span>5-minute grace-period recovery</span>
                  </li>
                </ul>
              </div>

              <div className="p-6 pt-0">
                <button
                  onClick={onStartRoom}
                  className="w-full py-3.5 bg-[#3355FF] text-white font-display font-bold text-sm rounded-lg border-2 border-[#15162B] hard-shadow hard-shadow-hover transition-colors cursor-pointer"
                >
                  Get day pass
                </button>
              </div>
            </div>

            {/* Ticket 3: Monthly ($9 / month) */}
            <div className="bg-white border-2 border-[#15162B] hard-shadow-lg rounded-xl overflow-hidden flex flex-col justify-between">
              <div className="p-6 sm:p-7">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#6B6D7A]">
                  Monthly Pro
                </span>
                <div className="mt-3 mb-2 flex items-baseline gap-1">
                  <span className="font-display font-extrabold text-4xl text-[#15162B]">$9</span>
                  <span className="text-xs font-mono text-[#6B6D7A]">/ month</span>
                </div>
                <p className="text-xs text-[#6B6D7A] leading-relaxed mb-6">
                  For remote startups, recurring classes, and continuous team syncs.
                </p>

                {/* Dashed ticket divider */}
                <div className="border-t-2 border-dashed border-[#15162B] my-5" />

                <ul className="space-y-3 text-xs text-[#15162B] font-medium">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Unlimited recurring rooms</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Elevated capacity & 50MB file cap</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Priority WebRTC voice channels</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Cancel anytime with one click</span>
                  </li>
                </ul>
              </div>

              <div className="p-6 pt-0">
                <button
                  onClick={onStartRoom}
                  className="w-full py-3 bg-white hover:bg-[#F7F5EF] text-[#15162B] font-display font-bold text-sm rounded-lg border-2 border-[#15162B] hard-shadow-sm hard-shadow-hover transition-colors cursor-pointer"
                >
                  Go monthly
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FOOTER CTA SECTION (Quiet & bold) */}
      <footer className="border-t-2 border-[#15162B] bg-white py-16">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-[#15162B] tracking-tight">
            Ready to talk and sketch together?
          </h2>
          <p className="text-base text-[#6B6D7A] max-w-lg mx-auto">
            Create a room in 5 seconds. Send the link to your team.
          </p>

          <div className="pt-2">
            <button
              onClick={onStartRoom}
              className="px-8 py-3.5 bg-[#3355FF] text-white font-display font-bold text-base rounded-xl border-2 border-[#15162B] hard-shadow-lg hard-shadow-hover inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Create a room now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="pt-12 border-t-2 border-[#15162B]/10 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-[#6B6D7A] gap-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#15162B]">StudySync</span>
              <span>·</span>
              <span>Say it. Sketch it. Together.</span>
            </div>
            <div className="flex items-center gap-6">
              <a href="#who-its-for" className="hover:text-[#15162B]">For teams</a>
              <a href="#features" className="hover:text-[#15162B]">Features</a>
              <a href="#pricing" className="hover:text-[#15162B]">Pricing</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
