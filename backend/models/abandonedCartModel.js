import mongoose from 'mongoose';

const abandonedCartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    email: {
        type: String,
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    cartData: {
        type: Object,
        required: true
    },
    cartValue: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'recovered', 'expired'],
        default: 'active'
    },
    emailsSent: [{
        sentAt: { type: Date },
        type: { type: String }, // 'first', 'second', 'final'
        couponCode: { type: String }
    }],
    recoveredAt: {
        type: Date
    },
    couponUsed: {
        type: Boolean,
        default: false
    },
    lastEmailSent: {
        type: Date
    },
    expiresAt: {
        type: Date,
        default: () => Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
    }
}, {
    timestamps: true
});

// Index for efficient queries
abandonedCartSchema.index({ userId: 1, status: 1 });
abandonedCartSchema.index({ createdAt: 1 });
abandonedCartSchema.index({ expiresAt: 1 });

const abandonedCartModel = mongoose.models.abandonedCart || mongoose.model('abandonedCart', abandonedCartSchema);

export default abandonedCartModel;
