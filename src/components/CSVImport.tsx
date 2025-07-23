import React, { useState, useRef } from 'react';
import { parseCSV, convertGoodreadsToBooks, validateGoodreadsCSV } from '../utils/csvParser';
import type { Book } from '../types';

interface CSVImportProps {
  onImport: (books: Book[]) => void;
  onCancel: () => void;
}

const CSVImport: React.FC<CSVImportProps> = ({ onImport, onCancel }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewBooks, setPreviewBooks] = useState<Book[]>([]);
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
      
      if (books.length === 0) {
        setError('No valid books found in the CSV. Make sure you have rated books marked as "read".');
        setIsProcessing(false);
        return;
      }

      setPreviewBooks(books);
      setShowPreview(true);
    } catch (err) {
      setError('Error processing CSV file. Please make sure it\'s a valid Goodreads export.');
      console.error('CSV processing error:', err);
    }

    setIsProcessing(false);
  };

  const handleConfirmImport = () => {
    onImport(previewBooks);
    setShowPreview(false);
    setPreviewBooks([]);
  };

  const handleCancel = () => {
    setShowPreview(false);
    setPreviewBooks([]);
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
          <p>Found {previewBooks.length} books to import. Review and confirm:</p>
        </div>

        <div className="preview-books">
          {previewBooks.slice(0, 10).map((book, index) => (
            <div key={index} className="preview-book">
              <h4>{book.title}</h4>
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
          {previewBooks.length > 10 && (
            <div className="preview-more">
              <p>... and {previewBooks.length - 10} more books</p>
            </div>
          )}
        </div>

        <div className="import-actions">
          <button onClick={handleConfirmImport} className="btn btn-primary">
            Import {previewBooks.length} Books
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
        <p>Upload your Goodreads library export to import all your rated books.</p>
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