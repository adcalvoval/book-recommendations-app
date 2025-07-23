import React, { useState, useRef, useEffect } from 'react';
import type { BookTag } from '../types';

interface EditableTagsProps {
  tags: BookTag[];
  onTagsChange: (tags: BookTag[]) => void;
  maxTags?: number;
  allowCustomTags?: boolean;
  className?: string;
}

const EditableTags: React.FC<EditableTagsProps> = ({ 
  tags, 
  onTagsChange, 
  maxTags = 12,
  allowCustomTags = true,
  className = '' 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagCategory, setNewTagCategory] = useState<BookTag['category']>('theme');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleRemoveTag = (tagToRemove: BookTag) => {
    const updatedTags = tags.filter(tag => 
      !(tag.name === tagToRemove.name && tag.category === tagToRemove.category)
    );
    onTagsChange(updatedTags);
  };

  const handleAddTag = () => {
    if (!newTagName.trim()) return;
    
    // Check if tag already exists
    const existingTag = tags.find(tag => 
      tag.name.toLowerCase() === newTagName.trim().toLowerCase()
    );
    
    if (existingTag) return;
    
    if (tags.length >= maxTags) return;

    const newTag: BookTag = {
      name: newTagName.trim(),
      category: newTagCategory,
      confidence: 1.0 // User-added tags have full confidence
    };

    onTagsChange([...tags, newTag]);
    setNewTagName('');
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTag();
    } else if (e.key === 'Escape') {
      setNewTagName('');
      setIsEditing(false);
    }
  };

  const getCategoryColor = (category: BookTag['category']): string => {
    const colors = {
      genre: '#667eea',
      theme: '#f093fb',
      setting: '#4facfe',
      mood: '#43e97b',
      length: '#fa709a',
      era: '#ffc837',
      style: '#a8edea',
      audience: '#d299c2'
    };
    return colors[category];
  };

  const getConfidenceOpacity = (confidence: number): number => {
    return 0.7 + (confidence * 0.3);
  };

  return (
    <div className={`editable-tags ${className}`}>
      <div className="tags-container">
        {tags.map((tag, index) => (
          <span
            key={`${tag.name}-${tag.category}-${index}`}
            className="tag tag-editable"
            style={{ 
              backgroundColor: getCategoryColor(tag.category),
              opacity: getConfidenceOpacity(tag.confidence)
            }}
            title={`${tag.category} - ${Math.round(tag.confidence * 100)}% confidence`}
          >
            {tag.name}
            <button
              onClick={() => handleRemoveTag(tag)}
              className="tag-remove"
              aria-label={`Remove ${tag.name} tag`}
            >
              ×
            </button>
          </span>
        ))}
        
        {isEditing ? (
          <div className="tag-input-container">
            <input
              ref={inputRef}
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              onKeyDown={handleKeyPress}
              onBlur={() => {
                if (!newTagName.trim()) {
                  setIsEditing(false);
                }
              }}
              placeholder="Tag name..."
              className="tag-input"
              maxLength={20}
            />
            <select
              value={newTagCategory}
              onChange={(e) => setNewTagCategory(e.target.value as BookTag['category'])}
              className="tag-category-select"
            >
              <option value="theme">💡 Theme</option>
              <option value="genre">🎭 Genre</option>
              <option value="mood">😊 Mood</option>
              <option value="setting">🌍 Setting</option>
              <option value="style">✍️ Style</option>
              <option value="era">📅 Era</option>
              <option value="audience">👥 Audience</option>
              <option value="length">📏 Length</option>
            </select>
            <button onClick={handleAddTag} className="tag-add-confirm">
              ✓
            </button>
          </div>
        ) : (
          allowCustomTags && tags.length < maxTags && (
            <button
              onClick={() => setIsEditing(true)}
              className="tag-add-button"
              title="Add custom tag"
            >
              + Add Tag
            </button>
          )
        )}
      </div>
      
      {tags.length >= maxTags && (
        <div className="tags-limit-notice">
          Maximum {maxTags} tags reached
        </div>
      )}
    </div>
  );
};

export default EditableTags;