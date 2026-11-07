import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './lib/auth-context';
import { AuthModal } from './components/auth/AuthModal';
import { CreateRoomModal } from './components/room/CreateRoomModal';
import { JoinRoomModal } from './components/room/JoinRoomModal';
import { RoomView } from './components/room/RoomView';
import { LandingPage } from './pages/LandingPage';
import { RoomDetails, JoinRoomResponse, joinRoom } from './lib/api';

function AppContent() {
  const { user, token, displayName, signOut } = useAuth();

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [initialInviteCode, setInitialInviteCode] = useState('');
  const [isStandaloneJoin, setIsStandaloneJoin] = useState(false);
  const [pendingAction, setPendingAction] = useState<'create_room' | null>(null);

  // Active room state
  const [activeRoom, setActiveRoom] = useState<RoomDetails | null>(null);
  const [activeSession, setActiveSession] = useState<JoinRoomResponse | null>(null);

  // Check URL routing on mount
  useEffect(() => {
    const pathname = window.location.pathname;
    const pathMatch = pathname.match(/^\/room\/([^/?#]+)/);
    const queryCode = new URLSearchParams(window.location.search).get('join');
    const directCode = pathMatch ? decodeURIComponent(pathMatch[1]) : queryCode;

    if (directCode) {
      setInitialInviteCode(directCode);
      setIsStandaloneJoin(true);
      setJoinModalOpen(true);
    }
  }, []);

  // When user signs in after clicking "Start a room", open create modal
  useEffect(() => {
    if (user && pendingAction === 'create_room') {
      setPendingAction(null);
      setCreateModalOpen(true);
    }
  }, [user, pendingAction]);

  // Handle room created & immediate entry
  const handleRoomCreated = async (room: RoomDetails) => {
    setActiveRoom(room);
    // Optimistic entry so whiteboard mounts immediately
    setActiveSession({
      participantId: user?.id || 'host-session',
      roomId: room.id,
      roomName: room.name,
      isHost: true,
      canDraw: true,
      user: {
        id: user?.id || 'host-id',
        displayName: displayName || 'Host',
        email: user?.email,
      },
      joinedAt: new Date().toISOString(),
    });

    // Obtain confirmed participant session and LiveKit voice token
    try {
      const joinData = await joinRoom(room.id, { token });
      setActiveSession({
        ...joinData,
        isHost: true,
        canDraw: true,
      });
    } catch (err) {
      console.error('[App] Failed to auto-join created room for LiveKit voice token:', err);
    }
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
    // Clear URL query / room path back to root
    window.history.replaceState({}, '', '/');
  };

  const handleStartRoom = () => {
    if (!user) {
      setPendingAction('create_room');
      setAuthModalOpen(true);
    } else {
      setCreateModalOpen(true);
    }
  };

  const handleOpenJoin = (code?: string) => {
    setInitialInviteCode(code || '');
    setIsStandaloneJoin(false);
    setJoinModalOpen(true);
  };

  // 1. If in an active room, render the full collaborative room view
  if (activeRoom && activeSession) {
    return <RoomView room={activeRoom} session={activeSession} onLeave={handleLeaveRoom} />;
  }

  // 2. If direct invite route (/room/:inviteCode or ?join=...), render dedicated join screen directly
  if (isStandaloneJoin && joinModalOpen) {
    return (
      <>
        <JoinRoomModal
          isOpen={true}
          initialInviteCode={initialInviteCode}
          isStandalone={true}
          onClose={() => {
            setIsStandaloneJoin(false);
            setJoinModalOpen(false);
            window.history.pushState({}, '', '/');
          }}
          onRoomJoined={handleRoomJoined}
        />
        <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      </>
    );
  }

  // 3. Check for unknown routes -> branded 404 screen
  const currentPath = window.location.pathname;
  const isKnownRoute =
    currentPath === '/' ||
    currentPath.startsWith('/room/') ||
    currentPath === '/app' ||
    currentPath === '/dashboard';

  if (!isKnownRoute) {
    return (
      <div className="min-h-screen bg-[#F7F5EF] text-[#15162B] flex flex-col items-center justify-center p-6 text-center">
        <a href="/" className="flex items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-lg bg-[#3355FF] border-2 border-[#15162B] hard-shadow-sm flex items-center justify-center text-white">
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="9" className="opacity-30" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>
          <span className="font-display font-bold text-2xl text-[#15162B]">
            StudySync
          </span>
        </a>

        <div className="bg-white border-2 border-[#15162B] hard-shadow-lg rounded-2xl p-8 max-w-md w-full">
          <span className="px-3 py-1 rounded-full bg-[#FFE3E0] border-2 border-[#15162B] text-xs font-mono font-bold text-[#FF5B4C] uppercase tracking-wider inline-block mb-4">
            404 Error
          </span>
          <h1 className="font-display font-extrabold text-3xl text-[#15162B] mb-2">
            Page not found
          </h1>
          <p className="text-sm text-[#444654] mb-6 leading-relaxed">
            The study room or page you're looking for doesn't exist or has moved.
          </p>
          <a
            href="/"
            className="w-full py-3 bg-[#3355FF] text-white font-display font-bold text-sm rounded-xl border-2 border-[#15162B] hard-shadow hard-shadow-hover inline-flex items-center justify-center gap-2"
          >
            <span>Back to home</span>
          </a>
        </div>
      </div>
    );
  }

  // 4. Otherwise, render the marketing landing page at /
  return (
    <>
      <LandingPage
        onStartRoom={handleStartRoom}
        onJoinCode={() => handleOpenJoin()}
        onLogin={() => setAuthModalOpen(true)}
        onSignOut={signOut}
        user={user}
        displayName={displayName}
      />

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
        isStandalone={false}
        onClose={() => setJoinModalOpen(false)}
        onRoomJoined={handleRoomJoined}
      />
    </>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
