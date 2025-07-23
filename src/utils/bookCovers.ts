import type { Book } from '../types';

const COVER_CACHE_KEY_PREFIX = 'book-cover-';
const COVER_CACHE_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days

interface CachedCover {
  url: string;
  timestamp: number;
}

const coverCache = new Map<string, CachedCover>();

// Load cache from localStorage on initialization
const loadCacheFromStorage = () => {
  try {
    const keys = Object.keys(localStorage).filter(key => key.startsWith(COVER_CACHE_KEY_PREFIX));
    keys.forEach(key => {
      const cached = localStorage.getItem(key);
      if (cached) {
        const { url, timestamp }: CachedCover = JSON.parse(cached);
        const bookId = key.replace(COVER_CACHE_KEY_PREFIX, '');
        coverCache.set(bookId, { url, timestamp });
      }
    });
  } catch (error) {
    console.warn('Error loading cover cache from storage:', error);
  }
};

// Initialize cache
loadCacheFromStorage();

export const fetchBookCover = async (book: Book): Promise<string | null> => {
  const cacheKey = book.id;
  
  // Check cache first
  const cached = coverCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < COVER_CACHE_DURATION) {
    return cached.url;
  }

  try {
    // Try Google Books first for more accurate covers
    let coverUrl = await fetchFromGoogleBooksEnhanced(book);
    
    if (!coverUrl) {
      coverUrl = await fetchFromOpenLibrary(book);
    }
    
    if (!coverUrl) {
      coverUrl = generatePlaceholderCover(book);
    }

    // Cache the result
    if (coverUrl) {
      const cacheData = { url: coverUrl, timestamp: Date.now() };
      coverCache.set(cacheKey, cacheData);
      
      try {
        localStorage.setItem(`${COVER_CACHE_KEY_PREFIX}${cacheKey}`, JSON.stringify(cacheData));
      } catch (error) {
        console.warn('Error saving cover to localStorage:', error);
      }
    }

    return coverUrl;
  } catch (error) {
    console.warn(`Error fetching cover for ${book.title}:`, error);
    return generatePlaceholderCover(book);
  }
};

const fetchFromOpenLibrary = async (book: Book): Promise<string | null> => {
  try {
    // First, search for the book to get the Open Library ID
    let searchQuery = '';
    if (book.isbn) {
      searchQuery = book.isbn.replace(/[^0-9X]/g, ''); // Clean ISBN
    } else {
      searchQuery = `title:"${book.title}" author:"${book.author}"`;
    }

    const searchUrl = `https://openlibrary.org/search.json?${book.isbn ? 'isbn' : 'q'}=${encodeURIComponent(searchQuery)}&limit=1`;
    
    const response = await fetch(searchUrl, { mode: 'cors' });
    if (!response.ok) return null;

    const data = await response.json();
    if (data.docs && data.docs.length > 0) {
      const doc = data.docs[0];
      
      // Try to get cover from various fields
      let coverKey = null;
      
      if (doc.cover_i) {
        coverKey = doc.cover_i;
      } else if (doc.cover_edition_key) {
        coverKey = doc.cover_edition_key;
      } else if (doc.edition_key && doc.edition_key.length > 0) {
        // Try to get cover from first edition
        const editionResponse = await fetch(`https://openlibrary.org/books/${doc.edition_key[0]}.json`, { mode: 'cors' });
        if (editionResponse.ok) {
          const editionData = await editionResponse.json();
          if (editionData.covers && editionData.covers.length > 0) {
            coverKey = editionData.covers[0];
          }
        }
      }

      if (coverKey) {
        return `https://covers.openlibrary.org/b/id/${coverKey}-M.jpg`;
      }
    }

    return null;
  } catch (error) {
    console.warn('OpenLibrary cover fetch error:', error);
    return null;
  }
};

// Enhanced Google Books cover fetching with multiple strategies
const fetchFromGoogleBooksEnhanced = async (book: Book): Promise<string | null> => {
  try {
    // Try multiple search strategies for better matching
    const searchStrategies = [
      // Most specific search
      `intitle:"${book.title}" inauthor:"${book.author}"`,
      // Slightly looser search
      `"${book.title}" "${book.author}"`,
      // Title-focused search
      `intitle:"${book.title}"`,
      // Very loose search as fallback
      `${book.title} ${book.author}`
    ];

    for (const query of searchStrategies) {
      const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=5&orderBy=relevance`;
      
      const response = await fetch(url, { mode: 'cors' });
      if (!response.ok) continue;

      const data = await response.json();
      if (data.items && data.items.length > 0) {
        // Find the best match
        for (const item of data.items) {
          const volumeInfo = item.volumeInfo;
          
          // Verify this is a good match
          if (isGoodBookMatch(book, volumeInfo)) {
            if (volumeInfo.imageLinks) {
              // Prefer highest resolution available
              const coverUrl = volumeInfo.imageLinks.extraLarge ||
                              volumeInfo.imageLinks.large ||
                              volumeInfo.imageLinks.medium ||
                              volumeInfo.imageLinks.thumbnail ||
                              volumeInfo.imageLinks.smallThumbnail;
              
              if (coverUrl) {
                // Convert to HTTPS if needed
                return coverUrl.replace(/^http:/, 'https:');
              }
            }
          }
        }
      }
      
      // Small delay between requests to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return null;
  } catch (error) {
    console.warn('Google Books enhanced cover fetch error:', error);
    return null;
  }
};

// Check if a Google Books result is a good match for our book
const isGoodBookMatch = (book: Book, volumeInfo: any): boolean => {
  const bookTitle = book.title.toLowerCase().trim();
  const bookAuthor = book.author.toLowerCase().trim();
  
  const googleTitle = (volumeInfo.title || '').toLowerCase().trim();
  const googleAuthors = (volumeInfo.authors || []).map((a: string) => a.toLowerCase().trim());
  
  // Check title similarity
  const titleMatch = googleTitle.includes(bookTitle) || 
                    bookTitle.includes(googleTitle) ||
                    calculateStringSimilarity(bookTitle, googleTitle) > 0.7;
  
  // Check author match
  const authorMatch = googleAuthors.some((googleAuthor: string) => 
    googleAuthor.includes(bookAuthor) || 
    bookAuthor.includes(googleAuthor) ||
    calculateStringSimilarity(bookAuthor, googleAuthor) > 0.8
  );
  
  return titleMatch && authorMatch;
};

// Simple string similarity calculation
const calculateStringSimilarity = (str1: string, str2: string): number => {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
};

// Levenshtein distance calculation
const levenshteinDistance = (str1: string, str2: string): number => {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
};


const generatePlaceholderCover = (book: Book): string => {
  // Generate a placeholder cover using a service like via.placeholder.com or create a data URL
  const width = 128;
  const height = 192;
  
  // Create a simple colored background based on the book title
  const colors = [
    '#667eea', '#f093fb', '#4facfe', '#43e97b', 
    '#fa709a', '#ffc837', '#a8edea', '#d299c2',
    '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4'
  ];
  
  const colorIndex = book.title.length % colors.length;
  const backgroundColor = colors[colorIndex];
  
  // Use a placeholder service that accepts color parameters
  return `https://via.placeholder.com/${width}x${height}/${backgroundColor.substring(1)}/ffffff?text=${encodeURIComponent(book.title.substring(0, 20))}`;
};

// Batch fetch covers for multiple books
export const fetchBookCovers = async (books: Book[]): Promise<Map<string, string>> => {
  const coverMap = new Map<string, string>();
  const batchSize = 3; // Limit concurrent requests
  
  for (let i = 0; i < books.length; i += batchSize) {
    const batch = books.slice(i, i + batchSize);
    
    const promises = batch.map(async (book) => {
      const cover = await fetchBookCover(book);
      if (cover) {
        coverMap.set(book.id, cover);
      }
    });
    
    await Promise.all(promises);
    
    // Add delay between batches to be respectful to APIs
    if (i + batchSize < books.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  return coverMap;
};

// Preload covers for better user experience
export const preloadBookCover = (coverUrl: string): void => {
  if (coverUrl && !coverUrl.startsWith('data:')) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = coverUrl;
  }
};

// Enhanced function to refresh covers for existing library books using Google Books
export const refreshLibraryCoversWithGoogleBooks = async (books: Book[]): Promise<Map<string, string>> => {
  const coverMap = new Map<string, string>();
  const batchSize = 2; // Smaller batch size for more careful processing
  
  console.log(`Refreshing covers for ${books.length} books using Google Books API...`);
  
  for (let i = 0; i < books.length; i += batchSize) {
    const batch = books.slice(i, i + batchSize);
    
    const promises = batch.map(async (book) => {
      try {
        // Force refresh from Google Books (bypass cache)
        const coverUrl = await fetchFromGoogleBooksEnhanced(book);
        
        if (coverUrl && coverUrl !== book.coverUrl) {
          console.log(`Found better cover for "${book.title}" by ${book.author}`);
          coverMap.set(book.id, coverUrl);
          
          // Update cache with new cover
          const cacheData = { url: coverUrl, timestamp: Date.now() };
          coverCache.set(book.id, cacheData);
          
          try {
            localStorage.setItem(`${COVER_CACHE_KEY_PREFIX}${book.id}`, JSON.stringify(cacheData));
          } catch (error) {
            console.warn('Error saving refreshed cover to localStorage:', error);
          }
        }
      } catch (error) {
        console.warn(`Error refreshing cover for "${book.title}":`, error);
      }
    });
    
    await Promise.all(promises);
    
    // Progress indicator
    const progress = Math.min(i + batchSize, books.length);
    console.log(`Processed ${progress}/${books.length} books...`);
    
    // Add delay between batches to respect API rate limits
    if (i + batchSize < books.length) {
      await new Promise(resolve => setTimeout(resolve, 800));
    }
  }
  
  console.log(`Cover refresh complete. Updated ${coverMap.size} book covers.`);
  return coverMap;
};

// Function to get high-quality covers for newly added books
export const fetchHighQualityCover = async (book: Book): Promise<string | null> => {
  // This is specifically for getting the best possible cover from Google Books
  return await fetchFromGoogleBooksEnhanced(book);
};

// Clear old cache entries
export const cleanCoverCache = (): void => {
  const now = Date.now();
  const keysToRemove: string[] = [];
  
  coverCache.forEach((cached, key) => {
    if (now - cached.timestamp > COVER_CACHE_DURATION) {
      keysToRemove.push(key);
    }
  });
  
  keysToRemove.forEach(key => {
    coverCache.delete(key);
    try {
      localStorage.removeItem(`${COVER_CACHE_KEY_PREFIX}${key}`);
    } catch (error) {
      console.warn('Error removing cached cover:', error);
    }
  });
};