import loyaltyModel from '../models/loyaltyModel.js';
import orderModel from '../models/orderModel.js';
import userModel from '../models/userModel.js';

// Calculate tier based on total earned points
const calculateTier = (totalEarned) => {
    if (totalEarned >= 10000) return 'Platinum';
    if (totalEarned >= 5000) return 'Gold';
    if (totalEarned >= 2000) return 'Silver';
    return 'Bronze';
};

// Get tier benefits
const getTierBenefits = (tier) => {
    const benefits = {
        Bronze: { multiplier: 1, discount: 0, freeShipping: false },
        Silver: { multiplier: 1.25, discount: 5, freeShipping: false },
        Gold: { multiplier: 1.5, discount: 10, freeShipping: true },
        Platinum: { multiplier: 2, discount: 15, freeShipping: true }
    };
    return benefits[tier] || benefits.Bronze;
};

// Get user loyalty info
const getLoyalty = async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.json({ success: false, message: 'User ID required' });
        }

        let loyalty = await loyaltyModel.findOne({ userId });

        // Create loyalty account if doesn't exist
        if (!loyalty) {
            loyalty = new loyaltyModel({ userId });
            await loyalty.save();
        }

        const benefits = getTierBenefits(loyalty.tier);

        res.json({
            success: true,
            loyalty: {
                points: loyalty.points,
                totalEarned: loyalty.totalEarned,
                totalRedeemed: loyalty.totalRedeemed,
                tier: loyalty.tier,
                benefits,
                transactions: loyalty.transactions.sort((a, b) => b.date - a.date).slice(0, 20)
            }
        });

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Earn points (called internally after order completion)
const earnPoints = async (orderId) => {
    try {
        const order = await orderModel.findById(orderId);
        if (!order || !order.payment) return;

        let loyalty = await loyaltyModel.findOne({ userId: order.userId });
        
        if (!loyalty) {
            loyalty = new loyaltyModel({ userId: order.userId });
        }

        // Calculate points: 1 point per $1 spent, multiplied by tier bonus
        const benefits = getTierBenefits(loyalty.tier);
        const basePoints = Math.floor(order.amount);
        const earnedPoints = Math.floor(basePoints * benefits.multiplier);

        loyalty.points += earnedPoints;
        loyalty.totalEarned += earnedPoints;
        
        loyalty.transactions.push({
            type: 'earned',
            points: earnedPoints,
            orderId: order._id,
            description: `Earned from order #${order._id.toString().slice(-8)}`
        });

        // Update tier
        loyalty.tier = calculateTier(loyalty.totalEarned);
        loyalty.updatedAt = Date.now();

        await loyalty.save();

        console.log(`[LOYALTY] User ${order.userId} earned ${earnedPoints} points from order ${orderId}`);

    } catch (error) {
        console.error('[LOYALTY] Error earning points:', error);
    }
};

// Redeem points at checkout
const redeemPoints = async (req, res) => {
    try {
        const { userId, points } = req.body;

        if (!userId || !points) {
            return res.json({ success: false, message: 'Missing required fields' });
        }

        if (points < 100) {
            return res.json({ success: false, message: 'Minimum 100 points required to redeem' });
        }

        const loyalty = await loyaltyModel.findOne({ userId });

        if (!loyalty) {
            return res.json({ success: false, message: 'Loyalty account not found' });
        }

        if (loyalty.points < points) {
            return res.json({ success: false, message: 'Insufficient points' });
        }

        // Calculate discount: 100 points = $10
        const discount = (points / 100) * 10;

        loyalty.points -= points;
        loyalty.totalRedeemed += points;
        
        loyalty.transactions.push({
            type: 'redeemed',
            points: -points,
            description: `Redeemed ${points} points for $${discount.toFixed(2)} discount`
        });

        loyalty.updatedAt = Date.now();
        await loyalty.save();

        res.json({
            success: true,
            message: 'Points redeemed successfully',
            discount,
            remainingPoints: loyalty.points
        });

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Get all loyalty accounts (admin)
const getAllLoyalty = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const filter = {};
        if (req.query.tier) filter.tier = req.query.tier;

        const loyaltyAccounts = await loyaltyModel.find(filter)
            .populate('userId', 'name email')
            .sort({ totalEarned: -1 })
            .skip(skip)
            .limit(limit);

        const total = await loyaltyModel.countDocuments(filter);

        res.json({
            success: true,
            accounts: loyaltyAccounts,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Get loyalty statistics (admin)
const getLoyaltyStats = async (req, res) => {
    try {
        const totalAccounts = await loyaltyModel.countDocuments();
        
        const tierDistribution = await loyaltyModel.aggregate([
            { $group: { _id: '$tier', count: { $sum: 1 } } }
        ]);

        const totalPointsIssued = await loyaltyModel.aggregate([
            { $group: { _id: null, total: { $sum: '$totalEarned' } } }
        ]);

        const totalPointsRedeemed = await loyaltyModel.aggregate([
            { $group: { _id: null, total: { $sum: '$totalRedeemed' } } }
        ]);

        res.json({
            success: true,
            stats: {
                totalAccounts,
                tierDistribution,
                totalPointsIssued: totalPointsIssued[0]?.total || 0,
                totalPointsRedeemed: totalPointsRedeemed[0]?.total || 0
            }
        });

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

export { getLoyalty, earnPoints, redeemPoints, getAllLoyalty, getLoyaltyStats };
