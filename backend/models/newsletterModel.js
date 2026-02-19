import mongoose from 'mongoose';

const newsletterSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    subscribedAt: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    },
    source: {
        type: String,
        default: 'popup' // popup, footer, checkout
    },
    discountCode: {
        type: String,
        default: null
    }
});

const newsletterModel = mongoose.models.newsletter || mongoose.model('newsletter', newsletterSchema);

export default newsletterModel;
