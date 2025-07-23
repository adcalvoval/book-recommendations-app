import React, { useState } from 'react';
import type { Book } from '../types';
import { getAllUniqueTags } from '../utils/bookTagger';

interface TagFilterProps {
  books: Book[];
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
}

const TagFilter: React.FC<TagFilterProps> = ({ books, selectedTags, onTagsChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Get all unique tags from books
  const allTags = getAllUniqueTags(books);
  
  // Filter tags based on search term
  const filteredTags = allTags.filter(tag =>
    tag.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Group tags by category for better organization
  const tagsByCategory = React.useMemo(() => {
    const categories: Record<string, { tag: string; category: string; count: number }[]> = {};
    
    books.forEach(book => {
      if (book.tags) {
        book.tags.forEach(tag => {
          if (filteredTags.includes(tag.name)) {
            if (!categories[tag.category]) {
              categories[tag.category] = [];
            }
            
            const existing = categories[tag.category].find(t => t.tag === tag.name);
            if (existing) {
              existing.count++;
            } else {
              categories[tag.category].push({
                tag: tag.name,
                category: tag.category,
                count: 1
              });
            }
          }
        });
      }
    });
    
    // Sort tags within each category by count
    Object.keys(categories).forEach(category => {
      categories[category].sort((a, b) => b.count - a.count);
    });
    
    return categories;
  }, [books, filteredTags]);

  const handleTagClick = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter(t => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const handleClearAll = () => {
    onTagsChange([]);
    setSearchTerm('');
  };

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      genre: '#667eea',
      theme: '#f093fb',
      setting: '#4facfe',
      mood: '#43e97b',
      length: '#fa709a',
      era: '#ffc837',
      style: '#a8edea',
      audience: '#d299c2'
    };
    return colors[category] || '#6c757d';
  };

  const getCategoryIcon = (category: string): string => {
    const icons: Record<string, string> = {
      genre: '🎭',
      theme: '💡',
      setting: '🌍',
      mood: '😊',
      length: '📏',
      era: '📅',
      style: '✍️',
      audience: '👥'
    };
    return icons[category] || '🏷️';
  };

  const totalFilteredBooks = books.filter(book => {
    if (selectedTags.length === 0) return true;
    if (!book.tags) return false;
    const bookTagNames = book.tags.map(tag => tag.name);
    return selectedTags.some(selectedTag => bookTagNames.includes(selectedTag));
  }).length;

  return (
    <div className="tag-filter">
      <h4>Filter by Tags {selectedTags.length > 0 && `(${totalFilteredBooks} books)`}</h4>
      
      <div className="tag-filter-controls">
        <input
          type="text"
          placeholder="Search tags..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="tag-filter-search"
        />
        {(selectedTags.length > 0 || searchTerm) && (
          <button onClick={handleClearAll} className="tag-filter-clear">
            Clear All
          </button>
        )}
      </div>

      {Object.keys(tagsByCategory).length > 0 ? (
        <div className="tag-categories">
          {Object.entries(tagsByCategory).map(([category, tags]) => (
            <div key={category} className="tag-category">
              <h5 className="tag-category-title">
                {getCategoryIcon(category)} {category.charAt(0).toUpperCase() + category.slice(1)}
              </h5>
              <div className="available-tags">
                {tags.map(({ tag, count }) => (
                  <span
                    key={tag}
                    className={`tag tag-${category} ${selectedTags.includes(tag) ? 'selected' : ''}`}
                    style={{ backgroundColor: getCategoryColor(category) }}
                    onClick={() => handleTagClick(tag)}
                    title={`${count} book${count !== 1 ? 's' : ''}`}
                  >
                    {tag} ({count})
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-tags">No tags found{searchTerm && ` for "${searchTerm}"`}</p>
      )}
    </div>
  );
};

export default TagFilter;