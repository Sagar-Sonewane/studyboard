import React from 'react';
import { ArrowRight, KeyRound, Sparkles, CheckCircle2 } from 'lucide-react';

interface FinalCtaSectionProps {
  onStartRoom: () => void;
  onJoinCode: () => void;
}

export const FinalCtaSection: React.FC<FinalCtaSectionProps> = ({
  onStartRoom,
  onJoinCode,
}) => {
  return (
    <section className="py-20 md:py-28 bg-[#15162B] text-white relative overflow-hidden">
      {/* Decorative Blueprint Canvas Grid Lines */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle, #FFFFFF 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
        aria-hidden="true"
      />

      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 md:px-8 relative z-10 text-center">
        {/* Eyebrow Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/10 border border-white/20 rounded-full text-xs font-mono font-bold text-[#FFDD33] mb-6">
          <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
          <span>ZERO SETUP · INSTANT ACCESS</span>
        </div>

        {/* Closing Headline */}
        <h2 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight leading-[1.15] max-w-3xl mx-auto">
          Your next great idea{' '}
          <span className="relative inline-block px-1">
            <span className="relative z-10 text-white">starts in a room.</span>
            <span
              className="absolute inset-x-0 bottom-2 h-4 bg-[#3355FF] -rotate-1 rounded-sm -z-0 opacity-90"
              aria-hidden="true"
            />
          </span>
        </h2>

        {/* Narrative Copy */}
        <p className="mt-6 text-base sm:text-lg md:text-xl text-[#B9BAC7] max-w-2xl mx-auto leading-relaxed">
          Skip the hassle of coordinating call links and whiteboard invites. Launch a unified room, drop the invite link to your team, and begin solving problems together immediately.
        </p>

        {/* Actions */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onStartRoom}
            className="w-full sm:w-auto min-h-[52px] px-8 py-3.5 bg-[#3355FF] text-white font-display font-bold text-base rounded-xl border-2 border-white hard-shadow hard-shadow-hover inline-flex items-center justify-center gap-2.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFDD33]"
          >
            <span>Create a room now</span>
            <ArrowRight className="w-5 h-5" aria-hidden="true" />
          </button>

          <button
            onClick={onJoinCode}
            className="w-full sm:w-auto min-h-[52px] px-7 py-3.5 bg-white/10 hover:bg-white/20 text-white font-display font-bold text-base rounded-xl border-2 border-white/30 inline-flex items-center justify-center gap-2.5 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFDD33]"
          >
            <KeyRound className="w-4 h-4 text-[#FFDD33]" aria-hidden="true" />
            <span>Join with an invite code</span>
          </button>
        </div>

        {/* Trust & Policy Reassurances */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-[#B9BAC7] font-mono">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#00AA72]" aria-hidden="true" />
            <span>Free tier included</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#00AA72]" aria-hidden="true" />
            <span>No account required for guests</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#00AA72]" aria-hidden="true" />
            <span>Zero software downloads</span>
          </div>
        </div>
      </div>
    </section>
  );
};
