// Script pour créer les index MongoDB (améliore les performances)
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userModel from '../models/userModel.js';
import productModel from '../models/productModel.js';
import orderModel from '../models/orderModel.js';
import couponModel from '../models/couponModel.js';
import loyaltyModel from '../models/loyaltyModel.js';
import returnModel from '../models/returnModel.js';
import chatModel from '../models/chatModel.js';
import qaModel from '../models/qaModel.js';
import newsletterModel from '../models/newsletterModel.js';
import abandonedCartModel from '../models/abandonedCartModel.js';
import productViewModel from '../models/productViewModel.js';

dotenv.config();

const createIndexes = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // ✅ Index pour les utilisateurs
        await userModel.collection.createIndex({ email: 1 }, { unique: true });
        await userModel.collection.createIndex({ googleId: 1 }, { sparse: true });
        await userModel.collection.createIndex({ emailVerified: 1 });
        await userModel.collection.createIndex({ emailVerificationToken: 1 }, { sparse: true });
        await userModel.collection.createIndex({ resetPasswordToken: 1 }, { sparse: true });
        await userModel.collection.createIndex({ 'addresses.isDefault': 1 });
        await userModel.collection.createIndex({ wishlist: 1 });
        console.log('✅ User indexes created (7 indexes)');

        // ✅ Index pour les produits
        await productModel.collection.createIndex({ name: 'text', description: 'text' });
        await productModel.collection.createIndex({ category: 1 });
        await productModel.collection.createIndex({ subCategory: 1 });
        await productModel.collection.createIndex({ bestseller: 1 });
        await productModel.collection.createIndex({ stock: 1 });
        await productModel.collection.createIndex({ price: 1 });
        await productModel.collection.createIndex({ discount: 1 });
        await productModel.collection.createIndex({ discountEndDate: 1 }, { sparse: true });
        await productModel.collection.createIndex({ averageRating: -1 });
        // Compound indexes pour queries fréquentes
        await productModel.collection.createIndex({ category: 1, subCategory: 1 });
        await productModel.collection.createIndex({ category: 1, price: 1 });
        await productModel.collection.createIndex({ bestseller: 1, date: -1 });
        console.log('✅ Product indexes created (12 indexes)');

        // ✅ Index pour les commandes
        await orderModel.collection.createIndex({ userId: 1 });
        await orderModel.collection.createIndex({ status: 1 });
        await orderModel.collection.createIndex({ date: -1 });
        await orderModel.collection.createIndex({ trackingNumber: 1 }, { sparse: true });
        await orderModel.collection.createIndex({ payment: 1 });
        await orderModel.collection.createIndex({ paymentMethod: 1 });
        await orderModel.collection.createIndex({ stripeSessionId: 1 }, { sparse: true });
        // Compound indexes pour queries fréquentes
        await orderModel.collection.createIndex({ userId: 1, date: -1 });
        await orderModel.collection.createIndex({ status: 1, date: -1 });
        await orderModel.collection.createIndex({ payment: 1, status: 1 });
        console.log('✅ Order indexes created (10 indexes)');

        // ✅ Index pour les coupons
        await couponModel.collection.createIndex({ code: 1 }, { unique: true });
        await couponModel.collection.createIndex({ isActive: 1 });
        await couponModel.collection.createIndex({ expiryDate: 1 });
        await couponModel.collection.createIndex({ isActive: 1, expiryDate: 1 });
        console.log('✅ Coupon indexes created (4 indexes)');

        // ✅ Index pour le programme de fidélité
        await loyaltyModel.collection.createIndex({ userId: 1 }, { unique: true });
        await loyaltyModel.collection.createIndex({ tier: 1 });
        await loyaltyModel.collection.createIndex({ points: -1 });
        console.log('✅ Loyalty indexes created (3 indexes)');

        // ✅ Index pour les retours
        await returnModel.collection.createIndex({ orderId: 1 });
        await returnModel.collection.createIndex({ userId: 1 });
        await returnModel.collection.createIndex({ status: 1 });
        await returnModel.collection.createIndex({ createdAt: -1 });
        await returnModel.collection.createIndex({ status: 1, createdAt: -1 });
        console.log('✅ Return indexes created (5 indexes)');

        // ✅ Index pour le chat
        await chatModel.collection.createIndex({ userId: 1 });
        await chatModel.collection.createIndex({ status: 1 });
        await chatModel.collection.createIndex({ assignedAdmin: 1 }, { sparse: true });
        await chatModel.collection.createIndex({ createdAt: -1 });
        console.log('✅ Chat indexes created (4 indexes)');

        // ✅ Index pour Q&A
        await qaModel.collection.createIndex({ productId: 1 });
        await qaModel.collection.createIndex({ userId: 1 });
        await qaModel.collection.createIndex({ status: 1 });
        await qaModel.collection.createIndex({ isAutoAnswered: 1 });
        await qaModel.collection.createIndex({ productId: 1, status: 1 });
        console.log('✅ Q&A indexes created (5 indexes)');

        // ✅ Index pour la newsletter
        await newsletterModel.collection.createIndex({ email: 1 }, { unique: true });
        await newsletterModel.collection.createIndex({ isActive: 1 });
        await newsletterModel.collection.createIndex({ subscribedAt: -1 });
        console.log('✅ Newsletter indexes created (3 indexes)');

        // ✅ Index pour les paniers abandonnés
        await abandonedCartModel.collection.createIndex({ userId: 1 });
        await abandonedCartModel.collection.createIndex({ email: 1 });
        await abandonedCartModel.collection.createIndex({ status: 1 });
        await abandonedCartModel.collection.createIndex({ expiresAt: 1 });
        await abandonedCartModel.collection.createIndex({ createdAt: -1 });
        await abandonedCartModel.collection.createIndex({ status: 1, expiresAt: 1 });
        console.log('✅ Abandoned cart indexes created (6 indexes)');

        // ✅ Index pour les vues de produits (recommandations)
        await productViewModel.collection.createIndex({ productId: 1 });
        await productViewModel.collection.createIndex({ userId: 1 }, { sparse: true });
        await productViewModel.collection.createIndex({ viewedAt: -1 });
        await productViewModel.collection.createIndex({ productId: 1, viewedAt: -1 });
        console.log('✅ Product view indexes created (4 indexes)');

        console.log('\n🎉 All indexes created successfully!');
        console.log('📊 Total: 63 indexes across 11 collections');
        console.log('\n💡 Run this script again after schema changes to update indexes.');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating indexes:', error);
        process.exit(1);
    }
};

createIndexes();
