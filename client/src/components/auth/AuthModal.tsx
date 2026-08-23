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
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full border hairline-border shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b hairline-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
              SS
            </div>
            <h2 className="text-sm font-semibold text-neutral-900">
              {isConfigured ? (mode === 'signin' ? 'Sign in to StudySync' : 'Create an account') : 'Set active user'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isConfigured ? (
            <>
              {/* Tab selector */}
              <div className="flex border hairline-border rounded-lg p-0.5 mb-5 bg-neutral-50">
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    mode === 'signin'
                      ? 'bg-white text-neutral-900 shadow-sm'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  sign in
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    mode === 'signup'
                      ? 'bg-white text-neutral-900 shadow-sm'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  sign up
                </button>
              </div>

              {error && (
                <div className="mb-4 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
                  {error}
                </div>
              )}

              {successMsg && (
                <div className="mb-4 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-700">
                  {successMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3.5">
                {mode === 'signup' && (
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">
                      Display name
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Alex Parker"
                        className="w-full pl-9 pr-3 py-2 text-xs border hairline-border rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-neutral-50 focus:bg-white transition-colors"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex@example.com"
                      className="w-full pl-9 pr-3 py-2 text-xs border hairline-border rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-neutral-50 focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      minLength={6}
                      className="w-full pl-9 pr-3 py-2 text-xs border hairline-border rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-neutral-50 focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {mode === 'signin' ? (
                    <>
                      <LogIn className="w-3.5 h-3.5" /> sign in
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" /> create account
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-900 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  Development Mode
                </div>
                <p className="text-xs text-indigo-700 leading-relaxed">
                  Supabase environment variables are not yet loaded. You can set a simulated host user name to create rooms and test authenticated room features right away!
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Host display name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
                  <input
                    type="text"
                    value={devInputName}
                    onChange={(e) => setDevInputName(e.target.value)}
                    placeholder="Enter name (e.g. Host User, Sarah)"
                    className="w-full pl-9 pr-3 py-2 text-xs border hairline-border rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-neutral-50 focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleApplyDevUser}
                  className="flex-1 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition-colors"
                >
                  save active user
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
