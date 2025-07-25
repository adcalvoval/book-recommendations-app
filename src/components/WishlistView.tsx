import React, { useState, useEffect } from 'react';
import { storage } from '../utils/storage';
import type { WishlistItem } from '../types';

const WishlistView: React.FC = () => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

  useEffect(() => {
    setWishlist(storage.getWishlist());
  }, []);

  const handleRemoveFromWishlist = (id: string) => {
    storage.removeFromWishlist(id);
    setWishlist(storage.getWishlist());
  };

  const handleClearWishlist = () => {
    if (window.confirm('Are you sure you want to clear your entire wishlist?')) {
      storage.clearWishlist();
      setWishlist([]);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (wishlist.length === 0) {
    return (
      <div className="wishlist-view">
        <div className="wishlist-header">
          <h2>📋 My Wishlist</h2>
        </div>
        <div className="empty-wishlist">
          <p>Your wishlist is empty.</p>
          <p>Use the search bar to find book recommendations and add them to your wishlist!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-view">
      <div className="wishlist-header">
        <h2>📋 My Wishlist ({wishlist.length} books)</h2>
        <button
          onClick={handleClearWishlist}
          className="btn btn-danger"
        >
          Clear All
        </button>
      </div>

      <div className="wishlist-list">
        {wishlist.map((item) => (
          <div key={item.id} className="wishlist-item">
            <div className="wishlist-cover">
              <img 
                src={item.coverUrl || 'https://via.placeholder.com/80x120/cccccc/666666?text=No+Cover'} 
                alt={`Cover of ${item.title}`}
                className="book-cover-thumbnail"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/80x120/cccccc/666666?text=No+Cover';
                }}
              />
            </div>
            <div className="wishlist-item-content">
              <div className="wishlist-item-header">
                <h3 className="wishlist-title">{item.title}</h3>
                <span className="wishlist-author">by {item.author}</span>
                <div className="wishlist-book-meta">
                  {item.year && <span className="book-year">({item.year})</span>}
                  {item.rating && (
                    <div className="book-rating">
                      <span className="rating-stars">
                        {'★'.repeat(Math.floor(item.rating))}
                        {item.rating % 1 !== 0 && '☆'}
                        {'☆'.repeat(5 - Math.ceil(item.rating))}
                      </span>
                      <span className="rating-number">{item.rating.toFixed(1)}/5</span>
                    </div>
                  )}
                </div>
              </div>
              <p className="wishlist-summary">{item.summary}</p>
              <div className="wishlist-meta">
                <span className="wishlist-date">Added: {formatDate(item.dateAdded)}</span>
                <span className="wishlist-source">
                  {item.source === 'search' ? '🔍 From search' : '✏️ Manual'}
                </span>
              </div>
            </div>
            <div className="wishlist-item-actions">
              <button
                onClick={() => handleRemoveFromWishlist(item.id)}
                className="btn btn-danger btn-small"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WishlistView;