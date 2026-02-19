import rateLimit from 'express-rate-limit';

// Rate limiter pour les routes de login
export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'production' ? 5 : 20, // 5 en prod, 20 en dev
    message: 'Too many login attempts, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Ne compte que les échecs
});

// Rate limiter pour les routes API générales
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'production' ? 100 : 1000, // 1000 en dev, 100 en prod
    message: 'Too many requests, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiter pour les commandes
export const orderLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 heure
    max: process.env.NODE_ENV === 'production' ? 10 : 50, // 10 en prod, 50 en dev
    message: 'Too many orders, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiter strict pour les opérations sensibles (admin)
export const strictLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // 20 requêtes max
    message: 'Too many requests from this IP, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiter pour les uploads
export const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 heure
    max: 50, // 50 uploads max par heure
    message: 'Too many uploads, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiter pour les emails
export const emailLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 heure
    max: 5, // 5 emails max par heure
    message: 'Too many email requests, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiter pour les reviews
export const reviewLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 heure
    max: process.env.NODE_ENV === 'production' ? 5 : 20, // 5 reviews/heure en prod
    message: 'Too many reviews submitted, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiter pour le chat
export const chatLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: process.env.NODE_ENV === 'production' ? 10 : 50, // 10 messages/minute en prod
    message: 'Too many messages, please slow down',
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiter pour la newsletter
export const newsletterLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 heures
    max: 3, // 3 tentatives par jour
    message: 'Too many newsletter subscription attempts, please try again tomorrow',
    standardHeaders: true,
    legacyHeaders: false,
});
