import React, { useState, useRef, useEffect } from 'react';
import type { Book } from '../types';

export interface SearchCriteria {
  query: string;
  mood?: string;
  genre?: string;
  author?: string;
  similarTo?: string;
  keywords?: string[];
  type: 'general' | 'mood' | 'similar' | 'genre' | 'author';
}

interface SmartSearchProps {
  onSearch: (criteria: SearchCriteria) => void;
  onClear: () => void;
  userBooks: Book[];
  placeholder?: string;
  className?: string;
}

const SmartSearch: React.FC<SmartSearchProps> = ({
  onSearch,
  onClear,
  userBooks,
  placeholder = "Search for books by mood, genre, author, or similarity...",
  className = ""
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Extract unique values from user's library for suggestions
  const getSearchSuggestions = (input: string): string[] => {
    if (input.length < 2) return [];

    const lowerInput = input.toLowerCase();
    const suggestions: string[] = [];

    // Mood suggestions
    const moodKeywords = ['happy', 'sad', 'exciting', 'calm', 'mysterious', 'romantic', 'dark', 'uplifting', 'thought-provoking', 'adventurous'];
    moodKeywords.forEach(mood => {
      if (mood.includes(lowerInput)) {
        suggestions.push(`books with ${mood} mood`);
      }
    });

    // Genre suggestions from user's books
    const userGenres = new Set<string>();
    userBooks.forEach(book => book.genre.forEach(g => userGenres.add(g)));
    Array.from(userGenres).forEach(genre => {
      if (genre.toLowerCase().includes(lowerInput)) {
        suggestions.push(`${genre} books`);
      }
    });

    // Author suggestions from user's books
    const userAuthors = new Set(userBooks.map(book => book.author));
    Array.from(userAuthors).forEach(author => {
      if (author.toLowerCase().includes(lowerInput)) {
        suggestions.push(`books by ${author}`);
        suggestions.push(`similar to ${author}'s style`);
      }
    });

    // Book title suggestions from user's books
    userBooks.forEach(book => {
      if (book.title.toLowerCase().includes(lowerInput)) {
        suggestions.push(`similar to "${book.title}"`);
      }
    });

    // Tag suggestions from user's books
    const userTags = new Set<string>();
    userBooks.forEach(book => {
      if (book.tags) {
        book.tags.forEach(tag => userTags.add(tag.name));
      }
    });
    Array.from(userTags).forEach(tag => {
      if (tag.toLowerCase().includes(lowerInput)) {
        suggestions.push(`books about ${tag}`);
      }
    });

    // Common search patterns
    const patterns = [
      'books like',
      'similar to',
      'mood:',
      'genre:',
      'author:',
      'feeling',
      'want something'
    ];
    patterns.forEach(pattern => {
      if (pattern.includes(lowerInput) || lowerInput.includes(pattern.split(':')[0])) {
        suggestions.push(pattern + ' ...');
      }
    });

    return suggestions.slice(0, 8); // Limit suggestions
  };

  const parseSearchQuery = (searchQuery: string): SearchCriteria => {
    const lowerQuery = searchQuery.toLowerCase().trim();
    
    // Initialize search criteria
    const criteria: SearchCriteria = {
      query: searchQuery,
      type: 'general',
      keywords: searchQuery.split(' ').filter(word => word.length > 2)
    };

    // Parse mood searches
    if (lowerQuery.includes('mood') || lowerQuery.includes('feeling') || lowerQuery.includes('want something')) {
      criteria.type = 'mood';
      const moodMatch = lowerQuery.match(/(?:mood|feeling|want something)\s*:?\s*(\w+)/);
      if (moodMatch) {
        criteria.mood = moodMatch[1];
      } else {
        // Extract mood from natural language
        const moodWords = ['happy', 'sad', 'exciting', 'calm', 'mysterious', 'romantic', 'dark', 'uplifting', 'adventurous'];
        for (const mood of moodWords) {
          if (lowerQuery.includes(mood)) {
            criteria.mood = mood;
            break;
          }
        }
      }
    }

    // Parse similarity searches
    if (lowerQuery.includes('similar to') || lowerQuery.includes('like')) {
      criteria.type = 'similar';
      const similarMatch = lowerQuery.match(/(?:similar to|like)\s*"?([^"]+)"?/);
      if (similarMatch) {
        criteria.similarTo = similarMatch[1].trim();
      }
    }

    // Parse genre searches
    if (lowerQuery.includes('genre:') || lowerQuery.includes('genre ')) {
      criteria.type = 'genre';
      const genreMatch = lowerQuery.match(/genre\s*:?\s*(\w+)/);
      if (genreMatch) {
        criteria.genre = genreMatch[1];
      }
    }

    // Parse author searches
    if (lowerQuery.includes('author:') || lowerQuery.includes('by ')) {
      criteria.type = 'author';
      const authorMatch = lowerQuery.match(/(?:author\s*:?\s*|by\s+)([^,]+)/);
      if (authorMatch) {
        criteria.author = authorMatch[1].trim();
      }
    }

    // Check for direct genre/author mentions
    const userGenres = new Set<string>();
    const userAuthors = new Set<string>();
    userBooks.forEach(book => {
      book.genre.forEach(g => userGenres.add(g.toLowerCase()));
      userAuthors.add(book.author.toLowerCase());
    });

    // Check if query matches known genres
    for (const genre of userGenres) {
      if (lowerQuery.includes(genre)) {
        criteria.type = 'genre';
        criteria.genre = genre;
        break;
      }
    }

    // Check if query matches known authors
    for (const author of userAuthors) {
      if (lowerQuery.includes(author)) {
        criteria.type = 'author';
        criteria.author = author;
        break;
      }
    }

    return criteria;
  };

  useEffect(() => {
    if (query.length >= 2) {
      const newSuggestions = getSearchSuggestions(query);
      setSuggestions(newSuggestions);
      setShowSuggestions(newSuggestions.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
    setSelectedSuggestionIndex(-1);
  }, [query, userBooks]);

  const handleSearch = () => {
    if (query.trim()) {
      const criteria = parseSearchQuery(query);
      onSearch(criteria);
      setShowSuggestions(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    onClear();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (selectedSuggestionIndex >= 0 && suggestions[selectedSuggestionIndex]) {
        setQuery(suggestions[selectedSuggestionIndex]);
        setShowSuggestions(false);
        setTimeout(() => handleSearch(), 0);
      } else {
        handleSearch();
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    setTimeout(() => {
      const criteria = parseSearchQuery(suggestion);
      onSearch(criteria);
    }, 0);
  };

  return (
    <div className={`smart-search ${className}`}>
      <div className="search-input-container">
        <div className="search-input-wrapper">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(suggestions.length > 0)}
            placeholder={placeholder}
            className="search-input"
          />
          <div className="search-actions">
            {query && (
              <button onClick={handleClear} className="search-clear" title="Clear search">
                ✕
              </button>
            )}
            <button onClick={handleSearch} className="search-submit" title="Search">
              🔍
            </button>
          </div>
        </div>
        
        {showSuggestions && suggestions.length > 0 && (
          <div ref={suggestionsRef} className="search-suggestions">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                className={`suggestion-item ${index === selectedSuggestionIndex ? 'selected' : ''}`}
                onClick={() => handleSuggestionClick(suggestion)}
                onMouseEnter={() => setSelectedSuggestionIndex(index)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
      
      <div className="search-examples">
        <span className="examples-label">Try:</span>
        <button 
          onClick={() => handleSuggestionClick('books with mysterious mood')}
          className="example-query"
        >
          mysterious mood
        </button>
        <button 
          onClick={() => handleSuggestionClick('similar to fantasy')}
          className="example-query"
        >
          similar to fantasy
        </button>
        <button 
          onClick={() => handleSuggestionClick('feeling adventurous')}
          className="example-query"
        >
          feeling adventurous
        </button>
      </div>
    </div>
  );
};

export default SmartSearch;