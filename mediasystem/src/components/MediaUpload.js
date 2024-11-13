// src/components/MediaUpload.js
import React, { useState } from 'react';
import './MediaUpload.css';

const MediaUpload = () => {
    const [file, setFile] = useState(null);
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState("");

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
        setErrors({});
    };

    const validateForm = () => {
        let formErrors = {};
        if (!file) formErrors.file = "Please upload a media file.";
        return formErrors;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formErrors = validateForm();
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
        } else {
            // Simulate successful submission
            setSuccessMessage("File uploaded successfully!");
            setFile(null);
        }
    };

    return (
        <div className="media-upload-form">
            <h3>Upload Media</h3>
            <form onSubmit={handleSubmit}>
                <label htmlFor="file">Select a file:</label>
                <input type="file" id="file" onChange={handleFileChange} />
                {errors.file && <p className="error">{errors.file}</p>}

                <button className="upload-button" type="submit">Upload</button>
                {successMessage && <p className="success">{successMessage}</p>}
            </form>
        </div>
    );
};

export default MediaUpload;
