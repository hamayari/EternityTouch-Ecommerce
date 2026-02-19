/**
 * Reusable validation utilities
 */

/**
 * Validate order items structure and values
 * @param {Array} items - Order items to validate
 * @returns {Object} { isValid: boolean, error: string|null }
 */
export const validateOrderItems = (items) => {
    if (!Array.isArray(items) || items.length === 0) {
        return { isValid: false, error: 'Cart is empty' };
    }

    for (const item of items) {
        // Validate structure
        if (!item._id || !item.name || !item.quantity || !item.price) {
            return { isValid: false, error: 'Invalid item data structure' };
        }

        // Validate quantity
        const quantity = Number(item.quantity);
        if (!Number.isInteger(quantity) || quantity < 1) {
            return { isValid: false, error: `Invalid quantity for ${item.name}. Must be a positive integer.` };
        }

        if (quantity > 99) {
            return { isValid: false, error: `Quantity for ${item.name} exceeds maximum (99)` };
        }

        // Validate price
        const price = Number(item.price);
        if (isNaN(price) || price < 0) {
            return { isValid: false, error: `Invalid price for ${item.name}` };
        }
    }

    return { isValid: true, error: null };
};

/**
 * Validate coupon code format
 * @param {string} code - Coupon code to validate
 * @returns {Object} { isValid: boolean, error: string|null, sanitized: string }
 */
export const validateCouponCode = (code) => {
    if (!code || typeof code !== 'string') {
        return { isValid: false, error: 'Coupon code is required', sanitized: null };
    }

    const sanitized = String(code).trim().toUpperCase();

    if (sanitized.length < 3 || sanitized.length > 20) {
        return { isValid: false, error: 'Coupon code must be between 3 and 20 characters', sanitized: null };
    }

    if (!/^[A-Z0-9-]+$/.test(sanitized)) {
        return { isValid: false, error: 'Coupon code can only contain letters, numbers, and hyphens', sanitized: null };
    }

    return { isValid: true, error: null, sanitized };
};

/**
 * Validate quantity value
 * @param {any} quantity - Quantity to validate
 * @param {number} min - Minimum allowed value (default: 0)
 * @param {number} max - Maximum allowed value (default: 99)
 * @returns {Object} { isValid: boolean, error: string|null, value: number }
 */
export const validateQuantity = (quantity, min = 0, max = 99) => {
    const num = Number(quantity);

    if (isNaN(num) || !Number.isInteger(num)) {
        return { isValid: false, error: 'Quantity must be an integer', value: null };
    }

    if (num < min || num > max) {
        return { isValid: false, error: `Quantity must be between ${min} and ${max}`, value: null };
    }

    return { isValid: true, error: null, value: num };
};

/**
 * Validate MongoDB ObjectId
 * @param {string} id - ID to validate
 * @returns {boolean}
 */
export const isValidObjectId = (id) => {
    return /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Validate price value
 * @param {any} price - Price to validate
 * @param {number} min - Minimum allowed value (default: 0)
 * @param {number} max - Maximum allowed value (default: 1000000)
 * @returns {Object} { isValid: boolean, error: string|null, value: number }
 */
export const validatePrice = (price, min = 0, max = 1000000) => {
    const num = Number(price);

    if (isNaN(num)) {
        return { isValid: false, error: 'Price must be a number', value: null };
    }

    if (num < min || num > max) {
        return { isValid: false, error: `Price must be between ${min} and ${max}`, value: null };
    }

    return { isValid: true, error: null, value: num };
};

/**
 * Validate discount value based on type
 * @param {string} type - 'percentage' or 'fixed'
 * @param {any} value - Discount value
 * @returns {Object} { isValid: boolean, error: string|null, value: number }
 */
export const validateDiscount = (type, value) => {
    const num = Number(value);

    if (isNaN(num) || num <= 0) {
        return { isValid: false, error: 'Discount value must be a positive number', value: null };
    }

    if (type === 'percentage') {
        if (num < 0 || num > 100) {
            return { isValid: false, error: 'Percentage must be between 0 and 100', value: null };
        }
    } else if (type === 'fixed') {
        if (num > 10000) {
            return { isValid: false, error: 'Fixed discount cannot exceed 10000', value: null };
        }
    } else {
        return { isValid: false, error: 'Invalid discount type', value: null };
    }

    return { isValid: true, error: null, value: num };
};

/**
 * Sanitize string input (prevent XSS)
 * @param {string} input - String to sanitize
 * @param {number} maxLength - Maximum allowed length
 * @returns {string}
 */
export const sanitizeString = (input, maxLength = 1000) => {
    if (typeof input !== 'string') return '';
    
    return input
        .trim()
        .slice(0, maxLength)
        .replace(/[<>]/g, ''); // Remove < and > to prevent basic XSS
};

/**
 * Validate pagination parameters
 * @param {any} page - Page number
 * @param {any} limit - Items per page
 * @returns {Object} { page: number, limit: number }
 */
export const validatePagination = (page, limit) => {
    const p = parseInt(page) || 1;
    const l = parseInt(limit) || 20;

    return {
        page: Math.max(1, p),
        limit: Math.min(100, Math.max(1, l)) // Max 100 items per page
    };
};
