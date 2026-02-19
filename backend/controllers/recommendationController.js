import {
    getSimilarProducts,
    getFrequentlyBoughtTogether,
    getPersonalizedRecommendations,
    getTrendingProducts,
    getCompleteYourLook,
    trackProductView,
    getRecentlyViewed,
    getRecommendationStats
} from '../services/recommendationService.js';

// Get similar products
const getSimilar = async (req, res) => {
    try {
        const { productId } = req.params;
        const { limit } = req.query;

        if (!productId) {
            return res.status(400).json({ success: false, message: 'Product ID is required' });
        }

        const products = await getSimilarProducts(productId, parseInt(limit) || 6);

        res.json({ success: true, products });
    } catch (error) {
        console.error('[RECOMMENDATIONS] Error in getSimilar:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch similar products' });
    }
};

// Get frequently bought together
const getBoughtTogether = async (req, res) => {
    try {
        const { productId } = req.params;
        const { limit } = req.query;

        if (!productId) {
            return res.status(400).json({ success: false, message: 'Product ID is required' });
        }

        const products = await getFrequentlyBoughtTogether(productId, parseInt(limit) || 3);

        res.json({ success: true, products });
    } catch (error) {
        console.error('[RECOMMENDATIONS] Error in getBoughtTogether:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch recommendations' });
    }
};

// Get personalized recommendations
const getPersonalized = async (req, res) => {
    try {
        const { userId } = req.body;
        const { limit } = req.query;

        const products = await getPersonalizedRecommendations(userId, parseInt(limit) || 8);

        res.json({ success: true, products });
    } catch (error) {
        console.error('[RECOMMENDATIONS] Error in getPersonalized:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch personalized recommendations' });
    }
};

// Get trending products
const getTrending = async (req, res) => {
    try {
        const { limit } = req.query;

        const products = await getTrendingProducts(parseInt(limit) || 8);

        res.json({ success: true, products });
    } catch (error) {
        console.error('[RECOMMENDATIONS] Error in getTrending:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch trending products' });
    }
};

// Get complete your look recommendations
const getCompleteTheLook = async (req, res) => {
    try {
        const { cartItems } = req.body;
        const { limit } = req.query;

        if (!cartItems || !Array.isArray(cartItems)) {
            return res.status(400).json({ success: false, message: 'Cart items are required' });
        }

        const products = await getCompleteYourLook(cartItems, parseInt(limit) || 4);

        res.json({ success: true, products });
    } catch (error) {
        console.error('[RECOMMENDATIONS] Error in getCompleteTheLook:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch recommendations' });
    }
};

// Track product view
const trackView = async (req, res) => {
    try {
        const { userId, productId, sessionId } = req.body;

        if (!productId) {
            return res.status(400).json({ success: false, message: 'Product ID is required' });
        }

        await trackProductView(userId, productId, sessionId);

        res.json({ success: true, message: 'View tracked successfully' });
    } catch (error) {
        console.error('[RECOMMENDATIONS] Error in trackView:', error);
        res.status(500).json({ success: false, message: 'Failed to track view' });
    }
};

// Get recently viewed products
const getRecent = async (req, res) => {
    try {
        const { userId } = req.body;
        const { limit } = req.query;

        if (!userId) {
            return res.status(400).json({ success: false, message: 'User ID is required' });
        }

        const products = await getRecentlyViewed(userId, parseInt(limit) || 8);

        res.json({ success: true, products });
    } catch (error) {
        console.error('[RECOMMENDATIONS] Error in getRecent:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch recently viewed products' });
    }
};

// Get recommendation statistics (Admin)
const getStats = async (req, res) => {
    try {
        const stats = await getRecommendationStats();

        res.json({ success: true, stats });
    } catch (error) {
        console.error('[RECOMMENDATIONS] Error in getStats:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch statistics' });
    }
};

export {
    getSimilar,
    getBoughtTogether,
    getPersonalized,
    getTrending,
    getCompleteTheLook,
    trackView,
    getRecent,
    getStats
};
