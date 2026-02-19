import { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';
import RelatedProducts from '../components/RelatedProducts';
import ProductReviews from '../components/ProductReviews';
import ProductQA from '../components/ProductQA';
import RecentlyViewed from '../components/RecentlyViewed';
import CountdownTimer from '../components/CountdownTimer';
import SocialProof from '../components/SocialProof';
import SizeGuide from '../components/SizeGuide';
import ProductRecommendations from '../components/ProductRecommendations';
import { getOptimizedImage } from '../utils/imageOptimizer';
import { getDiscountedPrice } from '../utils/priceHelper';
import { Rating, Box, Chip } from '@mui/material';
import axios from 'axios';
import LazyImage from '../components/LazyImage';
import { toast } from 'react-toastify';

const Product = () => {
  const { productId } = useParams();
  const { products, currency, addToCart, backendUrl, token, navigate } = useContext(ShopContext);
  const [productData, setProductData] = useState(null);
  const [image, setImage] = useState('');
  const [size, setSize] = useState('');
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('description');

  const trackProductView = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const sessionId = localStorage.getItem('sessionId') || generateSessionId();
      
      await axios.post(`${backendUrl}/api/recommendations/track-view`, {
        userId,
        productId,
        sessionId
      });
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };

  const generateSessionId = () => {
    const sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('sessionId', sessionId);
    return sessionId;
  };

  const fetchProductData = async () => {
    const product = products.find((item) => item._id === productId);
    if (product) {
      setProductData(product);
      setImage(product.images[0]); // Assuming `image` is an array of URLs
      
      // Track recently viewed products
      const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
      const updatedViewed = [productId, ...viewed.filter(id => id !== productId)].slice(0, 10);
      localStorage.setItem('recentlyViewed', JSON.stringify(updatedViewed));

      // Track view for recommendations
      trackProductView();
    }
  };

  useEffect(() => {
    fetchProductData();
  }, [productId, products]);

  // Calculate price info with discount
  const priceInfo = productData ? getDiscountedPrice(productData) : null;

  return productData ? (
    <div className="border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100">
      {/* Flash Sale Banner */}
      {priceInfo.hasDiscount && priceInfo.discountEndDate && (
        <Box sx={{ mb: 3, p: 2, bgcolor: '#fff3cd', borderRadius: 1, border: '1px solid #ffc107' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Chip label="FLASH SALE" color="error" sx={{ fontWeight: 700 }} />
              <span className='text-lg font-semibold'>Save {priceInfo.discountPercentage}% on this product!</span>
            </Box>
            <CountdownTimer endDate={priceInfo.discountEndDate} size="large" />
          </Box>
        </Box>
      )}

      {/* Product Section */}
      <div className="flex flex-col sm:flex-row gap-12">
        {/* Left Section: Images */}
        <div className="flex-1 flex flex-col sm:flex-row gap-3">
          {/* Thumbnails */}
          <div className="flex sm:flex-col overflow-x-auto sm:overflow-y-auto sm:w-[20%] w-full gap-2">
            {productData.images.map((item, index) => (
              <LazyImage
                onClick={() => setImage(item)}
                src={getOptimizedImage.thumbnail(item)}
                key={index}
                className={`w-24 h-24 object-cover cursor-pointer border ${
                  image === item ? 'border-orange-500' : 'border-gray-200'
                }`}
                alt={`Thumbnail ${index + 1}`}
                placeholder="/placeholder.png"
              />
            ))}
          </div>
          {/* Main Image */}
          <div className="w-full sm:w-[80%]">
            <LazyImage 
              src={getOptimizedImage.detail(image)} 
              className="w-full h-auto border border-gray-200" 
              alt="Main Product"
              placeholder="/placeholder.png"
            />
          </div>
        </div>

        {/* Right Section: Product Details */}
        <div className="flex-1">
          <h1 className="font-medium text-2xl mt-2">{productData.name}</h1>
          <div className="flex items-center gap-2 mt-2">
            <Rating 
              value={productData.averageRating || 0} 
              precision={0.5} 
              readOnly 
              size="small"
            />
            <p className="text-sm text-gray-600">
              ({productData.totalReviews || 0} {productData.totalReviews === 1 ? 'review' : 'reviews'})
            </p>
          </div>

          {/* Social Proof */}
          <SocialProof 
            productId={productId}
            totalReviews={productData.totalReviews}
            averageRating={productData.averageRating}
            stock={productData.stock}
          />
          
          {/* Price Display with Discount */}
          <div className="mt-5">
            {priceInfo.hasDiscount ? (
              <div className="flex items-center gap-3">
                <p className="text-3xl font-medium text-red-600">
                  {currency}{priceInfo.finalPrice}
                </p>
                <p className="text-xl text-gray-400 line-through">
                  {currency}{priceInfo.originalPrice}
                </p>
                <Chip 
                  label={`-${priceInfo.discountPercentage}%`} 
                  color="error" 
                  size="small"
                  sx={{ fontWeight: 700 }}
                />
              </div>
            ) : (
              <p className="text-3xl font-medium">
                {currency}{productData.price}
              </p>
            )}
          </div>
          
          <p className="mt-5 text-gray-500">{productData.description}</p>
          
          {/* Stock Status */}
          {productData.stock !== undefined && (
            <div className="mt-4">
              {productData.stock === 0 ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 font-semibold">⚠️ Out of Stock</p>
                  <p className="text-sm text-red-500 mt-1">This product is currently unavailable</p>
                </div>
              ) : productData.stock <= 5 ? (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <p className="text-orange-600 font-semibold">⚡ Only {productData.stock} left in stock!</p>
                  <p className="text-sm text-orange-500 mt-1">Order soon before it's gone</p>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-green-600 font-semibold">✓ In Stock</p>
                  <p className="text-sm text-green-500 mt-1">Ready to ship</p>
                </div>
              )}
            </div>
          )}
          
          <div className="flex flex-col gap-4 my-8">
            <div className="flex items-center justify-between">
              <p>Select Size</p>
              <button
                onClick={() => setSizeGuideOpen(true)}
                className="text-sm text-blue-600 hover:underline flex items-center gap-1"
              >
                📏 Size Guide
              </button>
            </div>
            <div className="flex gap-2">
              {productData.sizes.map((item, index) => (
                <button
                  onClick={() => setSize(item)}
                  key={index}
                  disabled={productData.stock === 0}
                  className={`bg-gray-100 py-2 px-4 border ${
                    item === size ? 'border-orange-500' : ''
                  } ${productData.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          
          {productData.stock === 0 ? (
            <button 
              disabled 
              className="bg-gray-400 text-white px-8 py-3 text-sm cursor-not-allowed opacity-60"
            >
              OUT OF STOCK
            </button>
          ) : (
            <button onClick={()=> {
              if (!token) {
                toast.info('Please login to add items to cart');
                navigate('/login');
                return;
              }
              if (!size) {
                toast.warning('Please select a size');
                return;
              }
              addToCart(productData._id, size);
              toast.success('Added to cart!');
            }} className="bg-black text-white px-8 py-3 text-sm active:bg-gray-700">
              ADD TO CART
            </button>
          )}
          <hr className="mt-8 sm:w-4/5" />
          <div className="text-sm text-gray-500 mt-5 flex flex-col gap-1">
            <p>100% Original product.</p>
            <p>Cash on delivery is available on this product.</p>
            <p>Easy return & exchange policy within 7 days.</p>
          </div>
        </div>
      </div>

      {/* Description and Reviews */}
      <div className="mt-20">
        <div className="flex">
          <button 
            className={`border px-5 py-3 text-sm ${activeTab === 'description' ? 'font-bold' : ''}`}
            onClick={() => setActiveTab('description')}
          >
            Description
          </button>
          <button 
            className={`border px-5 py-3 text-sm ${activeTab === 'reviews' ? 'font-bold' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            Reviews ({productData.totalReviews || 0})
          </button>
        </div>
        
        {activeTab === 'description' ? (
          <div className="flex flex-col gap-4 border px-6 py-6 text-sm text-gray-500">
            <p>
              An e-commerce website is an online platform that facilitates the
              buying and selling of products or services over the internet. It
              serves as a virtual marketplace where businesses and individuals can
              showcase their products, interact with customers, and conduct
              transactions without the need for a physical presence. E-commerce
              websites have gained immense popularity due to their convenience,
              accessibility, and the global reach they offer.
            </p>
            <p>
              E-commerce websites typically display products or services along
              with detailed descriptions, images, prices, and any available
              variations (e.g., sizes, colors). Each product usually has its own
              dedicated page with relevant information.
            </p>
          </div>
        ) : (
          <div className="border px-6 py-6">
            <ProductReviews productId={productId} />
          </div>
        )}
      </div>

      {/* Q&A Section */}
      <ProductQA productId={productId} />

      {/* Frequently Bought Together */}
      <ProductRecommendations
        title="🛍️ Frequently Bought Together"
        type="bought-together"
        productId={productId}
        limit={3}
        backendUrl={backendUrl}
        currency={currency}
      />

      {/* You May Also Like */}
      <ProductRecommendations
        title="⭐ You May Also Like"
        type="similar"
        productId={productId}
        limit={6}
        backendUrl={backendUrl}
        currency={currency}
      />

      {/* Related Products Section */}
      <RelatedProducts
        category={productData.category}
        subCategory={productData.subCategory}
      />

      {/* Recently Viewed Section */}
      <RecentlyViewed currentProductId={productId} />

      {/* Size Guide Modal */}
      <SizeGuide
        open={sizeGuideOpen}
        onClose={() => setSizeGuideOpen(false)}
        category={productData.category}
      />
    </div>
  ) : (
    <div className="opacity-0"></div>
  );
};

export default Product;
