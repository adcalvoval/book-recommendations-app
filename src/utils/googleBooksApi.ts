import type { Book } from '../types';

export interface GoogleBook {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    description?: string;
    averageRating?: number;
    ratingsCount?: number;
    categories?: string[];
    publishedDate?: string;
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
    industryIdentifiers?: Array<{
      type: string;
      identifier: string;
    }>;
  };
}

export interface GoogleBooksResponse {
  items?: GoogleBook[];
  totalItems: number;
}

const GOOGLE_BOOKS_BASE_URL = 'https://www.googleapis.com/books/v1/volumes';

// Search for books by title and author
export const searchGoogleBooks = async (title: string, author?: string): Promise<GoogleBook[]> => {
  try {
    let query = `intitle:"${title}"`;
    if (author) {
      query += ` inauthor:"${author}"`;
    }
    
    const response = await fetch(
      `${GOOGLE_BOOKS_BASE_URL}?q=${encodeURIComponent(query)}&maxResults=5&orderBy=relevance`
    );
    
    if (!response.ok) {
      throw new Error(`Google Books API error: ${response.status}`);
    }
    
    const data: GoogleBooksResponse = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('Error searching Google Books:', error);
    return [];
  }
};

// Get book details by Google Books ID
export const getBookDetails = async (bookId: string): Promise<GoogleBook | null> => {
  try {
    const response = await fetch(`${GOOGLE_BOOKS_BASE_URL}/${bookId}`);
    
    if (!response.ok) {
      throw new Error(`Google Books API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting book details:', error);
    return null;
  }
};

// Search for similar books by category/subject
export const searchSimilarBooks = async (categories: string[], author?: string): Promise<GoogleBook[]> => {
  try {
    const categoryQuery = categories.slice(0, 2).map(cat => `subject:"${cat}"`).join(' OR ');
    let query = `(${categoryQuery})`;
    
    // Exclude the same author to get variety
    if (author) {
      query += ` -inauthor:"${author}"`;
    }
    
    const response = await fetch(
      `${GOOGLE_BOOKS_BASE_URL}?q=${encodeURIComponent(query)}&maxResults=20&orderBy=relevance`
    );
    
    if (!response.ok) {
      throw new Error(`Google Books API error: ${response.status}`);
    }
    
    const data: GoogleBooksResponse = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('Error searching similar books:', error);
    return [];
  }
};

// Search by author
export const searchBooksByAuthor = async (author: string): Promise<GoogleBook[]> => {
  try {
    const query = `inauthor:"${author}"`;
    
    const response = await fetch(
      `${GOOGLE_BOOKS_BASE_URL}?q=${encodeURIComponent(query)}&maxResults=10&orderBy=relevance`
    );
    
    if (!response.ok) {
      throw new Error(`Google Books API error: ${response.status}`);
    }
    
    const data: GoogleBooksResponse = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('Error searching books by author:', error);
    return [];
  }
};

// Convert GoogleBook to our Book interface
export const convertGoogleBookToBook = (googleBook: GoogleBook): Book => {
  const volumeInfo = googleBook.volumeInfo;
  
  return {
    id: `google-${googleBook.id}`,
    title: volumeInfo.title || 'Unknown Title',
    author: volumeInfo.authors?.[0] || 'Unknown Author',
    genre: volumeInfo.categories || ['General'],
    rating: volumeInfo.averageRating || 0,
    description: volumeInfo.description ? 
      volumeInfo.description.replace(/<[^>]*>/g, '').substring(0, 500) : undefined,
    summary: volumeInfo.description ? 
      volumeInfo.description.replace(/<[^>]*>/g, '').substring(0, 300) : undefined,
    year: volumeInfo.publishedDate ? parseInt(volumeInfo.publishedDate.split('-')[0]) : undefined,
    coverUrl: volumeInfo.imageLinks?.thumbnail || volumeInfo.imageLinks?.smallThumbnail,
    isbn: volumeInfo.industryIdentifiers?.find(id => id.type === 'ISBN_13')?.identifier
  };
};

// Enhanced search specifically for authors
export const searchBooksByAuthorEnhanced = async (authorName: string): Promise<GoogleBook[]> => {
  try {
    const results: GoogleBook[] = [];
    const seenIds = new Set<string>();
    
    // Multiple search strategies for authors
    const authorQueries = [
      `inauthor:"${authorName}"`, // Exact author match
      `inauthor:${authorName}`, // Partial author match
      `"${authorName}"`, // General search with quotes
      authorName // Simple search
    ];
    
    for (const query of authorQueries) {
      if (results.length >= 15) break;
      
      const response = await fetch(
        `${GOOGLE_BOOKS_BASE_URL}?q=${encodeURIComponent(query)}&maxResults=10&orderBy=relevance`
      );
      
      if (response.ok) {
        const data: GoogleBooksResponse = await response.json();
        
        for (const book of data.items || []) {
          // Verify author match
          const bookAuthors = book.volumeInfo.authors || [];
          const authorMatch = bookAuthors.some(author => 
            author.toLowerCase().includes(authorName.toLowerCase()) ||
            authorName.toLowerCase().includes(author.toLowerCase())
          );
          
          if (authorMatch && !seenIds.has(book.id) && results.length < 15) {
            seenIds.add(book.id);
            results.push(book);
          }
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return results;
  } catch (error) {
    console.error('Error searching books by author:', error);
    return [];
  }
};

// Enhanced search for mood and style-based queries
export const searchBooksByMoodAndStyle = async (query: string): Promise<GoogleBook[]> => {
  try {
    const results: GoogleBook[] = [];
    const seenIds = new Set<string>();
    
    // Create mood and style-based search queries
    const searchQueries = [];
    const lowerQuery = query.toLowerCase();
    
    // Mood mappings
    const moodMappings: Record<string, string[]> = {
      'mysterious': ['mystery', 'thriller', 'suspense', 'noir'],
      'dark': ['gothic', 'horror', 'dystopian', 'psychological thriller'],
      'uplifting': ['inspirational', 'feel-good', 'hopeful', 'positive'],
      'romantic': ['romance', 'love story', 'romantic fiction'],
      'adventurous': ['adventure', 'action', 'quest', 'exploration'],
      'thought-provoking': ['philosophical', 'literary fiction', 'social commentary'],
      'scandinavian': ['nordic noir', 'swedish crime', 'norwegian fiction', 'danish mystery'],
      'crime': ['crime fiction', 'detective', 'police procedural', 'true crime']
    };
    
    // Add direct query
    searchQueries.push(query);
    
    // Add mapped queries based on mood/style keywords
    for (const [mood, genres] of Object.entries(moodMappings)) {
      if (lowerQuery.includes(mood)) {
        genres.forEach(genre => {
          searchQueries.push(`subject:"${genre}"`);
          searchQueries.push(genre);
        });
      }
    }
    
    // Add general subject searches
    searchQueries.push(`subject:"${query}"`);
    
    // Execute searches
    for (const searchQuery of searchQueries.slice(0, 8)) {
      if (results.length >= 20) break;
      
      const response = await fetch(
        `${GOOGLE_BOOKS_BASE_URL}?q=${encodeURIComponent(searchQuery)}&maxResults=8&orderBy=relevance`
      );
      
      if (response.ok) {
        const data: GoogleBooksResponse = await response.json();
        
        for (const book of data.items || []) {
          if (!seenIds.has(book.id) && results.length < 20) {
            seenIds.add(book.id);
            results.push(book);
          }
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return results;
  } catch (error) {
    console.error('Error searching by mood and style:', error);
    return [];
  }
};

// Enhanced book search with multiple strategies
export const searchBooksMultiStrategy = async (query: string, searchType?: string): Promise<GoogleBook[]> => {
  try {
    // Route to specialized search functions
    if (searchType === 'author') {
      return await searchBooksByAuthorEnhanced(query);
    }
    
    if (searchType === 'mood' || searchType === 'style') {
      return await searchBooksByMoodAndStyle(query);
    }
    
    // General multi-strategy search
    const queries = [
      query, // Direct search
      `intitle:"${query}"`, // Title search
      `subject:"${query}"`, // Subject search
      `${query} fiction`, // Fiction variant
      `${query} novel` // Novel variant
    ];
    
    const results: GoogleBook[] = [];
    const seenIds = new Set<string>();
    
    for (const searchQuery of queries) {
      if (results.length >= 20) break; // Limit total results
      
      const response = await fetch(
        `${GOOGLE_BOOKS_BASE_URL}?q=${encodeURIComponent(searchQuery)}&maxResults=10&orderBy=relevance`
      );
      
      if (response.ok) {
        const data: GoogleBooksResponse = await response.json();
        
        for (const book of data.items || []) {
          if (!seenIds.has(book.id) && results.length < 20) {
            seenIds.add(book.id);
            results.push(book);
          }
        }
      }
      
      // Small delay to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return results;
  } catch (error) {
    console.error('Error in multi-strategy search:', error);
    return [];
  }
};