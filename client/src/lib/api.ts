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

export interface BoardInfo {
  id: string;
  roomId: string;
  isShared: boolean;
  forkedFromBoardId?: string | null;
  ownerId?: string | null;
  createdAt: string;
}

/**
 * GET /api/rooms/:id/boards — Fetch room boards (shared + forked)
 */
export async function fetchBoards(
  roomId: string,
  token?: string | null
): Promise<{ roomId: string; boards: BoardInfo[] }> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/api/rooms/${encodeURIComponent(roomId)}/boards`, {
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to fetch boards (${response.status})`);
  }

  return response.json();
}

/**
 * POST /api/rooms/:id/boards/fork — Fork shared board into personal copy
 */
export async function forkBoard(
  roomId: string,
  token?: string | null,
  fromBoardId?: string
): Promise<{ board: BoardInfo; message: string }> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/api/rooms/${encodeURIComponent(roomId)}/boards/fork`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ fromBoardId }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to fork board (${response.status})`);
  }

  return response.json();
}

export interface UploadedFileInfo {
  id: string;
  boardId: string;
  uploadedBy: string;
  uploaderName?: string;
  storagePath: string;
  fileType: 'image' | 'pdf_page' | 'doc_converted';
  originalFilename: string;
  sizeBytes: number;
  createdAt: string;
  url: string;
}

export interface UploadFileResponse {
  file: UploadedFileInfo;
  url: string;
  message: string;
}

/**
 * POST /api/rooms/:id/files — Multipart upload file to whiteboard
 */
export async function uploadRoomFile(
  roomId: string,
  file: File | Blob,
  options: {
    originalFilename?: string;
    fileType?: 'image' | 'pdf_page' | 'doc_converted';
    boardId?: string | null;
    token?: string | null;
  } = {}
): Promise<UploadFileResponse> {
  const formData = new FormData();
  formData.append('file', file, options.originalFilename || (file as File).name || 'upload.png');
  if (options.fileType) {
    formData.append('fileType', options.fileType);
  }
  if (options.boardId) {
    formData.append('boardId', options.boardId);
  }

  const headers: Record<string, string> = {};
  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const response = await fetch(`${API_BASE_URL}/api/rooms/${encodeURIComponent(roomId)}/files`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `File upload failed (${response.status})`);
  }

  return response.json();
}

/**
 * GET /api/rooms/:id/files — List files on room's whiteboard
 */
export async function fetchRoomFiles(
  roomId: string,
  token?: string | null
): Promise<{ roomId: string; files: UploadedFileInfo[] }> {
  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/api/rooms/${encodeURIComponent(roomId)}/files`, {
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to fetch room files (${response.status})`);
  }

  return response.json();
}



