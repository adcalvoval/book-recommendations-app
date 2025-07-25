import React from 'react';
import type { Book } from '../types';
import EditableText from './EditableText';
import EditableTags from './EditableTags';
import BookCover from './BookCover';
import StarRating from './StarRating';

interface BookListProps {
  books: Book[];
  onRemoveBook: (id: string) => void;
  onBookUpdate?: (book: Book) => void;
}

const BookList: React.FC<BookListProps> = ({ books, onRemoveBook, onBookUpdate }) => {

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


  return (
    <div className="book-list">
      <h3>Your Books ({books.length})</h3>
      <div className="books-grid">
        {books.map(book => (
          <div key={book.id} className="book-card">
            <BookCover book={book} size="medium" />
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
                readonly={true}
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