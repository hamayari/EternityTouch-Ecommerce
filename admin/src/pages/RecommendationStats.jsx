import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Avatar
} from '@mui/material';
import {
  Visibility,
  ShoppingBag,
  People,
  TrendingUp
} from '@mui/icons-material';

const RecommendationStats = ({ token }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${backendUrl}/api/recommendations/stats`, {
        headers: { token }
      });
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color }) => (
    <Card sx={{ height: '100%', background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)` }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div" fontWeight="bold">
              {value}
            </Typography>
          </Box>
          <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box p={3}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (!stats) {
    return (
      <Box p={3}>
        <Typography>No data available</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box mb={3}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          🎯 Recommendation System Statistics
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Track product views and recommendation performance
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Views"
            value={stats.totalViews.toLocaleString()}
            icon={<Visibility />}
            color="#2196f3"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Unique Products"
            value={stats.uniqueProducts}
            icon={<ShoppingBag />}
            color="#4caf50"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Unique Users"
            value={stats.uniqueUsers}
            icon={<People />}
            color="#ff9800"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Recent Views (7 days)"
            value={stats.recentViews.toLocaleString()}
            icon={<TrendingUp />}
            color="#9c27b0"
          />
        </Grid>
      </Grid>

      <Box mt={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📊 Recommendation Types
            </Typography>
            <Box mt={2}>
              <Typography variant="body2" color="textSecondary" paragraph>
                <strong>Similar Products:</strong> Based on category, price, and attributes
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                <strong>Frequently Bought Together:</strong> Based on order history and co-occurrence
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                <strong>Personalized:</strong> Based on user browsing and purchase history
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                <strong>Trending:</strong> Most viewed and purchased products in last 7 days
              </Typography>
              <Typography variant="body2" color="textSecondary">
                <strong>Complete Your Look:</strong> Complementary products for cart items
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default RecommendationStats;
