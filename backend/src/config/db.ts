import { PrismaClient } from '@prisma/client';

// Ensure we reuse Prisma instances in serverless environments
let prisma: PrismaClient;

// Use global to persist Prisma client for serverless environments
const globalForPrisma = global as unknown as { prisma: PrismaClient };

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
    // Connection pooling for serverless
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
}

prisma = globalForPrisma.prisma;

export { prisma };
