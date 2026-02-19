import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
    code: { 
        type: String, 
        required: true, 
        unique: true,
        uppercase: true,
        trim: true
    },
    type: { 
        type: String, 
        required: true,
        enum: ['percentage', 'fixed'] // percentage or fixed amount
    },
    value: { 
        type: Number, 
        required: true,
        min: 0
    },
    minPurchase: {
        type: Number,
        default: 0
    },
    maxDiscount: {
        type: Number,
        default: null // null = unlimited
    },
    expiryDate: {
        type: Date,
        required: true
    },
    usageLimit: {
        type: Number,
        default: null // null = unlimited
    },
    usedCount: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const couponModel = mongoose.models.coupon || mongoose.model('coupon', couponSchema);
export default couponModel;
