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

    // Enhanced author search patterns
    const authorPatterns = [
      /(?:books?\s+by|author:?|written\s+by)\s+([^,.\n]+)/i,
      /^([a-z]+\s+[a-z]+)$/i, // Just "First Last" format
      /^([a-z]+\s+[a-z]+\s+[a-z]+)$/i, // "First Middle Last" format
      /(?:want|read|looking\s+for).*?([a-z]+\s+[a-z]+)/i,
      /([a-z]+\s+everett|percival\s+[a-z]+)/i // Specific patterns like "Percival Everett"
    ];

    for (const pattern of authorPatterns) {
      const match = searchQuery.match(pattern);
      if (match) {
        criteria.type = 'author';
        criteria.author = match[1].trim();
        return criteria;
      }
    }

    // Enhanced genre/style searches
    const genrePatterns = [
      /scandinavian|nordic|norwegian|swedish|danish|finnish/i,
      /true\s+crime|crime|mystery|thriller/i,
      /literary\s+fiction|literary/i,
      /science\s+fiction|sci-?fi/i,
      /fantasy|magical/i,
      /romance|romantic/i,
      /biography|memoir/i,
      /horror|scary/i,
      /comedy|funny|humorous/i
    ];

    for (const pattern of genrePatterns) {
      if (pattern.test(lowerQuery)) {
        criteria.type = 'genre';
        const match = lowerQuery.match(pattern);
        if (match) {
          criteria.genre = match[0];
        }
        return criteria;
      }
    }

    // Enhanced mood searches
    const moodPatterns = [
      /(?:mood|feeling|want\s+something)\s*:?\s*(\w+)/i,
      /(mysterious|romantic|dark|uplifting|adventurous|calm|exciting|sad|happy)/i,
      /feel\s+like\s+reading\s+something\s+(\w+)/i
    ];

    for (const pattern of moodPatterns) {
      const match = lowerQuery.match(pattern);
      if (match) {
        criteria.type = 'mood';
        criteria.mood = match[1];
        return criteria;
      }
    }

    // Enhanced similarity searches
    const similarityPatterns = [
      /(?:similar\s+to|like|reminds?\s+me\s+of)\s*"?([^",.]+)"?/i,
      /(?:more|other)\s+books?\s+(?:similar\s+to|like)\s*"?([^",.]+)"?/i,
      /(?:if\s+you\s+liked|fans?\s+of)\s*"?([^",.]+)"?/i
    ];

    for (const pattern of similarityPatterns) {
      const match = lowerQuery.match(pattern);
      if (match) {
        criteria.type = 'similar';
        criteria.similarTo = match[1].trim();
        return criteria;
      }
    }

    // Check for specific book/author references in user's library
    const userGenres = new Set<string>();
    const userAuthors = new Set<string>();
    userBooks.forEach(book => {
      book.genre.forEach(g => userGenres.add(g.toLowerCase()));
      userAuthors.add(book.author.toLowerCase());
    });

    // Check if query matches known authors from user's library
    for (const author of userAuthors) {
      if (lowerQuery.includes(author.toLowerCase())) {
        criteria.type = 'similar';
        criteria.similarTo = author;
        return criteria;
      }
    }

    // Check if query matches known genres from user's library
    for (const genre of userGenres) {
      if (lowerQuery.includes(genre)) {
        criteria.type = 'genre';
        criteria.genre = genre;
        return criteria;
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
          onClick={() => handleSuggestionClick('Percival Everett')}
          className="example-query"
        >
          Percival Everett
        </button>
        <button 
          onClick={() => handleSuggestionClick('scandinavian crime')}
          className="example-query"
        >
          scandinavian crime
        </button>
        <button 
          onClick={() => handleSuggestionClick('books like The Trees')}
          className="example-query"
        >
          books like The Trees
        </button>
      </div>
    </div>
  );
};

export default SmartSearch;