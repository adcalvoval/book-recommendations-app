import React, { useState, useEffect } from 'react';
import type { Book } from '../types';
import { fetchBookCover, preloadBookCover } from '../utils/bookCovers';

interface BookCoverProps {
  book: Book;
  size?: 'small' | 'medium' | 'large';
  className?: string;
  onClick?: () => void;
}

const BookCover: React.FC<BookCoverProps> = ({ 
  book, 
  size = 'medium', 
  className = '', 
  onClick 
}) => {
  const [coverUrl, setCoverUrl] = useState<string | null>(book.coverUrl || null);
  const [isLoading, setIsLoading] = useState(!book.coverUrl);
  const [, setHasError] = useState(false);

  useEffect(() => {
    if (!book.coverUrl) {
      fetchBookCover(book)
        .then(url => {
          if (url) {
            setCoverUrl(url);
            preloadBookCover(url);
          }
          setIsLoading(false);
        })
        .catch(() => {
          setIsLoading(false);
          setHasError(true);
        });
    }
  }, [book]);

  const handleImageError = () => {
    setHasError(true);
    // Generate a fallback placeholder
    const placeholder = generateFallbackCover(book, size);
    setCoverUrl(placeholder);
  };

  const handleImageLoad = () => {
    setHasError(false);
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'book-cover-small';
      case 'large':
        return 'book-cover-large';
      default:
        return 'book-cover-medium';
    }
  };

  const getDimensions = () => {
    switch (size) {
      case 'small':
        return { width: 60, height: 90 };
      case 'large':
        return { width: 160, height: 240 };
      default:
        return { width: 100, height: 150 };
    }
  };

  if (isLoading) {
    return (
      <div 
        className={`book-cover book-cover-loading ${getSizeClasses()} ${className}`}
        style={getDimensions()}
        onClick={onClick}
      >
        <div className="book-cover-spinner">📚</div>
      </div>
    );
  }

  return (
    <div 
      className={`book-cover ${getSizeClasses()} ${className} ${onClick ? 'book-cover-clickable' : ''}`}
      onClick={onClick}
      title={`${book.title} by ${book.author}`}
    >
      {coverUrl ? (
        <img
          src={coverUrl}
          alt={`Cover of ${book.title}`}
          className="book-cover-image"
          onError={handleImageError}
          onLoad={handleImageLoad}
          style={getDimensions()}
        />
      ) : (
        <div 
          className="book-cover-placeholder"
          style={getDimensions()}
        >
          <div className="book-cover-title">{book.title}</div>
          <div className="book-cover-author">{book.author}</div>
        </div>
      )}
    </div>
  );
};

const generateFallbackCover = (book: Book, size: string): string => {
  const dimensions = {
    small: { width: 60, height: 90 },
    medium: { width: 100, height: 150 },
    large: { width: 160, height: 240 }
  }[size] || { width: 100, height: 150 };

  // Generate a color based on the book title
  const colors = [
    '#667eea', '#f093fb', '#4facfe', '#43e97b', 
    '#fa709a', '#ffc837', '#a8edea', '#d299c2',
    '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4'
  ];
  
  const colorIndex = book.title.length % colors.length;
  const backgroundColor = colors[colorIndex];
  
  // Create a simple data URL for the placeholder
  const canvas = document.createElement('canvas');
  canvas.width = dimensions.width;
  canvas.height = dimensions.height;
  
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, dimensions.width, dimensions.height);
    
    // Border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, dimensions.width - 2, dimensions.height - 2);
    
    // Title text
    ctx.fillStyle = '#ffffff';
    ctx.font = `${Math.max(10, dimensions.width / 12)}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const title = book.title.length > 20 ? book.title.substring(0, 20) + '...' : book.title;
    const words = title.split(' ');
    const lineHeight = dimensions.width / 10;
    let y = dimensions.height / 2 - (words.length - 1) * lineHeight / 2;
    
    for (let i = 0; i < words.length && i < 4; i++) {
      ctx.fillText(words[i], dimensions.width / 2, y);
      y += lineHeight;
    }
  }
  
  return canvas.toDataURL();
};

export default BookCover;