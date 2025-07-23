import React, { useState } from 'react';
import type { Book, BookFormData } from '../types';
import StarRating from './StarRating';

interface AddBookModalProps {
  book: Book;
  onAdd: (bookData: BookFormData) => void;
  onCancel: () => void;
  isOpen: boolean;
}

const AddBookModal: React.FC<AddBookModalProps> = ({ 
  book, 
  onAdd, 
  onCancel, 
  isOpen 
}) => {
  const [rating, setRating] = useState(5.0);
  const [summary, setSummary] = useState(book.summary || '');
  const [notes, setNotes] = useState('');
  const [year, setYear] = useState(book.year || new Date().getFullYear());
  const [genre, setGenre] = useState(book.genre.join(', '));

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const bookData: BookFormData = {
      title: book.title,
      author: book.author,
      genre: genre,
      rating: rating,
      description: notes.trim() || undefined,
      summary: summary.trim() || book.summary,
      year: year
    };
    
    onAdd(bookData);
  };


  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Add to Your Library</h3>
          <button onClick={onCancel} className="modal-close">✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="add-book-form">
          <div className="book-info">
            <h4>{book.title}</h4>
            <p className="book-author">by {book.author}</p>
            {book.description && (
              <p className="book-description">{book.description}</p>
            )}
          </div>

          <div className="form-section">
            <label htmlFor="rating">Your Rating *</label>
            <StarRating 
              rating={rating}
              onRatingChange={setRating}
              size="medium"
              showNumber={true}
            />
          </div>

          <div className="form-section">
            <label htmlFor="genre">Genres</label>
            <input
              type="text"
              id="genre"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              placeholder="Fantasy, Adventure, etc."
              className="form-input"
            />
            <small className="form-hint">Separate multiple genres with commas</small>
          </div>

          <div className="form-section">
            <label htmlFor="year">Publication Year</label>
            <input
              type="number"
              id="year"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              min="1000"
              max={new Date().getFullYear() + 5}
              className="form-input"
            />
          </div>

          <div className="form-section">
            <label htmlFor="summary">Summary</label>
            <textarea
              id="summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder={book.summary ? "Edit the summary or add your own..." : "Add a summary..."}
              rows={4}
              maxLength={2000}
              className="form-textarea"
            />
            <small className="form-hint">{summary.length}/2000 characters</small>
          </div>

          <div className="form-section">
            <label htmlFor="notes">Your Notes</label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add your personal thoughts, quotes, or notes about this book..."
              rows={3}
              maxLength={1000}
              className="form-textarea"
            />
            <small className="form-hint">{notes.length}/1000 characters</small>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onCancel} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Add to Library
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBookModal;