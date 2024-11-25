import React, { useState } from 'react';
import { Button, TextField, Box, Alert, Tabs, Tab } from '@mui/material';

const ManageTasksAndMedia = ({ token }) => {
    const [taskTitle, setTaskTitle] = useState('');
    const [taskDescription, setTaskDescription] = useState('');
    const [mediaMetadata, setMediaMetadata] = useState('');
    const [mediaFile, setMediaFile] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleFileChange = (e) => {
        setMediaFile(e.target.files[0]);
    };

    const handleSubmit = async () => {
        if (!taskTitle || !taskDescription) {
            setError("Task title and description are required.");
            return;
        }

        if (!mediaFile || !mediaMetadata) {
            setError("Media file and metadata are required.");
            return;
        }

        setError('');
        setSuccess('');

        const formData = new FormData();
        formData.append('title', taskTitle);
        formData.append('description', taskDescription);
        formData.append('file', mediaFile);
        formData.append('metadata', mediaMetadata);

        try {
            const response = await fetch('http://localhost:24243/mediasystem/backend/server.php?action=create-task-with-media', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            const data = await response.json();

            if (data.status === 'success') {
                setSuccess("Task and media linked successfully!");
                setTaskTitle('');
                setTaskDescription('');
                setMediaMetadata('');
                setMediaFile(null);
            } else {
                setError(data.message || "An error occurred.");
            }
        } catch (error) {
            console.error("Submission Error:", error);
            setError("An unexpected error occurred.");
        }
    };

    return (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" width="400px" margin="auto">
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            <TextField
                label="Task Title"
                variant="outlined"
                fullWidth
                margin="normal"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
            />
            <TextField
                label="Task Description"
                variant="outlined"
                fullWidth
                margin="normal"
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
            />
            <TextField
                label="Media Metadata"
                variant="outlined"
                fullWidth
                margin="normal"
                value={mediaMetadata}
                onChange={(e) => setMediaMetadata(e.target.value)}
            />
            <input
                type="file"
                onChange={handleFileChange}
                style={{ margin: '16px 0' }}
            />
            <Button variant="contained" color="primary" fullWidth onClick={handleSubmit}>
                Create Task and Link Media
            </Button>
        </Box>
    );
};

export default ManageTasksAndMedia;
