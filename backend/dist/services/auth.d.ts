import { z } from 'zod';
declare const signupSchema: any;
declare const loginSchema: any;
declare const profileUpdateSchema: any;
declare const passwordChangeSchema: any;
export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type PasswordChangeInput = z.infer<typeof passwordChangeSchema>;
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}
export declare const authService: {
    /**
     * Hash password with bcrypt
     */
    hashPassword(password: string): Promise<string>;
    /**
     * Verify password against hash
     */
    verifyPassword(password: string, hash: string): Promise<boolean>;
    /**
     * Generate JWT access and refresh tokens
     */
    generateTokens(userId: string): AuthTokens;
    /**
     * Verify and decode JWT token
     */
    verifyAccessToken(token: string): {
        id: string;
        type: string;
    } | null;
    /**
     * Verify and decode refresh token
     */
    verifyRefreshToken(token: string): {
        id: string;
        type: string;
    } | null;
    /**
     * Register new user
     */
    registerUser(input: SignupInput): Promise<{
        user: any;
        tokens: any;
    }>;
    /**
     * Login user
     */
    loginUser(input: LoginInput): Promise<{
        user: any;
        tokens: any;
    }>;
    /**
     * Refresh access token
     */
    refreshAccessToken(refreshToken: string): Promise<any>;
    /**
     * Logout user (invalidate refresh token)
     */
    logoutUser(userId: string): Promise<{
        success: boolean;
    }>;
    /**
     * Get user profile
     */
    getUserProfile(userId: string): Promise<any>;
    /**
     * Update user profile
     */
    updateUserProfile(userId: string, input: ProfileUpdateInput): Promise<any>;
    /**
     * Change user password
     */
    changeUserPassword(userId: string, input: PasswordChangeInput): Promise<{
        success: boolean;
        message: string;
    }>;
};
export {};
//# sourceMappingURL=auth.d.ts.map