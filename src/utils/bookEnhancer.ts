import type { Book } from '../types';

export interface EnhancedBook extends Book {
  summary?: string;
  similarBooks?: string[];
}

const CACHE_KEY_PREFIX = 'book-summary-';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

interface CachedSummary {
  summary: string;
  timestamp: number;
}

// Since we can't directly call WebFetch from client code, we'll create a service
// that enhances books with summaries using available APIs and data

export const enhanceBookWithSummary = async (book: Book): Promise<EnhancedBook> => {
  const cacheKey = `${CACHE_KEY_PREFIX}${book.id}`;
  
  // Check localStorage cache first
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const { summary, timestamp }: CachedSummary = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        return { ...book, summary };
      }
    }
  } catch (error) {
    console.warn('Cache read error:', error);
  }

  // Try to fetch summary from Open Library (CORS-friendly)
  try {
    const summary = await fetchSummaryFromOpenLibrary(book);
    if (summary) {
      // Cache the result
      try {
        localStorage.setItem(cacheKey, JSON.stringify({
          summary,
          timestamp: Date.now()
        }));
      } catch (error) {
        console.warn('Cache write error:', error);
      }
      
      return { ...book, summary };
    }
  } catch (error) {
    console.warn(`Failed to fetch summary for ${book.title}:`, error);
  }

  // Return book without summary if fetch fails
  return book;
};

const fetchSummaryFromOpenLibrary = async (book: Book): Promise<string | undefined> => {
  try {
    // First, search for the book
    let searchQuery = '';
    
    if (book.isbn) {
      searchQuery = book.isbn;
    } else {
      searchQuery = `${book.title} ${book.author}`;
    }
    
    const searchResponse = await fetch(
      `https://openlibrary.org/search.json?q=${encodeURIComponent(searchQuery)}&limit=3`,
      { mode: 'cors' }
    );
    
    if (!searchResponse.ok) return undefined;
    
    const searchData = await searchResponse.json();
    
    if (!searchData.docs || searchData.docs.length === 0) {
      return undefined;
    }

    // Try each result to find one with a description
    for (const doc of searchData.docs) {
      if (doc.key) {
        try {
          const workResponse = await fetch(
            `https://openlibrary.org${doc.key}.json`,
            { mode: 'cors' }
          );
          
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
                // Clean up the description
                return cleanDescription(description);
              }
            }
          }
        } catch (error) {
          console.warn(`Failed to fetch work details for ${doc.key}:`, error);
          continue;
        }
      }
    }
    
    return undefined;
  } catch (error) {
    console.warn(`Open Library API error for ${book.title}:`, error);
    return undefined;
  }
};

const cleanDescription = (description: string): string => {
  // Remove common Wikipedia/markdown formatting
  let cleaned = description
    .replace(/\[\[([^\]]+)\]\]/g, '$1') // Remove wiki links
    .replace(/\[([^\]]+)\]/g, '') // Remove reference brackets
    .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold markdown
    .replace(/\*([^*]+)\*/g, '$1') // Remove italic markdown
    .replace(/--/g, '—') // Replace double dashes
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
    
  // Truncate if too long (keep first few sentences)
  if (cleaned.length > 500) {
    const sentences = cleaned.split(/[.!?]+/);
    let result = '';
    
    for (const sentence of sentences) {
      if (result.length + sentence.length + 1 > 400) break;
      result += sentence + '. ';
    }
    
    cleaned = result.trim();
  }
  
  return cleaned;
};

// Enhanced recommendation function that considers book summaries and themes
export const findSimilarBooks = (targetBook: Book, allBooks: Book[]): Book[] => {
  const similar: Book[] = [];
  
  // Simple similarity based on genre overlap and rating proximity
  for (const book of allBooks) {
    if (book.id === targetBook.id) continue;
    
    let similarity = 0;
    
    // Genre similarity (strongest factor)
    const genreOverlap = targetBook.genre.filter(genre => 
      book.genre.includes(genre)
    ).length;
    similarity += genreOverlap * 3;
    
    // Author similarity
    if (book.author === targetBook.author) {
      similarity += 5;
    }
    
    // Rating proximity
    const ratingDiff = Math.abs(book.rating - targetBook.rating);
    if (ratingDiff <= 1) {
      similarity += 2 - ratingDiff;
    }
    
    // Publication era similarity
    if (book.year && targetBook.year) {
      const yearDiff = Math.abs(book.year - targetBook.year);
      if (yearDiff <= 10) {
        similarity += 1;
      }
    }
    
    if (similarity > 0) {
      similar.push(book);
    }
  }
  
  // Sort by similarity and return top matches
  return similar
    .sort((a, b) => {
      // Recalculate scores for sorting
      const scoreA = calculateSimilarityScore(a, targetBook);
      const scoreB = calculateSimilarityScore(b, targetBook);
      return scoreB - scoreA;
    })
    .slice(0, 5);
};

const calculateSimilarityScore = (book: Book, target: Book): number => {
  let score = 0;
  
  const genreOverlap = target.genre.filter(genre => 
    book.genre.includes(genre)
  ).length;
  score += genreOverlap * 3;
  
  if (book.author === target.author) score += 5;
  
  const ratingDiff = Math.abs(book.rating - target.rating);
  if (ratingDiff <= 1) score += 2 - ratingDiff;
  
  if (book.year && target.year) {
    const yearDiff = Math.abs(book.year - target.year);
    if (yearDiff <= 10) score += 1;
  }
  
  return score;
};

// Batch enhance multiple books
export const enhanceBooksWithSummaries = async (books: Book[]): Promise<EnhancedBook[]> => {
  const enhanced: EnhancedBook[] = [];
  const batchSize = 2; // Limit concurrent requests to be respectful
  
  for (let i = 0; i < books.length; i += batchSize) {
    const batch = books.slice(i, i + batchSize);
    
    const promises = batch.map(book => enhanceBookWithSummary(book));
    const results = await Promise.all(promises);
    
    enhanced.push(...results);
    
    // Add small delay between batches
    if (i + batchSize < books.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  return enhanced;
};