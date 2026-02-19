import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Button, Chip, TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import axios from 'axios';
import { toast } from 'react-toastify';
import { backendUrl } from '../App';

const Stock = ({ token }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(backendUrl + '/api/product/list');
      if (response.data.success) {
        setProducts(response.data.products);
      }
    } catch (error) {
      toast.error('Error fetching products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleStockUpdate = async (id, newStock) => {
    try {
      const response = await axios.post(
        backendUrl + '/api/product/update',
        { id, stock: newStock },
        { headers: { token } }
      );
      if (response.data.success) {
        // Update local state immediately for instant UI feedback
        setProducts(prevProducts => 
          prevProducts.map(product => 
            product._id === id ? { ...product, stock: newStock } : product
          )
        );
        toast.success('Stock updated successfully');
      }
    } catch (error) {
      toast.error('Error updating stock');
      console.error(error);
    }
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { label: 'Out of Stock', color: 'error', icon: <ErrorIcon /> };
    if (stock <= 5) return { label: 'Low Stock', color: 'warning', icon: <WarningIcon /> };
    return { label: 'In Stock', color: 'success', icon: <CheckCircleIcon /> };
  };

  const columns = [
    {
      field: 'image',
      headerName: 'Image',
      width: 100,
      renderCell: (params) => (
        <img
          src={params.row.images?.[0]}
          alt={params.row.name}
          style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }}
        />
      ),
    },
    {
      field: 'name',
      headerName: 'Product Name',
      width: 250,
      filterable: true,
    },
    {
      field: 'category',
      headerName: 'Category',
      width: 150,
    },
    {
      field: 'price',
      headerName: 'Price',
      width: 100,
      renderCell: (params) => `$${params.value}`,
    },
    {
      field: 'stock',
      headerName: 'Stock',
      width: 120,
      editable: true,
      type: 'number',
      renderCell: (params) => (
        <Box sx={{ fontWeight: 'bold', fontSize: 16 }}>
          {params.value || 0}
        </Box>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 150,
      renderCell: (params) => {
        const stock = params.row.stock || 0;
        const status = getStockStatus(stock);
        return (
          <Chip
            icon={status.icon}
            label={status.label}
            color={status.color}
            size="small"
          />
        );
      },
    },
    {
      field: 'actions',
      headerName: 'Quick Actions',
      width: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            size="small"
            variant="outlined"
            onClick={() => handleStockUpdate(params.row._id, (params.row.stock || 0) + 10)}
          >
            +10
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="error"
            onClick={() => handleStockUpdate(params.row._id, Math.max(0, (params.row.stock || 0) - 10))}
          >
            -10
          </Button>
        </Box>
      ),
    },
  ];

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const rows = filteredProducts.map((product) => ({
    id: product._id,
    ...product,
  }));

  const handleCellEditCommit = (params) => {
    handleStockUpdate(params.id, params.value);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>Stock Management</h1>
        <TextField
          placeholder="Search products..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ width: 300 }}
        />
      </Box>

      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 5, page: 0 },
            },
          }}
          pageSizeOptions={[5, 10, 25, 50]}
          checkboxSelection
          disableSelectionOnClick
          onCellEditCommit={handleCellEditCommit}
          sx={{
            '& .MuiDataGrid-cell:hover': {
              color: 'primary.main',
            },
          }}
        />
      </Box>

      <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
        <Chip
          icon={<CheckCircleIcon />}
          label={`In Stock: ${products.filter(p => (p.stock || 0) > 5).length}`}
          color="success"
        />
        <Chip
          icon={<WarningIcon />}
          label={`Low Stock: ${products.filter(p => (p.stock || 0) > 0 && (p.stock || 0) <= 5).length}`}
          color="warning"
        />
        <Chip
          icon={<ErrorIcon />}
          label={`Out of Stock: ${products.filter(p => (p.stock || 0) === 0).length}`}
          color="error"
        />
      </Box>
    </Box>
  );
};

export default Stock;
