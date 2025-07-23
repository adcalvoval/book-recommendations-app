import React from 'react';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'small' | 'medium' | 'large';
  showNumber?: boolean;
  className?: string;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  onRatingChange,
  readonly = false,
  size = 'medium',
  showNumber = true,
  className = ''
}) => {
  const maxStars = 5;
  const isInteractive = !readonly && onRatingChange;

  const getSizeClass = () => {
    switch (size) {
      case 'small': return 'star-rating-small';
      case 'large': return 'star-rating-large';
      default: return 'star-rating-medium';
    }
  };

  const renderStar = (starIndex: number) => {
    const starValue = starIndex + 1;
    const halfStarValue = starIndex + 0.5;
    
    let starType: 'empty' | 'half' | 'full' = 'empty';
    
    if (rating >= starValue) {
      starType = 'full';
    } else if (rating >= halfStarValue) {
      starType = 'half';
    }

    const handleStarClick = (value: number) => {
      if (isInteractive) {
        onRatingChange(value);
      }
    };

    return (
      <div key={starIndex} className="star-container">
        {isInteractive && (
          <>
            {/* Half star clickable area */}
            <button
              type="button"
              className="star-half-click"
              onClick={() => handleStarClick(halfStarValue)}
              onMouseEnter={() => {}} // Could add hover preview
              title={`Rate ${halfStarValue} stars`}
            />
            {/* Full star clickable area */}
            <button
              type="button"
              className="star-full-click"
              onClick={() => handleStarClick(starValue)}
              onMouseEnter={() => {}} // Could add hover preview
              title={`Rate ${starValue} stars`}
            />
          </>
        )}
        
        <div className={`star ${starType === 'full' ? 'star-filled' : starType === 'half' ? 'star-half-filled' : 'star-empty'}`}>
          {starType === 'half' ? (
            <div className="star-half-wrapper">
              <span className="star-half-background">★</span>
              <span className="star-half-foreground">★</span>
            </div>
          ) : (
            <span>★</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`star-rating ${getSizeClass()} ${isInteractive ? 'interactive' : 'readonly'} ${className}`}>
      <div className="stars-container">
        {Array.from({ length: maxStars }, (_, index) => renderStar(index))}
      </div>
      {showNumber && (
        <span className="rating-number">
          ({rating.toFixed(1)}/5)
        </span>
      )}
    </div>
  );
};

export default StarRating;