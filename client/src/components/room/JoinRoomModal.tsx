import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../lib/auth-context';
import { getRoomByInviteCode, joinRoom, RoomDetails, JoinRoomResponse } from '../../lib/api';
import { X, LogIn, User as UserIcon, Loader2, AlertCircle } from 'lucide-react';

interface JoinRoomModalProps {
  isOpen: boolean;
  initialInviteCode?: string;
  isStandalone?: boolean;
  onClose: () => void;
  onRoomJoined: (joined: JoinRoomResponse & { roomDetails?: RoomDetails }) => void;
}

export const JoinRoomModal: React.FC<JoinRoomModalProps> = ({
  isOpen,
  initialInviteCode = '',
  isStandalone = false,
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
    <div
      className={
        isStandalone
          ? 'min-h-screen bg-[#F7F5EF] flex flex-col items-center justify-center p-4'
          : 'fixed inset-0 z-50 bg-[#15162B]/50 backdrop-blur-xs flex items-center justify-center p-4'
      }
    >
      {isStandalone && (
        <a href="/" className="flex items-center gap-2.5 mb-8 group cursor-pointer">
          <div className="w-9 h-9 rounded-lg bg-[#3355FF] border-2 border-[#15162B] hard-shadow-sm flex items-center justify-center text-white font-display font-extrabold text-sm">
            SS
          </div>
          <span className="font-display font-bold text-2xl tracking-tight text-[#15162B]">
            StudySync
          </span>
        </a>
      )}

      <div className="bg-[#FAF8F3] rounded-2xl max-w-md w-full border-2 border-[#15162B] hard-shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b-2 border-[#15162B] bg-[#F7F5EF] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#3355FF] border-2 border-[#15162B] hard-shadow-sm flex items-center justify-center text-white font-display font-extrabold text-sm">
              <LogIn className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-display font-bold text-base text-[#15162B] leading-none">
                {roomDetails ? 'Join study session' : 'Enter room invite code'}
              </h2>
              <p className="text-[11px] text-[#444654] mt-0.5 font-medium">
                {roomDetails ? 'Collaborate on live whiteboard & audio' : 'Connect to a colleague or classmate’s board'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="w-8 h-8 rounded-lg border-2 border-[#15162B] bg-white hover:bg-[#FF5B4C] hover:text-white text-[#15162B] transition-colors flex items-center justify-center hard-shadow-sm active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-[#FFEAE8] border-2 border-[#FF5B4C] text-xs font-medium text-[#C42616] flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-[#FF5B4C]" />
              <span>{error}</span>
            </div>
          )}

          {!roomDetails ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#15162B] mb-1.5 font-display uppercase tracking-wider">
                  Invite code or link
                </label>
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  placeholder="e.g. abc-xyz or full invite URL"
                  className="w-full px-3.5 py-2.5 text-xs border-2 border-[#15162B] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3355FF] bg-white hard-shadow-sm text-[#15162B] font-mono font-medium transition-all"
                />
                <p className="text-[11px] text-[#888A98] mt-1.5 font-medium">
                  Paste the invite code from your host or a full shareable URL.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  let clean = inviteCode.trim();
                  if (clean.includes('/room/')) {
                    clean = clean.split('/room/')[1]?.split('?')[0]?.split('/')[0] || clean;
                  } else if (clean.includes('join=')) {
                    clean = clean.split('join=')[1]?.split('&')[0] || clean;
                  }
                  resolveInvite(clean);
                }}
                disabled={resolving || !inviteCode.trim()}
                className="w-full py-3 px-4 bg-[#3355FF] hover:bg-[#2544e6] text-white text-xs font-display font-bold uppercase tracking-wider rounded-xl border-2 border-[#15162B] hard-shadow hard-shadow-hover transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {resolving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Verifying invite...
                  </>
                ) : (
                  'Find room'
                )}
              </button>
            </div>
          ) : (
            <form onSubmit={handleJoin} className="space-y-5">
              {/* Room Card Preview */}
              <div className="p-4 bg-white border-2 border-[#15162B] rounded-xl hard-shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#888A98]">Room details</span>
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-[#006C48] bg-[#E6F8F0] px-2.5 py-0.5 rounded-full border border-[#00AA72]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00AA72] animate-pulse" />
                    LIVE SESSION
                  </span>
                </div>
                <div className="text-base font-display font-bold text-[#15162B]">{roomDetails.name}</div>
                <div className="text-xs text-[#444654] font-medium">
                  Hosted by <span className="font-bold text-[#15162B]">{roomDetails.hostName}</span>
                </div>
              </div>

              {user ? (
                <div className="p-3.5 bg-[#FFF9D6] border-2 border-[#15162B] rounded-xl hard-shadow-sm">
                  <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#888A98] mb-0.5">Joining with account</div>
                  <div className="text-xs text-[#15162B] font-display font-bold">{displayName || user.email}</div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-[#15162B] font-display uppercase tracking-wider">
                      Your guest name
                    </label>
                    <span className="text-[10px] text-[#00AA72] font-mono font-bold bg-[#E6F8F0] px-1.5 py-0.5 rounded border border-[#00AA72]/30">
                      No account required
                    </span>
                  </div>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 absolute left-3.5 top-3 text-[#888A98]" />
                    <input
                      type="text"
                      required
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="e.g. Jordan (Design Lead)"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs border-2 border-[#15162B] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3355FF] bg-white hard-shadow-sm text-[#15162B] font-medium transition-all"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setRoomDetails(null)}
                  className="px-4 py-2.5 text-xs font-display font-bold rounded-xl border-2 border-[#15162B] bg-white hover:bg-[#F0EEE6] text-[#15162B] hard-shadow-sm transition-all cursor-pointer"
                >
                  Change code
                </button>
                <button
                  type="submit"
                  disabled={joining}
                  className="flex-1 py-3 px-4 bg-[#3355FF] hover:bg-[#2544e6] text-white text-xs font-display font-bold uppercase tracking-wider rounded-xl border-2 border-[#15162B] hard-shadow hard-shadow-hover transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {joining ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Entering session...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" /> Enter room
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
