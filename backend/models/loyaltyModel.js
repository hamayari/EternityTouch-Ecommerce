import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
    type: { 
        type: String, 
        enum: ['earned', 'redeemed', 'expired'],
        required: true 
    },
    points: { type: Number, required: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'order' },
    description: { type: String, required: true },
    date: { type: Date, default: Date.now }
});

const loyaltySchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'user',
        required: true,
        unique: true
    },
    points: { type: Number, default: 0 },
    totalEarned: { type: Number, default: 0 },
    totalRedeemed: { type: Number, default: 0 },
    tier: { 
        type: String, 
        enum: ['Bronze', 'Silver', 'Gold', 'Platinum'],
        default: 'Bronze'
    },
    transactions: [transactionSchema],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const loyaltyModel = mongoose.models.loyalty || mongoose.model('loyalty', loyaltySchema);

export default loyaltyModel;
