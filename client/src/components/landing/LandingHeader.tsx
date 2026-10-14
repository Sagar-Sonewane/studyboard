import React, { useState } from 'react';
import { LogOut, Menu, X, ArrowRight, KeyRound } from 'lucide-react';

interface LandingHeaderProps {
  onStartRoom: () => void;
  onJoinCode: () => void;
  onLogin: () => void;
  onSignOut?: () => void;
  user?: { email?: string; id?: string } | null;
  displayName?: string | null;
}

export const LandingHeader: React.FC<LandingHeaderProps> = ({
  onStartRoom,
  onJoinCode,
  onLogin,
  onSignOut,
  user,
  displayName,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Why StudySync', href: '#problem' },
    { label: 'How it works', href: '#how-it-works' },
    { label: 'Features', href: '#features' },
    { label: 'Use cases', href: '#who-its-for' },
    { label: 'Pricing', href: '#pricing' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#F7F5EF]/95 backdrop-blur-md border-b-2 border-[#15162B] h-[72px]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 h-full flex items-center justify-between">
        {/* Brand Wordmark & Glyph */}
        <a
          href="/"
          className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3355FF] rounded-lg p-1"
        >
          <div className="w-8 h-8 rounded-lg bg-[#3355FF] border-2 border-[#15162B] hard-shadow-xs flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform">
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

        {/* Center Nav Links (Desktop) */}
        <nav
          aria-label="Main Navigation"
          className="hidden lg:flex items-center gap-7 font-display font-medium text-sm text-[#15162B]"
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="hover:text-[#3355FF] transition-colors py-1.5 px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3355FF] rounded"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            onClick={onJoinCode}
            className="hidden sm:inline-flex min-h-[40px] px-3 py-1.5 text-xs font-display font-bold text-[#15162B] hover:text-[#3355FF] border border-[#15162B]/20 hover:border-[#15162B] bg-white rounded-lg transition-colors cursor-pointer items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3355FF]"
          >
            <KeyRound className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Join room</span>
          </button>

          {user ? (
            <div className="flex items-center gap-2">
              <span className="hidden xl:inline-block text-xs font-mono text-[#444654] max-w-[140px] truncate">
                {displayName || user.email}
              </span>
              {onSignOut && (
                <button
                  onClick={onSignOut}
                  className="min-h-[40px] min-w-[40px] p-2 rounded-lg border-2 border-[#15162B] bg-white hover:bg-[#FFE3E0] text-[#15162B] transition-colors flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3355FF]"
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
              className="hidden sm:inline-flex min-h-[40px] px-3 py-1.5 text-xs font-display font-bold text-[#15162B] hover:text-[#3355FF] transition-colors cursor-pointer items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3355FF] rounded-lg"
            >
              Sign in
            </button>
          )}

          <button
            onClick={onStartRoom}
            className="min-h-[42px] px-4 py-2 bg-[#3355FF] text-white font-display font-bold text-xs sm:text-sm rounded-lg border-2 border-[#15162B] hard-shadow-sm hard-shadow-hover inline-flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3355FF]"
          >
            <span>Create room</span>
            <ArrowRight className="w-3.5 h-3.5 hidden sm:inline-block" aria-hidden="true" />
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden min-h-[42px] min-w-[42px] p-2 rounded-lg border-2 border-[#15162B] bg-white text-[#15162B] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3355FF]"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#F7F5EF] border-b-2 border-[#15162B] px-6 py-6 hard-shadow-lg animate-in slide-in-from-top-2 duration-150">
          <nav className="flex flex-col gap-4 font-display font-medium text-base text-[#15162B]">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 hover:text-[#3355FF] border-b border-[#15162B]/10"
              >
                {link.label}
              </a>
            ))}

            <div className="pt-2 flex flex-col gap-3">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onJoinCode();
                }}
                className="w-full min-h-[44px] px-4 py-2 bg-white text-[#15162B] font-display font-bold text-sm rounded-lg border-2 border-[#15162B] flex items-center justify-center gap-2"
              >
                <KeyRound className="w-4 h-4 text-[#3355FF]" />
                <span>Join with invite code</span>
              </button>

              {!user && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogin();
                  }}
                  className="w-full min-h-[44px] px-4 py-2 bg-[#E5EDFF] text-[#3355FF] font-display font-bold text-sm rounded-lg border-2 border-[#3355FF] flex items-center justify-center"
                >
                  Sign in
                </button>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
