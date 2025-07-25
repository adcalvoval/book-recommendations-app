import React, { useState, useRef, useEffect } from 'react';

interface EditableTagsProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
}

const EditableTags: React.FC<EditableTagsProps> = ({
  tags,
  onTagsChange,
  placeholder = "Add tags...",
  className = ""
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleAddTag = () => {
    const newTag = inputValue.trim();
    if (newTag && !tags.includes(newTag)) {
      onTagsChange([...tags, newTag]);
    }
    setInputValue('');
    setIsEditing(false);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    } else if (e.key === 'Escape') {
      setInputValue('');
      setIsEditing(false);
    }
  };

  const handleInputBlur = () => {
    if (inputValue.trim()) {
      handleAddTag();
    } else {
      setIsEditing(false);
    }
  };

  return (
    <div className={`editable-tags ${className}`}>
      <div className="tags-container">
        {tags.map((tag, index) => (
          <span key={index} className="tag">
            {tag}
            <button
              onClick={() => handleRemoveTag(tag)}
              className="tag-remove"
              aria-label={`Remove ${tag} tag`}
            >
              ×
            </button>
          </span>
        ))}
        
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            onBlur={handleInputBlur}
            className="tag-input"
            placeholder="Type tag..."
          />
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="add-tag-button"
          >
            {tags.length === 0 ? placeholder : '+ Add tag'}
          </button>
        )}
      </div>
    </div>
  );
};

export default EditableTags;