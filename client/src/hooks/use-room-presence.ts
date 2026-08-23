import { useState, useEffect, useRef, useCallback } from 'react';
import { WS_BASE_URL } from '../lib/api';

export interface ParticipantState {
  participantId: string;
  roomId: string;
  userId?: string | null;
  guestName?: string | null;
  displayName: string;
  isHost: boolean;
  muted: boolean;
  speaking: boolean;
  joinedAt: string;
}

interface UseRoomPresenceOptions {
  roomId: string;
  participantId?: string;
  userId?: string | null;
  guestName?: string | null;
  displayName: string;
  isHost: boolean;
}

export function useRoomPresence({
  roomId,
  participantId,
  userId,
  guestName,
  displayName,
  isHost,
}: UseRoomPresenceOptions) {
  const [participants, setParticipants] = useState<ParticipantState[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const socketRef = useRef<WebSocket | null>(null);
  const myParticipantIdRef = useRef<string>(participantId || `p-${Date.now()}`);

  const sendWsMessage = useCallback((type: string, payload?: any) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          type,
          payload,
          timestamp: new Date().toISOString(),
        })
      );
    }
  }, []);

  // Connect and subscribe to room
  useEffect(() => {
    if (!roomId) return;

    let isMounted = true;
    const wsUrl = `${WS_BASE_URL}/ws`;
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      if (!isMounted) return;
      setIsConnected(true);

      // Send room:join event
      const joinPayload = {
        roomId,
        participantId: myParticipantIdRef.current,
        userId: userId || null,
        guestName: guestName || null,
        displayName: displayName || 'Participant',
        isHost: Boolean(isHost),
        muted: isMuted,
        speaking: isSpeaking,
      };
      socket.send(JSON.stringify({ type: 'room:join', payload: joinPayload }));
    };

    socket.onmessage = (event) => {
      if (!isMounted) return;
      try {
        const message = JSON.parse(event.data);

        switch (message.type) {
          case 'presence:sync': {
            if (message.payload?.participants) {
              setParticipants(message.payload.participants);
            }
            break;
          }

          case 'presence:join': {
            const newParticipant: ParticipantState = message.payload;
            if (newParticipant) {
              setParticipants((prev) => {
                const filtered = prev.filter((p) => p.participantId !== newParticipant.participantId);
                return [...filtered, newParticipant];
              });
            }
            break;
          }

          case 'presence:leave': {
            const { participantId: leftId } = message.payload || {};
            if (leftId) {
              setParticipants((prev) => prev.filter((p) => p.participantId !== leftId));
            }
            break;
          }

          case 'presence:mic_status': {
            const { participantId: targetId, muted } = message.payload || {};
            if (targetId) {
              setParticipants((prev) =>
                prev.map((p) => (p.participantId === targetId ? { ...p, muted } : p))
              );
            }
            break;
          }

          case 'presence:speaking': {
            const { participantId: targetId, speaking } = message.payload || {};
            if (targetId) {
              setParticipants((prev) =>
                prev.map((p) => (p.participantId === targetId ? { ...p, speaking } : p))
              );
            }
            break;
          }
        }
      } catch (err) {
        console.error('[useRoomPresence] Error handling message:', err);
      }
    };

    socket.onclose = () => {
      if (isMounted) setIsConnected(false);
    };

    socket.onerror = () => {
      if (isMounted) setIsConnected(false);
    };

    return () => {
      isMounted = false;
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'room:leave', payload: { roomId } }));
        socket.close();
      }
    };
  }, [roomId, userId, guestName, displayName, isHost]);

  // Toggle local mute
  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      sendWsMessage('presence:mic_status', { roomId, muted: next });
      setParticipants((list) =>
        list.map((p) => (p.participantId === myParticipantIdRef.current ? { ...p, muted: next } : p))
      );
      return next;
    });
  }, [roomId, sendWsMessage]);

  // Toggle local speaking indicator
  const toggleSpeaking = useCallback(() => {
    setIsSpeaking((prev) => {
      const next = !prev;
      sendWsMessage('presence:speaking', { roomId, speaking: next });
      setParticipants((list) =>
        list.map((p) => (p.participantId === myParticipantIdRef.current ? { ...p, speaking: next } : p))
      );
      return next;
    });
  }, [roomId, sendWsMessage]);

  return {
    participants,
    participantCount: participants.length,
    isConnected,
    myParticipantId: myParticipantIdRef.current,
    isMuted,
    isSpeaking,
    toggleMute,
    toggleSpeaking,
  };
}
