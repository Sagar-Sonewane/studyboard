import React, { useState, useEffect } from 'react';
import { ParticipantState } from '../../hooks/use-room-presence';
import { VoiceConnectionState } from '../../hooks/use-livekit-voice';
import {
  Crown,
  Mic,
  MicOff,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Users,
  LogOut,
  Volume2,
} from 'lucide-react';

export type RailState = 'expanded' | 'collapsed' | 'hidden';

const RAIL_STORAGE_KEY = 'studysync_rail_state';

interface ParticipantRailProps {
  participants: ParticipantState[];
  currentParticipantId: string;
  isMuted: boolean;
  isSpeaking: boolean;
  voiceStatus: VoiceConnectionState;
  speakingIdentities?: Set<string>;
  mutedIdentities?: Set<string>;
  onToggleMute: () => void;
  onLeaveRoom: () => void;
  onToggleSimulateSpeak?: () => void;
}

// Consistent curated avatar colors
const AVATAR_COLORS = [
  'bg-indigo-500 text-white',
  'bg-emerald-500 text-white',
  'bg-amber-500 text-white',
  'bg-violet-500 text-white',
  'bg-rose-500 text-white',
  'bg-cyan-500 text-white',
  'bg-blue-500 text-white',
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

export const ParticipantRail: React.FC<ParticipantRailProps> = ({
  participants,
  currentParticipantId,
  isMuted,
  isSpeaking,
  voiceStatus,
  speakingIdentities = new Set(),
  mutedIdentities = new Set(),
  onToggleMute,
  onLeaveRoom,
  onToggleSimulateSpeak,
}) => {
  // Retrieve saved preference or default to expanded
  const [railState, setRailState] = useState<RailState>(() => {
    const saved = localStorage.getItem(RAIL_STORAGE_KEY);
    if (saved === 'expanded' || saved === 'collapsed' || saved === 'hidden') {
      return saved;
    }
    return 'expanded';
  });

  useEffect(() => {
    localStorage.setItem(RAIL_STORAGE_KEY, railState);
  }, [railState]);

  // Helper to check if a specific participant is speaking (LiveKit identity or WS presence)
  const isParticipantSpeaking = (p: ParticipantState) => {
    if (p.participantId === currentParticipantId) {
      return isSpeaking || p.speaking || speakingIdentities.has(p.participantId);
    }
    return p.speaking || speakingIdentities.has(p.participantId) || (p.userId ? speakingIdentities.has(p.userId) : false);
  };

  // Helper to check if a participant is muted
  const isParticipantMuted = (p: ParticipantState) => {
    if (p.participantId === currentParticipantId) {
      return isMuted;
    }
    return p.muted || mutedIdentities.has(p.participantId) || (p.userId ? mutedIdentities.has(p.userId) : false);
  };

  // State 3: Hidden floating pill (anchored top-left of canvas per DESIGN.md)
  if (railState === 'hidden') {
    return (
      <div className="absolute top-3 left-3 z-30 animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={() => setRailState('expanded')}
          className="flex items-center gap-2 px-3 py-1.5 bg-white/95 backdrop-blur-sm border hairline-border rounded-full shadow-xs hover:bg-neutral-50 transition-colors group cursor-pointer"
          title="Show participant list"
        >
          <div className="flex -space-x-2 overflow-hidden">
            {participants.slice(0, 3).map((p) => {
              const speaking = isParticipantSpeaking(p);
              return (
                <div
                  key={p.participantId}
                  className={`inline-block h-5 w-5 rounded-full ring-2 ring-white flex items-center justify-center text-[9px] font-semibold ${getAvatarColor(
                    p.displayName
                  )} ${speaking ? 'ring-emerald-400 ring-offset-0 animate-pulse' : ''}`}
                >
                  {p.displayName.slice(0, 1).toUpperCase()}
                </div>
              );
            })}
          </div>

          <span className="text-xs font-medium text-neutral-700">
            {participants.length} {participants.length === 1 ? 'person' : 'people'}
          </span>

          <Maximize2 className="w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-700 transition-colors" />
        </button>
      </div>
    );
  }

  // State 2: Collapsed vertical strip (avatars only)
  if (railState === 'collapsed') {
    return (
      <aside className="w-14 border-r hairline-border bg-white flex flex-col justify-between shrink-0 transition-all duration-200 z-20 select-none">
        {/* Top toggle */}
        <div>
          <div className="p-2 border-b hairline-border flex justify-center">
            <button
              onClick={() => setRailState('expanded')}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 transition-colors cursor-pointer"
              title="Expand participant list"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Avatars Stack */}
          <div className="p-2 space-y-2.5 overflow-y-auto max-h-[calc(100vh-180px)]">
            {participants.map((p) => {
              const isSelf = p.participantId === currentParticipantId;
              const speaking = isParticipantSpeaking(p);
              const muted = isParticipantMuted(p);

              return (
                <div key={p.participantId} className="relative group flex justify-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold relative ${getAvatarColor(
                      p.displayName
                    )} ${speaking ? 'ring-2 ring-emerald-500 ring-offset-1 animate-pulse' : ''}`}
                  >
                    {p.displayName.slice(0, 2).toUpperCase()}

                    {p.isHost && (
                      <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-400 flex items-center justify-center text-white">
                        <Crown className="w-2.5 h-2.5 text-amber-900" />
                      </div>
                    )}
                  </div>

                  {/* Tooltip on hover */}
                  <div className="absolute left-12 top-1/2 -translate-y-1/2 bg-neutral-900 text-white text-xs px-2.5 py-1.5 rounded-lg shadow-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 flex items-center gap-1.5">
                    <span>{p.displayName}</span>
                    {isSelf && <span className="text-neutral-400">(you)</span>}
                    {p.isHost && <span className="text-amber-300">· host</span>}
                    <span className="text-neutral-400">·</span>
                    {muted ? (
                      <span className="text-rose-300 text-[10px]">muted</span>
                    ) : speaking ? (
                      <span className="text-emerald-300 text-[10px]">speaking</span>
                    ) : (
                      <span className="text-neutral-300 text-[10px]">mic on</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Collapsed Call Controls */}
        <div className="p-2 border-t hairline-border flex flex-col gap-2 items-center">
          <button
            onClick={onToggleMute}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              isMuted
                ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
            title={isMuted ? 'unmute microphone' : 'mute microphone'}
          >
            {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <button
            onClick={onLeaveRoom}
            className="p-2 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            title="leave room"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>
    );
  }

  // State 1: Expanded (default on first join)
  return (
    <aside className="w-60 border-r hairline-border bg-neutral-50/50 flex flex-col justify-between shrink-0 transition-all duration-200 z-20 select-none">
      {/* Header with state toggles */}
      <div>
        <div className="p-3.5 border-b hairline-border bg-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-neutral-600" />
            <h2 className="text-xs font-semibold text-neutral-900 tracking-tight">
              participants ({participants.length})
            </h2>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setRailState('collapsed')}
              className="p-1 rounded-md text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 transition-colors cursor-pointer"
              title="collapse to avatar strip"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setRailState('hidden')}
              className="p-1 rounded-md text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 transition-colors text-[10px] font-mono px-1 cursor-pointer"
              title="hide to floating pill"
            >
              hide
            </button>
          </div>
        </div>

        {/* Participant Rows — compact rows per DESIGN.md */}
        <div className="p-2.5 space-y-1.5 overflow-y-auto max-h-[calc(100vh-230px)]">
          {participants.map((p) => {
            const isSelf = p.participantId === currentParticipantId;
            const speaking = isParticipantSpeaking(p);
            const muted = isParticipantMuted(p);

            return (
              <div
                key={p.participantId}
                className={`p-2 rounded-xl border hairline-border flex items-center justify-between transition-colors ${
                  isSelf ? 'bg-white shadow-xs' : 'bg-white/80 hover:bg-white'
                } ${speaking ? 'border-emerald-300' : ''}`}
              >
                {/* Left: Avatar & Info */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 relative ${getAvatarColor(
                      p.displayName
                    )} ${speaking ? 'ring-2 ring-emerald-500 ring-offset-1 animate-pulse' : ''}`}
                  >
                    {p.displayName.slice(0, 2).toUpperCase()}
                  </div>

                  <div className="truncate">
                    <div className="text-xs font-medium text-neutral-900 truncate flex items-center gap-1">
                      <span className="truncate">{p.displayName}</span>
                      {isSelf && <span className="text-[10px] text-neutral-400 font-normal shrink-0">(you)</span>}
                    </div>
                    <div className="text-[10px] text-neutral-400 flex items-center gap-1">
                      {p.isHost ? (
                        <span className="text-amber-700 font-medium inline-flex items-center gap-0.5">
                          <Crown className="w-2.5 h-2.5 text-amber-500" /> host
                        </span>
                      ) : p.guestName ? (
                        <span>guest</span>
                      ) : (
                        <span>member</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Mic status icon inline in each row per DESIGN.md */}
                <div className="flex items-center gap-1 shrink-0 ml-1">
                  {muted ? (
                    <div className="p-1 rounded-md text-neutral-400" title="microphone muted">
                      <MicOff className="w-3.5 h-3.5 text-neutral-400" />
                    </div>
                  ) : speaking ? (
                    <div className="p-1 rounded-md text-emerald-600 animate-pulse bg-emerald-50" title="speaking now">
                      <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                  ) : (
                    <div className="p-1 rounded-md text-neutral-400" title="microphone active">
                      <Mic className="w-3.5 h-3.5 text-neutral-400" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Call Controls anchored at bottom of rail per DESIGN.md */}
      <div className="p-3 border-t hairline-border bg-white flex flex-col gap-2">
        {/* Voice status indicator badge */}
        <div className="flex items-center justify-between text-[11px] px-1 text-neutral-500">
          <span className="flex items-center gap-1.5">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                voiceStatus === 'connected'
                  ? 'bg-emerald-500 animate-pulse'
                  : voiceStatus === 'connecting' || voiceStatus === 'reconnecting'
                  ? 'bg-amber-500 animate-pulse'
                  : voiceStatus === 'fallback'
                  ? 'bg-indigo-500'
                  : 'bg-neutral-300'
              }`}
            />
            {voiceStatus === 'connected'
              ? 'voice live'
              : voiceStatus === 'connecting'
              ? 'connecting voice...'
              : voiceStatus === 'reconnecting'
              ? 'reconnecting voice...'
              : voiceStatus === 'fallback'
              ? 'simulated voice'
              : 'voice offline'}
          </span>

          {onToggleSimulateSpeak && (
            <button
              onClick={onToggleSimulateSpeak}
              className={`text-[10px] px-1.5 py-0.5 rounded border hairline-border cursor-pointer ${
                isSpeaking ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'text-neutral-500 hover:bg-neutral-50'
              }`}
              title="test speaking indicator"
            >
              {isSpeaking ? 'speaking...' : 'test speak'}
            </button>
          )}
        </div>

        {/* Action Row */}
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={onToggleMute}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
              isMuted
                ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                : 'bg-neutral-100 text-neutral-800 hover:bg-neutral-200'
            }`}
          >
            {isMuted ? (
              <>
                <MicOff className="w-3.5 h-3.5 text-rose-600" />
                <span>unmute mic</span>
              </>
            ) : (
              <>
                <Mic className="w-3.5 h-3.5 text-neutral-600" />
                <span>mute mic</span>
              </>
            )}
          </button>

          <button
            onClick={onLeaveRoom}
            className="p-2 rounded-lg text-neutral-500 hover:text-rose-600 hover:bg-rose-50 border hairline-border transition-colors cursor-pointer"
            title="leave room"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
