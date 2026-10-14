import React, { useState } from 'react';
import { useAuth } from '../../lib/auth-context';
import { X, Mail, Lock, User as UserIcon, LogIn, UserPlus, Sparkles } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { isConfigured, signIn, signUp, setDevUser, displayName } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Dev user custom input
  const [devInputName, setDevInputName] = useState(displayName || 'Dev Host');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    if (mode === 'signup') {
      if (!name.trim()) {
        setError('Please enter a display name');
        setLoading(false);
        return;
      }
      const { error } = await signUp(email, password, name.trim());
      if (error) {
        setError(error.message);
      } else {
        setSuccessMsg('Account created! Please check your email for confirmation or sign in.');
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error.message);
      } else {
        onClose();
      }
    }
    setLoading(false);
  };

  const handleApplyDevUser = () => {
    if (devInputName.trim()) {
      setDevUser(devInputName.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#15162B]/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FAF8F3] rounded-2xl max-w-md w-full border-2 border-[#15162B] hard-shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b-2 border-[#15162B] bg-[#F7F5EF] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#3355FF] border-2 border-[#15162B] hard-shadow-sm flex items-center justify-center text-white font-display font-extrabold text-sm">
              SS
            </div>
            <div>
              <h2 className="font-display font-bold text-base text-[#15162B] leading-none">
                {isConfigured ? (mode === 'signin' ? 'Sign in to StudySync' : 'Create an account') : 'Set active user'}
              </h2>
              <p className="text-[11px] text-[#444654] mt-0.5 font-medium">
                {isConfigured ? 'Access your private whiteboard forks & rooms' : 'Simulated host profile for development'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="w-8 h-8 rounded-lg border-2 border-[#15162B] bg-white hover:bg-[#FF5B4C] hover:text-white text-[#15162B] transition-colors flex items-center justify-center hard-shadow-sm active:translate-x-0.5 active:translate-y-0.5"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isConfigured ? (
            <>
              {/* Tab selector */}
              <div className="flex bg-white border-2 border-[#15162B] rounded-xl p-1 mb-6 hard-shadow-sm gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  className={`flex-1 py-2 text-xs font-display font-bold rounded-lg transition-all ${
                    mode === 'signin'
                      ? 'bg-[#3355FF] text-white border-2 border-[#15162B] hard-shadow-sm'
                      : 'text-[#444654] hover:text-[#15162B]'
                  }`}
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  className={`flex-1 py-2 text-xs font-display font-bold rounded-lg transition-all ${
                    mode === 'signup'
                      ? 'bg-[#3355FF] text-white border-2 border-[#15162B] hard-shadow-sm'
                      : 'text-[#444654] hover:text-[#15162B]'
                  }`}
                >
                  Create account
                </button>
              </div>

              {error && (
                <div className="mb-5 p-3 rounded-xl bg-[#FFEAE8] border-2 border-[#FF5B4C] text-xs font-medium text-[#C42616] flex items-start gap-2">
                  <span className="font-bold">Error:</span> {error}
                </div>
              )}

              {successMsg && (
                <div className="mb-5 p-3 rounded-xl bg-[#E6F8F0] border-2 border-[#00AA72] text-xs font-medium text-[#006C48]">
                  {successMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'signup' && (
                  <div>
                    <label className="block text-xs font-bold text-[#15162B] mb-1 font-display uppercase tracking-wider">
                      Display name
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 absolute left-3.5 top-3 text-[#888A98]" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Alex Parker"
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs border-2 border-[#15162B] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3355FF] bg-white hard-shadow-sm text-[#15162B] font-medium transition-all"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-[#15162B] mb-1 font-display uppercase tracking-wider">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-3 text-[#888A98]" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex@example.com"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs border-2 border-[#15162B] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3355FF] bg-white hard-shadow-sm text-[#15162B] font-medium transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#15162B] mb-1 font-display uppercase tracking-wider">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-3 text-[#888A98]" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      minLength={6}
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs border-2 border-[#15162B] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3355FF] bg-white hard-shadow-sm text-[#15162B] font-medium transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-4 py-3 px-4 bg-[#3355FF] hover:bg-[#2544e6] text-white text-xs font-display font-bold uppercase tracking-wider rounded-xl border-2 border-[#15162B] hard-shadow hard-shadow-hover transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {mode === 'signin' ? (
                    <>
                      <LogIn className="w-4 h-4" /> Sign in
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" /> Create free account
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="space-y-5">
              <div className="p-4 bg-[#FFF9D6] border-2 border-[#15162B] rounded-xl hard-shadow-sm">
                <div className="flex items-center gap-2 text-xs font-bold text-[#15162B] font-display mb-1.5 uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-[#3355FF]" />
                  Development Mode
                </div>
                <p className="text-xs text-[#444654] leading-relaxed font-medium">
                  Supabase environment variables are not yet configured. You can set a simulated host name to test real-time room sessions, whiteboard forking, and participant controls instantly!
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#15162B] mb-1.5 font-display uppercase tracking-wider">
                  Host display name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3.5 top-3 text-[#888A98]" />
                  <input
                    type="text"
                    value={devInputName}
                    onChange={(e) => setDevInputName(e.target.value)}
                    placeholder="Enter name (e.g. Host User, Sarah)"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs border-2 border-[#15162B] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3355FF] bg-white hard-shadow-sm text-[#15162B] font-medium"
                  />
                </div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleApplyDevUser}
                  className="w-full py-3 px-4 bg-[#3355FF] hover:bg-[#2544e6] text-white text-xs font-display font-bold uppercase tracking-wider rounded-xl border-2 border-[#15162B] hard-shadow hard-shadow-hover transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  Save active profile
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
