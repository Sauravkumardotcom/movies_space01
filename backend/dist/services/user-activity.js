import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export const userActivityService = {
    // WATCHLIST
    async addToWatchlist(userId, movieId) {
        return prisma.watchlist.upsert({
            where: {
                userId_movieId: { userId, movieId },
            },
            update: {},
            create: { userId, movieId },
        });
    },
    async removeFromWatchlist(userId, movieId) {
        await prisma.watchlist.deleteMany({
            where: { userId, movieId },
        });
    },
    async getWatchlist(userId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [items, total] = await Promise.all([
            prisma.watchlist.findMany({
                where: { userId },
                include: { movie: true },
                skip,
                take: limit,
                orderBy: { addedAt: 'desc' },
            }),
            prisma.watchlist.count({ where: { userId } }),
        ]);
        return {
            items: items.map((w) => w.movie),
            total,
            page,
            limit,
            hasMore: skip + items.length < total,
        };
    },
    // FAVORITES
    async addToFavorites(userId, entityId, entityType) {
        return prisma.favorite.upsert({
            where: {
                userId_entityId_entityType: { userId, entityId, entityType },
            },
            update: {},
            create: { userId, entityId, entityType },
        });
    },
    async removeFromFavorites(userId, entityId, entityType) {
        await prisma.favorite.deleteMany({
            where: { userId, entityId, entityType },
        });
    },
    async getFavorites(userId) {
        return prisma.favorite.findMany({
            where: { userId },
            orderBy: { addedAt: 'desc' },
        });
    },
    // HISTORY
    async addToHistory(userId, entityId, entityType, progress, duration) {
        // Create or update history entry
        const where = { userId, entityId, entityType };
        const data = {
            userId,
            entityId,
            entityType,
            progress,
            duration,
            watchedAt: new Date(),
        };
        // Add specific entity relations based on type
        if (entityType === 'movie') {
            data.movieId = entityId;
        }
        else if (entityType === 'short') {
            data.shortId = entityId;
        }
        else if (entityType === 'music') {
            data.musicId = entityId;
        }
        return prisma.history.upsert({
            where: { userId_entityId_entityType: where },
            update: data,
            create: data,
        });
    },
    async getHistory(userId, limit = 50) {
        return prisma.history.findMany({
            where: { userId },
            orderBy: { watchedAt: 'desc' },
            take: limit,
            include: {
                movie: { select: { id: true, title: true, posterUrl: true } },
                short: { select: { id: true, title: true, thumbnailUrl: true } },
                music: { select: { id: true, title: true, artist: true, coverUrl: true } },
            },
        });
    },
    async clearHistory(userId) {
        await prisma.history.deleteMany({
            where: { userId },
        });
    },
    // RATINGS & REVIEWS
    async addRating(userId, entityId, entityType, rating, comment) {
        if (rating < 1 || rating > 5) {
            throw new Error('Rating must be between 1 and 5');
        }
        const where = { userId_entityId_entityType: { userId, entityId, entityType } };
        const data = {
            userId,
            entityId,
            entityType,
            rating,
            comment,
        };
        if (entityType === 'movie') {
            data.movieId = entityId;
        }
        else if (entityType === 'short') {
            data.shortId = entityId;
        }
        else if (entityType === 'music') {
            data.musicId = entityId;
        }
        return prisma.rating.upsert({
            where,
            update: data,
            create: data,
        });
    },
    async removeRating(userId, entityId, entityType) {
        await prisma.rating.deleteMany({
            where: { userId, entityId, entityType },
        });
    },
    async getRatings(entityId) {
        return prisma.rating.findMany({
            where: { entityId },
            include: {
                user: {
                    select: { id: true, username: true, avatar: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    },
    async getUserRating(userId, entityId, entityType) {
        return prisma.rating.findUnique({
            where: {
                userId_entityId_entityType: { userId, entityId, entityType },
            },
        });
    },
};
//# sourceMappingURL=user-activity.js.map