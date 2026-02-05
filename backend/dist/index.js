import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { config, validateConfig } from './config/env.js';
import { requestIdMiddleware, errorHandler } from './middleware/index.js';
import healthRoutes from './routes/health.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import movieRoutes from './routes/movies.js';
import musicRoutes from './routes/music.js';
import engagementRoutes from './routes/engagement.js';
import commentRoutes from './routes/comment.js';
import socialRoutes from './routes/social.js';
import searchRoutes from './routes/search.js';
import notificationRoutes from './routes/notification.js';
import adminRoutes from './routes/admin.js';
import logger from './utils/logger.js';
// Validate environment
validateConfig();
const app = express();
// Security middleware
app.use(helmet());
app.use(cors({ origin: config.CORS_ORIGIN }));
// Request parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());
// Logging
app.use(morgan('combined', { stream: { write: (message) => logger.info(message) } }));
// Request ID
app.use(requestIdMiddleware);
// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);
// Routes
app.use('/api/v1/health', healthRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/movies', movieRoutes);
app.use('/api/v1/shorts', movieRoutes); // Shorts also use movieRoutes
app.use('/api/v1/music', musicRoutes);
app.use('/api/v1/engagement', engagementRoutes);
app.use('/api/v1/comments', commentRoutes);
app.use('/api/v1/social', socialRoutes);
app.use('/api/v1/search', searchRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/admin', adminRoutes);
// 404 handler
app.use((req, res) => {
    res.status(404).json({
        status: 'error',
        statusCode: 404,
        message: 'Route not found',
        requestId: res.locals.requestId,
        timestamp: new Date().toISOString(),
    });
});
// Error handler
app.use(errorHandler);
// Start server
const server = app.listen(config.PORT, () => {
    logger.info(`✅ Server running on http://localhost:${config.PORT}`);
    logger.info(`📊 Environment: ${config.NODE_ENV}`);
});
// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully...');
    server.close(() => {
        logger.info('Server closed');
        process.exit(0);
    });
});
export default app;
//# sourceMappingURL=index.js.map