import { Router, Request, Response } from 'express';
import { checkDatabaseConnection } from '../services/prisma';
import { getSupabaseConfigStatus } from '../services/supabase';

export const healthRouter = Router();

healthRouter.get('/health', async (_req: Request, res: Response) => {
  const dbStatus = await checkDatabaseConnection();
  const supabaseConfig = getSupabaseConfigStatus();

  const isHealthy = dbStatus.connected;

  res.status(isHealthy ? 200 : 200).json({
    status: isHealthy ? 'healthy' : 'degraded',
    service: 'studysync-backend',
    version: '0.1.0',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    database: dbStatus,
    supabase: supabaseConfig,
    environment: process.env.NODE_ENV || 'development',
  });
});

healthRouter.get('/info', (_req: Request, res: Response) => {
  res.json({
    name: 'StudySync Realtime Collaboration API',
    description: 'Node.js + Express + WebSocket + Prisma (Supabase Postgres) Backend',
    endpoints: {
      health: '/api/health',
      websocket: '/ws',
    },
  });
});
