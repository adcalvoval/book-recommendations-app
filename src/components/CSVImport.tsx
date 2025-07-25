import React, { useState, useRef } from 'react';
import { parseCSV, convertGoodreadsToBooks, validateGoodreadsCSV, type GoodreadsCSVRow } from '../utils/csvParser';
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
      const csvText = await file.text();
      const rows = parseCSV(csvText);
      
      if (rows.length === 0) {
        throw new Error('CSV file is empty');
      }

      // Validate CSV format (should be Goodreads export)
      const validation = validateGoodreadsCSV(rows);
      if (!validation.isValid) {
        throw new Error(validation.error || 'Invalid CSV format');
      }

      // Convert to books (only read books, filter out unread ones)
      const books = convertGoodreadsToBooks(rows as GoodreadsCSVRow[]);
      
      console.log(`📊 CSV Import Results:`, {
        totalRows: rows.length,
        importedBooks: books.length
      });

      setPreviewBooks(books);
      setShowPreview(true);
    } catch (err) {
      console.error('CSV import error:', err);
      setError(err instanceof Error ? err.message : 'Failed to parse CSV file');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmImport = () => {
    onImport(previewBooks);
    setShowPreview(false);
    setPreviewBooks([]);
  };

  const handleCancelPreview = () => {
    setShowPreview(false);
    setPreviewBooks([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (showPreview) {
    return (
      <div className="csv-import-preview">
        <h3>Import Preview</h3>
        <p>Found <strong>{previewBooks.length}</strong> books to import:</p>
        
        <div className="preview-list">
          {previewBooks.slice(0, 10).map((book, index) => (
            <div key={index} className="preview-book">
              <strong>{book.title}</strong> by {book.author}
              <div className="book-genres">
                {book.genre.map(genre => (
                  <span key={genre} className="genre-tag">{genre}</span>
                ))}
              </div>
              <div className="book-rating">Rating: {book.rating}/5</div>
            </div>
          ))}
          {previewBooks.length > 10 && (
            <p className="preview-more">...and {previewBooks.length - 10} more books</p>
          )}
        </div>

        <div className="preview-actions">
          <button onClick={handleConfirmImport} className="btn btn-primary">
            ✅ Import {previewBooks.length} Books
          </button>
          <button onClick={handleCancelPreview} className="btn btn-secondary">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="csv-import">
      <h3>Import Books from CSV</h3>
      <p>
        Import your reading history from a Goodreads CSV export. 
        <a 
          href="https://www.goodreads.com/review/import" 
          target="_blank" 
          rel="noopener noreferrer"
          className="help-link"
        >
          Get your Goodreads export here →
        </a>
      </p>

      <div className="file-input-wrapper">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          ref={fileInputRef}
          className="file-input"
          disabled={isProcessing}
          id="csv-file-input"
        />
        <label htmlFor="csv-file-input" className="file-upload-label">
          <div className="upload-content">
            <div className="upload-icon">📁</div>
            <div className="upload-text">
              <strong>Choose CSV file</strong>
              <span>Click here to select your Goodreads export file</span>
            </div>
          </div>
        </label>
        {isProcessing && <div className="processing">Processing CSV file...</div>}
      </div>

      {error && (
        <div className="error-message">
          <strong>Import Error:</strong> {error}
        </div>
      )}

      <div className="csv-info">
        <h4>CSV Format Requirements:</h4>
        <ul>
          <li>Goodreads CSV export format</li>
          <li>Only books you've rated will be imported</li>
          <li>Duplicate books (same title + author) will be skipped</li>
        </ul>
      </div>

      <div className="import-actions">
        <button onClick={onCancel} className="btn btn-secondary">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default CSVImport;