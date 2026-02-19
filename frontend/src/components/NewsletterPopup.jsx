import { useState, useEffect, useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
    Dialog,
    DialogContent,
    IconButton,
    Box,
    Typography,
    TextField,
    Button,
    CircularProgress
} from '@mui/material';
import { Close, Email, LocalOffer } from '@mui/icons-material';

const NewsletterPopup = () => {
    const { backendUrl } = useContext(ShopContext);
    const [open, setOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [discountCode, setDiscountCode] = useState('');
    const [subscribed, setSubscribed] = useState(false);

    useEffect(() => {
        // Check if user already saw the popup
        const hasSeenPopup = localStorage.getItem('newsletterPopupSeen');
        const hasSubscribed = localStorage.getItem('newsletterSubscribed');

        if (!hasSeenPopup && !hasSubscribed) {
            // Show popup after 5 seconds or on scroll
            const timer = setTimeout(() => {
                setOpen(true);
                localStorage.setItem('newsletterPopupSeen', 'true');
            }, 5000);

            const handleScroll = () => {
                if (window.scrollY > 300 && !hasSeenPopup) {
                    setOpen(true);
                    localStorage.setItem('newsletterPopupSeen', 'true');
                    window.removeEventListener('scroll', handleScroll);
                }
            };

            window.addEventListener('scroll', handleScroll);

            return () => {
                clearTimeout(timer);
                window.removeEventListener('scroll', handleScroll);
            };
        }
    }, []);

    const handleSubscribe = async (e) => {
        e.preventDefault();

        if (!email) {
            toast.error('Please enter your email');
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.error('Please enter a valid email');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(
                `${backendUrl}/api/newsletter/subscribe`,
                { email }
            );

            if (response.data.success) {
                setDiscountCode(response.data.discountCode);
                setSubscribed(true);
                localStorage.setItem('newsletterSubscribed', 'true');
                toast.success(response.data.message);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to subscribe. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    overflow: 'hidden'
                }
            }}
        >
            <IconButton
                onClick={handleClose}
                sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    zIndex: 1,
                    bgcolor: 'white',
                    '&:hover': { bgcolor: 'grey.100' }
                }}
            >
                <Close />
            </IconButton>

            <DialogContent sx={{ p: 0 }}>
                {!subscribed ? (
                    <Box>
                        {/* Header with gradient */}
                        <Box
                            sx={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                p: 4,
                                textAlign: 'center'
                            }}
                        >
                            <LocalOffer sx={{ fontSize: 60, mb: 2 }} />
                            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                                Get 10% OFF
                            </Typography>
                            <Typography variant="body1">
                                Subscribe to our newsletter and receive an exclusive discount code!
                            </Typography>
                        </Box>

                        {/* Form */}
                        <Box sx={{ p: 4 }}>
                            <form onSubmit={handleSubscribe}>
                                <TextField
                                    fullWidth
                                    type="email"
                                    label="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={loading}
                                    InputProps={{
                                        startAdornment: <Email sx={{ mr: 1, color: 'grey.500' }} />
                                    }}
                                    sx={{ mb: 2 }}
                                />
                                <Button
                                    type="submit"
                                    variant="contained"
                                    fullWidth
                                    size="large"
                                    disabled={loading}
                                    sx={{
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        py: 1.5,
                                        fontSize: '1rem',
                                        fontWeight: 'bold',
                                        textTransform: 'none',
                                        '&:hover': {
                                            background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)'
                                        }
                                    }}
                                >
                                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Get My 10% OFF'}
                                </Button>
                            </form>

                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ display: 'block', textAlign: 'center', mt: 2 }}
                            >
                                🎁 Plus exclusive deals, new arrivals & style tips
                            </Typography>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ display: 'block', textAlign: 'center', mt: 1 }}
                            >
                                No spam, unsubscribe anytime
                            </Typography>
                        </Box>
                    </Box>
                ) : (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                        <Box
                            sx={{
                                width: 80,
                                height: 80,
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mx: 'auto',
                                mb: 3
                            }}
                        >
                            <Typography variant="h3">🎉</Typography>
                        </Box>
                        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
                            Welcome to Eternity Touch!
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                            Check your email for your exclusive discount code
                        </Typography>
                        <Box
                            sx={{
                                bgcolor: '#f5f5f5',
                                p: 3,
                                borderRadius: 2,
                                mb: 3
                            }}
                        >
                            <Typography variant="caption" color="text.secondary">
                                Your Discount Code
                            </Typography>
                            <Typography
                                variant="h4"
                                sx={{
                                    fontWeight: 'bold',
                                    color: '#667eea',
                                    mt: 1,
                                    letterSpacing: 2
                                }}
                            >
                                {discountCode}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                10% OFF on orders over $50
                            </Typography>
                        </Box>
                        <Button
                            variant="contained"
                            fullWidth
                            onClick={handleClose}
                            sx={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                py: 1.5,
                                fontWeight: 'bold',
                                textTransform: 'none'
                            }}
                        >
                            Start Shopping
                        </Button>
                    </Box>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default NewsletterPopup;
