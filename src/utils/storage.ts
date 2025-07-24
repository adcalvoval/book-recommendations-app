import type { Book, WantToReadBook } from '../types';
import type { BookRecommendation } from './recommendations';

const BOOKS_STORAGE_KEY = 'book-recommendations-books';
const REJECTED_BOOKS_STORAGE_KEY = 'book-recommendations-rejected';
const LIKED_RECOMMENDATIONS_STORAGE_KEY = 'book-recommendations-liked';
const LIKED_BOOKS_DATA_STORAGE_KEY = 'book-recommendations-liked-data';
const WANT_TO_READ_BOOKS_STORAGE_KEY = 'book-recommendations-want-to-read';

export const storage = {
  getBooks: (): Book[] => {
    try {
      const stored = localStorage.getItem(BOOKS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading books from storage:', error);
      return [];
    }
  },

  saveBooks: (books: Book[]): void => {
    try {
      localStorage.setItem(BOOKS_STORAGE_KEY, JSON.stringify(books));
    } catch (error) {
      console.error('Error saving books to storage:', error);
    }
  },

  addBook: (book: Book): void => {
    const books = storage.getBooks();
    books.push(book);
    storage.saveBooks(books);
  },

  removeBook: (id: string): void => {
    const books = storage.getBooks().filter(book => book.id !== id);
    storage.saveBooks(books);
  },

  updateBook: (updatedBook: Book): void => {
    const books = storage.getBooks();
    const index = books.findIndex(book => book.id === updatedBook.id);
    if (index !== -1) {
      books[index] = updatedBook;
      storage.saveBooks(books);
    }
  },

  getRejectedBooks: (): string[] => {
    try {
      const stored = localStorage.getItem(REJECTED_BOOKS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading rejected books from storage:', error);
      return [];
    }
  },

  saveRejectedBooks: (rejectedIds: string[]): void => {
    try {
      localStorage.setItem(REJECTED_BOOKS_STORAGE_KEY, JSON.stringify(rejectedIds));
    } catch (error) {
      console.error('Error saving rejected books to storage:', error);
    }
  },

  addRejectedBook: (bookId: string): void => {
    const rejectedIds = storage.getRejectedBooks();
    if (!rejectedIds.includes(bookId)) {
      rejectedIds.push(bookId);
      storage.saveRejectedBooks(rejectedIds);
    }
  },

  isBookRejected: (bookId: string): boolean => {
    return storage.getRejectedBooks().includes(bookId);
  },

  clearRejectedBooks: (): void => {
    localStorage.removeItem(REJECTED_BOOKS_STORAGE_KEY);
  },

  getLikedRecommendations: (): string[] => {
    try {
      const stored = localStorage.getItem(LIKED_RECOMMENDATIONS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading liked recommendations from storage:', error);
      return [];
    }
  },

  saveLikedRecommendations: (likedIds: string[]): void => {
    try {
      localStorage.setItem(LIKED_RECOMMENDATIONS_STORAGE_KEY, JSON.stringify(likedIds));
    } catch (error) {
      console.error('Error saving liked recommendations to storage:', error);
    }
  },

  addLikedRecommendation: (bookId: string): void => {
    const likedIds = storage.getLikedRecommendations();
    if (!likedIds.includes(bookId)) {
      likedIds.push(bookId);
      storage.saveLikedRecommendations(likedIds);
    }
  },

  removeLikedRecommendation: (bookId: string): void => {
    const likedIds = storage.getLikedRecommendations();
    const updatedIds = likedIds.filter(id => id !== bookId);
    storage.saveLikedRecommendations(updatedIds);
  },

  isRecommendationLiked: (bookId: string): boolean => {
    return storage.getLikedRecommendations().includes(bookId);
  },

  clearLikedRecommendations: (): void => {
    localStorage.removeItem(LIKED_RECOMMENDATIONS_STORAGE_KEY);
    localStorage.removeItem(LIKED_BOOKS_DATA_STORAGE_KEY);
  },

  // Enhanced liked books storage with full book data
  getLikedBooksData: (): BookRecommendation[] => {
    try {
      const stored = localStorage.getItem(LIKED_BOOKS_DATA_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading liked books data from storage:', error);
      return [];
    }
  },

  saveLikedBooksData: (likedBooks: BookRecommendation[]): void => {
    try {
      localStorage.setItem(LIKED_BOOKS_DATA_STORAGE_KEY, JSON.stringify(likedBooks));
    } catch (error) {
      console.error('Error saving liked books data to storage:', error);
    }
  },

  addLikedBookData: (book: BookRecommendation): void => {
    const likedBooks = storage.getLikedBooksData();
    // Check if book is already in liked data
    const existingIndex = likedBooks.findIndex(b => b.id === book.id);
    
    if (existingIndex === -1) {
      // Add new liked book
      likedBooks.push({
        ...book,
        likedAt: new Date().toISOString() // Add timestamp when liked
      });
      storage.saveLikedBooksData(likedBooks);
    }
    
    // Also maintain the ID list for compatibility
    storage.addLikedRecommendation(book.id);
  },

  removeLikedBookData: (bookId: string): void => {
    const likedBooks = storage.getLikedBooksData();
    const updatedBooks = likedBooks.filter(book => book.id !== bookId);
    storage.saveLikedBooksData(updatedBooks);
    
    // Also remove from ID list
    storage.removeLikedRecommendation(bookId);
  },

  // Want to Read books storage
  getWantToReadBooks: (): WantToReadBook[] => {
    try {
      const stored = localStorage.getItem(WANT_TO_READ_BOOKS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading want-to-read books from storage:', error);
      return [];
    }
  },

  saveWantToReadBooks: (books: WantToReadBook[]): void => {
    try {
      localStorage.setItem(WANT_TO_READ_BOOKS_STORAGE_KEY, JSON.stringify(books));
    } catch (error) {
      console.error('Error saving want-to-read books to storage:', error);
    }
  },

  addWantToReadBook: (book: WantToReadBook): void => {
    const books = storage.getWantToReadBooks();
    // Check if book already exists (by title and author)
    const exists = books.some(b => 
      b.title.toLowerCase() === book.title.toLowerCase() && 
      b.author.toLowerCase() === book.author.toLowerCase()
    );
    
    if (!exists) {
      books.push({
        ...book,
        dateAdded: new Date().toISOString()
      });
      storage.saveWantToReadBooks(books);
    }
  },

  removeWantToReadBook: (id: string): void => {
    const books = storage.getWantToReadBooks().filter(book => book.id !== id);
    storage.saveWantToReadBooks(books);
  },

  updateWantToReadBook: (updatedBook: WantToReadBook): void => {
    const books = storage.getWantToReadBooks();
    const index = books.findIndex(book => book.id === updatedBook.id);
    if (index !== -1) {
      books[index] = updatedBook;
      storage.saveWantToReadBooks(books);
    }
  },

  moveWantToReadToLibrary: (wantToReadId: string, readBook: Book): void => {
    // Remove from want-to-read list
    storage.removeWantToReadBook(wantToReadId);
    // Add to main library
    storage.addBook(readBook);
  }
};