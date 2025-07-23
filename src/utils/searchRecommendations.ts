import type { Book } from '../types';
import type { BookRecommendation } from './recommendations';
import type { SearchCriteria } from '../components/SmartSearch';
import { sampleBooks } from './recommendations';

export const getSearchBasedRecommendations = (
  criteria: SearchCriteria,
  userBooks: Book[],
  allBooks: Book[] = sampleBooks
): BookRecommendation[] => {
  // Filter out books already in user's library
  const availableBooks = allBooks.filter(book => 
    !userBooks.some(userBook => userBook.id === book.id)
  );

  let filteredBooks: BookRecommendation[] = [];

  switch (criteria.type) {
    case 'mood':
      filteredBooks = getMoodBasedRecommendations(criteria, availableBooks);
      break;
    case 'similar':
      filteredBooks = getSimilarityRecommendations(criteria, availableBooks, userBooks);
      break;
    case 'genre':
      filteredBooks = getGenreRecommendations(criteria, availableBooks);
      break;
    case 'author':
      filteredBooks = getAuthorRecommendations(criteria, availableBooks);
      break;
    default:
      filteredBooks = getGeneralSearchRecommendations(criteria, availableBooks);
  }

  // Sort by score and return top results
  return filteredBooks
    .sort((a, b) => b.score - a.score)
    .slice(0, 12);
};

const getMoodBasedRecommendations = (
  criteria: SearchCriteria,
  availableBooks: Book[]
): BookRecommendation[] => {
  const moodMappings: { [mood: string]: { genres: string[]; tags: string[]; minRating: number } } = {
    'happy': { genres: ['Romance', 'Comedy'], tags: ['uplifting', 'light-hearted', 'feel-good'], minRating: 4.0 },
    'uplifting': { genres: ['Romance', 'Comedy', 'Inspirational'], tags: ['inspiring', 'hopeful', 'motivational'], minRating: 4.0 },
    'sad': { genres: ['Drama', 'Literary Fiction'], tags: ['emotional', 'tear-jerker', 'melancholy'], minRating: 3.5 },
    'exciting': { genres: ['Thriller', 'Adventure', 'Action'], tags: ['fast-paced', 'action-packed', 'adrenaline'], minRating: 4.0 },
    'adventurous': { genres: ['Adventure', 'Fantasy', 'Science Fiction'], tags: ['epic', 'journey', 'exploration'], minRating: 4.0 },
    'calm': { genres: ['Literary Fiction', 'Memoir'], tags: ['peaceful', 'contemplative', 'slow-burn'], minRating: 3.8 },
    'mysterious': { genres: ['Mystery', 'Thriller', 'Crime'], tags: ['suspenseful', 'puzzle', 'intrigue'], minRating: 4.0 },
    'romantic': { genres: ['Romance', 'Historical Fiction'], tags: ['love', 'passion', 'relationship'], minRating: 4.0 },
    'dark': { genres: ['Horror', 'Thriller', 'Gothic'], tags: ['dark', 'gritty', 'disturbing'], minRating: 3.8 },
    'thought-provoking': { genres: ['Philosophy', 'Literary Fiction', 'Science Fiction'], tags: ['philosophical', 'deep', 'intellectual'], minRating: 4.2 }
  };

  const mood = criteria.mood?.toLowerCase() || '';
  const moodConfig = moodMappings[mood];

  if (!moodConfig) {
    // Generic mood search
    return availableBooks
      .filter(book => book.rating >= 3.8)
      .map(book => ({
        ...book,
        score: Math.round(book.rating * 20),
        reasons: ['Based on your search']
      }))
      .slice(0, 12);
  }

  return availableBooks
    .filter(book => {
      // Must meet minimum rating
      if (book.rating < moodConfig.minRating) return false;
      
      // Check genre match
      const hasGenreMatch = book.genre.some(genre => 
        moodConfig.genres.some(moodGenre => 
          genre.toLowerCase().includes(moodGenre.toLowerCase())
        )
      );
      
      // Check tag match if available
      const hasTagMatch = book.tags?.some(tag => 
        moodConfig.tags.some(moodTag => 
          tag.name.toLowerCase().includes(moodTag.toLowerCase())
        )
      ) || false;

      return hasGenreMatch || hasTagMatch;
    })
    .map(book => {
      let score = book.rating * 15; // Base score from rating
      
      // Bonus for genre match
      const genreBonus = book.genre.some(genre => 
        moodConfig.genres.some(moodGenre => 
          genre.toLowerCase().includes(moodGenre.toLowerCase())
        )
      ) ? 25 : 0;
      
      // Bonus for tag match
      const tagBonus = book.tags?.some(tag => 
        moodConfig.tags.some(moodTag => 
          tag.name.toLowerCase().includes(moodTag.toLowerCase())
        )
      ) ? 20 : 0;

      const finalScore = Math.min(100, Math.round(score + genreBonus + tagBonus));
      
      return {
        ...book,
        score: finalScore,
        reasons: [`Perfect for ${mood} mood`]
      };
    });
};

const getSimilarityRecommendations = (
  criteria: SearchCriteria,
  availableBooks: Book[],
  userBooks: Book[]
): BookRecommendation[] => {
  const similarTo = criteria.similarTo?.toLowerCase() || '';
  
  // Find the reference book in user's library
  const referenceBook = userBooks.find(book => 
    book.title.toLowerCase().includes(similarTo) ||
    book.author.toLowerCase().includes(similarTo)
  );

  if (!referenceBook) {
    // Search by genre similarity
    const genre = similarTo;
    return availableBooks
      .filter(book => 
        book.genre.some(g => g.toLowerCase().includes(genre))
      )
      .map(book => ({
        ...book,
        score: Math.round(book.rating * 18),
        reasons: [`Similar ${genre} genre`]
      }));
  }

  return availableBooks
    .map(book => {
      let score = 0;
      const reasons: string[] = [];

      // Genre similarity (40% weight)
      const genreMatches = book.genre.filter(genre => 
        referenceBook.genre.includes(genre)
      ).length;
      if (genreMatches > 0) {
        score += (genreMatches / Math.max(book.genre.length, referenceBook.genre.length)) * 40;
        reasons.push('Same genre');
      }

      // Author match (35% weight)
      if (book.author === referenceBook.author) {
        score += 35;
        reasons.push('Same author');
      }

      // Rating similarity (15% weight)
      const ratingDiff = Math.abs(book.rating - referenceBook.rating);
      score += Math.max(0, 15 * (1 - ratingDiff / 4));

      // Tag similarity (10% weight)
      if (book.tags && referenceBook.tags) {
        const tagMatches = book.tags.filter(tag1 => 
          referenceBook.tags!.some(tag2 => tag1.name === tag2.name)
        ).length;
        if (tagMatches > 0) {
          score += (tagMatches / Math.max(book.tags.length, referenceBook.tags.length)) * 10;
          reasons.push('Similar themes');
        }
      }

      return {
        ...book,
        score: Math.round(score),
        reasons: reasons.length > 0 ? [reasons[0]] : [`Like "${referenceBook.title}"`]
      };
    })
    .filter(book => book.score > 20);
};

const getGenreRecommendations = (
  criteria: SearchCriteria,
  availableBooks: Book[]
): BookRecommendation[] => {
  const genre = criteria.genre || '';
  
  return availableBooks
    .filter(book => 
      book.genre.some(g => 
        g.toLowerCase().includes(genre.toLowerCase())
      )
    )
    .map(book => {
      // Score based on how well the genre matches and book quality
      const exactMatch = book.genre.some(g => 
        g.toLowerCase() === genre.toLowerCase()
      );
      const partialMatch = book.genre.some(g => 
        g.toLowerCase().includes(genre.toLowerCase())
      );

      let score = book.rating * 15; // Base score
      if (exactMatch) score += 30;
      else if (partialMatch) score += 20;

      return {
        ...book,
        score: Math.min(100, Math.round(score)),
        reasons: [`${genre.charAt(0).toUpperCase() + genre.slice(1)} genre`]
      };
    })
    .filter(book => book.score > 30);
};

const getAuthorRecommendations = (
  criteria: SearchCriteria,
  availableBooks: Book[]
): BookRecommendation[] => {
  const author = criteria.author?.toLowerCase() || '';
  
  return availableBooks
    .filter(book => 
      book.author.toLowerCase().includes(author)
    )
    .map(book => ({
      ...book,
      score: Math.round(book.rating * 20),
      reasons: [`By ${book.author}`]
    }));
};

const getGeneralSearchRecommendations = (
  criteria: SearchCriteria,
  availableBooks: Book[]
): BookRecommendation[] => {
  const keywords = criteria.keywords || [];
  const query = criteria.query.toLowerCase();

  return availableBooks
    .map(book => {
      let score = 0;
      const reasons: string[] = [];

      // Title match (30% weight)
      if (book.title.toLowerCase().includes(query)) {
        score += 30;
        reasons.push('Title match');
      }

      // Author match (25% weight)
      if (book.author.toLowerCase().includes(query)) {
        score += 25;
        reasons.push('Author match');
      }

      // Genre match (20% weight)
      const genreMatch = book.genre.some(genre => 
        genre.toLowerCase().includes(query) ||
        keywords.some(keyword => genre.toLowerCase().includes(keyword))
      );
      if (genreMatch) {
        score += 20;
        reasons.push('Genre match');
      }

      // Tag match (15% weight)
      if (book.tags) {
        const tagMatch = book.tags.some(tag => 
          tag.name.toLowerCase().includes(query) ||
          keywords.some(keyword => tag.name.toLowerCase().includes(keyword))
        );
        if (tagMatch) {
          score += 15;
          reasons.push('Theme match');
        }
      }

      // Description/summary match (10% weight)
      const descriptionMatch = (book.description?.toLowerCase().includes(query)) ||
                             (book.summary?.toLowerCase().includes(query));
      if (descriptionMatch) {
        score += 10;
        reasons.push('Content match');
      }

      // Quality bonus
      score += book.rating * 5;

      return {
        ...book,
        score: Math.round(score),
        reasons: reasons.length > 0 ? [reasons[0]] : ['Based on your search']
      };
    })
    .filter(book => book.score > 15);
};