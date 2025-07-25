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
    // Try Google Books first with enhanced matching
    let coverUrl = await fetchFromGoogleBooksEnhanced(book);
    
    // If Google Books fails, try Open Library with better search
    if (!coverUrl) {
      coverUrl = await fetchFromOpenLibraryEnhanced(book);
    }
    
    // Try additional sources
    if (!coverUrl) {
      coverUrl = await fetchFromAlternativeSources(book);
    }
    
    // Validate the cover URL before caching
    if (coverUrl && await isValidImageUrl(coverUrl)) {
      // Cache the result
      const cacheData = { url: coverUrl, timestamp: Date.now() };
      coverCache.set(cacheKey, cacheData);
      
      try {
        localStorage.setItem(`${COVER_CACHE_KEY_PREFIX}${cacheKey}`, JSON.stringify(cacheData));
      } catch (error) {
        console.warn('Error saving cover to localStorage:', error);
      }
    } else {
      // If no valid cover found, use placeholder
      coverUrl = generatePlaceholderCover(book);
    }

    return coverUrl;
  } catch (error) {
    console.warn(`Error fetching cover for ${book.title}:`, error);
    return generatePlaceholderCover(book);
  }
};

// Enhanced Open Library search with better matching
const fetchFromOpenLibraryEnhanced = async (book: Book): Promise<string | null> => {
  return await fetchFromOpenLibrary(book);
};

const fetchFromOpenLibrary = async (book: Book): Promise<string | null> => {
  try {
    // Try multiple search strategies for Open Library
    const searchStrategies = [
      // ISBN search first (most accurate)
      ...(book.isbn ? [{ type: 'isbn', query: book.isbn.replace(/[^0-9X]/g, '') }] : []),
      // Exact title and author
      { type: 'q', query: `title:"${book.title}" author:"${book.author}"` },
      // Looser search
      { type: 'q', query: `title:${book.title} author:${book.author}` },
      // Title only
      { type: 'q', query: `title:"${book.title}"` }
    ];

    for (const strategy of searchStrategies) {
      const searchUrl = `https://openlibrary.org/search.json?${strategy.type}=${encodeURIComponent(strategy.query)}&limit=5`;
      
      const response = await fetch(searchUrl, { mode: 'cors' });
      if (!response.ok) continue;

      const data = await response.json();
      if (data.docs && data.docs.length > 0) {
        // Find the best matching book
        for (const doc of data.docs) {
          // Verify this is a good match
          if (isGoodBookMatch(book, { 
            title: doc.title, 
            authors: doc.author_name || [],
            publishedDate: doc.first_publish_year?.toString()
          })) {
            // Try to get cover from various fields
            let coverKey = null;
            
            if (doc.cover_i) {
              coverKey = doc.cover_i;
            } else if (doc.cover_edition_key) {
              coverKey = doc.cover_edition_key;
            } else if (doc.edition_key && doc.edition_key.length > 0) {
              // Try to get cover from first edition
              try {
                const editionResponse = await fetch(`https://openlibrary.org/books/${doc.edition_key[0]}.json`, { mode: 'cors' });
                if (editionResponse.ok) {
                  const editionData = await editionResponse.json();
                  if (editionData.covers && editionData.covers.length > 0) {
                    coverKey = editionData.covers[0];
                  }
                }
              } catch {
                // Continue if edition fetch fails
              }
            }

            if (coverKey) {
              const coverUrl = `https://covers.openlibrary.org/b/id/${coverKey}-L.jpg`; // Use large size
              // Validate the cover exists
              if (await isValidImageUrl(coverUrl)) {
                return coverUrl;
              }
            }
          }
        }
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
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
      // Most specific search with exact matching
      `intitle:"${book.title}" inauthor:"${book.author}"`,
      // ISBN search if available
      ...(book.isbn ? [`isbn:${book.isbn.replace(/[^0-9X]/g, '')}`] : []),
      // Title and author with quotes but less strict
      `"${book.title}" "${book.author}"`,
      // Normalized title search
      `intitle:${normalizeTitle(book.title).split(' ').join(' ')} inauthor:"${book.author}"`,
      // Author-focused search for popular authors
      `inauthor:"${book.author}" subject:fiction`,
      // Title-focused search
      `intitle:"${book.title}"`,
      // Very loose search as fallback
      `${book.title} ${book.author}`.replace(/[^\w\s]/g, '')
    ];

    let bestMatch: { url: string; confidence: number } | null = null;

    for (const query of searchStrategies) {
      const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=10&orderBy=relevance`;
      
      const response = await fetch(url, { mode: 'cors' });
      if (!response.ok) continue;

      const data = await response.json();
      if (data.items && data.items.length > 0) {
        // Find the best match with confidence scoring
        for (const item of data.items) {
          const volumeInfo = item.volumeInfo;
          
          // Calculate match confidence
          const confidence = calculateMatchConfidence(book, volumeInfo);
          
          if (confidence > 0.7 && volumeInfo.imageLinks) {
            // Prefer highest resolution available
            const coverUrl = volumeInfo.imageLinks.extraLarge ||
                            volumeInfo.imageLinks.large ||
                            volumeInfo.imageLinks.medium ||
                            volumeInfo.imageLinks.thumbnail ||
                            volumeInfo.imageLinks.smallThumbnail;
            
            if (coverUrl) {
              const httpsUrl = coverUrl.replace(/^http:/, 'https:');
              
              // Keep track of the best match
              if (!bestMatch || confidence > bestMatch.confidence) {
                bestMatch = { url: httpsUrl, confidence };
              }
              
              // If we have a very high confidence match, return immediately
              if (confidence > 0.9) {
                return httpsUrl;
              }
            }
          }
        }
      }
      
      // Small delay between requests to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 150));
    }

    // Return the best match found, if any
    return bestMatch ? bestMatch.url : null;
  } catch (error) {
    console.warn('Google Books enhanced cover fetch error:', error);
    return null;
  }
};

// Enhanced matching with better normalization and fuzzy matching
const isGoodBookMatch = (book: Book, volumeInfo: { title?: string; authors?: string[]; publishedDate?: string }): boolean => {
  const bookTitle = normalizeTitle(book.title);
  const bookAuthor = normalizeAuthor(book.author);
  
  const googleTitle = normalizeTitle(volumeInfo.title || '');
  const googleAuthors = (volumeInfo.authors || []).map(normalizeAuthor);
  
  // Enhanced title matching with multiple strategies
  const titleMatch = checkTitleMatch(bookTitle, googleTitle);
  
  // Enhanced author matching
  const authorMatch = checkAuthorMatch(bookAuthor, googleAuthors);
  
  // Year matching bonus (if available)
  let yearBonus = 0;
  if (book.year && volumeInfo.publishedDate) {
    const googleYear = parseInt(volumeInfo.publishedDate.split('-')[0]);
    if (Math.abs(book.year - googleYear) <= 1) {
      yearBonus = 0.2;
    }
  }
  
  // Calculate confidence score
  const titleScore = titleMatch ? 0.6 : 0;
  const authorScore = authorMatch ? 0.4 : 0;
  const totalScore = titleScore + authorScore + yearBonus;
  
  return totalScore >= 0.8; // Require 80% confidence
};

// Calculate detailed match confidence for ranking results
const calculateMatchConfidence = (book: Book, volumeInfo: { title?: string; authors?: string[]; publishedDate?: string }): number => {
  const bookTitle = normalizeTitle(book.title);
  const bookAuthor = normalizeAuthor(book.author);
  
  const googleTitle = normalizeTitle(volumeInfo.title || '');
  const googleAuthors = (volumeInfo.authors || []).map(normalizeAuthor);
  
  let titleScore = 0;
  let authorScore = 0;
  let yearScore = 0;
  
  // Title scoring with multiple criteria
  if (bookTitle === googleTitle) {
    titleScore = 1.0; // Perfect match
  } else if (bookTitle.includes(googleTitle) || googleTitle.includes(bookTitle)) {
    titleScore = 0.8; // Substring match
  } else {
    const similarity = calculateStringSimilarity(bookTitle, googleTitle);
    if (similarity > 0.7) {
      titleScore = similarity * 0.7; // Fuzzy match with penalty
    }
  }
  
  // Author scoring
  const bestAuthorMatch = Math.max(...googleAuthors.map(googleAuthor => {
    if (bookAuthor === googleAuthor) return 1.0;
    if (bookAuthor.includes(googleAuthor) || googleAuthor.includes(bookAuthor)) return 0.9;
    
    // Last name matching
    const bookLastName = bookAuthor.split(' ').pop() || '';
    const googleLastName = googleAuthor.split(' ').pop() || '';
    if (bookLastName.length > 2 && googleLastName.length > 2 && bookLastName === googleLastName) {
      return 0.8;
    }
    
    return calculateStringSimilarity(bookAuthor, googleAuthor);
  }), 0);
  
  authorScore = bestAuthorMatch;
  
  // Year scoring (bonus points)
  if (book.year && volumeInfo.publishedDate) {
    try {
      const googleYear = parseInt(volumeInfo.publishedDate.split('-')[0]);
      const yearDiff = Math.abs(book.year - googleYear);
      if (yearDiff === 0) yearScore = 0.2;
      else if (yearDiff <= 1) yearScore = 0.1;
      else if (yearDiff <= 3) yearScore = 0.05;
    } catch {
      // Invalid year format, ignore
    }
  }
  
  // Weighted final score
  const finalScore = (titleScore * 0.6) + (authorScore * 0.3) + yearScore;
  return Math.min(finalScore, 1.0);
};

// Enhanced text normalization functions
const normalizeTitle = (title: string): string => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/\b(the|a|an)\b/g, '') // Remove articles
    .trim();
};

const normalizeAuthor = (author: string): string => {
  return author
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
};

const checkTitleMatch = (bookTitle: string, googleTitle: string): boolean => {
  if (!bookTitle || !googleTitle) return false;
  
  // Exact match after normalization
  if (bookTitle === googleTitle) return true;
  
  // Substring match
  if (bookTitle.includes(googleTitle) || googleTitle.includes(bookTitle)) return true;
  
  // Fuzzy match with high threshold
  if (calculateStringSimilarity(bookTitle, googleTitle) > 0.8) return true;
  
  // Word-based matching for titles with different word order
  const bookWords = bookTitle.split(' ').filter(w => w.length > 2);
  const googleWords = googleTitle.split(' ').filter(w => w.length > 2);
  
  if (bookWords.length === 0 || googleWords.length === 0) return false;
  
  const matchedWords = bookWords.filter(word => 
    googleWords.some(gWord => word === gWord || calculateStringSimilarity(word, gWord) > 0.9)
  );
  
  return matchedWords.length >= Math.max(1, Math.min(bookWords.length, googleWords.length) * 0.7);
};

const checkAuthorMatch = (bookAuthor: string, googleAuthors: string[]): boolean => {
  if (!bookAuthor || googleAuthors.length === 0) return false;
  
  return googleAuthors.some(googleAuthor => {
    // Exact match
    if (bookAuthor === googleAuthor) return true;
    
    // Substring match
    if (bookAuthor.includes(googleAuthor) || googleAuthor.includes(bookAuthor)) return true;
    
    // Handle last name only matches
    const bookLastName = bookAuthor.split(' ').pop() || '';
    const googleLastName = googleAuthor.split(' ').pop() || '';
    if (bookLastName.length > 2 && googleLastName.length > 2 && 
        bookLastName === googleLastName) return true;
    
    // Fuzzy match
    return calculateStringSimilarity(bookAuthor, googleAuthor) > 0.85;
  });
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


// Validate if a URL points to a valid image
const isValidImageUrl = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    if (!response.ok) return false;
    
    const contentType = response.headers.get('content-type');
    return contentType ? contentType.startsWith('image/') : false;
  } catch {
    return false;
  }
};

// Try alternative cover sources
const fetchFromAlternativeSources = async (book: Book): Promise<string | null> => {
  // Try Internet Archive
  try {
    const query = `title:"${book.title}" creator:"${book.author}"`;
    const response = await fetch(`https://archive.org/advancedsearch.php?q=${encodeURIComponent(query)}&fl=identifier,title,creator&rows=5&page=1&output=json`);
    
    if (response.ok) {
      const data = await response.json();
      if (data.response?.docs?.length > 0) {
        for (const doc of data.response.docs) {
          // Check if this looks like a good match
          if (isGoodBookMatch(book, { 
            title: doc.title, 
            authors: [doc.creator] 
          })) {
            const coverUrl = `https://archive.org/services/img/${doc.identifier}`;
            if (await isValidImageUrl(coverUrl)) {
              return coverUrl;
            }
          }
        }
      }
    }
  } catch (error) {
    console.warn('Archive.org search failed:', error);
  }
  
  return null;
};

const generatePlaceholderCover = (book: Book): string => {
  // Generate a placeholder cover using a service like via.placeholder.com or create a data URL
  const width = 128;
  const height = 192;
  
  // Create a simple colored background based on the book title
  const colors = [
    '#f5f5f5', '#e8e8e8', '#d4d4d4', '#c0c0c0', 
    '#a8a8a8', '#909090', '#787878', '#606060'
  ];
  
  const colorIndex = book.title.length % colors.length;
  const backgroundColor = colors[colorIndex];
  
  // Use a placeholder service that accepts color parameters
  return `https://via.placeholder.com/${width}x${height}/${backgroundColor.substring(1)}/666666?text=${encodeURIComponent(book.title.substring(0, 20))}`;
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

// Force refresh a specific book's cover
export const refreshBookCover = async (book: Book): Promise<string | null> => {
  // Clear the cache for this book
  coverCache.delete(book.id);
  try {
    localStorage.removeItem(`${COVER_CACHE_KEY_PREFIX}${book.id}`);
  } catch (error) {
    console.warn('Error removing cached cover:', error);
  }
  
  // Fetch fresh cover
  return await fetchBookCover(book);
};

// Batch refresh covers for multiple books with improved accuracy
export const refreshMultipleBookCovers = async (books: Book[]): Promise<Map<string, string>> => {
  const coverMap = new Map<string, string>();
  const batchSize = 2;
  
  console.log(`🔄 Refreshing covers for ${books.length} books with enhanced accuracy...`);
  
  for (let i = 0; i < books.length; i += batchSize) {
    const batch = books.slice(i, i + batchSize);
    
    const promises = batch.map(async (book) => {
      try {
        const newCover = await refreshBookCover(book);
        if (newCover && newCover !== book.coverUrl) {
          console.log(`✅ Updated cover for "${book.title}" by ${book.author}`);
          coverMap.set(book.id, newCover);
        }
      } catch (error) {
        console.warn(`❌ Failed to refresh cover for "${book.title}":`, error);
      }
    });
    
    await Promise.all(promises);
    
    // Progress indicator
    const progress = Math.min(i + batchSize, books.length);
    console.log(`📊 Processed ${progress}/${books.length} books...`);
    
    // Respectful delay between batches
    if (i + batchSize < books.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.log(`🎉 Cover refresh complete! Updated ${coverMap.size} covers.`);
  return coverMap;
};