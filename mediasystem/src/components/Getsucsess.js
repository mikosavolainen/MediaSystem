import React, { useState, useEffect } from 'react';
import { Box, Alert, CircularProgress, Typography } from '@mui/material';

const SuccessGallery = ({ token }) => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchImages = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(
                'http://localhost:24243/mediasystem/backend/server.php?action=get-successtasks',
                {
                    method: 'GET',
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            const data = await response.json();

            if (data.status === 'success') {
                setImages(data.tasks || []);
            } else {
                setError('Failed to fetch images.');
            }
        } catch (err) {
            console.error('Fetch Error:', err);
            setError('An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchImages();
    }, []);

    // Filter images for "success" status
    const successImages = images.filter((image) => image.status === 'OK');

    return (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            p={3}
            width="100%"
        >
            {loading && <CircularProgress />}
            {error && <Alert severity="error">{error}</Alert>}
            {!loading && !error && successImages.length === 0 && (
                <Alert severity="info">No success images found.</Alert>
            )}
            <Box
                display="flex"
                flexWrap="wrap"
                justifyContent="center"
                mt={2}
                gap={2}
            >
                {successImages.map((image, index) => (
                    <Box
                        key={index}
                        p={2}
                        border="1px solid #ccc"
                        borderRadius="8px"
                        sx={{
                            width: '180px',
                            textAlign: 'center',
                            backgroundColor: '#f9f9f9',
                            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                        }}
                    >
                        <img
                            src={`http://localhost:24243/mediasystem/backend/server.php?action=get-image&file_id=${image.media_id}`}
                            alt={`Media ${index + 1}`}
                            style={{
                                maxWidth: '100%',
                                maxHeight: '120px',
                                objectFit: 'cover',
                                borderRadius: '4px',
                                marginBottom: '8px',
                            }}
                        />
                        <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                            From: {image.created_by}<br/>
                            Name: {image.title}
                        </Typography>
                    </Box>
                ))}
            </Box>
        </Box>
    );
};

export default SuccessGallery;
