export declare const notificationService: {
    /**
     * Create a notification
     */
    createNotification(userId: string, type: string, title: string, message: string, relatedEntityId?: string): Promise<any>;
    /**
     * Get user notifications
     */
    getUserNotifications(userId: string, page?: number, limit?: number, unreadOnly?: boolean): Promise<{
        data: any;
        total: any;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    /**
     * Mark notification as read
     */
    markAsRead(userId: string, notificationId: string): Promise<any>;
    /**
     * Mark all notifications as read
     */
    markAllAsRead(userId: string): Promise<any>;
    /**
     * Delete notification
     */
    deleteNotification(userId: string, notificationId: string): Promise<void>;
    /**
     * Get unread count
     */
    getUnreadCount(userId: string): Promise<any>;
    /**
     * Notify followers (e.g., when user uploads new content)
     */
    notifyFollowers(userId: string, type: string, title: string, message: string): Promise<any>;
};
//# sourceMappingURL=notification.d.ts.map