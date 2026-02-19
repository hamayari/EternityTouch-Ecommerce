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
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Tabs,
    Tab,
    Pagination,
    IconButton
} from '@mui/material';
import {
    QuestionAnswer,
    CheckCircle,
    HourglassEmpty,
    Delete,
    Reply
} from '@mui/icons-material';

const QA = ({ token }) => {
    const [stats, setStats] = useState(null);
    const [qas, setQas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ total: 0, pages: 1 });
    const [answerDialog, setAnswerDialog] = useState(false);
    const [selectedQA, setSelectedQA] = useState(null);
    const [answer, setAnswer] = useState('');

    useEffect(() => {
        fetchStats();
        fetchQAs();
    }, [statusFilter, page]);

    const fetchStats = async () => {
        try {
            const response = await axios.get(backendUrl + '/api/qa/stats', {
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

    const fetchQAs = async () => {
        try {
            setLoading(true);
            const response = await axios.get(backendUrl + '/api/qa/all', {
                headers: { token },
                params: { status: statusFilter, page, limit: 20 }
            });

            if (response.data.success) {
                setQas(response.data.qas);
                setPagination(response.data.pagination);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to load Q&A');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = (event, newValue) => {
        setStatusFilter(newValue);
        setPage(1);
    };

    const handleOpenAnswer = (qa) => {
        setSelectedQA(qa);
        setAnswer(qa.answer || '');
        setAnswerDialog(true);
    };

    const handleSubmitAnswer = async () => {
        if (!answer.trim()) {
            toast.error('Please enter an answer');
            return;
        }

        try {
            const response = await axios.post(
                backendUrl + '/api/qa/answer',
                { qaId: selectedQA._id, answer },
                { headers: { token } }
            );

            if (response.data.success) {
                toast.success('Answer posted successfully!');
                setAnswerDialog(false);
                setAnswer('');
                setSelectedQA(null);
                fetchQAs();
                fetchStats();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to post answer');
        }
    };

    const handleDelete = async (qaId) => {
        if (!window.confirm('Are you sure you want to delete this question?')) {
            return;
        }

        try {
            const response = await axios.post(
                backendUrl + '/api/qa/delete',
                { qaId },
                { headers: { token } }
            );

            if (response.data.success) {
                toast.success('Question deleted successfully');
                fetchQAs();
                fetchStats();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to delete question');
        }
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
                ❓ Product Q&A Management
            </Typography>

            {/* Statistics Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={2}>
                                <QuestionAnswer sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                                <Typography variant="h6">Total Questions</Typography>
                            </Box>
                            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                {stats.totalQuestions}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={2}>
                                <HourglassEmpty sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
                                <Typography variant="h6">Pending</Typography>
                            </Box>
                            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                {stats.pendingQuestions}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={2}>
                                <CheckCircle sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                                <Typography variant="h6">Answered</Typography>
                            </Box>
                            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                {stats.answeredQuestions}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Q&A List */}
            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                        Questions & Answers
                    </Typography>

                    <Tabs value={statusFilter} onChange={handleStatusChange} sx={{ mb: 3 }}>
                        <Tab label="All" value="" />
                        <Tab label="Pending" value="pending" />
                        <Tab label="Answered" value="answered" />
                    </Tabs>

                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Product</TableCell>
                                    <TableCell>Question</TableCell>
                                    <TableCell>Asked By</TableCell>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell align="center">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">Loading...</TableCell>
                                    </TableRow>
                                ) : qas.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">No questions found</TableCell>
                                    </TableRow>
                                ) : (
                                    qas.map((qa) => (
                                        <TableRow key={qa._id}>
                                            <TableCell>
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    {qa.productId?.image?.[0] && (
                                                        <img
                                                            src={qa.productId.image[0]}
                                                            alt={qa.productId.name}
                                                            style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }}
                                                        />
                                                    )}
                                                    <Typography variant="body2">
                                                        {qa.productId?.name || 'N/A'}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" sx={{ maxWidth: 300 }}>
                                                    {qa.question}
                                                </Typography>
                                                {qa.answer && (
                                                    <>
                                                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                                                            Answer: {qa.answer.substring(0, 100)}...
                                                        </Typography>
                                                        {qa.answeredBy === 'Auto-Assistant' && (
                                                            <Chip 
                                                                label="🤖 AI" 
                                                                size="small" 
                                                                color="info" 
                                                                sx={{ mt: 0.5, height: 18, fontSize: '0.65rem' }}
                                                            />
                                                        )}
                                                    </>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">{qa.userName}</Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {qa.userId?.email || 'N/A'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                {new Date(qa.createdAt).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={qa.status}
                                                    color={qa.status === 'answered' ? 'success' : 'warning'}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                <IconButton
                                                    size="small"
                                                    color="primary"
                                                    onClick={() => handleOpenAnswer(qa)}
                                                    title={qa.status === 'answered' ? 'Edit Answer' : 'Answer Question'}
                                                >
                                                    <Reply />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => handleDelete(qa._id)}
                                                    title="Delete Question"
                                                >
                                                    <Delete />
                                                </IconButton>
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

            {/* Answer Dialog */}
            <Dialog open={answerDialog} onClose={() => setAnswerDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    {selectedQA?.status === 'answered' ? 'Edit Answer' : 'Answer Question'}
                </DialogTitle>
                <DialogContent>
                    {selectedQA && (
                        <>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Question:
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                                {selectedQA.question}
                            </Typography>
                            <TextField
                                fullWidth
                                multiline
                                rows={6}
                                label="Your Answer"
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                placeholder="Provide a helpful answer to this question..."
                            />
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAnswerDialog(false)}>Cancel</Button>
                    <Button
                        onClick={handleSubmitAnswer}
                        variant="contained"
                        disabled={!answer.trim()}
                    >
                        {selectedQA?.status === 'answered' ? 'Update Answer' : 'Post Answer'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default QA;
