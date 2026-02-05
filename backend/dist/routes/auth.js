import { Router } from 'express';
import { authService } from '../services/auth';
import { authMiddleware } from '../middleware';
import { sendResponse } from '../utils/response';
import logger from '../utils/logger';
const router = Router();
// ============================================
// AUTHENTICATION ROUTES
// ============================================
/**
 * POST /api/auth/signup
 * Register new user
 * Body: { email, username, password }
 */
router.post('/signup', async (req, res) => {
    const startTime = Date.now();
    const requestId = res.locals.requestId;
    try {
        console.log(`[${requestId}] Signup endpoint hit - Body:`, {
            email: req.body.email,
            username: req.body.username,
            hasPassword: !!req.body.password
        });
        const { email, username, password } = req.body;
        // Validate input
        if (!email || !username || !password) {
            logger.warn(`[${requestId}] Missing required fields for signup`);
            return sendResponse(res, 400, 'Email, username, and password are required');
        }
        logger.info(`[${requestId}] Starting user registration for: ${email}`);
        const result = await authService.registerUser({
            email,
            username,
            password,
        });
        logger.info(`[${requestId}] User registered successfully - Duration: ${Date.now() - startTime}ms`);
        // Set refresh token in HTTP-only cookie
        res.cookie('refreshToken', result.tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        sendResponse(res, 201, 'User registered successfully', {
            user: result.user,
            accessToken: result.tokens.accessToken,
            expiresIn: result.tokens.expiresIn,
        });
    }
    catch (error) {
        logger.error(`[${requestId}] Error in POST /signup (${Date.now() - startTime}ms):`, error);
        console.error(`[${requestId}] Signup error details:`, {
            message: error.message,
            code: error.code,
            stack: error.stack?.split('\n').slice(0, 3).join('\n')
        });
        // Handle specific error cases
        if (error.message?.includes('already')) {
            return sendResponse(res, 409, error.message);
        }
        if (error.message?.includes('email')) {
            return sendResponse(res, 400, error.message || 'Invalid email');
        }
        sendResponse(res, 400, error.message || 'Registration failed');
    }
});
/**
 * POST /api/auth/login
 * Authenticate user
 * Body: { email, password }
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await authService.loginUser({
            email,
            password,
        });
        // Set refresh token in HTTP-only cookie
        res.cookie('refreshToken', result.tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        sendResponse(res, 200, 'Login successful', {
            user: result.user,
            accessToken: result.tokens.accessToken,
            expiresIn: result.tokens.expiresIn,
        });
    }
    catch (error) {
        logger.error('Error in POST /login:', error);
        sendResponse(res, 401, error.message || 'Authentication failed');
    }
});
/**
 * POST /api/auth/refresh
 * Get new access token
 * Cookies: refreshToken (HTTP-only)
 */
router.post('/refresh', async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return sendResponse(res, 401, 'Refresh token not found');
        }
        const tokens = await authService.refreshAccessToken(refreshToken);
        // Update HTTP-only cookie
        res.cookie('refreshToken', tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        sendResponse(res, 200, 'Token refreshed', {
            accessToken: tokens.accessToken,
            expiresIn: tokens.expiresIn,
        });
    }
    catch (error) {
        logger.error('Error in POST /refresh:', error);
        res.clearCookie('refreshToken');
        sendResponse(res, 401, error.message || 'Token refresh failed');
    }
});
/**
 * POST /api/auth/logout
 * Logout user
 * Protected: Requires valid JWT
 */
router.post('/logout', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        await authService.logoutUser(userId);
        // Clear refresh token cookie
        res.clearCookie('refreshToken');
        sendResponse(res, 200, 'Logout successful');
    }
    catch (error) {
        logger.error('Error in POST /logout:', error);
        sendResponse(res, 400, error.message || 'Logout failed');
    }
});
// ============================================
// PROFILE ROUTES (Protected)
// ============================================
/**
 * GET /api/auth/me
 * Get current user profile
 * Protected: Requires valid JWT
 */
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await authService.getUserProfile(userId);
        sendResponse(res, 200, 'Profile fetched', user);
    }
    catch (error) {
        logger.error('Error in GET /me:', error);
        sendResponse(res, 400, error.message || 'Failed to fetch profile');
    }
});
/**
 * PUT /api/auth/profile
 * Update user profile
 * Protected: Requires valid JWT
 * Body: { username?, bio?, avatar? }
 */
router.put('/profile', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { username, bio, avatar } = req.body;
        const user = await authService.updateUserProfile(userId, {
            username,
            bio,
            avatar,
        });
        sendResponse(res, 200, 'Profile updated', user);
    }
    catch (error) {
        logger.error('Error in PUT /profile:', error);
        if (error.message.includes('already')) {
            return sendResponse(res, 409, error.message);
        }
        sendResponse(res, 400, error.message || 'Failed to update profile');
    }
});
/**
 * POST /api/auth/change-password
 * Change user password
 * Protected: Requires valid JWT
 * Body: { oldPassword, newPassword }
 */
router.post('/change-password', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { oldPassword, newPassword } = req.body;
        const result = await authService.changeUserPassword(userId, {
            oldPassword,
            newPassword,
        });
        // Clear refresh token cookie (force re-login)
        res.clearCookie('refreshToken');
        sendResponse(res, 200, result.message);
    }
    catch (error) {
        logger.error('Error in POST /change-password:', error);
        sendResponse(res, 400, error.message || 'Failed to change password');
    }
});
export default router;
//# sourceMappingURL=auth.js.map