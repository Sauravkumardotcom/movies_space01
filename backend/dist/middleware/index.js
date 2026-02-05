import { generateRequestId, sendResponse } from './../utils/response.js';
import { verifyAccessToken } from './../utils/auth.js';
import logger from './../utils/logger.js';
export function requestIdMiddleware(req, res, next) {
    const requestId = generateRequestId();
    res.locals.requestId = requestId;
    logger.info(`[${requestId}] ${req.method} ${req.path}`);
    next();
}
export function authMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            sendResponse(res, 401, 'Missing or invalid authorization header');
            return;
        }
        const token = authHeader.substring(7);
        const payload = verifyAccessToken(token);
        if (!payload) {
            sendResponse(res, 401, 'Invalid or expired token');
            return;
        }
        req.user = {
            userId: payload.userId,
            email: payload.email,
        };
        next();
    }
    catch (error) {
        logger.error('Auth middleware error:', error);
        sendResponse(res, 500, 'Authentication failed');
    }
}
export function errorHandler(error, req, res, next) {
    logger.error('Error:', error);
    if (error instanceof Error) {
        sendResponse(res, 500, error.message || 'Internal server error');
    }
    else {
        sendResponse(res, 500, 'Internal server error');
    }
}
//# sourceMappingURL=index.js.map