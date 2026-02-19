import express from 'express';
import { 
    createCoupon, 
    getAllCoupons, 
    validateCoupon, 
    applyCoupon, 
    deleteCoupon, 
    toggleCouponStatus 
} from '../controllers/couponController.js';
import adminAuth from '../middleware/adminAuth.js';
import authUser from '../middleware/auth.js';

const couponRouter = express.Router();

// Admin routes
couponRouter.post('/create', adminAuth, createCoupon);
couponRouter.get('/list', adminAuth, getAllCoupons);
couponRouter.post('/delete', adminAuth, deleteCoupon);
couponRouter.post('/toggle-status', adminAuth, toggleCouponStatus);

// User routes
couponRouter.post('/validate', authUser, validateCoupon);
couponRouter.post('/apply', authUser, applyCoupon);

export default couponRouter;
