import express from 'express';
import { subscribe, unsubscribe, getAllSubscribers, getStats, deleteSubscriber } from '../controllers/newsletterController.js';
import adminAuth from '../middleware/adminAuth.js';
import { newsletterLimiter } from '../middleware/rateLimiter.js';

const newsletterRouter = express.Router();

// Public routes
newsletterRouter.post('/subscribe', newsletterLimiter, subscribe);
newsletterRouter.post('/unsubscribe', unsubscribe);

// Admin routes
newsletterRouter.get('/all', adminAuth, getAllSubscribers);
newsletterRouter.get('/stats', adminAuth, getStats);
newsletterRouter.post('/delete', adminAuth, deleteSubscriber);

export default newsletterRouter;
