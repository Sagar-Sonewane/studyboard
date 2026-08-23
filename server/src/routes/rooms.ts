import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { prisma } from '../services/prisma';
import { requireAuth, optionalAuth } from '../middleware/auth';
import { generateLiveKitToken } from '../services/livekit';

export const roomsRouter = Router();

// In-memory room store fallback when DATABASE_URL is not yet configured
interface InMemoryRoom {
  id: string;
  name: string;
  hostId: string;
  hostName: string;
  inviteCode: string;
  status: 'active' | 'paused' | 'ended';
  createdAt: string;
  participants: Array<{
    id: string;
    userId?: string;
    displayName: string;
    isHost: boolean;
    joinedAt: string;
  }>;
}

const inMemoryRooms = new Map<string, InMemoryRoom>();

function generateInviteCode(): string {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${code.slice(0, 3)}-${code.slice(3)}`;
}

/**
 * POST /api/rooms — Create room (authenticated host only)
 * Contract: creates room, generates shareable invite code, creates shared board.
 */
roomsRouter.post('/', requireAuth, async (req: Request, res: Response) => {
  const user = req.user!;
  const { name } = req.body;
  const roomName = (name && typeof name === 'string' && name.trim()) ? name.trim() : `${user.displayName}'s Room`;
  const inviteCode = generateInviteCode();

  if (process.env.DATABASE_URL) {
    try {
      const result = await prisma.$transaction(async (tx) => {
        // 1. Ensure host profile exists
        await tx.profile.upsert({
          where: { id: user.id },
          update: { displayName: user.displayName },
          create: { id: user.id, displayName: user.displayName },
        });

        // 2. Create room
        const room = await tx.room.create({
          data: {
            name: roomName,
            hostId: user.id,
            inviteCode,
            status: 'active',
          },
        });

        // 3. Create default shared whiteboard
        await tx.board.create({
          data: {
            roomId: room.id,
            isShared: true,
          },
        });

        // 4. Record host as first participant
        const participant = await tx.roomParticipant.create({
          data: {
            roomId: room.id,
            userId: user.id,
          },
        });

        return { room, participant };
      });

      return res.status(201).json({
        id: result.room.id,
        name: result.room.name,
        hostId: result.room.hostId,
        hostName: user.displayName,
        inviteCode: result.room.inviteCode,
        status: result.room.status,
        createdAt: result.room.createdAt.toISOString(),
      });
    } catch (err: any) {
      console.error('[Rooms API] Failed to create room in database:', err);
      return res.status(500).json({
        error: 'DatabaseError',
        message: err.message || 'Failed to create room in database',
      });
    }
  }

  // Fallback in-memory store
  const roomId = crypto.randomUUID();
  const newRoom: InMemoryRoom = {
    id: roomId,
    name: roomName,
    hostId: user.id,
    hostName: user.displayName,
    inviteCode,
    status: 'active',
    createdAt: new Date().toISOString(),
    participants: [
      {
        id: crypto.randomUUID(),
        userId: user.id,
        displayName: user.displayName,
        isHost: true,
        joinedAt: new Date().toISOString(),
      },
    ],
  };

  inMemoryRooms.set(roomId, newRoom);
  inMemoryRooms.set(inviteCode, newRoom);

  return res.status(201).json({
    id: newRoom.id,
    name: newRoom.name,
    hostId: newRoom.hostId,
    hostName: newRoom.hostName,
    inviteCode: newRoom.inviteCode,
    status: newRoom.status,
    createdAt: newRoom.createdAt,
    notice: 'Stored in-memory (DATABASE_URL not set)',
  });
});

/**
 * GET /api/rooms/:inviteCode — Resolve invite code → room info
 * Contract: Used by the join screen before the user is authenticated/connected.
 */
roomsRouter.get('/:inviteCode', async (req: Request, res: Response) => {
  const { inviteCode } = req.params;

  if (process.env.DATABASE_URL) {
    try {
      const room = await prisma.room.findUnique({
        where: { inviteCode },
        include: {
          host: {
            select: {
              id: true,
              displayName: true,
            },
          },
          _count: {
            select: {
              participants: {
                where: { leftAt: null },
              },
            },
          },
        },
      });

      if (!room || room.status === 'ended') {
        return res.status(404).json({
          error: 'NotFound',
          message: 'Room not found or session has ended',
        });
      }

      return res.json({
        id: room.id,
        name: room.name,
        inviteCode: room.inviteCode,
        hostId: room.hostId,
        hostName: room.host.displayName,
        status: room.status,
        participantCount: room._count.participants,
        createdAt: room.createdAt.toISOString(),
      });
    } catch (err: any) {
      console.error('[Rooms API] Error querying room by invite code:', err);
    }
  }

  // Fallback in-memory check
  const memRoom = inMemoryRooms.get(inviteCode);
  if (!memRoom || memRoom.status === 'ended') {
    return res.status(404).json({
      error: 'NotFound',
      message: 'Room not found or session has ended',
    });
  }

  return res.json({
    id: memRoom.id,
    name: memRoom.name,
    inviteCode: memRoom.inviteCode,
    hostId: memRoom.hostId,
    hostName: memRoom.hostName,
    status: memRoom.status,
    participantCount: memRoom.participants.length,
    createdAt: memRoom.createdAt,
  });
});

/**
 * POST /api/rooms/:id/join — Join as guest or authenticated user
 * Contract: Guest joins require guestName without Supabase Auth; authenticated users send Bearer token.
 */
roomsRouter.post('/:id/join', optionalAuth, async (req: Request, res: Response) => {
  const { id: roomId } = req.params;
  const { guestName } = req.body;
  const user = req.user;

  // Validate join identity
  if (!user && (!guestName || typeof guestName !== 'string' || !guestName.trim())) {
    return res.status(400).json({
      error: 'BadRequest',
      message: 'Either authentication token or a valid guest name is required to join',
    });
  }

  const cleanGuestName = guestName?.trim();

  if (process.env.DATABASE_URL) {
    try {
      const room = await prisma.room.findUnique({
        where: { id: roomId },
        include: { host: true },
      });

      if (!room || room.status === 'ended') {
        return res.status(404).json({
          error: 'NotFound',
          message: 'Room not found or has ended',
        });
      }

      const isHost = user ? room.hostId === user.id : false;
      const displayName = user ? user.displayName : cleanGuestName!;

      // Create participant record
      const participant = await prisma.roomParticipant.create({
        data: {
          roomId: room.id,
          userId: user ? user.id : null,
          guestName: user ? null : cleanGuestName,
        },
      });

      // Generate LiveKit token for this participant
      const livekit = await generateLiveKitToken({
        roomId: room.id,
        participantId: participant.id,
        displayName,
        userId: user?.id,
        isHost,
      });

      return res.json({
        participantId: participant.id,
        roomId: room.id,
        roomName: room.name,
        isHost,
        user: user
          ? {
              id: user.id,
              displayName: user.displayName,
              email: user.email,
            }
          : undefined,
        guest: !user
          ? {
              name: cleanGuestName,
            }
          : undefined,
        livekitToken: livekit.token,
        livekitUrl: livekit.serverUrl,
        isLiveKitConfigured: livekit.isConfigured,
        joinedAt: participant.joinedAt.toISOString(),
      });
    } catch (err: any) {
      console.error('[Rooms API] Failed to join room in database:', err);
      return res.status(500).json({
        error: 'DatabaseError',
        message: err.message || 'Failed to record participant join',
      });
    }
  }

  // Fallback in-memory join
  const memRoom = inMemoryRooms.get(roomId);
  if (!memRoom || memRoom.status === 'ended') {
    return res.status(404).json({
      error: 'NotFound',
      message: 'Room not found or has ended',
    });
  }

  const isHost = user ? memRoom.hostId === user.id : false;
  const displayName = user ? user.displayName : cleanGuestName!;
  const participantId = crypto.randomUUID();

  memRoom.participants.push({
    id: participantId,
    userId: user?.id,
    displayName,
    isHost,
    joinedAt: new Date().toISOString(),
  });

  const livekit = await generateLiveKitToken({
    roomId: memRoom.id,
    participantId,
    displayName,
    userId: user?.id,
    isHost,
  });

  return res.json({
    participantId,
    roomId: memRoom.id,
    roomName: memRoom.name,
    isHost,
    user: user
      ? {
          id: user.id,
          displayName: user.displayName,
          email: user.email,
        }
      : undefined,
    guest: !user
      ? {
          name: cleanGuestName,
        }
      : undefined,
    livekitToken: livekit.token,
    livekitUrl: livekit.serverUrl,
    isLiveKitConfigured: livekit.isConfigured,
    joinedAt: new Date().toISOString(),
  });
});

/**
 * POST /api/rooms/:id/token & POST /api/rooms/:id/livekit-token
 * Fetch or refresh a scoped LiveKit access token for an active participant.
 */
const handleGetLiveKitToken = async (req: Request, res: Response) => {
  const { id: roomId } = req.params;
  const { participantId, displayName: customDisplayName } = req.body;
  const user = req.user;

  const targetParticipantId = participantId || user?.id || crypto.randomUUID();
  const displayName = user?.displayName || customDisplayName || 'Participant';

  let isHost = false;
  if (process.env.DATABASE_URL) {
    try {
      const room = await prisma.room.findUnique({ where: { id: roomId } });
      if (room) {
        isHost = user ? room.hostId === user.id : false;
      }
    } catch {
      // ignore
    }
  } else {
    const memRoom = inMemoryRooms.get(roomId);
    if (memRoom && user) {
      isHost = memRoom.hostId === user.id;
    }
  }

  try {
    const livekit = await generateLiveKitToken({
      roomId,
      participantId: targetParticipantId,
      displayName,
      userId: user?.id,
      isHost,
    });

    return res.json({
      roomId,
      participantId: targetParticipantId,
      token: livekit.token,
      serverUrl: livekit.serverUrl,
      isConfigured: livekit.isConfigured,
    });
  } catch (err: any) {
    console.error('[Rooms API] Failed to generate LiveKit token:', err);
    return res.status(500).json({
      error: 'TokenGenerationFailed',
      message: err.message || 'Failed to generate LiveKit token',
    });
  }
};

roomsRouter.post('/:id/token', optionalAuth, handleGetLiveKitToken);
roomsRouter.post('/:id/livekit-token', optionalAuth, handleGetLiveKitToken);

