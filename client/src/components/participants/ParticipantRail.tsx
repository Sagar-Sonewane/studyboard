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
  PenTool,
  Lock,
} from 'lucide-react';

export type RailState = 'expanded' | 'collapsed' | 'hidden';

const RAIL_STORAGE_KEY = 'studysync_rail_state';

interface ParticipantRailProps {
  participants: ParticipantState[];
  currentParticipantId: string;
  isHost?: boolean;
  isMuted: boolean;
  isSpeaking: boolean;
  voiceStatus: VoiceConnectionState;
  isListenOnly?: boolean;
  needsAudioClick?: boolean;
  onStartAudio?: () => void;
  onRetryVoice?: () => void;
  speakingIdentities?: Set<string>;
  mutedIdentities?: Set<string>;
  onToggleMute: () => void;
  onLeaveRoom: () => void;
  onToggleSimulateSpeak?: () => void;
  onGrantDrawPermission?: (participantId: string) => void;
  onRevokeDrawPermission?: (participantId: string) => void;
}

export const ParticipantRail: React.FC<ParticipantRailProps> = ({
  participants,
  currentParticipantId,
  isHost = false,
  isMuted,
  isSpeaking,
  voiceStatus,
  isListenOnly = false,
  needsAudioClick = false,
  onStartAudio,
  onRetryVoice,
  speakingIdentities = new Set(),
  mutedIdentities = new Set(),
  onToggleMute,
  onLeaveRoom,
  onToggleSimulateSpeak,
  onGrantDrawPermission,
  onRevokeDrawPermission,
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
    return (
      p.speaking ||
      speakingIdentities.has(p.participantId) ||
      (p.userId ? speakingIdentities.has(p.userId) : false)
    );
  };

  // Helper to check if a participant is muted
  const isParticipantMuted = (p: ParticipantState) => {
    if (p.participantId === currentParticipantId) {
      return isMuted;
    }
    return (
      p.muted ||
      mutedIdentities.has(p.participantId) ||
      (p.userId ? mutedIdentities.has(p.userId) : false)
    );
  };

  // State 3: Hidden floating pill (anchored top-left of canvas per DESIGN.md)
  if (railState === 'hidden') {
    return (
      <div className="absolute top-3 left-3 z-30 animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={() => setRailState('expanded')}
          className="flex items-center gap-2 px-3.5 py-1.5 bg-[#FAF8F3] border-2 border-[#15162B] hard-shadow-xs rounded-full hover:bg-white transition-all group cursor-pointer"
          title="Show participant list"
        >
          <div className="flex -space-x-2 overflow-hidden">
            {participants.slice(0, 3).map((p) => {
              const speaking = isParticipantSpeaking(p);
              return (
                <div
                  key={p.participantId}
                  style={{ backgroundColor: p.color || '#3355FF' }}
                  className={`inline-block h-6 w-6 rounded-full ring-2 ring-white border border-[#15162B] flex items-center justify-center text-[10px] font-bold text-white ${
                    speaking ? 'ring-[#00AA72] animate-pulse' : ''
                  }`}
                >
                  {p.displayName.slice(0, 1).toUpperCase()}
                </div>
              );
            })}
          </div>

          <span className="text-xs font-display font-bold text-[#15162B]">
            {participants.length} {participants.length === 1 ? 'person' : 'people'}
          </span>

          <Maximize2 className="w-3.5 h-3.5 text-[#3355FF] group-hover:scale-110 transition-transform" />
        </button>
      </div>
    );
  }

  // State 2: Collapsed vertical strip (avatars only)
  if (railState === 'collapsed') {
    return (
      <aside className="w-16 border-r-2 border-[#15162B] bg-[#FAF8F3] flex flex-col justify-between shrink-0 transition-all duration-200 z-20 select-none">
        {/* Top toggle */}
        <div>
          <div className="p-2.5 border-b-2 border-[#15162B] flex justify-center bg-[#FAF8F3]">
            <button
              onClick={() => setRailState('expanded')}
              className="p-1.5 rounded-lg text-[#15162B] bg-white border border-[#15162B] hover:bg-[#F2EFE6] transition-colors cursor-pointer"
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
                    style={{ backgroundColor: p.color || '#3355FF' }}
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white relative border-2 border-[#15162B] ${
                      speaking ? 'ring-2 ring-[#00AA72] ring-offset-1 animate-pulse' : ''
                    }`}
                  >
                    {p.displayName.slice(0, 2).toUpperCase()}

                    {p.isHost && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FFDD33] border border-[#15162B] flex items-center justify-center text-[#15162B] shadow-xs">
                        <Crown className="w-2.5 h-2.5 text-[#15162B]" />
                      </div>
                    )}
                  </div>

                  {/* Tooltip on hover */}
                  <div className="absolute left-14 top-1/2 -translate-y-1/2 bg-[#15162B] text-white text-xs px-3 py-1.5 rounded-xl border border-white/20 shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 flex items-center gap-1.5 font-display font-medium">
                    <span>{p.displayName}</span>
                    {isSelf && <span className="text-[#B9BAC7]">(you)</span>}
                    {p.isHost && <span className="text-[#FFDD33]">· host</span>}
                    <span className="text-[#B9BAC7]">·</span>
                    {p.canDraw ? (
                      <span className="text-[#00AA72] text-[11px] font-mono">can draw</span>
                    ) : (
                      <span className="text-[#B9BAC7] text-[11px] font-mono">locked</span>
                    )}
                    <span className="text-[#B9BAC7]">·</span>
                    {muted ? (
                      <span className="text-[#FF5B4C] text-[11px] font-mono">muted</span>
                    ) : speaking ? (
                      <span className="text-[#00AA72] text-[11px] font-mono">speaking</span>
                    ) : (
                      <span className="text-[#FFDD33] text-[11px] font-mono">mic on</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Collapsed Call Controls */}
        <div className="p-2.5 border-t-2 border-[#15162B] flex flex-col gap-2 items-center bg-[#FAF8F3]">
          <button
            onClick={onToggleMute}
            className={`p-2 rounded-xl border-2 border-[#15162B] hard-shadow-xs transition-colors cursor-pointer ${
              isMuted
                ? 'bg-[#FFE3E0] text-[#FF5B4C] hover:bg-[#FFDAD5]'
                : 'bg-white text-[#3355FF] hover:bg-[#F2EFE6]'
            }`}
            title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
          >
            {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <button
            onClick={onLeaveRoom}
            className="p-2 rounded-xl text-[#15162B] bg-white hover:text-[#FF5B4C] hover:bg-[#FFE3E0] border-2 border-[#15162B] transition-colors cursor-pointer"
            title="Leave room"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>
    );
  }

  // State 1: Expanded (default on first join)
  return (
    <aside className="w-64 border-r-2 border-[#15162B] bg-[#FAF8F3] flex flex-col justify-between shrink-0 transition-all duration-200 z-20 select-none font-sans">
      {/* Header with state toggles */}
      <div>
        <div className="p-3.5 border-b-2 border-[#15162B] bg-[#FAF8F3] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#3355FF] border border-[#15162B] flex items-center justify-center text-white">
              <Users className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-xs font-display font-bold text-[#15162B] tracking-tight uppercase">
              Participants ({participants.length})
            </h2>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setRailState('collapsed')}
              className="p-1 rounded-md text-[#15162B] bg-white border border-[#15162B] hover:bg-[#F2EFE6] transition-colors cursor-pointer"
              title="Collapse to avatar strip"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setRailState('hidden')}
              className="px-1.5 py-0.5 rounded-md text-[#15162B] bg-white border border-[#15162B] hover:bg-[#F2EFE6] transition-colors text-[10px] font-mono font-bold cursor-pointer"
              title="Hide to floating pill"
            >
              hide
            </button>
          </div>
        </div>

        {/* Participant Rows — compact cards per StudySync design */}
        <div className="p-2.5 space-y-2 overflow-y-auto max-h-[calc(100vh-230px)]">
          {participants.map((p) => {
            const isSelf = p.participantId === currentParticipantId;
            const speaking = isParticipantSpeaking(p);
            const muted = isParticipantMuted(p);

            return (
              <div
                key={p.participantId}
                className={`p-2.5 rounded-xl border-2 border-[#15162B] flex items-center justify-between transition-all ${
                  isSelf
                    ? 'bg-white hard-shadow-sm'
                    : 'bg-white/80 hover:bg-white'
                } ${speaking ? 'ring-2 ring-[#00AA72] ring-offset-1' : ''}`}
              >
                {/* Left: Avatar & Info */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    style={{ backgroundColor: p.color || '#3355FF' }}
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0 relative border border-[#15162B] ${
                      speaking ? 'ring-2 ring-[#00AA72] animate-pulse' : ''
                    }`}
                  >
                    {p.displayName.slice(0, 2).toUpperCase()}
                  </div>

                  <div className="truncate">
                    <div className="text-xs font-display font-bold text-[#15162B] truncate flex items-center gap-1">
                      <span className="truncate">{p.displayName}</span>
                      {isSelf && (
                        <span className="text-[10px] text-[#444654] font-normal shrink-0">(you)</span>
                      )}
                    </div>
                    <div className="text-[10px] font-mono text-[#444654] flex items-center gap-1">
                      {p.isHost ? (
                        <span className="text-[#15162B] bg-[#FFDD33] px-1 rounded text-[9px] font-bold inline-flex items-center gap-0.5 border border-[#15162B]/30">
                          <Crown className="w-2.5 h-2.5 text-[#15162B]" /> host
                        </span>
                      ) : p.guestName ? (
                        <span>guest</span>
                      ) : (
                        <span>member</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Draw permission status & Mic status icon inline */}
                <div className="flex items-center gap-1 shrink-0 ml-1">
                  {/* Draw Permission status icon (host can toggle for guests) */}
                  {!p.isHost && (
                    <button
                      onClick={() => {
                        if (!isHost) return;
                        if (p.canDraw) {
                          onRevokeDrawPermission?.(p.participantId);
                        } else {
                          onGrantDrawPermission?.(p.participantId);
                        }
                      }}
                      disabled={!isHost}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        isHost ? 'cursor-pointer hover:bg-neutral-100 border-[#15162B]' : 'cursor-default border-transparent'
                      } ${p.canDraw ? 'text-[#3355FF] bg-[#E5EDFF]' : 'text-[#8F91A0]'}`}
                      title={
                        p.canDraw
                          ? isHost
                            ? 'Draw permission active (click to revoke)'
                            : 'Draw permission active'
                          : isHost
                          ? 'Drawing locked (click to grant)'
                          : 'Drawing locked'
                      }
                    >
                      {p.canDraw ? (
                        <PenTool className="w-3.5 h-3.5" />
                      ) : (
                        <Lock className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}

                  {/* Mic status icon */}
                  {muted ? (
                    <div className="p-1.5 rounded-lg bg-[#FFE3E0] text-[#FF5B4C] border border-[#FF5B4C]/30" title="Microphone muted">
                      <MicOff className="w-3.5 h-3.5 text-[#FF5B4C]" />
                    </div>
                  ) : speaking ? (
                    <div
                      className="p-1.5 rounded-lg text-[#00AA72] animate-pulse bg-[#E8F8F1] border border-[#00AA72]/30"
                      title="Speaking now"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-[#00AA72]" />
                    </div>
                  ) : (
                    <div className="p-1.5 rounded-lg bg-neutral-100 text-[#3355FF] border border-[#15162B]/15" title="Microphone active">
                      <Mic className="w-3.5 h-3.5 text-[#3355FF]" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Call Controls anchored at bottom of rail */}
      <div className="p-3.5 border-t-2 border-[#15162B] bg-[#FAF8F3] flex flex-col gap-2.5">
        {/* Autoplay unlock prompt if browser requires user gesture */}
        {needsAudioClick && onStartAudio && (
          <button
            onClick={onStartAudio}
            className="w-full py-2 px-3 bg-[#FFDD33] hover:bg-[#FFD41A] text-[#15162B] border-2 border-[#15162B] hard-shadow-xs rounded-xl text-xs font-display font-extrabold flex items-center justify-center gap-1.5 cursor-pointer animate-bounce"
            title="Browser blocked audio autoplay. Click to enable room voice."
          >
            <Volume2 className="w-4 h-4 text-[#15162B]" />
            <span>Join voice (enable audio)</span>
          </button>
        )}

        {/* Voice status indicator badge */}
        <div className="flex items-center justify-between text-xs px-1 text-[#444654] font-mono">
          <span className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                voiceStatus === 'connected'
                  ? 'bg-[#00AA72] animate-pulse'
                  : voiceStatus === 'connecting' || voiceStatus === 'reconnecting' || voiceStatus === 'retrying'
                  ? 'bg-[#FFDD33] animate-pulse'
                  : voiceStatus === 'fallback'
                  ? 'bg-[#3355FF]'
                  : 'bg-[#FF5B4C]'
              }`}
            />
            <span className="font-bold text-[#15162B]">
              {voiceStatus === 'connected'
                ? isListenOnly
                  ? 'Listen-only (mic blocked)'
                  : 'Voice live'
                : voiceStatus === 'connecting'
                ? 'Connecting...'
                : voiceStatus === 'reconnecting'
                ? 'Reconnecting...'
                : voiceStatus === 'retrying'
                ? 'Retrying voice...'
                : voiceStatus === 'fallback'
                ? 'Simulated voice'
                : 'Voice offline'}
            </span>
          </span>

          {voiceStatus === 'failed' && onRetryVoice && (
            <button
              onClick={onRetryVoice}
              className="text-[10px] px-2 py-0.5 rounded-md bg-[#FF5B4C] text-white font-bold cursor-pointer hover:bg-[#E0483A]"
            >
              Retry
            </button>
          )}

          {voiceStatus !== 'failed' && onToggleSimulateSpeak && (
            <button
              onClick={onToggleSimulateSpeak}
              className={`text-[10px] px-2 py-0.5 rounded-md border border-[#15162B] font-bold cursor-pointer ${
                isSpeaking
                  ? 'bg-[#E8F8F1] text-[#00AA72]'
                  : 'bg-white text-[#15162B] hover:bg-[#F2EFE6]'
              }`}
              title="Test speaking indicator"
            >
              {isSpeaking ? 'Speaking...' : 'Test speak'}
            </button>
          )}
        </div>

        {/* Action Row */}
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={onToggleMute}
            disabled={isListenOnly}
            className={`flex-1 py-2 px-3 rounded-xl font-display font-bold text-xs border-2 border-[#15162B] hard-shadow-xs transition-transform flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              isMuted
                ? 'bg-[#FFE3E0] text-[#FF5B4C] hover:bg-[#FFDAD5]'
                : 'bg-[#3355FF] text-white hover:bg-[#2545D9]'
            }`}
          >
            {isMuted ? (
              <>
                <MicOff className="w-3.5 h-3.5" />
                <span>{isListenOnly ? 'Mic blocked' : 'Unmute mic'}</span>
              </>
            ) : (
              <>
                <Mic className="w-3.5 h-3.5" />
                <span>Mute mic</span>
              </>
            )}
          </button>

          <button
            onClick={onLeaveRoom}
            className="p-2 rounded-xl text-[#15162B] bg-white hover:text-[#FF5B4C] hover:bg-[#FFE3E0] border-2 border-[#15162B] hard-shadow-xs transition-colors cursor-pointer"
            title="Leave room"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
