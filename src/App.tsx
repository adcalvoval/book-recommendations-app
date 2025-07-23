import { useState, useEffect } from 'react';
import './App.css';
import type { Book, BookFormData } from './types';
import { storage } from './utils/storage';
import { getRecommendations, sampleBooks, type BookRecommendation } from './utils/recommendations';
import { enhanceBooksWithSummaries } from './utils/bookEnhancer';
import { generateTagsForBooks, filterBooksByTags } from './utils/bookTagger';
import { fetchBookCovers } from './utils/bookCovers';
import BookForm from './components/BookForm';
import BookList from './components/BookList';
import RecommendationList from './components/RecommendationList';
import CSVImport from './components/CSVImport';
import TagFilter from './components/TagFilter';
import SmartSearch from './components/SmartSearch';
import type { SearchCriteria } from './components/SmartSearch';
import { getSearchBasedRecommendations } from './utils/searchRecommendations';
import AddBookModal from './components/AddBookModal';

function App() {
  const [books, setBooks] = useState<Book[]>([]);
  const [recommendations, setRecommendations] = useState<BookRecommendation[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [isLoadingSummaries, setIsLoadingSummaries] = useState(false);
  const [isGeneratingTags, setIsGeneratingTags] = useState(false);
  const [isFetchingCovers, setIsFetchingCovers] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showTagFilter, setShowTagFilter] = useState(false);
  const [, setRefreshSeed] = useState(Date.now());
  const [activeTab, setActiveTab] = useState<'books' | 'recommendations'>('books');
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria | null>(null);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [shownRecommendationIds, setShownRecommendationIds] = useState<string[]>([]);
  const [refreshCount, setRefreshCount] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [bookToAdd, setBookToAdd] = useState<BookRecommendation | null>(null);

  useEffect(() => {
    const loadedBooks = storage.getBooks();
    setBooks(loadedBooks);
    if (!isSearchActive) {
      const recs = getRecommendations(loadedBooks, sampleBooks);
      setRecommendations(recs);
    }
  }, [isSearchActive]);

  const updateRecommendations = (userBooks: Book[], options?: { shuffle?: boolean; seed?: number; refresh?: boolean }) => {
    if (isSearchActive && searchCriteria) {
      const searchRecs = getSearchBasedRecommendations(searchCriteria, userBooks, sampleBooks);
      setRecommendations(searchRecs);
      return;
    }

    // Determine exclusion strategy based on refresh type
    let excludeIds: string[] = [];
    let useOptions: any = { ...options };

    if (options?.refresh) {
      // For refresh, exclude only the most recent recommendations (not too many)
      const excludeCount = Math.min(shownRecommendationIds.length, Math.min(20, refreshCount * 3)); 
      excludeIds = shownRecommendationIds.slice(-excludeCount);
      useOptions.excludeIds = excludeIds;
      useOptions.diversify = true; // Always diversify on refresh
    }

    const recs = getRecommendations(userBooks, sampleBooks, useOptions);
    setRecommendations(recs);

    // Track shown recommendations for future exclusion
    if (options?.refresh) {
      const newIds = recs.map(rec => rec.id);
      setShownRecommendationIds(prev => {
        // Keep last 30 shown recommendations to avoid repetition but not exhaust the pool
        const combined = [...prev, ...newIds];
        return combined.slice(-30);
      });
    }
  };

  const handleSearch = (criteria: SearchCriteria) => {
    setSearchCriteria(criteria);
    setIsSearchActive(true);
    setActiveTab('recommendations');
    
    const searchRecs = getSearchBasedRecommendations(criteria, books, sampleBooks);
    setRecommendations(searchRecs);
  };

  const handleClearSearch = () => {
    setSearchCriteria(null);
    setIsSearchActive(false);
    setRefreshCount(0); // Reset refresh count when clearing search
    setShownRecommendationIds([]); // Reset shown recommendations
    updateRecommendations(books);
  };

  const handleAddBook = (bookData: BookFormData) => {
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
    updateRecommendations(updatedBooks);
    setShowForm(false);
  };

  const handleRemoveBook = (id: string) => {
    const updatedBooks = books.filter(book => book.id !== id);
    setBooks(updatedBooks);
    storage.removeBook(id);
    // Reset refresh tracking when library changes
    setRefreshCount(0);
    setShownRecommendationIds([]);
    updateRecommendations(updatedBooks);
  };

  const handleBookUpdate = (updatedBook: Book) => {
    const updatedBooks = books.map(book => 
      book.id === updatedBook.id ? updatedBook : book
    );
    setBooks(updatedBooks);
    storage.updateBook(updatedBook);
    updateRecommendations(updatedBooks);
  };

  const handleAddToLibrary = (book: BookRecommendation) => {
    // Check if book is already in library
    const existingBook = books.find(b => 
      b.title.toLowerCase() === book.title.toLowerCase() && 
      b.author.toLowerCase() === book.author.toLowerCase()
    );
    
    if (existingBook) {
      alert('This book is already in your library!');
      return;
    }

    setBookToAdd(book);
    setShowAddModal(true);
  };

  const handleConfirmAddBook = (bookData: BookFormData) => {
    if (!bookToAdd) return;

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
    updateRecommendations(updatedBooks);
    
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

  const handleImportBooks = async (importedBooks: Book[]) => {
    // Filter out books that are already in the library (by title and author)
    const existingBooks = new Set(books.map(book => `${book.title.toLowerCase()}-${book.author.toLowerCase()}`));
    const newBooks = importedBooks.filter(book => 
      !existingBooks.has(`${book.title.toLowerCase()}-${book.author.toLowerCase()}`)
    );
    
    const updatedBooks = [...books, ...newBooks];
    setBooks(updatedBooks);
    
    // Save all new books to storage
    newBooks.forEach(book => storage.addBook(book));
    
    updateRecommendations(updatedBooks);
    setShowImport(false);
    
    // Fetch summaries, generate tags, and get covers for new books in the background
    if (newBooks.length > 0) {
      fetchSummariesForBooks(newBooks);
      generateTagsForImportedBooks(newBooks);
      fetchCoversForImportedBooks(newBooks);
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

  const handleRefreshRecommendations = () => {
    const newSeed = Date.now();
    setRefreshSeed(newSeed);
    setRefreshCount(prev => prev + 1);
    
    if (isSearchActive && searchCriteria) {
      // For search results, just re-run the search with shuffle
      const searchRecs = getSearchBasedRecommendations(searchCriteria, books, sampleBooks);
      const shuffledRecs = shuffleArray(searchRecs, newSeed);
      setRecommendations(shuffledRecs.slice(0, 12));
    } else {
      updateRecommendations(books, { 
        shuffle: true, 
        seed: newSeed, 
        refresh: true 
      });
    }
  };

  // Helper function for shuffling search results
  const shuffleArray = (array: any[], seed: number): any[] => {
    const shuffled = [...array];
    let random = Math.sin(seed) * 10000;
    
    for (let i = shuffled.length - 1; i > 0; i--) {
      random = Math.sin(random) * 10000;
      const j = Math.floor((random - Math.floor(random)) * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    return shuffled;
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

  const fetchCoversForImportedBooks = async (importedBooks: Book[]) => {
    try {
      const coverMap = await fetchBookCovers(importedBooks);
      
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
                  disabled={isFetchingCovers || books.length === 0}
                >
                  {isFetchingCovers ? '⏳ Loading...' : '🖼️ Get Covers'}
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
                  title={isSearchActive ? "Shuffle search results" : "Discover new recommendations"}
                >
                  🔄 {isSearchActive ? 'Shuffle Results' : 'Discover More'}
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
              userBooks={books}
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
