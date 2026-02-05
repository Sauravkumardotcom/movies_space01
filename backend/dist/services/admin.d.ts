export declare const adminService: {
    /**
     * Get all users (admin only)
     */
    getAllUsers(page?: number, limit?: number): Promise<{
        data: any;
        total: any;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    /**
     * Get user stats
     */
    getUserStats(userId: string): Promise<{
        comments: any;
        ratings: any;
        favorites: any;
        watchlist: any;
        history: any;
        uploads: any;
    }>;
    /**
     * Get platform stats
     */
    getPlatformStats(): Promise<{
        totalUsers: any;
        totalMovies: any;
        totalMusic: any;
        totalShorts: any;
        totalComments: any;
        totalRatings: any;
        totalContent: any;
    }>;
    /**
     * Ban a user
     */
    banUser(userId: string, reason?: string): Promise<any>;
    /**
     * Unban a user
     */
    unbanUser(userId: string): Promise<void>;
    /**
     * Check if user is banned
     */
    isUserBanned(userId: string): Promise<boolean>;
    /**
     * Delete a comment (admin only)
     */
    deleteCommentAdmin(commentId: string, reason?: string): Promise<void>;
    /**
     * Get moderation logs
     */
    getModerationLogs(page?: number, limit?: number): Promise<{
        data: any;
        total: any;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    /**
     * Report content (user reports)
     */
    reportContent(userId: string, contentId: string, contentType: string, reason: string): Promise<any>;
    /**
     * Get reports (admin only)
     */
    getReports(page?: number, limit?: number, status?: string): Promise<{
        data: any;
        total: any;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    /**
     * Resolve report
     */
    resolveReport(reportId: string, action: string, notes?: string): Promise<any>;
};
//# sourceMappingURL=admin.d.ts.map