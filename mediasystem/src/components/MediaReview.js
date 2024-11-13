// src/components/MediaReview.js
import React, { useState } from 'react';
import './MediaReview.css';

const MediaReview = () => {
    const [annotations, setAnnotations] = useState([]);

    const handleImageClick = (e) => {
        const { offsetX, offsetY } = e.nativeEvent;
        const newAnnotation = { x: offsetX, y: offsetY };
        setAnnotations([...annotations, newAnnotation]);
    };

    return (
        <div className="media-review">
            <h3>Media Review</h3>
            <div className="image-container" onClick={handleImageClick}>
                <img src="https://media.istockphoto.com/id/1045035708/vector/duckling-simple-vector-icon.jpg?s=612x612&w=0&k=20&c=DPyR6_meVD32JBRKEZiwrAkn0kFY5PT4qxiQblfqkjs=" alt="Review media" />
                {annotations.map((anno, index) => (
                    <div
                        key={index}
                        className="annotation-marker"
                        style={{ top: anno.y, left: anno.x }}
                    />
                ))}
            </div>
            <p>Click on the image to add annotations</p>
        </div>
    );
};

export default MediaReview;
