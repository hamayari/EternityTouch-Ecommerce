import React from 'react';
import { Box, CircularProgress, Typography, Skeleton } from '@mui/material';

/**
 * Loading State Component
 * Displays loading indicators for different scenarios
 */
const LoadingState = ({ 
  type = 'spinner', // 'spinner', 'skeleton', 'dots'
  message = 'Loading...',
  fullScreen = false,
  count = 3 // For skeleton type
}) => {
  // Spinner Loading
  if (type === 'spinner') {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: fullScreen ? '100vh' : '300px',
          gap: 2
        }}
      >
        <CircularProgress size={50} sx={{ color: 'black' }} />
        {message && (
          <Typography variant="body2" color="text.secondary">
            {message}
          </Typography>
        )}
      </Box>
    );
  }

  // Skeleton Loading (for product cards)
  if (type === 'skeleton') {
    return (
      <Box sx={{ width: '100%' }}>
        {Array.from({ length: count }).map((_, index) => (
          <Box key={index} sx={{ mb: 2 }}>
            <Skeleton variant="rectangular" height={200} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="80%" />
            <Skeleton variant="text" width="60%" />
          </Box>
        ))}
      </Box>
    );
  }

  // Dots Loading
  if (type === 'dots') {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: fullScreen ? '100vh' : '200px',
          gap: 1
        }}
      >
        <Box
          sx={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            bgcolor: 'black',
            animation: 'bounce 1.4s infinite ease-in-out both',
            animationDelay: '-0.32s',
            '@keyframes bounce': {
              '0%, 80%, 100%': {
                transform: 'scale(0)',
              },
              '40%': {
                transform: 'scale(1)',
              },
            },
          }}
        />
        <Box
          sx={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            bgcolor: 'black',
            animation: 'bounce 1.4s infinite ease-in-out both',
            animationDelay: '-0.16s',
            '@keyframes bounce': {
              '0%, 80%, 100%': {
                transform: 'scale(0)',
              },
              '40%': {
                transform: 'scale(1)',
              },
            },
          }}
        />
        <Box
          sx={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            bgcolor: 'black',
            animation: 'bounce 1.4s infinite ease-in-out both',
            '@keyframes bounce': {
              '0%, 80%, 100%': {
                transform: 'scale(0)',
              },
              '40%': {
                transform: 'scale(1)',
              },
            },
          }}
        />
      </Box>
    );
  }

  return null;
};

// Product Card Skeleton
export const ProductCardSkeleton = ({ count = 5 }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6">
      {Array.from({ length: count }).map((_, index) => (
        <Box key={index}>
          <Skeleton variant="rectangular" height={250} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="90%" />
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="40%" />
        </Box>
      ))}
    </div>
  );
};

// Order Card Skeleton
export const OrderCardSkeleton = ({ count = 3 }) => {
  return (
    <Box>
      {Array.from({ length: count }).map((_, index) => (
        <Box key={index} sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Skeleton variant="rectangular" width={80} height={80} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="70%" />
              <Skeleton variant="text" width="50%" />
              <Skeleton variant="text" width="40%" />
            </Box>
          </Box>
          <Skeleton variant="rectangular" height={40} />
        </Box>
      ))}
    </Box>
  );
};

export default LoadingState;
