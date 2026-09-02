import { useState, useEffect, useRef, useCallback } from 'react';
import { WS_BASE_URL } from '../lib/api';

export interface ParticipantState {
  participantId: string;
  roomId: string;
  userId?: string | null;
  guestName?: string | null;
  displayName: string;
  isHost: boolean;
  canDraw: boolean;
  color: string;
  muted: boolean;
  speaking: boolean;
  joinedAt: string;
}

export interface DrawPermissionRequest {
  participantId: string;
  displayName: string;
  timestamp: string;
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
  const [canDraw, setCanDraw] = useState<boolean>(Boolean(isHost));
  const [myColor, setMyColor] = useState<string>(isHost ? '#d97706' : '#4f46e5');
  const [pendingDrawRequests, setPendingDrawRequests] = useState<DrawPermissionRequest[]>([]);
  const [drawRequestSent, setDrawRequestSent] = useState(false);
  const [drawRequestFeedback, setDrawRequestFeedback] = useState<string | null>(null);

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
            if (message.payload?.myColor) {
              setMyColor(message.payload.myColor);
            }
            if (typeof message.payload?.canDraw === 'boolean') {
              setCanDraw(message.payload.canDraw);
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
              setPendingDrawRequests((prev) => prev.filter((r) => r.participantId !== leftId));
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

          case 'board:draw_permission_requested': {
            if (isHost && message.payload) {
              const req: DrawPermissionRequest = message.payload;
              setPendingDrawRequests((prev) => {
                if (prev.some((r) => r.participantId === req.participantId)) {
                  return prev;
                }
                return [...prev, req];
              });
            }
            break;
          }

          case 'board:draw_permission_granted': {
            const { participantId: targetId } = message.payload || {};
            if (targetId) {
              setParticipants((prev) =>
                prev.map((p) => (p.participantId === targetId ? { ...p, canDraw: true } : p))
              );
              setPendingDrawRequests((prev) => prev.filter((r) => r.participantId !== targetId));

              if (targetId === myParticipantIdRef.current) {
                setCanDraw(true);
                setDrawRequestSent(false);
                setDrawRequestFeedback('draw permission granted by host');
                setTimeout(() => setDrawRequestFeedback(null), 3000);
              }
            }
            break;
          }

          case 'board:draw_permission_denied': {
            const { participantId: targetId } = message.payload || {};
            if (targetId) {
              setPendingDrawRequests((prev) => prev.filter((r) => r.participantId !== targetId));

              if (targetId === myParticipantIdRef.current) {
                setDrawRequestSent(false);
                setDrawRequestFeedback('host declined draw request');
                setTimeout(() => setDrawRequestFeedback(null), 3500);
              }
            }
            break;
          }

          case 'board:draw_permission_revoked': {
            const { participantId: targetId } = message.payload || {};
            if (targetId) {
              setParticipants((prev) =>
                prev.map((p) => (p.participantId === targetId ? { ...p, canDraw: false } : p))
              );

              if (targetId === myParticipantIdRef.current) {
                setCanDraw(false);
                setDrawRequestFeedback('draw permission revoked');
                setTimeout(() => setDrawRequestFeedback(null), 3000);
              }
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

  // Request draw permission (for participants)
  const requestDrawPermission = useCallback(() => {
    setDrawRequestSent(true);
    setDrawRequestFeedback('request sent to host');
    sendWsMessage('board:draw_permission_requested', {
      participantId: myParticipantIdRef.current,
      displayName,
    });
  }, [displayName, sendWsMessage]);

  // Grant draw permission (for host)
  const grantDrawPermission = useCallback(
    (targetParticipantId: string) => {
      sendWsMessage('board:draw_permission_granted', {
        participantId: targetParticipantId,
      });
      setPendingDrawRequests((prev) => prev.filter((r) => r.participantId !== targetParticipantId));
    },
    [sendWsMessage]
  );

  // Deny draw permission (for host)
  const denyDrawPermission = useCallback(
    (targetParticipantId: string) => {
      sendWsMessage('board:draw_permission_denied', {
        participantId: targetParticipantId,
      });
      setPendingDrawRequests((prev) => prev.filter((r) => r.participantId !== targetParticipantId));
    },
    [sendWsMessage]
  );

  // Revoke draw permission (for host)
  const revokeDrawPermission = useCallback(
    (targetParticipantId: string) => {
      sendWsMessage('board:draw_permission_revoked', {
        participantId: targetParticipantId,
      });
    },
    [sendWsMessage]
  );

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
    myColor,
    isMuted,
    isSpeaking,
    canDraw,
    pendingDrawRequests,
    drawRequestSent,
    drawRequestFeedback,
    requestDrawPermission,
    grantDrawPermission,
    denyDrawPermission,
    revokeDrawPermission,
    toggleMute,
    toggleSpeaking,
  };
}
