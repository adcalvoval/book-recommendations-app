import type { Book, WishlistItem } from '../types';

const BOOKS_STORAGE_KEY = 'book-library-books';
const WISHLIST_STORAGE_KEY = 'book-library-wishlist';

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

  // Wishlist operations
  getWishlist: (): WishlistItem[] => {
    try {
      const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading wishlist from storage:', error);
      return [];
    }
  },

  saveWishlist: (wishlist: WishlistItem[]): void => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    } catch (error) {
      console.error('Error saving wishlist to storage:', error);
    }
  },

  addToWishlist: (item: WishlistItem): void => {
    const wishlist = storage.getWishlist();
    wishlist.push(item);
    storage.saveWishlist(wishlist);
  },

  removeFromWishlist: (id: string): void => {
    const wishlist = storage.getWishlist().filter(item => item.id !== id);
    storage.saveWishlist(wishlist);
  },

  clearWishlist: (): void => {
    try {
      localStorage.removeItem(WISHLIST_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing wishlist:', error);
    }
  },

  // Clear all data (useful for development/testing)
  clearAll: (): void => {
    try {
      localStorage.removeItem(BOOKS_STORAGE_KEY);
      localStorage.removeItem(WISHLIST_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }
};