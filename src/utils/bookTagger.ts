import type { Book } from '../types';

export interface BookTag {
  name: string;
  category: 'genre' | 'theme' | 'setting' | 'mood' | 'length' | 'era' | 'style' | 'audience';
  confidence: number; // 0-1 score for how confident we are about this tag
}

export const generateAutomaticTags = (book: Book): BookTag[] => {
  const tags: BookTag[] = [];
  
  // Add genre-based tags
  tags.push(...generateGenreTags(book));
  
  // Add content-based tags from title, author, summary
  tags.push(...generateContentTags(book));
  
  // Add metadata-based tags
  tags.push(...generateMetadataTags(book));
  
  // Add rating-based tags
  tags.push(...generateRatingTags(book));
  
  // Remove duplicates and sort by confidence
  const uniqueTags = deduplicateTags(tags);
  
  return uniqueTags
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 12); // Limit to top 12 tags
};

const generateGenreTags = (book: Book): BookTag[] => {
  const tags: BookTag[] = [];
  
  // Convert genres to standardized tags
  book.genre.forEach(genre => {
    const normalizedGenre = genre.toLowerCase();
    
    // Main genre tags
    tags.push({
      name: genre,
      category: 'genre',
      confidence: 0.9
    });
    
    // Add sub-genre and theme tags based on genre
    const subTags = getSubGenreTags(normalizedGenre);
    tags.push(...subTags);
  });
  
  return tags;
};

const getSubGenreTags = (genre: string): BookTag[] => {
  const subGenreMap: Record<string, BookTag[]> = {
    'fantasy': [
      { name: 'Magic', category: 'theme', confidence: 0.8 },
      { name: 'Adventure', category: 'theme', confidence: 0.7 },
      { name: 'Epic', category: 'style', confidence: 0.6 },
      { name: 'Escapist', category: 'mood', confidence: 0.7 }
    ],
    'science fiction': [
      { name: 'Technology', category: 'theme', confidence: 0.8 },
      { name: 'Future', category: 'setting', confidence: 0.8 },
      { name: 'Space', category: 'setting', confidence: 0.6 },
      { name: 'Speculative', category: 'style', confidence: 0.7 }
    ],
    'sci-fi': [
      { name: 'Technology', category: 'theme', confidence: 0.8 },
      { name: 'Future', category: 'setting', confidence: 0.8 },
      { name: 'Space', category: 'setting', confidence: 0.6 },
      { name: 'Speculative', category: 'style', confidence: 0.7 }
    ],
    'mystery': [
      { name: 'Crime', category: 'theme', confidence: 0.7 },
      { name: 'Investigation', category: 'theme', confidence: 0.8 },
      { name: 'Suspenseful', category: 'mood', confidence: 0.8 },
      { name: 'Plot-driven', category: 'style', confidence: 0.7 }
    ],
    'romance': [
      { name: 'Love', category: 'theme', confidence: 0.9 },
      { name: 'Relationships', category: 'theme', confidence: 0.8 },
      { name: 'Emotional', category: 'mood', confidence: 0.8 },
      { name: 'Character-driven', category: 'style', confidence: 0.7 }
    ],
    'thriller': [
      { name: 'Suspenseful', category: 'mood', confidence: 0.9 },
      { name: 'Fast-paced', category: 'style', confidence: 0.8 },
      { name: 'Action', category: 'theme', confidence: 0.7 },
      { name: 'Edge-of-seat', category: 'mood', confidence: 0.8 }
    ],
    'horror': [
      { name: 'Dark', category: 'mood', confidence: 0.9 },
      { name: 'Scary', category: 'mood', confidence: 0.9 },
      { name: 'Supernatural', category: 'theme', confidence: 0.6 },
      { name: 'Psychological', category: 'style', confidence: 0.6 }
    ],
    'historical fiction': [
      { name: 'Period Setting', category: 'setting', confidence: 0.9 },
      { name: 'Historical', category: 'era', confidence: 0.9 },
      { name: 'Educational', category: 'style', confidence: 0.6 },
      { name: 'Immersive', category: 'mood', confidence: 0.7 }
    ],
    'biography': [
      { name: 'Real People', category: 'theme', confidence: 0.9 },
      { name: 'Inspirational', category: 'mood', confidence: 0.7 },
      { name: 'Educational', category: 'style', confidence: 0.8 },
      { name: 'Non-fiction', category: 'genre', confidence: 1.0 }
    ],
    'memoir': [
      { name: 'Personal Journey', category: 'theme', confidence: 0.9 },
      { name: 'Reflective', category: 'mood', confidence: 0.8 },
      { name: 'Autobiographical', category: 'style', confidence: 0.9 },
      { name: 'Non-fiction', category: 'genre', confidence: 1.0 }
    ],
    'philosophy': [
      { name: 'Deep Thinking', category: 'theme', confidence: 0.9 },
      { name: 'Intellectual', category: 'mood', confidence: 0.8 },
      { name: 'Thought-provoking', category: 'mood', confidence: 0.9 },
      { name: 'Academic', category: 'audience', confidence: 0.7 }
    ]
  };
  
  return subGenreMap[genre] || [];
};

const generateContentTags = (book: Book): BookTag[] => {
  const tags: BookTag[] = [];
  const content = `${book.title} ${book.author} ${book.summary || ''} ${book.description || ''}`.toLowerCase();
  
  // Theme-based keywords
  const themeKeywords = [
    { keywords: ['war', 'battle', 'military', 'soldier', 'combat'], tag: 'War', category: 'theme' as const, confidence: 0.8 },
    { keywords: ['love', 'romance', 'relationship', 'marriage', 'wedding'], tag: 'Romance', category: 'theme' as const, confidence: 0.7 },
    { keywords: ['family', 'mother', 'father', 'parent', 'child', 'daughter', 'son'], tag: 'Family', category: 'theme' as const, confidence: 0.7 },
    { keywords: ['death', 'murder', 'kill', 'died', 'funeral'], tag: 'Death', category: 'theme' as const, confidence: 0.6 },
    { keywords: ['journey', 'travel', 'adventure', 'quest', 'expedition'], tag: 'Journey', category: 'theme' as const, confidence: 0.7 },
    { keywords: ['magic', 'wizard', 'spell', 'enchant', 'magical'], tag: 'Magic', category: 'theme' as const, confidence: 0.8 },
    { keywords: ['technology', 'computer', 'robot', 'artificial', 'digital'], tag: 'Technology', category: 'theme' as const, confidence: 0.7 },
    { keywords: ['politics', 'government', 'election', 'politician', 'democracy'], tag: 'Politics', category: 'theme' as const, confidence: 0.7 },
    { keywords: ['religion', 'god', 'faith', 'church', 'spiritual'], tag: 'Religion', category: 'theme' as const, confidence: 0.7 },
    { keywords: ['school', 'university', 'student', 'education', 'learning'], tag: 'Education', category: 'theme' as const, confidence: 0.6 }
  ];
  
  // Setting-based keywords
  const settingKeywords = [
    { keywords: ['new york', 'manhattan', 'brooklyn'], tag: 'New York', category: 'setting' as const, confidence: 0.8 },
    { keywords: ['london', 'england', 'british'], tag: 'England', category: 'setting' as const, confidence: 0.8 },
    { keywords: ['paris', 'france', 'french'], tag: 'France', category: 'setting' as const, confidence: 0.8 },
    { keywords: ['space', 'planet', 'galaxy', 'universe', 'cosmic'], tag: 'Space', category: 'setting' as const, confidence: 0.8 },
    { keywords: ['medieval', 'middle ages', 'castle', 'knight'], tag: 'Medieval', category: 'era' as const, confidence: 0.8 },
    { keywords: ['victorian', '19th century', '1800s'], tag: 'Victorian Era', category: 'era' as const, confidence: 0.8 },
    { keywords: ['wwii', 'world war', 'nazi', 'holocaust'], tag: 'WWII Era', category: 'era' as const, confidence: 0.9 },
    { keywords: ['contemporary', 'modern', 'present day'], tag: 'Contemporary', category: 'era' as const, confidence: 0.6 },
    { keywords: ['small town', 'rural', 'countryside', 'village'], tag: 'Small Town', category: 'setting' as const, confidence: 0.7 },
    { keywords: ['city', 'urban', 'metropolitan'], tag: 'Urban', category: 'setting' as const, confidence: 0.6 }
  ];
  
  // Mood-based keywords
  const moodKeywords = [
    { keywords: ['dark', 'gritty', 'noir', 'bleak'], tag: 'Dark', category: 'mood' as const, confidence: 0.7 },
    { keywords: ['funny', 'humor', 'comedy', 'hilarious', 'witty'], tag: 'Humorous', category: 'mood' as const, confidence: 0.8 },
    { keywords: ['sad', 'tragic', 'heartbreaking', 'melancholy'], tag: 'Sad', category: 'mood' as const, confidence: 0.8 },
    { keywords: ['uplifting', 'inspiring', 'hopeful', 'optimistic'], tag: 'Uplifting', category: 'mood' as const, confidence: 0.8 },
    { keywords: ['intense', 'gripping', 'suspenseful', 'thrilling'], tag: 'Intense', category: 'mood' as const, confidence: 0.7 },
    { keywords: ['peaceful', 'calm', 'serene', 'gentle'], tag: 'Peaceful', category: 'mood' as const, confidence: 0.7 },
    { keywords: ['nostalgic', 'reminiscent', 'memories', 'past'], tag: 'Nostalgic', category: 'mood' as const, confidence: 0.7 }
  ];
  
  // Check for all keyword matches
  [...themeKeywords, ...settingKeywords, ...moodKeywords].forEach(({ keywords, tag, category, confidence }) => {
    const matchCount = keywords.filter(keyword => content.includes(keyword)).length;
    if (matchCount > 0) {
      tags.push({
        name: tag,
        category,
        confidence: Math.min(confidence + (matchCount - 1) * 0.1, 1.0)
      });
    }
  });
  
  return tags;
};

const generateMetadataTags = (book: Book): BookTag[] => {
  const tags: BookTag[] = [];
  
  // Publication era tags
  if (book.year) {
    if (book.year >= 2020) {
      tags.push({ name: 'Recent Release', category: 'era', confidence: 1.0 });
    } else if (book.year >= 2010) {
      tags.push({ name: '2010s', category: 'era', confidence: 0.9 });
    } else if (book.year >= 2000) {
      tags.push({ name: '2000s', category: 'era', confidence: 0.9 });
    } else if (book.year >= 1990) {
      tags.push({ name: '1990s', category: 'era', confidence: 0.9 });
    } else if (book.year >= 1950) {
      tags.push({ name: 'Mid-20th Century', category: 'era', confidence: 0.8 });
    } else if (book.year >= 1900) {
      tags.push({ name: 'Early 20th Century', category: 'era', confidence: 0.8 });
    } else {
      tags.push({ name: 'Classic', category: 'era', confidence: 0.9 });
    }
  }
  
  // Author-based tags (for well-known authors)
  const authorTags = getAuthorTags(book.author);
  tags.push(...authorTags);
  
  return tags;
};

const getAuthorTags = (author: string): BookTag[] => {
  const authorLower = author.toLowerCase();
  const authorTagMap: Record<string, BookTag[]> = {
    'stephen king': [
      { name: 'Horror Master', category: 'style', confidence: 0.9 },
      { name: 'Page-turner', category: 'style', confidence: 0.8 }
    ],
    'agatha christie': [
      { name: 'Cozy Mystery', category: 'style', confidence: 0.9 },
      { name: 'Classic Detective', category: 'style', confidence: 0.9 }
    ],
    'j.k. rowling': [
      { name: 'Coming of Age', category: 'theme', confidence: 0.8 },
      { name: 'Young Adult', category: 'audience', confidence: 0.9 }
    ],
    'george r.r. martin': [
      { name: 'Epic Fantasy', category: 'style', confidence: 0.9 },
      { name: 'Complex Plot', category: 'style', confidence: 0.8 }
    ],
    'margaret atwood': [
      { name: 'Literary Fiction', category: 'style', confidence: 0.9 },
      { name: 'Feminist Themes', category: 'theme', confidence: 0.8 }
    ],
    'haruki murakami': [
      { name: 'Surreal', category: 'style', confidence: 0.9 },
      { name: 'Philosophical', category: 'mood', confidence: 0.8 }
    ]
  };
  
  // Check for partial matches
  for (const [authorName, tags] of Object.entries(authorTagMap)) {
    if (authorLower.includes(authorName) || authorName.includes(authorLower)) {
      return tags;
    }
  }
  
  return [];
};

const generateRatingTags = (book: Book): BookTag[] => {
  const tags: BookTag[] = [];
  
  if (book.rating >= 5) {
    tags.push({ name: 'Favorite', category: 'mood', confidence: 1.0 });
  } else if (book.rating >= 4) {
    tags.push({ name: 'Highly Rated', category: 'mood', confidence: 0.9 });
  } else if (book.rating <= 2) {
    tags.push({ name: 'Disappointing', category: 'mood', confidence: 0.8 });
  }
  
  return tags;
};

const deduplicateTags = (tags: BookTag[]): BookTag[] => {
  const tagMap = new Map<string, BookTag>();
  
  tags.forEach(tag => {
    const existing = tagMap.get(tag.name);
    if (!existing || tag.confidence > existing.confidence) {
      tagMap.set(tag.name, tag);
    }
  });
  
  return Array.from(tagMap.values());
};

// Function to generate tags for multiple books
export const generateTagsForBooks = async (books: Book[]): Promise<Map<string, BookTag[]>> => {
  const bookTags = new Map<string, BookTag[]>();
  
  books.forEach(book => {
    const tags = generateAutomaticTags(book);
    bookTags.set(book.id, tags);
  });
  
  return bookTags;
};

// Get all unique tags across books for filtering
export const getAllUniqueTags = (books: Book[]): string[] => {
  const allTags = new Set<string>();
  
  books.forEach(book => {
    if (book.tags) {
      book.tags.forEach(tag => allTags.add(tag.name));
    }
  });
  
  return Array.from(allTags).sort();
};

// Filter books by tags
export const filterBooksByTags = (books: Book[], selectedTags: string[]): Book[] => {
  if (selectedTags.length === 0) return books;
  
  return books.filter(book => {
    if (!book.tags) return false;
    const bookTagNames = book.tags.map(tag => tag.name);
    return selectedTags.some(selectedTag => bookTagNames.includes(selectedTag));
  });
};