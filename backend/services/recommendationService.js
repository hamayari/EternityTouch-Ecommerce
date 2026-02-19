import productModel from '../models/productModel.js';
import orderModel from '../models/orderModel.js';
import productViewModel from '../models/productViewModel.js';
import userModel from '../models/userModel.js';

/**
 * 🎯 RECOMMENDATION SERVICE
 * Multi-algorithm product recommendation system
 */

// 1. Similar Products (based on category, price, attributes)
export const getSimilarProducts = async (productId, limit = 6) => {
    try {
        const product = await productModel.findById(productId);
        if (!product) return [];

        const priceMin = product.price * 0.7; // -30%
        const priceMax = product.price * 1.3; // +30%

        const similar = await productModel.find({
            _id: { $ne: productId },
            category: product.category,
            subCategory: product.subCategory,
            price: { $gte: priceMin, $lte: priceMax }
        })
        .select('name price images category subCategory averageRating totalReviews stock discount discountEndDate bestseller')
        .sort({ averageRating: -1, totalReviews: -1 })
        .limit(limit)
        .lean();

        return similar;
    } catch (error) {
        console.error('[RECOMMENDATIONS] Error getting similar products:', error);
        return [];
    }
};

// 2. Frequently Bought Together (based on order history) - ✅ Optimized
export const getFrequentlyBoughtTogether = async (productId, limit = 3) => {
    try {
        // Find orders containing this product
        const orders = await orderModel.find({
            'items._id': productId,
            payment: true
        }).limit(100);

        if (orders.length === 0) {
            // Fallback to similar products if no order history
            return getSimilarProducts(productId, limit);
        }

        // Count co-occurrences
        const coOccurrence = {};
        
        for (const order of orders) {
            const productIds = order.items.map(item => item._id.toString());
            
            for (const id of productIds) {
                if (id !== productId.toString()) {
                    coOccurrence[id] = (coOccurrence[id] || 0) + 1;
                }
            }
        }

        // Sort by frequency and get top product IDs
        const sortedIds = Object.entries(coOccurrence)
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([id]) => id);

        // ✅ Fetch all products in a single query with projection
        const products = await productModel.find({
            _id: { $in: sortedIds }
        })
        .select('name price images category subCategory averageRating totalReviews stock discount discountEndDate bestseller')
        .lean();

        // Create a map for sorting by frequency
        const productMap = {};
        products.forEach(p => {
            productMap[p._id.toString()] = p;
        });

        // Sort products by co-occurrence frequency
        const sortedProducts = sortedIds
            .map(id => productMap[id])
            .filter(Boolean);

        return sortedProducts;
    } catch (error) {
        console.error('[RECOMMENDATIONS] Error getting frequently bought together:', error);
        return [];
    }
};

// 3. Personalized Recommendations (based on user behavior)
export const getPersonalizedRecommendations = async (userId, limit = 8) => {
    try {
        if (!userId) {
            // Return trending for anonymous users
            return getTrendingProducts(limit);
        }

        const user = await userModel.findById(userId);
        if (!user) return getTrendingProducts(limit);

        // Get user's viewed products (last 30 days)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const viewedProducts = await productViewModel.find({
            userId,
            viewedAt: { $gte: thirtyDaysAgo }
        })
        .sort({ viewedAt: -1 })
        .limit(20)
        .populate('productId');

        // Get user's purchase history
        const orders = await orderModel.find({
            userId,
            payment: true
        }).limit(10);

        // Extract categories and subcategories from viewed/purchased products
        const categoryScores = {};
        const subCategoryScores = {};

        // Score from views
        viewedProducts.forEach((view, index) => {
            if (view.productId) {
                const weight = 1 / (index + 1); // Recent views have higher weight
                const cat = view.productId.category;
                const subCat = view.productId.subCategory;
                
                categoryScores[cat] = (categoryScores[cat] || 0) + weight;
                subCategoryScores[subCat] = (subCategoryScores[subCat] || 0) + weight;
            }
        });

        // Score from purchases (higher weight)
        orders.forEach(order => {
            order.items.forEach(item => {
                if (item.category) {
                    categoryScores[item.category] = (categoryScores[item.category] || 0) + 3;
                }
                if (item.subCategory) {
                    subCategoryScores[item.subCategory] = (subCategoryScores[item.subCategory] || 0) + 3;
                }
            });
        });

        // Get top categories
        const topCategories = Object.entries(categoryScores)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 2)
            .map(([cat]) => cat);

        const topSubCategories = Object.entries(subCategoryScores)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([subCat]) => subCat);

        // Get viewed/purchased product IDs to exclude
        const viewedIds = viewedProducts.map(v => v.productId?._id).filter(Boolean);
        const purchasedIds = orders.flatMap(o => o.items.map(i => i._id));
        const excludeIds = [...new Set([...viewedIds, ...purchasedIds])];

        // Find recommendations based on preferences
        const recommendations = await productModel.find({
            _id: { $nin: excludeIds },
            $or: [
                { category: { $in: topCategories } },
                { subCategory: { $in: topSubCategories } }
            ]
        })
        .select('name price images category subCategory averageRating totalReviews stock discount discountEndDate bestseller')
        .sort({ averageRating: -1, totalReviews: -1 })
        .limit(limit)
        .lean();

        return recommendations;
    } catch (error) {
        console.error('[RECOMMENDATIONS] Error getting personalized recommendations:', error);
        return getTrendingProducts(limit);
    }
};

// 4. Trending Products (popular items)
export const getTrendingProducts = async (limit = 8) => {
    try {
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        // Get view counts for last 7 days
        const viewCounts = await productViewModel.aggregate([
            {
                $match: {
                    viewedAt: { $gte: sevenDaysAgo }
                }
            },
            {
                $group: {
                    _id: '$productId',
                    viewCount: { $sum: 1 }
                }
            },
            {
                $sort: { viewCount: -1 }
            },
            {
                $limit: limit * 2 // Get more to filter
            }
        ]);

        const productIds = viewCounts.map(v => v._id);

        // Get products with their details
        const products = await productModel.find({
            _id: { $in: productIds }
        })
        .select('name price images category subCategory averageRating totalReviews stock discount discountEndDate bestseller')
        .lean();

        // Calculate trending score (products already plain objects from .lean())
        const productsWithScore = products.map(product => {
            const viewData = viewCounts.find(v => v._id.toString() === product._id.toString());
            const viewScore = viewData ? viewData.viewCount : 0;
            const ratingScore = product.averageRating * product.totalReviews;
            
            return {
                ...product,
                trendingScore: viewScore * 0.7 + ratingScore * 0.3
            };
        });

        // Sort by trending score
        productsWithScore.sort((a, b) => b.trendingScore - a.trendingScore);

        return productsWithScore.slice(0, limit);
    } catch (error) {
        console.error('[RECOMMENDATIONS] Error getting trending products:', error);
        // Fallback to bestsellers
        return productModel.find({ bestseller: true }).limit(limit);
    }
};

// 5. Complete Your Look (complementary products for cart) - ✅ Optimized
export const getCompleteYourLook = async (cartItems, limit = 4) => {
    try {
        if (!cartItems || cartItems.length === 0) return [];

        // ✅ Get all product IDs at once
        const productIds = cartItems.map(item => item._id);
        
        // ✅ Fetch all cart products in a single query with minimal fields
        const cartProducts = await productModel.find({ _id: { $in: productIds } })
            .select('category subCategory')
            .lean();

        // Analyze cart composition
        const cartCategories = new Set();
        const cartSubCategories = new Set();
        const cartProductIds = [];

        cartProducts.forEach(product => {
            if (product) {
                cartCategories.add(product.category);
                cartSubCategories.add(product.subCategory);
                cartProductIds.push(product._id);
            }
        });

        // Define complementary logic
        const complementaryMap = {
            'Topwear': ['Bottomwear', 'Winterwear'],
            'Bottomwear': ['Topwear', 'Winterwear'],
            'Winterwear': ['Topwear', 'Bottomwear']
        };

        // Find complementary subcategories
        const complementarySubCategories = [];
        cartSubCategories.forEach(subCat => {
            if (complementaryMap[subCat]) {
                complementarySubCategories.push(...complementaryMap[subCat]);
            }
        });

        // Get complementary products
        const recommendations = await productModel.find({
            _id: { $nin: cartProductIds },
            category: { $in: Array.from(cartCategories) },
            subCategory: { $in: complementarySubCategories }
        })
        .select('name price images category subCategory averageRating totalReviews stock discount discountEndDate bestseller')
        .sort({ averageRating: -1, bestseller: -1 })
        .limit(limit)
        .lean();

        return recommendations;
    } catch (error) {
        console.error('[RECOMMENDATIONS] Error getting complete your look:', error);
        return [];
    }
};

// 6. Track product view
export const trackProductView = async (userId, productId, sessionId = null) => {
    try {
        if (!userId && !sessionId) return;

        await productViewModel.create({
            userId: userId || null,
            productId,
            sessionId,
            viewedAt: new Date()
        });

        console.log(`[RECOMMENDATIONS] Tracked view: Product ${productId} by ${userId || sessionId}`);
    } catch (error) {
        console.error('[RECOMMENDATIONS] Error tracking view:', error);
    }
};

// 7. Get user's recently viewed products
export const getRecentlyViewed = async (userId, limit = 8) => {
    try {
        if (!userId) return [];

        const views = await productViewModel.find({ userId })
            .sort({ viewedAt: -1 })
            .limit(limit)
            .populate('productId');

        // Remove duplicates and filter out null products
        const seen = new Set();
        const products = [];

        for (const view of views) {
            if (view.productId && !seen.has(view.productId._id.toString())) {
                seen.add(view.productId._id.toString());
                products.push(view.productId);
            }
        }

        return products;
    } catch (error) {
        console.error('[RECOMMENDATIONS] Error getting recently viewed:', error);
        return [];
    }
};

// 8. Get recommendation statistics (for admin)
export const getRecommendationStats = async () => {
    try {
        const totalViews = await productViewModel.countDocuments();
        const uniqueProducts = await productViewModel.distinct('productId');
        const uniqueUsers = await productViewModel.distinct('userId');

        const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const recentViews = await productViewModel.countDocuments({
            viewedAt: { $gte: last7Days }
        });

        return {
            totalViews,
            uniqueProducts: uniqueProducts.length,
            uniqueUsers: uniqueUsers.filter(Boolean).length,
            recentViews
        };
    } catch (error) {
        console.error('[RECOMMENDATIONS] Error getting stats:', error);
        return null;
    }
};
