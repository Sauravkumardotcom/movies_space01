import { z } from 'zod';
declare const commentCreateSchema: any;
declare const commentUpdateSchema: any;
export type CommentCreateInput = z.infer<typeof commentCreateSchema>;
export type CommentUpdateInput = z.infer<typeof commentUpdateSchema>;
export declare const commentService: {
    /**
     * Create a new comment
     */
    createComment(userId: string, input: CommentCreateInput): Promise<any>;
    /**
     * Get comments for an entity (paginated)
     */
    getEntityComments(entityId: string, entityType: string, page?: number, limit?: number, userId?: string): Promise<{
        data: any;
        total: any;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    /**
     * Get comment replies
     */
    getCommentReplies(commentId: string, page?: number, limit?: number): Promise<{
        data: any;
        total: any;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    /**
     * Reply to a comment
     */
    replyToComment(userId: string, parentId: string, content: string): Promise<any>;
    /**
     * Update comment
     */
    updateComment(userId: string, commentId: string, input: CommentUpdateInput): Promise<any>;
    /**
     * Delete comment (also deletes replies)
     */
    deleteComment(userId: string, commentId: string): Promise<void>;
    /**
     * Like a comment
     */
    likeComment(userId: string, commentId: string): Promise<any>;
    /**
     * Unlike a comment
     */
    unlikeComment(userId: string, commentId: string): Promise<void>;
    /**
     * Get comment likes count
     */
    getCommentLikesCount(commentId: string): Promise<any>;
    /**
     * Get user comments
     */
    getUserComments(userId: string, page?: number, limit?: number): Promise<{
        data: any;
        total: any;
        page: number;
        limit: number;
        totalPages: number;
    }>;
};
export {};
//# sourceMappingURL=comment.d.ts.map