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
import { 
  getBest21stCenturyBooksByGenre,
  getHighlyRatedBest21stCentury,
  getAwardWinningBest21stCentury 
} from './bestBooks21stCentury';
import { 
  getGoodreadsBestBooksByGenre,
  getHighlyRatedGoodreadsBestBooks,
  getGoodreadsClassicBooks,
  getRandomGoodreadsBestBooks 
} from './goodreadsBestBooks';
import { 
  getNewYorkerBooksByGenre,
  getNewYorkerAwardWinners,
  getRecentNewYorkerBooks,
  getNewYorkerLiteraryFiction,
  getNewYorkerNonfiction 
} from './newYorkerBestBooks';
import { 
  getBrooklineBooksmithByGenre,
  getHighRatedBrooklineBooksmith,
  getRecentBrooklineBooksmith,
  getBrooklineBooksmithDiverseVoices,
  getBrooklineBooksmithStaffPicks 
} from './brooklineBooksmithRecommendations';
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

// Get recommendations based on user's reading preferences using ALL available sources - UNRESTRICTED VERSION
export const getDynamicRecommendations = async (userBooks: Book[], excludeShownIds: string[] = []): Promise<BookRecommendation[]> => {
  console.log(`🚀 UNRESTRICTED getDynamicRecommendations called with ${userBooks.length} user books, excluding ${excludeShownIds.length} shown IDs`);
  console.log(`🔓 REMOVING ALL RESTRICTIONS to test basic functionality`);
  
  try {
    const recommendations: BookRecommendation[] = [];
    
    // NO RESTRICTIONS - Just get books from all sources and return them
    console.log(`📚 Getting books from ALL sources without any filtering...`);
    
    // Get books from each source (no limits, no filtering)
    const best21st = getHighlyRatedBest21stCentury(3.5, 10); // Lower threshold, more books
    const goodreads = getHighlyRatedGoodreadsBestBooks(3.5, 10);
    const newYorker = getNewYorkerAwardWinners(10);
    const brookline = getBrooklineBooksmithStaffPicks(10);
    
    console.log(`📊 Source counts: 21st Century: ${best21st.length}, Goodreads: ${goodreads.length}, New Yorker: ${newYorker.length}, Brookline: ${brookline.length}`);
    
    // Add 2 from each source (no deduplication, no user library checks)
    let index = 0;
    
    // From 21st Century
    for (let i = 0; i < Math.min(2, best21st.length); i++) {
      const book = best21st[i];
      recommendations.push({
        ...book,
        score: 90 + index,
        reasons: [`21st Century #${i + 1}`, 'No restrictions']
      });
      index++;
    }
    
    // From Goodreads  
    for (let i = 0; i < Math.min(2, goodreads.length); i++) {
      const book = goodreads[i];
      recommendations.push({
        ...book,
        score: 80 + index,
        reasons: [`Goodreads #${i + 1}`, 'No restrictions']
      });
      index++;
    }
    
    // From New Yorker
    for (let i = 0; i < Math.min(1, newYorker.length); i++) {
      const book = newYorker[i];
      recommendations.push({
        ...book,
        score: 70 + index,
        reasons: [`New Yorker #${i + 1}`, 'No restrictions']
      });
      index++;
    }
    
    console.log(`🎯 UNRESTRICTED result: ${recommendations.length} books selected`);
    recommendations.forEach((rec, i) => {
      console.log(`   ${i + 1}. "${rec.title}" by ${rec.author} (score: ${rec.score})`);
    });
    
    return recommendations;
    
  } catch (error) {
    console.error('Error in unrestricted getDynamicRecommendations:', error);
    return [];
  }
};

// Get bestseller recommendations (fallback or for new users) - UNRESTRICTED VERSION  
export const getBestsellerRecommendations = async (userBooks: Book[] = [], excludeShownIds: string[] = []): Promise<BookRecommendation[]> => {
  console.log(`📈 UNRESTRICTED getBestsellerRecommendations called`);
  console.log(`🔓 NO RESTRICTIONS - returning variety from all sources`);
  
  try {
    const recommendations: BookRecommendation[] = [];
    
    // Get different books from all sources (no filtering)
    const best21st = getHighlyRatedBest21stCentury(3.0, 15);
    const goodreads = getHighlyRatedGoodreadsBestBooks(3.0, 15); 
    const newYorker = getNewYorkerAwardWinners(15);
    const brookline = getBrooklineBooksmithStaffPicks(15);
    
    console.log(`📊 Bestseller source counts: 21st: ${best21st.length}, Goodreads: ${goodreads.length}, NY: ${newYorker.length}, Brookline: ${brookline.length}`);
    
    // Take first book from each source 
    if (best21st.length > 0) {
      recommendations.push({
        ...best21st[0],
        score: 95,
        reasons: ['21st Century Pick', 'Unrestricted']
      });
    }
    
    if (goodreads.length > 0) {
      recommendations.push({
        ...goodreads[0], 
        score: 90,
        reasons: ['Goodreads Pick', 'Unrestricted']
      });
    }
    
    if (newYorker.length > 0) {
      recommendations.push({
        ...newYorker[0],
        score: 85, 
        reasons: ['New Yorker Pick', 'Unrestricted']
      });
    }
    
    if (brookline.length > 0) {
      recommendations.push({
        ...brookline[0],
        score: 80,
        reasons: ['Brookline Pick', 'Unrestricted'] 
      });
    }
    
    // Add one more from Goodreads if available
    if (goodreads.length > 1) {
      recommendations.push({
        ...goodreads[1],
        score: 75,
        reasons: ['Goodreads #2', 'Unrestricted']
      });
    }
    
    console.log(`📊 UNRESTRICTED bestsellers: ${recommendations.length} books`);
    recommendations.forEach((rec, i) => {
      console.log(`   ${i + 1}. "${rec.title}" by ${rec.author}`);
    });
    
    return recommendations;
    
  } catch (error) {
    console.error('Error in unrestricted getBestsellerRecommendations:', error);
    return [];
  }
};

// Enhanced similarity score calculation based on user's book preferences
    
    const normalizeAuthor = (author: string) => 
      author.toLowerCase()
            .trim()
            .replace(/[^\w\s]/g, '')
            .replace(/\s+/g, ' ')
            .replace(/\bjr\b|\bsr\b|\biii?\b|\biv\b/g, '')
            .trim();
    
    const normalizeTitle = (title: string) =>
      title.toLowerCase()
           .trim()
           .replace(/[^\w\s]/g, '')
           .replace(/\s+/g, ' ')
           .replace(/\b(the|a|an)\b/g, '')
           .trim();
    
    const getEnhancedBookKey = (book: Book) => 
      `${normalizeTitle(book.title)}-${normalizeAuthor(book.author)}`;
    
    const canAddBook = (book: Book): boolean => {
      const bookKey = getBookKey(book);
      const enhancedBookKey = getEnhancedBookKey(book);
      const normalizedAuthor = normalizeAuthor(book.author);
      
      const inSeenBooks = seenBooks.has(book.id);
      const inSeenTitleAuthor = seenTitleAuthor.has(bookKey);
      const inSeenEnhanced = seenTitleAuthor.has(enhancedBookKey);
      const authorExceeded = (authorCount.get(normalizedAuthor) || 0) >= 2;
      const inUserLibrary = isBookInUserLibrary(book, userBooks);
      
      const canAdd = !inSeenBooks && !inSeenTitleAuthor && !inSeenEnhanced && !authorExceeded && !inUserLibrary;
      
      if (!canAdd) {
        console.log(`🚫 Cannot add "${book.title}": seenBooks=${inSeenBooks}, seenTitle=${inSeenTitleAuthor}, seenEnhanced=${inSeenEnhanced}, authorExceeded=${authorExceeded} (${authorCount.get(normalizedAuthor) || 0}), inLibrary=${inUserLibrary}`);
      }
      
      return canAdd;
    };
    
    const addBookToTracking = (book: Book) => {
      const bookKey = getBookKey(book);
      const enhancedBookKey = getEnhancedBookKey(book);
      const normalizedAuthor = normalizeAuthor(book.author);
      
      seenBooks.add(book.id);
      seenTitleAuthor.add(bookKey);
      seenTitleAuthor.add(enhancedBookKey);
      
      // Also block this exact title-author combination to prevent duplicates across sources
      const titleAuthorBlock = `${book.title.toLowerCase().trim()}-${book.author.toLowerCase().trim()}`;
      seenTitleAuthor.add(titleAuthorBlock);
      
      const currentCount = authorCount.get(normalizedAuthor) || 0;
      authorCount.set(normalizedAuthor, currentCount + 1);
      
      console.log(`✅ Added to tracking: "${book.title}" by ${book.author} (Author count: ${currentCount + 1})`);
    };

    // STRATEGY 1: Use Google Books API for similarity-based recommendations (if user has books)
    if (userBooks.length > 0) {
      const booksForRecommendations = userBooks
        .filter(book => !book.rating || book.rating >= 3)
        .sort((a, b) => (b.rating || 3.5) - (a.rating || 3.5))
        .slice(0, 3);
      
      console.log(`📚 Strategy 1: Using ${booksForRecommendations.length} user books for Google Books API recommendations`);
      
      for (const book of booksForRecommendations) {
        if (recommendations.length >= 2) break;
        
        try {
          const similarBooks = await searchSimilarBooks(book.genre, book.author);
          console.log(`🔍 Found ${similarBooks.length} similar books for "${book.title}" (genres: ${book.genre.join(', ')})`);
          
          let addedSimilar = 0;
          for (const googleBook of similarBooks.slice(0, 4)) {
            const convertedBook = convertGoogleBookToBook(googleBook);
            console.log(`🔍 Checking similar book: "${convertedBook.title}" by ${convertedBook.author}`);
            
            if (canAddBook(convertedBook)) {
              addBookToTracking(convertedBook);
              const baseScore = calculateSimilarityScore(convertedBook, book);
              recommendations.push({
                ...convertedBook,
                score: baseScore + 25,
                reasons: [`Similar to "${book.title}"`, 'Based on your library'],
                similarTo: book.title
              });
              addedSimilar++;
              console.log(`✅ Added similar book: "${convertedBook.title}" for user book "${book.title}"`);
              break; // One per user book for variety
            } else {
              console.log(`❌ Rejected similar book: "${convertedBook.title}" (already added or in library)`);
            }
          }
          
          if (addedSimilar === 0) {
            console.log(`⚠️ No similar books could be added for "${book.title}"`);
          }
        } catch (error) {
          console.log(`❌ Could not find similar books for "${book.title}":`, error);
        }
      }
      
      console.log(`📊 Strategy 1 Complete: ${recommendations.length} Google Books API recommendations`);
    }

    // STRATEGY 2: Add from ALL curated sources equally
    // Force at least 1 book per source, but allow more if needed
    const remainingSlots = 5 - recommendations.length;
    const targetFromEachSource = Math.max(1, Math.floor(remainingSlots / 4));
    const bonusSlots = remainingSlots % 4; // Distribute remaining slots
    
    console.log(`🎯 Strategy 2 Setup: Need ${remainingSlots} more books, targeting ${targetFromEachSource} from each source (${bonusSlots} bonus slots)`);
    console.log(`👤 User library analysis: ${userBooks.length} books in library:`, userBooks.map(b => `"${b.title}" by ${b.author} (${b.rating || 'unrated'})`));
    
    // A. Best 21st Century Books
    console.log(`📚 Strategy 2A: Adding Best 21st Century Books (${targetFromEachSource} books)`);
    const best21stBooks = getHighlyRatedBest21stCentury(4.0, targetFromEachSource * 4); // Get more candidates
    // Shuffle for variety
    const shuffled21st = best21stBooks.sort(() => Math.random() - 0.5);
    console.log(`🔍 DEBUG: Found ${shuffled21st.length} 21st century books:`, shuffled21st.slice(0, 5).map(b => `"${b.title}" by ${b.author}`));
    let added21st = 0;
    const max21st = targetFromEachSource + (bonusSlots > 0 ? 1 : 0); // Give first source bonus slot if available
    for (const book of shuffled21st) {
      if (added21st >= max21st) break;
      console.log(`🔍 Checking 21st century book: "${book.title}" by ${book.author}`);
      if (canAddBook(book)) {
        addBookToTracking(book);
        recommendations.push({
          ...book,
          score: 85 + Math.floor(Math.random() * 10),
          reasons: ['Acclaimed 21st century literature', 'Highly rated']
        });
        added21st++;
        console.log(`✅ Added 21st century book: "${book.title}" (${added21st}/${max21st})`);
      }
    }
    
    // B. Goodreads Best Books
    console.log(`📚 Strategy 2B: Adding Goodreads Best Books (${targetFromEachSource} books)`);
    const goodreadsBooks = getHighlyRatedGoodreadsBestBooks(4.0, targetFromEachSource * 4); // Lower rating threshold, more books
    // Shuffle for variety
    const shuffledGoodreads = goodreadsBooks.sort(() => Math.random() - 0.5);
    console.log(`🔍 DEBUG: Found ${shuffledGoodreads.length} Goodreads books with 4.0+ rating:`, shuffledGoodreads.slice(0, 5).map(b => `"${b.title}" by ${b.author} (${b.rating})`));
    let addedGoodreads = 0;
    const maxGoodreads = targetFromEachSource + (bonusSlots > 1 ? 1 : 0); // Give second source bonus slot if available
    for (const book of shuffledGoodreads) {
      if (addedGoodreads >= maxGoodreads) break;
      console.log(`🔍 Checking Goodreads book: "${book.title}" by ${book.author}`);
      if (canAddBook(book)) {
        addBookToTracking(book);
        recommendations.push({
          ...book,
          score: 80 + Math.floor(Math.random() * 15),
          reasons: ['Goodreads Best Books Ever', 'Beloved by readers']
        });
        addedGoodreads++;
        console.log(`✅ Added Goodreads book: "${book.title}" (${addedGoodreads}/${maxGoodreads})`);
      } else {
        console.log(`❌ Rejected Goodreads book: "${book.title}" (already added or in library)`);
      }
    }
    
    // C. New Yorker Literary Picks
    console.log(`📰 Strategy 2C: Adding New Yorker Literary Picks (${targetFromEachSource} books)`);
    const newYorkerBooks = getNewYorkerAwardWinners(targetFromEachSource * 4);
    // Shuffle for variety
    const shuffledNewYorker = newYorkerBooks.sort(() => Math.random() - 0.5);
    console.log(`🔍 DEBUG: Found ${shuffledNewYorker.length} New Yorker books:`, shuffledNewYorker.slice(0, 5).map(b => `"${b.title}" by ${b.author}`));
    let addedNewYorker = 0;
    const maxNewYorker = targetFromEachSource + (bonusSlots > 2 ? 1 : 0); // Give third source bonus slot if available
    for (const book of shuffledNewYorker) {
      if (addedNewYorker >= maxNewYorker) break;
      console.log(`🔍 Checking New Yorker book: "${book.title}" by ${book.author}`);
      if (canAddBook(book)) {
        addBookToTracking(book);
        recommendations.push({
          ...book,
          score: 85 + Math.floor(Math.random() * 10),
          reasons: ['Award winner', 'Literary excellence']
        });
        addedNewYorker++;
        console.log(`✅ Added New Yorker book: "${book.title}" (${addedNewYorker}/${maxNewYorker})`);
      } else {
        console.log(`❌ Rejected New Yorker book: "${book.title}" (already added or in library)`);
      }
    }
    
    // D. Brookline Booksmith Indie Picks
    console.log(`📚 Strategy 2D: Adding Brookline Booksmith Indie Picks (${targetFromEachSource} books)`);
    const brooklineBooks = getBrooklineBooksmithStaffPicks(targetFromEachSource * 4);
    // Shuffle for variety
    const shuffledBrookline = brooklineBooks.sort(() => Math.random() - 0.5);
    console.log(`🔍 DEBUG: Found ${shuffledBrookline.length} Brookline books:`, shuffledBrookline.slice(0, 5).map(b => `"${b.title}" by ${b.author}`));
    let addedBrookline = 0;
    const maxBrookline = targetFromEachSource + (bonusSlots > 3 ? 1 : 0); // Give fourth source bonus slot if available
    for (const book of shuffledBrookline) {
      if (addedBrookline >= maxBrookline) break;
      console.log(`🔍 Checking Brookline book: "${book.title}" by ${book.author}`);
      if (canAddBook(book)) {
        addBookToTracking(book);
        recommendations.push({
          ...book,
          score: 82 + Math.floor(Math.random() * 8),
          reasons: ['Indie bookstore favorite', 'Staff pick']
        });
        addedBrookline++;
        console.log(`✅ Added Brookline book: "${book.title}" (${addedBrookline}/${maxBrookline})`);
      } else {
        console.log(`❌ Rejected Brookline book: "${book.title}" (already added or in library)`);
      }
    }
    
    console.log(`📊 Strategy 2 Complete: Added ${added21st} 21st Century, ${addedGoodreads} Goodreads, ${addedNewYorker} New Yorker, ${addedBrookline} Brookline books (Total: ${recommendations.length})`);
    
    // Debug: Show what we have so far
    console.log(`📋 Current recommendations:`, recommendations.map(r => `"${r.title}" by ${r.author} (${r.score})`));
    
    // STRATEGY 3: Emergency fill if we don't have enough books
    if (recommendations.length < 3) {
      console.log(`🚨 Strategy 3: Emergency fill - only ${recommendations.length} books so far, need at least 3`);
      
      // Get more books from all sources and shuffle them together
      const emergencyBooks = [
        ...getRandomGoodreadsBestBooks(5),
        ...getRecentNewYorkerBooks(3.8, 5),
        ...getHighRatedBrooklineBooksmith(3.8, 5),
        ...getAwardWinningBest21stCentury(5)
      ];
      
      // Shuffle the emergency books for variety
      const shuffledEmergency = emergencyBooks.sort(() => Math.random() - 0.5);
      console.log(`🔍 Emergency pool: ${shuffledEmergency.length} books available`);
      
      for (const book of shuffledEmergency) {
        if (recommendations.length >= 5) break;
        console.log(`🔍 Checking emergency book: "${book.title}" by ${book.author}`);
        if (canAddBook(book)) {
          addBookToTracking(book);
          recommendations.push({
            ...book,
            score: 70 + Math.floor(Math.random() * 20),
            reasons: ['High quality pick', 'Popular choice']
          });
          console.log(`✅ Added emergency book: "${book.title}" (Total: ${recommendations.length})`);
        }
      }
    }
    
    // Sort by score and return
    const sortedRecs = recommendations.sort((a, b) => b.score - a.score);
    const finalRecs = sortedRecs.slice(0, 5);
    
    console.log(`🎯 Final result: Returning ${finalRecs.length} recommendations from all sources:`);
    finalRecs.forEach((rec, i) => {
      console.log(`   ${i + 1}. "${rec.title}" by ${rec.author} (score: ${rec.score}) - ${rec.reasons?.join(', ') || 'No reasons'}`);
    });
    
    return finalRecs;

  } catch (error) {
    console.error('Error getting dynamic recommendations:', error);
    return getBestsellerRecommendations(userBooks, excludeShownIds);
  }
};
    const seenTitleAuthor = new Set<string>(); // Track by title-author combination
    const authorCount = new Map<string, number>(); // Track author frequency (allow up to 2 per author)
    
    // Get rejected books and shown books to exclude them
    const rejectedBookIds = storage.getRejectedBooks();
    rejectedBookIds.forEach(id => seenBooks.add(id));
    excludeShownIds.forEach(id => seenBooks.add(id));
    
    // Get liked books preferences for improving recommendations
    const likedIds = storage.getLikedRecommendations();
    console.log(`👍 Found ${likedIds.length} liked recommendations for preference learning`);
    
    // Helper function to create unique key for book
    const getBookKey = (book: Book) => 
      `${book.title.toLowerCase().trim()}-${book.author.toLowerCase().trim()}`;
    
    // Helper function to normalize author name (more aggressive normalization)
    const normalizeAuthor = (author: string) => 
      author.toLowerCase()
            .trim()
            .replace(/[^\w\s]/g, '')
            .replace(/\s+/g, ' ')
            .replace(/\bjr\b|\bsr\b|\biii?\b|\biv\b/g, '') // Remove Jr, Sr, II, III, IV
            .trim();
    
    // Helper function to normalize title (more aggressive normalization)
    const normalizeTitle = (title: string) =>
      title.toLowerCase()
           .trim()
           .replace(/[^\w\s]/g, '')
           .replace(/\s+/g, ' ')
           .replace(/\b(the|a|an)\b/g, '') // Remove articles
           .trim();
    
    // Enhanced book key with better normalization
    const getEnhancedBookKey = (book: Book) => 
      `${normalizeTitle(book.title)}-${normalizeAuthor(book.author)}`;
    
    // Helper function to check if we can add this book (with relaxed author limits)
    const canAddBook = (book: Book): boolean => {
      const bookId = book.id;
      const bookKey = getBookKey(book);
      const enhancedBookKey = getEnhancedBookKey(book);
      const normalizedAuthor = normalizeAuthor(book.author);
      
      // Check all possible duplications
      const isDuplicateId = seenBooks.has(bookId);
      const isDuplicateBookKey = seenTitleAuthor.has(bookKey);
      const isDuplicateEnhanced = seenTitleAuthor.has(enhancedBookKey);
      const authorExceededLimit = (authorCount.get(normalizedAuthor) || 0) >= 3; // Increased to 3 books per author
      const isInLibrary = isBookInUserLibrary(book, userBooks);
      
      // Debug logging for every book being checked
      console.log(`🔍 Checking: "${book.title}" by ${book.author}`, {
        isDuplicateId,
        isDuplicateBookKey,
        isDuplicateEnhanced,
        authorExceededLimit,
        currentAuthorCount: authorCount.get(normalizedAuthor) || 0,
        isInLibrary,
        bookId,
        normalizedAuthor,
        canAdd: !isDuplicateId && !isDuplicateBookKey && !isDuplicateEnhanced && !authorExceededLimit && !isInLibrary
      });
      
      return !isDuplicateId && 
             !isDuplicateBookKey && 
             !isDuplicateEnhanced &&
             !authorExceededLimit &&
             !isInLibrary;
    };
    
    // Helper function to add book to tracking sets
    const addBookToTracking = (book: Book) => {
      const bookKey = getBookKey(book);
      const enhancedBookKey = getEnhancedBookKey(book);
      const normalizedAuthor = normalizeAuthor(book.author);
      
      seenBooks.add(book.id);
      seenTitleAuthor.add(bookKey);
      seenTitleAuthor.add(enhancedBookKey); // Track both keys
      
      // Increment author count
      const currentCount = authorCount.get(normalizedAuthor) || 0;
      authorCount.set(normalizedAuthor, currentCount + 1);
      
      // Debug logging
      console.log(`✅ Added to tracking: "${book.title}" by ${book.author}`, {
        bookId: book.id,
        normalizedAuthor,
        authorCount: currentCount + 1,
        bookKey,
        enhancedBookKey
      });
    };
    
    // Enhanced function to boost score based on user's library preferences and liked books
    const boostScoreBasedOnLikes = (book: Book, baseScore: number): number => {
      let bonus = 0;
      
      // Get user's reading patterns from their library
      const highRatedBooks = userBooks.filter(b => b.rating >= 4);
      const allReadBooks = userBooks.filter(b => !b.rating || b.rating >= 3);
      
      // Analyze preferred genres from user's entire library (not just highly rated)
      const allGenres = allReadBooks.flatMap(b => b.genre);
      const favoriteGenres = highRatedBooks.flatMap(b => b.genre);
      
      const genreFreq = new Map<string, number>();
      const favoriteGenreFreq = new Map<string, number>();
      
      allGenres.forEach(genre => {
        genreFreq.set(genre, (genreFreq.get(genre) || 0) + 1);
      });
      
      favoriteGenres.forEach(genre => {
        favoriteGenreFreq.set(genre, (favoriteGenreFreq.get(genre) || 0) + 1);
      });
      
      // Boost for genres the user reads (stronger boost for highly rated genres)
      book.genre.forEach(genre => {
        const totalFreq = genreFreq.get(genre) || 0;
        const favoriteFreq = favoriteGenreFreq.get(genre) || 0;
        
        if (favoriteFreq > 0) {
          bonus += Math.min(20, favoriteFreq * 8); // Strong boost for loved genres
        } else if (totalFreq > 0) {
          bonus += Math.min(10, totalFreq * 4); // Moderate boost for read genres
        }
      });
      
      // Analyze user's preferred rating range
      const userRatings = userBooks.filter(b => b.rating).map(b => b.rating);
      if (userRatings.length > 0) {
        const avgUserRating = userRatings.reduce((sum, r) => sum + r, 0) / userRatings.length;
        const ratingDiff = Math.abs(book.rating - avgUserRating);
        
        if (ratingDiff <= 0.5) bonus += 12; // Very close to user's average
        else if (ratingDiff <= 1.0) bonus += 8; // Reasonably close
        else if (book.rating >= avgUserRating + 0.5) bonus += 5; // Higher than user's average
      }
      
      // Boost for high-quality books regardless of user preference
      if (book.rating >= 4.5) bonus += 8;
      else if (book.rating >= 4.0) bonus += 5;
      
      // Analyze user's preferred publication years
      const userYears = userBooks.filter(b => b.year).map(b => b.year!).filter(year => year > 0);
      if (userYears.length > 0 && book.year) {
        const avgYear = userYears.reduce((sum, y) => sum + y, 0) / userYears.length;
        const currentYear = new Date().getFullYear();
        
        // If user tends to read newer books, boost recent publications
        if (avgYear >= currentYear - 15 && book.year >= currentYear - 10) {
          bonus += 6;
        }
        // If user reads older books, don't penalize older publications
        else if (avgYear < currentYear - 15 && book.year < currentYear - 10) {
          bonus += 4;
        }
      }
      
      // Extra boost if book matches multiple user preferences
      const genreMatches = book.genre.filter(g => genreFreq.has(g)).length;
      if (genreMatches >= 2) bonus += 5; // Multiple genre matches
      
      return Math.min(100, baseScore + bonus);
    };

    // Strategy 1: Find similar books based on ALL user's books (not just highly rated)
    // Include books with rating >= 3 or no rating (user added them for a reason)
    const booksForRecommendations = userBooks
      .filter(book => !book.rating || book.rating >= 3)
      .sort((a, b) => (b.rating || 3.5) - (a.rating || 3.5))
      .slice(0, 5); // Use more books for better variety
    
    console.log(`📚 Strategy 1: Using ${booksForRecommendations.length} user books for recommendations:`, 
      booksForRecommendations.map(b => `"${b.title}" by ${b.author} (${b.rating || 'unrated'})`));
    
    for (const book of booksForRecommendations) {
      if (recommendations.length >= 15) break; // Allow collecting more initially
      
      console.log(`🔍 Strategy 1: Searching for books similar to "${book.title}" (genres: ${book.genre.join(', ')})`);
      
      // Search for books similar to this user's book
      const similarBooks = await searchSimilarBooks(book.genre, book.author);
      console.log(`📖 Strategy 1: Found ${similarBooks.length} similar books for "${book.title}"`);
      
      let addedForThisBook = 0;
      for (const googleBook of similarBooks.slice(0, 8)) { // More books to account for deduplication
        const convertedBook = convertGoogleBookToBook(googleBook);
        
        if (canAddBook(convertedBook)) {
          addBookToTracking(convertedBook);
          const baseScore = calculateSimilarityScore(convertedBook, book);
          const boostedScore = boostScoreBasedOnLikes(convertedBook, baseScore);
          recommendations.push({
            ...convertedBook,
            score: boostedScore + 20, // Boost user-library based recommendations
            reasons: [`Similar to your book "${book.title}"`, `Shares ${book.genre.slice(0,2).join(', ')} genre${book.genre.length > 1 ? 's' : ''}`],
            similarTo: book.title
          });
          addedForThisBook++;
          
          // Limit per book but allow more total
          if (addedForThisBook >= 3) break;
        }
      }
      console.log(`✅ Strategy 1: Added ${addedForThisBook} recommendations for "${book.title}" (total so far: ${recommendations.length})`);
    }
    
    console.log(`📊 Strategy 1 Complete: ${recommendations.length} total recommendations`);

    // Strategy 2: More books by authors the user already has and likes
    const userAuthors = [...new Set(userBooks
      .filter(book => !book.rating || book.rating >= 3.5)
      .map(book => book.author))]
      .slice(0, 3);
    
    console.log(`👥 Strategy 2: Looking for more books by user's authors: ${userAuthors.join(', ')}`);
    const strategy2StartCount = recommendations.length;
    
    for (const author of userAuthors) {
      if (recommendations.length >= 20) break; // Allow collecting more initially
      
      console.log(`🔍 Strategy 2: Searching for more books by "${author}"`);
      
      try {
        // Search for more books by this author
        const authorBooks = await searchBooksByAuthorEnhanced(author);
        console.log(`📖 Strategy 2: Found ${authorBooks.length} books by "${author}"`);
        
        let addedForThisAuthor = 0;
        for (const googleBook of authorBooks.slice(0, 6)) {
          const convertedBook = convertGoogleBookToBook(googleBook);
          
          if (canAddBook(convertedBook)) {
            addBookToTracking(convertedBook);
            const baseScore = 85 + Math.floor(Math.random() * 10);
            const boostedScore = boostScoreBasedOnLikes(convertedBook, baseScore);
            recommendations.push({
              ...convertedBook,
              score: boostedScore + 15, // Boost for familiar authors
              reasons: [`More by ${author}`, 'Author from your library'],
              similarTo: author
            });
            addedForThisAuthor++;
            
            // One book per author to maintain variety
            break;
          }
        }
        console.log(`✅ Strategy 2: Added ${addedForThisAuthor} books by "${author}" (total so far: ${recommendations.length})`);
      } catch (error) {
        console.log(`❌ Strategy 2: Could not find more books by ${author}:`, error);
      }
    }
    
    console.log(`📊 Strategy 2 Complete: Added ${recommendations.length - strategy2StartCount} recommendations (total: ${recommendations.length})`);

    // Strategy 3: Find more books in user's preferred genres (before falling back to generic bestsellers)
    if (recommendations.length < 8) {
      console.log(`🎯 Strategy 3: Need more recommendations (${recommendations.length}/8), searching user's preferred genres`);
      
      // Get user's favorite genres from their library
      const userGenres = userBooks
        .filter(book => !book.rating || book.rating >= 3)
        .flatMap(book => book.genre);
      
      const genreFreq = new Map<string, number>();
      userGenres.forEach(genre => {
        genreFreq.set(genre, (genreFreq.get(genre) || 0) + 1);
      });
      
      // Sort genres by frequency (user's preferred genres)
      const topGenres = Array.from(genreFreq.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([genre]) => genre);
      
      console.log(`🎯 Strategy 3: Looking for books in user's preferred genres: ${topGenres.join(', ')}`);
      const strategy3StartCount = recommendations.length;
      
      // Search for books in user's preferred genres
      for (const genre of topGenres) {
        if (recommendations.length >= 25) break;
        
        console.log(`🔍 Strategy 3: Searching for "${genre}" books`);
        
        try {
          const genreBooks = await searchGoogleBooks(`subject:${genre}`);
          console.log(`📖 Strategy 3: Found ${genreBooks.length} books for genre "${genre}"`);
          
          let addedForThisGenre = 0;
          for (const googleBook of genreBooks.slice(0, 8)) {
            const convertedBook = convertGoogleBookToBook(googleBook);
            
            if (canAddBook(convertedBook)) {
              addBookToTracking(convertedBook);
              const baseScore = 75 + Math.floor(Math.random() * 10);
              const boostedScore = boostScoreBasedOnLikes(convertedBook, baseScore);
              recommendations.push({
                ...convertedBook,
                score: boostedScore + 10, // Boost for matching user's genre preferences
                reasons: [`Matches your ${genre} preference`, 'Based on your reading history'],
                similarTo: undefined
              });
              addedForThisGenre++;
              
              // One book per genre to maintain variety
              break;
            }
          }
          console.log(`✅ Strategy 3: Added ${addedForThisGenre} books for "${genre}" (total so far: ${recommendations.length})`);
        } catch (error) {
          console.log(`❌ Strategy 3: Could not find books for genre ${genre}:`, error);
        }
      }
      
      console.log(`📊 Strategy 3 Complete: Added ${recommendations.length - strategy3StartCount} recommendations (total: ${recommendations.length})`);
    } else {
      console.log(`⏭️ Strategy 3 Skipped: Already have ${recommendations.length} recommendations (>= 8)`);
    }

    // Strategy 4: Use acclaimed 21st century books as high-quality recommendations
    if (recommendations.length < 10) {
      console.log(`🏆 Strategy 4: Need more recommendations (${recommendations.length}/10), adding acclaimed 21st century books`);
      const strategy4StartCount = recommendations.length;
      
      // Get user's preferred genres to find matching acclaimed books
      const userGenres = userBooks
        .filter(book => !book.rating || book.rating >= 3)
        .flatMap(book => book.genre);
      
      const genreFreq = new Map<string, number>();
      userGenres.forEach(genre => {
        genreFreq.set(genre, (genreFreq.get(genre) || 0) + 1);
      });
      
      const topGenres = Array.from(genreFreq.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([genre]) => genre);
      
      console.log(`🏆 Strategy 4: Looking for acclaimed books in genres: ${topGenres.join(', ')}`);
      
      // First try to get acclaimed books in user's preferred genres
      let acclaimedBooks: Book[] = [];
      if (topGenres.length > 0) {
        for (const genre of topGenres) {
          const genreBooks = getBest21stCenturyBooksByGenre(genre, 3);
          console.log(`📖 Strategy 4: Found ${genreBooks.length} acclaimed books for genre "${genre}"`);
          acclaimedBooks.push(...genreBooks);
          if (acclaimedBooks.length >= 6) break;
        }
      }
      
      // Fill remaining with highly rated acclaimed books
      if (acclaimedBooks.length < 6) {
        const highlyRated = getHighlyRatedBest21stCentury(4.0, 6 - acclaimedBooks.length);
        console.log(`📖 Strategy 4: Added ${highlyRated.length} highly rated acclaimed books (4.0+ rating)`);
        acclaimedBooks.push(...highlyRated);
      }
      
      // Add some award winners for prestige
      const awardWinners = getAwardWinningBest21stCentury(3);
      console.log(`📖 Strategy 4: Added ${awardWinners.length} award-winning acclaimed books`);
      acclaimedBooks.push(...awardWinners);
      
      console.log(`📚 Strategy 4: Total acclaimed books to process: ${acclaimedBooks.length}`);
      
      let addedAcclaimed = 0;
      for (const book of acclaimedBooks) {
        if (recommendations.length >= 30) break;
        
        if (canAddBook(book)) {
          addBookToTracking(book);
          const baseScore = 80 + Math.floor(Math.random() * 15); // High base score for acclaimed books
          const boostedScore = boostScoreBasedOnLikes(book, baseScore);
          
          const reasons = ['Acclaimed 21st century literature'];
          if (book.tags?.some(tag => tag.name.includes('pulitzer-winner'))) reasons.push('Pulitzer Prize winner');
          if (book.tags?.some(tag => tag.name.includes('nobel-winner'))) reasons.push('Nobel Prize winner');
          if (book.tags?.some(tag => tag.name.includes('booker-winner'))) reasons.push('Booker Prize winner');
          if (book.rating >= 4.2) reasons.push('Highly rated by critics');
          
          recommendations.push({
            ...book,
            score: boostedScore + 10, // Extra boost for acclaimed literature
            reasons: reasons.slice(0, 3)
          });
          addedAcclaimed++;
        }
      }
      
      console.log(`📊 Strategy 4 Complete: Added ${addedAcclaimed} acclaimed books (total: ${recommendations.length})`);
    } else {
      console.log(`⏭️ Strategy 4 Skipped: Already have ${recommendations.length} recommendations (>= 10)`);
    }

    // Strategy 5: Add Goodreads "Best Books Ever" recommendations
    if (recommendations.length < 12) {
      console.log(`📚 Strategy 5: Need more recommendations (${recommendations.length}/12), adding Goodreads Best Books Ever`);
      const strategy5StartCount = recommendations.length;
      
      // Get user's preferred genres to find matching Goodreads best books
      const userGenres = userBooks
        .filter(book => !book.rating || book.rating >= 3)
        .flatMap(book => book.genre);
      
      const genreFreq = new Map<string, number>();
      userGenres.forEach(genre => {
        genreFreq.set(genre, (genreFreq.get(genre) || 0) + 1);
      });
      
      const topGenres = Array.from(genreFreq.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([genre]) => genre);
      
      console.log(`📚 Strategy 5: Looking for Goodreads best books in genres: ${topGenres.join(', ')}`);
      
      let goodreadsBooks: Book[] = [];
      
      // First, try to get Goodreads best books in user's preferred genres
      if (topGenres.length > 0) {
        for (const genre of topGenres) {
          const genreBooks = getGoodreadsBestBooksByGenre(genre, 3);
          console.log(`📖 Strategy 5: Found ${genreBooks.length} Goodreads best books for genre "${genre}"`);
          goodreadsBooks.push(...genreBooks);
          if (goodreadsBooks.length >= 6) break;
        }
      }
      
      // Fill remaining with highly rated Goodreads best books
      if (goodreadsBooks.length < 6) {
        const highlyRated = getHighlyRatedGoodreadsBestBooks(4.2, 6 - goodreadsBooks.length);
        console.log(`📖 Strategy 5: Added ${highlyRated.length} highly rated Goodreads best books (4.2+ rating)`);
        goodreadsBooks.push(...highlyRated);
      }
      
      // Add some classics for variety
      if (goodreadsBooks.length < 8) {
        const classics = getGoodreadsClassicBooks(3);
        console.log(`📖 Strategy 5: Added ${classics.length} classic Goodreads best books`);
        goodreadsBooks.push(...classics);
      }
      
      console.log(`📚 Strategy 5: Total Goodreads best books to process: ${goodreadsBooks.length}`);
      
      let addedGoodreads = 0;
      for (const book of goodreadsBooks) {
        if (recommendations.length >= 35) break;
        
        if (canAddBook(book)) {
          addBookToTracking(book);
          const baseScore = 75 + Math.floor(Math.random() * 15); // Good base score for popular books
          const boostedScore = boostScoreBasedOnLikes(book, baseScore);
          
          const reasons = ['Goodreads Best Books Ever'];
          if (book.tags?.some(tag => tag.name.includes('classic'))) reasons.push('Beloved classic');
          if (book.tags?.some(tag => tag.name.includes('bestseller'))) reasons.push('Bestseller');
          if (book.rating >= 4.3) reasons.push('Highly rated by readers');
          if (book.tags?.some(tag => tag.name.includes('award-winner'))) reasons.push('Award winner');
          
          recommendations.push({
            ...book,
            score: boostedScore + 5, // Small boost for being on best books list
            reasons: reasons.slice(0, 3)
          });
          addedGoodreads++;
        }
      }
      
      console.log(`📊 Strategy 5 Complete: Added ${addedGoodreads} Goodreads best books (total: ${recommendations.length})`);
    } else {
      console.log(`⏭️ Strategy 5 Skipped: Already have ${recommendations.length} recommendations (>= 12)`);
    }

    // Strategy 6: Add New Yorker-style literary recommendations (award winners and critically acclaimed)
    if (recommendations.length < 15) {
      console.log(`📰 Strategy 6: Need more recommendations (${recommendations.length}/15), adding New Yorker-style literary picks`);
      const strategy6StartCount = recommendations.length;
      
      // Get user's preferred genres to find matching literary works
      const userGenres = userBooks
        .filter(book => !book.rating || book.rating >= 3)
        .flatMap(book => book.genre);
      
      const genreFreq = new Map<string, number>();
      userGenres.forEach(genre => {
        genreFreq.set(genre, (genreFreq.get(genre) || 0) + 1);
      });
      
      const topGenres = Array.from(genreFreq.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([genre]) => genre);
      
      console.log(`📰 Strategy 6: Looking for New Yorker-style books in genres: ${topGenres.join(', ')}`);
      
      let newYorkerBooks: Book[] = [];
      
      // First, try to get New Yorker-style books in user's preferred genres
      if (topGenres.length > 0) {
        for (const genre of topGenres) {
          const genreBooks = getNewYorkerBooksByGenre(genre, 2);
          console.log(`📖 Strategy 6: Found ${genreBooks.length} New Yorker-style books for genre "${genre}"`);
          newYorkerBooks.push(...genreBooks);
          if (newYorkerBooks.length >= 4) break;
        }
      }
      
      // Add award winners for prestige
      if (newYorkerBooks.length < 6) {
        const awardWinners = getNewYorkerAwardWinners(4);
        console.log(`📖 Strategy 6: Added ${awardWinners.length} New Yorker-style award winners`);
        newYorkerBooks.push(...awardWinners);
      }
      
      // Fill remaining with recent highly rated literary works
      if (newYorkerBooks.length < 8) {
        const recentBooks = getRecentNewYorkerBooks(4.1, 4);
        console.log(`📖 Strategy 6: Added ${recentBooks.length} recent New Yorker-style books (4.1+ rating)`);
        newYorkerBooks.push(...recentBooks);
      }
      
      // Add some literary fiction for sophistication
      if (newYorkerBooks.length < 10) {
        const literaryFiction = getNewYorkerLiteraryFiction(3);
        console.log(`📖 Strategy 6: Added ${literaryFiction.length} New Yorker-style literary fiction`);
        newYorkerBooks.push(...literaryFiction);
      }
      
      console.log(`📰 Strategy 6: Total New Yorker-style books to process: ${newYorkerBooks.length}`);
      
      let addedNewYorker = 0;
      for (const book of newYorkerBooks) {
        if (recommendations.length >= 40) break;
        
        if (canAddBook(book)) {
          addBookToTracking(book);
          const baseScore = 80 + Math.floor(Math.random() * 15); // High base score for literary prestige
          const boostedScore = boostScoreBasedOnLikes(book, baseScore);
          
          const reasons = ['New Yorker-style literary pick'];
          if (book.tags?.some(tag => tag.name.includes('pulitzer'))) reasons.push('Pulitzer Prize winner');
          if (book.tags?.some(tag => tag.name.includes('booker'))) reasons.push('Booker Prize winner');
          if (book.tags?.some(tag => tag.name.includes('national-book-award'))) reasons.push('National Book Award');
          if (book.rating >= 4.3) reasons.push('Critically acclaimed');
          if (book.tags?.some(tag => tag.name.includes('literary'))) reasons.push('Literary excellence');
          
          recommendations.push({
            ...book,
            score: boostedScore + 10, // Boost for literary prestige
            reasons: reasons.slice(0, 3)
          });
          addedNewYorker++;
        }
      }
      
      console.log(`📊 Strategy 6 Complete: Added ${addedNewYorker} New Yorker-style books (total: ${recommendations.length})`);
    } else {
      console.log(`⏭️ Strategy 6 Skipped: Already have ${recommendations.length} recommendations (>= 15)`);
    }

    // Strategy 7: Add Brookline Booksmith-style independent bookstore recommendations
    if (recommendations.length < 18) {
      console.log(`📚 Strategy 7: Need more recommendations (${recommendations.length}/18), adding Brookline Booksmith indie bookstore picks`);
      const strategy7StartCount = recommendations.length;
      
      // Get user's preferred genres for targeted indie bookstore recommendations
      const userGenres = userBooks
        .filter(book => !book.rating || book.rating >= 3)
        .flatMap(book => book.genre);
      
      const genreFreq = new Map<string, number>();
      userGenres.forEach(genre => {
        genreFreq.set(genre, (genreFreq.get(genre) || 0) + 1);
      });
      
      const topGenres = Array.from(genreFreq.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([genre]) => genre);
      
      console.log(`📚 Strategy 7: Looking for Brookline Booksmith books in genres: ${topGenres.join(', ')}`);
      
      let brooklineBooks: Book[] = [];
      
      // First, get staff picks style mix for variety
      const staffPicks = getBrooklineBooksmithStaffPicks(4);
      console.log(`📖 Strategy 7: Added ${staffPicks.length} staff pick style recommendations`);
      brooklineBooks.push(...staffPicks);
      
      // Add books in user's preferred genres
      if (topGenres.length > 0) {
        for (const genre of topGenres) {
          const genreBooks = getBrooklineBooksmithByGenre(genre, 2);
          console.log(`📖 Strategy 7: Found ${genreBooks.length} Brookline Booksmith books for genre "${genre}"`);
          brooklineBooks.push(...genreBooks);
          if (brooklineBooks.length >= 8) break;
        }
      }
      
      // Add some diverse voices (independent bookstore specialty)
      if (brooklineBooks.length < 10) {
        const diverseVoices = getBrooklineBooksmithDiverseVoices(3);
        console.log(`📖 Strategy 7: Added ${diverseVoices.length} diverse voice recommendations`);
        brooklineBooks.push(...diverseVoices);
      }
      
      // Fill remaining with recent highly rated picks
      if (brooklineBooks.length < 12) {
        const recentBooks = getRecentBrooklineBooksmith(3, 4);
        console.log(`📖 Strategy 7: Added ${recentBooks.length} recent Brookline Booksmith picks`);
        brooklineBooks.push(...recentBooks);
      }
      
      console.log(`📚 Strategy 7: Total Brookline Booksmith books to process: ${brooklineBooks.length}`);
      
      let addedBrookline = 0;
      for (const book of brooklineBooks) {
        if (recommendations.length >= 45) break;
        
        if (canAddBook(book)) {
          addBookToTracking(book);
          const baseScore = 75 + Math.floor(Math.random() * 15); // Good base score for indie bookstore curation
          const boostedScore = boostScoreBasedOnLikes(book, baseScore);
          
          const reasons = ['Indie bookstore favorite'];
          if (book.rating >= 4.3) reasons.push('Highly rated');
          if (book.tags?.some(tag => tag.name.includes('literary'))) reasons.push('Literary pick');
          if (book.tags?.some(tag => tag.name.includes('diverse') || tag.name.includes('lgbtq') || tag.name.includes('african-american'))) {
            reasons.push('Diverse voices');
          }
          if (book.year >= 2020) reasons.push('Recent favorite');
          
          recommendations.push({
            ...book,
            score: boostedScore + 5, // Small boost for indie bookstore curation
            reasons: reasons.slice(0, 3)
          });
          addedBrookline++;
        }
      }
      
      console.log(`📊 Strategy 7 Complete: Added ${addedBrookline} Brookline Booksmith books (total: ${recommendations.length})`);
    } else {
      console.log(`⏭️ Strategy 7 Skipped: Already have ${recommendations.length} recommendations (>= 18)`);
    }

    // Strategy 8: Only fall back to current bestsellers if we still need more recommendations AND user has few books
    if (recommendations.length < 8 && userBooks.length < 3) {
      console.log(`📈 Strategy 8: Need more recommendations (${recommendations.length}/8) for new user (${userBooks.length} books), adding bestsellers`);
      const strategy8StartCount = recommendations.length;
      
      const mixedBestsellers = await getMixedBestsellers();
      console.log(`📖 Strategy 8: Found ${mixedBestsellers.length} bestsellers to process`);
      
      let addedBestsellers = 0;
      for (const nytBook of mixedBestsellers) {
        if (recommendations.length >= 35) break;
        
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
          const baseScore = 65 + Math.floor(Math.random() * 10); // Lower base score for generic bestsellers
          const boostedScore = boostScoreBasedOnLikes(convertedBook, baseScore);
          recommendations.push({
            ...convertedBook,
            score: boostedScore,
            reasons: ['Popular choice', 'Widely recommended']
          });
          addedBestsellers++;
        }
      }
      
      console.log(`📊 Strategy 8 Complete: Added ${addedBestsellers} bestsellers (total: ${recommendations.length})`);
    } else {
      console.log(`⏭️ Strategy 8 Skipped: Have ${recommendations.length} recommendations (>= 8) or experienced user (${userBooks.length} books)`);
    }

    // Enhanced final deduplication pass to ensure no duplicates slip through
    const finalDeduplication = (recs: BookRecommendation[]): BookRecommendation[] => {
      console.log(`🔧 Final deduplication starting with ${recs.length} recommendations`);
      
      const seen = new Set<string>();
      const seenEnhanced = new Set<string>();
      const finalAuthorCount = new Map<string, number>();
      const seenIds = new Set<string>();
      const deduplicated: BookRecommendation[] = [];
      
      for (const rec of recs) {
        const basicKey = `${rec.title.toLowerCase().trim()}-${rec.author.toLowerCase().trim()}`;
        const enhancedKey = `${normalizeTitle(rec.title)}-${normalizeAuthor(rec.author)}`;
        const authorKey = normalizeAuthor(rec.author);
        const idKey = rec.id;
        
        const isDuplicateBasic = seen.has(basicKey);
        const isDuplicateEnhanced = seenEnhanced.has(enhancedKey);
        const authorExceedsLimit = (finalAuthorCount.get(authorKey) || 0) >= 3; // Increased to match main logic
        const isDuplicateId = seenIds.has(idKey);
        
        console.log(`🔧 Final dedup checking: "${rec.title}" by ${rec.author}`, {
          isDuplicateBasic,
          isDuplicateEnhanced,
          authorExceedsLimit,
          currentAuthorCount: finalAuthorCount.get(authorKey) || 0,
          isDuplicateId,
          score: rec.score,
          willAdd: !isDuplicateBasic && !isDuplicateEnhanced && !authorExceedsLimit && !isDuplicateId
        });
        
        if (!isDuplicateBasic && !isDuplicateEnhanced && !authorExceedsLimit && !isDuplicateId) {
          seen.add(basicKey);
          seenEnhanced.add(enhancedKey);
          finalAuthorCount.set(authorKey, (finalAuthorCount.get(authorKey) || 0) + 1);
          seenIds.add(idKey);
          deduplicated.push(rec);
          console.log(`✅ Final dedup added: "${rec.title}" (${deduplicated.length} total)`);
        }
      }
      
      console.log(`🔧 Final deduplication complete: ${recs.length} → ${deduplicated.length}`);
      return deduplicated;
    };
    
    // Sort by score and return deduplicated top recommendations
    const sortedRecs = recommendations.sort((a, b) => b.score - a.score);
    console.log(`📊 Pre-dedup analysis: ${recommendations.length} total recommendations collected`);
    console.log(`📈 Top scores before dedup:`, sortedRecs.slice(0, 10).map(r => `"${r.title}" (${r.score})`));
    
    const deduplicatedRecs = finalDeduplication(sortedRecs);
    
    console.log(`📊 Final deduplication summary: ${recommendations.length} total → ${deduplicatedRecs.length} after dedup`);
    console.log(`📈 Top scores after dedup:`, deduplicatedRecs.slice(0, 10).map(r => `"${r.title}" (${r.score})`));
    
    // Ensure exactly 5 unique recommendations
    let finalRecs = deduplicatedRecs.slice(0, 5);
    
    // Emergency fallback: If we have fewer than 3 recommendations, add from our curated sources
    if (finalRecs.length < 3) {
      console.log(`🚨 Emergency fallback: Only ${finalRecs.length} recommendations, adding from curated sources`);
      
      // Get some guaranteed books from our static sources
      const fallbackBooks: Book[] = [];
      
      // Add from Goodreads best books
      const goodreadsBooks = getHighlyRatedGoodreadsBestBooks(4.3, 3);
      fallbackBooks.push(...goodreadsBooks);
      
      // Add from New Yorker style books  
      const newYorkerBooks = getNewYorkerAwardWinners(3);
      fallbackBooks.push(...newYorkerBooks);
      
      // Add from Brookline Booksmith
      const brooklineBooks = getHighRatedBrooklineBooksmith(4.3, 3);
      fallbackBooks.push(...brooklineBooks);
      
      console.log(`🚨 Processing ${fallbackBooks.length} fallback books`);
      
      for (const book of fallbackBooks) {
        if (finalRecs.length >= 5) break;
        
        // Check if this book is already in final recs or user's library
        const alreadyRecommended = finalRecs.some(rec => 
          rec.id === book.id || 
          (rec.title.toLowerCase() === book.title.toLowerCase() && rec.author.toLowerCase() === book.author.toLowerCase())
        );
        const inLibrary = isBookInUserLibrary(book, userBooks);
        
        if (!alreadyRecommended && !inLibrary) {
          finalRecs.push({
            ...book,
            score: 85 + Math.floor(Math.random() * 10),
            reasons: ['Emergency fallback', 'Highly rated', 'Curated pick']
          });
          console.log(`🚨 Added fallback: "${book.title}" by ${book.author}`);
        }
      }
    }
    
    console.log(`🎯 Final result: Returning ${finalRecs.length} unique recommendations:`);
    finalRecs.forEach((rec, i) => {
      console.log(`   ${i + 1}. "${rec.title}" by ${rec.author} (score: ${rec.score}) - ${rec.reasons?.join(', ') || 'No reasons'}`);
    });
    
    return finalRecs;

  } catch (error) {
    console.error('Error getting dynamic recommendations:', error);
    // Fallback to bestsellers if API calls fail
    return getBestsellerRecommendations(userBooks, excludeShownIds);
  }
};

// Get bestseller recommendations (fallback or for new users) - SIMPLIFIED VERSION
export const getBestsellerRecommendations = async (userBooks: Book[] = [], excludeShownIds: string[] = []): Promise<BookRecommendation[]> => {
  console.log(`📈 getBestsellerRecommendations called for ${userBooks.length} user books, excluding ${excludeShownIds.length} IDs`);
  
  try {
    // Use all curated sources equally for variety - this is the same logic as the main function
    console.log(`🎯 Using ALL curated sources for variety (not just NYT bestsellers)`);
    
    const recommendations: BookRecommendation[] = [];
    const rejectedBookIds = storage.getRejectedBooks();
    const seenBooks = new Set<string>(); // Track by ID
    const seenTitleAuthor = new Set<string>(); // Track by title-author combination
    
    // Add rejected books and shown books to tracking
    rejectedBookIds.forEach(id => seenBooks.add(id));
    excludeShownIds.forEach(id => seenBooks.add(id));
    
    console.log(`🚫 Excluding ${rejectedBookIds.length} rejected + ${excludeShownIds.length} shown = ${seenBooks.size} total books`);
    
    // Simple helper functions
    const isBookInUserLibrary = (book: Book, userBooks: Book[]): boolean => {
      return userBooks.some(userBook => {
        const titleMatch = userBook.title.toLowerCase().trim() === book.title.toLowerCase().trim();
        const authorMatch = userBook.author.toLowerCase().trim() === book.author.toLowerCase().trim();
        return titleMatch && authorMatch;
      });
    };
    
    const canAddBook = (book: Book): boolean => {
      const bookKey = `${book.title.toLowerCase().trim()}-${book.author.toLowerCase().trim()}`;
      return !seenBooks.has(book.id) && 
             !seenTitleAuthor.has(bookKey) && 
             !isBookInUserLibrary(book, userBooks);
    };
    
    const addBookToTracking = (book: Book) => {
      const bookKey = `${book.title.toLowerCase().trim()}-${book.author.toLowerCase().trim()}`;
      seenBooks.add(book.id);
      seenTitleAuthor.add(bookKey);
      console.log(`✅ Added to bestseller tracking: "${book.title}" by ${book.author}`);
    };
    
    // Get books from all sources and shuffle them
    const allBooks = [
      ...getHighlyRatedBest21stCentury(4.0, 8),
      ...getHighlyRatedGoodreadsBestBooks(4.0, 8), 
      ...getNewYorkerAwardWinners(8),
      ...getBrooklineBooksmithStaffPicks(8)
    ];
    
    // Shuffle for variety
    const shuffledBooks = allBooks.sort(() => Math.random() - 0.5);
    console.log(`📚 Found ${shuffledBooks.length} total books from all curated sources`);
    
    // Add books until we have 5
    for (const book of shuffledBooks) {
      if (recommendations.length >= 5) break;
      
      console.log(`🔍 Checking bestseller book: "${book.title}" by ${book.author}`);
      if (canAddBook(book)) {
        addBookToTracking(book);
        recommendations.push({
          ...book,
          score: 80 + Math.floor(Math.random() * 15),
          reasons: ['Curated recommendation', 'High quality']
        });
        console.log(`✅ Added bestseller: "${book.title}" (${recommendations.length}/5)`);
      } else {
        console.log(`❌ Rejected bestseller: "${book.title}" (already seen or in library)`);
      }
    }
    
    console.log(`📊 getBestsellerRecommendations returning ${recommendations.length} books`);
    return recommendations;
    
  } catch (error) {
    console.error('Error in getBestsellerRecommendations:', error);
    return [];
  }
};

// Enhanced similarity score calculation based on user's book preferences
const calculateSimilarityScore = (book: Book, referenceBook: Book): number => {
  let score = 40; // Base score (slightly lower to make room for better matching)
  
  // Genre similarity (enhanced matching)
  const commonGenres = book.genre.filter(genre => 
    referenceBook.genre.some(refGenre => 
      refGenre.toLowerCase().includes(genre.toLowerCase()) ||
      genre.toLowerCase().includes(refGenre.toLowerCase())
    )
  );
  
  // More points for exact genre matches
  const exactGenreMatches = book.genre.filter(genre => 
    referenceBook.genre.some(refGenre => 
      refGenre.toLowerCase() === genre.toLowerCase()
    )
  );
  
  score += exactGenreMatches.length * 20; // Exact matches get more points
  score += (commonGenres.length - exactGenreMatches.length) * 12; // Partial matches get fewer points
  
  // Rating-based scoring (prefer books with similar or better ratings)
  const ratingDiff = Math.abs(book.rating - referenceBook.rating);
  if (ratingDiff <= 0.5) score += 15; // Very similar ratings
  else if (ratingDiff <= 1.0) score += 10; // Somewhat similar ratings
  else if (ratingDiff <= 1.5) score += 5; // Moderate difference
  
  // Boost for highly rated books
  if (book.rating >= 4.5) score += 15;
  else if (book.rating >= 4.0) score += 10;
  else if (book.rating >= 3.5) score += 5;
  
  // Year similarity (prefer books from similar time periods)
  if (book.year && referenceBook.year) {
    const yearDiff = Math.abs(book.year - referenceBook.year);
    if (yearDiff <= 5) score += 8; // Very recent
    else if (yearDiff <= 15) score += 5; // Same era
    else if (yearDiff <= 30) score += 2; // Similar generation
  }
  
  // Author similarity (same author gets a boost, but we handle this separately)
  if (book.author.toLowerCase() === referenceBook.author.toLowerCase()) {
    score += 25; // Significant boost for same author
  }
  
  // Random factor for variety (reduced to give more weight to actual similarity)
  score += Math.floor(Math.random() * 5);
  
  return Math.min(100, score);
};
             !seenTitleAuthor.has(bookKey) && 
             !seenTitleAuthor.has(enhancedBookKey) &&
             !authorExceededLimit;
    };
    
    const addBookToTracking = (book: Book) => {
      const bookKey = getBookKey(book);
      const enhancedBookKey = getEnhancedBookKey(book);
      const normalizedAuthor = normalizeAuthor(book.author);
      
      seenBooks.add(book.id);
      seenTitleAuthor.add(bookKey);
      seenTitleAuthor.add(enhancedBookKey);
      
      // Increment author count
      const currentCount = authorCount.get(normalizedAuthor) || 0;
      authorCount.set(normalizedAuthor, currentCount + 1);
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
    
    // Add some Goodreads Best Books if we still need more recommendations
    if (recommendations.length < 5) {
      console.log(`📚 Adding Goodreads Best Books to fill bestseller recommendations (${recommendations.length}/5)`);
      
      let goodreadsBooks: Book[] = [];
      
      if (userBooks.length > 0) {
        // Get user's preferred genres for targeted recommendations
        const userGenres = userBooks
          .filter(book => !book.rating || book.rating >= 3)
          .flatMap(book => book.genre);
        
        const genreFreq = new Map<string, number>();
        userGenres.forEach(genre => {
          genreFreq.set(genre, (genreFreq.get(genre) || 0) + 1);
        });
        
        const topGenres = Array.from(genreFreq.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 2)
          .map(([genre]) => genre);
        
        // Try to get books in user's preferred genres first
        for (const genre of topGenres) {
          const genreBooks = getGoodreadsBestBooksByGenre(genre, 2);
          goodreadsBooks.push(...genreBooks);
        }
      }
      
      // Fill remaining with highly rated classics and popular books
      if (goodreadsBooks.length < 4) {
        const classics = getGoodreadsClassicBooks(2);
        const highlyRated = getHighlyRatedGoodreadsBestBooks(4.2, 3);
        goodreadsBooks.push(...classics, ...highlyRated);
      }
      
      console.log(`📖 Processing ${goodreadsBooks.length} Goodreads best books for bestseller fallback`);
      
      for (const book of goodreadsBooks) {
        if (recommendations.length >= 8) break;
        
        if (canAddBook(book)) {
          addBookToTracking(book);
          const baseScore = 75 + Math.floor(Math.random() * 15);
          const boostedScore = boostScoreForBestsellers(book, baseScore);
          recommendations.push({
            ...book,
            score: boostedScore,
            reasons: ['Goodreads Best Books Ever', 'Beloved by readers']
          });
        }
      }
      
      console.log(`📊 Added Goodreads books, now have ${recommendations.length} total recommendations`);
    }
    
    // Add some New Yorker-style literary books if we still need more recommendations
    if (recommendations.length < 5) {
      console.log(`📰 Adding New Yorker-style books to fill bestseller recommendations (${recommendations.length}/5)`);
      
      let newYorkerBooks: Book[] = [];
      
      if (userBooks.length > 0) {
        // Get user's preferred genres for targeted literary recommendations
        const userGenres = userBooks
          .filter(book => !book.rating || book.rating >= 3)
          .flatMap(book => book.genre);
        
        const genreFreq = new Map<string, number>();
        userGenres.forEach(genre => {
          genreFreq.set(genre, (genreFreq.get(genre) || 0) + 1);
        });
        
        const topGenres = Array.from(genreFreq.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 2)
          .map(([genre]) => genre);
        
        // Try to get literary books in user's preferred genres first
        for (const genre of topGenres) {
          const genreBooks = getNewYorkerBooksByGenre(genre, 2);
          newYorkerBooks.push(...genreBooks);
        }
      }
      
      // Fill remaining with award winners and recent literary works
      if (newYorkerBooks.length < 4) {
        const awardWinners = getNewYorkerAwardWinners(2);
        const recentBooks = getRecentNewYorkerBooks(4.0, 3);
        newYorkerBooks.push(...awardWinners, ...recentBooks);
      }
      
      console.log(`📖 Processing ${newYorkerBooks.length} New Yorker-style books for bestseller fallback`);
      
      for (const book of newYorkerBooks) {
        if (recommendations.length >= 8) break;
        
        if (canAddBook(book)) {
          addBookToTracking(book);
          const baseScore = 85 + Math.floor(Math.random() * 15);
          const boostedScore = boostScoreForBestsellers(book, baseScore);
          recommendations.push({
            ...book,
            score: boostedScore,
            reasons: ['Critically acclaimed', 'Literary excellence']
          });
        }
      }
      
      console.log(`📊 Added New Yorker-style books, now have ${recommendations.length} total recommendations`);
    }
    
    // Add some Brookline Booksmith indie bookstore picks if we still need more recommendations
    if (recommendations.length < 5) {
      console.log(`📚 Adding Brookline Booksmith picks to fill bestseller recommendations (${recommendations.length}/5)`);
      
      let brooklineBooks: Book[] = [];
      
      if (userBooks.length > 0) {
        // Get user's preferred genres for targeted indie bookstore recommendations
        const userGenres = userBooks
          .filter(book => !book.rating || book.rating >= 3)
          .flatMap(book => book.genre);
        
        const genreFreq = new Map<string, number>();
        userGenres.forEach(genre => {
          genreFreq.set(genre, (genreFreq.get(genre) || 0) + 1);
        });
        
        const topGenres = Array.from(genreFreq.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 2)
          .map(([genre]) => genre);
        
        // Try to get indie bookstore picks in user's preferred genres first
        for (const genre of topGenres) {
          const genreBooks = getBrooklineBooksmithByGenre(genre, 2);
          brooklineBooks.push(...genreBooks);
        }
      }
      
      // Fill remaining with staff picks and diverse voices
      if (brooklineBooks.length < 4) {
        const staffPicks = getBrooklineBooksmithStaffPicks(2);
        const diverseVoices = getBrooklineBooksmithDiverseVoices(2);
        brooklineBooks.push(...staffPicks, ...diverseVoices);
      }
      
      console.log(`📖 Processing ${brooklineBooks.length} Brookline Booksmith books for bestseller fallback`);
      
      for (const book of brooklineBooks) {
        if (recommendations.length >= 8) break;
        
        if (canAddBook(book)) {
          addBookToTracking(book);
          const baseScore = 80 + Math.floor(Math.random() * 15);
          const boostedScore = boostScoreForBestsellers(book, baseScore);
          recommendations.push({
            ...book,
            score: boostedScore,
            reasons: ['Indie bookstore pick', 'Staff favorite']
          });
        }
      }
      
      console.log(`📊 Added Brookline Booksmith books, now have ${recommendations.length} total recommendations`);
    }
    
    // Final deduplication for bestsellers
    const finalDeduplication = (recs: BookRecommendation[]): BookRecommendation[] => {
      const seen = new Set<string>();
      const finalAuthorCount = new Map<string, number>();
      const deduplicated: BookRecommendation[] = [];
      
      for (const rec of recs) {
        const bookKey = `${normalizeTitle(rec.title)}-${normalizeAuthor(rec.author)}`;
        const authorKey = normalizeAuthor(rec.author);
        const authorExceedsLimit = (finalAuthorCount.get(authorKey) || 0) >= 2;
        
        if (!seen.has(bookKey) && !authorExceedsLimit) {
          seen.add(bookKey);
          finalAuthorCount.set(authorKey, (finalAuthorCount.get(authorKey) || 0) + 1);
          deduplicated.push(rec);
        }
      }
      
      return deduplicated;
    };
    
    const deduplicatedRecs = finalDeduplication(recommendations);
    console.log(`📊 Bestsellers summary: ${recommendations.length} total, ${deduplicatedRecs.length} after dedup`);
    
    // Ensure exactly 5 unique recommendations
    const finalRecs = deduplicatedRecs.slice(0, 5);
    console.log(`🎯 Returning ${finalRecs.length} unique bestseller recommendations`);
    
    return finalRecs;
  } catch (error) {
    console.error('Error getting bestseller recommendations:', error);
    return [];
  }
};

// Enhanced similarity score calculation based on user's book preferences
const calculateSimilarityScore = (book: Book, referenceBook: Book): number => {
  let score = 40; // Base score (slightly lower to make room for better matching)
  
  // Genre similarity (enhanced matching)
  const commonGenres = book.genre.filter(genre => 
    referenceBook.genre.some(refGenre => 
      refGenre.toLowerCase().includes(genre.toLowerCase()) ||
      genre.toLowerCase().includes(refGenre.toLowerCase())
    )
  );
  
  // More points for exact genre matches
  const exactGenreMatches = book.genre.filter(genre => 
    referenceBook.genre.some(refGenre => 
      refGenre.toLowerCase() === genre.toLowerCase()
    )
  );
  
  score += exactGenreMatches.length * 20; // Exact matches get more points
  score += (commonGenres.length - exactGenreMatches.length) * 12; // Partial matches get fewer points
  
  // Rating-based scoring (prefer books with similar or better ratings)
  const ratingDiff = Math.abs(book.rating - referenceBook.rating);
  if (ratingDiff <= 0.5) score += 15; // Very similar ratings
  else if (ratingDiff <= 1.0) score += 10; // Somewhat similar ratings
  else if (ratingDiff <= 1.5) score += 5; // Moderate difference
  
  // Boost for highly rated books
  if (book.rating >= 4.5) score += 15;
  else if (book.rating >= 4.0) score += 10;
  else if (book.rating >= 3.5) score += 5;
  
  // Year similarity (prefer books from similar time periods)
  if (book.year && referenceBook.year) {
    const yearDiff = Math.abs(book.year - referenceBook.year);
    if (yearDiff <= 5) score += 8; // Very recent
    else if (yearDiff <= 15) score += 5; // Same era
    else if (yearDiff <= 30) score += 2; // Similar generation
  }
  
  // Author similarity (same author gets a boost, but we handle this separately)
  if (book.author.toLowerCase() === referenceBook.author.toLowerCase()) {
    score += 25; // Significant boost for same author
  }
  
  // Random factor for variety (reduced to give more weight to actual similarity)
  score += Math.floor(Math.random() * 5);
  
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
  rejectedBookIds: string[],
  currentRecommendations: BookRecommendation[] = []
): Promise<BookRecommendation | null> => {
  try {
    const recommendations: BookRecommendation[] = [];
    const seenBooks = new Set<string>(); // Track by ID
    const seenTitleAuthor = new Set<string>(); // Track by title-author combination
    const authorCount = new Map<string, number>(); // Track author frequency (allow up to 2 per author)
    
    // Helper functions for deduplication (enhanced versions from main function)
    const getBookKey = (book: Book) => 
      `${book.title.toLowerCase().trim()}-${book.author.toLowerCase().trim()}`;
    
    const normalizeAuthor = (author: string) => 
      author.toLowerCase()
            .trim()
            .replace(/[^\w\s]/g, '')
            .replace(/\s+/g, ' ')
            .replace(/\bjr\b|\bsr\b|\biii?\b|\biv\b/g, '') // Remove Jr, Sr, II, III, IV
            .trim();
    
    const normalizeTitle = (title: string) =>
      title.toLowerCase()
           .trim()
           .replace(/[^\w\s]/g, '')
           .replace(/\s+/g, ' ')
           .replace(/\b(the|a|an)\b/g, '') // Remove articles
           .trim();
    
    const getEnhancedBookKey = (book: Book) => 
      `${normalizeTitle(book.title)}-${normalizeAuthor(book.author)}`;
    
    // Add rejected book ID to seen books to avoid re-suggesting
    seenBooks.add(rejectedBook.id);
    rejectedBookIds.forEach(id => seenBooks.add(id));
    
    // Add current recommendations to avoid duplicates
    currentRecommendations.forEach(rec => {
      seenBooks.add(rec.id);
      seenTitleAuthor.add(getBookKey(rec));
      seenTitleAuthor.add(getEnhancedBookKey(rec));
      
      // Track author count from current recommendations
      const normalizedAuthor = normalizeAuthor(rec.author);
      const currentCount = authorCount.get(normalizedAuthor) || 0;
      authorCount.set(normalizedAuthor, currentCount + 1);
    });
    
    console.log(`🔄 Finding replacement for "${rejectedBook.title}" by ${rejectedBook.author}`);
    console.log(`📝 Avoiding ${seenBooks.size} books, ${authorCount.size} authors with quotas already on page`);
    
    const canAddBook = (book: Book): boolean => {
      const bookKey = getBookKey(book);
      const enhancedBookKey = getEnhancedBookKey(book);
      const normalizedAuthor = normalizeAuthor(book.author);
      
      const isDuplicateId = seenBooks.has(book.id);
      const isDuplicateBookKey = seenTitleAuthor.has(bookKey);
      const isDuplicateEnhanced = seenTitleAuthor.has(enhancedBookKey);
      const authorExceededLimit = (authorCount.get(normalizedAuthor) || 0) >= 2;
      const isInLibrary = isBookInUserLibrary(book, userBooks);
      
      // Debug logging for replacements
      if (isDuplicateId || isDuplicateBookKey || isDuplicateEnhanced || authorExceededLimit || isInLibrary) {
        console.log(`🚫 Replacement blocked: "${book.title}" by ${book.author}`, {
          isDuplicateId,
          isDuplicateBookKey,
          isDuplicateEnhanced,
          authorExceededLimit,
          currentAuthorCount: authorCount.get(normalizedAuthor) || 0,
          isInLibrary
        });
      }
      
      return !isDuplicateId && 
             !isDuplicateBookKey && 
             !isDuplicateEnhanced &&
             !authorExceededLimit &&
             !isInLibrary;
    };
    
    const addBookToTracking = (book: Book) => {
      const bookKey = getBookKey(book);
      const enhancedBookKey = getEnhancedBookKey(book);
      const normalizedAuthor = normalizeAuthor(book.author);
      
      seenBooks.add(book.id);
      seenTitleAuthor.add(bookKey);
      seenTitleAuthor.add(enhancedBookKey);
      
      // Increment author count
      const currentCount = authorCount.get(normalizedAuthor) || 0;
      authorCount.set(normalizedAuthor, currentCount + 1);
      
      console.log(`✅ Added replacement to tracking: "${book.title}" by ${book.author} (author count: ${currentCount + 1})`);
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