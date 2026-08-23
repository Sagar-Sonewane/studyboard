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
    return `${window.location.origin}/?join=${inviteCode}`;
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
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full border hairline-border shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b hairline-border flex items-center justify-between">
          <h2 className="text-sm font-semibold text-neutral-900">
            {createdRoom ? 'Room created successfully' : 'Create a new study room'}
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
          {!user ? (
            <div className="text-center py-4">
              <ShieldAlert className="w-8 h-8 text-amber-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-neutral-800 mb-1">Host identity required</p>
              <p className="text-xs text-neutral-500 mb-4">
                Creating rooms and managing whiteboard sessions requires an account or active host identity.
              </p>
            </div>
          ) : !createdRoom ? (
            <form onSubmit={handleCreate} className="space-y-4">
              {error && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Room name
                </label>
                <input
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder={`${displayName || 'Alex'}'s Study Room`}
                  className="w-full px-3 py-2 text-xs border hairline-border rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-neutral-50 focus:bg-white transition-colors"
                />
                <p className="text-[11px] text-neutral-400 mt-1">
                  Give your session a name your participants will recognize.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" />
                {loading ? 'creating room...' : 'create room'}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-neutral-50 border hairline-border rounded-xl">
                <div className="text-xs text-neutral-500 mb-1">Room name</div>
                <div className="text-sm font-semibold text-neutral-900 mb-3">{createdRoom.name}</div>

                <div className="text-xs text-neutral-500 mb-1">Shareable invite link</div>
                <div className="flex items-center gap-1.5 bg-white p-2 border hairline-border rounded-lg">
                  <span className="text-xs font-mono text-neutral-700 truncate flex-1 select-all">
                    {getInviteLink(createdRoom.inviteCode)}
                  </span>
                  <button
                    onClick={() => handleCopyLink(createdRoom.inviteCode)}
                    className="px-2 py-1 text-xs bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-md transition-colors inline-flex items-center gap-1"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'copied' : 'copy'}
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleEnter}
                  className="flex-1 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  enter room now
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
