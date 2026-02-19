import mongoose from 'mongoose';

// Track product views for recommendations
const productViewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product',
        required: true
    },
    viewedAt: {
        type: Date,
        default: Date.now
    },
    sessionId: {
        type: String // For anonymous users
    }
}, {
    timestamps: true
});

// Indexes for efficient queries
productViewSchema.index({ userId: 1, productId: 1 });
productViewSchema.index({ productId: 1, viewedAt: -1 });
productViewSchema.index({ userId: 1, viewedAt: -1 });

const productViewModel = mongoose.models.productView || mongoose.model('productView', productViewSchema);

export default productViewModel;
