import { prisma } from '../config/db/index';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../config/env/index';
import logger from '../utils/logger/index';
// ============================================
// SCHEMAS
// ============================================
const signupSchema = z.object({
    email: z.string().email('Invalid email address'),
    username: z.string().min(3).max(30),
    password: z.string().min(8).regex(/[A-Z]/, 'Password must contain uppercase letter')
        .regex(/[0-9]/, 'Password must contain number'),
});
const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});
const profileUpdateSchema = z.object({
    username: z.string().min(3).max(30).optional(),
    bio: z.string().max(500).optional(),
    avatar: z.string().url().optional(),
});
const passwordChangeSchema = z.object({
    oldPassword: z.string().min(1),
    newPassword: z.string().min(8)
        .regex(/[A-Z]/, 'Password must contain uppercase letter')
        .regex(/[0-9]/, 'Password must contain number'),
});
// ============================================
// AUTH SERVICE
// ============================================
export const authService = {
    // ============================================
    // PASSWORD OPERATIONS
    // ============================================
    /**
     * Hash password with bcrypt
     */
    async hashPassword(password) {
        try {
            const saltRounds = 10;
            return await bcrypt.hash(password, saltRounds);
        }
        catch (error) {
            logger.error('Error hashing password:', error);
            throw new Error('Password hashing failed');
        }
    },
    /**
     * Verify password against hash
     */
    async verifyPassword(password, hash) {
        try {
            return await bcrypt.compare(password, hash);
        }
        catch (error) {
            logger.error('Error verifying password:', error);
            return false;
        }
    },
    // ============================================
    // TOKEN OPERATIONS
    // ============================================
    /**
     * Generate JWT access and refresh tokens
     */
    generateTokens(userId) {
        try {
            const accessToken = jwt.sign({ id: userId, type: 'access' }, config.JWT_SECRET, { expiresIn: '15m' });
            const refreshToken = jwt.sign({ id: userId, type: 'refresh' }, config.JWT_REFRESH_SECRET, { expiresIn: '7d' });
            return {
                accessToken,
                refreshToken,
                expiresIn: 15 * 60, // 15 minutes in seconds
            };
        }
        catch (error) {
            logger.error('Error generating tokens:', error);
            throw new Error('Token generation failed');
        }
    },
    /**
     * Verify and decode JWT token
     */
    verifyAccessToken(token) {
        try {
            const decoded = jwt.verify(token, config.JWT_SECRET);
            return { id: decoded.id, type: decoded.type };
        }
        catch (error) {
            logger.error('Error verifying access token:', error);
            return null;
        }
    },
    /**
     * Verify and decode refresh token
     */
    verifyRefreshToken(token) {
        try {
            const decoded = jwt.verify(token, config.JWT_REFRESH_SECRET);
            return { id: decoded.id, type: decoded.type };
        }
        catch (error) {
            logger.error('Error verifying refresh token:', error);
            return null;
        }
    },
    // ============================================
    // AUTHENTICATION FLOWS
    // ============================================
    /**
     * Register new user
     */
    async registerUser(input) {
        try {
            const validated = signupSchema.parse(input);
            // Check email uniqueness
            const existingUser = await prisma.user.findUnique({
                where: { email: validated.email },
            });
            if (existingUser) {
                throw new Error('Email already registered');
            }
            // Check username uniqueness
            const existingUsername = await prisma.user.findUnique({
                where: { username: validated.username },
            });
            if (existingUsername) {
                throw new Error('Username already taken');
            }
            // Hash password
            const hashedPassword = await this.hashPassword(validated.password);
            // Create user with default preferences
            const user = await prisma.user.create({
                data: {
                    email: validated.email,
                    username: validated.username,
                    password: hashedPassword,
                    preferences: {
                        create: {
                            language: 'en',
                            theme: 'dark',
                            notifications: true,
                        },
                    },
                },
                select: {
                    id: true,
                    email: true,
                    username: true,
                    avatar: true,
                    bio: true,
                    createdAt: true,
                },
            });
            // Generate tokens
            const tokens = this.generateTokens(user.id);
            // Store refresh token in database
            await prisma.session.create({
                data: {
                    userId: user.id,
                    refreshToken: tokens.refreshToken,
                    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
                },
            });
            return { user, tokens };
        }
        catch (error) {
            logger.error('Error in registerUser:', error);
            throw error;
        }
    },
    /**
     * Login user
     */
    async loginUser(input) {
        try {
            const validated = loginSchema.parse(input);
            // Find user
            const user = await prisma.user.findUnique({
                where: { email: validated.email },
                select: {
                    id: true,
                    email: true,
                    username: true,
                    password: true,
                    avatar: true,
                    bio: true,
                    createdAt: true,
                },
            });
            if (!user) {
                throw new Error('Invalid email or password');
            }
            // Verify password
            const isValidPassword = await this.verifyPassword(validated.password, user.password);
            if (!isValidPassword) {
                throw new Error('Invalid email or password');
            }
            // Generate tokens
            const tokens = this.generateTokens(user.id);
            // Store refresh token
            await prisma.session.create({
                data: {
                    userId: user.id,
                    refreshToken: tokens.refreshToken,
                    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                },
            });
            // Remove password from response
            const { password, ...userWithoutPassword } = user;
            return { user: userWithoutPassword, tokens };
        }
        catch (error) {
            logger.error('Error in loginUser:', error);
            throw error;
        }
    },
    /**
     * Refresh access token
     */
    async refreshAccessToken(refreshToken) {
        try {
            // Verify token signature
            const decoded = this.verifyRefreshToken(refreshToken);
            if (!decoded) {
                throw new Error('Invalid refresh token');
            }
            // Check token in database
            const session = await prisma.session.findUnique({
                where: { refreshToken },
            });
            if (!session || session.expiresAt < new Date()) {
                throw new Error('Refresh token expired');
            }
            // Generate new tokens
            const tokens = this.generateTokens(decoded.id);
            // Invalidate old token and store new one
            await prisma.session.update({
                where: { id: session.id },
                data: {
                    refreshToken: tokens.refreshToken,
                    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                },
            });
            return tokens;
        }
        catch (error) {
            logger.error('Error in refreshAccessToken:', error);
            throw error;
        }
    },
    /**
     * Logout user (invalidate refresh token)
     */
    async logoutUser(userId) {
        try {
            // Delete all sessions for user
            await prisma.session.deleteMany({
                where: { userId },
            });
            return { success: true };
        }
        catch (error) {
            logger.error('Error in logoutUser:', error);
            throw error;
        }
    },
    // ============================================
    // PROFILE OPERATIONS
    // ============================================
    /**
     * Get user profile
     */
    async getUserProfile(userId) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    email: true,
                    username: true,
                    avatar: true,
                    bio: true,
                    createdAt: true,
                    preferences: {
                        select: {
                            language: true,
                            theme: true,
                            notifications: true,
                        },
                    },
                },
            });
            if (!user) {
                throw new Error('User not found');
            }
            return user;
        }
        catch (error) {
            logger.error('Error in getUserProfile:', error);
            throw error;
        }
    },
    /**
     * Update user profile
     */
    async updateUserProfile(userId, input) {
        try {
            const validated = profileUpdateSchema.parse(input);
            // Check username uniqueness if updating
            if (validated.username) {
                const existingUsername = await prisma.user.findFirst({
                    where: {
                        username: validated.username,
                        id: { not: userId },
                    },
                });
                if (existingUsername) {
                    throw new Error('Username already taken');
                }
            }
            const user = await prisma.user.update({
                where: { id: userId },
                data: validated,
                select: {
                    id: true,
                    email: true,
                    username: true,
                    avatar: true,
                    bio: true,
                },
            });
            return user;
        }
        catch (error) {
            logger.error('Error in updateUserProfile:', error);
            throw error;
        }
    },
    /**
     * Change user password
     */
    async changeUserPassword(userId, input) {
        try {
            const validated = passwordChangeSchema.parse(input);
            // Get current password hash
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { password: true },
            });
            if (!user) {
                throw new Error('User not found');
            }
            // Verify old password
            const isValid = await this.verifyPassword(validated.oldPassword, user.password);
            if (!isValid) {
                throw new Error('Current password is incorrect');
            }
            // Hash new password
            const hashedPassword = await this.hashPassword(validated.newPassword);
            // Update password
            await prisma.user.update({
                where: { id: userId },
                data: { password: hashedPassword },
            });
            // Invalidate all existing sessions (force re-login)
            await prisma.session.deleteMany({
                where: { userId },
            });
            return { success: true, message: 'Password changed successfully' };
        }
        catch (error) {
            logger.error('Error in changeUserPassword:', error);
            throw error;
        }
    },
};
//# sourceMappingURL=auth.js.map