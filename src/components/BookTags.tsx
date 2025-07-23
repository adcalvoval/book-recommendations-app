import React from 'react';
import type { BookTag } from '../types';

interface BookTagsProps {
  tags: BookTag[];
  showConfidence?: boolean;
  maxTags?: number;
  onTagClick?: (tag: string) => void;
}

const BookTags: React.FC<BookTagsProps> = ({ 
  tags, 
  showConfidence = false, 
  maxTags = 8,
  onTagClick 
}) => {
  const displayTags = tags.slice(0, maxTags);
  const hiddenCount = Math.max(0, tags.length - maxTags);

  const getCategoryColor = (category: BookTag['category']): string => {
    const colors = {
      genre: '#667eea',      // Blue
      theme: '#f093fb',      // Pink
      setting: '#4facfe',    // Light Blue
      mood: '#43e97b',       // Green
      length: '#fa709a',     // Pink-Red
      era: '#ffecd2',        // Yellow
      style: '#a8edea',      // Cyan
      audience: '#d299c2'    // Purple
    };
    return colors[category];
  };

  const getCategoryIcon = (category: BookTag['category']): string => {
    const icons = {
      genre: '🎭',
      theme: '💡',
      setting: '🌍',
      mood: '😊',
      length: '📏',
      era: '📅',
      style: '✍️',
      audience: '👥'
    };
    return icons[category];
  };

  const formatConfidence = (confidence: number): string => {
    return `${Math.round(confidence * 100)}%`;
  };

  return (
    <div className="book-tags">
      {displayTags.map((tag, index) => (
        <span
          key={`${tag.name}-${index}`}
          className={`tag tag-${tag.category} ${onTagClick ? 'tag-clickable' : ''}`}
          style={{ 
            backgroundColor: getCategoryColor(tag.category),
            opacity: 0.7 + (tag.confidence * 0.3) // Higher confidence = more opaque
          }}
          onClick={() => onTagClick?.(tag.name)}
          title={`${getCategoryIcon(tag.category)} ${tag.category.charAt(0).toUpperCase() + tag.category.slice(1)}${showConfidence ? ` - ${formatConfidence(tag.confidence)} confidence` : ''}`}
        >
          {tag.name}
          {showConfidence && (
            <span className="tag-confidence">
              {formatConfidence(tag.confidence)}
            </span>
          )}
        </span>
      ))}
      {hiddenCount > 0 && (
        <span className="tag tag-more" title={`${hiddenCount} more tags`}>
          +{hiddenCount}
        </span>
      )}
    </div>
  );
};

export default BookTags;