import mongoose from 'mongoose';
import productModel from '../models/productModel.js';

const fixStock = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/forever');
        console.log('Connected to MongoDB');
        
        // Update all products to have stock of 100
        const result = await productModel.updateMany(
            {},
            { $set: { stock: 100 } }
        );
        
        console.log(`✅ Updated ${result.modifiedCount} products with stock = 100`);
        
        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

fixStock();
