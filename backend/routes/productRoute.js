import express from 'express';
import { listProducts, addProduct, removeProduct, singleProduct, updateProduct, listProductsPaginated, addReview, getReviews } from '../controllers/productController.js';
import upload from '../middleware/multer.js';
import adminAuth from '../middleware/adminAuth.js';
import authUser from '../middleware/auth.js';
import { reviewLimiter } from '../middleware/rateLimiter.js';

const productRouter = express.Router();

productRouter.post('/add', adminAuth, upload.fields([{name:'image1', maxCount:1}, {name:'image2', maxCount:1}, {name:'image3', maxCount:1}, {name:'image4', maxCount:1}]), addProduct);
productRouter.post('/update', adminAuth, upload.fields([{name:'image1', maxCount:1}, {name:'image2', maxCount:1}, {name:'image3', maxCount:1}, {name:'image4', maxCount:1}]), updateProduct);
productRouter.get('/list', listProducts);
productRouter.get('/list-paginated', listProductsPaginated);
productRouter.post('/single', singleProduct);
productRouter.post('/remove', adminAuth, removeProduct);
productRouter.post('/add-review', authUser, reviewLimiter, addReview); // ✅ Rate limiting ajouté
productRouter.post('/get-reviews', getReviews);

export default productRouter;