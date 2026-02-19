import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    sender: { 
        type: String, 
        enum: ['user', 'admin'],
        required: true 
    },
    senderName: { type: String, required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    read: { type: Boolean, default: false }
});

const chatSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'user',
        required: true 
    },
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    status: {
        type: String,
        enum: ['active', 'closed', 'waiting'],
        default: 'waiting'
    },
    assignedAdmin: { type: String, default: null },
    messages: [messageSchema],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    closedAt: { type: Date }
});

const chatModel = mongoose.models.chat || mongoose.model('chat', chatSchema);

export default chatModel;
