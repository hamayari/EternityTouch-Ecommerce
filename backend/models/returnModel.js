import mongoose from 'mongoose';

const returnSchema = new mongoose.Schema({
    orderId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'order', 
        required: true 
    },
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'user', 
        required: true 
    },
    items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'product' },
        name: String,
        image: String,
        size: String,
        quantity: Number,
        price: Number,
        reason: String // Reason for returning this specific item
    }],
    reason: { 
        type: String, 
        required: true,
        enum: [
            'Wrong Size',
            'Wrong Item',
            'Defective/Damaged',
            'Not as Described',
            'Changed Mind',
            'Quality Issues',
            'Other'
        ]
    },
    description: { type: String, required: true }, // Detailed explanation
    images: [{ type: String }], // Photos of the issue
    refundMethod: {
        type: String,
        enum: ['Original Payment', 'Store Credit', 'Exchange'],
        default: 'Original Payment'
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected', 'Picked Up', 'Received', 'Refunded', 'Completed'],
        default: 'Pending'
    },
    refundAmount: { type: Number, default: 0 },
    adminNotes: { type: String, default: '' },
    trackingNumber: { type: String, default: '' }, // For return shipment
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    approvedAt: { type: Date },
    refundedAt: { type: Date }
});

const returnModel = mongoose.models.return || mongoose.model('return', returnSchema);

export default returnModel;
