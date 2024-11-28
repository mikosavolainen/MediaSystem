import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Alert,
    CircularProgress,
    TextField,
    Typography,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';

const ReviewMedia = ({ token }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [annotations, setAnnotations] = useState('');

    const fetchMediaDetails = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(
                `http://localhost:24243/mediasystem/backend/server.php?action=get-media-details&id=${id}`,
                {
                    method: 'GET',
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            const data = await response.json();
            if (data.status === 'success') {
                setImage(data.media_details);
            } else {
                setError(data.message || 'Failed to fetch media details.');
            }
        } catch (err) {
            console.error('Fetch Error:', err);
            setError('An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMediaDetails();
    }, [id, token]);

    const handleApproval = async (approved) => {
        try {
            const response = await fetch(
                'http://localhost:24243/mediasystem/backend/server.php?action=review-media',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        Authorization: `Bearer ${token}`,
                    },
                    body: new URLSearchParams({
                        id: id,
                        annotations: annotations,
                        status: approved ? 'OK' : 'Fail',
                    }),
                }
            );
            const data = await response.json();
            if (data.status === 'success') {
                navigate('/getmedia');
            } else {
                setError(data.message || 'Failed to review media.');
            }
        } catch (err) {
            console.error('Approval Error:', err);
            setError('An unexpected error occurred while submitting the review.');
        }
    };

    if (loading) {
        return (
            <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                height="100vh"
            >
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box display="flex" flexDirection="column" alignItems="center" p={3}>
            {error && (
                <Alert severity="error" role="alert" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}
            {image ? (
                <Box
                    sx={{
                        width: '100%',
                        maxWidth: '600px',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        p: 3,
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    }}
                >
                    <Box
                        sx={{
                            width: '100%',
                            aspectRatio: '16/9',
                            backgroundImage: `url(http://localhost:24243/mediasystem/backend/server.php?action=get-image&file_id=${image.media_id})`,
                            backgroundSize: 'contain',
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'center',
                            borderRadius: '4px',
                            mb: 2,
                        }}
                    />
                    <Typography variant="h6" gutterBottom>
                        {image.title || 'Untitled'}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>Description:</strong> {image.description || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                        <strong>Created By:</strong> {image.created_by}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                        <strong>Status:</strong> {image.status}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                        <strong>Assigned To:</strong> {image.assigned_to || 'Unassigned'}
                    </Typography>
                    <TextField
                        label="Add Annotations"
                        multiline
                        rows={3}
                        fullWidth
                        value={annotations}
                        onChange={(e) => setAnnotations(e.target.value)}
                        variant="outlined"
                        sx={{ mb: 2 }}
                    />
                    <Box display="flex" justifyContent="space-between">
                        <Button
                            variant="contained"
                            color="success"
                            onClick={() => handleApproval(true)}
                            sx={{ flexGrow: 1, mr: 1 }}
                        >
                            Approve
                        </Button>
                        <Button
                            variant="contained"
                            color="error"
                            onClick={() => handleApproval(false)}
                            sx={{ flexGrow: 1 }}
                        >
                            Reject
                        </Button>
                    </Box>
                </Box>
            ) : (
                <Alert severity="info" role="alert">
                    Media details not found.
                </Alert>
            )}
        </Box>
    );
};

export default ReviewMedia;
