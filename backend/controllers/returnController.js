import returnModel from '../models/returnModel.js';
import orderModel from '../models/orderModel.js';
import userModel from '../models/userModel.js';
import productModel from '../models/productModel.js';
import { sendEmail } from '../services/emailService.js';

// Create return request
const createReturn = async (req, res) => {
    try {
        const { userId, orderId, items, reason, description, refundMethod } = req.body;

        // Validation
        if (!orderId || !items || !reason || !description) {
            return res.json({ success: false, message: "All fields are required" });
        }

        // Check if order exists and belongs to user
        const order = await orderModel.findById(orderId);
        if (!order) {
            return res.json({ success: false, message: "Order not found" });
        }

        if (order.userId.toString() !== userId) {
            return res.json({ success: false, message: "Unauthorized" });
        }

        // Check if order is eligible for return (delivered within 30 days)
        if (order.status !== 'Delivered') {
            return res.json({ success: false, message: "Only delivered orders can be returned" });
        }

        const daysSinceDelivery = Math.floor((Date.now() - order.date) / (1000 * 60 * 60 * 24));
        if (daysSinceDelivery > 30) {
            return res.json({ success: false, message: "Return period expired (30 days)" });
        }

        // Check if return already exists for this order
        const existingReturn = await returnModel.findOne({ orderId });
        if (existingReturn) {
            return res.json({ success: false, message: "Return request already exists for this order" });
        }

        // Calculate refund amount
        let refundAmount = 0;
        items.forEach(item => {
            refundAmount += item.price * item.quantity;
        });

        // Create return request
        const returnRequest = new returnModel({
            orderId,
            userId,
            items,
            reason,
            description,
            refundMethod: refundMethod || 'Original Payment',
            refundAmount,
            status: 'Pending'
        });

        await returnRequest.save();

        // Send email notification
        const user = await userModel.findById(userId);
        if (user && user.email) {
            await sendEmail({
                to: user.email,
                subject: 'Return Request Received - Eternity Touch',
                html: `
                    <h2>Return Request Received</h2>
                    <p>Dear ${user.name},</p>
                    <p>We have received your return request for order #${orderId.toString().slice(-8).toUpperCase()}.</p>
                    <p><strong>Reason:</strong> ${reason}</p>
                    <p><strong>Refund Amount:</strong> $${refundAmount}</p>
                    <p>Our team will review your request within 24-48 hours.</p>
                    <p>You can track the status in your account under Orders.</p>
                    <br>
                    <p>Thank you,<br>Eternity Touch Team</p>
                `
            });
        }

        res.json({ 
            success: true, 
            message: "Return request submitted successfully",
            returnId: returnRequest._id
        });

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Get user's return requests
const getUserReturns = async (req, res) => {
    try {
        const { userId } = req.body;

        const returns = await returnModel.find({ userId })
            .populate('orderId')
            .sort({ createdAt: -1 });

        res.json({ success: true, returns });

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Get single return details
const getReturnDetails = async (req, res) => {
    try {
        const { returnId, userId } = req.body;

        const returnRequest = await returnModel.findById(returnId)
            .populate('orderId')
            .populate('userId', 'name email');

        if (!returnRequest) {
            return res.json({ success: false, message: "Return request not found" });
        }

        // Verify ownership
        if (returnRequest.userId._id.toString() !== userId) {
            return res.json({ success: false, message: "Unauthorized" });
        }

        res.json({ success: true, return: returnRequest });

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Admin: Get all returns
const getAllReturns = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const filter = {};
        if (req.query.status) {
            filter.status = req.query.status;
        }

        const returns = await returnModel.find(filter)
            .populate('orderId')
            .populate('userId', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await returnModel.countDocuments(filter);

        res.json({
            success: true,
            returns,
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

// Admin: Update return status
const updateReturnStatus = async (req, res) => {
    try {
        const { returnId, status, adminNotes, trackingNumber } = req.body;

        const returnRequest = await returnModel.findById(returnId);
        if (!returnRequest) {
            return res.json({ success: false, message: "Return request not found" });
        }

        // Update status
        returnRequest.status = status;
        returnRequest.updatedAt = Date.now();

        if (adminNotes) {
            returnRequest.adminNotes = adminNotes;
        }

        if (trackingNumber) {
            returnRequest.trackingNumber = trackingNumber;
        }

        if (status === 'Approved') {
            returnRequest.approvedAt = Date.now();
        }

        if (status === 'Refunded') {
            returnRequest.refundedAt = Date.now();
            
            // Restore stock for returned items
            for (const item of returnRequest.items) {
                await productModel.findByIdAndUpdate(item.productId, {
                    $inc: { stock: item.quantity }
                });
            }
        }

        await returnRequest.save();

        // Send email notification to user
        const user = await userModel.findById(returnRequest.userId);
        if (user && user.email) {
            let emailSubject = '';
            let emailBody = '';

            switch (status) {
                case 'Approved':
                    emailSubject = 'Return Request Approved';
                    emailBody = `
                        <h2>Return Request Approved</h2>
                        <p>Dear ${user.name},</p>
                        <p>Your return request has been approved!</p>
                        <p><strong>Refund Amount:</strong> $${returnRequest.refundAmount}</p>
                        ${trackingNumber ? `<p><strong>Return Tracking:</strong> ${trackingNumber}</p>` : ''}
                        <p>Please ship the items back to us. Once we receive them, we'll process your refund.</p>
                    `;
                    break;
                case 'Rejected':
                    emailSubject = 'Return Request Rejected';
                    emailBody = `
                        <h2>Return Request Rejected</h2>
                        <p>Dear ${user.name},</p>
                        <p>Unfortunately, your return request has been rejected.</p>
                        ${adminNotes ? `<p><strong>Reason:</strong> ${adminNotes}</p>` : ''}
                        <p>If you have questions, please contact our support team.</p>
                    `;
                    break;
                case 'Refunded':
                    emailSubject = 'Refund Processed';
                    emailBody = `
                        <h2>Refund Processed</h2>
                        <p>Dear ${user.name},</p>
                        <p>Your refund has been processed successfully!</p>
                        <p><strong>Amount:</strong> $${returnRequest.refundAmount}</p>
                        <p>The refund will appear in your account within 5-10 business days.</p>
                    `;
                    break;
                default:
                    emailSubject = 'Return Status Updated';
                    emailBody = `
                        <h2>Return Status Updated</h2>
                        <p>Dear ${user.name},</p>
                        <p>Your return request status has been updated to: <strong>${status}</strong></p>
                    `;
            }

            await sendEmail({
                to: user.email,
                subject: `${emailSubject} - Eternity Touch`,
                html: `
                    ${emailBody}
                    <br>
                    <p>Thank you,<br>Eternity Touch Team</p>
                `
            });
        }

        res.json({ 
            success: true, 
            message: "Return status updated",
            return: returnRequest
        });

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Cancel return request (user)
const cancelReturn = async (req, res) => {
    try {
        const { returnId, userId } = req.body;

        const returnRequest = await returnModel.findById(returnId);
        if (!returnRequest) {
            return res.json({ success: false, message: "Return request not found" });
        }

        // Verify ownership
        if (returnRequest.userId.toString() !== userId) {
            return res.json({ success: false, message: "Unauthorized" });
        }

        // Can only cancel if pending
        if (returnRequest.status !== 'Pending') {
            return res.json({ success: false, message: "Cannot cancel return in current status" });
        }

        await returnModel.findByIdAndDelete(returnId);

        res.json({ success: true, message: "Return request cancelled" });

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

export { 
    createReturn, 
    getUserReturns, 
    getReturnDetails, 
    getAllReturns, 
    updateReturnStatus,
    cancelReturn
};
