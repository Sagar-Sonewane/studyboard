import { Request, Response, NextFunction } from 'express';
import { getSupabaseAdmin } from '../services/supabase';
import { prisma } from '../services/prisma';

export interface AuthenticatedUser {
  id: string;
  email?: string;
  displayName: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

/**
 * Extracts and verifies the Supabase session token using Supabase's server-side getUser helper.
 * Resolves to the profile's id and display name.
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authorization header with Bearer token is required',
    });
  }

  const token = authHeader.split(' ')[1]?.trim();
  if (!token) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Token is empty',
    });
  }

  try {
    // 1. Check if Supabase client is configured
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: error?.message || 'Invalid or expired session token',
      });
    }

    const authUser = data.user;
    const userId = authUser.id;
    const email = authUser.email;
    const displayName =
      authUser.user_metadata?.display_name ||
      authUser.user_metadata?.name ||
      email?.split('@')[0] ||
      'User';

    // 2. Ensure profile exists in Postgres (safe fallback if trigger hasn't fired)
    try {
      if (process.env.DATABASE_URL) {
        await prisma.profile.upsert({
          where: { id: userId },
          update: {},
          create: {
            id: userId,
            displayName,
          },
        });
      }
    } catch (dbErr) {
      console.warn('[Auth Middleware] Profile upsert warning:', dbErr);
    }

    req.user = {
      id: userId,
      email,
      displayName,
    };

    return next();
  } catch (err: any) {
    // Fallback for offline development / mock mode
    if (token.startsWith('dev-user-')) {
      const parts = token.split(':');
      let devId = parts[1] || '00000000-0000-4000-8000-000000000001';
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(devId)) {
        devId = '00000000-0000-4000-8000-000000000001';
      }
      const devName = parts[2] || 'Dev Host';
      req.user = {
        id: devId,
        email: `${devName.toLowerCase().replace(/\s+/g, '')}@example.com`,
        displayName: devName,
      };

      if (process.env.DATABASE_URL) {
        try {
          await prisma.profile.upsert({
            where: { id: devId },
            update: { displayName: devName },
            create: { id: devId, displayName: devName },
          });
        } catch (err) {
          console.warn('[Auth Middleware] Dev profile upsert error:', err);
        }
      }

      return next();
    }

    return res.status(401).json({
      error: 'Unauthorized',
      message: err?.message || 'Authentication verification failed',
    });
  }
}

/**
 * Optional authentication middleware for endpoints like /join that accept both authenticated users and guests.
 */
export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = undefined;
    return next();
  }

  const token = authHeader.split(' ')[1]?.trim();
  if (!token) {
    req.user = undefined;
    return next();
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.auth.getUser(token);

    if (!error && data.user) {
      const authUser = data.user;
      const displayName =
        authUser.user_metadata?.display_name ||
        authUser.user_metadata?.name ||
        authUser.email?.split('@')[0] ||
        'User';

      req.user = {
        id: authUser.id,
        email: authUser.email,
        displayName,
      };

      if (process.env.DATABASE_URL) {
        try {
          await prisma.profile.upsert({
            where: { id: authUser.id },
            update: {},
            create: { id: authUser.id, displayName },
          });
        } catch {}
      }
    }
  } catch {
    // Handle mock token in dev if needed
    if (token.startsWith('dev-user-')) {
      const parts = token.split(':');
      req.user = {
        id: parts[1] || '00000000-0000-0000-0000-000000000001',
        displayName: parts[2] || 'Dev User',
      };
    } else {
      req.user = undefined;
    }
  }

  return next();
}
