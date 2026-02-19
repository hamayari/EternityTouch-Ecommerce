import React from 'react';
import LoadingState from './LoadingState';
import NetworkError from './NetworkError';
import { Box } from '@mui/material';

/**
 * Async Wrapper Component
 * Handles loading, error, and empty states automatically
 */
const AsyncWrapper = ({
  loading,
  error,
  data,
  onRetry,
  loadingType = 'spinner',
  loadingMessage = 'Loading...',
  emptyMessage = 'No data available',
  showEmpty = true,
  children,
  fullScreen = false
}) => {
  // Loading state
  if (loading) {
    return (
      <LoadingState
        type={loadingType}
        message={loadingMessage}
        fullScreen={fullScreen}
      />
    );
  }

  // Error state
  if (error) {
    return (
      <NetworkError
        message={error}
        onRetry={onRetry}
        fullScreen={fullScreen}
      />
    );
  }

  // Empty state
  if (showEmpty && (!data || (Array.isArray(data) && data.length === 0))) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: fullScreen ? '100vh' : '300px',
          textAlign: 'center',
          color: 'text.secondary',
          p: 4
        }}
      >
        <Box sx={{ fontSize: 60, mb: 2 }}>📦</Box>
        <p className="text-lg font-medium">{emptyMessage}</p>
      </Box>
    );
  }

  // Success state - render children
  return <>{children}</>;
};

export default AsyncWrapper;
