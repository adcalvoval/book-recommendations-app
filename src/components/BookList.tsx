import React, { useState, useMemo, useEffect } from 'react';
import type { Book } from '../types';
import EditableText from './EditableText';
import EditableTags from './EditableTags';
import BookCover from './BookCover';
import StarRating from './StarRating';
import BookSortFilter, { type SortOption } from './BookSortFilter';
import { refreshMultipleBookCovers } from '../utils/bookCovers';

interface BookListProps {
  books: Book[];
  onRemoveBook: (id: string) => void;
  onBookUpdate?: (book: Book) => void;
}

const SORT_PREFERENCE_KEY = 'book-sort-preference';
const SEARCH_PREFERENCE_KEY = 'book-search-query';

const BookList: React.FC<BookListProps> = ({ books, onRemoveBook, onBookUpdate }) => {
  // Load sort preference from localStorage, default to 'title-asc'
  const [sortBy, setSortBy] = useState<SortOption>(() => {
    const saved = localStorage.getItem(SORT_PREFERENCE_KEY);
    return (saved as SortOption) || 'title-asc';
  });

  // Search state
  const [searchQuery, setSearchQuery] = useState<string>(() => {
    const saved = localStorage.getItem(SEARCH_PREFERENCE_KEY);
    return saved || '';
  });

  // Cover refresh state
  const [isRefreshingCovers, setIsRefreshingCovers] = useState(false);
  const [coverUrls, setCoverUrls] = useState<Map<string, string>>(new Map());

  // Save sort preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem(SORT_PREFERENCE_KEY, sortBy);
  }, [sortBy]);

  // Save search query to localStorage when it changes
  useEffect(() => {
    localStorage.setItem(SEARCH_PREFERENCE_KEY, searchQuery);
  }, [searchQuery]);

  // Sorting function
  const sortBooks = (books: Book[], sortOption: SortOption): Book[] => {
    const booksCopy = [...books];
    
    switch (sortOption) {
      case 'title-asc':
        return booksCopy.sort((a, b) => a.title.toLowerCase().localeCompare(b.title.toLowerCase()));
      case 'title-desc':
        return booksCopy.sort((a, b) => b.title.toLowerCase().localeCompare(a.title.toLowerCase()));
      case 'year-asc':
        return booksCopy.sort((a, b) => {
          const yearA = a.year || 0;
          const yearB = b.year || 0;
          if (yearA === yearB) return a.title.toLowerCase().localeCompare(b.title.toLowerCase());
          return yearA - yearB;
        });
      case 'year-desc':
        return booksCopy.sort((a, b) => {
          const yearA = a.year || 0;
          const yearB = b.year || 0;
          if (yearA === yearB) return a.title.toLowerCase().localeCompare(b.title.toLowerCase());
          return yearB - yearA;
        });
      case 'rating-asc':
        return booksCopy.sort((a, b) => {
          const ratingA = a.rating || 0;
          const ratingB = b.rating || 0;
          if (ratingA === ratingB) return a.title.toLowerCase().localeCompare(b.title.toLowerCase());
          return ratingA - ratingB;
        });
      case 'rating-desc':
        return booksCopy.sort((a, b) => {
          const ratingA = a.rating || 0;
          const ratingB = b.rating || 0;
          if (ratingA === ratingB) return a.title.toLowerCase().localeCompare(b.title.toLowerCase());
          return ratingB - ratingA;
        });
      case 'added-asc':
        return booksCopy.sort((a, b) => a.id.localeCompare(b.id));
      case 'added-desc':
        return booksCopy.sort((a, b) => b.id.localeCompare(a.id));
      default:
        return booksCopy;
    }
  };

  // Search filtering function
  const filterBooks = (books: Book[], query: string): Book[] => {
    if (!query.trim()) return books;
    
    const searchTerm = query.toLowerCase().trim();
    return books.filter(book => 
      book.title.toLowerCase().includes(searchTerm) ||
      book.author.toLowerCase().includes(searchTerm)
    );
  };

  // Memoized filtered and sorted books
  const filteredBooks = useMemo(() => filterBooks(books, searchQuery), [books, searchQuery]);
  const sortedBooks = useMemo(() => sortBooks(filteredBooks, sortBy), [filteredBooks, sortBy]);

  if (books.length === 0) {
    return (
      <div className="book-list-empty">
        <p>No books added yet. Add some books you've read to start building your library!</p>
      </div>
    );
  }

  const handleSummaryChange = (book: Book, newSummary: string) => {
    if (onBookUpdate) {
      onBookUpdate({ ...book, summary: newSummary });
    }
  };

  const handleNotesChange = (book: Book, newNotes: string) => {
    if (onBookUpdate) {
      onBookUpdate({ ...book, description: newNotes });
    }
  };

  const handleSummaryDelete = (book: Book) => {
    if (onBookUpdate) {
      onBookUpdate({ ...book, summary: undefined });
    }
  };

  const handleNotesDelete = (book: Book) => {
    if (onBookUpdate) {
      onBookUpdate({ ...book, description: undefined });
    }
  };

  const handleTagsChange = (book: Book, newTags: string[]) => {
    if (onBookUpdate) {
      onBookUpdate({ ...book, tags: newTags });
    }
  };

  const handleRatingChange = (book: Book, newRating: number) => {
    if (onBookUpdate) {
      onBookUpdate({ ...book, rating: newRating });
    }
  };

  // Refresh covers for all library books
  const handleRefreshCovers = async () => {
    if (books.length === 0) return;
    
    setIsRefreshingCovers(true);
    console.log('🔄 Starting cover refresh for library books...');
    
    try {
      // Use the enhanced cover fetching system
      const newCoverMap = await refreshMultipleBookCovers(books);
      
      if (newCoverMap.size > 0) {
        // Update the local cover URLs state
        setCoverUrls(prev => {
          const updated = new Map(prev);
          newCoverMap.forEach((url, id) => {
            updated.set(id, url);
          });
          return updated;
        });
        
        // Update books with new covers
        books.forEach(book => {
          const newCoverUrl = newCoverMap.get(book.id);
          if (newCoverUrl && newCoverUrl !== book.coverUrl) {
            const updatedBook = { ...book, coverUrl: newCoverUrl };
            if (onBookUpdate) {
              onBookUpdate(updatedBook);
            }
          }
        });
        
        console.log(`✅ Updated ${newCoverMap.size} book covers in library`);
      } else {
        console.log('ℹ️ No cover improvements found');
      }
    } catch (error) {
      console.error('❌ Error refreshing covers:', error);
    } finally {
      setIsRefreshingCovers(false);
    }
  };

  // Get the best available cover URL for a book
  const getCoverUrl = (book: Book): string => {
    // Use enhanced cover if available, otherwise fall back to original
    const enhancedCover = coverUrls.get(book.id);
    return enhancedCover || book.coverUrl || 'https://via.placeholder.com/80x120/cccccc/666666?text=No+Cover';
  };


  return (
    <div className="book-list">
      <BookSortFilter 
        sortBy={sortBy} 
        onSortChange={setSortBy} 
        bookCount={books.length}
        filteredCount={filteredBooks.length}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <div className="book-list-actions">
        <button
          onClick={handleRefreshCovers}
          disabled={isRefreshingCovers || books.length === 0}
          className="btn btn-secondary"
          title="Improve book cover accuracy using enhanced search"
          style={{ backgroundColor: '#4CAF50', color: 'white', padding: '10px 20px', margin: '10px 0' }}
        >
          {isRefreshingCovers ? '🔄 Refreshing...' : `🖼️ Refresh Covers (${books.length} books)`}
        </button>
      </div>
      <div className="books-grid">
        {sortedBooks.map(book => (
          <div key={book.id} className="book-card">
            <BookCover 
              book={book} 
              size="medium" 
              customCoverUrl={getCoverUrl(book)}
            />
            <div className="book-content">
              <div className="book-header">
                <div className="book-title-section">
                  <h4>{book.title}</h4>
                </div>
                <button 
                  onClick={() => onRemoveBook(book.id)}
                  className="btn btn-remove"
                  aria-label="Remove book"
                >
                  ✕
                </button>
              </div>
            <p className="book-author">by {book.author}</p>
            <div className="book-genres">
              {book.genre.map(genre => (
                <span key={genre} className="genre-tag">{genre}</span>
              ))}
            </div>
            <div className="book-rating">
              <StarRating 
                rating={book.rating}
                onRatingChange={(newRating) => handleRatingChange(book, newRating)}
                readonly={false}
                size="small"
                showNumber={true}
              />
            </div>
            {book.year && <p className="book-year">Published: {book.year}</p>}
            
            <div className="book-tags-section">
              <EditableTags
                tags={book.tags || []}
                onTagsChange={(newTags) => handleTagsChange(book, newTags)}
                placeholder="Add tags..."
                className="book-tags-editable"
              />
            </div>
            
            <EditableText 
              value={book.summary || ''}
              onSave={(newSummary) => handleSummaryChange(book, newSummary)}
              onDelete={() => handleSummaryDelete(book)}
              placeholder="Click to add a summary..."
              label="Summary"
              maxLength={2000}
              className="book-summary-editable"
            />
            <EditableText 
              value={book.description || ''}
              onSave={(newNotes) => handleNotesChange(book, newNotes)}
              onDelete={() => handleNotesDelete(book)}
              placeholder="Click to add your notes..."
              label="Your Notes"
              maxLength={1000}
              className="book-notes-editable"
            />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookList;