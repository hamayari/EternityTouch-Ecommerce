import React, { useState, useEffect } from 'react';
import { Box, Chip, Typography } from '@mui/material';
import { AccessTime } from '@mui/icons-material';
import { getTimeRemaining } from '../utils/priceHelper';

const CountdownTimer = ({ endDate, size = 'small', showLabel = true }) => {
  const [timeLeft, setTimeLeft] = useState(getTimeRemaining(endDate));

  useEffect(() => {
    if (!endDate) return;

    const timer = setInterval(() => {
      const remaining = getTimeRemaining(endDate);
      setTimeLeft(remaining);

      if (!remaining) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  if (!timeLeft) return null;

  const { days, hours, minutes, seconds } = timeLeft;

  // Compact version for product cards
  if (size === 'small') {
    return (
      <Chip
        icon={<AccessTime sx={{ fontSize: 14 }} />}
        label={
          days > 0
            ? `${days}d ${hours}h left`
            : `${hours}h ${minutes}m left`
        }
        size="small"
        sx={{
          bgcolor: '#ff4444',
          color: 'white',
          fontWeight: 600,
          fontSize: '0.7rem',
          '& .MuiChip-icon': {
            color: 'white'
          }
        }}
      />
    );
  }

  // Large version for product page
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 1,
        bgcolor: '#ff4444',
        color: 'white',
        px: 2,
        py: 1,
        borderRadius: 1
      }}
    >
      <AccessTime sx={{ fontSize: 20 }} />
      {showLabel && (
        <Typography variant="body2" sx={{ fontWeight: 600, mr: 1 }}>
          SALE ENDS IN:
        </Typography>
      )}
      <Box sx={{ display: 'flex', gap: 1 }}>
        {days > 0 && (
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1 }}>
              {String(days).padStart(2, '0')}
            </Typography>
            <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>
              DAYS
            </Typography>
          </Box>
        )}
        {days > 0 && <Typography variant="h6">:</Typography>}
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1 }}>
            {String(hours).padStart(2, '0')}
          </Typography>
          <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>
            HRS
          </Typography>
        </Box>
        <Typography variant="h6">:</Typography>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1 }}>
            {String(minutes).padStart(2, '0')}
          </Typography>
          <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>
            MIN
          </Typography>
        </Box>
        <Typography variant="h6">:</Typography>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1 }}>
            {String(seconds).padStart(2, '0')}
          </Typography>
          <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>
            SEC
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default CountdownTimer;
