import React, { useState, useEffect } from 'react';
import { storage } from '../utils/storage';
import { fetchBookCover, refreshMultipleBookCovers } from '../utils/bookCovers';
import type { WishlistItem, Book } from '../types';

const WishlistView: React.FC = () => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [isRefreshingCovers, setIsRefreshingCovers] = useState(false);
  const [coverUrls, setCoverUrls] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    setWishlist(storage.getWishlist());
  }, []);

  // Convert WishlistItem to Book for cover fetching
  const wishlistItemToBook = (item: WishlistItem): Book => ({
    id: item.id,
    title: item.title,
    author: item.author,
    genre: item.genre || [],
    year: item.year,
    rating: item.rating,
    coverUrl: item.coverUrl,
    summary: item.summary,
    description: '',
    tags: []
  });

  // Refresh covers for all wishlist books
  const handleRefreshCovers = async () => {
    if (wishlist.length === 0) return;
    
    setIsRefreshingCovers(true);
    console.log('🔄 Starting cover refresh for wishlist books...');
    
    try {
      // Convert wishlist items to books for cover fetching
      const booksForCoverFetch = wishlist.map(wishlistItemToBook);
      
      // Use the enhanced cover fetching system
      const newCoverMap = await refreshMultipleBookCovers(booksForCoverFetch);
      
      if (newCoverMap.size > 0) {
        // Update the local cover URLs state
        setCoverUrls(prev => {
          const updated = new Map(prev);
          newCoverMap.forEach((url, id) => {
            updated.set(id, url);
          });
          return updated;
        });
        
        // Update wishlist items with new covers
        const updatedWishlist = wishlist.map(item => {
          const newCoverUrl = newCoverMap.get(item.id);
          if (newCoverUrl && newCoverUrl !== item.coverUrl) {
            const updatedItem = { ...item, coverUrl: newCoverUrl };
            storage.updateWishlistItem(updatedItem);
            return updatedItem;
          }
          return item;
        });
        
        setWishlist(updatedWishlist);
        console.log(`✅ Updated ${newCoverMap.size} book covers in wishlist`);
      } else {
        console.log('ℹ️ No cover improvements found');
      }
    } catch (error) {
      console.error('❌ Error refreshing covers:', error);
    } finally {
      setIsRefreshingCovers(false);
    }
  };

  // Get the best available cover URL for an item
  const getCoverUrl = (item: WishlistItem): string => {
    // Use enhanced cover if available, otherwise fall back to original
    const enhancedCover = coverUrls.get(item.id);
    return enhancedCover || item.coverUrl || 'https://via.placeholder.com/80x120/cccccc/666666?text=No+Cover';
  };

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
        <div className="wishlist-actions">
          <button
            onClick={handleRefreshCovers}
            disabled={isRefreshingCovers}
            className="btn btn-secondary"
            title="Improve book cover accuracy using enhanced search"
          >
            {isRefreshingCovers ? '🔄 Refreshing...' : '🖼️ Refresh Covers'}
          </button>
          <button
            onClick={handleClearWishlist}
            className="btn btn-danger"
          >
            Clear All
          </button>
        </div>
      </div>

      <div className="wishlist-list">
        {wishlist.map((item) => (
          <div key={item.id} className="wishlist-item">
            <div className="wishlist-cover">
              <img 
                src={getCoverUrl(item)} 
                alt={`Cover of ${item.title}`}
                className="book-cover-thumbnail"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/80x120/cccccc/666666?text=No+Cover';
                }}
                loading="lazy"
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