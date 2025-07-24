import React, { useState, useRef } from 'react';
import { parseCSV, convertGoodreadsToBooks, convertGoodreadsToWantToReadBooks, validateGoodreadsCSV } from '../utils/csvParser';
import type { Book, WantToReadBook } from '../types';

interface CSVImportProps {
  onImport: (books: Book[], wantToReadBooks: WantToReadBook[]) => void;
  onCancel: () => void;
}

const CSVImport: React.FC<CSVImportProps> = ({ onImport, onCancel }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewBooks, setPreviewBooks] = useState<Book[]>([]);
  const [previewWantToReadBooks, setPreviewWantToReadBooks] = useState<WantToReadBook[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Please select a CSV file');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const text = await file.text();
      const csvRows = parseCSV(text);
      
      const validation = validateGoodreadsCSV(csvRows);
      if (!validation.isValid) {
        setError(validation.error || 'Invalid CSV format');
        setIsProcessing(false);
        return;
      }

      const books = convertGoodreadsToBooks(csvRows);
      const wantToReadBooks = convertGoodreadsToWantToReadBooks(csvRows);
      
      if (books.length === 0 && wantToReadBooks.length === 0) {
        // Count books in different states for better error message
        const totalBooks = csvRows.length;
        const toReadBooks = csvRows.filter(row => row['Exclusive Shelf']?.toLowerCase() === 'to-read').length;
        const readBooks = csvRows.filter(row => row['Exclusive Shelf']?.toLowerCase() === 'read').length;
        const ratedBooks = csvRows.filter(row => parseInt(row['My Rating']) > 0).length;
        
        let errorMsg = `No books available to import from your CSV file.\n\nAnalysis of your file:\n• Total books: ${totalBooks}\n• Books marked "to-read": ${toReadBooks}\n• Books marked "read": ${readBooks}\n• Books with ratings: ${ratedBooks}\n\n`;
        
        if (toReadBooks > 0 && readBooks === 0) {
          errorMsg += 'Your CSV contains books from your "to-read" list but we couldn\'t find any books you\'ve read and rated.';
        } else if (readBooks > 0 && ratedBooks === 0) {
          errorMsg += 'You have books marked as "read" but none have ratings. Please rate your books on Goodreads first, then export again.';
        } else {
          errorMsg += 'Make sure you have books in your Goodreads library.';
        }
        
        setError(errorMsg);
        setIsProcessing(false);
        return;
      }

      setPreviewBooks(books);
      setPreviewWantToReadBooks(wantToReadBooks);
      setShowPreview(true);
    } catch (err) {
      setError('Error processing CSV file. Please make sure it\'s a valid Goodreads export.');
      console.error('CSV processing error:', err);
    }

    setIsProcessing(false);
  };

  const handleConfirmImport = () => {
    onImport(previewBooks, previewWantToReadBooks);
    setShowPreview(false);
    setPreviewBooks([]);
    setPreviewWantToReadBooks([]);
  };

  const handleCancel = () => {
    setShowPreview(false);
    setPreviewBooks([]);
    setPreviewWantToReadBooks([]);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onCancel();
  };

  const renderStars = (rating: number) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  if (showPreview) {
    return (
      <div className="csv-import">
        <div className="import-header">
          <h3>Import Preview</h3>
          <p>
            Found {previewBooks.length} read books and {previewWantToReadBooks.length} want-to-read books to import. Review and confirm:
          </p>
        </div>

        {previewBooks.length > 0 && (
          <div className="preview-section">
            <h4>📚 Read Books ({previewBooks.length})</h4>
            <div className="preview-books">
              {previewBooks.slice(0, 5).map((book, index) => (
                <div key={index} className="preview-book">
                  <h5>{book.title}</h5>
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
                </div>
              ))}
              {previewBooks.length > 5 && (
                <div className="preview-more">
                  <p>... and {previewBooks.length - 5} more read books</p>
                </div>
              )}
            </div>
          </div>
        )}

        {previewWantToReadBooks.length > 0 && (
          <div className="preview-section">
            <h4>📖 Want to Read ({previewWantToReadBooks.length})</h4>
            <div className="preview-books">
              {previewWantToReadBooks.slice(0, 5).map((book, index) => (
                <div key={index} className="preview-book">
                  <h5>{book.title}</h5>
                  <p className="book-author">by {book.author}</p>
                  <div className="book-genres">
                    {book.genre.map(genre => (
                      <span key={genre} className="genre-tag">{genre}</span>
                    ))}
                  </div>
                  {book.notes && (
                    <div className="book-notes">
                      <small>Note: {book.notes.substring(0, 100)}{book.notes.length > 100 ? '...' : ''}</small>
                    </div>
                  )}
                </div>
              ))}
              {previewWantToReadBooks.length > 5 && (
                <div className="preview-more">
                  <p>... and {previewWantToReadBooks.length - 5} more want-to-read books</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="import-actions">
          <button onClick={handleConfirmImport} className="btn btn-primary">
            Import {previewBooks.length + previewWantToReadBooks.length} Books
          </button>
          <button onClick={handleCancel} className="btn btn-secondary">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="csv-import">
      <div className="import-header">
        <h3>Import from Goodreads</h3>
        <p>Upload your Goodreads library export to import your read books and want-to-read list.</p>
      </div>

      <div className="import-instructions">
        <h4>How to export from Goodreads:</h4>
        <ol>
          <li>Go to <a href="https://www.goodreads.com/review/import" target="_blank" rel="noopener noreferrer">Goodreads Import/Export</a></li>
          <li>Click "Export Library" at the bottom of the page</li>
          <li>Download the CSV file when it's ready</li>
          <li>Upload the CSV file below</li>
        </ol>
      </div>

      <div className="file-upload-area">
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          disabled={isProcessing}
          className="file-input"
          id="csv-file"
        />
        <label htmlFor="csv-file" className="file-upload-label">
          <div className="upload-content">
            <div className="upload-icon">📁</div>
            <div className="upload-text">
              {isProcessing ? 'Processing...' : 'Choose CSV File'}
            </div>
            <div className="upload-hint">
              Select your Goodreads library export
            </div>
          </div>
        </label>
      </div>

      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="import-actions">
        <button onClick={handleCancel} className="btn btn-secondary">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default CSVImport;