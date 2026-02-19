import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from './Title';
import ProductItem from './ProductItem';
import { Box, Typography } from '@mui/material';
import { History } from '@mui/icons-material';

const RecentlyViewed = ({ currentProductId }) => {
  const { products } = useContext(ShopContext);
  const [recentProducts, setRecentProducts] = useState([]);

  useEffect(() => {
    // Get recently viewed from localStorage
    const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    
    // Filter out current product and get product details
    const recentProductsData = viewed
      .filter(id => id !== currentProductId)
      .slice(0, 5) // Show max 5 products
      .map(id => products.find(p => p._id === id))
      .filter(Boolean); // Remove undefined products

    setRecentProducts(recentProductsData);
  }, [products, currentProductId]);

  if (recentProducts.length === 0) {
    return null;
  }

  return (
    <div className="my-24">
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <History sx={{ color: '#666' }} />
        <div className="text-center text-3xl">
          <Title text1={'RECENTLY'} text2={'VIEWED'} />
        </div>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
        Products you've recently looked at
      </Typography>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6">
        {recentProducts.map((item, index) => (
          <ProductItem
            key={index}
            id={item._id}
            name={item.name}
            price={item.price}
            images={item.images}
            discount={item.discount}
            discountEndDate={item.discountEndDate}
            averageRating={item.averageRating}
            totalReviews={item.totalReviews}
          />
        ))}
      </div>
    </div>
  );
};

export default RecentlyViewed;
