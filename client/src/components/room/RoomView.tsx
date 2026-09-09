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
  const inviteUrl = `${window.location.origin}/?join=${room.inviteCode}`;

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
    <div className="h-screen w-screen flex flex-col bg-[#fdfdfd] text-neutral-900 overflow-hidden select-none">
      {/* Top Bar per DESIGN.md */}
      <header className="h-12 border-b hairline-border bg-white px-4 flex items-center justify-between shrink-0 z-20">
        {/* Left: Logo & Room Metadata */}
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
            SS
          </div>

          <div className="flex items-center gap-2">
            <h1 className="text-xs font-semibold text-neutral-900 tracking-tight">{room.name}</h1>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                isWsConnected
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isWsConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              {isWsConnected ? 'live' : 'connecting'}
            </span>
          </div>

          {session.isHost && (
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
              <Crown className="w-3 h-3 text-amber-600" />
              host
            </span>
          )}
        </div>

        {/* Center: Invite Link Quick Share */}
        <div className="hidden md:flex items-center gap-1.5 bg-neutral-50 px-2.5 py-1 rounded-lg border hairline-border">
          <span className="text-[11px] font-mono text-neutral-600">code: {room.inviteCode}</span>
          <button
            onClick={handleCopyLink}
            className="text-[11px] font-medium text-neutral-700 hover:text-neutral-900 inline-flex items-center gap-1 ml-1 cursor-pointer"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
            {copied ? 'copied' : 'copy link'}
          </button>
        </div>

        {/* Right: Participant Count & Header Actions */}
        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex items-center gap-1 text-xs text-neutral-500 bg-neutral-50 px-2 py-1 rounded-md border hairline-border">
            <Users className="w-3.5 h-3.5 text-neutral-400" />
            <span>
              {participants.length} {participants.length === 1 ? 'person' : 'people'}
            </span>
          </div>

          <button
            onClick={onLeave}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-neutral-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border hairline-border cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">leave</span>
          </button>
        </div>
      </header>

      {/* Host Toast for Incoming Draw Requests */}
      {session.isHost && pendingDrawRequests.length > 0 && (
        <div className="fixed top-14 right-4 z-50 flex flex-col gap-2 max-w-sm w-full animate-in fade-in slide-in-from-top-3 duration-200">
          {pendingDrawRequests.map((req) => (
            <div
              key={req.participantId}
              className="bg-white/95 backdrop-blur-md border hairline-border border-indigo-100 rounded-2xl p-3 shadow-lg flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Hand className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <div className="text-xs font-semibold text-neutral-900 truncate">
                    {req.displayName}
                  </div>
                  <div className="text-[11px] text-neutral-500">requested to draw</div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => grantDrawPermission(req.participantId)}
                  className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>approve</span>
                </button>
                <button
                  onClick={() => denyDrawPermission(req.participantId)}
                  className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>deny</span>
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
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/95 backdrop-blur-sm border hairline-border rounded-full shadow-xs text-xs font-medium text-neutral-700 cursor-pointer"
          >
            <Users className="w-3.5 h-3.5 text-neutral-500" />
            <span>{participants.length}</span>
          </button>
        </div>

        {/* Dominant Whiteboard Area (~80% width per DESIGN.md) */}
        <main className="flex-1 relative flex overflow-hidden pb-14 md:pb-0">
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
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-white border-t hairline-border px-4 flex items-center justify-between z-30">
        <button
          onClick={handleToggleMute}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
            currentMuted ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-neutral-100 text-neutral-800'
          }`}
        >
          {currentMuted ? (
            <MicOff className="w-4 h-4 text-rose-600" />
          ) : (
            <Mic className="w-4 h-4 text-neutral-700" />
          )}
          <span>{currentMuted ? 'unmute' : 'mute mic'}</span>
        </button>

        <button
          onClick={() => setMobileSheetOpen(true)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-700 bg-neutral-50 border hairline-border cursor-pointer"
        >
          <Users className="w-4 h-4 text-neutral-500" />
          <span>{participants.length}</span>
        </button>

        <button
          onClick={onLeave}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-600 bg-rose-50 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>leave</span>
        </button>
      </div>

      {/* Mobile participant bottom sheet */}
      {mobileSheetOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/30 backdrop-blur-xs flex flex-col justify-end">
          <div className="bg-white rounded-t-2xl p-4 max-h-[70vh] flex flex-col shadow-lg border-t hairline-border">
            <div className="flex items-center justify-between pb-3 border-b hairline-border">
              <h3 className="text-xs font-semibold text-neutral-900">
                participants ({participants.length})
              </h3>
              <button
                onClick={() => setMobileSheetOpen(false)}
                className="text-xs text-neutral-500 hover:text-neutral-800 px-2 py-1 cursor-pointer"
              >
                close
              </button>
            </div>

            <div className="py-3 space-y-2 overflow-y-auto flex-1">
              {participants.map((p) => {
                const isSelf = p.participantId === myParticipantId;
                return (
                  <div
                    key={p.participantId}
                    className="flex items-center justify-between p-2 rounded-xl bg-neutral-50 border hairline-border"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        style={{ backgroundColor: p.color || '#4f46e5' }}
                        className="w-7 h-7 rounded-full text-white flex items-center justify-center text-xs font-semibold"
                      >
                        {p.displayName.slice(0, 1).toUpperCase()}
                      </div>
                      <div className="text-xs font-medium text-neutral-900">
                        {p.displayName} {isSelf && '(you)'}
                      </div>
                    </div>
                    {p.muted ? (
                      <MicOff className="w-3.5 h-3.5 text-neutral-400" />
                    ) : (
                      <Mic className="w-3.5 h-3.5 text-neutral-600" />
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
