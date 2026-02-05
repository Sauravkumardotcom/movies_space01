import { PrismaClient } from '@prisma/client';
// Ensure we reuse Prisma instances in serverless environments
let prisma;
// Use global to persist Prisma client for serverless environments
const globalForPrisma = global;
if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
        // Connection pooling for serverless
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
}
prisma = globalForPrisma.prisma;
export { prisma };
//# sourceMappingURL=db.js.map