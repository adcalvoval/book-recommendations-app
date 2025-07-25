import React from 'react';
import type { Book } from '../types';
import type { BookRecommendation } from '../utils/recommendations';
import BookCover from './BookCover';

interface RecommendationListProps {
  recommendations: BookRecommendation[];
  onAddToLibrary: (book: BookRecommendation) => void;
  onRejectRecommendation: (book: BookRecommendation) => void;
  onLikeRecommendation: (book: BookRecommendation) => void;
  likedRecommendationIds: string[];
  userBooks: Book[];
  isLoading?: boolean;
}

const RecommendationList: React.FC<RecommendationListProps> = ({ 
  recommendations, 
  onAddToLibrary, 
  onRejectRecommendation,
  onLikeRecommendation,
  likedRecommendationIds,
  userBooks, 
  isLoading = false 
}) => {
  if (isLoading) {
    return (
      <div className="recommendations-loading">
        <div className="loading-spinner"></div>
        <p>Loading personalized recommendations from New York Times and Google Books...</p>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="recommendations-empty">
        <p>Add some books to your library to get personalized recommendations!</p>
      </div>
    );
  }

  const renderStars = (rating: number) => {
    return '★'.repeat(Math.floor(rating)) + (rating % 1 >= 0.5 ? '☆' : '') + '☆'.repeat(5 - Math.ceil(rating));
  };

  const getScoreColor = (score: number) => {
    if (score >= 20) return '#4CAF50'; // Green
    if (score >= 10) return '#FF9800'; // Orange
    return '#757575'; // Gray
  };

  const isBookInLibrary = (book: BookRecommendation) => {
    return userBooks.some(userBook => 
      userBook.title.toLowerCase() === book.title.toLowerCase() && 
      userBook.author.toLowerCase() === book.author.toLowerCase()
    );
  };

  return (
    <div className="recommendations">
      <h3>Recommended for You</h3>
      <div className="recommendations-grid">
        {recommendations.map(book => (
          <div key={book.id} className="recommendation-card">
            <BookCover book={book} size="medium" />
            <div className="book-content">
              <div className="recommendation-header">
                <div className="book-title-section">
                  <h4>{book.title}</h4>
                </div>
                <div 
                  className="recommendation-score"
                  style={{ backgroundColor: getScoreColor(book.score) }}
                >
                  {Math.round(book.score)}%
                </div>
              </div>
            <p className="book-author">by {book.author}</p>
            <div className="book-genres">
              {book.genre.map(genre => (
                <span key={genre} className="genre-tag">{genre}</span>
              ))}
            </div>
            <div className="book-rating">
              <span className="stars">{renderStars(book.rating)}</span>
              <span className="rating-number">({book.rating}/5)</span>
            </div>
            {book.year && <p className="book-year">Published: {book.year}</p>}
            {book.summary && (
              <div className="book-summary">
                <h5>Summary:</h5>
                <p>{book.summary}</p>
              </div>
            )}
            {book.description && (
              <div className="book-description">
                <h5>Description:</h5>
                <p>{book.description}</p>
              </div>
            )}
            {book.similarTo && (
              <div className="similarity-note">
                <span className="similarity-badge">Similar to "{book.similarTo}"</span>
              </div>
            )}
            <div className="recommendation-reasons">
              <h5>Why we recommend this:</h5>
              <ul>
                {book.reasons.map((reason, index) => (
                  <li key={index}>{reason}</li>
                ))}
              </ul>
            </div>
            
            <div className="recommendation-actions">
              <div className="like-action">
                <button 
                  onClick={() => onLikeRecommendation(book)}
                  className={`btn btn-like ${likedRecommendationIds.includes(book.id) ? 'liked' : ''}`}
                  title={likedRecommendationIds.includes(book.id) ? "You liked this recommendation" : "Like this recommendation to improve future suggestions"}
                >
                  {likedRecommendationIds.includes(book.id) ? '❤️ Liked' : '🤍 Like'}
                </button>
              </div>
              
              {isBookInLibrary(book) ? (
                <div className="already-in-library">
                  <span className="in-library-badge">✓ Already in Library</span>
                </div>
              ) : (
                <div className="action-buttons">
                  <button 
                    onClick={() => onAddToLibrary(book)}
                    className="btn btn-add-to-library"
                    title="Add this book to your reading library"
                  >
                    📚 Add to Library
                  </button>
                  <button 
                    onClick={() => onRejectRecommendation(book)}
                    className="btn btn-reject"
                    title="Not interested - get a different recommendation"
                  >
                    ❌ Not Interested
                  </button>
                </div>
              )}
            </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendationList;