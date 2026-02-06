import { Router, Request, Response } from 'express';
import { sendResponse } from '@utils/response';
import { prisma } from '@config/db';

const router = Router();

// Health check with database connectivity
router.get('/', async (req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    sendResponse(res, 200, 'API is running', { 
      uptime: process.uptime(),
      db: 'connected'
    });
  } catch (err) {
    sendResponse(res, 200, 'API is running', { 
      uptime: process.uptime(),
      db: 'disconnected',
      error: err instanceof Error ? err.message : 'Unknown error'
    });
  }
});

// API info
router.get('/info', (req: Request, res: Response) => {
  sendResponse(res, 200, 'API Information', {
    name: 'Movies Space API',
    version: '1.0.0',
    environment: process.env.NODE_ENV,
  });
});

export default router;
