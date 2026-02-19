import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import compression from 'compression';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Import routes
import userRouter from './routes/userRoute.js';
import productRouter from './routes/productRoute.js';
import cartRouter from './routes/cartRoute.js';
import orderRouter from './routes/orderRoute.js';
import wishlistRouter from './routes/wishlistRoute.js';
import addressRouter from './routes/addressRoute.js';
import couponRouter from './routes/couponRoute.js';
import returnRouter from './routes/returnRoute.js';
import chatRouter from './routes/chatRoute.js';
import loyaltyRouter from './routes/loyaltyRoute.js';
import qaRouter from './routes/qaRoute.js';
import recommendationRouter from './routes/recommendationRoute.js';
import newsletterRouter from './routes/newsletterRoute.js';
import abandonedCartRouter from './routes/abandonedCartRoute.js';

// Import services
import { startScheduler } from './services/schedulerService.js';
import { initSentry } from './config/sentry.js';
import logger from './utils/logger.js';

// Initialize Express app
const app = express();
const port = process.env.PORT || 4000;

// Initialize Sentry for error tracking (production only)
if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
    initSentry(app);
}

// Connect to database and cloudinary (skip in test environment)
if (process.env.NODE_ENV !== 'test') {
    connectDB();
    connectCloudinary();
}

// Security middlewares
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(mongoSanitize());
app.use(xss());

// CORS configuration
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        process.env.FRONTEND_URL,
        process.env.ADMIN_URL
    ].filter(Boolean),
    credentials: true
}));

// Body parsing middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Compression middleware
app.use(compression());

// Logging middleware (development only)
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// API routes
app.use('/api/user', userRouter);
app.use('/api/product', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/order', orderRouter);
app.use('/api/wishlist', wishlistRouter);
app.use('/api/address', addressRouter);
app.use('/api/coupon', couponRouter);
app.use('/api/return', returnRouter);
app.use('/api/chat', chatRouter);
app.use('/api/loyalty', loyaltyRouter);
app.use('/api/qa', qaRouter);
app.use('/api/recommendation', recommendationRouter);
app.use('/api/newsletter', newsletterRouter);
app.use('/api/abandoned-cart', abandonedCartRouter);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({ 
        message: 'Eternity Touch API',
        version: '1.0.0',
        status: 'running'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ 
        success: false, 
        message: 'Route not found' 
    });
});

// Global error handler
app.use((err, req, res, next) => {
    logger.error('Unhandled error', { 
        error: err.message, 
        stack: err.stack,
        path: req.path 
    });
    
    res.status(err.status || 500).json({
        success: false,
        message: process.env.NODE_ENV === 'production' 
            ? 'Internal server error' 
            : err.message
    });
});

// Create HTTP server for Socket.IO
const httpServer = createServer(app);

// Initialize Socket.IO for real-time chat
const io = new Server(httpServer, {
    cors: {
        origin: [
            'http://localhost:5173',
            'http://localhost:5174',
            process.env.FRONTEND_URL,
            process.env.ADMIN_URL
        ].filter(Boolean),
        credentials: true
    }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
    logger.info('Socket.IO client connected', { socketId: socket.id });

    socket.on('join-chat', (userId) => {
        socket.join(`user-${userId}`);
        logger.debug('User joined chat', { userId, socketId: socket.id });
    });

    socket.on('disconnect', () => {
        logger.debug('Socket.IO client disconnected', { socketId: socket.id });
    });
});

// Make io available to routes
app.set('io', io);

// Start server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
    httpServer.listen(port, () => {
        logger.info(`Server started on port ${port}`, { 
            port, 
            env: process.env.NODE_ENV 
        });
    });

    // Initialize scheduled tasks (abandoned cart emails, etc.)
    startScheduler();
}

// Export app for testing
export default app;
