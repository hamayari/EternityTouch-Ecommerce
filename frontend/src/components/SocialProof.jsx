import { useState, useEffect } from 'react';
import { Box, Chip, Typography } from '@mui/material';
import { Visibility, ShoppingCart, Star, TrendingUp } from '@mui/icons-material';

const SocialProof = ({ productId, totalReviews, averageRating, stock }) => {
  const [viewersCount, setViewersCount] = useState(0);
  const [soldToday, setSoldToday] = useState(0);
  const [recentActivity, setRecentActivity] = useState(null);

  useEffect(() => {
    // Simulate real-time viewers (random between 2-15)
    const updateViewers = () => {
      const count = Math.floor(Math.random() * 14) + 2;
      setViewersCount(count);
    };

    // Simulate sold today (based on product popularity)
    const calculateSoldToday = () => {
      // More popular products (higher rating, more reviews) = more sales
      const popularity = (averageRating || 0) * (totalReviews || 0);
      const baseSales = Math.floor(popularity / 2);
      const randomSales = Math.floor(Math.random() * 5);
      setSoldToday(Math.min(baseSales + randomSales, 50)); // Max 50 per day
    };

    // Simulate recent activity
    const showRecentActivity = () => {
      const activities = [
        { type: 'purchase', text: 'Someone just purchased this item', icon: <ShoppingCart sx={{ fontSize: 16 }} /> },
        { type: 'review', text: 'New 5-star review added', icon: <Star sx={{ fontSize: 16 }} /> },
        { type: 'trending', text: 'Trending in your area', icon: <TrendingUp sx={{ fontSize: 16 }} /> }
      ];
      
      const randomActivity = activities[Math.floor(Math.random() * activities.length)];
      setRecentActivity(randomActivity);
      
      // Hide after 5 seconds
      setTimeout(() => setRecentActivity(null), 5000);
    };

    updateViewers();
    calculateSoldToday();
    
    // Update viewers every 10-30 seconds
    const viewersInterval = setInterval(updateViewers, Math.random() * 20000 + 10000);
    
    // Show random activity every 15-45 seconds
    const activityInterval = setInterval(showRecentActivity, Math.random() * 30000 + 15000);

    return () => {
      clearInterval(viewersInterval);
      clearInterval(activityInterval);
    };
  }, [productId, averageRating, totalReviews]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, my: 2 }}>
      {/* Viewers Count */}
      {viewersCount > 0 && (
        <Chip
          icon={<Visibility sx={{ fontSize: 18 }} />}
          label={`${viewersCount} ${viewersCount === 1 ? 'person is' : 'people are'} viewing this product`}
          size="small"
          sx={{
            bgcolor: '#fff3cd',
            color: '#856404',
            fontWeight: 500,
            '& .MuiChip-icon': {
              color: '#856404'
            },
            animation: 'pulse 2s infinite'
          }}
        />
      )}

      {/* Sold Today */}
      {soldToday > 0 && (
        <Chip
          icon={<ShoppingCart sx={{ fontSize: 18 }} />}
          label={`${soldToday} sold today`}
          size="small"
          color="success"
          variant="outlined"
          sx={{
            fontWeight: 500,
            borderWidth: 2
          }}
        />
      )}

      {/* Low Stock Warning */}
      {stock !== undefined && stock > 0 && stock <= 5 && (
        <Chip
          label={`Only ${stock} left in stock - Order soon!`}
          size="small"
          sx={{
            bgcolor: '#f8d7da',
            color: '#721c24',
            fontWeight: 600
          }}
        />
      )}

      {/* Recent Activity Notification */}
      {recentActivity && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            p: 1,
            bgcolor: '#d1ecf1',
            color: '#0c5460',
            borderRadius: 1,
            fontSize: '0.875rem',
            fontWeight: 500,
            animation: 'slideIn 0.3s ease-out'
          }}
        >
          {recentActivity.icon}
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {recentActivity.text}
          </Typography>
        </Box>
      )}

      <style>
        {`
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.7;
            }
          }
          
          @keyframes slideIn {
            from {
              transform: translateY(-10px);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
        `}
      </style>
    </Box>
  );
};

export default SocialProof;
