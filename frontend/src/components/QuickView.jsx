import { useState, useContext } from 'react';
import {
  Dialog,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Button,
  Rating,
  Chip,
  Grid
} from '@mui/material';
import { Close, ShoppingCart, Favorite, FavoriteBorder } from '@mui/icons-material';
import { ShopContext } from '../context/ShopContext';
import { getOptimizedImage } from '../utils/imageOptimizer';
import { getDiscountedPrice } from '../utils/priceHelper';
import { useNavigate } from 'react-router-dom';
import CountdownTimer from './CountdownTimer';
import { showToast } from '../utils/toast';

const QuickView = ({ open, onClose, product }) => {
  const { currency, addToCart, addToWishlist, removeFromWishlist, wishlist } = useContext(ShopContext);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const navigate = useNavigate();

  if (!product) return null;

  const priceInfo = getDiscountedPrice(product);
  const isInWishlist = wishlist?.includes(product._id);

  const handleAddToCart = () => {
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      showToast.warning('Please select a size');
      return;
    }
    addToCart(product._id, selectedSize);
    showToast.success('Added to cart');
    onClose();
  };

  const handleWishlistToggle = () => {
    if (isInWishlist) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist(product._id);
    }
  };

  const handleViewDetails = () => {
    navigate(`/product/${product._id}`);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '90vh'
        }
      }}
    >
      <IconButton
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          zIndex: 1,
          bgcolor: 'white',
          '&:hover': { bgcolor: 'grey.100' }
        }}
      >
        <Close />
      </IconButton>

      <DialogContent sx={{ p: 0 }}>
        <Grid container>
          {/* Left: Images */}
          <Grid item xs={12} md={6} sx={{ p: 3, bgcolor: 'grey.50' }}>
            {/* Flash Sale Banner */}
            {priceInfo.hasDiscount && priceInfo.discountEndDate && (
              <Box sx={{ mb: 2 }}>
                <CountdownTimer endDate={priceInfo.discountEndDate} size="small" />
              </Box>
            )}

            {/* Main Image */}
            <Box
              sx={{
                width: '100%',
                height: 400,
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'white',
                borderRadius: 1,
                overflow: 'hidden'
              }}
            >
              <img
                src={getOptimizedImage.detail(product.images[selectedImage])}
                alt={product.name}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain'
                }}
              />
            </Box>

            {/* Thumbnails */}
            <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto' }}>
              {product.images.map((img, index) => (
                <Box
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  sx={{
                    width: 60,
                    height: 60,
                    flexShrink: 0,
                    cursor: 'pointer',
                    border: selectedImage === index ? '2px solid' : '1px solid',
                    borderColor: selectedImage === index ? 'primary.main' : 'grey.300',
                    borderRadius: 1,
                    overflow: 'hidden',
                    '&:hover': {
                      borderColor: 'primary.main'
                    }
                  }}
                >
                  <img
                    src={getOptimizedImage.thumbnail(img)}
                    alt={`Thumbnail ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </Box>
              ))}
            </Box>
          </Grid>

          {/* Right: Details */}
          <Grid item xs={12} md={6} sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
              {product.name}
            </Typography>

            {/* Rating */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Rating value={product.averageRating || 0} precision={0.5} readOnly size="small" />
              <Typography variant="body2" color="text.secondary">
                ({product.totalReviews || 0} reviews)
              </Typography>
            </Box>

            {/* Price */}
            <Box sx={{ mb: 2 }}>
              {priceInfo.hasDiscount ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="h4" color="error" sx={{ fontWeight: 700 }}>
                    {currency}{priceInfo.finalPrice}
                  </Typography>
                  <Typography variant="h6" sx={{ textDecoration: 'line-through', color: 'text.secondary' }}>
                    {currency}{priceInfo.originalPrice}
                  </Typography>
                  <Chip label={`-${priceInfo.discountPercentage}%`} color="error" size="small" />
                </Box>
              ) : (
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {currency}{product.price}
                </Typography>
              )}
            </Box>

            {/* Description */}
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {product.description?.substring(0, 150)}
              {product.description?.length > 150 && '...'}
            </Typography>

            {/* Stock Status */}
            {product.stock !== undefined && (
              <Box sx={{ mb: 2 }}>
                {product.stock > 0 ? (
                  <Chip
                    label={`${product.stock} in stock`}
                    color="success"
                    size="small"
                    variant="outlined"
                  />
                ) : (
                  <Chip label="Out of stock" color="error" size="small" variant="outlined" />
                )}
              </Box>
            )}

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                  Select Size:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {product.sizes.map((size) => (
                    <Button
                      key={size}
                      variant={selectedSize === size ? 'contained' : 'outlined'}
                      size="small"
                      onClick={() => setSelectedSize(size)}
                      sx={{ minWidth: 50 }}
                    >
                      {size}
                    </Button>
                  ))}
                </Box>
              </Box>
            )}

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Button
                variant="contained"
                fullWidth
                startIcon={<ShoppingCart />}
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                sx={{
                  py: 1.5,
                  bgcolor: 'black',
                  '&:hover': { bgcolor: 'grey.800' }
                }}
              >
                Add to Cart
              </Button>
              <IconButton
                onClick={handleWishlistToggle}
                sx={{
                  border: '1px solid',
                  borderColor: 'grey.300',
                  borderRadius: 1
                }}
              >
                {isInWishlist ? (
                  <Favorite sx={{ color: 'red' }} />
                ) : (
                  <FavoriteBorder />
                )}
              </IconButton>
            </Box>

            {/* View Full Details */}
            <Button
              variant="text"
              fullWidth
              onClick={handleViewDetails}
              sx={{ textTransform: 'none' }}
            >
              View Full Details →
            </Button>

            {/* Additional Info */}
            <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid', borderColor: 'grey.200' }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                ✓ 100% Original product
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                ✓ Cash on delivery available
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                ✓ Easy return & exchange within 7 days
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default QuickView;
