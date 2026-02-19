import React, { useState, useEffect, useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  Grid,
  Stepper,
  Step,
  StepLabel,
  Divider,
  Stack
} from '@mui/material';
import {
  AssignmentReturn,
  CheckCircle,
  LocalShipping,
  AccountBalance,
  Cancel,
  Pending
} from '@mui/icons-material';
import SEO from '../components/SEO';

const Returns = () => {
  const { token, backendUrl, navigate } = useContext(ShopContext);
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchReturns();
  }, [token]);

  const fetchReturns = async () => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/return/user-returns`,
        {},
        { headers: { token } }
      );
      if (response.data.success) {
        setReturns(response.data.returns);
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load returns');
      setLoading(false);
    }
  };

  const handleCancelReturn = async (returnId) => {
    if (!window.confirm('Are you sure you want to cancel this return request?')) {
      return;
    }

    try {
      const response = await axios.post(
        `${backendUrl}/api/return/cancel`,
        { returnId },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success('Return request cancelled');
        fetchReturns();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to cancel return');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'warning';
      case 'Approved': return 'info';
      case 'Rejected': return 'error';
      case 'Picked Up': return 'primary';
      case 'Received': return 'secondary';
      case 'Refunded': return 'success';
      case 'Completed': return 'success';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending': return <Pending />;
      case 'Approved': return <CheckCircle />;
      case 'Rejected': return <Cancel />;
      case 'Picked Up': return <LocalShipping />;
      case 'Received': return <AssignmentReturn />;
      case 'Refunded': return <AccountBalance />;
      case 'Completed': return <CheckCircle />;
      default: return <Pending />;
    }
  };

  const getActiveStep = (status) => {
    const steps = ['Pending', 'Approved', 'Picked Up', 'Received', 'Refunded'];
    return steps.indexOf(status);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <>
      <SEO 
        title="My Returns - Eternity Touch"
        description="Track your return requests"
      />
      
      <Container maxWidth="lg" sx={{ py: 8 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
            My Returns & Refunds
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track and manage your return requests
          </Typography>
        </Box>

        {/* Returns List */}
        {returns.length === 0 ? (
          <Card sx={{ textAlign: 'center', py: 8 }}>
            <CardContent>
              <AssignmentReturn sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No return requests
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                You haven't requested any returns yet
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/orders')}
                sx={{
                  bgcolor: 'black',
                  '&:hover': { bgcolor: 'grey.800' }
                }}
              >
                View Orders
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Stack spacing={3}>
            {returns.map((returnRequest) => (
              <Card key={returnRequest._id} variant="outlined">
                <CardContent>
                  {/* Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                        Return Request #{returnRequest._id.slice(-8).toUpperCase()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Order #{returnRequest.orderId?._id?.slice(-8).toUpperCase()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Requested on {new Date(returnRequest.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </Typography>
                    </Box>
                    <Chip
                      icon={getStatusIcon(returnRequest.status)}
                      label={returnRequest.status}
                      color={getStatusColor(returnRequest.status)}
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Items */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                      Items to Return:
                    </Typography>
                    <Grid container spacing={2}>
                      {returnRequest.items.map((item, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                          <Box sx={{ display: 'flex', gap: 2, p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                            <img 
                              src={item.image} 
                              alt={item.name}
                              style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4 }}
                            />
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {item.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Size: {item.size} | Qty: {item.quantity}
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
                                ${item.price}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>

                  {/* Reason */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                      Reason:
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {returnRequest.reason}
                    </Typography>
                    {returnRequest.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {returnRequest.description}
                      </Typography>
                    )}
                  </Box>

                  {/* Refund Info */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 1, mb: 3 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Refund Amount
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        ${returnRequest.refundAmount}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" color="text.secondary">
                        Refund Method
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {returnRequest.refundMethod}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Progress Stepper */}
                  {returnRequest.status !== 'Rejected' && (
                    <Box sx={{ mb: 3 }}>
                      <Stepper activeStep={getActiveStep(returnRequest.status)} alternativeLabel>
                        <Step>
                          <StepLabel>Pending</StepLabel>
                        </Step>
                        <Step>
                          <StepLabel>Approved</StepLabel>
                        </Step>
                        <Step>
                          <StepLabel>Picked Up</StepLabel>
                        </Step>
                        <Step>
                          <StepLabel>Received</StepLabel>
                        </Step>
                        <Step>
                          <StepLabel>Refunded</StepLabel>
                        </Step>
                      </Stepper>
                    </Box>
                  )}

                  {/* Tracking Number */}
                  {returnRequest.trackingNumber && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Return Tracking Number:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {returnRequest.trackingNumber}
                      </Typography>
                    </Box>
                  )}

                  {/* Admin Notes */}
                  {returnRequest.adminNotes && (
                    <Box sx={{ p: 2, bgcolor: 'info.lighter', borderRadius: 1, mb: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                        Admin Notes:
                      </Typography>
                      <Typography variant="body2">
                        {returnRequest.adminNotes}
                      </Typography>
                    </Box>
                  )}

                  {/* Actions */}
                  {returnRequest.status === 'Pending' && (
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handleCancelReturn(returnRequest._id)}
                      >
                        Cancel Request
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </Container>
    </>
  );
};

export default Returns;
