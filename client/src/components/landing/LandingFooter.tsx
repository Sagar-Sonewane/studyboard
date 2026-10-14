import React, { useState } from 'react';
import { Shield, FileText, HelpCircle, MessageSquare, X } from 'lucide-react';
import { FEEDBACK_URL } from '../../config/landing';

export const LandingFooter: React.FC = () => {
  const [activeModal, setActiveModal] = useState<'privacy' | 'terms' | 'contact' | null>(null);

  return (
    <>
      <footer className="border-t-2 border-[#15162B] bg-[#F7F5EF] py-12 md:py-16">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-8 border-b border-[#15162B]/15">
            {/* Brand column */}
            <div className="space-y-2 max-w-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-md bg-[#3355FF] border-2 border-[#15162B] flex items-center justify-center text-white shrink-0">
                  <svg
                    className="w-3.5 h-3.5"
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
                <span className="font-display font-bold text-lg text-[#15162B]">
                  StudySync
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#444654] leading-relaxed">
                Talk, sketch, and solve problems together in one real-time room. Built for students, startups, and remote teams.
              </p>
            </div>

            {/* Nav & Legal Links */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-[#444654]">
              <a
                href="#problem"
                className="hover:text-[#15162B] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3355FF] rounded"
              >
                Why StudySync
              </a>
              <a
                href="#how-it-works"
                className="hover:text-[#15162B] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3355FF] rounded"
              >
                Workflow
              </a>
              <a
                href="#features"
                className="hover:text-[#15162B] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3355FF] rounded"
              >
                Features
              </a>
              <a
                href="#pricing"
                className="hover:text-[#15162B] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3355FF] rounded"
              >
                Pricing
              </a>
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
            </div>
          </div>

          {/* Bottom row: Feedback and copyright */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#444654]">
            <div className="flex items-center gap-2">
              <span>© {new Date().getFullYear()} StudySync. All rights reserved.</span>
            </div>

            <a
              href={FEEDBACK_URL}
              className="inline-flex items-center gap-1.5 font-bold text-[#3355FF] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3355FF] rounded"
            >
              <MessageSquare className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Share feedback with founders</span>
            </a>
          </div>
        </div>
      </footer>

      {/* Branded Legal Modals */}
      {activeModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div className="bg-[#F7F5EF] border-2 border-[#15162B] hard-shadow-xl rounded-2xl max-w-lg w-full p-6 sm:p-8 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#15162B]/10 mb-4">
              <div className="flex items-center gap-2">
                {activeModal === 'privacy' && <Shield className="w-5 h-5 text-[#3355FF]" />}
                {activeModal === 'terms' && <FileText className="w-5 h-5 text-[#3355FF]" />}
                {activeModal === 'contact' && <HelpCircle className="w-5 h-5 text-[#3355FF]" />}
                <h3 className="font-display font-bold text-xl text-[#15162B] capitalize">
                  {activeModal} Notice
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
                    <strong>StudySync Privacy Policy:</strong> We are committed to private, frictionless collaboration.
                  </p>
                  <p>
                    • We do not sell or monetize your board content, sketches, or personal information.<br />
                    • Audio communication streams are end-to-end encrypted through secure media servers.<br />
                    • Documents and uploaded slides are securely stored in protected cloud buckets attached only to active rooms.
                  </p>
                  <p>
                    For questions, data access, or deletion requests, contact our privacy officer directly at{' '}
                    <a href={FEEDBACK_URL} className="text-[#3355FF] underline font-medium">
                      hello@studysync.app
                    </a>.
                  </p>
                </>
              )}

              {activeModal === 'terms' && (
                <>
                  <p>
                    <strong>StudySync Terms of Service:</strong>
                  </p>
                  <p>
                    1. StudySync is provided for group study, remote sprint planning, and visual problem solving.<br />
                    2. Hosts and guests maintain ownership of all intellectual property created or uploaded to their rooms.<br />
                    3. Do not upload malicious, copyrighted, or unlawful material to shared canvases.<br />
                    4. Features and room limits are subject to continuous reliability improvements.
                  </p>
                </>
              )}

              {activeModal === 'contact' && (
                <>
                  <p>
                    Have questions about room limits, features, or classroom licensing?
                  </p>
                  <p>
                    Reach our development team directly at{' '}
                    <a href={FEEDBACK_URL} className="text-[#3355FF] font-bold underline">
                      hello@studysync.app
                    </a>.
                  </p>
                  <p>
                    We prioritize bug reports and feedback from active students, tutors, and remote teams.
                  </p>
                </>
              )}
            </div>

            <div className="pt-6 border-t-2 border-[#15162B]/10 mt-6 flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="px-5 py-2 bg-white text-[#15162B] font-display font-bold text-sm rounded-lg border-2 border-[#15162B] hard-shadow-sm hover:bg-[#F7F5EF] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
