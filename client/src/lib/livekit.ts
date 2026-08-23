import { Room, RoomOptions, Track } from 'livekit-client';

export const defaultRoomOptions: RoomOptions = {
  adaptiveStream: true,
  dynacast: true,
  audioCaptureDefaults: {
    autoGainControl: true,
    echoCancellation: true,
    noiseSuppression: true,
  },
  publishDefaults: {
    dtx: true,
  },
};

export function createLiveKitRoom(options?: RoomOptions): Room {
  return new Room({
    ...defaultRoomOptions,
    ...options,
  });
}

/**
 * Helper to safely attach a remote audio track to DOM
 */
export function attachAudioTrack(track: Track): HTMLMediaElement {
  const element = track.attach();
  element.style.display = 'none';
  document.body.appendChild(element);
  return element;
}

/**
 * Helper to detach a track and remove its elements from DOM
 */
export function detachAudioTrack(track: Track) {
  const elements = track.detach();
  elements.forEach((el) => el.remove());
}
