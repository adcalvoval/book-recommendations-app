import type { Book } from '../types';

const BOOKS_STORAGE_KEY = 'book-recommendations-books';

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
  }
};