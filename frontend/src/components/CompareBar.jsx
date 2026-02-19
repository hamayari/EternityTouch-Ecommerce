import React, { useContext } from 'react';
import { CompareContext } from '../context/CompareContext';
import { useNavigate } from 'react-router-dom';
import { Box, Paper, IconButton, Button, Typography, Chip } from '@mui/material';
import { Close, CompareArrows } from '@mui/icons-material';

const CompareBar = () => {
    const { compareItems, removeFromCompare, clearCompare } = useContext(CompareContext);
    const navigate = useNavigate();

    if (compareItems.length === 0) {
        return null;
    }

    return (
        <Paper
            elevation={8}
            sx={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 1000,
                p: 2,
                bgcolor: 'white',
                borderTop: '3px solid #414141'
            }}
        >
            <Box sx={{ maxWidth: 1200, mx: 'auto', display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CompareArrows sx={{ color: '#414141' }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        Compare Products
                    </Typography>
                    <Chip 
                        label={`${compareItems.length}/4`} 
                        size="small" 
                        color="primary"
                    />
                </Box>

                <Box sx={{ display: 'flex', gap: 1, flex: 1, overflowX: 'auto' }}>
                    {compareItems.map((item) => (
                        <Box
                            key={item._id}
                            sx={{
                                position: 'relative',
                                minWidth: 80,
                                height: 80,
                                border: '1px solid #ddd',
                                borderRadius: 1,
                                overflow: 'hidden'
                            }}
                        >
                            <img
                                src={item.images?.[0] || item.image?.[0]}
                                alt={item.name}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                }}
                            />
                            <IconButton
                                size="small"
                                onClick={() => removeFromCompare(item._id)}
                                sx={{
                                    position: 'absolute',
                                    top: 2,
                                    right: 2,
                                    bgcolor: 'rgba(255,255,255,0.9)',
                                    '&:hover': { bgcolor: 'white' },
                                    width: 20,
                                    height: 20
                                }}
                            >
                                <Close sx={{ fontSize: 14 }} />
                            </IconButton>
                        </Box>
                    ))}
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={clearCompare}
                    >
                        Clear All
                    </Button>
                    <Button
                        variant="contained"
                        size="small"
                        onClick={() => navigate('/compare')}
                        disabled={compareItems.length < 2}
                        sx={{ bgcolor: '#414141', '&:hover': { bgcolor: '#000' } }}
                    >
                        Compare Now
                    </Button>
                </Box>
            </Box>
        </Paper>
    );
};

export default CompareBar;
