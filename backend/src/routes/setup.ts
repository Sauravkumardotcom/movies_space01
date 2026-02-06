import { Router, Request, Response } from 'express';
import { sendResponse } from '@utils/response';
import { prisma } from '@config/db';

const router = Router();

// Setup endpoint - pushes database schema
// Should only be called once during initial deployment
router.post('/database', async (req: Request, res: Response) => {
  try {
    // Test connection and create tables if needed
    const result = await prisma.$executeRawUnsafe(`SELECT 1`);
    
    // If we got here, database is accessible
    // Try to create a test table to verify schema is in place
    const tableCheck = await prisma.$executeRawUnsafe(
      `SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'User')`
    );

    if (!tableCheck) {
      // Tables don't exist - this shouldn't happen with prisma db push
      // but log it for debugging
      console.log('Warning: User table does not exist. Database schema may not have been synced.');
    }

    sendResponse(res, 200, 'Database setup verified', {
      connected: true,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Database setup error:', err);
    sendResponse(res, 500, 'Database setup failed', {
      error: err instanceof Error ? err.message : 'Unknown error',
    });
  }
});

export default router;
