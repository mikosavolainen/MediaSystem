import React, { useState, useEffect } from 'react';
import { Box, Button, Alert, CircularProgress, Input } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';

const ReviewMedia = ({ token }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [annotations, setAnnotations] = useState("");

    const fetchMediaDetails = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`http://localhost:24243/mediasystem/backend/server.php?action=get-media-details&id=${id}`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            const data = await response.json();
            console.log(data);
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
            const response = await fetch('http://localhost:24243/mediasystem/backend/server.php?action=review-media', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Bearer ${token}`,
                },
                body: new URLSearchParams({
                    id: id,
                    annotations: annotations,
                    status: approved ? 'OK' : 'Fail',
                }),
            });

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
        return <CircularProgress />;
    }

    return (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={3}>
            {error && <Alert severity="error">{error}</Alert>}
            {image ? (
                <Box display="flex" flexDirection="column" alignItems="center" p={2} border="1px solid #ccc" borderRadius="8px">
                    <img
                        src={`http://localhost:24243/mediasystem/backend/server.php?action=get-image&file_id=${image.media_id}`}
                        alt={`Media ${image.media_id}`}
                        style={{ maxWidth: '300px', maxHeight: '300px', objectFit: 'cover', marginBottom: '20px' }}
                    />
                    <div>Title: {image.title}</div>
                    <div>Description: {image.description}</div>
                    <div>Created By: {image.created_by}</div>
                    <div>Status: {image.status}</div>
                    <div>Assigned to: {image.assigned_to}</div>
                    <Input
                        placeholder="Add annotations"
                        value={annotations}
                        onChange={(e) => setAnnotations(e.target.value)}
                        sx={{ marginTop: 2, width: '100%' }}
                    />
                    <Box mt={2}>
                        <Button variant="contained" onClick={() => handleApproval(true)} color="primary" sx={{ mr: 2 }}>
                            Approve
                        </Button>
                        <Button variant="contained" onClick={() => handleApproval(false)} color="secondary">
                            Reject
                        </Button>
                    </Box>
                </Box>
            ) : (
                <Alert severity="info">Media details not found.</Alert>
            )}
        </Box>
    );
};

export default ReviewMedia;
