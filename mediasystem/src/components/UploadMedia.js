import React, { useState } from 'react';
import { Button, TextField, Box, Alert } from '@mui/material';

const UploadMedia = ({ token }) => {
    const [metadata, setMetadata] = useState('');
    const [file, setFile] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleMetadataChange = (e) => {
        setMetadata(e.target.value);
    };

    const handleSubmit = async () => {
        if (!file || !metadata) {
            setError("File and metadata are required.");
            return;
        }

        setError('');
        setSuccess('');

        const formData = new FormData();
        formData.append('file', file);
        formData.append('metadata', metadata);

        try {
            const response = await fetch('http://localhost:24243/mediasystem/backend/server.php?action=upload-media', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            const data = await response.json();

            if (data.status === 'success') {
                setSuccess("Media uploaded successfully!");
            } else {
                setError(data.message || "An error occurred.");
            }
        } catch (error) {
            console.error("Upload Error:", error);
            setError("An unexpected error occurred.");
        }
    };

    return (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" width="300px" margin="auto">
            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}

            <TextField
                label="Metadata"
                variant="outlined"
                fullWidth
                margin="normal"
                value={metadata}
                onChange={handleMetadataChange}
            />

            <input type="file" onChange={handleFileChange} />

            <Button variant="contained" color="primary" fullWidth onClick={handleSubmit} sx={{ mt: 2 }}>
                Upload Media
            </Button>
        </Box>
    );
};

export default UploadMedia;
