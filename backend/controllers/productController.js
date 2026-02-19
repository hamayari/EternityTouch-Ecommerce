import {v2 as cloudinary} from 'cloudinary';
import productModel from '../models/productModel.js';
import logger from '../utils/logger.js';

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_SECRET_KEY
  });
  

// function for add product
const addProduct = async (req, res) => {
    try {
        const { name, description, price, category, subCategory, sizes, bestseller, stock, discount, discountEndDate } = req.body;

        // Validation des champs requis
        if (!name || !description || !price || !category || !subCategory || !sizes) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        // Validation du prix
        const priceNum = Number(price);
        if (isNaN(priceNum) || priceNum < 0 || priceNum > 1000000) {
            return res.status(400).json({ success: false, message: "Invalid price (must be between 0 and 1,000,000)" });
        }

        // Validation de la longueur des champs
        if (name.length > 200 || description.length > 2000) {
            return res.status(400).json({ success: false, message: "Name or description too long" });
        }

        // ✅ Ensure req.files exists
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json({ success: false, message: "At least one image is required" });
        }

        // ✅ Extract images safely
        const image1 = req.files.image1?.[0];
        const image2 = req.files.image2?.[0];
        const image3 = req.files.image3?.[0];
        const image4 = req.files.image4?.[0];

        const images = [image1, image2, image3, image4].filter((item) => item !== undefined);

        // ✅ Upload images to Cloudinary
        let imagesUrl = await Promise.all(
            images.map(async (item) => {
                let result = await cloudinary.uploader.upload(item.path, {resource_type:'image'});
                return result.secure_url;
            })
        );

        // ✅ Create product data object
        const productData = {
            name,
            description,
            price: Number(price),
            category,
            subCategory,
            sizes: JSON.parse(sizes),
            bestseller: bestseller === "true" ? true : false,
            images: imagesUrl,
            date: Date.now(),
            stock: Number(stock) || 0,
            discount: Number(discount) || 0,
            discountEndDate: discountEndDate ? new Date(discountEndDate) : null
        };

        // ✅ Save product in DB
        const product = new productModel(productData);
        await product.save();
        res.json({ success: true, message: "Product Added" });

    } 
    catch (error){
        logger.error('PRODUCT', 'Error adding product', { error: error.message });
        
        // User-friendly error messages
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid product data. Please check all fields.' 
            });
        }
        
        if (error.code === 11000) {
            return res.status(409).json({ 
                success: false, 
                message: 'A product with this name already exists.' 
            });
        }
        
        res.status(500).json({ 
            success: false, 
            message: 'Failed to add product. Please try again.' 
        });
    }
}

// function for list product (with optional pagination)
const listProducts = async (req, res) => {
    try{
        // ✅ Check if pagination is requested
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);
        
        // If pagination params provided, use pagination
        if (page && limit) {
            const skip = (page - 1) * limit;
            
            const products = await productModel.find({})
                .sort({ date: -1 })
                .skip(skip)
                .limit(limit);
                
            const total = await productModel.countDocuments();
            
            return res.json({
                success: true,
                products,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            });
        }
        
        // Otherwise, return all products (backward compatibility)
        const products = await productModel.find({})
            .sort({ date: -1 })
            .lean();
        res.json({success:true, products})
    }
    catch (error){
        logger.error('PRODUCT', 'Error listing products', { error: error.message });
        res.status(500).json({ 
            success: false, 
            message: 'Failed to load products. Please refresh the page.' 
        });
    }
}

// function for list products with pagination
const listProductsPaginated = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1) * limit;
        
        // Filters
        const filter = {};
        if (req.query.category) filter.category = req.query.category;
        if (req.query.subCategory) filter.subCategory = req.query.subCategory;
        if (req.query.bestseller) filter.bestseller = req.query.bestseller === 'true';
        
        // Search (✅ Protection complète contre injection regex)
        if (req.query.search) {
            // Validation: longueur max et caractères autorisés
            const searchInput = String(req.query.search).trim();
            
            if (searchInput.length > 100) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Search term too long (max 100 characters)' 
                });
            }
            
            // Échapper TOUS les caractères spéciaux regex
            const searchTerm = searchInput.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            
            filter.$or = [
                { name: { $regex: searchTerm, $options: 'i' } },
                { description: { $regex: searchTerm, $options: 'i' } },
                { category: { $regex: searchTerm, $options: 'i' } },
                { subCategory: { $regex: searchTerm, $options: 'i' } }
            ];
        }
        
        // Sort
        let sort = {};
        if (req.query.sort === 'price-asc') sort.price = 1;
        else if (req.query.sort === 'price-desc') sort.price = -1;
        else if (req.query.sort === 'newest') sort.date = -1;
        else sort.date = -1; // default
        
        const products = await productModel.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean();
            
        const total = await productModel.countDocuments(filter);
        
        res.json({
            success: true,
            products,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        logger.error('PRODUCT', 'Error listing paginated products', { error: error.message });
        res.json({ success: false, message: error.message });
    }
}

// function for remove product
const removeProduct = async (req, res) => {
    try {
        const { id } = req.body;
        
        if (!id) {
            return res.json({ success: false, message: "Product ID is required" });
        }
        
        const product = await productModel.findByIdAndDelete(id);
        
        if (!product) {
            return res.json({ success: false, message: "Product not found" });
        }
        
        res.json({ success: true, message: "Product removed"})
    }
    catch (error) {
        logger.error('PRODUCT', 'Error removing product', { error: error.message });
        res.status(500).json({ 
            success: false, 
            message: 'Failed to remove product. Please try again.' 
        });
    }
}

// function for single product info
const singleProduct = async (req, res) => {
    try {
        const { productId } = req.body;
        
        if (!productId) {
            return res.json({success: false, message: "Product ID is required"});
        }
        
        const product = await productModel.findById(productId);
        
        if (!product) {
            return res.json({success: false, message: "Product not found"});
        }
        
        res.json({success: true, product})
    }
    catch (error){
        logger.error('PRODUCT', 'Error fetching product', { error: error.message });
        res.status(500).json({ 
            success: false, 
            message: 'Failed to load product details. Please try again.' 
        });
    }
}

// function for update product
const updateProduct = async (req, res) => {
    try {
        const { productId, id, name, description, price, category, subCategory, sizes, bestseller, stock } = req.body;
        
        // Accept both productId and id
        const prodId = productId || id;
        
        // Validation
        if (!prodId) {
            return res.status(400).json({ success: false, message: "Product ID is required" });
        }
        
        const product = await productModel.findById(prodId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        
        // Prepare update data
        const updateData = {};
        if (name) updateData.name = name;
        if (description) updateData.description = description;
        if (price) updateData.price = Number(price);
        if (category) updateData.category = category;
        if (subCategory) updateData.subCategory = subCategory;
        if (sizes) updateData.sizes = JSON.parse(sizes);
        if (bestseller !== undefined) updateData.bestseller = bestseller === "true";
        if (stock !== undefined) updateData.stock = Number(stock);
        
        // Handle image updates if provided
        if (req.files && Object.keys(req.files).length > 0) {
            const image1 = req.files.image1?.[0];
            const image2 = req.files.image2?.[0];
            const image3 = req.files.image3?.[0];
            const image4 = req.files.image4?.[0];

            const images = [image1, image2, image3, image4].filter((item) => item !== undefined);

            let imagesUrl = await Promise.all(
                images.map(async (item) => {
                    let result = await cloudinary.uploader.upload(item.path, {resource_type:'image'});
                    return result.secure_url;
                })
            );
            
            updateData.images = imagesUrl;
        }
        
        // Update product
        const updatedProduct = await productModel.findByIdAndUpdate(prodId, updateData, { new: true });
        res.json({ success: true, message: "Product updated successfully", product: updatedProduct });
        
    } catch (error) {
        logger.error('PRODUCT', 'Error updating product', { error: error.message });
        res.json({ success: false, message: error.message });
    }
}

// Add product review
const addReview = async (req, res) => {
    try {
        const { productId, rating, comment } = req.body;
        const userId = req.body.userId;

        logger.debug('PRODUCT', 'Add review request', { productId, rating, userId });

        if (!productId || !rating || !userId) {
            logger.warn('PRODUCT', 'Missing review fields', { productId: !!productId, rating: !!rating, userId: !!userId });
            return res.json({ success: false, message: "Missing required fields" });
        }

        if (rating < 1 || rating > 5) {
            return res.json({ success: false, message: "Rating must be between 1 and 5" });
        }

        const product = await productModel.findById(productId);
        if (!product) {
            logger.warn('PRODUCT', 'Product not found for review', { productId });
            return res.json({ success: false, message: "Product not found" });
        }

        // Check if user already reviewed
        const existingReview = product.reviews.find(r => r.userId.toString() === userId);
        if (existingReview) {
            return res.json({ success: false, message: "You already reviewed this product" });
        }

        // Get user info
        const userModel = (await import('../models/userModel.js')).default;
        const user = await userModel.findById(userId);

        logger.debug('PRODUCT', 'User found for review', { userName: user?.name });

        // Add review
        product.reviews.push({
            userId,
            userName: user?.name || 'Anonymous',
            rating: Number(rating),
            comment: comment || '',
            date: new Date()
        });

        // Update average rating
        const totalRating = product.reviews.reduce((sum, r) => sum + r.rating, 0);
        product.averageRating = totalRating / product.reviews.length;
        product.totalReviews = product.reviews.length;

        await product.save();

        res.json({ 
            success: true, 
            message: "Review added successfully",
            averageRating: product.averageRating,
            totalReviews: product.totalReviews
        });

    } catch (error) {
        logger.error('PRODUCT', 'Error adding review', { error: error.message });
        res.json({ success: false, message: error.message });
    }
};

// Get product reviews
const getReviews = async (req, res) => {
    try {
        const { productId } = req.body;

        const product = await productModel.findById(productId);
        if (!product) {
            return res.json({ success: false, message: "Product not found" });
        }

        res.json({ 
            success: true, 
            reviews: product.reviews.sort((a, b) => b.date - a.date),
            averageRating: product.averageRating,
            totalReviews: product.totalReviews
        });

    } catch (error) {
        logger.error('PRODUCT', 'Error fetching reviews', { error: error.message });
        res.json({ success: false, message: error.message });
    }
};

export { listProducts, addProduct, removeProduct, singleProduct, updateProduct, listProductsPaginated, addReview, getReviews }