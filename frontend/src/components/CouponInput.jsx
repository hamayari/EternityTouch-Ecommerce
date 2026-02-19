import React, { useContext, useState } from 'react';
import axios from 'axios';
import { ShopContext } from '../context/ShopContext';
import { toast } from 'react-toastify';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  InputAdornment,
  CircularProgress,
  Chip
} from '@mui/material';
import {
  LocalOffer,
  CheckCircle
} from '@mui/icons-material';

const CouponInput = ({ onCouponApplied, appliedCoupon }) => {
  const [couponCode, setCouponCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { backendUrl, token, getCartAmount } = useContext(ShopContext);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    if (!token) {
      toast.error('Please login to use coupons');
      return;
    }

    setLoading(true);
    try {
      const cartTotal = getCartAmount();
      const response = await axios.post(
        `${backendUrl}/api/coupon/validate`,
        { code: couponCode, cartTotal },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        onCouponApplied(response.data.coupon);
        setCouponCode('');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error('Failed to apply coupon');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    onCouponApplied(null);
    toast.info('Coupon removed');
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <LocalOffer color="primary" />
        Apply Coupon
      </Typography>
      
      {appliedCoupon ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
          <Chip
            icon={<CheckCircle />}
            label={`${appliedCoupon.code} - Save $${appliedCoupon.discount}`}
            color="success"
            onDelete={handleRemoveCoupon}
            sx={{ fontSize: '1rem', py: 2.5 }}
          />
        </Box>
      ) : (
        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Enter coupon code"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            disabled={loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LocalOffer fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            onClick={handleApplyCoupon}
            disabled={loading || !couponCode.trim()}
            sx={{
              minWidth: 100,
              bgcolor: 'black',
              '&:hover': { bgcolor: 'grey.800' }
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Apply'}
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default CouponInput;
