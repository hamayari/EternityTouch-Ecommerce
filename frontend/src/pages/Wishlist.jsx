import React, { useContext, useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShopContext } from '../context/ShopContext';
import SEO from '../components/SEO';
import { getOptimizedImage } from '../utils/imageOptimizer';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Button,
  Box,
  Chip,
  Skeleton,
  Alert
} from '@mui/material';
import {
  Favorite,
  ShoppingCart,
  Delete,
  FavoriteBorder
} from '@mui/icons-material';

const Wishlist = () => {
  const { backendUrl, token, navigate, currency } = useContext(ShopContext);
  const queryClient = useQueryClient();

  const fetchWishlist = async () => {
    if (!token) {
      navigate('/login');
      return { products: [] };
    }

    const response = await axios.post(
      `${backendUrl}/api/wishlist/get`,
      {},
      { headers: { token } }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return response.data;
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['wishlist', token],
    queryFn: fetchWishlist,
    enabled: !!token,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const wishlistProducts = data?.products || [];

  const removeMutation = useMutation({
    mutationFn: async (productId) => {
      const response = await axios.post(
        `${backendUrl}/api/wishlist/remove`,
        { productId },
        { headers: { token } }
      );
      if (!response.data.success) {
        throw new Error(response.data.message);
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['wishlist']);
      toast.success('Removed from wishlist');
    },
    onError: () => {
      toast.error('Failed to remove from wishlist');
    }
  });

  const removeFromWishlist = (productId) => {
    removeMutation.mutate(productId);
  };

  const handleAddToCart = (product) => {
    if (product.sizes && product.sizes.length > 0) {
      // Navigate to product page to select size
      navigate(`/product/${product._id}`);
    } else {
      toast.info('Please select a size on the product page');
      navigate(`/product/${product._id}`);
    }
  };

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Alert severity="error">Failed to load wishlist. Please try again.</Alert>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <SEO 
          title="My Wishlist"
          description="View and manage your favorite products"
          keywords="wishlist, favorites, saved products"
        />
        <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 600 }}>
          My Wishlist
        </Typography>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item}>
              <Card>
                <Skeleton variant="rectangular" height={300} />
                <CardContent>
                  <Skeleton />
                  <Skeleton width="60%" />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <SEO 
        title="My Wishlist"
        description="View and manage your favorite products"
        keywords="wishlist, favorites, saved products"
      />
      
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Favorite sx={{ color: 'error.main', fontSize: 32 }} />
            My Wishlist
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {wishlistProducts.length} {wishlistProducts.length === 1 ? 'item' : 'items'} saved
          </Typography>
        </Box>
        {wishlistProducts.length > 0 && (
          <Button
            variant="outlined"
            onClick={() => navigate('/collection')}
            sx={{ textTransform: 'none' }}
          >
            Continue Shopping
          </Button>
        )}
      </Box>

      {wishlistProducts.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <FavoriteBorder sx={{ fontSize: 100, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 500 }}>
            Your wishlist is empty
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Save your favorite items here to buy them later
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/collection')}
            sx={{ 
              textTransform: 'none',
              bgcolor: 'black',
              '&:hover': { bgcolor: 'grey.800' }
            }}
          >
            Start Shopping
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {wishlistProducts.map((product) => (
            <Grid item xs={12} sm={6} md={3} key={product._id}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  }
                }}
              >
                <Box sx={{ position: 'relative' }}>
                  <CardMedia
                    component="img"
                    height="300"
                    image={getOptimizedImage.card(product.images[0])}
                    alt={product.name}
                    sx={{ 
                      objectFit: 'cover',
                      cursor: 'pointer'
                    }}
                    onClick={() => navigate(`/product/${product._id}`)}
                  />
                  {product.stock === 0 && (
                    <Chip
                      label="Out of Stock"
                      color="error"
                      size="small"
                      sx={{ position: 'absolute', top: 8, left: 8 }}
                    />
                  )}
                  {product.stock > 0 && product.stock <= 5 && (
                    <Chip
                      label={`Only ${product.stock} left`}
                      color="warning"
                      size="small"
                      sx={{ position: 'absolute', top: 8, left: 8 }}
                    />
                  )}
                  <IconButton
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      bgcolor: 'white',
                      '&:hover': { bgcolor: 'grey.100' }
                    }}
                    onClick={() => removeFromWishlist(product._id)}
                  >
                    <Delete color="error" />
                  </IconButton>
                </Box>
                
                <CardContent sx={{ flexGrow: 1, cursor: 'pointer' }} onClick={() => navigate(`/product/${product._id}`)}>
                  <Typography 
                    variant="subtitle1" 
                    gutterBottom 
                    sx={{ 
                      fontWeight: 500,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}
                  >
                    {product.name}
                  </Typography>
                  <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
                    {currency}{product.price}
                  </Typography>
                  <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {product.sizes?.slice(0, 3).map((size, idx) => (
                      <Chip key={idx} label={size} size="small" variant="outlined" />
                    ))}
                    {product.sizes?.length > 3 && (
                      <Chip label={`+${product.sizes.length - 3}`} size="small" variant="outlined" />
                    )}
                  </Box>
                </CardContent>

                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<ShoppingCart />}
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock === 0}
                    sx={{
                      textTransform: 'none',
                      bgcolor: 'black',
                      '&:hover': { bgcolor: 'grey.800' }
                    }}
                  >
                    {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Wishlist;
