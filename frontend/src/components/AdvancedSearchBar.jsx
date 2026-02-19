import { useState, useContext, useEffect, useCallback, useRef } from 'react';
import { ShopContext } from '../context/ShopContext';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Autocomplete,
    TextField,
    Box,
    Typography,
    Paper,
    InputAdornment,
    IconButton,
    Chip
} from '@mui/material';
import { Search, Close, History, TrendingUp } from '@mui/icons-material';

const AdvancedSearchBar = () => {
    const { products, showSearch, setShowSearch, setSearch } = useContext(ShopContext);
    const [searchValue, setSearchValue] = useState('');
    const [debouncedValue, setDebouncedValue] = useState(''); // ✅ FIX: Debounced value
    const [searchHistory, setSearchHistory] = useState([]);
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const debounceTimer = useRef(null); // ✅ FIX: Timer ref

    // Load search history from localStorage
    useEffect(() => {
        const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
        setSearchHistory(history);
    }, []);

    // ✅ FIX: Debounce search input (300ms delay)
    useEffect(() => {
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        debounceTimer.current = setTimeout(() => {
            setDebouncedValue(searchValue);
        }, 300);

        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    }, [searchValue]);

    // Only show on collection page
    const visible = location.pathname.includes('collection') && showSearch;

    // Filter products based on search (using debounced value)
    const getFilteredProducts = (query) => {
        if (!query || query.length < 2) return [];

        const lowerQuery = query.toLowerCase();
        return products
            .filter(product => 
                product.name.toLowerCase().includes(lowerQuery) ||
                product.category.toLowerCase().includes(lowerQuery) ||
                product.subCategory?.toLowerCase().includes(lowerQuery) ||
                product.description?.toLowerCase().includes(lowerQuery)
            )
            .slice(0, 8); // Limit to 8 results
    };

    const filteredProducts = getFilteredProducts(debouncedValue); // ✅ FIX: Use debounced value

    // Add to search history
    const addToHistory = (query) => {
        if (!query || query.length < 2) return;

        let history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
        
        // Remove if already exists
        history = history.filter(item => item !== query);
        
        // Add to beginning
        history.unshift(query);
        
        // Keep only last 10
        history = history.slice(0, 10);
        
        localStorage.setItem('searchHistory', JSON.stringify(history));
        setSearchHistory(history);
    };

    const handleSearch = (value) => {
        if (value && value.length >= 2) {
            setSearch(value);
            addToHistory(value);
            setOpen(false);
        }
    };

    const handleProductClick = (product) => {
        addToHistory(product.name);
        navigate(`/product/${product._id}`);
        setSearchValue('');
        setOpen(false);
    };

    const handleHistoryClick = (query) => {
        setSearchValue(query);
        setSearch(query);
        setOpen(false);
    };

    const clearHistory = () => {
        localStorage.removeItem('searchHistory');
        setSearchHistory([]);
    };

    if (!visible) return null;

    return (
        <Box sx={{ bgcolor: '#f9f9f9', borderTop: '1px solid #ddd', borderBottom: '1px solid #ddd', py: 2 }}>
            <Box sx={{ maxWidth: 800, mx: 'auto', px: 2 }}>
                <Autocomplete
                    freeSolo
                    open={open && (filteredProducts.length > 0 || (searchHistory.length > 0 && searchValue.length < 2))}
                    onOpen={() => setOpen(true)}
                    onClose={() => setOpen(false)}
                    value={searchValue}
                    onInputChange={(event, newValue) => {
                        setSearchValue(newValue);
                        // ✅ FIX: Open dropdown immediately but filter with debounce
                        if (newValue.length >= 2 || (newValue.length === 0 && searchHistory.length > 0)) {
                            setOpen(true);
                        }
                    }}
                    onChange={(event, newValue) => {
                        if (typeof newValue === 'string') {
                            handleSearch(newValue);
                        }
                    }}
                    options={[]}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            placeholder="Search products, categories..."
                            variant="outlined"
                            size="small"
                            InputProps={{
                                ...params.InputProps,
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        {searchValue && (
                                            <IconButton
                                                size="small"
                                                onClick={() => {
                                                    setSearchValue('');
                                                    setSearch('');
                                                }}
                                            >
                                                <Close fontSize="small" />
                                            </IconButton>
                                        )}
                                        <IconButton
                                            size="small"
                                            onClick={() => setShowSearch(false)}
                                        >
                                            <Close fontSize="small" />
                                        </IconButton>
                                    </InputAdornment>
                                ),
                                sx: {
                                    bgcolor: 'white',
                                    borderRadius: 2,
                                    '& fieldset': {
                                        borderColor: '#ddd'
                                    }
                                }
                            }}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    handleSearch(searchValue);
                                }
                            }}
                        />
                    )}
                    PaperComponent={({ children }) => (
                        <Paper elevation={3} sx={{ mt: 1, maxHeight: 400, overflow: 'auto' }}>
                            {/* Search Results */}
                            {filteredProducts.length > 0 && (
                                <Box>
                                    <Box sx={{ px: 2, py: 1, bgcolor: '#f5f5f5', display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <TrendingUp fontSize="small" color="primary" />
                                        <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                                            PRODUCTS ({filteredProducts.length})
                                        </Typography>
                                    </Box>
                                    {filteredProducts.map((product) => (
                                        <Box
                                            key={product._id}
                                            onClick={() => handleProductClick(product)}
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 2,
                                                p: 1.5,
                                                cursor: 'pointer',
                                                '&:hover': {
                                                    bgcolor: '#f5f5f5'
                                                },
                                                borderBottom: '1px solid #f0f0f0'
                                            }}
                                        >
                                            <img
                                                src={product.images?.[0] || product.image?.[0]}
                                                alt={product.name}
                                                style={{
                                                    width: 50,
                                                    height: 50,
                                                    objectFit: 'cover',
                                                    borderRadius: 4
                                                }}
                                            />
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                    {product.name}
                                                </Typography>
                                                <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                                                    <Chip label={product.category} size="small" sx={{ height: 18, fontSize: '0.7rem' }} />
                                                    {product.subCategory && (
                                                        <Chip label={product.subCategory} size="small" variant="outlined" sx={{ height: 18, fontSize: '0.7rem' }} />
                                                    )}
                                                </Box>
                                            </Box>
                                            <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                                ${product.price}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>
                            )}

                            {/* Search History */}
                            {searchHistory.length > 0 && searchValue.length < 2 && (
                                <Box>
                                    <Box sx={{ px: 2, py: 1, bgcolor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <History fontSize="small" color="action" />
                                            <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                                                RECENT SEARCHES
                                            </Typography>
                                        </Box>
                                        <Typography
                                            variant="caption"
                                            sx={{ color: 'primary.main', cursor: 'pointer' }}
                                            onClick={clearHistory}
                                        >
                                            Clear
                                        </Typography>
                                    </Box>
                                    {searchHistory.map((query, index) => (
                                        <Box
                                            key={index}
                                            onClick={() => handleHistoryClick(query)}
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1,
                                                px: 2,
                                                py: 1,
                                                cursor: 'pointer',
                                                '&:hover': {
                                                    bgcolor: '#f5f5f5'
                                                }
                                            }}
                                        >
                                            <History fontSize="small" color="action" />
                                            <Typography variant="body2">{query}</Typography>
                                        </Box>
                                    ))}
                                </Box>
                            )}

                            {/* No Results */}
                            {searchValue.length >= 2 && filteredProducts.length === 0 && (
                                <Box sx={{ p: 3, textAlign: 'center' }}>
                                    <Typography variant="body2" color="text.secondary">
                                        No products found for "{searchValue}"
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Try different keywords
                                    </Typography>
                                </Box>
                            )}
                        </Paper>
                    )}
                />
            </Box>
        </Box>
    );
};

export default AdvancedSearchBar;
