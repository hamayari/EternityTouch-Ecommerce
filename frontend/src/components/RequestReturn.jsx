import React, { useState, useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  RadioGroup,
  Radio,
  Stack,
  Chip
} from '@mui/material';
import { AssignmentReturn } from '@mui/icons-material';

const RequestReturn = ({ order, open, onClose, onSuccess }) => {
  const { token, backendUrl } = useContext(ShopContext);
  const [selectedItems, setSelectedItems] = useState([]);
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [refundMethod, setRefundMethod] = useState('Original Payment');
  const [submitting, setSubmitting] = useState(false);

  const reasons = [
    'Wrong Size',
    'Wrong Item',
    'Defective/Damaged',
    'Not as Described',
    'Changed Mind',
    'Quality Issues',
    'Other'
  ];

  const handleItemToggle = (item) => {
    const isSelected = selectedItems.find(i => i._id === item._id && i.size === item.size);
    if (isSelected) {
      setSelectedItems(selectedItems.filter(i => !(i._id === item._id && i.size === item.size)));
    } else {
      setSelectedItems([...selectedItems, {
        productId: item._id,
        name: item.name,
        image: item.image[0],
        size: item.size,
        quantity: item.quantity,
        price: item.price
      }]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedItems.length === 0) {
      toast.error('Please select at least one item to return');
      return;
    }

    if (!reason) {
      toast.error('Please select a reason');
      return;
    }

    if (!description.trim()) {
      toast.error('Please provide a description');
      return;
    }

    setSubmitting(true);
    try {
      const response = await axios.post(
        `${backendUrl}/api/return/create`,
        {
          orderId: order._id,
          items: selectedItems,
          reason,
          description,
          refundMethod
        },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success('Return request submitted successfully');
        onSuccess();
        onClose();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to submit return request');
    } finally {
      setSubmitting(false);
    }
  };

  const calculateRefund = () => {
    return selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AssignmentReturn />
            <Typography variant="h6">Request Return</Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {/* Order Info */}
            <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Order #{order._id.slice(-8).toUpperCase()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Delivered on {new Date(order.date).toLocaleDateString()}
              </Typography>
            </Box>

            {/* Select Items */}
            <Box>
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                Select items to return:
              </Typography>
              <Stack spacing={1}>
                {order.items.map((item, index) => {
                  const isSelected = selectedItems.find(i => i._id === item._id && i.size === item.size);
                  return (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        p: 1.5,
                        border: '1px solid',
                        borderColor: isSelected ? 'primary.main' : 'divider',
                        borderRadius: 1,
                        cursor: 'pointer',
                        bgcolor: isSelected ? 'primary.lighter' : 'transparent',
                        '&:hover': { borderColor: 'primary.main' }
                      }}
                      onClick={() => handleItemToggle(item)}
                    >
                      <Checkbox
                        checked={!!isSelected}
                        onChange={() => handleItemToggle(item)}
                      />
                      <img 
                        src={item.image[0]} 
                        alt={item.name}
                        style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {item.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Size: {item.size} | Qty: {item.quantity}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        ${item.price * item.quantity}
                      </Typography>
                    </Box>
                  );
                })}
              </Stack>
            </Box>

            {/* Reason */}
            <FormControl fullWidth required>
              <InputLabel>Reason for Return</InputLabel>
              <Select
                value={reason}
                label="Reason for Return"
                onChange={(e) => setReason(e.target.value)}
              >
                {reasons.map((r) => (
                  <MenuItem key={r} value={r}>{r}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Description */}
            <TextField
              fullWidth
              required
              multiline
              rows={4}
              label="Detailed Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please provide details about why you're returning these items..."
              helperText="Be as specific as possible to help us process your return faster"
            />

            {/* Refund Method */}
            <Box>
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                Refund Method:
              </Typography>
              <RadioGroup
                value={refundMethod}
                onChange={(e) => setRefundMethod(e.target.value)}
              >
                <FormControlLabel 
                  value="Original Payment" 
                  control={<Radio />} 
                  label="Refund to original payment method" 
                />
                <FormControlLabel 
                  value="Store Credit" 
                  control={<Radio />} 
                  label="Store credit (10% bonus)" 
                />
                <FormControlLabel 
                  value="Exchange" 
                  control={<Radio />} 
                  label="Exchange for another item" 
                />
              </RadioGroup>
            </Box>

            {/* Refund Summary */}
            {selectedItems.length > 0 && (
              <Box sx={{ p: 2, bgcolor: 'success.lighter', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Estimated Refund:
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'success.main' }}>
                    ${calculateRefund()}
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {selectedItems.length} item(s) selected
                </Typography>
              </Box>
            )}

            {/* Return Policy */}
            <Box sx={{ p: 2, bgcolor: 'info.lighter', borderRadius: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                Return Policy:
              </Typography>
              <Typography variant="caption" color="text.secondary">
                • Returns accepted within 30 days of delivery<br />
                • Items must be unused and in original packaging<br />
                • Refund processed within 5-10 business days after receiving items<br />
                • Return shipping is free for defective items
              </Typography>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained"
            disabled={submitting || selectedItems.length === 0}
            sx={{
              bgcolor: 'black',
              '&:hover': { bgcolor: 'grey.800' }
            }}
          >
            {submitting ? 'Submitting...' : 'Submit Return Request'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default RequestReturn;
