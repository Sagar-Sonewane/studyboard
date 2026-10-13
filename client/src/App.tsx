import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './lib/auth-context';
import { AuthModal } from './components/auth/AuthModal';
import { CreateRoomModal } from './components/room/CreateRoomModal';
import { JoinRoomModal } from './components/room/JoinRoomModal';
import { RoomView } from './components/room/RoomView';
import { LandingPage } from './pages/LandingPage';
import { RoomDetails, JoinRoomResponse } from './lib/api';

function AppContent() {
  const { user, displayName, signOut } = useAuth();

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

  // 3. Otherwise, render the marketing landing page at /
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
