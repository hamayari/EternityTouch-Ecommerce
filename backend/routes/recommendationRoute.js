import express from 'express';
import {
    getSimilar,
    getBoughtTogether,
    getPersonalized,
    getTrending,
    getCompleteTheLook,
    trackView,
    getRecent,
    getStats
} from '../controllers/recommendationController.js';
import auth from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';

const recommendationRouter = express.Router();

// Public routes
recommendationRouter.get('/similar/:productId', getSimilar);
recommendationRouter.get('/bought-together/:productId', getBoughtTogether);
recommendationRouter.get('/trending', getTrending);
recommendationRouter.post('/track-view', trackView);

// User routes (require authentication)
recommendationRouter.post('/personalized', auth, getPersonalized);
recommendationRouter.post('/recent', auth, getRecent);
recommendationRouter.post('/complete-look', getCompleteTheLook);

// Admin routes
recommendationRouter.get('/stats', adminAuth, getStats);

export default recommendationRouter;
