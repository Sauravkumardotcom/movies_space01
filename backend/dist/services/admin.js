import { prisma } from '../lib/prisma';
import logger from '../utils/logger';
// ============================================
// ADMIN SERVICE
// ============================================
export const adminService = {
    /**
     * Get all users (admin only)
     */
    async getAllUsers(page = 1, limit = 20) {
        try {
            const skip = (page - 1) * limit;
            const [users, total] = await Promise.all([
                prisma.user.findMany({
                    skip,
                    take: limit,
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        createdAt: true,
                        isAdmin: true,
                    },
                    orderBy: { createdAt: 'desc' },
                }),
                prisma.user.count(),
            ]);
            return {
                data: users,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            };
        }
        catch (error) {
            logger.error('Error fetching all users:', error);
            throw new Error(error.message || 'Failed to fetch users');
        }
    },
    /**
     * Get user stats
     */
    async getUserStats(userId) {
        try {
            const [comments, ratings, favorites, watchlist, history, uploads] = await Promise.all([
                prisma.comment.count({ where: { userId } }),
                prisma.rating.count({ where: { userId } }),
                prisma.favorite.count({ where: { userId } }),
                prisma.watchlist.count({ where: { userId } }),
                prisma.history.count({ where: { userId } }),
                prisma.upload.count({ where: { userId } }),
            ]);
            return {
                comments,
                ratings,
                favorites,
                watchlist,
                history,
                uploads,
            };
        }
        catch (error) {
            logger.error('Error fetching user stats:', error);
            throw new Error(error.message || 'Failed to fetch stats');
        }
    },
    /**
     * Get platform stats
     */
    async getPlatformStats() {
        try {
            const [totalUsers, totalMovies, totalMusic, totalShorts, totalComments, totalRatings] = await Promise.all([
                prisma.user.count(),
                prisma.movie.count(),
                prisma.music.count(),
                prisma.short.count(),
                prisma.comment.count(),
                prisma.rating.count(),
            ]);
            return {
                totalUsers,
                totalMovies,
                totalMusic,
                totalShorts,
                totalComments,
                totalRatings,
                totalContent: totalMovies + totalMusic + totalShorts,
            };
        }
        catch (error) {
            logger.error('Error fetching platform stats:', error);
            throw new Error(error.message || 'Failed to fetch stats');
        }
    },
    /**
     * Ban a user
     */
    async banUser(userId, reason) {
        try {
            // Create ban record
            const ban = await prisma.ban.create({
                data: {
                    userId,
                    reason,
                    bannedUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
                },
            });
            // Optionally delete all sessions to force logout
            await prisma.session.deleteMany({
                where: { userId },
            });
            logger.info(`User banned: ${userId}`);
            return ban;
        }
        catch (error) {
            logger.error('Error banning user:', error);
            throw new Error(error.message || 'Failed to ban user');
        }
    },
    /**
     * Unban a user
     */
    async unbanUser(userId) {
        try {
            await prisma.ban.deleteMany({
                where: { userId },
            });
            logger.info(`User unbanned: ${userId}`);
        }
        catch (error) {
            logger.error('Error unbanning user:', error);
            throw new Error(error.message || 'Failed to unban user');
        }
    },
    /**
     * Check if user is banned
     */
    async isUserBanned(userId) {
        try {
            const ban = await prisma.ban.findFirst({
                where: {
                    userId,
                    bannedUntil: { gt: new Date() },
                },
            });
            return !!ban;
        }
        catch (error) {
            logger.error('Error checking ban status:', error);
            throw new Error(error.message || 'Failed to check ban status');
        }
    },
    /**
     * Delete a comment (admin only)
     */
    async deleteCommentAdmin(commentId, reason) {
        try {
            const comment = await prisma.comment.findUnique({
                where: { id: commentId },
            });
            if (!comment) {
                throw new Error('Comment not found');
            }
            // Delete replies
            await prisma.comment.deleteMany({
                where: { parentId: commentId },
            });
            // Delete comment
            await prisma.comment.delete({
                where: { id: commentId },
            });
            logger.info(`Comment deleted by admin: ${commentId}`);
            // Create moderation log
            await prisma.moderationLog.create({
                data: {
                    action: 'DELETE_COMMENT',
                    targetId: commentId,
                    targetType: 'COMMENT',
                    reason,
                },
            });
        }
        catch (error) {
            logger.error('Error deleting comment:', error);
            throw new Error(error.message || 'Failed to delete comment');
        }
    },
    /**
     * Get moderation logs
     */
    async getModerationLogs(page = 1, limit = 20) {
        try {
            const skip = (page - 1) * limit;
            const [logs, total] = await Promise.all([
                prisma.moderationLog.findMany({
                    skip,
                    take: limit,
                    orderBy: { createdAt: 'desc' },
                }),
                prisma.moderationLog.count(),
            ]);
            return {
                data: logs,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            };
        }
        catch (error) {
            logger.error('Error fetching moderation logs:', error);
            throw new Error(error.message || 'Failed to fetch logs');
        }
    },
    /**
     * Report content (user reports)
     */
    async reportContent(userId, contentId, contentType, reason) {
        try {
            const report = await prisma.report.create({
                data: {
                    userId,
                    contentId,
                    contentType,
                    reason,
                    status: 'PENDING',
                },
            });
            logger.info(`Content reported: ${contentId}`);
            return report;
        }
        catch (error) {
            logger.error('Error reporting content:', error);
            throw new Error(error.message || 'Failed to report content');
        }
    },
    /**
     * Get reports (admin only)
     */
    async getReports(page = 1, limit = 20, status) {
        try {
            const skip = (page - 1) * limit;
            const [reports, total] = await Promise.all([
                prisma.report.findMany({
                    where: status ? { status } : undefined,
                    skip,
                    take: limit,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        user: {
                            select: { username: true, email: true },
                        },
                    },
                }),
                prisma.report.count({
                    where: status ? { status } : undefined,
                }),
            ]);
            return {
                data: reports,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            };
        }
        catch (error) {
            logger.error('Error fetching reports:', error);
            throw new Error(error.message || 'Failed to fetch reports');
        }
    },
    /**
     * Resolve report
     */
    async resolveReport(reportId, action, notes) {
        try {
            const report = await prisma.report.update({
                where: { id: reportId },
                data: {
                    status: 'RESOLVED',
                    resolvedAt: new Date(),
                    resolution: action,
                    resolutionNotes: notes,
                },
            });
            logger.info(`Report resolved: ${reportId}`);
            return report;
        }
        catch (error) {
            logger.error('Error resolving report:', error);
            throw new Error(error.message || 'Failed to resolve report');
        }
    },
};
//# sourceMappingURL=admin.js.map