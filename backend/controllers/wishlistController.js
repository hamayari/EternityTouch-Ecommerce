import userModel from '../models/userModel.js';
import productModel from '../models/productModel.js';

// Add to wishlist
const addToWishlist = async (req, res) => {
    try {
        const { userId, productId } = req.body;

        if (!userId || !productId) {
            return res.json({ success: false, message: "Missing required fields" });
        }

        // Check if product exists
        const product = await productModel.findById(productId);
        if (!product) {
            return res.json({ success: false, message: "Product not found" });
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        // Check if already in wishlist
        if (user.wishlist.includes(productId)) {
            return res.json({ success: false, message: "Product already in wishlist" });
        }

        // Add to wishlist
        user.wishlist.push(productId);
        await user.save();

        res.json({ success: true, message: "Added to wishlist", wishlist: user.wishlist });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Remove from wishlist
const removeFromWishlist = async (req, res) => {
    try {
        const { userId, productId } = req.body;

        if (!userId || !productId) {
            return res.json({ success: false, message: "Missing required fields" });
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        // Remove from wishlist
        user.wishlist = user.wishlist.filter(id => id !== productId);
        await user.save();

        res.json({ success: true, message: "Removed from wishlist", wishlist: user.wishlist });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Get user wishlist
const getWishlist = async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.json({ success: false, message: "User ID required" });
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        // Get full product details for wishlist items
        const wishlistProducts = await productModel.find({
            '_id': { $in: user.wishlist }
        });

        res.json({ 
            success: true, 
            wishlist: user.wishlist,
            products: wishlistProducts 
        });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Toggle wishlist (add if not present, remove if present)
const toggleWishlist = async (req, res) => {
    try {
        const { userId, productId } = req.body;

        if (!userId || !productId) {
            return res.json({ success: false, message: "Missing required fields" });
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        const isInWishlist = user.wishlist.includes(productId);

        if (isInWishlist) {
            // Remove from wishlist
            user.wishlist = user.wishlist.filter(id => id !== productId);
            await user.save();
            res.json({ 
                success: true, 
                message: "Removed from wishlist", 
                wishlist: user.wishlist,
                inWishlist: false
            });
        } else {
            // Check if product exists
            const product = await productModel.findById(productId);
            if (!product) {
                return res.json({ success: false, message: "Product not found" });
            }

            // Add to wishlist
            user.wishlist.push(productId);
            await user.save();
            res.json({ 
                success: true, 
                message: "Added to wishlist", 
                wishlist: user.wishlist,
                inWishlist: true
            });
        }
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

export { addToWishlist, removeFromWishlist, getWishlist, toggleWishlist };
