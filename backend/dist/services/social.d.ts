import { z } from 'zod';
declare const createListSchema: any;
declare const updateListSchema: any;
export type CreateListInput = z.infer<typeof createListSchema>;
export type UpdateListInput = z.infer<typeof updateListSchema>;
export declare const socialService: {
    /**
     * Follow a user
     */
    followUser(userId: string, followId: string): Promise<any>;
    /**
     * Unfollow a user
     */
    unfollowUser(userId: string, followId: string): Promise<void>;
    /**
     * Get followers
     */
    getFollowers(userId: string, page?: number, limit?: number): Promise<{
        data: any;
        total: any;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    /**
     * Get following
     */
    getFollowing(userId: string, page?: number, limit?: number): Promise<{
        data: any;
        total: any;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    /**
     * Check if following
     */
    isFollowing(userId: string, followId: string): Promise<boolean>;
    /**
     * Create a list
     */
    createList(userId: string, input: CreateListInput): Promise<any>;
    /**
     * Update a list
     */
    updateList(userId: string, listId: string, input: UpdateListInput): Promise<any>;
    /**
     * Delete a list
     */
    deleteList(userId: string, listId: string): Promise<void>;
    /**
     * Add item to list
     */
    addItemToList(userId: string, listId: string, entityId: string, entityType: string): Promise<any>;
    /**
     * Remove item from list
     */
    removeItemFromList(userId: string, listId: string, entityId: string, entityType: string): Promise<void>;
    /**
     * Get list with items
     */
    getList(listId: string, page?: number, limit?: number): Promise<{
        list: any;
        items: any;
        total: any;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    /**
     * Get user lists
     */
    getUserLists(userId: string, page?: number, limit?: number): Promise<{
        data: any;
        total: any;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    /**
     * Get follower stats
     */
    getFollowerStats(userId: string): Promise<{
        followers: any;
        following: any;
    }>;
};
export {};
//# sourceMappingURL=social.d.ts.map