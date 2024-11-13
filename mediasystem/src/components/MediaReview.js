import React, { useState } from 'react';
import './MediaReview.css';

const MediaReview = () => {
    const [annotations, setAnnotations] = useState([]);
    const [isMouseDown, setIsMouseDown] = useState(false); // Track mouse down state

    const generateRandomColor = () => {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    };

    const handleMouseDown = (e) => {
        setIsMouseDown(true); // Start placing annotations on mouse down
        const { offsetX, offsetY } = e.nativeEvent;
        const newAnnotation = {
            x: offsetX,
            y: offsetY,
            color: generateRandomColor() // Assign a random color for the initial color
        };
        setAnnotations([...annotations, newAnnotation]);
    };

    const handleMouseUp = () => {
        setIsMouseDown(false); // Stop placing annotations when the mouse button is released
    };

    const handleMouseMove = (e) => {
        if (isMouseDown) {
            const { offsetX, offsetY } = e.nativeEvent;
            const newAnnotation = {
                x: offsetX,
                y: offsetY,
                color: generateRandomColor() // Assign a random color for the initial color
            };
            setAnnotations([...annotations, newAnnotation]);
        }
    };

    return (
        <div className="media-review">
            <h3>Media Review</h3>
            <div
                className="image-container"
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove} // Place annotations as the mouse moves while pressed
            >
                <img src="https://media.istockphoto.com/id/1045035708/vector/duckling-simple-vector-icon.jpg?s=612x612&w=0&k=20&c=DPyR6_meVD32JBRKEZiwrAkn0kFY5PT4qxiQblfqkjs=" alt="Review media" />
                {annotations.map((anno, index) => (
                    <div
                        key={index}
                        className="annotation-marker flashing"
                        style={{
                            top: anno.y,
                            left: anno.x,
                            backgroundColor: anno.color // Initial color
                        }}
                    />
                ))}
            </div>
            <p>Hold the mouse button to add annotations</p>
        </div>
    );
};

export default MediaReview;
