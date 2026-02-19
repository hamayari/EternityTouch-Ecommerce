import express from 'express';
import {
    getAllAbandonedCarts,
    getAbandonedCartStats,
    sendManualRecoveryEmail,
    deleteAbandonedCart
} from '../controllers/abandonedCartController.js';
import adminAuth from '../middleware/adminAuth.js';

const abandonedCartRouter = express.Router();

// Admin routes
abandonedCartRouter.get('/list', adminAuth, getAllAbandonedCarts);
abandonedCartRouter.get('/stats', adminAuth, getAbandonedCartStats);
abandonedCartRouter.post('/send-email', adminAuth, sendManualRecoveryEmail);
abandonedCartRouter.post('/delete', adminAuth, deleteAbandonedCart);

export default abandonedCartRouter;
