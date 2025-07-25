import React, { useState } from 'react';
import type { BookFormData } from '../types';
import StarRating from './StarRating';

interface BookFormProps {
  onSubmit: (book: BookFormData) => void;
  onCancel?: () => void;
}

const BookForm: React.FC<BookFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<BookFormData>({
    title: '',
    author: '',
    genre: '',
    rating: 5.0,
    description: '',
    year: new Date().getFullYear(),
    tags: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title && formData.author && formData.genre) {
      onSubmit(formData);
      setFormData({
        title: '',
        author: '',
        genre: '',
        rating: 5.0,
        description: '',
        year: new Date().getFullYear(),
        tags: ''
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'year' ? Number(value) : value
    }));
  };

  const handleRatingChange = (rating: number) => {
    setFormData(prev => ({
      ...prev,
      rating
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="book-form">
      <h3>Add a Book You've Read</h3>
      
      <div className="form-group">
        <label htmlFor="title">Title *</label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          placeholder="Enter book title"
        />
      </div>

      <div className="form-group">
        <label htmlFor="author">Author *</label>
        <input
          type="text"
          id="author"
          name="author"
          value={formData.author}
          onChange={handleChange}
          required
          placeholder="Enter author name"
        />
      </div>

      <div className="form-group">
        <label htmlFor="genre">Genres *</label>
        <input
          type="text"
          id="genre"
          name="genre"
          value={formData.genre}
          onChange={handleChange}
          required
          placeholder="e.g., Fantasy, Science Fiction (comma-separated)"
        />
      </div>

      <div className="form-group">
        <label htmlFor="rating">Your Rating *</label>
        <StarRating 
          rating={formData.rating}
          onRatingChange={handleRatingChange}
          size="medium"
          showNumber={true}
        />
      </div>

      <div className="form-group">
        <label htmlFor="year">Publication Year</label>
        <input
          type="number"
          id="year"
          name="year"
          value={formData.year}
          onChange={handleChange}
          min="1000"
          max={new Date().getFullYear()}
        />
      </div>

      <div className="form-group">
        <label htmlFor="tags">Tags</label>
        <input
          type="text"
          id="tags"
          name="tags"
          value={formData.tags}
          onChange={handleChange}
          placeholder="e.g., favorite, must-read, classic (comma-separated)"
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Brief description or your thoughts about the book"
          rows={3}
        />
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary">Add Book</button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn btn-secondary">Cancel</button>
        )}
      </div>
    </form>
  );
};

export default BookForm;