import React, { useState } from 'react';
import {
  Mic,
  GitFork,
  FileText,
  Check,
  ArrowRight,
  Sparkles,
  LogOut,
  Rocket,
  Briefcase,
  BookOpen,
  Menu,
  X,
  MessageSquare,
  Shield,
  HelpCircle,
} from 'lucide-react';
import { PLAN_LIMITS, FEEDBACK_URL } from '../config/landing';

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedAudience, setSelectedAudience] = useState<'all' | 'startups' | 'remote' | 'study'>('all');
  const [activeModal, setActiveModal] = useState<'privacy' | 'terms' | 'contact' | null>(null);

  return (
    <div className="min-h-screen bg-[#F7F5EF] text-[#15162B] selection:bg-[#FFDD33] selection:text-[#15162B] font-sans overflow-x-hidden flex flex-col justify-between">
      {/* 1. NAV SECTION (72px tall, paper bg, 1px ink bottom border, sticky) */}
      <header className="sticky top-0 z-40 bg-[#F7F5EF]/95 backdrop-blur-sm border-b border-[#15162B] h-[72px]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 h-full flex items-center justify-between">
          {/* Logo Mark + Wordmark */}
          <a
            href="/"
            className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3355FF] rounded-lg p-1"
          >
            <div className="w-8 h-8 rounded-lg bg-[#3355FF] border-2 border-[#15162B] hard-shadow-sm flex items-center justify-center text-white shrink-0">
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="9" className="opacity-30" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <span className="font-display font-bold text-2xl text-[#15162B] tracking-tight">
              StudySync
            </span>
          </a>

          {/* Center Links (Desktop) */}
          <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-8 font-display font-medium text-sm text-[#15162B]">
            <a
              href="#who-its-for"
              className="hover:text-[#3355FF] transition-colors py-2 px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3355FF] rounded"
            >
              For teams
            </a>
            <a
              href="#features"
              className="hover:text-[#3355FF] transition-colors py-2 px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3355FF] rounded"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="hover:text-[#3355FF] transition-colors py-2 px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3355FF] rounded"
            >
              Pricing
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-block text-xs font-mono text-[#444654]">
                  {displayName || user.email}
                </span>
                {onSignOut && (
                  <button
                    onClick={onSignOut}
                    className="min-h-[44px] min-w-[44px] p-2 rounded-lg border-2 border-[#15162B] bg-white hover:bg-[#FFE3E0] text-[#15162B] transition-colors flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3355FF]"
                    title="Sign out"
                    aria-label="Sign out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={onLogin}
                className="hidden sm:inline-flex min-h-[44px] px-3.5 py-2 text-sm font-display font-bold text-[#15162B] hover:text-[#3355FF] transition-colors cursor-pointer items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3355FF] rounded-lg"
              >
                Log in
              </button>
            )}

            <button
              onClick={onStartRoom}
              className="min-h-[44px] px-4 py-2 bg-[#3355FF] text-white font-display font-bold text-sm rounded-lg border-2 border-[#15162B] hard-shadow hard-shadow-hover inline-flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3355FF]"
            >
              Start a room
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden min-h-[44px] min-w-[44px] p-2 rounded-lg border-2 border-[#15162B] bg-white text-[#15162B] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3355FF]"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#F7F5EF] border-b-2 border-[#15162B] px-6 py-5 shadow-lg animate-in slide-in-from-top-2 duration-150">
            <nav className="flex flex-col gap-4 font-display font-medium text-base text-[#15162B]">
              <a
                href="#who-its-for"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 hover:text-[#3355FF]"
              >
                For teams
              </a>
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 hover:text-[#3355FF]"
              >
                Features
              </a>
              <a
                href="#pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 hover:text-[#3355FF]"
              >
                Pricing
              </a>
              {!user && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogin();
                  }}
                  className="text-left py-2 font-bold text-[#3355FF]"
                >
                  Log in
                </button>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* MAIN BODY */}
      <main className="flex-1">
        {/* 2. HERO SECTION (Asymmetric 55/45 split, 1200px container) */}
        <section className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column (~55%) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DCE3FF] border-2 border-[#15162B] text-xs font-mono uppercase tracking-wider font-bold text-[#15162B]">
                <Sparkles className="w-3.5 h-3.5 text-[#3355FF]" aria-hidden="true" />
                <span>teams, founders & study groups</span>
              </div>

              {/* Single Oversized H1 Headline with Highlighter-stroke Mark */}
              <h1 className="font-display font-extrabold text-5xl sm:text-6xl md:text-[64px] tracking-tight text-[#15162B] leading-[1.06]">
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

              {/* Concise Hero Subhead: max 2 lines (~25 words), voice + whiteboard for work and study */}
              <p className="text-base sm:text-lg text-[#444654] leading-relaxed max-w-[60ch] font-normal">
                Live voice chat and an infinite shared whiteboard in one room.
                Sketch sprint architectures, run client reviews, or solve problem sets together without switching apps.
              </p>

              {/* Audience Chip Row (SVG icons, built for: label) */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs font-mono uppercase tracking-wider text-[#444654] font-bold mr-1">
                  built for:
                </span>
                <button
                  onClick={() => setSelectedAudience(selectedAudience === 'startups' ? 'all' : 'startups')}
                  className={`min-h-[40px] px-3.5 py-1.5 rounded-full text-xs font-medium border-2 border-[#15162B] transition-transform hard-shadow-sm cursor-pointer inline-flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3355FF] ${
                    selectedAudience === 'startups' ? 'bg-[#FFDD33] text-[#15162B] font-bold' : 'bg-white text-[#15162B] hover:bg-[#F7F5EF]'
                  }`}
                  aria-pressed={selectedAudience === 'startups'}
                >
                  <Rocket className="w-3.5 h-3.5 text-[#15162B]" aria-hidden="true" />
                  <span>startups</span>
                </button>
                <button
                  onClick={() => setSelectedAudience(selectedAudience === 'remote' ? 'all' : 'remote')}
                  className={`min-h-[40px] px-3.5 py-1.5 rounded-full text-xs font-medium border-2 border-[#15162B] transition-transform hard-shadow-sm cursor-pointer inline-flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3355FF] ${
                    selectedAudience === 'remote' ? 'bg-[#DCE3FF] text-[#15162B] font-bold' : 'bg-white text-[#15162B] hover:bg-[#F7F5EF]'
                  }`}
                  aria-pressed={selectedAudience === 'remote'}
                >
                  <Briefcase className="w-3.5 h-3.5 text-[#15162B]" aria-hidden="true" />
                  <span>remote teams</span>
                </button>
                <button
                  onClick={() => setSelectedAudience(selectedAudience === 'study' ? 'all' : 'study')}
                  className={`min-h-[40px] px-3.5 py-1.5 rounded-full text-xs font-medium border-2 border-[#15162B] transition-transform hard-shadow-sm cursor-pointer inline-flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3355FF] ${
                    selectedAudience === 'study' ? 'bg-[#FFDAD5] text-[#15162B] font-bold' : 'bg-white text-[#15162B] hover:bg-[#F7F5EF]'
                  }`}
                  aria-pressed={selectedAudience === 'study'}
                >
                  <BookOpen className="w-3.5 h-3.5 text-[#15162B]" aria-hidden="true" />
                  <span>study groups</span>
                </button>
              </div>

              {/* Primary vs Secondary Action Buttons: Create a room has hard shadow; Join is outline with no shadow */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <button
                  onClick={onStartRoom}
                  className="min-h-[48px] px-7 py-3.5 bg-[#3355FF] text-white font-display font-bold text-base rounded-xl border-2 border-[#15162B] hard-shadow-lg hard-shadow-hover inline-flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3355FF]"
                >
                  <span>Create a room</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>

                <button
                  onClick={onJoinCode}
                  className="min-h-[48px] px-5 py-3.5 bg-white text-[#15162B] font-display font-bold text-base rounded-xl border-2 border-[#15162B] hover:bg-[#F7F5EF] inline-flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3355FF]"
                >
                  <span>Join with link / code</span>
                </button>
              </div>

              {/* Reassurance text in Sans */}
              <p className="text-sm text-[#444654] font-normal">
                Free to start · no credit card required · instant guest links
              </p>
            </div>

            {/* Right Column (~45%): Tilted Whiteboard Mock Card */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="relative w-full max-w-md transform rotate-0 lg:rotate-[1.5deg] transition-transform duration-300">
                {/* Repositioned Corner Tag: bottom-left peeking off edge, no collision with top voice pill */}
                <div className="absolute -bottom-3 -left-3 z-30 bg-[#FFDD33] text-[#15162B] border-2 border-[#15162B] font-mono text-xs uppercase tracking-wider font-bold px-3 py-1 rounded-md hard-shadow-sm -rotate-[4deg]">
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

                    <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-300 text-[11px] font-bold text-emerald-800">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
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
                      aria-hidden="true"
                    />

                    {/* Canvas Nodes with Flow Arrows (Clean work-plausible labels, no jargon) */}
                    <div className="relative z-10 flex items-start justify-between">
                      <div className="p-2.5 bg-white border-2 border-[#15162B] rounded-lg hard-shadow-sm text-xs font-display font-bold">
                        User Auth
                      </div>

                      <svg className="w-20 h-10 text-[#3355FF]" viewBox="0 0 80 40" aria-hidden="true">
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
                        API Gateway
                      </div>
                    </div>

                    {/* Center Node: Shared Whiteboard */}
                    <div className="relative z-10 flex items-center justify-center my-auto">
                      <div className="p-3 bg-white border-2 border-[#15162B] rounded-xl hard-shadow-sm text-center">
                        <span className="text-xs font-display font-bold text-[#15162B] block">
                          Shared Board
                        </span>
                        <span className="text-xs text-[#444654]">
                          realtime collaboration
                        </span>
                      </div>
                    </div>

                    {/* Mini Plausible Sticky Note (Text at least 12px at desktop) */}
                    <div className="absolute bottom-3 right-3 transform -rotate-2 p-3 bg-[#FFF3C2] border-2 border-[#15162B] hard-shadow-sm rounded-md max-w-[145px] z-10">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#15162B] mx-auto mb-1" />
                      <p className="text-xs font-display font-bold text-[#15162B] leading-tight">
                        Launch checklist 📌
                      </p>
                      <p className="text-xs text-[#444654] mt-0.5">
                        review endpoints
                      </p>
                    </div>

                    {/* Live Cursors */}
                    <div className="absolute top-16 left-28 z-20 flex items-center gap-1">
                      <svg className="w-4 h-4 text-[#3355FF] fill-current" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M4 2v18l5.5-5.5L14 20l3-1.5-4.5-5.5H20z" />
                      </svg>
                      <span className="text-[10px] font-bold font-mono bg-[#3355FF] text-white px-1.5 py-0.5 rounded border border-[#15162B]">
                        Alex (host)
                      </span>
                    </div>

                    <div className="absolute bottom-14 left-10 z-20 flex items-center gap-1">
                      <svg className="w-4 h-4 text-[#FF5B4C] fill-current" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M4 2v18l5.5-5.5L14 20l3-1.5-4.5-5.5H20z" />
                      </svg>
                      <span className="text-[10px] font-bold font-mono bg-[#FF5B4C] text-white px-1.5 py-0.5 rounded border border-[#15162B]">
                        Maya
                      </span>
                    </div>
                  </div>

                  {/* Bottom Strip: 4 in room · voice on */}
                  <div className="mt-3 flex items-center justify-between text-xs text-[#444654]">
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
                    <span className="font-medium text-[#15162B]">4 in room · voice on</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. WHO IT'S FOR STRIP (Quiet 3-column row, plain text, 1200px container, 96px/64px padding) */}
        <section id="who-its-for" className="border-y-2 border-[#15162B] bg-white py-16 md:py-24 scroll-mt-[72px]">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:divide-x-2 md:divide-[#15162B]/10">
              {/* Column 1: Startups */}
              <div className="md:pr-8">
                <span className="text-xs font-mono uppercase tracking-wider text-[#3355FF] font-bold block mb-2">
                  01 · Founders & Teams
                </span>
                <h2 className="font-display font-bold text-xl text-[#15162B] mb-2">
                  Startups & small teams
                </h2>
                <p className="text-base text-[#444654] leading-relaxed">
                  Sprint planning, wireframing, and architecture reviews with zero setup friction.
                </p>
              </div>

              {/* Column 2: Remote / WFH */}
              <div className="md:px-8">
                <span className="text-xs font-mono uppercase tracking-wider text-[#FF5B4C] font-bold block mb-2">
                  02 · Distributed Orgs
                </span>
                <h2 className="font-display font-bold text-xl text-[#15162B] mb-2">
                  Remote & WFH teams
                </h2>
                <p className="text-base text-[#444654] leading-relaxed">
                  Quick visual syncs, client design walkthroughs, and standups without toggling video calls and board tools.
                </p>
              </div>

              {/* Column 3: Study groups */}
              <div className="md:pl-8">
                <span className="text-xs font-mono uppercase tracking-wider text-[#15162B] font-bold block mb-2">
                  03 · Academics & Students
                </span>
                <h2 className="font-display font-bold text-xl text-[#15162B] mb-2">
                  Study groups & tutors
                </h2>
                <p className="text-base text-[#444654] leading-relaxed">
                  Solve problem sets, diagram exam notes, and explain concepts together over crystal-clear audio.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. FEATURES SECTION (3 Tilted Sticky Notes, Benefit-first copy, plain tags) */}
        <section id="features" className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 py-16 md:py-24 scroll-mt-[72px]">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-mono uppercase tracking-wider text-[#3355FF] font-bold block mb-2">
              02 · Core Features
            </span>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-[#15162B] tracking-tight">
              Everything you need to think out loud
            </h2>
            <p className="text-base text-[#444654] mt-3">
              Designed for groups that need to talk and sketch simultaneously without app-hopping.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 items-start pt-4">
            {/* Sticky Note 1: Talk while you draw (rotate -2.5deg, yellow tint) */}
            <div className="relative transform md:-rotate-[2.5deg] transition-transform hover:rotate-0 duration-200">
              {/* Centered Pushpin */}
              <div className="w-3.5 h-3.5 rounded-full bg-[#15162B] absolute -top-1.5 left-1/2 -translate-x-1/2 z-20 border border-[#15162B]" />

              <div className="bg-[#FFF3C2] border-2 border-[#15162B] hard-shadow-lg rounded-xl p-6 sm:p-7 pt-8 min-h-[270px] flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-lg bg-[#FFDD33] border-2 border-[#15162B] hard-shadow-sm flex items-center justify-center mb-4">
                    <Mic className="w-5 h-5 text-[#15162B]" aria-hidden="true" />
                  </div>
                  <h3 className="font-display font-bold text-2xl text-[#15162B] mb-2.5">
                    Talk while you draw
                  </h3>
                  <p className="text-sm text-[#15162B]/85 leading-relaxed font-normal">
                    Built-in voice lets your group talk naturally while sketching on the same canvas. No second tab, no separate call links, and no echo.
                  </p>
                </div>
                <div className="pt-4 border-t border-[#15162B]/20 text-xs font-mono uppercase tracking-wider font-bold text-[#15162B]/75">
                  no separate call link
                </div>
              </div>
            </div>

            {/* Sticky Note 2: Fork your own copy (rotate +1.8deg, blue tint) */}
            <div className="relative transform md:rotate-[1.8deg] transition-transform hover:rotate-0 duration-200">
              {/* Centered Pushpin */}
              <div className="w-3.5 h-3.5 rounded-full bg-[#15162B] absolute -top-1.5 left-1/2 -translate-x-1/2 z-20 border border-[#15162B]" />

              <div className="bg-[#DCE3FF] border-2 border-[#15162B] hard-shadow-lg rounded-xl p-6 sm:p-7 pt-8 min-h-[270px] flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-lg bg-[#3355FF] border-2 border-[#15162B] hard-shadow-sm flex items-center justify-center mb-4 text-white">
                    <GitFork className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <h3 className="font-display font-bold text-2xl text-[#15162B] mb-2.5">
                    Fork your own copy
                  </h3>
                  <p className="text-sm text-[#15162B]/85 leading-relaxed font-normal">
                    Branch the shared whiteboard into a private version in one click. Try out an idea solo, then share what worked with the room.
                  </p>
                </div>
                <div className="pt-4 border-t border-[#15162B]/20 text-xs font-mono uppercase tracking-wider font-bold text-[#15162B]/75">
                  your own private copy
                </div>
              </div>
            </div>

            {/* Sticky Note 3: Mark up any file (rotate -1.5deg, coral tint) */}
            <div className="relative transform md:-rotate-[1.5deg] transition-transform hover:rotate-0 duration-200">
              {/* Centered Pushpin */}
              <div className="w-3.5 h-3.5 rounded-full bg-[#15162B] absolute -top-1.5 left-1/2 -translate-x-1/2 z-20 border border-[#15162B]" />

              <div className="bg-[#FFDAD5] border-2 border-[#15162B] hard-shadow-lg rounded-xl p-6 sm:p-7 pt-8 min-h-[270px] flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-lg bg-[#FF5B4C] border-2 border-[#15162B] hard-shadow-sm flex items-center justify-center mb-4 text-white">
                    <FileText className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <h3 className="font-display font-bold text-2xl text-[#15162B] mb-2.5">
                    Mark up any file
                  </h3>
                  <p className="text-sm text-[#15162B]/85 leading-relaxed font-normal">
                    Drop PDFs, lecture slides, or mockups onto the canvas. Your highlighter and ink stay on an independent layer you can toggle or undo.
                  </p>
                </div>
                <div className="pt-4 border-t border-[#15162B]/20 text-xs font-mono uppercase tracking-wider font-bold text-[#15162B]/75">
                  highlight anything
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. PRICING SECTION (Equal-height cards, pinned buttons, Coming Soon paid state, PLAN_LIMITS config) */}
        <section id="pricing" className="border-t-2 border-[#15162B] bg-[#F7F5EF] py-16 md:py-24 scroll-mt-[72px]">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-mono uppercase tracking-wider text-[#3355FF] font-bold block mb-2">
                03 · Transparent Plans
              </span>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-[#15162B] tracking-tight">
                Host pays, guests join free
              </h2>
              <p className="text-base text-[#444654] mt-3">
                Billing attaches to the host's account only. Participants and invited guests never need an account or credit card to join.
              </p>
            </div>

            {/* Equal-Height Grid with align-items: stretch and pinned buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
              {/* Ticket 1: Free Tier */}
              <div className="bg-white border-2 border-[#15162B] hard-shadow-lg rounded-xl overflow-hidden flex flex-col justify-between h-full">
                <div className="p-6 sm:p-7 flex-1 flex flex-col">
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#444654]">
                    {PLAN_LIMITS.free.name}
                  </span>
                  <div className="mt-3 mb-2 flex items-baseline gap-1">
                    <span className="font-display font-extrabold text-4xl text-[#15162B]">
                      {PLAN_LIMITS.free.price}
                    </span>
                    <span className="text-sm font-sans text-[#444654]">
                      {PLAN_LIMITS.free.cadence}
                    </span>
                  </div>
                  <p className="text-sm font-sans text-[#444654] leading-relaxed mb-6">
                    {PLAN_LIMITS.free.description}
                  </p>

                  {/* Dashed ticket divider */}
                  <div className="border-t-2 border-dashed border-[#15162B] my-4" />

                  <ul className="space-y-3 text-sm text-[#15162B] font-medium flex-1">
                    {PLAN_LIMITS.free.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-[#3355FF] shrink-0 mt-0.5" aria-hidden="true" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-6 pt-0">
                  <button
                    onClick={onStartRoom}
                    className="w-full min-h-[44px] py-3 bg-white hover:bg-[#F7F5EF] text-[#15162B] font-display font-bold text-sm rounded-lg border-2 border-[#15162B] hard-shadow-sm hard-shadow-hover transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3355FF]"
                  >
                    {PLAN_LIMITS.free.buttonText}
                  </button>
                </div>
              </div>

              {/* Ticket 2: Day Pass (Featured with blue banner) */}
              <div className="bg-white border-2 border-[#15162B] hard-shadow-xl rounded-xl overflow-hidden flex flex-col justify-between h-full relative">
                {/* Blue Header Band */}
                <div className="bg-[#3355FF] text-white py-2 px-4 font-display font-bold uppercase tracking-wider text-xs border-b-2 border-[#15162B] text-center">
                  {PLAN_LIMITS.dayPass.badge}
                </div>

                <div className="p-6 sm:p-7 flex-1 flex flex-col">
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#3355FF]">
                    {PLAN_LIMITS.dayPass.name}
                  </span>
                  <div className="mt-3 mb-2 flex items-baseline gap-1">
                    <span className="font-display font-extrabold text-5xl text-[#15162B]">
                      {PLAN_LIMITS.dayPass.price}
                    </span>
                    <span className="text-sm font-sans text-[#444654]">
                      {PLAN_LIMITS.dayPass.cadence}
                    </span>
                  </div>
                  <p className="text-sm font-sans text-[#444654] leading-relaxed mb-6">
                    {PLAN_LIMITS.dayPass.description}
                  </p>

                  {/* Dashed ticket divider */}
                  <div className="border-t-2 border-dashed border-[#15162B] my-4" />

                  <ul className="space-y-3 text-sm text-[#15162B] font-medium flex-1">
                    {PLAN_LIMITS.dayPass.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-[#3355FF] shrink-0 mt-0.5" aria-hidden="true" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-6 pt-0">
                  <button
                    disabled
                    aria-disabled="true"
                    className="w-full min-h-[44px] py-3.5 bg-neutral-100 text-neutral-400 font-display font-bold text-sm rounded-lg border-2 border-neutral-300 cursor-not-allowed text-center"
                    title="Billing paused until Stripe integration"
                  >
                    {PLAN_LIMITS.dayPass.buttonText}
                  </button>
                </div>
              </div>

              {/* Ticket 3: Monthly Pro */}
              <div className="bg-white border-2 border-[#15162B] hard-shadow-lg rounded-xl overflow-hidden flex flex-col justify-between h-full">
                <div className="p-6 sm:p-7 flex-1 flex flex-col">
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#444654]">
                    {PLAN_LIMITS.monthly.name}
                  </span>
                  <div className="mt-3 mb-2 flex items-baseline gap-1">
                    <span className="font-display font-extrabold text-4xl text-[#15162B]">
                      {PLAN_LIMITS.monthly.price}
                    </span>
                    <span className="text-sm font-sans text-[#444654]">
                      {PLAN_LIMITS.monthly.cadence}
                    </span>
                  </div>
                  <p className="text-sm font-sans text-[#444654] leading-relaxed mb-6">
                    {PLAN_LIMITS.monthly.description}
                  </p>

                  {/* Dashed ticket divider */}
                  <div className="border-t-2 border-dashed border-[#15162B] my-4" />

                  <ul className="space-y-3 text-sm text-[#15162B] font-medium flex-1">
                    {PLAN_LIMITS.monthly.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-[#3355FF] shrink-0 mt-0.5" aria-hidden="true" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-6 pt-0">
                  <button
                    disabled
                    aria-disabled="true"
                    className="w-full min-h-[44px] py-3.5 bg-neutral-100 text-neutral-400 font-display font-bold text-sm rounded-lg border-2 border-neutral-300 cursor-not-allowed text-center"
                    title="Billing paused until Stripe integration"
                  >
                    {PLAN_LIMITS.monthly.buttonText}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. FOOTER CTA SECTION (1200px container, 96px/64px padding) */}
        <section className="border-t-2 border-[#15162B] bg-white py-16 md:py-24">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 text-center space-y-6">
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-[#15162B] tracking-tight">
              Ready to talk and sketch together?
            </h2>
            <p className="text-base text-[#444654] max-w-lg mx-auto">
              Create a room in 5 seconds. Send the link to your team.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={onStartRoom}
                className="w-full sm:w-auto min-h-[48px] px-8 py-3.5 bg-[#3355FF] text-white font-display font-bold text-base rounded-xl border-2 border-[#15162B] hard-shadow-lg hard-shadow-hover inline-flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3355FF]"
              >
                <span>Create a room now</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>

              <button
                onClick={onJoinCode}
                className="w-full sm:w-auto min-h-[48px] px-6 py-3.5 bg-white text-[#15162B] font-display font-bold text-base rounded-xl border-2 border-[#15162B] hover:bg-[#F7F5EF] inline-flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3355FF]"
              >
                <span>Join with invite code</span>
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t-2 border-[#15162B] bg-[#F7F5EF] py-10">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 flex flex-col md:flex-row items-center justify-between text-sm text-[#444654] gap-6">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-[#15162B]">StudySync</span>
            <span>·</span>
            <span>Say it. Sketch it. Together.</span>
            <span>·</span>
            <span>© 2026 StudySync</span>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <button
              onClick={() => setActiveModal('privacy')}
              className="hover:text-[#15162B] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3355FF] rounded"
            >
              Privacy
            </button>
            <button
              onClick={() => setActiveModal('terms')}
              className="hover:text-[#15162B] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3355FF] rounded"
            >
              Terms
            </button>
            <button
              onClick={() => setActiveModal('contact')}
              className="hover:text-[#15162B] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3355FF] rounded"
            >
              Contact
            </button>
            <a
              href={FEEDBACK_URL}
              className="inline-flex items-center gap-1.5 font-bold text-[#3355FF] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3355FF] rounded"
            >
              <MessageSquare className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Send feedback</span>
            </a>
          </div>
        </div>
      </footer>

      {/* BRANDED LEGAL & CONTACT MODALS */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#F7F5EF] border-2 border-[#15162B] hard-shadow-xl rounded-2xl max-w-lg w-full p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#15162B]/10 mb-4">
              <div className="flex items-center gap-2">
                {activeModal === 'privacy' && <Shield className="w-5 h-5 text-[#3355FF]" />}
                {activeModal === 'terms' && <FileText className="w-5 h-5 text-[#3355FF]" />}
                {activeModal === 'contact' && <HelpCircle className="w-5 h-5 text-[#3355FF]" />}
                <h3 className="font-display font-bold text-xl text-[#15162B] capitalize">
                  {activeModal}
                </h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-md text-[#444654] hover:text-[#15162B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3355FF]"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm text-[#444654] leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
              {activeModal === 'privacy' && (
                <>
                  <p>
                    <strong>StudySync Privacy Notice:</strong> We believe in zero-friction collaboration with minimal data collection.
                  </p>
                  <p>
                    • We do not sell your personal data or board contents.<br />
                    • Audio is peer-to-peer or routed through encrypted LiveKit media servers without recording.<br />
                    • Uploaded files are stored securely in Supabase Storage buckets scoped to active rooms.
                  </p>
                  <p>
                    For inquiries or data deletion requests, reach out at <a href={FEEDBACK_URL} className="text-[#3355FF] underline">hello@studysync.app</a>.
                  </p>
                </>
              )}

              {activeModal === 'terms' && (
                <>
                  <p>
                    <strong>StudySync Terms of Service:</strong>
                  </p>
                  <p>
                    1. StudySync is provided for group study, remote collaboration, and visual planning.<br />
                    2. Users are responsible for the materials they upload to the board.<br />
                    3. Do not upload prohibited or illegal content.<br />
                    4. StudySync is provided "as is" with continuous improvements.
                  </p>
                </>
              )}

              {activeModal === 'contact' && (
                <>
                  <p>
                    Have questions, suggestions, or want to report an issue?
                  </p>
                  <p>
                    Reach our core team directly at <a href={FEEDBACK_URL} className="text-[#3355FF] font-bold underline">hello@studysync.app</a>.
                  </p>
                  <p>
                    We actively review user feedback and respond to every inquiry.
                  </p>
                </>
              )}
            </div>

            <div className="pt-6 border-t-2 border-[#15162B]/10 mt-6 flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="px-5 py-2 bg-white text-[#15162B] font-display font-bold text-sm rounded-lg border-2 border-[#15162B] hard-shadow-sm hover:bg-[#F7F5EF]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
