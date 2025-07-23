import type { Book } from '../types';

const BOOKS_STORAGE_KEY = 'book-recommendations-books';
const REJECTED_BOOKS_STORAGE_KEY = 'book-recommendations-rejected';
const LIKED_RECOMMENDATIONS_STORAGE_KEY = 'book-recommendations-liked';

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
  }
};