import mongoose from 'mongoose';
import orderModel from "../models/orderModel.js"
import userModel from "../models/userModel.js"
import productModel from "../models/productModel.js"
import Stripe from 'stripe'
import { getTracking, getTrackingCheckpoints, createTracking, isTrackingEnabled } from '../services/trackingService.js'
import { sendOrderConfirmation, sendTrackingUpdate } from '../services/emailService.js'
import { handlePaymentSuccess, handleTrackingAdded, syncTrackingStatuses } from '../services/orderAutomationService.js'
import { generateInvoice, getInvoicePath } from '../services/invoiceService.js'
import { earnPoints } from './loyaltyController.js'
import logger from '../utils/logger.js'

// Initialize Stripe
const stripe = process.env.STRIPE_SECRET_KEY 
    ? new Stripe(process.env.STRIPE_SECRET_KEY)
    : null;

const placeOrder = async (req, res) => {
    try {
        const { userId, items, amount, address} = req.body;
        
        logger.debug('ORDER', 'Received order request', { 
            userId, 
            itemsCount: items?.length, 
            amount, 
            hasAddress: !!address 
        });
        
        // Validation
        if (!userId || !items || !amount || !address) {
            logger.warn('ORDER', 'Validation failed', { userId: !!userId, items: !!items, amount: !!amount, address: !!address });
            return res.json({success: false, message: "Missing required fields"});
        }
        
        if (!Array.isArray(items) || items.length === 0) {
            return res.json({success: false, message: "Cart is empty"});
        }

        // ✅ FIX N+1: Récupérer tous les produits en une seule requête
        const productIds = items.map(item => item._id);
        const products = await productModel.find({ _id: { $in: productIds } });
        
        // Créer un map pour accès rapide
        const productMap = {};
        products.forEach(product => {
            productMap[product._id.toString()] = product;
        });

        // Vérifier que tous les produits existent et valider
        // ✅ Validation complète des items et quantités
        for (const item of items) {
            logger.debug('ORDER', 'Validating item', { 
                _id: item._id, 
                name: item.name, 
                quantity: item.quantity, 
                price: item.price,
                hasSize: !!item.size
            });
            
            // Validation de la structure de l'item
            if (!item._id || !item.name || !item.quantity || !item.price) {
                logger.warn('ORDER', 'Item structure validation failed');
                return res.status(400).json({
                    success: false, 
                    message: 'Invalid item data structure'
                });
            }
            
            // Validation du type et de la valeur de la quantité
            const quantity = Number(item.quantity);
            if (!Number.isInteger(quantity) || quantity < 1) {
                logger.warn('ORDER', 'Quantity validation failed', { quantity });
                return res.status(400).json({
                    success: false, 
                    message: `Invalid quantity for ${item.name}. Must be a positive integer.`
                });
            }
            
            if (quantity > 99) {
                logger.warn('ORDER', 'Quantity exceeds maximum', { quantity });
                return res.status(400).json({
                    success: false, 
                    message: `Quantity for ${item.name} exceeds maximum (99)`
                });
            }
            
            // Validation du prix
            const price = Number(item.price);
            if (isNaN(price) || price < 0) {
                logger.warn('ORDER', 'Price validation failed', { price });
                return res.status(400).json({
                    success: false, 
                    message: `Invalid price for ${item.name}`
                });
            }
            
            // Vérifier que le produit existe
            const product = productMap[item._id];
            if (!product) {
                logger.warn('ORDER', 'Product not found', { productId: item._id });
                return res.status(404).json({
                    success: false, 
                    message: `Product ${item.name} not found`
                });
            }
            
            // Vérifier le stock disponible
            if (product.stock !== undefined && product.stock < quantity) {
                logger.warn('ORDER', 'Insufficient stock', { available: product.stock, requested: quantity });
                return res.status(400).json({
                    success: false, 
                    message: `Insufficient stock for ${item.name}. Only ${product.stock} available.`
                });
            }
        }
        
        const orderData = {
            userId,
            items,
            amount,
            address,
            paymentMethod: "COD",
            payment: false,
            date: Date.now()
        }
        const newOrder = new orderModel(orderData)
        await newOrder.save();

        // ✅ FIX N+1: Décrémenter le stock en une seule opération bulk avec validation
        const bulkOps = items.map(item => ({
            updateOne: {
                filter: { 
                    _id: item._id,
                    stock: { $gte: item.quantity } // ✅ Ensure stock doesn't go negative
                },
                update: { $inc: { stock: -item.quantity } }
            }
        }));
        const bulkResult = await productModel.bulkWrite(bulkOps);
        
        // ✅ Verify all stock updates succeeded
        if (bulkResult.modifiedCount !== items.length) {
            // Rollback: delete the order
            await orderModel.findByIdAndDelete(newOrder._id);
            return res.status(400).json({
                success: false,
                message: 'Stock update failed. Some items may be out of stock.'
            });
        }

        await userModel.findByIdAndUpdate(userId, {cartData: {}});

        // Mark abandoned cart as recovered
        const { markCartAsRecovered } = await import('../services/abandonedCartService.js');
        await markCartAsRecovered(userId);

        // Get user email for confirmation
        const user = await userModel.findById(userId);
        
        // Send order confirmation email
        try {
            await sendOrderConfirmation(user.email, {
                orderId: newOrder._id,
                amount: `${process.env.CURRENCY || 'usd'} ${amount}`,
                status: 'Order Placed',
                paymentMethod: 'Cash on Delivery'
            });
            logger.info('EMAIL', 'Order confirmation sent', { email: user.email, orderId: newOrder._id });
        } catch (emailError) {
            logger.error('EMAIL', 'Error sending order confirmation', { error: emailError.message });
            // Don't fail the order if email fails
        }

        logger.info('ORDER', 'Order created successfully', { orderId: newOrder._id });

        res.json({success: true, message: "Order Placed"})
    }
    catch (error){
        logger.error('ORDER', 'Error placing order', { error: error.message, stack: error.stack });
        res.json({success: false, message: error.message})
    }
}

// Placing orders using stripe method
const placeOrderStripe = async (req, res) => {
    try {
        // Check if Stripe is configured
        if (!stripe) {
            return res.json({
                success: false, 
                message: "Stripe payment is currently unavailable. Please use Cash on Delivery."
            });
        }
        
        const { userId, items, amount, address } = req.body;
        const { origin } = req.headers;
        
        // Validation des champs requis
        if (!userId || !items || !amount || !address) {
            return res.status(400).json({success: false, message: "Missing required fields"});
        }
        
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({success: false, message: "Cart is empty"});
        }
        
        // ✅ Validation complète des items et quantités (même que COD)
        const productIds = items.map(item => item._id);
        const products = await productModel.find({ _id: { $in: productIds } });
        const productMap = {};
        products.forEach(p => productMap[p._id] = p);
        
        for (const item of items) {
            // Validation de la structure
            if (!item._id || !item.name || !item.quantity || !item.price) {
                return res.status(400).json({
                    success: false, 
                    message: 'Invalid item data structure'
                });
            }
            
            // Validation de la quantité
            const quantity = Number(item.quantity);
            if (!Number.isInteger(quantity) || quantity < 1) {
                return res.status(400).json({
                    success: false, 
                    message: `Invalid quantity for ${item.name}. Must be a positive integer.`
                });
            }
            
            if (quantity > 99) {
                return res.status(400).json({
                    success: false, 
                    message: `Quantity for ${item.name} exceeds maximum (99)`
                });
            }
            
            // Validation du prix
            const price = Number(item.price);
            if (isNaN(price) || price < 0) {
                return res.status(400).json({
                    success: false, 
                    message: `Invalid price for ${item.name}`
                });
            }
            
            // Vérifier que le produit existe
            const product = productMap[item._id];
            if (!product) {
                return res.status(404).json({
                    success: false, 
                    message: `Product ${item.name} not found`
                });
            }
            
            // Vérifier le stock
            if (product.stock !== undefined && product.stock < quantity) {
                return res.status(400).json({
                    success: false, 
                    message: `Insufficient stock for ${item.name}. Only ${product.stock} available.`
                });
            }
        }

        const orderData = {
            userId,
            items,
            amount,
            address,
            paymentMethod: "Stripe",
            payment: false,
            date: Date.now()
        };

        const newOrder = new orderModel(orderData);
        await newOrder.save();

        const line_items = items.map((item) => ({
            price_data: {
                currency: process.env.CURRENCY || 'usd',
                product_data: {
                    name: item.name
                },
                unit_amount: item.price * 100
            },
            quantity: item.quantity
        }));

        line_items.push({
            price_data: {
                currency: process.env.CURRENCY || 'usd',
                product_data: {
                    name: 'Delivery Charges'
                },
                unit_amount: process.env.DELIVERY_FEE ? process.env.DELIVERY_FEE * 100 : 1000
            },
            quantity: 1
        });

        const session = await stripe.checkout.sessions.create({
            success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,
            line_items,
            mode: 'payment',
            // IMPORTANT: Ajouter metadata pour le webhook
            metadata: {
                orderId: newOrder._id.toString(),
                userId: userId.toString()
            }
        });

        res.json({success: true, session_url: session.url});

    } catch (error) {
        logger.error('ORDER', 'Error placing Stripe order', { error: error.message });
        res.json({success: false, message: error.message});
    }
}

// Placing orders using Razorpay method
const placeOrderRazorpay = async (req, res) => {

}

// All orders data for admin panel (with optional pagination)
const allOrders = async (req, res) => {
    try{
        // ✅ Check if pagination is requested
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);
        
        // If pagination params provided, use pagination
        if (page && limit) {
            const skip = (page - 1) * limit;
            
            // Filters
            const filter = {};
            if (req.query.status) filter.status = req.query.status;
            if (req.query.payment !== undefined) filter.payment = req.query.payment === 'true';
            
            const orders = await orderModel.find(filter)
                .sort({ date: -1 })
                .skip(skip)
                .limit(limit);
                
            const total = await orderModel.countDocuments(filter);
            
            return res.json({
                success: true,
                orders,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            });
        }
        
        // Otherwise, return all orders (backward compatibility)
        const orders = await orderModel.find({}).sort({ date: -1 })
        res.json({success: true, orders})
    }
    catch(error){
        logger.error('ORDER', 'Error fetching orders', { error: error.message });
        res.json({success: false, message: error.message})
    }
}

// All orders with pagination (for admin)
const allOrdersPaginated = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        
        // Filters
        const filter = {};
        if (req.query.status) filter.status = req.query.status;
        if (req.query.payment) filter.payment = req.query.payment === 'true';
        
        // Search by order ID or user email
        if (req.query.search) {
            // You might want to populate user data to search by email
            filter._id = { $regex: req.query.search, $options: 'i' };
        }
        
        const orders = await orderModel.find(filter)
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit);
            
        const total = await orderModel.countDocuments(filter);
        
        res.json({
            success: true,
            orders,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        logger.error('ORDER', 'Error fetching paginated orders', { error: error.message });
        res.json({ success: false, message: error.message });
    }
}

// User order data for frontend
const userOrders = async (req, res) => {
    try{
        const {userId} = req.body;
        
        if (!userId) {
            return res.json({success: false, message: "User ID is required"});
        }
        
        const orders = await orderModel.find({userId});
        res.json({success: true, orders})
    }
    catch (error){
        logger.error('ORDER', 'Error fetching user orders', { error: error.message });
        res.json({success: false, message: error.message})
    }
}

// Update order status
const updateStatus = async (req, res) => {
    try{
        const {orderId, status} = req.body;
        
        if (!orderId || !status) {
            return res.json({success: false, message: "Order ID and status are required"});
        }
        
        const validStatuses = ['Order Placed', 'Packing', 'Shipped', 'Out for delivery', 'Delivered'];
        if (!validStatuses.includes(status)) {
            return res.json({success: false, message: "Invalid status"});
        }
        
        const order = await orderModel.findByIdAndUpdate(orderId, {status});
        
        if (!order) {
            return res.json({success: false, message: "Order not found"});
        }
        
        res.json({success: true, message: "Order Status Updated"})
    }
    catch (error){
        logger.error('ORDER', 'Error updating order status', { error: error.message });
        res.json({success: false, message: error.message})
    }
}

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
    try {
        const totalOrders = await orderModel.countDocuments();
        
        const revenueData = await orderModel.aggregate([
            { $match: { payment: true } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;
        
        const pendingOrders = await orderModel.countDocuments({ 
            status: { $in: ['Order Placed', 'Packing'] } 
        });
        
        const deliveredOrders = await orderModel.countDocuments({ status: 'Delivered' });
        const totalUsers = await userModel.countDocuments();
        const totalProducts = await productModel.countDocuments();
        
        const recentOrders = await orderModel.find()
            .sort({ date: -1 })
            .limit(5);
        
        const ordersByStatus = await orderModel.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);
        
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        
        const revenueByMonth = await orderModel.aggregate([
            { $match: { date: { $gte: sixMonthsAgo }, payment: true } },
            {
                $group: {
                    _id: {
                        year: { $year: '$date' },
                        month: { $month: '$date' }
                    },
                    revenue: { $sum: '$amount' },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);
        
        res.json({
            success: true,
            stats: {
                totalOrders,
                totalRevenue,
                pendingOrders,
                deliveredOrders,
                totalUsers,
                totalProducts,
                recentOrders,
                ordersByStatus,
                revenueByMonth
            }
        });
    } catch (error) {
        logger.error('ORDER', 'Error fetching dashboard stats', { error: error.message });
        res.status(500).json({ success: false, message: error.message });
    }
}

// Verify Stripe payment (DEPRECATED - Use webhook instead)
const verifyStripe = async (req, res) => {
    try {
        const { orderId, success, userId } = req.body;

        if (!orderId) {
            return res.json({ success: false, message: "Order ID is required" });
        }

        if (success === "true") {
            await orderModel.findByIdAndUpdate(orderId, { payment: true });
            await userModel.findByIdAndUpdate(userId, { cartData: {} });
            res.json({ success: true, message: "Payment verified successfully" });
        } else {
            await orderModel.findByIdAndDelete(orderId);
            res.json({ success: false, message: "Payment cancelled" });
        }
    } catch (error) {
        logger.error('ORDER', 'Error verifying Stripe payment', { error: error.message });
        res.json({ success: false, message: error.message });
    }
}

// Webhook Stripe (SÉCURISÉ - Vérifie les paiements côté serveur)
const stripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!stripe || !webhookSecret) {
        logger.error('STRIPE', 'Webhook not configured');
        return res.status(400).send('Webhook not configured');
    }

    let event;

    try {
        // Vérifier que la requête vient bien de Stripe
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
        logger.info('STRIPE', 'Webhook received', { type: event.type });
    } catch (err) {
        logger.error('STRIPE', 'Webhook signature verification failed', { error: err.message });
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Gérer les différents types d'événements
    try {
        switch (event.type) {
            case 'checkout.session.completed':
                const session = event.data.object;
                
                // Récupérer l'ID de commande depuis les metadata
                const orderId = session.metadata.orderId;
                const userId = session.metadata.userId;

                if (!orderId || !userId) {
                    logger.error('STRIPE', 'Missing orderId or userId in metadata');
                    return res.status(400).send('Missing metadata');
                }

                // Vérifier que le paiement est bien réussi
                if (session.payment_status === 'paid') {
                    try {
                        // Get order details
                        const order = await orderModel.findById(orderId);
                        if (!order) {
                            logger.error('STRIPE', 'Order not found', { orderId });
                            return res.status(404).send('Order not found');
                        }

                        // ✅ Decrement stock with validation (prevent negative stock)
                        const bulkOps = order.items.map(item => ({
                            updateOne: {
                                filter: { 
                                    _id: item._id,
                                    stock: { $gte: item.quantity }
                                },
                                update: { $inc: { stock: -item.quantity } }
                            }
                        }));
                        const bulkResult = await productModel.bulkWrite(bulkOps);
                        
                        // Verify all stock updates succeeded
                        if (bulkResult.modifiedCount !== order.items.length) {
                            logger.error('STRIPE', 'Stock update failed', { orderId });
                            return res.status(400).send('Stock update failed');
                        }

                        // Marquer la commande comme payée
                        await orderModel.findByIdAndUpdate(orderId, { 
                            payment: true,
                            paymentMethod: 'Stripe',
                            stripeSessionId: session.id
                        });

                        // Vider le panier
                        await userModel.findByIdAndUpdate(userId, { cartData: {} });

                        // 🤖 AUTOMATION: Payment Success → Auto-update status to "Packing"
                        await handlePaymentSuccess(orderId);

                        // 💎 LOYALTY: Award points for completed order
                        await earnPoints(orderId);

                        logger.info('STRIPE', 'Payment confirmed', { orderId });
                    } catch (txError) {
                        logger.error('STRIPE', 'Error processing payment', { error: txError.message });
                        throw txError;
                    }
                } else {
                    logger.warn('STRIPE', 'Payment not completed', { status: session.payment_status });
                }
                break;

            case 'payment_intent.payment_failed':
                const paymentIntent = event.data.object;
                logger.error('STRIPE', 'Payment failed', { paymentIntentId: paymentIntent.id });
                // Vous pouvez envoyer un email au client ici
                break;

            default:
                logger.debug('STRIPE', 'Unhandled event type', { type: event.type });
        }

        res.json({ received: true });
    } catch (error) {
        logger.error('STRIPE', 'Error processing webhook', { error: error.message });
        res.status(500).send('Webhook processing failed');
    }
};

// Ajouter un numéro de tracking à une commande (Admin)
const addTrackingNumber = async (req, res) => {
    try {
        const { orderId, trackingNumber, courier } = req.body;
        
        if (!orderId || !trackingNumber || !courier) {
            return res.json({ success: false, message: "Missing required fields" });
        }
        
        const order = await orderModel.findById(orderId);
        if (!order) {
            return res.json({ success: false, message: "Order not found" });
        }
        
        // Mettre à jour la commande
        order.trackingNumber = trackingNumber;
        order.courier = courier;
        order.trackingUrl = `https://track.aftership.com/${courier}/${trackingNumber}`;
        
        // Créer le tracking dans AfterShip si configuré
        if (isTrackingEnabled()) {
            try {
                await createTracking(trackingNumber, courier);
                logger.info('TRACKING', 'Created tracking in AfterShip', { orderId });
            } catch (error) {
                logger.error('TRACKING', 'Error creating tracking in AfterShip', { error: error.message });
                // Continue même si AfterShip échoue
            }
        }
        
        await order.save();
        
        // 🤖 AUTOMATION: Tracking Added → Auto-update status to "Shipped"
        await handleTrackingAdded(orderId);
        
        res.json({ 
            success: true, 
            message: "Tracking number added successfully",
            order 
        });
        
    } catch (error) {
        logger.error('TRACKING', 'Error adding tracking number', { error: error.message });
        res.json({ success: false, message: error.message });
    }
};

// Obtenir le tracking réel d'une commande
const getRealTimeTracking = async (req, res) => {
    try {
        const { orderId } = req.body;
        
        const order = await orderModel.findById(orderId);
        
        if (!order) {
            return res.json({ success: false, message: "Order not found" });
        }
        
        if (!order.trackingNumber || !order.courier) {
            return res.json({ 
                success: false, 
                message: "Tracking information not available yet" 
            });
        }
        
        // MODE DEMO : Si le numéro commence par "DEMO" ou est fictif, retourner des données simulées
        if (order.trackingNumber.startsWith('DEMO') || order.trackingNumber === '1234567890') {
            const demoCheckpoints = [
                {
                    location: 'Paris, France',
                    message: 'Package received at sorting center',
                    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                    status: 'InfoReceived'
                },
                {
                    location: 'Lyon, France',
                    message: 'In transit to destination',
                    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                    status: 'InTransit'
                },
                {
                    location: 'Marseille, France',
                    message: 'Arrived at delivery facility',
                    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                    status: 'InTransit'
                },
                {
                    location: 'Marseille, France',
                    message: 'Out for delivery',
                    date: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
                    status: 'OutForDelivery'
                }
            ];
            
            return res.json({
                success: true,
                tracking: {
                    trackingNumber: order.trackingNumber,
                    status: 'OutForDelivery',
                    courier: order.courier,
                    estimatedDelivery: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
                    trackingUrl: `https://track.aftership.com/${order.courier}/${order.trackingNumber}`,
                    checkpoints: demoCheckpoints,
                    isDemo: true
                }
            });
        }
        
        // Si AfterShip n'est pas configuré, retourner les infos basiques
        if (!isTrackingEnabled()) {
            return res.json({
                success: true,
                tracking: {
                    trackingNumber: order.trackingNumber,
                    courier: order.courier,
                    trackingUrl: order.trackingUrl,
                    status: order.status,
                    message: "Real-time tracking not configured. Please configure AfterShip API key."
                }
            });
        }
        
        // Récupérer les infos de tracking depuis AfterShip
        try {
            logger.debug('TRACKING', 'Fetching tracking data', { trackingNumber: order.trackingNumber, courier: order.courier });
            const tracking = await getTracking(order.trackingNumber, order.courier);
            const checkpoints = await getTrackingCheckpoints(order.trackingNumber, order.courier);
            
            logger.info('TRACKING', 'Tracking data retrieved', { checkpoints: checkpoints.length });
            
            // Mettre à jour la commande avec les dernières infos
            if (tracking.expected_delivery) {
                order.estimatedDelivery = new Date(tracking.expected_delivery);
            }
            if (checkpoints.length > 0) {
                order.lastCheckpoint = checkpoints[checkpoints.length - 1];
            }
            await order.save();
            
            res.json({
                success: true,
                tracking: {
                    trackingNumber: tracking.tracking_number,
                    status: tracking.tag, // 'Pending', 'InTransit', 'OutForDelivery', 'Delivered'
                    courier: tracking.slug,
                    estimatedDelivery: tracking.expected_delivery,
                    trackingUrl: `https://track.aftership.com/${tracking.slug}/${tracking.tracking_number}`,
                    checkpoints: checkpoints.map(cp => ({
                        location: cp.location || 'Unknown',
                        message: cp.message || cp.tag,
                        date: cp.checkpoint_time,
                        status: cp.tag
                    }))
                }
            });
            
        } catch (error) {
            console.error('[TRACKING] Error fetching from AfterShip:', error.message);
            // Retourner les infos basiques si AfterShip échoue
            res.json({
                success: true,
                tracking: {
                    trackingNumber: order.trackingNumber,
                    courier: order.courier,
                    trackingUrl: order.trackingUrl,
                    status: order.status,
                    message: "Unable to fetch real-time tracking. Please try again later."
                }
            });
        }
        
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Manual sync all tracking (Admin only)
const syncAllTracking = async (req, res) => {
    try {
        await syncTrackingStatuses();
        res.json({ success: true, message: "Tracking sync completed" });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Cancel order (user can cancel unpaid orders)
const cancelOrder = async (req, res) => {
    try {
        const { orderId, userId } = req.body;

        if (!orderId || !userId) {
            return res.json({ success: false, message: "Missing required fields" });
        }

        const order = await orderModel.findById(orderId);
        
        if (!order) {
            return res.json({ success: false, message: "Order not found" });
        }

        // Check if order belongs to user
        if (order.userId.toString() !== userId) {
            return res.json({ success: false, message: "Unauthorized" });
        }

        // Can only cancel unpaid orders or orders not yet shipped
        if (order.payment) {
            return res.json({ success: false, message: "Cannot cancel paid orders. Please contact support." });
        }

        if (order.status === 'Shipped' || order.status === 'Out for delivery' || order.status === 'Delivered') {
            return res.json({ success: false, message: "Cannot cancel order that is already shipped" });
        }

        // Restore stock
        for (const item of order.items) {
            await productModel.findByIdAndUpdate(item._id, {
                $inc: { stock: item.quantity }
            });
        }

        // Delete order
        await orderModel.findByIdAndDelete(orderId);

        res.json({ success: true, message: "Order cancelled successfully" });

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Generate and download invoice
const downloadInvoice = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.body.userId;

        // Find order
        const order = await orderModel.findById(orderId);
        if (!order) {
            return res.json({ success: false, message: 'Order not found' });
        }

        // Verify user owns this order (or is admin)
        if (order.userId.toString() !== userId && !req.body.isAdmin) {
            return res.json({ success: false, message: 'Unauthorized' });
        }

        // Check if invoice already exists
        let invoicePath = getInvoicePath(orderId);

        // If not, generate it
        if (!invoicePath) {
            const user = await userModel.findById(order.userId);
            const result = await generateInvoice(order, user);
            invoicePath = result.filePath;
        }

        // Send file
        res.download(invoicePath, `invoice-${orderId}.pdf`, (err) => {
            if (err) {
                console.error('Error downloading invoice:', err);
                res.json({ success: false, message: 'Error downloading invoice' });
            }
        });

    } catch (error) {
        console.error('Error in downloadInvoice:', error);
        res.json({ success: false, message: error.message });
    }
};

// Generate invoice for an order (admin or after payment)
const generateOrderInvoice = async (req, res) => {
    try {
        const { orderId } = req.body;

        // Find order
        const order = await orderModel.findById(orderId);
        if (!order) {
            return res.json({ success: false, message: 'Order not found' });
        }

        // Get user info
        const user = await userModel.findById(order.userId);

        // Generate invoice
        const result = await generateInvoice(order, user);

        res.json({ 
            success: true, 
            message: 'Invoice generated successfully',
            fileName: result.fileName
        });

    } catch (error) {
        console.error('Error in generateOrderInvoice:', error);
        res.json({ success: false, message: error.message });
    }
};

export { 
    placeOrder, 
    placeOrderRazorpay, 
    placeOrderStripe, 
    updateStatus, 
    allOrders, 
    allOrdersPaginated,
    userOrders, 
    getDashboardStats, 
    verifyStripe,
    stripeWebhook,
    addTrackingNumber, 
    getRealTimeTracking, 
    syncAllTracking,
    cancelOrder,
    downloadInvoice,
    generateOrderInvoice
}
