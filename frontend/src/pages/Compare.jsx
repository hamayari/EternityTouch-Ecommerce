import { useContext } from 'react';;
import { CompareContext } from '../context/CompareContext';
import { ShopContext } from '../context/ShopContext';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Chip,
    Rating
} from '@mui/material';
import { Close, ShoppingCart, CompareArrows } from '@mui/icons-material';
import { getDiscountedPrice } from '../utils/priceHelper';

const Compare = () => {
    const { compareItems, removeFromCompare, clearCompare } = useContext(CompareContext);
    const { currency, addToCart } = useContext(ShopContext);
    const navigate = useNavigate();

    if (compareItems.length === 0) {
        return (
            <Container sx={{ py: 8, textAlign: 'center' }}>
                <CompareArrows sx={{ fontSize: 80, color: '#ccc', mb: 2 }} />
                <Typography variant="h4" gutterBottom>
                    No Products to Compare
                </Typography>
                <Typography variant="body1" color="text.secondary" mb={3}>
                    Add products to comparison from the product pages
                </Typography>
                <Button
                    variant="contained"
                    onClick={() => navigate('/collection')}
                    sx={{ bgcolor: '#414141', '&:hover': { bgcolor: '#000' } }}
                >
                    Browse Products
                </Button>
            </Container>
        );
    }

    const handleAddToCart = (product) => {
        if (product.sizes && product.sizes.length > 0) {
            // If product has sizes, redirect to product page
            navigate(`/product/${product._id}`);
        } else {
            addToCart(product._id);
        }
    };

    return (
        <Container sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    Compare Products ({compareItems.length})
                </Typography>
                <Button
                    variant="outlined"
                    color="error"
                    onClick={clearCompare}
                    startIcon={<Close />}
                >
                    Clear All
                </Button>
            </Box>

            <TableContainer component={Paper} elevation={3}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                            <TableCell sx={{ fontWeight: 'bold', width: 200 }}>
                                Feature
                            </TableCell>
                            {compareItems.map((item) => (
                                <TableCell key={item._id} align="center" sx={{ minWidth: 250 }}>
                                    <Box sx={{ position: 'relative' }}>
                                        <IconButton
                                            size="small"
                                            onClick={() => removeFromCompare(item._id)}
                                            sx={{
                                                position: 'absolute',
                                                top: -10,
                                                right: -10,
                                                bgcolor: 'white',
                                                border: '1px solid #ddd',
                                                '&:hover': { bgcolor: '#f5f5f5' }
                                            }}
                                        >
                                            <Close fontSize="small" />
                                        </IconButton>
                                    </Box>
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {/* Product Image & Name */}
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Product</TableCell>
                            {compareItems.map((item) => (
                                <TableCell key={item._id} align="center">
                                    <Box
                                        sx={{
                                            cursor: 'pointer',
                                            '&:hover': { opacity: 0.8 }
                                        }}
                                        onClick={() => navigate(`/product/${item._id}`)}
                                    >
                                        <img
                                            src={item.images?.[0] || item.image?.[0]}
                                            alt={item.name}
                                            style={{
                                                width: '100%',
                                                maxWidth: 200,
                                                height: 200,
                                                objectFit: 'cover',
                                                borderRadius: 8,
                                                marginBottom: 8
                                            }}
                                        />
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                            {item.name}
                                        </Typography>
                                    </Box>
                                </TableCell>
                            ))}
                        </TableRow>

                        {/* Price */}
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Price</TableCell>
                            {compareItems.map((item) => (
                                <TableCell key={item._id} align="center">
                                    {item.discount > 0 ? (
                                        <Box>
                                            <Typography
                                                variant="h6"
                                                sx={{ color: 'error.main', fontWeight: 'bold' }}
                                            >
                                                {currency}{getDiscountedPrice(item.price, item.discount)}
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                sx={{ textDecoration: 'line-through', color: 'text.secondary' }}
                                            >
                                                {currency}{item.price}
                                            </Typography>
                                            <Chip
                                                label={`-${item.discount}%`}
                                                size="small"
                                                color="error"
                                                sx={{ mt: 0.5 }}
                                            />
                                        </Box>
                                    ) : (
                                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                            {currency}{item.price}
                                        </Typography>
                                    )}
                                </TableCell>
                            ))}
                        </TableRow>

                        {/* Rating */}
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Rating</TableCell>
                            {compareItems.map((item) => (
                                <TableCell key={item._id} align="center">
                                    <Rating
                                        value={item.averageRating || 0}
                                        precision={0.5}
                                        readOnly
                                        size="small"
                                    />
                                    <Typography variant="caption" display="block" color="text.secondary">
                                        ({item.totalReviews || 0} reviews)
                                    </Typography>
                                </TableCell>
                            ))}
                        </TableRow>

                        {/* Category */}
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                            {compareItems.map((item) => (
                                <TableCell key={item._id} align="center">
                                    <Chip label={item.category} size="small" />
                                    {item.subCategory && (
                                        <Chip
                                            label={item.subCategory}
                                            size="small"
                                            variant="outlined"
                                            sx={{ ml: 0.5 }}
                                        />
                                    )}
                                </TableCell>
                            ))}
                        </TableRow>

                        {/* Sizes */}
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Available Sizes</TableCell>
                            {compareItems.map((item) => (
                                <TableCell key={item._id} align="center">
                                    {item.sizes && item.sizes.length > 0 ? (
                                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center', flexWrap: 'wrap' }}>
                                            {item.sizes.map((size, idx) => (
                                                <Chip key={idx} label={size} size="small" />
                                            ))}
                                        </Box>
                                    ) : (
                                        <Typography variant="body2" color="text.secondary">
                                            One Size
                                        </Typography>
                                    )}
                                </TableCell>
                            ))}
                        </TableRow>

                        {/* Colors */}
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Available Colors</TableCell>
                            {compareItems.map((item) => (
                                <TableCell key={item._id} align="center">
                                    {item.colors && item.colors.length > 0 ? (
                                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center', flexWrap: 'wrap' }}>
                                            {item.colors.map((color, idx) => (
                                                <Chip key={idx} label={color} size="small" variant="outlined" />
                                            ))}
                                        </Box>
                                    ) : (
                                        <Typography variant="body2" color="text.secondary">
                                            N/A
                                        </Typography>
                                    )}
                                </TableCell>
                            ))}
                        </TableRow>

                        {/* Stock */}
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Availability</TableCell>
                            {compareItems.map((item) => (
                                <TableCell key={item._id} align="center">
                                    {item.stock > 0 ? (
                                        <Chip label="In Stock" color="success" size="small" />
                                    ) : (
                                        <Chip label="Out of Stock" color="error" size="small" />
                                    )}
                                </TableCell>
                            ))}
                        </TableRow>

                        {/* Bestseller */}
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Bestseller</TableCell>
                            {compareItems.map((item) => (
                                <TableCell key={item._id} align="center">
                                    {item.bestseller ? (
                                        <Chip label="⭐ Yes" color="warning" size="small" />
                                    ) : (
                                        <Typography variant="body2" color="text.secondary">
                                            No
                                        </Typography>
                                    )}
                                </TableCell>
                            ))}
                        </TableRow>

                        {/* Description */}
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                            {compareItems.map((item) => (
                                <TableCell key={item._id} align="center">
                                    <Typography variant="body2" sx={{ textAlign: 'left' }}>
                                        {item.description?.substring(0, 150)}
                                        {item.description?.length > 150 && '...'}
                                    </Typography>
                                </TableCell>
                            ))}
                        </TableRow>

                        {/* Action Buttons */}
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                            {compareItems.map((item) => (
                                <TableCell key={item._id} align="center">
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        <Button
                                            variant="contained"
                                            fullWidth
                                            startIcon={<ShoppingCart />}
                                            onClick={() => handleAddToCart(item)}
                                            disabled={item.stock === 0}
                                            sx={{ bgcolor: '#414141', '&:hover': { bgcolor: '#000' } }}
                                        >
                                            Add to Cart
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            fullWidth
                                            onClick={() => navigate(`/product/${item._id}`)}
                                        >
                                            View Details
                                        </Button>
                                    </Box>
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    );
};

export default Compare;
