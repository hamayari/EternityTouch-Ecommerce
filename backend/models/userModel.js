import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    cartData: { type: Object, default: {} },
    wishlist: { type: [String], default: [] }, // Array of product IDs
    profileImage: { type: String, default: '' },
    googleId: { type: String },
    isAdmin: { type: Boolean, default: false }, // Admin flag
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    // 2FA fields
    twoFactorCode: { type: String },
    twoFactorExpires: { type: Date },
    twoFactorEnabled: { type: Boolean, default: false },
    // Email verification fields
    emailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String },
    emailVerificationExpires: { type: Date },
    // Saved addresses
    addresses: [{
        label: { type: String, required: true }, // "Home", "Work", "Other"
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        phone: { type: String, required: true },
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zipCode: { type: String, required: true },
        country: { type: String, required: true },
        isDefault: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now }
    }]
}, {minimize: false})

const userModel = mongoose.models.user || mongoose.model('user', userSchema);

export default userModel;