import mongoose from 'mongoose';
import 'dotenv/config';
import qaModel from '../models/qaModel.js';
import productModel from '../models/productModel.js';
import userModel from '../models/userModel.js';

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

const seedQA = async () => {
    try {
        await connectDB();

        // Get first product and user from database
        const product = await productModel.findOne();
        const user = await userModel.findOne();

        if (!product) {
            console.error('❌ No products found in database. Please add products first.');
            process.exit(1);
        }

        if (!user) {
            console.error('❌ No users found in database. Please create a user first.');
            process.exit(1);
        }

        console.log(`📦 Using product: ${product.name}`);
        console.log(`👤 Using user: ${user.name}`);

        // Clear existing Q&A for this product
        await qaModel.deleteMany({ productId: product._id });
        console.log('🗑️  Cleared existing Q&A');

        // Sample Q&A data
        const qaData = [
            {
                productId: product._id,
                userId: user._id,
                userName: user.name,
                question: 'What material is this product made of?',
                answer: 'This product is made of 100% premium cotton, ensuring maximum comfort and durability.',
                answeredBy: 'Admin',
                answeredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
                status: 'answered',
                helpful: 15,
                notHelpful: 2,
                createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
            },
            {
                productId: product._id,
                userId: user._id,
                userName: user.name,
                question: 'Is this product available in other colors?',
                answer: 'Yes! This product is available in Black, White, Navy Blue, and Gray. You can select your preferred color from the options above.',
                answeredBy: 'Admin',
                answeredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
                status: 'answered',
                helpful: 23,
                notHelpful: 1,
                createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) // 4 days ago
            },
            {
                productId: product._id,
                userId: user._id,
                userName: user.name,
                question: 'How should I wash this product?',
                answer: 'Machine wash cold with similar colors. Tumble dry low. Do not bleach. Iron on low heat if needed.',
                answeredBy: 'Admin',
                answeredAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
                status: 'answered',
                helpful: 8,
                notHelpful: 0,
                createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
            },
            {
                productId: product._id,
                userId: user._id,
                userName: user.name,
                question: 'What is the return policy for this item?',
                answer: 'We offer a 30-day return policy. Items must be unworn, unwashed, and in original condition with tags attached.',
                answeredBy: 'Admin',
                answeredAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
                status: 'answered',
                helpful: 31,
                notHelpful: 3,
                createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
            },
            {
                productId: product._id,
                userId: user._id,
                userName: user.name,
                question: 'Does this run true to size?',
                answer: 'Yes, this product runs true to size. We recommend ordering your usual size. Check our size guide for detailed measurements.',
                answeredBy: 'Admin',
                answeredAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
                status: 'answered',
                helpful: 42,
                notHelpful: 5,
                createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
            },
            {
                productId: product._id,
                userId: user._id,
                userName: user.name,
                question: 'Is this product suitable for sensitive skin?',
                status: 'pending',
                helpful: 0,
                notHelpful: 0,
                createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
            },
            {
                productId: product._id,
                userId: user._id,
                userName: user.name,
                question: 'How long does shipping usually take?',
                status: 'pending',
                helpful: 0,
                notHelpful: 0,
                createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000) // 1 hour ago
            },
            {
                productId: product._id,
                userId: user._id,
                userName: user.name,
                question: 'Can I get this gift wrapped?',
                status: 'pending',
                helpful: 0,
                notHelpful: 0,
                createdAt: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
            }
        ];

        // Insert Q&A data
        const insertedQAs = await qaModel.insertMany(qaData);
        
        console.log(`\n✅ Successfully inserted ${insertedQAs.length} Q&A entries!`);
        console.log('\n📊 Summary:');
        console.log(`   - Answered: ${qaData.filter(q => q.status === 'answered').length}`);
        console.log(`   - Pending: ${qaData.filter(q => q.status === 'pending').length}`);
        console.log(`\n🔗 View them at:`);
        console.log(`   Frontend: http://localhost:5173/product/${product._id}`);
        console.log(`   Admin: http://localhost:5174/qa`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding Q&A:', error);
        process.exit(1);
    }
};

seedQA();
