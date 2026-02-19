import express from 'express';
import { 
    getProductQA, 
    askQuestion, 
    answerQuestion, 
    markHelpful, 
    getAllQA, 
    deleteQuestion,
    getQAStats
} from '../controllers/qaController.js';
import authUser from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';

const qaRouter = express.Router();

// User routes
qaRouter.post('/get', getProductQA);
qaRouter.post('/ask', authUser, askQuestion);
qaRouter.post('/helpful', authUser, markHelpful);

// Admin routes
qaRouter.get('/all', adminAuth, getAllQA);
qaRouter.get('/stats', adminAuth, getQAStats);
qaRouter.post('/answer', adminAuth, answerQuestion);
qaRouter.post('/delete', adminAuth, deleteQuestion);

export default qaRouter;
