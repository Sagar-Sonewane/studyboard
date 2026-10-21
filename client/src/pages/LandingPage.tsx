import React from 'react';
import { ArrowRight, KeyRound, CheckCircle2, Users, Rocket, GraduationCap } from 'lucide-react';
import { LandingHeader } from '../components/landing/LandingHeader';
import { HeroWorkspacePreview } from '../components/landing/HeroWorkspacePreview';
import { HowItWorksSection } from '../components/landing/HowItWorksSection';
import { FeatureDeepDiveSection } from '../components/landing/FeatureDeepDiveSection';
import { AudienceUseCasesSection } from '../components/landing/AudienceUseCasesSection';
import { PricingSection } from '../components/landing/PricingSection';
import { FinalCtaSection } from '../components/landing/FinalCtaSection';
import { LandingFooter } from '../components/landing/LandingFooter';

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
  return (
    <div className="min-h-screen bg-[#F7F5EF] text-[#15162B] selection:bg-[#FFDD33] selection:text-[#15162B] font-sans overflow-x-hidden flex flex-col justify-between">
      {/* 1. STICKY NAVIGATION (72px, warm paper background, ink borders) */}
      <LandingHeader
        onStartRoom={onStartRoom}
        onJoinCode={onJoinCode}
        onLogin={onLogin}
        onSignOut={onSignOut}
        user={user}
        displayName={displayName}
      />

      <main>
        {/* SECTION A: HERO — THE PRODUCT IN ACTION */}
        <section className="relative pt-10 pb-16 md:pt-16 md:pb-24 overflow-hidden border-b-2 border-[#15162B]">
          {/* Subtle Canvas Dot Grid Background */}
          <div
            className="absolute inset-0 opacity-40 pointer-events-none"
            style={{
              backgroundImage:
                'radial-gradient(circle, #15162B 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
            aria-hidden="true"
          />

          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
              {/* LEFT COLUMN: Editorial Narrative, Value Proposition & Actions */}
              <div className="lg:col-span-5 space-y-6">
                {/* Editorial Headline with Yellow Highlighter Mark */}
                <h1 className="font-display font-bold text-4xl sm:text-5xl md:text-6xl text-[#15162B] tracking-tight leading-[1.08] [text-wrap:balance]">
                  Say it.{' '}
                  <span className="block sm:inline">Sketch it.</span>{' '}
                  <span className="relative inline-block px-1">
                    <span className="relative z-10">Together.</span>
                    <span
                      className="absolute inset-x-0 bottom-1 sm:bottom-2 h-4 sm:h-5 bg-[#FFDD33] -rotate-1 rounded-sm -z-0"
                      aria-hidden="true"
                    />
                  </span>
                </h1>

                {/* Clear, Jargon-Free Description (Capped at 2 lines / ~25 words) */}
                <p className="text-base sm:text-lg text-[#444654] leading-relaxed max-w-lg font-normal">
                  StudySync brings live voice chat and an infinite shared whiteboard into one frictionless room. No separate call links, no downloads, and zero guest accounts.
                </p>

                {/* Primary & Secondary Action Buttons ("Join with code" is pure outline, no hard shadow) */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                  <button
                    onClick={onStartRoom}
                    className="min-h-[50px] px-6 py-3.5 bg-[#3355FF] text-white font-display font-bold text-base rounded-xl border-2 border-[#15162B] hard-shadow hard-shadow-hover inline-flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3355FF]"
                  >
                    <span>Create a room</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </button>

                  <button
                    onClick={onJoinCode}
                    className="min-h-[50px] px-5 py-3.5 bg-white text-[#15162B] font-display font-bold text-base rounded-xl border-2 border-[#15162B] hover:bg-[#F2EFE6] inline-flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3355FF]"
                  >
                    <KeyRound className="w-4 h-4 text-[#3355FF]" aria-hidden="true" />
                    <span>Join with code</span>
                  </button>
                </div>

                {/* Accurate Reassurance Note kept to one line */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono text-[#444654] pt-1">
                  <div className="flex items-center gap-1.5 shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-[#00AA72]" aria-hidden="true" />
                    <span>Free tier included</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-[#00AA72]" aria-hidden="true" />
                    <span>Guests join without accounts</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-[#00AA72]" aria-hidden="true" />
                    <span>Works in any browser</span>
                  </div>
                </div>

                {/* Quick Anchor Chips for Primary Audiences (BUILT FOR) */}
                <div className="pt-3 border-t border-[#15162B]/10 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-[#15162B] uppercase tracking-wider font-mono">
                    BUILT FOR:
                  </span>
                  <a
                    href="#who-its-for"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-[#15162B]/20 text-xs font-medium text-[#15162B] hover:border-[#15162B] hover:text-[#3355FF] transition-colors"
                  >
                    <GraduationCap className="w-3.5 h-3.5 text-[#3355FF]" />
                    <span>Study Groups</span>
                  </a>
                  <a
                    href="#who-its-for"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-[#15162B]/20 text-xs font-medium text-[#15162B] hover:border-[#15162B] hover:text-[#3355FF] transition-colors"
                  >
                    <Rocket className="w-3.5 h-3.5 text-[#3355FF]" />
                    <span>Startups</span>
                  </a>
                  <a
                    href="#who-its-for"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-[#15162B]/20 text-xs font-medium text-[#15162B] hover:border-[#15162B] hover:text-[#3355FF] transition-colors"
                  >
                    <Users className="w-3.5 h-3.5 text-[#3355FF]" />
                    <span>Remote Teams</span>
                  </a>
                </div>
              </div>

              {/* RIGHT COLUMN: Realistic, Interactive Product Workspace Preview */}
              <div className="lg:col-span-7">
                <HeroWorkspacePreview />
              </div>
            </div>
          </div>
        </section>

        {/* SECTION B: HOW IT WORKS (3-Step Visual Sequence) */}
        <HowItWorksSection onStartRoom={onStartRoom} />

        {/* SECTION C: FEATURE DEEP DIVES (Voice, Forking, File Markup) */}
        <FeatureDeepDiveSection />

        {/* SECTION E: AUDIENCE-SPECIFIC USE CASES (Study, Startups, Remote) */}
        <AudienceUseCasesSection onStartRoom={onStartRoom} />

        {/* SECTION F: TRANSPARENT PRICING (Free, Day Pass, Monthly) */}
        <PricingSection onStartRoom={onStartRoom} />

        {/* SECTION G: FINAL CALL TO ACTION */}
        <FinalCtaSection onStartRoom={onStartRoom} onJoinCode={onJoinCode} />
      </main>

      {/* SECTION H: FOOTER & BRANDED MODALS */}
      <LandingFooter />
    </div>
  );
};
