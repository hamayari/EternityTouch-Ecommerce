import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  Stack,
  Divider,
  Avatar
} from '@mui/material';
import {
  AssignmentReturn,
  CheckCircle,
  Cancel,
  LocalShipping,
  Visibility
} from '@mui/icons-material';

const Returns = ({ token }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('all');
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [updateData, setUpdateData] = useState({
    status: '',
    adminNotes: '',
    trackingNumber: ''
  });

  useEffect(() => {
    fetchReturns();
  }, [selectedTab]);

  const fetchReturns = async () => {
    try {
      const statusFilter = selectedTab === 'all' ? '' : selectedTab;
      const response = await axios.get(
        `${backendUrl}/api/return/all?status=${statusFilter}`,
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

  const handleOpenDialog = (returnRequest) => {
    setSelectedReturn(returnRequest);
    setUpdateData({
      status: returnRequest.status,
      adminNotes: returnRequest.adminNotes || '',
      trackingNumber: returnRequest.trackingNumber || ''
    });
    setDialogOpen(true);
  };

  const handleUpdateStatus = async () => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/return/update-status`,
        {
          returnId: selectedReturn._id,
          ...updateData
        },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success('Return status updated');
        setDialogOpen(false);
        fetchReturns();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to update return');
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

  const getReturnCount = (status) => {
    if (status === 'all') return returns.length;
    return returns.filter(r => r.status === status).length;
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
          Returns Management
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage customer return requests and refunds
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" sx={{ fontWeight: 600, color: 'warning.main' }}>
                {returns.filter(r => r.status === 'Pending').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending Review
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" sx={{ fontWeight: 600, color: 'info.main' }}>
                {returns.filter(r => r.status === 'Approved').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Approved
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main' }}>
                {returns.filter(r => r.status === 'Received').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Items Received
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" sx={{ fontWeight: 600, color: 'success.main' }}>
                {returns.filter(r => r.status === 'Refunded').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Refunded
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs
          value={selectedTab}
          onChange={(e, newValue) => setSelectedTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label={`All (${getReturnCount('all')})`} value="all" />
          <Tab label={`Pending (${getReturnCount('Pending')})`} value="Pending" />
          <Tab label={`Approved (${getReturnCount('Approved')})`} value="Approved" />
          <Tab label={`Received (${getReturnCount('Received')})`} value="Received" />
          <Tab label={`Refunded (${getReturnCount('Refunded')})`} value="Refunded" />
          <Tab label={`Rejected (${getReturnCount('Rejected')})`} value="Rejected" />
        </Tabs>
      </Card>

      {/* Returns Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Return ID</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Order ID</TableCell>
              <TableCell>Items</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {returns.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  <Box sx={{ py: 4 }}>
                    <AssignmentReturn sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
                    <Typography color="text.secondary">
                      No return requests found
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              returns.map((returnRequest) => (
                <TableRow key={returnRequest._id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      #{returnRequest._id.slice(-8).toUpperCase()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 32, height: 32 }}>
                        {returnRequest.userId?.name?.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2">
                          {returnRequest.userId?.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {returnRequest.userId?.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      #{returnRequest.orderId?._id?.slice(-8).toUpperCase()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {returnRequest.items.length} item(s)
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {returnRequest.reason}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      ${returnRequest.refundAmount}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={returnRequest.status}
                      color={getStatusColor(returnRequest.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">
                      {new Date(returnRequest.createdAt).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      startIcon={<Visibility />}
                      onClick={() => handleOpenDialog(returnRequest)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Update Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        {selectedReturn && (
          <>
            <DialogTitle>
              Return Request #{selectedReturn._id.slice(-8).toUpperCase()}
            </DialogTitle>
            <DialogContent>
              <Stack spacing={3} sx={{ mt: 2 }}>
                {/* Customer Info */}
                <Box>
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                    Customer Information
                  </Typography>
                  <Typography variant="body2">
                    {selectedReturn.userId?.name} ({selectedReturn.userId?.email})
                  </Typography>
                </Box>

                <Divider />

                {/* Items */}
                <Box>
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                    Items to Return
                  </Typography>
                  <Grid container spacing={2}>
                    {selectedReturn.items.map((item, index) => (
                      <Grid item xs={12} sm={6} key={index}>
                        <Box sx={{ display: 'flex', gap: 2, p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                          <img 
                            src={item.image} 
                            alt={item.name}
                            style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4 }}
                          />
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {item.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Size: {item.size} | Qty: {item.quantity}
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              ${item.price}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>

                <Divider />

                {/* Reason */}
                <Box>
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                    Return Reason
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedReturn.reason}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {selectedReturn.description}
                  </Typography>
                </Box>

                <Divider />

                {/* Update Status */}
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={updateData.status}
                    label="Status"
                    onChange={(e) => setUpdateData({ ...updateData, status: e.target.value })}
                  >
                    <MenuItem value="Pending">Pending</MenuItem>
                    <MenuItem value="Approved">Approved</MenuItem>
                    <MenuItem value="Rejected">Rejected</MenuItem>
                    <MenuItem value="Picked Up">Picked Up</MenuItem>
                    <MenuItem value="Received">Received</MenuItem>
                    <MenuItem value="Refunded">Refunded</MenuItem>
                    <MenuItem value="Completed">Completed</MenuItem>
                  </Select>
                </FormControl>

                {/* Tracking Number */}
                <TextField
                  fullWidth
                  label="Return Tracking Number"
                  value={updateData.trackingNumber}
                  onChange={(e) => setUpdateData({ ...updateData, trackingNumber: e.target.value })}
                  placeholder="Enter tracking number for return shipment"
                />

                {/* Admin Notes */}
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Admin Notes"
                  value={updateData.adminNotes}
                  onChange={(e) => setUpdateData({ ...updateData, adminNotes: e.target.value })}
                  placeholder="Add notes for the customer..."
                />

                {/* Refund Info */}
                <Box sx={{ p: 2, bgcolor: 'success.lighter', borderRadius: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Refund Amount: ${selectedReturn.refundAmount}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Method: {selectedReturn.refundMethod}
                  </Typography>
                </Box>
              </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant="contained"
                onClick={handleUpdateStatus}
                sx={{
                  bgcolor: 'black',
                  '&:hover': { bgcolor: 'grey.800' }
                }}
              >
                Update Return
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default Returns;
