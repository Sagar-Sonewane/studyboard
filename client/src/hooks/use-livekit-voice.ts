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
  | 'error'
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
  const [speakingIdentities, setSpeakingIdentities] = useState<Set<string>>(new Set());
  const [mutedIdentities, setMutedIdentities] = useState<Set<string>>(new Set());
  const [audioError, setAudioError] = useState<string | null>(null);

  const roomRef = useRef<Room | null>(null);
  const attachedAudioElements = useRef<Map<string, HTMLMediaElement>>(new Map());

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
    setSpeakingIdentities(new Set());
  }, [cleanupAudioElements]);

  // Connect to LiveKit room
  const connectVoice = useCallback(async () => {
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
      setVoiceStatus('connecting');
      setAudioError(null);

      // Disconnect existing if any
      if (roomRef.current) {
        await roomRef.current.disconnect();
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
      });

      room.on(RoomEvent.Disconnected, () => {
        setVoiceStatus('disconnected');
        cleanupAudioElements();
      });

      // Connect to LiveKit server
      await room.connect(serverUrl, token);

      // Enable local microphone by default
      try {
        await room.localParticipant.setMicrophoneEnabled(true);
        setIsMuted(false);
      } catch (micErr: any) {
        console.warn('[LiveKit Hook] Microphone access not granted or unavailable:', micErr);
        setIsMuted(true);
      }

      setVoiceStatus('connected');
      console.log(`[LiveKit Hook] Connected to voice room: ${roomId} as ${participantId}`);
    } catch (err: any) {
      console.error('[LiveKit Hook] Connection error:', err);
      setAudioError(err.message || 'Failed to connect to voice');
      setVoiceStatus('error');
    }
  }, [token, serverUrl, isConfigured, roomId, participantId, cleanupAudioElements, onSpeakingChange, onMuteChange]);

  // Toggle local mute
  const toggleMute = useCallback(async () => {
    if (voiceStatus === 'connected' && roomRef.current) {
      const nextMuteState = !isMuted;
      try {
        await roomRef.current.localParticipant.setMicrophoneEnabled(!nextMuteState);
        setIsMuted(nextMuteState);
        onMuteChange?.(nextMuteState);
      } catch (err: any) {
        console.error('[LiveKit Hook] Failed to toggle mic:', err);
      }
    } else {
      // Fallback or offline toggle
      setIsMuted((prev) => {
        const next = !prev;
        onMuteChange?.(next);
        return next;
      });
    }
  }, [voiceStatus, isMuted, onMuteChange]);

  // Set explicit mute
  const setMicrophoneMuted = useCallback(
    async (muted: boolean) => {
      if (voiceStatus === 'connected' && roomRef.current) {
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
    [voiceStatus, onMuteChange]
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
    speakingIdentities,
    mutedIdentities,
    audioError,
    connectVoice,
    disconnectVoice,
    toggleMute,
    setMicrophoneMuted,
  };
}
