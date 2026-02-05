import { prisma } from '../config/db/index';
import { z } from 'zod';
import logger from '../utils/logger/index';
// ============================================
// SCHEMAS
// ============================================
const ratingCreateSchema = z.object({
    entityId: z.string().min(1),
    entityType: z.enum(['movie', 'music', 'short']),
    rating: z.number().int().min(1).max(5),
    comment: z.string().max(500).optional(),
});
const watchlistAddSchema = z.object({
    movieId: z.string().min(1),
});
const favoriteAddSchema = z.object({
    entityId: z.string().min(1),
    entityType: z.enum(['movie', 'music', 'short']),
});
const historyCreateSchema = z.object({
    entityId: z.string().min(1),
    entityType: z.enum(['movie', 'music', 'short']),
    progress: z.number().int().min(0).default(0),
    duration: z.number().int().min(1),
});
// ============================================
// ENGAGEMENT SERVICE
// ============================================
export const engagementService = {
    // ============================================
    // RATINGS
    // ============================================
    /**
     * Create or update rating
     */
    async createRating(userId, input) {
        try {
            const validated = ratingCreateSchema.parse(input);
            const rating = await prisma.rating.upsert({
                where: {
                    userId_entityId_entityType: {
                        userId,
                        entityId: validated.entityId,
                        entityType: validated.entityType,
                    },
                },
                update: {
                    rating: validated.rating,
                    comment: validated.comment,
                },
                create: {
                    userId,
                    entityId: validated.entityId,
                    entityType: validated.entityType,
                    rating: validated.rating,
                    comment: validated.comment,
                    // Set specific FK if possible based on entityType
                    ...(validated.entityType === 'movie' && {
                        movieId: validated.entityId,
                    }),
                    ...(validated.entityType === 'music' && {
                        musicId: validated.entityId,
                    }),
                    ...(validated.entityType === 'short' && {
                        shortId: validated.entityId,
                    }),
                },
                select: {
                    id: true,
                    rating: true,
                    comment: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });
            return rating;
        }
        catch (error) {
            logger.error('Error in createRating:', error);
            throw error;
        }
    },
    /**
     * Get user rating for entity
     */
    async getUserRating(userId, entityId, entityType) {
        try {
            const rating = await prisma.rating.findUnique({
                where: {
                    userId_entityId_entityType: {
                        userId,
                        entityId,
                        entityType,
                    },
                },
                select: {
                    id: true,
                    rating: true,
                    comment: true,
                    createdAt: true,
                },
            });
            return rating;
        }
        catch (error) {
            logger.error('Error in getUserRating:', error);
            throw error;
        }
    },
    /**
     * Delete rating
     */
    async deleteRating(userId, entityId, entityType) {
        try {
            const rating = await prisma.rating.findUnique({
                where: {
                    userId_entityId_entityType: {
                        userId,
                        entityId,
                        entityType,
                    },
                },
                select: { userId: true },
            });
            if (!rating) {
                throw new Error(`Rating not found`);
            }
            if (rating.userId !== userId) {
                throw new Error('Unauthorized: Cannot delete rating');
            }
            await prisma.rating.delete({
                where: {
                    userId_entityId_entityType: {
                        userId,
                        entityId,
                        entityType,
                    },
                },
            });
            return { success: true };
        }
        catch (error) {
            logger.error('Error in deleteRating:', error);
            throw error;
        }
    },
    /**
     * Get entity ratings summary
     */
    async getEntityRatings(entityId, entityType) {
        try {
            const ratings = await prisma.rating.findMany({
                where: {
                    entityId,
                    entityType,
                },
                select: {
                    rating: true,
                },
            });
            if (ratings.length === 0) {
                return {
                    count: 0,
                    average: 0,
                    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
                };
            }
            const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
            const average = sum / ratings.length;
            const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
            ratings.forEach((r) => {
                distribution[r.rating]++;
            });
            return {
                count: ratings.length,
                average: Math.round(average * 10) / 10,
                distribution,
            };
        }
        catch (error) {
            logger.error('Error in getEntityRatings:', error);
            throw error;
        }
    },
    // ============================================
    // FAVORITES
    // ============================================
    /**
     * Add to favorites
     */
    async addToFavorites(userId, input) {
        try {
            const validated = favoriteAddSchema.parse(input);
            const favorite = await prisma.favorite.upsert({
                where: {
                    userId_entityId_entityType: {
                        userId,
                        entityId: validated.entityId,
                        entityType: validated.entityType,
                    },
                },
                update: {},
                create: {
                    userId,
                    entityId: validated.entityId,
                    entityType: validated.entityType,
                },
                select: {
                    id: true,
                    entityId: true,
                    entityType: true,
                    addedAt: true,
                },
            });
            return favorite;
        }
        catch (error) {
            logger.error('Error in addToFavorites:', error);
            throw error;
        }
    },
    /**
     * Remove from favorites
     */
    async removeFromFavorites(userId, entityId, entityType) {
        try {
            const favorite = await prisma.favorite.findUnique({
                where: {
                    userId_entityId_entityType: {
                        userId,
                        entityId,
                        entityType,
                    },
                },
                select: { userId: true },
            });
            if (!favorite) {
                throw new Error(`Favorite not found`);
            }
            if (favorite.userId !== userId) {
                throw new Error('Unauthorized: Cannot remove favorite');
            }
            await prisma.favorite.delete({
                where: {
                    userId_entityId_entityType: {
                        userId,
                        entityId,
                        entityType,
                    },
                },
            });
            return { success: true };
        }
        catch (error) {
            logger.error('Error in removeFromFavorites:', error);
            throw error;
        }
    },
    /**
     * Get user's favorites
     */
    async getUserFavorites(userId, entityType, page = 1, limit = 20) {
        try {
            const skip = (page - 1) * limit;
            const where = { userId };
            if (entityType)
                where.entityType = entityType;
            const [data, total] = await Promise.all([
                prisma.favorite.findMany({
                    where,
                    skip,
                    take: limit,
                    select: {
                        id: true,
                        entityId: true,
                        entityType: true,
                        addedAt: true,
                    },
                    orderBy: { addedAt: 'desc' },
                }),
                prisma.favorite.count({ where }),
            ]);
            return {
                data,
                pagination: {
                    total,
                    page,
                    limit,
                    pages: Math.ceil(total / limit),
                },
            };
        }
        catch (error) {
            logger.error('Error in getUserFavorites:', error);
            throw error;
        }
    },
    /**
     * Check if favorited
     */
    async isFavorited(userId, entityId, entityType) {
        try {
            const favorite = await prisma.favorite.findUnique({
                where: {
                    userId_entityId_entityType: {
                        userId,
                        entityId,
                        entityType,
                    },
                },
            });
            return !!favorite;
        }
        catch (error) {
            logger.error('Error in isFavorited:', error);
            throw error;
        }
    },
    // ============================================
    // WATCHLIST
    // ============================================
    /**
     * Add to watchlist
     */
    async addToWatchlist(userId, input) {
        try {
            const validated = watchlistAddSchema.parse(input);
            const watchlist = await prisma.watchlist.upsert({
                where: {
                    userId_movieId: {
                        userId,
                        movieId: validated.movieId,
                    },
                },
                update: {},
                create: {
                    userId,
                    movieId: validated.movieId,
                },
                select: {
                    id: true,
                    movieId: true,
                    addedAt: true,
                },
            });
            return watchlist;
        }
        catch (error) {
            logger.error('Error in addToWatchlist:', error);
            throw error;
        }
    },
    /**
     * Remove from watchlist
     */
    async removeFromWatchlist(userId, movieId) {
        try {
            const watchlist = await prisma.watchlist.findUnique({
                where: {
                    userId_movieId: {
                        userId,
                        movieId,
                    },
                },
                select: { userId: true },
            });
            if (!watchlist) {
                throw new Error(`Movie not in watchlist`);
            }
            if (watchlist.userId !== userId) {
                throw new Error('Unauthorized: Cannot remove from watchlist');
            }
            await prisma.watchlist.delete({
                where: {
                    userId_movieId: {
                        userId,
                        movieId,
                    },
                },
            });
            return { success: true };
        }
        catch (error) {
            logger.error('Error in removeFromWatchlist:', error);
            throw error;
        }
    },
    /**
     * Get user's watchlist
     */
    async getUserWatchlist(userId, page = 1, limit = 20) {
        try {
            const skip = (page - 1) * limit;
            const [data, total] = await Promise.all([
                prisma.watchlist.findMany({
                    where: { userId },
                    skip,
                    take: limit,
                    select: {
                        id: true,
                        movieId: true,
                        addedAt: true,
                    },
                    orderBy: { addedAt: 'desc' },
                }),
                prisma.watchlist.count({ where: { userId } }),
            ]);
            return {
                data,
                pagination: {
                    total,
                    page,
                    limit,
                    pages: Math.ceil(total / limit),
                },
            };
        }
        catch (error) {
            logger.error('Error in getUserWatchlist:', error);
            throw error;
        }
    },
    /**
     * Check if in watchlist
     */
    async isInWatchlist(userId, movieId) {
        try {
            const watchlist = await prisma.watchlist.findUnique({
                where: {
                    userId_movieId: {
                        userId,
                        movieId,
                    },
                },
            });
            return !!watchlist;
        }
        catch (error) {
            logger.error('Error in isInWatchlist:', error);
            throw error;
        }
    },
    // ============================================
    // HISTORY
    // ============================================
    /**
     * Add to history or update progress
     */
    async updateHistory(userId, input) {
        try {
            const validated = historyCreateSchema.parse(input);
            // Find existing history entry
            const existing = await prisma.history.findFirst({
                where: {
                    userId,
                    entityId: validated.entityId,
                    entityType: validated.entityType,
                },
                orderBy: { watchedAt: 'desc' },
            });
            if (existing) {
                // Update progress
                const updated = await prisma.history.update({
                    where: { id: existing.id },
                    data: {
                        progress: validated.progress,
                        watchedAt: new Date(),
                    },
                    select: {
                        id: true,
                        progress: true,
                        duration: true,
                        watchedAt: true,
                    },
                });
                return updated;
            }
            else {
                // Create new history entry
                const created = await prisma.history.create({
                    data: {
                        userId,
                        entityId: validated.entityId,
                        entityType: validated.entityType,
                        progress: validated.progress,
                        duration: validated.duration,
                        ...(validated.entityType === 'movie' && {
                            movieId: validated.entityId,
                        }),
                        ...(validated.entityType === 'music' && {
                            musicId: validated.entityId,
                        }),
                        ...(validated.entityType === 'short' && {
                            shortId: validated.entityId,
                        }),
                    },
                    select: {
                        id: true,
                        progress: true,
                        duration: true,
                        watchedAt: true,
                    },
                });
                return created;
            }
        }
        catch (error) {
            logger.error('Error in updateHistory:', error);
            throw error;
        }
    },
    /**
     * Get user's watch history
     */
    async getUserHistory(userId, entityType, page = 1, limit = 20) {
        try {
            const skip = (page - 1) * limit;
            const where = { userId };
            if (entityType)
                where.entityType = entityType;
            const [data, total] = await Promise.all([
                prisma.history.findMany({
                    where,
                    skip,
                    take: limit,
                    select: {
                        id: true,
                        entityId: true,
                        entityType: true,
                        progress: true,
                        duration: true,
                        watchedAt: true,
                    },
                    orderBy: { watchedAt: 'desc' },
                }),
                prisma.history.count({ where }),
            ]);
            return {
                data,
                pagination: {
                    total,
                    page,
                    limit,
                    pages: Math.ceil(total / limit),
                },
            };
        }
        catch (error) {
            logger.error('Error in getUserHistory:', error);
            throw error;
        }
    },
    /**
     * Get watch progress for entity
     */
    async getWatchProgress(userId, entityId, entityType) {
        try {
            const history = await prisma.history.findFirst({
                where: {
                    userId,
                    entityId,
                    entityType,
                },
                select: {
                    progress: true,
                    duration: true,
                    watchedAt: true,
                },
                orderBy: { watchedAt: 'desc' },
            });
            if (!history) {
                return null;
            }
            return {
                progress: history.progress,
                duration: history.duration,
                percentage: Math.round((history.progress / history.duration) * 100),
                lastWatched: history.watchedAt,
            };
        }
        catch (error) {
            logger.error('Error in getWatchProgress:', error);
            throw error;
        }
    },
    /**
     * Get engagement stats for user
     */
    async getUserEngagementStats(userId) {
        try {
            const [favoriteCount, ratingCount, watchlistCount, historyCount, totalProgress,] = await Promise.all([
                prisma.favorite.count({ where: { userId } }),
                prisma.rating.count({ where: { userId } }),
                prisma.watchlist.count({ where: { userId } }),
                prisma.history.count({ where: { userId } }),
                prisma.history.aggregate({
                    where: { userId },
                    _sum: { progress: true },
                }),
            ]);
            return {
                favorites: favoriteCount,
                ratings: ratingCount,
                watchlist: watchlistCount,
                historyEntries: historyCount,
                totalMinutesWatched: Math.round((totalProgress._sum.progress || 0) / 60),
            };
        }
        catch (error) {
            logger.error('Error in getUserEngagementStats:', error);
            throw error;
        }
    },
};
//# sourceMappingURL=engagement.js.map