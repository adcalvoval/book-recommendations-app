import React, { useState } from 'react';
import { getClaudeRecommendations } from '../utils/claudeRecommendations';
import { getBackendRecommendations, checkBackendHealth } from '../utils/backendApi';
import { storage } from '../utils/storage';
import { fetchBookCover } from '../utils/bookCovers';
import RatingModal from './RatingModal';
import type { Book, WishlistItem } from '../types';

interface BookRecommendation {
  id: string;
  title: string;
  author: string;
  summary: string;
  year?: number;
  coverUrl?: string;
  rating?: number; // Out of 5
}

interface SearchBarProps {
  userBooks: Book[];
  onAddBook: (book: Book) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ userBooks, onAddBook }) => {
  const [query, setQuery] = useState('');
  const [recommendations, setRecommendations] = useState<BookRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addedToWishlist, setAddedToWishlist] = useState<Set<string>>(new Set());
  const [addedToLibrary, setAddedToLibrary] = useState<Set<string>>(new Set());
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<BookRecommendation | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      setError('Please enter a search query');
      return;
    }

    setIsLoading(true);
    setError(null);
    setRecommendations([]);

    try {
      console.log(`Searching for: "${query}"`);
      
      // Try backend API first, then Claude API direct, then fallback
      try {
        // Check if backend is running and try it first
        const backendHealthy = await checkBackendHealth();
        
        if (backendHealthy) {
          console.log('✅ Backend is healthy, using backend API');
          const backendResults = await getBackendRecommendations(query, userBooks);
          
          const simplifiedResults: BookRecommendation[] = backendResults.map(book => ({
            id: book.id,
            title: book.title,
            author: book.author,
            summary: book.description || book.summary || 'No summary available.',
            year: book.year,
            coverUrl: book.coverUrl,
            rating: book.rating
          }));
          
          setRecommendations(simplifiedResults.slice(0, 5));
          return; // Success with backend
        } else {
          console.warn('⚠️ Backend not available, trying direct Claude API');
        }
        
        // Fallback to direct Claude API
        const results = await getClaudeRecommendations(query, userBooks);
        
        const simplifiedResults: BookRecommendation[] = results.map(book => ({
          id: book.id,
          title: book.title,
          author: book.author,
          summary: book.description || book.summary || 'No summary available.',
          year: book.year,
          coverUrl: book.coverUrl,
          rating: book.rating
        }));
        
        setRecommendations(simplifiedResults.slice(0, 5));
        
      } catch (apiError) {
        console.error('Both backend and Claude API failed:', apiError);
        
        // Show error message instead of mock recommendations
        const errorMessage = apiError instanceof Error ? apiError.message : 'Unable to get book recommendations at the moment';
        setError(`${errorMessage}. Please try again later or check that the backend server is running.`);
        
        console.log('All recommendation APIs failed, showing error message');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err.message : 'Failed to get recommendations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };


  const handleAddToWishlist = async (book: BookRecommendation) => {
    try {
      // Convert BookRecommendation to Book format for enhanced cover fetching
      const bookForCoverFetch: Book = {
        id: book.id,
        title: book.title,
        author: book.author,
        genre: [], // SearchBar doesn't have genre info
        year: book.year,
        rating: book.rating || 0, // Default to 0 if no rating
        coverUrl: book.coverUrl,
        summary: book.summary,
        description: '',
        tags: []
      };

      // Fetch enhanced cover if current cover seems unreliable or missing
      let enhancedCoverUrl = book.coverUrl;
      if (!book.coverUrl || book.coverUrl.includes('placeholder') || book.coverUrl.includes('via.placeholder')) {
        console.log(`🔍 Fetching enhanced cover for "${book.title}" by ${book.author}...`);
        const fetchedCover = await fetchBookCover(bookForCoverFetch);
        if (fetchedCover && fetchedCover !== enhancedCoverUrl) {
          enhancedCoverUrl = fetchedCover;
          console.log(`✅ Found enhanced cover for "${book.title}"`);
        }
      }

      const wishlistItem: WishlistItem = {
        id: book.id,
        title: book.title,
        author: book.author,
        summary: book.summary,
        year: book.year,
        coverUrl: enhancedCoverUrl,
        rating: book.rating,
        dateAdded: new Date().toISOString(),
        source: 'search'
      };

      storage.addToWishlist(wishlistItem);
      setAddedToWishlist(prev => new Set([...prev, book.id]));
    } catch (error) {
      console.warn('Error enhancing cover for wishlist item:', error);
      // Fallback to original behavior
      const wishlistItem: WishlistItem = {
        id: book.id,
        title: book.title,
        author: book.author,
        summary: book.summary,
        year: book.year,
        coverUrl: book.coverUrl,
        rating: book.rating,
        dateAdded: new Date().toISOString(),
        source: 'search'
      };
      storage.addToWishlist(wishlistItem);
      setAddedToWishlist(prev => new Set([...prev, book.id]));
    }
  };

  const handleAddToLibrary = (book: BookRecommendation) => {
    setSelectedBook(book);
    setRatingModalOpen(true);
  };

  const handleRatingConfirm = (userRating: number) => {
    if (!selectedBook) return;

    const libraryBook: Book = {
      id: `lib-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: selectedBook.title,
      author: selectedBook.author,
      genre: ['General'], // Default genre since recommendations don't include detailed genre info
      rating: userRating,
      description: selectedBook.summary,
      summary: selectedBook.summary,
      year: selectedBook.year,
      coverUrl: selectedBook.coverUrl
    };

    onAddBook(libraryBook);
    setAddedToLibrary(prev => new Set([...prev, selectedBook.id]));
    setRatingModalOpen(false);
    setSelectedBook(null);
  };

  const handleRatingCancel = () => {
    setRatingModalOpen(false);
    setSelectedBook(null);
  };

  const handleClear = () => {
    setQuery('');
    setRecommendations([]);
    setError(null);
    setAddedToWishlist(new Set());
    setAddedToLibrary(new Set());
  };

  return (
    <div className="search-bar-container">
      <form onSubmit={handleSearch} className="search-form">
        <div className="search-input-wrapper">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask for book recommendations... (e.g., 'I want to read a dark thriller set in Scandinavia' or 'recommend more books by Stephen King')"
            className="search-input"
            disabled={isLoading}
          />
          <div className="search-buttons">
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="btn btn-clear"
                disabled={isLoading}
              >
                Clear
              </button>
            )}
            <button
              type="submit"
              className="btn btn-primary btn-search"
              disabled={isLoading || !query.trim()}
            >
              {isLoading ? '🤖 Asking Claude...' : '🔍 Search'}
            </button>
          </div>
        </div>
      </form>

      {error && (
        <div className="search-error">
          <strong>Error:</strong> {error}
        </div>
      )}

      {isLoading && (
        <div className="search-loading">
          <div className="loading-spinner"></div>
          <p>Claude is thinking about your request...</p>
        </div>
      )}

      {recommendations.length > 0 && (
        <div className="search-results">
          <h3>📚 Claude's Recommendations</h3>
          <ul className="recommendations-list">
            {recommendations.map((book) => (
              <li key={book.id} className="recommendation-item">
                <div className="recommendation-cover">
                  <img 
                    src={book.coverUrl || 'https://via.placeholder.com/80x120/cccccc/666666?text=No+Cover'} 
                    alt={`Cover of ${book.title}`}
                    className="book-cover-thumbnail"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/80x120/cccccc/666666?text=No+Cover';
                    }}
                  />
                </div>
                <div className="recommendation-content">
                  <div className="recommendation-header">
                    <strong className="recommendation-title">{book.title}</strong>
                    <span className="recommendation-author"> by {book.author}</span>
                    <div className="recommendation-meta">
                      {book.year && <span className="book-year">({book.year})</span>}
                      {book.rating && (
                        <div className="book-rating">
                          <span className="rating-stars">
                            {'★'.repeat(Math.floor(book.rating))}
                            {book.rating % 1 !== 0 && '☆'}
                            {'☆'.repeat(5 - Math.ceil(book.rating))}
                          </span>
                          <span className="rating-number">{book.rating.toFixed(1)}/5</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="recommendation-summary">{book.summary}</p>
                </div>
                <div className="recommendation-actions">
                  <button
                    onClick={() => handleAddToLibrary(book)}
                    disabled={addedToLibrary.has(book.id)}
                    className={`btn ${addedToLibrary.has(book.id) ? 'btn-success' : 'btn-primary'}`}
                  >
                    {addedToLibrary.has(book.id) ? '✓ Added to Library' : '📚 Add to Library'}
                  </button>
                  <button
                    onClick={() => handleAddToWishlist(book)}
                    disabled={addedToWishlist.has(book.id)}
                    className={`btn ${addedToWishlist.has(book.id) ? 'btn-success' : 'btn-secondary'}`}
                  >
                    {addedToWishlist.has(book.id) ? '✓ Added to Wishlist' : '+ Add to Wishlist'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <RatingModal
        isOpen={ratingModalOpen}
        bookTitle={selectedBook?.title || ''}
        bookAuthor={selectedBook?.author || ''}
        onConfirm={handleRatingConfirm}
        onCancel={handleRatingCancel}
      />
    </div>
  );
};

export default SearchBar;