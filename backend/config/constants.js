/**
 * Application constants
 * Centralized configuration for business logic
 */

// Recommendation limits
export const RECOMMENDATION_LIMITS = {
    similar: 6,
    boughtTogether: 3,
    personalized: 8,
    trending: 8,
    completeYourLook: 4,
    recentlyViewed: 8
};

// Loyalty program tiers and thresholds
export const LOYALTY_TIERS = {
    BRONZE: { name: 'Bronze', threshold: 0, multiplier: 1, discount: 0, freeShipping: false },
    SILVER: { name: 'Silver', threshold: 2000, multiplier: 1.25, discount: 5, freeShipping: false },
    GOLD: { name: 'Gold', threshold: 5000, multiplier: 1.5, discount: 10, freeShipping: true },
    PLATINUM: { name: 'Platinum', threshold: 10000, multiplier: 2, discount: 15, freeShipping: true }
};

// Order limits
export const ORDER_LIMITS = {
    maxQuantityPerItem: 99,
    minQuantityPerItem: 1,
    maxItemsPerOrder: 100
};

// Cart limits
export const CART_LIMITS = {
    maxQuantityPerItem: 99,
    maxItemsInCart: 50
};

// Coupon limits
export const COUPON_LIMITS = {
    codeMinLength: 3,
    codeMaxLength: 20,
    maxPercentageDiscount: 100,
    maxFixedDiscount: 10000
};

// Time constants (in milliseconds)
export const TIME_CONSTANTS = {
    ONE_HOUR: 60 * 60 * 1000,
    ONE_DAY: 24 * 60 * 60 * 1000,
    ONE_WEEK: 7 * 24 * 60 * 60 * 1000,
    ONE_MONTH: 30 * 24 * 60 * 60 * 1000,
    EMAIL_VERIFICATION_EXPIRY: 24 * 60 * 60 * 1000, // 24 hours
    PASSWORD_RESET_EXPIRY: 60 * 60 * 1000, // 1 hour
    TWO_FACTOR_EXPIRY: 10 * 60 * 1000 // 10 minutes
};

// Abandoned cart settings
export const ABANDONED_CART = {
    detectionDelay: 30 * 60 * 1000, // 30 minutes
    expiryTime: 7 * 24 * 60 * 60 * 1000, // 7 days
    firstEmailDelay: 1 * 60 * 60 * 1000, // 1 hour
    secondEmailDelay: 24 * 60 * 60 * 1000, // 24 hours
    finalEmailDelay: 48 * 60 * 60 * 1000, // 48 hours
    firstDiscountPercent: 10,
    finalDiscountPercent: 15
};

// Pagination defaults
export const PAGINATION = {
    defaultPage: 1,
    defaultLimit: 20,
    maxLimit: 100
};

// Product limits
export const PRODUCT_LIMITS = {
    nameMaxLength: 200,
    descriptionMaxLength: 2000,
    minPrice: 0,
    maxPrice: 1000000,
    maxImages: 4
};

// Review limits
export const REVIEW_LIMITS = {
    minRating: 1,
    maxRating: 5,
    commentMaxLength: 1000
};

// Return policy
export const RETURN_POLICY = {
    maxDaysAfterDelivery: 30,
    refundProcessingDays: 5
};

// Rate limiting
export const RATE_LIMITS = {
    api: { windowMs: 15 * 60 * 1000, max: 100 }, // 100 requests per 15 minutes
    auth: { windowMs: 15 * 60 * 1000, max: 5 }, // 5 login attempts per 15 minutes
    review: { windowMs: 60 * 60 * 1000, max: 5 }, // 5 reviews per hour (prod)
    reviewDev: { windowMs: 60 * 60 * 1000, max: 20 }, // 20 reviews per hour (dev)
    chat: { windowMs: 60 * 1000, max: 10 }, // 10 messages per minute (prod)
    chatDev: { windowMs: 60 * 1000, max: 50 }, // 50 messages per minute (dev)
    newsletter: { windowMs: 24 * 60 * 60 * 1000, max: 3 } // 3 attempts per day
};

// Email retry settings
export const EMAIL_RETRY = {
    maxAttempts: 3,
    delays: [1000, 2000, 4000] // Exponential backoff: 1s, 2s, 4s
};

// Tracking service settings
export const TRACKING = {
    syncInterval: 30 * 60 * 1000, // 30 minutes
    maxRetries: 3
};

// AI service settings
export const AI_SETTINGS = {
    timeout: 5000, // 5 seconds
    maxRetries: 2,
    retryDelays: [2000, 4000] // 2s, 4s
};

// Order status values
export const ORDER_STATUS = {
    PLACED: 'Order Placed',
    PACKING: 'Packing',
    SHIPPED: 'Shipped',
    OUT_FOR_DELIVERY: 'Out for delivery',
    DELIVERED: 'Delivered',
    CANCELLED: 'Cancelled'
};

// Payment methods
export const PAYMENT_METHODS = {
    COD: 'COD',
    STRIPE: 'Stripe',
    RAZORPAY: 'Razorpay'
};

// Return status values
export const RETURN_STATUS = {
    PENDING: 'Pending',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
    RECEIVED: 'Received',
    REFUNDED: 'Refunded'
};

// Chat status values
export const CHAT_STATUS = {
    WAITING: 'waiting',
    ACTIVE: 'active',
    CLOSED: 'closed'
};

// Q&A status values
export const QA_STATUS = {
    PENDING: 'pending',
    ANSWERED: 'answered'
};
