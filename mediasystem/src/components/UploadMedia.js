import React, { useState } from 'react';
import { Button, TextField, Box, Alert, Typography } from '@mui/material';

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
            const response = await fetch(
                'http://localhost:24243/mediasystem/backend/server.php?action=create-task-with-media',
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                    body: formData,
                }
            );

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
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            width="400px"
            margin="auto"
            mt={4}
        >
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            <Typography variant="h6" sx={{ mb: 2 }}>
                Create Task and Link Media
            </Typography>

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

            <Button
                variant="contained"
                component="label"
                fullWidth
                sx={{ mt: 2 }}
            >
                Upload Media
                <input
                    type="file"
                    hidden
                    onChange={handleFileChange}
                />
            </Button>

            {mediaFile && (
                <Box
                    mt={2}
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    border="1px solid #ccc"
                    borderRadius="8px"
                    p={2}
                    width="100%"
                >
                    <Typography variant="body2" sx={{ mb: 1 }}>
                        Selected File: {mediaFile.name}
                    </Typography>
                    {mediaFile.type.startsWith('image/') && (
                        <img
                            src={URL.createObjectURL(mediaFile)}
                            alt="Preview"
                            style={{
                                maxWidth: '100%',
                                height: 'auto',
                                maxHeight: '200px',
                                borderRadius: '4px',
                            }}
                        />
                    )}
                    {mediaFile.type.startsWith('video/') && (
                        <video
                            controls
                            src={URL.createObjectURL(mediaFile)}
                            style={{
                                maxWidth: '100%',
                                maxHeight: '200px',
                                marginTop: '10px',
                                borderRadius: '4px',
                            }}
                        />
                    )}
                </Box>
            )}

            <Button
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mt: 2 }}
                onClick={handleSubmit}
                disabled={!taskTitle || !taskDescription || !mediaMetadata || !mediaFile}
            >
                Submit
            </Button>
        </Box>
    );
};

export default ManageTasksAndMedia;
