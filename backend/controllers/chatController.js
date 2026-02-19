import chatModel from '../models/chatModel.js';
import userModel from '../models/userModel.js';

// Get or create chat for user
const getUserChat = async (req, res) => {
    try {
        const { userId } = req.body;

        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        // Find existing active or waiting chat
        let chat = await chatModel.findOne({ 
            userId, 
            status: { $in: ['active', 'waiting'] } 
        });

        // Create new chat if none exists
        if (!chat) {
            chat = new chatModel({
                userId,
                userName: user.name,
                userEmail: user.email,
                status: 'waiting',
                messages: []
            });
            await chat.save();
        }

        res.json({ success: true, chat });

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Send message
const sendMessage = async (req, res) => {
    try {
        const { chatId, sender, senderName, message } = req.body;

        const chat = await chatModel.findById(chatId);
        if (!chat) {
            return res.json({ success: false, message: "Chat not found" });
        }

        chat.messages.push({
            sender,
            senderName,
            message,
            timestamp: new Date(),
            read: false
        });

        chat.updatedAt = new Date();
        await chat.save();

        res.json({ success: true, chat });

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Mark messages as read
const markAsRead = async (req, res) => {
    try {
        const { chatId, sender } = req.body;

        const chat = await chatModel.findById(chatId);
        if (!chat) {
            return res.json({ success: false, message: "Chat not found" });
        }

        // Mark all messages from the other sender as read
        chat.messages.forEach(msg => {
            if (msg.sender !== sender) {
                msg.read = true;
            }
        });

        await chat.save();

        res.json({ success: true });

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Close chat
const closeChat = async (req, res) => {
    try {
        const { chatId } = req.body;

        const chat = await chatModel.findById(chatId);
        if (!chat) {
            return res.json({ success: false, message: "Chat not found" });
        }

        chat.status = 'closed';
        chat.closedAt = new Date();
        await chat.save();

        res.json({ success: true, message: "Chat closed" });

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Admin: Get all chats (with optional pagination)
const getAllChats = async (req, res) => {
    try {
        const status = req.query.status || 'all';
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);
        
        const filter = status === 'all' ? {} : { status };
        
        // If pagination params provided, use pagination
        if (page && limit) {
            const skip = (page - 1) * limit;
            
            const chats = await chatModel.find(filter)
                .sort({ updatedAt: -1 })
                .skip(skip)
                .limit(limit);
                
            const total = await chatModel.countDocuments(filter);
            
            return res.json({
                success: true,
                chats,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            });
        }
        
        // Otherwise, return limited results (backward compatibility)
        const chats = await chatModel.find(filter)
            .sort({ updatedAt: -1 })
            .limit(100);

        res.json({ success: true, chats });

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Admin: Assign chat
const assignChat = async (req, res) => {
    try {
        const { chatId, adminName } = req.body;

        const chat = await chatModel.findById(chatId);
        if (!chat) {
            return res.json({ success: false, message: "Chat not found" });
        }

        chat.assignedAdmin = adminName;
        chat.status = 'active';
        await chat.save();

        res.json({ success: true, chat });

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

export { 
    getUserChat, 
    sendMessage, 
    markAsRead, 
    closeChat, 
    getAllChats, 
    assignChat 
};
