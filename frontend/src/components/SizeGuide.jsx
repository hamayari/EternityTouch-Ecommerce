import { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Tabs,
    Tab,
    Divider,
    List,
    ListItem,
    ListItemIcon,
    ListItemText
} from '@mui/material';
import { Close, Straighten, CheckCircle } from '@mui/icons-material';

const SizeGuide = ({ open, onClose, category = 'Men' }) => {
    const [activeTab, setActiveTab] = useState(0);

    // Size charts by category
    const sizeCharts = {
        Men: {
            tops: [
                { size: 'XS', chest: '34-36', waist: '28-30', hips: '34-36' },
                { size: 'S', chest: '36-38', waist: '30-32', hips: '36-38' },
                { size: 'M', chest: '38-40', waist: '32-34', hips: '38-40' },
                { size: 'L', chest: '40-42', waist: '34-36', hips: '40-42' },
                { size: 'XL', chest: '42-44', waist: '36-38', hips: '42-44' },
                { size: 'XXL', chest: '44-46', waist: '38-40', hips: '44-46' }
            ],
            bottoms: [
                { size: '28', waist: '28', hips: '34-36', inseam: '30-32' },
                { size: '30', waist: '30', hips: '36-38', inseam: '30-32' },
                { size: '32', waist: '32', hips: '38-40', inseam: '30-32' },
                { size: '34', waist: '34', hips: '40-42', inseam: '30-32' },
                { size: '36', waist: '36', hips: '42-44', inseam: '30-32' },
                { size: '38', waist: '38', hips: '44-46', inseam: '30-32' }
            ]
        },
        Women: {
            tops: [
                { size: 'XS', bust: '32-34', waist: '24-26', hips: '34-36' },
                { size: 'S', bust: '34-36', waist: '26-28', hips: '36-38' },
                { size: 'M', bust: '36-38', waist: '28-30', hips: '38-40' },
                { size: 'L', bust: '38-40', waist: '30-32', hips: '40-42' },
                { size: 'XL', bust: '40-42', waist: '32-34', hips: '42-44' },
                { size: 'XXL', bust: '42-44', waist: '34-36', hips: '44-46' }
            ],
            bottoms: [
                { size: '0', waist: '24', hips: '34', inseam: '28-30' },
                { size: '2', waist: '25', hips: '35', inseam: '28-30' },
                { size: '4', waist: '26', hips: '36', inseam: '28-30' },
                { size: '6', waist: '27', hips: '37', inseam: '28-30' },
                { size: '8', waist: '28', hips: '38', inseam: '28-30' },
                { size: '10', waist: '29', hips: '39', inseam: '28-30' },
                { size: '12', waist: '30', hips: '40', inseam: '28-30' }
            ]
        },
        Kids: {
            tops: [
                { size: '2-3Y', height: '35-38', chest: '20-21', waist: '19-20' },
                { size: '4-5Y', height: '39-43', chest: '21-22', waist: '20-21' },
                { size: '6-7Y', height: '44-48', chest: '22-24', waist: '21-22' },
                { size: '8-9Y', height: '49-53', chest: '24-26', waist: '22-23' },
                { size: '10-11Y', height: '54-58', chest: '26-28', waist: '23-24' },
                { size: '12-13Y', height: '59-63', chest: '28-30', waist: '24-26' }
            ]
        }
    };

    const currentChart = sizeCharts[category] || sizeCharts.Men;

    const measurementTips = [
        {
            title: 'Chest/Bust',
            description: 'Measure around the fullest part of your chest, keeping the tape horizontal'
        },
        {
            title: 'Waist',
            description: 'Measure around your natural waistline, keeping the tape comfortably loose'
        },
        {
            title: 'Hips',
            description: 'Measure around the fullest part of your hips, about 8 inches below your waist'
        },
        {
            title: 'Inseam',
            description: 'Measure from the top of your inner thigh to your ankle bone'
        }
    ];

    const fitTips = [
        'For a relaxed fit, consider sizing up',
        'For a fitted look, choose your exact size',
        'Check the product description for specific fit notes',
        'When between sizes, size up for comfort',
        'All measurements are in inches'
    ];

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 2 }
            }}
        >
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Straighten sx={{ color: 'primary.main' }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        Size Guide - {category}
                    </Typography>
                </Box>
                <IconButton onClick={onClose} size="small">
                    <Close />
                </IconButton>
            </DialogTitle>

            <Divider />

            <DialogContent>
                <Tabs
                    value={activeTab}
                    onChange={(e, newValue) => setActiveTab(newValue)}
                    sx={{ mb: 3 }}
                >
                    <Tab label="Size Chart" />
                    <Tab label="How to Measure" />
                    <Tab label="Fit Tips" />
                </Tabs>

                {/* Size Chart Tab */}
                {activeTab === 0 && (
                    <Box>
                        {currentChart.tops && (
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                                    Tops & Shirts
                                </Typography>
                                <TableContainer component={Paper} variant="outlined">
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Size</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }}>
                                                    {category === 'Women' ? 'Bust' : 'Chest'} (in)
                                                </TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Waist (in)</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }}>
                                                    {category === 'Kids' ? 'Height (in)' : 'Hips (in)'}
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {currentChart.tops.map((row, index) => (
                                                <TableRow key={index} hover>
                                                    <TableCell sx={{ fontWeight: 'bold' }}>{row.size}</TableCell>
                                                    <TableCell>{row.chest || row.bust || row.height}</TableCell>
                                                    <TableCell>{row.waist}</TableCell>
                                                    <TableCell>{row.hips}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Box>
                        )}

                        {currentChart.bottoms && (
                            <Box>
                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                                    Bottoms & Pants
                                </Typography>
                                <TableContainer component={Paper} variant="outlined">
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Size</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Waist (in)</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Hips (in)</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Inseam (in)</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {currentChart.bottoms.map((row, index) => (
                                                <TableRow key={index} hover>
                                                    <TableCell sx={{ fontWeight: 'bold' }}>{row.size}</TableCell>
                                                    <TableCell>{row.waist}</TableCell>
                                                    <TableCell>{row.hips}</TableCell>
                                                    <TableCell>{row.inseam}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Box>
                        )}
                    </Box>
                )}

                {/* How to Measure Tab */}
                {activeTab === 1 && (
                    <Box>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                            Follow these steps to get accurate measurements:
                        </Typography>
                        <List>
                            {measurementTips.map((tip, index) => (
                                <ListItem key={index} sx={{ alignItems: 'flex-start' }}>
                                    <ListItemIcon sx={{ minWidth: 40, mt: 0.5 }}>
                                        <Straighten color="primary" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={
                                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                                {tip.title}
                                            </Typography>
                                        }
                                        secondary={tip.description}
                                    />
                                </ListItem>
                            ))}
                        </List>
                        <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                                💡 Pro Tip:
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Use a soft measuring tape and measure over light clothing for the most accurate results.
                                Have someone help you for better accuracy.
                            </Typography>
                        </Box>
                    </Box>
                )}

                {/* Fit Tips Tab */}
                {activeTab === 2 && (
                    <Box>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                            Tips for finding your perfect fit:
                        </Typography>
                        <List>
                            {fitTips.map((tip, index) => (
                                <ListItem key={index}>
                                    <ListItemIcon sx={{ minWidth: 40 }}>
                                        <CheckCircle color="success" />
                                    </ListItemIcon>
                                    <ListItemText primary={tip} />
                                </ListItem>
                            ))}
                        </List>
                        <Box sx={{ mt: 3, p: 2, bgcolor: '#fff3e0', borderRadius: 1, border: '1px solid #ffb74d' }}>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                                ⚠️ Still unsure?
                            </Typography>
                            <Typography variant="body2">
                                Contact our customer support team via live chat for personalized sizing advice.
                                We're here to help you find the perfect fit!
                            </Typography>
                        </Box>
                    </Box>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default SizeGuide;
