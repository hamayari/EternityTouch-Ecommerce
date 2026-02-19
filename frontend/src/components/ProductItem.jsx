import { useContext, useState, useEffect } from 'react';
import { ShopContext } from '../context/ShopContext';
import { CompareContext } from '../context/CompareContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { IconButton, Tooltip, Rating, Chip, Button } from '@mui/material';
import { Favorite, FavoriteBorder, Visibility, CompareArrows } from '@mui/icons-material';
import { getOptimizedImage } from '../utils/imageOptimizer';
import { getDiscountedPrice } from '../utils/priceHelper';
import CountdownTimer from './CountdownTimer';
import QuickView from './QuickView';
import LazyImage from './LazyImage';

const ProductItem = ({ id, image, name, price, stock, averageRating, totalReviews, discount, discountEndDate, images }) => {
  const { currency, backendUrl, token, products } = useContext(ShopContext); 
  const { addToCompare, isInCompare } = useContext(CompareContext);
  const [inWishlist, setInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  // Ensure `image` is an array and has at least one element
  const rawImage = Array.isArray(image) && image.length > 0 ? image[0] : "placeholder.jpg";
  const productImage = getOptimizedImage.card(rawImage);
  
  const isOutOfStock = stock !== undefined && stock === 0;
  const isLowStock = stock !== undefined && stock > 0 && stock <= 5;

  // Calculate discount
  const priceInfo = getDiscountedPrice({ price, discount, discountEndDate });

  // Get full product data for quick view
  const fullProduct = products?.find(p => p._id === id);

  // Check if product is in wishlist
  useEffect(() => {
    const checkWishlist = async () => {
      if (!token) return;
      try {
        const response = await axios.post(
          `${backendUrl}/api/wishlist/get`,
          {},
          { headers: { token } }
        );
        if (response.data.success) {
          setInWishlist(response.data.wishlist.includes(id));
        }
      } catch (error) {
        // Silent fail
      }
    };
    checkWishlist();
  }, [token, id, backendUrl]);

  const toggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!token) {
      toast.error('Please login to add to wishlist');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${backendUrl}/api/wishlist/toggle`,
        { productId: id },
        { headers: { token } }
      );

      if (response.data.success) {
        setInWishlist(response.data.inWishlist);
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error('Failed to update wishlist');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickViewOpen(true);
  };

  const handleCompare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const productData = fullProduct || {
      _id: id,
      name,
      price,
      images: image,
      image,
      stock,
      averageRating,
      totalReviews,
      discount,
      discountEndDate
    };
    
    addToCompare(productData);
  };

  return (
    <>
      <Link className='text-gray-700 cursor-pointer relative group' to={id ? `/product/${id}` : '#'}>
      <div className='overflow-hidden relative'>
        <LazyImage 
          className={`hover:scale-110 transition ease-in-out ${isOutOfStock ? 'opacity-50' : ''}`} 
          src={productImage} 
          alt={name || "Product"}
          placeholder="/placeholder.png"
        />
        
        {/* Sale Badge */}
        {priceInfo.hasDiscount && (
          <Chip
            label={`-${priceInfo.discountPercentage}%`}
            color="error"
            size="small"
            sx={{ 
              position: 'absolute', 
              top: 8, 
              left: 8,
              fontWeight: 'bold',
              fontSize: '0.75rem'
            }}
          />
        )}

        {/* Countdown Timer for Flash Sales */}
        {priceInfo.hasDiscount && priceInfo.discountEndDate && (
          <div className='absolute bottom-2 left-2 right-2'>
            <CountdownTimer endDate={priceInfo.discountEndDate} size="small" showLabel={false} />
          </div>
        )}
        
        {isOutOfStock && (
          <div className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-50'>
            <span className='text-white font-bold text-lg'>OUT OF STOCK</span>
          </div>
        )}

        {/* Quick View Button - Shows on hover */}
        <Button
          variant="contained"
          size="small"
          startIcon={<Visibility />}
          onClick={handleQuickView}
          sx={{
            position: 'absolute',
            bottom: 8,
            left: '50%',
            transform: 'translateX(-50%)',
            opacity: 0,
            transition: 'opacity 0.3s',
            '.group:hover &': {
              opacity: 1
            },
            bgcolor: 'white',
            color: 'black',
            '&:hover': {
              bgcolor: 'grey.100'
            },
            textTransform: 'none',
            fontWeight: 600
          }}
        >
          Quick View
        </Button>

        {/* Wishlist Heart Icon with MUI */}
        <Tooltip title={inWishlist ? "Remove from wishlist" : "Add to wishlist"} arrow>
          <IconButton
            onClick={toggleWishlist}
            disabled={loading}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              bgcolor: 'white',
              opacity: 0,
              transition: 'opacity 0.3s',
              '.group:hover &': {
                opacity: 1
              },
              '&:hover': {
                bgcolor: 'white',
                transform: 'scale(1.1)'
              }
            }}
          >
            {inWishlist ? (
              <Favorite sx={{ color: 'error.main' }} />
            ) : (
              <FavoriteBorder />
            )}
          </IconButton>
        </Tooltip>

        {/* Compare Button */}
        <Tooltip title={isInCompare(id) ? "In comparison" : "Add to compare"} arrow>
          <IconButton
            onClick={handleCompare}
            disabled={isInCompare(id)}
            sx={{
              position: 'absolute',
              top: 48,
              right: 8,
              bgcolor: 'white',
              opacity: 0,
              transition: 'opacity 0.3s',
              '.group:hover &': {
                opacity: 1
              },
              '&:hover': {
                bgcolor: 'white',
                transform: 'scale(1.1)'
              }
            }}
          >
            <CompareArrows sx={{ color: isInCompare(id) ? 'primary.main' : 'inherit' }} />
          </IconButton>
        </Tooltip>
      </div>
      <p className='pt-3 pb-1 text-sm'>{name || "No Name"}</p>
      <div className='flex items-center gap-1 mb-1'>
        <Rating value={averageRating || 0} precision={0.5} readOnly size="small" sx={{ fontSize: '1rem' }} />
        <span className='text-xs text-gray-500'>({totalReviews || 0})</span>
      </div>
      <div className='flex items-center gap-2'>
        {priceInfo.hasDiscount ? (
          <>
            <p className='text-sm font-medium text-red-600'>{currency}{priceInfo.finalPrice}</p>
            <p className='text-xs text-gray-400 line-through'>{currency}{priceInfo.originalPrice}</p>
          </>
        ) : (
          <p className='text-sm font-medium'>{currency ? currency + price : "Price Not Available"}</p>
        )}
      </div>
      {isLowStock && <p className='text-xs text-orange-500 font-medium'>Only {stock} left!</p>}
      {isOutOfStock && <p className='text-xs text-red-500 font-medium'>Out of stock</p>}
    </Link>

    {/* Quick View Modal */}
    <QuickView
      open={quickViewOpen}
      onClose={() => setQuickViewOpen(false)}
      product={fullProduct}
    />
    </>
  );
};

export default ProductItem;
