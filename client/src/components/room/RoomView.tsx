import React, { useState, useCallback } from 'react';
import { RoomDetails, JoinRoomResponse } from '../../lib/api';
import { useRoomPresence } from '../../hooks/use-room-presence';
import { useLiveKitVoice } from '../../hooks/use-livekit-voice';
import { ParticipantRail } from '../participants/ParticipantRail';
import { WhiteboardCanvas } from '../whiteboard/WhiteboardCanvas';
import {
  Crown,
  Copy,
  Check,
  LogOut,
  Mic,
  MicOff,
  Users,
  Hand,
  CheckCircle,
  XCircle,
} from 'lucide-react';

interface RoomViewProps {
  room: RoomDetails;
  session: JoinRoomResponse;
  onLeave: () => void;
}

export const RoomView: React.FC<RoomViewProps> = ({ room, session, onLeave }) => {
  const [copied, setCopied] = useState(false);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const inviteUrl = `${window.location.origin}/room/${room.inviteCode}`;

  const participantName = session.user?.displayName || session.guest?.name || 'Participant';

  // 1. Realtime Room Presence (WebSocket sync & draw permissions)
  const {
    participants,
    isConnected: isWsConnected,
    myParticipantId,
    myColor,
    isMuted: isWsMuted,
    toggleMute: toggleWsMute,
    toggleSpeaking: toggleWsSpeaking,
    isSpeaking: isWsSpeaking,
    canDraw,
    pendingDrawRequests,
    drawRequestSent,
    drawRequestFeedback,
    requestDrawPermission,
    grantDrawPermission,
    denyDrawPermission,
    revokeDrawPermission,
  } = useRoomPresence({
    roomId: room.id,
    participantId: session.participantId,
    userId: session.user?.id,
    guestName: session.guest?.name,
    displayName: participantName,
    isHost: session.isHost,
  });

  // 2. LiveKit Realtime Voice
  const {
    voiceStatus,
    isConnected: isVoiceConnected,
    isMuted: isLiveKitMuted,
    isSpeaking: isLiveKitSpeaking,
    speakingIdentities,
    mutedIdentities,
    toggleMute: toggleLiveKitMute,
  } = useLiveKitVoice({
    roomId: room.id,
    participantId: session.participantId,
    token: session.livekitToken,
    serverUrl: session.livekitUrl,
    isConfigured: session.isLiveKitConfigured ?? true,
    autoJoin: true,
  });

  // Unified mute state & toggle
  const currentMuted = isVoiceConnected ? isLiveKitMuted : isWsMuted;
  const handleToggleMute = useCallback(() => {
    toggleLiveKitMute();
    toggleWsMute();
  }, [toggleLiveKitMute, toggleWsMute]);

  // Unified speaking state
  const currentSpeaking = isLiveKitSpeaking || isWsSpeaking;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const whiteboardUser = React.useMemo(
    () => ({
      id: session.user?.id || myParticipantId,
      displayName: participantName,
      color: myColor,
      isHost: session.isHost,
    }),
    [session.user?.id, myParticipantId, participantName, myColor, session.isHost]
  );

  return (
    <div className="h-screen w-screen flex flex-col bg-[#FAF8F3] text-[#15162B] overflow-hidden select-none font-sans">
      {/* Top Bar per StudySync Design System */}
      <header className="h-14 border-b-2 border-[#15162B] bg-[#FAF8F3] px-4 sm:px-5 flex items-center justify-between shrink-0 z-20">
        {/* Left: Brand, Logo & Room Metadata */}
        <div className="flex items-center gap-3">
          <a
            href="/"
            className="flex items-center gap-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3355FF] rounded"
            title="StudySync Home"
          >
            <div className="w-7 h-7 rounded-lg bg-[#3355FF] border-2 border-[#15162B] hard-shadow-xs flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform">
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
            <span className="hidden lg:inline-block font-display font-bold text-lg text-[#15162B] tracking-tight">
              StudySync
            </span>
          </a>

          <div className="hidden lg:block w-px h-5 bg-[#15162B]/15" />

          <div className="flex items-center gap-2">
            <h1 className="text-sm font-display font-bold text-[#15162B] tracking-tight truncate max-w-[140px] sm:max-w-xs">
              {room.name}
            </h1>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border-2 border-[#15162B] ${
                isWsConnected
                  ? 'bg-[#E8F8F1] text-[#00875A]'
                  : 'bg-[#FFF9D6] text-[#B87A00]'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isWsConnected ? 'bg-[#00AA72] animate-pulse' : 'bg-[#D47500]'
                }`}
              />
              {isWsConnected ? 'live' : 'connecting'}
            </span>
          </div>

          {session.isHost && (
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-display font-bold bg-[#FFDD33] text-[#15162B] border-2 border-[#15162B] hard-shadow-xs">
              <Crown className="w-3 h-3 text-[#15162B]" />
              Host
            </span>
          )}
        </div>

        {/* Center: Invite Link Quick Share */}
        <div className="hidden md:flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border-2 border-[#15162B] hard-shadow-xs">
          <span className="text-xs font-mono font-bold text-[#15162B]">
            code: <span className="text-[#3355FF]">{room.inviteCode}</span>
          </span>
          <button
            onClick={handleCopyLink}
            className="text-xs font-display font-bold text-[#15162B] hover:text-[#3355FF] inline-flex items-center gap-1.5 ml-1 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3355FF] rounded"
            title="Copy room link to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#00AA72]" />
                <span className="text-[#00AA72]">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy link</span>
              </>
            )}
          </button>
        </div>

        {/* Right: Participant Count & Header Actions */}
        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono font-bold text-[#15162B] bg-white px-2.5 py-1.5 rounded-lg border-2 border-[#15162B]">
            <Users className="w-3.5 h-3.5 text-[#3355FF]" />
            <span>
              {participants.length} {participants.length === 1 ? 'person' : 'people'}
            </span>
          </div>

          <button
            onClick={onLeave}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-display font-bold text-[#15162B] bg-white hover:bg-[#FFE3E0] hover:text-[#FF5B4C] rounded-lg transition-colors border-2 border-[#15162B] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3355FF]"
            title="Leave room"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Leave</span>
          </button>
        </div>
      </header>

      {/* Host Toast for Incoming Draw Requests */}
      {session.isHost && pendingDrawRequests.length > 0 && (
        <div className="fixed top-16 right-4 z-50 flex flex-col gap-2 max-w-sm w-full animate-in fade-in slide-in-from-top-3 duration-200">
          {pendingDrawRequests.map((req) => (
            <div
              key={req.participantId}
              className="bg-[#FAF8F3] border-2 border-[#15162B] hard-shadow-md rounded-2xl p-3.5 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-[#FFF9D6] border-2 border-[#15162B] text-[#15162B] flex items-center justify-center shrink-0">
                  <Hand className="w-4 h-4 text-[#D47500]" />
                </div>
                <div className="truncate">
                  <div className="text-xs font-display font-bold text-[#15162B] truncate">
                    {req.displayName}
                  </div>
                  <div className="text-[11px] font-mono text-[#444654]">requested to draw</div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => grantDrawPermission(req.participantId)}
                  className="px-3 py-1 bg-[#3355FF] hover:bg-[#2545D9] text-white border-2 border-[#15162B] hard-shadow-xs rounded-lg text-xs font-display font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Approve</span>
                </button>
                <button
                  onClick={() => denyDrawPermission(req.participantId)}
                  className="px-2.5 py-1 bg-white hover:bg-neutral-100 text-[#15162B] border-2 border-[#15162B] rounded-lg text-xs font-display font-bold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Deny</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Studio Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Rail: 3-state Participant Rail (hidden on mobile screen, accessible via bottom bar) */}
        <div className="hidden md:flex">
          <ParticipantRail
            participants={participants}
            currentParticipantId={myParticipantId}
            isHost={session.isHost}
            isMuted={currentMuted}
            isSpeaking={currentSpeaking}
            voiceStatus={voiceStatus}
            speakingIdentities={speakingIdentities}
            mutedIdentities={mutedIdentities}
            onToggleMute={handleToggleMute}
            onLeaveRoom={onLeave}
            onToggleSimulateSpeak={toggleWsSpeaking}
            onGrantDrawPermission={grantDrawPermission}
            onRevokeDrawPermission={revokeDrawPermission}
          />
        </div>

        {/* Mobile floating pill when on small screens */}
        <div className="md:hidden absolute top-3 left-3 z-30">
          <button
            onClick={() => setMobileSheetOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF8F3] border-2 border-[#15162B] hard-shadow-xs rounded-full text-xs font-display font-bold text-[#15162B] cursor-pointer"
          >
            <Users className="w-3.5 h-3.5 text-[#3355FF]" />
            <span>{participants.length}</span>
          </button>
        </div>

        {/* Dominant Whiteboard Area (~80% width per DESIGN.md) */}
        <main className="flex-1 relative flex overflow-hidden pb-14 md:pb-0 bg-white">
          <WhiteboardCanvas
            roomId={room.id}
            user={whiteboardUser}
            token={localStorage.getItem('auth_token')}
            canDraw={canDraw}
            onRequestDraw={requestDrawPermission}
            drawRequestSent={drawRequestSent}
            drawRequestFeedback={drawRequestFeedback}
          />
        </main>
      </div>

      {/* Mobile persistent bottom bar per DESIGN.md */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-[#FAF8F3] border-t-2 border-[#15162B] px-4 flex items-center justify-between z-30">
        <button
          onClick={handleToggleMute}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-display font-bold border-2 border-[#15162B] cursor-pointer ${
            currentMuted ? 'bg-[#FFE3E0] text-[#FF5B4C]' : 'bg-white text-[#15162B]'
          }`}
        >
          {currentMuted ? (
            <MicOff className="w-4 h-4 text-[#FF5B4C]" />
          ) : (
            <Mic className="w-4 h-4 text-[#3355FF]" />
          )}
          <span>{currentMuted ? 'Unmute' : 'Mute Mic'}</span>
        </button>

        <button
          onClick={() => setMobileSheetOpen(true)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-display font-bold text-[#15162B] bg-white border-2 border-[#15162B] cursor-pointer"
        >
          <Users className="w-4 h-4 text-[#3355FF]" />
          <span>{participants.length}</span>
        </button>

        <button
          onClick={onLeave}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-display font-bold text-[#FF5B4C] bg-white hover:bg-[#FFE3E0] border-2 border-[#15162B] cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Leave</span>
        </button>
      </div>

      {/* Mobile participant bottom sheet */}
      {mobileSheetOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex flex-col justify-end">
          <div className="bg-[#FAF8F3] rounded-t-3xl p-5 max-h-[70vh] flex flex-col hard-shadow-xl border-t-2 border-[#15162B]">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#15162B]/10">
              <h3 className="text-sm font-display font-bold text-[#15162B]">
                Participants ({participants.length})
              </h3>
              <button
                onClick={() => setMobileSheetOpen(false)}
                className="px-2.5 py-1 text-xs font-display font-bold text-[#15162B] bg-white border border-[#15162B] rounded-md cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="py-3 space-y-2 overflow-y-auto flex-1">
              {participants.map((p) => {
                const isSelf = p.participantId === myParticipantId;
                return (
                  <div
                    key={p.participantId}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white border-2 border-[#15162B] hard-shadow-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        style={{ backgroundColor: p.color || '#3355FF' }}
                        className="w-7 h-7 rounded-full text-white border border-[#15162B] flex items-center justify-center text-xs font-bold"
                      >
                        {p.displayName.slice(0, 1).toUpperCase()}
                      </div>
                      <div className="text-xs font-display font-bold text-[#15162B]">
                        {p.displayName} {isSelf && '(you)'}
                      </div>
                    </div>
                    {p.muted ? (
                      <MicOff className="w-3.5 h-3.5 text-[#444654]" />
                    ) : (
                      <Mic className="w-3.5 h-3.5 text-[#3355FF]" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
