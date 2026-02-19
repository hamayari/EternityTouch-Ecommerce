import React from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';
import { WifiOff, Refresh } from '@mui/icons-material';

/**
 * Network Error Fallback Component
 * Displays when network requests fail
 */
const NetworkError = ({ 
  onRetry, 
  message = "Unable to connect to the server",
  showRetry = true,
  fullScreen = false 
}) => {
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  const content = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        p: 4,
        minHeight: fullScreen ? '100vh' : '400px'
      }}
    >
      <WifiOff sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
      
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
        Connection Problem
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 400 }}>
        {message}. Please check your internet connection and try again.
      </Typography>

      {showRetry && (
        <Button
          variant="contained"
          startIcon={<Refresh />}
          onClick={handleRetry}
          sx={{
            bgcolor: 'black',
            '&:hover': {
              bgcolor: 'grey.800'
            }
          }}
        >
          Try Again
        </Button>
      )}

      <Typography variant="caption" color="text.secondary" sx={{ mt: 3 }}>
        If the problem persists, please contact support
      </Typography>
    </Box>
  );

  if (fullScreen) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Paper elevation={3} sx={{ maxWidth: 500, width: '90%' }}>
          {content}
        </Paper>
      </Box>
    );
  }

  return content;
};

export default NetworkError;
