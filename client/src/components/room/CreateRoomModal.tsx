import React, { useState } from 'react';
import { useAuth } from '../../lib/auth-context';
import { createRoom, RoomDetails } from '../../lib/api';
import { X, Plus, Copy, Check, ArrowRight, ShieldAlert } from 'lucide-react';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRoomCreated: (room: RoomDetails) => void;
}

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
  isOpen,
  onClose,
  onRoomCreated,
}) => {
  const { user, token, displayName } = useAuth();
  const [roomName, setRoomName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdRoom, setCreatedRoom] = useState<RoomDetails | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError('You must be signed in or have an active host identity to create a room');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const room = await createRoom(roomName || `${displayName || 'Study'}'s Room`, token);
      setCreatedRoom(room);
    } catch (err: any) {
      setError(err.message || 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  const getInviteLink = (inviteCode: string) => {
    return `${window.location.origin}/room/${inviteCode}`;
  };

  const handleCopyLink = (code: string) => {
    navigator.clipboard.writeText(getInviteLink(code));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEnter = () => {
    if (createdRoom) {
      onRoomCreated(createdRoom);
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
              <Plus className="w-4 h-4 stroke-[3]" />
            </div>
            <div>
              <h2 className="font-display font-bold text-base text-[#15162B] leading-none">
                {createdRoom ? 'Room created successfully' : 'Create a new study room'}
              </h2>
              <p className="text-[11px] text-[#444654] mt-0.5 font-medium">
                {createdRoom ? 'Your collaborative session is ready' : 'Host real-time voice & infinite canvas'}
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
          {!user ? (
            <div className="p-5 bg-[#FFEAE8] border-2 border-[#FF5B4C] rounded-xl text-center hard-shadow-sm">
              <ShieldAlert className="w-8 h-8 text-[#FF5B4C] mx-auto mb-2" />
              <p className="font-display font-bold text-sm text-[#15162B] mb-1">Host identity required</p>
              <p className="text-xs text-[#444654] font-medium leading-relaxed">
                Creating rooms and managing live sessions requires an account or active host identity.
              </p>
            </div>
          ) : !createdRoom ? (
            <form onSubmit={handleCreate} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-[#FFEAE8] border-2 border-[#FF5B4C] text-xs font-medium text-[#C42616]">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#15162B] mb-1.5 font-display uppercase tracking-wider">
                  Room name
                </label>
                <input
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder={`${displayName || 'Alex'}'s Study Room`}
                  className="w-full px-3.5 py-2.5 text-xs border-2 border-[#15162B] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3355FF] bg-white hard-shadow-sm text-[#15162B] font-medium transition-all"
                />
                <p className="text-[11px] text-[#888A98] mt-1.5 font-medium">
                  Give your session a name participants will recognize on their invites.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-[#3355FF] hover:bg-[#2544e6] text-white text-xs font-display font-bold uppercase tracking-wider rounded-xl border-2 border-[#15162B] hard-shadow hard-shadow-hover transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                {loading ? 'Creating room...' : 'Create room'}
              </button>
            </form>
          ) : (
            <div className="space-y-5">
              <div className="p-4 bg-white border-2 border-[#15162B] rounded-xl hard-shadow-sm space-y-3">
                <div>
                  <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#888A98]">Room name</div>
                  <div className="text-base font-display font-bold text-[#15162B] mt-0.5">{createdRoom.name}</div>
                </div>

                <div>
                  <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#888A98] mb-1.5">Shareable invite link</div>
                  <div className="flex items-center gap-2 bg-[#FAF8F3] p-2 border-2 border-[#15162B] rounded-lg">
                    <span className="text-xs font-mono font-medium text-[#15162B] truncate flex-1 select-all">
                      {getInviteLink(createdRoom.inviteCode)}
                    </span>
                    <button
                      onClick={() => handleCopyLink(createdRoom.inviteCode)}
                      className="px-3 py-1.5 text-xs font-display font-bold bg-[#FFDD33] hover:bg-[#ffe55b] text-[#15162B] rounded-md border-2 border-[#15162B] transition-all inline-flex items-center gap-1.5 hard-shadow-sm active:translate-x-0.5 active:translate-y-0.5 cursor-pointer shrink-0"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 stroke-[3] text-[#00AA72]" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'Copied' : 'Copy link'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleEnter}
                  className="w-full py-3 px-4 bg-[#3355FF] hover:bg-[#2544e6] text-white text-xs font-display font-bold uppercase tracking-wider rounded-xl border-2 border-[#15162B] hard-shadow hard-shadow-hover transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  Enter room now
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
