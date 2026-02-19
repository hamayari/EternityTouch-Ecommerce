import couponModel from '../models/couponModel.js';

// Create coupon (Admin)
const createCoupon = async (req, res) => {
    try {
        const { code, type, value, minPurchase, maxDiscount, expiryDate, usageLimit } = req.body;

        // ✅ Validation complète des champs requis
        if (!code || !type || !value || !expiryDate) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        // Validation du type de coupon
        if (!['percentage', 'fixed'].includes(type)) {
            return res.status(400).json({ success: false, message: "Invalid coupon type. Must be 'percentage' or 'fixed'" });
        }

        // ✅ Validation stricte de la valeur
        const numValue = Number(value);
        if (isNaN(numValue) || numValue <= 0) {
            return res.status(400).json({ 
                success: false, 
                message: "Discount value must be a positive number" 
            });
        }

        // Validation spécifique pour pourcentage
        if (type === 'percentage') {
            if (numValue < 0 || numValue > 100) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Percentage must be between 0 and 100" 
                });
            }
        }

        // Validation pour montant fixe
        if (type === 'fixed') {
            if (numValue > 10000) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Fixed discount cannot exceed 10000" 
                });
            }
        }

        // ✅ Validation du code coupon
        const codeStr = String(code).trim().toUpperCase();
        if (codeStr.length < 3 || codeStr.length > 20) {
            return res.status(400).json({ 
                success: false, 
                message: "Coupon code must be between 3 and 20 characters" 
            });
        }

        // Validation des caractères (alphanumériques et tirets uniquement)
        if (!/^[A-Z0-9-]+$/.test(codeStr)) {
            return res.status(400).json({ 
                success: false, 
                message: "Coupon code can only contain letters, numbers, and hyphens" 
            });
        }

        // ✅ Validation des valeurs optionnelles
        if (minPurchase !== undefined) {
            const numMinPurchase = Number(minPurchase);
            if (isNaN(numMinPurchase) || numMinPurchase < 0) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Minimum purchase must be a positive number" 
                });
            }
        }

        if (maxDiscount !== undefined && maxDiscount !== null) {
            const numMaxDiscount = Number(maxDiscount);
            if (isNaN(numMaxDiscount) || numMaxDiscount <= 0) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Maximum discount must be a positive number" 
                });
            }
        }

        if (usageLimit !== undefined && usageLimit !== null) {
            const numUsageLimit = Number(usageLimit);
            if (!Number.isInteger(numUsageLimit) || numUsageLimit < 1) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Usage limit must be a positive integer" 
                });
            }
        }

        // Validation de la date d'expiration
        const expiryDateObj = new Date(expiryDate);
        if (isNaN(expiryDateObj.getTime())) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid expiry date format" 
            });
        }

        if (expiryDateObj <= new Date()) {
            return res.status(400).json({ 
                success: false, 
                message: "Expiry date must be in the future" 
            });
        }

        // Check if code already exists
        const existingCoupon = await couponModel.findOne({ code: codeStr });
        if (existingCoupon) {
            return res.status(409).json({ success: false, message: "Coupon code already exists" });
        }

        const couponData = {
            code: codeStr,
            type,
            value: numValue,
            minPurchase: minPurchase ? Number(minPurchase) : 0,
            maxDiscount: maxDiscount ? Number(maxDiscount) : null,
            expiryDate: expiryDateObj,
            usageLimit: usageLimit ? Number(usageLimit) : null
        };

        const coupon = new couponModel(couponData);
        await coupon.save();

        res.json({ success: true, message: "Coupon created successfully", coupon });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all coupons (Admin) - with optional pagination
const getAllCoupons = async (req, res) => {
    try {
        // ✅ Check if pagination is requested
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);
        
        // If pagination params provided, use pagination
        if (page && limit) {
            const skip = (page - 1) * limit;
            
            // Filters
            const filter = {};
            if (req.query.isActive !== undefined) {
                filter.isActive = req.query.isActive === 'true';
            }
            if (req.query.type) {
                filter.type = req.query.type;
            }
            
            const coupons = await couponModel.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);
                
            const total = await couponModel.countDocuments(filter);
            
            return res.json({
                success: true,
                coupons,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            });
        }
        
        // Otherwise, return all coupons (backward compatibility)
        const coupons = await couponModel.find({}).sort({ createdAt: -1 });
        res.json({ success: true, coupons });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Validate and apply coupon (User)
const validateCoupon = async (req, res) => {
    try {
        const { code, cartTotal } = req.body;

        // ✅ Validation des entrées
        if (!code || cartTotal === undefined) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        // Validation du montant du panier
        const numCartTotal = Number(cartTotal);
        if (isNaN(numCartTotal) || numCartTotal < 0) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid cart total" 
            });
        }

        if (numCartTotal === 0) {
            return res.status(400).json({ 
                success: false, 
                message: "Cart is empty" 
            });
        }

        // Validation du code
        const codeStr = String(code).trim().toUpperCase();
        if (codeStr.length < 3 || codeStr.length > 20) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid coupon code format" 
            });
        }

        // Find coupon
        const coupon = await couponModel.findOne({ 
            code: codeStr,
            isActive: true
        });

        if (!coupon) {
            return res.status(404).json({ success: false, message: "Invalid coupon code" });
        }

        // Check expiry
        if (new Date() > coupon.expiryDate) {
            return res.status(400).json({ success: false, message: "Coupon has expired" });
        }

        // Check usage limit
        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
            return res.status(400).json({ success: false, message: "Coupon usage limit reached" });
        }

        // Check minimum purchase
        if (numCartTotal < coupon.minPurchase) {
            return res.status(400).json({ 
                success: false, 
                message: `Minimum purchase of $${coupon.minPurchase} required` 
            });
        }

        // Calculate discount
        let discount = 0;
        if (coupon.type === 'percentage') {
            discount = (numCartTotal * coupon.value) / 100;
            // Apply max discount if set
            if (coupon.maxDiscount && discount > coupon.maxDiscount) {
                discount = coupon.maxDiscount;
            }
        } else {
            discount = coupon.value;
        }

        // Ensure discount doesn't exceed cart total
        if (discount > numCartTotal) {
            discount = numCartTotal;
        }

        const finalAmount = numCartTotal - discount;

        res.json({
            success: true,
            message: "Coupon applied successfully",
            coupon: {
                code: coupon.code,
                type: coupon.type,
                value: coupon.value,
                discount: discount.toFixed(2),
                finalAmount: finalAmount.toFixed(2)
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Apply coupon (increment usage count)
const applyCoupon = async (req, res) => {
    try {
        const { code } = req.body;

        const coupon = await couponModel.findOne({ code: code.toUpperCase() });
        if (!coupon) {
            return res.json({ success: false, message: "Coupon not found" });
        }

        // Increment usage count
        coupon.usedCount += 1;
        await coupon.save();

        res.json({ success: true, message: "Coupon applied" });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Delete coupon (Admin)
const deleteCoupon = async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.json({ success: false, message: "Coupon ID required" });
        }

        const coupon = await couponModel.findByIdAndDelete(id);
        if (!coupon) {
            return res.json({ success: false, message: "Coupon not found" });
        }

        res.json({ success: true, message: "Coupon deleted successfully" });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Toggle coupon status (Admin)
const toggleCouponStatus = async (req, res) => {
    try {
        const { id } = req.body;

        const coupon = await couponModel.findById(id);
        if (!coupon) {
            return res.json({ success: false, message: "Coupon not found" });
        }

        coupon.isActive = !coupon.isActive;
        await coupon.save();

        res.json({ 
            success: true, 
            message: `Coupon ${coupon.isActive ? 'activated' : 'deactivated'}`,
            coupon 
        });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

export { 
    createCoupon, 
    getAllCoupons, 
    validateCoupon, 
    applyCoupon, 
    deleteCoupon, 
    toggleCouponStatus 
};
