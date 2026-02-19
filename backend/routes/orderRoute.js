import express from 'express'
import { placeOrder, placeOrderRazorpay, placeOrderStripe, updateStatus, allOrders, allOrdersPaginated, userOrders, getDashboardStats, verifyStripe, stripeWebhook, addTrackingNumber, getRealTimeTracking, syncAllTracking, cancelOrder, downloadInvoice, generateOrderInvoice } from '../controllers/orderController.js'
import adminAuth from '../middleware/adminAuth.js'
import authUser from '../middleware/auth.js'
import { orderLimiter } from '../middleware/rateLimiter.js'

const orderRouter = express.Router()

// ⚠️ IMPORTANT: Stripe webhook MUST be BEFORE express.json() middleware
// This route needs raw body for signature verification
orderRouter.post('/webhook/stripe', express.raw({ type: 'application/json' }), stripeWebhook)

// Admin features
orderRouter.post('/list', adminAuth, allOrders)
orderRouter.get('/list-paginated', adminAuth, allOrdersPaginated)
orderRouter.post('/status', adminAuth, updateStatus)
orderRouter.get('/dashboard-stats', adminAuth, getDashboardStats)

// Payment features (avec rate limiting)
orderRouter.post('/place', authUser, orderLimiter, placeOrder)
orderRouter.post('/stripe', authUser, orderLimiter, placeOrderStripe)
orderRouter.post('/razorpay', authUser, orderLimiter, placeOrderRazorpay)

// Verify payment
orderRouter.post('/verifyStripe', authUser, verifyStripe)

// User features
orderRouter.post('/userorders', authUser, userOrders)
orderRouter.post('/cancel', authUser, cancelOrder)

// Tracking features
orderRouter.post('/add-tracking', adminAuth, addTrackingNumber)
orderRouter.post('/tracking', authUser, getRealTimeTracking)
orderRouter.post('/sync-tracking', adminAuth, syncAllTracking) // Manual sync

// Invoice features
orderRouter.get('/invoice/:orderId', authUser, downloadInvoice)
orderRouter.post('/generate-invoice', adminAuth, generateOrderInvoice)

export default orderRouter;