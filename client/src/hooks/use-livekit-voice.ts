import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Room,
  RoomEvent,
  Track,
  Participant,
  RemoteParticipant,
  RemoteTrackPublication,
  TrackPublication,
} from 'livekit-client';
import { createLiveKitRoom, attachAudioTrack, detachAudioTrack } from '../lib/livekit';

export type VoiceConnectionState =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'retrying'
  | 'failed'
  | 'fallback';

export interface ParticipantAudioInfo {
  identity: string;
  isMuted: boolean;
  isSpeaking: boolean;
  audioLevel: number;
}

interface UseLiveKitVoiceOptions {
  roomId: string;
  participantId: string;
  token?: string;
  serverUrl?: string;
  isConfigured?: boolean;
  autoJoin?: boolean;
  onSpeakingChange?: (speaking: boolean) => void;
  onMuteChange?: (muted: boolean) => void;
}

export function useLiveKitVoice({
  roomId,
  participantId,
  token,
  serverUrl,
  isConfigured = true,
  autoJoin = true,
  onSpeakingChange,
  onMuteChange,
}: UseLiveKitVoiceOptions) {
  const [voiceStatus, setVoiceStatus] = useState<VoiceConnectionState>('disconnected');
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListenOnly, setIsListenOnly] = useState(false);
  const [needsAudioClick, setNeedsAudioClick] = useState(false);
  const [speakingIdentities, setSpeakingIdentities] = useState<Set<string>>(new Set());
  const [mutedIdentities, setMutedIdentities] = useState<Set<string>>(new Set());
  const [audioError, setAudioError] = useState<string | null>(null);

  const roomRef = useRef<Room | null>(null);
  const attachedAudioElements = useRef<Map<string, HTMLMediaElement>>(new Map());
  const retryCountRef = useRef(0);
  const retryTimeoutRef = useRef<any>(null);
  const maxRetries = 3;

  // Clean up audio elements
  const cleanupAudioElements = useCallback(() => {
    attachedAudioElements.current.forEach((el) => {
      try {
        el.pause();
        el.srcObject = null;
        el.remove();
      } catch {
        // ignore
      }
    });
    attachedAudioElements.current.clear();
  }, []);

  // Disconnect from LiveKit
  const disconnectVoice = useCallback(async () => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    if (roomRef.current) {
      try {
        await roomRef.current.disconnect();
      } catch (e) {
        console.error('[LiveKit Hook] Disconnect error:', e);
      }
      roomRef.current = null;
    }
    cleanupAudioElements();
    setVoiceStatus('disconnected');
    setIsSpeaking(false);
    setIsListenOnly(false);
    setNeedsAudioClick(false);
    setSpeakingIdentities(new Set());
  }, [cleanupAudioElements]);

  // Connect to LiveKit room
  const connectVoice = useCallback(async () => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

    if (!token || !serverUrl) {
      return;
    }

    // If unconfigured or mock token, enter fallback mode gracefully
    if (!isConfigured || token.startsWith('mock-livekit-token')) {
      console.log('[LiveKit Hook] LiveKit unconfigured or mock token provided — operating in local simulated voice mode.');
      setVoiceStatus('fallback');
      return;
    }

    try {
      setVoiceStatus((prev) => (prev === 'retrying' ? 'retrying' : 'connecting'));
      setAudioError(null);

      // Disconnect existing if any
      if (roomRef.current) {
        try {
          await roomRef.current.disconnect();
        } catch {
          // ignore
        }
      }

      const room = createLiveKitRoom();
      roomRef.current = room;

      // Handle active speakers
      room.on(RoomEvent.ActiveSpeakersChanged, (speakers: Participant[]) => {
        const speakingSet = new Set<string>();
        let localIsSpeaking = false;

        speakers.forEach((s) => {
          speakingSet.add(s.identity);
          if (s.identity === participantId) {
            localIsSpeaking = true;
          }
        });

        setSpeakingIdentities(speakingSet);
        setIsSpeaking(localIsSpeaking);
        onSpeakingChange?.(localIsSpeaking);
      });

      // Handle track subscription for remote audio
      room.on(
        RoomEvent.TrackSubscribed,
        (track: Track, _publication: RemoteTrackPublication, participant: RemoteParticipant) => {
          if (track.kind === Track.Kind.Audio) {
            const el = attachAudioTrack(track);
            attachedAudioElements.current.set(participant.identity, el);
          }
        }
      );

      // Handle track unsubscribed
      room.on(RoomEvent.TrackUnsubscribed, (track: Track, _publication: TrackPublication, participant: RemoteParticipant) => {
        if (track.kind === Track.Kind.Audio) {
          detachAudioTrack(track);
          attachedAudioElements.current.delete(participant.identity);
        }
      });

      // Track mute state changes
      const updateParticipantMuteState = (participant: Participant, muted: boolean) => {
        setMutedIdentities((prev) => {
          const next = new Set(prev);
          if (muted) {
            next.add(participant.identity);
          } else {
            next.delete(participant.identity);
          }
          return next;
        });

        if (participant.identity === participantId) {
          setIsMuted(muted);
          onMuteChange?.(muted);
        }
      };

      room.on(RoomEvent.TrackMuted, (publication: TrackPublication, participant: Participant) => {
        if (publication.kind === Track.Kind.Audio) {
          updateParticipantMuteState(participant, true);
        }
      });

      room.on(RoomEvent.TrackUnmuted, (publication: TrackPublication, participant: Participant) => {
        if (publication.kind === Track.Kind.Audio) {
          updateParticipantMuteState(participant, false);
        }
      });

      // Connection state listeners
      room.on(RoomEvent.Reconnecting, () => {
        setVoiceStatus('reconnecting');
      });

      room.on(RoomEvent.Reconnected, () => {
        setVoiceStatus('connected');
        retryCountRef.current = 0;
      });

      room.on(RoomEvent.Disconnected, () => {
        setVoiceStatus('disconnected');
        cleanupAudioElements();
      });

      // Monitor browser autoplay policy
      room.on(RoomEvent.AudioPlaybackStatusChanged, () => {
        setNeedsAudioClick(!room.canPlaybackAudio);
      });

      // Connect to LiveKit server
      await room.connect(serverUrl, token);
      retryCountRef.current = 0;

      // Check initial audio playback status
      if (!room.canPlaybackAudio) {
        setNeedsAudioClick(true);
      }

      // Enable local microphone by default; fall back gracefully to listen-only if permission denied
      try {
        await room.localParticipant.setMicrophoneEnabled(true);
        setIsMuted(false);
        setIsListenOnly(false);
      } catch (micErr: any) {
        console.warn('[LiveKit Hook] Microphone access denied or unavailable; connected in listen-only mode:', micErr);
        setIsMuted(true);
        setIsListenOnly(true);
      }

      setVoiceStatus('connected');
      console.log(`[LiveKit Hook] Connected to voice room: ${roomId} as ${participantId}`);
    } catch (err: any) {
      console.error('[LiveKit Hook] Connection error:', err);
      if (retryCountRef.current < maxRetries) {
        retryCountRef.current += 1;
        const backoffMs = Math.min(1000 * Math.pow(2, retryCountRef.current - 1), 6000);
        setVoiceStatus('retrying');
        setAudioError(`Retrying voice connection (attempt ${retryCountRef.current}/${maxRetries})...`);
        retryTimeoutRef.current = setTimeout(() => {
          connectVoice();
        }, backoffMs);
      } else {
        setAudioError(err.message || 'Failed to connect to voice');
        setVoiceStatus('failed');
      }
    }
  }, [token, serverUrl, isConfigured, roomId, participantId, cleanupAudioElements, onSpeakingChange, onMuteChange]);

  // User click action to unlock browser audio playback
  const startAudioPlayback = useCallback(async () => {
    if (roomRef.current) {
      try {
        await roomRef.current.startAudio();
        setNeedsAudioClick(!roomRef.current.canPlaybackAudio);
      } catch (err) {
        console.error('[LiveKit Hook] Failed to start audio playback on click:', err);
      }
    }
  }, []);

  // Manual retry connection
  const retryVoice = useCallback(() => {
    retryCountRef.current = 0;
    connectVoice();
  }, [connectVoice]);

  // Toggle local mute
  const toggleMute = useCallback(async () => {
    if (voiceStatus === 'connected' && roomRef.current && !isListenOnly) {
      const nextMuteState = !isMuted;
      try {
        await roomRef.current.localParticipant.setMicrophoneEnabled(!nextMuteState);
        setIsMuted(nextMuteState);
        onMuteChange?.(nextMuteState);
      } catch (err: any) {
        console.error('[LiveKit Hook] Failed to toggle mic:', err);
      }
    } else {
      // Fallback or listen-only toggle
      setIsMuted((prev) => {
        const next = !prev;
        onMuteChange?.(next);
        return next;
      });
    }
  }, [voiceStatus, isMuted, isListenOnly, onMuteChange]);

  // Set explicit mute
  const setMicrophoneMuted = useCallback(
    async (muted: boolean) => {
      if (voiceStatus === 'connected' && roomRef.current && !isListenOnly) {
        try {
          await roomRef.current.localParticipant.setMicrophoneEnabled(!muted);
          setIsMuted(muted);
          onMuteChange?.(muted);
        } catch (err) {
          console.error('[LiveKit Hook] Failed to set mic mute state:', err);
        }
      } else {
        setIsMuted(muted);
        onMuteChange?.(muted);
      }
    },
    [voiceStatus, isListenOnly, onMuteChange]
  );

  // Auto connect on mount / prop update
  useEffect(() => {
    if (autoJoin && token && serverUrl) {
      connectVoice();
    }

    return () => {
      disconnectVoice();
    };
  }, [autoJoin, token, serverUrl, connectVoice, disconnectVoice]);

  return {
    voiceStatus,
    isConnected: voiceStatus === 'connected' || voiceStatus === 'fallback',
    isMuted,
    isSpeaking,
    isListenOnly,
    needsAudioClick,
    startAudioPlayback,
    speakingIdentities,
    mutedIdentities,
    audioError,
    connectVoice,
    retryVoice,
    disconnectVoice,
    toggleMute,
    setMicrophoneMuted,
  };
}
