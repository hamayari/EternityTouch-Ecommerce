import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: { type: String, required: true},
    price: { type: Number, required: true},
    description: { type: String, required: true },
    images: { type: [String], required: true },
    category: { type: String, required: true },
    subCategory: { type: String, required: true },
    sizes: { type: Array, required: true },
    bestseller : { type: Boolean},
    date: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    // Discount system
    discount: { type: Number, default: 0 }, // Percentage discount (0-100)
    discountEndDate: { type: Date }, // When discount expires
    // Reviews & Ratings
    reviews: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
        userName: { type: String },
        rating: { type: Number, min: 1, max: 5, required: true },
        comment: { type: String },
        date: { type: Date, default: Date.now }
    }],
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 }
})

const productModel =mongoose.models.product || mongoose.model("product", productSchema);

export default productModel;