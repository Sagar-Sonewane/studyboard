import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export interface DatabaseStatus {
  connected: boolean;
  message: string;
  latencyMs?: number;
  timestamp: string;
}

export async function checkDatabaseConnection(): Promise<DatabaseStatus> {
  const start = Date.now();
  if (!process.env.DATABASE_URL) {
    return {
      connected: false,
      message: 'DATABASE_URL environment variable is not configured',
      timestamp: new Date().toISOString(),
    };
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    const latencyMs = Date.now() - start;
    return {
      connected: true,
      message: 'Supabase Postgres connection healthy via Prisma',
      latencyMs,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    return {
      connected: false,
      message: error?.message || 'Failed to connect to database',
      timestamp: new Date().toISOString(),
    };
  }
}
