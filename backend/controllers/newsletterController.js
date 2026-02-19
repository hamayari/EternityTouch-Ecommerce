import newsletterModel from '../models/newsletterModel.js';
import couponModel from '../models/couponModel.js';
import { sendEmail } from '../services/emailService.js';

// Subscribe to newsletter
const subscribe = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.json({ success: false, message: 'Email is required' });
        }

        // Check if already subscribed
        const existing = await newsletterModel.findOne({ email });
        if (existing) {
            if (existing.isActive) {
                return res.json({ success: false, message: 'Email already subscribed' });
            } else {
                // Reactivate subscription
                existing.isActive = true;
                await existing.save();
                return res.json({ 
                    success: true, 
                    message: 'Welcome back! Subscription reactivated',
                    discountCode: existing.discountCode
                });
            }
        }

        // Generate unique discount code
        const discountCode = `WELCOME${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

        // Create coupon for new subscriber
        const coupon = new couponModel({
            code: discountCode,
            discountType: 'percentage',
            discountValue: 10,
            minimumAmount: 50,
            expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            usageLimit: 1,
            description: 'Welcome discount for newsletter subscribers'
        });
        await coupon.save();

        // Save subscriber
        const subscriber = new newsletterModel({
            email,
            source: 'popup',
            discountCode
        });
        await subscriber.save();

        // Send welcome email with discount code
        try {
            await sendEmail({
                to: email,
                subject: '🎉 Welcome to Eternity Touch - 10% OFF Inside!',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h1 style="color: #414141;">Welcome to Eternity Touch! 🎉</h1>
                        <p>Thank you for subscribing to our newsletter!</p>
                        <p>As a welcome gift, here's your exclusive discount code:</p>
                        <div style="background: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
                            <h2 style="color: #ff6b6b; margin: 0; font-size: 32px;">${discountCode}</h2>
                            <p style="margin: 10px 0 0 0; color: #666;">Get 10% OFF on orders over $50</p>
                        </div>
                        <p>Use this code at checkout to enjoy your discount. Valid for 30 days!</p>
                        <p>Stay tuned for:</p>
                        <ul>
                            <li>Exclusive deals and promotions</li>
                            <li>New arrivals and collections</li>
                            <li>Style tips and fashion trends</li>
                            <li>Special birthday surprises</li>
                        </ul>
                        <p>Happy shopping!</p>
                        <p style="color: #666; font-size: 12px; margin-top: 30px;">
                            You're receiving this email because you subscribed to our newsletter.
                            <a href="${process.env.FRONTEND_URL}/unsubscribe?email=${email}" style="color: #666;">Unsubscribe</a>
                        </p>
                    </div>
                `
            });
        } catch (emailError) {
            console.error('Failed to send welcome email:', emailError);
            // Don't fail the subscription if email fails
        }

        res.json({ 
            success: true, 
            message: 'Successfully subscribed! Check your email for discount code.',
            discountCode
        });

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Unsubscribe from newsletter
const unsubscribe = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.json({ success: false, message: 'Email is required' });
        }

        const subscriber = await newsletterModel.findOne({ email });
        if (!subscriber) {
            return res.json({ success: false, message: 'Email not found' });
        }

        subscriber.isActive = false;
        await subscriber.save();

        res.json({ success: true, message: 'Successfully unsubscribed' });

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Get all subscribers (Admin)
const getAllSubscribers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;
        const status = req.query.status; // active, inactive, all

        const filter = {};
        if (status === 'active') filter.isActive = true;
        if (status === 'inactive') filter.isActive = false;

        const subscribers = await newsletterModel.find(filter)
            .sort({ subscribedAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await newsletterModel.countDocuments(filter);

        res.json({
            success: true,
            subscribers,
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

// Get newsletter stats (Admin)
const getStats = async (req, res) => {
    try {
        const totalSubscribers = await newsletterModel.countDocuments();
        const activeSubscribers = await newsletterModel.countDocuments({ isActive: true });
        const inactiveSubscribers = await newsletterModel.countDocuments({ isActive: false });

        // Recent subscribers (last 7 days)
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const recentSubscribers = await newsletterModel.countDocuments({
            subscribedAt: { $gte: sevenDaysAgo }
        });

        // Growth rate
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const lastMonthSubscribers = await newsletterModel.countDocuments({
            subscribedAt: { $gte: thirtyDaysAgo }
        });

        res.json({
            success: true,
            stats: {
                totalSubscribers,
                activeSubscribers,
                inactiveSubscribers,
                recentSubscribers,
                lastMonthSubscribers
            }
        });

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Delete subscriber (Admin)
const deleteSubscriber = async (req, res) => {
    try {
        const { subscriberId } = req.body;

        if (!subscriberId) {
            return res.json({ success: false, message: 'Subscriber ID required' });
        }

        await newsletterModel.findByIdAndDelete(subscriberId);

        res.json({ success: true, message: 'Subscriber deleted successfully' });

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

export { subscribe, unsubscribe, getAllSubscribers, getStats, deleteSubscriber };
