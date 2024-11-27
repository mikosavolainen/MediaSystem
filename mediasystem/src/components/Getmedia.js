import React, { useState, useEffect } from 'react';
import { Box, Alert, CircularProgress, Button } from '@mui/material';
import { jwtDecode } from 'jwt-decode';


const FetchImages = ({ token }) => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [experts, setExperts] = useState([]);

    const fetchExperts = async () => {
        try {
            const response = await fetch('http://localhost:24243/mediasystem/backend/server.php?action=get-experts', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            const data = await response.json();
            if (data.status === 'success') {
                setExperts(data.report || []);
            } else {
                console.error('Failed to fetch experts:', data.message);
            }
        } catch (err) {
            console.error('Error fetching experts:', err);
        }
    };

    useEffect(() => {
        fetchExperts();
    }, []);

    const handleAssignmentChange = async (expertId, mediaId) => {
        try {
            const response = await fetch('http://localhost:24243/mediasystem/backend/server.php?action=assign-task', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Bearer ${token}`,
                },
                body: new URLSearchParams({
                    media_id: mediaId,
                    assigned_to: expertId,
                }),
            });

            const data = await response.json();

            if (data.status === 'success') {
                setImages((prevImages) =>
                    prevImages.map((image) =>
                        image.media_id === mediaId
                            ? { ...image, assigned_to: expertId }
                            : image
                    )
                );
            } else {
                setError(data.message || 'Failed to assign task.');
            }
        } catch (err) {
            console.error('Assignment Error:', err);
            setError('An unexpected error occurred while assigning the task.');
        }
    };

    const fetchImages = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch('http://localhost:24243/mediasystem/backend/server.php?action=get-tasks', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (data.status === 'success') {
                setImages(data.tasks || []);
            } else {
                setError(data.message || 'Failed to fetch images.');
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

    const decode = jwtDecode(token);

    return (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={3}>
            {loading && <CircularProgress />}
            {error && <Alert severity="error">{error}</Alert>}
            {!loading && images.length === 0 && !error && <Alert severity="info">No images found.</Alert>}
            <Box display="flex" flexWrap="wrap" justifyContent="center" mt={2}>
                {images.map((image, index) => (
                    <Box
                        key={index}
                        m={2}
                        p={1}
                        display="flex"
                        flexDirection="column"
                        border="1px solid #ccc"
                        borderRadius="8px"
                        sx={{ height: '260px', position: 'relative' }}
                    >
                        <div>From: {image.created_by}</div>
                        <img
                            src={`http://localhost:24243/mediasystem/backend/server.php?action=get-image&file_id=${image.media_id}`}
                            alt={`Uploaded Media ${index + 1}`}
                            style={{ maxWidth: '150px', maxHeight: '150px', objectFit: 'cover' }}
                        />
                        <div>Status: {image.status}</div>
                        {image.annotations ? ("Annotations: "+image.annotations):("")}
                        {image.assigned_to ? (
                            <div>
                                Assigned to: {image.assigned_to}

                            </div>
                        ) : (
                            <select
                                onChange={(e) => handleAssignmentChange(e.target.value, image.media_id)}
                                defaultValue=""
                                style={{ marginBottom: '10px' }}
                            >
                                <option value="" disabled>
                                    Select Expert
                                </option>
                                {experts.map((expert) => (
                                    <option key={expert.username} value={expert.username}>
                                        {expert.username}
                                    </option>
                                ))}
                            </select>
                        )}
                        {image.assigned_to === decode.username && (
                            <Button
                                variant="contained"
                                sx={{
                                    position: 'absolute',
                                    bottom: 10,
                                }}
                                href={`/review-media/${image.id}`}
                            >
                                Review
                            </Button>
                        )}
                    </Box>
                ))}
            </Box>
        </Box>
    );
};

export default FetchImages;
