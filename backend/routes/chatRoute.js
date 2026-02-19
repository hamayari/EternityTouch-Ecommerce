import express from 'express';
import { 
    getUserChat, 
    sendMessage, 
    markAsRead, 
    closeChat, 
    getAllChats, 
    assignChat 
} from '../controllers/chatController.js';
import authUser from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';
import { chatLimiter } from '../middleware/rateLimiter.js';

const chatRouter = express.Router();

// User routes
chatRouter.post('/get-chat', authUser, getUserChat);
chatRouter.post('/send-message', authUser, chatLimiter, sendMessage); // ✅ Rate limiting ajouté
chatRouter.post('/mark-read', authUser, markAsRead);
chatRouter.post('/close', authUser, closeChat);

// Admin routes
chatRouter.get('/all', adminAuth, getAllChats);
chatRouter.post('/assign', adminAuth, assignChat);
chatRouter.post('/admin-send', adminAuth, sendMessage);

export default chatRouter;
