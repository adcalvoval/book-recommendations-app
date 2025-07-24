export interface BookTag {
  name: string;
  category: 'genre' | 'theme' | 'setting' | 'mood' | 'length' | 'era' | 'style' | 'audience';
  confidence: number;
}

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
  tags?: BookTag[];
  coverUrl?: string;
}

export interface WantToReadBook {
  id: string;
  title: string;
  author: string;
  genre: string[];
  description?: string;
  summary?: string;
  year?: number;
  isbn?: string;
  tags?: BookTag[];
  coverUrl?: string;
  dateAdded?: string; // ISO timestamp when added to want-to-read
  priority?: 'low' | 'medium' | 'high'; // User can set reading priority
  notes?: string; // User notes about why they want to read it
}

export interface BookFormData {
  title: string;
  author: string;
  genre: string;
  rating: number;
  description?: string;
  summary?: string;
  year?: number;
}