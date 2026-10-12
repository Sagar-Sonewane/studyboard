import crypto from 'crypto';
import { getSupabaseAdmin, getSupabaseConfigStatus } from './supabase';
import { prisma } from './prisma';

export const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'room-files';
export const FREE_TIER_MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit in bytes
export const PAID_TIER_MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB limit in bytes

// In-memory fallback file storage for offline development
interface InMemoryStoredFile {
  storagePath: string;
  dataBase64: string;
  contentType: string;
  originalFilename: string;
  sizeBytes: number;
}
const inMemoryFileStore = new Map<string, InMemoryStoredFile>();

/**
 * Checks the room host's active entitlement to determine maximum allowed file size.
 * Free tier is capped at 10MB (10485760 bytes) per PRODUCT.md.
 */
export async function getRoomMaxFileSize(roomId: string): Promise<{ maxSizeBytes: number; isPremium: boolean }> {
  if (!process.env.DATABASE_URL) {
    return { maxSizeBytes: FREE_TIER_MAX_FILE_SIZE, isPremium: false };
  }

  try {
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      select: { hostId: true },
    });

    if (!room) {
      return { maxSizeBytes: FREE_TIER_MAX_FILE_SIZE, isPremium: false };
    }

    // Check host's active entitlement
    const entitlement = await prisma.entitlement.findFirst({
      where: {
        userId: room.hostId,
        status: 'active',
        expiresAt: { gt: new Date() },
      },
    });

    if (entitlement) {
      return { maxSizeBytes: PAID_TIER_MAX_FILE_SIZE, isPremium: true };
    }

    return { maxSizeBytes: FREE_TIER_MAX_FILE_SIZE, isPremium: false };
  } catch (err) {
    console.warn('[Storage Service] Entitlement check fallback to free tier:', err);
    return { maxSizeBytes: FREE_TIER_MAX_FILE_SIZE, isPremium: false };
  }
}

/**
 * Uploads a file buffer to Supabase Storage using the service role key.
 * Stores storage_path relative to bucket, matching DATA_MODEL.md.
 */
export async function uploadToStorage(
  storagePath: string,
  buffer: Buffer,
  contentType: string,
  originalFilename: string
): Promise<{ storagePath: string; publicUrl: string }> {
  const config = getSupabaseConfigStatus();

  if (config.urlConfigured) {
    try {
      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(storagePath, buffer, {
          contentType,
          upsert: true,
        });

      if (error) {
        console.error('[Storage Service] Supabase storage upload error:', error);
        throw new Error(error.message || 'Supabase storage upload failed');
      }

      const { data: pubData } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(storagePath);

      return {
        storagePath: data.path || storagePath,
        publicUrl: pubData.publicUrl,
      };
    } catch (uploadErr: any) {
      console.warn('[Storage Service] Supabase upload failed, falling back to data URL:', uploadErr?.message);
    }
  }

  // Fallback storage for offline dev
  const base64 = buffer.toString('base64');
  const dataUrl = `data:${contentType};base64,${base64}`;
  inMemoryFileStore.set(storagePath, {
    storagePath,
    dataBase64: dataUrl,
    contentType,
    originalFilename,
    sizeBytes: buffer.length,
  });

  return {
    storagePath,
    publicUrl: dataUrl,
  };
}

/**
 * Resolves a storage_path to an accessible public or data URL.
 */
export function getStoragePublicUrl(storagePath: string): string {
  if (inMemoryFileStore.has(storagePath)) {
    return inMemoryFileStore.get(storagePath)!.dataBase64;
  }

  const config = getSupabaseConfigStatus();
  if (config.urlConfigured) {
    try {
      const supabase = getSupabaseAdmin();
      const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath);
      return data.publicUrl;
    } catch {
      return '';
    }
  }

  return '';
}

/**
 * Sanitizes a filename for storage paths.
 */
export function sanitizeFilename(filename: string): string {
  const clean = filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .slice(0, 100);
  return clean || `file-${Date.now()}`;
}
