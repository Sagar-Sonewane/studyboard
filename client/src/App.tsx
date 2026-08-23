import { useState, useEffect, useCallback, useRef } from 'react';
import { AuthProvider, useAuth } from './lib/auth-context';
import { AuthModal } from './components/auth/AuthModal';
import { CreateRoomModal } from './components/room/CreateRoomModal';
import { JoinRoomModal } from './components/room/JoinRoomModal';
import { RoomView } from './components/room/RoomView';
import {
  fetchHealth,
  HealthCheckResponse,
  RoomDetails,
  JoinRoomResponse,
  WS_BASE_URL,
} from './lib/api';
import {
  CheckCircle2,
  AlertTriangle,
  Database,
  Radio,
  Server,
  RefreshCw,
  Zap,
  ShieldCheck,
  Plus,
  LogIn,
  LogOut,
  User,
  ArrowRight,
} from 'lucide-react';

function MainDashboard() {
  const { user, displayName, signOut } = useAuth();

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [initialInviteCode, setInitialInviteCode] = useState('');

  // Active room state
  const [activeRoom, setActiveRoom] = useState<RoomDetails | null>(null);
  const [activeSession, setActiveSession] = useState<JoinRoomResponse | null>(null);

  const [healthData, setHealthData] = useState<HealthCheckResponse | null>(null);
  const [loadingHealth, setLoadingHealth] = useState(true);

  // WebSocket state
  const [wsStatus, setWsStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [wsLatency, setWsLatency] = useState<number | null>(null);
  const [wsMessages, setWsMessages] = useState<string[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  // Check URL for invite code: e.g. /?join=abc-xyz
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const joinCode = urlParams.get('join');
    if (joinCode) {
      setInitialInviteCode(joinCode);
      setJoinModalOpen(true);
    }
  }, []);

  // Health fetcher
  const checkHealth = useCallback(async () => {
    setLoadingHealth(true);
    try {
      const data = await fetchHealth();
      setHealthData(data);
    } catch {
      // Degraded / offline status handled in state
    } finally {
      setLoadingHealth(false);
    }
  }, []);

  // WebSocket connect
  const connectWebSocket = useCallback(() => {
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    setWsStatus('connecting');
    const wsUrl = `${WS_BASE_URL}/ws`;

    try {
      const socket = new WebSocket(wsUrl);
      wsRef.current = socket;

      socket.onopen = () => {
        setWsStatus('connected');
        setWsMessages((prev) => [`[${new Date().toLocaleTimeString()}] connected to ${wsUrl}`, ...prev.slice(0, 4)]);
      };

      socket.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed.type === 'pong' && parsed.payload?.clientTimestamp) {
            const rtt = Date.now() - Number(parsed.payload.clientTimestamp);
            setWsLatency(rtt);
            setWsMessages((prev) => [
              `[${new Date().toLocaleTimeString()}] pong received (rtt: ${rtt}ms)`,
              ...prev.slice(0, 4),
            ]);
          } else {
            setWsMessages((prev) => [
              `[${new Date().toLocaleTimeString()}] ${parsed.type || 'message'}: ${JSON.stringify(parsed.payload || parsed)}`,
              ...prev.slice(0, 4),
            ]);
          }
        } catch {
          setWsMessages((prev) => [`[${new Date().toLocaleTimeString()}] ${event.data}`, ...prev.slice(0, 4)]);
        }
      };

      socket.onerror = () => {
        setWsStatus('error');
      };

      socket.onclose = () => {
        setWsStatus('disconnected');
      };
    } catch {
      setWsStatus('error');
    }
  }, []);

  const sendWsPing = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const pingPayload = {
        type: 'ping',
        payload: { timestamp: Date.now() },
      };
      wsRef.current.send(JSON.stringify(pingPayload));
    } else {
      connectWebSocket();
    }
  };

  useEffect(() => {
    checkHealth();
    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [checkHealth, connectWebSocket]);

  // Handle room created & immediate entry
  const handleRoomCreated = (room: RoomDetails) => {
    setActiveRoom(room);
    setActiveSession({
      participantId: 'host-session',
      roomId: room.id,
      roomName: room.name,
      isHost: true,
      user: {
        id: user?.id || 'host-id',
        displayName: displayName || 'Host',
        email: user?.email,
      },
      joinedAt: new Date().toISOString(),
    });
  };

  // Handle room joined
  const handleRoomJoined = (joined: JoinRoomResponse & { roomDetails?: RoomDetails }) => {
    if (joined.roomDetails) {
      setActiveRoom(joined.roomDetails);
    } else {
      setActiveRoom({
        id: joined.roomId,
        name: joined.roomName,
        inviteCode: initialInviteCode || 'active',
        hostId: 'host',
        hostName: 'Host',
        status: 'active',
        createdAt: new Date().toISOString(),
      });
    }
    setActiveSession(joined);
  };

  const handleLeaveRoom = () => {
    setActiveRoom(null);
    setActiveSession(null);
    // Clear url query if present
    if (window.location.search) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  };

  // If in an active room, render the room view
  if (activeRoom && activeSession) {
    return <RoomView room={activeRoom} session={activeSession} onLeave={handleLeaveRoom} />;
  }

  return (
    <div className="min-h-screen bg-[#fafafa] text-neutral-900 flex flex-col justify-between">
      {/* Top bar */}
      <header className="border-b hairline-border bg-white px-6 py-3.5 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm tracking-tight">
            SS
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight text-neutral-900">StudySync</h1>
            <p className="text-xs text-neutral-500">Realtime collaboration platform</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              <div
                onClick={() => setAuthModalOpen(true)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border hairline-border bg-neutral-50 hover:bg-neutral-100 cursor-pointer transition-colors text-xs font-medium text-neutral-700"
              >
                <User className="w-3.5 h-3.5 text-neutral-500" />
                <span>{displayName || user.email}</span>
              </div>
              <button
                onClick={() => signOut()}
                className="p-1.5 rounded-lg border hairline-border hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAuthModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white border hairline-border rounded-lg hover:bg-neutral-50 active:bg-neutral-100 transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              sign in / host
            </button>
          )}

          <button
            onClick={() => {
              checkHealth();
              sendWsPing();
            }}
            disabled={loadingHealth}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white border hairline-border rounded-lg hover:bg-neutral-50 active:bg-neutral-100 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingHealth ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">refresh status</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl w-full mx-auto px-6 py-8 flex-1">
        {/* Phase 1 Action Hero */}
        <div className="mb-8 p-6 bg-white border hairline-border rounded-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100 mb-2">
                Phase 1 · Supabase Auth & Room Creation
              </span>
              <h2 className="text-xl font-semibold tracking-tight text-neutral-900">
                Create a study room or join an existing session
              </h2>
              <p className="text-sm text-neutral-600 mt-1 max-w-xl">
                Start a session as host to invite classmates, or join instantly via link as a guest with no signup required.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                onClick={() => {
                  if (!user) {
                    setAuthModalOpen(true);
                  } else {
                    setCreateModalOpen(true);
                  }
                }}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-medium rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                create room
              </button>

              <button
                onClick={() => setJoinModalOpen(true)}
                className="px-4 py-2.5 bg-white hover:bg-neutral-50 active:bg-neutral-100 text-neutral-800 border hairline-border text-xs font-medium rounded-lg transition-colors inline-flex items-center gap-1.5"
              >
                join via code
                <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Stack Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Card 1: Auth & Profiles Trigger */}
          <div className="p-5 bg-white border hairline-border rounded-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-neutral-100 text-neutral-700">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-semibold text-neutral-900">Supabase Auth & Profiles</h3>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                  <CheckCircle2 className="w-3 h-3" /> ready
                </span>
              </div>
              <p className="text-xs text-neutral-500 mb-4">
                Frontend uses <code className="text-neutral-700">@supabase/supabase-js</code> directly for auth. Server middleware verifies tokens via <code className="text-neutral-700">getUser()</code> and maps to <code className="text-neutral-700">profiles.id</code>.
              </p>
            </div>
            <div className="pt-3 border-t hairline-border text-xs font-mono text-neutral-500 flex justify-between">
              <span>Trigger file</span>
              <span>server/prisma/triggers.sql</span>
            </div>
          </div>

          {/* Card 2: Room Endpoints */}
          <div className="p-5 bg-white border hairline-border rounded-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-neutral-100 text-neutral-700">
                    <Server className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-semibold text-neutral-900">Room Creation & Guest Joins</h3>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                  <CheckCircle2 className="w-3 h-3" /> active
                </span>
              </div>
              <p className="text-xs text-neutral-500 mb-4">
                <code className="text-neutral-700">POST /api/rooms</code> (host room creation), <code className="text-neutral-700">GET /api/rooms/:inviteCode</code>, and <code className="text-neutral-700">POST /api/rooms/:id/join</code> (guest & auth).
              </p>
            </div>
            <div className="pt-3 border-t hairline-border text-xs font-mono text-neutral-500 flex justify-between">
              <span>Endpoints</span>
              <span>/api/rooms/*</span>
            </div>
          </div>

          {/* Card 3: Realtime WebSocket */}
          <div className="p-5 bg-white border hairline-border rounded-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-neutral-100 text-neutral-700">
                    <Radio className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-semibold text-neutral-900">Realtime WebSocket</h3>
                </div>
                {wsStatus === 'connected' ? (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                    <CheckCircle2 className="w-3 h-3" /> connected {wsLatency !== null && `(${wsLatency}ms)`}
                  </span>
                ) : (
                  <span className="text-xs text-amber-600">connecting...</span>
                )}
              </div>
              <p className="text-xs text-neutral-500 mb-3">
                Realtime channel active for Phase 2 presence broadcasts and whiteboard sync.
              </p>
              <div className="flex items-center gap-2 mb-4">
                <button
                  onClick={sendWsPing}
                  className="px-2.5 py-1 text-xs font-medium text-neutral-700 bg-neutral-100 rounded-md hover:bg-neutral-200 transition-colors inline-flex items-center gap-1"
                >
                  <Zap className="w-3 h-3 text-indigo-600" /> send ping
                </button>
                {wsMessages.length > 0 && (
                  <span className="text-[11px] font-mono text-neutral-500 truncate max-w-[200px]">
                    {wsMessages[0]}
                  </span>
                )}
              </div>
            </div>
            <div className="pt-3 border-t hairline-border text-xs font-mono text-neutral-500 flex justify-between">
              <span>WS path</span>
              <span>{WS_BASE_URL}/ws</span>
            </div>
          </div>

          {/* Card 4: Prisma & Supabase Postgres */}
          <div className="p-5 bg-white border hairline-border rounded-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-neutral-100 text-neutral-700">
                    <Database className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-semibold text-neutral-900">Prisma & Supabase Postgres</h3>
                </div>
                {healthData?.database.connected ? (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                    <CheckCircle2 className="w-3 h-3" /> connected ({healthData.database.latencyMs}ms)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    <AlertTriangle className="w-3 h-3" /> awaiting DATABASE_URL
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-500 mb-2">
                Prisma ORM data access layer with complete schema for <code className="text-neutral-700 font-medium">profiles</code>, <code className="text-neutral-700 font-medium">rooms</code>, <code className="text-neutral-700 font-medium">room_participants</code>, <code className="text-neutral-700 font-medium">entitlements</code>, <code className="text-neutral-700 font-medium">boards</code>, and <code className="text-neutral-700 font-medium">uploaded_files</code>.
              </p>
              <div className="text-xs text-neutral-600 bg-neutral-50 p-2.5 rounded-lg border hairline-border mb-4 font-mono text-[11px]">
                {healthData?.database.message || 'Checking database connection...'}
              </div>
            </div>
            <div className="pt-3 border-t hairline-border text-xs font-mono text-neutral-500 flex justify-between">
              <span>Schema file</span>
              <span>server/prisma/schema.prisma</span>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      <CreateRoomModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onRoomCreated={handleRoomCreated}
      />
      <JoinRoomModal
        isOpen={joinModalOpen}
        initialInviteCode={initialInviteCode}
        onClose={() => setJoinModalOpen(false)}
        onRoomJoined={handleRoomJoined}
      />

      {/* Footer */}
      <footer className="border-t hairline-border bg-white px-6 py-4 text-xs text-neutral-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>StudySync Monorepo &middot; /client and /server workspaces</span>
        <span className="font-mono">Phase 1 Complete &middot; Ready for Phase 2</span>
      </footer>
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <MainDashboard />
    </AuthProvider>
  );
}
