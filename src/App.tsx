import { useState, useEffect } from 'react';
import './App.css';
import type { Book, BookFormData, WantToReadBook } from './types';
import { storage } from './utils/storage';
import { getRecommendations, sampleBooks, type BookRecommendation } from './utils/recommendations';
import { getDynamicRecommendations, getReplacementRecommendation } from './utils/dynamicRecommendations';
import { enhanceBooksWithSummaries } from './utils/bookEnhancer';
import { generateTagsForBooks, filterBooksByTags } from './utils/bookTagger';
import { fetchBookCovers, refreshLibraryCoversWithGoogleBooks } from './utils/bookCovers';
import BookForm from './components/BookForm';
import BookList from './components/BookList';
import RecommendationList from './components/RecommendationList';
import CSVImport from './components/CSVImport';
import TagFilter from './components/TagFilter';
import SmartSearch from './components/SmartSearch';
import type { SearchCriteria } from './components/SmartSearch';
import AddBookModal from './components/AddBookModal';
import LikedBooksList from './components/LikedBooksList';
import WantToReadList from './components/WantToReadList';

// Enhanced function to check if a book is already in user's library
const isBookInUserLibrary = (book: Book | BookRecommendation, userBooks: Book[]): boolean => {
  return userBooks.some(userBook => {
    // Check by ID first (most reliable)
    if (userBook.id === book.id) return true;
    
    // Check by title and author (case insensitive) as fallback
    const titleMatch = userBook.title.toLowerCase().trim() === book.title.toLowerCase().trim();
    const authorMatch = userBook.author.toLowerCase().trim() === book.author.toLowerCase().trim();
    
    // Also check for very similar titles (in case of slight variations)
    const titleSimilar = userBook.title.toLowerCase().replace(/[^a-z0-9]/g, '') === 
                        book.title.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    return (titleMatch && authorMatch) || (titleSimilar && authorMatch);
  });
};

function App() {
  const [books, setBooks] = useState<Book[]>([]);
  const [recommendations, setRecommendations] = useState<BookRecommendation[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [isLoadingSummaries, setIsLoadingSummaries] = useState(false);
  const [isGeneratingTags, setIsGeneratingTags] = useState(false);
  const [isFetchingCovers, setIsFetchingCovers] = useState(false);
  const [isRefreshingCovers, setIsRefreshingCovers] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showTagFilter, setShowTagFilter] = useState(false);
  const [, setRefreshSeed] = useState(Date.now());
  const [activeTab, setActiveTab] = useState<'books' | 'recommendations' | 'liked' | 'wantToRead'>('books');
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria | null>(null);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [shownRecommendationIds, setShownRecommendationIds] = useState<string[]>([]);
  const [refreshCount, setRefreshCount] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [bookToAdd, setBookToAdd] = useState<BookRecommendation | null>(null);
  const [likedRecommendationIds, setLikedRecommendationIds] = useState<string[]>([]);
  const [likedBooks, setLikedBooks] = useState<BookRecommendation[]>([]);
  const [wantToReadBooks, setWantToReadBooks] = useState<WantToReadBook[]>([]);

  useEffect(() => {
    const loadedBooks = storage.getBooks();
    const likedIds = storage.getLikedRecommendations();
    const likedBooksData = storage.getLikedBooksData();
    const wantToReadBooksData = storage.getWantToReadBooks();
    
    // Debug what's being loaded
    console.log('🚀 App startup - loading data:', {
      books: loadedBooks.length,
      likedBooks: likedBooksData.length,
      wantToReadBooks: wantToReadBooksData.length,
      wantToReadSample: wantToReadBooksData.slice(0, 3).map(b => ({ title: b.title, author: b.author }))
    });
    
    setBooks(loadedBooks);
    setLikedRecommendationIds(likedIds);
    setLikedBooks(likedBooksData);
    setWantToReadBooks(wantToReadBooksData);
    if (!isSearchActive) {
      loadDynamicRecommendations(loadedBooks, []);
    }
  }, [isSearchActive]);

  const loadDynamicRecommendations = async (userBooks: Book[], excludeShownIds: string[] = []) => {
    setIsLoadingRecommendations(true);
    try {
      const dynamicRecs = await getDynamicRecommendations(userBooks, excludeShownIds);
      setRecommendations(dynamicRecs.slice(0, 5)); // Ensure exactly 5 recommendations
    } catch (error) {
      console.error('Error loading dynamic recommendations:', error);
      // Fallback to static recommendations
      const staticRecs = getRecommendations(userBooks, sampleBooks, { excludeIds: excludeShownIds });
      setRecommendations(staticRecs.slice(0, 5)); // Ensure exactly 5 recommendations
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  const updateRecommendations = async (userBooks: Book[], options?: { shuffle?: boolean; seed?: number; refresh?: boolean; excludeShownIds?: string[] }) => {
    if (isSearchActive && searchCriteria) {
      // Use search-based recommendations with APIs
      setIsLoadingRecommendations(true);
      try {
        const { getSearchBasedRecommendations } = await import('./utils/dynamicRecommendations');
        const searchRecs = await getSearchBasedRecommendations(searchCriteria.query, userBooks);
        setRecommendations(searchRecs.slice(0, 5)); // Ensure exactly 5 recommendations
      } catch (error) {
        console.error('Error loading search recommendations:', error);
        // Fallback to static search
        const { getSearchBasedRecommendations: staticSearch } = await import('./utils/searchRecommendations');
        const searchRecs = staticSearch(searchCriteria, userBooks, sampleBooks);
        setRecommendations(searchRecs.slice(0, 5)); // Ensure exactly 5 recommendations
      } finally {
        setIsLoadingRecommendations(false);
      }
      return;
    }

    // Use dynamic recommendations from APIs
    if (options?.refresh || !options) {
      await loadDynamicRecommendations(userBooks, options?.excludeShownIds || []);
    } else {
      // Fallback to static recommendations for specific options
      const recs = getRecommendations(userBooks, sampleBooks, { ...options, excludeIds: options?.excludeShownIds });
      setRecommendations(recs.slice(0, 5)); // Ensure exactly 5 recommendations
    }
  };

  const handleSearch = async (criteria: SearchCriteria) => {
    setSearchCriteria(criteria);
    setIsSearchActive(true);
    setActiveTab('recommendations');
    
    // Use dynamic API-based search
    setIsLoadingRecommendations(true);
    try {
      const { getSearchBasedRecommendations } = await import('./utils/dynamicRecommendations');
      const searchRecs = await getSearchBasedRecommendations(criteria.query, books, criteria.type);
      setRecommendations(searchRecs);
    } catch (error) {
      console.error('Error loading search recommendations:', error);
      // Fallback to static search
      const { getSearchBasedRecommendations: staticSearch } = await import('./utils/searchRecommendations');
      const searchRecs = staticSearch(criteria, books, sampleBooks);
      setRecommendations(searchRecs);
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  const handleClearSearch = async () => {
    setSearchCriteria(null);
    setIsSearchActive(false);
    setRefreshCount(0); // Reset refresh count when clearing search
    setShownRecommendationIds([]); // Reset shown recommendations
    await updateRecommendations(books);
  };

  const handleAddBook = async (bookData: BookFormData) => {
    const newBook: Book = {
      id: Date.now().toString(),
      ...bookData,
      genre: bookData.genre.split(',').map(g => g.trim()).filter(g => g.length > 0)
    };
    
    const updatedBooks = [...books, newBook];
    setBooks(updatedBooks);
    storage.addBook(newBook);
    // Reset refresh tracking when library changes
    setRefreshCount(0);
    setShownRecommendationIds([]);
    await updateRecommendations(updatedBooks);
    setShowForm(false);
  };

  const handleRemoveBook = async (id: string) => {
    const updatedBooks = books.filter(book => book.id !== id);
    setBooks(updatedBooks);
    storage.removeBook(id);
    // Reset refresh tracking when library changes
    setRefreshCount(0);
    setShownRecommendationIds([]);
    await updateRecommendations(updatedBooks);
  };

  const handleBookUpdate = async (updatedBook: Book) => {
    const updatedBooks = books.map(book => 
      book.id === updatedBook.id ? updatedBook : book
    );
    setBooks(updatedBooks);
    storage.updateBook(updatedBook);
    await updateRecommendations(updatedBooks);
  };

  const handleAddToLibrary = (book: BookRecommendation) => {
    // Check if book is already in library using enhanced matching
    if (isBookInUserLibrary(book, books)) {
      alert('This book is already in your library!');
      return;
    }

    setBookToAdd(book);
    setShowAddModal(true);
  };

  const handleRejectRecommendation = async (rejectedBook: BookRecommendation) => {
    try {
      // Add book to rejected list
      storage.addRejectedBook(rejectedBook.id);
      
      // Get replacement recommendation, passing current recommendations to avoid duplicates
      const rejectedIds = storage.getRejectedBooks();
      const currentRecommendations = recommendations.filter(rec => rec.id !== rejectedBook.id);
      const replacement = await getReplacementRecommendation(rejectedBook, books, rejectedIds, currentRecommendations);
      
      if (replacement) {
        // Replace rejected book with new recommendation
        setRecommendations(prevRecs => 
          prevRecs.map(rec => 
            rec.id === rejectedBook.id ? replacement : rec
          )
        );
      } else {
        // If no replacement found, just remove the rejected book
        setRecommendations(prevRecs => 
          prevRecs.filter(rec => rec.id !== rejectedBook.id)
        );
      }
    } catch (error) {
      console.error('Error handling book rejection:', error);
      // Fallback: just remove the rejected book
      setRecommendations(prevRecs => 
        prevRecs.filter(rec => rec.id !== rejectedBook.id)
      );
    }
  };

  const handleLikeRecommendation = (likedBook: BookRecommendation) => {
    const isCurrentlyLiked = likedRecommendationIds.includes(likedBook.id);
    
    if (isCurrentlyLiked) {
      // Unlike the book
      storage.removeLikedBookData(likedBook.id);
      setLikedRecommendationIds(prev => prev.filter(id => id !== likedBook.id));
      setLikedBooks(prev => prev.filter(book => book.id !== likedBook.id));
    } else {
      // Like the book - store full book data
      storage.addLikedBookData(likedBook);
      setLikedRecommendationIds(prev => [...prev, likedBook.id]);
      setLikedBooks(prev => [...prev, { ...likedBook, likedAt: new Date().toISOString() }]);
    }
  };

  const handleConfirmAddBook = async (bookData: BookFormData) => {
    if (!bookToAdd) return;

    // Final safety check to prevent duplicates
    if (isBookInUserLibrary(bookToAdd, books)) {
      alert('This book is already in your library!');
      setShowAddModal(false);
      setBookToAdd(null);
      return;
    }

    const newBook: Book = {
      id: Date.now().toString(),
      ...bookData,
      genre: bookData.genre.split(',').map(g => g.trim()).filter(g => g.length > 0),
      tags: bookToAdd.tags // Preserve any existing tags from recommendation
    };
    
    const updatedBooks = [...books, newBook];
    setBooks(updatedBooks);
    storage.addBook(newBook);
    
    // Reset refresh tracking when library changes
    setRefreshCount(0);
    setShownRecommendationIds([]);
    await updateRecommendations(updatedBooks);
    
    // Close modal and reset state
    setShowAddModal(false);
    setBookToAdd(null);
    
    // Switch to books tab to show the newly added book
    setActiveTab('books');
  };

  const handleCancelAddBook = () => {
    setShowAddModal(false);
    setBookToAdd(null);
  };

  const handleRemoveFromLiked = (bookId: string) => {
    storage.removeLikedBookData(bookId);
    setLikedRecommendationIds(prev => prev.filter(id => id !== bookId));
    setLikedBooks(prev => prev.filter(book => book.id !== bookId));
  };

  const handleAddLikedToLibrary = (book: BookRecommendation) => {
    // Check if book is already in library using enhanced matching
    if (isBookInUserLibrary(book, books)) {
      alert('This book is already in your library!');
      return;
    }

    setBookToAdd(book);
    setShowAddModal(true);
  };

  // Want to Read handlers
  const handleRemoveFromWantToRead = (id: string) => {
    storage.removeWantToReadBook(id);
    setWantToReadBooks(prev => prev.filter(book => book.id !== id));
  };

  const handleMarkAsRead = (wantToReadBook: WantToReadBook) => {
    const rating = prompt('What would you rate this book? (1-5 stars)', '4');
    if (rating && !isNaN(Number(rating))) {
      const ratingNum = Math.max(1, Math.min(5, Number(rating)));
      
      // Create a read book from the want-to-read book
      const readBook: Book = {
        id: `read-${Date.now()}`, // New ID for the read version
        title: wantToReadBook.title,
        author: wantToReadBook.author,
        genre: wantToReadBook.genre,
        rating: ratingNum,
        description: wantToReadBook.description,
        summary: wantToReadBook.summary,
        year: wantToReadBook.year,
        isbn: wantToReadBook.isbn,
        tags: wantToReadBook.tags,
        coverUrl: wantToReadBook.coverUrl
      };
      
      // Move from want-to-read to library
      storage.moveWantToReadToLibrary(wantToReadBook.id, readBook);
      
      // Update state
      setWantToReadBooks(prev => prev.filter(book => book.id !== wantToReadBook.id));
      setBooks(prev => [...prev, readBook]);
      
      // Update recommendations
      updateRecommendations([...books, readBook]);
      
      // Switch to books tab to show the newly added book
      setActiveTab('books');
    }
  };

  const handleUpdateWantToReadPriority = (id: string, priority: 'low' | 'medium' | 'high') => {
    const updatedBooks = wantToReadBooks.map(book => 
      book.id === id ? { ...book, priority } : book
    );
    setWantToReadBooks(updatedBooks);
    
    // Update in storage
    const bookToUpdate = wantToReadBooks.find(book => book.id === id);
    if (bookToUpdate) {
      storage.updateWantToReadBook({ ...bookToUpdate, priority });
    }
  };

  const handleUpdateWantToReadNotes = (id: string, notes: string) => {
    const updatedBooks = wantToReadBooks.map(book => 
      book.id === id ? { ...book, notes } : book
    );
    setWantToReadBooks(updatedBooks);
    
    // Update in storage
    const bookToUpdate = wantToReadBooks.find(book => book.id === id);
    if (bookToUpdate) {
      storage.updateWantToReadBook({ ...bookToUpdate, notes });
    }
  };

  const handleImportBooks = async (importedBooks: Book[], importedWantToReadBooks: WantToReadBook[]) => {
    // Filter out books that are already in the library (by title and author)
    const existingBooks = new Set(books.map(book => `${book.title.toLowerCase()}-${book.author.toLowerCase()}`));
    const newBooks = importedBooks.filter(book => 
      !existingBooks.has(`${book.title.toLowerCase()}-${book.author.toLowerCase()}`)
    );
    
    // Filter out want-to-read books that are already in the want-to-read list
    const existingWantToReadBooks = new Set(wantToReadBooks.map(book => `${book.title.toLowerCase()}-${book.author.toLowerCase()}`));
    const newWantToReadBooks = importedWantToReadBooks.filter(book => 
      !existingWantToReadBooks.has(`${book.title.toLowerCase()}-${book.author.toLowerCase()}`) &&
      !existingBooks.has(`${book.title.toLowerCase()}-${book.author.toLowerCase()}`) // Also exclude if already read
    );
    
    const updatedBooks = [...books, ...newBooks];
    const updatedWantToReadBooks = [...wantToReadBooks, ...newWantToReadBooks];
    
    setBooks(updatedBooks);
    setWantToReadBooks(updatedWantToReadBooks);
    
    // Save all new books to storage
    newBooks.forEach(book => storage.addBook(book));
    newWantToReadBooks.forEach(book => storage.addWantToReadBook(book));
    
    await updateRecommendations(updatedBooks);
    setShowImport(false);
    
    // Fetch summaries, generate tags, and get covers for new books in the background
    if (newBooks.length > 0) {
      fetchSummariesForBooks(newBooks);
      generateTagsForImportedBooks(newBooks);
      fetchCoversForImportedBooks(newBooks);
    }
    
    // Show success message with debugging info
    console.log('📊 Import Summary:', {
      importedReadBooks: newBooks.length,
      importedWantToReadBooks: newWantToReadBooks.length,
      totalWantToReadAfterImport: updatedWantToReadBooks.length,
      wantToReadBooksInState: wantToReadBooks.length
    });
    
    if (newBooks.length > 0 || newWantToReadBooks.length > 0) {
      const message = `Successfully imported ${newBooks.length} read books and ${newWantToReadBooks.length} want-to-read books!`;
      alert(message);
    }
  };

  const fetchSummariesForBooks = async (booksToEnhance: Book[]) => {
    setIsLoadingSummaries(true);
    
    try {
      const enhancedBooks = await enhanceBooksWithSummaries(booksToEnhance);
      
      // Update books with summaries
      const updatedBooks = books.map(book => {
        const enhanced = enhancedBooks.find(e => e.id === book.id);
        return enhanced ? { ...book, summary: enhanced.summary } : book;
      });
      
      setBooks(updatedBooks);
      
      // Update storage with summaries
      enhancedBooks.forEach(book => {
        if (book.summary) {
          storage.updateBook(book);
        }
      });
      
    } catch (error) {
      console.error('Error fetching summaries:', error);
    } finally {
      setIsLoadingSummaries(false);
    }
  };

  const handleFetchAllSummaries = async () => {
    const booksWithoutSummaries = books.filter(book => !book.summary);
    if (booksWithoutSummaries.length > 0) {
      await fetchSummariesForBooks(booksWithoutSummaries);
    }
  };

  const handleGenerateAllTags = async () => {
    setIsGeneratingTags(true);
    
    try {
      const bookTagsMap = await generateTagsForBooks(books);
      
      // Update books with generated tags
      const updatedBooks = books.map(book => {
        const tags = bookTagsMap.get(book.id);
        return tags ? { ...book, tags } : book;
      });
      
      setBooks(updatedBooks);
      
      // Save updated books to storage
      updatedBooks.forEach(book => {
        if (book.tags) {
          storage.updateBook(book);
        }
      });
      
    } catch (error) {
      console.error('Error generating tags:', error);
    } finally {
      setIsGeneratingTags(false);
    }
  };

  const generateTagsForImportedBooks = async (importedBooks: Book[]) => {
    try {
      const bookTagsMap = await generateTagsForBooks(importedBooks);
      
      // Update books with generated tags
      const updatedBooks = books.map(book => {
        const tags = bookTagsMap.get(book.id);
        return tags ? { ...book, tags } : book;
      });
      
      setBooks(updatedBooks);
      
      // Save updated books to storage
      updatedBooks.forEach(book => {
        if (book.tags) {
          storage.updateBook(book);
        }
      });
      
    } catch (error) {
      console.error('Error generating tags for imported books:', error);
    }
  };

  const handleRefreshRecommendations = async () => {
    const newSeed = Date.now();
    setRefreshSeed(newSeed);
    setRefreshCount(prev => prev + 1);
    
    // Add current recommendations to shown list to avoid duplicates
    const currentRecIds = recommendations.map(rec => rec.id);
    setShownRecommendationIds(prev => [...new Set([...prev, ...currentRecIds])]);
    
    if (isSearchActive && searchCriteria) {
      // For search results, refresh with new API results
      setIsLoadingRecommendations(true);
      try {
        const { getSearchBasedRecommendations } = await import('./utils/dynamicRecommendations');
        const searchRecs = await getSearchBasedRecommendations(searchCriteria.query, books);
        setRecommendations(searchRecs.slice(0, 5)); // Ensure exactly 5 recommendations
      } catch (error) {
        console.error('Error refreshing search recommendations:', error);
      } finally {
        setIsLoadingRecommendations(false);
      }
    } else {
      await updateRecommendations(books, { 
        refresh: true,
        excludeShownIds: [...shownRecommendationIds, ...currentRecIds]
      });
    }
  };


  const handleFetchAllCovers = async () => {
    setIsFetchingCovers(true);
    
    try {
      const booksWithoutCovers = books.filter(book => !book.coverUrl);
      const coverMap = await fetchBookCovers([...booksWithoutCovers, ...recommendations]);
      
      // Update books with covers
      const updatedBooks = books.map(book => {
        const coverUrl = coverMap.get(book.id);
        return coverUrl ? { ...book, coverUrl } : book;
      });
      
      // Update recommendations with covers
      const updatedRecommendations = recommendations.map(rec => {
        const coverUrl = coverMap.get(rec.id);
        return coverUrl ? { ...rec, coverUrl } : rec;
      });
      
      setBooks(updatedBooks);
      setRecommendations(updatedRecommendations);
      
      // Save updated books to storage
      updatedBooks.forEach(book => {
        if (book.coverUrl) {
          storage.updateBook(book);
        }
      });
      
    } catch (error) {
      console.error('Error fetching covers:', error);
    } finally {
      setIsFetchingCovers(false);
    }
  };

  const handleRefreshCoversWithGoogleBooks = async () => {
    setIsRefreshingCovers(true);
    
    try {
      // Refresh covers for all books using Google Books API
      const coverMap = await refreshLibraryCoversWithGoogleBooks(books);
      
      if (coverMap.size > 0) {
        // Update books with new covers
        const updatedBooks = books.map(book => {
          const coverUrl = coverMap.get(book.id);
          return coverUrl ? { ...book, coverUrl } : book;
        });
        
        setBooks(updatedBooks);
        
        // Save updated books to storage
        updatedBooks.forEach(book => {
          if (coverMap.has(book.id)) {
            storage.updateBook(book);
          }
        });
        
        alert(`Successfully updated ${coverMap.size} book covers with Google Books images!`);
      } else {
        alert('No cover updates found. Your books already have the best available covers.');
      }
      
    } catch (error) {
      console.error('Error refreshing covers with Google Books:', error);
      alert('Error refreshing covers. Please try again later.');
    } finally {
      setIsRefreshingCovers(false);
    }
  };

  const fetchCoversForImportedBooks = async (importedBooks: Book[]) => {
    try {
      // Use Google Books for imported books to get high-quality covers
      const coverMap = await refreshLibraryCoversWithGoogleBooks(importedBooks);
      
      // Update books with covers
      const updatedBooks = books.map(book => {
        const coverUrl = coverMap.get(book.id);
        return coverUrl ? { ...book, coverUrl } : book;
      });
      
      setBooks(updatedBooks);
      
      // Save updated books to storage
      updatedBooks.forEach(book => {
        if (book.coverUrl) {
          storage.updateBook(book);
        }
      });
      
    } catch (error) {
      console.error('Error fetching covers for imported books:', error);
    }
  };

  // Filter books based on selected tags
  const filteredBooks = selectedTags.length > 0 ? filterBooksByTags(books, selectedTags) : books;

  return (
    <div className="app">
      <header className="app-header">
        <h1>📚 Book Recommendations</h1>
        <p>Track your reading and discover your next favorite book</p>
      </header>

      <nav className="app-nav">
        <button 
          className={activeTab === 'books' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setActiveTab('books')}
        >
          My Books ({books.length})
        </button>
        <button 
          className={activeTab === 'recommendations' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setActiveTab('recommendations')}
        >
          Recommendations ({recommendations.length})
        </button>
        <button 
          className={activeTab === 'liked' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setActiveTab('liked')}
        >
          Liked Books ({likedBooks.length})
        </button>
        <button 
          className={activeTab === 'wantToRead' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setActiveTab('wantToRead')}
        >
          Want to Read ({wantToReadBooks.length})
        </button>
      </nav>

      <main className="app-main">
        {activeTab === 'books' && (
          <div className="books-section">
            <div className="section-header">
              <h2>Your Reading Library</h2>
              <div className="section-actions">
                <button 
                  onClick={() => setShowImport(!showImport)}
                  className="btn btn-secondary"
                >
                  {showImport ? 'Cancel Import' : '📁 Import from Goodreads'}
                </button>
                <button 
                  onClick={handleFetchAllSummaries}
                  className="btn btn-secondary"
                  disabled={isLoadingSummaries || books.filter(b => !b.summary).length === 0}
                >
                  {isLoadingSummaries ? '⏳ Fetching...' : '📖 Get Summaries'}
                </button>
                <button 
                  onClick={handleGenerateAllTags}
                  className="btn btn-secondary"
                  disabled={isGeneratingTags || books.length === 0}
                >
                  {isGeneratingTags ? '⏳ Tagging...' : '🏷️ Generate Tags'}
                </button>
                <button 
                  onClick={() => setShowTagFilter(!showTagFilter)}
                  className="btn btn-secondary"
                  disabled={books.length === 0}
                >
                  {showTagFilter ? 'Hide Filter' : '🔍 Filter Tags'}
                </button>
                <button 
                  onClick={handleFetchAllCovers}
                  className="btn btn-secondary"
                  disabled={isFetchingCovers || isRefreshingCovers || books.length === 0}
                >
                  {isFetchingCovers ? '⏳ Loading...' : '🖼️ Get Covers'}
                </button>
                <button 
                  onClick={handleRefreshCoversWithGoogleBooks}
                  className="btn btn-secondary"
                  disabled={isFetchingCovers || isRefreshingCovers || books.length === 0}
                  title="Refresh all book covers using Google Books API for better quality"
                >
                  {isRefreshingCovers ? '⏳ Refreshing...' : '📚 Refresh Covers'}
                </button>
                <button 
                  onClick={() => setShowForm(!showForm)}
                  className="btn btn-primary"
                >
                  {showForm ? 'Cancel' : '+ Add Book'}
                </button>
              </div>
            </div>

            {showImport && (
              <CSVImport 
                onImport={handleImportBooks}
                onCancel={() => setShowImport(false)}
              />
            )}

            {showTagFilter && (
              <TagFilter 
                books={books}
                selectedTags={selectedTags}
                onTagsChange={setSelectedTags}
              />
            )}

            {showForm && (
              <div className="form-container">
                <BookForm 
                  onSubmit={handleAddBook}
                  onCancel={() => setShowForm(false)}
                />
              </div>
            )}

            <BookList 
              books={filteredBooks}
              onRemoveBook={handleRemoveBook}
              onBookUpdate={handleBookUpdate}
            />
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div className="recommendations-section">
            <div className="section-header">
              <h2>{isSearchActive ? 'Search Results' : 'Personalized Recommendations'}</h2>
              <div className="section-actions">
                {isSearchActive && (
                  <button 
                    onClick={handleClearSearch}
                    className="btn btn-secondary"
                  >
                    ✕ Clear Search
                  </button>
                )}
                <button 
                  onClick={handleRefreshRecommendations}
                  className="btn btn-primary"
                  disabled={books.length === 0}
                  title={isSearchActive ? "Shuffle search results" : "Refresh suggestions with new recommendations"}
                >
                  🔄 {isSearchActive ? 'Shuffle Results' : 'Refresh Suggestions'}
                </button>
              </div>
            </div>

            <SmartSearch 
              onSearch={handleSearch}
              onClear={handleClearSearch}
              userBooks={books}
              className={isSearchActive ? 'search-active' : ''}
            />

            {isSearchActive && searchCriteria && (
              <div className="search-clear-all">
                <span>
                  Showing results for: <strong>"{searchCriteria.query}"</strong>
                </span>
                <button onClick={handleClearSearch}>
                  Clear
                </button>
              </div>
            )}

            {!isSearchActive && refreshCount > 0 && (
              <div className="refresh-indicator">
                <span>
                  🔄 Showing fresh recommendations (refresh #{refreshCount})
                  {shownRecommendationIds.length > 0 && ` • ${shownRecommendationIds.length} books excluded for variety`}
                </span>
              </div>
            )}

            <RecommendationList 
              recommendations={recommendations} 
              onAddToLibrary={handleAddToLibrary}
              onRejectRecommendation={handleRejectRecommendation}
              onLikeRecommendation={handleLikeRecommendation}
              likedRecommendationIds={likedRecommendationIds}
              userBooks={books}
              isLoading={isLoadingRecommendations}
            />
          </div>
        )}

        {activeTab === 'liked' && (
          <div className="liked-books-section">
            <div className="section-header">
              <h2>Your Liked Books</h2>
              <div className="section-actions">
                {likedBooks.length > 0 && (
                  <button 
                    onClick={() => {
                      if (confirm('Are you sure you want to clear all liked books?')) {
                        storage.clearLikedRecommendations();
                        setLikedBooks([]);
                        setLikedRecommendationIds([]);
                      }
                    }}
                    className="btn btn-secondary"
                    title="Clear all liked books"
                  >
                    🗑️ Clear All Liked
                  </button>
                )}
              </div>
            </div>

            <LikedBooksList 
              likedBooks={likedBooks}
              onAddToLibrary={handleAddLikedToLibrary}
              onRemoveFromLiked={handleRemoveFromLiked}
              userBooks={books}
            />
          </div>
        )}

        {activeTab === 'wantToRead' && (
          <div className="want-to-read-section">
            <div className="section-header">
              <h2>Your Want to Read List</h2>
              <div className="section-actions">
                {wantToReadBooks.length > 0 && (
                  <button 
                    onClick={() => {
                      if (confirm('Are you sure you want to clear your entire want-to-read list?')) {
                        wantToReadBooks.forEach(book => storage.removeWantToReadBook(book.id));
                        setWantToReadBooks([]);
                      }
                    }}
                    className="btn btn-secondary"
                    title="Clear all want-to-read books"
                  >
                    🗑️ Clear All
                  </button>
                )}
              </div>
            </div>

            <WantToReadList 
              wantToReadBooks={wantToReadBooks}
              onRemoveFromWantToRead={handleRemoveFromWantToRead}
              onMarkAsRead={handleMarkAsRead}
              onUpdatePriority={handleUpdateWantToReadPriority}
              onUpdateNotes={handleUpdateWantToReadNotes}
            />
          </div>
        )}
      </main>

      {/* Add Book Modal */}
      {bookToAdd && (
        <AddBookModal
          book={bookToAdd}
          onAdd={handleConfirmAddBook}
          onCancel={handleCancelAddBook}
          isOpen={showAddModal}
        />
      )}
    </div>
  );
}

export default App
