import React, { useState, useEffect } from 'react';
import {
    Grid,
    Card,
    CardContent,
    CardActions,
    Typography,
    Select,
    MenuItem,
    Button,
    Alert,
    Box,
    Skeleton,
    TextField,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from '@mui/material';
import { jwtDecode } from 'jwt-decode';

const FetchImages = ({ token }) => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [experts, setExperts] = useState([]);
    const [chatDialogOpen, setChatDialogOpen] = useState(false);
    const [currentTaskId, setCurrentTaskId] = useState(null);
    const [chatMessages, setChatMessages] = useState([]); // Ensure it's an array initially
    const [message, setMessage] = useState('');

    const fetchExperts = async () => {
        try {
            const response = await fetch(
                'http://localhost:24243/mediasystem/backend/server.php?action=get-experts',
                {
                    method: 'GET',
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
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

    const fetchImages = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(
                'http://localhost:24243/mediasystem/backend/server.php?action=get-tasks',
                {
                    method: 'GET',
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
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

    const handleAssignmentChange = async (expertId, mediaId) => {
        try {
            const response = await fetch(
                'http://localhost:24243/mediasystem/backend/server.php?action=assign-task',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        Authorization: `Bearer ${token}`,
                    },
                    body: new URLSearchParams({
                        media_id: mediaId,
                        assigned_to: expertId,
                    }),
                }
            );
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

    const handleChatButtonClick = async (taskId) => {
        setCurrentTaskId(taskId);
        try {
            const response = await fetch(
                'http://localhost:24243/mediasystem/backend/server.php?action=getchat',
                {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token}` },
                    body: new URLSearchParams({ task_id: taskId }),
                }
            );
            const data = await response.json();
            if (data.status === 'success') {
                // Ensure chatMessages is an array
                setChatMessages(Array.isArray(data.report) ? data.report : []);
            } else {
                console.error('Failed to fetch chat messages:', data.message);
                setChatMessages([]); // Set an empty array if the response is invalid
            }
        } catch (err) {
            console.error('Error fetching chat messages:', err);
            setChatMessages([]); // Set an empty array in case of error
        }
        setChatDialogOpen(true);
    };

    const handleSendChat = async () => {
        if (!message.trim()) return;

        try {
            const response = await fetch(
                'http://localhost:24243/mediasystem/backend/server.php?action=sendchat',
                {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/x-www-form-urlencoded', 
                        Authorization: `Bearer ${token}` 
                    },
                    body: new URLSearchParams({
                        task_id: currentTaskId,
                        message: message,
                    }),
                }
            );
            const data = await response.json();
            if (data.status === 'success') {
                setChatMessages((prevMessages) => [
                    ...prevMessages,
                    { sender: 'You', text: message },
                ]);
                setMessage('');
            } else {
                setError(data.message || 'Failed to send message.');
            }
        } catch (err) {
            console.error('Error sending message:', err);
            setError('An unexpected error occurred.');
        }
    };

    const decode = jwtDecode(token);

    useEffect(() => {
        fetchExperts();
        fetchImages();
    }, []);

    return (
        <Box p={3}>
            {loading && (
                <Grid container spacing={3}>
                    {[1, 2, 3, 4].map((item) => (
                        <Grid item xs={12} sm={6} md={4} key={item}>
                            <Skeleton variant="rectangular" height={260} />
                        </Grid>
                    ))}
                </Grid>
            )}
            {error && <Alert severity="error">{error}</Alert>}
            {!loading && images.length === 0 && !error && (
                <Alert severity="info">No images found.</Alert>
            )}
            <Grid container spacing={3}>
                {images.map((image, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <Box
                                sx={{
                                    width: '100%',
                                    aspectRatio: '4/3',
                                    backgroundImage: `url(http://localhost:24243/mediasystem/backend/server.php?action=get-image&file_id=${image.media_id})`,
                                    backgroundSize: 'contain',
                                    backgroundRepeat: 'no-repeat',
                                    backgroundPosition: 'center',
                                    borderRadius: '25px',
                                }}
                            />
                            <CardContent>
                                <Typography variant="subtitle1" gutterBottom>
                                    From: {image.created_by}
                                </Typography>
                                <Typography variant="body2">Status: {image.status}</Typography>
                                {image.annotations && (
                                    <Typography variant="body2">
                                        Annotations: {image.annotations}
                                    </Typography>
                                )}
                                {image.assigned_to ? (
                                    <Typography variant="body2" color="text.secondary">
                                        Assigned to: {image.assigned_to}
                                    </Typography>
                                ) : (
                                    experts.length > 0 && (
                                        <Select
                                            fullWidth
                                            displayEmpty
                                            value=""
                                            onChange={(e) =>
                                                handleAssignmentChange(e.target.value, image.media_id)
                                            }
                                            sx={{ mt: 2 }}
                                        >
                                            <MenuItem value="" disabled>
                                                {experts.length > 0
                                                    ? 'Select Expert'
                                                    : 'No Experts Available'}
                                            </MenuItem>
                                            {experts.map((expert) => (
                                                <MenuItem key={expert.username} value={expert.username}>
                                                    {expert.username}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    )
                                )}
                            </CardContent>
                            <CardActions>
    <Button
        fullWidth
        variant="contained"
        href={`/review-media/${image.id}`}
        style={{ display: image.assigned_to === decode.username ? 'block' : 'none' }}
    >
        Review
    </Button>
    <Button
        fullWidth
        variant="outlined"
        onClick={() => handleChatButtonClick(image.id)}
    >
        Chat
    </Button>
</CardActions>

                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Dialog open={chatDialogOpen} onClose={() => setChatDialogOpen(false)}>
                <DialogTitle>Chat</DialogTitle>
                <DialogContent>
                    <div style={{ height: 300, overflowY: 'auto' }}>
                        {chatMessages.map((chat, index) => (
                            <div key={index}>
                                <strong>{chat.sender}</strong>: {chat.texts}
                            </div>
                        ))}
                    </div>
                    <TextField
                        fullWidth
                        label="Type your message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendChat()}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setChatDialogOpen(false)} color="primary">
                        Close
                    </Button>
                    <Button onClick={handleSendChat} color="primary" variant="contained">
                        Send
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default FetchImages;
