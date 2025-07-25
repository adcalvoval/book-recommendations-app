import { useState, useEffect } from 'react';
import './App.css';
import type { Book, BookFormData } from './types';
import { storage } from './utils/storage';
import { fetchBookSummaryFromOpenLibrary } from './utils/goodreadsApi';
import BookForm from './components/BookForm';
import BookList from './components/BookList';
import CSVImport from './components/CSVImport';
import SearchBar from './components/SearchBar';
import WishlistView from './components/WishlistView';

function App() {
  const [books, setBooks] = useState<Book[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [currentView, setCurrentView] = useState<'books' | 'wishlist'>('books');

  useEffect(() => {
    const loadedBooks = storage.getBooks();
    setBooks(loadedBooks);
  }, []);

  const fetchBookSummary = async (book: Book): Promise<Book> => {
    if (book.summary) return book; // Already has a summary
    
    try {
      const summary = await fetchBookSummaryFromOpenLibrary(book);
      if (summary) {
        const updatedBook = { ...book, summary };
        storage.updateBook(updatedBook);
        return updatedBook;
      }
    } catch (error) {
      console.warn(`Failed to fetch summary for ${book.title}:`, error);
    }
    
    return book;
  };

  const handleAddBook = async (bookData: BookFormData) => {
    const newBook: Book = {
      id: Date.now().toString(),
      ...bookData,
      genre: bookData.genre.split(',').map(g => g.trim()).filter(g => g.length > 0),
      tags: bookData.tags ? bookData.tags.split(',').map(t => t.trim()).filter(t => t.length > 0) : []
    };
    
    const updatedBooks = [...books, newBook];
    setBooks(updatedBooks);
    storage.addBook(newBook);
  };

  // Function for SearchBar to add books directly (already converted from BookFormData)
  const handleAddBookFromSearch = (book: Book) => {
    const updatedBooks = [...books, book];
    setBooks(updatedBooks);
    storage.addBook(book);
    
    // Fetch summary in the background
    fetchBookSummary(book).then(bookWithSummary => {
      if (bookWithSummary.summary) {
        setBooks(currentBooks => 
          currentBooks.map(book => 
            book.id === bookWithSummary.id ? bookWithSummary : book
          )
        );
      }
    });
  };

  const handleRemoveBook = async (id: string) => {
    const updatedBooks = books.filter(book => book.id !== id);
    setBooks(updatedBooks);
    storage.removeBook(id);
  };

  const handleBookUpdate = async (updatedBook: Book) => {
    const updatedBooks = books.map(book => 
      book.id === updatedBook.id ? updatedBook : book
    );
    setBooks(updatedBooks);
    storage.updateBook(updatedBook);
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
    setShowImport(false);
    
    if (newBooks.length > 0) {
      alert(`Successfully imported ${newBooks.length} books! Summaries will be fetched automatically.`);
      
      // Fetch summaries for imported books (batch process to avoid overwhelming APIs)
      const booksWithoutSummaries = newBooks.filter(book => !book.summary);
      if (booksWithoutSummaries.length > 0) {
        booksWithoutSummaries.forEach(async (book, index) => {
          // Add delay between requests to be respectful to APIs
          setTimeout(async () => {
            const bookWithSummary = await fetchBookSummary(book);
            if (bookWithSummary.summary) {
              setBooks(currentBooks => 
                currentBooks.map(b => 
                  b.id === bookWithSummary.id ? bookWithSummary : b
                )
              );
            }
          }, index * 2000); // 2 second delay between each request
        });
      }
    } else {
      alert('No new books to import. All books were already in your library.');
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>My Book Library</h1>
        <p>Track your reading and manage your personal book collection</p>
        <nav className="app-nav">
          <button 
            onClick={() => setCurrentView('books')}
            className={`nav-btn ${currentView === 'books' ? 'active' : ''}`}
          >
My Books
          </button>
          <button 
            onClick={() => setCurrentView('wishlist')}
            className={`nav-btn ${currentView === 'wishlist' ? 'active' : ''}`}
          >
Wishlist
          </button>
        </nav>
      </header>

      <div className="search-section">
        <SearchBar userBooks={books} onAddBook={handleAddBookFromSearch} />
      </div>

      <main className="app-main">
        {currentView === 'books' ? (
          <div className="books-section">
            <div className="section-header">
              <h2>Your Reading Library</h2>
              <div className="section-actions">
                <button 
                  onClick={() => setShowImport(!showImport)}
                  className="btn btn-secondary"
                >
                  {showImport ? 'Cancel Import' : '📁 Import from CSV'}
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

            {showForm && (
              <div className="form-container">
                <BookForm 
                  onSubmit={handleAddBook}
                  onCancel={() => setShowForm(false)}
                />
              </div>
            )}

            <BookList 
              books={books}
              onRemoveBook={handleRemoveBook}
              onBookUpdate={handleBookUpdate}
            />
          </div>
        ) : (
          <WishlistView />
        )}
      </main>
    </div>
  );
}

export default App;