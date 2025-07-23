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
    // Try multiple sources for book covers
    let coverUrl = await fetchFromOpenLibrary(book);
    
    if (!coverUrl) {
      coverUrl = await fetchFromGoogleBooks(book);
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

const fetchFromGoogleBooks = async (book: Book): Promise<string | null> => {
  try {
    const query = `intitle:"${book.title}" inauthor:"${book.author}"`;
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=1`;

    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) return null;

    const data = await response.json();
    if (data.items && data.items.length > 0) {
      const book = data.items[0];
      if (book.volumeInfo && book.volumeInfo.imageLinks) {
        // Prefer higher resolution images
        return book.volumeInfo.imageLinks.thumbnail || 
               book.volumeInfo.imageLinks.smallThumbnail ||
               null;
      }
    }

    return null;
  } catch (error) {
    console.warn('Google Books cover fetch error:', error);
    return null;
  }
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