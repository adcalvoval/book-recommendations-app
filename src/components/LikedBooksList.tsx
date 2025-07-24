import React from 'react';
import type { Book } from '../types';
import type { BookRecommendation } from '../utils/recommendations';
import BookTags from './BookTags';
import BookCover from './BookCover';

interface LikedBooksListProps {
  likedBooks: BookRecommendation[];
  onAddToLibrary: (book: BookRecommendation) => void;
  onRemoveFromLiked: (bookId: string) => void;
  userBooks: Book[];
  isLoading?: boolean;
}

const LikedBooksList: React.FC<LikedBooksListProps> = ({
  likedBooks,
  onAddToLibrary,
  onRemoveFromLiked,
  userBooks,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <div className="liked-books-loading">
        <div className="loading-spinner"></div>
        <p>Loading your liked books...</p>
      </div>
    );
  }

  if (likedBooks.length === 0) {
    return (
      <div className="liked-books-empty">
        <h3>No Liked Books Yet</h3>
        <p>When you like recommendations, they'll appear here for easy access!</p>
        <p>💡 Use the heart button on recommendations to build your liked books collection.</p>
      </div>
    );
  }

  const renderStars = (rating: number) => {
    return '★'.repeat(Math.floor(rating)) + (rating % 1 >= 0.5 ? '☆' : '') + '☆'.repeat(5 - Math.ceil(rating));
  };

  const isBookInLibrary = (book: BookRecommendation) => {
    return userBooks.some(userBook => 
      userBook.title.toLowerCase() === book.title.toLowerCase() && 
      userBook.author.toLowerCase() === book.author.toLowerCase()
    );
  };

  const formatLikedDate = (likedAt?: string) => {
    if (!likedAt) return 'Recently liked';
    
    const date = new Date(likedAt);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return `Liked ${Math.round(diffInHours)} hours ago`;
    } else if (diffInHours < 168) {
      return `Liked ${Math.round(diffInHours / 24)} days ago`;
    } else {
      return `Liked on ${date.toLocaleDateString()}`;
    }
  };

  // Sort by liked date (most recent first)
  const sortedLikedBooks = [...likedBooks].sort((a, b) => {
    const aDate = a.likedAt ? new Date(a.likedAt).getTime() : 0;
    const bDate = b.likedAt ? new Date(b.likedAt).getTime() : 0;
    return bDate - aDate;
  });

  return (
    <div className="liked-books">
      <h3>Your Liked Books ({likedBooks.length})</h3>
      <p className="liked-books-subtitle">
        Books you've liked from recommendations - consider adding them to your library!
      </p>
      
      <div className="liked-books-grid">
        {sortedLikedBooks.map(book => (
          <div key={book.id} className="liked-book-card">
            <BookCover book={book} size="medium" />
            <div className="book-content">
              <div className="liked-book-header">
                <div className="book-title-section">
                  <h4>{book.title}</h4>
                  <div className="liked-indicator">
                    <span className="liked-badge">❤️ Liked</span>
                    <span className="liked-date">{formatLikedDate(book.likedAt)}</span>
                  </div>
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
              
              {book.tags && book.tags.length > 0 && (
                <BookTags tags={book.tags} />
              )}
              
              {book.summary && (
                <div className="book-summary">
                  <h5>Summary:</h5>
                  <p>{book.summary}</p>
                </div>
              )}
              
              {book.reasons && book.reasons.length > 0 && (
                <div className="recommendation-reasons">
                  <h5>Why this was recommended:</h5>
                  <ul>
                    {book.reasons.map((reason, index) => (
                      <li key={index}>{reason}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="liked-book-actions">
                {isBookInLibrary(book) ? (
                  <div className="already-in-library">
                    <span className="in-library-badge">✓ Already in Library</span>
                  </div>
                ) : (
                  <button 
                    onClick={() => onAddToLibrary(book)}
                    className="btn btn-add-to-library"
                    title="Add this liked book to your reading library"
                  >
                    📚 Add to Library
                  </button>
                )}
                
                <button 
                  onClick={() => onRemoveFromLiked(book.id)}
                  className="btn btn-remove-liked"
                  title="Remove from liked books"
                >
                  💔 Remove from Liked
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LikedBooksList;