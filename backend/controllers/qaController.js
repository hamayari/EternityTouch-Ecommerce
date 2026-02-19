import qaModel from '../models/qaModel.js';
import productModel from '../models/productModel.js';
import userModel from '../models/userModel.js';
import { generateAutoAnswer, getFallbackMessage, needsManualReview } from '../services/autoAnswerService.js';

// Get all Q&A for a product
const getProductQA = async (req, res) => {
    try {
        const { productId } = req.body;

        if (!productId) {
            return res.json({ success: false, message: 'Product ID required' });
        }

        const qas = await qaModel.find({ productId })
            .sort({ createdAt: -1 })
            .populate('userId', 'name');

        res.json({ success: true, qas });

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Ask a question
const askQuestion = async (req, res) => {
    try {
        const { productId, userId, question } = req.body;

        if (!productId || !userId || !question) {
            return res.json({ success: false, message: 'Missing required fields' });
        }

        // Verify product exists
        const product = await productModel.findById(productId);
        if (!product) {
            return res.json({ success: false, message: 'Product not found' });
        }

        // Get user name
        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        // Create new Q&A entry
        const newQA = new qaModel({
            productId,
            userId,
            userName: user.name,
            question: question.trim()
        });

        // Try to generate automatic answer
        const autoAnswer = await generateAutoAnswer(question, productId);
        
        if (autoAnswer && !needsManualReview(question)) {
            // Automatic answer found
            newQA.answer = autoAnswer.answer;
            newQA.status = 'answered';
            newQA.answeredBy = 'Auto-Assistant';
            newQA.answeredAt = Date.now();
            
            await newQA.save();
            
            console.log(`[AUTO-ANSWER] Question answered automatically for product ${productId}`);
            
            return res.json({ 
                success: true, 
                message: 'Question answered automatically',
                qa: newQA,
                autoAnswered: true
            });
        } else {
            // No automatic answer or needs manual review
            await newQA.save();
            
            console.log(`[MANUAL-REVIEW] Question requires manual answer for product ${productId}`);
            
            return res.json({ 
                success: true, 
                message: 'Question submitted successfully. Our team will answer shortly.',
                qa: newQA,
                autoAnswered: false
            });
        }

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Answer a question (Admin)
const answerQuestion = async (req, res) => {
    try {
        const { qaId, answer } = req.body;

        if (!qaId || !answer) {
            return res.json({ success: false, message: 'Missing required fields' });
        }

        const qa = await qaModel.findById(qaId);
        if (!qa) {
            return res.json({ success: false, message: 'Question not found' });
        }

        qa.answer = answer.trim();
        qa.status = 'answered';
        qa.answeredAt = Date.now();
        await qa.save();

        res.json({ 
            success: true, 
            message: 'Answer posted successfully',
            qa
        });

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Mark answer as helpful/not helpful
const markHelpful = async (req, res) => {
    try {
        const { qaId, userId, helpful } = req.body;

        if (!qaId || !userId || helpful === undefined) {
            return res.json({ success: false, message: 'Missing required fields' });
        }

        const qa = await qaModel.findById(qaId);
        if (!qa) {
            return res.json({ success: false, message: 'Question not found' });
        }

        // Check if user already voted
        const alreadyVoted = qa.helpfulUsers.includes(userId);
        if (alreadyVoted) {
            return res.json({ success: false, message: 'You already voted on this answer' });
        }

        // Add vote
        if (helpful) {
            qa.helpful += 1;
        } else {
            qa.notHelpful += 1;
        }
        qa.helpfulUsers.push(userId);
        await qa.save();

        res.json({ 
            success: true, 
            message: 'Thank you for your feedback',
            qa
        });

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Get all Q&A (Admin)
const getAllQA = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const status = req.query.status;

        const filter = {};
        if (status) filter.status = status;

        const qas = await qaModel.find(filter)
            .populate('productId', 'name image')
            .populate('userId', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await qaModel.countDocuments(filter);

        res.json({
            success: true,
            qas,
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

// Delete question (Admin)
const deleteQuestion = async (req, res) => {
    try {
        const { qaId } = req.body;

        if (!qaId) {
            return res.json({ success: false, message: 'Question ID required' });
        }

        await qaModel.findByIdAndDelete(qaId);

        res.json({ success: true, message: 'Question deleted successfully' });

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Get Q&A statistics (Admin)
const getQAStats = async (req, res) => {
    try {
        const totalQuestions = await qaModel.countDocuments();
        const pendingQuestions = await qaModel.countDocuments({ status: 'pending' });
        const answeredQuestions = await qaModel.countDocuments({ status: 'answered' });

        const recentQuestions = await qaModel.find()
            .populate('productId', 'name')
            .populate('userId', 'name')
            .sort({ createdAt: -1 })
            .limit(5);

        res.json({
            success: true,
            stats: {
                totalQuestions,
                pendingQuestions,
                answeredQuestions,
                recentQuestions
            }
        });

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

export { 
    getProductQA, 
    askQuestion, 
    answerQuestion, 
    markHelpful, 
    getAllQA, 
    deleteQuestion,
    getQAStats
};
