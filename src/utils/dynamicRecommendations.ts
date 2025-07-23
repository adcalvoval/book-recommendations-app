import type { Book } from '../types';
import type { BookRecommendation } from './recommendations';
import { 
  searchGoogleBooks, 
  searchSimilarBooks, 
  searchBooksMultiStrategy,
  searchBooksByAuthorEnhanced,
  searchBooksByMoodAndStyle,
  convertGoogleBookToBook
} from './googleBooksApi';
import { 
  getBestsellersByGenre, 
  getMixedBestsellers,
  convertNYTBookToBook 
} from './nytBooksApi';
import { storage } from './storage';


// Enhanced function to check if a book is already in user's library
const isBookInUserLibrary = (book: Book, userBooks: Book[]): boolean => {
  return userBooks.some(userBook => {
    // Check by ID first (most reliable)
    if (userBook.id === book.id) return true;
    
    // Check by title and author (case insensitive) as fallback
    const titleMatch = userBook.title.toLowerCase().trim() === book.title.toLowerCase().trim();
    const authorMatch = userBook.author.toLowerCase().trim() === book.author.toLowerCase().trim();
    
    // Also check for very similar titles (in case of slight variations)
    const titleSimilar = userBook.title.toLowerCase().replace(/[^a-z0-9]/g, '') === 
                        book.title.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    return (titleMatch && authorMatch) || (titleSimilar && authorMatch);
  });
};

// Get recommendations based on user's reading preferences
export const getDynamicRecommendations = async (userBooks: Book[]): Promise<BookRecommendation[]> => {
  if (userBooks.length === 0) {
    // If no books in library, return popular bestsellers
    return getBestsellerRecommendations([]);
  }

  try {
    const recommendations: BookRecommendation[] = [];
    const seenBooks = new Set<string>(); // Track by ID
    const seenTitleAuthor = new Set<string>(); // Track by title-author combination
    const seenAuthors = new Set<string>(); // Track authors to prevent duplicates
    
    // Get rejected books to exclude them
    const rejectedBookIds = storage.getRejectedBooks();
    rejectedBookIds.forEach(id => seenBooks.add(id));
    
    // Get liked books preferences for improving recommendations
    const likedIds = storage.getLikedRecommendations();
    // We'll need to fetch liked books data from previous recommendations
    // For now, we'll use the library books and combine with user behavior
    
    // Helper function to create unique key for book
    const getBookKey = (book: Book) => 
      `${book.title.toLowerCase().trim()}-${book.author.toLowerCase().trim()}`;
    
    // Helper function to normalize author name
    const normalizeAuthor = (author: string) => 
      author.toLowerCase().trim().replace(/[^\w\s]/g, '');
    
    // Helper function to check if we can add this book (not duplicate and not same author)
    const canAddBook = (book: Book): boolean => {
      const bookKey = getBookKey(book);
      const normalizedAuthor = normalizeAuthor(book.author);
      
      return !seenBooks.has(book.id) && 
             !seenTitleAuthor.has(bookKey) && 
             !seenAuthors.has(normalizedAuthor) &&
             !isBookInUserLibrary(book, userBooks);
    };
    
    // Helper function to add book to tracking sets
    const addBookToTracking = (book: Book) => {
      seenBooks.add(book.id);
      seenTitleAuthor.add(getBookKey(book));
      seenAuthors.add(normalizeAuthor(book.author));
    };
    
    // Function to boost score based on liked books preferences
    const boostScoreBasedOnLikes = (book: Book, baseScore: number): number => {
      if (likedIds.length === 0) return baseScore;
      
      let bonus = 0;
      
      // Get preferred genres from user's library (high-rated books)
      const favoriteGenres = userBooks
        .filter(b => b.rating >= 4)
        .flatMap(b => b.genre);
      
      const genreFreq = new Map<string, number>();
      favoriteGenres.forEach(genre => {
        genreFreq.set(genre, (genreFreq.get(genre) || 0) + 1);
      });
      
      // Boost for preferred genres
      book.genre.forEach(genre => {
        const frequency = genreFreq.get(genre) || 0;
        if (frequency > 0) {
          bonus += Math.min(15, frequency * 5); // Up to 15 points for popular genres
        }
      });
      
      // Boost for preferred rating range
      const preferredRatingMin = 3.5; // Based on user's liked books
      if (book.rating >= preferredRatingMin) {
        bonus += Math.min(10, (book.rating - preferredRatingMin) * 4);
      }
      
      // Boost for recent years if user likes newer books
      const currentYear = new Date().getFullYear();
      const recentThreshold = currentYear - 10;
      const bookYear = book.year || 0;
      if (bookYear >= recentThreshold) {
        bonus += 5;
      }
      
      return Math.min(100, baseScore + bonus);
    };

    // Strategy 1: Find similar books based on user's highest-rated books
    const favoriteBooks = userBooks.filter(book => book.rating >= 4).slice(0, 3);
    
    for (const book of favoriteBooks) {
      const similarBooks = await searchSimilarBooks(book.genre, book.author);
      
      for (const googleBook of similarBooks.slice(0, 5)) { // Get more to account for deduplication
        const convertedBook = convertGoogleBookToBook(googleBook);
        
        if (canAddBook(convertedBook)) {
          addBookToTracking(convertedBook);
          const baseScore = calculateSimilarityScore(convertedBook, book);
          const boostedScore = boostScoreBasedOnLikes(convertedBook, baseScore);
          recommendations.push({
            ...convertedBook,
            score: boostedScore,
            reasons: [`Similar to "${book.title}"`],
            similarTo: book.title
          });
          
          // Limit per strategy to ensure variety
          if (recommendations.length >= 3) break;
        }
      }
      if (recommendations.length >= 3) break;
    }

    // Strategy 2: Trending books in different genres (skip author strategy to ensure variety)
    const userGenres = [...new Set(userBooks.flatMap(book => book.genre))];
    
    for (const genre of userGenres.slice(0, 3)) {
      if (recommendations.length >= 6) break; // Leave room for other strategies
      
      const bestsellers = await getBestsellersByGenre(genre);
      
      for (const nytBook of bestsellers.slice(0, 4)) { // Get more to account for deduplication
        const convertedBook = convertNYTBookToBook(nytBook);
        
        // Try to enhance with Google Books data
        try {
          const googleBooks = await searchGoogleBooks(convertedBook.title, convertedBook.author);
          if (googleBooks.length > 0) {
            const enhancedBook = convertGoogleBookToBook(googleBooks[0]);
            // Merge enhanced data while keeping original ID
            convertedBook.summary = enhancedBook.summary || convertedBook.summary;
            convertedBook.rating = enhancedBook.rating || convertedBook.rating;
            convertedBook.coverUrl = enhancedBook.coverUrl || convertedBook.coverUrl;
            convertedBook.genre = enhancedBook.genre.length > 1 ? enhancedBook.genre : convertedBook.genre;
          }
        } catch (error) {
          // Continue without enhancement if Google Books fails
        }
        
        if (canAddBook(convertedBook)) {
          addBookToTracking(convertedBook);
          const baseScore = 75 + Math.floor(Math.random() * 15);
          const boostedScore = boostScoreBasedOnLikes(convertedBook, baseScore);
          recommendations.push({
            ...convertedBook,
            score: boostedScore,
            reasons: [`Trending in ${genre}`, 'Popular choice among readers']
          });
          
          // Limit per genre to ensure variety
          if (recommendations.filter(r => r.reasons.some(reason => reason.includes(genre))).length >= 1) break;
        }
      }
    }

    // Strategy 3: Fill remaining slots with diverse general bestsellers
    if (recommendations.length < 8) {
      const mixedBestsellers = await getMixedBestsellers();
      
      for (const nytBook of mixedBestsellers) {
        if (recommendations.length >= 12) break;
        
        const convertedBook = convertNYTBookToBook(nytBook);
        
        // Try to enhance with Google Books data
        try {
          const googleBooks = await searchGoogleBooks(convertedBook.title, convertedBook.author);
          if (googleBooks.length > 0) {
            const enhancedBook = convertGoogleBookToBook(googleBooks[0]);
            // Merge enhanced data while keeping original ID
            convertedBook.summary = enhancedBook.summary || convertedBook.summary;
            convertedBook.rating = enhancedBook.rating || convertedBook.rating;
            convertedBook.coverUrl = enhancedBook.coverUrl || convertedBook.coverUrl;
            convertedBook.genre = enhancedBook.genre.length > 1 ? enhancedBook.genre : convertedBook.genre;
          }
        } catch (error) {
          // Continue without enhancement if Google Books fails
        }
        
        if (canAddBook(convertedBook)) {
          addBookToTracking(convertedBook);
          const baseScore = 70 + Math.floor(Math.random() * 10);
          const boostedScore = boostScoreBasedOnLikes(convertedBook, baseScore);
          recommendations.push({
            ...convertedBook,
            score: boostedScore,
            reasons: ['Currently popular', 'Bestseller across categories']
          });
        }
      }
    }

    // Sort by score and return top recommendations
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

  } catch (error) {
    console.error('Error getting dynamic recommendations:', error);
    // Fallback to bestsellers if API calls fail
    return getBestsellerRecommendations();
  }
};

// Get bestseller recommendations (fallback or for new users)
export const getBestsellerRecommendations = async (userBooks: Book[] = []): Promise<BookRecommendation[]> => {
  try {
    const bestsellers = await getMixedBestsellers();
    
    const recommendations: BookRecommendation[] = [];
    const rejectedBookIds = storage.getRejectedBooks();
    const seenBooks = new Set<string>(); // Track by ID
    const seenTitleAuthor = new Set<string>(); // Track by title-author combination
    const seenAuthors = new Set<string>(); // Track authors to prevent duplicates
    
    // Add rejected books to tracking
    rejectedBookIds.forEach(id => seenBooks.add(id));
    
    // Helper functions (same as main function)
    const getBookKey = (book: Book) => 
      `${book.title.toLowerCase().trim()}-${book.author.toLowerCase().trim()}`;
    
    const normalizeAuthor = (author: string) => 
      author.toLowerCase().trim().replace(/[^\w\s]/g, '');
    
    const canAddBook = (book: Book): boolean => {
      const bookKey = getBookKey(book);
      const normalizedAuthor = normalizeAuthor(book.author);
      
      return !seenBooks.has(book.id) && 
             !seenTitleAuthor.has(bookKey) && 
             !seenAuthors.has(normalizedAuthor);
    };
    
    const addBookToTracking = (book: Book) => {
      seenBooks.add(book.id);
      seenTitleAuthor.add(getBookKey(book));
      seenAuthors.add(normalizeAuthor(book.author));
    };
    
    // Function to boost score based on user preferences
    const boostScoreForBestsellers = (book: Book, baseScore: number): number => {
      if (userBooks.length === 0) return baseScore;
      
      let bonus = 0;
      
      // Get preferred genres from user's library
      const favoriteGenres = userBooks
        .filter(b => b.rating >= 4)
        .flatMap(b => b.genre);
      
      const genreFreq = new Map<string, number>();
      favoriteGenres.forEach(genre => {
        genreFreq.set(genre, (genreFreq.get(genre) || 0) + 1);
      });
      
      // Boost for preferred genres
      book.genre.forEach(genre => {
        const frequency = genreFreq.get(genre) || 0;
        if (frequency > 0) {
          bonus += Math.min(12, frequency * 4);
        }
      });
      
      // Boost for high ratings
      if (book.rating >= 4.0) {
        bonus += 8;
      }
      
      return Math.min(100, baseScore + bonus);
    };
    
    for (const nytBook of bestsellers) {
      if (recommendations.length >= 8) break; // Limit for variety
      
      const convertedBook = convertNYTBookToBook(nytBook);
      
      // Try to enhance with Google Books data
      try {
        const googleBooks = await searchGoogleBooks(convertedBook.title, convertedBook.author);
        if (googleBooks.length > 0) {
          const googleBook = convertGoogleBookToBook(googleBooks[0]);
          // Merge the data, keeping NYT ranking info
          convertedBook.summary = googleBook.summary || convertedBook.summary;
          convertedBook.rating = googleBook.rating || convertedBook.rating;
          convertedBook.coverUrl = googleBook.coverUrl || convertedBook.coverUrl;
          convertedBook.genre = googleBook.genre.length > 1 ? googleBook.genre : convertedBook.genre;
        }
      } catch (error) {
        console.log(`Could not enhance book ${convertedBook.title} with Google Books data`);
      }
      
      if (canAddBook(convertedBook)) {
        addBookToTracking(convertedBook);
        const baseScore = 80 + Math.floor(Math.random() * 15);
        const boostedScore = boostScoreForBestsellers(convertedBook, baseScore);
        recommendations.push({
          ...convertedBook,
          score: boostedScore,
          reasons: ['New York Times Bestseller', 'Popular across categories']
        });
      }
    }
    
    return recommendations.slice(0, 8);
  } catch (error) {
    console.error('Error getting bestseller recommendations:', error);
    return [];
  }
};

// Calculate similarity score between two books
const calculateSimilarityScore = (book: Book, referenceBook: Book): number => {
  let score = 50; // Base score
  
  // Genre similarity
  const commonGenres = book.genre.filter(genre => 
    referenceBook.genre.some(refGenre => 
      refGenre.toLowerCase().includes(genre.toLowerCase()) ||
      genre.toLowerCase().includes(refGenre.toLowerCase())
    )
  );
  score += commonGenres.length * 15;
  
  // Rating similarity (prefer highly rated books)
  if (book.rating >= 4.0) score += 20;
  if (referenceBook.rating >= 4.0 && book.rating >= 3.8) score += 10;
  
  // Random factor for variety
  score += Math.floor(Math.random() * 10);
  
  return Math.min(100, score);
};

// Enhanced search-based recommendations using APIs with intelligent query detection
export const getSearchBasedRecommendations = async (
  query: string, 
  userBooks: Book[],
  searchType?: string
): Promise<BookRecommendation[]> => {
  try {
    let googleBooks: any[] = [];
    let searchMethod = 'general';
    
    // Detect search type and use appropriate method
    const lowerQuery = query.toLowerCase();
    
    // Check for author search patterns
    const authorPatterns = [
      /(?:books?\s+by|author:?|written\s+by)\s+([^,.\n]+)/i,
      /^([a-z]+\s+[a-z]+)$/i, // Just "First Last" format
      /^([a-z]+\s+[a-z]+\s+[a-z]+)$/i, // "First Middle Last" format
      /percival\s+everett|stephen\s+king|toni\s+morrison/i // Common author patterns
    ];
    
    for (const pattern of authorPatterns) {
      const match = query.match(pattern);
      if (match) {
        const authorName = match[1] || match[0];
        googleBooks = await searchBooksByAuthorEnhanced(authorName.trim());
        searchMethod = 'author';
        break;
      }
    }
    
    // Check for mood/style search patterns
    if (googleBooks.length === 0) {
      const moodKeywords = [
        'mysterious', 'dark', 'uplifting', 'romantic', 'adventurous', 
        'thought-provoking', 'scandinavian', 'crime', 'noir', 'gothic',
        'inspirational', 'psychological', 'literary', 'cozy', 'gritty'
      ];
      
      const hasMoodKeyword = moodKeywords.some(mood => lowerQuery.includes(mood));
      
      if (hasMoodKeyword || /mood|feeling|style|atmosphere/.test(lowerQuery)) {
        googleBooks = await searchBooksByMoodAndStyle(query);
        searchMethod = 'mood';
      }
    }
    
    // Fallback to general multi-strategy search
    if (googleBooks.length === 0) {
      googleBooks = await searchBooksMultiStrategy(query, searchType);
      searchMethod = 'general';
    }
    
    const recommendations: BookRecommendation[] = [];
    
    for (const googleBook of googleBooks.slice(0, 15)) {
      const convertedBook = convertGoogleBookToBook(googleBook);
      
      if (!isBookInUserLibrary(convertedBook, userBooks)) {
        let score = calculateSearchRelevance(convertedBook, query);
        
        // Boost score for author matches
        if (searchMethod === 'author') {
          score += 20;
        }
        
        // Boost score for mood matches
        if (searchMethod === 'mood') {
          score += 15;
        }
        
        recommendations.push({
          ...convertedBook,
          score: Math.min(100, score),
          reasons: generateSearchReasons(query, searchMethod, convertedBook)
        });
      }
    }
    
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, 12);
      
  } catch (error) {
    console.error('Error getting search-based recommendations:', error);
    return [];
  }
};

// Generate contextual reasons for search results
const generateSearchReasons = (query: string, searchMethod: string, book: Book): string[] => {
  const reasons: string[] = [];
  
  switch (searchMethod) {
    case 'author':
      reasons.push(`By ${book.author}`);
      if (book.rating >= 4.0) reasons.push('Highly rated');
      break;
    case 'mood':
      reasons.push(`Matches "${query}" mood`);
      if (book.genre.some(g => query.toLowerCase().includes(g.toLowerCase()))) {
        reasons.push('Genre match');
      }
      break;
    default:
      reasons.push(`Matches "${query}"`);
      if (book.title.toLowerCase().includes(query.toLowerCase())) {
        reasons.push('Title match');
      }
  }
  
  // Add quality indicators
  if (book.rating >= 4.5) reasons.push('Excellent rating');
  else if (book.rating >= 4.0) reasons.push('Great rating');
  
  return reasons.slice(0, 3); // Limit to 3 reasons
};

// Calculate search relevance score
const calculateSearchRelevance = (book: Book, query: string): number => {
  const lowerQuery = query.toLowerCase();
  const lowerTitle = book.title.toLowerCase();
  const lowerAuthor = book.author.toLowerCase();
  
  let score = 30; // Base score
  
  // Title match
  if (lowerTitle.includes(lowerQuery)) score += 30;
  if (lowerTitle.startsWith(lowerQuery)) score += 20;
  
  // Author match
  if (lowerAuthor.includes(lowerQuery)) score += 25;
  
  // Genre match
  const genreMatch = book.genre.some(genre => 
    genre.toLowerCase().includes(lowerQuery) || lowerQuery.includes(genre.toLowerCase())
  );
  if (genreMatch) score += 20;
  
  // Description/summary match
  if (book.description && book.description.toLowerCase().includes(lowerQuery)) score += 15;
  if (book.summary && book.summary.toLowerCase().includes(lowerQuery)) score += 10;
  
  // Quality bonus
  if (book.rating >= 4.0) score += 15;
  if (book.rating >= 4.5) score += 10;
  
  return Math.min(100, score);
};

// Enhance existing books in library with Google Books data
export const enhanceBookWithGoogleData = async (book: Book): Promise<Book> => {
  try {
    const googleBooks = await searchGoogleBooks(book.title, book.author);
    
    if (googleBooks.length > 0) {
      const googleBook = convertGoogleBookToBook(googleBooks[0]);
      
      // Merge data, preserving user's rating and notes
      return {
        ...book,
        summary: googleBook.summary || book.summary,
        description: book.description || googleBook.description,
        coverUrl: googleBook.coverUrl || book.coverUrl,
        genre: googleBook.genre.length > 1 ? googleBook.genre : book.genre,
        year: googleBook.year || book.year,
        isbn: googleBook.isbn || book.isbn
      };
    }
  } catch (error) {
    console.error(`Error enhancing book ${book.title}:`, error);
  }
  
  return book;
};

// Get a replacement recommendation when user rejects a book
export const getReplacementRecommendation = async (
  rejectedBook: BookRecommendation, 
  userBooks: Book[], 
  rejectedBookIds: string[]
): Promise<BookRecommendation | null> => {
  try {
    const recommendations: BookRecommendation[] = [];
    const seenBooks = new Set<string>(); // Track by ID
    const seenTitleAuthor = new Set<string>(); // Track by title-author combination
    const seenAuthors = new Set<string>(); // Track authors to prevent duplicates
    
    // Add rejected book ID to seen books to avoid re-suggesting
    seenBooks.add(rejectedBook.id);
    rejectedBookIds.forEach(id => seenBooks.add(id));
    
    // Helper functions for deduplication
    const getBookKey = (book: Book) => 
      `${book.title.toLowerCase().trim()}-${book.author.toLowerCase().trim()}`;
    
    const normalizeAuthor = (author: string) => 
      author.toLowerCase().trim().replace(/[^\w\s]/g, '');
    
    const canAddBook = (book: Book): boolean => {
      const bookKey = getBookKey(book);
      const normalizedAuthor = normalizeAuthor(book.author);
      
      return !seenBooks.has(book.id) && 
             !seenTitleAuthor.has(bookKey) && 
             !seenAuthors.has(normalizedAuthor) &&
             !isBookInUserLibrary(book, userBooks);
    };
    
    const addBookToTracking = (book: Book) => {
      seenBooks.add(book.id);
      seenTitleAuthor.add(getBookKey(book));
      seenAuthors.add(normalizeAuthor(book.author));
    };

    // Strategy 1: Find books by the same genre as rejected book
    if (rejectedBook.genre.length > 0) {
      const genre = rejectedBook.genre[0];
      try {
        const genreBooks = await searchGoogleBooks(`subject:${genre}`);
        const genreRecs = genreBooks
          .map(convertGoogleBookToBook)
          .filter(book => 
            canAddBook(book) &&
            book.rating >= 3.5
          )
          .map(book => {
            addBookToTracking(book);
            return {
              ...book,
              score: calculateSimilarityScore(book, rejectedBook),
              reasons: [`Shares the ${genre} genre`, 'Highly rated in this category'],
              similarTo: rejectedBook.title
            };
          })
          .slice(0, 2); // Reduced to ensure variety

        recommendations.push(...genreRecs);
      } catch (error) {
        console.error('Error getting genre recommendations:', error);
      }
    }

    // Strategy 2: Find books similar to user's favorites if genre search didn't work
    if (recommendations.length === 0) {
      const favoriteBooks = userBooks.filter(book => book.rating >= 4).slice(0, 2);
      
      for (const book of favoriteBooks) {
        try {
          const similarBooks = await searchSimilarBooks(book.genre, book.author);
          const similarRecs = similarBooks
            .map(convertGoogleBookToBook)
            .filter(b => 
              canAddBook(b) &&
              b.rating >= 3.5
            )
            .map(b => {
              addBookToTracking(b);
              return {
                ...b,
                score: calculateSimilarityScore(b, book),
                reasons: [`Similar to your favorited book "${book.title}"`, 'Based on your reading preferences'],
                similarTo: book.title
              };
            })
            .slice(0, 1); // One per favorite book to ensure variety

          recommendations.push(...similarRecs);
          
          if (recommendations.length >= 1) break;
        } catch (error) {
          console.error(`Error getting similar books for ${book.title}:`, error);
        }
      }
    }

    // Strategy 3: Fallback to bestsellers in user's preferred genres
    if (recommendations.length === 0) {
      try {
        const userGenres = Array.from(new Set(userBooks.flatMap(book => book.genre)));
        const randomGenre = userGenres[Math.floor(Math.random() * userGenres.length)] || 'fiction';
        
        const bestsellers = await getBestsellersByGenre(randomGenre);
        const bestsellerRecs = bestsellers
          .map(nytBook => convertNYTBookToBook(nytBook))
          .filter(book => canAddBook(book))
          .map(book => {
            addBookToTracking(book);
            return {
              ...book,
              score: 75 + Math.floor(Math.random() * 15), // Score between 75-90
              reasons: [`Bestseller in ${randomGenre}`, 'Popular choice among readers'],
              similarTo: undefined
            };
          })
          .slice(0, 1);

        recommendations.push(...bestsellerRecs);
      } catch (error) {
        console.error('Error getting bestseller recommendations:', error);
      }
    }

    // Return the best replacement recommendation
    if (recommendations.length > 0) {
      // Sort by score and return the highest scored book
      const sortedRecs = recommendations.sort((a, b) => b.score - a.score);
      return sortedRecs[0];
    }

    return null;
  } catch (error) {
    console.error('Error getting replacement recommendation:', error);
    return null;
  }
};