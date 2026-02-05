import { prisma } from '../lib/prisma';
import { z } from 'zod';
import logger from '../utils/logger';
// ============================================
// ZSCHEMAS
// ============================================
const createListSchema = z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
    isPublic: z.boolean().default(true),
});
const updateListSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().max(500).optional(),
    isPublic: z.boolean().optional(),
});
// ============================================
// SOCIAL SERVICE
// ============================================
export const socialService = {
    /**
     * Follow a user
     */
    async followUser(userId, followId) {
        try {
            if (userId === followId) {
                throw new Error('Cannot follow yourself');
            }
            // Verify target user exists
            const user = await prisma.user.findUnique({
                where: { id: followId },
            });
            if (!user) {
                throw new Error('User not found');
            }
            // Check if already following
            const existing = await prisma.follow.findUnique({
                where: {
                    followerId_followingId: { followerId: userId, followingId: followId },
                },
            });
            if (existing) {
                throw new Error('Already following');
            }
            const follow = await prisma.follow.create({
                data: { followerId: userId, followingId: followId },
            });
            logger.info(`User ${userId} followed ${followId}`);
            return follow;
        }
        catch (error) {
            logger.error('Error following user:', error);
            throw new Error(error.message || 'Failed to follow user');
        }
    },
    /**
     * Unfollow a user
     */
    async unfollowUser(userId, followId) {
        try {
            await prisma.follow.delete({
                where: {
                    followerId_followingId: { followerId: userId, followingId: followId },
                },
            });
            logger.info(`User ${userId} unfollowed ${followId}`);
        }
        catch (error) {
            logger.error('Error unfollowing user:', error);
            throw new Error(error.message || 'Failed to unfollow user');
        }
    },
    /**
     * Get followers
     */
    async getFollowers(userId, page = 1, limit = 20) {
        try {
            const skip = (page - 1) * limit;
            const [followers, total] = await Promise.all([
                prisma.follow.findMany({
                    where: { followingId: userId },
                    skip,
                    take: limit,
                    include: {
                        follower: {
                            select: { id: true, username: true, email: true },
                        },
                    },
                }),
                prisma.follow.count({
                    where: { followingId: userId },
                }),
            ]);
            return {
                data: followers.map((f) => f.follower),
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            };
        }
        catch (error) {
            logger.error('Error fetching followers:', error);
            throw new Error(error.message || 'Failed to fetch followers');
        }
    },
    /**
     * Get following
     */
    async getFollowing(userId, page = 1, limit = 20) {
        try {
            const skip = (page - 1) * limit;
            const [following, total] = await Promise.all([
                prisma.follow.findMany({
                    where: { followerId: userId },
                    skip,
                    take: limit,
                    include: {
                        following: {
                            select: { id: true, username: true, email: true },
                        },
                    },
                }),
                prisma.follow.count({
                    where: { followerId: userId },
                }),
            ]);
            return {
                data: following.map((f) => f.following),
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            };
        }
        catch (error) {
            logger.error('Error fetching following:', error);
            throw new Error(error.message || 'Failed to fetch following');
        }
    },
    /**
     * Check if following
     */
    async isFollowing(userId, followId) {
        try {
            const follow = await prisma.follow.findUnique({
                where: {
                    followerId_followingId: { followerId: userId, followingId: followId },
                },
            });
            return !!follow;
        }
        catch (error) {
            logger.error('Error checking follow status:', error);
            throw new Error(error.message || 'Failed to check follow status');
        }
    },
    /**
     * Create a list
     */
    async createList(userId, input) {
        try {
            createListSchema.parse(input);
            const list = await prisma.list.create({
                data: {
                    userId,
                    name: input.name,
                    description: input.description,
                    isPublic: input.isPublic,
                },
                include: {
                    user: {
                        select: { id: true, username: true, email: true },
                    },
                    items: {
                        take: 10,
                        select: {
                            id: true,
                            entityId: true,
                            entityType: true,
                        },
                    },
                },
            });
            logger.info(`List created: ${list.id}`);
            return list;
        }
        catch (error) {
            logger.error('Error creating list:', error);
            throw new Error(error.message || 'Failed to create list');
        }
    },
    /**
     * Update a list
     */
    async updateList(userId, listId, input) {
        try {
            updateListSchema.parse(input);
            // Verify ownership
            const list = await prisma.list.findUnique({
                where: { id: listId },
            });
            if (!list) {
                throw new Error('List not found');
            }
            if (list.userId !== userId) {
                throw new Error('Unauthorized: Cannot update other users lists');
            }
            const updated = await prisma.list.update({
                where: { id: listId },
                data: input,
                include: {
                    user: {
                        select: { id: true, username: true, email: true },
                    },
                    items: {
                        take: 10,
                    },
                },
            });
            logger.info(`List updated: ${listId}`);
            return updated;
        }
        catch (error) {
            logger.error('Error updating list:', error);
            throw new Error(error.message || 'Failed to update list');
        }
    },
    /**
     * Delete a list
     */
    async deleteList(userId, listId) {
        try {
            // Verify ownership
            const list = await prisma.list.findUnique({
                where: { id: listId },
            });
            if (!list) {
                throw new Error('List not found');
            }
            if (list.userId !== userId) {
                throw new Error('Unauthorized: Cannot delete other users lists');
            }
            // Delete list items first
            await prisma.listItem.deleteMany({
                where: { listId },
            });
            // Delete list
            await prisma.list.delete({
                where: { id: listId },
            });
            logger.info(`List deleted: ${listId}`);
        }
        catch (error) {
            logger.error('Error deleting list:', error);
            throw new Error(error.message || 'Failed to delete list');
        }
    },
    /**
     * Add item to list
     */
    async addItemToList(userId, listId, entityId, entityType) {
        try {
            // Verify list ownership
            const list = await prisma.list.findUnique({
                where: { id: listId },
            });
            if (!list) {
                throw new Error('List not found');
            }
            if (list.userId !== userId) {
                throw new Error('Unauthorized: Cannot add to other users lists');
            }
            // Check if already in list
            const existing = await prisma.listItem.findUnique({
                where: {
                    listId_entityId_entityType: { listId, entityId, entityType },
                },
            });
            if (existing) {
                throw new Error('Item already in list');
            }
            const item = await prisma.listItem.create({
                data: { listId, entityId, entityType },
            });
            logger.info(`Item added to list: ${item.id}`);
            return item;
        }
        catch (error) {
            logger.error('Error adding item to list:', error);
            throw new Error(error.message || 'Failed to add item to list');
        }
    },
    /**
     * Remove item from list
     */
    async removeItemFromList(userId, listId, entityId, entityType) {
        try {
            // Verify list ownership
            const list = await prisma.list.findUnique({
                where: { id: listId },
            });
            if (!list) {
                throw new Error('List not found');
            }
            if (list.userId !== userId) {
                throw new Error('Unauthorized');
            }
            await prisma.listItem.delete({
                where: {
                    listId_entityId_entityType: { listId, entityId, entityType },
                },
            });
            logger.info(`Item removed from list: ${entityId}`);
        }
        catch (error) {
            logger.error('Error removing item from list:', error);
            throw new Error(error.message || 'Failed to remove item');
        }
    },
    /**
     * Get list with items
     */
    async getList(listId, page = 1, limit = 20) {
        try {
            const skip = (page - 1) * limit;
            const [list, items, total] = await Promise.all([
                prisma.list.findUnique({
                    where: { id: listId },
                    include: {
                        user: {
                            select: { id: true, username: true, email: true },
                        },
                    },
                }),
                prisma.listItem.findMany({
                    where: { listId },
                    skip,
                    take: limit,
                    orderBy: { createdAt: 'desc' },
                }),
                prisma.listItem.count({
                    where: { listId },
                }),
            ]);
            if (!list) {
                throw new Error('List not found');
            }
            return {
                list,
                items,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            };
        }
        catch (error) {
            logger.error('Error fetching list:', error);
            throw new Error(error.message || 'Failed to fetch list');
        }
    },
    /**
     * Get user lists
     */
    async getUserLists(userId, page = 1, limit = 20) {
        try {
            const skip = (page - 1) * limit;
            const [lists, total] = await Promise.all([
                prisma.list.findMany({
                    where: { userId },
                    skip,
                    take: limit,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        items: {
                            take: 3,
                            select: { entityId: true, entityType: true },
                        },
                    },
                }),
                prisma.list.count({
                    where: { userId },
                }),
            ]);
            return {
                data: lists,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            };
        }
        catch (error) {
            logger.error('Error fetching user lists:', error);
            throw new Error(error.message || 'Failed to fetch lists');
        }
    },
    /**
     * Get follower stats
     */
    async getFollowerStats(userId) {
        try {
            const [followers, following] = await Promise.all([
                prisma.follow.count({
                    where: { followingId: userId },
                }),
                prisma.follow.count({
                    where: { followerId: userId },
                }),
            ]);
            return { followers, following };
        }
        catch (error) {
            logger.error('Error fetching follower stats:', error);
            throw new Error(error.message || 'Failed to fetch stats');
        }
    },
};
//# sourceMappingURL=social.js.map