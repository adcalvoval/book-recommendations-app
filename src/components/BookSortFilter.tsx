import React from 'react';

export type SortOption = 'title-asc' | 'title-desc' | 'year-asc' | 'year-desc' | 'rating-asc' | 'rating-desc' | 'added-asc' | 'added-desc';

interface BookSortFilterProps {
  sortBy: SortOption;
  onSortChange: (sortOption: SortOption) => void;
  bookCount: number;
}

const BookSortFilter: React.FC<BookSortFilterProps> = ({ sortBy, onSortChange, bookCount }) => {
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

  return (
    <div className="book-sort-filter">
      <div className="sort-header">
        <h3>Your Books ({bookCount})</h3>
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
  );
};

export default BookSortFilter;