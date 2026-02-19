import express from 'express';
import { 
    createReturn, 
    getUserReturns, 
    getReturnDetails, 
    getAllReturns, 
    updateReturnStatus,
    cancelReturn
} from '../controllers/returnController.js';
import authUser from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';

const returnRouter = express.Router();

// User routes
returnRouter.post('/create', authUser, createReturn);
returnRouter.post('/user-returns', authUser, getUserReturns);
returnRouter.post('/details', authUser, getReturnDetails);
returnRouter.post('/cancel', authUser, cancelReturn);

// Admin routes
returnRouter.get('/all', adminAuth, getAllReturns);
returnRouter.post('/update-status', adminAuth, updateReturnStatus);

export default returnRouter;
