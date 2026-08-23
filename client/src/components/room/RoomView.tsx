import React, { useState } from 'react';
import { RoomDetails, JoinRoomResponse } from '../../lib/api';
import { useRoomPresence } from '../../hooks/use-room-presence';
import { ParticipantRail } from '../participants/ParticipantRail';
import {
  Crown,
  Copy,
  Check,
  LogOut,
  PenTool,
  MousePointer,
  Square,
  Eraser,
  Highlighter,
  Type,
  Undo2,
  Redo2,
  Sparkles,
  GitFork,
  UploadCloud,
  Radio,
} from 'lucide-react';

interface RoomViewProps {
  room: RoomDetails;
  session: JoinRoomResponse;
  onLeave: () => void;
}

export const RoomView: React.FC<RoomViewProps> = ({ room, session, onLeave }) => {
  const [copied, setCopied] = useState(false);
  const inviteUrl = `${window.location.origin}/?join=${room.inviteCode}`;

  const participantName = session.user?.displayName || session.guest?.name || 'Participant';

  // Realtime Presence Hook
  const {
    participants,
    isConnected,
    myParticipantId,
    isMuted,
    toggleMute,
    toggleSpeaking,
    isSpeaking,
  } = useRoomPresence({
    roomId: room.id,
    participantId: session.participantId,
    userId: session.user?.id,
    guestName: session.guest?.name,
    displayName: participantName,
    isHost: session.isHost,
  });

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
                isConnected
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              ></span>
              {isConnected ? 'live' : 'connecting'}
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
            className="text-[11px] font-medium text-neutral-700 hover:text-neutral-900 inline-flex items-center gap-1 ml-1"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
            {copied ? 'copied' : 'copy link'}
          </button>
        </div>

        {/* Right: Speaking simulation & Leave */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={toggleSpeaking}
            className={`px-2 py-1 text-[11px] font-medium rounded-md border hairline-border transition-colors hidden sm:inline-flex items-center gap-1 ${
              isSpeaking
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-100'
            }`}
            title="Simulate speaking for audio indicator testing"
          >
            <Radio className={`w-3 h-3 ${isSpeaking ? 'text-emerald-600 animate-pulse' : 'text-neutral-400'}`} />
            {isSpeaking ? 'speaking...' : 'test speak'}
          </button>

          <button
            onClick={onLeave}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-neutral-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border hairline-border"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">leave</span>
          </button>
        </div>
      </header>

      {/* Main Studio Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Rail: Realtime 3-state Participant Rail */}
        <ParticipantRail
          participants={participants}
          currentParticipantId={myParticipantId}
          isMuted={isMuted}
          onToggleMute={toggleMute}
          onLeaveRoom={onLeave}
        />

        {/* Dominant Whiteboard Area (~80% width per DESIGN.md) */}
        <main className="flex-1 bg-[#fcfcfd] relative flex flex-col items-center justify-center p-8 overflow-hidden">
          {/* Subtle Grid Pattern */}
          <div
            className="absolute inset-0 opacity-[0.35] pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          {/* Floating Action: Upload (anchored bottom-left of canvas per DESIGN.md) */}
          <div className="absolute bottom-4 left-4 z-10">
            <button
              className="flex items-center gap-1.5 px-3 py-2 bg-white/95 backdrop-blur-sm border hairline-border rounded-xl text-xs font-medium text-neutral-700 hover:bg-neutral-50 shadow-xs transition-colors"
              title="Upload file or PDF"
            >
              <UploadCloud className="w-3.5 h-3.5 text-indigo-600" />
              <span>upload file</span>
            </button>
          </div>

          {/* Floating Action: Fork board (anchored bottom-right of canvas per DESIGN.md) */}
          <div className="absolute bottom-4 right-16 z-10">
            <button
              className="flex items-center gap-1.5 px-3 py-2 bg-white/95 backdrop-blur-sm border hairline-border rounded-xl text-xs font-medium text-neutral-700 hover:bg-neutral-50 shadow-xs transition-colors"
              title="Fork your own private copy of this whiteboard"
            >
              <GitFork className="w-3.5 h-3.5 text-indigo-600" />
              <span>fork my board</span>
            </button>
          </div>

          {/* Center Canvas Ready Badge */}
          <div className="relative z-10 max-w-md w-full bg-white border hairline-border rounded-2xl p-6 shadow-sm text-center">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto mb-3 text-indigo-600">
              <Sparkles className="w-5 h-5" />
            </div>

            <h2 className="text-base font-semibold text-neutral-900 mb-1">
              Multiplayer room online
            </h2>
            <p className="text-xs text-neutral-500 mb-4 leading-relaxed">
              Realtime WebSocket presence active. Open this room link in a new tab or incognito window to see multiplayer presence update live!
            </p>

            <div className="grid grid-cols-2 gap-2 text-left text-xs bg-neutral-50 p-3 rounded-xl border hairline-border font-mono text-[11px]">
              <div>
                <span className="text-neutral-400">Live peers:</span>
                <div className="text-indigo-600 font-semibold">{participants.length} connected</div>
              </div>
              <div>
                <span className="text-neutral-400">Invite Code:</span>
                <div className="text-neutral-800 font-semibold">{room.inviteCode}</div>
              </div>
              <div>
                <span className="text-neutral-400">Rail state:</span>
                <div className="text-neutral-700">3-state togglable</div>
              </div>
              <div>
                <span className="text-neutral-400">Next Phase:</span>
                <div className="text-indigo-600 font-semibold">Phase 3 (Voice chat)</div>
              </div>
            </div>
          </div>
        </main>

        {/* Right Rail: Floating Canvas Toolbar preview */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-1 bg-white p-1.5 rounded-xl border hairline-border shadow-sm z-10">
          <button className="p-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors" title="Select">
            <MousePointer className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-lg text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 transition-colors" title="Pen">
            <PenTool className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-lg text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 transition-colors" title="Highlighter">
            <Highlighter className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-lg text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 transition-colors" title="Shapes">
            <Square className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-lg text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 transition-colors" title="Text">
            <Type className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-lg text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 transition-colors" title="Eraser">
            <Eraser className="w-4 h-4" />
          </button>
          <div className="h-px bg-neutral-200 my-1" />
          <button className="p-2 rounded-lg text-neutral-400 hover:text-neutral-700 transition-colors" title="Undo">
            <Undo2 className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-lg text-neutral-400 hover:text-neutral-700 transition-colors" title="Redo">
            <Redo2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
