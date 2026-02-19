import mongoose from 'mongoose';
import dotenv from 'dotenv';
import productModel from '../models/productModel.js';
import { generateAutoAnswer } from '../services/autoAnswerService.js';

dotenv.config();

// Test questions in different languages and styles
const testQuestions = [
    // English - Direct
    "What material is this made of?",
    "What sizes are available?",
    "How much does it cost?",
    "Is this in stock?",
    
    // English - Casual/Synonyms
    "What's this thing made from?",
    "Does this come in large?",
    "Can I buy this now?",
    "What colors do you have?",
    
    // French
    "De quoi c'est fait?",
    "Quelle est la matière?",
    "C'est disponible en quelle taille?",
    "Combien ça coûte?",
    
    // Complex/Multi-intent
    "Is this good for summer and what sizes do you have?",
    "What's the price and is it available?",
    
    // Should trigger manual review
    "This product is broken",
    "I have a problem with my order"
];

const testAIAnswers = async () => {
    try {
        console.log('🤖 Testing AI-Powered Q&A System\n');
        console.log('='.repeat(80));
        
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');
        
        // Get a sample product
        const product = await productModel.findOne({ bestseller: true });
        
        if (!product) {
            console.log('❌ No products found in database');
            process.exit(1);
        }
        
        console.log(`📦 Testing with product: ${product.name}`);
        console.log(`   Category: ${product.category}`);
        console.log(`   Price: $${product.price}`);
        console.log(`   Sizes: ${product.sizes?.join(', ') || 'N/A'}`);
        console.log(`   Colors: ${product.colors?.join(', ') || 'N/A'}`);
        console.log(`   Stock: ${product.stock}`);
        console.log('\n' + '='.repeat(80) + '\n');
        
        // Test each question
        for (let i = 0; i < testQuestions.length; i++) {
            const question = testQuestions[i];
            console.log(`\n${i + 1}. Question: "${question}"`);
            console.log('-'.repeat(80));
            
            const result = await generateAutoAnswer(question, product._id);
            
            if (result) {
                console.log(`✅ Answer: ${result.answer}`);
                console.log(`   Source: ${result.source.toUpperCase()}`);
                console.log(`   Confidence: ${result.confidence}`);
            } else {
                console.log('⚠️  No automatic answer - Requires manual review');
            }
        }
        
        console.log('\n' + '='.repeat(80));
        console.log('\n✅ Test completed!\n');
        
        // Check if AI is being used
        if (process.env.GEMINI_API_KEY) {
            console.log('🤖 AI Mode: ACTIVE (Gemini AI)');
        } else {
            console.log('⚠️  AI Mode: FALLBACK (Keyword matching)');
            console.log('   To enable AI, add GEMINI_API_KEY to .env file');
            console.log('   See AI_SETUP.md for instructions');
        }
        
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

testAIAnswers();
