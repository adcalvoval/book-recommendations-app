export interface Book {
  id: string;
  title: string;
  author: string;
  genre: string[];
  rating: number; // Supports 0.5 increments (1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0)
  description?: string;
  summary?: string;
  year?: number;
  isbn?: string;
  coverUrl?: string;
  tags?: string[];
}

export interface BookFormData {
  title: string;
  author: string;
  genre: string;
  rating: number;
  description?: string;
  summary?: string;
  year?: number;
  tags?: string;
}

export interface WishlistItem {
  id: string;
  title: string;
  author: string;
  summary: string;
  genre?: string[];
  year?: number;
  coverUrl?: string;
  rating?: number; // Out of 5
  dateAdded: string;
  source: 'search' | 'manual';
}