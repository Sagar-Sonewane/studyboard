import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../lib/auth-context';
import { getRoomByInviteCode, joinRoom, RoomDetails, JoinRoomResponse } from '../../lib/api';
import { X, LogIn, User as UserIcon, Loader2, AlertCircle } from 'lucide-react';

interface JoinRoomModalProps {
  isOpen: boolean;
  initialInviteCode?: string;
  onClose: () => void;
  onRoomJoined: (joined: JoinRoomResponse & { roomDetails?: RoomDetails }) => void;
}

export const JoinRoomModal: React.FC<JoinRoomModalProps> = ({
  isOpen,
  initialInviteCode = '',
  onClose,
  onRoomJoined,
}) => {
  const { user, token, displayName } = useAuth();
  const [inviteCode, setInviteCode] = useState(initialInviteCode);
  const [guestName, setGuestName] = useState('');
  const [roomDetails, setRoomDetails] = useState<RoomDetails | null>(null);
  const [resolving, setResolving] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resolveInvite = useCallback(async (code: string) => {
    if (!code.trim()) return;
    setError(null);
    setResolving(true);
    try {
      const details = await getRoomByInviteCode(code.trim());
      setRoomDetails(details);
    } catch (err: any) {
      setRoomDetails(null);
      setError(err.message || 'Room not found or invite code is invalid');
    } finally {
      setResolving(false);
    }
  }, []);

  useEffect(() => {
    if (initialInviteCode) {
      setInviteCode(initialInviteCode);
      resolveInvite(initialInviteCode);
    }
  }, [initialInviteCode, resolveInvite]);

  if (!isOpen) return null;

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomDetails) return;

    if (!user && !guestName.trim()) {
      setError('Please enter your name to join as a guest');
      return;
    }

    setError(null);
    setJoining(true);
    try {
      const result = await joinRoom(roomDetails.id, {
        token: user ? token : undefined,
        guestName: !user ? guestName.trim() : undefined,
      });

      onRoomJoined({
        ...result,
        roomDetails,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to join room');
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full border hairline-border shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b hairline-border flex items-center justify-between">
          <h2 className="text-sm font-semibold text-neutral-900">
            {roomDetails ? 'Join study session' : 'Enter room invite code'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!roomDetails ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Invite code or link
                </label>
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  placeholder="e.g. abc-xyz or full invite URL"
                  className="w-full px-3 py-2 text-xs border hairline-border rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-neutral-50 focus:bg-white"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  // extract code if full URL was pasted
                  const clean = inviteCode.includes('join=')
                    ? inviteCode.split('join=')[1]?.split('&')[0]
                    : inviteCode;
                  resolveInvite(clean);
                }}
                disabled={resolving || !inviteCode.trim()}
                className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {resolving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> checking code...
                  </>
                ) : (
                  'lookup room'
                )}
              </button>
            </div>
          ) : (
            <form onSubmit={handleJoin} className="space-y-4">
              {/* Room Card Preview */}
              <div className="p-4 bg-neutral-50 border hairline-border rounded-xl">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-neutral-500">Room to join</span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                    active
                  </span>
                </div>
                <div className="text-base font-semibold text-neutral-900 mb-1">{roomDetails.name}</div>
                <div className="text-xs text-neutral-500">
                  Host: <span className="font-medium text-neutral-700">{roomDetails.hostName}</span>
                </div>
              </div>

              {user ? (
                <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg">
                  <div className="text-xs font-medium text-indigo-900 mb-0.5">Joining with account:</div>
                  <div className="text-xs text-indigo-700 font-semibold">{displayName || user.email}</div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-neutral-700">
                      Your display name (guest)
                    </label>
                    <span className="text-[10px] text-neutral-400">No account required</span>
                  </div>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
                    <input
                      type="text"
                      required
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="e.g. Jordan"
                      className="w-full pl-9 pr-3 py-2 text-xs border hairline-border rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-neutral-50 focus:bg-white transition-colors"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setRoomDetails(null)}
                  className="px-3 py-2 text-xs border hairline-border rounded-lg hover:bg-neutral-50 text-neutral-600"
                >
                  change room
                </button>
                <button
                  type="submit"
                  disabled={joining}
                  className="flex-1 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {joining ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> joining...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-3.5 h-3.5" /> join room
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
