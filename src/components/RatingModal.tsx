import React, { useState } from 'react';

interface RatingModalProps {
  isOpen: boolean;
  bookTitle: string;
  bookAuthor: string;
  onConfirm: (rating: number) => void;
  onCancel: () => void;
}

const RatingModal: React.FC<RatingModalProps> = ({
  isOpen,
  bookTitle,
  bookAuthor,
  onConfirm,
  onCancel
}) => {
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);

  if (!isOpen) return null;

  const handleStarClick = (value: number) => {
    setRating(value);
  };

  const handleConfirm = () => {
    if (rating > 0) {
      onConfirm(rating);
      setRating(0);
      setHoveredRating(0);
    }
  };

  const handleCancel = () => {
    setRating(0);
    setHoveredRating(0);
    onCancel();
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 0.5; i <= 5; i += 0.5) {
      const isHalf = i % 1 !== 0;
      const displayValue = hoveredRating || rating;
      
      let filled = false;
      if (isHalf) {
        filled = displayValue >= i;
      } else {
        filled = displayValue >= i;
      }

      stars.push(
        <button
          key={i}
          type="button"
          className={`star-button ${filled ? 'filled' : ''} ${isHalf ? 'half-star' : 'full-star'}`}
          onClick={() => handleStarClick(i)}
          onMouseEnter={() => setHoveredRating(i)}
          onMouseLeave={() => setHoveredRating(0)}
        >
          {isHalf ? '☆' : '★'}
        </button>
      );
    }
    return stars;
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Rate this book</h3>
          <button 
            className="modal-close"
            onClick={handleCancel}
            type="button"
          >
            ×
          </button>
        </div>
        
        <div className="modal-body">
          <div className="book-info">
            <strong>{bookTitle}</strong>
            <span className="book-author-modal"> by {bookAuthor}</span>
          </div>
          
          <div className="rating-section">
            <p>How would you rate this book?</p>
            <div className="star-rating">
              {renderStars()}
            </div>
            <div className="rating-display">
              {rating > 0 && (
                <span className="current-rating">
                  {rating} star{rating !== 1 ? 's' : ''} out of 5
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="modal-footer">
          <button 
            className="btn btn-secondary"
            onClick={handleCancel}
            type="button"
          >
            Cancel
          </button>
          <button 
            className="btn btn-primary"
            onClick={handleConfirm}
            disabled={rating === 0}
            type="button"
          >
            Add to Library
          </button>
        </div>
      </div>
    </div>
  );
};

export default RatingModal;