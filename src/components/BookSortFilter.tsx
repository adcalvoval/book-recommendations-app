import React from 'react';

export type SortOption = 'title-asc' | 'title-desc' | 'year-asc' | 'year-desc' | 'rating-asc' | 'rating-desc' | 'added-asc' | 'added-desc';

interface BookSortFilterProps {
  sortBy: SortOption;
  onSortChange: (sortOption: SortOption) => void;
  bookCount: number;
  filteredCount?: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const BookSortFilter: React.FC<BookSortFilterProps> = ({ 
  sortBy, 
  onSortChange, 
  bookCount, 
  filteredCount,
  searchQuery, 
  onSearchChange 
}) => {
  const sortOptions = [
    { value: 'title-asc', label: 'Title (A-Z)' },
    { value: 'title-desc', label: 'Title (Z-A)' },
    { value: 'year-desc', label: 'Publication Year (Newest)' },
    { value: 'year-asc', label: 'Publication Year (Oldest)' },
    { value: 'rating-desc', label: 'Rating (Highest)' },
    { value: 'rating-asc', label: 'Rating (Lowest)' },
    { value: 'added-desc', label: 'Recently Added' },
    { value: 'added-asc', label: 'Oldest Added' },
  ] as const;

  const displayCount = filteredCount !== undefined ? filteredCount : bookCount;
  const showSearchResults = searchQuery.trim() !== '';

  return (
    <div className="book-sort-filter">
      <div className="sort-header">
        <h3>
          Your Books ({displayCount}
          {showSearchResults && filteredCount !== bookCount && ` of ${bookCount}`})
        </h3>
        <div className="filter-controls">
          <div className="search-controls">
            <label htmlFor="book-search">Search:</label>
            <div className="search-input-container">
              <input
                id="book-search"
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search by title or author..."
                className="search-input"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="search-clear-btn"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
          <div className="sort-controls">
            <label htmlFor="book-sort">Sort by:</label>
            <select
              id="book-sort"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="sort-select"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookSortFilter;