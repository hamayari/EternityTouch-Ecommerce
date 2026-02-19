import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { backendUrl } from '../App';
import {
    Container,
    Grid,
    Card,
    CardContent,
    Typography,
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Tabs,
    Tab,
    Pagination
} from '@mui/material';
import {
    TrendingUp as TrendingUpIcon,
    People as PeopleIcon,
    Star as StarIcon,
    Redeem as RedeemIcon
} from '@mui/icons-material';

const Loyalty = ({ token }) => {
    const [stats, setStats] = useState(null);
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tierFilter, setTierFilter] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ total: 0, pages: 1 });

    const tierColors = {
        Bronze: '#CD7F32',
        Silver: '#C0C0C0',
        Gold: '#FFD700',
        Platinum: '#E5E4E2'
    };

    useEffect(() => {
        fetchStats();
        fetchAccounts();
    }, [tierFilter, page]);

    const fetchStats = async () => {
        try {
            const response = await axios.get(backendUrl + '/api/loyalty/stats', {
                headers: { token }
            });

            if (response.data.success) {
                setStats(response.data.stats);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to load statistics');
        }
    };

    const fetchAccounts = async () => {
        try {
            setLoading(true);
            const response = await axios.get(backendUrl + '/api/loyalty/all', {
                headers: { token },
                params: { tier: tierFilter, page, limit: 20 }
            });

            if (response.data.success) {
                setAccounts(response.data.accounts);
                setPagination(response.data.pagination);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to load accounts');
        } finally {
            setLoading(false);
        }
    };

    const handleTierChange = (event, newValue) => {
        setTierFilter(newValue);
        setPage(1);
    };

    if (!stats) {
        return (
            <Container sx={{ py: 4 }}>
                <Typography>Loading...</Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
                💎 Loyalty Program Management
            </Typography>

            {/* Statistics Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={2}>
                                <PeopleIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                                <Typography variant="h6">Total Members</Typography>
                            </Box>
                            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                {stats.totalAccounts.toLocaleString()}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={2}>
                                <TrendingUpIcon sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                                <Typography variant="h6">Points Issued</Typography>
                            </Box>
                            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                {stats.totalPointsIssued.toLocaleString()}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={2}>
                                <RedeemIcon sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
                                <Typography variant="h6">Points Redeemed</Typography>
                            </Box>
                            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                {stats.totalPointsRedeemed.toLocaleString()}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={2}>
                                <StarIcon sx={{ fontSize: 40, color: 'error.main', mr: 2 }} />
                                <Typography variant="h6">Active Points</Typography>
                            </Box>
                            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                {(stats.totalPointsIssued - stats.totalPointsRedeemed).toLocaleString()}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Tier Distribution */}
            <Card sx={{ mb: 4 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                        Tier Distribution
                    </Typography>
                    <Grid container spacing={2}>
                        {stats.tierDistribution.map((tier) => (
                            <Grid item xs={6} md={3} key={tier._id}>
                                <Box textAlign="center" p={2} sx={{ bgcolor: `${tierColors[tier._id]}22`, borderRadius: 2 }}>
                                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: tierColors[tier._id] }}>
                                        {tier._id}
                                    </Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                        {tier.count}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        members
                                    </Typography>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </CardContent>
            </Card>

            {/* Member List */}
            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                        Member Accounts
                    </Typography>

                    <Tabs value={tierFilter} onChange={handleTierChange} sx={{ mb: 3 }}>
                        <Tab label="All Tiers" value="" />
                        <Tab label="Bronze" value="Bronze" />
                        <Tab label="Silver" value="Silver" />
                        <Tab label="Gold" value="Gold" />
                        <Tab label="Platinum" value="Platinum" />
                    </Tabs>

                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Member</TableCell>
                                    <TableCell>Email</TableCell>
                                    <TableCell>Tier</TableCell>
                                    <TableCell align="right">Current Points</TableCell>
                                    <TableCell align="right">Total Earned</TableCell>
                                    <TableCell align="right">Total Redeemed</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">Loading...</TableCell>
                                    </TableRow>
                                ) : accounts.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">No accounts found</TableCell>
                                    </TableRow>
                                ) : (
                                    accounts.map((account) => (
                                        <TableRow key={account._id}>
                                            <TableCell>{account.userId?.name || 'Unknown'}</TableCell>
                                            <TableCell>{account.userId?.email || 'N/A'}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={account.tier}
                                                    sx={{
                                                        bgcolor: `${tierColors[account.tier]}44`,
                                                        color: tierColors[account.tier],
                                                        fontWeight: 'bold'
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                                {account.points.toLocaleString()}
                                            </TableCell>
                                            <TableCell align="right">
                                                {account.totalEarned.toLocaleString()}
                                            </TableCell>
                                            <TableCell align="right">
                                                {account.totalRedeemed.toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Box display="flex" justifyContent="center" mt={3}>
                        <Pagination
                            count={pagination.pages}
                            page={page}
                            onChange={(e, value) => setPage(value)}
                            color="primary"
                        />
                    </Box>
                </CardContent>
            </Card>
        </Container>
    );
};

export default Loyalty;
