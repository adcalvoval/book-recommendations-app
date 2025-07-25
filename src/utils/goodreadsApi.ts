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

// Function to search Goodreads and extract book summary
const searchGoodreadsForBook = async (book: Book): Promise<string | undefined> => {
  try {
    console.log(`Searching Goodreads for: ${book.title} by ${book.author}`);
    
    // This would need to be implemented with a backend service or proxy
    // For now, we'll return undefined and fall back to Open Library
    return undefined;
  } catch (error) {
    console.warn(`Error searching Goodreads for ${book.title}:`, error);
    return undefined;
  }
};

// Helper function to truncate summary to max 3 sentences
const truncateToSentences = (text: string, maxSentences: number = 3): string => {
  if (!text) return '';
  
  // Simple sentence splitting (handles periods, exclamation marks, question marks)
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  
  if (sentences.length <= maxSentences) {
    return text.trim();
  }
  
  return sentences.slice(0, maxSentences).join(' ').trim();
};

export const fetchBookDataFromGoodreads = async (book: Book): Promise<GoodreadsBookData> => {
  const cacheKey = `${book.title}-${book.author}`;
  
  // Check cache first
  const cached = bookDataCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const bookData: GoodreadsBookData = {};
    
    // Try to get summary from Goodreads (this would need backend implementation)
    const goodreadsSummary = await searchGoodreadsForBook(book);
    if (goodreadsSummary) {
      bookData.summary = truncateToSentences(goodreadsSummary, 3);
    }
    
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
            let description = '';
            if (typeof workData.description === 'string') {
              description = workData.description;
            } else if (workData.description.value) {
              description = workData.description.value;
            }
            
            if (description) {
              return truncateToSentences(description, 3);
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
      } catch {
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