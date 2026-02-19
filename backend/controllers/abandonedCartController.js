import abandonedCartModel from '../models/abandonedCartModel.js';
import productModel from '../models/productModel.js';

// Get all abandoned carts (Admin) - with optional pagination
const getAllAbandonedCarts = async (req, res) => {
    try {
        const { status } = req.query;
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);

        const filter = {};
        if (status) {
            filter.status = status;
        }

        // If pagination params provided, use pagination
        if (page && limit) {
            const skip = (page - 1) * limit;
            
            const carts = await abandonedCartModel.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);
                
            const total = await abandonedCartModel.countDocuments(filter);

            // ✅ Get product details for each cart (Optimized - No N+1)
            const cartsWithDetails = await getCartsWithProductDetails(carts);

            return res.json({
                success: true,
                carts: cartsWithDetails,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            });
        }

        // Otherwise, return limited results (backward compatibility)
        const carts = await abandonedCartModel.find(filter)
            .sort({ createdAt: -1 })
            .limit(100);

        // ✅ Get product details for each cart (Optimized - No N+1)
        const cartsWithDetails = await getCartsWithProductDetails(carts);

        res.json({ success: true, carts: cartsWithDetails });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// ✅ Helper function to get cart products (Optimized - No N+1)
const getCartsWithProductDetails = async (carts) => {
    // Collect all unique product IDs from all carts
    const allProductIds = new Set();
    carts.forEach(cart => {
        Object.keys(cart.cartData || {}).forEach(itemId => {
            allProductIds.add(itemId);
        });
    });

    // Fetch all products in a single query with projection
    const products = await productModel.find({ _id: { $in: Array.from(allProductIds) } })
        .select('name price images image')
        .lean();
    
    // Create a map for O(1) lookup
    const productMap = {};
    products.forEach(product => {
        productMap[product._id.toString()] = product;
    });

    // Build carts with product details
    return carts.map(cart => {
        const products = [];
        
        for (const itemId in cart.cartData) {
            const product = productMap[itemId];
            if (product) {
                let quantity = 0;
                for (const size in cart.cartData[itemId]) {
                    quantity += cart.cartData[itemId][size];
                }
                products.push({
                    name: product.name,
                    image: product.images?.[0] || product.image?.[0],
                    price: product.price,
                    quantity
                });
            }
        }

        return {
            ...cart.toObject(),
            products
        };
    });
};

// Get abandoned cart statistics (Admin)
const getAbandonedCartStats = async (req, res) => {
    try {
        const totalAbandoned = await abandonedCartModel.countDocuments({ status: 'active' });
        const totalRecovered = await abandonedCartModel.countDocuments({ status: 'recovered' });
        const totalExpired = await abandonedCartModel.countDocuments({ status: 'expired' });

        // Calculate total value
        const activeCarts = await abandonedCartModel.find({ status: 'active' });
        const totalValue = activeCarts.reduce((sum, cart) => sum + cart.cartValue, 0);

        const recoveredCarts = await abandonedCartModel.find({ status: 'recovered' });
        const recoveredValue = recoveredCarts.reduce((sum, cart) => sum + cart.cartValue, 0);

        // Recovery rate
        const totalCarts = totalAbandoned + totalRecovered + totalExpired;
        const recoveryRate = totalCarts > 0 ? ((totalRecovered / totalCarts) * 100).toFixed(1) : 0;

        // Email stats
        const cartsWithEmails = await abandonedCartModel.find({
            'emailsSent.0': { $exists: true }
        });
        const totalEmailsSent = cartsWithEmails.reduce((sum, cart) => sum + cart.emailsSent.length, 0);

        res.json({
            success: true,
            stats: {
                totalAbandoned,
                totalRecovered,
                totalExpired,
                totalValue: totalValue.toFixed(2),
                recoveredValue: recoveredValue.toFixed(2),
                recoveryRate: `${recoveryRate}%`,
                totalEmailsSent,
                averageCartValue: totalAbandoned > 0 ? (totalValue / totalAbandoned).toFixed(2) : 0
            }
        });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Manually send recovery email (Admin)
const sendManualRecoveryEmail = async (req, res) => {
    try {
        const { cartId } = req.body;

        if (!cartId) {
            return res.json({ success: false, message: 'Cart ID is required' });
        }

        const cart = await abandonedCartModel.findById(cartId);
        if (!cart) {
            return res.json({ success: false, message: 'Cart not found' });
        }

        if (cart.status !== 'active') {
            return res.json({ success: false, message: 'Cart is not active' });
        }

        // Import the service function
        const { sendRecoveryEmails } = await import('../services/abandonedCartService.js');
        await sendRecoveryEmails();

        res.json({ success: true, message: 'Recovery email sent successfully' });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Delete abandoned cart (Admin)
const deleteAbandonedCart = async (req, res) => {
    try {
        const { cartId } = req.body;

        if (!cartId) {
            return res.json({ success: false, message: 'Cart ID is required' });
        }

        await abandonedCartModel.findByIdAndDelete(cartId);

        res.json({ success: true, message: 'Abandoned cart deleted successfully' });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

export {
    getAllAbandonedCarts,
    getAbandonedCartStats,
    sendManualRecoveryEmail,
    deleteAbandonedCart
};
