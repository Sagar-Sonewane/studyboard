import React from 'react';
import { Check, Sparkles, Shield, ArrowRight } from 'lucide-react';
import { PLAN_LIMITS } from '../../config/landing';

interface PricingSectionProps {
  onStartRoom: () => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ onStartRoom }) => {
  const plans = [
    PLAN_LIMITS.free,
    PLAN_LIMITS.dayPass,
    PLAN_LIMITS.monthly,
  ];

  return (
    <section
      id="pricing"
      className="py-20 md:py-28 bg-[#F7F5EF] border-b-2 border-[#15162B] relative scroll-mt-[72px]"
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 md:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border-2 border-[#15162B] hard-shadow-xs rounded-full text-xs font-mono font-bold text-[#15162B] mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#3355FF]" aria-hidden="true" />
            <span>TRANSPARENT, HONEST TIERS</span>
          </div>

          <h2 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl text-[#15162B] tracking-tight leading-[1.15] [text-wrap:balance]">
            Simple plans.{' '}
            <span className="relative inline-block px-1">
              <span className="relative z-10">Guests always join free.</span>
              <span
                className="absolute inset-x-0 bottom-1 h-3.5 bg-[#FFDD33] -rotate-1 rounded-sm -z-0"
                aria-hidden="true"
              />
            </span>
          </h2>

          <p className="mt-4 text-base sm:text-lg text-[#444654] leading-relaxed">
            Only the room host needs a plan. Your students, clients, and collaborators jump straight into the canvas without entering payment details or creating accounts.
          </p>
        </div>

        {/* Pricing Cards Grid: Aligned tops and tightened spacing */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {plans.map((plan) => {
            const isFree = plan.id === 'free';

            return (
              <div
                key={plan.id}
                className={`relative bg-white border-2 border-[#15162B] rounded-2xl md:rounded-3xl flex flex-col justify-between transition-all duration-200 ${
                  isFree
                    ? 'hard-shadow-lg ring-2 ring-[#3355FF]/20'
                    : 'hard-shadow'
                }`}
              >
                {/* Free Tier Best Value Badge */}
                {isFree && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#3355FF] text-white font-mono text-[11px] font-bold uppercase tracking-wider px-3.5 py-1 rounded-full border-2 border-[#15162B] hard-shadow-xs">
                    Ready to use right now
                  </div>
                )}

                {/* Day Pass Badge */}
                {plan.badge && !isFree && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#FFDD33] text-[#15162B] font-mono text-[11px] font-bold uppercase tracking-wider px-3.5 py-1 rounded-full border-2 border-[#15162B] hard-shadow-xs">
                    {plan.badge}
                  </div>
                )}

                {/* Top Half of Card (Tightened dead space) */}
                <div className="p-6 sm:p-7 pb-4">
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#444654]">
                      {plan.name}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-1.5 mb-3">
                    <span className="font-display font-bold text-4xl sm:text-5xl text-[#15162B]">
                      {plan.price}
                    </span>
                    <span className="text-sm font-medium text-[#444654]">
                      {plan.cadence}
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-lg text-[#15162B] mb-2 [text-wrap:balance]">
                    {plan.headline}
                  </h3>

                  <p className="text-sm text-[#444654] leading-relaxed mb-2 font-normal">
                    {plan.description}
                  </p>
                </div>

                {/* Perforated Divider (Clean dashed line, continuous border without stray notches) */}
                <div className="px-6 sm:p-7 py-0" aria-hidden="true">
                  <div className="border-b-2 border-dashed border-[#15162B]/20" />
                </div>

                {/* Bottom Half: Features & Action Button */}
                <div className="p-6 sm:p-7 pt-5 flex flex-col justify-between flex-1 space-y-6">
                  <ul className="space-y-3" role="list">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#15162B]">
                        <div className="w-4 h-4 rounded-full bg-[#E5EDFF] border border-[#3355FF] flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-[#3355FF]" strokeWidth={3} aria-hidden="true" />
                        </div>
                        <span className="leading-snug">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-2">
                    {plan.buttonActive ? (
                      <button
                        onClick={onStartRoom}
                        className="w-full min-h-[46px] px-4 py-3 bg-[#3355FF] text-white font-display font-bold text-sm rounded-xl border-2 border-[#15162B] hard-shadow hard-shadow-hover inline-flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3355FF]"
                      >
                        <span>{plan.buttonText}</span>
                        <ArrowRight className="w-4 h-4" aria-hidden="true" />
                      </button>
                    ) : (
                      <button
                        disabled
                        aria-disabled="true"
                        className="w-full min-h-[46px] px-4 py-3 bg-[#EFECE3] text-[#717382] font-display font-bold text-sm rounded-xl border-2 border-[#15162B]/30 inline-flex items-center justify-center gap-2 cursor-not-allowed"
                        title="Paid tiers will become active when billing integrations open"
                      >
                        <span>{plan.buttonText}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Clear Policy Reassurance Footer Strip */}
        <div className="mt-12 max-w-3xl mx-auto bg-white border-2 border-[#15162B] rounded-2xl p-5 sm:p-6 hard-shadow flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFF9D6] border-2 border-[#15162B] flex items-center justify-center text-[#15162B] shrink-0">
              <Shield className="w-5 h-5 text-[#3355FF]" aria-hidden="true" />
            </div>
            <div>
              <h4 className="font-display font-bold text-sm text-[#15162B]">
                Need custom workspace limits for your university or school?
              </h4>
              <p className="text-xs text-[#444654] mt-0.5">
                We accommodate bulk classroom cohorts and academic organizations on request.
              </p>
            </div>
          </div>

          <a
            href="mailto:support@studysync.app?subject=Education%20Tier%20Inquiry"
            className="shrink-0 px-4 py-2.5 bg-white border-2 border-[#15162B] rounded-xl text-xs font-display font-bold text-[#15162B] hover:bg-[#F2EFE6] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3355FF]"
          >
            Contact team
          </a>
        </div>
      </div>
    </section>
  );
};
