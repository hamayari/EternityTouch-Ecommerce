import { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import ProductItem from './ProductItem';
import axios from 'axios';

const ProductRecommendations = ({ 
    title, 
    type, 
    productId, 
    userId, 
    cartItems,
    limit = 6,
    backendUrl,
    currency 
}) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRecommendations();
    }, [type, productId, userId]);

    const fetchRecommendations = async () => {
        try {
            setLoading(true);
            let response;

            switch (type) {
                case 'similar':
                    response = await axios.get(`${backendUrl}/api/recommendations/similar/${productId}?limit=${limit}`);
                    break;
                
                case 'bought-together':
                    response = await axios.get(`${backendUrl}/api/recommendations/bought-together/${productId}?limit=${limit}`);
                    break;
                
                case 'personalized':
                    response = await axios.post(
                        `${backendUrl}/api/recommendations/personalized?limit=${limit}`,
                        { userId },
                        { headers: { token: localStorage.getItem('token') } }
                    );
                    break;
                
                case 'trending':
                    response = await axios.get(`${backendUrl}/api/recommendations/trending?limit=${limit}`);
                    break;
                
                case 'complete-look':
                    response = await axios.post(
                        `${backendUrl}/api/recommendations/complete-look?limit=${limit}`,
                        { cartItems }
                    );
                    break;
                
                case 'recent':
                    response = await axios.post(
                        `${backendUrl}/api/recommendations/recent?limit=${limit}`,
                        { userId },
                        { headers: { token: localStorage.getItem('token') } }
                    );
                    break;
                
                default:
                    return;
            }

            if (response.data.success) {
                setProducts(response.data.products);
            }
        } catch (error) {
            console.error('Error fetching recommendations:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress />
            </Box>
        );
    }

    if (products.length === 0) {
        return null;
    }

    const sliderSettings = {
        dots: true,
        infinite: products.length > 4,
        speed: 500,
        slidesToShow: Math.min(4, products.length),
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: Math.min(3, products.length),
                    slidesToScroll: 1,
                }
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: Math.min(2, products.length),
                    slidesToScroll: 1,
                }
            },
            {
                breakpoint: 480,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                }
            }
        ]
    };

    return (
        <Box sx={{ py: 4, px: { xs: 2, md: 4 } }}>
            <Typography 
                variant="h5" 
                fontWeight="bold" 
                mb={3}
                sx={{ 
                    textAlign: 'center',
                    position: 'relative',
                    '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: '-10px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '60px',
                        height: '3px',
                        background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: '2px'
                    }
                }}
            >
                {title}
            </Typography>

            <Box sx={{ mt: 4, '& .slick-slide': { px: 1 } }}>
                <Slider {...sliderSettings}>
                    {products.map((product) => (
                        <Box key={product._id} px={1}>
                            <ProductItem
                                id={product._id}
                                image={product.images}
                                name={product.name}
                                price={product.price}
                                currency={currency}
                            />
                        </Box>
                    ))}
                </Slider>
            </Box>
        </Box>
    );
};

export default ProductRecommendations;
