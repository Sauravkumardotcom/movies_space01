import { prisma } from '../lib/prisma.js';
import { z } from 'zod';
import logger from '../utils/logger.js';
// ============================================
// ZSCHEMAS
// ============================================
const commentCreateSchema = z.object({
    entityId: z.string().min(1),
    entityType: z.enum(['movie', 'music', 'short']),
    content: z.string().min(1).max(5000),
    rating: z.number().int().min(1).max(5).optional(),
});
const commentUpdateSchema = z.object({
    content: z.string().min(1).max(5000),
});
// ============================================
// COMMENT SERVICE
// ============================================
export const commentService = {
    /**
     * Create a new comment
     */
    async createComment(userId, input) {
        try {
            commentCreateSchema.parse(input);
            const comment = await prisma.comment.create({
                data: {
                    userId,
                    entityId: input.entityId,
                    entityType: input.entityType,
                    content: input.content,
                    rating: input.rating,
                },
                include: {
                    user: {
                        select: { id: true, username: true, email: true },
                    },
                    replies: {
                        take: 5,
                        orderBy: { createdAt: 'desc' },
                        include: {
                            user: {
                                select: { id: true, username: true, email: true },
                            },
                        },
                    },
                },
            });
            logger.info(`Comment created: ${comment.id}`);
            return comment;
        }
        catch (error) {
            logger.error('Error creating comment:', error);
            throw new Error(error.message || 'Failed to create comment');
        }
    },
    /**
     * Get comments for an entity (paginated)
     */
    async getEntityComments(entityId, entityType, page = 1, limit = 20, userId) {
        try {
            const skip = (page - 1) * limit;
            const [comments, total] = await Promise.all([
                prisma.comment.findMany({
                    where: {
                        entityId,
                        entityType,
                        parentId: null, // Only top-level comments
                    },
                    orderBy: { createdAt: 'desc' },
                    skip,
                    take: limit,
                    include: {
                        user: {
                            select: { id: true, username: true, email: true },
                        },
                        replies: {
                            take: 3,
                            orderBy: { createdAt: 'desc' },
                            include: {
                                user: {
                                    select: { id: true, username: true, email: true },
                                },
                            },
                        },
                        likes: userId
                            ? {
                                where: { userId },
                                select: { userId: true },
                            }
                            : undefined,
                    },
                }),
                prisma.comment.count({
                    where: {
                        entityId,
                        entityType,
                        parentId: null,
                    },
                }),
            ]);
            return {
                data: comments,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            };
        }
        catch (error) {
            logger.error('Error fetching entity comments:', error);
            throw new Error(error.message || 'Failed to fetch comments');
        }
    },
    /**
     * Get comment replies
     */
    async getCommentReplies(commentId, page = 1, limit = 10) {
        try {
            const skip = (page - 1) * limit;
            const [replies, total] = await Promise.all([
                prisma.comment.findMany({
                    where: { parentId: commentId },
                    orderBy: { createdAt: 'asc' },
                    skip,
                    take: limit,
                    include: {
                        user: {
                            select: { id: true, username: true, email: true },
                        },
                    },
                }),
                prisma.comment.count({
                    where: { parentId: commentId },
                }),
            ]);
            return {
                data: replies,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            };
        }
        catch (error) {
            logger.error('Error fetching comment replies:', error);
            throw new Error(error.message || 'Failed to fetch replies');
        }
    },
    /**
     * Reply to a comment
     */
    async replyToComment(userId, parentId, content) {
        try {
            if (!content || content.length < 1 || content.length > 5000) {
                throw new Error('Content must be between 1 and 5000 characters');
            }
            // Verify parent comment exists
            const parent = await prisma.comment.findUnique({
                where: { id: parentId },
            });
            if (!parent) {
                throw new Error('Parent comment not found');
            }
            const reply = await prisma.comment.create({
                data: {
                    userId,
                    content,
                    parentId,
                    entityId: parent.entityId,
                    entityType: parent.entityType,
                },
                include: {
                    user: {
                        select: { id: true, username: true, email: true },
                    },
                },
            });
            logger.info(`Reply created: ${reply.id}`);
            return reply;
        }
        catch (error) {
            logger.error('Error replying to comment:', error);
            throw new Error(error.message || 'Failed to reply to comment');
        }
    },
    /**
     * Update comment
     */
    async updateComment(userId, commentId, input) {
        try {
            commentUpdateSchema.parse(input);
            // Verify ownership
            const comment = await prisma.comment.findUnique({
                where: { id: commentId },
            });
            if (!comment) {
                throw new Error('Comment not found');
            }
            if (comment.userId !== userId) {
                throw new Error('Unauthorized: Cannot update other users comments');
            }
            const updated = await prisma.comment.update({
                where: { id: commentId },
                data: { content: input.content },
                include: {
                    user: {
                        select: { id: true, username: true, email: true },
                    },
                },
            });
            logger.info(`Comment updated: ${commentId}`);
            return updated;
        }
        catch (error) {
            logger.error('Error updating comment:', error);
            throw new Error(error.message || 'Failed to update comment');
        }
    },
    /**
     * Delete comment (also deletes replies)
     */
    async deleteComment(userId, commentId) {
        try {
            // Verify ownership
            const comment = await prisma.comment.findUnique({
                where: { id: commentId },
            });
            if (!comment) {
                throw new Error('Comment not found');
            }
            if (comment.userId !== userId) {
                throw new Error('Unauthorized: Cannot delete other users comments');
            }
            // Delete all replies first
            await prisma.comment.deleteMany({
                where: { parentId: commentId },
            });
            // Delete comment
            await prisma.comment.delete({
                where: { id: commentId },
            });
            logger.info(`Comment deleted: ${commentId}`);
        }
        catch (error) {
            logger.error('Error deleting comment:', error);
            throw new Error(error.message || 'Failed to delete comment');
        }
    },
    /**
     * Like a comment
     */
    async likeComment(userId, commentId) {
        try {
            // Verify comment exists
            const comment = await prisma.comment.findUnique({
                where: { id: commentId },
            });
            if (!comment) {
                throw new Error('Comment not found');
            }
            // Check if already liked
            const existing = await prisma.commentLike.findUnique({
                where: {
                    userId_commentId: { userId, commentId },
                },
            });
            if (existing) {
                throw new Error('Already liked');
            }
            const like = await prisma.commentLike.create({
                data: { userId, commentId },
            });
            logger.info(`Comment liked: ${commentId}`);
            return like;
        }
        catch (error) {
            logger.error('Error liking comment:', error);
            throw new Error(error.message || 'Failed to like comment');
        }
    },
    /**
     * Unlike a comment
     */
    async unlikeComment(userId, commentId) {
        try {
            await prisma.commentLike.delete({
                where: {
                    userId_commentId: { userId, commentId },
                },
            });
            logger.info(`Comment unliked: ${commentId}`);
        }
        catch (error) {
            logger.error('Error unliking comment:', error);
            throw new Error(error.message || 'Failed to unlike comment');
        }
    },
    /**
     * Get comment likes count
     */
    async getCommentLikesCount(commentId) {
        try {
            const count = await prisma.commentLike.count({
                where: { commentId },
            });
            return count;
        }
        catch (error) {
            logger.error('Error getting comment likes count:', error);
            throw new Error(error.message || 'Failed to get likes count');
        }
    },
    /**
     * Get user comments
     */
    async getUserComments(userId, page = 1, limit = 20) {
        try {
            const skip = (page - 1) * limit;
            const [comments, total] = await Promise.all([
                prisma.comment.findMany({
                    where: { userId, parentId: null },
                    orderBy: { createdAt: 'desc' },
                    skip,
                    take: limit,
                    include: {
                        user: {
                            select: { id: true, username: true, email: true },
                        },
                    },
                }),
                prisma.comment.count({
                    where: { userId, parentId: null },
                }),
            ]);
            return {
                data: comments,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            };
        }
        catch (error) {
            logger.error('Error fetching user comments:', error);
            throw new Error(error.message || 'Failed to fetch user comments');
        }
    },
};
//# sourceMappingURL=comment.js.map