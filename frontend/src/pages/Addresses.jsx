import React, { useState, useEffect, useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Chip,
  Radio,
  RadioGroup,
  FormControlLabel,
  Stack,
  Divider
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Home,
  Work,
  LocationOn,
  Phone,
  Person,
  CheckCircle
} from '@mui/icons-material';
import SEO from '../components/SEO';

const Addresses = () => {
  const { token, backendUrl, navigate } = useContext(ShopContext);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentAddressId, setCurrentAddressId] = useState(null);
  
  const [formData, setFormData] = useState({
    label: 'Home',
    firstName: '',
    lastName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
    isDefault: false
  });

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchAddresses();
  }, [token]);

  const fetchAddresses = async () => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/address/get`,
        {},
        { headers: { token } }
      );
      if (response.data.success) {
        setAddresses(response.data.addresses);
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load addresses');
      setLoading(false);
    }
  };

  const handleOpenDialog = (address = null) => {
    if (address) {
      setEditMode(true);
      setCurrentAddressId(address._id);
      setFormData({
        label: address.label,
        firstName: address.firstName,
        lastName: address.lastName,
        phone: address.phone,
        street: address.street,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
        country: address.country,
        isDefault: address.isDefault
      });
    } else {
      setEditMode(false);
      setCurrentAddressId(null);
      setFormData({
        label: 'Home',
        firstName: '',
        lastName: '',
        phone: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'USA',
        isDefault: addresses.length === 0
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditMode(false);
    setCurrentAddressId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const endpoint = editMode ? '/api/address/update' : '/api/address/add';
      const payload = editMode 
        ? { ...formData, addressId: currentAddressId }
        : formData;

      const response = await axios.post(
        `${backendUrl}${endpoint}`,
        payload,
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(editMode ? 'Address updated!' : 'Address added!');
        setAddresses(response.data.addresses);
        handleCloseDialog();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to save address');
    }
  };

  const handleDelete = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) {
      return;
    }

    try {
      const response = await axios.post(
        `${backendUrl}/api/address/delete`,
        { addressId },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success('Address deleted');
        setAddresses(response.data.addresses);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete address');
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/address/set-default`,
        { addressId },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success('Default address updated');
        setAddresses(response.data.addresses);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to update default address');
    }
  };

  const getLabelIcon = (label) => {
    switch (label) {
      case 'Home': return <Home />;
      case 'Work': return <Work />;
      default: return <LocationOn />;
    }
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
        title="My Addresses - Eternity Touch"
        description="Manage your shipping addresses"
      />
      
      <Container maxWidth="lg" sx={{ py: 8 }}>
        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
              My Addresses
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage your shipping addresses
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            sx={{
              bgcolor: 'black',
              '&:hover': { bgcolor: 'grey.800' }
            }}
          >
            Add New Address
          </Button>
        </Box>

        {/* Addresses Grid */}
        {addresses.length === 0 ? (
          <Card sx={{ textAlign: 'center', py: 8 }}>
            <CardContent>
              <LocationOn sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No addresses saved yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Add your first shipping address to make checkout faster
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleOpenDialog()}
                sx={{
                  bgcolor: 'black',
                  '&:hover': { bgcolor: 'grey.800' }
                }}
              >
                Add Address
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {addresses.map((address) => (
              <Grid item xs={12} md={6} key={address._id}>
                <Card 
                  sx={{ 
                    height: '100%',
                    border: address.isDefault ? '2px solid' : '1px solid',
                    borderColor: address.isDefault ? 'primary.main' : 'divider',
                    position: 'relative'
                  }}
                >
                  <CardContent>
                    {/* Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getLabelIcon(address.label)}
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {address.label}
                        </Typography>
                      </Box>
                      <Box>
                        <IconButton 
                          size="small" 
                          onClick={() => handleOpenDialog(address)}
                          sx={{ mr: 0.5 }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => handleDelete(address._id)}
                          disabled={address.isDefault && addresses.length === 1}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>

                    {/* Default Badge */}
                    {address.isDefault && (
                      <Chip
                        icon={<CheckCircle />}
                        label="Default"
                        size="small"
                        color="primary"
                        sx={{ mb: 2 }}
                      />
                    )}

                    <Divider sx={{ my: 2 }} />

                    {/* Address Details */}
                    <Stack spacing={1.5}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Person fontSize="small" color="action" />
                        <Typography variant="body2">
                          {address.firstName} {address.lastName}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Phone fontSize="small" color="action" />
                        <Typography variant="body2">{address.phone}</Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                        <LocationOn fontSize="small" color="action" sx={{ mt: 0.3 }} />
                        <Typography variant="body2">
                          {address.street}<br />
                          {address.city}, {address.state} {address.zipCode}<br />
                          {address.country}
                        </Typography>
                      </Box>
                    </Stack>

                    {/* Set as Default Button */}
                    {!address.isDefault && (
                      <Button
                        fullWidth
                        variant="outlined"
                        size="small"
                        onClick={() => handleSetDefault(address._id)}
                        sx={{ mt: 2 }}
                      >
                        Set as Default
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Add/Edit Dialog */}
        <Dialog 
          open={openDialog} 
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
        >
          <form onSubmit={handleSubmit}>
            <DialogTitle>
              {editMode ? 'Edit Address' : 'Add New Address'}
            </DialogTitle>
            <DialogContent>
              <Stack spacing={2.5} sx={{ mt: 1 }}>
                {/* Label */}
                <FormControl fullWidth>
                  <InputLabel>Address Label</InputLabel>
                  <Select
                    value={formData.label}
                    label="Address Label"
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  >
                    <MenuItem value="Home">Home</MenuItem>
                    <MenuItem value="Work">Work</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>

                {/* Name */}
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      required
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      required
                    />
                  </Grid>
                </Grid>

                {/* Phone */}
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />

                {/* Street */}
                <TextField
                  fullWidth
                  label="Street Address"
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  required
                  multiline
                  rows={2}
                />

                {/* City & State */}
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="City"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      required
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="State/Province"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      required
                    />
                  </Grid>
                </Grid>

                {/* Zip & Country */}
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Zip Code"
                      value={formData.zipCode}
                      onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                      required
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <FormControl fullWidth>
                      <InputLabel>Country</InputLabel>
                      <Select
                        value={formData.country}
                        label="Country"
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      >
                        <MenuItem value="USA">United States</MenuItem>
                        <MenuItem value="Canada">Canada</MenuItem>
                        <MenuItem value="UK">United Kingdom</MenuItem>
                        <MenuItem value="France">France</MenuItem>
                        <MenuItem value="Germany">Germany</MenuItem>
                        <MenuItem value="Morocco">Morocco</MenuItem>
                        <MenuItem value="Other">Other</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                {/* Set as Default */}
                <FormControlLabel
                  control={
                    <Radio
                      checked={formData.isDefault}
                      onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                    />
                  }
                  label="Set as default address"
                />
              </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="contained"
                sx={{
                  bgcolor: 'black',
                  '&:hover': { bgcolor: 'grey.800' }
                }}
              >
                {editMode ? 'Update' : 'Add'} Address
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Container>
    </>
  );
};

export default Addresses;
