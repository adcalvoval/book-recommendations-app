import type { Book } from '../types';
import { findSimilarBooks } from './bookEnhancer';

export interface BookRecommendation extends Book {
  score: number;
  reasons: string[];
  similarTo?: string; // Title of the book this recommendation is similar to
}

export const getRecommendations = (
  userBooks: Book[], 
  allBooks: Book[], 
  options?: { 
    shuffle?: boolean; 
    seed?: number; 
    excludeIds?: string[];
    diversify?: boolean;
  }
): BookRecommendation[] => {
  if (userBooks.length === 0) return [];

  const availableBooks = allBooks.filter(book => 
    !userBooks.some(userBook => userBook.id === book.id) &&
    !options?.excludeIds?.includes(book.id)
  );

  // Get multiple types of recommendations
  const preferenceBasedRecs = getPreferenceBasedRecommendations(userBooks, availableBooks);
  const similarityBasedRecs = getSimilarityBasedRecommendations(userBooks, availableBooks);
  
  // Combine and deduplicate recommendations
  const allRecs = new Map<string, BookRecommendation>();
  
  // Add preference-based recommendations
  preferenceBasedRecs.forEach(rec => {
    allRecs.set(rec.id, rec);
  });
  
  // Add similarity-based recommendations (may boost existing ones)
  similarityBasedRecs.forEach(rec => {
    const existing = allRecs.get(rec.id);
    if (existing) {
      // Boost score and combine reasons, but cap at 100%
      existing.score = Math.min(100, existing.score + rec.score * 0.7);
      existing.reasons = [...new Set([...existing.reasons, ...rec.reasons])];
      if (rec.similarTo) {
        existing.similarTo = rec.similarTo;
      }
    } else {
      allRecs.set(rec.id, rec);
    }
  });

  let recommendations = Array.from(allRecs.values()).filter(rec => rec.score > 0);

  // Apply diversification or randomization
  if (options?.diversify) {
    recommendations = diversifyRecommendations(recommendations, options.seed);
  } else if (options?.shuffle) {
    recommendations = shuffleRecommendations(recommendations, options.seed);
  } else {
    // Sort by final score
    recommendations.sort((a, b) => b.score - a.score);
  }

  // Return 5-10 recommendations for better variety
  const targetCount = options?.shuffle || options?.diversify ? 
    Math.min(8, Math.max(5, recommendations.length)) : 12;
  return recommendations.slice(0, targetCount);
};

const shuffleRecommendations = (recommendations: BookRecommendation[], seed?: number): BookRecommendation[] => {
  // Create tiers based on scores for balanced randomization
  const sorted = [...recommendations].sort((a, b) => b.score - a.score);
  const tierSize = Math.max(1, Math.floor(sorted.length / 3));
  
  const topTier = sorted.slice(0, tierSize);
  const midTier = sorted.slice(tierSize, tierSize * 2);
  const bottomTier = sorted.slice(tierSize * 2);
  
  // Shuffle within tiers to maintain some quality while adding variety
  const shuffled = [
    ...shuffleArray(topTier, seed),
    ...shuffleArray(midTier, seed ? seed + 1 : undefined),
    ...shuffleArray(bottomTier, seed ? seed + 2 : undefined)
  ];
  
  return shuffled;
};

const diversifyRecommendations = (recommendations: BookRecommendation[], seed?: number): BookRecommendation[] => {
  if (recommendations.length <= 8) return shuffleArray(recommendations, seed);

  // Group recommendations by genres for diversity
  const genreGroups = new Map<string, BookRecommendation[]>();
  
  recommendations.forEach(rec => {
    // Group by primary genre
    const primaryGenre = rec.genre[0] || 'Other';
    if (!genreGroups.has(primaryGenre)) {
      genreGroups.set(primaryGenre, []);
    }
    genreGroups.get(primaryGenre)!.push(rec);
  });

  const diverseRecs: BookRecommendation[] = [];
  const used = new Set<string>();
  
  // First pass: Pick one top book from each genre to ensure variety
  const genres = Array.from(genreGroups.keys());
  shuffleArray(genres, seed);
  
  genres.forEach(genre => {
    const genreBooks = genreGroups.get(genre)!
      .filter(book => !used.has(book.id))
      .sort((a, b) => b.score - a.score);
    
    if (genreBooks.length > 0 && diverseRecs.length < 6) {
      // Pick a random book from top 3 in this genre for more variety
      const topBooks = genreBooks.slice(0, Math.min(3, genreBooks.length));
      const randomIndex = Math.floor((Math.sin(seed || 0) * 10000 - Math.floor(Math.sin(seed || 0) * 10000)) * topBooks.length);
      const selectedBook = topBooks[randomIndex];
      
      diverseRecs.push(selectedBook);
      used.add(selectedBook.id);
    }
  });

  // Second pass: Fill remaining slots with variety
  const remainingBooks = recommendations
    .filter(rec => !used.has(rec.id))
    .sort((a, b) => b.score - a.score);

  // Add more books but ensure no author appears more than twice
  while (diverseRecs.length < 8 && remainingBooks.length > 0) {
    const book = remainingBooks.shift()!;
    
    // Check author count
    const authorCount = diverseRecs.filter(rec => rec.author === book.author).length;
    if (authorCount < 2) {
      diverseRecs.push(book);
      used.add(book.id);
    }
  }

  // Final shuffle to mix up the order
  return shuffleArray(diverseRecs, seed);
};


const shuffleArray = <T>(array: T[], seed?: number): T[] => {
  const shuffled = [...array];
  
  // Simple seeded random if seed provided, otherwise Math.random
  const random = seed ? createSeededRandom(seed) : Math.random;
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
};

const createSeededRandom = (seed: number) => {
  let x = Math.sin(seed) * 10000;
  return () => {
    x = Math.sin(x) * 10000;
    return x - Math.floor(x);
  };
};

const getPreferenceBasedRecommendations = (userBooks: Book[], availableBooks: Book[]): BookRecommendation[] => {
  const preferences = analyzeUserPreferences(userBooks);
  
  return availableBooks
    .map(book => scoreBook(book, preferences))
    .filter(rec => rec.score > 0);
};

const getSimilarityBasedRecommendations = (userBooks: Book[], availableBooks: Book[]): BookRecommendation[] => {
  const recommendations: BookRecommendation[] = [];
  
  // Get highly rated books from user's library (4+ stars)
  const favoriteBooks = userBooks.filter(book => book.rating >= 4);
  
  favoriteBooks.forEach(favoriteBook => {
    const similarBooks = findSimilarBooks(favoriteBook, availableBooks);
    
    similarBooks.forEach((similarBook, index) => {
      const score = calculateSimilarityScore(similarBook, favoriteBook, index);
      
      if (score > 0) {
        recommendations.push({
          ...similarBook,
          score,
          reasons: getSimlarityReasons(similarBook, favoriteBook),
          similarTo: favoriteBook.title
        });
      }
    });
  });
  
  return recommendations;
};

const calculateSimilarityScore = (book: Book, referenceBook: Book, position: number): number => {
  let baseScore = 0;
  const maxScore = 100;
  
  // Position penalty (later in similarity list = lower base score)
  const positionPenalty = Math.min(position * 15, 60); // Max 60% penalty
  baseScore = maxScore - positionPenalty;
  
  // Genre overlap bonus
  const genreMatches = book.genre.filter(genre => referenceBook.genre.includes(genre)).length;
  const genreBonus = (genreMatches / Math.max(book.genre.length, referenceBook.genre.length)) * 20;
  baseScore += genreBonus;
  
  // Same author bonus
  if (book.author === referenceBook.author) {
    baseScore += 15;
  }
  
  // Quality alignment
  const ratingDiff = Math.abs(book.rating - referenceBook.rating);
  const qualityBonus = Math.max(0, 10 * (1 - ratingDiff / 4));
  baseScore += qualityBonus;
  
  // Weight by reference book rating (your favorites influence more)
  const referenceWeight = referenceBook.rating / 5;
  const finalScore = baseScore * referenceWeight;
  
  return Math.max(0, Math.min(100, Math.round(finalScore)));
};

const getSimlarityReasons = (book: Book, referenceBook: Book): string[] => {
  // Just one simple reason for similarity-based recommendations
  if (book.author === referenceBook.author) {
    return ['Same author'];
  } else {
    const matchingGenres = book.genre.filter(genre => referenceBook.genre.includes(genre));
    if (matchingGenres.length > 0) {
      return [`${matchingGenres[0]} genre`];
    }
  }
  
  return [`Similar to "${referenceBook.title}"`];
};

interface UserPreferences {
  favoriteGenres: { [genre: string]: number };
  favoriteAuthors: { [author: string]: number };
  averageRating: number;
  preferredRatingRange: [number, number];
  favoriteTags: { [tag: string]: number };
}

const analyzeUserPreferences = (books: Book[]): UserPreferences => {
  const genreCounts: { [genre: string]: number } = {};
  const authorCounts: { [author: string]: number } = {};
  const tagCounts: { [tag: string]: number } = {};
  const ratings = books.map(book => book.rating);

  // Count genres
  books.forEach(book => {
    book.genre.forEach(genre => {
      genreCounts[genre] = (genreCounts[genre] || 0) + 1;
    });
  });

  // Count authors
  books.forEach(book => {
    authorCounts[book.author] = (authorCounts[book.author] || 0) + 1;
  });

  // Count tags (weighted by confidence and book rating)
  books.forEach(book => {
    if (book.tags) {
      book.tags.forEach(tag => {
        const weight = tag.confidence * (book.rating / 5); // Higher rated books with confident tags matter more
        tagCounts[tag.name] = (tagCounts[tag.name] || 0) + weight;
      });
    }
  });

  const averageRating = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
  const sortedRatings = ratings.sort((a, b) => a - b);
  const q1 = sortedRatings[Math.floor(sortedRatings.length * 0.25)];
  const q3 = sortedRatings[Math.floor(sortedRatings.length * 0.75)];

  return {
    favoriteGenres: genreCounts,
    favoriteAuthors: authorCounts,
    averageRating,
    preferredRatingRange: [Math.max(1, q1 - 0.5), Math.min(5, q3 + 0.5)],
    favoriteTags: tagCounts
  };
};

const scoreBook = (book: Book, preferences: UserPreferences): BookRecommendation => {
  let baseScore = 0;
  let maxPossibleScore = 0;
  const allFactors: string[] = [];

  // Genre matching (25% weight - reduced to make room for tags)
  const genreWeight = 25;
  let genreScore = 0;
  let maxGenreScore = 0;
  
  book.genre.forEach(genre => {
    const genreCount = preferences.favoriteGenres[genre] || 0;
    const totalGenreReads = Object.values(preferences.favoriteGenres).reduce((a, b) => a + b, 0);
    
    if (genreCount > 0) {
      const genrePopularity = genreCount / totalGenreReads;
      genreScore += genrePopularity * genreWeight;
      allFactors.push(`${genre}`);
    }
    maxGenreScore += genreWeight / book.genre.length;
  });
  
  baseScore += genreScore;
  maxPossibleScore += maxGenreScore;

  // Tag matching (20% weight - new!)
  const tagWeight = 20;
  let tagScore = 0;
  let maxTagScore = 0;
  
  if (book.tags && book.tags.length > 0 && Object.keys(preferences.favoriteTags).length > 0) {
    const totalTagWeight = Object.values(preferences.favoriteTags).reduce((a, b) => a + b, 0);
    
    book.tags.forEach(tag => {
      const userTagWeight = preferences.favoriteTags[tag.name] || 0;
      if (userTagWeight > 0) {
        const tagPopularity = userTagWeight / totalTagWeight;
        const tagContribution = tagPopularity * tag.confidence * tagWeight;
        tagScore += tagContribution;
        allFactors.push(`${tag.name}`);
      }
      maxTagScore += tagWeight / (book.tags?.length || 1);
    });
  } else {
    maxTagScore = tagWeight;
  }
  
  baseScore += tagScore;
  maxPossibleScore += maxTagScore;

  // Author matching (20% weight - reduced)
  const authorWeight = 20;
  if (preferences.favoriteAuthors[book.author]) {
    const authorBooks = preferences.favoriteAuthors[book.author];
    const totalAuthorReads = Object.values(preferences.favoriteAuthors).reduce((a, b) => a + b, 0);
    const authorScore = (authorBooks / totalAuthorReads) * authorWeight;
    baseScore += authorScore;
    allFactors.push(`${book.author}`);
  }
  maxPossibleScore += authorWeight;

  // Rating alignment (20% weight)
  const ratingWeight = 20;
  const [minRating, maxRating] = preferences.preferredRatingRange;
  if (book.rating >= minRating && book.rating <= maxRating) {
    // Score based on how close to user's average rating
    const ratingDiff = Math.abs(book.rating - preferences.averageRating);
    const ratingScore = Math.max(0, ratingWeight * (1 - ratingDiff / 4));
    baseScore += ratingScore;
    allFactors.push('good fit');
  }
  maxPossibleScore += ratingWeight;

  // Book quality bonus (10% weight - reduced)
  const qualityWeight = 10;
  const qualityScore = (book.rating / 5) * qualityWeight;
  baseScore += qualityScore;
  maxPossibleScore += qualityWeight;

  // Recency preference (5% weight - reduced)
  const recencyWeight = 5;
  if (book.year) {
    const currentYear = new Date().getFullYear();
    const bookAge = currentYear - book.year;
    // Favor books from last 20 years, with slight preference for newer
    const recencyScore = bookAge <= 20 ? recencyWeight * (1 - bookAge / 40) : 0;
    baseScore += Math.max(0, recencyScore);
  }
  maxPossibleScore += recencyWeight;

  // Calculate final percentage (0-100%)
  const finalScore = maxPossibleScore > 0 ? Math.round((baseScore / maxPossibleScore) * 100) : 0;

  // Generate very concise reasons (max 2 points)
  const topFactors = allFactors.slice(0, 1);
  if (book.rating >= 4.5) topFactors.push('highly rated');
  
  return {
    ...book,
    score: Math.max(0, Math.min(100, finalScore)),
    reasons: topFactors.length > 0 ? topFactors.map(factor => `${factor.charAt(0).toUpperCase() + factor.slice(1)}`) : ['Matches your preferences']
  };
};

// Mock book database for recommendations
export const sampleBooks: Book[] = [
  {
    id: 'sample-1',
    title: 'The Name of the Wind',
    author: 'Patrick Rothfuss',
    genre: ['Fantasy', 'Adventure'],
    rating: 4.5,
    description: 'A tale of Kvothe, a legendary figure whose story unfolds in a fantasy world.',
    year: 2007
  },
  {
    id: 'sample-2',
    title: 'Dune',
    author: 'Frank Herbert',
    genre: ['Science Fiction', 'Adventure'],
    rating: 4.3,
    description: 'A science fiction epic set on the desert planet Arrakis.',
    year: 1965
  },
  {
    id: 'sample-3',
    title: 'The Midnight Library',
    author: 'Matt Haig',
    genre: ['Fiction', 'Philosophy'],
    rating: 4.1,
    description: 'A philosophical novel about life choices and alternate realities.',
    year: 2020
  },
  {
    id: 'sample-4',
    title: 'Project Hail Mary',
    author: 'Andy Weir',
    genre: ['Science Fiction', 'Thriller'],
    rating: 4.6,
    description: 'A lone astronaut must save humanity in this thrilling space adventure.',
    year: 2021
  },
  {
    id: 'sample-5',
    title: 'The Seven Husbands of Evelyn Hugo',
    author: 'Taylor Jenkins Reid',
    genre: ['Romance', 'Drama'],
    rating: 4.4,
    description: 'A reclusive Hollywood icon tells her life story to a young journalist.',
    year: 2017
  },
  {
    id: 'sample-6',
    title: 'Klara and the Sun',
    author: 'Kazuo Ishiguro',
    genre: ['Science Fiction', 'Drama'],
    rating: 3.9,
    description: 'A story told from the perspective of an artificial friend.',
    year: 2021
  },
  {
    id: 'sample-7',
    title: 'The Song of Achilles',
    author: 'Madeline Miller',
    genre: ['Historical Fiction', 'Romance'],
    rating: 4.3,
    description: 'A retelling of the Iliad from Patroclus\' perspective.',
    year: 2011
  },
  {
    id: 'sample-8',
    title: 'Educated',
    author: 'Tara Westover',
    genre: ['Memoir', 'Biography'],
    rating: 4.5,
    description: 'A memoir about education and family in rural Idaho.',
    year: 2018
  },
  {
    id: 'sample-9',
    title: 'The Hobbit',
    author: 'J.R.R. Tolkien',
    genre: ['Fantasy', 'Adventure'],
    rating: 4.7,
    description: 'A hobbit\'s unexpected journey through Middle-earth.',
    year: 1937
  },
  {
    id: 'sample-10',
    title: 'Gone Girl',
    author: 'Gillian Flynn',
    genre: ['Thriller', 'Mystery'],
    rating: 4.2,
    description: 'A psychological thriller about a marriage gone wrong.',
    year: 2012
  },
  {
    id: 'sample-11',
    title: 'The Martian',
    author: 'Andy Weir',
    genre: ['Science Fiction', 'Adventure'],
    rating: 4.5,
    description: 'An astronaut stranded on Mars fights for survival.',
    year: 2011
  },
  {
    id: 'sample-12',
    title: 'Circe',
    author: 'Madeline Miller',
    genre: ['Fantasy', 'Historical Fiction'],
    rating: 4.6,
    description: 'The story of the Greek goddess Circe and her transformation.',
    year: 2018
  },
  {
    id: 'sample-13',
    title: 'The Silent Patient',
    author: 'Alex Michaelides',
    genre: ['Thriller', 'Mystery'],
    rating: 4.3,
    description: 'A psychotherapist becomes obsessed with treating a woman who refuses to speak.',
    year: 2019
  },
  {
    id: 'sample-14',
    title: 'Atomic Habits',
    author: 'James Clear',
    genre: ['Self-Help', 'Psychology'],
    rating: 4.8,
    description: 'An easy and proven way to build good habits and break bad ones.',
    year: 2018
  },
  {
    id: 'sample-15',
    title: 'The Thursday Murder Club',
    author: 'Richard Osman',
    genre: ['Mystery', 'Comedy'],
    rating: 4.1,
    description: 'Four unlikely friends solve cold cases in their retirement home.',
    year: 2020
  },
  {
    id: 'sample-16',
    title: 'Becoming',
    author: 'Michelle Obama',
    genre: ['Memoir', 'Biography'],
    rating: 4.6,
    description: 'Former First Lady Michelle Obama\'s inspiring memoir.',
    year: 2018
  },
  {
    id: 'sample-17',
    title: 'The Housekeeper and the Professor',
    author: 'Yoko Ogawa',
    genre: ['Fiction', 'Drama'],
    rating: 4.2,
    description: 'A touching story about mathematics, memory, and human connection.',
    year: 2003
  },
  {
    id: 'sample-18',
    title: 'Neuromancer',
    author: 'William Gibson',
    genre: ['Science Fiction', 'Cyberpunk'],
    rating: 4.0,
    description: 'The groundbreaking cyberpunk novel that defined a genre.',
    year: 1984
  },
  {
    id: 'sample-19',
    title: 'The Book Thief',
    author: 'Markus Zusak',
    genre: ['Historical Fiction', 'Drama'],
    rating: 4.4,
    description: 'Death narrates the story of a young girl in Nazi Germany.',
    year: 2005
  },
  {
    id: 'sample-20',
    title: 'Big Little Lies',
    author: 'Liane Moriarty',
    genre: ['Drama', 'Mystery'],
    rating: 4.2,
    description: 'Three women\'s seemingly perfect lives unravel to the point of murder.',
    year: 2014
  },
  {
    id: 'sample-21',
    title: 'The Alchemist',
    author: 'Paulo Coelho',
    genre: ['Fiction', 'Philosophy'],
    rating: 4.0,
    description: 'A young shepherd\'s journey to find his personal legend.',
    year: 1988
  },
  {
    id: 'sample-22',
    title: 'Station Eleven',
    author: 'Emily St. John Mandel',
    genre: ['Science Fiction', 'Drama'],
    rating: 4.1,
    description: 'Life before and after a devastating flu pandemic.',
    year: 2014
  },
  {
    id: 'sample-23',
    title: 'The Girl with the Dragon Tattoo',
    author: 'Stieg Larsson',
    genre: ['Thriller', 'Mystery'],
    rating: 4.3,
    description: 'A journalist and a hacker solve a family mystery.',
    year: 2005
  },
  {
    id: 'sample-24',
    title: 'Eleanor Oliphant Is Completely Fine',
    author: 'Gail Honeyman',
    genre: ['Fiction', 'Drama'],
    rating: 4.3,
    description: 'A socially isolated woman\'s journey toward human connection.',
    year: 2017
  },
  {
    id: 'sample-25',
    title: 'The Power of Now',
    author: 'Eckhart Tolle',
    genre: ['Self-Help', 'Spirituality'],
    rating: 4.2,
    description: 'A guide to spiritual enlightenment and present-moment awareness.',
    year: 1997
  },
  {
    id: 'sample-26',
    title: 'Normal People',
    author: 'Sally Rooney',
    genre: ['Romance', 'Drama'],
    rating: 4.0,
    description: 'The complex relationship between two Irish teenagers.',
    year: 2018
  },
  {
    id: 'sample-27',
    title: 'The Handmaid\'s Tale',
    author: 'Margaret Atwood',
    genre: ['Science Fiction', 'Dystopian'],
    rating: 4.2,
    description: 'A dystopian tale of women\'s oppression in a totalitarian society.',
    year: 1985
  },
  {
    id: 'sample-28',
    title: 'Sapiens',
    author: 'Yuval Noah Harari',
    genre: ['History', 'Science'],
    rating: 4.4,
    description: 'A brief history of humankind from the Stone Age to the present.',
    year: 2011
  },
  {
    id: 'sample-29',
    title: 'The Kite Runner',
    author: 'Khaled Hosseini',
    genre: ['Historical Fiction', 'Drama'],
    rating: 4.3,
    description: 'A story of friendship and redemption set in Afghanistan.',
    year: 2003
  },
  {
    id: 'sample-30',
    title: 'Where the Crawdads Sing',
    author: 'Delia Owens',
    genre: ['Mystery', 'Drama'],
    rating: 4.1,
    description: 'A coming-of-age story set in the marshlands of North Carolina.',
    year: 2018
  }
];