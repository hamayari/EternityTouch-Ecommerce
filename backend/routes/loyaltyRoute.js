import express from 'express';
import { getLoyalty, redeemPoints, getAllLoyalty, getLoyaltyStats } from '../controllers/loyaltyController.js';
import authUser from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';

const loyaltyRouter = express.Router();

// User routes
loyaltyRouter.post('/get', authUser, getLoyalty);
loyaltyRouter.post('/redeem', authUser, redeemPoints);

// Admin routes
loyaltyRouter.get('/all', adminAuth, getAllLoyalty);
loyaltyRouter.get('/stats', adminAuth, getLoyaltyStats);

export default loyaltyRouter;
