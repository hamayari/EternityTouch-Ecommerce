import crypto from 'crypto';

/**
 * Simple CSRF Protection Middleware
 * Protects against Cross-Site Request Forgery attacks
 */

// Store for CSRF tokens (in production, use Redis or database)
const csrfTokens = new Map();

// Clean up old tokens every hour
setInterval(() => {
    const now = Date.now();
    for (const [token, data] of csrfTokens.entries()) {
        if (now - data.timestamp > 3600000) { // 1 hour
            csrfTokens.delete(token);
        }
    }
}, 3600000);

/**
 * Generate CSRF token
 */
export const generateCsrfToken = (req, res) => {
    try {
        const token = crypto.randomBytes(32).toString('hex');
        const userId = req.body.userId || req.headers['user-id'] || 'anonymous';
        
        csrfTokens.set(token, {
            userId,
            timestamp: Date.now()
        });
        
        res.json({ success: true, csrfToken: token });
    } catch (error) {
        console.error('Error generating CSRF token:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to generate security token' 
        });
    }
};

/**
 * Validate CSRF token
 */
export const validateCsrfToken = (req, res, next) => {
    // Skip CSRF for GET requests
    if (req.method === 'GET') {
        return next();
    }
    
    // Skip CSRF for webhook endpoints
    if (req.path.includes('/webhook')) {
        return next();
    }
    
    const token = req.headers['x-csrf-token'] || req.body.csrfToken;
    
    if (!token) {
        return res.status(403).json({ 
            success: false, 
            message: 'Security token missing. Please refresh the page.' 
        });
    }
    
    const tokenData = csrfTokens.get(token);
    
    if (!tokenData) {
        return res.status(403).json({ 
            success: false, 
            message: 'Invalid or expired security token. Please refresh the page.' 
        });
    }
    
    // Check if token is expired (1 hour)
    if (Date.now() - tokenData.timestamp > 3600000) {
        csrfTokens.delete(token);
        return res.status(403).json({ 
            success: false, 
            message: 'Security token expired. Please refresh the page.' 
        });
    }
    
    // Token is valid, proceed
    next();
};

/**
 * Optional: Apply CSRF protection only to specific routes
 */
export const csrfProtection = {
    generate: generateCsrfToken,
    validate: validateCsrfToken
};

export default csrfProtection;
