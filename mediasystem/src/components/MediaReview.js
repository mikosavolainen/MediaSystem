import React, { useState } from 'react';
import './MediaReview.css';
import { BlockPicker } from 'react-color';

const MediaReview = () => {
    const [annotations, setAnnotations] = useState([]);
    const [color, setColor] = useState("#000000"); // Default color set to black

    // Handle color change
    const handleChangeComplete = (colo) => {
        setColor(colo.hex); // Set the color to the hex value
    };

    // Handle image click to add annotation
    const handleImageClick = (e) => {
        const { offsetX, offsetY } = e.nativeEvent;
        const newAnnotation = {
            x: offsetX,
            y: offsetY,
            color: color // Use the selected color
        };
        setAnnotations([...annotations, newAnnotation]);
    };

    return (
        <div className="media-review">
            <h3>Media Review</h3>

            {/* BlockPicker for selecting color */}
            <BlockPicker
                color={color} // Bind selected color to BlockPicker
                onChangeComplete={handleChangeComplete} // Update color when selection changes
            />

            {/* Image container with onClick to place annotations */}
            <div className="image-container" onClick={handleImageClick}>
                <img
                    src="https://media.istockphoto.com/id/1045035708/vector/duckling-simple-vector-icon.jpg?s=612x612&w=0&k=20&c=DPyR6_meVD32JBRKEZiwrAkn0kFY5PT4qxiQblfqkjs="
                    alt="Review media"
                />

                {/* Display annotations */}
                {annotations.map((anno, index) => (
                    <div
                        key={index}
                        className="annotation-marker flashing"

                        style={{
                            top: anno.y,
                            left: anno.x,
                            backgroundColor: anno.color // Set annotation color
                        }}
                    />
                ))}
            </div>

            <p>Click on the image to add annotations</p>
        </div>
    );
};

export default MediaReview;
