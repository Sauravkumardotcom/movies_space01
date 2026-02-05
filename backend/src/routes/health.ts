import { Router, Request, Response } from 'express';
import { sendResponse } from '@utils/response';

const router = Router();

// Health check
router.get('/', (req: Request, res: Response) => {
  sendResponse(res, 200, 'API is running', { uptime: process.uptime() });
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
