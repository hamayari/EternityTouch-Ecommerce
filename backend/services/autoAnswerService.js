import productModel from '../models/productModel.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
let genAI = null;
let model = null;

try {
    if (process.env.GEMINI_API_KEY) {
        genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        console.log('[AUTO-ANSWER] ✅ Gemini AI initialized successfully');
    } else {
        console.log('[AUTO-ANSWER] ⚠️ GEMINI_API_KEY not found, using fallback keyword matching');
    }
} catch (error) {
    console.error('[AUTO-ANSWER] ❌ Failed to initialize Gemini AI:', error.message);
}

/**
 * Retry helper with exponential backoff
 */
const retryWithBackoff = async (fn, maxRetries = 2, delay = 2000) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            if (attempt === maxRetries) {
                throw error;
            }
            const waitTime = delay * Math.pow(2, attempt - 1);
            console.log(`[AUTO-ANSWER] Retry attempt ${attempt}/${maxRetries} after ${waitTime}ms...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
    }
};

// Analyze question using AI and generate automatic answer
export const generateAutoAnswer = async (question, productId) => {
    try {
        // Get product details
        const product = await productModel.findById(productId);
        if (!product) {
            return null;
        }

        // Prepare product information for AI
        const productInfo = {
            name: product.name,
            description: product.description,
            price: product.price,
            discount: product.discount,
            category: product.category,
            subCategory: product.subCategory,
            sizes: product.sizes,
            colors: product.colors,
            bestseller: product.bestseller,
            stock: product.stock > 0 ? 'In stock' : 'Out of stock',
            stockQuantity: product.stock
        };

        // Try AI-powered answer first
        if (model) {
            try {
                const aiAnswer = await generateAIAnswer(question, productInfo);
                if (aiAnswer) {
                    return {
                        answer: aiAnswer,
                        confidence: 'high',
                        source: 'ai'
                    };
                }
            } catch (aiError) {
                console.error('[AUTO-ANSWER] AI generation failed, falling back to keyword matching:', aiError.message);
            }
        }

        // Fallback to keyword matching if AI fails or not available
        const keywordAnswer = generateKeywordAnswer(question, product);
        if (keywordAnswer) {
            return {
                answer: keywordAnswer,
                confidence: 'medium',
                source: 'keyword'
            };
        }

        // No automatic answer found
        return null;

    } catch (error) {
        console.error('[AUTO-ANSWER] Error:', error);
        return null;
    }
};

// Generate answer using Gemini AI
const generateAIAnswer = async (question, productInfo) => {
    const prompt = `You are a helpful e-commerce customer service assistant for "Eternity Touch" fashion store.

A customer asked this question about a product:
"${question}"

Product Information:
${JSON.stringify(productInfo, null, 2)}

Store Policies:
- Shipping: Standard (5-7 days), Express (2-3 days). Free shipping over $50.
- Returns: 30-day return policy. Items must be unworn with tags.
- Care: Machine wash cold, tumble dry low (unless product has specific care instructions).

Instructions:
1. Analyze the question and understand what the customer wants to know
2. If the question is about product details (material, size, color, price, stock, description, category), provide a helpful answer using the product information
3. If the question is about shipping, returns, or care, use the store policies
4. If the information is not available in the product data, respond with: "MANUAL_REVIEW_NEEDED"
5. If the question contains complaints, problems, or negative feedback, respond with: "MANUAL_REVIEW_NEEDED"
6. Keep answers concise, friendly, and professional (2-3 sentences max)
7. Respond in the same language as the question when possible

Answer:`;

    // ✅ Retry up to 2 times for AI requests
    try {
        const result = await retryWithBackoff(async () => {
            return await model.generateContent(prompt);
        }, 2, 2000);
        
        const response = await result.response;
        const answer = response.text().trim();

        // Check if AI says manual review needed
        if (answer.includes('MANUAL_REVIEW_NEEDED')) {
            return null;
        }

        return answer;
    } catch (error) {
        console.error('[AUTO-ANSWER] AI generation failed after retries:', error.message);
        return null;
    }
};

// Fallback keyword-based answer generation
const generateKeywordAnswer = (question, product) => {
    const questionLower = question.toLowerCase();

    // Material
    if (/material|fabric|made of|composition|matière|tissu|composé|de quoi|fait/i.test(question)) {
        if (product.material) {
            return `This product is made of ${product.material}. It offers excellent quality and comfort.`;
        }
    }

    // Size
    if (/size|sizing|fit|taille|dimension|measurements/i.test(question)) {
        if (product.sizes && product.sizes.length > 0) {
            return `This product is available in the following sizes: ${product.sizes.join(', ')}. Please refer to our size guide for detailed measurements.`;
        }
    }

    // Color
    if (/color|colour|couleur|shade/i.test(question)) {
        if (product.colors && product.colors.length > 0) {
            return `This product is available in ${product.colors.length} color(s): ${product.colors.join(', ')}. You can select your preferred color from the options above.`;
        }
    }

    // Price
    if (/price|cost|how much|prix|coût|combien/i.test(question)) {
        if (product.price) {
            let answer = `The current price is $${product.price}.`;
            if (product.discount && product.discount > 0) {
                const discountedPrice = product.price * (1 - product.discount / 100);
                answer += ` We currently have a ${product.discount}% discount, bringing the price to $${discountedPrice.toFixed(2)}.`;
            }
            return answer;
        }
    }

    // Stock
    if (/stock|available|availability|in stock|disponible|disponibilité/i.test(question)) {
        if (product.stock !== undefined) {
            if (product.stock > 10) {
                return `Yes, this product is currently in stock and ready to ship!`;
            } else if (product.stock > 0) {
                return `This product is in stock but quantities are limited. Order soon to secure yours!`;
            } else {
                return `Unfortunately, this product is currently out of stock. Please check back later or contact us for restock information.`;
            }
        }
    }

    // Category
    if (/category|type|kind|catégorie|genre/i.test(question)) {
        if (product.category) {
            let answer = `This product belongs to the ${product.category} category.`;
            if (product.subCategory) {
                answer += ` More specifically, it's a ${product.subCategory}.`;
            }
            return answer;
        }
    }

    // Description
    if (/description|about|details|information|describe|what is/i.test(question)) {
        if (product.description) {
            return product.description.substring(0, 300) + (product.description.length > 300 ? '...' : '');
        }
    }

    // Bestseller
    if (/bestseller|popular|best seller|meilleur vente|populaire/i.test(question)) {
        if (product.bestseller) {
            return `Yes! This is one of our bestselling products, loved by many customers for its quality and style.`;
        }
        return `This is a great product from our collection. Check our bestsellers section for our most popular items.`;
    }

    // Shipping
    if (/shipping|delivery|livraison|expédition|ship|deliver/i.test(question)) {
        return `We offer standard shipping (5-7 business days) and express shipping (2-3 business days). Free shipping on orders over $50. Shipping costs are calculated at checkout.`;
    }

    // Return
    if (/return|refund|exchange|retour|remboursement|échange/i.test(question)) {
        return `We offer a 30-day return policy. Items must be unworn, unwashed, and in original condition with tags attached. You can initiate a return from your Orders page.`;
    }

    // Care
    if (/wash|care|clean|maintenance|laver|entretien|nettoyer/i.test(question)) {
        if (product.careInstructions) {
            return product.careInstructions;
        }
        return `For care instructions, please check the product label. Generally, we recommend machine wash cold with similar colors and tumble dry low.`;
    }

    return null;
};

// Generate fallback message for manual review
export const getFallbackMessage = () => {
    return `Thank you for your question! Our team will review it and provide you with a detailed answer shortly. For immediate assistance, please contact our support team via live chat.`;
};

// Check if question needs manual review
export const needsManualReview = (question) => {
    const manualKeywords = [
        'complaint', 'problem', 'issue', 'broken', 'defect', 'damaged',
        'plainte', 'problème', 'cassé', 'défaut', 'endommagé',
        'wrong', 'incorrect', 'mistake', 'error',
        'mauvais', 'incorrect', 'erreur'
    ];

    const questionLower = question.toLowerCase();
    return manualKeywords.some(keyword => questionLower.includes(keyword));
};
