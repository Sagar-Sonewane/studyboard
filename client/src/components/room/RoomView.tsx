import React, { useState } from 'react';
import { RoomDetails, JoinRoomResponse } from '../../lib/api';
import {
  Crown,
  Copy,
  Check,
  LogOut,
  Users,
  Mic,
  PenTool,
  MousePointer,
  Square,
  Eraser,
  Highlighter,
  Type,
  Undo2,
  Redo2,
  Share2,
  Sparkles,
} from 'lucide-react';

interface RoomViewProps {
  room: RoomDetails;
  session: JoinRoomResponse;
  onLeave: () => void;
}

export const RoomView: React.FC<RoomViewProps> = ({ room, session, onLeave }) => {
  const [copied, setCopied] = useState(false);
  const inviteUrl = `${window.location.origin}/?join=${room.inviteCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const participantName = session.user?.displayName || session.guest?.name || 'Participant';

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
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              live
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

        {/* Right: User identity & Leave */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-6 h-6 rounded-full bg-neutral-200 flex items-center justify-center text-[10px] font-medium text-neutral-700">
              {participantName.slice(0, 2).toUpperCase()}
            </div>
            <span className="hidden sm:inline text-neutral-700 font-medium text-xs">
              {participantName}
            </span>
            {session.guest && (
              <span className="text-[10px] text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded">
                guest
              </span>
            )}
          </div>

          <button
            onClick={onLeave}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors border hairline-border"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">leave</span>
          </button>
        </div>
      </header>

      {/* Main Studio Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Rail: Participants (Compact list preview for Phase 1) */}
        <aside className="w-56 border-r hairline-border bg-neutral-50/50 flex flex-col shrink-0">
          <div className="p-3 border-b hairline-border flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-700">
              <Users className="w-3.5 h-3.5" />
              <span>participants (1)</span>
            </div>
            <span className="text-[10px] font-mono text-neutral-400">Phase 1</span>
          </div>

          <div className="p-2 space-y-1 overflow-y-auto flex-1">
            {/* Active User Row */}
            <div className="p-2 rounded-lg bg-white border hairline-border flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                  {participantName.slice(0, 2).toUpperCase()}
                </div>
                <div className="truncate">
                  <div className="text-xs font-medium text-neutral-900 truncate">
                    {participantName} (You)
                  </div>
                  <div className="text-[10px] text-neutral-400">
                    {session.isHost ? 'Host' : session.guest ? 'Guest' : 'Member'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0 text-neutral-400">
                {session.isHost && <Crown className="w-3 h-3 text-amber-500" />}
                <Mic className="w-3 h-3 text-neutral-300" />
              </div>
            </div>
          </div>

          {/* Quick invite share card in sidebar */}
          <div className="p-3 border-t hairline-border bg-white m-2 rounded-lg border">
            <div className="text-[11px] font-medium text-neutral-700 mb-1 flex items-center gap-1">
              <Share2 className="w-3 h-3 text-indigo-600" />
              Invite classmates
            </div>
            <p className="text-[10px] text-neutral-500 mb-2">
              Anyone with this link can join as a guest instantly.
            </p>
            <button
              onClick={handleCopyLink}
              className="w-full py-1.5 px-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-[11px] font-medium rounded transition-colors flex items-center justify-center gap-1"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              {copied ? 'copied link' : 'copy invite link'}
            </button>
          </div>
        </aside>

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

          {/* Center Canvas Ready Badge */}
          <div className="relative z-10 max-w-lg w-full bg-white border hairline-border rounded-2xl p-6 shadow-sm text-center">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto mb-3 text-indigo-600">
              <Sparkles className="w-5 h-5" />
            </div>

            <h2 className="text-base font-semibold text-neutral-900 mb-1">
              Room "{room.name}" is active
            </h2>
            <p className="text-xs text-neutral-500 mb-4 leading-relaxed">
              Phase 1 completed: Supabase Auth, profiles trigger, token verification middleware, and room creation/join flows are working end-to-end.
            </p>

            <div className="grid grid-cols-2 gap-2 text-left text-xs bg-neutral-50 p-3 rounded-xl border hairline-border font-mono text-[11px]">
              <div>
                <span className="text-neutral-400">Room ID:</span>
                <div className="text-neutral-800 truncate">{room.id}</div>
              </div>
              <div>
                <span className="text-neutral-400">Invite Code:</span>
                <div className="text-neutral-800 font-semibold">{room.inviteCode}</div>
              </div>
              <div>
                <span className="text-neutral-400">Your Role:</span>
                <div className="text-neutral-800 font-semibold">
                  {session.isHost ? 'Host' : 'Participant'}
                </div>
              </div>
              <div>
                <span className="text-neutral-400">Next Phase:</span>
                <div className="text-indigo-600 font-semibold">Phase 2 (Presence WS)</div>
              </div>
            </div>
          </div>
        </main>

        {/* Right Rail: Floating Canvas Toolbar preview */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-1 bg-white p-1.5 rounded-xl border hairline-border shadow-sm z-10">
          <button className="p-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors">
            <MousePointer className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-lg text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 transition-colors">
            <PenTool className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-lg text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 transition-colors">
            <Highlighter className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-lg text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 transition-colors">
            <Square className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-lg text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 transition-colors">
            <Type className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-lg text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 transition-colors">
            <Eraser className="w-4 h-4" />
          </button>
          <div className="h-px bg-neutral-200 my-1" />
          <button className="p-2 rounded-lg text-neutral-400 hover:text-neutral-700 transition-colors">
            <Undo2 className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-lg text-neutral-400 hover:text-neutral-700 transition-colors">
            <Redo2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
