export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
export const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:4000';

export interface HealthCheckResponse {
  status: 'healthy' | 'degraded';
  service: string;
  version: string;
  uptimeSeconds: number;
  timestamp: string;
  database: {
    connected: boolean;
    message: string;
    latencyMs?: number;
    timestamp: string;
  };
  supabase: {
    urlConfigured: boolean;
    serviceRoleConfigured: boolean;
    anonKeyConfigured: boolean;
  };
  environment: string;
}

export interface RoomDetails {
  id: string;
  name: string;
  inviteCode: string;
  hostId: string;
  hostName: string;
  status: 'active' | 'paused' | 'ended';
  participantCount?: number;
  createdAt: string;
}

export interface JoinRoomResponse {
  participantId: string;
  roomId: string;
  roomName: string;
  isHost: boolean;
  user?: {
    id: string;
    displayName: string;
    email?: string;
  };
  guest?: {
    name: string;
  };
  livekitToken?: string;
  livekitUrl?: string;
  isLiveKitConfigured?: boolean;
  joinedAt: string;
}

export interface LiveKitTokenResponse {
  roomId: string;
  participantId: string;
  token: string;
  serverUrl: string;
  isConfigured: boolean;
}

export async function fetchHealth(): Promise<HealthCheckResponse> {
  const response = await fetch(`${API_BASE_URL}/api/health`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Health check request failed with status: ${response.status}`);
  }

  return response.json();
}

/**
 * POST /api/rooms — Create a new room (requires token)
 */
export async function createRoom(name: string, token: string): Promise<RoomDetails> {
  const response = await fetch(`${API_BASE_URL}/api/rooms`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to create room (${response.status})`);
  }

  return response.json();
}

/**
 * GET /api/rooms/:inviteCode — Resolve invite code to room info
 */
export async function getRoomByInviteCode(inviteCode: string): Promise<RoomDetails> {
  const response = await fetch(`${API_BASE_URL}/api/rooms/${encodeURIComponent(inviteCode)}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Room not found or invalid invite code (${response.status})`);
  }

  return response.json();
}

/**
 * POST /api/rooms/:id/join — Join as authenticated user or guest
 */
export async function joinRoom(
  roomId: string,
  options: { token?: string | null; guestName?: string }
): Promise<JoinRoomResponse> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const response = await fetch(`${API_BASE_URL}/api/rooms/${encodeURIComponent(roomId)}/join`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      guestName: options.guestName,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to join room (${response.status})`);
  }

  return response.json();
}

/**
 * POST /api/rooms/:id/token — Request or refresh LiveKit access token
 */
export async function fetchLiveKitToken(
  roomId: string,
  options: {
    participantId?: string;
    displayName?: string;
    token?: string | null;
  } = {}
): Promise<LiveKitTokenResponse> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const response = await fetch(`${API_BASE_URL}/api/rooms/${encodeURIComponent(roomId)}/token`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      participantId: options.participantId,
      displayName: options.displayName,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to fetch LiveKit token (${response.status})`);
  }

  return response.json();
}

