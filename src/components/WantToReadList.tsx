import React, { useState } from 'react';
import type { WantToReadBook } from '../types';

interface WantToReadListProps {
  wantToReadBooks: WantToReadBook[];
  onRemoveFromWantToRead: (id: string) => void;
  onMarkAsRead: (wantToReadBook: WantToReadBook) => void;
  onUpdatePriority: (id: string, priority: 'low' | 'medium' | 'high') => void;
  onUpdateNotes: (id: string, notes: string) => void;
}

const WantToReadList: React.FC<WantToReadListProps> = ({
  wantToReadBooks,
  onRemoveFromWantToRead,
  onMarkAsRead,
  onUpdatePriority,
  onUpdateNotes
}) => {
  const [sortBy, setSortBy] = useState<'dateAdded' | 'title' | 'author' | 'priority'>('dateAdded');
  const [filterByPriority, setFilterByPriority] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState<string>('');

  if (wantToReadBooks.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📖</div>
        <h3>No books in your want-to-read list yet</h3>
        <p>Books marked as "to-read" in your Goodreads import will appear here.</p>
        <p>You can also add books from recommendations to your want-to-read list.</p>
      </div>
    );
  }

  // Filter by priority
  const filteredBooks = wantToReadBooks.filter(book => {
    if (filterByPriority === 'all') return true;
    return book.priority === filterByPriority;
  });

  // Sort books
  const sortedBooks = [...filteredBooks].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'author':
        return a.author.localeCompare(b.author);
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return (priorityOrder[b.priority || 'medium'] || 2) - (priorityOrder[a.priority || 'medium'] || 2);
      case 'dateAdded':
      default:
        return new Date(b.dateAdded || '').getTime() - new Date(a.dateAdded || '').getTime();
    }
  });

  const handleMarkAsRead = (book: WantToReadBook) => {
    const rating = prompt('What would you rate this book? (1-5 stars)', '4');
    if (rating && !isNaN(Number(rating))) {
      onMarkAsRead(book);
    }
  };

  const handleEditNotes = (bookId: string, currentNotes: string) => {
    setEditingNotes(bookId);
    setTempNotes(currentNotes || '');
  };

  const handleSaveNotes = (bookId: string) => {
    onUpdateNotes(bookId, tempNotes);
    setEditingNotes(null);
    setTempNotes('');
  };

  const handleCancelEditNotes = () => {
    setEditingNotes(null);
    setTempNotes('');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ff4444';
      case 'medium': return '#ffaa00';
      case 'low': return '#00aa00';
      default: return '#ffaa00';
    }
  };


  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Unknown';
    }
  };

  return (
    <div className="want-to-read-list">
      <div className="list-controls">
        <div className="sort-controls">
          <label>
            Sort by:
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
              <option value="dateAdded">Date Added</option>
              <option value="title">Title</option>
              <option value="author">Author</option>
              <option value="priority">Priority</option>
            </select>
          </label>
        </div>
        
        <div className="filter-controls">
          <label>
            Filter by priority:
            <select value={filterByPriority} onChange={(e) => setFilterByPriority(e.target.value as any)}>
              <option value="all">All Priorities</option>
              <option value="high">🔥 High Priority</option>
              <option value="medium">📚 Medium Priority</option>
              <option value="low">💤 Low Priority</option>
            </select>
          </label>
        </div>
      </div>

      <div className="books-stats">
        <p>Showing {sortedBooks.length} of {wantToReadBooks.length} books</p>
      </div>

      <div className="book-grid">
        {sortedBooks.map((book) => (
          <div key={book.id} className="book-card want-to-read-card">
            <div className="book-header">
              <h3 className="book-title">{book.title}</h3>
              <div className="book-priority">
                <select
                  value={book.priority || 'medium'}
                  onChange={(e) => onUpdatePriority(book.id, e.target.value as any)}
                  className="priority-select"
                  style={{ color: getPriorityColor(book.priority || 'medium') }}
                >
                  <option value="high">🔥 High</option>
                  <option value="medium">📚 Medium</option>
                  <option value="low">💤 Low</option>
                </select>
              </div>
            </div>
            
            <p className="book-author">by {book.author}</p>
            
            {book.year && (
              <p className="book-year">Published: {book.year}</p>
            )}
            
            <div className="book-genres">
              {book.genre.map(genre => (
                <span key={genre} className="genre-tag">{genre}</span>
              ))}
            </div>

            {book.dateAdded && (
              <p className="date-added">Added: {formatDate(book.dateAdded)}</p>
            )}

            <div className="book-notes">
              <h4>Notes:</h4>
              {editingNotes === book.id ? (
                <div className="notes-edit">
                  <textarea
                    value={tempNotes}
                    onChange={(e) => setTempNotes(e.target.value)}
                    placeholder="Add your notes about why you want to read this book..."
                    rows={3}
                  />
                  <div className="notes-actions">
                    <button onClick={() => handleSaveNotes(book.id)} className="btn btn-primary btn-small">
                      Save
                    </button>
                    <button onClick={handleCancelEditNotes} className="btn btn-secondary btn-small">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="notes-display">
                  <p>{book.notes || 'No notes yet...'}</p>
                  <button
                    onClick={() => handleEditNotes(book.id, book.notes || '')}
                    className="btn btn-secondary btn-small"
                  >
                    {book.notes ? 'Edit Notes' : 'Add Notes'}
                  </button>
                </div>
              )}
            </div>

            <div className="book-actions">
              <button
                onClick={() => handleMarkAsRead(book)}
                className="btn btn-primary"
                title="Mark as read and add to your library"
              >
                ✓ Mark as Read
              </button>
              <button
                onClick={() => onRemoveFromWantToRead(book.id)}
                className="btn btn-secondary"
                title="Remove from want-to-read list"
              >
                🗑️ Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WantToReadList;