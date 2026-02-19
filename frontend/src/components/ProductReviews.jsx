import { useState, useEffect, useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  Box,
  Typography,
  Rating,
  TextField,
  Button,
  Card,
  CardContent,
  Avatar,
  Divider,
  LinearProgress,
  Grid,
  Chip,
  Stack
} from '@mui/material';
import {
  Star,
  StarBorder,
  Person,
  RateReview
} from '@mui/icons-material';

const ProductReviews = ({ productId }) => {
  const { backendUrl, token } = useContext(ShopContext);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Review form
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [showForm, setShowForm] = useState(false);

  // Rating distribution
  const [ratingDistribution, setRatingDistribution] = useState({
    5: 0, 4: 0, 3: 0, 2: 0, 1: 0
  });

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const response = await axios.post(`${backendUrl}/api/product/get-reviews`, {
        productId
      });

      if (response.data.success) {
        setReviews(response.data.reviews);
        setAverageRating(response.data.averageRating);
        setTotalReviews(response.data.totalReviews);
        
        // Calculate distribution
        const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        response.data.reviews.forEach(review => {
          dist[review.rating]++;
        });
        setRatingDistribution(dist);
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error('Please login to add a review');
      return;
    }

    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setSubmitting(true);
    try {
      const response = await axios.post(
        `${backendUrl}/api/product/add-review`,
        { productId, rating, comment },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success('Review added successfully');
        setRating(0);
        setComment('');
        setShowForm(false);
        await fetchReviews();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error('Failed to add review');
    } finally {
      setSubmitting(false);
    }
  };

  const getRatingPercentage = (stars) => {
    if (totalReviews === 0) return 0;
    return (ratingDistribution[stars] / totalReviews) * 100;
  };

  if (loading) {
    return (
      <Box sx={{ py: 4 }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ py: 4 }}>
      {/* Header */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Customer Reviews
      </Typography>

      {/* Rating Summary */}
      <Grid container spacing={4} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h2" sx={{ fontWeight: 700, mb: 1 }}>
                {averageRating.toFixed(1)}
              </Typography>
              <Rating
                value={averageRating}
                precision={0.1}
                readOnly
                size="large"
                sx={{ mb: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                Rating Distribution
              </Typography>
              {[5, 4, 3, 2, 1].map((stars) => (
                <Box key={stars} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" sx={{ minWidth: 60 }}>
                    {stars} <Star sx={{ fontSize: 14, color: '#FFB400', verticalAlign: 'middle' }} />
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={getRatingPercentage(stars)}
                    sx={{
                      flex: 1,
                      mx: 2,
                      height: 8,
                      borderRadius: 4,
                      bgcolor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: '#FFB400'
                      }
                    }}
                  />
                  <Typography variant="body2" sx={{ minWidth: 40, textAlign: 'right' }}>
                    {ratingDistribution[stars]}
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Write Review Button */}
      {!showForm && (
        <Button
          variant="contained"
          startIcon={<RateReview />}
          onClick={() => setShowForm(true)}
          sx={{
            mb: 3,
            bgcolor: 'black',
            '&:hover': { bgcolor: 'grey.800' }
          }}
        >
          Write a Review
        </Button>
      )}

      {/* Review Form */}
      {showForm && (
        <Card variant="outlined" sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Write Your Review
            </Typography>
            <form onSubmit={handleSubmitReview}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Your Rating *
                </Typography>
                <Rating
                  value={rating}
                  onChange={(e, newValue) => setRating(newValue)}
                  size="large"
                  sx={{ color: '#FFB400' }}
                />
              </Box>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Your Review (Optional)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with this product..."
                sx={{ mb: 2 }}
              />
              <Stack direction="row" spacing={2}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={submitting || rating === 0}
                  sx={{
                    bgcolor: 'black',
                    '&:hover': { bgcolor: 'grey.800' }
                  }}
                >
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setShowForm(false);
                    setRating(0);
                    setComment('');
                  }}
                >
                  Cancel
                </Button>
              </Stack>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        All Reviews ({totalReviews})
      </Typography>

      {reviews.length === 0 ? (
        <Card variant="outlined">
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <StarBorder sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No reviews yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Be the first to review this product!
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={2}>
          {reviews.map((review, index) => (
            <Card key={index} variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    <Person />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {review.userName}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Rating value={review.rating} readOnly size="small" />
                      <Typography variant="caption" color="text.secondary">
                        {new Date(review.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </Typography>
                    </Box>
                    {review.comment && (
                      <Typography variant="body2" color="text.secondary">
                        {review.comment}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default ProductReviews;
