import { AccessToken } from 'livekit-server-sdk';

export interface GenerateTokenOptions {
  roomId: string;
  participantId: string;
  displayName: string;
  userId?: string | null;
  isHost?: boolean;
}

export interface LiveKitTokenResult {
  token: string;
  serverUrl: string;
  isConfigured: boolean;
}

/**
 * Generate a scoped LiveKit access token for joining a specific room.
 */
export async function generateLiveKitToken({
  roomId,
  participantId,
  displayName,
  userId = null,
  isHost = false,
}: GenerateTokenOptions): Promise<LiveKitTokenResult> {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const livekitUrl = process.env.LIVEKIT_URL || 'wss://demo.livekit.cloud';

  if (!apiKey || !apiSecret) {
    console.warn(
      '[LiveKit Service] LIVEKIT_API_KEY or LIVEKIT_API_SECRET is not set in environment. Generating development placeholder token.'
    );
    // Dev stub fallback token to allow offline testing without crashing
    return {
      token: `mock-livekit-token-${roomId}-${participantId}-${Date.now()}`,
      serverUrl: livekitUrl,
      isConfigured: false,
    };
  }

  try {
    const at = new AccessToken(apiKey, apiSecret, {
      identity: participantId,
      name: displayName,
      ttl: '6h',
      metadata: JSON.stringify({
        userId,
        isHost: Boolean(isHost),
        roomId,
      }),
    });

    at.addGrant({
      roomJoin: true,
      room: roomId,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
      roomAdmin: Boolean(isHost),
    });

    const token = await at.toJwt();

    return {
      token,
      serverUrl: livekitUrl,
      isConfigured: true,
    };
  } catch (err) {
    console.error('[LiveKit Service] Failed to mint LiveKit access token:', err);
    throw new Error('Failed to generate LiveKit access token');
  }
}
