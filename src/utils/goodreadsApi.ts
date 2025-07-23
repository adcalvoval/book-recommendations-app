import type { Book } from '../types';

export interface GoodreadsBookData {
  summary?: string;
  similarBooks?: Array<{
    title: string;
    author: string;
    rating: number;
    genres: string[];
  }>;
  userRecommendations?: Array<{
    title: string;
    author: string;
    rating: number;
    genres: string[];
  }>;
}

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

interface CachedBookData {
  data: GoodreadsBookData;
  timestamp: number;
}

const bookDataCache = new Map<string, CachedBookData>();

export const fetchBookDataFromGoodreads = async (book: Book): Promise<GoodreadsBookData> => {
  const cacheKey = `${book.title}-${book.author}`;
  
  // Check cache first
  const cached = bookDataCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    // For now, we only use Open Library API (Goodreads integration would require backend)
    const bookData: GoodreadsBookData = {};
    
    // Cache the result
    bookDataCache.set(cacheKey, {
      data: bookData,
      timestamp: Date.now()
    });
    
    return bookData;
  } catch (error) {
    console.error(`Error fetching data for ${book.title}:`, error);
    return {};
  }
};

// These functions are placeholders for future Goodreads integration
// Currently using Open Library API as the primary source

// Alternative approach using Open Library API as fallback
export const fetchBookSummaryFromOpenLibrary = async (book: Book): Promise<string | undefined> => {
  try {
    let searchQuery = '';
    
    if (book.isbn) {
      searchQuery = `isbn:${book.isbn}`;
    } else {
      searchQuery = `title:"${book.title}" AND author:"${book.author}"`;
    }
    
    const response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(searchQuery)}&limit=1`);
    
    if (!response.ok) return undefined;
    
    const data = await response.json();
    
    if (data.docs && data.docs.length > 0) {
      const bookDoc = data.docs[0];
      
      // Try to get work details for description
      if (bookDoc.key) {
        const workResponse = await fetch(`https://openlibrary.org${bookDoc.key}.json`);
        if (workResponse.ok) {
          const workData = await workResponse.json();
          if (workData.description) {
            if (typeof workData.description === 'string') {
              return workData.description;
            } else if (workData.description.value) {
              return workData.description.value;
            }
          }
        }
      }
      
      // Fallback to the first sentence from search results
      if (bookDoc.first_sentence && bookDoc.first_sentence.length > 0) {
        return bookDoc.first_sentence[0];
      }
    }
    
    return undefined;
  } catch (error) {
    console.warn(`Could not fetch summary from Open Library for ${book.title}:`, error);
    return undefined;
  }
};

// Batch fetch summaries for multiple books
export const fetchBookSummariesBatch = async (books: Book[]): Promise<Map<string, string>> => {
  const summaryMap = new Map<string, string>();
  const batchSize = 3; // Limit concurrent requests
  
  for (let i = 0; i < books.length; i += batchSize) {
    const batch = books.slice(i, i + batchSize);
    
    const promises = batch.map(async (book) => {
      const bookId = book.id;
      
      // Try Goodreads first, then Open Library as fallback
      try {
        const goodreadsData = await fetchBookDataFromGoodreads(book);
        if (goodreadsData.summary) {
          summaryMap.set(bookId, goodreadsData.summary);
          return;
        }
      } catch (error) {
        console.warn(`Goodreads fetch failed for ${book.title}, trying Open Library`);
      }
      
      // Fallback to Open Library
      try {
        const summary = await fetchBookSummaryFromOpenLibrary(book);
        if (summary) {
          summaryMap.set(bookId, summary);
        }
      } catch (error) {
        console.warn(`Failed to fetch summary for ${book.title}:`, error);
      }
    });
    
    await Promise.all(promises);
    
    // Add delay between batches to be respectful to APIs
    if (i + batchSize < books.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return summaryMap;
};