import { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import {
    Container,
    Grid,
    Card,
    CardContent,
    Typography,
    Box,
    LinearProgress,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField
} from '@mui/material';
import {
    EmojiEvents as TrophyIcon,
    Star as StarIcon,
    TrendingUp as TrendingUpIcon,
    LocalShipping as ShippingIcon,
    Discount as DiscountIcon
} from '@mui/icons-material';

const Loyalty = () => {
    const { token, backendUrl } = useContext(ShopContext);
    const [loyalty, setLoyalty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [redeemDialog, setRedeemDialog] = useState(false);
    const [pointsToRedeem, setPointsToRedeem] = useState('');

    const tierColors = {
        Bronze: '#CD7F32',
        Silver: '#C0C0C0',
        Gold: '#FFD700',
        Platinum: '#E5E4E2'
    };

    const tierIcons = {
        Bronze: '🥉',
        Silver: '🥈',
        Gold: '🥇',
        Platinum: '💎'
    };

    useEffect(() => {
        if (token) {
            fetchLoyalty();
        }
    }, [token]);

    const fetchLoyalty = async () => {
        try {
            const response = await axios.post(
                backendUrl + '/api/loyalty/get',
                {},
                { headers: { token } }
            );

            if (response.data.success) {
                setLoyalty(response.data.loyalty);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to load loyalty data');
        } finally {
            setLoading(false);
        }
    };

    const handleRedeem = async () => {
        const points = parseInt(pointsToRedeem);

        if (!points || points < 100) {
            toast.error('Minimum 100 points required');
            return;
        }

        if (points > loyalty.points) {
            toast.error('Insufficient points');
            return;
        }

        try {
            const response = await axios.post(
                backendUrl + '/api/loyalty/redeem',
                { points },
                { headers: { token } }
            );

            if (response.data.success) {
                toast.success(`Redeemed ${points} points for $${response.data.discount.toFixed(2)} discount!`);
                setRedeemDialog(false);
                setPointsToRedeem('');
                fetchLoyalty();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to redeem points');
        }
    };

    const getNextTier = () => {
        const tiers = ['Bronze', 'Silver', 'Gold', 'Platinum'];
        const currentIndex = tiers.indexOf(loyalty.tier);
        return currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : null;
    };

    const getPointsToNextTier = () => {
        const thresholds = { Bronze: 0, Silver: 2000, Gold: 5000, Platinum: 10000 };
        const nextTier = getNextTier();
        return nextTier ? thresholds[nextTier] - loyalty.totalEarned : 0;
    };

    const getTierProgress = () => {
        const thresholds = { Bronze: 0, Silver: 2000, Gold: 5000, Platinum: 10000 };
        const currentThreshold = thresholds[loyalty.tier];
        const nextTier = getNextTier();
        
        if (!nextTier) return 100;
        
        const nextThreshold = thresholds[nextTier];
        const progress = ((loyalty.totalEarned - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
        return Math.min(progress, 100);
    };

    if (loading) {
        return (
            <Container sx={{ py: 8 }}>
                <Typography>Loading...</Typography>
            </Container>
        );
    }

    if (!loyalty) {
        return (
            <Container sx={{ py: 8 }}>
                <Typography>No loyalty data available</Typography>
            </Container>
        );
    }

    return (
        <Container sx={{ py: 8 }}>
            <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
                💎 Loyalty Rewards
            </Typography>

            {/* Tier Card */}
            <Card sx={{ mb: 4, background: `linear-gradient(135deg, ${tierColors[loyalty.tier]}22 0%, ${tierColors[loyalty.tier]}44 100%)` }}>
                <CardContent>
                    <Grid container spacing={3} alignItems="center">
                        <Grid item xs={12} md={4}>
                            <Box textAlign="center">
                                <Typography variant="h1" sx={{ fontSize: '80px' }}>
                                    {tierIcons[loyalty.tier]}
                                </Typography>
                                <Typography variant="h4" sx={{ fontWeight: 'bold', color: tierColors[loyalty.tier] }}>
                                    {loyalty.tier} Tier
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={8}>
                            <Typography variant="h2" sx={{ fontWeight: 'bold', mb: 1 }}>
                                {loyalty.points.toLocaleString()} Points
                            </Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                                Total Earned: {loyalty.totalEarned.toLocaleString()} | Redeemed: {loyalty.totalRedeemed.toLocaleString()}
                            </Typography>
                            
                            {getNextTier() && (
                                <>
                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                        {getPointsToNextTier().toLocaleString()} points to {getNextTier()} tier
                                    </Typography>
                                    <LinearProgress 
                                        variant="determinate" 
                                        value={getTierProgress()} 
                                        sx={{ height: 10, borderRadius: 5 }}
                                    />
                                </>
                            )}
                            
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => setRedeemDialog(true)}
                                disabled={loyalty.points < 100}
                                sx={{ mt: 2 }}
                            >
                                Redeem Points
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Benefits */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={2}>
                                <TrendingUpIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                                <Typography variant="h6">Points Multiplier</Typography>
                            </Box>
                            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                {loyalty.benefits.multiplier}x
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Earn more points per dollar
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={2}>
                                <DiscountIcon sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                                <Typography variant="h6">Tier Discount</Typography>
                            </Box>
                            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                {loyalty.benefits.discount}%
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Extra discount on all orders
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={2}>
                                <ShippingIcon sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
                                <Typography variant="h6">Free Shipping</Typography>
                            </Box>
                            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                {loyalty.benefits.freeShipping ? 'Yes' : 'No'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {loyalty.benefits.freeShipping ? 'On all orders' : 'Upgrade to Gold tier'}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Transaction History */}
            <Card>
                <CardContent>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                        Transaction History
                    </Typography>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Description</TableCell>
                                    <TableCell>Type</TableCell>
                                    <TableCell align="right">Points</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loyalty.transactions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center">
                                            No transactions yet. Make a purchase to earn points!
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    loyalty.transactions.map((transaction, index) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                {new Date(transaction.date).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>{transaction.description}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={transaction.type}
                                                    color={transaction.type === 'earned' ? 'success' : 'warning'}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 'bold', color: transaction.type === 'earned' ? 'success.main' : 'error.main' }}>
                                                {transaction.type === 'earned' ? '+' : ''}{transaction.points}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>

            {/* Redeem Dialog */}
            <Dialog open={redeemDialog} onClose={() => setRedeemDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Redeem Points</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Available Points: {loyalty.points.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Conversion Rate: 100 points = $10 discount
                    </Typography>
                    <TextField
                        fullWidth
                        label="Points to Redeem"
                        type="number"
                        value={pointsToRedeem}
                        onChange={(e) => setPointsToRedeem(e.target.value)}
                        inputProps={{ min: 100, step: 100 }}
                        helperText={pointsToRedeem ? `You will get $${((parseInt(pointsToRedeem) / 100) * 10).toFixed(2)} discount` : 'Minimum 100 points'}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRedeemDialog(false)}>Cancel</Button>
                    <Button onClick={handleRedeem} variant="contained" color="primary">
                        Redeem
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default Loyalty;
