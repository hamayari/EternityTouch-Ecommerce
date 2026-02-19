import mongoose from 'mongoose';

const qaSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    question: {
        type: String,
        required: true,
        trim: true
    },
    answer: {
        type: String,
        default: ''
    },
    answeredBy: {
        type: String,
        default: 'Admin'
    },
    answeredAt: {
        type: Date
    },
    status: {
        type: String,
        enum: ['pending', 'answered'],
        default: 'pending'
    },
    helpful: {
        type: Number,
        default: 0
    },
    notHelpful: {
        type: Number,
        default: 0
    },
    helpfulUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const qaModel = mongoose.models.qa || mongoose.model('qa', qaSchema);

export default qaModel;
