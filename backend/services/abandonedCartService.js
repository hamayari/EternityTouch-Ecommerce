import abandonedCartModel from '../models/abandonedCartModel.js';
import userModel from '../models/userModel.js';
import couponModel from '../models/couponModel.js';
import productModel from '../models/productModel.js';
import { sendEmail } from './emailService.js';

/**
 * 🛒 ABANDONED CART RECOVERY SERVICE
 * Détecte et récupère les paniers abandonnés
 */

// Detect abandoned carts (carts with items but no order in last 30 minutes)
export const detectAbandonedCarts = async () => {
    try {
        console.log('[ABANDONED CART] Detecting abandoned carts...');

        const users = await userModel.find({
            cartData: { $exists: true, $ne: {} }
        });

        let detected = 0;

        for (const user of users) {
            // Check if cart has items
            const cartItems = Object.keys(user.cartData || {});
            if (cartItems.length === 0) continue;

            // Check if already tracked
            const existing = await abandonedCartModel.findOne({
                userId: user._id,
                status: 'active'
            });

            if (existing) continue; // Already tracking this cart

            // Calculate cart value
            const cartValue = await calculateCartValue(user.cartData);
            if (cartValue === 0) continue;

            // Create abandoned cart record
            await abandonedCartModel.create({
                userId: user._id,
                email: user.email,
                userName: user.name,
                cartData: user.cartData,
                cartValue
            });

            detected++;
        }

        console.log(`[ABANDONED CART] Detected ${detected} new abandoned carts`);
        return detected;
    } catch (error) {
        console.error('[ABANDONED CART] Error detecting carts:', error);
        return 0;
    }
};

// Send recovery emails
export const sendRecoveryEmails = async () => {
    try {
        console.log('[ABANDONED CART] Sending recovery emails...');

        const abandonedCarts = await abandonedCartModel.find({
            status: 'active',
            expiresAt: { $gt: new Date() }
        });

        let emailsSent = 0;

        for (const cart of abandonedCarts) {
            const timeSinceCreation = Date.now() - cart.createdAt.getTime();
            const hoursSince = timeSinceCreation / (1000 * 60 * 60);

            // First email: 1 hour after abandonment
            if (hoursSince >= 1 && cart.emailsSent.length === 0) {
                await sendFirstEmail(cart);
                emailsSent++;
            }
            // Second email: 24 hours after abandonment
            else if (hoursSince >= 24 && cart.emailsSent.length === 1) {
                await sendSecondEmail(cart);
                emailsSent++;
            }
            // Final email: 48 hours after abandonment
            else if (hoursSince >= 48 && cart.emailsSent.length === 2) {
                await sendFinalEmail(cart);
                emailsSent++;
            }
        }

        console.log(`[ABANDONED CART] Sent ${emailsSent} recovery emails`);
        return emailsSent;
    } catch (error) {
        console.error('[ABANDONED CART] Error sending emails:', error);
        return 0;
    }
};

// First email: Gentle reminder
const sendFirstEmail = async (cart) => {
    const products = await getCartProducts(cart.cartData);
    
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Hi ${cart.userName},</h2>
            <p>You left some items in your cart. Don't miss out!</p>
            
            <div style="background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 8px;">
                <h3>Your Cart (${products.length} items)</h3>
                ${products.map(p => `
                    <div style="margin: 10px 0; padding: 10px; background: white; border-radius: 4px;">
                        <strong>${p.name}</strong> - $${p.price}
                    </div>
                `).join('')}
                <p style="font-size: 18px; font-weight: bold; margin-top: 15px;">
                    Total: $${cart.cartValue.toFixed(2)}
                </p>
            </div>
            
            <a href="${process.env.FRONTEND_URL}/cart" 
               style="display: inline-block; background: #000; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; margin: 10px 0;">
                Complete Your Purchase
            </a>
            
            <p style="color: #666; font-size: 14px; margin-top: 20px;">
                Need help? Reply to this email or contact our support team.
            </p>
        </div>
    `;

    const sent = await sendEmail({
        to: cart.email,
        subject: '🛒 You left items in your cart - Eternity Touch',
        html
    });

    if (sent) {
        cart.emailsSent.push({
            sentAt: new Date(),
            type: 'first'
        });
        cart.lastEmailSent = new Date();
        await cart.save();
    }
};

// Second email: With discount coupon
const sendSecondEmail = async (cart) => {
    // Generate 10% discount coupon
    const couponCode = `CART10-${cart._id.toString().slice(-6).toUpperCase()}`;
    
    const coupon = await couponModel.create({
        code: couponCode,
        type: 'percentage',
        value: 10,
        minPurchase: 0,
        maxDiscount: 50,
        expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
        usageLimit: 1,
        isActive: true,
        description: 'Abandoned cart recovery - 10% OFF'
    });

    const products = await getCartProducts(cart.cartData);
    
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Hi ${cart.userName},</h2>
            <p>We noticed you haven't completed your purchase yet.</p>
            
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center;">
                <h3 style="margin: 0;">Special Offer Just For You!</h3>
                <p style="font-size: 24px; font-weight: bold; margin: 10px 0;">10% OFF</p>
                <p style="font-size: 14px; margin: 5px 0;">Use code:</p>
                <div style="background: white; color: #667eea; padding: 10px 20px; border-radius: 4px; display: inline-block; font-size: 20px; font-weight: bold; letter-spacing: 2px;">
                    ${couponCode}
                </div>
                <p style="font-size: 12px; margin-top: 10px; opacity: 0.9;">Valid for 3 days</p>
            </div>
            
            <div style="background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 8px;">
                <h3>Your Cart (${products.length} items)</h3>
                ${products.map(p => `
                    <div style="margin: 10px 0; padding: 10px; background: white; border-radius: 4px;">
                        <strong>${p.name}</strong> - $${p.price}
                    </div>
                `).join('')}
                <p style="font-size: 18px; font-weight: bold; margin-top: 15px;">
                    Total: <span style="text-decoration: line-through; color: #999;">$${cart.cartValue.toFixed(2)}</span>
                    <span style="color: #667eea;"> $${(cart.cartValue * 0.9).toFixed(2)}</span>
                </p>
            </div>
            
            <a href="${process.env.FRONTEND_URL}/cart" 
               style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; margin: 10px 0;">
                Claim Your Discount
            </a>
            
            <p style="color: #666; font-size: 14px; margin-top: 20px;">
                This offer expires in 3 days. Don't miss out!
            </p>
        </div>
    `;

    const sent = await sendEmail({
        to: cart.email,
        subject: '🎁 10% OFF Your Cart - Limited Time Offer!',
        html
    });

    if (sent) {
        cart.emailsSent.push({
            sentAt: new Date(),
            type: 'second',
            couponCode
        });
        cart.lastEmailSent = new Date();
        await cart.save();
    }
};

// Final email: Last chance with bigger discount
const sendFinalEmail = async (cart) => {
    // Generate 15% discount coupon
    const couponCode = `LASTCHANCE-${cart._id.toString().slice(-6).toUpperCase()}`;
    
    const coupon = await couponModel.create({
        code: couponCode,
        type: 'percentage',
        value: 15,
        minPurchase: 0,
        maxDiscount: 75,
        expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
        usageLimit: 1,
        isActive: true,
        description: 'Abandoned cart final offer - 15% OFF'
    });

    const products = await getCartProducts(cart.cartData);
    
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Hi ${cart.userName},</h2>
            <p style="color: #e74c3c; font-weight: bold;">⏰ Last Chance!</p>
            <p>Your cart items are still waiting for you. This is our final offer!</p>
            
            <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center;">
                <h3 style="margin: 0;">FINAL OFFER - Don't Miss Out!</h3>
                <p style="font-size: 28px; font-weight: bold; margin: 10px 0;">15% OFF</p>
                <p style="font-size: 14px; margin: 5px 0;">Use code:</p>
                <div style="background: white; color: #f5576c; padding: 10px 20px; border-radius: 4px; display: inline-block; font-size: 20px; font-weight: bold; letter-spacing: 2px;">
                    ${couponCode}
                </div>
                <p style="font-size: 12px; margin-top: 10px; opacity: 0.9;">Expires in 48 hours!</p>
            </div>
            
            <div style="background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 8px;">
                <h3>Your Cart (${products.length} items)</h3>
                ${products.map(p => `
                    <div style="margin: 10px 0; padding: 10px; background: white; border-radius: 4px;">
                        <strong>${p.name}</strong> - $${p.price}
                    </div>
                `).join('')}
                <p style="font-size: 18px; font-weight: bold; margin-top: 15px;">
                    Total: <span style="text-decoration: line-through; color: #999;">$${cart.cartValue.toFixed(2)}</span>
                    <span style="color: #f5576c;"> $${(cart.cartValue * 0.85).toFixed(2)}</span>
                </p>
                <p style="color: #e74c3c; font-size: 14px;">💰 You save $${(cart.cartValue * 0.15).toFixed(2)}!</p>
            </div>
            
            <a href="${process.env.FRONTEND_URL}/cart" 
               style="display: inline-block; background: #f5576c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; margin: 10px 0;">
                Complete Purchase Now
            </a>
            
            <p style="color: #666; font-size: 14px; margin-top: 20px;">
                ⚠️ This is our final reminder. After 48 hours, this offer will expire.
            </p>
        </div>
    `;

    const sent = await sendEmail({
        to: cart.email,
        subject: '⏰ LAST CHANCE: 15% OFF Your Cart - Expires Soon!',
        html
    });

    if (sent) {
        cart.emailsSent.push({
            sentAt: new Date(),
            type: 'final',
            couponCode
        });
        cart.lastEmailSent = new Date();
        await cart.save();
    }
};

// Mark cart as recovered when user completes purchase
export const markCartAsRecovered = async (userId) => {
    try {
        const cart = await abandonedCartModel.findOne({
            userId,
            status: 'active'
        });

        if (cart) {
            cart.status = 'recovered';
            cart.recoveredAt = new Date();
            await cart.save();
            console.log(`[ABANDONED CART] Cart recovered for user ${userId}`);
        }
    } catch (error) {
        console.error('[ABANDONED CART] Error marking cart as recovered:', error);
    }
};

// Cleanup expired carts
export const cleanupExpiredCarts = async () => {
    try {
        const result = await abandonedCartModel.updateMany(
            {
                status: 'active',
                expiresAt: { $lt: new Date() }
            },
            {
                $set: { status: 'expired' }
            }
        );

        console.log(`[ABANDONED CART] Expired ${result.modifiedCount} carts`);
        return result.modifiedCount;
    } catch (error) {
        console.error('[ABANDONED CART] Error cleaning up carts:', error);
        return 0;
    }
};

// Helper: Calculate cart value (✅ Optimized - No N+1)
const calculateCartValue = async (cartData) => {
    let total = 0;

    // ✅ Get all product IDs at once
    const productIds = Object.keys(cartData);
    if (productIds.length === 0) return 0;

    // ✅ Fetch all products in a single query with projection
    const products = await productModel.find({ _id: { $in: productIds } })
        .select('price')
        .lean();
    
    // Create a map for O(1) lookup
    const productMap = {};
    products.forEach(product => {
        productMap[product._id.toString()] = product;
    });

    // Calculate total
    for (const itemId in cartData) {
        const product = productMap[itemId];
        if (!product) continue;

        for (const size in cartData[itemId]) {
            const quantity = cartData[itemId][size];
            total += product.price * quantity;
        }
    }

    return total;
};

// Helper: Get cart products details (✅ Optimized - No N+1)
const getCartProducts = async (cartData) => {
    const products = [];

    // ✅ Get all product IDs at once
    const productIds = Object.keys(cartData);
    if (productIds.length === 0) return [];

    // ✅ Fetch all products in a single query with projection
    const productDocs = await productModel.find({ _id: { $in: productIds } })
        .select('name price')
        .lean();
    
    // Create a map for O(1) lookup
    const productMap = {};
    productDocs.forEach(product => {
        productMap[product._id.toString()] = product;
    });

    // Build products array
    for (const itemId in cartData) {
        const product = productMap[itemId];
        if (!product) continue;

        let quantity = 0;
        for (const size in cartData[itemId]) {
            quantity += cartData[itemId][size];
        }

        products.push({
            name: product.name,
            price: product.price,
            quantity
        });
    }

    return products;
};
