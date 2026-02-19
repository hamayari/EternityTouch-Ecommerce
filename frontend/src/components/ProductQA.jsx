import { useState, useEffect, useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
    Box,
    Typography,
    TextField,
    Button,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    AccordionActions,
    Divider,
    IconButton,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Stack,
    Paper
} from '@mui/material';
import {
    ExpandMore,
    ThumbUp,
    ThumbDown,
    QuestionAnswer,
    Send,
    HelpOutline
} from '@mui/icons-material';

const ProductQA = ({ productId }) => {
    const { token, backendUrl } = useContext(ShopContext);
    const [qas, setQas] = useState([]);
    const [question, setQuestion] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [loading, setLoading] = useState(false);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        if (productId) {
            fetchQAs();
        }
    }, [productId]);

    const fetchQAs = async () => {
        try {
            const response = await axios.post(
                backendUrl + '/api/qa/get',
                { productId }
            );

            if (response.data.success) {
                setQas(response.data.qas);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleAskQuestion = async () => {
        if (!token) {
            toast.error('Please login to ask a question');
            return;
        }

        if (!question.trim()) {
            toast.error('Please enter your question');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(
                backendUrl + '/api/qa/ask',
                { productId, question },
                { headers: { token } }
            );

            if (response.data.success) {
                if (response.data.autoAnswered) {
                    toast.success('✨ Question answered automatically!');
                } else {
                    toast.success('Question submitted! Our team will answer shortly.');
                }
                setQuestion('');
                setOpenDialog(false);
                fetchQAs();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to submit question');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkHelpful = async (qaId, helpful) => {
        if (!token) {
            toast.error('Please login to vote');
            return;
        }

        try {
            const response = await axios.post(
                backendUrl + '/api/qa/helpful',
                { qaId, helpful },
                { headers: { token } }
            );

            if (response.data.success) {
                toast.success('Thank you for your feedback!');
                fetchQAs();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to submit feedback');
        }
    };

    const handleAccordionChange = (panel) => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
    };

    return (
        <Box sx={{ mt: 6 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <HelpOutline /> Questions & Answers
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<QuestionAnswer />}
                    onClick={() => setOpenDialog(true)}
                    sx={{ textTransform: 'none' }}
                >
                    Ask a Question
                </Button>
            </Box>

            {qas.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#f9f9f9' }}>
                    <QuestionAnswer sx={{ fontSize: 60, color: '#ccc', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        No questions yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={2}>
                        Be the first to ask a question about this product
                    </Typography>
                    <Button
                        variant="contained"
                        onClick={() => setOpenDialog(true)}
                        sx={{ textTransform: 'none' }}
                    >
                        Ask a Question
                    </Button>
                </Paper>
            ) : (
                <Box>
                    {qas.map((qa, index) => (
                        <Accordion
                            key={qa._id}
                            expanded={expanded === `panel${index}`}
                            onChange={handleAccordionChange(`panel${index}`)}
                            sx={{ mb: 1 }}
                        >
                            <AccordionSummary
                                expandIcon={<ExpandMore />}
                                aria-controls={`panel${index}-content`}
                                id={`panel${index}-header`}
                            >
                                <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 2 }}>
                                    <Box>
                                        <Typography sx={{ fontWeight: 'bold' }}>
                                            Q: {qa.question}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Asked by {qa.userName} • {new Date(qa.createdAt).toLocaleDateString()}
                                        </Typography>
                                    </Box>
                                    {qa.status === 'pending' ? (
                                        <Chip label="Pending" size="small" color="warning" />
                                    ) : (
                                        <Chip label="Answered" size="small" color="success" />
                                    )}
                                </Box>
                            </AccordionSummary>
                            
                            {qa.status === 'answered' && (
                                <>
                                    <AccordionDetails>
                                        <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1 }}>
                                            <Typography variant="body1" sx={{ mb: 1 }}>
                                                <strong>A:</strong> {qa.answer}
                                            </Typography>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <Typography variant="caption" color="text.secondary">
                                                    Answered by {qa.answeredBy} • {new Date(qa.answeredAt).toLocaleDateString()}
                                                </Typography>
                                                {qa.answeredBy === 'Auto-Assistant' && (
                                                    <Chip 
                                                        label="🤖 AI" 
                                                        size="small" 
                                                        color="info" 
                                                        sx={{ height: 20, fontSize: '0.7rem' }}
                                                        title="Answered by AI"
                                                    />
                                                )}
                                            </Box>
                                        </Box>
                                    </AccordionDetails>
                                    
                                    <AccordionActions>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <Typography variant="caption" color="text.secondary">
                                                Was this helpful?
                                            </Typography>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleMarkHelpful(qa._id, true)}
                                                color="success"
                                            >
                                                <ThumbUp fontSize="small" />
                                            </IconButton>
                                            <Typography variant="caption">{qa.helpful}</Typography>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleMarkHelpful(qa._id, false)}
                                                color="error"
                                            >
                                                <ThumbDown fontSize="small" />
                                            </IconButton>
                                            <Typography variant="caption">{qa.notHelpful}</Typography>
                                        </Box>
                                    </AccordionActions>
                                </>
                            )}
                        </Accordion>
                    ))}
                </Box>
            )}

            {/* Ask Question Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Ask a Question</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" mb={2}>
                        Have a question about this product? Ask here and our team or other customers will answer.
                    </Typography>
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Your Question"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="What would you like to know about this product?"
                        sx={{ mt: 1 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button
                        onClick={handleAskQuestion}
                        variant="contained"
                        startIcon={<Send />}
                        disabled={loading || !question.trim()}
                    >
                        Submit Question
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ProductQA;
